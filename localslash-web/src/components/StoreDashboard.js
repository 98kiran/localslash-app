import React, { useState, useEffect } from 'react';
import { Store, BarChart, ShoppingBag, TrendingUp } from 'lucide-react';
import DashboardOverview from './DashboardOverview';
import StoreProfile from './StoreProfile';
import DealsManager from './DealsManager';
import Analytics from './Analytics';
import { supabase } from '../services/supabase';

const StoreDashboard = ({ user, store, deals, setCurrentScreen, onSignOut, onStoreUpdate, onDealsUpdate }) => {
  const [view, setView] = useState('dashboard');
  
  // Set up real-time subscription for deal redemptions
  useEffect(() => {
    if (!store) return;

    console.log('Setting up real-time subscription for store:', store.id);

    // Subscribe to changes in deals for this store
    const dealsSubscription = supabase
      .channel(`deals-${store.id}`)
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'deals',
          filter: `store_id=eq.${store.id}`
        },
        (payload) => {
          console.log('Deal updated:', payload);
          // Refresh deals when any deal is updated
          onDealsUpdate();
        }
      )
      .subscribe();

    // Subscribe to new redemptions
    const redemptionsSubscription = supabase
      .channel(`redemptions-${store.id}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'deal_redemptions',
          filter: `store_id=eq.${store.id}`
        },
        (payload) => {
          console.log('New redemption:', payload);
          // Refresh deals to update counts
          onDealsUpdate();
        }
      )
      .subscribe();

    // Cleanup subscriptions on unmount
    return () => {
      console.log('Cleaning up real-time subscriptions');
      supabase.removeChannel(dealsSubscription);
      supabase.removeChannel(redemptionsSubscription);
    };
  }, [store, onDealsUpdate]);

  // Auto-refresh every 30 seconds as backup
  useEffect(() => {
    if (!store) return;

    const interval = setInterval(() => {
      console.log('Auto-refreshing deals data');
      onDealsUpdate();
    }, 30000); // 30 seconds

    return () => clearInterval(interval);
  }, [store, onDealsUpdate]);
  
  const renderContent = () => {
    switch (view) {
      case 'dashboard':
        return <DashboardOverview store={store} deals={deals} />;
      case 'profile':
        return <StoreProfile store={store} onUpdate={onStoreUpdate} />;
      case 'deals':
        return <DealsManager store={store} deals={deals} onDealsUpdate={onDealsUpdate} />;
      case 'analytics':
        return <Analytics store={store} deals={deals} />;
      default:
        return <DashboardOverview store={store} deals={deals} />;
    }
  };
  
  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#f9fafb' }}>
      {/* Header */}
      <div style={{ backgroundColor: 'white', boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)' }}>
        <div style={{ maxWidth: '80rem', margin: '0 auto', padding: '1rem 2rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
            <Store size={32} style={{ color: '#2563eb' }} />
            <div>
              <h1 style={{ fontSize: '1.5rem', fontWeight: 'bold' }}>{store?.name || 'Store Dashboard'}</h1>
              <p style={{ fontSize: '0.875rem', color: '#6b7280' }}>{store?.address}</p>
            </div>
          </div>
          
          <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
            <button
              onClick={onDealsUpdate}
              style={{
                padding: '0.5rem 1rem',
                borderRadius: '0.375rem',
                border: '1px solid #d1d5db',
                backgroundColor: 'white',
                cursor: 'pointer',
                fontSize: '0.875rem',
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem'
              }}
              title="Refresh data"
            >
              🔄 Refresh
            </button>
            <button
              onClick={onSignOut}
              style={{
                padding: '0.5rem 1rem',
                borderRadius: '0.375rem',
                backgroundColor: '#ef4444',
                color: 'white',
                border: 'none',
                cursor: 'pointer'
              }}
            >
              Sign Out
            </button>
          </div>
        </div>
      </div>
      
      {/* Navigation tabs */}
      <div style={{ backgroundColor: 'white', borderBottom: '1px solid #e5e7eb' }}>
        <div style={{ maxWidth: '80rem', margin: '0 auto', padding: '0 2rem' }}>
          <div style={{ display: 'flex', gap: '2rem' }}>
            {[
              { id: 'dashboard', label: 'Dashboard', icon: BarChart },
              { id: 'profile', label: 'Store Profile', icon: Store },
              { id: 'deals', label: 'Deals', icon: ShoppingBag },
              { id: 'analytics', label: 'Analytics', icon: TrendingUp }
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setView(tab.id)}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.5rem',
                  padding: '1rem 0',
                  backgroundColor: 'transparent',
                  border: 'none',
                  borderBottom: view === tab.id ? '2px solid #2563eb' : '2px solid transparent',
                  color: view === tab.id ? '#2563eb' : '#6b7280',
                  fontWeight: view === tab.id ? '500' : '400',
                  cursor: 'pointer'
                }}
              >
                <tab.icon size={20} />
                {tab.label}
              </button>
            ))}
          </div>
        </div>
      </div>
      
      {/* Content */}
      <div style={{ maxWidth: '80rem', margin: '0 auto', padding: '2rem' }}>
        {renderContent()}
      </div>
    </div>
  );
};

export default StoreDashboard;