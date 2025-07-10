import React, { useState, useEffect } from 'react';
import { supabase } from '../services/supabase';
import DealCard from './DealCard';
import DealDetails from './DealDetails';
import { Heart, Store as StoreIcon } from 'lucide-react';

const Favorites = ({ user, favorites, onFavoritesUpdate }) => {
  const [favoriteDeals, setFavoriteDeals] = useState([]);
  const [favoriteStores, setFavoriteStores] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('deals');
  const [selectedDeal, setSelectedDeal] = useState(null);

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
      const storeIds = favorites.filter(f => f.store_id && !f.deal_id).map(f => f.store_id);

      // Load favorite deals
      if (dealIds.length > 0) {
        const { data: deals, error } = await supabase
          .from('deals')
          .select(`
            *,
            stores (
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

      // Load favorite stores
      if (storeIds.length > 0) {
        const { data: stores, error } = await supabase
          .from('stores')
          .select('*')
          .in('id', storeIds)
          .eq('is_active', true);

        if (error) throw error;
        setFavoriteStores(stores || []);
      } else {
        setFavoriteStores([]);
      }
    } catch (error) {
      console.error('Error loading favorites:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const removeFromFavorites = async (storeId, dealId = null) => {
    try {
      const query = supabase
        .from('favorites')
        .delete()
        .eq('customer_id', user.id);

      if (dealId) {
        query.eq('deal_id', dealId);
      } else {
        query.eq('store_id', storeId).is('deal_id', null);
      }

      const { error } = await query;
      if (error) throw error;

      onFavoritesUpdate();
    } catch (error) {
      console.error('Error removing favorite:', error);
    }
  };

  if (!user) {
    return (
      <div style={{ padding: '3rem', textAlign: 'center' }}>
        <Heart size={48} style={{ color: '#d1d5db', margin: '0 auto 1rem' }} />
        <h3 style={{ fontSize: '1.125rem', fontWeight: '600', marginBottom: '0.5rem' }}>Sign in to view favorites</h3>
        <p style={{ color: '#6b7280' }}>Create an account to save your favorite deals and stores</p>
      </div>
    );
  }

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
    <>
      <div style={{ backgroundColor: 'white' }}>
        {/* Tabs */}
        <div style={{ display: 'flex', borderBottom: '1px solid #e5e7eb' }}>
          <button
            onClick={() => setActiveTab('deals')}
            style={{
              flex: 1,
              padding: '1rem',
              backgroundColor: 'transparent',
              border: 'none',
              borderBottom: activeTab === 'deals' ? '2px solid #2563eb' : '2px solid transparent',
              color: activeTab === 'deals' ? '#2563eb' : '#6b7280',
              fontWeight: activeTab === 'deals' ? '500' : '400',
              cursor: 'pointer'
            }}
          >
            Deals ({favoriteDeals.length})
          </button>
          <button
            onClick={() => setActiveTab('stores')}
            style={{
              flex: 1,
              padding: '1rem',
              backgroundColor: 'transparent',
              border: 'none',
              borderBottom: activeTab === 'stores' ? '2px solid #2563eb' : '2px solid transparent',
              color: activeTab === 'stores' ? '#2563eb' : '#6b7280',
              fontWeight: activeTab === 'stores' ? '500' : '400',
              cursor: 'pointer'
            }}
          >
            Stores ({favoriteStores.length})
          </button>
        </div>
      </div>

      <div style={{ padding: '1rem' }}>
        {activeTab === 'deals' ? (
          favoriteDeals.length === 0 ? (
            <div style={{ padding: '3rem', textAlign: 'center' }}>
              <Heart size={48} style={{ color: '#d1d5db', margin: '0 auto 1rem' }} />
              <h3 style={{ fontSize: '1.125rem', fontWeight: '600', marginBottom: '0.5rem' }}>No favorite deals yet</h3>
              <p style={{ color: '#6b7280' }}>Start exploring and save deals you love!</p>
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
                />
              ))}
            </div>
          )
        ) : (
          favoriteStores.length === 0 ? (
            <div style={{ padding: '3rem', textAlign: 'center' }}>
              <StoreIcon size={48} style={{ color: '#d1d5db', margin: '0 auto 1rem' }} />
              <h3 style={{ fontSize: '1.125rem', fontWeight: '600', marginBottom: '0.5rem' }}>No favorite stores yet</h3>
              <p style={{ color: '#6b7280' }}>Save stores to quickly access their deals!</p>
            </div>
          ) : (
            <div style={{ display: 'grid', gap: '1rem' }}>
              {favoriteStores.map((store) => (
                <div
                  key={store.id}
                  style={{
                    backgroundColor: 'white',
                    borderRadius: '0.5rem',
                    boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)',
                    padding: '1rem',
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center'
                  }}
                >
                  <div>
                    <h3 style={{ fontSize: '1rem', fontWeight: '600', marginBottom: '0.25rem' }}>
                      {store.name}
                    </h3>
                    <p style={{ fontSize: '0.875rem', color: '#6b7280' }}>
                      {store.address}
                    </p>
                    {store.phone && (
                      <p style={{ fontSize: '0.875rem', color: '#2563eb', marginTop: '0.25rem' }}>
                        {store.phone}
                      </p>
                    )}
                  </div>
                  <button
                    onClick={() => removeFromFavorites(store.id)}
                    style={{
                      padding: '0.5rem',
                      backgroundColor: 'transparent',
                      border: 'none',
                      cursor: 'pointer',
                      color: '#ef4444'
                    }}
                  >
                    <Heart size={20} fill="#ef4444" />
                  </button>
                </div>
              ))}
            </div>
          )
        )}
      </div>

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
    </>
  );
};

export default Favorites;