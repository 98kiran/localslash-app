import React, { useState } from 'react';
import { supabase } from '../services/supabase';
import { Save, Camera, MapPin, Phone, Globe, Clock } from 'lucide-react';

const StoreProfile = ({ store, onUpdate }) => {
  const [isEditing, setIsEditing] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: store?.name || '',
    description: store?.description || '',
    phone: store?.phone || '',
    website: store?.website || '',
    address: store?.address || '',
    opening_hours: store?.opening_hours || {}
  });
  
  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    
    try {
      const { data, error } = await supabase
        .from('stores')
        .update(formData)
        .eq('id', store.id)
        .select()
        .single();
      
      if (error) throw error;
      if (data) {
        onUpdate(data);
        setIsEditing(false);
      }
    } catch (error) {
      console.error('Update error:', error);
    } finally {
      setIsLoading(false);
    }
  };
  
  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
        <h2 style={{ fontSize: '1.5rem', fontWeight: 'bold' }}>Store Profile</h2>
        {!isEditing && (
          <button
            onClick={() => setIsEditing(true)}
            style={{
              padding: '0.5rem 1rem',
              backgroundColor: '#2563eb',
              color: 'white',
              borderRadius: '0.375rem',
              border: 'none',
              cursor: 'pointer'
            }}
          >
            Edit Profile
          </button>
        )}
      </div>
      
      <div style={{ backgroundColor: 'white', borderRadius: '0.5rem', padding: '2rem', boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)' }}>
        <form onSubmit={handleSubmit}>
          {/* Store Image */}
          <div style={{ marginBottom: '2rem', textAlign: 'center' }}>
            <div style={{
              width: '150px',
              height: '150px',
              margin: '0 auto',
              backgroundColor: '#f3f4f6',
              borderRadius: '50%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              marginBottom: '1rem'
            }}>
              <Camera size={48} style={{ color: '#9ca3af' }} />
            </div>
            {isEditing && (
              <button type="button" style={{ color: '#2563eb', fontSize: '0.875rem', textDecoration: 'underline', backgroundColor: 'transparent', border: 'none', cursor: 'pointer' }}>
                Upload Logo
              </button>
            )}
          </div>
          
          {/* Form fields */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
            <div>
              <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '500' }}>Store Name</label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                disabled={!isEditing}
                style={{
                  width: '100%',
                  padding: '0.75rem',
                  border: '1px solid #d1d5db',
                  borderRadius: '0.375rem',
                  backgroundColor: isEditing ? 'white' : '#f9fafb'
                }}
              />
            </div>
            
            <div>
              <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem', fontWeight: '500' }}>
                <Phone size={16} /> Phone
              </label>
              <input
                type="tel"
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                disabled={!isEditing}
                style={{
                  width: '100%',
                  padding: '0.75rem',
                  border: '1px solid #d1d5db',
                  borderRadius: '0.375rem',
                  backgroundColor: isEditing ? 'white' : '#f9fafb'
                }}
              />
            </div>
          </div>
          
          <div style={{ marginTop: '1rem' }}>
            <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem', fontWeight: '500' }}>
              <MapPin size={16} /> Address
            </label>
            <input
              type="text"
              value={formData.address}
              onChange={(e) => setFormData({ ...formData, address: e.target.value })}
              disabled={!isEditing}
              style={{
                width: '100%',
                padding: '0.75rem',
                border: '1px solid #d1d5db',
                borderRadius: '0.375rem',
                backgroundColor: isEditing ? 'white' : '#f9fafb'
              }}
            />
          </div>
          
          <div style={{ marginTop: '1rem' }}>
            <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem', fontWeight: '500' }}>
              <Globe size={16} /> Website
            </label>
            <input
              type="url"
              value={formData.website}
              onChange={(e) => setFormData({ ...formData, website: e.target.value })}
              disabled={!isEditing}
              style={{
                width: '100%',
                padding: '0.75rem',
                border: '1px solid #d1d5db',
                borderRadius: '0.375rem',
                backgroundColor: isEditing ? 'white' : '#f9fafb'
              }}
            />
          </div>
          
          <div style={{ marginTop: '1rem' }}>
            <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '500' }}>Description</label>
            <textarea
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              disabled={!isEditing}
              rows={4}
              style={{
                width: '100%',
                padding: '0.75rem',
                border: '1px solid #d1d5db',
                borderRadius: '0.375rem',
                backgroundColor: isEditing ? 'white' : '#f9fafb',
                resize: 'vertical'
              }}
            />
          </div>
          
          {isEditing && (
            <div style={{ marginTop: '1.5rem', display: 'flex', gap: '1rem', justifyContent: 'flex-end' }}>
              <button
                type="button"
                onClick={() => {
                  setIsEditing(false);
                  setFormData({
                    name: store?.name || '',
                    description: store?.description || '',
                    phone: store?.phone || '',
                    website: store?.website || '',
                    address: store?.address || '',
                    opening_hours: store?.opening_hours || {}
                  });
                }}
                style={{
                  padding: '0.5rem 1rem',
                  border: '1px solid #d1d5db',
                  borderRadius: '0.375rem',
                  backgroundColor: 'white',
                  cursor: 'pointer'
                }}
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isLoading}
                style={{
                  padding: '0.5rem 1rem',
                  backgroundColor: '#2563eb',
                  color: 'white',
                  borderRadius: '0.375rem',
                  border: 'none',
                  cursor: isLoading ? 'not-allowed' : 'pointer',
                  opacity: isLoading ? 0.5 : 1,
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.5rem'
                }}
              >
                <Save size={16} />
                {isLoading ? 'Saving...' : 'Save Changes'}
              </button>
            </div>
          )}
        </form>
      </div>
    </div>
  );
};

export default StoreProfile;