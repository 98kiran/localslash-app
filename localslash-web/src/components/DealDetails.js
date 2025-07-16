import React, { useState, useEffect } from 'react';
import { supabase } from '../services/supabase';
import { X, Heart, MapPin, Phone, Clock, Calendar, Tag, CheckCircle, AlertCircle, ExternalLink } from 'lucide-react';
import { theme } from '../styles/theme';
import { buttonStyle } from '../styles/componentStyles';

const DealDetails = ({ deal, onClose, user, isFavorite, onFavoritesUpdate, onDealsUpdate }) => {
  const [showRedemptionCode, setShowRedemptionCode] = useState(false);
  const [redemptionCode, setRedemptionCode] = useState('');
  const [isRedeeming, setIsRedeeming] = useState(false);
  const [hasAlreadyRedeemed, setHasAlreadyRedeemed] = useState(false);
  const [localDeal, setLocalDeal] = useState(deal);

  // Check if user has already redeemed this deal
  useEffect(() => {
    checkExistingRedemption();
  }, [user, deal.id]);

  const checkExistingRedemption = async () => {
    if (!user) return;
    
    try {
      const { data, error } = await supabase
        .from('deal_redemptions')
        .select('redemption_code')
        .eq('deal_id', deal.id)
        .eq('customer_id', user.id)
        .single();
      
      if (data) {
        setHasAlreadyRedeemed(true);
        setRedemptionCode(data.redemption_code);
        setShowRedemptionCode(true);
      }
    } catch (error) {
      // No existing redemption found, which is fine
      console.log('No existing redemption found');
    }
  };

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
    if (!user) {
      alert('Please sign in to redeem deals. Click the profile tab to create an account.');
      return;
    }

    // Double-check if already redeemed
    if (hasAlreadyRedeemed) {
      alert('You have already redeemed this deal.');
      return;
    }

    // Check if deal has reached its limit
    if (localDeal.max_redemptions && localDeal.current_redemptions >= localDeal.max_redemptions) {
      alert('This deal has reached its redemption limit.');
      return;
    }

    setIsRedeeming(true);
    
    try {
      const code = `LSH${Date.now().toString(36).toUpperCase()}`;
      
      // Call the secure function
      const { data, error } = await supabase
        .rpc('redeem_deal_direct', {
          p_deal_id: deal.id,
          p_customer_id: user.id,
          p_store_id: deal.store_id,
          p_code: code
        });

      if (error) {
        console.error('RPC Error:', error);
        
        // Handle specific errors
        if (error.code === '42501') {
          throw new Error('Permission denied. Please ensure you are logged in.');
        } else if (error.message?.includes('duplicate key')) {
          // Try to fetch the existing redemption code
          const { data: existingRedemption } = await supabase
            .from('deal_redemptions')
            .select('redemption_code')
            .eq('deal_id', deal.id)
            .eq('customer_id', user.id)
            .single();
          
          if (existingRedemption) {
            setRedemptionCode(existingRedemption.redemption_code);
            setShowRedemptionCode(true);
            setHasAlreadyRedeemed(true);
            return;
          }
          throw new Error('You have already redeemed this deal.');
        } else {
          throw error;
        }
      }
      
      if (!data || !data.success) {
        throw new Error(data?.error || 'Failed to redeem deal');
      }
      
      // Success!
      setRedemptionCode(code);
      setShowRedemptionCode(true);
      setHasAlreadyRedeemed(true);
      
      // Update local deal state to reflect new redemption count
      setLocalDeal(prev => ({
        ...prev,
        current_redemptions: (prev.current_redemptions || 0) + 1
      }));
      
      // Update parent component if callback is provided
      if (onDealsUpdate) {
        onDealsUpdate();
      }
      
      // Track analytics if available
      try {
        await supabase.rpc('track_deal_view', { p_deal_id: deal.id });
      } catch (analyticsError) {
        console.log('Analytics tracking failed:', analyticsError);
      }
      
    } catch (error) {
      console.error('Error redeeming deal:', error);
      
      // User-friendly error messages
      let errorMessage = 'Failed to redeem deal. ';
      
      if (error.message?.includes('already redeemed') || error.message?.includes('duplicate')) {
        errorMessage = 'You have already redeemed this deal.';
      } else if (error.message?.includes('Permission denied')) {
        errorMessage = 'Please sign in to redeem deals.';
      } else if (localDeal.max_redemptions && localDeal.current_redemptions >= localDeal.max_redemptions) {
        errorMessage = 'This deal has reached its redemption limit.';
      } else {
        errorMessage += 'Please try again.';
      }
      
      alert(errorMessage);
    } finally {
      setIsRedeeming(false);
    }
  };

  const getDiscountDisplay = () => {
  // ALWAYS check deal_type first for BOGO
  if (deal.deal_type === 'bogo') {
    return 'Buy One Get One';
  } else if (deal.discount_percentage) {
    return `${deal.discount_percentage}% OFF`;
  } else if (deal.original_price && deal.discount_price) {
    const savings = deal.original_price - deal.discount_price;
    return `Save $${savings.toFixed(2)}`;
  }
  return 'Special Deal';
};

  const openInMaps = () => {
    if (!deal.stores || !deal.stores.latitude || !deal.stores.longitude) {
      alert('Location information not available for this store.');
      return;
    }
    
    const { latitude, longitude, name } = deal.stores;
    const mapsUrl = `https://www.google.com/maps/search/?api=1&query=${latitude},${longitude}&query_place_name=${encodeURIComponent(name)}`;
    window.open(mapsUrl, '_blank');
  };

  const isExpired = () => {
    return new Date(deal.end_date) < new Date();
  };

  const getDaysRemaining = () => {
    const now = new Date();
    const endDate = new Date(deal.end_date);
    const diffTime = endDate - now;
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  };

  const styles = {
    overlay: {
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      backgroundColor: 'rgba(0, 0, 0, 0.5)',
      zIndex: 150,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '20px',
    },
    
    modal: {
      backgroundColor: theme.colors.cardBackground,
      width: '90vw',
      maxWidth: '1000px',
      borderRadius: '1rem',
      maxHeight: '85vh',
      display: 'flex',
      flexDirection: 'column',
      position: 'relative',
      boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
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
      paddingBottom: theme.spacing.xl,
      maxHeight: 'calc(85vh - 160px)', // Ensure scrolling works
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
    
    expiredBadge: {
      backgroundColor: theme.colors.danger,
    },
    
    urgentBadge: {
      backgroundColor: theme.colors.warning,
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
      flexShrink: 0,
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
      userSelect: 'all',
      cursor: 'pointer',
    },

    alreadyRedeemedNote: {
      backgroundColor: `${theme.colors.info}10`,
      color: theme.colors.info,
      padding: theme.spacing.sm,
      borderRadius: theme.borderRadius.small,
      fontSize: '0.875rem',
      textAlign: 'center',
      marginTop: theme.spacing.sm,
    },
  };

  const responsiveStyles = `
    @keyframes slideUp {
      from {
        transform: scale(0.9);
        opacity: 0;
      }
      to {
        transform: scale(1);
        opacity: 1;
      }
    }
  `;

  const daysRemaining = getDaysRemaining();
  const dealExpired = isExpired();

  return (
    <>
      <style>{responsiveStyles}</style>
      <div 
        style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: 'rgba(0, 0, 0, 0.5)',
          zIndex: 150,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '20px',
        }} 
        onClick={onClose}
      >
        <div 
          style={{
            backgroundColor: theme.colors.cardBackground,
            width: '90vw',
            maxWidth: '1000px',
            borderRadius: '1rem',
            maxHeight: '85vh',
            display: 'flex',
            flexDirection: 'column',
            position: 'relative',
            boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
          }}
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
              
              <div style={{
                ...styles.badge,
                ...(dealExpired ? styles.expiredBadge : daysRemaining <= 3 ? styles.urgentBadge : {})
              }}>
                {dealExpired ? 'EXPIRED' : getDiscountDisplay()}
              </div>

              <p style={styles.description}>{deal.description}</p>
            </div>

            {/* Store Info */}
            <div style={styles.storeInfo}>
              <h4 style={styles.storeName}>{deal.stores?.name || 'Store'}</h4>
              
              {deal.stores?.address && (
                <button
                  onClick={openInMaps}
                  style={{ ...styles.storeDetail, background: 'none', border: 'none', cursor: 'pointer', padding: 0 }}
                >
                  <MapPin size={16} />
                  <span>{deal.stores.address}</span>
                  <ExternalLink size={14} />
                </button>
              )}
              
              {deal.stores?.phone && (
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
                <span>
                  Valid from {new Date(deal.start_date).toLocaleDateString()} to {new Date(deal.end_date).toLocaleDateString()}
                  {daysRemaining > 0 && daysRemaining <= 7 && (
                    <strong style={{ color: theme.colors.warning, marginLeft: '0.5rem' }}>
                      ({daysRemaining} days left)
                    </strong>
                  )}
                </span>
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
                  <span>
                    {deal.max_redemptions - (localDeal.current_redemptions || 0)} of {deal.max_redemptions} redemptions remaining
                  </span>
                </div>
              )}
            </div>

            {/* Price Display */}
            {deal.original_price && deal.deal_type !== 'bogo' && (
              <div style={styles.priceDisplay}>
                <span style={styles.originalPrice}>
                  ${deal.original_price.toFixed(2)}
                </span>
                {deal.discount_price !== null && deal.discount_price !== undefined && (
                  <span style={styles.discountPrice}>
                    ${deal.discount_price.toFixed(2)}
                  </span>
                )}
              </div>
            )}

            {/* Special display for BOGO deals */}
              {deal.deal_type === 'bogo' && deal.original_price && (
                <div style={styles.priceDisplay}>
                  <div style={{ textAlign: 'center' }}>
                    <p style={{ fontSize: '1.125rem', fontWeight: '600', color: '#8b5cf6', marginBottom: '0.5rem' }}>
                      Buy One Get One Free
                    </p>
                    <p style={{ fontSize: '1.5rem', fontWeight: 'bold' }}>
                      ${deal.original_price.toFixed(2)} each
                    </p>
                    <p style={{ fontSize: '0.875rem', color: theme.colors.textSecondary }}>
                      Buy 1 at regular price, get 1 FREE
                    </p>
                  </div>
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
                disabled={
                  isRedeeming || 
                  dealExpired ||
                  hasAlreadyRedeemed ||
                  (deal.max_redemptions && localDeal.current_redemptions >= deal.max_redemptions)
                }
                style={{
                  ...styles.redeemButton,
                  ...(isRedeeming || dealExpired || hasAlreadyRedeemed || (deal.max_redemptions && localDeal.current_redemptions >= deal.max_redemptions) ? styles.redeemButtonDisabled : {})
                }}
                onMouseOver={(e) => !isRedeeming && !dealExpired && (e.currentTarget.style.backgroundColor = '#0051D5')}
                onMouseOut={(e) => !isRedeeming && !dealExpired && (e.currentTarget.style.backgroundColor = theme.colors.primary)}
              >
                {isRedeeming ? 'Generating Code...' : 
                 dealExpired ? 'Deal Expired' :
                 hasAlreadyRedeemed ? 'Already Redeemed' :
                 deal.max_redemptions && localDeal.current_redemptions >= deal.max_redemptions ? 'Deal Fully Redeemed' : 
                 !user ? 'Sign In to Redeem' :
                 'Redeem Deal'}
              </button>
            ) : (
              <div style={styles.redemptionSuccess}>
                <CheckCircle size={48} style={{ color: theme.colors.success, margin: '0 auto' }} />
                <h3 style={{ fontSize: '1.25rem', fontWeight: 'bold', margin: `${theme.spacing.sm} 0` }}>
                  {hasAlreadyRedeemed && !isRedeeming ? 'Your Redemption Code' : 'Deal Redeemed!'}
                </h3>
                <p style={{ color: theme.colors.textSecondary, marginBottom: theme.spacing.md }}>
                  Show this code at checkout:
                </p>
                <div 
                  style={styles.redemptionCode}
                  onClick={(e) => {
                    navigator.clipboard.writeText(redemptionCode);
                    alert('Code copied to clipboard!');
                  }}
                  title="Click to copy"
                >
                  {redemptionCode}
                </div>
                <p style={{ fontSize: '0.75rem', color: theme.colors.textSecondary }}>
                  This code is valid for one-time use only
                </p>
                {hasAlreadyRedeemed && !isRedeeming && (
                  <p style={styles.alreadyRedeemedNote}>
                    You've previously redeemed this deal
                  </p>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  );
};

export default DealDetails;