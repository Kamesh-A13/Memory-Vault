import React from 'react';
import { useAuth } from '../../context/AuthContext';
import { Shield, LogOut, User, Database, Lock } from 'lucide-react';

export const Navbar = () => {
  const { user, session, signOut } = useAuth();

  const userDisplayName =
    user?.user_metadata?.full_name || user?.email?.split('@')[0] || 'Authenticated User';

  return (
    <header className="navbar">
      <div className="navbar-container">
        <div className="navbar-brand">
          <div className="brand-logo">
            <Shield size={22} className="logo-icon" />
          </div>
          <div className="brand-text">
            <span className="brand-title">Memory Vault</span>
            <span className="brand-badge">Supabase Auth</span>
          </div>
        </div>

        <div className="navbar-status">
          <span className="status-indicator"></span>
          <span className="status-text">Backend Connected</span>
        </div>

        {user && (
          <div className="navbar-actions">
            <div className="user-profile-badge">
              <User size={16} className="user-icon" />
              <div className="user-info">
                <span className="user-name">{userDisplayName}</span>
                <span className="user-email">{user.email}</span>
              </div>
            </div>

            <button
              onClick={signOut}
              className="btn btn-outline btn-logout"
              title="Sign Out (FR-02)"
            >
              <LogOut size={16} />
              <span>Logout</span>
            </button>
          </div>
        )}
      </div>
    </header>
  );
};
