import React, { useState, useEffect } from 'react';
import { supabase } from '../services/supabase';
import { MapPin, Search, Filter, Heart, User, Home, LogOut } from 'lucide-react';
import NearbyDeals from './NearbyDeals';
import Favorites from './Favorites';
import CustomerProfile from './CustomerProfile';
import SearchFilters from './SearchFilters';

const CustomerDashboard = ({ user, userLocation, setCurrentScreen, onSignOut }) => {
  const [view, setView] = useState('home');
  const [searchQuery, setSearchQuery] = useState('');
  const [filters, setFilters] = useState({
    category: 'all',
    radius: 25,  // Increased from 5 to 25 miles
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

      // If no user location, show all deals without distance
      if (!userLocation || !userLocation.latitude || !userLocation.longitude) {
        console.log('No user location, showing all deals');
        setDeals(data);
        return;
      }

      // Calculate distances and filter by radius
      const dealsWithDistance = data.map(deal => {
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
    // Filter deals based on search query
    const filtered = deals.filter(deal => 
      deal.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      deal.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      deal.stores.name.toLowerCase().includes(searchQuery.toLowerCase())
    );
    setDeals(filtered);
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
    <div style={{ minHeight: '100vh', backgroundColor: '#f9fafb' }}>
      {/* Header */}
      <div style={{ backgroundColor: 'white', boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)', position: 'sticky', top: 0, zIndex: 10 }}>
        <div style={{ padding: '1rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
              <h1 style={{ fontSize: '1.5rem', fontWeight: 'bold', color: '#2563eb' }}>LocalSlash</h1>
              {userLocation && (
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.25rem', color: '#6b7280', fontSize: '0.875rem' }}>
                  <MapPin size={16} />
                  <span>Near me</span>
                </div>
              )}
            </div>
            
            <div style={{ display: 'flex', gap: '0.5rem' }}>
              <button
                onClick={() => setCurrentScreen('welcome')}
                style={{
                  padding: '0.5rem',
                  borderRadius: '0.375rem',
                  border: '1px solid #d1d5db',
                  backgroundColor: 'white',
                  cursor: 'pointer',
                  fontSize: '0.875rem'
                }}
              >
                Back
              </button>
              {user && (
                <button
                  onClick={onSignOut}
                  style={{
                    padding: '0.5rem',
                    borderRadius: '0.375rem',
                    backgroundColor: '#ef4444',
                    color: 'white',
                    border: 'none',
                    cursor: 'pointer'
                  }}
                >
                  <LogOut size={16} />
                </button>
              )}
            </div>
          </div>
          
          {/* Search Bar */}
          <form onSubmit={handleSearch} style={{ display: 'flex', gap: '0.5rem' }}>
            <div style={{ flex: 1, position: 'relative' }}>
              <Search size={20} style={{ position: 'absolute', left: '0.75rem', top: '50%', transform: 'translateY(-50%)', color: '#9ca3af' }} />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search deals, stores..."
                style={{
                  width: '100%',
                  padding: '0.75rem 0.75rem 0.75rem 2.5rem',
                  border: '1px solid #d1d5db',
                  borderRadius: '0.375rem',
                  fontSize: '1rem'
                }}
              />
            </div>
            <button
              type="button"
              onClick={() => setShowFilters(!showFilters)}
              style={{
                padding: '0.75rem',
                border: '1px solid #d1d5db',
                borderRadius: '0.375rem',
                backgroundColor: 'white',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem'
              }}
            >
              <Filter size={20} />
            </button>
          </form>
        </div>
        
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
      </div>
      
      {/* Content */}
      <div style={{ paddingBottom: '5rem' }}>
        {renderContent()}
      </div>
      
      {/* Bottom Navigation */}
      <div style={{ 
        position: 'fixed', 
        bottom: 0, 
        left: 0, 
        right: 0, 
        backgroundColor: 'white', 
        borderTop: '1px solid #e5e7eb',
        display: 'flex',
        justifyContent: 'space-around',
        padding: '0.5rem 0'
      }}>
        <button
          onClick={() => setView('home')}
          style={{
            padding: '0.5rem 1rem',
            backgroundColor: 'transparent',
            border: 'none',
            cursor: 'pointer',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: '0.25rem',
            color: view === 'home' ? '#2563eb' : '#6b7280'
          }}
        >
          <Home size={24} />
          <span style={{ fontSize: '0.75rem' }}>Home</span>
        </button>
        
        <button
          onClick={() => setView('favorites')}
          style={{
            padding: '0.5rem 1rem',
            backgroundColor: 'transparent',
            border: 'none',
            cursor: 'pointer',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: '0.25rem',
            color: view === 'favorites' ? '#2563eb' : '#6b7280'
          }}
        >
          <Heart size={24} />
          <span style={{ fontSize: '0.75rem' }}>Favorites</span>
        </button>
        
        {user && (
          <button
            onClick={() => setView('profile')}
            style={{
              padding: '0.5rem 1rem',
              backgroundColor: 'transparent',
              border: 'none',
              cursor: 'pointer',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              gap: '0.25rem',
              color: view === 'profile' ? '#2563eb' : '#6b7280'
            }}
          >
            <User size={24} />
            <span style={{ fontSize: '0.75rem' }}>Profile</span>
          </button>
        )}
      </div>
    </div>
  );
};

export default CustomerDashboard;