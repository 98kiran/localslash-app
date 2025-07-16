import React, { useState, useRef, useEffect } from 'react';
import { Store, ChevronDown, Plus, Check } from 'lucide-react';
import { useTheme } from '../contexts/ThemeContext';

const StoreSelector = ({ 
  stores = [], 
  selectedStore, 
  onStoreSelect, 
  onCreateStore, 
  isLoading = false 
}) => {
  const theme = useTheme();
  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const dropdownRef = useRef(null);
  
  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };
    
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);
  
  const filteredStores = stores.filter(store => 
    store.name.toLowerCase().includes(searchTerm.toLowerCase())
  );
  
  const containerStyle = {
    position: 'relative',
    minWidth: '200px',
    maxWidth: '300px',
  };
  
  const triggerStyle = {
    width: '100%',
    padding: `${theme.spacing.sm} ${theme.spacing.md}`,
    background: theme.colors.cardBackground,
    border: `1px solid ${theme.colors.border}`,
    borderRadius: theme.borderRadius.medium,
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    gap: theme.spacing.sm,
    transition: theme.animations.normal,
    fontSize: theme.typography.fontSize.sm,
    fontWeight: theme.typography.fontWeight.medium,
    color: theme.colors.textPrimary,
    backdropFilter: 'blur(10px)',
    WebkitBackdropFilter: 'blur(10px)',
    boxShadow: theme.colors.shadow,
  };
  
  const dropdownStyle = {
    position: 'absolute',
    top: '100%',
    left: 0,
    right: 0,
    marginTop: theme.spacing.xs,
    background: theme.colors.cardBackground,
    border: `1px solid ${theme.colors.border}`,
    borderRadius: theme.borderRadius.medium,
    boxShadow: theme.colors.shadowLarge,
    zIndex: theme.zIndex.modal, // Changed from dropdown to modal to be above sticky nav
    maxHeight: '300px',
    overflow: 'hidden',
    backdropFilter: 'blur(20px)',
    WebkitBackdropFilter: 'blur(20px)',
  };
  
  const searchInputStyle = {
    width: '100%',
    padding: theme.spacing.sm,
    border: 'none',
    borderBottom: `1px solid ${theme.colors.border}`,
    background: 'transparent',
    fontSize: theme.typography.fontSize.sm,
    color: theme.colors.textPrimary,
    outline: 'none',
    '::placeholder': {
      color: theme.colors.textMuted,
    },
  };
  
  const storeListStyle = {
    maxHeight: '200px',
    overflowY: 'auto',
    padding: theme.spacing.xs,
  };
  
  const storeItemStyle = {
    padding: theme.spacing.sm,
    display: 'flex',
    alignItems: 'center',
    gap: theme.spacing.sm,
    cursor: 'pointer',
    borderRadius: theme.borderRadius.small,
    transition: theme.animations.fast,
    fontSize: theme.typography.fontSize.sm,
    color: theme.colors.textPrimary,
  };
  
  const createButtonStyle = {
    padding: theme.spacing.sm,
    display: 'flex',
    alignItems: 'center',
    gap: theme.spacing.sm,
    cursor: 'pointer',
    borderRadius: theme.borderRadius.small,
    transition: theme.animations.fast,
    fontSize: theme.typography.fontSize.sm,
    color: theme.colors.primary,
    fontWeight: theme.typography.fontWeight.medium,
    borderTop: `1px solid ${theme.colors.border}`,
    margin: theme.spacing.xs,
    marginBottom: 0,
  };
  
  const handleTriggerClick = () => {
    setIsOpen(!isOpen);
    setSearchTerm('');
  };
  
  const handleStoreSelect = (store) => {
    onStoreSelect(store);
    setIsOpen(false);
    setSearchTerm('');
  };
  
  const handleCreateStore = () => {
    onCreateStore();
    setIsOpen(false);
  };
  
  return (
    <div style={containerStyle} ref={dropdownRef}>
      {/* Trigger Button */}
      <button
        style={triggerStyle}
        onClick={handleTriggerClick}
        onMouseEnter={(e) => {
          e.currentTarget.style.borderColor = theme.colors.primary;
          e.currentTarget.style.boxShadow = theme.colors.shadowHover;
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.borderColor = theme.colors.border;
          e.currentTarget.style.boxShadow = theme.colors.shadow;
        }}
        disabled={isLoading}
      >
        <div style={{
          width: '1.5rem',
          height: '1.5rem',
          borderRadius: theme.borderRadius.small,
          background: theme.gradients.primary,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          flexShrink: 0,
        }}>
          <Store size={16} color="white" />
        </div>
        
        <div style={{ flex: 1, textAlign: 'left' }}>
          <div style={{ 
            fontSize: theme.typography.fontSize.xs,
            color: theme.colors.textSecondary,
            marginBottom: '1px',
          }}>
            Current Store
          </div>
          <div style={{ 
            fontSize: theme.typography.fontSize.sm,
            fontWeight: theme.typography.fontWeight.medium,
            color: theme.colors.textPrimary,
            whiteSpace: 'nowrap',
            overflow: 'hidden',
            textOverflow: 'ellipsis',
          }}>
            {selectedStore ? selectedStore.name : 'Select Store'}
          </div>
        </div>
        
        <ChevronDown 
          size={16} 
          style={{ 
            color: theme.colors.textSecondary,
            transition: theme.animations.fast,
            transform: isOpen ? 'rotate(180deg)' : 'rotate(0deg)',
          }} 
        />
      </button>
      
      {/* Dropdown Menu */}
      {isOpen && (
        <div style={dropdownStyle}>
          {/* Search Input */}
          <input
            type="text"
            placeholder="Search stores..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            style={searchInputStyle}
            autoFocus
          />
          
          {/* Store List */}
          <div style={storeListStyle}>
            {filteredStores.length > 0 ? (
              filteredStores.map((store) => (
                <div
                  key={store.id}
                  style={storeItemStyle}
                  onClick={() => handleStoreSelect(store)}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.background = theme.colors.glass;
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.background = 'transparent';
                  }}
                >
                  <div style={{
                    width: '1.25rem',
                    height: '1.25rem',
                    borderRadius: theme.borderRadius.small,
                    background: theme.gradients.secondary,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    flexShrink: 0,
                  }}>
                    <Store size={12} color="white" />
                  </div>
                  
                  <div style={{ flex: 1 }}>
                    <div style={{ 
                      fontSize: theme.typography.fontSize.sm,
                      fontWeight: theme.typography.fontWeight.medium,
                      color: theme.colors.textPrimary,
                    }}>
                      {store.name}
                    </div>
                    <div style={{ 
                      fontSize: theme.typography.fontSize.xs,
                      color: theme.colors.textSecondary,
                      marginTop: '1px',
                    }}>
                      {store.address}
                    </div>
                  </div>
                  
                  {selectedStore?.id === store.id && (
                    <Check size={14} style={{ color: theme.colors.success }} />
                  )}
                </div>
              ))
            ) : (
              <div style={{
                padding: theme.spacing.md,
                textAlign: 'center',
                color: theme.colors.textMuted,
                fontSize: theme.typography.fontSize.sm,
              }}>
                {searchTerm ? 'No stores found' : 'No stores available'}
              </div>
            )}
          </div>
          
          {/* Create Store Button */}
          <div
            style={createButtonStyle}
            onClick={handleCreateStore}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = theme.colors.glass;
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = 'transparent';
            }}
          >
            <Plus size={16} />
            Create New Store
          </div>
        </div>
      )}
    </div>
  );
};

export default StoreSelector;