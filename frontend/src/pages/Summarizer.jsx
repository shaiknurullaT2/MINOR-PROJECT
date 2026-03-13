import { useState, useRef } from 'react';
import axios from 'axios';
import { Upload, Type, Link as LinkIcon, Download, Languages, Sparkles, Send, Share, FileText, CheckCircle2 } from 'lucide-react';

export default function Summarizer() {
  const [inputType, setInputType] = useState('text'); // 'text', 'file', 'url'
  const [textInput, setTextInput] = useState('');
  const [urlInput, setUrlInput] = useState('');
  const [file, setFile] = useState(null);
  const fileInputRef = useRef(null);

  const [length, setLength] = useState('medium');
  const [method, setMethod] = useState('abstractive');
  
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [translatedText, setTranslatedText] = useState(null);
  const [targetLang, setTargetLang] = useState('es');
  
  const [isSaved, setIsSaved] = useState(false);

  const handleFileChange = (e) => {
    if(e.target.files && e.target.files[0]) {
      setFile(e.target.files[0]);
    }
  };

  const clearInput = () => {
    setTextInput('');
    setUrlInput('');
    setFile(null);
    if (fileInputRef.current) fileInputRef.current.value = '';
    setResult(null);
    setTranslatedText(null);
    setIsSaved(false);
  };

  const prepareRequestAndSubmit = async () => {
    setLoading(true);
    setResult(null);
    setTranslatedText(null);
    setIsSaved(false);

    try {
      let endpoint = '';
      let payload = null;
      let headers = {};

      if (inputType === 'text') {
        endpoint = '/api/summarize';
        payload = { text: textInput, length, method };
      } else if (inputType === 'url') {
        endpoint = '/api/parse-url';
        payload = { url: urlInput, length };
      } else if (inputType === 'file') {
        endpoint = '/api/upload-document';
        payload = new FormData();
        payload.append('file', file);
        payload.append('length', length);
        payload.append('method', method);
        headers = { 'Content-Type': 'multipart/form-data' };
      }

      const res = await axios.post(endpoint, payload, { headers });
      setResult({...res.data, originalInput: inputType === 'text' ? textInput : "Content from file/url"});
      
    } catch (err) {
      console.error(err);
      alert('Failed to summarize content. Make sure input is long enough (50+ words).');
    } finally {
      setLoading(false);
    }
  };

  const translateSummary = async () => {
    if(!result) return;
    try {
      const res = await axios.post('/api/translate', {
        text: result.summary,
        target_language: targetLang
      });
      setTranslatedText(res.data.translated_text);
    } catch (error) {
       console.error(error);
       alert("Translation failed");
    }
  };

  const exportPDF = async () => {
    if(!result) return;
    try {
      const res = await axios.post('/api/export-pdf', {
        original_text: result.originalInput || "Referenced Document",
        summary_text: translatedText || result.summary,
        created_at: new Date().toISOString()
      }, {
        responseType: 'blob' 
      });
      
      const url = window.URL.createObjectURL(new Blob([res.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', 'summary.pdf');
      document.body.appendChild(link);
      link.click();
    } catch (error) {
       console.error(error);
       alert("PDF Export failed");
    }
  };

  const saveToDashboard = async () => {
    if(!result) return;
    try {
      const token = localStorage.getItem('token');
      await axios.post('/api/dashboard/save', {
        original_text: result.originalInput || "Referenced Document",
        summary_text: translatedText || result.summary,
        method: method,
        length_setting: length,
        compression_ratio: result.compression_ratio
      }, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setIsSaved(true);
    } catch (error) {
       console.error(error);
       alert("Failed to save to dashboard");
    }
  };

  return (
    <div className="max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-8 pb-20">
      
      {/* Input Section */}
      <div className="lg:col-span-7 space-y-6">
        <div className="glass-effect rounded-3xl p-6 sm:p-8">
          <h1 className="text-2xl font-bold text-slate-800 mb-6 flex items-center gap-2">
            <Sparkles className="text-indigo-600" /> Convert Content to Knowledge
          </h1>
          
          <div className="flex bg-slate-100 p-1 rounded-xl mb-6">
            <button 
              onClick={() => setInputType('text')}
              className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-lg text-sm font-medium transition-all ${inputType === 'text' ? 'bg-white shadow-sm text-indigo-600' : 'text-slate-500 hover:text-slate-700'}`}
            >
              <Type size={16} /> Text
            </button>
            <button 
              onClick={() => setInputType('file')}
              className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-lg text-sm font-medium transition-all ${inputType === 'file' ? 'bg-white shadow-sm text-indigo-600' : 'text-slate-500 hover:text-slate-700'}`}
            >
              <Upload size={16} /> Document
            </button>
            <button 
              onClick={() => setInputType('url')}
              className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-lg text-sm font-medium transition-all ${inputType === 'url' ? 'bg-white shadow-sm text-indigo-600' : 'text-slate-500 hover:text-slate-700'}`}
            >
              <LinkIcon size={16} /> Web Route
            </button>
          </div>

          <div className="min-h-[280px]">
            {inputType === 'text' && (
              <textarea 
                className="w-full h-72 p-5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent resize-none transition-all placeholder:text-slate-400"
                placeholder="Paste your incredibly long document, article, or essay here... Minimum 50 words recommended."
                value={textInput}
                onChange={(e) => setTextInput(e.target.value)}
              />
            )}

            {inputType === 'file' && (
              <div 
                className="w-full h-72 border-2 border-dashed border-indigo-200 rounded-xl bg-indigo-50/50 flex flex-col items-center justify-center transition-all hover:bg-indigo-50 cursor-pointer"
                onClick={() => fileInputRef.current?.click()}
              >
                <input 
                  type="file" 
                  ref={fileInputRef} 
                  onChange={handleFileChange} 
                  className="hidden" 
                  accept=".pdf,.docx,.txt"
                />
                <div className="w-16 h-16 bg-white rounded-full shadow-sm flex items-center justify-center text-indigo-500 mb-4">
                  <Upload size={28} />
                </div>
                <h3 className="text-lg font-semibold text-slate-700">Upload a Document</h3>
                <p className="text-slate-500 text-sm mt-1 max-w-xs text-center">Drag and drop or click to browse. Supports PDF, DOCX, and TXT files.</p>
                {file && (
                  <div className="mt-6 px-4 py-2 bg-indigo-100 text-indigo-700 rounded-lg text-sm font-medium flex items-center gap-2">
                    <FileText size={16} /> {file.name}
                  </div>
                )}
              </div>
            )}

            {inputType === 'url' && (
              <div className="w-full h-72 flex flex-col items-center justify-center bg-slate-50 border border-slate-200 rounded-xl p-8">
                <div className="w-16 h-16 bg-white rounded-full shadow-sm flex items-center justify-center text-indigo-500 mb-6">
                  <LinkIcon size={28} />
                </div>
                <input 
                  type="url"
                  className="w-full max-w-md px-5 py-4 bg-white border border-slate-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent text-center shadow-sm"
                  placeholder="https://en.wikipedia.org/wiki/Artificial_intelligence"
                  value={urlInput}
                  onChange={(e) => setUrlInput(e.target.value)}
                />
                <p className="text-slate-500 text-sm mt-4 text-center">Our scraper will grab the main article body.</p>
              </div>
            )}
          </div>

          <div className="flex flex-col sm:flex-row items-center gap-4 mt-6">
            <div className="flex-1 w-full bg-slate-50 border border-slate-200 p-1.5 rounded-lg flex items-center">
              <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider px-3">Length:</span>
              <select className="flex-1 bg-transparent text-sm font-medium outline-none text-slate-700" value={length} onChange={e => setLength(e.target.value)}>
                <option value="short">Short</option>
                <option value="medium">Medium</option>
                <option value="long">Long</option>
              </select>
            </div>
            <div className="flex-1 w-full bg-slate-50 border border-slate-200 p-1.5 rounded-lg flex items-center">
               <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider px-3">Method:</span>
               <select className="flex-1 bg-transparent text-sm font-medium outline-none text-slate-700" value={method} onChange={e => setMethod(e.target.value)}>
                <option value="abstractive">Abstractive (AI rewrite)</option>
                <option value="extractive">Extractive (Key Sentences)</option>
              </select>
            </div>
          </div>

          <div className="flex gap-4 mt-8">
            <button 
              onClick={clearInput}
              className="px-6 py-3.5 rounded-xl font-medium text-slate-600 bg-slate-100 hover:bg-slate-200 transition-colors"
            >
              Clear
            </button>
            <button 
              onClick={prepareRequestAndSubmit}
              disabled={loading || (inputType === 'text' && !textInput) || (inputType === 'url' && !urlInput) || (inputType === 'file' && !file)}
              className="flex-1 flex items-center justify-center gap-2 bg-indigo-600 text-white p-3.5 rounded-xl font-medium shadow-lg hover:bg-indigo-700 shadow-indigo-200 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? (
                <><span className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></span> Summarizing...</>
              ) : (
                <>Generate Summary <Send size={18} /></>
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Output Section */}
      <div className="lg:col-span-5 relative">
        {!result ? (
          <div className="h-full min-h-[500px] glass-effect rounded-3xl p-8 flex flex-col items-center justify-center text-center">
            <div className="w-24 h-24 mb-6 rounded-2xl bg-gradient-to-br from-indigo-100 to-purple-50 flex items-center justify-center border border-indigo-50">
              <Sparkles className="text-indigo-400 w-10 h-10" />
            </div>
            <h3 className="text-xl font-bold text-slate-700 mb-2">Ready for Insights</h3>
            <p className="text-slate-500 text-sm max-w-[250px] leading-relaxed">
              Submit your text, and our AI pipeline will compress it down to its most valuable essence.
            </p>
          </div>
        ) : (
          <div className="h-full glass-effect rounded-3xl p-6 sm:p-8 flex flex-col shadow-xl shadow-indigo-100/50 border-indigo-50 relative overflow-hidden">
            <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-50 rounded-bl-full -z-10 opacity-60"></div>

            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold text-slate-800">Generated Summary</h2>
              <div className="flex gap-2 text-xs font-semibold text-indigo-600 bg-indigo-50 px-3 py-1 rounded-full border border-indigo-100">
                <span>{Math.round(result.compression_ratio * 100)}% compressed</span>
              </div>
            </div>

            <div className="flex-grow">
               <div className="prose prose-indigo max-w-none prose-p:leading-relaxed prose-p:text-slate-600">
                 <p className="text-lg">{translatedText || result.summary}</p>
               </div>
            </div>

            <div className="pt-8 mt-4 border-t border-slate-100 flex flex-col gap-4">
               {/* Translation Controls */}
               <div className="flex items-center gap-3">
                 <div className="flex-1 bg-slate-50 border border-slate-200 p-2 rounded-lg flex items-center text-sm">
                   <Languages size={16} className="text-slate-400 mx-2" />
                   <select className="flex-1 bg-transparent text-slate-700 outline-none font-medium" value={targetLang} onChange={e => setTargetLang(e.target.value)}>
                     <option value="es">Spanish</option>
                     <option value="fr">French</option>
                     <option value="de">German</option>
                     <option value="hi">Hindi</option>
                     <option value="zh-CN">Chinese</option>
                     <option value="ja">Japanese</option>
                   </select>
                 </div>
                 <button onClick={translateSummary} className="bg-indigo-50 hover:bg-indigo-100 text-indigo-700 px-4 py-2 text-sm font-medium rounded-lg transition-colors border border-indigo-100">
                   Translate
                 </button>
               </div>

               {/* Action Controls */}
               <div className="flex items-center gap-3">
                 <button onClick={exportPDF} className="flex-1 flex items-center justify-center gap-2 bg-slate-800 text-white font-medium py-3 rounded-lg shadow-md hover:bg-slate-700 transition-colors">
                   <Download size={18} /> Export PDF
                 </button>
                 <button onClick={saveToDashboard} disabled={isSaved} className={`flex items-center justify-center gap-2font-medium py-3 px-6 rounded-lg shadow-md transition-colors ${isSaved ? 'bg-green-100 text-green-700 cursor-not-allowed' : 'bg-white text-slate-700 border border-slate-200 hover:bg-slate-50'}`}>
                   {isSaved ? <CheckCircle2 size={18} /> : <Share size={18} />}
                   {isSaved ? 'Saved' : 'Save'}
                 </button>
               </div>
            </div>
          </div>
        )}
      </div>

    </div>
  );
}
