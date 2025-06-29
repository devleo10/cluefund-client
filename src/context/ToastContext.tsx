import React, { createContext, useContext, useState, ReactNode, useEffect } from 'react';
import { CheckCircle, AlertCircle } from 'lucide-react';

interface ToastContextType {
  showToast: (message: string, type?: 'success' | 'error') => void;
}

const ToastContext = createContext<ToastContextType | undefined>(undefined);

export const useToast = () => {
  const context = useContext(ToastContext);
  if (!context) throw new Error('useToast must be used within a ToastProvider');
  return context;
};

export const ToastProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error'; id: number } | null>(null);
  const [toastQueue, setToastQueue] = useState<Array<{ message: string; type: 'success' | 'error'; id: number }>>([]);

  useEffect(() => {
    if (!toast && toastQueue.length > 0) {
      const nextToast = toastQueue[0];
      setToast(nextToast);
      setToastQueue(prev => prev.slice(1));
      
      const timer = setTimeout(() => {
        setToast(null);
      }, 5000);
      
      return () => clearTimeout(timer);
    }
  }, [toast, toastQueue]);

  const showToast = (message: string, type: 'success' | 'error' = 'success') => {
    if (!message) {
      return;
    }
    
    const newToast = { message, type, id: Date.now() };
    
    if (!toast) {
      setToast(newToast);
      setTimeout(() => {
        setToast(null);
      }, 5000);
    } else {
      setToastQueue(prev => [...prev, newToast]);
    }
  };

  return (
    <ToastContext.Provider value={{ showToast }}>
      {children}
      {toast && (
        <div
          className={`fixed top-4 left-1/2 transform -translate-x-1/2 z-[99999] px-6 py-4 rounded-lg shadow-xl text-white transition-all duration-300 flex items-center
            ${toast.type === 'success' ? 'bg-green-600' : 'bg-red-600'}`}
          style={{ 
            pointerEvents: 'auto',
            minWidth: '300px',
            maxWidth: '90%',
            boxShadow: '0 10px 25px rgba(0, 0, 0, 0.3)',
            animation: 'fadeInDown 0.3s, fadeOutUp 0.3s 4.7s'
          }}
        >
          {toast.type === 'success' ? (
            <CheckCircle className="h-5 w-5 mr-3 flex-shrink-0" />
          ) : (
            <AlertCircle className="h-5 w-5 mr-3 flex-shrink-0" />
          )}
          <span className="font-medium">{toast.message}</span>
        </div>
      )}
    </ToastContext.Provider>
  );
};
