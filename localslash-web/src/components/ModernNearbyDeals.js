import React, { useState, useEffect } from 'react';
import { MapPin, Clock, Tag, Heart, TrendingUp, Zap, ChevronRight } from 'lucide-react';
import { supabase } from '../services/supabase';
import DealModal from './DealModal';

const ModernNearbyDeals = ({ deals, favorites, user, onFavoritesUpdate, isLoading, viewMode = 'grid', theme }) => {
  const [selectedDeal, setSelectedDeal] = useState(null);
  const [hoveredCard, setHoveredCard] = useState(null);
  const [redeemedDeals, setRedeemedDeals] = useState(new Set());

  useEffect(() => {
    if (user) {
      checkRedeemedDeals();
    }
  }, [user, deals]);

  const checkRedeemedDeals = async () => {
    if (!user || !deals.length) return;
    
    try {
      const { data } = await supabase
        .from('deal_redemptions')
        .select('deal_id')
        .eq('customer_id', user.id)
        .in('deal_id', deals.map(d => d.id));
      
      if (data) {
        setRedeemedDeals(new Set(data.map(r => r.deal_id)));
      }
    } catch (error) {
      console.error('Error checking redeemed deals:', error);
    }
  };

  const handleDealClick = (deal) => {
    setSelectedDeal(deal);
  };

  const handleFavoriteToggle = async (e, dealId, storeId) => {
    e.stopPropagation();
    
    if (!user) {
      alert('Please sign in to save favorites');
      return;
    }

    const isFavorite = favorites.some(f => f.deal_id === dealId);

    try {
      if (isFavorite) {
        await supabase
          .from('favorites')
          .delete()
          .eq('customer_id', user.id)
          .eq('deal_id', dealId);
      } else {
        await supabase
          .from('favorites')
          .insert({
            customer_id: user.id,
            deal_id: dealId,
            store_id: storeId
          });
      }
      
      onFavoritesUpdate();
    } catch (error) {
      console.error('Error toggling favorite:', error);
      alert('Failed to update favorite. Please try again.');
    }
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

  const getDealTypeGradient = (dealType) => {
    switch (dealType) {
      case 'percentage':
        return 'linear-gradient(135deg, #f59e0b 0%, #ef4444 100%)';
      case 'fixed':
        return 'linear-gradient(135deg, #10b981 0%, #3b82f6 100%)';
      case 'bogo':
        return 'linear-gradient(135deg, #8b5cf6 0%, #ec4899 100%)';
      default:
        return 'linear-gradient(135deg, #6366f1 0%, #a855f7 100%)';
    }
  };

  const getDaysLeft = (endDate) => {
    const end = new Date(endDate);
    const now = new Date();
    const diffTime = end - now;
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  };

  const styles = {
    container: {
      width: '100%',
      boxSizing: 'border-box',
      padding: '0',
    },

    loadingContainer: {
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      minHeight: '400px',
      gap: '2rem',
    },

    loadingSpinner: {
      width: '60px',
      height: '60px',
      border: `4px solid ${theme.border}`,
      borderTop: `4px solid ${theme.accent}`,
      borderRadius: '50%',
      animation: 'spin 1s linear infinite',
    },

    emptyState: {
      textAlign: 'center',
      padding: '4rem 2rem',
      background: theme.glass,
      borderRadius: '16px',
      border: `1px solid ${theme.border}`,
      backdropFilter: 'blur(20px)',
    },

    emptyIcon: {
      width: '80px',
      height: '80px',
      margin: '0 auto 2rem',
      background: `linear-gradient(135deg, ${theme.accent} 0%, ${theme.accentSecondary} 100%)`,
      borderRadius: '50%',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
    },

    // Grid View Styles
    dealsGrid: {
      display: 'grid',
      gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
      gap: '1.5rem',
      padding: '0 1.5rem',
      width: '100%',
      boxSizing: 'border-box',
      margin: '0 auto',
      maxWidth: '1600px',
    },

    // List View Styles
    dealsList: {
      display: 'flex',
      flexDirection: 'column',
      gap: '1rem',
      padding: '0 1.5rem',
      width: '100%',
      boxSizing: 'border-box',
      margin: '0 auto',
      maxWidth: '1600px',
    },

    // Standard Card Styles
    dealCard: {
      background: theme.cardBg,
      borderRadius: '16px',
      border: `1px solid ${theme.border}`,
      overflow: 'hidden',
      cursor: 'pointer',
      transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
      position: 'relative',
      backdropFilter: 'blur(10px)',
      WebkitBackdropFilter: 'blur(10px)',
    },

    dealCardHover: {
      transform: 'translateY(-4px)',
      boxShadow: '0 12px 24px -8px rgba(0, 0, 0, 0.15)',
      borderColor: theme.accent,
    },

    // List Card Style - Fixed alignment
    dealCardList: {
      display: 'flex',
      alignItems: 'stretch', // Changed from 'center' to 'stretch'
      padding: '20px',
      gap: '20px',
      background: theme.cardBg,
      borderRadius: '16px',
      border: `1px solid ${theme.border}`,
      transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
      cursor: 'pointer',
      position: 'relative',
      backdropFilter: 'blur(10px)',
      WebkitBackdropFilter: 'blur(10px)',
      minHeight: '120px', // Ensure consistent height
    },

    redeemedOverlay: {
      position: 'absolute',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      background: 'rgba(0, 0, 0, 0.6)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      borderRadius: '16px',
      zIndex: 15,
    },

    redeemedLabel: {
      background: 'rgba(255, 255, 255, 0.9)',
      color: '#1a1a1a',
      padding: '8px 16px',
      borderRadius: '8px',
      fontWeight: '600',
      fontSize: '14px',
    },

    cardGlow: {
      position: 'absolute',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      background: `radial-gradient(circle at center, ${theme.accent}20 0%, transparent 70%)`,
      opacity: 0,
      transition: 'opacity 0.3s',
      pointerEvents: 'none',
    },

    dealBadge: {
      position: 'absolute',
      top: '16px',
      left: '16px',
      padding: '4px 8px',
      borderRadius: '8px',
      color: 'white',
      fontWeight: '600',
      fontSize: '12px',
      zIndex: 10,
      display: 'flex',
      alignItems: 'center',
      gap: '4px',
    },

    favoriteButton: {
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
      zIndex: 10,
      backdropFilter: 'blur(10px)',
      WebkitBackdropFilter: 'blur(10px)',
      flexShrink: 0, // Prevent button from shrinking
    },

    favoriteButtonGrid: {
      position: 'absolute',
      top: '16px',
      right: '16px',
    },

    dealImage: {
      width: '100%',
      height: '200px',
      objectFit: 'cover',
      background: `linear-gradient(135deg, ${theme.accent}20 0%, ${theme.accentSecondary}20 100%)`,
    },

    dealContent: {
      padding: '16px 20px 20px',
    },

    // List view content - Fixed flex layout
    dealContentList: {
      flex: 1,
      display: 'flex',
      flexDirection: 'column',
      justifyContent: 'space-between',
      minHeight: '80px',
    },

    dealHeader: {
      marginBottom: '12px',
    },

    dealHeaderList: {
      marginBottom: '8px',
    },

    storeName: {
      fontSize: '14px',
      color: theme.textSecondary,
      marginBottom: '4px',
      display: 'flex',
      alignItems: 'center',
      gap: '4px',
    },

    dealTitle: {
      fontSize: '18px',
      fontWeight: '700',
      color: theme.text,
      marginBottom: '8px',
      lineHeight: '1.3',
    },

    dealTitleList: {
      fontSize: '16px',
      fontWeight: '700',
      color: theme.text,
      marginBottom: '6px',
      lineHeight: '1.3',
    },

    dealDescription: {
      fontSize: '14px',
      color: theme.textSecondary,
      lineHeight: '1.5',
      marginBottom: '12px',
      display: '-webkit-box',
      WebkitLineClamp: 2,
      WebkitBoxOrient: 'vertical',
      overflow: 'hidden',
    },

    dealMeta: {
      display: 'flex',
      gap: '12px',
      flexWrap: 'wrap',
      marginBottom: '12px',
    },

    dealMetaList: {
      display: 'flex',
      gap: '12px',
      flexWrap: 'wrap',
      marginTop: 'auto', // Push to bottom
    },

    metaItem: {
      display: 'flex',
      alignItems: 'center',
      gap: '4px',
      fontSize: '14px',
      color: theme.textSecondary,
    },

    metaBadge: {
      color: 'white',
      background: getDealTypeGradient('percentage'), // Default gradient
      padding: '4px 12px',
      borderRadius: '12px',
      fontWeight: '600',
      fontSize: '12px',
      display: 'flex',
      alignItems: 'center',
      gap: '4px',
    },

    priceSection: {
      display: 'flex',
      alignItems: 'baseline',
      gap: '12px',
      marginBottom: '12px',
    },

    // List view price section - Fixed alignment
    priceSectionList: {
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'flex-end',
      justifyContent: 'center',
      textAlign: 'right',
      minWidth: '100px',
      flexShrink: 0,
    },

    originalPrice: {
      fontSize: '16px',
      color: theme.textSecondary,
      textDecoration: 'line-through',
      lineHeight: '1.2',
    },

    discountPrice: {
      fontSize: '24px',
      fontWeight: '700',
      background: `linear-gradient(135deg, ${theme.accent} 0%, ${theme.accentSecondary} 100%)`,
      WebkitBackgroundClip: 'text',
      WebkitTextFillColor: 'transparent',
      backgroundClip: 'text',
      lineHeight: '1.2',
    },

    discountPriceList: {
      fontSize: '20px',
      fontWeight: '700',
      background: `linear-gradient(135deg, ${theme.accent} 0%, ${theme.accentSecondary} 100%)`,
      WebkitBackgroundClip: 'text',
      WebkitTextFillColor: 'transparent',
      backgroundClip: 'text',
      lineHeight: '1.2',
    },

    dealFooter: {
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
      paddingTop: '12px',
      borderTop: `1px solid ${theme.border}`,
    },

    // Right side container for list view
    dealRightSection: {
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'flex-end',
      justifyContent: 'space-between',
      minWidth: '120px',
      height: '100%',
      flexShrink: 0,
    },

    viewDealButton: {
      display: 'flex',
      alignItems: 'center',
      gap: '6px',
      color: theme.accent,
      fontSize: '14px',
      fontWeight: '600',
      transition: 'gap 0.3s',
      whiteSpace: 'nowrap',
    },

    urgentBadge: {
      background: 'linear-gradient(135deg, #ef4444 0%, #dc2626 100%)',
      color: 'white',
      padding: '4px 8px',
      borderRadius: '8px',
      fontSize: '12px',
      fontWeight: '600',
      display: 'flex',
      alignItems: 'center',
      gap: '4px',
    },
  };

  if (isLoading) {
    return (
      <div style={styles.container}>
        <div style={styles.loadingContainer}>
          <div style={styles.loadingSpinner} />
          <p style={{ color: theme.textSecondary }}>Discovering amazing deals near you...</p>
        </div>
        <style>{`
          @keyframes spin {
            0% { transform: rotate(0deg); }
            100% { transform: rotate(360deg); }
          }
        `}</style>
      </div>
    );
  }

  if (!deals || deals.length === 0) {
    return (
      <div style={styles.container}>
        <div style={styles.emptyState}>
          <div style={styles.emptyIcon}>
            <MapPin size={40} color="white" />
          </div>
          <h3 style={{ fontSize: '1.5rem', marginBottom: '1rem' }}>No Deals Found</h3>
          <p style={{ color: theme.textSecondary, marginBottom: '2rem' }}>
            Try adjusting your filters or search in a different area.
          </p>
          <button
            style={{
              padding: '0.75rem 2rem',
              background: `linear-gradient(135deg, ${theme.accent} 0%, ${theme.accentSecondary} 100%)`,
              color: 'white',
              border: 'none',
              borderRadius: '2rem',
              fontWeight: '600',
              cursor: 'pointer',
              transition: 'transform 0.3s',
            }}
            onMouseEnter={(e) => e.currentTarget.style.transform = 'scale(1.05)'}
            onMouseLeave={(e) => e.currentTarget.style.transform = 'scale(1)'}
          >
            Reset Filters
          </button>
        </div>
      </div>
    );
  }

  const renderDealCard = (deal) => {
    const isFavorite = favorites.some(f => f.deal_id === deal.id);
    const isHovered = hoveredCard === deal.id;
    const daysLeft = getDaysLeft(deal.end_date);
    const isUrgent = daysLeft <= 3;

    if (viewMode === 'list') {
      return (
        <div
          key={deal.id}
          style={{
            ...styles.dealCard,
            ...styles.dealCardList,
            ...(isHovered ? styles.dealCardHover : {})
          }}
          onClick={() => handleDealClick(deal)}
          onMouseEnter={() => setHoveredCard(deal.id)}
          onMouseLeave={() => setHoveredCard(null)}
        >
          {/* Left section - Content */}
          <div style={styles.dealContentList}>
            <div style={styles.dealHeaderList}>
              <div style={styles.storeName}>
                <MapPin size={16} />
                {deal.stores?.name}
                {deal.distance && ` • ${deal.distance.toFixed(1)} mi`}
              </div>
              <h3 style={styles.dealTitleList}>{deal.title}</h3>
            </div>
            
            <div style={styles.dealMetaList}>
              <span style={{
                ...styles.metaBadge,
                background: getDealTypeGradient(deal.deal_type),
              }}>
                <Zap size={14} />
                {getDiscountDisplay(deal)}
              </span>
              {isUrgent && (
                <span style={styles.urgentBadge}>
                  <Clock size={14} />
                  {daysLeft} days left
                </span>
              )}
            </div>
          </div>
          
          {/* Right section - Price and Favorite */}
          <div style={styles.dealRightSection}>
            <button
              style={{
                ...styles.favoriteButton,
                background: isFavorite
                  ? `linear-gradient(135deg, ${theme.accent} 0%, ${theme.accentSecondary} 100%)`
                  : theme.glass,
              }}
              onClick={(e) => handleFavoriteToggle(e, deal.id, deal.store_id)}
            >
              <Heart size={20} fill={isFavorite ? 'white' : 'none'} color={isFavorite ? 'white' : theme.textSecondary} />
            </button>

            <div style={styles.priceSectionList}>
              {deal.original_price && (
                <span style={styles.originalPrice}>${deal.original_price}</span>
              )}
              {deal.discount_price && (
                <span style={styles.discountPriceList}>${deal.discount_price}</span>
              )}
            </div>
          </div>

          {/* Redeemed overlay */}
          {redeemedDeals.has(deal.id) && (
            <div style={styles.redeemedOverlay}>
              <div style={styles.redeemedLabel}>
                Already Redeemed
              </div>
            </div>
          )}
        </div>
      );
    }

    // Grid View Card
    return (
      <div
        key={deal.id}
        style={{
          ...styles.dealCard,
          ...(isHovered ? styles.dealCardHover : {})
        }}
        onClick={() => handleDealClick(deal)}
        onMouseEnter={() => setHoveredCard(deal.id)}
        onMouseLeave={() => setHoveredCard(null)}
      >
        <div style={{ ...styles.cardGlow, opacity: isHovered ? 1 : 0 }} />
        
        {/* Deal Badge */}
        <div style={{ ...styles.dealBadge, background: getDealTypeGradient(deal.deal_type) }}>
          <Zap size={16} />
          {getDiscountDisplay(deal)}
        </div>
        
        {/* Favorite Button */}
        <button
          style={{
            ...styles.favoriteButton,
            ...styles.favoriteButtonGrid,
            background: isFavorite ? `linear-gradient(135deg, ${theme.accent} 0%, ${theme.accentSecondary} 100%)` : theme.glass,
          }}
          onClick={(e) => handleFavoriteToggle(e, deal.id, deal.store_id)}
          onMouseEnter={(e) => e.currentTarget.style.transform = 'scale(1.1)'}
          onMouseLeave={(e) => e.currentTarget.style.transform = 'scale(1)'}
        >
          <Heart size={20} fill={isFavorite ? 'white' : 'none'} color={isFavorite ? 'white' : theme.textSecondary} />
        </button>
        
        {/* Deal Image Placeholder */}
        <div style={styles.dealImage}>
          <div style={{
            width: '100%',
            height: '100%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            background: `linear-gradient(135deg, ${theme.accent}10 0%, ${theme.accentSecondary}10 100%)`,
          }}>
            <Tag size={60} color={theme.border} />
          </div>
        </div>
        
        {/* Deal Content */}
        <div style={styles.dealContent}>
          <div style={styles.dealHeader}>
            <div style={styles.storeName}>
              <MapPin size={16} />
              {deal.stores?.name}
              {deal.distance && ` • ${deal.distance.toFixed(1)} mi`}
            </div>
            <h3 style={styles.dealTitle}>{deal.title}</h3>
            {deal.description && (
              <p style={styles.dealDescription}>{deal.description}</p>
            )}
          </div>
          
          <div style={styles.dealMeta}>
            <div style={styles.metaItem}>
              <Clock size={16} />
              {daysLeft} days left
            </div>
            {deal.current_redemptions !== undefined && (
              <div style={styles.metaItem}>
                <TrendingUp size={16} />
                {deal.current_redemptions} claimed
              </div>
            )}
          </div>
          
          <div style={styles.priceSection}>
            {deal.original_price && (
              <span style={styles.originalPrice}>${deal.original_price}</span>
            )}
            {deal.discount_price && (
              <span style={styles.discountPrice}>${deal.discount_price}</span>
            )}
          </div>
          
          <div style={styles.dealFooter}>
            {isUrgent && (
              <span style={styles.urgentBadge}>
                <Zap size={14} />
                Limited
              </span>
            )}
            <span style={{
              ...styles.viewDealButton,
              gap: isHovered ? '0.75rem' : '0.5rem',
              marginLeft: 'auto'
            }}>
              View Deal
              <ChevronRight size={16} />
            </span>
          </div>
        </div>

        {/* Redeemed overlay */}
        {redeemedDeals.has(deal.id) && (
          <div style={styles.redeemedOverlay}>
            <div style={styles.redeemedLabel}>
              Already Redeemed
            </div>
          </div>
        )}
      </div>
    );
  };

  return (
    <div style={styles.container}>
      <div style={viewMode === 'grid' ? styles.dealsGrid : styles.dealsList}>
        {deals.map(renderDealCard)}
      </div>
      
      {selectedDeal && (
        <DealModal
          deal={selectedDeal}
          onClose={() => setSelectedDeal(null)}
          user={user}
          theme={theme}
          isAlreadyRedeemed={redeemedDeals.has(selectedDeal.id)}
          onRedeemSuccess={() => {
            setRedeemedDeals(prev => new Set([...prev, selectedDeal.id]));
            setSelectedDeal(null);
          }}
        />
      )}
    </div>
  );
};

export default ModernNearbyDeals;