import React, { useState } from 'react';
import { supabase } from '../services/supabase';
import { Save, Camera, MapPin, Phone, Globe, Clock, User, Edit, X, Building, AlertCircle } from 'lucide-react';
import { useTheme } from '../contexts/ThemeContext';

const StoreProfile = ({ store, onUpdate }) => {
  const theme = useTheme();
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
      alert('Error updating store profile. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };
  
  const handleCancel = () => {
    setFormData({
      name: store?.name || '',
      description: store?.description || '',
      phone: store?.phone || '',
      website: store?.website || '',
      address: store?.address || '',
      opening_hours: store?.opening_hours || {}
    });
    setIsEditing(false);
  };

  const inputStyle = {
    width: '100%',
    padding: `${theme.spacing.md} ${theme.spacing.lg}`,
    background: theme.colors.input,
    border: `2px solid ${theme.colors.inputBorder}`,
    borderRadius: theme.borderRadius.medium,
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

  const infoItemStyle = {
    display: 'flex',
    alignItems: 'center',
    gap: theme.spacing.md,
    padding: theme.spacing.lg,
    background: theme.colors.glass,
    borderRadius: theme.borderRadius.medium,
    border: `1px solid ${theme.colors.border}`,
    marginBottom: theme.spacing.md,
  };

  return (
    <>
      <style>{`
        @keyframes fadeIn {
          0% { opacity: 0; transform: translateY(20px); }
          100% { opacity: 1; transform: translateY(0); }
        }
        
        @keyframes slideIn {
          0% { transform: translateX(-10px); opacity: 0; }
          100% { transform: translateX(0); opacity: 1; }
        }
        
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
        
        @media (max-width: ${theme.breakpoints.tablet}) {
          .store-profile-form-grid {
            grid-template-columns: 1fr !important;
          }
          
          .store-profile-header {
            flex-direction: column !important;
            gap: ${theme.spacing.lg} !important;
            align-items: stretch !important;
          }
        }
        
        @media (max-width: ${theme.breakpoints.mobile}) {
          .store-profile-container {
            padding: ${theme.spacing.lg} !important;
          }
        }
      `}</style>
      
      <div style={{ 
        fontFamily: theme.typography.fontFamily.sans,
        animation: 'fadeIn 0.6s ease-out'
      }}>
        {/* Header */}
        <div 
          className="store-profile-header"
          style={{ 
            display: 'flex', 
            justifyContent: 'space-between', 
            alignItems: 'center', 
            marginBottom: theme.spacing.xl 
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: theme.spacing.md }}>
            <div style={{
              width: '3rem',
              height: '3rem',
              background: theme.gradients.primary,
              borderRadius: theme.borderRadius.medium,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              boxShadow: `0 10px 25px ${theme.colors.primary}30`
            }}>
              <Building size={20} style={{ color: 'white' }} />
            </div>
            <div>
              <h2 style={{ 
                fontSize: theme.typography.fontSize['2xl'], 
                fontWeight: theme.typography.fontWeight.bold,
                color: theme.colors.textPrimary,
                marginBottom: theme.spacing.xs
              }}>
                Store Profile
              </h2>
              <p style={{ 
                color: theme.colors.textSecondary,
                fontSize: theme.typography.fontSize.sm 
              }}>
                Manage your store information and settings
              </p>
            </div>
          </div>
          
          {!isEditing && (
            <button
              onClick={() => setIsEditing(true)}
              style={{
                padding: `${theme.spacing.md} ${theme.spacing.lg}`,
                background: theme.gradients.primary,
                color: 'white',
                borderRadius: theme.borderRadius.medium,
                border: 'none',
                cursor: 'pointer',
                fontSize: theme.typography.fontSize.sm,
                fontWeight: theme.typography.fontWeight.semibold,
                display: 'flex',
                alignItems: 'center',
                gap: theme.spacing.sm,
                transition: theme.animations.normal,
                boxShadow: `0 8px 20px ${theme.colors.primary}30`
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = 'translateY(-2px)';
                e.currentTarget.style.boxShadow = `0 12px 30px ${theme.colors.primary}40`;
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = 'translateY(0)';
                e.currentTarget.style.boxShadow = `0 8px 20px ${theme.colors.primary}30`;
              }}
            >
              <Edit size={16} />
              Edit Profile
            </button>
          )}
        </div>
        
        {/* Profile Content */}
        <div style={{ 
          background: theme.colors.cardBackground,
          borderRadius: theme.borderRadius.large,
          padding: theme.spacing.xl,
          boxShadow: theme.colors.shadowMedium,
          border: `1px solid ${theme.colors.border}`,
          backdropFilter: 'blur(20px)',
          WebkitBackdropFilter: 'blur(20px)',
          position: 'relative',
          overflow: 'hidden'
        }}>
          {/* Header gradient */}
          <div style={{
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            height: '4px',
            background: theme.gradients.primary,
          }} />
          
          {isEditing ? (
            // Edit Form
            <div style={{ animation: 'slideIn 0.3s ease-out' }}>
              <div style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                marginBottom: theme.spacing.xl,
                paddingBottom: theme.spacing.md,
                borderBottom: `1px solid ${theme.colors.border}`
              }}>
                <h3 style={{ 
                  fontSize: theme.typography.fontSize.xl,
                  fontWeight: theme.typography.fontWeight.semibold,
                  color: theme.colors.textPrimary,
                  display: 'flex',
                  alignItems: 'center',
                  gap: theme.spacing.sm
                }}>
                  <div style={{
                    width: '2rem',
                    height: '2rem',
                    background: theme.colors.warning,
                    borderRadius: theme.borderRadius.medium,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center'
                  }}>
                    <Edit size={16} color="white" />
                  </div>
                  Edit Store Information
                </h3>
                
                <button
                  onClick={handleCancel}
                  style={{
                    padding: theme.spacing.sm,
                    background: theme.colors.glass,
                    border: `1px solid ${theme.colors.border}`,
                    borderRadius: theme.borderRadius.medium,
                    color: theme.colors.textSecondary,
                    cursor: 'pointer',
                    transition: theme.animations.normal
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.background = theme.colors.glassHover;
                    e.currentTarget.style.color = theme.colors.textPrimary;
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.background = theme.colors.glass;
                    e.currentTarget.style.color = theme.colors.textSecondary;
                  }}
                >
                  <X size={20} />
                </button>
              </div>

              <form onSubmit={handleSubmit}>
                <div 
                  className="store-profile-form-grid"
                  style={{
                    display: 'grid',
                    gridTemplateColumns: '1fr 1fr',
                    gap: theme.spacing.lg,
                    marginBottom: theme.spacing.lg
                  }}
                >
                  <div>
                    <label style={labelStyle}>
                      <Building size={16} style={{ color: theme.colors.primary }} />
                      Store Name*
                    </label>
                    <input
                      type="text"
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      required
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
                      <Phone size={16} style={{ color: theme.colors.primary }} />
                      Phone Number
                    </label>
                    <input
                      type="tel"
                      value={formData.phone}
                      onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
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
                
                <div style={{ marginBottom: theme.spacing.lg }}>
                  <label style={labelStyle}>
                    <Globe size={16} style={{ color: theme.colors.primary }} />
                    Website
                  </label>
                  <input
                    type="url"
                    value={formData.website}
                    onChange={(e) => setFormData({ ...formData, website: e.target.value })}
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
                
                <div style={{ marginBottom: theme.spacing.lg }}>
                  <label style={labelStyle}>
                    <MapPin size={16} style={{ color: theme.colors.primary }} />
                    Address*
                  </label>
                  <input
                    type="text"
                    value={formData.address}
                    onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                    required
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
                
                <div style={{ marginBottom: theme.spacing.xl }}>
                  <label style={labelStyle}>
                    <AlertCircle size={16} style={{ color: theme.colors.primary }} />
                    Description
                  </label>
                  <textarea
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    rows={4}
                    style={{
                      ...inputStyle,
                      minHeight: '120px',
                      resize: 'vertical'
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
                
                <div style={{ 
                  display: 'flex', 
                  gap: theme.spacing.md, 
                  justifyContent: 'flex-end',
                  paddingTop: theme.spacing.lg,
                  borderTop: `1px solid ${theme.colors.border}`
                }}>
                  <button
                    type="button"
                    onClick={handleCancel}
                    style={{
                      padding: `${theme.spacing.md} ${theme.spacing.lg}`,
                      border: `2px solid ${theme.colors.border}`,
                      borderRadius: theme.borderRadius.medium,
                      background: theme.colors.glass,
                      color: theme.colors.textPrimary,
                      cursor: 'pointer',
                      fontSize: theme.typography.fontSize.sm,
                      fontWeight: theme.typography.fontWeight.medium,
                      transition: theme.animations.normal,
                      backdropFilter: 'blur(10px)',
                      WebkitBackdropFilter: 'blur(10px)'
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.background = theme.colors.glassHover;
                      e.currentTarget.style.borderColor = theme.colors.primary;
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.background = theme.colors.glass;
                      e.currentTarget.style.borderColor = theme.colors.border;
                    }}
                  >
                    Cancel
                  </button>
                  
                  <button
                    type="submit"
                    disabled={isLoading}
                    style={{
                      padding: `${theme.spacing.md} ${theme.spacing.lg}`,
                      background: theme.gradients.primary,
                      color: 'white',
                      borderRadius: theme.borderRadius.medium,
                      border: 'none',
                      cursor: isLoading ? 'not-allowed' : 'pointer',
                      fontSize: theme.typography.fontSize.sm,
                      fontWeight: theme.typography.fontWeight.semibold,
                      display: 'flex',
                      alignItems: 'center',
                      gap: theme.spacing.sm,
                      transition: theme.animations.normal,
                      opacity: isLoading ? 0.6 : 1,
                      boxShadow: `0 8px 20px ${theme.colors.primary}30`
                    }}
                    onMouseEnter={(e) => {
                      if (!isLoading) {
                        e.currentTarget.style.transform = 'translateY(-2px)';
                        e.currentTarget.style.boxShadow = `0 12px 30px ${theme.colors.primary}40`;
                      }
                    }}
                    onMouseLeave={(e) => {
                      if (!isLoading) {
                        e.currentTarget.style.transform = 'translateY(0)';
                        e.currentTarget.style.boxShadow = `0 8px 20px ${theme.colors.primary}30`;
                      }
                    }}
                  >
                    {isLoading ? (
                      <>
                        <div style={{
                          width: '16px',
                          height: '16px',
                          border: '2px solid rgba(255, 255, 255, 0.3)',
                          borderTopColor: 'white',
                          borderRadius: '50%',
                          animation: 'spin 1s linear infinite'
                        }} />
                        Saving...
                      </>
                    ) : (
                      <>
                        <Save size={16} />
                        Save Changes
                      </>
                    )}
                  </button>
                </div>
              </form>
            </div>
          ) : (
            // View Mode
            <div style={{ animation: 'fadeIn 0.3s ease-out' }}>
              <div style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                marginBottom: theme.spacing.xl,
                paddingBottom: theme.spacing.md,
                borderBottom: `1px solid ${theme.colors.border}`
              }}>
                <h3 style={{ 
                  fontSize: theme.typography.fontSize.xl,
                  fontWeight: theme.typography.fontWeight.semibold,
                  color: theme.colors.textPrimary,
                  display: 'flex',
                  alignItems: 'center',
                  gap: theme.spacing.sm
                }}>
                  <div style={{
                    width: '2rem',
                    height: '2rem',
                    background: theme.colors.info,
                    borderRadius: theme.borderRadius.medium,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center'
                  }}>
                    <User size={16} color="white" />
                  </div>
                  Store Information
                </h3>
              </div>
              
              <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
                gap: theme.spacing.lg
              }}>
                {/* Store Name */}
                <div style={infoItemStyle}>
                  <div style={{
                    width: '2.5rem',
                    height: '2.5rem',
                    background: `${theme.colors.primary}20`,
                    borderRadius: theme.borderRadius.medium,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center'
                  }}>
                    <Building size={20} style={{ color: theme.colors.primary }} />
                  </div>
                  <div style={{ flex: 1 }}>
                    <p style={{
                      fontSize: theme.typography.fontSize.sm,
                      color: theme.colors.textSecondary,
                      marginBottom: theme.spacing.xs,
                      fontWeight: theme.typography.fontWeight.medium
                    }}>
                      Store Name
                    </p>
                    <p style={{
                      fontSize: theme.typography.fontSize.base,
                      color: theme.colors.textPrimary,
                      fontWeight: theme.typography.fontWeight.semibold
                    }}>
                      {store?.name || 'Not set'}
                    </p>
                  </div>
                </div>
                
                {/* Phone */}
                <div style={infoItemStyle}>
                  <div style={{
                    width: '2.5rem',
                    height: '2.5rem',
                    background: `${theme.colors.success}20`,
                    borderRadius: theme.borderRadius.medium,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center'
                  }}>
                    <Phone size={20} style={{ color: theme.colors.success }} />
                  </div>
                  <div style={{ flex: 1 }}>
                    <p style={{
                      fontSize: theme.typography.fontSize.sm,
                      color: theme.colors.textSecondary,
                      marginBottom: theme.spacing.xs,
                      fontWeight: theme.typography.fontWeight.medium
                    }}>
                      Phone Number
                    </p>
                    <p style={{
                      fontSize: theme.typography.fontSize.base,
                      color: theme.colors.textPrimary,
                      fontWeight: theme.typography.fontWeight.semibold
                    }}>
                      {store?.phone || 'Not set'}
                    </p>
                  </div>
                </div>
                
                {/* Website */}
                <div style={infoItemStyle}>
                  <div style={{
                    width: '2.5rem',
                    height: '2.5rem',
                    background: `${theme.colors.accent}20`,
                    borderRadius: theme.borderRadius.medium,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center'
                  }}>
                    <Globe size={20} style={{ color: theme.colors.accent }} />
                  </div>
                  <div style={{ flex: 1 }}>
                    <p style={{
                      fontSize: theme.typography.fontSize.sm,
                      color: theme.colors.textSecondary,
                      marginBottom: theme.spacing.xs,
                      fontWeight: theme.typography.fontWeight.medium
                    }}>
                      Website
                    </p>
                    <p style={{
                      fontSize: theme.typography.fontSize.base,
                      color: store?.website ? theme.colors.accent : theme.colors.textPrimary,
                      fontWeight: theme.typography.fontWeight.semibold,
                      textDecoration: store?.website ? 'underline' : 'none',
                      cursor: store?.website ? 'pointer' : 'default'
                    }}
                    onClick={() => store?.website && window.open(store.website, '_blank')}
                    >
                      {store?.website || 'Not set'}
                    </p>
                  </div>
                </div>
                
                {/* Address */}
                <div style={infoItemStyle}>
                  <div style={{
                    width: '2.5rem',
                    height: '2.5rem',
                    background: `${theme.colors.warning}20`,
                    borderRadius: theme.borderRadius.medium,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center'
                  }}>
                    <MapPin size={20} style={{ color: theme.colors.warning }} />
                  </div>
                  <div style={{ flex: 1 }}>
                    <p style={{
                      fontSize: theme.typography.fontSize.sm,
                      color: theme.colors.textSecondary,
                      marginBottom: theme.spacing.xs,
                      fontWeight: theme.typography.fontWeight.medium
                    }}>
                      Address
                    </p>
                    <p style={{
                      fontSize: theme.typography.fontSize.base,
                      color: theme.colors.textPrimary,
                      fontWeight: theme.typography.fontWeight.semibold,
                      lineHeight: '1.4'
                    }}>
                      {store?.address || 'Not set'}
                    </p>
                  </div>
                </div>
              </div>
              
              {/* Description */}
              {store?.description && (
                <div style={{
                  marginTop: theme.spacing.lg,
                  padding: theme.spacing.lg,
                  background: theme.colors.glass,
                  borderRadius: theme.borderRadius.medium,
                  border: `1px solid ${theme.colors.border}`
                }}>
                  <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: theme.spacing.sm,
                    marginBottom: theme.spacing.md
                  }}>
                    <div style={{
                      width: '1.5rem',
                      height: '1.5rem',
                      background: theme.colors.info,
                      borderRadius: theme.borderRadius.small,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center'
                    }}>
                      <AlertCircle size={12} style={{ color: 'white' }} />
                    </div>
                    <span style={{
                      fontSize: theme.typography.fontSize.sm,
                      fontWeight: theme.typography.fontWeight.semibold,
                      color: theme.colors.textPrimary
                    }}>
                      Store Description
                    </span>
                  </div>
                  <p style={{
                    fontSize: theme.typography.fontSize.base,
                    color: theme.colors.textSecondary,
                    lineHeight: '1.6'
                  }}>
                    {store.description}
                  </p>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </>
  );
};

export default StoreProfile;