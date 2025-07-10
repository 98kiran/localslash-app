import { theme } from './theme';

export const glassEffect = {
  background: theme.colors.navBackground,
  backdropFilter: 'blur(20px)',
  WebkitBackdropFilter: 'blur(20px)',
  border: `1px solid ${theme.colors.border}`,
};

export const cardStyle = {
  background: theme.colors.cardBackground,
  borderRadius: theme.borderRadius.xlarge,
  padding: theme.spacing.lg,
  boxShadow: theme.colors.shadow,
  border: `1px solid ${theme.colors.border}`,
  transition: 'all 0.3s ease',
};

export const buttonStyle = {
  padding: `${theme.spacing.sm} ${theme.spacing.md}`,
  borderRadius: theme.borderRadius.medium,
  border: 'none',
  cursor: 'pointer',
  fontWeight: '500',
  transition: 'all 0.3s ease',
  fontSize: '0.875rem',
};

export const containerStyle = {
  maxWidth: '1280px',
  margin: '0 auto',
  padding: `0 ${theme.spacing.lg}`,
};