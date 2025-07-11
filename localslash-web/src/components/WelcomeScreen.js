import React, { useState, useEffect } from 'react';
import { MapPin, TrendingUp, Store, Users, ArrowRight, Menu, X, Sun, Moon, Sparkles, Zap, Shield, Globe, ChevronDown } from 'lucide-react';

const FuturisticWelcomeScreen = ({ setCurrentScreen, setUserType }) => {
  const [isDarkMode, setIsDarkMode] = useState(true);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [scrollY, setScrollY] = useState(0);
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  const [activeFeature, setActiveFeature] = useState(0);

  useEffect(() => {
    const handleScroll = () => setScrollY(window.scrollY);
    const handleMouseMove = (e) => setMousePosition({ x: e.clientX, y: e.clientY });
    
    window.addEventListener('scroll', handleScroll);
    window.addEventListener('mousemove', handleMouseMove);
    
    // Auto-rotate features
    const interval = setInterval(() => {
      setActiveFeature((prev) => (prev + 1) % 3);
    }, 3000);
    
    return () => {
      window.removeEventListener('scroll', handleScroll);
      window.removeEventListener('mousemove', handleMouseMove);
      clearInterval(interval);
    };
  }, []);

  const theme = {
    dark: {
      bg: '#0a0a0a',
      bgSecondary: '#1a1a1a',
      text: '#ffffff',
      textSecondary: '#a0a0a0',
      accent: '#6366f1',
      accentHover: '#818cf8',
      glass: 'rgba(255, 255, 255, 0.05)',
      border: 'rgba(255, 255, 255, 0.1)',
    },
    light: {
      bg: '#ffffff',
      bgSecondary: '#f8f9fa',
      text: '#000000',
      textSecondary: '#6b7280',
      accent: '#6366f1',
      accentHover: '#4f46e5',
      glass: 'rgba(0, 0, 0, 0.02)',
      border: 'rgba(0, 0, 0, 0.05)',
    }
  };

  const currentTheme = isDarkMode ? theme.dark : theme.light;

  const styles = {
    container: {
      minHeight: '100vh',
      backgroundColor: currentTheme.bg,
      color: currentTheme.text,
      position: 'relative',
      overflow: 'hidden',
      transition: 'all 0.5s cubic-bezier(0.4, 0, 0.2, 1)',
      width: '100%', // Changed from 100vw to avoid scrollbar issues
      boxSizing: 'border-box',
    },
    
    // Animated background gradient
    backgroundGradient: {
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      background: isDarkMode 
        ? `radial-gradient(circle at ${mousePosition.x}px ${mousePosition.y}px, rgba(99, 102, 241, 0.15) 0%, transparent 50%)`
        : `radial-gradient(circle at ${mousePosition.x}px ${mousePosition.y}px, rgba(99, 102, 241, 0.1) 0%, transparent 50%)`,
      pointerEvents: 'none',
      transition: 'background 0.3s ease',
    },
    
    // Futuristic navbar
    navbar: {
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      zIndex: 50,
      background: scrollY > 50 
        ? isDarkMode 
          ? 'rgba(10, 10, 10, 0.8)' 
          : 'rgba(255, 255, 255, 0.8)'
        : 'transparent',
      backdropFilter: scrollY > 50 ? 'blur(20px)' : 'none',
      borderBottom: scrollY > 50 ? `1px solid ${currentTheme.border}` : 'none',
      transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
      padding: '1rem 0', // Removed horizontal padding
      width: '100%',
      boxSizing: 'border-box',
    },
    
    navContent: {
      maxWidth: '1400px',
      margin: '0 auto',
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
      width: '100%',
      padding: '0 2rem', // Single padding location
      boxSizing: 'border-box',
    },
    
    logo: {
      fontSize: '1.75rem',
      fontWeight: '800',
      background: 'linear-gradient(135deg, #6366f1 0%, #a855f7 100%)',
      WebkitBackgroundClip: 'text',
      WebkitTextFillColor: 'transparent',
      letterSpacing: '-0.02em',
      cursor: 'pointer',
      display: 'flex',
      alignItems: 'center',
      gap: '0.5rem',
    },
    
    navLinks: {
      display: window.innerWidth > 768 ? 'flex' : 'none', // Responsive display
      gap: '2rem',
      alignItems: 'center',
    },
    
    navLink: {
      color: currentTheme.textSecondary,
      textDecoration: 'none',
      fontSize: '0.95rem',
      fontWeight: '500',
      transition: 'color 0.2s',
      cursor: 'pointer',
      position: 'relative',
    },
    
    // Hero section
    hero: {
      paddingTop: '8rem',
      paddingBottom: '4rem',
      position: 'relative',
      minHeight: '100vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      width: '100%',
      boxSizing: 'border-box',
    },
    
    heroContent: {
      maxWidth: '1400px',
      margin: '0 auto',
      padding: '0 2rem', // Consistent padding
      textAlign: 'center',
      position: 'relative',
      zIndex: 10,
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      width: '100%',
      boxSizing: 'border-box',
    },
    
    heroTitle: {
      fontSize: 'clamp(3rem, 8vw, 6rem)',
      fontWeight: '800',
      lineHeight: '1.1',
      marginBottom: '1.5rem',
      letterSpacing: '-0.03em',
      background: isDarkMode
        ? 'linear-gradient(135deg, #ffffff 0%, #a0a0a0 100%)'
        : 'linear-gradient(135deg, #000000 0%, #4b5563 100%)',
      WebkitBackgroundClip: 'text',
      WebkitTextFillColor: 'transparent',
      maxWidth: '100%',
    },
    
    heroSubtitle: {
      fontSize: 'clamp(1.25rem, 3vw, 1.75rem)',
      color: currentTheme.textSecondary,
      marginBottom: '3rem',
      fontWeight: '400',
      lineHeight: '1.5',
      maxWidth: '100%',
    },
    
    // Futuristic buttons
    buttonGroup: {
      display: 'flex',
      gap: '1.5rem',
      justifyContent: 'center',
      flexWrap: 'wrap',
      marginBottom: '4rem',
      width: '100%',
      padding: '0 1rem',
      boxSizing: 'border-box',
    },
    
    primaryButton: {
      padding: '1.25rem 3rem',
      fontSize: '1.1rem',
      fontWeight: '600',
      background: 'linear-gradient(135deg, #6366f1 0%, #a855f7 100%)',
      color: 'white',
      border: 'none',
      borderRadius: '2rem',
      cursor: 'pointer',
      display: 'flex',
      alignItems: 'center',
      gap: '0.75rem',
      transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
      boxShadow: '0 20px 40px -15px rgba(99, 102, 241, 0.5)',
      position: 'relative',
      overflow: 'hidden',
      whiteSpace: 'nowrap',
    },
    
    secondaryButton: {
      padding: '1.25rem 3rem',
      fontSize: '1.1rem',
      fontWeight: '600',
      background: currentTheme.glass,
      color: currentTheme.text,
      border: `2px solid ${currentTheme.border}`,
      borderRadius: '2rem',
      cursor: 'pointer',
      display: 'flex',
      alignItems: 'center',
      gap: '0.75rem',
      transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
      backdropFilter: 'blur(10px)',
      whiteSpace: 'nowrap',
    },
    
    // Feature cards with glassmorphism
    featuresSection: {
      width: '100%',
      padding: '4rem 2rem',
      boxSizing: 'border-box',
    },

    featuresSectionInner: {
      maxWidth: '1200px',
      margin: '0 auto',
      width: '100%',
    },
    
    featuresGrid: {
      display: 'grid',
      gridTemplateColumns: 'repeat(auto-fit, minmax(min(350px, 100%), 1fr))', // Better responsive grid
      gap: '2rem',
      marginBottom: '4rem',
      width: '100%',
    },
    
    featureCard: {
      background: currentTheme.glass,
      backdropFilter: 'blur(20px)',
      border: `1px solid ${currentTheme.border}`,
      borderRadius: '2rem',
      padding: '2.5rem',
      transition: 'all 0.4s cubic-bezier(0.4, 0, 0.2, 1)',
      position: 'relative',
      overflow: 'hidden',
      width: '100%',
      boxSizing: 'border-box',
    },
    
    featureIcon: {
      width: '4rem',
      height: '4rem',
      borderRadius: '1rem',
      background: 'linear-gradient(135deg, #6366f1 0%, #a855f7 100%)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      marginBottom: '1.5rem',
      boxShadow: '0 10px 30px -10px rgba(99, 102, 241, 0.5)',
    },
    
    // Stats section with animated numbers
    statsSection: {
      background: currentTheme.glass,
      backdropFilter: 'blur(20px)',
      padding: '3rem 2rem',
      borderRadius: '2rem',
      display: 'grid',
      gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', // Better responsive columns
      gap: '2rem',
      border: `1px solid ${currentTheme.border}`,
      width: 'calc(100% - 2rem)', // Account for padding
      maxWidth: '1000px', // Reduced max width for better alignment
      margin: '0 auto',
      boxSizing: 'border-box',
    },
    
    statItem: {
      textAlign: 'center',
    },
    
    statNumber: {
      fontSize: 'clamp(2rem, 4vw, 3rem)', // Responsive font size
      fontWeight: '800',
      background: 'linear-gradient(135deg, #6366f1 0%, #a855f7 100%)',
      WebkitBackgroundClip: 'text',
      WebkitTextFillColor: 'transparent',
      marginBottom: '0.5rem',
    },
    
    // Dark mode toggle
    darkModeToggle: {
      width: '3rem',
      height: '3rem',
      borderRadius: '1rem',
      background: currentTheme.glass,
      border: `1px solid ${currentTheme.border}`,
      color: currentTheme.text,
      cursor: 'pointer',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
      backdropFilter: 'blur(10px)',
    },

    // Mobile menu toggle
    mobileMenuToggle: {
      width: '3rem',
      height: '3rem',
      borderRadius: '1rem',
      background: currentTheme.glass,
      border: `1px solid ${currentTheme.border}`,
      color: currentTheme.text,
      cursor: 'pointer',
      display: window.innerWidth <= 768 ? 'flex' : 'none', // Show on mobile
      alignItems: 'center',
      justifyContent: 'center',
      transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
      backdropFilter: 'blur(10px)',
    },
    
    // Floating elements
    floatingElement: {
      position: 'absolute',
      borderRadius: '50%',
      background: 'linear-gradient(135deg, #6366f1 0%, #a855f7 100%)',
      opacity: 0.1,
      animation: 'float 20s infinite ease-in-out',
      pointerEvents: 'none', // Prevent interaction
    },

    // CTA Section
    ctaSection: {
      textAlign: 'center',
      padding: '4rem 2rem',
      background: currentTheme.glass,
      borderRadius: '2rem',
      backdropFilter: 'blur(20px)',
      border: `1px solid ${currentTheme.border}`,
      width: '100%',
      maxWidth: '800px',
      margin: '0 auto',
      boxSizing: 'border-box',
    },
  };

  const features = [
    {
      icon: <Zap size={28} />,
      title: 'Lightning Fast Deals',
      description: 'Real-time updates on the hottest deals in your area. Never miss a discount again.',
      gradient: 'linear-gradient(135deg, #f59e0b 0%, #ef4444 100%)',
    },
    {
      icon: <Shield size={28} />,
      title: 'Secure & Verified',
      description: 'All businesses are verified. Shop with confidence knowing every deal is legitimate.',
      gradient: 'linear-gradient(135deg, #10b981 0%, #3b82f6 100%)',
    },
    {
      icon: <Globe size={28} />,
      title: 'Hyperlocal Discovery',
      description: 'AI-powered recommendations based on your location and preferences.',
      gradient: 'linear-gradient(135deg, #8b5cf6 0%, #ec4899 100%)',
    },
  ];

  return (
    <>
      <style>{`
        * {
          margin: 0;
          padding: 0;
          box-sizing: border-box;
        }

        html, body {
          width: 100%;
          height: 100%;
          overflow-x: hidden;
          background-color: ${currentTheme.bg};
          margin: 0;
          padding: 0;
        }

        #root {
          width: 100%;
          min-height: 100vh;
        }
      `}</style>
      <style>
        {`
          @keyframes float {
            0%, 100% { transform: translate(0, 0) rotate(0deg); }
            25% { transform: translate(100px, -100px) rotate(90deg); }
            50% { transform: translate(-100px, -200px) rotate(180deg); }
            75% { transform: translate(-200px, -100px) rotate(270deg); }
          }
          
          @keyframes shimmer {
            0% { background-position: -200% center; }
            100% { background-position: 200% center; }
          }
          
          @keyframes pulse {
            0%, 100% { opacity: 0.4; }
            50% { opacity: 0.8; }
          }
          
          .nav-link:hover {
            color: ${currentTheme.accent} !important;
          }
          
          .nav-link::after {
            content: '';
            position: absolute;
            bottom: -4px;
            left: 0;
            width: 0;
            height: 2px;
            background: linear-gradient(90deg, #6366f1, #a855f7);
            transition: width 0.3s cubic-bezier(0.4, 0, 0.2, 1);
          }
          
          .nav-link:hover::after {
            width: 100%;
          }
          
          .primary-button:hover {
            transform: translateY(-2px) scale(1.02);
            box-shadow: 0 25px 50px -12px rgba(99, 102, 241, 0.6);
          }
          
          .secondary-button:hover {
            transform: translateY(-2px);
            background: ${currentTheme.border};
            border-color: ${currentTheme.accent};
          }
          
          .feature-card:hover {
            transform: translateY(-8px);
            box-shadow: 0 30px 60px -15px rgba(0, 0, 0, 0.3);
            border-color: ${currentTheme.accent};
          }
          
          .feature-card::before {
            content: '';
            position: absolute;
            top: 0;
            left: 0;
            right: 0;
            bottom: 0;
            background: linear-gradient(135deg, transparent 0%, ${currentTheme.accent}20 100%);
            opacity: 0;
            transition: opacity 0.3s;
            pointer-events: none;
          }
          
          .feature-card:hover::before {
            opacity: 1;
          }
          
          @media (max-width: 768px) {
            .nav-links { display: none !important; }
            .mobile-menu-toggle { display: flex !important; }
            .primary-button, .secondary-button {
              padding: 1rem 2rem;
              font-size: 1rem;
            }
          }

          @media (max-width: 480px) {
            .primary-button, .secondary-button {
              padding: 0.875rem 1.5rem;
              font-size: 0.95rem;
            }
          }
        `}
      </style>

      <div style={styles.container}>
        {/* Animated background */}
        <div style={styles.backgroundGradient} />
        
        {/* Floating elements - adjusted positions to prevent overflow */}
        <div style={{ ...styles.floatingElement, width: '300px', height: '300px', top: '10%', left: '10%' }} />
        <div style={{ ...styles.floatingElement, width: '200px', height: '200px', bottom: '20%', right: '10%' }} />
        <div style={{ ...styles.floatingElement, width: '150px', height: '150px', top: '50%', left: '50%', transform: 'translate(-50%, -50%)' }} />

        {/* Futuristic Navbar */}
        <nav style={styles.navbar}>
          <div style={styles.navContent}>
            <div style={styles.logo}>
              <Sparkles size={32} />
              LocalSlash
            </div>
            
            <div style={styles.navLinks} className="nav-links">
              <a href="#features" style={styles.navLink} className="nav-link">Features</a>
              <a href="#how-it-works" style={styles.navLink} className="nav-link">How it Works</a>
              <a href="#pricing" style={styles.navLink} className="nav-link">Pricing</a>
              <a href="#about" style={styles.navLink} className="nav-link">About</a>
            </div>
            
            <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
              <button
                onClick={() => setIsDarkMode(!isDarkMode)}
                style={styles.darkModeToggle}
                className="dark-mode-toggle"
              >
                {isDarkMode ? <Sun size={20} /> : <Moon size={20} />}
              </button>
              
              <button
                onClick={() => setIsMenuOpen(!isMenuOpen)}
                style={styles.mobileMenuToggle}
                className="mobile-menu-toggle"
              >
                {isMenuOpen ? <X size={20} /> : <Menu size={20} />}
              </button>
            </div>
          </div>
        </nav>

        {/* Hero Section */}
        <section style={styles.hero}>
          <div style={styles.heroContent}>
            <h1 style={styles.heroTitle}>
              The Future of
              <br />
              Local Commerce
            </h1>
            
            <p style={styles.heroSubtitle}>
              Connect with exclusive deals from verified local businesses.
              <br />
              Save money. Support local. Build community.
            </p>
            
            <div style={styles.buttonGroup}>
              <button
                onClick={() => {
                  setUserType('customer');
                  setCurrentScreen('customerApp');
                }}
                style={styles.primaryButton}
                className="primary-button"
              >
                <MapPin size={24} />
                Discover Deals
                <ArrowRight size={20} />
              </button>
              
              <button
                onClick={() => {
                  setUserType('store');
                  setCurrentScreen('storeApp');
                }}
                style={styles.secondaryButton}
                className="secondary-button"
              >
                <Store size={24} />
                For Business
              </button>
            </div>
            
            {/* Live Stats */}
            <div style={styles.statsSection}>
              <div style={styles.statItem}>
                <div style={styles.statNumber}>10K+</div>
                <div style={{ color: currentTheme.textSecondary, fontSize: '0.95rem' }}>Active Deals</div>
              </div>
              <div style={styles.statItem}>
                <div style={styles.statNumber}>500+</div>
                <div style={{ color: currentTheme.textSecondary, fontSize: '0.95rem' }}>Local Businesses</div>
              </div>
              <div style={styles.statItem}>
                <div style={styles.statNumber}>50K+</div>
                <div style={{ color: currentTheme.textSecondary, fontSize: '0.95rem' }}>Happy Customers</div>
              </div>
              <div style={styles.statItem}>
                <div style={styles.statNumber}>$1M+</div>
                <div style={{ color: currentTheme.textSecondary, fontSize: '0.95rem' }}>Total Saved</div>
              </div>
            </div>
          </div>
        </section>

        {/* Features Section */}
        <section style={styles.featuresSection} id="features">
          <div style={styles.featuresSectionInner}>
            <div style={styles.featuresGrid}>
              {features.map((feature, index) => (
                <div
                  key={index}
                  style={{
                    ...styles.featureCard,
                    opacity: activeFeature === index ? 1 : 0.7,
                    transform: activeFeature === index ? 'scale(1.02)' : 'scale(1)',
                  }}
                  className="feature-card"
                  onMouseEnter={() => setActiveFeature(index)}
                >
                  <div style={{ ...styles.featureIcon, background: feature.gradient }}>
                    {feature.icon}
                  </div>
                  <h3 style={{ fontSize: '1.5rem', fontWeight: '700', marginBottom: '1rem' }}>
                    {feature.title}
                  </h3>
                  <p style={{ color: currentTheme.textSecondary, lineHeight: '1.6' }}>
                    {feature.description}
                  </p>
                </div>
              ))}
            </div>
            
            {/* CTA Section */}
            <div style={styles.ctaSection}>
              <h2 style={{ fontSize: 'clamp(2rem, 4vw, 2.5rem)', fontWeight: '800', marginBottom: '1rem' }}>
                Ready to Start Saving?
              </h2>
              <p style={{ color: currentTheme.textSecondary, fontSize: 'clamp(1rem, 2vw, 1.25rem)', marginBottom: '2rem' }}>
                Join thousands of smart shoppers in your area
              </p>
              <button
                onClick={() => {
                  setUserType('customer');
                  setCurrentScreen('customerApp');
                }}
                style={{ ...styles.primaryButton, margin: '0 auto' }}
                className="primary-button"
              >
                Get Started Free
                <ArrowRight size={20} />
              </button>
            </div>
          </div>
        </section>
      </div>
    </>
  );
};

export default FuturisticWelcomeScreen;