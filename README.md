# 🎓 Memory Vault

> **Academic Resource Management & Intelligent Learning Platform**
> Built with React + Vite + Supabase + Classical Algorithms + Gemini AI

[![React](https://img.shields.io/badge/React-19-blue?logo=react)](https://react.dev)
[![Vite](https://img.shields.io/badge/Vite-8-purple?logo=vite)](https://vitejs.dev)
[![Supabase](https://img.shields.io/badge/Supabase-Auth%20%2B%20DB%20%2B%20Storage-emerald?logo=supabase)](https://supabase.com)
[![License](https://img.shields.io/badge/License-MIT-green)](LICENSE)

---

## 🧠 Product Overview

Memory Vault is a centralized academic platform that helps students:

> **Store → Search → Understand → Practice → Prioritize → Revise**

**Design Principle:** *Algorithms first, AI second.*
Classical algorithms form the deterministic core; Gemini AI enhances the experience.

---

## ✨ Features

| Module | Algorithm | Functional Requirement |
|--------|-----------|------------------------|
| **Smart Search** | Inverted Index + TF-IDF + Cosine Similarity | FR-05 |
| **Exact Search** | KMP (Knuth-Morris-Pratt) | FR-06 |
| **Revision Planner** | Max Heap / Priority Queue | FR-07, FR-08 |
| **PYQ Analysis** | Weighted Multi-Factor Ranking | FR-09, FR-10 |
| **AI Summarization** | Gemini 2.0 Flash | FR-11 |
| **AI Question Gen** | Gemini 2.0 Flash | FR-12 |
| **Concept Explainer** | Gemini 2.0 Flash | FR-13 |
| **Authentication** | Supabase Auth (JWT + RLS) | FR-01, FR-02 |
| **Resource Management** | Supabase Storage + PostgreSQL | FR-03, FR-04 |

---

## 🧮 Algorithm Implementations

### 1. Inverted Index (`src/lib/algorithms/invertedIndex.js`)
- **Build:** O(N·L) — maps each term to the set of documents containing it
- **Query:** O(|terms|) — supports AND (precision) and OR (recall) modes
- **Application:** Candidate document retrieval for search

### 2. TF-IDF + Cosine Similarity (`src/lib/algorithms/tfidf.js`)
- **TF(t,d):** count(t in d) / |d|
- **IDF(t,D):** log(N / (1 + df(t))) — smoothed
- **Cosine:** (A·B) / (||A|| × ||B||)
- **Application:** Relevance ranking of search results

### 3. KMP String Matching (`src/lib/algorithms/kmp.js`)
- **Time:** O(n + m) — n = text length, m = pattern length
- **Space:** O(m) — failure function (partial match table)
- **Application:** Exact pattern matching with context extraction

### 4. Max Heap / Priority Queue (`src/lib/algorithms/maxHeap.js`)
- **Insert/Extract:** O(log n)
- **Build:** O(n) — Floyd's construction algorithm
- **Priority Formula:** 0.35×importance + 0.25×difficulty + 0.25×frequency + 0.15×recency
- **Application:** Revision item prioritization

### 5. Weighted Ranking (`src/lib/algorithms/weightedRanking.js`)
- **Time:** O(n log n)
- **Factors:** frequency (35%), recency (25%), marks (20%), difficulty (20%)
- **Application:** PYQ importance scoring + topic aggregation
- **Disclaimer:** Analytical aid only — not guaranteed exam prediction

---

## 📁 Project Structure

```
src/
├── lib/
│   ├── algorithms/
│   │   ├── invertedIndex.js     # Algorithm 1: Inverted Index
│   │   ├── tfidf.js             # Algorithms 2+3: TF-IDF + Cosine
│   │   ├── kmp.js               # Algorithm 4: KMP
│   │   ├── maxHeap.js           # Algorithm 5: Max Heap
│   │   └── weightedRanking.js   # Algorithm 6: Weighted Ranking
│   ├── aiService.js             # AI abstraction layer (Gemini)
│   ├── dbService.js             # Supabase data operations
│   └── supabaseClient.js        # Supabase client singleton
│
├── pages/
│   ├── DashboardPage.jsx        # Home with stats + navigation
│   ├── ResourcesPage.jsx        # Upload, view, manage resources
│   ├── SearchPage.jsx           # TF-IDF + Cosine search
│   ├── ExactSearchPage.jsx      # KMP exact pattern search
│   ├── RevisionPage.jsx         # Max Heap revision planner
│   ├── PYQPage.jsx              # PYQ analysis + topic ranking
│   └── AIToolsPage.jsx          # AI summarization, Q-gen, explain
│
├── components/
│   ├── Auth/
│   │   └── AuthModal.jsx        # FR-01 Register + FR-02 Login
│   └── Layout/
│       └── AppLayout.jsx        # Sidebar + top bar shell
│
├── context/
│   └── AuthContext.jsx          # Auth state + Supabase session
├── App.jsx                      # Main router
├── App.css                      # Full application styles
└── index.css                    # Design tokens + typography
```

---

## 🚀 Getting Started

### 1. Prerequisites
- Node.js v18+
- A [Supabase](https://supabase.com) project
- A [Gemini API key](https://aistudio.google.com/app/apikey) (free)

### 2. Clone & Install

```bash
git clone https://github.com/Kamesh-A13/Memory-Vault.git
cd Memory-Vault
npm install
```

### 3. Environment Setup

Copy `.env.example` to `.env.local`:

```env
VITE_SUPABASE_URL=https://your-project-id.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-public-api-key
VITE_GEMINI_API_KEY=your-gemini-api-key
```

### 4. Database Setup

Run `supabase_migration.sql` in your Supabase SQL Editor:
- **Supabase Dashboard → SQL Editor → New Query → Paste → Run**

Also create a Supabase Storage bucket named **`academic-resources`**.

### 5. Run Locally

```bash
npm run dev
```

Open [http://localhost:5173](http://localhost:5173)

---

## 🛠️ Technology Stack

| Layer | Technology |
|-------|------------|
| Frontend | React 19, Vite 8, Vanilla CSS |
| Icons | Lucide React |
| Auth + DB | Supabase (Auth, PostgreSQL, Storage) |
| AI | Google Gemini 2.0 Flash API |
| Algorithms | JavaScript (client-side, fully annotated) |
| Deployment | Vercel (frontend) |

---

## ☁️ Deployment

### Vercel (Recommended)

1. Push to GitHub
2. Connect to Vercel
3. Add environment variables in Vercel project settings
4. Deploy

---

## 📄 Documentation

- [REQUIREMENTS.md](REQUIREMENTS.md) — Detailed functional requirements
- [supabase_migration.sql](supabase_migration.sql) — Database schema + RLS policies

---

## ⚠️ Disclaimer

PYQ analysis rankings are **analytical aids only** and are **not guaranteed predictions of future examination questions**. Always study from official syllabus and curriculum sources.

AI-generated content (summaries, questions, explanations) should be **verified against official course materials**.

---

## 📄 License

MIT License — see [LICENSE](LICENSE) for details.
