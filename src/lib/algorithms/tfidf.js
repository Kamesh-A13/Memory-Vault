/**
 * ALGORITHM: TF-IDF + Cosine Similarity
 * ──────────────────────────────────────
 * Purpose : Calculate relevance score of documents to a query.
 * 
 * TF  (Term Frequency)  = count(term, doc) / total_terms(doc)
 * IDF (Inverse Doc Freq) = log(N / df(term)) where N = corpus size
 * TF-IDF = TF × IDF
 *
 * Time : O(N·L) to build, O(V) per query for cosine similarity
 *        where N=docs, L=avg doc length, V=vocabulary size
 * Space: O(N·V) for the full TF-IDF matrix
 * Application: Search relevance ranking (FR-05)
 */

import { tokenize } from './invertedIndex';

/**
 * Compute Term Frequency for a single document.
 * TF(t,d) = count(t in d) / |d|
 * @param {string[]} tokens - tokenized document
 * @returns {Map<string, number>}
 */
function computeTF(tokens) {
  const tf = new Map();
  const total = tokens.length;
  if (total === 0) return tf;

  for (const token of tokens) {
    tf.set(token, (tf.get(token) || 0) + 1);
  }

  for (const [term, count] of tf) {
    tf.set(term, count / total);
  }

  return tf;
}

/**
 * Compute Inverse Document Frequency across the corpus.
 * IDF(t, D) = log(N / (1 + df(t)))  [smoothed to avoid division by zero]
 * @param {string[][]} tokenizedDocs - array of token arrays per document
 * @returns {Map<string, number>}
 */
function computeIDF(tokenizedDocs) {
  const df = new Map();       // term → document frequency
  const N = tokenizedDocs.length;

  for (const tokens of tokenizedDocs) {
    const uniqueTokens = new Set(tokens);
    for (const token of uniqueTokens) {
      df.set(token, (df.get(token) || 0) + 1);
    }
  }

  const idf = new Map();
  for (const [term, freq] of df) {
    idf.set(term, Math.log(N / (1 + freq)));
  }

  return idf;
}

/**
 * Build TF-IDF vectors for all documents.
 * @param {Array<{id: string, content: string, title: string, description?: string}>} documents
 * @returns {{ vectors: Map<string, Map<string, number>>, idf: Map<string, number> }}
 */
export function buildTFIDFVectors(documents) {
  const tokenizedDocs = documents.map(doc => {
    const text = `${doc.title} ${doc.content || ''} ${doc.description || ''}`;
    return tokenize(text);
  });

  const idf = computeIDF(tokenizedDocs);
  const vectors = new Map();

  documents.forEach((doc, i) => {
    const tf = computeTF(tokenizedDocs[i]);
    const tfidf = new Map();

    for (const [term, tfVal] of tf) {
      const idfVal = idf.get(term) || 0;
      tfidf.set(term, tfVal * idfVal);
    }

    vectors.set(doc.id, tfidf);
  });

  return { vectors, idf };
}

/**
 * ALGORITHM: Cosine Similarity
 * ────────────────────────────
 * cos(A, B) = (A · B) / (||A|| × ||B||)
 *
 * Time : O(V) where V = vocabulary (sparse vectors make this fast in practice)
 * Space: O(V) for query vector
 *
 * @param {Map<string, number>} vecA
 * @param {Map<string, number>} vecB
 * @returns {number} similarity score in [0, 1]
 */
export function cosineSimilarity(vecA, vecB) {
  let dotProduct = 0;
  let normA = 0;
  let normB = 0;

  for (const [term, valA] of vecA) {
    dotProduct += valA * (vecB.get(term) || 0);
    normA += valA * valA;
  }

  for (const [, valB] of vecB) {
    normB += valB * valB;
  }

  if (normA === 0 || normB === 0) return 0;
  return dotProduct / (Math.sqrt(normA) * Math.sqrt(normB));
}

/**
 * Build a TF-IDF vector for a query string using the pre-computed corpus IDF.
 * @param {string} query
 * @param {Map<string, number>} idf - corpus IDF values
 * @returns {Map<string, number>} query vector
 */
export function buildQueryVector(query, idf) {
  const tokens = tokenize(query);
  const tf = computeTF(tokens);
  const queryVec = new Map();

  for (const [term, tfVal] of tf) {
    const idfVal = idf.get(term) || Math.log(2); // fallback IDF for unknown terms
    queryVec.set(term, tfVal * idfVal);
  }

  return queryVec;
}

/**
 * Rank documents against a query using TF-IDF + Cosine Similarity.
 * @param {string} query
 * @param {Array<{id: string, title: string, content: string, description?: string}>} documents
 * @param {number} topK - return top K results
 * @returns {Array<{doc: object, score: number}>} ranked results
 */
export function rankDocuments(query, documents, topK = 10) {
  if (!query.trim() || documents.length === 0) return [];

  const { vectors, idf } = buildTFIDFVectors(documents);
  const queryVec = buildQueryVector(query, idf);

  const scores = documents.map(doc => ({
    doc,
    score: cosineSimilarity(queryVec, vectors.get(doc.id) || new Map()),
  }));

  // Sort descending by score, filter zero-score docs
  return scores
    .filter(r => r.score > 0)
    .sort((a, b) => b.score - a.score)
    .slice(0, topK);
}
