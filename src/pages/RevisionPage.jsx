import React, { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../context/AuthContext';
import {
  Brain, Plus, Trash2, Edit3, X, Loader, AlertCircle, CheckCircle,
  TrendingUp, ChevronDown, ChevronUp, Save, RefreshCw, Zap, Info
} from 'lucide-react';
import {
  fetchRevisionItems, createRevisionItem, updateRevisionItem, deleteRevisionItem
} from '../lib/dbService';
import { MaxHeap, calculateRevisionPriority } from '../lib/algorithms/maxHeap';

const DIFFICULTY_OPTIONS = [
  { label: 'Easy',   value: 25 },
  { label: 'Medium', value: 50 },
  { label: 'Hard',   value: 75 },
  { label: 'Expert', value: 100 },
];

const SUBJECTS = [
  'Mathematics', 'Physics', 'Chemistry', 'Biology', 'Computer Science',
  'Data Structures', 'Algorithms', 'Operating Systems', 'Database Systems',
  'Computer Networks', 'Other'
];

function getPriorityColor(score) {
  if (score >= 80) return 'priority-critical';
  if (score >= 60) return 'priority-high';
  if (score >= 40) return 'priority-medium';
  return 'priority-low';
}

function getPriorityLabel(score) {
  if (score >= 80) return 'Critical';
  if (score >= 60) return 'High';
  if (score >= 40) return 'Medium';
  return 'Low';
}

const DEFAULT_FORM = {
  topic: '', question: '', subject: '', difficulty: 50,
  importance: 50, frequency: 50, last_revised_at: '',
};

export const RevisionPage = () => {
  const { user } = useAuth();
  const [items, setItems] = useState([]);
  const [ranked, setRanked] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editId, setEditId] = useState(null);
  const [form, setForm] = useState(DEFAULT_FORM);
  const [saving, setSaving] = useState(false);
  const [deletingId, setDeletingId] = useState(null);
  const [toast, setToast] = useState(null);
  const [expandedId, setExpandedId] = useState(null);

  const showToast = (msg, type = 'success') => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3000);
  };

  const loadItems = useCallback(async () => {
    if (!user?.id) return;
    setLoading(true);
    const { data } = await fetchRevisionItems(user.id);
    const fetched = data || [];
    setItems(fetched);

    // Apply Max Heap priority ordering
    const heap = new MaxHeap();
    const withPriority = fetched.map(item => ({
      ...item,
      priority: calculateRevisionPriority(item),
    }));
    heap.buildFrom(withPriority);
    setRanked(heap.toSortedArray());
    setLoading(false);
  }, [user?.id]);

  useEffect(() => { loadItems(); }, [loadItems]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.topic.trim() || !form.subject) {
      showToast('Topic and subject are required.', 'error');
      return;
    }
    setSaving(true);
    try {
      const payload = {
        user_id:         user.id,
        topic:           form.topic.trim(),
        question:        form.question.trim() || null,
        subject:         form.subject,
        difficulty:      form.difficulty,
        importance:      form.importance,
        frequency:       form.frequency,
        last_revised_at: form.last_revised_at || null,
      };

      if (editId) {
        const { error } = await updateRevisionItem(editId, payload);
        if (error) throw error;
        showToast('Revision item updated!');
      } else {
        const { error } = await createRevisionItem(payload);
        if (error) throw error;
        showToast('Revision item added!');
      }

      setForm(DEFAULT_FORM);
      setShowForm(false);
      setEditId(null);
      loadItems();
    } catch (err) {
      showToast(err.message || 'Failed to save.', 'error');
    } finally {
      setSaving(false);
    }
  };

  const handleEdit = (item) => {
    setEditId(item.id);
    setForm({
      topic:          item.topic || '',
      question:       item.question || '',
      subject:        item.subject || '',
      difficulty:     item.difficulty || 50,
      importance:     item.importance || 50,
      frequency:      item.frequency || 50,
      last_revised_at:item.last_revised_at ? item.last_revised_at.split('T')[0] : '',
    });
    setShowForm(true);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this revision item?')) return;
    setDeletingId(id);
    await deleteRevisionItem(id);
    setDeletingId(null);
    showToast('Revision item deleted.');
    loadItems();
  };

  const handleMarkRevised = async (item) => {
    await updateRevisionItem(item.id, { last_revised_at: new Date().toISOString() });
    showToast('Marked as revised today!');
    loadItems();
  };

  return (
    <div className="page-wrapper">
      {toast && (
        <div className={`toast toast-${toast.type}`}>
          {toast.type === 'success' ? <CheckCircle size={16} /> : <AlertCircle size={16} />}
          {toast.msg}
        </div>
      )}

      {/* Algorithm info */}
      <div className="algo-info-banner">
        <Zap size={14} className="text-violet" />
        <span>
          <strong>Max Heap Priority Queue</strong> — Items with highest priority score surfaced first.
          Priority = 0.35×importance + 0.25×difficulty + 0.25×frequency + 0.15×recency.{' '}
          Insert/Extract: <code>O(log n)</code>. Build: <code>O(n)</code>.
        </span>
        <button className="btn btn-primary btn-sm" onClick={() => { setShowForm(!showForm); setEditId(null); setForm(DEFAULT_FORM); }}>
          {showForm ? <X size={15} /> : <Plus size={15} />}
          {showForm ? 'Cancel' : 'Add Item'}
        </button>
      </div>

      {/* Form */}
      {showForm && (
        <div className="revision-form-card">
          <h3 className="form-card-title">
            {editId ? <><Edit3 size={17} /> Edit Revision Item</> : <><Plus size={17} /> New Revision Item</>}
          </h3>
          <form onSubmit={handleSubmit} className="revision-form">
            <div className="form-grid-2">
              <div className="form-group" style={{ gridColumn: '1 / -1' }}>
                <label htmlFor="rev-topic">Topic *</label>
                <input
                  id="rev-topic"
                  type="text"
                  placeholder="e.g. AVL Trees, Dijkstra's Algorithm"
                  value={form.topic}
                  onChange={e => setForm(f => ({ ...f, topic: e.target.value }))}
                  required
                />
              </div>
              <div className="form-group">
                <label htmlFor="rev-subject">Subject *</label>
                <select
                  id="rev-subject"
                  value={form.subject}
                  onChange={e => setForm(f => ({ ...f, subject: e.target.value }))}
                  required
                >
                  <option value="">Select subject...</option>
                  {SUBJECTS.map(s => <option key={s} value={s}>{s}</option>)}
                </select>
              </div>
              <div className="form-group">
                <label htmlFor="rev-last">Last Revised Date</label>
                <input
                  id="rev-last"
                  type="date"
                  value={form.last_revised_at}
                  onChange={e => setForm(f => ({ ...f, last_revised_at: e.target.value }))}
                  max={new Date().toISOString().split('T')[0]}
                />
              </div>
              <div className="form-group" style={{ gridColumn: '1 / -1' }}>
                <label htmlFor="rev-question">Question / Notes (optional)</label>
                <input
                  id="rev-question"
                  type="text"
                  placeholder="A specific question or note about this topic..."
                  value={form.question}
                  onChange={e => setForm(f => ({ ...f, question: e.target.value }))}
                />
              </div>
            </div>

            {/* Sliders */}
            <div className="sliders-section">
              <div className="slider-group">
                <div className="slider-header">
                  <label>Importance (exam relevance)</label>
                  <span className="slider-val">{form.importance}</span>
                </div>
                <input type="range" min="0" max="100" step="5"
                  value={form.importance}
                  onChange={e => setForm(f => ({ ...f, importance: +e.target.value }))}
                  className="slider slider-indigo"
                />
                <div className="slider-labels"><span>Low</span><span>High</span></div>
              </div>

              <div className="slider-group">
                <div className="slider-header">
                  <label>Difficulty</label>
                  <span className="slider-val">{form.difficulty}</span>
                </div>
                <input type="range" min="0" max="100" step="5"
                  value={form.difficulty}
                  onChange={e => setForm(f => ({ ...f, difficulty: +e.target.value }))}
                  className="slider slider-violet"
                />
                <div className="slider-labels"><span>Easy</span><span>Expert</span></div>
              </div>

              <div className="slider-group">
                <div className="slider-header">
                  <label>Frequency (how often asked)</label>
                  <span className="slider-val">{form.frequency}</span>
                </div>
                <input type="range" min="0" max="100" step="5"
                  value={form.frequency}
                  onChange={e => setForm(f => ({ ...f, frequency: +e.target.value }))}
                  className="slider slider-cyan"
                />
                <div className="slider-labels"><span>Rare</span><span>Very frequent</span></div>
              </div>

              {/* Live priority preview */}
              <div className="priority-preview">
                <span className="priority-preview-label">Estimated Priority Score:</span>
                <span className={`priority-score-badge ${getPriorityColor(calculateRevisionPriority(form))}`}>
                  {calculateRevisionPriority(form)} — {getPriorityLabel(calculateRevisionPriority(form))}
                </span>
              </div>
            </div>

            <div className="form-actions">
              <button type="button" className="btn btn-outline" onClick={() => { setShowForm(false); setEditId(null); }}>
                Cancel
              </button>
              <button type="submit" className="btn btn-primary" disabled={saving}>
                {saving ? <><Loader size={15} className="spin-icon" /> Saving...</> : <><Save size={15} /> Save Item</>}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Prioritized list */}
      {loading ? (
        <div className="loading-state">
          <Loader size={28} className="spin-icon text-accent" />
          <p>Building priority heap...</p>
        </div>
      ) : ranked.length === 0 ? (
        <div className="empty-state-full">
          <Brain size={48} className="empty-icon" />
          <h3>No revision items yet</h3>
          <p>Add topics you need to revise. The Max Heap will surface the most urgent ones first.</p>
          <button className="btn btn-primary" onClick={() => setShowForm(true)}>
            <Plus size={16} /> Add First Item
          </button>
        </div>
      ) : (
        <>
          <div className="revision-summary">
            <span className="revision-count">{ranked.length} items in your revision queue</span>
            <span className="revision-top-hint">
              🎯 Top priority: <strong>{ranked[0]?.topic}</strong>
            </span>
          </div>

          <div className="revision-list">
            {ranked.map((item, idx) => {
              const isExpanded = expandedId === item.id;
              const pc = getPriorityColor(item.priority);
              return (
                <div key={item.id} className={`revision-item ${pc}`}>
                  <div className="revision-item-header">
                    <div className="revision-item-left">
                      <div className={`revision-rank ${pc}`}>#{idx + 1}</div>
                      <div>
                        <div className="revision-topic">{item.topic}</div>
                        <div className="revision-meta">
                          <span className="tag tag-subject">{item.subject}</span>
                          {item.last_revised_at && (
                            <span className="revision-last">
                              Last: {new Date(item.last_revised_at).toLocaleDateString()}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                    <div className="revision-item-right">
                      <div className={`priority-badge ${pc}`}>
                        <TrendingUp size={12} />
                        {item.priority}
                        <span className="priority-text">{getPriorityLabel(item.priority)}</span>
                      </div>
                      <div className="revision-item-actions">
                        <button
                          className="btn-icon-action"
                          onClick={() => setExpandedId(isExpanded ? null : item.id)}
                          title="Details"
                        >
                          {isExpanded ? <ChevronUp size={15} /> : <ChevronDown size={15} />}
                        </button>
                        <button className="btn-icon-action" onClick={() => handleEdit(item)} title="Edit">
                          <Edit3 size={15} />
                        </button>
                        <button className="btn-icon-action text-emerald" onClick={() => handleMarkRevised(item)} title="Mark revised today">
                          <RefreshCw size={15} />
                        </button>
                        <button
                          className="btn-icon-action btn-icon-danger-soft"
                          onClick={() => handleDelete(item.id)}
                          disabled={deletingId === item.id}
                          title="Delete"
                        >
                          {deletingId === item.id ? <Loader size={15} className="spin-icon" /> : <Trash2 size={15} />}
                        </button>
                      </div>
                    </div>
                  </div>

                  {/* Expanded details */}
                  {isExpanded && (
                    <div className="revision-details">
                      {item.question && (
                        <div className="revision-question">
                          <Info size={14} />
                          <span>{item.question}</span>
                        </div>
                      )}
                      <div className="revision-scores-row">
                        <div className="score-item">
                          <span className="score-item-label">Importance</span>
                          <div className="mini-bar-wrap">
                            <div className="mini-bar mini-bar-indigo" style={{ width: `${item.importance}%` }} />
                          </div>
                          <span className="score-item-val">{item.importance}</span>
                        </div>
                        <div className="score-item">
                          <span className="score-item-label">Difficulty</span>
                          <div className="mini-bar-wrap">
                            <div className="mini-bar mini-bar-violet" style={{ width: `${item.difficulty}%` }} />
                          </div>
                          <span className="score-item-val">{item.difficulty}</span>
                        </div>
                        <div className="score-item">
                          <span className="score-item-label">Frequency</span>
                          <div className="mini-bar-wrap">
                            <div className="mini-bar mini-bar-cyan" style={{ width: `${item.frequency}%` }} />
                          </div>
                          <span className="score-item-val">{item.frequency}</span>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Priority bar */}
                  <div className={`priority-bar-full priority-bar-${pc}`}>
                    <div
                      className={`priority-bar-fill fill-${pc}`}
                      style={{ width: `${item.priority}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </>
      )}
    </div>
  );
};
