import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { Lock, Mail, User, Eye, EyeOff, ShieldCheck, AlertCircle, CheckCircle, ArrowRight } from 'lucide-react';

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

  const resetFormState = () => {
    setErrorMsg('');
    setSuccessMsg('');
  };

  const switchTab = (toLogin) => {
    setIsLogin(toLogin);
    resetFormState();
  };

  // FR-01 & FR-02 Client-Side Validation
  const validateInputs = () => {
    resetFormState();
    
    // Check required fields
    if (!email.trim() || !password) {
      setErrorMsg('Please fill in all required fields.');
      return false;
    }

    // Email format validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email.trim())) {
      setErrorMsg('Please enter a valid email address.');
      return false;
    }

    // Password length validation
    if (password.length < 6) {
      setErrorMsg('Password must be at least 6 characters long.');
      return false;
    }

    // Registration specific validation
    if (!isLogin) {
      if (!fullName.trim()) {
        setErrorMsg('Please provide your full name.');
        return false;
      }
      if (password !== confirmPassword) {
        setErrorMsg('Passwords do not match.');
        return false;
      }
    }

    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateInputs()) return;

    setIsSubmitting(true);
    setErrorMsg('');
    setSuccessMsg('');

    try {
      if (isLogin) {
        // FR-02: Login Flow
        const { error } = await signIn({ email: email.trim(), password });
        if (error) {
          if (error.message.toLowerCase().includes('invalid login credentials')) {
            setErrorMsg('Invalid email or password. Please try again.');
          } else if (error.message.toLowerCase().includes('email not confirmed')) {
            setErrorMsg('Email address not confirmed. Please verify your email inbox.');
          } else {
            setErrorMsg(error.message || 'Failed to authenticate.');
          }
        }
      } else {
        // FR-01: Registration Flow
        const { error, isExistingUser, isEmailConfirmationRequired } = await signUp({
          email: email.trim(),
          password,
          fullName: fullName.trim(),
        });

        if (error) {
          // FR-01: Handle Duplicate or Invalid Registration
          if (error.message.toLowerCase().includes('already registered')) {
            setErrorMsg('An account with this email address already exists. Please log in.');
          } else {
            setErrorMsg(error.message || 'Registration failed.');
          }
        } else if (isExistingUser) {
          setErrorMsg('An account with this email already exists. Please sign in.');
        } else if (isEmailConfirmationRequired) {
          setSuccessMsg(
            'Registration successful! Please check your email for the confirmation link to activate your account.'
          );
        } else {
          setSuccessMsg('Account created successfully! Logging you in...');
        }
      }
    } catch (err) {
      setErrorMsg('An unexpected error occurred. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="auth-card-container">
      <div className="auth-card">
        {/* Header Branding */}
        <div className="auth-header">
          <div className="auth-icon-badge">
            <ShieldCheck size={32} className="text-accent" />
          </div>
          <h2 className="auth-title">Memory Vault</h2>
          <p className="auth-subtitle">
            {isLogin
              ? 'Securely authenticate to access your personal encrypted vault'
              : 'Create an account to protect and manage your private data'}
          </p>
        </div>

        {/* Tab Switcher */}
        <div className="auth-tabs" role="tablist">
          <button
            type="button"
            className={`auth-tab ${isLogin ? 'active' : ''}`}
            onClick={() => switchTab(true)}
          >
            Sign In (FR-02)
          </button>
          <button
            type="button"
            className={`auth-tab ${!isLogin ? 'active' : ''}`}
            onClick={() => switchTab(false)}
          >
            Create Account (FR-01)
          </button>
        </div>

        {/* Feedback Alerts */}
        {errorMsg && (
          <div className="alert alert-error" role="alert">
            <AlertCircle size={18} className="alert-icon" />
            <span>{errorMsg}</span>
          </div>
        )}

        {successMsg && (
          <div className="alert alert-success" role="alert">
            <CheckCircle size={18} className="alert-icon" />
            <span>{successMsg}</span>
          </div>
        )}

        {/* Auth Form */}
        <form onSubmit={handleSubmit} className="auth-form" noValidate>
          {/* FR-01: Full Name (Registration only) */}
          {!isLogin && (
            <div className="form-group">
              <label htmlFor="fullName">Full Name</label>
              <div className="input-wrapper">
                <User size={18} className="input-icon" />
                <input
                  id="fullName"
                  type="text"
                  placeholder="John Doe"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  disabled={isSubmitting}
                  required
                />
              </div>
            </div>
          )}

          {/* Email field */}
          <div className="form-group">
            <label htmlFor="email">Email Address</label>
            <div className="input-wrapper">
              <Mail size={18} className="input-icon" />
              <input
                id="email"
                type="email"
                placeholder="name@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                disabled={isSubmitting}
                required
                autoComplete="email"
              />
            </div>
          </div>

          {/* Password field */}
          <div className="form-group">
            <label htmlFor="password">Password</label>
            <div className="input-wrapper">
              <Lock size={18} className="input-icon" />
              <input
                id="password"
                type={showPassword ? 'text' : 'password'}
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                disabled={isSubmitting}
                required
                autoComplete={isLogin ? 'current-password' : 'new-password'}
              />
              <button
                type="button"
                className="toggle-password-btn"
                onClick={() => setShowPassword(!showPassword)}
                tabIndex="-1"
                aria-label={showPassword ? 'Hide password' : 'Show password'}
              >
                {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
            {!isLogin && <span className="helper-text">Minimum 6 characters</span>}
          </div>

          {/* Confirm Password (Registration only) */}
          {!isLogin && (
            <div className="form-group">
              <label htmlFor="confirmPassword">Confirm Password</label>
              <div className="input-wrapper">
                <Lock size={18} className="input-icon" />
                <input
                  id="confirmPassword"
                  type={showPassword ? 'text' : 'password'}
                  placeholder="••••••••"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  disabled={isSubmitting}
                  required
                  autoComplete="new-password"
                />
              </div>
            </div>
          )}

          {/* Submit Button */}
          <button
            type="submit"
            className="btn btn-primary"
            disabled={isSubmitting}
          >
            {isSubmitting ? (
              <span className="spinner-label">
                <span className="spinner"></span> Processing...
              </span>
            ) : (
              <>
                {isLogin ? 'Sign In' : 'Create Account'}
                <ArrowRight size={18} />
              </>
            )}
          </button>
        </form>

        {/* Footer switch prompt */}
        <div className="auth-footer">
          <p>
            {isLogin ? "Don't have an account yet?" : 'Already have an account?'}
            <button
              type="button"
              className="btn-link"
              onClick={() => switchTab(!isLogin)}
            >
              {isLogin ? 'Register now' : 'Sign in here'}
            </button>
          </p>
        </div>
      </div>
    </div>
  );
};
