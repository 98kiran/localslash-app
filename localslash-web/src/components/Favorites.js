import React, { useState, useEffect } from 'react';
import { supabase } from '../services/supabase';
import DealCard from './DealCard';
import DealDetails from './DealDetails';
import { Heart, Store as StoreIcon } from 'lucide-react';
import { useTheme } from '../contexts/ThemeContext';

const Favorites = ({ user, favorites, onFavoritesUpdate, theme }) => {
  const [favoriteDeals, setFavoriteDeals] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedDeal, setSelectedDeal] = useState(null);

  // Use the theme passed from parent (ModernCustomerDashboard)
  const currentTheme = theme;

  useEffect(() => {
    if (user) {
      loadFavoriteItems();
    }
  }, [user, favorites]);

  const loadFavoriteItems = async () => {
    try {
      setIsLoading(true);

      // Get favorite deal IDs
      const dealIds = favorites.filter(f => f.deal_id).map(f => f.deal_id);

      // Load favorite deals
      if (dealIds.length > 0) {
        const { data: deals, error } = await supabase
          .from('deals')
          .select(`
            *,
            stores!deals_store_id_fkey (
              id,
              name,
              address,
              latitude,
              longitude,
              logo_url,
              phone
            )
          `)
          .in('id', dealIds)
          .eq('is_active', true);

        if (error) throw error;
        setFavoriteDeals(deals || []);
      } else {
        setFavoriteDeals([]);
      }
    } catch (error) {
      console.error('Error loading favorites:', error);
    } finally {
      setIsLoading(false);
    }
  };


  if (!user) {
    return (
      <div style={{ 
        padding: '3rem', 
        textAlign: 'center',
        background: currentTheme.bg,
        minHeight: '100vh'
      }}>
        <Heart size={48} style={{ color: currentTheme.textSecondary, margin: '0 auto 1rem' }} />
        <h3 style={{ 
          fontSize: '1.125rem', 
          fontWeight: '600', 
          marginBottom: '0.5rem',
          color: currentTheme.text
        }}>Sign in to view favorites</h3>
        <p style={{ color: currentTheme.textSecondary }}>Create an account to save your favorite deals</p>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div style={{ 
        padding: '2rem', 
        textAlign: 'center',
        background: currentTheme.bg,
        minHeight: '100vh'
      }}>
        <div style={{ 
          width: '3rem', 
          height: '3rem', 
          border: `3px solid ${currentTheme.border}`,
          borderTopColor: currentTheme.accent,
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
    <div style={{ 
      background: currentTheme.bg,
      minHeight: '100vh',
      padding: '1rem'
    }}>
      {favoriteDeals.length === 0 ? (
        <div style={{ 
          padding: '3rem', 
          textAlign: 'center',
          background: currentTheme.cardBg,
          borderRadius: '16px',
          border: `1px solid ${currentTheme.border}`,
          backdropFilter: 'blur(20px)',
          WebkitBackdropFilter: 'blur(20px)'
        }}>
          <Heart size={48} style={{ color: currentTheme.textSecondary, margin: '0 auto 1rem' }} />
          <h3 style={{ 
            fontSize: '1.125rem', 
            fontWeight: '600', 
            marginBottom: '0.5rem',
            color: currentTheme.text
          }}>No favorite deals yet</h3>
          <p style={{ color: currentTheme.textSecondary }}>Start exploring and save deals you love!</p>
        </div>
      ) : (
        <div style={{ display: 'grid', gap: '1rem' }}>
          {favoriteDeals.map((deal) => (
            <DealCard
              key={deal.id}
              deal={deal}
              isFavorite={true}
              user={user}
              onFavoritesUpdate={onFavoritesUpdate}
              onClick={() => setSelectedDeal(deal)}
              currentTheme={{
                cardBg: currentTheme.cardBg,
                text: currentTheme.text,
                textSecondary: currentTheme.textSecondary,
                border: currentTheme.border,
                accent: currentTheme.accent,
                accentSecondary: currentTheme.accentSecondary,
                glass: currentTheme.glass
              }}
            />
          ))}
        </div>
      )}

      {/* Deal Details Modal */}
      {selectedDeal && (
        <DealDetails
          deal={selectedDeal}
          onClose={() => setSelectedDeal(null)}
          user={user}
          isFavorite={true}
          onFavoritesUpdate={onFavoritesUpdate}
        />
      )}
    </div>
  );
};

export default Favorites;