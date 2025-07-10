import React, { useState } from 'react';
import { supabase } from '../services/supabase';
import { X, Heart, MapPin, Phone, Clock, Calendar, Tag, CheckCircle, AlertCircle } from 'lucide-react';

const DealDetails = ({ deal, onClose, user, isFavorite, onFavoritesUpdate }) => {
  const [showRedemptionCode, setShowRedemptionCode] = useState(false);
  const [redemptionCode, setRedemptionCode] = useState('');
  const [isRedeeming, setIsRedeeming] = useState(false);

  const handleFavoriteToggle = async () => {
    if (!user) {
      alert('Please sign in to save favorites');
      return;
    }

    try {
      if (isFavorite) {
        const { error } = await supabase
          .from('favorites')
          .delete()
          .eq('customer_id', user.id)
          .eq('deal_id', deal.id);
        
        if (error) throw error;
      } else {
        const { error } = await supabase
          .from('favorites')
          .insert([{
            customer_id: user.id,
            deal_id: deal.id,
            store_id: deal.store_id
          }]);
        
        if (error) throw error;
      }
      
      onFavoritesUpdate();
    } catch (error) {
      console.error('Error toggling favorite:', error);
    }
  };

  const handleRedeem = async () => {
    if (!user) {
      alert('Please sign in to redeem deals');
      return;
    }

    setIsRedeeming(true);
    
    try {
      // Generate redemption code
      const code = `LSH${Date.now().toString(36).toUpperCase()}`;
      
      // Create redemption record
      const { error } = await supabase
        .from('deal_redemptions')
        .insert([{
          deal_id: deal.id,
          customer_id: user.id,
          store_id: deal.store_id,
          redemption_code: code
        }]);
      
      if (error) throw error;
      
      // Update deal redemption count
      await supabase
        .from('deals')
        .update({ 
          current_redemptions: (deal.current_redemptions || 0) + 1 
        })
        .eq('id', deal.id);
      
      setRedemptionCode(code);
      setShowRedemptionCode(true);
    } catch (error) {
      console.error('Error redeeming deal:', error);
      alert('Error redeeming deal. Please try again.');
    } finally {
      setIsRedeeming(false);
    }
  };

  const getDiscountDisplay = () => {
    if (deal.discount_percentage) {
      return `${deal.discount_percentage}% OFF`;
    } else if (deal.original_price && deal.discount_price) {
      const savings = deal.original_price - deal.discount_price;
      return `Save $${savings.toFixed(2)}`;
    } else if (deal.deal_type === 'bogo') {
      return 'Buy One Get One';
    }
    return 'Special Deal';
  };

  const openInMaps = () => {
    const { latitude, longitude, name } = deal.stores;
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
          <h2 style={{ fontSize: '1.25rem', fontWeight: 'bold' }}>Deal Details</h2>
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

        {/* Content */}
        <div style={{ padding: '1.5rem' }}>
          {/* Deal Header */}
          <div style={{ marginBottom: '1.5rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', marginBottom: '0.5rem' }}>
              <h3 style={{ fontSize: '1.5rem', fontWeight: 'bold', flex: 1 }}>{deal.title}</h3>
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
                <Heart size={24} fill={isFavorite ? '#ef4444' : 'none'} />
              </button>
            </div>
            
            <div style={{
              display: 'inline-block',
              backgroundColor: '#dbeafe',
              color: '#1e40af',
              padding: '0.5rem 1rem',
              borderRadius: '9999px',
              fontSize: '1.125rem',
              fontWeight: 'bold',
              marginBottom: '1rem'
            }}>
              {getDiscountDisplay()}
            </div>

            <p style={{ color: '#374151', lineHeight: '1.6' }}>{deal.description}</p>
          </div>

          {/* Store Info */}
          <div style={{
            backgroundColor: '#f9fafb',
            padding: '1rem',
            borderRadius: '0.5rem',
            marginBottom: '1.5rem'
          }}>
            <h4 style={{ fontWeight: '600', marginBottom: '0.75rem' }}>{deal.stores.name}</h4>
            
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
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
                <span style={{ fontSize: '0.875rem' }}>{deal.stores.address}</span>
              </button>
              
              {deal.stores.phone && (
                <a
                  href={`tel:${deal.stores.phone}`}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.5rem',
                    color: '#2563eb',
                    textDecoration: 'none',
                    fontSize: '0.875rem'
                  }}
                >
                  <Phone size={16} />
                  <span>{deal.stores.phone}</span>
                </a>
              )}
              
              {deal.distance && (
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#6b7280', fontSize: '0.875rem' }}>
                  <MapPin size={16} />
                  <span>{deal.distance.toFixed(1)} miles away</span>
                </div>
              )}
            </div>
          </div>

          {/* Deal Details */}
          <div style={{ marginBottom: '1.5rem' }}>
            <h4 style={{ fontWeight: '600', marginBottom: '0.75rem' }}>Deal Information</h4>
            
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#6b7280' }}>
                <Calendar size={16} />
                <span style={{ fontSize: '0.875rem' }}>
                  Valid from {new Date(deal.start_date).toLocaleDateString()} to {new Date(deal.end_date).toLocaleDateString()}
                </span>
              </div>
              
              {deal.category && (
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#6b7280' }}>
                  <Tag size={16} />
                  <span style={{ fontSize: '0.875rem' }}>{deal.category}</span>
                </div>
              )}
              
              {deal.max_redemptions && (
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#6b7280' }}>
                  <CheckCircle size={16} />
                  <span style={{ fontSize: '0.875rem' }}>
                    {deal.max_redemptions - (deal.current_redemptions || 0)} redemptions remaining
                  </span>
                </div>
              )}
            </div>
          </div>

          {/* Price Display */}
          {deal.original_price && (
            <div style={{
              backgroundColor: '#f0fdf4',
              padding: '1rem',
              borderRadius: '0.5rem',
              marginBottom: '1.5rem',
              textAlign: 'center'
            }}>
              <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '1rem' }}>
                <span style={{ 
                  textDecoration: 'line-through', 
                  color: '#6b7280',
                  fontSize: '1.25rem'
                }}>
                  ${deal.original_price.toFixed(2)}
                </span>
                <span style={{ 
                  color: '#059669',
                  fontWeight: 'bold',
                  fontSize: '2rem'
                }}>
                  ${deal.discount_price.toFixed(2)}
                </span>
              </div>
            </div>
          )}

          {/* Terms & Conditions */}
          {deal.terms_conditions && (
            <div style={{
              marginBottom: '1.5rem',
              padding: '1rem',
              backgroundColor: '#fef3c7',
              borderRadius: '0.5rem'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem' }}>
                <AlertCircle size={16} style={{ color: '#d97706' }} />
                <h4 style={{ fontWeight: '600', color: '#92400e' }}>Terms & Conditions</h4>
              </div>
              <p style={{ fontSize: '0.875rem', color: '#92400e' }}>{deal.terms_conditions}</p>
            </div>
          )}

          {/* Redemption Section */}
          {!showRedemptionCode ? (
            <button
              onClick={handleRedeem}
              disabled={isRedeeming || (deal.max_redemptions && deal.current_redemptions >= deal.max_redemptions)}
              style={{
                width: '100%',
                padding: '1rem',
                backgroundColor: deal.max_redemptions && deal.current_redemptions >= deal.max_redemptions ? '#d1d5db' : '#2563eb',
                color: 'white',
                borderRadius: '0.5rem',
                border: 'none',
                fontSize: '1.125rem',
                fontWeight: 'bold',
                cursor: deal.max_redemptions && deal.current_redemptions >= deal.max_redemptions ? 'not-allowed' : 'pointer',
                opacity: isRedeeming ? 0.5 : 1
              }}
            >
              {isRedeeming ? 'Generating Code...' : 
               deal.max_redemptions && deal.current_redemptions >= deal.max_redemptions ? 'Deal Fully Redeemed' : 
               'Redeem Deal'}
            </button>
          ) : (
            <div style={{
              backgroundColor: '#f0fdf4',
              border: '2px solid #10b981',
              borderRadius: '0.5rem',
              padding: '1.5rem',
              textAlign: 'center'
            }}>
              <CheckCircle size={48} style={{ color: '#10b981', margin: '0 auto 1rem' }} />
              <h3 style={{ fontSize: '1.25rem', fontWeight: 'bold', marginBottom: '0.5rem' }}>
                Deal Redeemed!
              </h3>
              <p style={{ color: '#6b7280', marginBottom: '1rem' }}>
                Show this code at checkout:
              </p>
              <div style={{
                backgroundColor: 'white',
                padding: '1rem',
                borderRadius: '0.375rem',
                fontSize: '1.5rem',
                fontWeight: 'bold',
                letterSpacing: '0.1em',
                fontFamily: 'monospace'
              }}>
                {redemptionCode}
              </div>
              <p style={{ fontSize: '0.75rem', color: '#6b7280', marginTop: '1rem' }}>
                This code is valid for one-time use only
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default DealDetails;