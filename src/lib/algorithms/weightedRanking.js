/**
 * ALGORITHM: Weighted Ranking for Previous-Year Questions (PYQ)
 * ──────────────────────────────────────────────────────────────
 * Purpose : Combine multiple factors into an analytical importance score
 *           to help students prioritize previous-year questions.
 *
 * Ranking Score = Σ (wᵢ × normalized_factorᵢ)
 *
 * Factors and weights:
 *   frequency  (35%) — how often the topic/question appeared across years
 *   recency    (25%) — more recent years weighted higher
 *   marks      (20%) — higher-mark questions prioritized
 *   difficulty (20%) — harder questions may need more attention
 *
 * Time : O(n log n) for sorting, O(n) for scoring
 * Space: O(n)
 *
 * DISCLAIMER: Rankings are analytical aids, NOT guaranteed exam predictions.
 * Application: PYQ analysis and ranking (FR-09, FR-10)
 */

const CURRENT_YEAR = new Date().getFullYear();

/**
 * Normalize a value from [min, max] → [0, 100].
 * @param {number} val
 * @param {number} min
 * @param {number} max
 * @returns {number}
 */
function normalize(val, min, max) {
  if (max === min) return 50;
  return Math.max(0, Math.min(100, ((val - min) / (max - min)) * 100));
}

/**
 * Calculate the ranking score for a single PYQ based on weighted factors.
 * @param {object} pyq - PYQ object
 * @param {object} stats - {minYear, maxYear, minMarks, maxMarks, maxFrequency}
 * @returns {number} score in [0, 100]
 */
export function calculatePYQScore(pyq, stats) {
  const W_FREQUENCY  = 0.35;
  const W_RECENCY    = 0.25;
  const W_MARKS      = 0.20;
  const W_DIFFICULTY = 0.20;

  const freqNorm  = normalize(pyq.frequency || 1, 1, stats.maxFrequency);
  const yearNorm  = normalize(pyq.year || CURRENT_YEAR, stats.minYear, stats.maxYear);
  const marksNorm = normalize(pyq.marks || 5, stats.minMarks, stats.maxMarks);
  const diffNorm  = normalize(pyq.difficulty || 50, 0, 100);

  const score =
    W_FREQUENCY  * freqNorm  +
    W_RECENCY    * yearNorm  +
    W_MARKS      * marksNorm +
    W_DIFFICULTY * diffNorm;

  return Math.round(score);
}

/**
 * Compute corpus-wide statistics needed for normalization.
 * @param {object[]} pyqs
 * @returns {object} stats
 */
function computeStats(pyqs) {
  const years  = pyqs.map(q => q.year || CURRENT_YEAR);
  const marks  = pyqs.map(q => q.marks || 5);
  const freqs  = pyqs.map(q => q.frequency || 1);

  return {
    minYear:      Math.min(...years),
    maxYear:      Math.max(...years),
    minMarks:     Math.min(...marks),
    maxMarks:     Math.max(...marks),
    maxFrequency: Math.max(...freqs),
  };
}

/**
 * Rank a list of PYQs by their computed importance score (descending).
 * @param {object[]} pyqs - array of PYQ objects
 * @returns {Array<{pyq: object, score: number}>} ranked list
 */
export function rankPYQs(pyqs) {
  if (!pyqs || pyqs.length === 0) return [];

  const stats = computeStats(pyqs);

  return pyqs
    .map(pyq => ({
      pyq,
      score: calculatePYQScore(pyq, stats),
    }))
    .sort((a, b) => b.score - a.score);
}

/**
 * Aggregate PYQs by topic and return topic-level importance ranking.
 * Topics with higher cumulative frequency and recency rank higher.
 * @param {object[]} pyqs
 * @returns {Array<{topic: string, frequency: number, avgScore: number, years: number[]}>}
 */
export function rankTopics(pyqs) {
  if (!pyqs || pyqs.length === 0) return [];

  const topicMap = new Map();

  for (const pyq of pyqs) {
    const topic = pyq.topic || 'General';
    if (!topicMap.has(topic)) {
      topicMap.set(topic, { topic, questions: [], years: new Set() });
    }
    const entry = topicMap.get(topic);
    entry.questions.push(pyq);
    if (pyq.year) entry.years.add(pyq.year);
  }

  const stats = computeStats(pyqs);
  const topicRankings = [];

  for (const [, entry] of topicMap) {
    const totalFreq = entry.questions.reduce((s, q) => s + (q.frequency || 1), 0);
    const avgScore  = entry.questions.reduce(
      (s, q) => s + calculatePYQScore(q, stats), 0
    ) / entry.questions.length;

    topicRankings.push({
      topic:     entry.topic,
      frequency: totalFreq,
      avgScore:  Math.round(avgScore),
      years:     Array.from(entry.years).sort((a, b) => b - a),
      count:     entry.questions.length,
    });
  }

  return topicRankings.sort((a, b) => b.avgScore - a.avgScore);
}
