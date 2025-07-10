import React, { useState, useRef, useEffect } from 'react';
import { supabase } from '../services/supabase';
import { Search, Store, MapPin, ArrowRight } from 'lucide-react';
import { theme } from '../styles/theme';
import { cardStyle, buttonStyle, containerStyle } from '../styles/componentStyles';

const StoreSetup = ({ user, onSetupComplete }) => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [selectedPlace, setSelectedPlace] = useState(null);
  const [storeForm, setStoreForm] = useState({
    name: '',
    description: '',
    phone: '',
    website: '',
    address: '',
    place_id: '',
    latitude: null,
    longitude: null
  });
  
  const searchInputRef = useRef(null);
  const autocompleteRef = useRef(null);
  
  // Initialize Google Places Autocomplete
  useEffect(() => {
    const initializeGooglePlaces = async () => {
      try {
        // Dynamically load Google Maps API
        const { loadGoogleMaps } = await import('../utils/googleMaps');
        await loadGoogleMaps();
        
        // Initialize autocomplete after Google Maps is loaded
        if (window.google && window.google.maps && window.google.maps.places && searchInputRef.current && !autocompleteRef.current) {
          autocompleteRef.current = new window.google.maps.places.Autocomplete(searchInputRef.current, {
            types: ['establishment'],
            fields: ['place_id', 'name', 'formatted_address', 'geometry', 'formatted_phone_number', 'website']
          });
          
          autocompleteRef.current.addListener('place_changed', () => {
            const place = autocompleteRef.current.getPlace();
            if (place.geometry) {
              setSelectedPlace(place);
              setStoreForm(prevForm => ({
                ...prevForm,
                name: place.name || prevForm.name,
                address: place.formatted_address || prevForm.address,
                place_id: place.place_id || '',
                latitude: place.geometry.location.lat(),
                longitude: place.geometry.location.lng(),
                phone: place.formatted_phone_number || prevForm.phone,
                website: place.website || prevForm.website
              }));
            }
          });
        }
      } catch (error) {
        console.error('Error loading Google Maps or initializing Places:', error);
      }
    };
    
    initializeGooglePlaces();
  }, []);
  
  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');
    
    try {
      // If no coordinates are set, use default coordinates (you can change these)
      const finalFormData = {
        ...storeForm,
        latitude: storeForm.latitude || 33.0198,  // Default: Dallas area
        longitude: storeForm.longitude || -96.6989
      };
      
      const { data, error } = await supabase
        .from('stores')
        .insert([{
          user_id: user.id,
          ...finalFormData
        }])
        .select()
        .single();
      
      if (error) throw error;
      if (data) {
        onSetupComplete(data);
      }
    } catch (error) {
      console.error('Store setup error:', error);
      setError(error.message);
    } finally {
      setIsLoading(false);
    }
  };

  const styles = {
    container: {
      minHeight: '100vh',
      backgroundColor: theme.colors.background,
      padding: theme.spacing.xl,
    },
    
    wrapper: {
      maxWidth: '48rem',
      margin: '0 auto',
    },
    
    header: {
      textAlign: 'center',
      marginBottom: theme.spacing.xxl,
    },
    
    iconContainer: {
      display: 'flex',
      justifyContent: 'center',
      marginBottom: theme.spacing.lg,
    },
    
    icon: {
      width: '80px',
      height: '80px',
      background: `linear-gradient(135deg, ${theme.colors.primary} 0%, ${theme.colors.secondary} 100%)`,
      borderRadius: theme.borderRadius.xlarge,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      boxShadow: `0 10px 30px ${theme.colors.primary}30`,
    },
    
    title: {
      fontSize: 'clamp(1.75rem, 4vw, 2.5rem)',
      fontWeight: 'bold',
      marginBottom: theme.spacing.sm,
      color: theme.colors.textPrimary,
    },
    
    subtitle: {
      fontSize: 'clamp(1rem, 2vw, 1.25rem)',
      color: theme.colors.textSecondary,
      marginBottom: theme.spacing.md,
    },
    
    steps: {
      display: 'flex',
      justifyContent: 'center',
      gap: theme.spacing.md,
      marginTop: theme.spacing.lg,
    },
    
    step: {
      display: 'flex',
      alignItems: 'center',
      gap: theme.spacing.xs,
      fontSize: '0.875rem',
      color: theme.colors.textSecondary,
    },
    
    stepActive: {
      color: theme.colors.primary,
      fontWeight: '600',
    },
    
    card: {
      ...cardStyle,
      padding: theme.spacing.xl,
    },
    
    searchSection: {
      marginBottom: theme.spacing.xl,
    },
    
    searchLabel: {
      display: 'flex',
      alignItems: 'center',
      gap: theme.spacing.sm,
      marginBottom: theme.spacing.sm,
      fontWeight: '500',
      color: theme.colors.textPrimary,
    },
    
    searchInput: {
      width: '100%',
      padding: theme.spacing.md,
      border: `1px solid ${theme.colors.border}`,
      borderRadius: theme.borderRadius.medium,
      fontSize: '1rem',
      backgroundColor: theme.colors.cardBackground,
      color: theme.colors.textPrimary,
      transition: 'all 0.3s ease',
      outline: 'none',
    },
    
    selectedPlace: {
      marginTop: theme.spacing.md,
      padding: theme.spacing.md,
      backgroundColor: `${theme.colors.primary}05`,
      borderRadius: theme.borderRadius.medium,
      border: `1px solid ${theme.colors.primary}20`,
    },
    
    formGrid: {
      display: 'grid',
      gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
      gap: theme.spacing.lg,
      marginBottom: theme.spacing.lg,
    },
    
    inputGroup: {
      display: 'flex',
      flexDirection: 'column',
      gap: theme.spacing.sm,
    },
    
    label: {
      fontSize: '0.875rem',
      fontWeight: '500',
      color: theme.colors.textPrimary,
    },
    
    input: {
      padding: theme.spacing.md,
      border: `1px solid ${theme.colors.border}`,
      borderRadius: theme.borderRadius.medium,
      fontSize: '1rem',
      backgroundColor: theme.colors.cardBackground,
      color: theme.colors.textPrimary,
      transition: 'all 0.3s ease',
      outline: 'none',
    },
    
    textarea: {
      padding: theme.spacing.md,
      border: `1px solid ${theme.colors.border}`,
      borderRadius: theme.borderRadius.medium,
      fontSize: '1rem',
      backgroundColor: theme.colors.cardBackground,
      color: theme.colors.textPrimary,
      transition: 'all 0.3s ease',
      outline: 'none',
      resize: 'vertical',
      minHeight: '100px',
    },
    
    errorBox: {
      marginBottom: theme.spacing.lg,
      padding: theme.spacing.md,
      backgroundColor: `${theme.colors.danger}10`,
      border: `1px solid ${theme.colors.danger}20`,
      borderRadius: theme.borderRadius.medium,
      color: theme.colors.danger,
      fontSize: '0.875rem',
    },
    
    submitButton: {
      ...buttonStyle,
      width: '100%',
      backgroundColor: theme.colors.primary,
      color: 'white',
      padding: theme.spacing.md,
      fontSize: '1.125rem',
      fontWeight: '600',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      gap: theme.spacing.sm,
    },
    
    submitButtonDisabled: {
      opacity: 0.5,
      cursor: 'not-allowed',
    },
  };
  
  return (
    <div style={styles.container}>
      <div style={styles.wrapper}>
        <div style={styles.header}>
          <div style={styles.iconContainer}>
            <div style={styles.icon}>
              <Store size={40} color="white" />
            </div>
          </div>
          <h1 style={styles.title}>Welcome to LocalSlash!</h1>
          <p style={styles.subtitle}>Let's set up your store in just a few steps</p>
          
          <div style={styles.steps}>
            <div style={{ ...styles.step, ...styles.stepActive }}>
              <span>1</span>
              <span>Store Details</span>
            </div>
            <div style={styles.step}>
              <span>→</span>
            </div>
            <div style={styles.step}>
              <span>2</span>
              <span>Create First Deal</span>
            </div>
            <div style={styles.step}>
              <span>→</span>
            </div>
            <div style={styles.step}>
              <span>3</span>
              <span>Start Attracting Customers</span>
            </div>
          </div>
        </div>
        
        <div style={styles.card}>
          <form onSubmit={handleSubmit}>
            <div style={styles.searchSection}>
              <label style={styles.searchLabel}>
                <Search size={16} />
                Search for your business
              </label>
              <input
                ref={searchInputRef}
                type="text"
                placeholder="Start typing your business name..."
                style={styles.searchInput}
                onFocus={(e) => {
                  e.target.style.borderColor = theme.colors.primary;
                  e.target.style.boxShadow = `0 0 0 4px ${theme.colors.primary}10`;
                }}
                onBlur={(e) => {
                  e.target.style.borderColor = theme.colors.border;
                  e.target.style.boxShadow = 'none';
                }}
              />
              {!process.env.REACT_APP_GOOGLE_MAPS_API_KEY && (
                <p style={{ fontSize: '0.75rem', color: theme.colors.textSecondary, marginTop: '0.25rem' }}>
                  Google Places search requires API key configuration. Please enter details manually below.
                </p>
              )}
              
              {selectedPlace && (
                <div style={styles.selectedPlace}>
                  <p style={{ fontWeight: '500', marginBottom: '0.25rem' }}>{selectedPlace.name}</p>
                  <p style={{ fontSize: '0.875rem', color: theme.colors.textSecondary }}>
                    {selectedPlace.formatted_address}
                  </p>
                </div>
              )}
            </div>
            
            <div style={styles.formGrid}>
              <div style={styles.inputGroup}>
                <label style={styles.label}>Store Name*</label>
                <input
                  type="text"
                  value={storeForm.name}
                  onChange={(e) => setStoreForm({ ...storeForm, name: e.target.value })}
                  required
                  placeholder="Your Business Name"
                  style={styles.input}
                  onFocus={(e) => {
                    e.target.style.borderColor = theme.colors.primary;
                    e.target.style.boxShadow = `0 0 0 4px ${theme.colors.primary}10`;
                  }}
                  onBlur={(e) => {
                    e.target.style.borderColor = theme.colors.border;
                    e.target.style.boxShadow = 'none';
                  }}
                />
              </div>
              
              <div style={styles.inputGroup}>
                <label style={styles.label}>Phone Number</label>
                <input
                  type="tel"
                  value={storeForm.phone}
                  onChange={(e) => setStoreForm({ ...storeForm, phone: e.target.value })}
                  placeholder="(555) 123-4567"
                  style={styles.input}
                  onFocus={(e) => {
                    e.target.style.borderColor = theme.colors.primary;
                    e.target.style.boxShadow = `0 0 0 4px ${theme.colors.primary}10`;
                  }}
                  onBlur={(e) => {
                    e.target.style.borderColor = theme.colors.border;
                    e.target.style.boxShadow = 'none';
                  }}
                />
              </div>
            </div>
            
            <div style={{ marginBottom: theme.spacing.lg }}>
              <label style={styles.label}>Address*</label>
              <input
                type="text"
                value={storeForm.address}
                onChange={(e) => setStoreForm({ ...storeForm, address: e.target.value })}
                required
                placeholder="123 Main St, City, State ZIP"
                style={styles.input}
                onFocus={(e) => {
                  e.target.style.borderColor = theme.colors.primary;
                  e.target.style.boxShadow = `0 0 0 4px ${theme.colors.primary}10`;
                }}
                onBlur={(e) => {
                  e.target.style.borderColor = theme.colors.border;
                  e.target.style.boxShadow = 'none';
                }}
              />
            </div>
            
            <div style={{ marginBottom: theme.spacing.lg }}>
              <label style={styles.label}>Website</label>
              <input
                type="url"
                value={storeForm.website}
                onChange={(e) => setStoreForm({ ...storeForm, website: e.target.value })}
                placeholder="https://yourbusiness.com"
                style={styles.input}
                onFocus={(e) => {
                  e.target.style.borderColor = theme.colors.primary;
                  e.target.style.boxShadow = `0 0 0 4px ${theme.colors.primary}10`;
                }}
                onBlur={(e) => {
                  e.target.style.borderColor = theme.colors.border;
                  e.target.style.boxShadow = 'none';
                }}
              />
            </div>
            
            <div style={{ marginBottom: theme.spacing.xl }}>
              <label style={styles.label}>Description</label>
              <textarea
                value={storeForm.description}
                onChange={(e) => setStoreForm({ ...storeForm, description: e.target.value })}
                placeholder="Tell customers what makes your business special..."
                style={styles.textarea}
                onFocus={(e) => {
                  e.target.style.borderColor = theme.colors.primary;
                  e.target.style.boxShadow = `0 0 0 4px ${theme.colors.primary}10`;
                }}
                onBlur={(e) => {
                  e.target.style.borderColor = theme.colors.border;
                  e.target.style.boxShadow = 'none';
                }}
              />
            </div>
            
            {error && (
              <div style={styles.errorBox}>
                {error}
              </div>
            )}
            
            <button
              type="submit"
              disabled={isLoading || !storeForm.name || !storeForm.address}
              style={{
                ...styles.submitButton,
                ...(isLoading || !storeForm.name || !storeForm.address ? styles.submitButtonDisabled : {})
              }}
              onMouseOver={(e) => {
                if (!isLoading && storeForm.name && storeForm.address) {
                  e.currentTarget.style.backgroundColor = '#0051D5';
                }
              }}
              onMouseOut={(e) => {
                e.currentTarget.style.backgroundColor = theme.colors.primary;
              }}
            >
              {isLoading ? 'Creating Store...' : 'Create Store & Continue'}
              {!isLoading && <ArrowRight size={20} />}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default StoreSetup;