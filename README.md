# 🛡️ Memory Vault

> A secure, modern, zero-knowledge personal memory & credentials vault built with **React**, **Vite**, and **Supabase Authentication**.

![React](https://img.shields.io/badge/React-19-blue?logo=react)
![Supabase](https://img.shields.io/badge/Supabase-Auth-emerald?logo=supabase)
![Vite](https://img.shields.io/badge/Vite-8-purple?logo=vite)
![License](https://img.shields.io/badge/License-MIT-green)

---

## 🚀 Features

### 📋 FR-01 — User Registration
- **Strict Input Validation:** Real-time client-side & server-side validation (RFC 5322 email regex, minimum 6-character passwords, confirmation match).
- **Duplicate Account Handling:** Detects existing email identities and prevents duplicate account errors with intuitive user feedback.
- **Email Verification Flow:** Supports instant login or email confirmation link verification based on your Supabase security settings.

### 🔐 FR-02 — User Authentication & Session Management
- **Secure Authentication:** Password authentication with visibility toggles and clear credential error alerts.
- **Session & JWT Lifecycle:** Initial session restoration on startup (`supabase.auth.getSession()`) and continuous token auto-refresh with real-time state listeners (`supabase.auth.onAuthStateChange()`).
- **Protected Resources:** Authenticated dashboard isolating private user records tied to `user.id`.
- **One-Click Logout:** Session invalidation and state reset across tabs.

---

## 📁 Project Structure

```
d:/MEMORY-VAULT/
├── src/
│   ├── components/
│   │   ├── Auth/
│   │   │   └── AuthModal.jsx        # FR-01 (Register) & FR-02 (Login) UI
│   │   ├── Common/
│   │   │   └── Navbar.jsx           # Top navigation & Supabase status badge
│   │   └── Protected/
│   │       └── VaultDashboard.jsx   # FR-02 Protected Resource & Session Inspector
│   ├── context/
│   │   └── AuthContext.jsx          # Auth state provider & Supabase listener
│   ├── lib/
│   │   └── supabaseClient.js        # Supabase client singleton
│   ├── App.jsx                      # Main app shell & route protection
│   ├── App.css                      # Glassmorphic UI stylesheet
│   └── index.css                    # Design tokens & typography
├── .env.example                     # Environment variable template
├── REQUIREMENTS.md                  # Detailed Functional Requirements specification
└── package.json
```

---

## 🛠️ Getting Started

### 1. Prerequisites
- Node.js (v18+)
- A [Supabase](https://supabase.com) project

### 2. Installation
```bash
# Clone the repository
git clone https://github.com/Kamesh-A13/Memory-Vault.git
cd Memory-Vault

# Install dependencies
npm install
```

### 3. Environment Configuration
Copy `.env.example` to `.env.local` and fill in your Supabase project credentials:
```env
VITE_SUPABASE_URL=https://your-project-id.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-public-api-key
```

### 4. Run Locally
```bash
npm run dev
```
Open [http://localhost:5173](http://localhost:5173) in your browser.

---

## 📄 Documentation
For detailed requirement descriptions and architecture specifications, see [REQUIREMENTS.md](REQUIREMENTS.md).
