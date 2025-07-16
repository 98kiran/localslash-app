import React, { createContext, useContext, useState, useEffect } from 'react';

// Theme definitions
const lightTheme = {
  mode: 'light',
  colors: {
    // Backgrounds
    background: 'linear-gradient(135deg, #f8fafc 0%, #e2e8f0 100%)',
    cardBackground: 'rgba(255, 255, 255, 0.95)',
    navBackground: 'rgba(255, 255, 255, 0.9)',
    overlayBackground: 'rgba(0, 0, 0, 0.5)',
    
    // Glass effects
    glass: 'rgba(255, 255, 255, 0.1)',
    glassBorder: 'rgba(255, 255, 255, 0.2)',
    glassHover: 'rgba(255, 255, 255, 0.2)',
    
    // Text
    textPrimary: '#1e293b',
    textSecondary: '#64748b',
    textMuted: '#94a3b8',
    textInverse: '#ffffff',
    
    // Brand colors
    primary: '#3b82f6',
    primaryHover: '#2563eb',
    secondary: '#8b5cf6',
    secondaryHover: '#7c3aed',
    accent: '#06b6d4',
    accentHover: '#0891b2',
    
    // Status colors
    success: '#10b981',
    successHover: '#059669',
    warning: '#f59e0b',
    warningHover: '#d97706',
    danger: '#ef4444',
    dangerHover: '#dc2626',
    info: '#3b82f6',
    infoHover: '#2563eb',
    
    // Interactive elements
    border: 'rgba(15, 23, 42, 0.1)',
    borderHover: 'rgba(15, 23, 42, 0.2)',
    shadow: '0 4px 12px rgba(0, 0, 0, 0.05)',
    shadowHover: '0 8px 24px rgba(0, 0, 0, 0.1)',
    shadowLarge: '0 25px 50px rgba(0, 0, 0, 0.1)',
    
    // Form elements
    input: '#ffffff',
    inputBorder: 'rgba(15, 23, 42, 0.1)',
    inputFocus: '#3b82f6',
    inputText: '#1e293b',
    inputPlaceholder: '#94a3b8',
    
    // Navigation
    navText: '#1e293b',
    navTextHover: '#3b82f6',
    navActive: '#3b82f6',
    navActiveBg: 'rgba(59, 130, 246, 0.1)',
  },
  
  gradients: {
    primary: 'linear-gradient(135deg, #3b82f6 0%, #8b5cf6 100%)',
    secondary: 'linear-gradient(135deg, #8b5cf6 0%, #06b6d4 100%)',
    success: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
    warning: 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)',
    danger: 'linear-gradient(135deg, #ef4444 0%, #dc2626 100%)',
    hero: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
    card: 'linear-gradient(135deg, rgba(255, 255, 255, 0.9) 0%, rgba(255, 255, 255, 0.7) 100%)',
  }
};

