import React, { useState } from 'react';
import { supabase } from '../services/supabase';
import { User, Mail, Lock, MapPin, ArrowLeft, Sparkles, Shield, Eye, EyeOff, Users } from 'lucide-react';
import { useTheme } from '../contexts/ThemeContext';
import ThemeToggle from './ThemeToggle';

const CustomerAuth = ({ onAuthSuccess, setCurrentScreen }) => {
  const theme = useTheme();
  const [authMode, setAuthMode] = useState('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [authError, setAuthError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

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

  const inputStyle = {
    width: '100%',
    padding: `${theme.spacing.md} ${theme.spacing.lg}`,
    background: theme.colors.input,
    border: `2px solid ${theme.colors.inputBorder}`,
    borderRadius: theme.borderRadius.large,
    fontSize: theme.typography.fontSize.base,
    color: theme.colors.inputText,
    outline: 'none',
    transition: theme.animations.normal,
    fontFamily: theme.typography.fontFamily.sans,
    boxSizing: 'border-box',
    '::placeholder': {
      color: theme.colors.inputPlaceholder,
    },
  };

  const labelStyle = {
    display: 'flex',
    alignItems: 'center',
    gap: theme.spacing.sm,
    marginBottom: theme.spacing.sm,
    color: theme.colors.textPrimary,
    fontSize: theme.typography.fontSize.sm,
    fontWeight: theme.typography.fontWeight.semibold,
    fontFamily: theme.typography.fontFamily.sans,
  };

  return (
    <>
      <style>{`
        @keyframes float {
          0%, 100% { transform: translate(0, 0) rotate(0deg); }
          25% { transform: translate(30px, -20px) rotate(90deg); }
          50% { transform: translate(-20px, -30px) rotate(180deg); }
          75% { transform: translate(-30px, -20px) rotate(270deg); }
        }
        
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
        
        @keyframes pulse {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.8; }
        }
        
        @keyframes gradient {
          0% { background-position: 0% 50%; }
          50% { background-position: 100% 50%; }
          100% { background-position: 0% 50%; }
        }
        
        .customer-auth-background {
          background: ${theme.colors.background};
          background-size: 400% 400%;
          animation: gradient 15s ease infinite;
        }
        
        @media (max-width: ${theme.breakpoints.mobile}) {
          .customer-auth-container {
            padding: ${theme.spacing.md} !important;
          }
          
          .customer-auth-card {
            padding: ${theme.spacing.xl} !important;
            margin: ${theme.spacing.md} !important;
          }
          
          .customer-auth-back-button span {
            display: none !important;
          }
        }
      `}</style>
      
      <div 
        className="customer-auth-container customer-auth-background"
        style={{ 
          minHeight: '100vh', 
          display: 'flex', 
          alignItems: 'center', 
          justifyContent: 'center', 
          padding: theme.spacing.lg,
          position: 'relative',
          overflow: 'hidden'
        }}
      >
        {/* Theme Toggle */}
        <div style={{
          position: 'absolute',
          top: theme.spacing.lg,
          right: theme.spacing.lg,
          zIndex: theme.zIndex.fixed,
        }}>
          <ThemeToggle size="md" />
        </div>
        
        {/* Back Button */}
        <button
          className="customer-auth-back-button"
          onClick={() => setCurrentScreen('welcome')}
          style={{
            position: 'absolute',
            top: theme.spacing.lg,
            left: theme.spacing.lg,
            background: theme.colors.glass,
            border: `1px solid ${theme.colors.glassBorder}`,
            borderRadius: theme.borderRadius.medium,
            padding: theme.spacing.sm,
            color: theme.colors.textPrimary,
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: theme.spacing.xs,
            fontSize: theme.typography.fontSize.sm,
            fontWeight: theme.typography.fontWeight.medium,
            transition: theme.animations.normal,
            backdropFilter: 'blur(20px)',
            WebkitBackdropFilter: 'blur(20px)',
            zIndex: theme.zIndex.fixed,
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.background = theme.colors.glassHover;
            e.currentTarget.style.transform = 'translateY(-2px)';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.background = theme.colors.glass;
            e.currentTarget.style.transform = 'translateY(0)';
          }}
        >
          <ArrowLeft size={16} />
          <span>Back</span>
        </button>
        
        {/* Background Effects */}
        <div style={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: `radial-gradient(circle at 30% 40%, ${theme.colors.primary}15 0%, transparent 50%), radial-gradient(circle at 70% 80%, ${theme.colors.secondary}15 0%, transparent 50%)`,
          opacity: 0.6,
        }} />
        
        {/* Floating Orbs */}
        <div style={{
          position: 'absolute',
          width: '250px',
          height: '250px',
          borderRadius: '50%',
          background: theme.gradients.primary,
          opacity: 0.1,
          top: '5%',
          right: '5%',
          animation: 'float 25s infinite ease-in-out',
          zIndex: 1,
        }} />
        
        <div style={{
          position: 'absolute',
          width: '180px',
          height: '180px',
          borderRadius: '50%',
          background: theme.gradients.secondary,
          opacity: 0.08,
          bottom: '10%',
          left: '10%',
          animation: 'float 20s infinite ease-in-out reverse',
          zIndex: 1,
        }} />
        
        {/* Main Auth Card */}
        <div 
          className="customer-auth-card"
          style={{ 
            width: '100%', 
            maxWidth: '420px', 
            background: theme.colors.cardBackground,
            borderRadius: theme.borderRadius.xlarge,
            boxShadow: theme.colors.shadowLarge,
            padding: theme.spacing.xxxl,
            position: 'relative',
            zIndex: 10,
            backdropFilter: 'blur(20px)',
            WebkitBackdropFilter: 'blur(20px)',
            border: `1px solid ${theme.colors.border}`,
            overflow: 'hidden'
          }}
        >
          {/* Header Gradient */}
          <div style={{
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            height: '4px',
            background: theme.gradients.primary,
          }} />
          
          {/* Header */}
          <div style={{ textAlign: 'center', marginBottom: theme.spacing.xl }}>
            <div style={{
              width: '5rem',
              height: '5rem',
              background: theme.gradients.primary,
              borderRadius: '50%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              margin: `0 auto ${theme.spacing.lg}`,
              position: 'relative',
              boxShadow: `0 10px 30px ${theme.colors.primary}40`,
              border: `3px solid ${theme.colors.cardBackground}`,
              animation: 'pulse 2s infinite ease-in-out'
            }}>
              <Users size={28} style={{ color: 'white' }} />
              <div style={{
                position: 'absolute',
                top: '-3px',
                right: '-3px',
                width: '1.5rem',
                height: '1.5rem',
                background: theme.colors.success,
                borderRadius: '50%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                border: `2px solid ${theme.colors.cardBackground}`
              }}>
                <Sparkles size={12} color="white" />
              </div>
            </div>
            
            <h2 style={{ 
              fontSize: theme.typography.fontSize['3xl'], 
              fontWeight: theme.typography.fontWeight.extrabold, 
              marginBottom: theme.spacing.sm,
              color: theme.colors.textPrimary,
              fontFamily: theme.typography.fontFamily.sans
            }}>
              Welcome to LocalSlash
            </h2>
            <p style={{ 
              color: theme.colors.textSecondary,
              fontSize: theme.typography.fontSize.base,
              lineHeight: theme.typography.lineHeight.normal,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: theme.spacing.xs,
              fontFamily: theme.typography.fontFamily.sans
            }}>
              <MapPin size={16} />
              {authMode === 'login' ? 'Sign in to find amazing deals' : 'Create an account to start saving'}
            </p>
          </div>
          
          {/* Form */}
          <form onSubmit={handleAuth} style={{ position: 'relative' }}>
            {/* Email Field */}
            <div style={{ marginBottom: theme.spacing.lg }}>
              <label style={labelStyle}>
                <Mail size={16} style={{ color: theme.colors.accent }} />
                Email Address
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                placeholder="your@email.com"
                style={inputStyle}
                onFocus={(e) => {
                  e.target.style.borderColor = theme.colors.inputFocus;
                  e.target.style.boxShadow = `0 0 0 4px ${theme.colors.inputFocus}20`;
                }}
                onBlur={(e) => {
                  e.target.style.borderColor = theme.colors.inputBorder;
                  e.target.style.boxShadow = 'none';
                }}
              />
            </div>
            
            {/* Password Field */}
            <div style={{ marginBottom: theme.spacing.xl }}>
              <label style={labelStyle}>
                <Lock size={16} style={{ color: theme.colors.accent }} />
                Password
              </label>
              <div style={{ position: 'relative' }}>
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  placeholder="Enter your password"
                  style={{
                    ...inputStyle,
                    paddingRight: '3rem',
                  }}
                  onFocus={(e) => {
                    e.target.style.borderColor = theme.colors.inputFocus;
                    e.target.style.boxShadow = `0 0 0 4px ${theme.colors.inputFocus}20`;
                  }}
                  onBlur={(e) => {
                    e.target.style.borderColor = theme.colors.inputBorder;
                    e.target.style.boxShadow = 'none';
                  }}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  style={{
                    position: 'absolute',
                    right: theme.spacing.md,
                    top: '50%',
                    transform: 'translateY(-50%)',
                    background: 'none',
                    border: 'none',
                    color: theme.colors.textSecondary,
                    cursor: 'pointer',
                    padding: theme.spacing.xs,
                    borderRadius: theme.borderRadius.small,
                    transition: theme.animations.normal
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.color = theme.colors.accent;
                    e.currentTarget.style.background = theme.colors.glass;
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.color = theme.colors.textSecondary;
                    e.currentTarget.style.background = 'none';
                  }}
                >
                  {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                </button>
              </div>
            </div>
            
            {/* Error Message */}
            {authError && (
              <div style={{ 
                marginBottom: theme.spacing.lg, 
                padding: theme.spacing.md,
                background: `${theme.colors.danger}10`,
                border: `1px solid ${theme.colors.danger}40`,
                borderRadius: theme.borderRadius.medium,
                color: theme.colors.danger,
                fontSize: theme.typography.fontSize.sm,
                display: 'flex',
                alignItems: 'center',
                gap: theme.spacing.sm,
                fontFamily: theme.typography.fontFamily.sans
              }}>
                <Shield size={16} />
                {authError}
              </div>
            )}
            
            {/* Submit Button */}
            <button
              type="submit"
              disabled={isLoading}
              style={{
                width: '100%',
                background: theme.gradients.primary,
                color: 'white',
                padding: `${theme.spacing.md} ${theme.spacing.lg}`,
                borderRadius: theme.borderRadius.large,
                fontWeight: theme.typography.fontWeight.bold,
                fontSize: theme.typography.fontSize.base,
                cursor: isLoading ? 'not-allowed' : 'pointer',
                border: 'none',
                opacity: isLoading ? 0.7 : 1,
                transition: theme.animations.normal,
                boxShadow: `0 10px 30px ${theme.colors.primary}40`,
                position: 'relative',
                overflow: 'hidden',
                fontFamily: theme.typography.fontFamily.sans,
                marginBottom: theme.spacing.md
              }}
              onMouseEnter={(e) => {
                if (!isLoading) {
                  e.currentTarget.style.transform = 'translateY(-2px)';
                  e.currentTarget.style.boxShadow = `0 15px 40px ${theme.colors.primary}60`;
                }
              }}
              onMouseLeave={(e) => {
                if (!isLoading) {
                  e.currentTarget.style.transform = 'translateY(0)';
                  e.currentTarget.style.boxShadow = `0 10px 30px ${theme.colors.primary}40`;
                }
              }}
            >
              {isLoading ? (
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: theme.spacing.sm }}>
                  <div style={{
                    width: '20px',
                    height: '20px',
                    border: '2px solid rgba(255, 255, 255, 0.3)',
                    borderTopColor: 'white',
                    borderRadius: '50%',
                    animation: 'spin 1s linear infinite'
                  }} />
                  Processing...
                </div>
              ) : (
                authMode === 'login' ? 'Sign In' : 'Create Account'
              )}
            </button>
          </form>
          
          {/* Guest Mode Button */}
          <button
            onClick={handleGuestMode}
            style={{
              width: '100%',
              background: theme.colors.glass,
              border: `2px solid ${theme.colors.border}`,
              color: theme.colors.textPrimary,
              padding: `${theme.spacing.md} ${theme.spacing.lg}`,
              borderRadius: theme.borderRadius.large,
              fontWeight: theme.typography.fontWeight.semibold,
              fontSize: theme.typography.fontSize.base,
              cursor: 'pointer',
              transition: theme.animations.normal,
              backdropFilter: 'blur(10px)',
              WebkitBackdropFilter: 'blur(10px)',
              marginBottom: theme.spacing.lg,
              fontFamily: theme.typography.fontFamily.sans
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = theme.colors.glassHover;
              e.currentTarget.style.transform = 'translateY(-2px)';
              e.currentTarget.style.borderColor = theme.colors.primary;
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = theme.colors.glass;
              e.currentTarget.style.transform = 'translateY(0)';
              e.currentTarget.style.borderColor = theme.colors.border;
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: theme.spacing.sm }}>
              <User size={18} />
              Continue as Guest
            </div>
          </button>
          
          {/* Toggle Auth Mode */}
          <div style={{ textAlign: 'center' }}>
            <button
              onClick={() => {
                setAuthMode(authMode === 'login' ? 'signup' : 'login');
                setAuthError('');
              }}
              style={{
                color: theme.colors.textSecondary,
                background: 'none',
                border: 'none',
                cursor: 'pointer',
                fontSize: theme.typography.fontSize.sm,
                padding: theme.spacing.sm,
                borderRadius: theme.borderRadius.medium,
                transition: theme.animations.normal,
                fontFamily: theme.typography.fontFamily.sans
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.color = theme.colors.primary;
                e.currentTarget.style.background = theme.colors.glass;
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.color = theme.colors.textSecondary;
                e.currentTarget.style.background = 'none';
              }}
            >
              {authMode === 'login' ? "Don't have an account? Sign up" : 'Already have an account? Sign in'}
            </button>
          </div>
        </div>
      </div>
    </>
  );
};

export default CustomerAuth;