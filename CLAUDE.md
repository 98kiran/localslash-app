# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Structure

LocalSlash is a React-based local deal discovery app that connects local stores with nearby customers. The main application code is in `localslash-web/`.

### Application Architecture

**Dual-User Platform**: The app serves both customers (deal seekers) and store owners (deal creators) with distinct user flows.

**Component Hierarchy**:
```
App.js (Root router)
├── WelcomeScreen.js (Landing page)
├── CustomerApp.js (Customer flow orchestrator)
│   ├── CustomerAuth.js (Auth with guest mode)
│   ├── ModernCustomerDashboard.js (Main customer interface)
│   ├── ModernNearbyDeals.js (Deal browsing)
│   ├── DealCard.js & DealDetails.js (Deal display)
│   ├── Favorites.js (Saved deals/stores)
│   └── CustomerProfile.js (User profile)
└── StoreApp.js (Store owner flow orchestrator)
    ├── StoreAuth.js (Store authentication)
    ├── StoreSetup.js (Initial store setup)
    ├── StoreDashboard.js (Main store interface)
    ├── DealsManager.js (Deal creation/management)
    ├── DashboardOverview.js (Analytics overview)
    └── Analytics.js (Performance tracking)
```

### Key Technical Patterns

**Authentication**: Supabase-based auth with real-time session management. Customers can browse as guests; store owners require accounts.

**State Management**: React hooks with props drilling. No global state management (Redux/Context) - uses local state with Supabase real-time subscriptions.

**Deal Types Supported**:
- Percentage discounts
- Fixed amount discounts  
- BOGO (Buy One Get One)
- Custom deals

**Real-time Features**: Live deal updates, redemption tracking, and availability changes via Supabase subscriptions.

## Development Commands

All commands should be run from the `localslash-web/` directory:

```bash
npm start       # Start development server
npm test        # Run tests
npm run build   # Build for production
npm install     # Install dependencies
```

## Required Environment Variables

Create `.env.local` in `localslash-web/` with:
- `REACT_APP_SUPABASE_URL`
- `REACT_APP_SUPABASE_ANON_KEY`  
- `REACT_APP_GOOGLE_MAPS_API_KEY`

## Database Architecture

**Core Tables**:
- `users`: Authentication and user profiles (Supabase auth.users)
- `stores`: Store information, profiles, and location data
- `deals`: Deal information with pricing, conditions, and redemption limits
- `deal_redemptions`: Secure tracking of deal usage with unique codes
- `deal_analytics`: Deal view and interaction tracking for insights
- `favorites`: User-saved deals and stores

**Security Features**:
- **Row Level Security (RLS)**: Comprehensive data access control
- **Secure Functions**: Database functions for deal redemption with validation
- **Audit Trail**: Complete tracking of all deal interactions
- **Data Isolation**: Users can only access their own data

**Performance Optimizations**:
- **Optimized Queries**: Efficient joins and indexed lookups
- **Parallel Loading**: Multiple database queries executed simultaneously
- **Real-time Updates**: Supabase subscriptions for live data

## Key Integrations

**Supabase**: Backend-as-a-Service providing authentication, real-time database, and RPC functions for secure deal redemption.

**Google Maps/Places API**: Store location search, autocomplete, distance calculations, and directions. API loaded dynamically via `utils/googleMaps.js`.

**Location Services**: Customer deal discovery is location-based with radius filtering and distance calculations.

## Styling System

**Theme Architecture**: Unified theme system with context-based theming:
- **ThemeContext** (`contexts/ThemeContext.js`): Centralized theme management with dark/light mode support
- **Design System** (`styles/theme.js`): Apple-inspired color palette, spacing scale (4px base unit), border radius system, responsive breakpoints
- **Component Integration**: All components use `useTheme()` hook for consistent styling
- **Glassmorphism Effects**: Modern glass-like backdrop effects with blur and transparency

**Responsive Design**: Mobile-first approach with:
- Breakpoints: mobile (480px), tablet (768px), desktop (1024px), wide (1280px)
- Adaptive layouts for different screen sizes
- Touch-friendly interactions on mobile

**Theme Features**:
- **Dark/Light Mode**: System-wide theme toggle with persistent preferences
- **Consistent Colors**: Unified color palette across all components
- **Modern UI**: Glassmorphism effects, smooth animations, and elegant shadows
- **Accessibility**: Proper contrast ratios and readable typography

**CSS Approach**: CSS-in-JS with JavaScript style objects. Global styles provide resets and base styles.

## Security & Data Protection

**Deal Redemption Security**: Unique codes, one-time use validation, user verification, and complete audit trail.

**Input Validation**: Client and server-side validation with built-in Supabase protections.

**User Data**: Secure token-based authentication with JWT tokens and database-level access control.

## Common Development Tasks

**Adding New Deal Types**: Extend the deal type enum in `DealsManager.js` and update the deal creation form.

**Adding Components**: Follow existing patterns:
- Use `useTheme()` hook for consistent styling
- Implement responsive design with mobile-first approach
- Integrate with Supabase for data operations
- Add proper error handling and loading states

**Database Changes**: 
- Update Supabase schema and ensure RLS policies are properly configured
- Test database functions with proper error handling
- Update related components to handle new data structures

**Theme Customization**:
- Modify `contexts/ThemeContext.js` for theme variables
- Update glassmorphism effects in component styles
- Test both dark and light modes for consistency

**Performance Optimization**:
- Use parallel database queries with `Promise.all()`
- Implement proper loading states and error boundaries
- Optimize component re-renders with React.memo when needed

**Testing**: Components use React Testing Library patterns (check existing test files for examples).

## Recent Improvements (Latest Session)

**Major Updates**:
- **Complete Theme System Integration**: All components now use unified theme context
- **Enhanced UI/UX**: Fixed modal sizing, improved responsiveness, resolved overlapping elements
- **Performance Optimizations**: Faster profile loading, optimized database queries
- **Database Setup**: Complete deal redemption system with proper security
- **Modern Design**: Glassmorphism effects, improved spacing, better visual hierarchy
- **Bug Fixes**: Resolved z-index issues, theme toggle problems, loading delays

**Technical Achievements**:
- **Unified Theme System**: All 20+ components migrated to use ThemeContext
- **Responsive Modals**: DealModal now properly sizes (95vw up to 1200px) and centers on desktop
- **Database Optimization**: Profile loading improved from 5+ sequential queries to 2 parallel queries
- **Security Enhancements**: Proper RLS policies and secure deal redemption functions
- **Code Quality**: Consistent error handling, better prop validation, cleaner component structure