const darkTheme = {
  mode: 'dark',
  colors: {
    // Backgrounds
    background: 'linear-gradient(135deg, #0f172a 0%, #1e293b 100%)',
    cardBackground: 'rgba(30, 41, 59, 0.9)',
    navBackground: 'rgba(15, 23, 42, 0.9)',
    overlayBackground: 'rgba(0, 0, 0, 0.7)',
    
    // Glass effects
    glass: 'rgba(255, 255, 255, 0.05)',
    glassBorder: 'rgba(255, 255, 255, 0.1)',
    glassHover: 'rgba(255, 255, 255, 0.1)',
    
    // Text
    textPrimary: '#f8fafc',
    textSecondary: '#cbd5e1',
    textMuted: '#94a3b8',
    textInverse: '#1e293b',
    
    // Brand colors
    primary: '#60a5fa',
    primaryHover: '#3b82f6',
    secondary: '#a78bfa',
    secondaryHover: '#8b5cf6',
    accent: '#22d3ee',
    accentHover: '#06b6d4',
    
    // Status colors
    success: '#34d399',
    successHover: '#10b981',
    warning: '#fbbf24',
    warningHover: '#f59e0b',
    danger: '#f87171',
    dangerHover: '#ef4444',
    info: '#60a5fa',
    infoHover: '#3b82f6',
    
    // Interactive elements
    border: 'rgba(255, 255, 255, 0.1)',
    borderHover: 'rgba(255, 255, 255, 0.2)',
    shadow: '0 4px 12px rgba(0, 0, 0, 0.25)',
    shadowHover: '0 8px 24px rgba(0, 0, 0, 0.35)',
    shadowLarge: '0 25px 50px rgba(0, 0, 0, 0.5)',
    
    // Form elements
    input: 'rgba(30, 41, 59, 0.8)',
    inputBorder: 'rgba(255, 255, 255, 0.1)',
    inputFocus: '#60a5fa',
    inputText: '#f8fafc',
    inputPlaceholder: '#94a3b8',
    
    // Navigation
    navText: '#f8fafc',
    navTextHover: '#60a5fa',
    navActive: '#60a5fa',
    navActiveBg: 'rgba(96, 165, 250, 0.1)',
  },
  
  gradients: {
    primary: 'linear-gradient(135deg, #60a5fa 0%, #a78bfa 100%)',
    secondary: 'linear-gradient(135deg, #a78bfa 0%, #22d3ee 100%)',
    success: 'linear-gradient(135deg, #34d399 0%, #10b981 100%)',
    warning: 'linear-gradient(135deg, #fbbf24 0%, #f59e0b 100%)',
    danger: 'linear-gradient(135deg, #f87171 0%, #ef4444 100%)',
    hero: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
    card: 'linear-gradient(135deg, rgba(30, 41, 59, 0.9) 0%, rgba(15, 23, 42, 0.8) 100%)',
  }
};

// Common spacing, breakpoints, and other non-color values
const commonTheme = {
  spacing: {
    xs: '0.25rem',   // 4px
    sm: '0.5rem',    // 8px
    md: '1rem',      // 16px
    lg: '1.5rem',    // 24px
    xl: '2rem',      // 32px
    xxl: '3rem',     // 48px
    xxxl: '4rem',    // 64px
  },
  
  borderRadius: {
    none: '0',
    small: '0.5rem',   // 8px
    medium: '0.75rem', // 12px
    large: '1rem',     // 16px
    xlarge: '1.25rem', // 20px
    xxlarge: '1.5rem', // 24px
    round: '50%',
    pill: '9999px',
  },
  
  breakpoints: {
    mobile: '480px',
    tablet: '768px',
    desktop: '1024px',
    wide: '1280px',
  },
  
  zIndex: {
    dropdown: 1000,
    sticky: 1020,
    fixed: 1030,
    modal: 1040,
    popover: 1050,
    tooltip: 1060,
  },
  
  animations: {
    fast: '0.15s ease-out',
    normal: '0.3s ease-out',
    slow: '0.5s ease-out',
  },
  
  typography: {
    fontFamily: {
      sans: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif',
      mono: 'SFMono-Regular, Menlo, Monaco, Consolas, "Liberation Mono", "Courier New", monospace',
    },
    fontSize: {
      xs: '0.75rem',    // 12px
      sm: '0.875rem',   // 14px
      base: '1rem',     // 16px
      lg: '1.125rem',   // 18px
      xl: '1.25rem',    // 20px
      '2xl': '1.5rem',  // 24px
      '3xl': '1.875rem', // 30px
      '4xl': '2.25rem',  // 36px
      '5xl': '3rem',     // 48px
    },
    fontWeight: {
      normal: '400',
      medium: '500',
      semibold: '600',
      bold: '700',
      extrabold: '800',
    },
    lineHeight: {
      tight: '1.25',
      normal: '1.5',
      relaxed: '1.75',
    },
  },
};

// Create theme context
const ThemeContext = createContext();

