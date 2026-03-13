import { useState, useEffect } from 'react';
import axios from 'axios';
import { History, Clock, FileText, Trash2, ChevronRight, Activity } from 'lucide-react';

export default function Dashboard() {
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchHistory();
  }, []);

  const fetchHistory = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get('/api/dashboard/history', {
        headers: { Authorization: `Bearer ${token}` }
      });
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
      const token = localStorage.getItem('token');
      await axios.delete(`/api/dashboard/${id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
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
    <div className="max-w-5xl mx-auto pb-20">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-slate-800 flex items-center gap-3">
            <History className="text-indigo-600" />
            Your Dashboard
          </h1>
          <p className="text-slate-500 mt-1">Manage and revisit your past AI summaries</p>
        </div>

        <div className="bg-white px-4 py-2 rounded-xl shadow-sm border border-slate-100 flex items-center gap-3 hidden md:flex">
          <div className="p-2 bg-indigo-50 text-indigo-600 rounded-lg">
            <Activity size={20} />
          </div>
          <div>
            <p className="text-xs text-slate-500 font-medium">Total Summaries</p>
            <p className="text-lg font-bold text-slate-800 leading-tight">{history.length}</p>
          </div>
        </div>
      </div>

      {loading ? (
        <div className="flex justify-center py-20">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
        </div>
      ) : history.length === 0 ? (
        <div className="glass-effect rounded-2xl p-12 text-center flex flex-col items-center">
          <div className="w-20 h-20 bg-slate-100 rounded-full flex items-center justify-center text-slate-400 mb-4">
            <FileText size={32} />
          </div>
          <h3 className="text-xl font-bold text-slate-700 mb-2">No summaries yet</h3>
          <p className="text-slate-500 mb-6 max-w-sm">
            You haven't summarized any documents yet. Head over to the summarizer tool to get started!
          </p>
          <a href="/summarize" className="bg-indigo-600 text-white px-6 py-3 rounded-xl font-medium shadow-lg hover:bg-indigo-700 transition-colors">
            Create First Summary
          </a>
        </div>
      ) : (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {history.map((item) => (
            <div key={item.id} className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100 hover:shadow-md transition-shadow group flex flex-col h-full">
              <div className="flex justify-between items-start mb-4">
                <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-indigo-50 text-indigo-700 text-xs font-semibold rounded-full">
                  {item.method === 'abstractive' ? 'AI Abstract' : 'Key Extracted'}
                </span>
                <button 
                  onClick={() => handleDelete(item.id)}
                  className="text-slate-400 hover:text-red-500 transition-colors opacity-0 group-hover:opacity-100"
                >
                  <Trash2 size={16} />
                </button>
              </div>

              <div className="flex-grow">
                <p className="text-sm text-slate-600 line-clamp-4 leading-relaxed">
                  {item.summary_text}
                </p>
              </div>

              <div className="mt-6 pt-4 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
                <div className="flex items-center gap-1.5">
                  <Clock size={14} />
                  {formatDate(item.created_at)}
                </div>
                <div className="font-medium">
                  {Math.round(item.compression_ratio * 100)}% ratio
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
