# Memory Vault — Functional Requirements Specification & Architecture

## Overview
This document specifies the technical implementation and verification criteria for **FR-01 (User Registration)** and **FR-02 (User Authentication)** using **React (Vite)** and **Supabase Backend**.

---

## FR-01: User Registration
**Requirement Statement:** The system shall allow a new user to create an account.

### Sub-Requirements & Implementation
1. **User Provides Required Registration Information:**
   - Input Fields: Full Name (`fullName`), Email (`email`), Password (`password`), Confirm Password (`confirmPassword`).
   - Component: [AuthModal.jsx](file:///d:/MEMORY-VAULT/src/components/Auth/AuthModal.jsx)

2. **System Validates the Input (Client & Server):**
   - Non-empty validation on all fields.
   - RFC 5322 compliant regex email validation (`/^[^\s@]+@[^\s@]+\.[^\s@]+$/`).
   - Password strength constraint: Minimum 6 characters.
   - Password confirmation equality check (`password === confirmPassword`).

3. **System Creates the Account:**
   - Invokes `supabase.auth.signUp(...)` with email, password, and custom metadata `{ full_name }`.
   - Method handler: `signUp` in [AuthContext.jsx](file:///d:/MEMORY-VAULT/src/context/AuthContext.jsx).

4. **Duplicate Account Handling:**
   - Checks if identity array is empty or if error contains `already registered`.
   - Displays clear user-friendly banner alerting that the email is already in use and prompting the user to sign in instead.
   - Handles email confirmation workflow if Supabase project has email confirmations enabled.

---

## FR-02: User Authentication
**Requirement Statement:** The system shall allow registered users to authenticate securely.

### Sub-Requirements & Implementation
1. **Login:**
   - Email and password authentication via `supabase.auth.signInWithPassword(...)`.
   - Password toggle show/hide visibility.
   - Clear feedback for invalid credentials or unconfirmed email addresses.

2. **Logout:**
   - Sign out via `supabase.auth.signOut()`.
   - Clears active tokens, resets local user state in `AuthContext`, and returns to the login portal.

3. **Session & Token Management:**
   - **Persistent Sessions:** Initial session restoration on reload using `supabase.auth.getSession()`.
   - **Real-Time Token Sync:** Listens to auth state changes and auto-refreshes JWT access tokens using `supabase.auth.onAuthStateChange()`.
   - Context Provider: [AuthContext.jsx](file:///d:/MEMORY-VAULT/src/context/AuthContext.jsx).

4. **Protected Resources:**
   - State-based route guard in [App.jsx](file:///d:/MEMORY-VAULT/src/App.jsx).
   - Unauthenticated visitors are restricted to the authentication portal.
   - Authenticated users access the protected [VaultDashboard.jsx](file:///d:/MEMORY-VAULT/src/components/Protected/VaultDashboard.jsx) with secure record operations tied to `user.id`.

---

## Tech Stack
- **Frontend:** React 19, Vite, Lucide React (Icons)
- **Backend / BaaS:** Supabase (Auth, Session/JWT management, Row-Level Security)
- **Styling:** Custom glassmorphic CSS design system with CSS custom properties
