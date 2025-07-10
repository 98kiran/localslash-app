import React, { useState, useEffect } from 'react';
import { supabase } from '../services/supabase';
import StoreAuth from './StoreAuth';
import StoreSetup from './StoreSetup';
import StoreDashboard from './StoreDashboard';


const StoreApp = ({ setCurrentScreen }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [user, setUser] = useState(null);
  const [store, setStore] = useState(null);
  const [deals, setDeals] = useState([]);
  const [showStoreSetup, setShowStoreSetup] = useState(false);
  
  // Check authentication on mount
  useEffect(() => {
    checkAuth();
  }, []);
  
  const checkAuth = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        setUser(user);
        setIsAuthenticated(true);
        await loadStore(user.id);
      }
    } catch (error) {
      console.error('Auth check error:', error);
    } finally {
      setIsLoading(false);
    }
  };
  
  const loadStore = async (userId) => {
    try {
      const { data, error } = await supabase
        .from('stores')
        .select('*')
        .eq('user_id', userId)
        .single();
      
      if (data) {
        setStore(data);
        await loadDeals(data.id);
      } else if (error && error.code === 'PGRST116') {
        // No store found, show setup
        setShowStoreSetup(true);
      }
    } catch (error) {
      console.error('Load store error:', error);
    }
  };
  
  const loadDeals = async (storeId) => {
    try {
      const { data, error } = await supabase
        .from('deals')
        .select('*')
        .eq('store_id', storeId)
        .order('created_at', { ascending: false });
      
      if (data) setDeals(data);
    } catch (error) {
      console.error('Load deals error:', error);
    }
  };
  
  const handleAuthSuccess = async (user) => {
    setUser(user);
    setIsAuthenticated(true);
    await loadStore(user.id);
  };
  
  const handleSetupComplete = async (store) => {
    setStore(store);
    setShowStoreSetup(false);
    await loadDeals(store.id);
  };
  
  const handleSignOut = async () => {
    await supabase.auth.signOut();
    setIsAuthenticated(false);
    setUser(null);
    setStore(null);
    setDeals([]);
  };
  
  const handleStoreUpdate = (updatedStore) => {
    setStore(updatedStore);
  };
  
  const handleDealsUpdate = async () => {
    if (store) {
      await loadDeals(store.id);
    }
  };
  
  // Loading screen
  if (isLoading) {
    return (
      <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div style={{ textAlign: 'center' }}>
          <div style={{ fontSize: '2rem', marginBottom: '1rem' }}>⏳</div>
          <p>Loading...</p>
        </div>
      </div>
    );
  }
  
  // Auth screen
  if (!isAuthenticated) {
    return <StoreAuth onAuthSuccess={handleAuthSuccess} setCurrentScreen={setCurrentScreen} />;
  }
  
  // Store setup screen
  if (showStoreSetup) {
    return <StoreSetup user={user} onSetupComplete={handleSetupComplete} />;
  }
  
  // Main dashboard
  return (
    <StoreDashboard
      user={user}
      store={store}
      deals={deals}
      setCurrentScreen={setCurrentScreen}
      onSignOut={handleSignOut}
      onStoreUpdate={handleStoreUpdate}
      onDealsUpdate={handleDealsUpdate}
    />
  );
};

export default StoreApp;