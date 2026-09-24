import React from 'react';
import { AuthProvider, useAuth } from './context/AuthContext';
import { Navbar } from './components/Common/Navbar';
import { AuthModal } from './components/Auth/AuthModal';
import { VaultDashboard } from './components/Protected/VaultDashboard';
import { Shield, Sparkles } from 'lucide-react';
import './App.css';

const MainApp = () => {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="loading-screen">
        <div className="loading-content">
          <div className="loading-shield">
            <Shield size={44} className="pulse-icon" />
          </div>
          <h2>Initializing Security Layer...</h2>
          <p>Verifying active Supabase session & cryptographic keys</p>
        </div>
      </div>
    );
  }

  return (
    <div className="app-layout">
      <Navbar />
      <main className="main-content">
        {user ? (
          // FR-02: Protected Resource view for authenticated users
          <VaultDashboard />
        ) : (
          // FR-01 & FR-02: Authentication & Registration Portal for unauthenticated users
          <div className="portal-container">
            <div className="portal-showcase">
              <div className="badge-tag glow-badge">
                <Sparkles size={14} /> End-to-End Encrypted Cloud Vault
              </div>
              <h1 className="portal-hero-title">
                Zero-Knowledge <br />
                <span className="text-gradient">Memory Vault</span>
              </h1>
              <p className="portal-hero-desc">
                Built with React and Supabase. Protect your sensitive notes, credentials, and digital
                artifacts with enterprise-grade JWT token sessions and row-level security.
              </p>

              <div className="features-list">
                <div className="feature-item">
                  <div className="feature-dot"></div>
                  <div>
                    <strong>FR-01: User Registration</strong>
                    <p>Instant account creation with strict client/server validation & duplicate account guards.</p>
                  </div>
                </div>
                <div className="feature-item">
                  <div className="feature-dot"></div>
                  <div>
                    <strong>FR-02: User Authentication</strong>
                    <p>Secure login/logout, active JWT session persistence, and protected resources.</p>
                  </div>
                </div>
              </div>
            </div>

            <div className="portal-auth-side">
              <AuthModal />
            </div>
          </div>
        )}
      </main>
    </div>
  );
};

export default function App() {
  return (
    <AuthProvider>
      <MainApp />
    </AuthProvider>
  );
}
