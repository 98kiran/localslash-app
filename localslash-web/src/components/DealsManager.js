import React, { useState } from 'react';
import { supabase } from '../services/supabase';
import { Plus, Edit, Trash2, Calendar, DollarSign, Percent, Tag } from 'lucide-react';

const DealsManager = ({ store, deals, onDealsUpdate }) => {
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
      const dealData = {
        store_id: store.id,
        title: formData.title,
        description: formData.description,
        deal_type: formData.deal_type,
        original_price: formData.original_price ? parseFloat(formData.original_price) : null,
        discount_price: formData.discount_price ? parseFloat(formData.discount_price) : null,
        discount_percentage: formData.discount_percentage ? parseInt(formData.discount_percentage) : null,
        category: formData.category,
        start_date: formData.start_date,
        end_date: formData.end_date,
        terms_conditions: formData.terms_conditions,
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
  
  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
        <h2 style={{ fontSize: '1.5rem', fontWeight: 'bold' }}>Manage Deals</h2>
        <button
          onClick={() => setShowForm(true)}
          style={{
            padding: '0.5rem 1rem',
            backgroundColor: '#2563eb',
            color: 'white',
            borderRadius: '0.375rem',
            border: 'none',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem'
          }}
        >
          <Plus size={20} />
          Create Deal
        </button>
      </div>
      
      {showForm && (
        <div style={{ backgroundColor: 'white', borderRadius: '0.5rem', padding: '2rem', marginBottom: '1.5rem', boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)' }}>
          <h3 style={{ fontSize: '1.125rem', fontWeight: '600', marginBottom: '1rem' }}>
            {editingDeal ? 'Edit Deal' : 'Create New Deal'}
          </h3>
          
          <form onSubmit={handleSubmit}>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
              <div>
                <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '500' }}>Deal Title</label>
                <input
                  type="text"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  required
                  placeholder="e.g., 20% Off All Items"
                  style={{
                    width: '100%',
                    padding: '0.75rem',
                    border: '1px solid #d1d5db',
                    borderRadius: '0.375rem'
                  }}
                />
              </div>
              
              <div>
                <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem', fontWeight: '500' }}>
                  <Tag size={16} /> Category
                </label>
                <select
                  value={formData.category}
                  onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                  style={{
                    width: '100%',
                    padding: '0.75rem',
                    border: '1px solid #d1d5db',
                    borderRadius: '0.375rem'
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
            
            <div style={{ marginTop: '1rem' }}>
              <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '500' }}>Description</label>
              <textarea
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                required
                rows={3}
                placeholder="Describe your deal..."
                style={{
                  width: '100%',
                  padding: '0.75rem',
                  border: '1px solid #d1d5db',
                  borderRadius: '0.375rem',
                  resize: 'vertical'
                }}
              />
            </div>
            
            <div style={{ marginTop: '1rem' }}>
              <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '500' }}>Deal Type</label>
              <div style={{ display: 'flex', gap: '1rem' }}>
                {['percentage', 'fixed_amount', 'bogo', 'other'].map((type) => (
                  <label key={type} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer' }}>
                    <input
                      type="radio"
                      value={type}
                      checked={formData.deal_type === type}
                      onChange={(e) => setFormData({ ...formData, deal_type: e.target.value })}
                    />
                    {type === 'percentage' && 'Percentage Off'}
                    {type === 'fixed_amount' && 'Fixed Amount'}
                    {type === 'bogo' && 'BOGO'}
                    {type === 'other' && 'Other'}
                  </label>
                ))}
              </div>
            </div>
            
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '1rem', marginTop: '1rem' }}>
              <div>
                <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem', fontWeight: '500' }}>
                  <DollarSign size={16} /> Original Price
                </label>
                <input
                  type="number"
                  step="0.01"
                  value={formData.original_price}
                  onChange={(e) => setFormData({ ...formData, original_price: e.target.value })}
                  placeholder="0.00"
                  style={{
                    width: '100%',
                    padding: '0.75rem',
                    border: '1px solid #d1d5db',
                    borderRadius: '0.375rem'
                  }}
                />
              </div>
              
              {formData.deal_type === 'percentage' ? (
                <div>
                  <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem', fontWeight: '500' }}>
                    <Percent size={16} /> Discount %
                  </label>
                  <input
                    type="number"
                    value={formData.discount_percentage}
                    onChange={(e) => setFormData({ ...formData, discount_percentage: e.target.value })}
                    placeholder="20"
                    min="1"
                    max="100"
                    style={{
                      width: '100%',
                      padding: '0.75rem',
                      border: '1px solid #d1d5db',
                      borderRadius: '0.375rem'
                    }}
                  />
                </div>
              ) : (
                <div>
                  <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem', fontWeight: '500' }}>
                    <DollarSign size={16} /> Discount Price
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    value={formData.discount_price}
                    onChange={(e) => setFormData({ ...formData, discount_price: e.target.value })}
                    placeholder="0.00"
                    style={{
                      width: '100%',
                      padding: '0.75rem',
                      border: '1px solid #d1d5db',
                      borderRadius: '0.375rem'
                    }}
                  />
                </div>
              )}
              
              <div>
                <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '500' }}>Max Redemptions</label>
                <input
                  type="number"
                  value={formData.max_redemptions}
                  onChange={(e) => setFormData({ ...formData, max_redemptions: e.target.value })}
                  placeholder="Unlimited"
                  min="1"
                  style={{
                    width: '100%',
                    padding: '0.75rem',
                    border: '1px solid #d1d5db',
                    borderRadius: '0.375rem'
                  }}
                />
              </div>
            </div>
            
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginTop: '1rem' }}>
              <div>
                <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem', fontWeight: '500' }}>
                  <Calendar size={16} /> Start Date
                </label>
                <input
                  type="date"
                  value={formData.start_date}
                  onChange={(e) => setFormData({ ...formData, start_date: e.target.value })}
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
                <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem', fontWeight: '500' }}>
                  <Calendar size={16} /> End Date
                </label>
                <input
                  type="date"
                  value={formData.end_date}
                  onChange={(e) => setFormData({ ...formData, end_date: e.target.value })}
                  required
                  min={formData.start_date}
                  style={{
                    width: '100%',
                    padding: '0.75rem',
                    border: '1px solid #d1d5db',
                    borderRadius: '0.375rem'
                  }}
                />
              </div>
            </div>
            
            <div style={{ marginTop: '1rem' }}>
              <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '500' }}>Terms & Conditions</label>
              <textarea
                value={formData.terms_conditions}
                onChange={(e) => setFormData({ ...formData, terms_conditions: e.target.value })}
                rows={2}
                placeholder="Any special conditions or restrictions..."
                style={{
                  width: '100%',
                  padding: '0.75rem',
                  border: '1px solid #d1d5db',
                  borderRadius: '0.375rem',
                  resize: 'vertical'
                }}
              />
            </div>
            
            <div style={{ marginTop: '1.5rem', display: 'flex', gap: '1rem', justifyContent: 'flex-end' }}>
              <button
                type="button"
                onClick={resetForm}
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
                  opacity: isLoading ? 0.5 : 1
                }}
              >
                {isLoading ? 'Saving...' : (editingDeal ? 'Update Deal' : 'Create Deal')}
              </button>
            </div>
          </form>
        </div>
      )}
      
      {/* Deals list */}
      <div style={{ backgroundColor: 'white', borderRadius: '0.5rem', padding: '1.5rem', boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)' }}>
        {deals.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '3rem' }}>
            <p style={{ color: '#6b7280', marginBottom: '1rem' }}>No deals yet</p>
            <p style={{ color: '#9ca3af', fontSize: '0.875rem' }}>Create your first deal to start attracting customers!</p>
          </div>
        ) : (
          <div style={{ display: 'grid', gap: '1rem' }}>
            {deals.map((deal) => (
              <div key={deal.id} style={{ border: '1px solid #e5e7eb', borderRadius: '0.5rem', padding: '1rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start' }}>
                  <div style={{ flex: 1 }}>
                    <h4 style={{ fontSize: '1.125rem', fontWeight: '600', marginBottom: '0.25rem' }}>{deal.title}</h4>
                    <p style={{ color: '#6b7280', fontSize: '0.875rem', marginBottom: '0.5rem' }}>{deal.description}</p>
                    <div style={{ display: 'flex', gap: '1rem', fontSize: '0.875rem', color: '#4b5563' }}>
                      <span>
                        {deal.discount_percentage ? `${deal.discount_percentage}% off` : `$${deal.discount_price}`}
                      </span>
                      <span>•</span>
                      <span>{new Date(deal.start_date).toLocaleDateString()} - {new Date(deal.end_date).toLocaleDateString()}</span>
                      <span>•</span>
                      <span>{deal.current_redemptions || 0} / {deal.max_redemptions || '∞'} redeemed</span>
                    </div>
                  </div>
                  
                  <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                    <button
                      onClick={() => toggleDealStatus(deal)}
                      style={{
                        padding: '0.25rem 0.75rem',
                        borderRadius: '9999px',
                        fontSize: '0.75rem',
                        backgroundColor: deal.is_active ? '#d1fae5' : '#fee2e2',
                        color: deal.is_active ? '#065f46' : '#991b1b',
                        border: 'none',
                        cursor: 'pointer'
                      }}
                    >
                      {deal.is_active ? 'Active' : 'Inactive'}
                    </button>
                    <button
                      onClick={() => handleEdit(deal)}
                      style={{
                        padding: '0.5rem',
                        backgroundColor: 'transparent',
                        border: 'none',
                        cursor: 'pointer',
                        color: '#6b7280'
                      }}
                    >
                      <Edit size={16} />
                    </button>
                    <button
                      onClick={() => handleDelete(deal.id)}
                      style={{
                        padding: '0.5rem',
                        backgroundColor: 'transparent',
                        border: 'none',
                        cursor: 'pointer',
                        color: '#ef4444'
                      }}
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default DealsManager;