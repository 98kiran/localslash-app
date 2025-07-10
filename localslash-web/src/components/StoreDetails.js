import React, { useState, useEffect } from 'react';
import { supabase } from '../services/supabase';
import { X, MapPin, Phone, Globe, Clock, Heart, ExternalLink } from 'lucide-react';
import DealCard from './DealCard';
import DealDetails from './DealDetails';

const StoreDetails = ({ store, onClose, user, favorites, onFavoritesUpdate }) => {
  const [storeDeals, setStoreDeals] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedDeal, setSelectedDeal] = useState(null);
  const isFavoriteStore = favorites.some(f => f.store_id === store.id && !f.deal_id);

  useEffect(() => {
    loadStoreDeals();
  }, [store]);

  const loadStoreDeals = async () => {
    try {
      const { data, error } = await supabase
        .from('deals')
        .select('*')
        .eq('store_id', store.id)
        .eq('is_active', true)
        .gte('end_date', new Date().toISOString())
        .order('created_at', { ascending: false });

      if (error) throw error;
      
      // Add store info to each deal for DealCard
      const dealsWithStore = data.map(deal => ({
        ...deal,
        stores: store
      }));
      
      setStoreDeals(dealsWithStore);
    } catch (error) {
      console.error('Error loading store deals:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleFavoriteToggle = async () => {
    if (!user) {
      alert('Please sign in to save favorites');
      return;
    }

    try {
      if (isFavoriteStore) {
        const { error } = await supabase
          .from('favorites')
          .delete()
          .eq('customer_id', user.id)
          .eq('store_id', store.id)
          .is('deal_id', null);
        
        if (error) throw error;
      } else {
        const { error } = await supabase
          .from('favorites')
          .insert([{
            customer_id: user.id,
            store_id: store.id
          }]);
        
        if (error) throw error;
      }
      
      onFavoritesUpdate();
    } catch (error) {
      console.error('Error toggling favorite:', error);
    }
  };

  const openInMaps = () => {
    const { latitude, longitude, name } = store;
    const mapsUrl = `https://www.google.com/maps/search/?api=1&query=${latitude},${longitude}&query_place_name=${encodeURIComponent(name)}`;
    window.open(mapsUrl, '_blank');
  };

  return (
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      backgroundColor: 'rgba(0, 0, 0, 0.5)',
      zIndex: 50,
      display: 'flex',
      alignItems: 'flex-end',
      justifyContent: 'center'
    }}>
      <div style={{
        backgroundColor: 'white',
        width: '100%',
        maxWidth: '48rem',
        borderRadius: '1rem 1rem 0 0',
        maxHeight: '90vh',
        overflowY: 'auto',
        animation: 'slideUp 0.3s ease-out'
      }}>
        <style>{`
          @keyframes slideUp {
            from {
              transform: translateY(100%);
            }
            to {
              transform: translateY(0);
            }
          }
        `}</style>

        {/* Header */}
        <div style={{
          padding: '1rem',
          borderBottom: '1px solid #e5e7eb',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          position: 'sticky',
          top: 0,
          backgroundColor: 'white'
        }}>
          <h2 style={{ fontSize: '1.25rem', fontWeight: 'bold' }}>Store Details</h2>
          <button
            onClick={onClose}
            style={{
              padding: '0.5rem',
              backgroundColor: 'transparent',
              border: 'none',
              cursor: 'pointer'
            }}
          >
            <X size={24} />
          </button>
        </div>

        {/* Store Info */}
        <div style={{ padding: '1.5rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', marginBottom: '1rem' }}>
            <div>
              <h3 style={{ fontSize: '1.5rem', fontWeight: 'bold', marginBottom: '0.5rem' }}>{store.name}</h3>
              {store.description && (
                <p style={{ color: '#6b7280', marginBottom: '1rem' }}>{store.description}</p>
              )}
            </div>
            <button
              onClick={handleFavoriteToggle}
              style={{
                padding: '0.5rem',
                backgroundColor: 'transparent',
                border: 'none',
                cursor: 'pointer',
                color: isFavoriteStore ? '#ef4444' : '#d1d5db'
              }}
            >
              <Heart size={24} fill={isFavoriteStore ? '#ef4444' : 'none'} />
            </button>
          </div>

          {/* Contact Info */}
          <div style={{
            backgroundColor: '#f9fafb',
            padding: '1rem',
            borderRadius: '0.5rem',
            marginBottom: '1.5rem'
          }}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
              <button
                onClick={openInMaps}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.5rem',
                  color: '#2563eb',
                  backgroundColor: 'transparent',
                  border: 'none',
                  cursor: 'pointer',
                  padding: 0,
                  textAlign: 'left'
                }}
              >
                <MapPin size={16} />
                <span>{store.address}</span>
                <ExternalLink size={14} />
              </button>
              
              {store.phone && (
                <a
                  href={`tel:${store.phone}`}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.5rem',
                    color: '#2563eb',
                    textDecoration: 'none'
                  }}
                >
                  <Phone size={16} />
                  <span>{store.phone}</span>
                </a>
              )}
              
              {store.website && (
                <a
                  href={store.website}
                  target="_blank"
                  rel="noopener noreferrer"
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.5rem',
                    color: '#2563eb',
                    textDecoration: 'none'
                  }}
                >
                  <Globe size={16} />
                  <span>Visit Website</span>
                  <ExternalLink size={14} />
                </a>
              )}
              
              {store.opening_hours && (
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#6b7280' }}>
                  <Clock size={16} />
                  <span>Check store for hours</span>
                </div>
              )}
            </div>
          </div>

          {/* Active Deals */}
          <div>
            <h4 style={{ fontSize: '1.125rem', fontWeight: '600', marginBottom: '1rem' }}>
              Active Deals ({storeDeals.length})
            </h4>
            
            {isLoading ? (
              <div style={{ textAlign: 'center', padding: '2rem' }}>
                <div style={{ 
                  width: '3rem', 
                  height: '3rem', 
                  border: '3px solid #e5e7eb',
                  borderTopColor: '#2563eb',
                  borderRadius: '50%',
                  animation: 'spin 1s linear infinite',
                  margin: '0 auto'
                }} />
              </div>
            ) : storeDeals.length === 0 ? (
              <div style={{
                textAlign: 'center',
                padding: '2rem',
                backgroundColor: '#f9fafb',
                borderRadius: '0.5rem'
              }}>
                <p style={{ color: '#6b7280' }}>No active deals at this store</p>
              </div>
            ) : (
              <div style={{ display: 'grid', gap: '1rem' }}>
                {storeDeals.map((deal) => (
                  <DealCard
                    key={deal.id}
                    deal={deal}
                    isFavorite={favorites.some(f => f.deal_id === deal.id)}
                    user={user}
                    onFavoritesUpdate={onFavoritesUpdate}
                    onClick={() => setSelectedDeal(deal)}
                  />
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Deal Details Modal */}
      {selectedDeal && (
        <DealDetails
          deal={selectedDeal}
          onClose={() => setSelectedDeal(null)}
          user={user}
          isFavorite={favorites.some(f => f.deal_id === selectedDeal.id)}
          onFavoritesUpdate={onFavoritesUpdate}
        />
      )}
    </div>
  );
};

export default StoreDetails;