/**
 * ALGORITHM: Inverted Index
 * ─────────────────────────
 * Purpose : Efficiently locate documents containing query terms.
 * Time    : Build O(N·L) where N=docs, L=avg tokens per doc
 *           Query O(|terms|) lookup → O(1) per term via hash map
 * Space   : O(V·D) where V=vocabulary size, D=avg docs per term
 * Application: Academic resource search (FR-05)
 */

/**
 * Tokenize text into normalized lowercase tokens, stripping stop-words.
 * @param {string} text
 * @returns {string[]}
 */
export function tokenize(text) {
  const STOP_WORDS = new Set([
    'a','an','the','and','or','but','in','on','at','to','for','of','with',
    'by','from','up','about','into','through','is','are','was','were','be',
    'been','being','have','has','had','do','does','did','will','would','could',
    'should','may','might','shall','can','this','that','these','those','it',
    'its','i','we','you','he','she','they','my','your','our','their','not',
    'no','nor','so','yet','both','either','neither','such','as','if','though'
  ]);

  return text
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, ' ')
    .split(/\s+/)
    .filter(t => t.length > 1 && !STOP_WORDS.has(t));
}

/**
 * Build an inverted index from an array of documents.
 * @param {Array<{id: string, content: string, title: string}>} documents
 * @returns {Map<string, Set<string>>} term → Set of document IDs
 */
export function buildInvertedIndex(documents) {
  const index = new Map();

  for (const doc of documents) {
    const text = `${doc.title} ${doc.content || ''} ${doc.description || ''}`;
    const tokens = tokenize(text);

    for (const token of tokens) {
      if (!index.has(token)) {
        index.set(token, new Set());
      }
      index.get(token).add(doc.id);
    }
  }

  return index;
}

/**
 * Query the inverted index for documents matching ALL query terms (AND logic).
 * For OR logic, union the sets instead.
 * @param {Map<string, Set<string>>} index
 * @param {string} query
 * @param {'AND'|'OR'} mode
 * @returns {Set<string>} matching document IDs
 */
export function queryIndex(index, query, mode = 'OR') {
  const tokens = tokenize(query);
  if (tokens.length === 0) return new Set();

  if (mode === 'AND') {
    // Intersection of all posting lists
    let result = null;
    for (const token of tokens) {
      const postings = index.get(token) || new Set();
      if (result === null) {
        result = new Set(postings);
      } else {
        for (const id of result) {
          if (!postings.has(id)) result.delete(id);
        }
      }
    }
    return result || new Set();
  } else {
    // Union of all posting lists (OR)
    const result = new Set();
    for (const token of tokens) {
      const postings = index.get(token) || new Set();
      for (const id of postings) result.add(id);
    }
    return result;
  }
}
