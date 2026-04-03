import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { LogIn, Sparkles, Zap, Shield } from 'lucide-react';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState(null);
  const navigate = useNavigate();
  const { login } = useAuth();

  const handleLogin = async (e) => {
    e.preventDefault();
    try {
      await login(email, password);
      navigate('/dashboard');
    } catch (err) {
      setError('Invalid credentials');
    }
  };

  return (
    <div className="min-h-screen flex flex-col md:flex-row bg-slate-50">
      
      {/* Left Panel - Brand & Visuals */}
      <div className="md:w-1/2 relative hidden md:flex flex-col justify-center items-center overflow-hidden bg-slate-900">
        <div className="absolute inset-0 w-full h-full gradient-bg opacity-90 z-0"></div>
        <div className="absolute inset-0 bg-grid-pattern opacity-20 z-0"></div>
        
        {/* Floating Orbs */}
        <div className="absolute top-20 left-20 w-64 h-64 bg-indigo-500 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-blob"></div>
        <div className="absolute top-40 right-20 w-64 h-64 bg-purple-500 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-blob animation-delay-2000"></div>
        <div className="absolute -bottom-20 left-40 w-64 h-64 bg-pink-500 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-blob animation-delay-4000"></div>

        <div className="relative z-10 p-12 text-center max-w-lg animate-fade-in">
          <div className="flex justify-center mb-6 animate-float">
            <div className="h-20 w-20 bg-white/10 backdrop-blur-lg rounded-2xl flex items-center justify-center border border-white/20 shadow-2xl">
              <Sparkles className="text-white w-10 h-10" />
            </div>
          </div>
          <h1 className="text-5xl font-extrabold text-white mb-6 drop-shadow-lg tracking-tight">
            SummarizeAI
          </h1>
          <p className="text-lg text-indigo-100 mb-12 font-medium leading-relaxed drop-shadow">
            Experience the future of reading. Transform lengthy documents into clear, concise insights in seconds.
          </p>

          <div className="grid grid-cols-2 gap-4 text-left">
            <div className="glass-panel p-4 rounded-xl flex items-center gap-3">
              <Zap className="text-yellow-300 w-6 h-6" />
              <span className="text-white font-medium">Lightning Fast</span>
            </div>
            <div className="glass-panel p-4 rounded-xl flex items-center gap-3">
              <Shield className="text-green-300 w-6 h-6" />
              <span className="text-white font-medium">Secure Space</span>
            </div>
          </div>
        </div>
      </div>

      {/* Right Panel - Authentication */}
      <div className="md:w-1/2 w-full flex items-center justify-center p-8 lg:p-24 relative z-10">
        <div className="w-full max-w-md animate-fade-in" style={{ animationDelay: '0.2s' }}>
          
          {/* Mobile Header (Hidden on Desktop) */}
          <div className="md:hidden flex flex-col items-center mb-8">
            <div className="h-12 w-12 bg-indigo-600 rounded-full flex items-center justify-center text-white mb-4 shadow-lg shadow-indigo-200">
              <Sparkles size={24} />
            </div>
            <h1 className="text-3xl font-bold text-slate-800">SummarizeAI</h1>
          </div>

          <div className="glass-effect rounded-3xl p-8 border border-white/60 shadow-2xl shadow-indigo-900/5 relative overflow-hidden">
            {/* Soft decorative background in auth box */}
            <div className="absolute top-0 right-0 -mr-8 -mt-8 w-32 h-32 rounded-full bg-gradient-to-br from-indigo-100 to-purple-50 opacity-50 blur-2xl z-0"></div>
            
            <div className="relative z-10">
              <div className="mb-8">
                <h2 className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-indigo-600 to-purple-600">
                  Welcome Back
                </h2>
                <p className="text-slate-500 text-base mt-2 font-medium">Sign in to sync your AI summaries</p>
              </div>

              {error && (
                <div className="bg-red-50 text-red-500 p-4 rounded-xl text-sm mb-6 flex items-center gap-2 border border-red-100 animate-fade-in shadow-sm">
                  <span className="font-semibold">Error:</span> {error}
                </div>
              )}

              <form onSubmit={handleLogin} className="space-y-5">
                <div className="glow-focus rounded-xl transition-all duration-300">
                  <label className="block text-sm font-semibold text-slate-700 mb-1.5 ml-1">Email</label>
                  <input 
                    type="email" 
                    required
                    className="w-full px-5 py-3.5 rounded-xl border border-slate-200 focus:outline-none focus:border-indigo-500 bg-white/50 backdrop-blur-sm transition-all text-slate-800 font-medium placeholder:font-normal placeholder:text-slate-400"
                    placeholder="you@example.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                  />
                </div>
                <div className="glow-focus rounded-xl transition-all duration-300">
                  <label className="block text-sm font-semibold text-slate-700 mb-1.5 ml-1">Password</label>
                  <input 
                    type="password" 
                    required
                    className="w-full px-5 py-3.5 rounded-xl border border-slate-200 focus:outline-none focus:border-indigo-500 bg-white/50 backdrop-blur-sm transition-all text-slate-800 font-medium placeholder:font-normal placeholder:text-slate-400"
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                  />
                </div>
                
                <div className="pt-2">
                  <button 
                    type="submit"
                    className="group relative w-full flex justify-center py-3.5 px-4 rounded-xl text-white font-semibold tracking-wide bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 shadow-lg shadow-indigo-500/30 hover:shadow-indigo-500/50 transition-all duration-300 transform hover:-translate-y-1 overflow-hidden"
                  >
                    <div className="absolute inset-0 bg-white/20 translate-y-full group-hover:translate-y-0 transition-transform duration-300 ease-in-out"></div>
                    <span className="relative flex items-center gap-2">
                      <LogIn size={20} className="group-hover:scale-110 transition-transform" />
                      Sign In
                    </span>
                  </button>
                </div>
              </form>

              <div className="mt-8 text-center">
                <p className="text-slate-500 font-medium">
                  Don't have an account?{' '}
                  <Link to="/register" className="text-indigo-600 hover:text-indigo-500 font-bold hover:underline transition-all">
                    Create one now
                  </Link>
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
      
    </div>
  );
}
