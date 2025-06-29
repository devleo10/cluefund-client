import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import App from './App.tsx';
import { AuthProvider } from './context/AuthContext';
import { SavedFundsProvider } from './context/SavedFundsContext';
import { ToastProvider } from './context/ToastContext';
import './index.css';

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <ToastProvider>
      <BrowserRouter>
        <AuthProvider>
          <SavedFundsProvider>
            <App />
          </SavedFundsProvider>
        </AuthProvider>
      </BrowserRouter>
    </ToastProvider>
  </StrictMode>
);