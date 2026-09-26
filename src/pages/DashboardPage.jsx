import React, { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import {
  BookOpen, Brain, FileQuestion, Sparkles, TrendingUp,
  Upload, Search, Target, ArrowRight, Zap, Clock, Star
} from 'lucide-react';
import { fetchResources, fetchRevisionItems, fetchPYQs } from '../lib/dbService';
import { seedDemoData } from '../lib/seedService';

const FEATURE_CARDS = [
  {
    id: 'resources',
    icon: BookOpen,
    color: 'cyan',
    title: 'Resource Library',
    desc: 'Upload PDFs, notes, and documents. Organize by subject and topic.',
    action: 'Manage Resources',
    algo: 'Inverted Index',
  },
  {
    id: 'search',
    icon: Search,
    color: 'indigo',
    title: 'Smart Search',
    desc: 'Find the most relevant resources using TF-IDF and Cosine Similarity.',
    action: 'Search Now',
    algo: 'TF-IDF + Cosine',
  },
  {
    id: 'exact-search',
    icon: Target,
    color: 'emerald',
    title: 'Exact Search',
    desc: 'Find exact patterns inside your documents using KMP algorithm.',
    action: 'Pattern Search',
    algo: 'KMP O(n+m)',
  },
  {
    id: 'revision',
    icon: Brain,
    color: 'violet',
    title: 'Revision Planner',
    desc: 'Prioritize topics intelligently. Highest-urgency items surfaced first.',
    action: 'Plan Revision',
    algo: 'Max Heap',
  },
  {
    id: 'pyq',
    icon: FileQuestion,
    color: 'amber',
    title: 'PYQ Analysis',
    desc: 'Analyze previous-year questions to find high-frequency topics.',
    action: 'Analyze PYQs',
    algo: 'Weighted Ranking',
  },
  {
    id: 'ai-tools',
    icon: Sparkles,
    color: 'rose',
    title: 'AI Tools',
    desc: 'Generate summaries, practice questions, and concept explanations with AI.',
    action: 'Use AI Tools',
    algo: 'Gemini AI',
  },
];

export const DashboardPage = ({ onNavigate }) => {
  const { user } = useAuth();
  const [stats, setStats] = useState({ resources: 0, revision: 0, pyqs: 0 });
  const [loading, setLoading] = useState(true);

  const [seeding, setSeeding] = useState(false);
  const [seedDone, setSeedDone] = useState(false);

  const displayName = user?.user_metadata?.full_name?.split(' ')[0] || user?.email?.split('@')[0] || 'Student';

  useEffect(() => {
    const loadStats = async () => {
      if (!user?.id) return;
      setLoading(true);
      try {
        console.log('[Dashboard] Loading stats for user:', user.id);

        const [resResult, revResult, pyqResult] = await Promise.allSettled([
          fetchResources(user.id),
          fetchRevisionItems(user.id),
          fetchPYQs(user.id),
        ]);

        const resCount = resResult.value?.data?.length || 0;
        const revCount = revResult.value?.data?.length || 0;
        const pyqCount = pyqResult.value?.data?.length || 0;

        console.log('[Dashboard] Current counts:', { resCount, revCount, pyqCount });

        setStats({ resources: resCount, revision: revCount, pyqs: pyqCount });

        // AUTO-SEED: Force-seed demo data once per session
        if (!seedDone) {
          console.log('[Seed] Starting auto-seed...');
          setSeeding(true);
          try {
            const result = await seedDemoData(user.id);
            console.log('[Seed] Result:', JSON.stringify(result));
            setSeedDone(true);

            // Reload stats after seeding
            const [r2, rv2, p2] = await Promise.allSettled([
              fetchResources(user.id),
              fetchRevisionItems(user.id),
              fetchPYQs(user.id),
            ]);
            setStats({
              resources: r2.value?.data?.length || 0,
              revision:  rv2.value?.data?.length || 0,
              pyqs:      p2.value?.data?.length || 0,
            });
            console.log('[Seed] Stats refreshed after seed');
          } catch (seedErr) {
            console.error('[Seed] FAILED:', seedErr);
          } finally {
            setSeeding(false);
          }
        }
      } catch (e) {
        console.error('[Dashboard] Load error:', e);
      } finally {
        setLoading(false);
      }
    };
    loadStats();
  }, [user?.id]);

  const hour = new Date().getHours();
  const greeting = hour < 12 ? 'Good morning' : hour < 17 ? 'Good afternoon' : 'Good evening';

  return (
    <div className="dashboard-page">
      {/* Hero welcome */}
      <div className="welcome-hero">
        <div className="welcome-hero-content">
          <div className="welcome-time">
            <Clock size={14} />
            {new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}
          </div>
          <h2 className="welcome-heading">
            {greeting}, <span className="text-gradient">{displayName}</span> 👋
          </h2>
          <p className="welcome-subtext">
            Your academic knowledge base is ready. Store → Search → Understand → Practice → Prioritize → Revise.
          </p>
        </div>

        {/* Quick stats */}
        <div className="quick-stats">
          <div className="quick-stat">
            <div className="quick-stat-icon stat-cyan"><BookOpen size={18} /></div>
            <div>
              <div className="quick-stat-value">{loading ? '—' : stats.resources}</div>
              <div className="quick-stat-label">Resources</div>
            </div>
          </div>
          <div className="quick-stat">
            <div className="quick-stat-icon stat-violet"><Brain size={18} /></div>
            <div>
              <div className="quick-stat-value">{loading ? '—' : stats.revision}</div>
              <div className="quick-stat-label">Revision Items</div>
            </div>
          </div>
          <div className="quick-stat">
            <div className="quick-stat-icon stat-amber"><FileQuestion size={18} /></div>
            <div>
              <div className="quick-stat-value">{loading ? '—' : stats.pyqs}</div>
              <div className="quick-stat-label">PYQs Stored</div>
            </div>
          </div>
          <div className="quick-stat">
            <div className="quick-stat-icon stat-rose"><Sparkles size={18} /></div>
            <div>
              <div className="quick-stat-value">6</div>
              <div className="quick-stat-label">Algorithms</div>
            </div>
          </div>
        </div>
      </div>

      {/* Algorithm principle banner */}
      <div className="principle-banner">
        <Zap size={16} className="principle-icon" />
        <span className="principle-text">
          {seeding ? (
            <><strong>Populating demo data...</strong> Adding resources, revision items, and PYQs.</>
          ) : (
            <><strong>Algorithms first, AI second.</strong>{' '}
            Classical algorithms power the core — AI enhances the experience.</>
          )}
        </span>
      </div>

      {/* Feature cards grid */}
      <div className="feature-cards-grid">
        {FEATURE_CARDS.map(card => {
          const Icon = card.icon;
          return (
            <div
              key={card.id}
              className={`feature-card feature-card-${card.color}`}
              onClick={() => onNavigate(card.id)}
              role="button"
              tabIndex={0}
              onKeyDown={e => e.key === 'Enter' && onNavigate(card.id)}
            >
              <div className="feature-card-header">
                <div className={`feature-card-icon icon-${card.color}`}>
                  <Icon size={22} />
                </div>
                <span className={`feature-algo-tag tag-${card.color}`}>
                  <Star size={10} /> {card.algo}
                </span>
              </div>
              <h3 className="feature-card-title">{card.title}</h3>
              <p className="feature-card-desc">{card.desc}</p>
              <div className="feature-card-action">
                <span>{card.action}</span>
                <ArrowRight size={15} />
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
