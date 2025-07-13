# ClearMarket Logo Assets

## Logo Files

### Current Logo Implementation
- **File**: `/public/new-clearmarket-logo.svg`
- **Format**: SVG (Scalable Vector Graphics)
- **Dimensions**: 100x100 viewBox
- **Usage**: Header and footer logos

### Logo Specifications

#### Header Logo
- Size: 32x32px (w-8 h-8 in Tailwind)
- Location: Top left of the navigation header
- Alt text: "ClearMarket - Professional Field Inspection Network"

#### Footer Logo  
- Size: 24x24px (w-6 h-6 in Tailwind)
- Location: Center of footer
- Functionality: Clickable link to admin login (/auth)
- Alt text: "ClearMarket - Professional Field Inspection Network"
- Accessibility: Includes aria-label for screen readers

### Optimization Features
- **Web Optimized**: SVG format ensures crisp rendering at all sizes
- **Retina Ready**: Vector format scales perfectly on high-DPI displays
- **Performance**: Small file size, fast loading
- **Accessibility**: Proper alt text and semantic markup

### Implementation Notes
- Both logos use the same SVG file for consistency
- Footer logo includes hover effects (opacity transition)
- Proper semantic markup with accessibility considerations
- Optimized for both light and dark themes

### To Replace with New Logo
1. Replace the `/public/new-clearmarket-logo.svg` file with the new logo
2. Ensure the new logo:
   - Is optimized for web (SVG preferred, or optimized PNG/WebP)
   - Works well at both 32x32px and 24x24px sizes
   - Has proper contrast for both light and dark themes
   - Includes appropriate alt text updates if needed

### Admin Login Integration
The footer logo serves as an admin login shortcut:
- Clicking the footer logo navigates to `/auth`
- After successful admin login, users are redirected to `/admin`
- Non-admin users are redirected back to the homepage