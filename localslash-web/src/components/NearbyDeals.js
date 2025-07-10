import React, { useState } from 'react';
import DealCard from './DealCard';
import DealDetails from './DealDetails';
import { MapPin, TrendingDown } from 'lucide-react';

const NearbyDeals = ({ deals, favorites, user, onFavoritesUpdate, isLoading }) => {
  const [selectedDeal, setSelectedDeal] = useState(null);

  if (isLoading) {
    return (
      <div style={{ padding: '2rem', textAlign: 'center' }}>
        <div style={{ display: 'inline-block', marginBottom: '1rem' }}>
          <div style={{ 
            width: '3rem', 
            height: '3rem', 
            border: '3px solid #e5e7eb',
            borderTopColor: '#2563eb',
            borderRadius: '50%',
            animation: 'spin 1s linear infinite'
          }} />
        </div>
        <p style={{ color: '#6b7280' }}>Loading deals near you...</p>
        <style>{`
          @keyframes spin {
            to { transform: rotate(360deg); }
          }
        `}</style>
      </div>
    );
  }

  if (deals.length === 0) {
    return (
      <div style={{ padding: '3rem', textAlign: 'center' }}>
        <MapPin size={48} style={{ color: '#d1d5db', margin: '0 auto 1rem' }} />
        <h3 style={{ fontSize: '1.125rem', fontWeight: '600', marginBottom: '0.5rem' }}>No deals found nearby</h3>
        <p style={{ color: '#6b7280' }}>Try adjusting your filters or search radius</p>
      </div>
    );
  }

  return (
    <>
      <div style={{ padding: '1rem' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
          <h2 style={{ fontSize: '1.25rem', fontWeight: '600' }}>
            Deals Near You
          </h2>
          <span style={{ fontSize: '0.875rem', color: '#6b7280' }}>
            {deals.length} deals found
          </span>
        </div>
        
        {/* Debug info - remove this after testing */}
        {deals.length === 0 && (
          <div style={{ padding: '1rem', backgroundColor: '#fef3c7', borderRadius: '0.5rem', marginBottom: '1rem' }}>
            <p style={{ fontSize: '0.875rem', color: '#92400e' }}>
              Debug: No deals showing. Try clicking the filter button and increasing the search radius.
            </p>
          </div>
        )}
        
        <div style={{ display: 'grid', gap: '1rem' }}>
          {deals.map((deal) => (
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
    </>
  );
};

export default NearbyDeals;