import React from 'react';
import { User, Store } from 'lucide-react';
import { theme } from '../styles/theme';
import { glassEffect, containerStyle } from '../styles/componentStyles';

const WelcomeScreen = ({ setUserType, setCurrentScreen }) => {
  const styles = {
    container: {
      minHeight: '100vh',
      backgroundColor: theme.colors.background,
      position: 'relative',
      overflow: 'hidden',
    },
    
    gradientBg: {
      position: 'absolute',
      width: '200%',
      height: '200%',
      top: '-50%',
      left: '-50%',
      background: `
        radial-gradient(circle at 20% 80%, ${theme.colors.primary}40 0%, transparent 50%),
        radial-gradient(circle at 80% 20%, ${theme.colors.secondary}40 0%, transparent 50%),
        radial-gradient(circle at 40% 40%, ${theme.colors.primary}30 0%, transparent 50%)
      `,
      animation: 'gradientShift 20s ease infinite',
      opacity: 0.3,
    },
    
    content: {
      ...containerStyle,
      minHeight: '100vh',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      position: 'relative',
      zIndex: 1,
      padding: theme.spacing.xl,
    },
    
    logoContainer: {
      textAlign: 'center',
      marginBottom: theme.spacing.xxl,
      animation: 'fadeInUp 0.8s ease-out',
    },
    
    logo: {
      width: '120px',
      height: '120px',
      margin: `0 auto ${theme.spacing.xl}`,
      background: `linear-gradient(135deg, ${theme.colors.primary} 0%, ${theme.colors.secondary} 100%)`,
      borderRadius: '30px',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      fontSize: '3rem',
      color: 'white',
      boxShadow: `0 20px 40px ${theme.colors.primary}30`,
      transform: 'rotateZ(-10deg)',
      animation: 'float 6s ease-in-out infinite',
    },
    
    title: {
      fontSize: 'clamp(2.5rem, 5vw, 3.5rem)',
      fontWeight: '700',
      marginBottom: theme.spacing.sm,
      background: `linear-gradient(to right, ${theme.colors.textPrimary}, ${theme.colors.textSecondary})`,
      WebkitBackgroundClip: 'text',
      WebkitTextFillColor: 'transparent',
      letterSpacing: '-0.02em',
    },
    
    tagline: {
      fontSize: 'clamp(1rem, 2vw, 1.25rem)',
      color: theme.colors.textSecondary,
      fontWeight: '400',
    },
    
    choices: {
      display: 'grid',
      gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
      gap: theme.spacing.xl,
      width: '100%',
      maxWidth: '720px',
      animation: 'fadeInUp 0.8s ease-out 0.2s both',
    },
    
    choiceCard: {
      background: theme.colors.cardBackground,
      borderRadius: theme.borderRadius.xlarge,
      padding: `${theme.spacing.xl} ${theme.spacing.lg}`,
      textAlign: 'center',
      cursor: 'pointer',
      transition: 'all 0.3s ease',
      border: `1px solid ${theme.colors.border}`,
      boxShadow: theme.colors.shadow,
      position: 'relative',
      overflow: 'hidden',
    },
    
    iconWrapper: {
      width: '80px',
      height: '80px',
      margin: `0 auto ${theme.spacing.lg}`,
      background: `linear-gradient(135deg, ${theme.colors.primary} 0%, ${theme.colors.secondary} 100%)`,
      borderRadius: theme.borderRadius.xlarge,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      boxShadow: `0 10px 30px ${theme.colors.primary}30`,
    },
    
    choiceTitle: {
      fontSize: '1.5rem',
      fontWeight: '600',
      marginBottom: theme.spacing.sm,
      color: theme.colors.textPrimary,
    },
    
    choiceDescription: {
      fontSize: '1rem',
      color: theme.colors.textSecondary,
      lineHeight: '1.5',
    },
  };

  // Add responsive styles
  const responsiveStyles = `
    @keyframes gradientShift {
      0%, 100% { transform: translate(0, 0) rotate(0deg); }
      33% { transform: translate(-10%, 10%) rotate(120deg); }
      66% { transform: translate(10%, -10%) rotate(240deg); }
    }
    
    @keyframes float {
      0%, 100% { transform: translateY(0) rotateZ(-10deg); }
      50% { transform: translateY(-20px) rotateZ(-10deg); }
    }
    
    @keyframes fadeInUp {
      from {
        opacity: 0;
        transform: translateY(30px);
      }
      to {
        opacity: 1;
        transform: translateY(0);
      }
    }
    
    @media (max-width: ${theme.breakpoints.tablet}) {
      .choice-card {
        padding: ${theme.spacing.lg} !important;
      }
    }
    
    @media (max-width: ${theme.breakpoints.mobile}) {
      .content {
        padding: ${theme.spacing.lg} !important;
      }
    }
  `;

  return (
    <>
      <style>{responsiveStyles}</style>
      <div style={styles.container}>
        <div style={styles.gradientBg} />
        
        <div style={styles.content} className="content">
          <div style={styles.logoContainer}>
            <div style={styles.logo}>⚡</div>
            <h1 style={styles.title}>LocalSlash</h1>
            <p style={styles.tagline}>Discover deals that matter, nearby</p>
          </div>
          
          <div style={styles.choices}>
            <div
              className="choice-card"
              style={styles.choiceCard}
              onClick={() => {
                setUserType('customer');
                setCurrentScreen('customerApp');
              }}
              onMouseOver={(e) => {
                e.currentTarget.style.transform = 'translateY(-4px)';
                e.currentTarget.style.boxShadow = theme.colors.shadowHover;
              }}
              onMouseOut={(e) => {
                e.currentTarget.style.transform = 'translateY(0)';
                e.currentTarget.style.boxShadow = theme.colors.shadow;
              }}
            >
              <div style={styles.iconWrapper}>
                <User size={32} color="white" />
              </div>
              <h3 style={styles.choiceTitle}>I'm Shopping</h3>
              <p style={styles.choiceDescription}>
                Find exclusive deals from local businesses around you
              </p>
            </div>
            
            <div
              className="choice-card"
              style={styles.choiceCard}
              onClick={() => {
                setUserType('store');
                setCurrentScreen('storeApp');
              }}
              onMouseOver={(e) => {
                e.currentTarget.style.transform = 'translateY(-4px)';
                e.currentTarget.style.boxShadow = theme.colors.shadowHover;
              }}
              onMouseOut={(e) => {
                e.currentTarget.style.transform = 'translateY(0)';
                e.currentTarget.style.boxShadow = theme.colors.shadow;
              }}
            >
              <div style={styles.iconWrapper}>
                <Store size={32} color="white" />
              </div>
              <h3 style={styles.choiceTitle}>I'm a Business</h3>
              <p style={styles.choiceDescription}>
                Attract customers with targeted deals and promotions
              </p>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default WelcomeScreen;