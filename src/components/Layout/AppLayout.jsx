import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import {
  BookOpen, Search, Target, FileQuestion, Sparkles,
  LayoutDashboard, Menu, X, LogOut, ChevronRight,
  GraduationCap, Brain, Zap
} from 'lucide-react';

const NAV_ITEMS = [
  { id: 'dashboard',    label: 'Dashboard',        icon: LayoutDashboard, badge: null },
  { id: 'resources',   label: 'Resources',         icon: BookOpen,        badge: null },
  { id: 'search',      label: 'Smart Search',      icon: Search,          badge: 'TF-IDF' },
  { id: 'exact-search',label: 'Exact Search',      icon: Target,          badge: 'KMP' },
  { id: 'revision',    label: 'Revision',          icon: Brain,           badge: 'Heap' },
  { id: 'pyq',         label: 'PYQ Analysis',      icon: FileQuestion,    badge: 'Ranking' },
  { id: 'ai-tools',    label: 'AI Tools',          icon: Sparkles,        badge: 'GEMINI' },
];

export const AppLayout = ({ currentPage, onNavigate, children }) => {
  const { user, signOut } = useAuth();
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [signingOut, setSigningOut] = useState(false);

  const displayName = user?.user_metadata?.full_name || user?.email?.split('@')[0] || 'Student';
  const initials = displayName.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);

  const handleSignOut = async () => {
    setSigningOut(true);
    await signOut();
  };

  return (
    <div className="app-shell">
      {/* ── Sidebar ── */}
      <aside className={`sidebar ${sidebarOpen ? 'sidebar-open' : 'sidebar-collapsed'}`}>
        {/* Brand */}
        <div className="sidebar-brand">
          <div className="brand-logo-icon">
            <GraduationCap size={22} />
          </div>
          {sidebarOpen && (
            <div className="brand-text-block">
              <span className="brand-name">Memory Vault</span>
              <span className="brand-tagline">Academic Platform</span>
            </div>
          )}
          <button
            className="sidebar-toggle"
            onClick={() => setSidebarOpen(!sidebarOpen)}
            aria-label="Toggle sidebar"
          >
            {sidebarOpen ? <X size={18} /> : <Menu size={18} />}
          </button>
        </div>

        {/* Navigation */}
        <nav className="sidebar-nav">
          {NAV_ITEMS.map(item => {
            const Icon = item.icon;
            const isActive = currentPage === item.id;
            return (
              <button
                key={item.id}
                className={`nav-item ${isActive ? 'nav-item-active' : ''}`}
                onClick={() => onNavigate(item.id)}
                title={!sidebarOpen ? item.label : undefined}
              >
                <Icon size={19} className="nav-icon" />
                {sidebarOpen && (
                  <>
                    <span className="nav-label">{item.label}</span>
                    {item.badge && (
                      <span className="nav-badge">{item.badge}</span>
                    )}
                    {isActive && <ChevronRight size={14} className="nav-chevron" />}
                  </>
                )}
              </button>
            );
          })}
        </nav>

        {/* User profile at bottom */}
        <div className="sidebar-footer">
          <div className={`user-pill ${!sidebarOpen ? 'user-pill-collapsed' : ''}`}>
            <div className="user-avatar">{initials}</div>
            {sidebarOpen && (
              <div className="user-details">
                <span className="user-display-name">{displayName}</span>
                <span className="user-email-small">{user?.email}</span>
              </div>
            )}
          </div>
          <button
            className={`sign-out-btn ${!sidebarOpen ? 'sign-out-collapsed' : ''}`}
            onClick={handleSignOut}
            disabled={signingOut}
            title="Sign out"
          >
            <LogOut size={16} />
            {sidebarOpen && <span>{signingOut ? 'Signing out...' : 'Sign Out'}</span>}
          </button>
        </div>
      </aside>

      {/* ── Main content area ── */}
      <main className="main-area">
        {/* Top bar */}
        <header className="top-bar">
          <div className="top-bar-left">
            <h1 className="page-title">
              {NAV_ITEMS.find(n => n.id === currentPage)?.label || 'Memory Vault'}
            </h1>
            {NAV_ITEMS.find(n => n.id === currentPage)?.badge && (
              <span className="algo-badge">
                <Zap size={11} />
                {NAV_ITEMS.find(n => n.id === currentPage)?.badge}
              </span>
            )}
          </div>
          <div className="top-bar-right">
            <div className="online-indicator">
              <span className="online-dot" />
              <span>Connected</span>
            </div>
          </div>
        </header>

        {/* Page content */}
        <div className="page-content">
          {children}
        </div>
      </main>
    </div>
  );
};
