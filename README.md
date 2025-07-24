# ClearMarket Connect Pros

ClearMarket Connect Pros is a pre-launch field services networking platform that connects **Field Representatives** (independent property inspectors) with **Vendors** (companies needing inspection services). The platform operates as a two-sided marketplace with comprehensive anti-spam protection, NDA requirements for beta access, and a credit-based economy for premium features.

## 🚀 Current Status: Pre-Launch Beta

The platform is currently in pre-launch mode, collecting signups from Field Reps and Vendors interested in beta testing. Beta testers must sign an NDA before accessing profile creation and community features.

## 🛠 Tech Stack

### Frontend
- **React 18** with TypeScript
- **Vite** for build tooling and development server
- **Tailwind CSS** for styling with custom design system
- **shadcn/ui** components built on Radix UI primitives
- **React Router DOM** for client-side routing
- **React Hook Form** + **Zod** for form handling and validation
- **React Query** (@tanstack/react-query) for data fetching and caching

### Backend & Services
- **Supabase** (PostgreSQL database, authentication, storage, edge functions)
- **Google reCAPTCHA v2** for anti-spam protection
- **React Simple Maps** for geographic coverage visualization
- **Resend** for transactional emails (beta invites, notifications)

### Development Tools
- **ESLint** with TypeScript support
- **Lovable** integration for AI-assisted development
- **GitHub Actions** for CI/CD

## 📋 Prerequisites

