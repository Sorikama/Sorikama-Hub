import React from 'react';
import Navbar from './Navbar';
import Loader from './Loader';
import AuthTest from './AuthTest';
import Toast from './Toast';
import { useAuth } from '../context/AuthContext';
import { useToastContext } from '../context/ToastContext';
import { useTokenRefresh } from '../hooks/useTokenRefresh';

const Layout = ({ children }) => {
  const { loading } = useAuth();
  const { toasts, hideToast } = useToastContext();
  
  // Gestion automatique du refresh token
  useTokenRefresh();

  if (loading) {
    return <Loader />;
  }

  return (
    <div className="min-h-screen bg-background text-foreground transition-colors">
      <Navbar />
      <main className="pt-16">
        {children}
      </main>
      <AuthTest />
      
      {/* Toasts */}
      <div className="fixed top-4 right-4 z-50 space-y-2">
        {toasts.map(toast => (
          <Toast
            key={toast.id}
            message={toast.message}
            type={toast.type}
            onClose={() => hideToast(toast.id)}
          />
        ))}
      </div>
    </div>
  );
};

export default Layout;