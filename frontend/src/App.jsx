import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import Summarizer from './pages/Summarizer';
import Navbar from './components/Navbar';

import { AuthProvider, useAuth } from './context/AuthContext';

function AuthRoutes() {
  const { isAuthenticated } = useAuth();
  
  const ProtectedRoute = ({ children }) => {
    return isAuthenticated ? children : <Navigate to="/login" />;
  };

  const GuestRoute = ({ children }) => {
    return isAuthenticated ? <Navigate to="/dashboard" /> : children;
  };

  return (
    <div className="min-h-screen pb-10 bg-gradient-to-br from-indigo-50 via-white to-purple-50">
      <Navbar />
      <main className="container mx-auto px-4 pt-24">
        <Routes>
          <Route path="/" element={<Navigate to="/summarize" />} />
          <Route path="/login" element={<GuestRoute><Login /></GuestRoute>} />
          <Route path="/register" element={<GuestRoute><Register /></GuestRoute>} />
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
  );
}

function App() {
  return (
    <AuthProvider>
      <Router>
        <AuthRoutes />
      </Router>
    </AuthProvider>
  );
}

export default App;
