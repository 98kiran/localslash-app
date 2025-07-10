import React, { useState, useRef, useEffect } from 'react';
import { supabase } from '../services/supabase';
import { Search } from 'lucide-react';

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
    // Check if Google Maps is loaded
    if (window.google && window.google.maps && window.google.maps.places && searchInputRef.current && !autocompleteRef.current) {
      try {
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
      } catch (error) {
        console.error('Error initializing Google Places:', error);
      }
    }
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
  
  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#f9fafb', padding: '2rem' }}>
      <div style={{ maxWidth: '48rem', margin: '0 auto' }}>
        <h1 style={{ fontSize: '2rem', fontWeight: 'bold', marginBottom: '0.5rem' }}>Set Up Your Store</h1>
        <p style={{ color: '#6b7280', marginBottom: '2rem' }}>Search for your business or enter details manually</p>
        
        <div style={{ backgroundColor: 'white', borderRadius: '0.5rem', padding: '2rem', boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)' }}>
          <form onSubmit={handleSubmit}>
            <div style={{ marginBottom: '1.5rem' }}>
              <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem', fontWeight: '500' }}>
                <Search size={16} /> Search for your business
              </label>
              <input
                ref={searchInputRef}
                type="text"
                placeholder="Type your business name..."
                style={{
                  width: '100%',
                  padding: '0.75rem',
                  border: '1px solid #d1d5db',
                  borderRadius: '0.375rem',
                  fontSize: '1rem'
                }}
              />
              {!window.google && (
                <p style={{ fontSize: '0.75rem', color: '#6b7280', marginTop: '0.25rem' }}>
                  Google Places search is not available. Please enter details manually below.
                </p>
              )}
            </div>
            
            {selectedPlace && (
              <div style={{ marginBottom: '1.5rem', padding: '1rem', backgroundColor: '#eff6ff', borderRadius: '0.375rem', border: '1px solid #dbeafe' }}>
                <p style={{ fontWeight: '500', marginBottom: '0.25rem' }}>{selectedPlace.name}</p>
                <p style={{ fontSize: '0.875rem', color: '#6b7280' }}>{selectedPlace.formatted_address}</p>
              </div>
            )}
            
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1rem' }}>
              <div>
                <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '500' }}>Store Name</label>
                <input
                  type="text"
                  value={storeForm.name}
                  onChange={(e) => setStoreForm({ ...storeForm, name: e.target.value })}
                  required
                  style={{
                    width: '100%',
                    padding: '0.75rem',
                    border: '1px solid #d1d5db',
                    borderRadius: '0.375rem'
                  }}
                />
              </div>
              
              <div>
                <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '500' }}>Phone</label>
                <input
                  type="tel"
                  value={storeForm.phone}
                  onChange={(e) => setStoreForm({ ...storeForm, phone: e.target.value })}
                  style={{
                    width: '100%',
                    padding: '0.75rem',
                    border: '1px solid #d1d5db',
                    borderRadius: '0.375rem'
                  }}
                />
              </div>
            </div>
            
            <div style={{ marginBottom: '1rem' }}>
              <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '500' }}>Address</label>
              <input
                type="text"
                value={storeForm.address}
                onChange={(e) => setStoreForm({ ...storeForm, address: e.target.value })}
                required
                style={{
                  width: '100%',
                  padding: '0.75rem',
                  border: '1px solid #d1d5db',
                  borderRadius: '0.375rem'
                }}
              />
            </div>
            
            <div style={{ marginBottom: '1rem' }}>
              <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '500' }}>Website</label>
              <input
                type="url"
                value={storeForm.website}
                onChange={(e) => setStoreForm({ ...storeForm, website: e.target.value })}
                placeholder="https://"
                style={{
                  width: '100%',
                  padding: '0.75rem',
                  border: '1px solid #d1d5db',
                  borderRadius: '0.375rem'
                }}
              />
            </div>
            
            <div style={{ marginBottom: '1.5rem' }}>
              <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '500' }}>Description</label>
              <textarea
                value={storeForm.description}
                onChange={(e) => setStoreForm({ ...storeForm, description: e.target.value })}
                rows={3}
                placeholder="Tell customers about your store..."
                style={{
                  width: '100%',
                  padding: '0.75rem',
                  border: '1px solid #d1d5db',
                  borderRadius: '0.375rem',
                  resize: 'vertical'
                }}
              />
            </div>
            
            {error && (
              <div style={{ marginBottom: '1rem', padding: '0.75rem', backgroundColor: '#fef2f2', border: '1px solid #fecaca', borderRadius: '0.375rem', color: '#dc2626', fontSize: '0.875rem' }}>
                {error}
              </div>
            )}
            
            <button
              type="submit"
              disabled={isLoading || !storeForm.name || !storeForm.address}
              style={{
                width: '100%',
                backgroundColor: '#2563eb',
                color: 'white',
                padding: '0.75rem',
                borderRadius: '0.375rem',
                fontWeight: '500',
                cursor: isLoading ? 'not-allowed' : 'pointer',
                border: 'none',
                opacity: isLoading || !storeForm.name || !storeForm.address ? 0.5 : 1
              }}
            >
              {isLoading ? 'Creating Store...' : 'Create Store'}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default StoreSetup;