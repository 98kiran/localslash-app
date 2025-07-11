import React from 'react';
import { supabase } from '../services/supabase';
import { Heart, MapPin, Clock, Tag } from 'lucide-react';

const DealCard = ({ deal, isFavorite, user, onFavoritesUpdate, onClick }) => {
  const handleFavoriteToggle = async (e) => {
    e.stopPropagation();
    
    if (!user) {
      alert('Please sign in to save favorites. Click the profile tab to create an account.');
      return;
    }

    try {
      if (isFavorite) {
        // Remove from favorites
        const { error } = await supabase
          .from('favorites')
          .delete()
          .eq('customer_id', user.id)
          .eq('deal_id', deal.id);
        
        if (error) {
          console.error('Error removing favorite:', error);
          throw error;
        }
      } else {
        // Add to favorites
        const { error } = await supabase
          .from('favorites')
          .insert([{
            customer_id: user.id,
            deal_id: deal.id,
            store_id: deal.store_id
          }]);
        
        if (error) {
          console.error('Error adding favorite:', error);
          throw error;
        }
      }
      
      onFavoritesUpdate();
    } catch (error) {
      console.error('Error toggling favorite:', error);
      alert('Error updating favorites. Please try again.');
    }
  };

  const getDaysRemaining = () => {
    const now = new Date();
    const endDate = new Date(deal.end_date);
    const diffTime = endDate - now;
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  };

  const getDiscountDisplay = () => {
    if (deal.discount_percentage) {
      return `${deal.discount_percentage}% OFF`;
    } else if (deal.original_price && deal.discount_price) {
      const savings = deal.original_price - deal.discount_price;
      return `Save $${savings.toFixed(2)}`;
    } else if (deal.deal_type === 'bogo') {
      return 'BOGO';
    }
    return 'Special Deal';
  };

  const daysLeft = getDaysRemaining();
  const urgentDeal = daysLeft <= 3;

  return (
    <div
      onClick={onClick}
      style={{
        backgroundColor: 'white',
        borderRadius: '0.5rem',
        boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)',
        padding: '1rem',
        cursor: 'pointer',
        transition: 'box-shadow 0.2s',
        position: 'relative'
      }}
      onMouseOver={(e) => e.currentTarget.style.boxShadow = '0 4px 6px rgba(0, 0, 0, 0.1)'}
      onMouseOut={(e) => e.currentTarget.style.boxShadow = '0 1px 3px rgba(0, 0, 0, 0.1)'}
    >
      {/* Discount Badge */}
      <div style={{
        position: 'absolute',
        top: '-0.5rem',
        right: '1rem',
        backgroundColor: urgentDeal ? '#ef4444' : '#2563eb',
        color: 'white',
        padding: '0.25rem 0.75rem',
        borderRadius: '9999px',
        fontSize: '0.875rem',
        fontWeight: 'bold'
      }}>
        {getDiscountDisplay()}
      </div>

      <div style={{ display: 'flex', gap: '1rem' }}>
        {/* Store Logo/Placeholder */}
        <div style={{
          width: '4rem',
          height: '4rem',
          backgroundColor: '#f3f4f6',
          borderRadius: '0.5rem',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          flexShrink: 0
        }}>
          {deal.stores.logo_url ? (
            <img 
              src={deal.stores.logo_url} 
              alt={deal.stores.name}
              style={{ width: '100%', height: '100%', objectFit: 'cover', borderRadius: '0.5rem' }}
            />
          ) : (
            <Tag size={24} style={{ color: '#9ca3af' }} />
          )}
        </div>

        {/* Deal Info */}
        <div style={{ flex: 1 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start' }}>
            <div style={{ flex: 1 }}>
              <h3 style={{ fontSize: '1rem', fontWeight: '600', marginBottom: '0.25rem' }}>
                {deal.title}
              </h3>
              <p style={{ fontSize: '0.875rem', color: '#2563eb', fontWeight: '500', marginBottom: '0.25rem' }}>
                {deal.stores.name}
              </p>
              <p style={{ fontSize: '0.75rem', color: '#6b7280', marginBottom: '0.5rem' }}>
                {deal.description.length > 60 
                  ? `${deal.description.substring(0, 60)}...` 
                  : deal.description
                }
              </p>
            </div>

            {/* Favorite Button */}
            <button
              onClick={handleFavoriteToggle}
              style={{
                padding: '0.5rem',
                backgroundColor: 'transparent',
                border: 'none',
                cursor: 'pointer',
                color: isFavorite ? '#ef4444' : '#d1d5db'
              }}
            >
              <Heart size={20} fill={isFavorite ? '#ef4444' : 'none'} />
            </button>
          </div>

          {/* Meta Info */}
          <div style={{ display: 'flex', gap: '1rem', fontSize: '0.75rem', color: '#6b7280' }}>
            {deal.distance && (
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                <MapPin size={14} />
                <span>{deal.distance.toFixed(1)} mi</span>
              </div>
            )}
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
              <Clock size={14} />
              <span style={{ color: urgentDeal ? '#ef4444' : '#6b7280' }}>
                {daysLeft > 0 ? `${daysLeft} days left` : 'Expires today!'}
              </span>
            </div>
            {deal.category && (
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                <Tag size={14} />
                <span>{deal.category}</span>
              </div>
            )}
          </div>

          {/* Price Display */}

{/* Price display */}
{deal.original_price && deal.deal_type !== 'bogo' && (
  <div style={{ display: 'flex', alignItems: 'baseline', gap: '0.5rem' }}>
    <span style={{ textDecoration: 'line-through', color: '#9ca3af' }}>
      ${deal.original_price.toFixed(2)}
    </span>
    {deal.discount_price !== null && deal.discount_price !== undefined && (
      <span style={{ fontSize: '1.25rem', fontWeight: 'bold', color: '#059669' }}>
        ${deal.discount_price.toFixed(2)}
      </span>
    )}
  </div>
)}

{/* Special display for BOGO deals */}
{deal.deal_type === 'bogo' && deal.original_price && (
  <div style={{ fontSize: '1.125rem', fontWeight: '600', color: '#8b5cf6' }}>
    Buy 1 at ${deal.original_price.toFixed(2)}, Get 1 FREE
  </div>
)}

{/* Display for deals without prices */}
{!deal.original_price && !deal.discount_price && (
  <div style={{ fontSize: '1rem', fontWeight: '600', color: '#6b7280' }}>
    See store for details
  </div>
)}
        </div>
      </div>
    </div>
  );
};

export default DealCard;