import React, { useState, useEffect } from 'react';
import { supabase } from '../services/supabase';
import { useTheme } from '../contexts/ThemeContext';
import StoreAuth from './StoreAuth';
import StoreSetup from './StoreSetup';
import StoreDashboard from './StoreDashboard';
import StoreSelector from './StoreSelector';
import ThemeToggle from './ThemeToggle';


const StoreApp = ({ setCurrentScreen }) => {
  const theme = useTheme();
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [user, setUser] = useState(null);
  const [stores, setStores] = useState([]);
  const [selectedStore, setSelectedStore] = useState(null);
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
        await loadStores(user.id);
      }
    } catch (error) {
      console.error('Auth check error:', error);
    } finally {
      setIsLoading(false);
    }
  };
  
  const loadStores = async (userId) => {
    try {
      const { data, error } = await supabase
        .from('stores')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      
      if (data && data.length > 0) {
        setStores(data);
        // Auto-select the first store or previously selected store
        const lastSelectedStoreId = localStorage.getItem('lastSelectedStoreId');
        const storeToSelect = data.find(s => s.id === lastSelectedStoreId) || data[0];
        setSelectedStore(storeToSelect);
        await loadDeals(storeToSelect.id);
      } else {
        // No stores found, show setup
        setShowStoreSetup(true);
      }
    } catch (error) {
      console.error('Load stores error:', error);
      setShowStoreSetup(true);
    }
  };
  
  const loadDeals = async (storeId) => {
    try {
      console.log('Loading deals for store:', storeId);
      
      // Get deals with current redemption counts
      const { data: dealsData, error: dealsError } = await supabase
        .from('deals')
        .select('*')
        .eq('store_id', storeId)
        .order('created_at', { ascending: false });
      
      if (dealsError) throw dealsError;
      
      // Get actual redemption counts from deal_redemptions table
      const { data: redemptionCounts, error: countError } = await supabase
        .from('deal_redemptions')
        .select('deal_id')
        .eq('store_id', storeId);
      
      if (!countError && redemptionCounts) {
        // Count redemptions per deal
        const countMap = {};
        redemptionCounts.forEach(r => {
          countMap[r.deal_id] = (countMap[r.deal_id] || 0) + 1;
        });
        
        // Update deals with actual counts
        const dealsWithCounts = dealsData.map(deal => ({
          ...deal,
          current_redemptions: countMap[deal.id] || 0
        }));
        
        console.log('Deals with redemption counts:', dealsWithCounts);
        setDeals(dealsWithCounts);
        
        // Also update the current_redemptions in deals table for consistency
        for (const deal of dealsWithCounts) {
          if (deal.current_redemptions !== (deal.current_redemptions || 0)) {
            await supabase
              .from('deals')
              .update({ current_redemptions: deal.current_redemptions })
              .eq('id', deal.id);
          }
        }
      } else {
        setDeals(dealsData || []);
      }
    } catch (error) {
      console.error('Load deals error:', error);
      setDeals([]);
    }
  };
  
  const handleAuthSuccess = async (user) => {
    setUser(user);
    setIsAuthenticated(true);
    await loadStores(user.id);
  };
  
  const handleSetupComplete = async (newStore) => {
    // Add the new store to the stores array
    const updatedStores = [...stores, newStore];
    setStores(updatedStores);
    setSelectedStore(newStore);
    setShowStoreSetup(false);
    await loadDeals(newStore.id);
  };
  
  const handleStoreSelect = async (store) => {
    setSelectedStore(store);
    localStorage.setItem('lastSelectedStoreId', store.id);
    await loadDeals(store.id);
  };
  
  const handleCreateStore = () => {
    setShowStoreSetup(true);
  };
  
  const handleSignOut = async () => {
    await supabase.auth.signOut();
    setIsAuthenticated(false);
    setUser(null);
    setStores([]);
    setSelectedStore(null);
    setDeals([]);
    localStorage.removeItem('lastSelectedStoreId');
  };
  
  const handleStoreUpdate = (updatedStore) => {
    // Update the store in the stores array
    const updatedStores = stores.map(store => 
      store.id === updatedStore.id ? updatedStore : store
    );
    setStores(updatedStores);
    setSelectedStore(updatedStore);
  };
  
  const handleDealsUpdate = async () => {
    if (selectedStore) {
      await loadDeals(selectedStore.id);
    }
  };
  
  // Loading screen
  if (isLoading) {
    return (
      <div style={{ 
        minHeight: '100vh', 
        background: theme.colors.background,
        display: 'flex', 
        alignItems: 'center', 
        justifyContent: 'center' 
      }}>
        <div style={{ textAlign: 'center' }}>
          <div style={{
            width: '60px',
            height: '60px',
            border: `4px solid ${theme.colors.border}`,
            borderTopColor: theme.colors.primary,
            borderRadius: '50%',
            animation: 'spin 1s linear infinite',
            margin: '0 auto 1rem'
          }} />
          <p style={{ 
            fontSize: theme.typography.fontSize.lg,
            fontWeight: theme.typography.fontWeight.medium,
            color: theme.colors.textPrimary 
          }}>
            Loading LocalSlash...
          </p>
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
  
  // Auth screen
  if (!isAuthenticated) {
    return <StoreAuth onAuthSuccess={handleAuthSuccess} setCurrentScreen={setCurrentScreen} />;
  }
  
  // Store setup screen
  if (showStoreSetup) {
    return (
      <StoreSetup 
        user={user} 
        onSetupComplete={handleSetupComplete} 
        onSignOut={handleSignOut}
        onBack={() => setShowStoreSetup(false)}
        hasExistingStores={stores.length > 0}
      />
    );
  }
  
  // Main dashboard with store selector
  return (
    <div style={{ 
      minHeight: '100vh',
      background: theme.colors.background,
    }}>
      {/* Top Navigation Bar */}
      <nav style={{
        padding: `${theme.spacing.md} ${theme.spacing.lg}`,
        background: theme.colors.navBackground,
        borderBottom: `1px solid ${theme.colors.border}`,
        backdropFilter: 'blur(20px)',
        WebkitBackdropFilter: 'blur(20px)',
        position: 'sticky',
        top: 0,
        zIndex: theme.zIndex.sticky,
      }}>
        <div style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          maxWidth: '1200px',
          margin: '0 auto',
          gap: theme.spacing.md,
        }}>
          {/* Store Selector */}
          <StoreSelector
            stores={stores}
            selectedStore={selectedStore}
            onStoreSelect={handleStoreSelect}
            onCreateStore={handleCreateStore}
          />
          
          {/* Theme Toggle - Removed duplicate, only keep in StoreDashboard */}
        </div>
      </nav>
      
      {/* Main Content */}
      <StoreDashboard
        user={user}
        store={selectedStore}
        deals={deals}
        setCurrentScreen={setCurrentScreen}
        onSignOut={handleSignOut}
        onStoreUpdate={handleStoreUpdate}
        onDealsUpdate={handleDealsUpdate}
      />
    </div>
  );
};

export default StoreApp;