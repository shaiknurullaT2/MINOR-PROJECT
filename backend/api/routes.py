from fastapi import APIRouter, File, UploadFile, HTTPException, Depends, Form
from typing import Optional
import io

from models.schemas import SummarizeRequest, SummarizeResponse, UrlSummarizeRequest, SmartStudyResponse
from services.nlp_engine import get_nlp_engine, NLPEngine
from services.document_parser import DocumentParser

router = APIRouter()

@router.post("/summarize", response_model=SummarizeResponse)
async def summarize_text(request: SummarizeRequest):
    try:
        engine = get_nlp_engine()
        
        if request.method == "abstractive":
            summary = engine.summarize_abstractive(request.text, request.length)
        else:
            summary = engine.summarize_extractive(request.text, request.length)
            
        key_points = engine.extract_key_points(request.text, 3)
            
        return SummarizeResponse(
            summary=summary,
            original_length=len(request.text),
            summary_length=len(summary),
            compression_ratio=round(len(summary) / len(request.text), 2),
            key_sentences=key_points
        )
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/parse-url", response_model=SummarizeResponse)
async def summarize_url(request: UrlSummarizeRequest):
    try:
        text = DocumentParser.parse_url(request.url)
        if len(text) < 100:
            raise HTTPException(status_code=400, detail="Could not extract enough text from the URL.")
            
        engine = get_nlp_engine()
        summary = engine.summarize_abstractive(text, request.length)
        
        return SummarizeResponse(
            summary=summary,
            original_length=len(text),
            summary_length=len(summary),
            compression_ratio=round(len(summary) / (len(text)+0.01), 2),
            key_sentences=[]
        )
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/upload-document", response_model=SummarizeResponse)
async def summarize_document(
    file: UploadFile = File(...), 
    length: str = Form("medium"),
    method: str = Form("abstractive")
):
    try:
        contents = await file.read()
        text = ""
        
        if file.filename.endswith(".pdf"):
            text = DocumentParser.parse_pdf(contents)
        elif file.filename.endswith(".docx"):
            text = DocumentParser.parse_docx(contents)
        elif file.filename.endswith(".txt"):
            text = contents.decode("utf-8")
        else:
            raise HTTPException(status_code=400, detail="Unsupported file format. Use PDF, DOCX, or TXT.")
            
        if len(text.strip()) < 50:
            raise HTTPException(status_code=400, detail="Document contains too little text.")
            
        engine = get_nlp_engine()
        if method == "abstractive":
            summary = engine.summarize_abstractive(text, length)
        else:
            summary = engine.summarize_extractive(text, length)
            
        return SummarizeResponse(
            summary=summary,
            original_length=len(text),
            summary_length=len(summary),
            compression_ratio=round(len(summary) / (len(text)+0.01), 2),
            key_sentences=engine.extract_key_points(text, 3)
        )
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/smart-study", response_model=SmartStudyResponse)
async def smart_study_mode(request: SummarizeRequest):
    try:
        engine = get_nlp_engine()
        result = engine.generate_smart_study(request.text)
        return SmartStudyResponse(**result)
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

from pydantic import BaseModel
from fastapi.responses import Response
from services.pdf_generator import PDFGenerator
from services.translator import ContentTranslator

class TranslateRequest(BaseModel):
    text: str
    target_language: str

class PdfExportRequest(BaseModel):
    original_text: str
    summary_text: str
    created_at: str = None

@router.post("/translate")
async def translate_text(request: TranslateRequest):
    try:
        translated = ContentTranslator.translate_text(request.text, request.target_language)
        return {"translated_text": translated}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/export-pdf")
async def export_pdf(request: PdfExportRequest):
    try:
        pdf_buffer = PDFGenerator.generate_summary_pdf(request.original_text, request.summary_text, request.created_at)
        return Response(
            content=pdf_buffer.getvalue(),
            media_type="application/pdf",
            headers={"Content-Disposition": "attachment; filename=summary.pdf"}
        )
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

