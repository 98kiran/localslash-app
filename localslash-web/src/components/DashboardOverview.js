import React from 'react';
import { ShoppingBag, Eye, CheckCircle, TrendingUp, ArrowUp, ArrowDown } from 'lucide-react';
import { useTheme } from '../contexts/ThemeContext';

const DashboardOverview = ({ store, deals = [] }) => {
  const theme = useTheme();
  const activeDeals = deals.filter(d => d.is_active);
  const totalRedemptions = deals.reduce((sum, deal) => sum + (deal.current_redemptions || 0), 0);
  const totalViews = deals.reduce((sum, deal) => sum + (deal.total_views || 0), 0);
  const conversionRate = totalViews > 0 ? ((totalRedemptions / totalViews) * 100).toFixed(1) : 0;
  
  // Function to properly display discount information
  const getDiscountDisplay = (deal) => {
    if (!deal) return '-';
    
    if (deal.deal_type === 'bogo') {
      return 'BOGO';
    } else if (deal.deal_type === 'percentage' && deal.discount_percentage) {
      return `${deal.discount_percentage}%`;
    } else if (deal.deal_type === 'fixed_amount' && deal.original_price && deal.discount_price) {
      const savings = deal.original_price - deal.discount_price;
      return `$${savings.toFixed(2)}`;
    } else if (deal.deal_type === 'other') {
      if (deal.original_price && deal.discount_price) {
        const savings = deal.original_price - deal.discount_price;
        return `$${savings.toFixed(2)}`;
      }
      return 'Special';
    }
    
    // Handle case where prices are null or undefined
    return '-';
  };

  const getDealBadgeColor = (dealType) => {
    switch (dealType) {
      case 'bogo':
        return '#8b5cf6'; // Purple
      case 'percentage':
        return '#3b82f6'; // Blue
      case 'fixed_amount':
        return '#10b981'; // Green
      default:
        return '#6b7280'; // Gray
    }
  };
  
  const statsCards = [
    {
      title: 'Active Deals',
      value: activeDeals.length,
      icon: ShoppingBag,
      color: theme.colors.success,
      bgColor: `${theme.colors.success}10`,
      trend: null
    },
    {
      title: 'Total Views',
      value: totalViews,
      icon: Eye,
      color: theme.colors.info,
      bgColor: `${theme.colors.info}10`,
      trend: null
    },
    {
      title: 'Redemptions',
      value: totalRedemptions,
      icon: CheckCircle,
      color: theme.colors.warning,
      bgColor: `${theme.colors.warning}10`,
      trend: null
    },
    {
      title: 'Conversion Rate',
      value: `${conversionRate}%`,
      icon: TrendingUp,
      color: theme.colors.accent,
      bgColor: `${theme.colors.accent}10`,
      trend: null
    }
  ];

  return (
    <>
      <style>{`
        @keyframes fadeIn {
          0% { opacity: 0; transform: translateY(20px); }
          100% { opacity: 1; transform: translateY(0); }
        }
        
        @keyframes pulse {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.8; }
        }
        
        @media (max-width: ${theme.breakpoints.tablet}) {
          .dashboard-stats-grid {
            grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)) !important;
            gap: ${theme.spacing.md} !important;
          }
          
          .dashboard-table {
            font-size: ${theme.typography.fontSize.sm} !important;
          }
        }
        
        @media (max-width: ${theme.breakpoints.mobile}) {
          .dashboard-stats-grid {
            grid-template-columns: 1fr !important;
          }
          
          .dashboard-title {
            font-size: ${theme.typography.fontSize.xl} !important;
          }
        }
      `}</style>
      
      <div style={{ 
        fontFamily: theme.typography.fontFamily.sans,
        animation: 'fadeIn 0.6s ease-out'
      }}>
        <div style={{ 
          display: 'flex', 
          justifyContent: 'space-between', 
          alignItems: 'center', 
          marginBottom: theme.spacing.xl 
        }}>
          <h2 
            className="dashboard-title"
            style={{ 
              fontSize: theme.typography.fontSize['2xl'], 
              fontWeight: theme.typography.fontWeight.bold, 
              color: theme.colors.textPrimary,
              display: 'flex',
              alignItems: 'center',
              gap: theme.spacing.md
            }}
          >
            <div style={{
              width: '2.5rem',
              height: '2.5rem',
              background: theme.gradients.primary,
              borderRadius: theme.borderRadius.medium,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              boxShadow: `0 8px 20px ${theme.colors.primary}30`
            }}>
              <TrendingUp size={20} style={{ color: 'white' }} />
            </div>
            Dashboard Overview
          </h2>
          
          <div style={{
            padding: `${theme.spacing.xs} ${theme.spacing.sm}`,
            background: theme.colors.glass,
            borderRadius: theme.borderRadius.medium,
            border: `1px solid ${theme.colors.border}`,
            fontSize: theme.typography.fontSize.sm,
            color: theme.colors.textSecondary,
            backdropFilter: 'blur(10px)',
            WebkitBackdropFilter: 'blur(10px)'
          }}>
            Last updated: {new Date().toLocaleTimeString()}
          </div>
        </div>
        
        {/* Stats cards */}
        <div 
          className="dashboard-stats-grid"
          style={{ 
            display: 'grid', 
            gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', 
            gap: theme.spacing.lg, 
            marginBottom: theme.spacing.xl 
          }}
        >
          {statsCards.map((stat, index) => (
            <div 
              key={stat.title}
              style={{ 
                background: theme.colors.cardBackground,
                padding: theme.spacing.xl,
                borderRadius: theme.borderRadius.large,
                boxShadow: theme.colors.shadowMedium,
                border: `1px solid ${theme.colors.border}`,
                position: 'relative',
                overflow: 'hidden',
                transition: theme.animations.normal,
                backdropFilter: 'blur(10px)',
                WebkitBackdropFilter: 'blur(10px)',
                animation: `fadeIn 0.6s ease-out ${index * 0.1}s both`
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = 'translateY(-4px)';
                e.currentTarget.style.boxShadow = theme.colors.shadowLarge;
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = 'translateY(0)';
                e.currentTarget.style.boxShadow = theme.colors.shadowMedium;
              }}
            >
              {/* Background gradient */}
              <div style={{
                position: 'absolute',
                top: 0,
                right: 0,
                width: '100px',
                height: '100px',
                background: `radial-gradient(circle at center, ${stat.bgColor} 0%, transparent 70%)`,
                borderRadius: '50%',
                transform: 'translate(30px, -30px)'
              }} />
              
              <div style={{ 
                display: 'flex', 
                justifyContent: 'space-between', 
                alignItems: 'flex-start',
                position: 'relative',
                zIndex: 1
              }}>
                <div style={{ flex: 1 }}>
                  <p style={{ 
                    color: theme.colors.textSecondary, 
                    fontSize: theme.typography.fontSize.sm,
                    fontWeight: theme.typography.fontWeight.medium,
                    marginBottom: theme.spacing.xs
                  }}>
                    {stat.title}
                  </p>
                  <p style={{ 
                    fontSize: theme.typography.fontSize['3xl'], 
                    fontWeight: theme.typography.fontWeight.bold,
                    color: theme.colors.textPrimary,
                    lineHeight: '1.2'
                  }}>
                    {stat.value}
                  </p>
                  {stat.trend && (
                    <div style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: theme.spacing.xs,
                      marginTop: theme.spacing.sm,
                      fontSize: theme.typography.fontSize.xs,
                      color: stat.trend > 0 ? theme.colors.success : theme.colors.danger
                    }}>
                      {stat.trend > 0 ? <ArrowUp size={12} /> : <ArrowDown size={12} />}
                      {Math.abs(stat.trend)}% from last week
                    </div>
                  )}
                </div>
                
                <div style={{
                  width: '3rem',
                  height: '3rem',
                  background: stat.bgColor,
                  borderRadius: theme.borderRadius.medium,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  border: `2px solid ${stat.color}20`
                }}>
                  <stat.icon size={24} style={{ color: stat.color }} />
                </div>
              </div>
            </div>
          ))}
        </div>
        
        {/* Recent deals */}
        <div style={{ 
          background: theme.colors.cardBackground,
          padding: theme.spacing.xl,
          borderRadius: theme.borderRadius.large,
          boxShadow: theme.colors.shadowMedium,
          border: `1px solid ${theme.colors.border}`,
          backdropFilter: 'blur(10px)',
          WebkitBackdropFilter: 'blur(10px)',
          animation: 'fadeIn 0.6s ease-out 0.4s both'
        }}>
          <div style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            marginBottom: theme.spacing.lg
          }}>
            <h3 style={{ 
              fontSize: theme.typography.fontSize.lg, 
              fontWeight: theme.typography.fontWeight.semibold,
              color: theme.colors.textPrimary,
              display: 'flex',
              alignItems: 'center',
              gap: theme.spacing.sm
            }}>
              <div style={{
                width: '1.5rem',
                height: '1.5rem',
                background: theme.colors.accent,
                borderRadius: theme.borderRadius.small,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}>
                <ShoppingBag size={12} style={{ color: 'white' }} />
              </div>
              Recent Deals
            </h3>
            
            <div style={{
              padding: `${theme.spacing.xs} ${theme.spacing.sm}`,
              background: theme.colors.glass,
              borderRadius: theme.borderRadius.medium,
              border: `1px solid ${theme.colors.border}`,
              fontSize: theme.typography.fontSize.xs,
              color: theme.colors.textSecondary
            }}>
              {deals.length} total deals
            </div>
          </div>
          
          {!deals || deals.length === 0 ? (
            <div style={{
              textAlign: 'center',
              padding: `${theme.spacing.xxxl} ${theme.spacing.xl}`,
              color: theme.colors.textSecondary
            }}>
              <div style={{
                width: '4rem',
                height: '4rem',
                background: theme.colors.glass,
                borderRadius: '50%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                margin: `0 auto ${theme.spacing.lg}`,
                border: `2px solid ${theme.colors.border}`
              }}>
                <ShoppingBag size={24} style={{ color: theme.colors.textSecondary }} />
              </div>
              <p style={{ 
                fontSize: theme.typography.fontSize.base,
                fontWeight: theme.typography.fontWeight.medium,
                marginBottom: theme.spacing.sm
              }}>
                No deals yet
              </p>
              <p style={{ 
                fontSize: theme.typography.fontSize.sm,
                color: theme.colors.textMuted
              }}>
                Create your first deal to start attracting customers!
              </p>
            </div>
          ) : (
            <div style={{ overflowX: 'auto' }}>
              <table 
                className="dashboard-table"
                style={{ 
                  width: '100%', 
                  borderCollapse: 'collapse',
                  fontSize: theme.typography.fontSize.sm
                }}
              >
                <thead>
                  <tr style={{ borderBottom: `2px solid ${theme.colors.border}` }}>
                    <th style={{ 
                      textAlign: 'left', 
                      padding: theme.spacing.md, 
                      fontSize: theme.typography.fontSize.xs,
                      fontWeight: theme.typography.fontWeight.semibold,
                      color: theme.colors.textSecondary,
                      textTransform: 'uppercase',
                      letterSpacing: '0.5px'
                    }}>
                      Title
                    </th>
                    <th style={{ 
                      textAlign: 'left', 
                      padding: theme.spacing.md, 
                      fontSize: theme.typography.fontSize.xs,
                      fontWeight: theme.typography.fontWeight.semibold,
                      color: theme.colors.textSecondary,
                      textTransform: 'uppercase',
                      letterSpacing: '0.5px'
                    }}>
                      Discount
                    </th>
                    <th style={{ 
                      textAlign: 'left', 
                      padding: theme.spacing.md, 
                      fontSize: theme.typography.fontSize.xs,
                      fontWeight: theme.typography.fontWeight.semibold,
                      color: theme.colors.textSecondary,
                      textTransform: 'uppercase',
                      letterSpacing: '0.5px'
                    }}>
                      Status
                    </th>
                    <th style={{ 
                      textAlign: 'left', 
                      padding: theme.spacing.md, 
                      fontSize: theme.typography.fontSize.xs,
                      fontWeight: theme.typography.fontWeight.semibold,
                      color: theme.colors.textSecondary,
                      textTransform: 'uppercase',
                      letterSpacing: '0.5px'
                    }}>
                      Redemptions
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {deals.slice(0, 5).map((deal, index) => (
                    <tr 
                      key={deal.id} 
                      style={{ 
                        borderBottom: `1px solid ${theme.colors.border}`,
                        transition: theme.animations.normal
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.background = theme.colors.glass;
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.background = 'transparent';
                      }}
                    >
                      <td style={{ 
                        padding: theme.spacing.md,
                        fontWeight: theme.typography.fontWeight.medium,
                        color: theme.colors.textPrimary
                      }}>
                        {deal.title}
                      </td>
                      <td style={{ padding: theme.spacing.md }}>
                        <span style={{ 
                          fontWeight: theme.typography.fontWeight.semibold,
                          color: getDealBadgeColor(deal.deal_type),
                          background: `${getDealBadgeColor(deal.deal_type)}10`,
                          padding: `${theme.spacing.xs} ${theme.spacing.sm}`,
                          borderRadius: theme.borderRadius.small,
                          fontSize: theme.typography.fontSize.xs
                        }}>
                          {getDiscountDisplay(deal)}
                        </span>
                      </td>
                      <td style={{ padding: theme.spacing.md }}>
                        <span style={{
                          padding: `${theme.spacing.xs} ${theme.spacing.sm}`,
                          borderRadius: theme.borderRadius.pill,
                          fontSize: theme.typography.fontSize.xs,
                          fontWeight: theme.typography.fontWeight.medium,
                          background: deal.is_active ? `${theme.colors.success}20` : `${theme.colors.danger}20`,
                          color: deal.is_active ? theme.colors.success : theme.colors.danger,
                          border: `1px solid ${deal.is_active ? theme.colors.success : theme.colors.danger}30`
                        }}>
                          {deal.is_active ? 'Active' : 'Inactive'}
                        </span>
                      </td>
                      <td style={{ 
                        padding: theme.spacing.md,
                        color: theme.colors.textSecondary,
                        fontWeight: theme.typography.fontWeight.medium
                      }}>
                        <span style={{ color: theme.colors.textPrimary }}>
                          {deal.current_redemptions || 0}
                        </span>
                        {' / '}
                        <span style={{ color: theme.colors.textMuted }}>
                          {deal.max_redemptions || '∞'}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </>
  );
};

export default DashboardOverview;