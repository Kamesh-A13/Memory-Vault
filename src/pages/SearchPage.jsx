import React, { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../context/AuthContext';
import { Search, Loader, BookOpen, Info, TrendingUp, Zap, BarChart2 } from 'lucide-react';
import { fetchResources } from '../lib/dbService';
import { rankDocuments } from '../lib/algorithms/tfidf';
import { queryIndex, buildInvertedIndex } from '../lib/algorithms/invertedIndex';

export const SearchPage = () => {
  const { user } = useAuth();
  const [query, setQuery] = useState('');
  const [results, setResults] = useState([]);
  const [allDocs, setAllDocs] = useState([]);
  const [index, setIndex] = useState(null);
  const [searching, setSearching] = useState(false);
  const [loadingDocs, setLoadingDocs] = useState(true);
  const [searched, setSearched] = useState(false);
  const [mode, setMode] = useState('OR'); // AND or OR index mode

  // Load resources and build inverted index on mount
  useEffect(() => {
    const init = async () => {
      if (!user?.id) return;
      setLoadingDocs(true);
      const { data } = await fetchResources(user.id);
      const docs = (data || []).map(r => ({
        id:          r.id,
        title:       r.title,
        content:     r.description || '',
        subject:     r.subject,
        topic:       r.topic,
        description: r.description,
        file_type:   r.file_type,
        created_at:  r.created_at,
        file_path:   r.file_path,
      }));
      setAllDocs(docs);
      setIndex(buildInvertedIndex(docs));
      setLoadingDocs(false);
    };
    init();
  }, [user?.id]);

  const handleSearch = useCallback(async (e) => {
    e?.preventDefault();
    if (!query.trim() || allDocs.length === 0) return;

    setSearching(true);
    setSearched(false);

    // Simulate a small delay for UX
    await new Promise(r => setTimeout(r, 180));

    try {
      // Step 1: Inverted index to get candidate docs
      const candidateIds = queryIndex(index, query, mode);

      // Step 2: Filter allDocs to candidates (for efficiency on large sets)
      const candidates = candidateIds.size > 0
        ? allDocs.filter(d => candidateIds.has(d.id))
        : allDocs; // fall back to all if OR returns nothing meaningful

      // Step 3: Rank using TF-IDF + Cosine Similarity
      const ranked = rankDocuments(query, candidates.length > 0 ? candidates : allDocs, 20);

      setResults(ranked);
    } catch (err) {
      console.error('Search error:', err);
      setResults([]);
    } finally {
      setSearching(false);
      setSearched(true);
    }
  }, [query, allDocs, index, mode]);

  // Real-time search on query change
  useEffect(() => {
    if (!query.trim()) { setResults([]); setSearched(false); return; }
    const timeout = setTimeout(() => handleSearch(), 400);
    return () => clearTimeout(timeout);
  }, [query, handleSearch]);

  const getScoreColor = (score) => {
    if (score > 0.3) return 'score-high';
    if (score > 0.1) return 'score-med';
    return 'score-low';
  };

  const getScoreLabel = (score) => {
    if (score > 0.3) return 'Highly Relevant';
    if (score > 0.1) return 'Relevant';
    return 'Loosely Related';
  };

  return (
    <div className="page-wrapper">
      {/* Algorithm info banner */}
      <div className="algo-info-banner">
        <div className="algo-info-item">
          <Zap size={14} className="text-cyan" />
          <span><strong>Step 1:</strong> Inverted Index — find candidate documents</span>
        </div>
        <div className="algo-info-sep">→</div>
        <div className="algo-info-item">
          <BarChart2 size={14} className="text-indigo" />
          <span><strong>Step 2:</strong> TF-IDF — compute term importance weights</span>
        </div>
        <div className="algo-info-sep">→</div>
        <div className="algo-info-item">
          <TrendingUp size={14} className="text-violet" />
          <span><strong>Step 3:</strong> Cosine Similarity — rank by relevance angle</span>
        </div>
      </div>

      {/* Search bar */}
      <form onSubmit={handleSearch} className="search-form">
        <div className="search-bar-large">
          <Search size={20} className="search-bar-icon" />
          <input
            type="text"
            className="search-bar-input"
            placeholder={loadingDocs ? 'Loading resources...' : `Search across ${allDocs.length} resources...`}
            value={query}
            onChange={e => setQuery(e.target.value)}
            disabled={loadingDocs}
            autoFocus
          />
          {searching && <Loader size={18} className="spin-icon search-bar-loader" />}
        </div>

        <div className="search-options">
          <label className="search-opt-label">Index mode:</label>
          <button
            type="button"
            className={`search-mode-btn ${mode === 'OR' ? 'active' : ''}`}
            onClick={() => setMode('OR')}
          >
            OR (Recall)
          </button>
          <button
            type="button"
            className={`search-mode-btn ${mode === 'AND' ? 'active' : ''}`}
            onClick={() => setMode('AND')}
          >
            AND (Precision)
          </button>
        </div>
      </form>

      {/* Results */}
      {loadingDocs ? (
        <div className="loading-state">
          <Loader size={28} className="spin-icon text-accent" />
          <p>Building search index...</p>
        </div>
      ) : !searched && !query.trim() ? (
        <div className="search-idle-state">
          <Search size={52} className="idle-icon" />
          <h3>Search Your Academic Resources</h3>
          <p>
            Type any keyword, concept, or topic. The engine uses{' '}
            <strong>TF-IDF + Cosine Similarity</strong> to surface the most relevant resources.
          </p>
          {allDocs.length === 0 && (
            <div className="alert alert-warning" style={{ marginTop: '16px', maxWidth: '400px' }}>
              <Info size={16} />
              No resources found. Upload some academic resources first.
            </div>
          )}
        </div>
      ) : (
        <>
          {searched && (
            <div className="search-results-header">
              <span className="results-label">
                {results.length > 0
                  ? `${results.length} result${results.length !== 1 ? 's' : ''} found`
                  : 'No results found'}
                {query.trim() && <span className="query-display"> for "{query}"</span>}
              </span>
            </div>
          )}

          {results.length === 0 && searched ? (
            <div className="empty-state-full">
              <BookOpen size={44} className="empty-icon" />
              <h3>No relevant resources found</h3>
              <p>Try different keywords or upload more resources.</p>
            </div>
          ) : (
            <div className="search-results-list">
              {results.map(({ doc, score }, idx) => (
                <div key={doc.id} className="search-result-card">
                  <div className="result-rank">#{idx + 1}</div>
                  <div className="result-content">
                    <div className="result-header">
                      <h4 className="result-title">{doc.title}</h4>
                      <div className={`relevance-score ${getScoreColor(score)}`}>
                        <TrendingUp size={12} />
                        <span>{(score * 100).toFixed(1)}%</span>
                        <span className="relevance-label">{getScoreLabel(score)}</span>
                      </div>
                    </div>

                    <div className="result-tags">
                      {doc.subject && <span className="tag tag-subject">{doc.subject}</span>}
                      {doc.topic && <span className="tag tag-topic">{doc.topic}</span>}
                      {doc.file_type && <span className="tag tag-type">{doc.file_type.toUpperCase()}</span>}
                    </div>

                    {doc.description && (
                      <p className="result-desc">{doc.description}</p>
                    )}

                    {/* Score bar */}
                    <div className="score-bar-wrap">
                      <div
                        className={`score-bar ${getScoreColor(score)}`}
                        style={{ width: `${Math.min(100, score * 300)}%` }}
                      />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </>
      )}
    </div>
  );
};
