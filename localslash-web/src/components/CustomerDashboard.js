import React, { useState, useEffect } from 'react';
import { supabase } from '../services/supabase';
import { MapPin, Search, Filter, Heart, User, Home, ArrowLeft } from 'lucide-react';
import { theme } from '../styles/theme';
import { glassEffect, containerStyle } from '../styles/componentStyles';
import NearbyDeals from './NearbyDeals';
import Favorites from './Favorites';
import CustomerProfile from './CustomerProfile';
import SearchFilters from './SearchFilters';

const CustomerDashboard = ({ user, userLocation, setCurrentScreen, onSignOut }) => {
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

  useEffect(() => {
    // Always load deals, even without location
    loadNearbyDeals();
    
    if (user) {
      loadFavorites();
    }
  }, [userLocation, user, filters, searchQuery]); // Added searchQuery to dependencies

  const loadNearbyDeals = async () => {
    try {
      setIsLoading(true);
      
      console.log('Loading deals with user location:', userLocation);
      console.log('Search query:', searchQuery);
      
      // Load all active deals with store information
      const { data, error } = await supabase
        .from('deals')
        .select(`
          *,
          stores (
            id,
            name,
            address,
            latitude,
            longitude,
            logo_url,
            phone
          )
        `)
        .eq('is_active', true)
        .gte('end_date', new Date().toISOString());

      if (error) {
        console.error('Supabase error:', error);
        throw error;
      }

      console.log('Deals loaded from database:', data);

      if (!data || data.length === 0) {
        console.log('No deals found in database');
        setDeals([]);
        return;
      }

      // Filter by search query if present
      let filteredDeals = data;
      if (searchQuery.trim()) {
        filteredDeals = data.filter(deal => 
          deal.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
          deal.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
          deal.stores.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
          (deal.category && deal.category.toLowerCase().includes(searchQuery.toLowerCase()))
        );
      }

      // Filter by category if not 'all'
      if (filters.category !== 'all') {
        filteredDeals = filteredDeals.filter(deal => deal.category === filters.category);
      }

      // If no user location, show all filtered deals without distance
      if (!userLocation || !userLocation.latitude || !userLocation.longitude) {
        console.log('No user location, showing all deals');
        setDeals(filteredDeals);
        return;
      }

      // Calculate distances and filter by radius
      const dealsWithDistance = filteredDeals.map(deal => {
        if (!deal.stores || !deal.stores.latitude || !deal.stores.longitude) {
          console.log('Deal missing store location:', deal);
          return { ...deal, distance: 999 }; // Large distance for deals without location
        }
        
        const distance = calculateDistance(
          userLocation.latitude,
          userLocation.longitude,
          deal.stores.latitude,
          deal.stores.longitude
        );
        
        console.log(`Distance for ${deal.title}: ${distance} miles`);
        return { ...deal, distance };
      }).filter(deal => deal.distance <= filters.radius);

      console.log('Deals after distance filter:', dealsWithDistance);

      // Sort deals
      const sortedDeals = dealsWithDistance.sort((a, b) => {
        if (filters.sortBy === 'distance') {
          return a.distance - b.distance;
        } else if (filters.sortBy === 'discount') {
          const aDiscount = a.discount_percentage || ((a.original_price - a.discount_price) / a.original_price * 100);
          const bDiscount = b.discount_percentage || ((b.original_price - b.discount_price) / b.original_price * 100);
          return bDiscount - aDiscount;
        }
        return 0;
      });

      setDeals(sortedDeals);
    } catch (error) {
      console.error('Error loading deals:', error);
      setDeals([]); // Set empty array on error
    } finally {
      setIsLoading(false);
    }
  };

  const loadFavorites = async () => {
    try {
      const { data, error } = await supabase
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
    loadNearbyDeals(); // Reload deals with search
  };

  const styles = {
    container: {
      minHeight: '100vh',
      backgroundColor: theme.colors.background,
      paddingBottom: '100px',
    },
    
    topNav: {
      position: 'sticky',
      top: 0,
      zIndex: 100,
      ...glassEffect,
      padding: theme.spacing.md,
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
    },
    
    navLeft: {
      display: 'flex',
      alignItems: 'center',
      gap: theme.spacing.sm,
    },
    
    backButton: {
      padding: theme.spacing.sm,
      background: 'none',
      border: 'none',
      color: theme.colors.primary,
      fontSize: '1.25rem',
      cursor: 'pointer',
      display: 'flex',
      alignItems: 'center',
      transition: 'opacity 0.3s ease',
    },
    
    navTitle: {
      fontSize: '1.125rem',
      fontWeight: '600',
      color: theme.colors.textPrimary,
    },
    
    navButton: {
      padding: `${theme.spacing.sm} ${theme.spacing.md}`,
      background: `${theme.colors.primary}10`,
      border: 'none',
      borderRadius: theme.borderRadius.pill,
      color: theme.colors.primary,
      fontSize: '0.875rem',
      cursor: 'pointer',
      transition: 'all 0.3s ease',
      fontWeight: '500',
    },
    
    header: {
      padding: `0 ${theme.spacing.lg} ${theme.spacing.lg}`,
      ...glassEffect,
      borderTop: 'none',
    },
    
    headerContent: {
      display: 'flex',
      alignItems: 'center',
      gap: theme.spacing.md,
      marginBottom: theme.spacing.md,
      flexWrap: 'wrap',
    },
    
    logo: {
      fontSize: '1.5rem',
      fontWeight: '700',
      background: `linear-gradient(135deg, ${theme.colors.primary} 0%, ${theme.colors.secondary} 100%)`,
      WebkitBackgroundClip: 'text',
      WebkitTextFillColor: 'transparent',
    },
    
    locationBadge: {
      display: 'flex',
      alignItems: 'center',
      gap: theme.spacing.sm,
      padding: `${theme.spacing.sm} ${theme.spacing.md}`,
      background: `${theme.colors.textPrimary}08`,
      borderRadius: theme.borderRadius.pill,
      fontSize: '0.875rem',
      color: theme.colors.textPrimary,
    },
    
    searchContainer: {
      position: 'relative',
      width: '100%',
    },
    
    searchBar: {
      width: '100%',
      padding: `${theme.spacing.md} ${theme.spacing.xxl}`,
      background: theme.colors.cardBackground,
      border: `1px solid ${theme.colors.border}`,
      borderRadius: theme.borderRadius.large,
      color: theme.colors.textPrimary,
      fontSize: '1rem',
      transition: 'all 0.3s ease',
      boxShadow: theme.colors.shadow,
      outline: 'none',
    },
    
    searchIcon: {
      position: 'absolute',
      left: theme.spacing.md,
      top: '50%',
      transform: 'translateY(-50%)',
      color: theme.colors.textSecondary,
    },
    
    filterButton: {
      position: 'absolute',
      right: theme.spacing.sm,
      top: '50%',
      transform: 'translateY(-50%)',
      padding: `${theme.spacing.sm} ${theme.spacing.md}`,
      background: theme.colors.primary,
      border: 'none',
      borderRadius: theme.borderRadius.medium,
      color: 'white',
      cursor: 'pointer',
      transition: 'all 0.3s ease',
      fontWeight: '500',
      display: 'flex',
      alignItems: 'center',
      gap: theme.spacing.xs,
    },
    
    content: {
      ...containerStyle,
      paddingTop: theme.spacing.lg,
    },
    
    bottomNav: {
      position: 'fixed',
      bottom: 0,
      left: 0,
      right: 0,
      ...glassEffect,
      borderTop: `1px solid ${theme.colors.border}`,
      padding: `${theme.spacing.sm} 0`,
      zIndex: 100,
    },
    
    navItems: {
      display: 'flex',
      justifyContent: 'space-around',
      maxWidth: '480px',
      margin: '0 auto',
    },
    
    navItem: {
      padding: `${theme.spacing.sm} ${theme.spacing.lg}`,
      background: 'none',
      border: 'none',
      color: theme.colors.textSecondary,
      cursor: 'pointer',
      transition: 'all 0.3s ease',
      position: 'relative',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      gap: theme.spacing.xs,
    },
    
    navItemActive: {
      color: theme.colors.primary,
    },
    
    navIndicator: {
      position: 'absolute',
      top: '-8px',
      left: '50%',
      transform: 'translateX(-50%)',
      width: '24px',
      height: '3px',
      background: theme.colors.primary,
      borderRadius: theme.borderRadius.small,
    },
  };

  const renderContent = () => {
    switch (view) {
      case 'home':
        return (
          <NearbyDeals 
            deals={deals} 
            favorites={favorites}
            user={user}
            onFavoritesUpdate={loadFavorites}
            isLoading={isLoading}
          />
        );
      case 'favorites':
        return (
          <Favorites 
            user={user}
            favorites={favorites}
            onFavoritesUpdate={loadFavorites}
          />
        );
      case 'profile':
        return <CustomerProfile user={user} />;
      default:
        return (
          <NearbyDeals 
            deals={deals} 
            favorites={favorites}
            user={user}
            onFavoritesUpdate={loadFavorites}
            isLoading={isLoading}
          />
        );
    }
  };

  return (
    <div style={styles.container}>
      {/* Top Navigation */}
      <nav style={styles.topNav}>
        <div style={styles.navLeft}>
          <button
            onClick={() => setCurrentScreen('welcome')}
            style={styles.backButton}
            onMouseOver={(e) => e.currentTarget.style.opacity = '0.7'}
            onMouseOut={(e) => e.currentTarget.style.opacity = '1'}
          >
            <ArrowLeft size={20} />
          </button>
          <span style={styles.navTitle}>
            {view === 'home' ? 'Discover' : view === 'favorites' ? 'Favorites' : 'Profile'}
          </span>
        </div>
        <div>
                {user ? (
        <button
          onClick={onSignOut}
          style={styles.navButton}
          onMouseOver={(e) => e.currentTarget.style.background = `${theme.colors.primary}20`}
          onMouseOut={(e) => e.currentTarget.style.background = `${theme.colors.primary}10`}
        >
          Sign Out
        </button>
      ) : (
        <button
          onClick={() => setCurrentScreen('welcome')} // Changed from 'customerApp' to 'welcome'
          style={styles.navButton}
          onMouseOver={(e) => e.currentTarget.style.background = `${theme.colors.primary}20`}
          onMouseOut={(e) => e.currentTarget.style.background = `${theme.colors.primary}10`}
        >
          Sign In
        </button>
      )}
        </div>
      </nav>
      
      {/* Header with Search */}
      {view === 'home' && (
        <header style={styles.header}>
          <div style={styles.headerContent}>
            <span style={styles.logo}>LocalSlash</span>
            {userLocation && (
              <div style={styles.locationBadge}>
                <MapPin size={16} />
                <span>Near me</span>
              </div>
            )}
          </div>
          
          <form onSubmit={handleSearch} style={styles.searchContainer}>
            <Search size={20} style={styles.searchIcon} />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search deals, stores..."
              style={styles.searchBar}
              onFocus={(e) => {
                e.target.style.borderColor = theme.colors.primary;
                e.target.style.boxShadow = `0 0 0 4px ${theme.colors.primary}10`;
              }}
              onBlur={(e) => {
                e.target.style.borderColor = theme.colors.border;
                e.target.style.boxShadow = theme.colors.shadow;
              }}
            />
            <button
              type="button"
              onClick={() => setShowFilters(!showFilters)}
              style={styles.filterButton}
              onMouseOver={(e) => e.currentTarget.style.backgroundColor = '#0051D5'}
              onMouseOut={(e) => e.currentTarget.style.backgroundColor = theme.colors.primary}
            >
              <Filter size={16} />
              <span style={{ display: window.innerWidth > 480 ? 'inline' : 'none' }}>Filter</span>
            </button>
          </form>
        </header>
      )}
      
      {/* Filters */}
      {showFilters && (
        <SearchFilters 
          filters={filters}
          onFiltersChange={(newFilters) => {
            setFilters(newFilters);
            loadNearbyDeals();
          }}
          onClose={() => setShowFilters(false)}
        />
      )}
      
      {/* Content */}
      <div style={styles.content}>
        {renderContent()}
      </div>
      
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
            <span style={{ fontSize: '0.75rem' }}>Home</span>
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
            <span style={{ fontSize: '0.75rem' }}>Favorites</span>
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
              <span style={{ fontSize: '0.75rem' }}>Profile</span>
            </button>
          )}
        </div>
      </nav>
    </div>
  );
};

export default CustomerDashboard;