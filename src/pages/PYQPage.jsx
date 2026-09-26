import React, { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../context/AuthContext';
import {
  FileQuestion, Plus, Trash2, Edit3, X, Loader, AlertCircle, CheckCircle,
  TrendingUp, BarChart2, Save, Info, BookOpen, Star, Calendar
} from 'lucide-react';
import { fetchPYQs, createPYQ, updatePYQ, deletePYQ } from '../lib/dbService';
import { rankPYQs, rankTopics } from '../lib/algorithms/weightedRanking';

const SUBJECTS = [
  'Mathematics', 'Physics', 'Chemistry', 'Biology', 'Computer Science',
  'Data Structures', 'Algorithms', 'Operating Systems', 'Database Systems',
  'Computer Networks', 'Software Engineering', 'Other'
];

const DIFFICULTY_LABELS = { 25: 'Easy', 50: 'Medium', 75: 'Hard', 100: 'Expert' };

const DEFAULT_FORM = {
  question: '', subject: '', topic: '', year: new Date().getFullYear(),
  marks: 5, difficulty: 50, frequency: 1,
};

const CURRENT_YEAR = new Date().getFullYear();
const YEARS = Array.from({ length: 12 }, (_, i) => CURRENT_YEAR - i);

function getScoreColor(score) {
  if (score >= 75) return 'score-critical';
  if (score >= 50) return 'score-high';
  if (score >= 25) return 'score-medium';
  return 'score-low';
}

export const PYQPage = () => {
  const { user } = useAuth();
  const [pyqs, setPyqs] = useState([]);
  const [rankedPYQs, setRankedPYQs] = useState([]);
  const [rankedTopics, setRankedTopics] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editId, setEditId] = useState(null);
  const [form, setForm] = useState(DEFAULT_FORM);
  const [saving, setSaving] = useState(false);
  const [deletingId, setDeletingId] = useState(null);
  const [toast, setToast] = useState(null);
  const [view, setView] = useState('questions'); // 'questions' | 'topics'
  const [filterSubject, setFilterSubject] = useState('');

  const showToast = (msg, type = 'success') => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3000);
  };

  const loadAndRank = useCallback(async () => {
    if (!user?.id) return;
    setLoading(true);
    const { data } = await fetchPYQs(user.id);
    const fetched = data || [];
    setPyqs(fetched);
    setRankedPYQs(rankPYQs(fetched));
    setRankedTopics(rankTopics(fetched));
    setLoading(false);
  }, [user?.id]);

  useEffect(() => { loadAndRank(); }, [loadAndRank]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.question.trim() || !form.subject) {
      showToast('Question and subject are required.', 'error');
      return;
    }
    setSaving(true);
    try {
      const payload = {
        user_id:    user.id,
        question:   form.question.trim(),
        subject:    form.subject,
        topic:      form.topic.trim() || null,
        year:       +form.year,
        marks:      +form.marks,
        difficulty: +form.difficulty,
        frequency:  +form.frequency,
      };
      const fn = editId ? updatePYQ(editId, payload) : createPYQ(payload);
      const { error } = await fn;
      if (error) throw error;
      showToast(editId ? 'PYQ updated!' : 'PYQ added!');
      setForm(DEFAULT_FORM);
      setShowForm(false);
      setEditId(null);
      loadAndRank();
    } catch (err) {
      showToast(err.message || 'Failed to save.', 'error');
    } finally {
      setSaving(false);
    }
  };

  const handleEdit = (pyq) => {
    setEditId(pyq.id);
    setForm({
      question:   pyq.question || '',
      subject:    pyq.subject || '',
      topic:      pyq.topic || '',
      year:       pyq.year || CURRENT_YEAR,
      marks:      pyq.marks || 5,
      difficulty: pyq.difficulty || 50,
      frequency:  pyq.frequency || 1,
    });
    setShowForm(true);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this PYQ?')) return;
    setDeletingId(id);
    await deletePYQ(id);
    setDeletingId(null);
    showToast('PYQ deleted.');
    loadAndRank();
  };

  const filteredPYQs = filterSubject
    ? rankedPYQs.filter(r => r.pyq.subject === filterSubject)
    : rankedPYQs;

  const filteredTopics = filterSubject
    ? rankedTopics.filter(t => {
        const subjectMatches = pyqs.some(q => q.topic === t.topic && q.subject === filterSubject);
        return subjectMatches;
      })
    : rankedTopics;

  const subjects = [...new Set(pyqs.map(p => p.subject).filter(Boolean))];

  return (
    <div className="page-wrapper">
      {toast && (
        <div className={`toast toast-${toast.type}`}>
          {toast.type === 'success' ? <CheckCircle size={16} /> : <AlertCircle size={16} />}
          {toast.msg}
        </div>
      )}

      {/* Disclaimer */}
      <div className="disclaimer-banner">
        <Info size={14} />
        <span>
          Rankings are <strong>analytical aids only</strong> — not guaranteed exam predictions.
          Based on frequency, recency, marks, and difficulty factors.
        </span>
      </div>

      {/* Toolbar */}
      <div className="toolbar">
        <div className="toolbar-left">
          <div className="view-toggle">
            <button
              className={`view-btn ${view === 'questions' ? 'active' : ''}`}
              onClick={() => setView('questions')}
            >
              <FileQuestion size={15} /> Questions
            </button>
            <button
              className={`view-btn ${view === 'topics' ? 'active' : ''}`}
              onClick={() => setView('topics')}
            >
              <BarChart2 size={15} /> Topic Analysis
            </button>
          </div>
          {subjects.length > 0 && (
            <select
              className="filter-select"
              value={filterSubject}
              onChange={e => setFilterSubject(e.target.value)}
            >
              <option value="">All Subjects</option>
              {subjects.map(s => <option key={s} value={s}>{s}</option>)}
            </select>
          )}
        </div>
        <button className="btn btn-primary" onClick={() => { setShowForm(!showForm); setEditId(null); setForm(DEFAULT_FORM); }}>
          {showForm ? <X size={16} /> : <Plus size={16} />}
          {showForm ? 'Cancel' : 'Add PYQ'}
        </button>
      </div>

      {/* PYQ Form */}
      {showForm && (
        <div className="revision-form-card">
          <h3 className="form-card-title">
            {editId ? <><Edit3 size={17} /> Edit PYQ</> : <><Plus size={17} /> Add Previous-Year Question</>}
          </h3>
          <form onSubmit={handleSubmit} className="revision-form">
            <div className="form-group" style={{ gridColumn: '1 / -1' }}>
              <label htmlFor="pyq-question">Question *</label>
              <textarea
                id="pyq-question"
                rows="3"
                placeholder="Enter the previous-year question..."
                value={form.question}
                onChange={e => setForm(f => ({ ...f, question: e.target.value }))}
                required
                style={{ resize: 'vertical' }}
              />
            </div>
            <div className="form-grid-2">
              <div className="form-group">
                <label htmlFor="pyq-subject">Subject *</label>
                <select
                  id="pyq-subject"
                  value={form.subject}
                  onChange={e => setForm(f => ({ ...f, subject: e.target.value }))}
                  required
                >
                  <option value="">Select subject...</option>
                  {SUBJECTS.map(s => <option key={s} value={s}>{s}</option>)}
                </select>
              </div>
              <div className="form-group">
                <label htmlFor="pyq-topic">Topic</label>
                <input
                  id="pyq-topic"
                  type="text"
                  placeholder="e.g. Sorting, Graphs"
                  value={form.topic}
                  onChange={e => setForm(f => ({ ...f, topic: e.target.value }))}
                />
              </div>
              <div className="form-group">
                <label htmlFor="pyq-year">Year</label>
                <select
                  id="pyq-year"
                  value={form.year}
                  onChange={e => setForm(f => ({ ...f, year: +e.target.value }))}
                >
                  {YEARS.map(y => <option key={y} value={y}>{y}</option>)}
                </select>
              </div>
              <div className="form-group">
                <label htmlFor="pyq-marks">Marks</label>
                <input
                  id="pyq-marks"
                  type="number"
                  min="1"
                  max="100"
                  value={form.marks}
                  onChange={e => setForm(f => ({ ...f, marks: +e.target.value }))}
                />
              </div>
              <div className="form-group">
                <label htmlFor="pyq-freq">Frequency (times appeared)</label>
                <input
                  id="pyq-freq"
                  type="number"
                  min="1"
                  max="20"
                  value={form.frequency}
                  onChange={e => setForm(f => ({ ...f, frequency: +e.target.value }))}
                />
              </div>
              <div className="form-group">
                <label>Difficulty</label>
                <div className="difficulty-btns">
                  {DIFFICULTY_OPTIONS.map(opt => (
                    <button
                      key={opt.value}
                      type="button"
                      className={`diff-btn ${form.difficulty === opt.value ? 'active' : ''}`}
                      onClick={() => setForm(f => ({ ...f, difficulty: opt.value }))}
                    >
                      {opt.label}
                    </button>
                  ))}
                </div>
              </div>
            </div>
            <div className="form-actions">
              <button type="button" className="btn btn-outline" onClick={() => { setShowForm(false); setEditId(null); }}>
                Cancel
              </button>
              <button type="submit" className="btn btn-primary" disabled={saving}>
                {saving ? <><Loader size={15} className="spin-icon" /> Saving...</> : <><Save size={15} /> Save PYQ</>}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Content */}
      {loading ? (
        <div className="loading-state">
          <Loader size={28} className="spin-icon text-accent" />
          <p>Analyzing PYQs...</p>
        </div>
      ) : pyqs.length === 0 ? (
        <div className="empty-state-full">
          <FileQuestion size={48} className="empty-icon" />
          <h3>No PYQs added yet</h3>
          <p>Add previous-year questions to analyze patterns and find high-frequency topics.</p>
          <button className="btn btn-primary" onClick={() => setShowForm(true)}>
            <Plus size={16} /> Add First PYQ
          </button>
        </div>
      ) : view === 'questions' ? (
        <div className="pyq-list">
          <div className="pyq-list-header">
            <span className="results-label">{filteredPYQs.length} questions ranked by importance</span>
          </div>
          {filteredPYQs.map(({ pyq, score }, idx) => {
            const sc = getScoreColor(score);
            return (
              <div key={pyq.id} className={`pyq-card ${sc}`}>
                <div className="pyq-card-header">
                  <div className="pyq-rank-badge">
                    <Star size={12} />
                    #{idx + 1}
                  </div>
                  <div className="pyq-meta-tags">
                    <span className="tag tag-subject">{pyq.subject}</span>
                    {pyq.topic && <span className="tag tag-topic">{pyq.topic}</span>}
                    <span className="tag tag-year">
                      <Calendar size={10} /> {pyq.year}
                    </span>
                  </div>
                  <div className={`pyq-score ${sc}`}>
                    <TrendingUp size={13} />
                    Score: {score}
                  </div>
                </div>

                <p className="pyq-question-text">{pyq.question}</p>

                <div className="pyq-card-footer">
                  <div className="pyq-stats">
                    <span className="pyq-stat"><strong>{pyq.marks}</strong> marks</span>
                    <span className="pyq-stat"><strong>{pyq.frequency}×</strong> appeared</span>
                    <span className="pyq-stat">{DIFFICULTY_LABELS[pyq.difficulty] || 'Medium'}</span>
                  </div>
                  <div className="revision-item-actions">
                    <button className="btn-icon-action" onClick={() => handleEdit(pyq)} title="Edit">
                      <Edit3 size={15} />
                    </button>
                    <button
                      className="btn-icon-action btn-icon-danger-soft"
                      onClick={() => handleDelete(pyq.id)}
                      disabled={deletingId === pyq.id}
                    >
                      {deletingId === pyq.id ? <Loader size={15} className="spin-icon" /> : <Trash2 size={15} />}
                    </button>
                  </div>
                </div>

                <div className={`score-bar-full`}>
                  <div className={`score-bar-fill fill-${sc}`} style={{ width: `${score}%` }} />
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        /* Topic Analysis View */
        <div className="topic-analysis">
          <div className="topic-grid">
            {filteredTopics.map((t, idx) => {
              const sc = getScoreColor(t.avgScore);
              return (
                <div key={t.topic} className={`topic-card ${sc}`}>
                  <div className="topic-card-header">
                    <span className={`topic-rank ${sc}`}>#{idx + 1}</span>
                    <h4 className="topic-name">{t.topic}</h4>
                    <span className={`topic-score-badge ${sc}`}>{t.avgScore}</span>
                  </div>
                  <div className="topic-stats">
                    <div className="topic-stat">
                      <BarChart2 size={13} className="text-cyan" />
                      <span>{t.frequency}× total appearances</span>
                    </div>
                    <div className="topic-stat">
                      <FileQuestion size={13} className="text-amber" />
                      <span>{t.count} question{t.count !== 1 ? 's' : ''}</span>
                    </div>
                    <div className="topic-stat">
                      <Calendar size={13} className="text-violet" />
                      <span>Years: {t.years.slice(0, 4).join(', ')}{t.years.length > 4 ? '...' : ''}</span>
                    </div>
                  </div>
                  <div className="topic-score-bar">
                    <div className={`topic-score-fill fill-${sc}`} style={{ width: `${t.avgScore}%` }} />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};

const DIFFICULTY_OPTIONS = [
  { label: 'Easy', value: 25 },
  { label: 'Medium', value: 50 },
  { label: 'Hard', value: 75 },
  { label: 'Expert', value: 100 },
];
