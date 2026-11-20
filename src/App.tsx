import React, { useState, useEffect, useCallback } from 'react';
import { AuthProvider, useAuth } from './context/AuthContext';
import { ThemeProvider } from './context/ThemeContext';
import { PublicLanding } from './pages/PublicLanding';
import { AdminLoginPage } from './pages/AdminLoginPage';
import { AdminSpreadsheetDashboard } from './pages/AdminSpreadsheetDashboard';
import { ChangePasswordModal } from './components/ChangePasswordModal';
import { FileSpreadsheet } from 'lucide-react';

function isAdminQueryActive(): boolean {
  const params = new URLSearchParams(window.location.search);
  return params.get('page') === 'admin';
}

const AppContent: React.FC = () => {
  const { user, isLoading } = useAuth();
  const [isAdminRoute, setIsAdminRoute] = useState<boolean>(() => isAdminQueryActive());

  useEffect(() => {
    const handlePopState = () => {
      setIsAdminRoute(isAdminQueryActive());
    };
    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, []);

  const navigateToPage = useCallback((target: 'public' | 'admin') => {
    const url = new URL(window.location.href);
    if (target === 'admin') {
      url.searchParams.set('page', 'admin');
    } else {
      url.searchParams.delete('page');
    }
    window.history.pushState({}, '', `${url.pathname}${url.search}${url.hash}`);
    setIsAdminRoute(target === 'admin');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, []);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-neutral-50 dark:bg-neutral-950 text-neutral-900 dark:text-neutral-100 flex items-center justify-center p-4">
        <div className="flex flex-col items-center gap-3">
          <div className="w-10 h-10 border-4 border-emerald-600 border-t-transparent rounded-full animate-spin"></div>
          <p className="text-xs font-medium text-neutral-500 dark:text-neutral-400">
            Memuat Bank Sampah Persatuan...
          </p>
        </div>
      </div>
    );
  }

  // Dedicated Admin route via ?page=admin
  if (isAdminRoute) {
    if (user && user.role === 'admin') {
      return (
        <>
          <AdminSpreadsheetDashboard onGoPublic={() => navigateToPage('public')} />
          <ChangePasswordModal />
        </>
      );
    }
    return <AdminLoginPage onGoPublic={() => navigateToPage('public')} />;
  }

  // Default Public Landing Page
  return (
    <>
      <PublicLanding />
      {user && user.role === 'admin' && (
        <button
          type="button"
          onClick={() => navigateToPage('admin')}
          className="fixed bottom-4 right-4 z-40 px-4 py-2.5 rounded-full bg-neutral-900 dark:bg-neutral-800 hover:bg-emerald-800 text-white text-xs font-bold shadow-xl border border-neutral-700 flex items-center gap-2 transition-colors"
        >
          <FileSpreadsheet className="w-4 h-4 text-emerald-400" />
          <span>Panel Admin</span>
        </button>
      )}
    </>
  );
};

export default function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <AppContent />
      </AuthProvider>
    </ThemeProvider>
  );
}

