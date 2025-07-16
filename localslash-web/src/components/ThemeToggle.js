import React from 'react';
import { Sun, Moon } from 'lucide-react';
import { useTheme } from '../contexts/ThemeContext';

const ThemeToggle = ({ size = 'md', showLabel = false, className = '' }) => {
  const theme = useTheme();
  
  const sizes = {
    sm: {
      button: '2rem',
      icon: 16,
      fontSize: theme.typography.fontSize.xs,
    },
    md: {
      button: '2.5rem',
      icon: 20,
      fontSize: theme.typography.fontSize.sm,
    },
    lg: {
      button: '3rem',
      icon: 24,
      fontSize: theme.typography.fontSize.base,
    },
  };
  
  const currentSize = sizes[size];
  
  const buttonStyle = {
    width: currentSize.button,
    height: currentSize.button,
    borderRadius: theme.borderRadius.round,
    border: `1px solid ${theme.colors.border}`,
    background: theme.colors.cardBackground,
    color: theme.colors.textPrimary,
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    transition: theme.animations.normal,
    backdropFilter: 'blur(10px)',
    WebkitBackdropFilter: 'blur(10px)',
    boxShadow: theme.colors.shadow,
    position: 'relative',
    overflow: 'hidden',
  };
  
  const containerStyle = {
    display: 'flex',
    alignItems: 'center',
    gap: theme.spacing.sm,
  };
  
  const labelStyle = {
    fontSize: currentSize.fontSize,
    fontWeight: theme.typography.fontWeight.medium,
    color: theme.colors.textSecondary,
    userSelect: 'none',
  };
  
  const iconContainerStyle = {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    transition: theme.animations.fast,
    transform: theme.isDark ? 'rotate(180deg)' : 'rotate(0deg)',
  };
  
  const handleToggle = () => {
    theme.toggleTheme();
  };
  
  return (
    <div style={containerStyle} className={className}>
      <button
        onClick={handleToggle}
        style={buttonStyle}
        onMouseEnter={(e) => {
          e.currentTarget.style.transform = 'scale(1.05)';
          e.currentTarget.style.boxShadow = theme.colors.shadowHover;
          e.currentTarget.style.borderColor = theme.colors.primary;
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.transform = 'scale(1)';
          e.currentTarget.style.boxShadow = theme.colors.shadow;
          e.currentTarget.style.borderColor = theme.colors.border;
        }}
        onMouseDown={(e) => {
          e.currentTarget.style.transform = 'scale(0.95)';
        }}
        onMouseUp={(e) => {
          e.currentTarget.style.transform = 'scale(1.05)';
        }}
        aria-label={`Switch to ${theme.isDark ? 'light' : 'dark'} mode`}
        title={`Switch to ${theme.isDark ? 'light' : 'dark'} mode`}
      >
        {/* Background glow effect */}
        <div
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            borderRadius: theme.borderRadius.round,
            background: theme.isDark 
              ? 'radial-gradient(circle, rgba(251, 191, 36, 0.1) 0%, transparent 70%)'
              : 'radial-gradient(circle, rgba(59, 130, 246, 0.1) 0%, transparent 70%)',
            opacity: theme.isDark ? 1 : 0.5,
            transition: theme.animations.normal,
          }}
        />
        
        <div style={iconContainerStyle}>
          {theme.isDark ? (
            <Moon 
              size={currentSize.icon} 
              style={{ 
                color: theme.colors.warning,
                filter: 'drop-shadow(0 0 4px rgba(251, 191, 36, 0.3))'
              }} 
            />
          ) : (
            <Sun 
              size={currentSize.icon} 
              style={{ 
                color: theme.colors.primary,
                filter: 'drop-shadow(0 0 4px rgba(59, 130, 246, 0.3))'
              }} 
            />
          )}
        </div>
      </button>
      
      {showLabel && (
        <span style={labelStyle}>
          {theme.isDark ? 'Dark' : 'Light'} Mode
        </span>
      )}
    </div>
  );
};

export default ThemeToggle;