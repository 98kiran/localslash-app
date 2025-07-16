import React from 'react';
import { BarChart3, TrendingUp, Users, Calendar, Activity, Target, Eye, Zap } from 'lucide-react';
import { useTheme } from '../contexts/ThemeContext';

const Analytics = ({ store, deals }) => {
  const theme = useTheme();
  
  // Calculate analytics data
  const totalDeals = deals.length;
  const activeDeals = deals.filter(d => d.is_active).length;
  const totalRedemptions = deals.reduce((sum, deal) => sum + (deal.current_redemptions || 0), 0);
  const averageRedemptionRate = totalDeals > 0 
    ? ((totalRedemptions / deals.reduce((sum, deal) => sum + (deal.max_redemptions || 100), 0)) * 100).toFixed(1)
    : 0;
  
  // Mock data for charts (in a real app, this would come from the database)
  const last7Days = Array.from({ length: 7 }, (_, i) => {
    const date = new Date();
    date.setDate(date.getDate() - i);
    return date.toLocaleDateString('en-US', { weekday: 'short' });
  }).reverse();
  
  const mockViews = [45, 52, 38, 65, 48, 72, 58];
  const mockRedemptions = [5, 8, 3, 12, 7, 15, 10];
  
  const statsCards = [
    {
      title: 'Total Deals Created',
      value: totalDeals,
      subtitle: `${activeDeals} active`,
      icon: BarChart3,
      color: theme.colors.info,
      bgColor: `${theme.colors.info}10`,
      trend: null
    },
    {
      title: 'Total Redemptions',
      value: totalRedemptions,
      subtitle: 'All time',
      icon: Users,
      color: theme.colors.success,
      bgColor: `${theme.colors.success}10`,
      trend: null
    },
    {
      title: 'Avg. Redemption Rate',
      value: `${averageRedemptionRate}%`,
      subtitle: 'Conversion rate',
      icon: Target,
      color: theme.colors.warning,
      bgColor: `${theme.colors.warning}10`,
      trend: null
    },
    {
      title: 'Total Views',
      value: mockViews.reduce((sum, v) => sum + v, 0),
      subtitle: 'Last 7 days',
      icon: Eye,
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
        
        @keyframes slideUp {
          0% { transform: translateY(10px); opacity: 0; }
          100% { transform: translateY(0); opacity: 1; }
        }
        
        @keyframes pulse {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.8; }
        }
        
        @media (max-width: ${theme.breakpoints.tablet}) {
          .analytics-grid {
            grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)) !important;
          }
          
          .analytics-chart {
            padding: ${theme.spacing.lg} !important;
          }
        }
        
        @media (max-width: ${theme.breakpoints.mobile}) {
          .analytics-grid {
            grid-template-columns: 1fr !important;
          }
          
          .analytics-title {
            font-size: ${theme.typography.fontSize.xl} !important;
          }
        }
      `}</style>
      
      <div style={{ 
        fontFamily: theme.typography.fontFamily.sans,
        animation: 'fadeIn 0.6s ease-out'
      }}>
        {/* Header */}
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: theme.spacing.xl
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: theme.spacing.md }}>
            <div style={{
              width: '3rem',
              height: '3rem',
              background: theme.gradients.primary,
              borderRadius: theme.borderRadius.medium,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              boxShadow: `0 10px 25px ${theme.colors.primary}30`,
              animation: 'pulse 2s infinite ease-in-out'
            }}>
              <Activity size={20} style={{ color: 'white' }} />
            </div>
            <div>
              <h2 
                className="analytics-title"
                style={{ 
                  fontSize: theme.typography.fontSize['2xl'], 
                  fontWeight: theme.typography.fontWeight.bold,
                  color: theme.colors.textPrimary,
                  marginBottom: theme.spacing.xs
                }}
              >
                Analytics Dashboard
              </h2>
              <p style={{ 
                color: theme.colors.textSecondary,
                fontSize: theme.typography.fontSize.sm 
              }}>
                Track your store's performance metrics
              </p>
            </div>
          </div>
          
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
        
        {/* Summary Cards */}
        <div 
          className="analytics-grid"
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
                animation: `slideUp 0.4s ease-out ${index * 0.1}s both`
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
                    lineHeight: '1.2',
                    marginBottom: theme.spacing.xs
                  }}>
                    {stat.value}
                  </p>
                  <p style={{
                    fontSize: theme.typography.fontSize.sm,
                    color: theme.colors.textMuted
                  }}>
                    {stat.subtitle}
                  </p>
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
        
        {/* Charts Section */}
        <div style={{ 
          display: 'grid', 
          gridTemplateColumns: 'repeat(auto-fit, minmax(400px, 1fr))', 
          gap: theme.spacing.lg 
        }}>
          {/* Views Chart */}
          <div 
            className="analytics-chart"
            style={{ 
              background: theme.colors.cardBackground,
              padding: theme.spacing.xl,
              borderRadius: theme.borderRadius.large,
              boxShadow: theme.colors.shadowMedium,
              border: `1px solid ${theme.colors.border}`,
              backdropFilter: 'blur(10px)',
              WebkitBackdropFilter: 'blur(10px)',
              animation: 'fadeIn 0.6s ease-out 0.4s both'
            }}
          >
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
                  background: theme.colors.info,
                  borderRadius: theme.borderRadius.small,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}>
                  <Eye size={12} style={{ color: 'white' }} />
                </div>
                Deal Views (Last 7 Days)
              </h3>
              
              <div style={{
                padding: `${theme.spacing.xs} ${theme.spacing.sm}`,
                background: theme.colors.glass,
                borderRadius: theme.borderRadius.medium,
                border: `1px solid ${theme.colors.border}`,
                fontSize: theme.typography.fontSize.xs,
                color: theme.colors.textSecondary
              }}>
                {mockViews.reduce((sum, v) => sum + v, 0)} total views
              </div>
            </div>
            
            <div style={{ 
              display: 'flex', 
              alignItems: 'end', 
              gap: theme.spacing.sm, 
              height: '200px',
              padding: `${theme.spacing.md} 0`
            }}>
              {mockViews.map((views, index) => (
                <div key={index} style={{ 
                  flex: 1, 
                  display: 'flex', 
                  flexDirection: 'column', 
                  alignItems: 'center',
                  gap: theme.spacing.xs
                }}>
                  <div style={{
                    width: '100%',
                    height: `${(views / Math.max(...mockViews)) * 150}px`,
                    background: theme.gradients.primary,
                    borderRadius: `${theme.borderRadius.small} ${theme.borderRadius.small} 0 0`,
                    display: 'flex',
                    alignItems: 'end',
                    justifyContent: 'center',
                    paddingBottom: theme.spacing.xs,
                    color: 'white',
                    fontSize: theme.typography.fontSize.xs,
                    fontWeight: theme.typography.fontWeight.medium,
                    transition: theme.animations.normal,
                    animation: `slideUp 0.6s ease-out ${index * 0.1}s both`
                  }}>
                    {views}
                  </div>
                  <div style={{
                    fontSize: theme.typography.fontSize.xs,
                    color: theme.colors.textSecondary,
                    fontWeight: theme.typography.fontWeight.medium
                  }}>
                    {last7Days[index]}
                  </div>
                </div>
              ))}
            </div>
          </div>
          
          {/* Redemptions Chart */}
          <div 
            className="analytics-chart"
            style={{ 
              background: theme.colors.cardBackground,
              padding: theme.spacing.xl,
              borderRadius: theme.borderRadius.large,
              boxShadow: theme.colors.shadowMedium,
              border: `1px solid ${theme.colors.border}`,
              backdropFilter: 'blur(10px)',
              WebkitBackdropFilter: 'blur(10px)',
              animation: 'fadeIn 0.6s ease-out 0.6s both'
            }}
          >
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
                  background: theme.colors.success,
                  borderRadius: theme.borderRadius.small,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}>
                  <Zap size={12} style={{ color: 'white' }} />
                </div>
                Redemptions (Last 7 Days)
              </h3>
              
              <div style={{
                padding: `${theme.spacing.xs} ${theme.spacing.sm}`,
                background: theme.colors.glass,
                borderRadius: theme.borderRadius.medium,
                border: `1px solid ${theme.colors.border}`,
                fontSize: theme.typography.fontSize.xs,
                color: theme.colors.textSecondary
              }}>
                {mockRedemptions.reduce((sum, v) => sum + v, 0)} total redemptions
              </div>
            </div>
            
            <div style={{ 
              display: 'flex', 
              alignItems: 'end', 
              gap: theme.spacing.sm, 
              height: '200px',
              padding: `${theme.spacing.md} 0`
            }}>
              {mockRedemptions.map((redemptions, index) => (
                <div key={index} style={{ 
                  flex: 1, 
                  display: 'flex', 
                  flexDirection: 'column', 
                  alignItems: 'center',
                  gap: theme.spacing.xs
                }}>
                  <div style={{
                    width: '100%',
                    height: `${(redemptions / Math.max(...mockRedemptions)) * 150}px`,
                    background: theme.gradients.success,
                    borderRadius: `${theme.borderRadius.small} ${theme.borderRadius.small} 0 0`,
                    display: 'flex',
                    alignItems: 'end',
                    justifyContent: 'center',
                    paddingBottom: theme.spacing.xs,
                    color: 'white',
                    fontSize: theme.typography.fontSize.xs,
                    fontWeight: theme.typography.fontWeight.medium,
                    transition: theme.animations.normal,
                    animation: `slideUp 0.6s ease-out ${index * 0.1 + 0.3}s both`
                  }}>
                    {redemptions}
                  </div>
                  <div style={{
                    fontSize: theme.typography.fontSize.xs,
                    color: theme.colors.textSecondary,
                    fontWeight: theme.typography.fontWeight.medium
                  }}>
                    {last7Days[index]}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
        
        {/* Performance Insights */}
        <div style={{ 
          background: theme.colors.cardBackground,
          padding: theme.spacing.xl,
          borderRadius: theme.borderRadius.large,
          boxShadow: theme.colors.shadowMedium,
          border: `1px solid ${theme.colors.border}`,
          marginTop: theme.spacing.xl,
          backdropFilter: 'blur(10px)',
          WebkitBackdropFilter: 'blur(10px)',
          animation: 'fadeIn 0.6s ease-out 0.8s both'
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
                <TrendingUp size={12} style={{ color: 'white' }} />
              </div>
              Performance Insights
            </h3>
          </div>
          
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
            gap: theme.spacing.lg
          }}>
            <div style={{
              padding: theme.spacing.lg,
              background: theme.colors.glass,
              borderRadius: theme.borderRadius.medium,
              border: `1px solid ${theme.colors.border}`
            }}>
              <div style={{
                display: 'flex',
                alignItems: 'center',
                gap: theme.spacing.sm,
                marginBottom: theme.spacing.sm
              }}>
                <div style={{
                  width: '1rem',
                  height: '1rem',
                  background: theme.colors.success,
                  borderRadius: '50%'
                }} />
                <span style={{
                  fontSize: theme.typography.fontSize.sm,
                  fontWeight: theme.typography.fontWeight.medium,
                  color: theme.colors.textPrimary
                }}>
                  Most Popular Deal Type
                </span>
              </div>
              <p style={{
                fontSize: theme.typography.fontSize.lg,
                fontWeight: theme.typography.fontWeight.semibold,
                color: theme.colors.textPrimary
              }}>
                Percentage Discounts
              </p>
              <p style={{
                fontSize: theme.typography.fontSize.sm,
                color: theme.colors.textSecondary
              }}>
                Higher engagement rates
              </p>
            </div>
            
            <div style={{
              padding: theme.spacing.lg,
              background: theme.colors.glass,
              borderRadius: theme.borderRadius.medium,
              border: `1px solid ${theme.colors.border}`
            }}>
              <div style={{
                display: 'flex',
                alignItems: 'center',
                gap: theme.spacing.sm,
                marginBottom: theme.spacing.sm
              }}>
                <div style={{
                  width: '1rem',
                  height: '1rem',
                  background: theme.colors.warning,
                  borderRadius: '50%'
                }} />
                <span style={{
                  fontSize: theme.typography.fontSize.sm,
                  fontWeight: theme.typography.fontWeight.medium,
                  color: theme.colors.textPrimary
                }}>
                  Peak Activity Time
                </span>
              </div>
              <p style={{
                fontSize: theme.typography.fontSize.lg,
                fontWeight: theme.typography.fontWeight.semibold,
                color: theme.colors.textPrimary
              }}>
                2:00 PM - 6:00 PM
              </p>
              <p style={{
                fontSize: theme.typography.fontSize.sm,
                color: theme.colors.textSecondary
              }}>
                Optimize deal timing
              </p>
            </div>
            
            <div style={{
              padding: theme.spacing.lg,
              background: theme.colors.glass,
              borderRadius: theme.borderRadius.medium,
              border: `1px solid ${theme.colors.border}`
            }}>
              <div style={{
                display: 'flex',
                alignItems: 'center',
                gap: theme.spacing.sm,
                marginBottom: theme.spacing.sm
              }}>
                <div style={{
                  width: '1rem',
                  height: '1rem',
                  background: theme.colors.info,
                  borderRadius: '50%'
                }} />
                <span style={{
                  fontSize: theme.typography.fontSize.sm,
                  fontWeight: theme.typography.fontWeight.medium,
                  color: theme.colors.textPrimary
                }}>
                  Recommendation
                </span>
              </div>
              <p style={{
                fontSize: theme.typography.fontSize.lg,
                fontWeight: theme.typography.fontWeight.semibold,
                color: theme.colors.textPrimary
              }}>
                Create Time-Limited Offers
              </p>
              <p style={{
                fontSize: theme.typography.fontSize.sm,
                color: theme.colors.textSecondary
              }}>
                Boost urgency and conversions
              </p>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default Analytics;