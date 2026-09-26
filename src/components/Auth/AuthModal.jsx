import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { Lock, Mail, User, Eye, EyeOff, GraduationCap, AlertCircle, CheckCircle, ArrowRight, BookOpen, Brain, Search } from 'lucide-react';

const FEATURE_HIGHLIGHTS = [
  { icon: Search,   label: 'TF-IDF + Cosine Similarity Search' },
  { icon: Brain,    label: 'Max Heap Revision Prioritization' },
  { icon: BookOpen, label: 'KMP Exact Pattern Matching' },
];

export const AuthModal = () => {
  const [isLogin, setIsLogin] = useState(true);
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const { signIn, signUp } = useAuth();

  const resetFormState = () => { setErrorMsg(''); setSuccessMsg(''); };

  const switchTab = (toLogin) => {
    setIsLogin(toLogin);
    resetFormState();
  };

  const validateInputs = () => {
    resetFormState();
    if (!email.trim() || !password) { setErrorMsg('Please fill in all required fields.'); return false; }
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email.trim())) { setErrorMsg('Please enter a valid email address.'); return false; }
    if (password.length < 6) { setErrorMsg('Password must be at least 6 characters.'); return false; }
    if (!isLogin) {
      if (!fullName.trim()) { setErrorMsg('Please provide your full name.'); return false; }
      if (password !== confirmPassword) { setErrorMsg('Passwords do not match.'); return false; }
    }
    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateInputs()) return;
    setIsSubmitting(true);
    resetFormState();
    try {
      if (isLogin) {
        const { error } = await signIn({ email: email.trim(), password });
        if (error) {
          if (error.message.toLowerCase().includes('invalid login credentials')) {
            setErrorMsg('Invalid email or password. Please try again.');
          } else if (error.message.toLowerCase().includes('email not confirmed')) {
            setErrorMsg('Please verify your email address first.');
          } else {
            setErrorMsg(error.message || 'Authentication failed.');
          }
        }
      } else {
        const { error, isExistingUser, isEmailConfirmationRequired } = await signUp({
          email: email.trim(), password, fullName: fullName.trim(),
        });
        if (error) {
          setErrorMsg(error.message.includes('already registered')
            ? 'An account with this email already exists.'
            : error.message || 'Registration failed.');
        } else if (isExistingUser) {
          setErrorMsg('An account with this email already exists. Please sign in.');
        } else if (isEmailConfirmationRequired) {
          setSuccessMsg('Registration successful! Check your email to confirm your account.');
        } else {
          setSuccessMsg('Account created! Logging you in...');
        }
      }
    } catch {
      setErrorMsg('An unexpected error occurred. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="auth-page">
      {/* Left: hero */}
      <div className="auth-hero">
        <div className="auth-hero-inner">
          <div className="auth-hero-brand">
            <div className="auth-brand-icon">
              <GraduationCap size={28} />
            </div>
            <span className="auth-brand-name">Memory Vault</span>
          </div>
          <h1 className="auth-hero-title">
            Your Academic<br />
            <span className="text-gradient">Knowledge Base</span>
          </h1>
          <p className="auth-hero-desc">
            Store, search, and revise your academic resources with algorithms that actually work.
            Classical computer science meets modern learning.
          </p>
          <div className="auth-feature-list">
            {FEATURE_HIGHLIGHTS.map(({ icon: Icon, label }) => (
              <div key={label} className="auth-feature-item">
                <div className="auth-feature-dot"><Icon size={13} /></div>
                <span>{label}</span>
              </div>
            ))}
          </div>
          <div className="auth-algo-pill">
            <span className="algo-pill-label">Algorithms inside:</span>
            {['Inverted Index', 'TF-IDF', 'Cosine', 'KMP', 'Max Heap', 'Weighted Ranking'].map(a => (
              <span key={a} className="algo-chip">{a}</span>
            ))}
          </div>
        </div>
      </div>

      {/* Right: auth card */}
      <div className="auth-card-side">
        <div className="auth-card">
          <div className="auth-card-top-bar" />

          <div className="auth-header">
            <h2 className="auth-title">
              {isLogin ? 'Welcome back' : 'Create account'}
            </h2>
            <p className="auth-subtitle">
              {isLogin
                ? 'Sign in to access your academic vault.'
                : 'Join Memory Vault and start organizing your studies.'}
            </p>
          </div>

          {/* Tabs */}
          <div className="auth-tabs">
            <button type="button" className={`auth-tab ${isLogin ? 'active' : ''}`} onClick={() => switchTab(true)}>
              Sign In
            </button>
            <button type="button" className={`auth-tab ${!isLogin ? 'active' : ''}`} onClick={() => switchTab(false)}>
              Register
            </button>
          </div>

          {/* Alerts */}
          {errorMsg && (
            <div className="alert alert-error" role="alert">
              <AlertCircle size={16} className="alert-icon" /><span>{errorMsg}</span>
            </div>
          )}
          {successMsg && (
            <div className="alert alert-success" role="alert">
              <CheckCircle size={16} className="alert-icon" /><span>{successMsg}</span>
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit} className="auth-form" noValidate>
            {!isLogin && (
              <div className="form-group">
                <label htmlFor="fullName">Full Name</label>
                <div className="input-wrapper">
                  <User size={16} className="input-icon" />
                  <input id="fullName" type="text" placeholder="John Doe" value={fullName}
                    onChange={e => setFullName(e.target.value)} disabled={isSubmitting} required />
                </div>
              </div>
            )}
            <div className="form-group">
              <label htmlFor="auth-email">Email Address</label>
              <div className="input-wrapper">
                <Mail size={16} className="input-icon" />
                <input id="auth-email" type="email" placeholder="name@university.edu" value={email}
                  onChange={e => setEmail(e.target.value)} disabled={isSubmitting} required autoComplete="email" />
              </div>
            </div>
            <div className="form-group">
              <label htmlFor="auth-password">Password</label>
              <div className="input-wrapper">
                <Lock size={16} className="input-icon" />
                <input id="auth-password" type={showPassword ? 'text' : 'password'} placeholder="••••••••"
                  value={password} onChange={e => setPassword(e.target.value)} disabled={isSubmitting}
                  required autoComplete={isLogin ? 'current-password' : 'new-password'} />
                <button type="button" className="toggle-password-btn"
                  onClick={() => setShowPassword(!showPassword)} tabIndex={-1}
                  aria-label={showPassword ? 'Hide' : 'Show'}>
                  {showPassword ? <EyeOff size={15} /> : <Eye size={15} />}
                </button>
              </div>
              {!isLogin && <span className="helper-text">Minimum 6 characters</span>}
            </div>
            {!isLogin && (
              <div className="form-group">
                <label htmlFor="auth-confirm">Confirm Password</label>
                <div className="input-wrapper">
                  <Lock size={16} className="input-icon" />
                  <input id="auth-confirm" type={showPassword ? 'text' : 'password'} placeholder="••••••••"
                    value={confirmPassword} onChange={e => setConfirmPassword(e.target.value)}
                    disabled={isSubmitting} required autoComplete="new-password" />
                </div>
              </div>
            )}
            <button type="submit" className="btn btn-primary btn-block" disabled={isSubmitting}>
              {isSubmitting ? (
                <span className="spinner-label"><span className="spinner" /> Processing...</span>
              ) : (
                <>{isLogin ? 'Sign In' : 'Create Account'}<ArrowRight size={16} /></>
              )}
            </button>
          </form>

          <div className="auth-footer">
            <p>
              {isLogin ? "Don't have an account?" : 'Already have an account?'}
              <button type="button" className="btn-link" onClick={() => switchTab(!isLogin)}>
                {isLogin ? 'Register now' : 'Sign in'}
              </button>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
