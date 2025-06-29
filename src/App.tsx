import { Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { useAuth } from './context/AuthContext';
import Header from './components/Header';
import HomePage from './pages/HomePage';
import AuthPage from './pages/AuthPage';
import FundDetailPage from './pages/FundDetailPage';
import SavedFundsPage from './pages/SavedFundsPage';
import LoadingSpinner from './components/LoadingSpinner';

function App() {
  const { user, isLoading } = useAuth();
  const location = useLocation();

  if (isLoading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <LoadingSpinner size="lg" text="Loading..." />
      </div>
    );
  }

  // Only show Header if not on /auth route
  const isAuthPage = location.pathname === '/auth';

  return (
    <div className="min-h-screen bg-slate-50">
      {!isAuthPage && <Header />}
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/auth" element={user ? <Navigate to="/" replace /> : <AuthPage />} />
        <Route path="/fund/:schemeCode" element={<FundDetailPage />} />
        <Route path="/saved" element={user ? <SavedFundsPage /> : <Navigate to="/auth" state={{ from: location }} replace />} />
        {/* fallback route */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </div>
  );
}

export default App;