- **Node.js** (v16 or higher) - [Install with nvm](https://github.com/nvm-sh/nvm#installing-and-updating)
- **npm** package manager
- **Supabase account** for backend services
- **Google reCAPTCHA** site key for anti-spam protection

## 🚀 Quick Start

### 1. Clone the Repository

```bash
git clone https://github.com/AskTracyLLC/clearmarket-connect-pros.git
cd clearmarket-connect-pros
```

### 2. Install Dependencies

**Important**: This project requires the `--legacy-peer-deps` flag due to dependency conflicts:

```bash
npm install --legacy-peer-deps
```

### 3. Environment Setup

Copy the environment template and configure your variables:

```bash
cp .env.example .env
```

Edit `.env` with your configuration:

```env
# reCAPTCHA Configuration
# Get your site key from https://www.google.com/recaptcha/admin
VITE_RECAPTCHA_SITE_KEY=your_actual_recaptcha_site_key_here
```

### 4. Supabase Configuration

The Supabase configuration is currently hardcoded in `src/integrations/supabase/client.ts`. For local development:

1. Create a Supabase project at [supabase.com](https://supabase.com)
2. Update the Supabase URL and anon key in the client configuration
3. Run database migrations (see Database Setup section)

### 5. Start Development Server

```bash
npm run dev
```

The application will be available at **http://localhost:8080** (note: not the default port 3000).

## 🗄 Database Setup

The project uses Supabase with several custom tables and functions:

### Key Tables
- `users` - Core user accounts and roles
- `field_rep_signups` / `vendor_signups` - Pre-launch registrations
- `beta_testers` - Beta program participants
- `nda_signatures` - NDA compliance tracking
- `community_posts` - Forum discussions
- `coverage_areas` - Geographic service areas
- `signup_attempts` - Anti-spam logging

### Edge Functions
The project includes 4 Supabase Edge Functions (configured in `supabase/config.toml`):
- `send-signup-email` - Welcome emails for new signups
- `process-scheduled-discussions` - Community content processing
- `generate-discussion-suggestions` - AI-powered discussion topics
- `analyze-discussion-content` - Content moderation

## 🔐 Authentication & Access Control

### User Roles
- **Field Rep** - Property inspectors seeking work opportunities
- **Vendor** - Companies needing inspection coverage
- **Admin** - Platform administrators
- **Moderator** - Community content moderators

### Access Flow
1. **Public Routes** - Landing page, signup forms
2. **Authentication Required** - User dashboard access
3. **NDA Required** - Profile creation and community features
4. **Role-Based Access** - Feature availability based on user type

### NDA Requirement
All beta users must sign an NDA before accessing profile creation. The NDA flow is currently being debugged for redirect loop issues.

## 🛡 Anti-Spam Protection

The platform includes comprehensive anti-spam measures:

- **Google reCAPTCHA v2** - Human verification
- **Disposable Email Detection** - Blocks 70+ temporary email services
- **Rate Limiting** - 3 signups per IP per hour
- **Honeypot Fields** - Catches automated bots
- **Cross-Table Duplicate Detection** - Prevents duplicate emails

For detailed information, see [Anti-Spam Protection Documentation](docs/ANTI_SPAM_PROTECTION.md).

## 🎨 UI Components & Styling

### Design System
- Custom Tailwind configuration with design tokens
- Consistent color palette and typography
- Dark/light theme support via `next-themes`

### Component Library
- **shadcn/ui** components for consistent UI patterns
- **Radix UI** primitives for accessibility
- **Lucide React** icons throughout the interface

For logo assets and branding guidelines, see [Logo Assets Documentation](docs/LOGO_ASSETS.md).

## 🏗 Project Structure

```
src/
├── pages/                    # Route-level components
│   ├── Index.tsx            # Main entry with pre-launch logic
│   ├── AuthPage.tsx         # Authentication flow
│   ├── BetaNDA.tsx          # NDA signing requirement
│   ├── Prelaunch.tsx        # Pre-launch signup forms
│   ├── FieldRepDashboard.tsx # Field rep main dashboard
│   ├── VendorSearchPage.tsx  # Vendor search interface
│   └── AdminDashboard.tsx    # Admin management tools
├── components/
│   ├── FieldRepProfile/     # Field rep profile management
│   ├── VendorDashboard/     # Vendor dashboard components
│   ├── admin/               # Administrative tools
│   ├── ui/                  # Reusable UI primitives
│   └── [feature-specific]/  # Feature-grouped components
├── hooks/                   # Custom React hooks
├── contexts/                # React context providers
├── integrations/supabase/   # Supabase client and types
└── utils/                   # Utility functions
```

## 🧪 Development Workflow

### Available Scripts

```bash
npm run dev          # Start development server (port 8080)
npm run build        # Production build
npm run build:dev    # Development build
npm run lint         # Run ESLint
npm run preview      # Preview production build
```

### Code Standards
- **TypeScript** for type safety
- **ESLint** for code quality
- **Prettier** formatting (configured in ESLint)
- **Component-first** architecture
- **Custom hooks** for business logic
- **Zod schemas** for data validation

## 🚨 Known Issues

### NDA Flow Bug (Priority Fix Needed)
Users are experiencing redirect loops after signing the NDA. The issue may be related to:
- Supabase session state management
- NDA check logic in `useRequireNDA.ts`
- Frontend routing after NDA completion

## 📚 Additional Documentation

- [Anti-Spam Protection Guide](docs/ANTI_SPAM_PROTECTION.md) - Comprehensive security measures
- [Logo Assets Guide](docs/LOGO_ASSETS.md) - Branding and logo implementation

## 🤝 Contributing

This project is currently in pre-launch development. For development questions or contributions:

1. Ensure you understand the NDA requirements and beta access flow
2. Follow the existing code patterns and component structure
3. Test anti-spam measures when working on signup flows
4. Use `npm install --legacy-peer-deps` for dependency management

## 📞 Support

For technical issues or questions about the platform, please contact the development team through the appropriate channels.

## 🔒 Security

This platform handles sensitive user data and requires NDA compliance. Please follow security best practices:
- Never commit secrets or API keys
- Use environment variables for configuration
- Follow the established authentication patterns
- Report security issues through appropriate channels

---

**Note**: This project is built with [Lovable](https://lovable.dev) integration for AI-assisted development. Changes made via Lovable are automatically committed to this repository.
