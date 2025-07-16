import React, { useState, useEffect } from 'react';
import { supabase } from '../services/supabase';
import CustomerAuth from './CustomerAuth';
import ModernCustomerDashboard from './ModernCustomerDashboard';


const CustomerApp = ({ setCurrentScreen }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [user, setUser] = useState(null);
  const [userLocation, setUserLocation] = useState({
    latitude: 32.7767,
    longitude: -96.7970
  });
  
  // Check authentication on mount
  useEffect(() => {
    checkAuth();
    // Get location in background, don't block UI
    setTimeout(() => {
      getUserLocation();
    }, 100);
  }, []);
  
  const checkAuth = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        setUser(user);
        setIsAuthenticated(true);
      }
    } catch (error) {
      console.error('Auth check error:', error);
    }
  };
  
  const getUserLocation = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setUserLocation({
            latitude: position.coords.latitude,
            longitude: position.coords.longitude
          });
        },
        (error) => {
          console.error('Error getting location:', error);
          // Keep the default location if location fails
        },
        {
          timeout: 10000, // 10 second timeout
          enableHighAccuracy: false
        }
      );
    }
  };
  
  const handleAuthSuccess = async (user) => {
    setUser(user);
    setIsAuthenticated(true);
  };
  
  const handleSignOut = async () => {
    await supabase.auth.signOut();
    setIsAuthenticated(false);
    setUser(null);
  };
  
  // Loading screen
  if (isLoading) {
    return (
      <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div style={{ textAlign: 'center' }}>
          <div style={{ fontSize: '2rem', marginBottom: '1rem' }}>📍</div>
          <p>Finding deals near you...</p>
        </div>
      </div>
    );
  }
  
  // Auth screen
  if (!isAuthenticated) {
    return <CustomerAuth onAuthSuccess={handleAuthSuccess} setCurrentScreen={setCurrentScreen} />;
  }
  
  // Main dashboard
  return (
    <ModernCustomerDashboard
  user={user}
  userLocation={userLocation}
  setCurrentScreen={setCurrentScreen}
  onSignOut={handleSignOut}
/>
  );
};

export default CustomerApp;