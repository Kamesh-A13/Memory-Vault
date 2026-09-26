import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import {
  Sparkles, FileText, HelpCircle, BookOpen, Loader, AlertCircle,
  Copy, Check, ChevronDown, Zap, RefreshCw, Brain
} from 'lucide-react';
import { fetchResources } from '../lib/dbService';
import { generateSummary, generateQuestions, explainConcept } from '../lib/aiService';

const AI_TOOLS = [
  {
    id: 'summarize',
    icon: FileText,
    color: 'cyan',
    title: 'Summarize Content',
    desc: 'Generate a structured academic summary from your resource text or notes.',
    placeholder: 'Paste your notes or academic content here to summarize...',
  },
  {
    id: 'questions',
    icon: HelpCircle,
    color: 'amber',
    title: 'Generate Practice Questions',
    desc: 'Create MCQs, short-answer, or descriptive questions from your material.',
    placeholder: 'Paste content to generate practice questions from...',
  },
  {
    id: 'explain',
    icon: BookOpen,
    color: 'violet',
    title: 'Explain a Concept',
    desc: 'Get a clear, structured explanation of any academic concept.',
    placeholder: 'Describe the concept you want explained (or paste relevant content)...',
  },
];

const QUESTION_TYPES = [
  { value: 'mixed',       label: 'Mixed (MCQ + Short + Descriptive)' },
  { value: 'mcq',         label: 'Multiple Choice (MCQ)' },
  { value: 'short',       label: 'Short Answer' },
  { value: 'descriptive', label: 'Descriptive / Essay' },
];

