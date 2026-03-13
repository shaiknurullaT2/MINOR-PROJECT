import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import Summarizer from './pages/Summarizer';
import Navbar from './components/Navbar';

function App() {
  // Very basic auth check for routing - for a real app, use Context/Zustand
  const isAuthenticated = () => !!localStorage.getItem('token');

  const ProtectedRoute = ({ children }) => {
    return isAuthenticated() ? children : <Navigate to="/login" />;
  };

  return (
    <Router>
      <div className="min-h-screen pb-10 bg-gradient-to-br from-indigo-50 via-white to-purple-50">
        <Navbar />
        <main className="container mx-auto px-4 pt-24">
          <Routes>
            <Route path="/" element={<Navigate to="/summarize" />} />
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route 
              path="/dashboard" 
              element={
                <ProtectedRoute>
                  <Dashboard />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/summarize" 
              element={
                <ProtectedRoute>
                  <Summarizer />
                </ProtectedRoute>
              } 
            />
          </Routes>
        </main>
      </div>
    </Router>
  );
}

export default App;
