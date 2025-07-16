import React, { useState, useEffect } from 'react';
import { supabase } from '../services/supabase';
import { User, Mail, Calendar, Heart, ShoppingBag, TrendingUp, Settings, Bell, MapPin, Sparkles, Award, Target } from 'lucide-react';
import { theme } from '../styles/theme';

const CustomerProfile = ({ user, theme: currentTheme }) => {
  const [stats, setStats] = useState({
    totalRedemptions: 0,
    totalSavings: 0,
    favoriteDeals: 0,
    favoriteStores: 0
  });
  const [recentRedemptions, setRecentRedemptions] = useState([]);
  const [preferences, setPreferences] = useState({
    notifications: true,
    location: true,
    newsletter: false
  });
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (user) {
      loadProfileData();
    }
  }, [user]);

  const loadProfileData = async () => {
    try {
      setIsLoading(true);

      // Load favorites count first (this should work)
      const { count: favoriteDealsCount, error: favoritesError } = await supabase
        .from('favorites')
        .select('deal_id', { count: 'exact', head: true })
        .eq('customer_id', user.id)
        .not('deal_id', 'is', null);

      // Try to load redemptions with a simple query first
      const { data: redemptions, error: redemptionsError } = await supabase
        .from('deal_redemptions')
        .select('*')
        .eq('customer_id', user.id)
        .order('redeemed_at', { ascending: false })
        .limit(5);

      // Handle errors gracefully
      let processedRedemptions = [];
      let favCount = 0;

      if (favoritesError) {
        console.warn('Error loading favorites:', favoritesError);
      } else {
        favCount = favoriteDealsCount || 0;
      }

      if (redemptionsError) {
        console.warn('Error loading redemptions:', redemptionsError);
      } else if (redemptions && redemptions.length > 0) {
        // Load deal and store data separately to avoid join issues
        const dealIds = redemptions.map(r => r.deal_id);
        const { data: deals } = await supabase
          .from('deals')
          .select('id, title, discount_percentage, discount_price, original_price, store_id')
          .in('id', dealIds);

        if (deals && deals.length > 0) {
          const storeIds = [...new Set(deals.map(d => d.store_id))];
          const { data: stores } = await supabase
            .from('stores')
            .select('id, name')
            .in('id', storeIds);

          // Create lookup maps
          const storesMap = {};
          (stores || []).forEach(s => storesMap[s.id] = s);
          
          const dealsMap = {};
          (deals || []).forEach(d => {
            dealsMap[d.id] = {
              ...d,
              stores: storesMap[d.store_id]
            };
          });

          // Combine data
          processedRedemptions = redemptions.map(r => ({
            ...r,
            deals: dealsMap[r.deal_id]
          }));
        }
      }

      // Calculate stats
      const totalSavings = processedRedemptions.reduce((sum, r) => {
        if (r.deals?.original_price && r.deals?.discount_price) {
          return sum + (r.deals.original_price - r.deals.discount_price);
        }
        return sum;
      }, 0);

      setStats({
        totalRedemptions: processedRedemptions.length,
        totalSavings: totalSavings,
        favoriteDeals: favCount,
        favoriteStores: 0 // Simplified - removed store favorites for now
      });

      setRecentRedemptions(processedRedemptions);
    } catch (error) {
      console.error('Error loading profile data:', error);
      // Set default stats on error
      setStats({
        totalRedemptions: 0,
        totalSavings: 0,
        favoriteDeals: 0,
        favoriteStores: 0
      });
      setRecentRedemptions([]);
    } finally {
      setIsLoading(false);
    }
  };

  const handlePreferenceChange = async (key, value) => {
    setPreferences(prev => ({ ...prev, [key]: value }));
    // In a real app, you'd save these preferences to the database
  };

  // Use currentTheme if provided, otherwise fallback to default theme
  const profileTheme = currentTheme || {
    cardBg: '#ffffff',
    text: '#1a1a1a',
    textSecondary: '#6b7280',
    border: 'rgba(0, 0, 0, 0.08)',
    accent: '#6366f1',
    accentSecondary: '#a855f7',
    glass: 'rgba(255, 255, 255, 0.7)',
    bg: '#f0f2f5'
  };

  if (isLoading) {
    return (
      <div style={{ 
        padding: '2rem', 
        textAlign: 'center',
        background: profileTheme.bg,
        minHeight: '400px',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        alignItems: 'center'
      }}>
        <div style={{ 
          width: '3rem', 
          height: '3rem', 
          border: `3px solid ${profileTheme.border}`,
          borderTopColor: profileTheme.accent,
          borderRadius: '50%',
          animation: 'spin 1s linear infinite',
          margin: '0 auto 1rem'
        }} />
        <p style={{ color: profileTheme.textSecondary }}>Loading your profile...</p>
        <style>{`
          @keyframes spin {
            to { transform: rotate(360deg); }
          }
        `}</style>
      </div>
    );
  }

  return (
    <div style={{ 
      padding: '1.5rem',
      background: profileTheme.bg,
      minHeight: '100vh',
      width: '100%',
      boxSizing: 'border-box'
    }}>
      {/* Profile Header */}
      <div style={{ 
        background: profileTheme.cardBg,
        borderRadius: theme.borderRadius.xlarge,
        padding: '2rem',
        marginBottom: '1.5rem',
        boxShadow: '0 2px 8px rgba(0, 0, 0, 0.04)',
        border: `1px solid ${profileTheme.border}`,
        backdropFilter: 'blur(20px)',
        WebkitBackdropFilter: 'blur(20px)',
        position: 'relative',
        overflow: 'hidden'
      }}>
        <div style={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          height: '4px',
          background: `linear-gradient(90deg, ${profileTheme.accent} 0%, ${profileTheme.accentSecondary} 100%)`,
        }} />
        
        <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem' }}>
          <div style={{
            width: '5rem',
            height: '5rem',
            background: `linear-gradient(135deg, ${profileTheme.accent} 0%, ${profileTheme.accentSecondary} 100%)`,
            borderRadius: '50%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            position: 'relative',
            boxShadow: '0 8px 24px rgba(99, 102, 241, 0.3)',
            border: `3px solid ${profileTheme.cardBg}`
          }}>
            <User size={28} style={{ color: 'white' }} />
            <div style={{
              position: 'absolute',
              top: '-2px',
              right: '-2px',
              width: '1.5rem',
              height: '1.5rem',
              background: '#10b981',
              borderRadius: '50%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              border: `2px solid ${profileTheme.cardBg}`
            }}>
              <Sparkles size={12} color="white" />
            </div>
          </div>
          <div style={{ flex: 1 }}>
            <h2 style={{ 
              fontSize: '1.5rem', 
              fontWeight: '800', 
              marginBottom: '0.5rem',
              color: profileTheme.text,
              background: `linear-gradient(135deg, ${profileTheme.accent} 0%, ${profileTheme.accentSecondary} 100%)`,
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              backgroundClip: 'text'
            }}>
              {user?.email?.split('@')[0] || 'Customer'}
            </h2>
            <div style={{ 
              display: 'flex', 
              alignItems: 'center', 
              gap: theme.spacing.sm, 
              color: profileTheme.textSecondary, 
              fontSize: '0.875rem',
              marginBottom: theme.spacing.xs
            }}>
              <Mail size={16} />
              <span>{user?.email || 'Guest User'}</span>
            </div>
            <div style={{ 
              display: 'flex', 
              alignItems: 'center', 
              gap: theme.spacing.sm, 
              color: profileTheme.textSecondary, 
              fontSize: '0.875rem'
            }}>
              <Calendar size={16} />
              <span>Member since {user?.created_at ? new Date(user.created_at).toLocaleDateString() : 'Today'}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Stats Grid */}
      <div style={{ 
        display: 'grid', 
        gridTemplateColumns: 'repeat(2, 1fr)', 
        gap: theme.spacing.md, 
        marginBottom: '1.5rem' 
      }}>
        <div style={{ 
          background: profileTheme.cardBg,
          padding: theme.spacing.lg,
          borderRadius: theme.borderRadius.large,
          boxShadow: '0 2px 8px rgba(0, 0, 0, 0.04)',
          border: `1px solid ${profileTheme.border}`,
          backdropFilter: 'blur(20px)',
          WebkitBackdropFilter: 'blur(20px)',
          position: 'relative',
          overflow: 'hidden'
        }}>
          <div style={{
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            height: '3px',
            background: 'linear-gradient(90deg, #10b981 0%, #059669 100%)',
          }} />
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div>
              <p style={{ fontSize: '0.75rem', color: profileTheme.textSecondary, marginBottom: theme.spacing.xs }}>Total Savings</p>
              <p style={{ 
                fontSize: '1.75rem', 
                fontWeight: '800',
                color: '#10b981',
                lineHeight: 1
              }}>
                ${stats.totalSavings.toFixed(2)}
              </p>
            </div>
            <div style={{
              width: '3rem',
              height: '3rem',
              background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
              borderRadius: '50%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              boxShadow: '0 4px 12px rgba(16, 185, 129, 0.3)'
            }}>
              <TrendingUp size={20} style={{ color: 'white' }} />
            </div>
          </div>
        </div>

        <div style={{ 
          background: profileTheme.cardBg,
          padding: theme.spacing.lg,
          borderRadius: theme.borderRadius.large,
          boxShadow: '0 2px 8px rgba(0, 0, 0, 0.04)',
          border: `1px solid ${profileTheme.border}`,
          backdropFilter: 'blur(20px)',
          WebkitBackdropFilter: 'blur(20px)',
          position: 'relative',
          overflow: 'hidden'
        }}>
          <div style={{
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            height: '3px',
            background: `linear-gradient(90deg, ${profileTheme.accent} 0%, ${profileTheme.accentSecondary} 100%)`,
          }} />
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div>
              <p style={{ fontSize: '0.75rem', color: profileTheme.textSecondary, marginBottom: theme.spacing.xs }}>Deals Redeemed</p>
              <p style={{ 
                fontSize: '1.75rem', 
                fontWeight: '800',
                color: profileTheme.text,
                lineHeight: 1
              }}>
                {stats.totalRedemptions}
              </p>
            </div>
            <div style={{
              width: '3rem',
              height: '3rem',
              background: `linear-gradient(135deg, ${profileTheme.accent} 0%, ${profileTheme.accentSecondary} 100%)`,
              borderRadius: '50%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              boxShadow: '0 4px 12px rgba(99, 102, 241, 0.3)'
            }}>
              <ShoppingBag size={20} style={{ color: 'white' }} />
            </div>
          </div>
        </div>

        <div style={{ 
          background: profileTheme.cardBg,
          padding: theme.spacing.lg,
          borderRadius: theme.borderRadius.large,
          boxShadow: '0 2px 8px rgba(0, 0, 0, 0.04)',
          border: `1px solid ${profileTheme.border}`,
          backdropFilter: 'blur(20px)',
          WebkitBackdropFilter: 'blur(20px)',
          position: 'relative',
          overflow: 'hidden'
        }}>
          <div style={{
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            height: '3px',
            background: 'linear-gradient(90deg, #ef4444 0%, #dc2626 100%)',
          }} />
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div>
              <p style={{ fontSize: '0.75rem', color: profileTheme.textSecondary, marginBottom: theme.spacing.xs }}>Favorite Deals</p>
              <p style={{ 
                fontSize: '1.75rem', 
                fontWeight: '800',
                color: profileTheme.text,
                lineHeight: 1
              }}>
                {stats.favoriteDeals}
              </p>
            </div>
            <div style={{
              width: '3rem',
              height: '3rem',
              background: 'linear-gradient(135deg, #ef4444 0%, #dc2626 100%)',
              borderRadius: '50%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              boxShadow: '0 4px 12px rgba(239, 68, 68, 0.3)'
            }}>
              <Heart size={20} style={{ color: 'white' }} />
            </div>
          </div>
        </div>

        <div style={{ 
          background: profileTheme.cardBg,
          padding: theme.spacing.lg,
          borderRadius: theme.borderRadius.large,
          boxShadow: '0 2px 8px rgba(0, 0, 0, 0.04)',
          border: `1px solid ${profileTheme.border}`,
          backdropFilter: 'blur(20px)',
          WebkitBackdropFilter: 'blur(20px)',
          position: 'relative',
          overflow: 'hidden'
        }}>
          <div style={{
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            height: '3px',
            background: 'linear-gradient(90deg, #8b5cf6 0%, #7c3aed 100%)',
          }} />
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div>
              <p style={{ fontSize: '0.75rem', color: profileTheme.textSecondary, marginBottom: theme.spacing.xs }}>Favorite Stores</p>
              <p style={{ 
                fontSize: '1.75rem', 
                fontWeight: '800',
                color: profileTheme.text,
                lineHeight: 1
              }}>
                {stats.favoriteStores}
              </p>
            </div>
            <div style={{
              width: '3rem',
              height: '3rem',
              background: 'linear-gradient(135deg, #8b5cf6 0%, #7c3aed 100%)',
              borderRadius: '50%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              boxShadow: '0 4px 12px rgba(139, 92, 246, 0.3)'
            }}>
              <MapPin size={20} style={{ color: 'white' }} />
            </div>
          </div>
        </div>
      </div>

      {/* Recent Redemptions */}
      <div style={{ 
        background: profileTheme.cardBg,
        borderRadius: theme.borderRadius.xlarge,
        padding: '1.5rem',
        marginBottom: '1.5rem',
        boxShadow: '0 2px 8px rgba(0, 0, 0, 0.04)',
        border: `1px solid ${profileTheme.border}`,
        backdropFilter: 'blur(20px)',
        WebkitBackdropFilter: 'blur(20px)',
      }}>
        <h3 style={{ 
          fontSize: '1.25rem', 
          fontWeight: '700', 
          marginBottom: '1.5rem',
          color: profileTheme.text,
          display: 'flex',
          alignItems: 'center',
          gap: theme.spacing.sm
        }}>
          <Award size={20} style={{ color: profileTheme.accent }} />
          Recent Redemptions
        </h3>
        {recentRedemptions.length === 0 ? (
          <div style={{ 
            textAlign: 'center', 
            padding: '3rem 1rem',
            color: profileTheme.textSecondary 
          }}>
            <div style={{
              width: '4rem',
              height: '4rem',
              background: profileTheme.glass,
              borderRadius: '50%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              margin: '0 auto 1rem',
              border: `1px solid ${profileTheme.border}`
            }}>
              <Target size={24} style={{ color: profileTheme.textSecondary }} />
            </div>
            <p style={{ fontSize: '1rem', marginBottom: '0.5rem' }}>No redemptions yet</p>
            <p style={{ fontSize: '0.875rem' }}>Start saving today!</p>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: theme.spacing.md }}>
            {recentRedemptions.map((redemption) => (
              <div key={redemption.id} style={{ 
                background: profileTheme.glass,
                borderRadius: theme.borderRadius.medium,
                padding: theme.spacing.md,
                border: `1px solid ${profileTheme.border}`,
                transition: 'all 0.3s ease'
              }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start' }}>
                  <div style={{ flex: 1 }}>
                    <p style={{ 
                      fontWeight: '600', 
                      marginBottom: theme.spacing.xs,
                      color: profileTheme.text,
                      fontSize: '1rem'
                    }}>
                      {redemption.deals?.title || 'Unknown Deal'}
                    </p>
                    <p style={{ 
                      fontSize: '0.875rem', 
                      color: profileTheme.accent,
                      marginBottom: theme.spacing.xs,
                      display: 'flex',
                      alignItems: 'center',
                      gap: theme.spacing.xs
                    }}>
                      <MapPin size={14} />
                      {redemption.deals?.stores?.name || 'Unknown Store'}
                    </p>
                    <p style={{ 
                      fontSize: '0.75rem', 
                      color: profileTheme.textSecondary,
                      display: 'flex',
                      alignItems: 'center',
                      gap: theme.spacing.xs
                    }}>
                      <Calendar size={14} />
                      {new Date(redemption.redeemed_at).toLocaleDateString()}
                    </p>
                  </div>
                  <div style={{ 
                    textAlign: 'right',
                    background: '#d1fae5',
                    padding: theme.spacing.sm,
                    borderRadius: theme.borderRadius.medium,
                    border: '1px solid #a7f3d0'
                  }}>
                    <p style={{ fontSize: '0.75rem', color: '#065f46', marginBottom: '2px' }}>Saved</p>
                    <p style={{ 
                      fontWeight: '700', 
                      color: '#059669',
                      fontSize: '1rem'
                    }}>
                      ${redemption.deals?.original_price && redemption.deals?.discount_price 
                        ? (redemption.deals.original_price - redemption.deals.discount_price).toFixed(2)
                        : '0.00'}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Preferences */}
      <div style={{ 
        background: profileTheme.cardBg,
        borderRadius: theme.borderRadius.xlarge,
        padding: '1.5rem',
        boxShadow: '0 2px 8px rgba(0, 0, 0, 0.04)',
        border: `1px solid ${profileTheme.border}`,
        backdropFilter: 'blur(20px)',
        WebkitBackdropFilter: 'blur(20px)',
      }}>
        <h3 style={{ 
          fontSize: '1.25rem', 
          fontWeight: '700', 
          marginBottom: '1.5rem',
          color: profileTheme.text,
          display: 'flex',
          alignItems: 'center',
          gap: theme.spacing.sm
        }}>
          <Settings size={20} style={{ color: profileTheme.accent }} />
          Preferences
        </h3>
        
        <div style={{ display: 'flex', flexDirection: 'column', gap: theme.spacing.lg }}>
          <div style={{ 
            display: 'flex', 
            justifyContent: 'space-between', 
            alignItems: 'center',
            padding: theme.spacing.md,
            background: profileTheme.glass,
            borderRadius: theme.borderRadius.medium,
            border: `1px solid ${profileTheme.border}`,
            transition: 'all 0.3s ease'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: theme.spacing.sm }}>
              <div style={{
                width: '2.5rem',
                height: '2.5rem',
                background: `linear-gradient(135deg, ${profileTheme.accent} 0%, ${profileTheme.accentSecondary} 100%)`,
                borderRadius: '50%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                boxShadow: '0 4px 12px rgba(99, 102, 241, 0.3)'
              }}>
                <Bell size={16} style={{ color: 'white' }} />
              </div>
              <div>
                <p style={{ fontWeight: '600', color: profileTheme.text, marginBottom: '2px' }}>Push Notifications</p>
                <p style={{ fontSize: '0.75rem', color: profileTheme.textSecondary }}>Get notified about new deals</p>
              </div>
            </div>
            <label style={{ position: 'relative', display: 'inline-block', width: '52px', height: '28px' }}>
              <input
                type="checkbox"
                checked={preferences.notifications}
                onChange={(e) => handlePreferenceChange('notifications', e.target.checked)}
                style={{ opacity: 0, width: 0, height: 0 }}
              />
              <span style={{
                position: 'absolute',
                cursor: 'pointer',
                top: 0,
                left: 0,
                right: 0,
                bottom: 0,
                background: preferences.notifications 
                  ? `linear-gradient(135deg, ${profileTheme.accent} 0%, ${profileTheme.accentSecondary} 100%)`
                  : '#cbd5e1',
                borderRadius: '34px',
                transition: '0.4s',
                boxShadow: preferences.notifications ? '0 4px 12px rgba(99, 102, 241, 0.3)' : 'none'
              }}>
                <span style={{
                  position: 'absolute',
                  height: '20px',
                  width: '20px',
                  left: preferences.notifications ? '28px' : '4px',
                  bottom: '4px',
                  backgroundColor: 'white',
                  borderRadius: '50%',
                  transition: '0.4s',
                  boxShadow: '0 2px 4px rgba(0, 0, 0, 0.2)'
                }} />
              </span>
            </label>
          </div>

          <div style={{ 
            display: 'flex', 
            justifyContent: 'space-between', 
            alignItems: 'center',
            padding: theme.spacing.md,
            background: profileTheme.glass,
            borderRadius: theme.borderRadius.medium,
            border: `1px solid ${profileTheme.border}`,
            transition: 'all 0.3s ease'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: theme.spacing.sm }}>
              <div style={{
                width: '2.5rem',
                height: '2.5rem',
                background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
                borderRadius: '50%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                boxShadow: '0 4px 12px rgba(16, 185, 129, 0.3)'
              }}>
                <MapPin size={16} style={{ color: 'white' }} />
              </div>
              <div>
                <p style={{ fontWeight: '600', color: profileTheme.text, marginBottom: '2px' }}>Location Services</p>
                <p style={{ fontSize: '0.75rem', color: profileTheme.textSecondary }}>Find deals near you</p>
              </div>
            </div>
            <label style={{ position: 'relative', display: 'inline-block', width: '52px', height: '28px' }}>
              <input
                type="checkbox"
                checked={preferences.location}
                onChange={(e) => handlePreferenceChange('location', e.target.checked)}
                style={{ opacity: 0, width: 0, height: 0 }}
              />
              <span style={{
                position: 'absolute',
                cursor: 'pointer',
                top: 0,
                left: 0,
                right: 0,
                bottom: 0,
                background: preferences.location 
                  ? 'linear-gradient(135deg, #10b981 0%, #059669 100%)'
                  : '#cbd5e1',
                borderRadius: '34px',
                transition: '0.4s',
                boxShadow: preferences.location ? '0 4px 12px rgba(16, 185, 129, 0.3)' : 'none'
              }}>
                <span style={{
                  position: 'absolute',
                  height: '20px',
                  width: '20px',
                  left: preferences.location ? '28px' : '4px',
                  bottom: '4px',
                  backgroundColor: 'white',
                  borderRadius: '50%',
                  transition: '0.4s',
                  boxShadow: '0 2px 4px rgba(0, 0, 0, 0.2)'
                }} />
              </span>
            </label>
          </div>

          <div style={{ 
            display: 'flex', 
            justifyContent: 'space-between', 
            alignItems: 'center',
            padding: theme.spacing.md,
            background: profileTheme.glass,
            borderRadius: theme.borderRadius.medium,
            border: `1px solid ${profileTheme.border}`,
            transition: 'all 0.3s ease'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: theme.spacing.sm }}>
              <div style={{
                width: '2.5rem',
                height: '2.5rem',
                background: 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)',
                borderRadius: '50%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                boxShadow: '0 4px 12px rgba(245, 158, 11, 0.3)'
              }}>
                <Mail size={16} style={{ color: 'white' }} />
              </div>
              <div>
                <p style={{ fontWeight: '600', color: profileTheme.text, marginBottom: '2px' }}>Newsletter</p>
                <p style={{ fontSize: '0.75rem', color: profileTheme.textSecondary }}>Weekly deals digest</p>
              </div>
            </div>
            <label style={{ position: 'relative', display: 'inline-block', width: '52px', height: '28px' }}>
              <input
                type="checkbox"
                checked={preferences.newsletter}
                onChange={(e) => handlePreferenceChange('newsletter', e.target.checked)}
                style={{ opacity: 0, width: 0, height: 0 }}
              />
              <span style={{
                position: 'absolute',
                cursor: 'pointer',
                top: 0,
                left: 0,
                right: 0,
                bottom: 0,
                background: preferences.newsletter 
                  ? 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)'
                  : '#cbd5e1',
                borderRadius: '34px',
                transition: '0.4s',
                boxShadow: preferences.newsletter ? '0 4px 12px rgba(245, 158, 11, 0.3)' : 'none'
              }}>
                <span style={{
                  position: 'absolute',
                  height: '20px',
                  width: '20px',
                  left: preferences.newsletter ? '28px' : '4px',
                  bottom: '4px',
                  backgroundColor: 'white',
                  borderRadius: '50%',
                  transition: '0.4s',
                  boxShadow: '0 2px 4px rgba(0, 0, 0, 0.2)'
                }} />
              </span>
            </label>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CustomerProfile;