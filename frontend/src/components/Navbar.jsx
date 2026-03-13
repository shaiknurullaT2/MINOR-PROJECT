import { Link, useNavigate } from 'react-router-dom';
import { FileText, LogOut, LayoutDashboard, User } from 'lucide-react';

export default function Navbar() {
  const navigate = useNavigate();
  const isAuthenticated = !!localStorage.getItem('token');

  const handleLogout = () => {
    localStorage.removeItem('token');
    navigate('/login');
  };

  return (
    <nav className="fixed w-full top-0 z-50 glass-effect border-b border-white/20">
      <div className="container mx-auto px-4 h-16 flex items-center justify-between">
        <Link to="/" className="flex items-center gap-2 group">
          <div className="bg-gradient-to-br from-indigo-500 to-purple-600 p-2 rounded-lg text-white group-hover:shadow-lg group-hover:shadow-indigo-500/30 transition-all">
            <FileText size={20} />
          </div>
          <span className="font-bold text-xl tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-slate-800 to-slate-600">
            Summarize<span className="text-indigo-600">AI</span>
          </span>
        </Link>
        
        <div className="flex items-center gap-4">
          {isAuthenticated ? (
            <>
              <Link 
                to="/summarize" 
                className="text-slate-600 hover:text-indigo-600 font-medium text-sm transition-colors hidden sm:block"
              >
                New Summary
              </Link>
              <Link 
                to="/dashboard" 
                className="flex items-center gap-2 text-slate-600 hover:text-indigo-600 font-medium text-sm transition-colors"
              >
                <LayoutDashboard size={18} />
                <span className="hidden sm:inline">Dashboard</span>
              </Link>
              <button 
                onClick={handleLogout}
                className="flex items-center gap-2 bg-slate-100 hover:bg-red-50 text-slate-700 hover:text-red-600 px-4 py-2 rounded-lg text-sm font-medium transition-colors border border-slate-200 hover:border-red-200 ml-2"
              >
                <LogOut size={16} />
                <span className="hidden sm:inline">Logout</span>
              </button>
            </>
          ) : (
            <Link 
              to="/login"
              className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white px-5 py-2 rounded-lg text-sm font-medium shadow-md shadow-indigo-200 transition-all transform hover:-translate-y-0.5"
            >
              <User size={16} />
              Sign In
            </Link>
          )}
        </div>
      </div>
    </nav>
  );
}
