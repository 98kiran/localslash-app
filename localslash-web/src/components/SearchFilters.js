import React, { useState } from 'react';
import { X, MapPin, Tag, TrendingUp } from 'lucide-react';

const SearchFilters = ({ filters, onFiltersChange, onClose }) => {
  const [localFilters, setLocalFilters] = useState(filters);

  const categories = [
    { value: 'all', label: 'All Categories' },
    { value: 'food', label: 'Food & Dining' },
    { value: 'retail', label: 'Retail' },
    { value: 'services', label: 'Services' },
    { value: 'entertainment', label: 'Entertainment' },
    { value: 'health', label: 'Health & Beauty' },
    { value: 'other', label: 'Other' }
  ];

  const radiusOptions = [
    { value: 1, label: '1 mile' },
    { value: 3, label: '3 miles' },
    { value: 5, label: '5 miles' },
    { value: 10, label: '10 miles' },
    { value: 25, label: '25 miles' }
  ];

  const sortOptions = [
    { value: 'distance', label: 'Distance', icon: MapPin },
    { value: 'discount', label: 'Discount %', icon: TrendingUp },
    { value: 'newest', label: 'Newest', icon: Tag }
  ];

  const handleApply = () => {
    onFiltersChange(localFilters);
    onClose();
  };

  const handleReset = () => {
    const defaultFilters = {
      category: 'all',
      radius: 5,
      sortBy: 'distance'
    };
    setLocalFilters(defaultFilters);
    onFiltersChange(defaultFilters);
    onClose();
  };

  return (
    <div style={{
      backgroundColor: 'white',
      borderTop: '1px solid #e5e7eb',
      padding: '1rem',
      animation: 'slideDown 0.2s ease-out'
    }}>
      <style>{`
        @keyframes slideDown {
          from {
            transform: translateY(-100%);
            opacity: 0;
          }
          to {
            transform: translateY(0);
            opacity: 1;
          }
        }
      `}</style>

      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
        <h3 style={{ fontSize: '1.125rem', fontWeight: '600' }}>Filters</h3>
        <button
          onClick={onClose}
          style={{
            padding: '0.25rem',
            backgroundColor: 'transparent',
            border: 'none',
            cursor: 'pointer'
          }}
        >
          <X size={20} />
        </button>
      </div>

      {/* Category Filter */}
      <div style={{ marginBottom: '1.5rem' }}>
        <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: '500', marginBottom: '0.5rem' }}>
          Category
        </label>
        <select
          value={localFilters.category}
          onChange={(e) => setLocalFilters({ ...localFilters, category: e.target.value })}
          style={{
            width: '100%',
            padding: '0.5rem',
            border: '1px solid #d1d5db',
            borderRadius: '0.375rem',
            fontSize: '1rem',
            backgroundColor: 'white'
          }}
        >
          {categories.map(cat => (
            <option key={cat.value} value={cat.value}>{cat.label}</option>
          ))}
        </select>
      </div>

      {/* Radius Filter */}
      <div style={{ marginBottom: '1.5rem' }}>
        <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: '500', marginBottom: '0.5rem' }}>
          Search Radius
        </label>
        <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
          {radiusOptions.map(option => (
            <button
              key={option.value}
              onClick={() => setLocalFilters({ ...localFilters, radius: option.value })}
              style={{
                padding: '0.5rem 1rem',
                border: '1px solid',
                borderColor: localFilters.radius === option.value ? '#2563eb' : '#d1d5db',
                backgroundColor: localFilters.radius === option.value ? '#dbeafe' : 'white',
                color: localFilters.radius === option.value ? '#1e40af' : '#374151',
                borderRadius: '9999px',
                cursor: 'pointer',
                fontSize: '0.875rem'
              }}
            >
              {option.label}
            </button>
          ))}
        </div>
      </div>

      {/* Sort By */}
      <div style={{ marginBottom: '1.5rem' }}>
        <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: '500', marginBottom: '0.5rem' }}>
          Sort By
        </label>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '0.5rem' }}>
          {sortOptions.map(option => {
            const Icon = option.icon;
            return (
              <button
                key={option.value}
                onClick={() => setLocalFilters({ ...localFilters, sortBy: option.value })}
                style={{
                  padding: '0.75rem',
                  border: '1px solid',
                  borderColor: localFilters.sortBy === option.value ? '#2563eb' : '#d1d5db',
                  backgroundColor: localFilters.sortBy === option.value ? '#dbeafe' : 'white',
                  color: localFilters.sortBy === option.value ? '#1e40af' : '#374151',
                  borderRadius: '0.375rem',
                  cursor: 'pointer',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  gap: '0.25rem'
                }}
              >
                <Icon size={20} />
                <span style={{ fontSize: '0.75rem' }}>{option.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Action Buttons */}
      <div style={{ display: 'flex', gap: '0.5rem' }}>
        <button
          onClick={handleReset}
          style={{
            flex: 1,
            padding: '0.75rem',
            border: '1px solid #d1d5db',
            backgroundColor: 'white',
            borderRadius: '0.375rem',
            cursor: 'pointer',
            fontWeight: '500'
          }}
        >
          Reset
        </button>
        <button
          onClick={handleApply}
          style={{
            flex: 1,
            padding: '0.75rem',
            backgroundColor: '#2563eb',
            color: 'white',
            border: 'none',
            borderRadius: '0.375rem',
            cursor: 'pointer',
            fontWeight: '500'
          }}
        >
          Apply Filters
        </button>
      </div>
    </div>
  );
};

export default SearchFilters;