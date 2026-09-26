import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { Target, Search, Loader, BookOpen, Info, Code2, Zap, Hash } from 'lucide-react';
import { fetchResources } from '../lib/dbService';
import { kmpSearchDocuments, buildFailureFunction } from '../lib/algorithms/kmp';

export const ExactSearchPage = () => {
  const { user } = useAuth();
  const [pattern, setPattern] = useState('');
  const [results, setResults] = useState([]);
  const [allDocs, setAllDocs] = useState([]);
  const [loadingDocs, setLoadingDocs] = useState(true);
  const [searching, setSearching] = useState(false);
  const [searched, setSearched] = useState(false);
  const [showAlgoViz, setShowAlgoViz] = useState(false);
  const [failureTable, setFailureTable] = useState([]);

  useEffect(() => {
    const init = async () => {
      if (!user?.id) return;
      setLoadingDocs(true);
      const { data } = await fetchResources(user.id);
      setAllDocs((data || []).map(r => ({
        id:      r.id,
        title:   r.title,
        content: `${r.title}\n${r.description || ''}\n${r.topic || ''}`,
        subject: r.subject,
        topic:   r.topic,
      })));
      setLoadingDocs(false);
    };
    init();
  }, [user?.id]);

  // Build failure function visualization when pattern changes
  useEffect(() => {
    if (pattern.length >= 2) {
      setFailureTable(buildFailureFunction(pattern.toLowerCase()));
    } else {
      setFailureTable([]);
    }
  }, [pattern]);

  const handleSearch = async (e) => {
    e?.preventDefault();
    if (!pattern.trim()) return;

    setSearching(true);
    setSearched(false);
    await new Promise(r => setTimeout(r, 100));

    try {
      const res = kmpSearchDocuments(pattern.trim(), allDocs);
      setResults(res);
    } catch (err) {
      console.error('KMP search error:', err);
      setResults([]);
    } finally {
      setSearching(false);
      setSearched(true);
    }
  };

  useEffect(() => {
    if (!pattern.trim()) { setResults([]); setSearched(false); return; }
    const t = setTimeout(() => handleSearch(), 300);
    return () => clearTimeout(t);
  }, [pattern, allDocs]);

  return (
    <div className="page-wrapper">
      {/* KMP info banner */}
      <div className="algo-info-banner kmp-banner">
        <Code2 size={16} className="text-emerald" />
        <div>
          <strong>KMP Algorithm</strong> — Knuth-Morris-Pratt exact string matching.
          Time complexity: <code>O(n + m)</code> where n = text length, m = pattern length.
          Uses a failure function to avoid redundant character comparisons.
        </div>
        <button
          className="algo-toggle-btn"
          onClick={() => setShowAlgoViz(!showAlgoViz)}
        >
          {showAlgoViz ? 'Hide' : 'Show'} Failure Table
        </button>
      </div>

      {/* Failure function visualization */}
      {showAlgoViz && pattern.length >= 2 && (
        <div className="failure-table-card">
          <h4 className="failure-table-title">
            <Zap size={15} /> KMP Failure Function for "{pattern.toLowerCase()}"
          </h4>
          <p className="failure-table-desc">
            failure[i] = length of longest proper prefix of pattern[0..i] that is also a suffix.
            Used to avoid re-scanning characters during search.
          </p>
          <div className="failure-table">
            <div className="ft-row ft-header">
              <div className="ft-label">Index (i)</div>
              {pattern.split('').map((_, i) => (
                <div key={i} className="ft-cell">{i}</div>
              ))}
            </div>
            <div className="ft-row">
              <div className="ft-label">Pattern</div>
              {pattern.split('').map((ch, i) => (
                <div key={i} className="ft-cell ft-char">{ch.toLowerCase()}</div>
              ))}
            </div>
            <div className="ft-row">
              <div className="ft-label">failure[i]</div>
              {failureTable.map((val, i) => (
                <div key={i} className={`ft-cell ft-val ${val > 0 ? 'ft-val-nonzero' : ''}`}>{val}</div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Search form */}
      <form onSubmit={handleSearch} className="search-form">
        <div className="search-bar-large">
          <Target size={20} className="search-bar-icon" />
          <input
            type="text"
            className="search-bar-input"
            placeholder={loadingDocs ? 'Loading documents...' : 'Enter exact pattern to search...'}
            value={pattern}
            onChange={e => setPattern(e.target.value)}
            disabled={loadingDocs}
            autoFocus
          />
          {searching && <Loader size={18} className="spin-icon search-bar-loader" />}
          <button type="submit" className="search-bar-btn btn btn-primary btn-sm" disabled={searching || !pattern.trim()}>
            <Search size={15} /> Search
          </button>
        </div>
        <div className="pattern-stats">
          {pattern.length > 0 && (
            <>
              <span><Hash size={12} /> Pattern length: {pattern.length}</span>
              <span><Zap size={12} /> Time complexity: O({allDocs.length > 0 ? `~${allDocs.reduce((s, d) => s + d.content.length, 0)}` : 'n'} + {pattern.length})</span>
            </>
          )}
        </div>
      </form>

      {/* Results */}
      {loadingDocs ? (
        <div className="loading-state">
          <Loader size={28} className="spin-icon text-accent" />
          <p>Loading documents...</p>
        </div>
      ) : !searched && !pattern.trim() ? (
        <div className="search-idle-state">
          <Target size={52} className="idle-icon idle-emerald" />
          <h3>Exact Pattern Search</h3>
          <p>
            KMP algorithm finds <strong>every exact occurrence</strong> of your pattern across all resources.
            Unlike smart search, this finds literal text matches — no approximations.
          </p>
          <div className="kmp-examples">
            <span className="kmp-example-label">Try:</span>
            {['binary tree', 'sorting algorithm', 'data structure', 'recursion'].map(ex => (
              <button
                key={ex}
                className="example-chip"
                onClick={() => setPattern(ex)}
              >
                {ex}
              </button>
            ))}
          </div>
        </div>
      ) : (
        <>
          {searched && (
            <div className="search-results-header">
              <span className="results-label">
                {results.length > 0
                  ? `Pattern found in ${results.length} document${results.length !== 1 ? 's' : ''}`
                  : 'Pattern not found in any document'}
                {pattern && <span className="query-display"> — "{pattern}"</span>}
              </span>
              {results.length > 0 && (
                <span className="total-matches">
                  {results.reduce((s, r) => s + r.matchCount, 0)} total matches
                </span>
              )}
            </div>
          )}

          {results.length === 0 && searched ? (
            <div className="empty-state-full">
              <BookOpen size={44} className="empty-icon" />
              <h3>Pattern not found</h3>
              <p>
                No exact match for "<strong>{pattern}</strong>" in your resources.
                Check spelling or try the Smart Search for approximate matches.
              </p>
            </div>
          ) : (
            <div className="kmp-results-list">
              {results.map(({ doc, matchCount, contexts }) => (
                <div key={doc.id} className="kmp-result-card">
                  <div className="kmp-result-header">
                    <div>
                      <h4 className="kmp-result-title">{doc.title}</h4>
                      <div className="result-tags">
                        {doc.subject && <span className="tag tag-subject">{doc.subject}</span>}
                        {doc.topic && <span className="tag tag-topic">{doc.topic}</span>}
                      </div>
                    </div>
                    <div className="kmp-match-count">
                      <Target size={14} />
                      <span>{matchCount} match{matchCount !== 1 ? 'es' : ''}</span>
                    </div>
                  </div>

                  {/* Context snippets */}
                  <div className="kmp-contexts">
                    {contexts.slice(0, 3).map((ctx, i) => (
                      <div key={i} className="kmp-context">
                        <span className="ctx-label">Match {i + 1} (pos {ctx.start})</span>
                        <p className="ctx-text">
                          <span className="ctx-before">{ctx.before}</span>
                          <mark className="ctx-match">{ctx.match}</mark>
                          <span className="ctx-after">{ctx.after}</span>
                        </p>
                      </div>
                    ))}
                    {contexts.length > 3 && (
                      <p className="ctx-more">+{contexts.length - 3} more matches</p>
                    )}
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
