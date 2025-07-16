import React from 'react';
import { supabase } from '../services/supabase';
import { Heart, MapPin, Clock, Tag, Sparkles } from 'lucide-react';
import { useTheme } from '../contexts/ThemeContext';

const DealCard = ({ deal, isFavorite, user, onFavoritesUpdate, onClick, viewMode = 'grid', currentTheme }) => {
  const theme = useTheme();
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

  // Use currentTheme if provided, otherwise fallback to theme system
  const cardTheme = currentTheme || {
    cardBg: theme.colors.cardBackground,
    text: theme.colors.textPrimary,
    textSecondary: theme.colors.textSecondary,
    border: theme.colors.border,
    accent: theme.colors.accent,
    accentSecondary: theme.colors.secondary,
    glass: theme.colors.glass
  };

  const cardStyles = {
    grid: {
      background: cardTheme.cardBg,
      borderRadius: theme.borderRadius.large,
      border: `1px solid ${cardTheme.border}`,
      cursor: 'pointer',
      transition: theme.animations.normal,
      position: 'relative',
      padding: `${theme.spacing.xl} ${theme.spacing.lg} ${theme.spacing.lg}`,
      backdropFilter: 'blur(20px)',
      WebkitBackdropFilter: 'blur(20px)',
      overflow: 'hidden',
      marginBottom: theme.spacing.md,
      boxShadow: theme.colors.shadow,
      fontFamily: theme.typography.fontFamily.sans,
    },
    list: {
      background: cardTheme.cardBg,
      borderRadius: theme.borderRadius.large,
      border: `1px solid ${cardTheme.border}`,
      cursor: 'pointer',
      transition: theme.animations.normal,
      position: 'relative',
      padding: `${theme.spacing.xl} ${theme.spacing.md} ${theme.spacing.md}`,
      backdropFilter: 'blur(20px)',
      WebkitBackdropFilter: 'blur(20px)',
      marginBottom: theme.spacing.sm,
      display: 'flex',
      alignItems: 'center',
      gap: theme.spacing.md,
      boxShadow: theme.colors.shadow,
      fontFamily: theme.typography.fontFamily.sans,
    }
  };

  return (
    <div
      onClick={onClick}
      style={cardStyles[viewMode]}
      onMouseEnter={(e) => {
        e.currentTarget.style.transform = 'translateY(-2px)';
        e.currentTarget.style.boxShadow = theme.colors.shadowHover;
        e.currentTarget.style.borderColor = cardTheme.accent;
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.transform = 'translateY(0)';
        e.currentTarget.style.boxShadow = theme.colors.shadow;
        e.currentTarget.style.borderColor = cardTheme.border;
      }}
    >
      {/* Discount Badge */}
      <div style={{
        position: 'absolute',
        top: theme.spacing.sm,
        left: theme.spacing.sm,
        background: urgentDeal 
          ? 'linear-gradient(135deg, #ef4444 0%, #dc2626 100%)'
          : `linear-gradient(135deg, ${cardTheme.accent} 0%, ${cardTheme.accentSecondary} 100%)`,
        color: 'white',
        padding: `${theme.spacing.xs} ${theme.spacing.md}`,
        borderRadius: theme.borderRadius.pill,
        fontSize: '0.75rem',
        fontWeight: '700',
        boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)',
        display: 'flex',
        alignItems: 'center',
        gap: theme.spacing.xs,
        zIndex: 2,
        maxWidth: 'calc(100% - 120px)', // Leave space for favorite button
      }}>
        <Sparkles size={12} />
        {getDiscountDisplay()}
      </div>

      <div style={{ display: 'flex', gap: theme.spacing.lg, alignItems: viewMode === 'list' ? 'center' : 'flex-start' }}>
        {/* Store Logo/Placeholder */}
        <div style={{
          width: viewMode === 'list' ? '3rem' : '4rem',
          height: viewMode === 'list' ? '3rem' : '4rem',
          background: cardTheme.glass,
          borderRadius: theme.borderRadius.medium,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          flexShrink: 0,
          border: `1px solid ${cardTheme.border}`,
          overflow: 'hidden',
        }}>
          {deal.stores.logo_url ? (
            <img 
              src={deal.stores.logo_url} 
              alt={deal.stores.name}
              style={{ width: '100%', height: '100%', objectFit: 'cover' }}
            />
          ) : (
            <Tag size={viewMode === 'list' ? 18 : 24} style={{ color: cardTheme.textSecondary }} />
          )}
        </div>

        {/* Deal Info */}
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', marginBottom: theme.spacing.sm }}>
            <div style={{ flex: 1 }}>
              <h3 style={{ 
                fontSize: viewMode === 'list' ? '1rem' : '1.125rem', 
                fontWeight: '700', 
                marginBottom: theme.spacing.xs,
                color: cardTheme.text,
                lineHeight: '1.3'
              }}>
                {deal.title}
              </h3>
              <p style={{ 
                fontSize: '0.875rem', 
                color: cardTheme.accent, 
                fontWeight: '600', 
                marginBottom: theme.spacing.xs,
                display: 'flex',
                alignItems: 'center',
                gap: theme.spacing.xs
              }}>
                <MapPin size={14} />
                {deal.stores.name}
              </p>
              <p style={{ 
                fontSize: '0.75rem', 
                color: cardTheme.textSecondary, 
                marginBottom: theme.spacing.sm,
                lineHeight: '1.4'
              }}>
                {deal.description.length > (viewMode === 'list' ? 80 : 60) 
                  ? `${deal.description.substring(0, viewMode === 'list' ? 80 : 60)}...` 
                  : deal.description
                }
              </p>
            </div>

            {/* Favorite Button */}
            <button
              onClick={handleFavoriteToggle}
              style={{
                padding: theme.spacing.sm,
                background: cardTheme.glass,
                border: `1px solid ${cardTheme.border}`,
                borderRadius: theme.borderRadius.medium,
                cursor: 'pointer',
                color: isFavorite ? '#ef4444' : cardTheme.textSecondary,
                transition: 'all 0.3s ease',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                position: 'absolute',
                top: theme.spacing.sm,
                right: theme.spacing.sm,
                zIndex: 5,
                width: '40px',
                height: '40px',
                backdropFilter: 'blur(20px)',
                WebkitBackdropFilter: 'blur(20px)',
                boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = 'scale(1.05)';
                e.currentTarget.style.background = isFavorite ? '#fee2e2' : cardTheme.accent + '20';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = 'scale(1)';
                e.currentTarget.style.background = cardTheme.glass;
              }}
            >
              <Heart size={18} fill={isFavorite ? '#ef4444' : 'none'} />
            </button>
          </div>

          {/* Meta Info */}
          <div style={{ 
            display: 'flex', 
            gap: theme.spacing.md, 
            fontSize: '0.75rem', 
            color: cardTheme.textSecondary,
            flexWrap: 'wrap',
            alignItems: 'center'
          }}>
            {deal.distance && (
              <div style={{ 
                display: 'flex', 
                alignItems: 'center', 
                gap: theme.spacing.xs,
                background: cardTheme.glass,
                padding: `${theme.spacing.xs} ${theme.spacing.sm}`,
                borderRadius: theme.borderRadius.small,
                border: `1px solid ${cardTheme.border}`
              }}>
                <MapPin size={12} />
                <span>{deal.distance.toFixed(1)} mi</span>
              </div>
            )}
            <div style={{ 
              display: 'flex', 
              alignItems: 'center', 
              gap: theme.spacing.xs,
              background: urgentDeal ? '#fee2e2' : cardTheme.glass,
              padding: `${theme.spacing.xs} ${theme.spacing.sm}`,
              borderRadius: theme.borderRadius.small,
              border: `1px solid ${urgentDeal ? '#fecaca' : cardTheme.border}`,
              color: urgentDeal ? '#dc2626' : cardTheme.textSecondary
            }}>
              <Clock size={12} />
              <span>
                {daysLeft > 0 ? `${daysLeft} days left` : 'Expires today!'}
              </span>
            </div>
            {deal.category && (
              <div style={{ 
                display: 'flex', 
                alignItems: 'center', 
                gap: theme.spacing.xs,
                background: cardTheme.glass,
                padding: `${theme.spacing.xs} ${theme.spacing.sm}`,
                borderRadius: theme.borderRadius.small,
                border: `1px solid ${cardTheme.border}`
              }}>
                <Tag size={12} />
                <span>{deal.category}</span>
              </div>
            )}
          </div>

          {/* Price Display */}
          <div style={{ 
            marginTop: theme.spacing.sm, 
            padding: theme.spacing.sm,
            background: cardTheme.glass,
            borderRadius: theme.borderRadius.medium,
            border: `1px solid ${cardTheme.border}`,
          }}>
            {deal.original_price && deal.deal_type !== 'bogo' && (
              <div style={{ 
                display: 'flex', 
                alignItems: 'center', 
                gap: theme.spacing.sm,
                justifyContent: 'space-between'
              }}>
                <div style={{ display: 'flex', alignItems: 'baseline', gap: theme.spacing.sm }}>
                  <span style={{ 
                    textDecoration: 'line-through', 
                    color: cardTheme.textSecondary,
                    fontSize: '0.875rem'
                  }}>
                    ${deal.original_price.toFixed(2)}
                  </span>
                  {deal.discount_price !== null && deal.discount_price !== undefined && (
                    <span style={{ 
                      fontSize: '1.25rem', 
                      fontWeight: '700', 
                      background: `linear-gradient(135deg, ${cardTheme.accent} 0%, ${cardTheme.accentSecondary} 100%)`,
                      WebkitBackgroundClip: 'text',
                      WebkitTextFillColor: 'transparent',
                      backgroundClip: 'text'
                    }}>
                      ${deal.discount_price.toFixed(2)}
                    </span>
                  )}
                </div>
                {deal.discount_price && (
                  <div style={{ 
                    fontSize: '0.75rem', 
                    fontWeight: '600', 
                    color: '#10b981',
                    background: '#d1fae5',
                    padding: `${theme.spacing.xs} ${theme.spacing.sm}`,
                    borderRadius: theme.borderRadius.small,
                    border: '1px solid #a7f3d0'
                  }}>
                    Save ${(deal.original_price - deal.discount_price).toFixed(2)}
                  </div>
                )}
              </div>
            )}

            {/* Special display for BOGO deals */}
            {deal.deal_type === 'bogo' && deal.original_price && (
              <div style={{ 
                fontSize: '1rem', 
                fontWeight: '600', 
                color: cardTheme.accentSecondary,
                textAlign: 'center'
              }}>
                Buy 1 at ${deal.original_price.toFixed(2)}, Get 1 FREE
              </div>
            )}

            {/* Display for deals without prices */}
            {!deal.original_price && !deal.discount_price && (
              <div style={{ 
                fontSize: '1rem', 
                fontWeight: '600', 
                color: cardTheme.textSecondary,
                textAlign: 'center'
              }}>
                See store for details
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default DealCard;