import { useState, useEffect } from 'react';
import api from '../lib/api';
import { History, Clock, FileText, Trash2, ChevronRight, Activity, Sparkles, Brain } from 'lucide-react';
import { Link } from 'react-router-dom';

export default function Dashboard() {
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchHistory();
  }, []);

  const fetchHistory = async () => {
    try {
      const response = await api.get('/api/dashboard/history');
      setHistory(response.data);
    } catch (error) {
      console.error('Failed to fetch history', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if(!window.confirm("Are you sure you want to delete this summary?")) return;
    try {
      await api.delete(`/api/dashboard/${id}`);
      setHistory(history.filter(item => item.id !== id));
    } catch (error) {
      console.error('Failed to delete', error);
    }
  };

  const formatDate = (isoString) => {
    return new Date(isoString).toLocaleDateString('en-US', {
      month: 'short', day: 'numeric', year: 'numeric'
    });
  };

  return (
    <div className="max-w-6xl mx-auto pb-20 relative px-4 sm:px-6 lg:px-8 mt-4">
      {/* Ambient Background Elements for Light Glass theme */}
      <div className="absolute top-0 right-0 w-96 h-96 bg-purple-200 rounded-full mix-blend-multiply filter blur-3xl opacity-50 animate-blob pointer-events-none z-0"></div>
      <div className="absolute top-40 left-0 w-96 h-96 bg-indigo-200 rounded-full mix-blend-multiply filter blur-3xl opacity-50 animate-blob animation-delay-2000 pointer-events-none z-0"></div>
      <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-pink-200 rounded-full mix-blend-multiply filter blur-3xl opacity-50 animate-blob animation-delay-4000 pointer-events-none z-0"></div>

      <div className="relative z-10">
        {/* Header Section */}
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between mb-10 gap-4">
          <div className="animate-fade-in">
            <h1 className="text-4xl font-extrabold text-slate-800 flex items-center gap-4 tracking-tight">
              <div className="p-3 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-2xl shadow-lg shadow-indigo-200 text-white">
                <Brain size={28} />
              </div>
              Your Intelligence Hub
            </h1>
            <p className="text-slate-500 mt-2 text-lg ml-1">Manage and revisit your AI-powered insights</p>
          </div>

          <div className="glass-effect px-6 py-4 rounded-2xl shadow-lg shadow-indigo-100 flex items-center gap-4 animate-fade-in" style={{ animationDelay: '0.1s' }}>
            <div className="p-3 bg-indigo-50 text-indigo-600 rounded-xl">
              <Activity size={24} />
            </div>
            <div>
              <p className="text-sm text-slate-500 font-bold uppercase tracking-wider">Total Summaries</p>
              <p className="text-3xl font-black bg-clip-text text-transparent bg-gradient-to-r from-indigo-600 to-purple-600 leading-tight">
                {history.length}
              </p>
            </div>
          </div>
        </div>

        {/* Content Section */}
        {loading ? (
          <div className="flex justify-center items-center py-40">
            <div className="relative w-20 h-20">
              <div className="absolute inset-0 border-4 border-indigo-200 rounded-full animate-ping opacity-75"></div>
              <div className="absolute inset-0 border-4 border-t-indigo-600 rounded-full animate-spin"></div>
            </div>
          </div>
        ) : history.length === 0 ? (
          <div className="glass-effect rounded-3xl p-16 text-center flex flex-col items-center border border-white/60 shadow-2xl shadow-indigo-500/5 animate-fade-in transform hover:-translate-y-1 transition-all duration-300">
            <div className="w-24 h-24 bg-gradient-to-br from-indigo-50 to-purple-50 rounded-full flex items-center justify-center text-indigo-400 mb-6 shadow-inner relative">
              <div className="absolute inset-0 bg-indigo-400 rounded-full blur-xl opacity-20 animate-pulse-slow"></div>
              <FileText size={40} className="relative z-10" />
            </div>
            <h3 className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-indigo-700 to-purple-700 mb-4">
              Your hub is empty
            </h3>
            <p className="text-slate-500 mb-8 max-w-md text-lg leading-relaxed">
              You haven't summarized any documents yet. Harness the power of AI to extract key insights instantly.
            </p>
            <Link to="/summarize" className="group relative inline-flex justify-center items-center gap-2 py-4 px-8 rounded-xl text-white font-bold tracking-wide bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 shadow-xl shadow-indigo-500/30 transition-all duration-300 overflow-hidden transform hover:scale-105">
              <div className="absolute inset-0 bg-white/20 translate-y-full group-hover:translate-y-0 transition-transform duration-300 ease-in-out"></div>
              <Sparkles size={20} className="relative z-10 group-hover:animate-pulse" />
              <span className="relative z-10">Create First Summary</span>
            </Link>
          </div>
        ) : (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {history.map((item, index) => (
              <div 
                key={item.id} 
                className="glass-effect rounded-2xl p-6 border border-white/60 shadow-xl shadow-indigo-900/5 hover:shadow-2xl hover:shadow-indigo-500/10 transition-all duration-300 group flex flex-col h-full relative overflow-hidden animate-fade-in block"
                style={{ animationDelay: `${index * 0.05 + 0.1}s` }}
              >
                {/* Decorative background flare */}
                <div className="absolute -top-10 -right-10 w-32 h-32 bg-gradient-to-br from-indigo-100 to-purple-100 rounded-full opacity-50 blur-2xl group-hover:opacity-100 transition-opacity"></div>
                
                <div className="relative z-10 flex flex-col h-full">
                  <div className="flex justify-between items-start mb-5">
                    <span className={`inline-flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-bold rounded-full border ${
                      item.method === 'abstractive' 
                        ? 'bg-purple-50 text-purple-700 border-purple-100' 
                        : 'bg-indigo-50 text-indigo-700 border-indigo-100'
                    }`}>
                      <Sparkles size={12} className={item.method === 'abstractive' ? 'text-purple-500' : 'text-indigo-500'} />
                      {item.method === 'abstractive' ? 'AI Abstract' : 'Key Extracted'}
                    </span>
                    <button 
                      onClick={() => handleDelete(item.id)}
                      className="text-slate-400 bg-white/50 p-2 rounded-full hover:bg-red-50 hover:text-red-500 transition-all opacity-0 group-hover:opacity-100 shadow-sm border border-transparent hover:border-red-100"
                      title="Delete summary"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>

                  <div className="flex-grow mb-4">
                    <p className="text-slate-700 text-sm line-clamp-5 leading-relaxed font-medium">
                      {item.summary_text}
                    </p>
                  </div>

                  <div className="mt-auto pt-4 border-t border-slate-200/60 flex items-center justify-between text-xs text-slate-500 font-semibold">
                    <div className="flex items-center gap-1.5 bg-white/50 px-2.5 py-1 rounded-md border border-slate-100">
                      <Clock size={14} className="text-slate-400" />
                      {formatDate(item.created_at)}
                    </div>
                    <div className="flex items-center gap-1 px-2.5 py-1 bg-green-50 text-green-700 rounded-md border border-green-100">
                      <Activity size={12} />
                      {Math.round(item.compression_ratio * 100)}% ratio
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
