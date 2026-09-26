/**
 * ALGORITHM: Knuth-Morris-Pratt (KMP) String Matching
 * ─────────────────────────────────────────────────────
 * Purpose : Efficient exact substring/pattern matching in text.
 * 
 * Preprocessing: Failure function (partial match table) in O(m) time.
 * Matching     : Single-pass scan in O(n) time.
 * 
 * Time  : O(n + m) — significantly better than naive O(n·m)
 * Space : O(m) for the failure function array
 * 
 * Application: Exact content search across academic documents (FR-06)
 */

/**
 * Build the KMP failure function (partial match / prefix table).
 * failure[i] = length of the longest proper prefix of pattern[0..i]
 *              that is also a suffix.
 *
 * Example: pattern = "ABCAB"
 *   failure = [0, 0, 0, 1, 2]
 *
 * @param {string} pattern
 * @returns {number[]}
 */
export function buildFailureFunction(pattern) {
  const m = pattern.length;
  const failure = new Array(m).fill(0);
  let len = 0; // length of previous longest prefix suffix
  let i = 1;

  while (i < m) {
    if (pattern[i] === pattern[len]) {
      len++;
      failure[i] = len;
      i++;
    } else {
      if (len !== 0) {
        // This is not a match; try shorter prefix
        len = failure[len - 1];
        // Don't increment i here — try again with shorter len
      } else {
        failure[i] = 0;
        i++;
      }
    }
  }

  return failure;
}

/**
 * KMP search: find ALL occurrences of pattern in text.
 *
 * @param {string} text    - the document text to search in
 * @param {string} pattern - the exact string to find
 * @param {boolean} caseInsensitive - whether to ignore case
 * @returns {number[]} array of start indices where pattern occurs in text
 */
export function kmpSearch(text, pattern, caseInsensitive = true) {
  if (!pattern || !text) return [];

  const haystack = caseInsensitive ? text.toLowerCase() : text;
  const needle   = caseInsensitive ? pattern.toLowerCase() : pattern;

  const n = haystack.length;
  const m = needle.length;
  const matches = [];

  if (m === 0 || m > n) return matches;

  const failure = buildFailureFunction(needle);
  let i = 0; // index in text
  let j = 0; // index in pattern

  while (i < n) {
    if (haystack[i] === needle[j]) {
      i++;
      j++;
      if (j === m) {
        // Pattern found at text position i - m
        matches.push(i - m);
        j = failure[j - 1]; // Use failure fn to continue searching
      }
    } else {
      if (j !== 0) {
        j = failure[j - 1];
      } else {
        i++;
      }
    }
  }

  return matches;
}

/**
 * Extract context snippets around each match position.
 * Returns highlighted excerpts to display in the UI.
 *
 * @param {string} text
 * @param {number[]} positions  - array of match start indices from kmpSearch
 * @param {number}  patternLen  - length of the matched pattern
 * @param {number}  contextLen  - characters of context before/after match
 * @returns {Array<{start: number, end: number, before: string, match: string, after: string}>}
 */
export function extractMatchContexts(text, positions, patternLen, contextLen = 80) {
  const contexts = [];

  for (const pos of positions) {
    const ctxStart = Math.max(0, pos - contextLen);
    const ctxEnd   = Math.min(text.length, pos + patternLen + contextLen);

    contexts.push({
      start:  pos,
      end:    pos + patternLen,
      before: (ctxStart > 0 ? '...' : '') + text.slice(ctxStart, pos),
      match:  text.slice(pos, pos + patternLen),
      after:  text.slice(pos + patternLen, ctxEnd) + (ctxEnd < text.length ? '...' : ''),
    });
  }

  return contexts;
}

/**
 * Search a pattern across multiple documents, returning per-document results.
 *
 * @param {string} pattern
 * @param {Array<{id: string, title: string, content: string}>} documents
 * @returns {Array<{doc: object, matchCount: number, contexts: Array}>}
 */
export function kmpSearchDocuments(pattern, documents) {
  if (!pattern.trim()) return [];
  const results = [];

  for (const doc of documents) {
    const text = `${doc.title}\n${doc.content || doc.description || ''}`;
    const positions = kmpSearch(text, pattern);

    if (positions.length > 0) {
      results.push({
        doc,
        matchCount: positions.length,
        contexts: extractMatchContexts(text, positions, pattern.length),
      });
    }
  }

  // Sort by match count (most matches first)
  return results.sort((a, b) => b.matchCount - a.matchCount);
}
