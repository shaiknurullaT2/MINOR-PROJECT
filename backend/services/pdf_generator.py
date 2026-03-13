from io import BytesIO
from fpdf import FPDF
from datetime import datetime

class PDFGenerator:
    
    @staticmethod
    def generate_summary_pdf(original_text: str, summary_text: str, created_at: str = None) -> BytesIO:
        pdf = FPDF()
        pdf.add_page()
        
        # Add a sleek, modern font setup (using built-in Helvetica for simplicity)
        pdf.set_font("Helvetica", "B", 24)
        pdf.set_text_color(30, 58, 138) # Deep blue heading
        
        # Title
        pdf.cell(0, 15, "AI Document Summary", ln=True, align="C")
        pdf.ln(5)
        
        # Metadata
        pdf.set_font("Helvetica", "I", 10)
        pdf.set_text_color(100, 100, 100)
        date_str = created_at if created_at else datetime.now().strftime("%Y-%m-%d %H:%M:%S")
        pdf.cell(0, 10, f"Generated on: {date_str}", ln=True, align="R")
        pdf.ln(10)
        
        # Executive Summary Section
        pdf.set_font("Helvetica", "B", 14)
        pdf.set_text_color(0, 0, 0)
        pdf.cell(0, 10, "Executive Summary", ln=True)
        pdf.set_draw_color(200, 200, 200)
        pdf.line(10, pdf.get_y(), 200, pdf.get_y())
        pdf.ln(5)
        
        pdf.set_font("Helvetica", "", 12)
        # Using multi_cell to handle line breaks mapping properly
        pdf.multi_cell(0, 8, summary_text)
        pdf.ln(15)
        
        # Original Text Section (Optional context)
        pdf.set_font("Helvetica", "B", 14)
        pdf.cell(0, 10, "Original Text Extract", ln=True)
        pdf.line(10, pdf.get_y(), 200, pdf.get_y())
        pdf.ln(5)
        
        pdf.set_font("Helvetica", "", 10)
        pdf.set_text_color(80, 80, 80)
        # Truncate original text in PDF to save space if it's massive
        display_text = original_text[:3000] + "..." if len(original_text) > 3000 else original_text
        pdf.multi_cell(0, 6, display_text)
        
        # Return as BytesIO
        output = BytesIO()
        pdf.output(output)
        output.seek(0)
        return output
