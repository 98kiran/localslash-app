import React, { useState, useEffect } from 'react';
import { supabase } from '../services/supabase';
import { User, Mail, Calendar, Heart, ShoppingBag, TrendingUp, Settings, Bell, MapPin } from 'lucide-react';

const CustomerProfile = ({ user }) => {
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

      // Load redemptions
      const { data: redemptions, error: redemptionError } = await supabase
        .from('deal_redemptions')
        .select(`
          *,
          deals (
            title,
            discount_percentage,
            discount_price,
            original_price,
            stores (
              name
            )
          )
        `)
        .eq('customer_id', user.id)
        .order('redeemed_at', { ascending: false });

      if (redemptionError) throw redemptionError;

      // Calculate stats
      const totalSavings = redemptions?.reduce((sum, r) => {
        if (r.deals.original_price && r.deals.discount_price) {
          return sum + (r.deals.original_price - r.deals.discount_price);
        }
        return sum;
      }, 0) || 0;

      // Load favorites count
      const { count: dealCount } = await supabase
        .from('favorites')
        .select('*', { count: 'exact', head: true })
        .eq('customer_id', user.id)
        .not('deal_id', 'is', null);

      const { count: storeCount } = await supabase
        .from('favorites')
        .select('*', { count: 'exact', head: true })
        .eq('customer_id', user.id)
        .is('deal_id', null);

      setStats({
        totalRedemptions: redemptions?.length || 0,
        totalSavings: totalSavings,
        favoriteDeals: dealCount || 0,
        favoriteStores: storeCount || 0
      });

      setRecentRedemptions(redemptions?.slice(0, 5) || []);
    } catch (error) {
      console.error('Error loading profile data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handlePreferenceChange = async (key, value) => {
    setPreferences(prev => ({ ...prev, [key]: value }));
    // In a real app, you'd save these preferences to the database
  };

  if (isLoading) {
    return (
      <div style={{ padding: '2rem', textAlign: 'center' }}>
        <div style={{ 
          width: '3rem', 
          height: '3rem', 
          border: '3px solid #e5e7eb',
          borderTopColor: '#2563eb',
          borderRadius: '50%',
          animation: 'spin 1s linear infinite',
          margin: '0 auto'
        }} />
        <style>{`
          @keyframes spin {
            to { transform: rotate(360deg); }
          }
        `}</style>
      </div>
    );
  }

  return (
    <div style={{ padding: '1rem' }}>
      {/* Profile Header */}
      <div style={{ backgroundColor: 'white', borderRadius: '0.5rem', padding: '1.5rem', marginBottom: '1rem', boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <div style={{
            width: '4rem',
            height: '4rem',
            backgroundColor: '#dbeafe',
            borderRadius: '50%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }}>
            <User size={32} style={{ color: '#2563eb' }} />
          </div>
          <div>
            <h2 style={{ fontSize: '1.25rem', fontWeight: 'bold', marginBottom: '0.25rem' }}>
              {user?.email?.split('@')[0] || 'Customer'}
            </h2>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#6b7280', fontSize: '0.875rem' }}>
              <Mail size={16} />
              <span>{user?.email || 'Guest User'}</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#6b7280', fontSize: '0.875rem', marginTop: '0.25rem' }}>
              <Calendar size={16} />
              <span>Member since {user?.created_at ? new Date(user.created_at).toLocaleDateString() : 'Today'}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Stats Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '0.5rem', marginBottom: '1rem' }}>
        <div style={{ backgroundColor: 'white', padding: '1rem', borderRadius: '0.5rem', boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div>
              <p style={{ fontSize: '0.75rem', color: '#6b7280' }}>Total Savings</p>
              <p style={{ fontSize: '1.5rem', fontWeight: 'bold', color: '#059669' }}>
                ${stats.totalSavings.toFixed(2)}
              </p>
            </div>
            <TrendingUp size={24} style={{ color: '#10b981' }} />
          </div>
        </div>

        <div style={{ backgroundColor: 'white', padding: '1rem', borderRadius: '0.5rem', boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div>
              <p style={{ fontSize: '0.75rem', color: '#6b7280' }}>Deals Redeemed</p>
              <p style={{ fontSize: '1.5rem', fontWeight: 'bold' }}>{stats.totalRedemptions}</p>
            </div>
            <ShoppingBag size={24} style={{ color: '#3b82f6' }} />
          </div>
        </div>

        <div style={{ backgroundColor: 'white', padding: '1rem', borderRadius: '0.5rem', boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div>
              <p style={{ fontSize: '0.75rem', color: '#6b7280' }}>Favorite Deals</p>
              <p style={{ fontSize: '1.5rem', fontWeight: 'bold' }}>{stats.favoriteDeals}</p>
            </div>
            <Heart size={24} style={{ color: '#ef4444' }} />
          </div>
        </div>

        <div style={{ backgroundColor: 'white', padding: '1rem', borderRadius: '0.5rem', boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div>
              <p style={{ fontSize: '0.75rem', color: '#6b7280' }}>Favorite Stores</p>
              <p style={{ fontSize: '1.5rem', fontWeight: 'bold' }}>{stats.favoriteStores}</p>
            </div>
            <MapPin size={24} style={{ color: '#8b5cf6' }} />
          </div>
        </div>
      </div>

      {/* Recent Redemptions */}
      <div style={{ backgroundColor: 'white', borderRadius: '0.5rem', padding: '1rem', marginBottom: '1rem', boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)' }}>
        <h3 style={{ fontSize: '1.125rem', fontWeight: '600', marginBottom: '1rem' }}>Recent Redemptions</h3>
        {recentRedemptions.length === 0 ? (
          <p style={{ color: '#6b7280', textAlign: 'center', padding: '1rem' }}>
            No redemptions yet. Start saving today!
          </p>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
            {recentRedemptions.map((redemption) => (
              <div key={redemption.id} style={{ borderBottom: '1px solid #f3f4f6', paddingBottom: '0.75rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start' }}>
                  <div>
                    <p style={{ fontWeight: '500', marginBottom: '0.25rem' }}>{redemption.deals.title}</p>
                    <p style={{ fontSize: '0.875rem', color: '#2563eb' }}>{redemption.deals.stores.name}</p>
                    <p style={{ fontSize: '0.75rem', color: '#6b7280', marginTop: '0.25rem' }}>
                      {new Date(redemption.redeemed_at).toLocaleDateString()}
                    </p>
                  </div>
                  <div style={{ textAlign: 'right' }}>
                    <p style={{ fontSize: '0.75rem', color: '#6b7280' }}>Saved</p>
                    <p style={{ fontWeight: '600', color: '#059669' }}>
                      ${redemption.deals.original_price && redemption.deals.discount_price 
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
      <div style={{ backgroundColor: 'white', borderRadius: '0.5rem', padding: '1rem', boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)' }}>
        <h3 style={{ fontSize: '1.125rem', fontWeight: '600', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <Settings size={20} />
          Preferences
        </h3>
        
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <Bell size={16} />
              <span>Push Notifications</span>
            </div>
            <label style={{ position: 'relative', display: 'inline-block', width: '48px', height: '24px' }}>
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
                backgroundColor: preferences.notifications ? '#2563eb' : '#cbd5e1',
                borderRadius: '34px',
                transition: '0.4s'
              }}>
                <span style={{
                  position: 'absolute',
                  height: '16px',
                  width: '16px',
                  left: preferences.notifications ? '28px' : '4px',
                  bottom: '4px',
                  backgroundColor: 'white',
                  borderRadius: '50%',
                  transition: '0.4s'
                }} />
              </span>
            </label>
          </div>

          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <MapPin size={16} />
              <span>Location Services</span>
            </div>
            <label style={{ position: 'relative', display: 'inline-block', width: '48px', height: '24px' }}>
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
                backgroundColor: preferences.location ? '#2563eb' : '#cbd5e1',
                borderRadius: '34px',
                transition: '0.4s'
              }}>
                <span style={{
                  position: 'absolute',
                  height: '16px',
                  width: '16px',
                  left: preferences.location ? '28px' : '4px',
                  bottom: '4px',
                  backgroundColor: 'white',
                  borderRadius: '50%',
                  transition: '0.4s'
                }} />
              </span>
            </label>
          </div>

          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <Mail size={16} />
              <span>Newsletter</span>
            </div>
            <label style={{ position: 'relative', display: 'inline-block', width: '48px', height: '24px' }}>
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
                backgroundColor: preferences.newsletter ? '#2563eb' : '#cbd5e1',
                borderRadius: '34px',
                transition: '0.4s'
              }}>
                <span style={{
                  position: 'absolute',
                  height: '16px',
                  width: '16px',
                  left: preferences.newsletter ? '28px' : '4px',
                  bottom: '4px',
                  backgroundColor: 'white',
                  borderRadius: '50%',
                  transition: '0.4s'
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