// Theme provider component
export const ThemeProvider = ({ children }) => {
  const [isDark, setIsDark] = useState(false);
  
  // Load theme preference from localStorage
  useEffect(() => {
    const savedTheme = localStorage.getItem('localslash-theme');
    if (savedTheme) {
      setIsDark(savedTheme === 'dark');
    } else {
      // Default to system preference
      const systemPrefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
      setIsDark(systemPrefersDark);
    }
  }, []);
  
  // Listen for system theme changes
  useEffect(() => {
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    const handleChange = (e) => {
      if (!localStorage.getItem('localslash-theme')) {
        setIsDark(e.matches);
      }
    };
    
    mediaQuery.addEventListener('change', handleChange);
    return () => mediaQuery.removeEventListener('change', handleChange);
  }, []);
  
  const toggleTheme = () => {
    const newTheme = !isDark;
    setIsDark(newTheme);
    localStorage.setItem('localslash-theme', newTheme ? 'dark' : 'light');
  };
  
  const theme = {
    ...commonTheme,
    ...(isDark ? darkTheme : lightTheme),
    isDark,
    toggleTheme,
  };
  
  return (
    <ThemeContext.Provider value={theme}>
      {children}
    </ThemeContext.Provider>
  );
};

// Custom hook to use theme
export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
};

// Utility functions for responsive design
export const breakpoint = (theme, size) => `@media (min-width: ${theme.breakpoints[size]})`;

export const mobile = (theme) => `@media (max-width: ${theme.breakpoints.mobile})`;
export const tablet = (theme) => `@media (max-width: ${theme.breakpoints.tablet})`;
export const desktop = (theme) => `@media (min-width: ${theme.breakpoints.desktop})`;

// Helper functions for common styles
export const getButtonStyles = (theme, variant = 'primary', size = 'md') => {
  const baseStyles = {
    padding: size === 'sm' ? `${theme.spacing.sm} ${theme.spacing.md}` : 
             size === 'lg' ? `${theme.spacing.lg} ${theme.spacing.xl}` : 
             `${theme.spacing.md} ${theme.spacing.lg}`,
    borderRadius: theme.borderRadius.medium,
    border: 'none',
    cursor: 'pointer',
    fontSize: size === 'sm' ? theme.typography.fontSize.sm : 
             size === 'lg' ? theme.typography.fontSize.lg : 
             theme.typography.fontSize.base,
    fontWeight: theme.typography.fontWeight.semibold,
    transition: theme.animations.normal,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: theme.spacing.sm,
  };
  
  const variants = {
    primary: {
      background: theme.gradients.primary,
      color: theme.colors.textInverse,
      boxShadow: theme.colors.shadow,
    },
    secondary: {
      background: theme.colors.cardBackground,
      color: theme.colors.textPrimary,
      border: `1px solid ${theme.colors.border}`,
      boxShadow: theme.colors.shadow,
    },
    ghost: {
      background: 'transparent',
      color: theme.colors.textPrimary,
      border: `1px solid ${theme.colors.border}`,
    },
    danger: {
      background: theme.gradients.danger,
      color: theme.colors.textInverse,
      boxShadow: theme.colors.shadow,
    },
  };
  
  return {
    ...baseStyles,
    ...variants[variant],
  };
};

export const getCardStyles = (theme, variant = 'default') => {
  const baseStyles = {
    background: theme.colors.cardBackground,
    borderRadius: theme.borderRadius.large,
    border: `1px solid ${theme.colors.border}`,
    boxShadow: theme.colors.shadow,
    backdropFilter: 'blur(20px)',
    WebkitBackdropFilter: 'blur(20px)',
  };
  
  const variants = {
    default: baseStyles,
    elevated: {
      ...baseStyles,
      boxShadow: theme.colors.shadowLarge,
    },
    glass: {
      ...baseStyles,
      background: theme.colors.glass,
      border: `1px solid ${theme.colors.glassBorder}`,
    },
  };
  
  return variants[variant];
};

export default ThemeContext;