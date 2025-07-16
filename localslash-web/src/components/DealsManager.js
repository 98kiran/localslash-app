import React, { useState } from 'react';
import { supabase } from '../services/supabase';
import { Plus, Edit, Trash2, Calendar, DollarSign, Percent, Tag, X, Save, AlertCircle, CheckCircle, Clock, BarChart } from 'lucide-react';
import { useTheme } from '../contexts/ThemeContext';

const DealsManager = ({ store, deals, onDealsUpdate }) => {
  const theme = useTheme();
  const [showForm, setShowForm] = useState(false);
  const [editingDeal, setEditingDeal] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    deal_type: 'percentage',
    original_price: '',
    discount_price: '',
    discount_percentage: '',
    category: '',
    start_date: new Date().toISOString().split('T')[0],
    end_date: '',
    terms_conditions: '',
    max_redemptions: ''
  });

  const getDiscountDisplay = (deal) => {
    if (deal.deal_type === 'percentage' && deal.discount_percentage) {
      return `${deal.discount_percentage}%`;
    } else if (deal.deal_type === 'fixed_amount' && deal.original_price && deal.discount_price) {
      const savings = deal.original_price - deal.discount_price;
      return `$${savings.toFixed(2)}`;
    } else if (deal.deal_type === 'bogo') {
      return 'BOGO';
    } else if (deal.deal_type === 'other') {
      if (deal.original_price && deal.discount_price) {
        const savings = deal.original_price - deal.discount_price;
        return `$${savings.toFixed(2)}`;
      }
      return 'Special';
    }
    return '-';
  };

  const getDealTypeColor = (dealType) => {
    switch (dealType) {
      case 'percentage':
        return theme.colors.info;
      case 'fixed_amount':
        return theme.colors.success;
      case 'bogo':
        return theme.colors.accent;
      case 'other':
        return theme.colors.warning;
      default:
        return theme.colors.textSecondary;
    }
  };

  const resetForm = () => {
    setFormData({
      title: '',
      description: '',
      deal_type: 'percentage',
      original_price: '',
      discount_price: '',
      discount_percentage: '',
      category: '',
      start_date: new Date().toISOString().split('T')[0],
      end_date: '',
      terms_conditions: '',
      max_redemptions: ''
    });
    setEditingDeal(null);
    setShowForm(false);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      let calculatedDiscountPrice = null;

      if (formData.deal_type === 'percentage' && formData.original_price && formData.discount_percentage) {
        calculatedDiscountPrice = formData.original_price * (1 - formData.discount_percentage / 100);
      } else if (formData.deal_type === 'fixed_amount' && formData.discount_price) {
        calculatedDiscountPrice = parseFloat(formData.discount_price);
      } else if (formData.deal_type === 'bogo' && formData.original_price) {
        calculatedDiscountPrice = formData.original_price / 2;
      } else if (formData.original_price) {
        calculatedDiscountPrice = formData.original_price;
      }

      const dealData = {
        store_id: store.id,
        title: formData.title,
        description: formData.description,
        deal_type: formData.deal_type,
        original_price: formData.original_price ? parseFloat(formData.original_price) : null,
        discount_price: calculatedDiscountPrice || 0,
        discount_percentage: formData.discount_percentage ? parseInt(formData.discount_percentage) : null,
        category: formData.category || null,
        start_date: formData.start_date,
        end_date: formData.end_date,
        terms_conditions: formData.terms_conditions || null,
        max_redemptions: formData.max_redemptions ? parseInt(formData.max_redemptions) : null,
        is_active: true
      };

      if (editingDeal) {
        const { error } = await supabase
          .from('deals')
          .update(dealData)
          .eq('id', editingDeal.id);

        if (error) throw error;
      } else {
        const { error } = await supabase
          .from('deals')
          .insert([dealData]);

        if (error) throw error;
      }

      await onDealsUpdate();
      resetForm();
    } catch (error) {
      console.error('Deal save error:', error);
      alert(`Error saving deal: ${error.message}`);
    } finally {
      setIsLoading(false);
    }
  };

  const handleEdit = (deal) => {
    setEditingDeal(deal);
    setFormData({
      title: deal.title,
      description: deal.description,
      deal_type: deal.deal_type,
      original_price: deal.original_price || '',
      discount_price: deal.discount_price || '',
      discount_percentage: deal.discount_percentage || '',
      category: deal.category || '',
      start_date: deal.start_date.split('T')[0],
      end_date: deal.end_date.split('T')[0],
      terms_conditions: deal.terms_conditions || '',
      max_redemptions: deal.max_redemptions || ''
    });
    setShowForm(true);
  };

  const handleDelete = async (dealId) => {
    if (!window.confirm('Are you sure you want to delete this deal?')) return;

    try {
      const { error } = await supabase
        .from('deals')
        .delete()
        .eq('id', dealId);

      if (error) throw error;
      await onDealsUpdate();
    } catch (error) {
      console.error('Delete error:', error);
    }
  };

  const toggleDealStatus = async (deal) => {
    try {
      const { error } = await supabase
        .from('deals')
        .update({ is_active: !deal.is_active })
        .eq('id', deal.id);

      if (error) throw error;
      await onDealsUpdate();
    } catch (error) {
      console.error('Toggle status error:', error);
    }
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

  return (
    <>
      <style>{`
        @keyframes slideIn {
          0% { transform: translateY(-20px); opacity: 0; }
          100% { transform: translateY(0); opacity: 1; }
        }
        
        @keyframes fadeIn {
          0% { opacity: 0; }
          100% { opacity: 1; }
        }
        
        @keyframes bounce {
          0%, 20%, 50%, 80%, 100% { transform: translateY(0); }
          40% { transform: translateY(-10px); }
          60% { transform: translateY(-5px); }
        }
        
        @media (max-width: ${theme.breakpoints.tablet}) {
          .deals-manager-grid {
            grid-template-columns: 1fr !important;
          }
          
          .deals-manager-form-grid {
            grid-template-columns: 1fr !important;
          }
          
          .deals-manager-header {
            flex-direction: column !important;
            gap: ${theme.spacing.lg} !important;
            align-items: stretch !important;
          }
          
          .deals-manager-deal-actions {
            flex-direction: column !important;
            gap: ${theme.spacing.sm} !important;
          }
        }
        
        @media (max-width: ${theme.breakpoints.mobile}) {
          .deals-manager-form {
            padding: ${theme.spacing.lg} !important;
          }
          
          .deals-manager-deal-card {
            padding: ${theme.spacing.md} !important;
          }
        }
      `}</style>
      
      <div style={{ 
        fontFamily: theme.typography.fontFamily.sans,
        animation: 'fadeIn 0.6s ease-out'
      }}>
        {/* Header */}
        <div 
          className="deals-manager-header"
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
              <Tag size={20} style={{ color: 'white' }} />
            </div>
            <div>
              <h2 style={{ 
                fontSize: theme.typography.fontSize['2xl'], 
                fontWeight: theme.typography.fontWeight.bold,
                color: theme.colors.textPrimary,
                marginBottom: theme.spacing.xs
              }}>
                Manage Deals
              </h2>
              <p style={{ 
                color: theme.colors.textSecondary,
                fontSize: theme.typography.fontSize.sm 
              }}>
                Create and manage your store's deals
              </p>
            </div>
          </div>
          
          <button
            onClick={() => setShowForm(true)}
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
            <Plus size={20} />
            Create Deal
          </button>
        </div>

        {/* Form */}
        {showForm && (
          <div 
            className="deals-manager-form"
            style={{ 
              background: theme.colors.cardBackground,
              borderRadius: theme.borderRadius.large,
              padding: theme.spacing.xl,
              marginBottom: theme.spacing.xl,
              boxShadow: theme.colors.shadowLarge,
              border: `1px solid ${theme.colors.border}`,
              position: 'relative',
              overflow: 'hidden',
              animation: 'slideIn 0.3s ease-out',
              backdropFilter: 'blur(20px)',
              WebkitBackdropFilter: 'blur(20px)'
            }}
          >
            {/* Form header gradient */}
            <div style={{
              position: 'absolute',
              top: 0,
              left: 0,
              right: 0,
              height: '4px',
              background: theme.gradients.primary,
            }} />
            
            <div style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              marginBottom: theme.spacing.xl
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
                  background: editingDeal ? theme.colors.warning : theme.colors.success,
                  borderRadius: theme.borderRadius.medium,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}>
                  {editingDeal ? <Edit size={16} color="white" /> : <Plus size={16} color="white" />}
                </div>
                {editingDeal ? 'Edit Deal' : 'Create New Deal'}
              </h3>
              
              <button
                onClick={resetForm}
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
              {/* Basic Info */}
              <div 
                className="deals-manager-form-grid"
                style={{ 
                  display: 'grid', 
                  gridTemplateColumns: '1fr 1fr', 
                  gap: theme.spacing.lg,
                  marginBottom: theme.spacing.lg
                }}
              >
                <div>
                  <label style={labelStyle}>
                    <Tag size={16} style={{ color: theme.colors.primary }} />
                    Deal Title*
                  </label>
                  <input
                    type="text"
                    value={formData.title}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                    required
                    placeholder="e.g., 20% Off All Items"
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
                    <BarChart size={16} style={{ color: theme.colors.primary }} />
                    Category
                  </label>
                  <select
                    value={formData.category}
                    onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                    style={inputStyle}
                    onFocus={(e) => {
                      e.target.style.borderColor = theme.colors.inputFocus;
                      e.target.style.boxShadow = `0 0 0 4px ${theme.colors.inputFocus}20`;
                    }}
                    onBlur={(e) => {
                      e.target.style.borderColor = theme.colors.inputBorder;
                      e.target.style.boxShadow = 'none';
                    }}
                  >
                    <option value="">Select Category</option>
                    <option value="food">Food & Dining</option>
                    <option value="retail">Retail</option>
                    <option value="services">Services</option>
                    <option value="entertainment">Entertainment</option>
                    <option value="health">Health & Beauty</option>
                    <option value="other">Other</option>
                  </select>
                </div>
              </div>

              {/* Description */}
              <div style={{ marginBottom: theme.spacing.lg }}>
                <label style={labelStyle}>
                  <AlertCircle size={16} style={{ color: theme.colors.primary }} />
                  Description*
                </label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  required
                  rows={3}
                  placeholder="Describe your deal..."
                  style={{
                    ...inputStyle,
                    minHeight: '100px',
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

              {/* Deal Type */}
              <div style={{ marginBottom: theme.spacing.lg }}>
                <label style={labelStyle}>
                  <CheckCircle size={16} style={{ color: theme.colors.primary }} />
                  Deal Type*
                </label>
                <div style={{ 
                  display: 'grid', 
                  gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', 
                  gap: theme.spacing.md 
                }}>
                  {[
                    { value: 'percentage', label: 'Percentage Off', icon: Percent },
                    { value: 'fixed_amount', label: 'Fixed Amount', icon: DollarSign },
                    { value: 'bogo', label: 'BOGO', icon: Tag },
                    { value: 'other', label: 'Other', icon: AlertCircle }
                  ].map((type) => (
                    <label 
                      key={type.value}
                      style={{ 
                        display: 'flex', 
                        alignItems: 'center', 
                        gap: theme.spacing.sm,
                        padding: theme.spacing.md,
                        background: formData.deal_type === type.value ? theme.colors.glass : 'transparent',
                        border: `2px solid ${formData.deal_type === type.value ? theme.colors.primary : theme.colors.border}`,
                        borderRadius: theme.borderRadius.medium,
                        cursor: 'pointer',
                        transition: theme.animations.normal,
                        fontWeight: theme.typography.fontWeight.medium,
                        color: formData.deal_type === type.value ? theme.colors.primary : theme.colors.textPrimary
                      }}
                      onMouseEnter={(e) => {
                        if (formData.deal_type !== type.value) {
                          e.currentTarget.style.background = theme.colors.glass;
                          e.currentTarget.style.borderColor = theme.colors.primary;
                        }
                      }}
                      onMouseLeave={(e) => {
                        if (formData.deal_type !== type.value) {
                          e.currentTarget.style.background = 'transparent';
                          e.currentTarget.style.borderColor = theme.colors.border;
                        }
                      }}
                    >
                      <input
                        type="radio"
                        value={type.value}
                        checked={formData.deal_type === type.value}
                        onChange={(e) => setFormData({ ...formData, deal_type: e.target.value })}
                        style={{ display: 'none' }}
                      />
                      <type.icon size={16} />
                      {type.label}
                    </label>
                  ))}
                </div>
              </div>

              {/* Pricing */}
              <div 
                className="deals-manager-form-grid"
                style={{ 
                  display: 'grid', 
                  gridTemplateColumns: '1fr 1fr 1fr', 
                  gap: theme.spacing.lg,
                  marginBottom: theme.spacing.lg
                }}
              >
                <div>
                  <label style={labelStyle}>
                    <DollarSign size={16} style={{ color: theme.colors.primary }} />
                    Original Price
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    value={formData.original_price}
                    onChange={(e) => setFormData({ ...formData, original_price: e.target.value })}
                    placeholder="0.00"
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

                {formData.deal_type === 'percentage' ? (
                  <div>
                    <label style={labelStyle}>
                      <Percent size={16} style={{ color: theme.colors.primary }} />
                      Discount %
                    </label>
                    <input
                      type="number"
                      value={formData.discount_percentage}
                      onChange={(e) => setFormData({ ...formData, discount_percentage: e.target.value })}
                      placeholder="20"
                      min="1"
                      max="100"
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
                ) : (
                  <div>
                    <label style={labelStyle}>
                      <DollarSign size={16} style={{ color: theme.colors.primary }} />
                      Discount Price
                    </label>
                    <input
                      type="number"
                      step="0.01"
                      value={formData.discount_price}
                      onChange={(e) => setFormData({ ...formData, discount_price: e.target.value })}
                      placeholder="0.00"
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
                )}

                <div>
                  <label style={labelStyle}>
                    <BarChart size={16} style={{ color: theme.colors.primary }} />
                    Max Redemptions
                  </label>
                  <input
                    type="number"
                    value={formData.max_redemptions}
                    onChange={(e) => setFormData({ ...formData, max_redemptions: e.target.value })}
                    placeholder="Unlimited"
                    min="1"
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

              {/* Dates */}
              <div 
                className="deals-manager-form-grid"
                style={{ 
                  display: 'grid', 
                  gridTemplateColumns: '1fr 1fr', 
                  gap: theme.spacing.lg,
                  marginBottom: theme.spacing.lg
                }}
              >
                <div>
                  <label style={labelStyle}>
                    <Calendar size={16} style={{ color: theme.colors.primary }} />
                    Start Date*
                  </label>
                  <input
                    type="date"
                    value={formData.start_date}
                    onChange={(e) => setFormData({ ...formData, start_date: e.target.value })}
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
                    <Calendar size={16} style={{ color: theme.colors.primary }} />
                    End Date*
                  </label>
                  <input
                    type="date"
                    value={formData.end_date}
                    onChange={(e) => setFormData({ ...formData, end_date: e.target.value })}
                    required
                    min={formData.start_date}
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

              {/* Terms */}
              <div style={{ marginBottom: theme.spacing.xl }}>
                <label style={labelStyle}>
                  <AlertCircle size={16} style={{ color: theme.colors.primary }} />
                  Terms & Conditions
                </label>
                <textarea
                  value={formData.terms_conditions}
                  onChange={(e) => setFormData({ ...formData, terms_conditions: e.target.value })}
                  rows={2}
                  placeholder="Any special conditions or restrictions..."
                  style={{
                    ...inputStyle,
                    minHeight: '80px',
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

              {/* Form Actions */}
              <div style={{ 
                display: 'flex', 
                gap: theme.spacing.md, 
                justifyContent: 'flex-end',
                paddingTop: theme.spacing.lg,
                borderTop: `1px solid ${theme.colors.border}`
              }}>
                <button
                  type="button"
                  onClick={resetForm}
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
                      {editingDeal ? 'Update Deal' : 'Create Deal'}
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        )}

        {/* Deals List */}
        <div style={{ 
          background: theme.colors.cardBackground,
          borderRadius: theme.borderRadius.large,
          padding: theme.spacing.xl,
          boxShadow: theme.colors.shadowMedium,
          border: `1px solid ${theme.colors.border}`,
          backdropFilter: 'blur(20px)',
          WebkitBackdropFilter: 'blur(20px)'
        }}>
          <div style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            marginBottom: theme.spacing.lg,
            paddingBottom: theme.spacing.md,
            borderBottom: `1px solid ${theme.colors.border}`
          }}>
            <h3 style={{ 
              fontSize: theme.typography.fontSize.lg,
              fontWeight: theme.typography.fontWeight.semibold,
              color: theme.colors.textPrimary,
              display: 'flex',
              alignItems: 'center',
              gap: theme.spacing.sm
            }}>
              <div style={{
                width: '1.5rem',
                height: '1.5rem',
                background: theme.colors.accent,
                borderRadius: theme.borderRadius.small,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}>
                <BarChart size={12} style={{ color: 'white' }} />
              </div>
              Your Deals
            </h3>
            
            <div style={{
              padding: `${theme.spacing.xs} ${theme.spacing.sm}`,
              background: theme.colors.glass,
              borderRadius: theme.borderRadius.medium,
              border: `1px solid ${theme.colors.border}`,
              fontSize: theme.typography.fontSize.xs,
              color: theme.colors.textSecondary
            }}>
              {deals.length} deals total
            </div>
          </div>

          {deals.length === 0 ? (
            <div style={{ 
              textAlign: 'center', 
              padding: `${theme.spacing.xxxl} ${theme.spacing.xl}`,
              color: theme.colors.textSecondary
            }}>
              <div style={{
                width: '4rem',
                height: '4rem',
                background: theme.colors.glass,
                borderRadius: '50%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                margin: `0 auto ${theme.spacing.lg}`,
                border: `2px solid ${theme.colors.border}`
              }}>
                <Tag size={24} style={{ color: theme.colors.textSecondary }} />
              </div>
              <p style={{ 
                fontSize: theme.typography.fontSize.base,
                fontWeight: theme.typography.fontWeight.medium,
                marginBottom: theme.spacing.sm,
                color: theme.colors.textPrimary
              }}>
                No deals yet
              </p>
              <p style={{ 
                fontSize: theme.typography.fontSize.sm,
                color: theme.colors.textMuted
              }}>
                Create your first deal to start attracting customers!
              </p>
            </div>
          ) : (
            <div 
              className="deals-manager-grid"
              style={{ 
                display: 'grid', 
                gridTemplateColumns: 'repeat(auto-fill, minmax(350px, 1fr))',
                gap: theme.spacing.lg
              }}
            >
              {deals.map((deal, index) => (
                <div 
                  key={deal.id}
                  className="deals-manager-deal-card"
                  style={{ 
                    background: theme.colors.glass,
                    border: `1px solid ${theme.colors.border}`,
                    borderRadius: theme.borderRadius.medium,
                    padding: theme.spacing.lg,
                    position: 'relative',
                    transition: theme.animations.normal,
                    animation: `fadeIn 0.4s ease-out ${index * 0.1}s both`
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.transform = 'translateY(-2px)';
                    e.currentTarget.style.boxShadow = theme.colors.shadowMedium;
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.transform = 'translateY(0)';
                    e.currentTarget.style.boxShadow = 'none';
                  }}
                >
                  {/* Deal Type Badge */}
                  <div style={{
                    position: 'absolute',
                    top: theme.spacing.md,
                    right: theme.spacing.md,
                    padding: `${theme.spacing.xs} ${theme.spacing.sm}`,
                    background: getDealTypeColor(deal.deal_type),
                    color: 'white',
                    borderRadius: theme.borderRadius.small,
                    fontSize: theme.typography.fontSize.xs,
                    fontWeight: theme.typography.fontWeight.semibold,
                    textTransform: 'uppercase'
                  }}>
                    {deal.deal_type}
                  </div>

                  <div style={{ paddingRight: theme.spacing.xl }}>
                    <h4 style={{ 
                      fontSize: theme.typography.fontSize.lg,
                      fontWeight: theme.typography.fontWeight.semibold,
                      marginBottom: theme.spacing.sm,
                      color: theme.colors.textPrimary,
                      lineHeight: '1.3'
                    }}>
                      {deal.title}
                    </h4>
                    
                    <p style={{ 
                      color: theme.colors.textSecondary,
                      fontSize: theme.typography.fontSize.sm,
                      marginBottom: theme.spacing.md,
                      lineHeight: '1.4'
                    }}>
                      {deal.description}
                    </p>

                    <div style={{
                      display: 'flex',
                      flexWrap: 'wrap',
                      gap: theme.spacing.sm,
                      marginBottom: theme.spacing.md,
                      fontSize: theme.typography.fontSize.xs,
                      color: theme.colors.textSecondary
                    }}>
                      <div style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: theme.spacing.xs,
                        background: theme.colors.glass,
                        padding: `${theme.spacing.xs} ${theme.spacing.sm}`,
                        borderRadius: theme.borderRadius.small,
                        border: `1px solid ${theme.colors.border}`
                      }}>
                        <DollarSign size={12} />
                        <span>{getDiscountDisplay(deal)}</span>
                      </div>
                      
                      <div style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: theme.spacing.xs,
                        background: theme.colors.glass,
                        padding: `${theme.spacing.xs} ${theme.spacing.sm}`,
                        borderRadius: theme.borderRadius.small,
                        border: `1px solid ${theme.colors.border}`
                      }}>
                        <Calendar size={12} />
                        <span>{new Date(deal.start_date).toLocaleDateString()} - {new Date(deal.end_date).toLocaleDateString()}</span>
                      </div>
                      
                      <div style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: theme.spacing.xs,
                        background: theme.colors.glass,
                        padding: `${theme.spacing.xs} ${theme.spacing.sm}`,
                        borderRadius: theme.borderRadius.small,
                        border: `1px solid ${theme.colors.border}`
                      }}>
                        <BarChart size={12} />
                        <span>{deal.current_redemptions || 0} / {deal.max_redemptions || '∞'}</span>
                      </div>
                    </div>

                    <div 
                      className="deals-manager-deal-actions"
                      style={{ 
                        display: 'flex', 
                        gap: theme.spacing.sm, 
                        alignItems: 'center',
                        paddingTop: theme.spacing.md,
                        borderTop: `1px solid ${theme.colors.border}`
                      }}
                    >
                      <button
                        onClick={() => toggleDealStatus(deal)}
                        style={{
                          padding: `${theme.spacing.xs} ${theme.spacing.md}`,
                          borderRadius: theme.borderRadius.pill,
                          fontSize: theme.typography.fontSize.xs,
                          fontWeight: theme.typography.fontWeight.medium,
                          background: deal.is_active ? `${theme.colors.success}20` : `${theme.colors.danger}20`,
                          color: deal.is_active ? theme.colors.success : theme.colors.danger,
                          border: `1px solid ${deal.is_active ? theme.colors.success : theme.colors.danger}30`,
                          cursor: 'pointer',
                          transition: theme.animations.normal,
                          display: 'flex',
                          alignItems: 'center',
                          gap: theme.spacing.xs
                        }}
                      >
                        {deal.is_active ? <CheckCircle size={12} /> : <Clock size={12} />}
                        {deal.is_active ? 'Active' : 'Inactive'}
                      </button>
                      
                      <div style={{ marginLeft: 'auto', display: 'flex', gap: theme.spacing.xs }}>
                        <button
                          onClick={() => handleEdit(deal)}
                          style={{
                            padding: theme.spacing.sm,
                            background: theme.colors.glass,
                            border: `1px solid ${theme.colors.border}`,
                            borderRadius: theme.borderRadius.medium,
                            cursor: 'pointer',
                            color: theme.colors.textSecondary,
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
                          <Edit size={16} />
                        </button>
                        
                        <button
                          onClick={() => handleDelete(deal.id)}
                          style={{
                            padding: theme.spacing.sm,
                            background: theme.colors.glass,
                            border: `1px solid ${theme.colors.border}`,
                            borderRadius: theme.borderRadius.medium,
                            cursor: 'pointer',
                            color: theme.colors.textSecondary,
                            transition: theme.animations.normal
                          }}
                          onMouseEnter={(e) => {
                            e.currentTarget.style.background = `${theme.colors.danger}20`;
                            e.currentTarget.style.color = theme.colors.danger;
                            e.currentTarget.style.borderColor = theme.colors.danger;
                          }}
                          onMouseLeave={(e) => {
                            e.currentTarget.style.background = theme.colors.glass;
                            e.currentTarget.style.color = theme.colors.textSecondary;
                            e.currentTarget.style.borderColor = theme.colors.border;
                          }}
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </>
  );
};

export default DealsManager;