/**
 * AI Service Layer — Google Gemini Provider (gemini-2.0-flash)
 * ─────────────────────────────────────────────────────────────
 * Endpoint : https://generativelanguage.googleapis.com/v1beta/models/
 *            gemini-2.0-flash:generateContent?key=API_KEY
 * Auth     : API key as query param
 * Model    : gemini-2.0-flash (fast, generous free tier)
 *
 * Free tier: 15 req/min, 1M tokens/day — plenty for development.
 * Get key : https://aistudio.google.com/app/apikey
 *
 * "AI Second" principle: AI is supplementary — core algorithms
 * (TF-IDF search, KMP, Max Heap, Weighted Ranking) never depend on this.
 */

const GEMINI_API_KEY  = import.meta.env.VITE_GEMINI_API_KEY;
// Primary model — falls back automatically if overloaded
const MODELS = ['gemini-3.8-flash', 'gemini-2.5-flash', 'gemini-1.5-flash'];

function geminiUrl(model) {
  return `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${GEMINI_API_KEY}`;
}

const sleep = (ms) => new Promise(r => setTimeout(r, ms));

/**
 * Core Gemini API call with automatic retry + model fallback.
 * Retries on 503 (overloaded) with exponential backoff.
 * Falls back to next model in MODELS list if primary is unavailable.
 * @param {string} prompt
 * @returns {Promise<string>} generated text
 */
async function callGemini(prompt) {
  if (!GEMINI_API_KEY) {
    throw new Error(
      'Gemini API key missing. Add VITE_GEMINI_API_KEY to .env.local — get a free key at aistudio.google.com/app/apikey'
    );
  }

  const body = JSON.stringify({
    contents: [{ parts: [{ text: prompt }] }],
    generationConfig: { temperature: 0.7, topP: 0.9, maxOutputTokens: 2048 },
  });

  let lastError = null;

  for (const model of MODELS) {
    // Try each model up to 2 times before moving to next
    for (let attempt = 1; attempt <= 2; attempt++) {
      try {
        const response = await fetch(geminiUrl(model), {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body,
        });

        // Overloaded — wait and retry
        if (response.status === 503 || response.status === 429) {
          const wait = attempt * 2000; // 2s, 4s
          await sleep(wait);
          continue;
        }

        if (!response.ok) {
          const err = await response.json().catch(() => ({}));
          const msg = err?.error?.message || `Gemini error ${response.status}`;
          // Model not found — try next model immediately
          if (response.status === 404 || msg.includes('not found') || msg.includes('no longer available')) {
            break; // break inner loop → try next model
          }
          throw new Error(msg);
        }

        const data = await response.json();
        const text = data?.candidates?.[0]?.content?.parts?.[0]?.text?.trim();
        if (!text) throw new Error('Gemini returned an empty response. Try again.');
        return text; // ✅ success

      } catch (err) {
        lastError = err;
        if (err.message?.includes('fetch') || err.name === 'TypeError') {
          throw new Error(`Network error: ${err.message}. Check your internet connection.`);
        }
        // rethrow non-retriable errors immediately
        if (!err.message?.includes('overloaded') && !err.message?.includes('high demand') && !err.message?.includes('503')) {
          throw err;
        }
        if (attempt < 2) await sleep(attempt * 2000);
      }
    }
  }

  throw lastError || new Error('All Gemini models are currently busy. Please try again in a moment.');
}


/* ─── FR-11: Summarize Content ──────────────────────────────── */
export async function generateSummary(content, subject = '') {
  if (!content?.trim()) throw new Error('No content provided to summarize.');

  const subjectLine = subject ? `Subject: ${subject}.\n` : '';
  const prompt =
`You are an expert academic tutor helping a college student study.
${subjectLine}
Provide a clear, structured academic summary of the content below. Use this exact format:

**Overview**
Write 2-3 sentences summarizing the main idea.

**Key Concepts**
- Concept 1: brief explanation
- Concept 2: brief explanation
(list all important concepts)

**Key Takeaways**
- Takeaway 1
- Takeaway 2
- Takeaway 3

Content to summarize:
"""
${content.slice(0, 7000)}
"""

⚠️ AI-generated summary — verify with official course material.`;

  return callGemini(prompt);
}

/* ─── FR-12: Generate Practice Questions ────────────────────── */
export async function generateQuestions(content, type = 'mixed', count = 5) {
  if (!content?.trim()) throw new Error('No content provided for question generation.');

  const typeMap = {
    mcq:
      `Generate exactly ${count} multiple-choice questions. Each must have:\n` +
      `- The question text\n- 4 options labeled A, B, C, D\n- Mark the correct answer: **Answer: X**`,
    short:
      `Generate exactly ${count} short-answer questions (2-4 sentence answers). Include a model answer for each.`,
    descriptive:
      `Generate exactly ${count} descriptive/essay questions. Include key points that should be covered in each answer.`,
    mixed:
      `Generate a mix of ${Math.ceil(count/3)} MCQ, ${Math.ceil(count/3)} short-answer, ` +
      `and ${Math.floor(count/3)} descriptive questions. Label each type clearly.`,
  };

  const prompt =
`You are an expert academic examiner. Create practice questions to help a student study.

${typeMap[type] || typeMap.mixed}

Number each question as Q1:, Q2:, Q3: etc.

Based on this academic content:
"""
${content.slice(0, 5500)}
"""

⚠️ AI-generated questions — for study purposes only, not guaranteed exam questions.`;

  return callGemini(prompt);
}

/* ─── FR-13: Explain a Concept ──────────────────────────────── */
export async function explainConcept(concept, context = '') {
  if (!concept?.trim()) throw new Error('No concept provided to explain.');

  const contextBlock = context?.trim()
    ? `\nHere is some relevant reference material:\n"""\n${context.slice(0, 3500)}\n"""\n`
    : '';

  const prompt =
`You are a patient, expert academic tutor explaining concepts to a college student.

Explain this concept clearly: "${concept}"
${contextBlock}
Use this exact structure:

**1. Simple Definition**
One clear sentence defining the concept.

**2. Detailed Explanation**
2-3 paragraphs explaining how it works, with examples.

**3. Real-World Application**
A concrete example of where this concept is used in practice.

**4. Common Misconceptions**
List 1-2 common mistakes students make about this concept.

Keep language accessible but academically accurate.
⚠️ AI-generated explanation — verify with official course material.`;

  return callGemini(prompt);
}
