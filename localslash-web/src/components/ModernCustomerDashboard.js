import React, { useState, useEffect } from 'react';
import { supabase } from '../services/supabase';
import { MapPin, Search, Filter, Heart, User, Home, ArrowLeft, Sparkles, TrendingUp, Star, Clock, Tag, ChevronRight, Grid, List, Sun, Moon } from 'lucide-react';
import ModernNearbyDeals from './ModernNearbyDeals';
import Favorites from './Favorites';
import CustomerProfile from './CustomerProfile';
import SearchFilters from './SearchFilters';

const ModernCustomerDashboard = ({ user, userLocation, setCurrentScreen, onSignOut }) => {
  const [view, setView] = useState('home');
  const [searchQuery, setSearchQuery] = useState('');
  const [filters, setFilters] = useState({
    category: 'all',
    radius: 25,
    sortBy: 'distance'
  });
  const [deals, setDeals] = useState([]);
  const [favorites, setFavorites] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showFilters, setShowFilters] = useState(false);
  const [isDarkMode, setIsDarkMode] = useState(true);
  const [viewMode, setViewMode] = useState('grid'); // grid or list
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });

  // Theme configuration
  const theme = {
    dark: {
      bg: '#0a0a0a',
      bgSecondary: '#1a1a1a',
      text: '#ffffff',
      textSecondary: '#a0a0a0',
      accent: '#6366f1',
      accentSecondary: '#a855f7',
      glass: 'rgba(255, 255, 255, 0.05)',
      border: 'rgba(255, 255, 255, 0.1)',
      navBg: 'rgba(10, 10, 10, 0.8)',
      cardBg: 'rgba(255, 255, 255, 0.03)',
    },
    light: {
      bg: '#f0f2f5',
      bgSecondary: '#ffffff',
      text: '#1a1a1a',
      textSecondary: '#6b7280',
      accent: '#5b5fc7',
      accentSecondary: '#9333ea',
      glass: 'rgba(255, 255, 255, 0.7)',
      border: 'rgba(0, 0, 0, 0.08)',
      navBg: 'rgba(255, 255, 255, 0.85)',
      cardBg: 'rgba(255, 255, 255, 0.9)',
    }
  };

  const currentTheme = isDarkMode ? theme.dark : theme.light;

  useEffect(() => {
    const handleMouseMove = (e) => setMousePosition({ x: e.clientX, y: e.clientY });
    window.addEventListener('mousemove', handleMouseMove);
    
    loadNearbyDeals();
    if (user) {
      loadFavorites();
    }

    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, [userLocation, user, filters]);

  const loadNearbyDeals = async () => {
    try {
      setIsLoading(true);
      
      // First, load active deals
      const { data: dealsData, error: dealsError } = await supabase
        .from('deals')
        .select('*')
        .eq('is_active', true)
        .gte('end_date', new Date().toISOString());

      if (dealsError) {
        console.error('Error loading deals:', dealsError);
        throw dealsError;
      }

      if (!dealsData || dealsData.length === 0) {
        console.log('No active deals found');
        setDeals([]);
        return;
      }

      // Load stores separately
      const storeIds = [...new Set(dealsData.map(deal => deal.store_id))];
      const { data: storesData, error: storesError } = await supabase
        .from('stores')
        .select('*')
        .in('id', storeIds);

      if (storesError) {
        console.error('Error loading stores:', storesError);
        throw storesError;
      }

      // Create stores map
      const storesMap = {};
      storesData.forEach(store => {
        storesMap[store.id] = store;
      });

      // Combine deals with stores
      let processedDeals = dealsData.map(deal => ({
        ...deal,
        stores: storesMap[deal.store_id] || null
      }));

      console.log('Loaded deals from DB:', processedDeals.length);

      // Apply filters
      if (filters.category !== 'all') {
        processedDeals = processedDeals.filter(deal => 
          deal.stores?.category === filters.category
        );
      }

      // Search filter
      if (searchQuery) {
        processedDeals = processedDeals.filter(deal =>
          deal.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
          deal.description?.toLowerCase().includes(searchQuery.toLowerCase()) ||
          deal.stores?.name.toLowerCase().includes(searchQuery.toLowerCase())
        );
      }

      // Calculate distances if location available
      if (userLocation) {
        processedDeals = processedDeals.map(deal => ({
          ...deal,
          distance: calculateDistance(
            userLocation.latitude,
            userLocation.longitude,
            deal.stores?.latitude,
            deal.stores?.longitude
          )
        })).filter(deal => deal.distance <= filters.radius);
      }

      // Sort deals
      processedDeals.sort((a, b) => {
        if (filters.sortBy === 'distance' && userLocation) {
          return a.distance - b.distance;
        } else if (filters.sortBy === 'discount') {
          const aDiscount = a.discount_percentage || ((a.original_price - a.discount_price) / a.original_price * 100);
          const bDiscount = b.discount_percentage || ((b.original_price - b.discount_price) / b.original_price * 100);
          return bDiscount - aDiscount;
        } else if (filters.sortBy === 'newest') {
          return new Date(b.created_at) - new Date(a.created_at);
        }
        return 0;
      });

      setDeals(processedDeals);
    } catch (error) {
      console.error('Error loading deals:', error);
      setDeals([]);
    } finally {
      setIsLoading(false);
    }
  };

  const loadFavorites = async () => {
    try {
      const { data } = await supabase
        .from('favorites')
        .select('deal_id, store_id')
        .eq('customer_id', user.id);

      if (data) {
        setFavorites(data);
      }
    } catch (error) {
      console.error('Error loading favorites:', error);
    }
  };

  const calculateDistance = (lat1, lon1, lat2, lon2) => {
    const R = 3959; // Radius of Earth in miles
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLon = (lon2 - lon1) * Math.PI / 180;
    const a = 
      Math.sin(dLat/2) * Math.sin(dLat/2) +
      Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
      Math.sin(dLon/2) * Math.sin(dLon/2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
    return R * c;
  };

  const handleSearch = (e) => {
    e.preventDefault();
    loadNearbyDeals();
  };

  const styles = {
    container: {
      minHeight: '100vh',
      width: '100vw',
      backgroundColor: currentTheme.bg,
      color: currentTheme.text,
      position: 'relative',
      overflow: 'hidden',
      transition: 'all 0.5s cubic-bezier(0.4, 0, 0.2, 1)',
      margin: 0,
      padding: 0,
    },

    // Animated background
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
      zIndex: 1,
    },

    // Top Navigation Bar
    topNav: {
      position: 'sticky',
      top: 0,
      zIndex: 50,
      background: currentTheme.navBg,
      backdropFilter: 'blur(20px)',
      borderBottom: `1px solid ${currentTheme.border}`,
      padding: '1rem 1.5rem',
      transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
      width: '100%',
      boxSizing: 'border-box',
    },

    navContent: {
      width: '100%',
      margin: '0 auto',
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
      boxSizing: 'border-box',
    },

    navTitle: {
      fontSize: '1.5rem',
      fontWeight: '800',
      background: `linear-gradient(135deg, ${currentTheme.accent} 0%, ${currentTheme.accentSecondary} 100%)`,
      WebkitBackgroundClip: 'text',
      WebkitTextFillColor: 'transparent',
      display: 'flex',
      alignItems: 'center',
      gap: '0.5rem',
    },

    navActions: {
      display: 'flex',
      gap: '1rem',
      alignItems: 'center',
    },

    iconButton: {
      width: '2.5rem',
      height: '2.5rem',
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
      WebkitBackdropFilter: 'blur(10px)',
      boxShadow: isDarkMode ? 'none' : '0 2px 4px rgba(0, 0, 0, 0.05)',
    },

    // Search Section
    searchSection: {
      padding: '2rem 1.5rem',
      background: currentTheme.glass,
      backdropFilter: 'blur(20px)',
      borderBottom: `1px solid ${currentTheme.border}`,
      position: 'relative',
      zIndex: 40,
      width: '100%',
      boxSizing: 'border-box',
    },

    searchContainer: {
      maxWidth: '800px',
      margin: '0 auto',
      width: '100%',
      padding: '0 1rem',
      boxSizing: 'border-box',
    },

    searchForm: {
      position: 'relative',
      marginBottom: '1rem',
    },

    searchInput: {
      width: '100%',
      padding: '1rem 3.5rem 1rem 3rem',
      background: currentTheme.cardBg,
      border: `2px solid ${currentTheme.border}`,
      borderRadius: '2rem',
      color: currentTheme.text,
      fontSize: '1rem',
      outline: 'none',
      transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
      boxShadow: isDarkMode ? 'none' : '0 2px 8px rgba(0, 0, 0, 0.04)',
    },

    searchIcon: {
      position: 'absolute',
      left: '1rem',
      top: '50%',
      transform: 'translateY(-50%)',
      color: currentTheme.textSecondary,
    },

    filterButton: {
      position: 'absolute',
      right: '0.5rem',
      top: '50%',
      transform: 'translateY(-50%)',
      padding: '0.75rem 1.5rem',
      background: `linear-gradient(135deg, ${currentTheme.accent} 0%, ${currentTheme.accentSecondary} 100%)`,
      border: 'none',
      borderRadius: '1.5rem',
      color: 'white',
      cursor: 'pointer',
      display: 'flex',
      alignItems: 'center',
      gap: '0.5rem',
      transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
      fontWeight: '600',
      boxShadow: '0 4px 12px rgba(99, 102, 241, 0.25)',
    },

    // Quick Stats
    quickStats: {
      display: 'flex',
      gap: '1rem',
      justifyContent: 'center',
      flexWrap: 'wrap',
    },

    statChip: {
      padding: '0.5rem 1rem',
      background: currentTheme.glass,
      borderRadius: '1rem',
      border: `1px solid ${currentTheme.border}`,
      display: 'flex',
      alignItems: 'center',
      gap: '0.5rem',
      fontSize: '0.875rem',
    },

    // Content Area
    content: {
      position: 'relative',
      zIndex: 10,
      padding: '2rem 0 6rem',
      width: '100%',
      margin: '0',
      boxSizing: 'border-box',
    },

    // View Toggle
    viewToggle: {
      display: 'flex',
      gap: '0.5rem',
      marginBottom: '2rem',
      justifyContent: 'flex-end',
      paddingRight: '1.5rem',
    },

    viewButton: {
      padding: '0.5rem 1rem',
      background: currentTheme.glass,
      border: `1px solid ${currentTheme.border}`,
      borderRadius: '0.75rem',
      color: currentTheme.textSecondary,
      cursor: 'pointer',
      display: 'flex',
      alignItems: 'center',
      gap: '0.5rem',
      transition: 'all 0.3s',
    },

    viewButtonActive: {
      background: `linear-gradient(135deg, ${currentTheme.accent} 0%, ${currentTheme.accentSecondary} 100%)`,
      color: 'white',
      border: 'none',
    },

    // Bottom Navigation
    bottomNav: {
      position: 'fixed',
      bottom: 0,
      left: 0,
      right: 0,
      background: currentTheme.navBg,
      backdropFilter: 'blur(20px)',
      borderTop: `1px solid ${currentTheme.border}`,
      padding: '0.5rem 0',
      zIndex: 50,
    },

    navItems: {
      display: 'flex',
      justifyContent: 'space-around',
      maxWidth: '500px',
      margin: '0 auto',
    },

    navItem: {
      padding: '0.75rem 1.5rem',
      background: 'none',
      border: 'none',
      color: currentTheme.textSecondary,
      cursor: 'pointer',
      transition: 'all 0.3s ease',
      position: 'relative',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      gap: '0.25rem',
    },

    navItemActive: {
      color: currentTheme.accent,
    },

    navIndicator: {
      position: 'absolute',
      top: '-0.5rem',
      left: '50%',
      transform: 'translateX(-50%)',
      width: '2rem',
      height: '0.25rem',
      background: `linear-gradient(90deg, ${currentTheme.accent}, ${currentTheme.accentSecondary})`,
      borderRadius: '0.125rem',
    },

    // Floating Action Button
    floatingButton: {
      position: 'fixed',
      bottom: '5rem',
      right: '1.5rem',
      width: '3.5rem',
      height: '3.5rem',
      borderRadius: '50%',
      background: `linear-gradient(135deg, ${currentTheme.accent} 0%, ${currentTheme.accentSecondary} 100%)`,
      color: 'white',
      border: 'none',
      cursor: 'pointer',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      boxShadow: '0 20px 40px -15px rgba(99, 102, 241, 0.5)',
      transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
      zIndex: 40,
    },
  };

  const renderContent = () => {
    switch (view) {
      case 'home':
        return (
          <>
            {/* View Mode Toggle */}
            <div style={styles.viewToggle}>
              <button
                style={{
                  ...styles.viewButton,
                  ...(viewMode === 'grid' ? styles.viewButtonActive : {})
                }}
                onClick={() => setViewMode('grid')}
              >
                <Grid size={16} />
                Grid
              </button>
              <button
                style={{
                  ...styles.viewButton,
                  ...(viewMode === 'list' ? styles.viewButtonActive : {})
                }}
                onClick={() => setViewMode('list')}
              >
                <List size={16} />
                List
              </button>
            </div>
            
            <ModernNearbyDeals 
              deals={deals} 
              favorites={favorites}
              user={user}
              onFavoritesUpdate={loadFavorites}
              isLoading={isLoading}
              viewMode={viewMode}
              theme={currentTheme}
            />
          </>
        );
      case 'favorites':
        return (
          <Favorites 
            user={user}
            favorites={favorites}
            onFavoritesUpdate={loadFavorites}
            theme={currentTheme}
          />
        );
      case 'profile':
        return <CustomerProfile user={user} theme={currentTheme} />;
      default:
        return null;
    }
  };

  return (
    <>
      <style>{`
        * {
          margin: 0;
          padding: 0;
          box-sizing: border-box;
        }
        
        html, body {
          margin: 0;
          padding: 0;
          overflow-x: hidden;
          width: 100%;
          height: 100%;
        }
        
        body {
          background-color: ${currentTheme.bg};
        }
        
        #root, .App {
          width: 100%;
          min-width: 100%;
          overflow-x: hidden;
          margin: 0;
          padding: 0;
          box-sizing: border-box;
        }
        
        /* Ensure no max-width constraints anywhere */
        body > *, #root > *, .App > * {
          max-width: none !important;
        }
      `}</style>
      <div style={styles.container}>
      {/* Animated Background */}
      <div style={styles.backgroundGradient} />
      
      {/* Floating Orbs */}
      <div style={{
        position: 'absolute',
        width: '200px',
        height: '200px',
        borderRadius: '50%',
        background: `linear-gradient(135deg, ${currentTheme.accent} 0%, ${currentTheme.accentSecondary} 100%)`,
        opacity: 0.1,
        top: '20%',
        right: '10%',
        animation: 'float 20s infinite ease-in-out',
        zIndex: 2,
      }} />
      
      {/* Top Navigation */}
      <nav style={styles.topNav}>
        <div style={styles.navContent}>
          <div style={styles.navTitle}>
            <Sparkles size={24} />
            LocalSlash
          </div>
          
          <div style={styles.navActions}>
            <button
              style={styles.iconButton}
              onClick={() => setIsDarkMode(!isDarkMode)}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = 'scale(1.05)';
                e.currentTarget.style.background = 'rgba(99, 102, 241, 0.1)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = 'scale(1)';
                e.currentTarget.style.background = currentTheme.glass;
              }}
            >
              {isDarkMode ? <Sun size={20} /> : <Moon size={20} />}
            </button>
            
            {user ? (
              <button
                style={{
                  ...styles.iconButton,
                  width: 'auto',
                  padding: '0.5rem 1rem',
                  borderRadius: '1.5rem',
                }}
                onClick={onSignOut}
              >
                Sign Out
              </button>
            ) : (
              <button
                style={{
                  ...styles.iconButton,
                  width: 'auto',
                  padding: '0.5rem 1rem',
                  borderRadius: '1.5rem',
                  background: `linear-gradient(135deg, ${currentTheme.accent} 0%, ${currentTheme.accentSecondary} 100%)`,
                  color: 'white',
                  border: 'none',
                }}
                onClick={() => setCurrentScreen('welcome')}
              >
                Sign In
              </button>
            )}
          </div>
        </div>
      </nav>
      
      {/* Search Section */}
      {view === 'home' && (
        <div style={styles.searchSection}>
          <div style={styles.searchContainer}>
            <form onSubmit={handleSearch} style={styles.searchForm}>
              <Search size={20} style={styles.searchIcon} />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search deals, stores, categories..."
                style={styles.searchInput}
                onFocus={(e) => {
                  e.target.style.borderColor = currentTheme.accent;
                  e.target.style.boxShadow = `0 0 0 4px ${currentTheme.accent}20`;
                }}
                onBlur={(e) => {
                  e.target.style.borderColor = currentTheme.border;
                  e.target.style.boxShadow = 'none';
                }}
              />
              <button
                type="button"
                onClick={() => setShowFilters(!showFilters)}
                style={styles.filterButton}
                onMouseEnter={(e) => {
                  e.currentTarget.style.transform = 'translateY(-50%) scale(1.05)';
                  e.currentTarget.style.boxShadow = '0 10px 30px -10px rgba(99, 102, 241, 0.5)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = 'translateY(-50%) scale(1)';
                  e.currentTarget.style.boxShadow = 'none';
                }}
              >
                <Filter size={16} />
                Filters
              </button>
            </form>
            
            {/* Quick Stats */}
            <div style={styles.quickStats}>
              {userLocation && (
                <div style={styles.statChip}>
                  <MapPin size={16} />
                  Near me
                </div>
              )}
              <div style={styles.statChip}>
                <Tag size={16} />
                {deals.length} deals
              </div>
              <div style={styles.statChip}>
                <TrendingUp size={16} />
                {filters.sortBy}
              </div>
              <div style={styles.statChip}>
                <Clock size={16} />
                {filters.radius} mi
              </div>
            </div>
          </div>
        </div>
      )}
      
      {/* Filters Modal */}
      {showFilters && (
        <SearchFilters 
          filters={filters}
          onFiltersChange={setFilters}
          onClose={() => setShowFilters(false)}
          theme={currentTheme}
        />
      )}
      
      {/* Main Content */}
      <div style={styles.content}>
        {renderContent()}
      </div>
      
      {/* Floating Action Button */}
      {view === 'home' && (
        <button
          style={styles.floatingButton}
          onClick={() => loadNearbyDeals()}
          onMouseEnter={(e) => {
            e.currentTarget.style.transform = 'scale(1.1) rotate(180deg)';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.transform = 'scale(1) rotate(0deg)';
          }}
        >
          <TrendingUp size={24} />
        </button>
      )}
      
      {/* Bottom Navigation */}
      <nav style={styles.bottomNav}>
        <div style={styles.navItems}>
          <button
            onClick={() => setView('home')}
            style={{
              ...styles.navItem,
              ...(view === 'home' ? styles.navItemActive : {})
            }}
          >
            {view === 'home' && <div style={styles.navIndicator} />}
            <Home size={24} />
            <span style={{ fontSize: '0.75rem', fontWeight: '500' }}>Home</span>
          </button>
          
          <button
            onClick={() => setView('favorites')}
            style={{
              ...styles.navItem,
              ...(view === 'favorites' ? styles.navItemActive : {})
            }}
          >
            {view === 'favorites' && <div style={styles.navIndicator} />}
            <Heart size={24} />
            <span style={{ fontSize: '0.75rem', fontWeight: '500' }}>Favorites</span>
          </button>
          
          {user && (
            <button
              onClick={() => setView('profile')}
              style={{
                ...styles.navItem,
                ...(view === 'profile' ? styles.navItemActive : {})
              }}
            >
              {view === 'profile' && <div style={styles.navIndicator} />}
              <User size={24} />
              <span style={{ fontSize: '0.75rem', fontWeight: '500' }}>Profile</span>
            </button>
          )}
        </div>
      </nav>
      
      <style>{`
        @keyframes float {
          0%, 100% { transform: translate(0, 0) rotate(0deg); }
          25% { transform: translate(50px, -50px) rotate(90deg); }
          50% { transform: translate(-50px, -100px) rotate(180deg); }
          75% { transform: translate(-100px, -50px) rotate(270deg); }
        }
      `}</style>
    </div>
    </>
  );
};

export default ModernCustomerDashboard;