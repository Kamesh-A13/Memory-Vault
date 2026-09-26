import React, { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../context/AuthContext';
import {
  Upload, BookOpen, Trash2, FileText, Image, File,
  Plus, Search, Filter, X, AlertCircle, CheckCircle, Loader,
  ExternalLink, Calendar, Users, User, Globe
} from 'lucide-react';
import {
  fetchAllResources, fetchResources, createResource, deleteResource,
  uploadFile, getFileUrl
} from '../lib/dbService';

const ACCEPTED_TYPES = '.pdf,.txt,.md,.doc,.docx,.png,.jpg,.jpeg,.gif,.webp';

const FILE_ICONS = {
  pdf: FileText, txt: FileText, md: FileText, doc: FileText, docx: FileText,
  png: Image, jpg: Image, jpeg: Image, gif: Image, webp: Image,
};

const SUBJECTS = [
  'Mathematics', 'Physics', 'Chemistry', 'Biology', 'Computer Science',
  'Data Structures', 'Algorithms', 'Operating Systems', 'Database Systems',
  'Computer Networks', 'Software Engineering', 'Machine Learning',
  'Artificial Intelligence', 'Economics', 'English', 'Other'
];

function formatBytes(bytes) {
  if (!bytes) return '—';
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

function getFileExt(filename) {
  return filename?.split('.').pop()?.toLowerCase() || 'file';
}

function getUploaderLabel(resource, currentUserId) {
  if (resource.user_id === currentUserId) return 'You';
  // Show first part of email or a generic label
  return resource.uploader_email
    ? resource.uploader_email.split('@')[0]
    : 'Shared';
}

export const ResourcesPage = () => {
  const { user } = useAuth();
  const [resources, setResources] = useState([]);
  const [filtered, setFiltered] = useState([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [showUploadForm, setShowUploadForm] = useState(false);
  const [searchQ, setSearchQ] = useState('');
  const [filterSubject, setFilterSubject] = useState('');
  const [viewMode, setViewMode] = useState('all'); // 'all' | 'mine'
  const [toast, setToast] = useState(null);
  const [deletingId, setDeletingId] = useState(null);

  const [form, setForm] = useState({ title: '', subject: '', topic: '', description: '', file: null });
  const [dragOver, setDragOver] = useState(false);
  const [formError, setFormError] = useState('');

  const showToast = (msg, type = 'success') => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3500);
  };

  const loadResources = useCallback(async () => {
    if (!user?.id) return;
    setLoading(true);
    const { data, error } = viewMode === 'all'
      ? await fetchAllResources()
      : await fetchResources(user.id);
    if (!error) setResources(data || []);
    setLoading(false);
  }, [user?.id, viewMode]);

  useEffect(() => { loadResources(); }, [loadResources]);

  useEffect(() => {
    let list = resources;
    if (filterSubject) list = list.filter(r => r.subject === filterSubject);
    if (searchQ.trim()) {
      const q = searchQ.toLowerCase();
      list = list.filter(r =>
        r.title?.toLowerCase().includes(q) ||
        r.subject?.toLowerCase().includes(q) ||
        r.topic?.toLowerCase().includes(q) ||
        r.description?.toLowerCase().includes(q)
      );
    }
    setFiltered(list);
  }, [resources, searchQ, filterSubject]);

  const handleFileSelect = (file) => {
    if (!file) return;
    if (file.size > 20 * 1024 * 1024) { setFormError('File size must be under 20 MB.'); return; }
    setForm(f => ({ ...f, file, title: f.title || file.name.replace(/\.[^.]+$/, '') }));
    setFormError('');
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setDragOver(false);
    const file = e.dataTransfer.files[0];
    if (file) handleFileSelect(file);
  };

  const handleUpload = async (e) => {
    e.preventDefault();
    setFormError('');
    if (!form.title.trim()) { setFormError('Title is required.'); return; }
    if (!form.subject)      { setFormError('Please select a subject.'); return; }
    if (!form.file)         { setFormError('Please select a file to upload.'); return; }

    setUploading(true);
    try {
      const { path, error: uploadErr } = await uploadFile(form.file, user.id);
      if (uploadErr) throw new Error(uploadErr.message);

      const { error: dbErr } = await createResource({
        user_id:     user.id,
        title:       form.title.trim(),
        subject:     form.subject,
        topic:       form.topic.trim() || null,
        description: form.description.trim() || null,
        file_path:   path,
        file_type:   getFileExt(form.file.name),
        file_size:   form.file.size,
        file_name:   form.file.name,
      });
      if (dbErr) throw new Error(dbErr.message);

      showToast('Resource uploaded and shared with everyone!');
      setForm({ title: '', subject: '', topic: '', description: '', file: null });
      setShowUploadForm(false);
      loadResources();
    } catch (err) {
      setFormError(err.message || 'Upload failed. Please try again.');
    } finally {
      setUploading(false);
    }
  };

  const handleDelete = async (resource) => {
    if (!window.confirm(`Delete "${resource.title}"? This cannot be undone.`)) return;
    setDeletingId(resource.id);
    const { error } = await deleteResource(resource.id, resource.file_path);
    if (!error) {
      setResources(prev => prev.filter(r => r.id !== resource.id));
      showToast('Resource deleted.');
    } else {
      showToast('Failed to delete resource.', 'error');
    }
    setDeletingId(null);
  };

  const subjects = [...new Set(resources.map(r => r.subject).filter(Boolean))];
  const myCount = resources.filter(r => r.user_id === user?.id).length;

  return (
    <div className="page-wrapper">
      {/* Toast */}
      {toast && (
        <div className={`toast toast-${toast.type}`}>
          {toast.type === 'success' ? <CheckCircle size={16} /> : <AlertCircle size={16} />}
          {toast.msg}
        </div>
      )}

      {/* Shared library banner */}
      <div className="algo-info-banner" style={{ marginBottom: 20 }}>
        <Globe size={14} className="text-accent" />
        <span>
          <strong>Shared Resource Library —</strong> All uploaded resources are visible to every user.
          Upload to contribute to the collective knowledge base. Only you can delete your own uploads.
        </span>
      </div>

      {/* Toolbar */}
      <div className="toolbar">
        <div className="toolbar-left">
          <div className="search-box">
            <Search size={16} className="search-icon" />
            <input
              type="text"
              placeholder="Search resources..."
              value={searchQ}
              onChange={e => setSearchQ(e.target.value)}
              className="search-input"
            />
            {searchQ && (
              <button className="search-clear" onClick={() => setSearchQ('')}>
                <X size={14} />
              </button>
            )}
          </div>

          <div className="filter-select-wrap">
            <Filter size={14} />
            <select className="filter-select" value={filterSubject} onChange={e => setFilterSubject(e.target.value)}>
              <option value="">All Subjects</option>
              {subjects.map(s => <option key={s} value={s}>{s}</option>)}
            </select>
          </div>

          {/* View toggle: All / Mine */}
          <div className="view-toggle">
            <button
              className={`view-toggle-btn ${viewMode === 'all' ? 'active' : ''}`}
              onClick={() => setViewMode('all')}
            >
              <Users size={13} /> All Resources
            </button>
            <button
              className={`view-toggle-btn ${viewMode === 'mine' ? 'active' : ''}`}
              onClick={() => setViewMode('mine')}
            >
              <User size={13} /> My Uploads {myCount > 0 && `(${myCount})`}
            </button>
          </div>
        </div>

        <button
          className="btn btn-primary"
          onClick={() => { setShowUploadForm(!showUploadForm); setFormError(''); }}
        >
          {showUploadForm ? <X size={16} /> : <Plus size={16} />}
          {showUploadForm ? 'Cancel' : 'Upload Resource'}
        </button>
      </div>

      {/* Upload form */}
      {showUploadForm && (
        <div className="upload-form-card">
          <h3 className="upload-form-title">
            <Upload size={18} /> Upload & Share Academic Resource
          </h3>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem', marginBottom: 16 }}>
            Your upload will be visible to all users in the shared library.
          </p>
          {formError && (
            <div className="alert alert-error"><AlertCircle size={16} /> {formError}</div>
          )}
          <form onSubmit={handleUpload} className="upload-form">
            <div
              className={`drop-zone ${dragOver ? 'drop-zone-active' : ''} ${form.file ? 'drop-zone-has-file' : ''}`}
              onDragOver={e => { e.preventDefault(); setDragOver(true); }}
              onDragLeave={() => setDragOver(false)}
              onDrop={handleDrop}
              onClick={() => document.getElementById('file-input').click()}
            >
              <input
                id="file-input" type="file" accept={ACCEPTED_TYPES}
                style={{ display: 'none' }}
                onChange={e => handleFileSelect(e.target.files[0])}
              />
              {form.file ? (
                <div className="drop-zone-file">
                  <FileText size={32} className="text-accent" />
                  <div>
                    <div className="drop-file-name">{form.file.name}</div>
                    <div className="drop-file-size">{formatBytes(form.file.size)}</div>
                  </div>
                  <button type="button" className="drop-file-remove"
                    onClick={e => { e.stopPropagation(); setForm(f => ({ ...f, file: null })); }}>
                    <X size={14} />
                  </button>
                </div>
              ) : (
                <>
                  <Upload size={32} className="drop-icon" />
                  <p className="drop-text">Drag & drop or <span className="drop-link">browse</span></p>
                  <p className="drop-hint">PDF, TXT, MD, DOC, Images — max 20 MB</p>
                </>
              )}
            </div>

            <div className="form-grid-2">
              <div className="form-group">
                <label htmlFor="res-title">Title *</label>
                <input id="res-title" type="text" placeholder="e.g. Data Structures Chapter 4 Notes"
                  value={form.title} onChange={e => setForm(f => ({ ...f, title: e.target.value }))} required />
              </div>
              <div className="form-group">
                <label htmlFor="res-subject">Subject *</label>
                <select id="res-subject" value={form.subject}
                  onChange={e => setForm(f => ({ ...f, subject: e.target.value }))} required>
                  <option value="">Select subject...</option>
                  {SUBJECTS.map(s => <option key={s} value={s}>{s}</option>)}
                </select>
              </div>
              <div className="form-group">
                <label htmlFor="res-topic">Topic</label>
                <input id="res-topic" type="text" placeholder="e.g. Binary Trees"
                  value={form.topic} onChange={e => setForm(f => ({ ...f, topic: e.target.value }))} />
              </div>
              <div className="form-group">
                <label htmlFor="res-desc">Description</label>
                <input id="res-desc" type="text" placeholder="Brief description of this resource..."
                  value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))} />
              </div>
            </div>

            <div className="form-actions">
              <button type="button" className="btn btn-outline" onClick={() => setShowUploadForm(false)}>Cancel</button>
              <button type="submit" className="btn btn-primary" disabled={uploading}>
                {uploading
                  ? <><Loader size={16} className="spin-icon" /> Uploading...</>
                  : <><Upload size={16} /> Upload & Share</>
                }
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Resources grid */}
      {loading ? (
        <div className="loading-state">
          <Loader size={32} className="spin-icon text-accent" />
          <p>Loading shared library...</p>
        </div>
      ) : filtered.length === 0 ? (
        <div className="empty-state-full">
          <BookOpen size={48} className="empty-icon" />
          <h3>{resources.length === 0 ? 'No resources yet' : 'No matching resources'}</h3>
          <p>
            {resources.length === 0
              ? 'Be the first to upload a resource to the shared library!'
              : 'Try adjusting your search or filter.'}
          </p>
          {resources.length === 0 && (
            <button className="btn btn-primary" onClick={() => setShowUploadForm(true)}>
              <Upload size={16} /> Upload First Resource
            </button>
          )}
        </div>
      ) : (
        <div className="resources-grid">
          {filtered.map(resource => {
            const ext = getFileExt(resource.file_name || resource.file_type || '');
            const IconComp = FILE_ICONS[ext] || File;
            const isOwner = resource.user_id === user?.id;
            return (
              <div key={resource.id} className={`resource-card ${isOwner ? 'resource-card-own' : ''}`}>
                <div className="resource-card-header">
                  <div className={`resource-type-icon type-${ext === 'pdf' ? 'pdf' : ['png','jpg','jpeg','gif','webp'].includes(ext) ? 'image' : 'doc'}`}>
                    <IconComp size={20} />
                  </div>
                  <div className="resource-meta-tags">
                    <span className="tag tag-subject">{resource.subject}</span>
                    {resource.topic && <span className="tag tag-topic">{resource.topic}</span>}
                    {isOwner
                      ? <span className="tag tag-owner"><User size={9} /> You</span>
                      : <span className="tag tag-shared"><Globe size={9} /> Shared</span>
                    }
                  </div>
                </div>

                <h4 className="resource-title">{resource.title}</h4>
                {resource.description && (
                  <p className="resource-desc">{resource.description}</p>
                )}

                <div className="resource-footer">
                  <div className="resource-info">
                    <span className="resource-info-item">
                      <Calendar size={12} />
                      {new Date(resource.created_at).toLocaleDateString()}
                    </span>
                    {resource.file_size && (
                      <span className="resource-info-item">
                        <File size={12} />
                        {formatBytes(resource.file_size)}
                      </span>
                    )}
                  </div>
                  <div className="resource-actions">
                    {resource.file_path && (
                      <a
                        href={getFileUrl(resource.file_path)}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="btn-icon-action"
                        title="View file"
                      >
                        <ExternalLink size={15} />
                      </a>
                    )}
                    {/* Only owner can delete */}
                    {isOwner && (
                      <button
                        className="btn-icon-action btn-icon-danger-soft"
                        onClick={() => handleDelete(resource)}
                        disabled={deletingId === resource.id}
                        title="Delete resource"
                      >
                        {deletingId === resource.id
                          ? <Loader size={15} className="spin-icon" />
                          : <Trash2 size={15} />
                        }
                      </button>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {!loading && resources.length > 0 && (
        <div className="results-count">
          Showing {filtered.length} of {resources.length} resources
          {viewMode === 'all' && ` · ${myCount} uploaded by you`}
        </div>
      )}
    </div>
  );
};