function MarkdownRenderer({ text }) {
  if (!text) return null;
  const html = text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
    .replace(/\*(.+?)\*/g, '<em>$1</em>')
    .replace(/`([^`]+)`/g, '<code>$1</code>')
    .replace(/^### (.+)$/gm, '<h4>$1</h4>')
    .replace(/^## (.+)$/gm, '<h3>$1</h3>')
    .replace(/^# (.+)$/gm, '<h2>$1</h2>')
    .replace(/^[-*] (.+)$/gm, '<li>$1</li>')
    .replace(/(<li>[\s\S]*?<\/li>)/g, '<ul>$1</ul>')
    .replace(/^\d+\. (.+)$/gm, '<li>$1</li>')
    .replace(/\n\n+/g, '</p><p>')
    .replace(/\n/g, '<br/>');

  return (
    <div
      className="ai-markdown"
      dangerouslySetInnerHTML={{ __html: `<p>${html}</p>` }}
    />
  );
}

export const AIToolsPage = () => {
  const { user } = useAuth();
  const [activeTool, setActiveTool] = useState('summarize');
  const [content, setContent] = useState('');
  const [conceptQuery, setConceptQuery] = useState('');
  const [qType, setQType] = useState('mixed');
  const [qCount, setQCount] = useState(5);
  const [subject, setSubject] = useState('');
  const [resources, setResources] = useState([]);
  const [selectedResource, setSelectedResource] = useState('');
  const [result, setResult] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [copied, setCopied] = useState(false);

  // Check if z.ai key is available (VITE_ prefix required)
  const hasApiKey = !!import.meta.env.VITE_GEMINI_API_KEY;

  // Load user resources for the resource picker
  useEffect(() => {
    const load = async () => {
      if (!user?.id) return;
      try {
        const { data } = await fetchResources(user.id);
        setResources(data || []);
      } catch (e) {
        console.error('Failed to load resources:', e);
      }
    };
    load();
  }, [user?.id]);

  // Reset output when switching tools
  useEffect(() => {
    setResult('');
    setError('');
  }, [activeTool]);

  const handleRun = async () => {
    setError('');
    setResult('');

    const inputContent = content.trim();

    if (activeTool === 'explain' && !conceptQuery.trim()) {
      setError('Please enter a concept to explain.');
      return;
    }
    if (activeTool !== 'explain' && !inputContent) {
      setError('Please enter some academic content or select a resource below.');
      return;
    }

    setLoading(true);
    try {
      let output = '';
      if (activeTool === 'summarize') {
        output = await generateSummary(inputContent, subject);
      } else if (activeTool === 'questions') {
        output = await generateQuestions(inputContent, qType, qCount);
      } else if (activeTool === 'explain') {
        output = await explainConcept(conceptQuery.trim(), inputContent);
      }
      setResult(output);
    } catch (err) {
      setError(err.message || 'AI request failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(result).catch(() => {});
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleResourceSelect = (e) => {
    const id = e.target.value;
    setSelectedResource(id);
    if (!id) return;
    const res = resources.find(r => r.id === id);
    if (res) {
      const text = [
        res.title && `Title: ${res.title}`,
        res.subject && `Subject: ${res.subject}`,
        res.topic && `Topic: ${res.topic}`,
        res.description && `\n${res.description}`,
      ].filter(Boolean).join('\n');
      setContent(text);
      setSubject(res.subject || '');
    }
  };

  const currentTool = AI_TOOLS.find(t => t.id === activeTool) || AI_TOOLS[0];
  const Icon = currentTool.icon;

  return (
    <div className="page-wrapper">
      {/* API key missing warning */}
      {!hasApiKey && (
        <div className="alert alert-warning">
          <AlertCircle size={16} />
          <div>
            <strong>Gemini API key not configured.</strong> Add{' '}
            <code>VITE_GEMINI_API_KEY=your_key</code> to <code>.env.local</code>, then restart the dev server.
            Get a free key at{' '}
            <a href="https://aistudio.google.com/app/apikey" target="_blank" rel="noreferrer" className="link-text">
              Google AI Studio
            </a>.
          </div>
        </div>
      )}

      {/* AI principle banner */}
      <div className="algo-info-banner ai-banner">
        <Zap size={14} className="text-rose" />
        <span>
          <strong>AI Second Principle —</strong> Core algorithms run independently of AI.
          Powered by <strong>Gemini 3.8 Flash</strong> · All AI content is clearly marked · Verify with official sources.
        </span>
      </div>

      <div className="ai-layout">
        {/* Tool selector sidebar */}
        <div className="ai-tool-selector">
          {AI_TOOLS.map(tool => {
            const TIcon = tool.icon;
            const isActive = activeTool === tool.id;
            return (
              <button
                key={tool.id}
                className={`ai-tool-btn ${isActive ? `ai-tool-active-${tool.color}` : ''}`}
                onClick={() => setActiveTool(tool.id)}
              >
                <TIcon
                  size={20}
                  className={`ai-tool-icon ${isActive ? `text-${tool.color}` : ''}`}
                />
                <div className="ai-tool-text">
                  <span className="ai-tool-name">{tool.title}</span>
                  <span className="ai-tool-desc">{tool.desc}</span>
                </div>
              </button>
            );
          })}
        </div>

        {/* Main panel */}
        <div className="ai-main-panel">
          {/* Panel header */}
          <div className="ai-panel-header">
            <div className={`ai-panel-icon icon-${currentTool.color}`}>
              <Icon size={20} />
            </div>
            <div>
              <h3 className="ai-panel-title">{currentTool.title}</h3>
              <p className="ai-panel-desc">{currentTool.desc}</p>
            </div>
          </div>

          {/* Resource picker (only for summarize + questions) */}
          {resources.length > 0 && activeTool !== 'explain' && (
            <div className="resource-picker-wrap">
              <ChevronDown size={14} />
              <select
                className="resource-picker"
                value={selectedResource}
                onChange={handleResourceSelect}
              >
                <option value="">Load from a saved resource (optional)...</option>
                {resources.map(r => (
                  <option key={r.id} value={r.id}>
                    {r.title}{r.subject ? ` — ${r.subject}` : ''}
                  </option>
                ))}
              </select>
            </div>
          )}

          {/* Concept input (explain only) */}
          {activeTool === 'explain' && (
            <div className="form-group">
              <label htmlFor="concept-query">Concept to Explain *</label>
              <input
                id="concept-query"
                type="text"
                placeholder="e.g. Dynamic Programming, Binary Search Trees, Newton's Laws..."
                value={conceptQuery}
                onChange={e => setConceptQuery(e.target.value)}
                className="concept-input"
              />
            </div>
          )}

          {/* Question options (questions only) */}
          {activeTool === 'questions' && (
            <div className="question-options">
              <div className="form-group">
                <label>Question Type</label>
                <select
                  value={qType}
                  onChange={e => setQType(e.target.value)}
                  className="filter-select"
                >
                  {QUESTION_TYPES.map(t => (
                    <option key={t.value} value={t.value}>{t.label}</option>
                  ))}
                </select>
              </div>
              <div className="form-group">
                <label>Number of Questions: <strong>{qCount}</strong></label>
                <div className="num-input-wrap">
                  <input
                    type="range" min="3" max="15" step="1"
                    value={qCount}
                    onChange={e => setQCount(+e.target.value)}
                    className="slider slider-amber"
                  />
                  <span className="slider-val">{qCount}</span>
                </div>
              </div>
            </div>
          )}

          {/* Content textarea */}
          <div className="form-group">
            <label htmlFor="ai-content">
              {activeTool === 'explain'
                ? 'Context / Reference Material (optional)'
                : 'Academic Content *'}
            </label>
            <textarea
              id="ai-content"
              rows="8"
              placeholder={currentTool.placeholder}
              value={content}
              onChange={e => setContent(e.target.value)}
              className="ai-textarea"
              maxLength={8000}
            />
            <span className="char-count">{content.length} / 8000</span>
          </div>

          {/* Error alert */}
          {error && (
            <div className="alert alert-error">
              <AlertCircle size={16} /> {error}
            </div>
          )}

          {/* Generate button */}
          <button
            className="btn btn-primary btn-run-ai"
            onClick={handleRun}
            disabled={loading || !hasApiKey}
          >
            {loading
              ? <><Loader size={16} className="spin-icon" /> Generating with Gemini...</>
              : <><Sparkles size={16} /> Generate with Gemini 3.8 Flash</>
            }
          </button>

          {/* Result */}
          {result && (
            <div className="ai-result-card">
              <div className="ai-result-header">
                <div className="ai-generated-badge">
                  <Brain size={12} />
                  AI-Generated · Z.AI GLM-5.3 · Verify with official sources
                </div>
                <div className="ai-result-actions">
                  <button className="btn btn-outline btn-sm" onClick={() => setResult('')}>
                    <RefreshCw size={13} /> Clear
                  </button>
                  <button className="btn btn-outline btn-sm" onClick={handleCopy}>
                    {copied
                      ? <><Check size={13} /> Copied!</>
                      : <><Copy size={13} /> Copy</>
                    }
                  </button>
                </div>
              </div>
              <div className="ai-result-content">
                <MarkdownRenderer text={result} />
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
