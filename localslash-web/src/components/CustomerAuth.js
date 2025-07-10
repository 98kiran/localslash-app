import React, { useState } from 'react';
import { supabase } from '../services/supabase';
import { User, Mail, Lock, MapPin, ArrowLeft } from 'lucide-react';
import { theme } from '../styles/theme';
import { glassEffect, cardStyle, buttonStyle, containerStyle } from '../styles/componentStyles';

const CustomerAuth = ({ onAuthSuccess, setCurrentScreen }) => {
  const [authMode, setAuthMode] = useState('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [authError, setAuthError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleAuth = async (e) => {
    e.preventDefault();
    setAuthError('');
    setIsLoading(true);
    
    try {
      if (authMode === 'signup') {
        const { data, error } = await supabase.auth.signUp({
          email,
          password,
          options: {
            data: { user_type: 'customer' },
            emailRedirectTo: window.location.origin
          }
        });
        
        if (error) throw error;
        
        if (data?.user?.identities?.length === 0) {
          setAuthError('Please check your email to confirm your account.');
          return;
        }
        
        if (data.user) {
          onAuthSuccess(data.user);
        }
      } else {
        const { data, error } = await supabase.auth.signInWithPassword({
          email,
          password
        });
        
        if (error) throw error;
        if (data.user) {
          onAuthSuccess(data.user);
        }
      }
    } catch (error) {
      setAuthError(error.message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleGuestMode = () => {
    onAuthSuccess(null);
  };

  const styles = {
    container: {
      minHeight: '100vh',
      backgroundColor: theme.colors.background,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: theme.spacing.lg,
    },
    
    backButton: {
      position: 'absolute',
      top: theme.spacing.lg,
      left: theme.spacing.lg,
      ...buttonStyle,
      background: 'transparent',
      color: theme.colors.primary,
      display: 'flex',
      alignItems: 'center',
      gap: theme.spacing.xs,
      padding: theme.spacing.sm,
    },
    
    card: {
      ...cardStyle,
      width: '100%',
      maxWidth: '28rem',
      padding: theme.spacing.xl,
    },
    
    header: {
      textAlign: 'center',
      marginBottom: theme.spacing.xl,
    },
    
    iconContainer: {
      display: 'flex',
      justifyContent: 'center',
      marginBottom: theme.spacing.lg,
    },
    
    icon: {
      width: '80px',
      height: '80px',
      background: `linear-gradient(135deg, ${theme.colors.primary} 0%, ${theme.colors.secondary} 100%)`,
      borderRadius: theme.borderRadius.xlarge,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      boxShadow: `0 10px 30px ${theme.colors.primary}30`,
    },
    
    title: {
      fontSize: 'clamp(1.25rem, 3vw, 1.5rem)',
      fontWeight: 'bold',
      marginBottom: theme.spacing.sm,
      color: theme.colors.textPrimary,
    },
    
    subtitle: {
      color: theme.colors.textSecondary,
      fontSize: '0.875rem',
    },
    
    form: {
      display: 'flex',
      flexDirection: 'column',
      gap: theme.spacing.md,
    },
    
    inputGroup: {
      display: 'flex',
      flexDirection: 'column',
      gap: theme.spacing.sm,
    },
    
    label: {
      display: 'flex',
      alignItems: 'center',
      gap: theme.spacing.sm,
      fontSize: '0.875rem',
      color: theme.colors.textPrimary,
      fontWeight: '500',
    },
    
    input: {
      width: '100%',
      padding: `${theme.spacing.sm} ${theme.spacing.md}`,
      border: `1px solid ${theme.colors.border}`,
      borderRadius: theme.borderRadius.medium,
      fontSize: '1rem',
      backgroundColor: theme.colors.cardBackground,
      color: theme.colors.textPrimary,
      transition: 'all 0.3s ease',
      outline: 'none',
    },
    
    inputFocus: {
      borderColor: theme.colors.primary,
      boxShadow: `0 0 0 4px ${theme.colors.primary}10`,
    },
    
    errorBox: {
      padding: theme.spacing.md,
      backgroundColor: `${theme.colors.danger}10`,
      border: `1px solid ${theme.colors.danger}20`,
      borderRadius: theme.borderRadius.medium,
      color: theme.colors.danger,
      fontSize: '0.875rem',
    },
    
    submitButton: {
      ...buttonStyle,
      backgroundColor: theme.colors.primary,
      color: 'white',
      padding: theme.spacing.md,
      fontSize: '1rem',
      fontWeight: '600',
      marginTop: theme.spacing.sm,
    },
    
    submitButtonDisabled: {
      opacity: 0.5,
      cursor: 'not-allowed',
    },
    
    guestButton: {
      ...buttonStyle,
      backgroundColor: `${theme.colors.textSecondary}10`,
      color: theme.colors.textPrimary,
      padding: theme.spacing.md,
      fontSize: '1rem',
      marginTop: theme.spacing.md,
    },
    
    toggleMode: {
      marginTop: theme.spacing.lg,
      textAlign: 'center',
    },
    
    toggleButton: {
      background: 'transparent',
      border: 'none',
      color: theme.colors.primary,
      cursor: 'pointer',
      fontSize: '0.875rem',
      textDecoration: 'underline',
    },
  };

  return (
    <div style={styles.container}>
      <button
        onClick={() => setCurrentScreen('welcome')}
        style={styles.backButton}
        onMouseOver={(e) => e.currentTarget.style.opacity = '0.7'}
        onMouseOut={(e) => e.currentTarget.style.opacity = '1'}
      >
        <ArrowLeft size={20} />
        <span style={{ display: window.innerWidth > 480 ? 'inline' : 'none' }}>Back</span>
      </button>

      <div style={styles.card}>
        <div style={styles.header}>
          <div style={styles.iconContainer}>
            <div style={styles.icon}>
              <MapPin size={40} color="white" />
            </div>
          </div>
          <h2 style={styles.title}>Welcome to LocalSlash</h2>
          <p style={styles.subtitle}>
            {authMode === 'login' ? 'Sign in to find amazing deals' : 'Create an account to start saving'}
          </p>
        </div>
        
        <form onSubmit={handleAuth} style={styles.form}>
          <div style={styles.inputGroup}>
            <label style={styles.label}>
              <Mail size={16} color={theme.colors.textSecondary} />
              Email
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              placeholder="you@example.com"
              style={styles.input}
              onFocus={(e) => {
                e.target.style.borderColor = theme.colors.primary;
                e.target.style.boxShadow = `0 0 0 4px ${theme.colors.primary}10`;
              }}
              onBlur={(e) => {
                e.target.style.borderColor = theme.colors.border;
                e.target.style.boxShadow = 'none';
              }}
            />
          </div>
          
          <div style={styles.inputGroup}>
            <label style={styles.label}>
              <Lock size={16} color={theme.colors.textSecondary} />
              Password
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              placeholder="••••••••"
              style={styles.input}
              onFocus={(e) => {
                e.target.style.borderColor = theme.colors.primary;
                e.target.style.boxShadow = `0 0 0 4px ${theme.colors.primary}10`;
              }}
              onBlur={(e) => {
                e.target.style.borderColor = theme.colors.border;
                e.target.style.boxShadow = 'none';
              }}
            />
          </div>
          
          {authError && (
            <div style={styles.errorBox}>
              {authError}
            </div>
          )}
          
          <button
            type="submit"
            disabled={isLoading}
            style={{
              ...styles.submitButton,
              ...(isLoading ? styles.submitButtonDisabled : {})
            }}
            onMouseOver={(e) => !isLoading && (e.currentTarget.style.backgroundColor = '#0051D5')}
            onMouseOut={(e) => !isLoading && (e.currentTarget.style.backgroundColor = theme.colors.primary)}
          >
            {isLoading ? 'Processing...' : (authMode === 'login' ? 'Sign In' : 'Create Account')}
          </button>
        </form>
        
        <button
          onClick={handleGuestMode}
          style={styles.guestButton}
          onMouseOver={(e) => e.currentTarget.style.backgroundColor = `${theme.colors.textSecondary}20`}
          onMouseOut={(e) => e.currentTarget.style.backgroundColor = `${theme.colors.textSecondary}10`}
        >
          Continue as Guest
        </button>
        
        <div style={styles.toggleMode}>
          <button
            onClick={() => {
              setAuthMode(authMode === 'login' ? 'signup' : 'login');
              setAuthError('');
            }}
            style={styles.toggleButton}
          >
            {authMode === 'login' ? "Don't have an account? Sign up" : 'Already have an account? Sign in'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default CustomerAuth;