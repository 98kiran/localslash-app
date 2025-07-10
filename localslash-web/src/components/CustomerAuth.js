import React, { useState } from 'react';
import { supabase } from '../services/supabase';
import { User, Mail, Lock, MapPin } from 'lucide-react';

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
    // Allow browsing without authentication
    // Pass null as user to indicate guest mode
    onAuthSuccess(null);
  };

  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#f9fafb', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1rem' }}>
      <div style={{ width: '100%', maxWidth: '28rem', backgroundColor: 'white', borderRadius: '0.5rem', boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)', padding: '2rem' }}>
        <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
          <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '1rem' }}>
            <MapPin size={48} style={{ color: '#2563eb' }} />
          </div>
          <h2 style={{ fontSize: '1.5rem', fontWeight: 'bold', marginBottom: '0.5rem' }}>Welcome to LocalSlash</h2>
          <p style={{ color: '#6b7280' }}>
            {authMode === 'login' ? 'Sign in to find amazing deals' : 'Create an account to start saving'}
          </p>
        </div>
        
        <form onSubmit={handleAuth}>
          <div style={{ marginBottom: '1rem' }}>
            <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem', color: '#374151', fontSize: '0.875rem' }}>
              <Mail size={16} /> Email
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              placeholder="you@example.com"
              style={{
                width: '100%',
                padding: '0.5rem 0.75rem',
                border: '1px solid #d1d5db',
                borderRadius: '0.375rem',
                fontSize: '1rem'
              }}
            />
          </div>
          
          <div style={{ marginBottom: '1.5rem' }}>
            <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem', color: '#374151', fontSize: '0.875rem' }}>
              <Lock size={16} /> Password
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              placeholder="••••••••"
              style={{
                width: '100%',
                padding: '0.5rem 0.75rem',
                border: '1px solid #d1d5db',
                borderRadius: '0.375rem',
                fontSize: '1rem'
              }}
            />
          </div>
          
          {authError && (
            <div style={{ marginBottom: '1rem', padding: '0.75rem', backgroundColor: '#fef2f2', border: '1px solid #fecaca', borderRadius: '0.375rem', color: '#dc2626', fontSize: '0.875rem' }}>
              {authError}
            </div>
          )}
          
          <button
            type="submit"
            disabled={isLoading}
            style={{
              width: '100%',
              backgroundColor: '#2563eb',
              color: 'white',
              padding: '0.75rem',
              borderRadius: '0.375rem',
              fontWeight: '500',
              cursor: isLoading ? 'not-allowed' : 'pointer',
              border: 'none',
              opacity: isLoading ? 0.5 : 1
            }}
          >
            {isLoading ? 'Processing...' : (authMode === 'login' ? 'Sign In' : 'Create Account')}
          </button>
        </form>
        
        <div style={{ marginTop: '1rem' }}>
          <button
            onClick={handleGuestMode}
            style={{
              width: '100%',
              backgroundColor: '#f3f4f6',
              color: '#374151',
              padding: '0.75rem',
              borderRadius: '0.375rem',
              fontWeight: '500',
              cursor: 'pointer',
              border: 'none'
            }}
          >
            Continue as Guest
          </button>
        </div>
        
        <div style={{ marginTop: '1.5rem', textAlign: 'center' }}>
          <button
            onClick={() => {
              setAuthMode(authMode === 'login' ? 'signup' : 'login');
              setAuthError('');
            }}
            style={{
              color: '#2563eb',
              backgroundColor: 'transparent',
              border: 'none',
              cursor: 'pointer',
              textDecoration: 'underline',
              fontSize: '0.875rem'
            }}
          >
            {authMode === 'login' ? "Don't have an account? Sign up" : 'Already have an account? Sign in'}
          </button>
        </div>
        
        <div style={{ marginTop: '1rem', textAlign: 'center' }}>
          <button
            onClick={() => setCurrentScreen('welcome')}
            style={{
              color: '#6b7280',
              backgroundColor: 'transparent',
              border: 'none',
              cursor: 'pointer',
              fontSize: '0.875rem'
            }}
          >
            ← Back to Welcome
          </button>
        </div>
      </div>
    </div>
  );
};

export default CustomerAuth;