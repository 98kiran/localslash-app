import React, { useState } from 'react';
import { supabase } from '../services/supabase';
import { X, Heart, MapPin, Phone, Clock, Calendar, Tag, CheckCircle, AlertCircle, ExternalLink } from 'lucide-react';
import { theme } from '../styles/theme';
import { buttonStyle } from '../styles/componentStyles';

const DealDetails = ({ deal, onClose, user, isFavorite, onFavoritesUpdate }) => {
  const [showRedemptionCode, setShowRedemptionCode] = useState(false);
  const [redemptionCode, setRedemptionCode] = useState('');
  const [isRedeeming, setIsRedeeming] = useState(false);

  const handleFavoriteToggle = async () => {
    if (!user) {
      alert('Please sign in to save favorites. Click the profile tab to create an account.');
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
      alert('Error updating favorites. Please try again.');
    }
  };

  const handleRedeem = async () => {
  // Add this debug line
  const { data: { user: authUser } } = await supabase.auth.getUser();
  console.log('User at redemption time:', authUser);
  
  if (!authUser) {
    alert('Not authenticated! Please sign in.');
    return;
  }
  console.log('Supabase URL:', supabase.supabaseUrl);
  console.log('Is this your project URL?');
  
  // Rest of your code...

    setIsRedeeming(true);
    
    try {
      const code = `LSH${Date.now().toString(36).toUpperCase()}`;
      
      const { data, error } = await supabase
      .rpc('redeem_deal_direct', {
        p_deal_id: deal.id,
        p_customer_id: user.id,
        p_store_id: deal.store_id,
        p_code: code
      });

    if (error) throw error;
    if (data.success) {
      setRedemptionCode(code);
      setShowRedemptionCode(true);
    } else {
      throw new Error(data.error);
    }
      
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

  const styles = {
    overlay: {
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      backgroundColor: 'rgba(0, 0, 0, 0.5)',
      zIndex: 150, // Increased to be above bottom nav
      display: 'flex',
      alignItems: 'flex-end',
      justifyContent: 'center',
    },
    
    modal: {
      backgroundColor: theme.colors.cardBackground,
      width: '100%',
      maxWidth: '48rem',
      borderRadius: '1rem 1rem 0 0',
      maxHeight: 'calc(90vh - 80px)', // Account for bottom nav
      marginBottom: '60px', // Space for bottom navigation
      display: 'flex',
      flexDirection: 'column',
      animation: 'slideUp 0.3s ease-out',
      position: 'relative',
    },
    
    header: {
      padding: theme.spacing.lg,
      borderBottom: `1px solid ${theme.colors.border}`,
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
      flexShrink: 0,
    },
    
    closeButton: {
      padding: theme.spacing.sm,
      backgroundColor: 'transparent',
      border: 'none',
      cursor: 'pointer',
      color: theme.colors.textSecondary,
      borderRadius: theme.borderRadius.round,
      transition: 'all 0.3s ease',
    },
    
    content: {
      flex: 1,
      overflowY: 'auto',
      padding: theme.spacing.lg,
      paddingBottom: theme.spacing.lg, // Reduced padding
    },
    
    dealHeader: {
      marginBottom: theme.spacing.lg,
    },
    
    titleRow: {
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'flex-start',
      gap: theme.spacing.md,
      marginBottom: theme.spacing.sm,
    },
    
    title: {
      fontSize: 'clamp(1.25rem, 3vw, 1.5rem)',
      fontWeight: 'bold',
      color: theme.colors.textPrimary,
      flex: 1,
    },
    
    favoriteButton: {
      padding: theme.spacing.sm,
      backgroundColor: `${theme.colors.danger}10`,
      border: 'none',
      borderRadius: theme.borderRadius.round,
      cursor: 'pointer',
      transition: 'all 0.3s ease',
      color: isFavorite ? theme.colors.danger : theme.colors.textSecondary,
    },
    
    badge: {
      display: 'inline-block',
      backgroundColor: theme.colors.success,
      color: 'white',
      padding: `${theme.spacing.sm} ${theme.spacing.md}`,
      borderRadius: theme.borderRadius.pill,
      fontSize: '1rem',
      fontWeight: 'bold',
      marginBottom: theme.spacing.md,
    },
    
    description: {
      color: theme.colors.textSecondary,
      lineHeight: '1.6',
      marginBottom: theme.spacing.lg,
    },
    
    storeInfo: {
      backgroundColor: `${theme.colors.primary}05`,
      padding: theme.spacing.lg,
      borderRadius: theme.borderRadius.large,
      marginBottom: theme.spacing.lg,
    },
    
    storeName: {
      fontWeight: '600',
      fontSize: '1.125rem',
      marginBottom: theme.spacing.md,
      color: theme.colors.textPrimary,
    },
    
    storeDetail: {
      display: 'flex',
      alignItems: 'center',
      gap: theme.spacing.sm,
      marginBottom: theme.spacing.sm,
      color: theme.colors.primary,
      textDecoration: 'none',
      fontSize: '0.875rem',
    },
    
    infoSection: {
      marginBottom: theme.spacing.lg,
    },
    
    sectionTitle: {
      fontWeight: '600',
      marginBottom: theme.spacing.md,
      color: theme.colors.textPrimary,
    },
    
    infoItem: {
      display: 'flex',
      alignItems: 'center',
      gap: theme.spacing.sm,
      marginBottom: theme.spacing.sm,
      color: theme.colors.textSecondary,
      fontSize: '0.875rem',
    },
    
    priceDisplay: {
      backgroundColor: `${theme.colors.success}10`,
      padding: theme.spacing.lg,
      borderRadius: theme.borderRadius.large,
      textAlign: 'center',
      marginBottom: theme.spacing.lg,
    },
    
    originalPrice: {
      textDecoration: 'line-through',
      color: theme.colors.textSecondary,
      fontSize: '1.25rem',
      marginRight: theme.spacing.md,
    },
    
    discountPrice: {
      color: theme.colors.success,
      fontWeight: 'bold',
      fontSize: '2rem',
    },
    
    termsBox: {
      backgroundColor: `${theme.colors.warning}10`,
      padding: theme.spacing.md,
      borderRadius: theme.borderRadius.medium,
      marginBottom: theme.spacing.lg,
    },
    
    termsHeader: {
      display: 'flex',
      alignItems: 'center',
      gap: theme.spacing.sm,
      marginBottom: theme.spacing.sm,
      fontWeight: '600',
      color: theme.colors.warning,
    },
    
    termsText: {
      fontSize: '0.875rem',
      color: theme.colors.textSecondary,
    },
    
    fixedBottom: {
      backgroundColor: theme.colors.cardBackground,
      padding: theme.spacing.lg,
      borderTop: `1px solid ${theme.colors.border}`,
      boxShadow: '0 -4px 12px rgba(0, 0, 0, 0.05)',
      flexShrink: 0, // Prevent shrinking
    },
    
    redeemButton: {
      ...buttonStyle,
      width: '100%',
      backgroundColor: theme.colors.primary,
      color: 'white',
      padding: theme.spacing.md,
      fontSize: '1.125rem',
      fontWeight: 'bold',
    },
    
    redeemButtonDisabled: {
      backgroundColor: theme.colors.textSecondary,
      cursor: 'not-allowed',
      opacity: 0.5,
    },
    
    redemptionSuccess: {
      backgroundColor: `${theme.colors.success}10`,
      border: `2px solid ${theme.colors.success}`,
      borderRadius: theme.borderRadius.large,
      padding: theme.spacing.lg,
      textAlign: 'center',
    },
    
    redemptionCode: {
      backgroundColor: theme.colors.cardBackground,
      padding: theme.spacing.md,
      borderRadius: theme.borderRadius.medium,
      fontSize: '1.5rem',
      fontWeight: 'bold',
      letterSpacing: '0.1em',
      fontFamily: 'monospace',
      margin: `${theme.spacing.md} 0`,
    },
  };

  const responsiveStyles = `
    @keyframes slideUp {
      from {
        transform: translateY(100%);
      }
      to {
        transform: translateY(0);
      }
    }
    
    @media (min-width: ${theme.breakpoints.tablet}) {
      .deal-modal {
        border-radius: ${theme.borderRadius.xlarge} !important;
        margin: ${theme.spacing.lg};
        max-height: 80vh !important;
        margin-bottom: 0 !important;
      }
    }
    
    @media (max-width: ${theme.breakpoints.mobile}) {
      .deal-modal {
        max-height: calc(100vh - 120px) !important;
      }
    }
  `;

  return (
    <>
      <style>{responsiveStyles}</style>
      <div style={styles.overlay} onClick={onClose}>
        <div 
          className="deal-modal"
          style={styles.modal} 
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div style={styles.header}>
            <h2 style={{ fontSize: '1.25rem', fontWeight: 'bold', color: theme.colors.textPrimary }}>
              Deal Details
            </h2>
            <button
              onClick={onClose}
              style={styles.closeButton}
              onMouseOver={(e) => e.currentTarget.style.backgroundColor = `${theme.colors.textSecondary}10`}
              onMouseOut={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
            >
              <X size={24} />
            </button>
          </div>

          {/* Scrollable Content */}
          <div style={styles.content}>
            {/* Deal Header */}
            <div style={styles.dealHeader}>
              <div style={styles.titleRow}>
                <h3 style={styles.title}>{deal.title}</h3>
                <button
                  onClick={handleFavoriteToggle}
                  style={styles.favoriteButton}
                  onMouseOver={(e) => e.currentTarget.style.transform = 'scale(1.1)'}
                  onMouseOut={(e) => e.currentTarget.style.transform = 'scale(1)'}
                >
                  <Heart size={24} fill={isFavorite ? theme.colors.danger : 'none'} />
                </button>
              </div>
              
              <div style={styles.badge}>
                {getDiscountDisplay()}
              </div>

              <p style={styles.description}>{deal.description}</p>
            </div>

            {/* Store Info */}
            <div style={styles.storeInfo}>
              <h4 style={styles.storeName}>{deal.stores.name}</h4>
              
              <button
                onClick={openInMaps}
                style={{ ...styles.storeDetail, background: 'none', border: 'none', cursor: 'pointer', padding: 0 }}
              >
                <MapPin size={16} />
                <span>{deal.stores.address}</span>
                <ExternalLink size={14} />
              </button>
              
              {deal.stores.phone && (
                <a href={`tel:${deal.stores.phone}`} style={styles.storeDetail}>
                  <Phone size={16} />
                  <span>{deal.stores.phone}</span>
                </a>
              )}
              
              {deal.distance && (
                <div style={{ ...styles.storeDetail, color: theme.colors.textSecondary }}>
                  <MapPin size={16} />
                  <span>{deal.distance.toFixed(1)} miles away</span>
                </div>
              )}
            </div>

            {/* Deal Information */}
            <div style={styles.infoSection}>
              <h4 style={styles.sectionTitle}>Deal Information</h4>
              
              <div style={styles.infoItem}>
                <Calendar size={16} />
                <span>Valid from {new Date(deal.start_date).toLocaleDateString()} to {new Date(deal.end_date).toLocaleDateString()}</span>
              </div>
              
              {deal.category && (
                <div style={styles.infoItem}>
                  <Tag size={16} />
                  <span>{deal.category}</span>
                </div>
              )}
              
              {deal.max_redemptions && (
                <div style={styles.infoItem}>
                  <CheckCircle size={16} />
                  <span>{deal.max_redemptions - (deal.current_redemptions || 0)} redemptions remaining</span>
                </div>
              )}
            </div>

            {/* Price Display */}
            {deal.original_price && (
              <div style={styles.priceDisplay}>
                <span style={styles.originalPrice}>
                  ${deal.original_price.toFixed(2)}
                </span>
                <span style={styles.discountPrice}>
                  ${deal.discount_price.toFixed(2)}
                </span>
              </div>
            )}

            {/* Terms & Conditions */}
            {deal.terms_conditions && (
              <div style={styles.termsBox}>
                <div style={styles.termsHeader}>
                  <AlertCircle size={16} />
                  <span>Terms & Conditions</span>
                </div>
                <p style={styles.termsText}>{deal.terms_conditions}</p>
              </div>
            )}
          </div>

          {/* Redeem Button Section */}
          <div style={styles.fixedBottom}>
            {!showRedemptionCode ? (
              <button
                onClick={handleRedeem}
                disabled={isRedeeming || (deal.max_redemptions && deal.current_redemptions >= deal.max_redemptions)}
                style={{
                  ...styles.redeemButton,
                  ...(isRedeeming || (deal.max_redemptions && deal.current_redemptions >= deal.max_redemptions) ? styles.redeemButtonDisabled : {})
                }}
                onMouseOver={(e) => !isRedeeming && (e.currentTarget.style.backgroundColor = '#0051D5')}
                onMouseOut={(e) => !isRedeeming && (e.currentTarget.style.backgroundColor = theme.colors.primary)}
              >
                {isRedeeming ? 'Generating Code...' : 
                 deal.max_redemptions && deal.current_redemptions >= deal.max_redemptions ? 'Deal Fully Redeemed' : 
                 'Redeem Deal'}
              </button>
            ) : (
              <div style={styles.redemptionSuccess}>
                <CheckCircle size={48} style={{ color: theme.colors.success, margin: '0 auto' }} />
                <h3 style={{ fontSize: '1.25rem', fontWeight: 'bold', margin: `${theme.spacing.sm} 0` }}>
                  Deal Redeemed!
                </h3>
                <p style={{ color: theme.colors.textSecondary, marginBottom: theme.spacing.md }}>
                  Show this code at checkout:
                </p>
                <div style={styles.redemptionCode}>
                  {redemptionCode}
                </div>
                <p style={{ fontSize: '0.75rem', color: theme.colors.textSecondary }}>
                  This code is valid for one-time use only
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  );
};

export default DealDetails;