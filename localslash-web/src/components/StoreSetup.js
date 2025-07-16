import React, { useState, useRef, useEffect } from 'react';
import { supabase } from '../services/supabase';
import { Search, Store, MapPin, ArrowRight, ArrowLeft, Sparkles, Building, X, Globe, Phone } from 'lucide-react';
import { useTheme } from '../contexts/ThemeContext';
import ThemeToggle from './ThemeToggle';

const StoreSetup = ({ user, onSetupComplete, onSignOut, onBack, hasExistingStores }) => {
  const theme = useTheme();
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
      // If no coordinates are set, use default coordinates
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

  const handleBack = () => {
    if (hasExistingStores && onBack) {
      onBack();
    } else {
      onSignOut();
    }
  };

  const inputStyle = {
    width: '100%',
    padding: `${theme.spacing.md} ${theme.spacing.lg}`,
    background: theme.colors.input,
    border: `2px solid ${theme.colors.inputBorder}`,
    borderRadius: theme.borderRadius.large,
    fontSize: theme.typography.fontSize.base,
    color: theme.colors.inputText,
    outline: 'none',
    transition: theme.animations.normal,
    fontFamily: theme.typography.fontFamily.sans,
    boxSizing: 'border-box',
  };

  const labelStyle = {
    display: 'flex',
    alignItems: 'center',
    gap: theme.spacing.sm,
    marginBottom: theme.spacing.sm,
    color: theme.colors.textPrimary,
    fontSize: theme.typography.fontSize.sm,
    fontWeight: theme.typography.fontWeight.semibold,
    fontFamily: theme.typography.fontFamily.sans,
  };

  return (
    <>
      <style>{`
        @keyframes float {
          0%, 100% { transform: translate(0, 0) rotate(0deg); }
          25% { transform: translate(20px, -15px) rotate(90deg); }
          50% { transform: translate(-15px, -25px) rotate(180deg); }
          75% { transform: translate(-25px, -15px) rotate(270deg); }
        }
        
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
        
        @keyframes pulse {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.8; }
        }
        
        @media (max-width: ${theme.breakpoints.mobile}) {
          .store-setup-container {
            padding: ${theme.spacing.md} !important;
          }
          
          .store-setup-card {
            padding: ${theme.spacing.xl} !important;
            margin: ${theme.spacing.md} !important;
          }
          
          .store-setup-back-button span {
            display: none !important;
          }
        }
      `}</style>
      
      <div 
        className="store-setup-container"
        style={{ 
          minHeight: '100vh', 
          background: theme.colors.background,
          display: 'flex', 
          alignItems: 'center', 
          justifyContent: 'center', 
          padding: theme.spacing.lg,
          position: 'relative',
          overflow: 'hidden'
        }}
      >
        {/* Theme Toggle */}
        <div style={{
          position: 'absolute',
          top: theme.spacing.lg,
          right: theme.spacing.lg,
          zIndex: theme.zIndex.fixed,
        }}>
          <ThemeToggle size="md" />
        </div>
        
        {/* Navigation Bar */}
        <div style={{
          position: 'absolute',
          top: theme.spacing.lg,
          left: theme.spacing.lg,
          right: theme.spacing.lg,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          zIndex: theme.zIndex.fixed,
        }}>
          {/* Back Button */}
          <button
            className="store-setup-back-button"
            onClick={handleBack}
            style={{
              background: theme.colors.glass,
              border: `1px solid ${theme.colors.glassBorder}`,
              borderRadius: theme.borderRadius.medium,
              padding: theme.spacing.sm,
              color: theme.colors.textPrimary,
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: theme.spacing.xs,
              fontSize: theme.typography.fontSize.sm,
              fontWeight: theme.typography.fontWeight.medium,
              transition: theme.animations.normal,
              backdropFilter: 'blur(20px)',
              WebkitBackdropFilter: 'blur(20px)',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = theme.colors.glassHover;
              e.currentTarget.style.transform = 'translateY(-2px)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = theme.colors.glass;
              e.currentTarget.style.transform = 'translateY(0)';
            }}
          >
            <ArrowLeft size={16} />
            <span>{hasExistingStores ? 'Back to Dashboard' : 'Sign Out'}</span>
          </button>
          
          {/* Sign Out Button (if has existing stores) */}
          {hasExistingStores && (
            <button
              onClick={onSignOut}
              style={{
                background: 'rgba(239, 68, 68, 0.1)',
                border: '1px solid rgba(239, 68, 68, 0.3)',
                borderRadius: theme.borderRadius.medium,
                padding: theme.spacing.sm,
                color: theme.colors.textPrimary,
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: theme.spacing.xs,
                fontSize: theme.typography.fontSize.sm,
                fontWeight: theme.typography.fontWeight.medium,
                transition: theme.animations.normal,
                backdropFilter: 'blur(20px)',
                WebkitBackdropFilter: 'blur(20px)',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.background = 'rgba(239, 68, 68, 0.2)';
                e.currentTarget.style.transform = 'translateY(-2px)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = 'rgba(239, 68, 68, 0.1)';
                e.currentTarget.style.transform = 'translateY(0)';
              }}
            >
              <X size={16} />
              <span style={{ display: 'none' }}>Sign Out</span>
            </button>
          )}
        </div>
        
        {/* Background Effects */}
        <div style={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: `radial-gradient(circle at 30% 40%, ${theme.colors.primary}15 0%, transparent 50%), radial-gradient(circle at 70% 80%, ${theme.colors.secondary}15 0%, transparent 50%)`,
          opacity: 0.6,
        }} />
        
        {/* Floating Orbs */}
        <div style={{
          position: 'absolute',
          width: '200px',
          height: '200px',
          borderRadius: '50%',
          background: theme.gradients.primary,
          opacity: 0.1,
          top: '15%',
          right: '10%',
          animation: 'float 20s infinite ease-in-out',
          zIndex: 1,
        }} />
        
        <div style={{
          position: 'absolute',
          width: '150px',
          height: '150px',
          borderRadius: '50%',
          background: theme.gradients.secondary,
          opacity: 0.08,
          bottom: '20%',
          left: '15%',
          animation: 'float 25s infinite ease-in-out reverse',
          zIndex: 1,
        }} />
        
        {/* Main Setup Card */}
        <div 
          className="store-setup-card"
          style={{ 
            width: '100%', 
            maxWidth: '600px', 
            background: theme.colors.cardBackground,
            borderRadius: theme.borderRadius.xlarge,
            boxShadow: theme.colors.shadowLarge,
            padding: theme.spacing.xxxl,
            position: 'relative',
            zIndex: 10,
            backdropFilter: 'blur(20px)',
            WebkitBackdropFilter: 'blur(20px)',
            border: `1px solid ${theme.colors.border}`,
            overflow: 'hidden',
            marginTop: '80px', // Space for navigation
          }}
        >
          {/* Header Gradient */}
          <div style={{
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            height: '4px',
            background: theme.gradients.primary,
          }} />
          
          {/* Header */}
          <div style={{ textAlign: 'center', marginBottom: theme.spacing.xl }}>
            <div style={{
              width: '5rem',
              height: '5rem',
              background: theme.gradients.primary,
              borderRadius: '50%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              margin: `0 auto ${theme.spacing.lg}`,
              position: 'relative',
              boxShadow: `0 10px 30px ${theme.colors.primary}40`,
              border: `3px solid ${theme.colors.cardBackground}`,
              animation: 'pulse 2s infinite ease-in-out'
            }}>
              <Building size={28} style={{ color: 'white' }} />
              <div style={{
                position: 'absolute',
                top: '-3px',
                right: '-3px',
                width: '1.5rem',
                height: '1.5rem',
                background: theme.colors.success,
                borderRadius: '50%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                border: `2px solid ${theme.colors.cardBackground}`
              }}>
                <Sparkles size={12} color="white" />
              </div>
            </div>
            
            <h1 style={{ 
              fontSize: theme.typography.fontSize['3xl'], 
              fontWeight: theme.typography.fontWeight.extrabold, 
              marginBottom: theme.spacing.sm,
              color: theme.colors.textPrimary,
              fontFamily: theme.typography.fontFamily.sans
            }}>
              {hasExistingStores ? 'Add New Store' : 'Set Up Your Store'}
            </h1>
            <p style={{ 
              color: theme.colors.textSecondary,
              fontSize: theme.typography.fontSize.base,
              lineHeight: theme.typography.lineHeight.normal,
              fontFamily: theme.typography.fontFamily.sans
            }}>
              {hasExistingStores ? 'Add another store to your business' : 'Let\'s get your business on LocalSlash'}
            </p>
          </div>
          
          {/* Form */}
          <form onSubmit={handleSubmit} style={{ position: 'relative' }}>
            {/* Google Places Search */}
            <div style={{ marginBottom: theme.spacing.lg }}>
              <label style={labelStyle}>
                <Search size={16} style={{ color: theme.colors.primary }} />
                Search for your business
              </label>
              <input
                ref={searchInputRef}
                type="text"
                placeholder="Start typing your business name..."
                style={inputStyle}
                onFocus={(e) => {
                  e.target.style.borderColor = theme.colors.inputFocus;
                  e.target.style.boxShadow = `0 0 0 4px ${theme.colors.inputFocus}20`;
                }}
                onBlur={(e) => {
                  e.target.style.borderColor = theme.colors.inputBorder;
                  e.target.style.boxShadow = 'none';
                }}
              />
              {!process.env.REACT_APP_GOOGLE_MAPS_API_KEY && (
                <p style={{ 
                  fontSize: theme.typography.fontSize.xs,
                  color: theme.colors.textMuted,
                  marginTop: theme.spacing.xs,
                  fontFamily: theme.typography.fontFamily.sans
                }}>
                  Google Places search requires API key. Please enter details manually below.
                </p>
              )}
              
              {selectedPlace && (
                <div style={{
                  marginTop: theme.spacing.sm,
                  padding: theme.spacing.sm,
                  background: `${theme.colors.success}10`,
                  borderRadius: theme.borderRadius.medium,
                  border: `1px solid ${theme.colors.success}20`,
                }}>
                  <p style={{ 
                    fontWeight: theme.typography.fontWeight.medium,
                    marginBottom: theme.spacing.xs,
                    color: theme.colors.textPrimary,
                    fontSize: theme.typography.fontSize.sm
                  }}>
                    {selectedPlace.name}
                  </p>
                  <p style={{ 
                    fontSize: theme.typography.fontSize.xs,
                    color: theme.colors.textSecondary
                  }}>
                    {selectedPlace.formatted_address}
                  </p>
                </div>
              )}
            </div>
            
            {/* Store Name */}
            <div style={{ marginBottom: theme.spacing.lg }}>
              <label style={labelStyle}>
                <Store size={16} style={{ color: theme.colors.primary }} />
                Store Name*
              </label>
              <input
                type="text"
                value={storeForm.name}
                onChange={(e) => setStoreForm({ ...storeForm, name: e.target.value })}
                required
                placeholder="Your Business Name"
                style={inputStyle}
                onFocus={(e) => {
                  e.target.style.borderColor = theme.colors.inputFocus;
                  e.target.style.boxShadow = `0 0 0 4px ${theme.colors.inputFocus}20`;
                }}
                onBlur={(e) => {
                  e.target.style.borderColor = theme.colors.inputBorder;
                  e.target.style.boxShadow = 'none';
                }}
              />
            </div>
            
            {/* Address */}
            <div style={{ marginBottom: theme.spacing.lg }}>
              <label style={labelStyle}>
                <MapPin size={16} style={{ color: theme.colors.primary }} />
                Address*
              </label>
              <input
                type="text"
                value={storeForm.address}
                onChange={(e) => setStoreForm({ ...storeForm, address: e.target.value })}
                required
                placeholder="123 Main St, City, State ZIP"
                style={inputStyle}
                onFocus={(e) => {
                  e.target.style.borderColor = theme.colors.inputFocus;
                  e.target.style.boxShadow = `0 0 0 4px ${theme.colors.inputFocus}20`;
                }}
                onBlur={(e) => {
                  e.target.style.borderColor = theme.colors.inputBorder;
                  e.target.style.boxShadow = 'none';
                }}
              />
            </div>
            
            {/* Phone and Website Row */}
            <div style={{ 
              display: 'grid', 
              gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', 
              gap: theme.spacing.md,
              marginBottom: theme.spacing.lg
            }}>
              <div>
                <label style={labelStyle}>
                  <Phone size={16} style={{ color: theme.colors.primary }} />
                  Phone Number
                </label>
                <input
                  type="tel"
                  value={storeForm.phone}
                  onChange={(e) => setStoreForm({ ...storeForm, phone: e.target.value })}
                  placeholder="(555) 123-4567"
                  style={inputStyle}
                  onFocus={(e) => {
                    e.target.style.borderColor = theme.colors.inputFocus;
                    e.target.style.boxShadow = `0 0 0 4px ${theme.colors.inputFocus}20`;
                  }}
                  onBlur={(e) => {
                    e.target.style.borderColor = theme.colors.inputBorder;
                    e.target.style.boxShadow = 'none';
                  }}
                />
              </div>
              
              <div>
                <label style={labelStyle}>
                  <Globe size={16} style={{ color: theme.colors.primary }} />
                  Website
                </label>
                <input
                  type="url"
                  value={storeForm.website}
                  onChange={(e) => setStoreForm({ ...storeForm, website: e.target.value })}
                  placeholder="https://yourbusiness.com"
                  style={inputStyle}
                  onFocus={(e) => {
                    e.target.style.borderColor = theme.colors.inputFocus;
                    e.target.style.boxShadow = `0 0 0 4px ${theme.colors.inputFocus}20`;
                  }}
                  onBlur={(e) => {
                    e.target.style.borderColor = theme.colors.inputBorder;
                    e.target.style.boxShadow = 'none';
                  }}
                />
              </div>
            </div>
            
            {/* Description */}
            <div style={{ marginBottom: theme.spacing.xl }}>
              <label style={labelStyle}>
                <Sparkles size={16} style={{ color: theme.colors.primary }} />
                Description
              </label>
              <textarea
                value={storeForm.description}
                onChange={(e) => setStoreForm({ ...storeForm, description: e.target.value })}
                placeholder="Tell customers what makes your business special..."
                style={{
                  ...inputStyle,
                  minHeight: '100px',
                  resize: 'vertical',
                }}
                onFocus={(e) => {
                  e.target.style.borderColor = theme.colors.inputFocus;
                  e.target.style.boxShadow = `0 0 0 4px ${theme.colors.inputFocus}20`;
                }}
                onBlur={(e) => {
                  e.target.style.borderColor = theme.colors.inputBorder;
                  e.target.style.boxShadow = 'none';
                }}
              />
            </div>
            
            {/* Error Message */}
            {error && (
              <div style={{ 
                marginBottom: theme.spacing.lg, 
                padding: theme.spacing.md,
                background: `${theme.colors.danger}10`,
                border: `1px solid ${theme.colors.danger}40`,
                borderRadius: theme.borderRadius.medium,
                color: theme.colors.danger,
                fontSize: theme.typography.fontSize.sm,
                fontFamily: theme.typography.fontFamily.sans
              }}>
                {error}
              </div>
            )}
            
            {/* Submit Button */}
            <button
              type="submit"
              disabled={isLoading || !storeForm.name || !storeForm.address}
              style={{
                width: '100%',
                background: theme.gradients.primary,
                color: 'white',
                padding: `${theme.spacing.md} ${theme.spacing.lg}`,
                borderRadius: theme.borderRadius.large,
                fontWeight: theme.typography.fontWeight.bold,
                fontSize: theme.typography.fontSize.lg,
                cursor: (isLoading || !storeForm.name || !storeForm.address) ? 'not-allowed' : 'pointer',
                border: 'none',
                opacity: (isLoading || !storeForm.name || !storeForm.address) ? 0.5 : 1,
                transition: theme.animations.normal,
                boxShadow: `0 10px 30px ${theme.colors.primary}40`,
                position: 'relative',
                overflow: 'hidden',
                fontFamily: theme.typography.fontFamily.sans,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: theme.spacing.sm,
              }}
              onMouseEnter={(e) => {
                if (!isLoading && storeForm.name && storeForm.address) {
                  e.currentTarget.style.transform = 'translateY(-2px)';
                  e.currentTarget.style.boxShadow = `0 15px 40px ${theme.colors.primary}60`;
                }
              }}
              onMouseLeave={(e) => {
                if (!isLoading && storeForm.name && storeForm.address) {
                  e.currentTarget.style.transform = 'translateY(0)';
                  e.currentTarget.style.boxShadow = `0 10px 30px ${theme.colors.primary}40`;
                }
              }}
            >
              {isLoading ? (
                <>
                  <div style={{
                    width: '20px',
                    height: '20px',
                    border: '2px solid rgba(255, 255, 255, 0.3)',
                    borderTopColor: 'white',
                    borderRadius: '50%',
                    animation: 'spin 1s linear infinite'
                  }} />
                  Creating Store...
                </>
              ) : (
                <>
                  {hasExistingStores ? 'Add Store' : 'Create Store & Continue'}
                  <ArrowRight size={20} />
                </>
              )}
            </button>
          </form>
        </div>
      </div>
    </>
  );
};

export default StoreSetup;