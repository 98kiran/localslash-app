import React, { useState, useEffect } from 'react';
import { supabase } from './services/supabase';
import { ThemeProvider } from './contexts/ThemeContext';
import WelcomeScreen from './components/WelcomeScreen';
import CustomerApp from './components/CustomerApp';
import StoreApp from './components/StoreApp';
import './App.css';

function App() {
  const [currentScreen, setCurrentScreen] = useState('welcome');
  const [userType, setUserType] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [user, setUser] = useState(null);

  // Check for existing session on app load
  useEffect(() => {
    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        if (event === 'SIGNED_IN' && session?.user) {
          setUser(session.user);
          await determineUserType(session.user);
        } else if (event === 'SIGNED_OUT') {
          setUser(null);
          setUserType('');
          setCurrentScreen('welcome');
        }
      }
    );

    return () => {
      subscription.unsubscribe();
    };
  }, []);


  const determineUserType = async (user) => {
    try {
      // Check if user has a store (indicating they're a store owner)
      const { data: storeData, error: storeError } = await supabase
        .from('stores')
        .select('id')
        .eq('user_id', user.id)
        .single();

      if (storeData) {
        setUserType('store');
        setCurrentScreen('storeApp');
      } else {
        // Check user_profiles table for user type
        const { data: profileData, error: profileError } = await supabase
          .from('user_profiles')
          .select('user_type')
          .eq('id', user.id)
          .single();

        if (profileData?.user_type === 'store_owner') {
          setUserType('store');
          setCurrentScreen('storeApp');
        } else {
          setUserType('customer');
          setCurrentScreen('customerApp');
        }
      }
    } catch (error) {
      console.error('Error determining user type:', error);
      // Default to customer if we can't determine
      setUserType('customer');
      setCurrentScreen('customerApp');
    }
  };

  const handleScreenChange = (screen) => {
    setCurrentScreen(screen);
  };

  const handleUserTypeChange = (type) => {
    setUserType(type);
  };

  const screenProps = {
    currentScreen,
    setCurrentScreen: handleScreenChange,
    userType,
    setUserType: handleUserTypeChange,
    user
  };

  if (isLoading) {
    return (
      <div style={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
        color: '#ffffff'
      }}>
        <div style={{ textAlign: 'center' }}>
          <div style={{
            width: '60px',
            height: '60px',
            border: '4px solid rgba(255, 255, 255, 0.3)',
            borderTopColor: '#ffffff',
            borderRadius: '50%',
            animation: 'spin 1s linear infinite',
            margin: '0 auto 1rem'
          }} />
          <p style={{ fontSize: '1.1rem', fontWeight: '500' }}>Loading LocalSlash...</p>
          <style>{`
            @keyframes spin {
              0% { transform: rotate(0deg); }
              100% { transform: rotate(360deg); }
            }
          `}</style>
        </div>
      </div>
    );
  }

  const renderScreen = () => {
    switch (currentScreen) {
      case 'welcome':
        return <WelcomeScreen {...screenProps} />;
      case 'customerApp':
        return <CustomerApp {...screenProps} />;
      case 'storeApp':
        return <StoreApp {...screenProps} />;
      default:
        return <WelcomeScreen {...screenProps} />;
    }
  };

  return (
    <ThemeProvider>
      <div className="App">
        {renderScreen()}
      </div>
    </ThemeProvider>
  );
}

export default App;