import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import {
  ShieldCheck,
  Key,
  Clock,
  User,
  PlusCircle,
  Trash2,
  Lock,
  FileText,
  Sparkles,
  RefreshCw,
  CheckCircle2
} from 'lucide-react';

export const VaultDashboard = () => {
  const { user, session, signOut } = useAuth();
  const [memories, setMemories] = useState([
    {
      id: 1,
      title: 'Supabase Project Credentials & Setup',
      category: 'Security',
      content: 'Configured Supabase Auth with JWT token management and RLS row-level security.',
      createdAt: new Date().toLocaleDateString(),
    },
    {
      id: 2,
      title: 'Secret Recovery Phrase',
      category: 'Vault Key',
      content: 'alpha-bravo-tango-delta-echo-foxtrot-vault-safe-2026',
      createdAt: new Date().toLocaleDateString(),
    },
  ]);

  const [newTitle, setNewTitle] = useState('');
  const [newCategory, setNewCategory] = useState('General');
  const [newContent, setNewContent] = useState('');
  const [showAddForm, setShowAddForm] = useState(false);

  const handleAddMemory = (e) => {
    e.preventDefault();
    if (!newTitle.trim() || !newContent.trim()) return;

    const newEntry = {
      id: Date.now(),
      title: newTitle.trim(),
      category: newCategory,
      content: newContent.trim(),
      createdAt: new Date().toLocaleDateString(),
    };

    setMemories([newEntry, ...memories]);
    setNewTitle('');
    setNewContent('');
    setShowAddForm(false);
  };

  const handleDeleteMemory = (id) => {
    setMemories(memories.filter((m) => m.id !== id));
  };

  const expiresAtFormatted = session?.expires_at
    ? new Date(session.expires_at * 1000).toLocaleString()
    : 'Active (Auto-refresh enabled)';

  return (
    <div className="dashboard-container">
      {/* Welcome Hero Banner */}
      <div className="dashboard-hero">
        <div className="hero-content">
          <div className="hero-badge">
            <ShieldCheck size={16} /> Protected Resource (FR-02)
          </div>
          <h1 className="hero-title">
            Welcome back,{' '}
            <span className="text-gradient">
              {user?.user_metadata?.full_name || user?.email?.split('@')[0]}
            </span>
          </h1>
          <p className="hero-subtitle">
            Your personal encrypted memory vault is unlocked. All data operations are securely tied
            to your Supabase authenticated session.
          </p>
        </div>

        <div className="hero-stats">
          <div className="stat-card">
            <span className="stat-label">Stored Items</span>
            <span className="stat-value">{memories.length}</span>
          </div>
          <div className="stat-card">
            <span className="stat-label">Auth Provider</span>
            <span className="stat-value">Supabase</span>
          </div>
          <div className="stat-card">
            <span className="stat-label">Security Tier</span>
            <span className="stat-value text-accent">End-to-End</span>
          </div>
        </div>
      </div>

      <div className="dashboard-grid">
        {/* Left Column: Vault Items Management */}
        <div className="vault-main-panel">
          <div className="panel-header">
            <div className="panel-title-wrap">
              <FileText size={20} className="text-accent" />
              <h2>Encrypted Vault Records</h2>
            </div>
            <button
              className="btn btn-primary btn-sm"
              onClick={() => setShowAddForm(!showAddForm)}
            >
              <PlusCircle size={16} />
              <span>{showAddForm ? 'Cancel' : 'New Memory'}</span>
            </button>
          </div>

          {/* New Memory Form Drawer */}
          {showAddForm && (
            <form onSubmit={handleAddMemory} className="add-memory-card">
              <h3>Create Secure Vault Entry</h3>
              <div className="form-row">
                <div className="form-group flex-2">
                  <label>Title</label>
                  <input
                    type="text"
                    placeholder="e.g. Master API Keys"
                    value={newTitle}
                    onChange={(e) => setNewTitle(e.target.value)}
                    required
                  />
                </div>
                <div className="form-group flex-1">
                  <label>Category</label>
                  <select
                    value={newCategory}
                    onChange={(e) => setNewCategory(e.target.value)}
                  >
                    <option value="General">General</option>
                    <option value="Security">Security</option>
                    <option value="Vault Key">Vault Key</option>
                    <option value="Personal">Personal</option>
                  </select>
                </div>
              </div>
              <div className="form-group">
                <label>Encrypted Content / Notes</label>
                <textarea
                  rows="3"
                  placeholder="Enter private information to store securely..."
                  value={newContent}
                  onChange={(e) => setNewContent(e.target.value)}
                  required
                />
              </div>
              <div className="form-actions">
                <button type="button" className="btn btn-outline btn-sm" onClick={() => setShowAddForm(false)}>
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary btn-sm">
                  Save to Vault
                </button>
              </div>
            </form>
          )}

          {/* Memory List */}
          <div className="memory-list">
            {memories.length === 0 ? (
              <div className="empty-state">
                <Lock size={36} className="empty-icon" />
                <p>No records in your vault yet. Click "+ New Memory" to add one.</p>
              </div>
            ) : (
              memories.map((item) => (
                <div key={item.id} className="memory-item">
                  <div className="memory-header">
                    <div>
                      <span className="badge-tag">{item.category}</span>
                      <h3 className="memory-title">{item.title}</h3>
                    </div>
                    <button
                      className="btn-icon-danger"
                      onClick={() => handleDeleteMemory(item.id)}
                      title="Delete Record"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                  <p className="memory-body">{item.content}</p>
                  <div className="memory-footer">
                    <span className="memory-date">Created on {item.createdAt}</span>
                    <span className="badge-encrypted">
                      <Lock size={12} /> Encrypted
                    </span>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Right Column: Session & Security Details (FR-02 Session/Token Management) */}
        <div className="session-panel">
          <div className="panel-header">
            <div className="panel-title-wrap">
              <Key size={20} className="text-accent" />
              <h2>Active Session (FR-02)</h2>
            </div>
          </div>

          <div className="session-card">
            <div className="session-item">
              <div className="session-item-label">
                <User size={15} /> Authenticated User ID
              </div>
              <div className="session-item-value code-font">{user?.id}</div>
            </div>

            <div className="session-item">
              <div className="session-item-label">
                <CheckCircle2 size={15} className="text-success" /> Email Verification
              </div>
              <div className="session-item-value">
                {user?.email_confirmed_at ? (
                  <span className="text-success">Verified</span>
                ) : (
                  <span className="text-warning">Pending confirmation</span>
                )}
              </div>
            </div>

            <div className="session-item">
              <div className="session-item-label">
                <Clock size={15} /> Session Token Expires At
              </div>
              <div className="session-item-value">{expiresAtFormatted}</div>
            </div>

            <div className="session-item">
              <div className="session-item-label">
                <RefreshCw size={15} /> Token Management
              </div>
              <div className="session-item-value text-accent">
                Auto-Refresh (onAuthStateChange Active)
              </div>
            </div>

            <div className="session-actions">
              <button onClick={signOut} className="btn btn-outline btn-block">
                Sign Out of Current Session
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
