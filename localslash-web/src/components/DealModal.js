import React, { useState } from 'react';
import { X, MapPin, Clock, Heart, Phone, Navigation, Tag, AlertCircle, CheckCircle } from 'lucide-react';
import { supabase } from '../services/supabase';

const DealModal = ({ deal, onClose, user, theme, isAlreadyRedeemed, onRedeemSuccess }) => {
  const [isRedeeming, setIsRedeeming] = useState(false);
  const [redemptionError, setRedemptionError] = useState(null);
  const [showCode, setShowCode] = useState(false);

  const handleRedeemDeal = async () => {
    if (!user) {
      alert('Please sign in to redeem deals');
      return;
    }

    if (isAlreadyRedeemed) {
      return; // Don't allow redemption if already redeemed
    }

    setIsRedeeming(true);
    setRedemptionError(null);

    try {
      // Check if already redeemed (double-check)
      const { data: existingRedemption } = await supabase
        .from('deal_redemptions')
        .select('id')
        .eq('customer_id', user.id)
        .eq('deal_id', deal.id)
        .single();

      if (existingRedemption) {
        setRedemptionError('You have already redeemed this deal');
        setIsRedeeming(false);
        return;
      }

      // Create redemption record
      const { data, error } = await supabase
  .from('deal_redemptions')
  .insert({
    customer_id: user.id,
    deal_id: deal.id,
    store_id: deal.store_id,
    redeemed_at: new Date().toISOString(),
    status: 'redeemed', // ✅ default value
    redemption_code: generateDealCode(deal.id) // ✅ use same code you show in UI
  })
  .select()
  .single();

      if (error) throw error;

      // Update deal redemption count
      await supabase
        .from('deals')
        .update({ 
          current_redemptions: (deal.current_redemptions || 0) + 1 
        })
        .eq('id', deal.id);

      setShowCode(true);
      onRedeemSuccess();
    } catch (error) {
      console.error('Error redeeming deal:', error);
      setRedemptionError('Failed to redeem deal. Please try again.');
    } finally {
      setIsRedeeming(false);
    }
  };

  const getDaysLeft = (endDate) => {
    const end = new Date(endDate);
    const now = new Date();
    const diffTime = end - now;
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  };

  const getDiscountDisplay = (deal) => {
    if (deal.deal_type === 'percentage') {
      return `${deal.discount_percentage}% OFF`;
    } else if (deal.deal_type === 'fixed') {
      return `$${deal.discount_amount} OFF`;
    } else if (deal.deal_type === 'bogo') {
      return 'Buy One Get One';
    }
    return 'Special Deal';
  };

  const generateDealCode = (dealId) => {
    // Generate a simple deal code based on deal ID
    return `DEAL${dealId.toString().padStart(4, '0')}`;
  };

  const daysLeft = getDaysLeft(deal.end_date);
  const isExpired = daysLeft <= 0;
  const dealCode = generateDealCode(deal.id);

  const styles = {
    overlay: {
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      background: 'rgba(0, 0, 0, 0.8)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 1000,
      padding: '20px',
      backdropFilter: 'blur(10px)',
    },

    modal: {
      background: theme.cardBg,
      borderRadius: '20px',
      width: '100%',
      maxWidth: '420px',
      maxHeight: '90vh',
      overflow: 'hidden',
      position: 'relative',
      border: `1px solid ${theme.border}`,
      backdropFilter: 'blur(20px)',
    },

    header: {
      position: 'relative',
      background: `linear-gradient(135deg, ${theme.accent}20 0%, ${theme.accentSecondary}20 100%)`,
      padding: '24px',
      borderBottom: `1px solid ${theme.border}`,
    },

    closeButton: {
      position: 'absolute',
      top: '16px',
      right: '16px',
      width: '40px',
      height: '40px',
      borderRadius: '12px',
      background: theme.glass,
      border: `1px solid ${theme.border}`,
      cursor: 'pointer',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      transition: 'all 0.3s',
      backdropFilter: 'blur(10px)',
    },

    dealBadge: {
      display: 'inline-flex',
      alignItems: 'center',
      gap: '6px',
      background: `linear-gradient(135deg, ${theme.accent} 0%, ${theme.accentSecondary} 100%)`,
      color: 'white',
      padding: '8px 16px',
      borderRadius: '12px',
      fontSize: '14px',
      fontWeight: '600',
      marginBottom: '16px',
    },

    dealTitle: {
      fontSize: '24px',
      fontWeight: '700',
      color: theme.text,
      marginBottom: '8px',
      lineHeight: '1.3',
    },

    storeName: {
      fontSize: '16px',
      color: theme.textSecondary,
      display: 'flex',
      alignItems: 'center',
      gap: '6px',
    },

    content: {
      padding: '24px',
    },

    section: {
      marginBottom: '24px',
    },

    sectionTitle: {
      fontSize: '18px',
      fontWeight: '600',
      color: theme.text,
      marginBottom: '12px',
    },

    description: {
      fontSize: '16px',
      color: theme.textSecondary,
      lineHeight: '1.6',
      marginBottom: '20px',
    },

    infoGrid: {
      display: 'grid',
      gridTemplateColumns: '1fr 1fr',
      gap: '16px',
      marginBottom: '24px',
    },

    infoItem: {
      background: theme.glass,
      padding: '16px',
      borderRadius: '12px',
      border: `1px solid ${theme.border}`,
      backdropFilter: 'blur(10px)',
    },

    infoLabel: {
      fontSize: '14px',
      color: theme.textSecondary,
      marginBottom: '4px',
    },

    infoValue: {
      fontSize: '16px',
      fontWeight: '600',
      color: theme.text,
    },

    contactInfo: {
      display: 'flex',
      flexDirection: 'column',
      gap: '12px',
      marginBottom: '24px',
    },

    contactItem: {
      display: 'flex',
      alignItems: 'center',
      gap: '12px',
      padding: '12px',
      background: theme.glass,
      borderRadius: '12px',
      border: `1px solid ${theme.border}`,
      fontSize: '14px',
      color: theme.textSecondary,
    },

    priceSection: {
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      padding: '20px',
      background: theme.glass,
      borderRadius: '16px',
      border: `1px solid ${theme.border}`,
      marginBottom: '24px',
      backdropFilter: 'blur(10px)',
    },

    priceLeft: {
      display: 'flex',
      flexDirection: 'column',
      gap: '4px',
    },

    originalPrice: {
      fontSize: '16px',
      color: theme.textSecondary,
      textDecoration: 'line-through',
    },

    discountPrice: {
      fontSize: '24px',
      fontWeight: '700',
      background: `linear-gradient(135deg, ${theme.accent} 0%, ${theme.accentSecondary} 100%)`,
      WebkitBackgroundClip: 'text',
      WebkitTextFillColor: 'transparent',
      backgroundClip: 'text',
    },

    savingsAmount: {
      fontSize: '16px',
      fontWeight: '600',
      color: '#10b981',
    },

    // Code display section
    codeSection: {
      background: theme.glass,
      border: `2px solid ${theme.accent}`,
      borderRadius: '16px',
      padding: '20px',
      textAlign: 'center',
      marginBottom: '24px',
      backdropFilter: 'blur(10px)',
    },

    codeLabel: {
      fontSize: '14px',
      color: theme.textSecondary,
      marginBottom: '8px',
    },

    codeValue: {
      fontSize: '32px',
      fontWeight: '700',
      color: theme.accent,
      letterSpacing: '2px',
      fontFamily: 'monospace',
      marginBottom: '12px',
    },

    codeInstructions: {
      fontSize: '14px',
      color: theme.textSecondary,
      lineHeight: '1.5',
    },

    // Bottom action area
    actionArea: {
      padding: '20px 24px 24px',
      borderTop: `1px solid ${theme.border}`,
      background: theme.cardBg,
    },

    redeemButton: {
      width: '100%',
      padding: '16px',
      background: `linear-gradient(135deg, ${theme.accent} 0%, ${theme.accentSecondary} 100%)`,
      color: 'white',
      border: 'none',
      borderRadius: '16px',
      fontSize: '16px',
      fontWeight: '600',
      cursor: 'pointer',
      transition: 'all 0.3s',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      gap: '8px',
    },

    redeemButtonDisabled: {
      background: theme.border,
      color: theme.textSecondary,
      cursor: 'not-allowed',
    },

    errorMessage: {
      background: '#fee2e2',
      color: '#dc2626',
      padding: '12px 16px',
      borderRadius: '12px',
      fontSize: '14px',
      marginBottom: '16px',
      display: 'flex',
      alignItems: 'center',
      gap: '8px',
      border: '1px solid #fecaca',
    },

    successMessage: {
      background: '#d1fae5',
      color: '#065f46',
      padding: '12px 16px',
      borderRadius: '12px',
      fontSize: '14px',
      marginBottom: '16px',
      display: 'flex',
      alignItems: 'center',
      gap: '8px',
      border: '1px solid #a7f3d0',
    },

    directionsButton: {
      width: '100%',
      padding: '12px',
      background: 'transparent',
      color: theme.accent,
      border: `2px solid ${theme.accent}`,
      borderRadius: '12px',
      fontSize: '14px',
      fontWeight: '600',
      cursor: 'pointer',
      transition: 'all 0.3s',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      gap: '8px',
      marginTop: '12px',
    },
  };

  const handleGetDirections = () => {
    if (deal.stores?.address) {
      const address = encodeURIComponent(deal.stores.address);
      window.open(`https://maps.google.com/?q=${address}`, '_blank');
    }
  };

  return (
    <div style={styles.overlay} onClick={onClose}>
      <div style={styles.modal} onClick={(e) => e.stopPropagation()}>
        {/* Header */}
        <div style={styles.header}>
          <button
            style={styles.closeButton}
            onClick={onClose}
            onMouseEnter={(e) => e.currentTarget.style.transform = 'scale(1.1)'}
            onMouseLeave={(e) => e.currentTarget.style.transform = 'scale(1)'}
          >
            <X size={20} color={theme.textSecondary} />
          </button>

          <div style={styles.dealBadge}>
            <Tag size={16} />
            {getDiscountDisplay(deal)}
          </div>

          <h2 style={styles.dealTitle}>{deal.title}</h2>
          
          <div style={styles.storeName}>
            <MapPin size={16} />
            {deal.stores?.name}
          </div>
        </div>

        {/* Content */}
        <div style={styles.content}>
          {deal.description && (
            <p style={styles.description}>{deal.description}</p>
          )}

          {/* Info Grid */}
          <div style={styles.infoGrid}>
            <div style={styles.infoItem}>
              <div style={styles.infoLabel}>Expires in</div>
              <div style={{
                ...styles.infoValue,
                color: daysLeft <= 3 ? '#ef4444' : theme.text
              }}>
                {daysLeft} days
              </div>
            </div>
            <div style={styles.infoItem}>
              <div style={styles.infoLabel}>Available</div>
              <div style={styles.infoValue}>
                {deal.max_redemptions 
                  ? `${(deal.max_redemptions - (deal.current_redemptions || 0))} left`
                  : 'Unlimited'
                }
              </div>
            </div>
          </div>

          {/* Contact Info */}
          {(deal.stores?.address || deal.stores?.phone) && (
            <div style={styles.contactInfo}>
              {deal.stores?.address && (
                <div style={styles.contactItem}>
                  <MapPin size={16} />
                  {deal.stores.address}
                </div>
              )}
              {deal.stores?.phone && (
                <div style={styles.contactItem}>
                  <Phone size={16} />
                  {deal.stores.phone}
                </div>
              )}
            </div>
          )}

          {/* Price Section */}
          {(deal.original_price || deal.discount_price) && (
            <div style={styles.priceSection}>
              <div style={styles.priceLeft}>
                {deal.original_price && (
                  <span style={styles.originalPrice}>${deal.original_price}</span>
                )}
                {deal.discount_price && (
                  <span style={styles.discountPrice}>${deal.discount_price}</span>
                )}
              </div>
              {deal.original_price && deal.discount_price && (
                <div style={styles.savingsAmount}>
                  Save ${(parseFloat(deal.original_price) - parseFloat(deal.discount_price)).toFixed(2)}
                </div>
              )}
            </div>
          )}

          {/* Show code if redeemed or already redeemed */}
          {(showCode || isAlreadyRedeemed) && (
            <div style={styles.codeSection}>
              <div style={styles.codeLabel}>Your Deal Code</div>
              <div style={styles.codeValue}>{dealCode}</div>
              <div style={styles.codeInstructions}>
                Show this code to the cashier when making your purchase
              </div>
            </div>
          )}
        </div>

        {/* Action Area */}
        <div style={styles.actionArea}>
          {redemptionError && (
            <div style={styles.errorMessage}>
              <AlertCircle size={16} />
              {redemptionError}
            </div>
          )}

          {(showCode || isAlreadyRedeemed) && (
            <div style={styles.successMessage}>
              <CheckCircle size={16} />
              Deal redeemed successfully! Enjoy your savings.
            </div>
          )}

          {!showCode && !isAlreadyRedeemed && (
            <button
              style={{
                ...styles.redeemButton,
                ...(isExpired || isRedeeming ? styles.redeemButtonDisabled : {})
              }}
              onClick={handleRedeemDeal}
              disabled={isExpired || isRedeeming}
            >
              {isRedeeming ? 'Processing...' : 
               isExpired ? 'Deal Expired' : 
               'Redeem Deal'}
            </button>
          )}

          {deal.stores?.address && (
            <button
              style={styles.directionsButton}
              onClick={handleGetDirections}
              onMouseEnter={(e) => e.currentTarget.style.background = `${theme.accent}10`}
              onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
            >
              <Navigation size={16} />
              Get Directions
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default DealModal;