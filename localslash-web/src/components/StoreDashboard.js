import React, { useState, useEffect } from 'react';
import { Store, BarChart, ShoppingBag, TrendingUp, RefreshCw, LogOut, Menu, X } from 'lucide-react';
import DashboardOverview from './DashboardOverview';
import StoreProfile from './StoreProfile';
import DealsManager from './DealsManager';
import Analytics from './Analytics';
import { supabase } from '../services/supabase';
import { useTheme } from '../contexts/ThemeContext';
import ThemeToggle from './ThemeToggle';

const StoreDashboard = ({ user, store, deals, setCurrentScreen, onSignOut, onStoreUpdate, onDealsUpdate }) => {
  const theme = useTheme();
  const [view, setView] = useState('dashboard');
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);
  
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
  
  const handleRefresh = async () => {
    setIsRefreshing(true);
    try {
      await onDealsUpdate();
    } finally {
      setIsRefreshing(false);
    }
  };

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
    <>
      <style>{`
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
        
        @keyframes slideIn {
          0% { transform: translateX(-100%); opacity: 0; }
          100% { transform: translateX(0); opacity: 1; }
        }
        
        @media (max-width: ${theme.breakpoints.tablet}) {
          .store-dashboard-header {
            padding: ${theme.spacing.md} ${theme.spacing.lg} !important;
          }
          
          .store-dashboard-title {
            font-size: ${theme.typography.fontSize.lg} !important;
          }
          
          .store-dashboard-nav {
            display: none !important;
          }
          
          .store-dashboard-mobile-nav {
            display: block !important;
          }
          
          .store-dashboard-content {
            padding: ${theme.spacing.lg} !important;
          }
        }
        
        @media (max-width: ${theme.breakpoints.mobile}) {
          .store-dashboard-header {
            padding: ${theme.spacing.sm} ${theme.spacing.md} !important;
          }
          
          .store-dashboard-actions {
            gap: ${theme.spacing.xs} !important;
          }
          
          .store-dashboard-action-text {
            display: none !important;
          }
        }
      `}</style>
      
      <div style={{ 
        minHeight: '100vh', 
        background: theme.colors.background,
        color: theme.colors.textPrimary,
        fontFamily: theme.typography.fontFamily.sans
      }}>
        {/* Header */}
        <div style={{ 
          background: theme.colors.cardBackground,
          boxShadow: theme.colors.shadowMedium,
          borderBottom: `1px solid ${theme.colors.border}`,
          backdropFilter: 'blur(20px)',
          WebkitBackdropFilter: 'blur(20px)',
          position: 'sticky',
          top: 0,
          zIndex: theme.zIndex.sticky
        }}>
          <div 
            className="store-dashboard-header"
            style={{ 
              maxWidth: '80rem', 
              margin: '0 auto', 
              padding: `${theme.spacing.lg} ${theme.spacing.xl}`, 
              display: 'flex', 
              justifyContent: 'space-between', 
              alignItems: 'center' 
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: theme.spacing.lg }}>
              <div style={{
                width: '3rem',
                height: '3rem',
                background: theme.gradients.primary,
                borderRadius: theme.borderRadius.medium,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                boxShadow: `0 10px 25px ${theme.colors.primary}40`
              }}>
                <Store size={24} style={{ color: 'white' }} />
              </div>
              <div>
                <h1 
                  className="store-dashboard-title"
                  style={{ 
                    fontSize: theme.typography.fontSize['2xl'], 
                    fontWeight: theme.typography.fontWeight.bold, 
                    color: theme.colors.textPrimary,
                    marginBottom: theme.spacing.xs
                  }}
                >
                  {store?.name || 'Store Dashboard'}
                </h1>
                <p style={{ 
                  fontSize: theme.typography.fontSize.sm, 
                  color: theme.colors.textSecondary 
                }}>
                  {store?.address}
                </p>
              </div>
            </div>
            
            <div 
              className="store-dashboard-actions"
              style={{ display: 'flex', gap: theme.spacing.md, alignItems: 'center' }}
            >
              <ThemeToggle size="sm" />
              
              <button
                onClick={handleRefresh}
                disabled={isRefreshing}
                style={{
                  padding: `${theme.spacing.sm} ${theme.spacing.md}`,
                  borderRadius: theme.borderRadius.medium,
                  border: `1px solid ${theme.colors.border}`,
                  background: theme.colors.glass,
                  color: theme.colors.textPrimary,
                  cursor: isRefreshing ? 'not-allowed' : 'pointer',
                  fontSize: theme.typography.fontSize.sm,
                  fontWeight: theme.typography.fontWeight.medium,
                  display: 'flex',
                  alignItems: 'center',
                  gap: theme.spacing.xs,
                  transition: theme.animations.normal,
                  backdropFilter: 'blur(10px)',
                  WebkitBackdropFilter: 'blur(10px)',
                  opacity: isRefreshing ? 0.6 : 1
                }}
                onMouseEnter={(e) => {
                  if (!isRefreshing) {
                    e.currentTarget.style.background = theme.colors.glassHover;
                    e.currentTarget.style.transform = 'translateY(-1px)';
                  }
                }}
                onMouseLeave={(e) => {
                  if (!isRefreshing) {
                    e.currentTarget.style.background = theme.colors.glass;
                    e.currentTarget.style.transform = 'translateY(0)';
                  }
                }}
                title="Refresh data"
              >
                <RefreshCw 
                  size={16} 
                  style={{ 
                    animation: isRefreshing ? 'spin 1s linear infinite' : 'none'
                  }} 
                />
                <span className="store-dashboard-action-text">Refresh</span>
              </button>
              
              {/* Mobile menu button */}
              <button
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                style={{
                  display: 'none',
                  padding: theme.spacing.sm,
                  borderRadius: theme.borderRadius.medium,
                  border: `1px solid ${theme.colors.border}`,
                  background: theme.colors.glass,
                  color: theme.colors.textPrimary,
                  cursor: 'pointer',
                  alignItems: 'center',
                  justifyContent: 'center',
                  backdropFilter: 'blur(10px)',
                  WebkitBackdropFilter: 'blur(10px)'
                }}
                className="store-dashboard-mobile-nav"
              >
                {mobileMenuOpen ? <X size={20} /> : <Menu size={20} />}
              </button>
              
              <button
                onClick={onSignOut}
                style={{
                  padding: `${theme.spacing.sm} ${theme.spacing.md}`,
                  borderRadius: theme.borderRadius.medium,
                  background: 'linear-gradient(135deg, #ef4444 0%, #dc2626 100%)',
                  color: 'white',
                  border: 'none',
                  cursor: 'pointer',
                  fontSize: theme.typography.fontSize.sm,
                  fontWeight: theme.typography.fontWeight.medium,
                  display: 'flex',
                  alignItems: 'center',
                  gap: theme.spacing.xs,
                  transition: theme.animations.normal,
                  boxShadow: '0 4px 12px rgba(239, 68, 68, 0.3)'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.transform = 'translateY(-2px)';
                  e.currentTarget.style.boxShadow = '0 8px 20px rgba(239, 68, 68, 0.4)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = 'translateY(0)';
                  e.currentTarget.style.boxShadow = '0 4px 12px rgba(239, 68, 68, 0.3)';
                }}
              >
                <LogOut size={16} />
                <span className="store-dashboard-action-text">Sign Out</span>
              </button>
            </div>
          </div>
        </div>
        
        {/* Navigation tabs - Desktop */}
        <div 
          className="store-dashboard-nav"
          style={{ 
            background: theme.colors.cardBackground, 
            borderBottom: `1px solid ${theme.colors.border}`,
            backdropFilter: 'blur(20px)',
            WebkitBackdropFilter: 'blur(20px)'
          }}
        >
          <div style={{ maxWidth: '80rem', margin: '0 auto', padding: `0 ${theme.spacing.xl}` }}>
            <div style={{ display: 'flex', gap: theme.spacing.xl }}>
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
                    gap: theme.spacing.sm,
                    padding: `${theme.spacing.lg} 0`,
                    background: 'transparent',
                    border: 'none',
                    borderBottom: view === tab.id ? `3px solid ${theme.colors.primary}` : '3px solid transparent',
                    color: view === tab.id ? theme.colors.primary : theme.colors.textSecondary,
                    fontWeight: view === tab.id ? theme.typography.fontWeight.semibold : theme.typography.fontWeight.medium,
                    fontSize: theme.typography.fontSize.sm,
                    cursor: 'pointer',
                    transition: theme.animations.normal,
                    fontFamily: theme.typography.fontFamily.sans
                  }}
                  onMouseEnter={(e) => {
                    if (view !== tab.id) {
                      e.currentTarget.style.color = theme.colors.textPrimary;
                    }
                  }}
                  onMouseLeave={(e) => {
                    if (view !== tab.id) {
                      e.currentTarget.style.color = theme.colors.textSecondary;
                    }
                  }}
                >
                  <tab.icon size={20} />
                  {tab.label}
                </button>
              ))}
            </div>
          </div>
        </div>
        
        {/* Mobile Navigation Menu */}
        {mobileMenuOpen && (
          <div style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: 'rgba(0, 0, 0, 0.5)',
            zIndex: theme.zIndex.modal,
            display: 'none'
          }}
          className="store-dashboard-mobile-nav"
          onClick={() => setMobileMenuOpen(false)}
          >
            <div style={{
              position: 'absolute',
              top: 0,
              left: 0,
              width: '280px',
              height: '100vh',
              background: theme.colors.cardBackground,
              padding: theme.spacing.xl,
              boxShadow: theme.colors.shadowLarge,
              animation: 'slideIn 0.3s ease-out'
            }}
            onClick={(e) => e.stopPropagation()}
            >
              <div style={{ 
                display: 'flex', 
                justifyContent: 'space-between', 
                alignItems: 'center', 
                marginBottom: theme.spacing.xl,
                paddingBottom: theme.spacing.lg,
                borderBottom: `1px solid ${theme.colors.border}`
              }}>
                <h2 style={{ 
                  fontSize: theme.typography.fontSize.lg,
                  fontWeight: theme.typography.fontWeight.semibold,
                  color: theme.colors.textPrimary
                }}>
                  Navigation
                </h2>
                <button
                  onClick={() => setMobileMenuOpen(false)}
                  style={{
                    padding: theme.spacing.sm,
                    background: 'transparent',
                    border: 'none',
                    color: theme.colors.textSecondary,
                    cursor: 'pointer'
                  }}
                >
                  <X size={20} />
                </button>
              </div>
              
              {[
                { id: 'dashboard', label: 'Dashboard', icon: BarChart },
                { id: 'profile', label: 'Store Profile', icon: Store },
                { id: 'deals', label: 'Deals', icon: ShoppingBag },
                { id: 'analytics', label: 'Analytics', icon: TrendingUp }
              ].map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => {
                    setView(tab.id);
                    setMobileMenuOpen(false);
                  }}
                  style={{
                    width: '100%',
                    display: 'flex',
                    alignItems: 'center',
                    gap: theme.spacing.md,
                    padding: theme.spacing.lg,
                    background: view === tab.id ? theme.colors.glass : 'transparent',
                    border: view === tab.id ? `1px solid ${theme.colors.border}` : '1px solid transparent',
                    borderRadius: theme.borderRadius.medium,
                    color: view === tab.id ? theme.colors.primary : theme.colors.textPrimary,
                    fontWeight: view === tab.id ? theme.typography.fontWeight.semibold : theme.typography.fontWeight.medium,
                    fontSize: theme.typography.fontSize.base,
                    cursor: 'pointer',
                    transition: theme.animations.normal,
                    marginBottom: theme.spacing.sm,
                    textAlign: 'left'
                  }}
                >
                  <tab.icon size={20} />
                  {tab.label}
                </button>
              ))}
            </div>
          </div>
        )}
        
        {/* Content */}
        <div 
          className="store-dashboard-content"
          style={{ 
            maxWidth: '80rem', 
            margin: '0 auto', 
            padding: theme.spacing.xl
          }}
        >
          {renderContent()}
        </div>
      </div>
    </>
  );
};

export default StoreDashboard;