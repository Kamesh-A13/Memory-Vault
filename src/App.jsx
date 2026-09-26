import React, { useState } from 'react';
import { AuthProvider, useAuth } from './context/AuthContext';
import { AuthModal } from './components/Auth/AuthModal';
import { AppLayout } from './components/Layout/AppLayout';
import { ErrorBoundary } from './components/ErrorBoundary';
import { DashboardPage }  from './pages/DashboardPage';
import { ResourcesPage }  from './pages/ResourcesPage';
import { SearchPage }     from './pages/SearchPage';
import { ExactSearchPage }from './pages/ExactSearchPage';
import { RevisionPage }   from './pages/RevisionPage';
import { PYQPage }        from './pages/PYQPage';
import { AIToolsPage }    from './pages/AIToolsPage';
import { GraduationCap }  from 'lucide-react';
import './App.css';

const PAGE_MAP = {
  dashboard:      DashboardPage,
  resources:      ResourcesPage,
  search:         SearchPage,
  'exact-search': ExactSearchPage,
  revision:       RevisionPage,
  pyq:            PYQPage,
  'ai-tools':     AIToolsPage,
};

const MainApp = () => {
  const { user, loading } = useAuth();
  const [currentPage, setCurrentPage] = useState('dashboard');

  if (loading) {
    return (
      <div className="loading-screen">
        <div className="loading-content">
          <div className="loading-brand-icon">
            <GraduationCap size={40} className="pulse-icon" />
          </div>
          <h2>Memory Vault</h2>
          <p>Loading your academic workspace...</p>
          <div className="loading-bar">
            <div className="loading-bar-fill" />
          </div>
        </div>
      </div>
    );
  }

  if (!user) {
    return <AuthModal />;
  }

  const PageComponent = PAGE_MAP[currentPage] || DashboardPage;

  return (
    <AppLayout currentPage={currentPage} onNavigate={setCurrentPage}>
      {/* Per-page error boundary: a crash in one page won't kill the whole app */}
      <ErrorBoundary key={currentPage}>
        <PageComponent onNavigate={setCurrentPage} />
      </ErrorBoundary>
    </AppLayout>
  );
};

export default function App() {
  return (
    <ErrorBoundary>
      <AuthProvider>
        <MainApp />
      </AuthProvider>
    </ErrorBoundary>
  );
}
