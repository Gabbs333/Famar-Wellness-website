# Technology Stack

## Core Technologies

**Frontend Framework:**
- React 18.3.1 with TypeScript
- React Router DOM 6.27.0 for routing
- Vite 5.0.12 as build tool and dev server

**Styling:**
- Tailwind CSS 3.4.14 with custom configuration
- Autoprefixer 10.4.20
- PostCSS 8.4.47
- Inter and JetBrains Mono fonts

**Rich Text Editor:**
- Tiptap 3.20.0 with extensions:
  - Starter Kit (core functionality)
  - Image extension
  - Link extension
  - Placeholder extension
  - YouTube extension
  - Code Block with Lowlight

**UI Components & Icons:**
- Lucide React 0.460.0 for icons
- Motion 11.11.17 for animations
- React Day Picker 9.1.1 for date selection
- React Calendly 4.3.1 for booking integration

**Backend & Database:**
- Supabase JS SDK 2.98.0
- PostgreSQL database via Supabase
- Express 4.21.1 for API server
- Better SQLite3 11.5.0 (development/testing)

**Image Processing:**
- Sharp 0.33.5 for image optimization
- Custom image transformation utilities

**Utilities:**
- Date-fns 4.1.0 for date manipulation
- Dotenv 16.4.5 for environment variables
- Google APIs 144.0.0 (likely for analytics/calendar)

## Development Tools

**TypeScript Configuration:**
- Target: ES2022
- Module: ESNext
- JSX: React-jsx
- Path alias: `@/*` maps to root directory
- No emit (type checking only)

**Build System:**
- Vite with React plugin
- Path aliases configured for root imports
- HMR disabled in AI Studio environment
- API proxy to Express server in development

## Common Commands

**Development:**
```bash
npm run dev          # Start development server
npm run vercel-dev   # Start Vercel development server
```

**Build & Deployment:**
```bash
npm run build        # Build for production
npm run preview      # Preview production build
npm run clean        # Clean dist directory
```

**Code Quality:**
```bash
npm run lint         # TypeScript type checking
```

**Testing:**
- No dedicated test command in package.json
- Tests use Vitest (implied from Vite config)
- Test files use `.test.ts` or `.test.tsx` suffix

## Environment Variables

**Required:**
- `GEMINI_API_KEY`: For AI features (from README)
- `SUPABASE_URL`: Supabase project URL
- `SUPABASE_ANON_KEY`: Supabase anonymous key

**Development:**
- `DISABLE_HMR`: Disables Hot Module Replacement in AI Studio

## Project Structure Conventions

**File Naming:**
- React components: PascalCase with `.tsx` extension
- Utility functions: camelCase with `.ts` extension
- Test files: Same name as source with `.test.tsx` suffix
- SQL files: kebab-case with `.sql` extension
- Documentation: UPPERCASE with `.md` extension

**Import Paths:**
- Use `@/` alias for root imports
- Relative imports for same directory components
- Named exports preferred over default exports

**Code Style:**
- TypeScript strict mode enabled
- Functional components with hooks
- Tailwind CSS for styling (no CSS modules)
- French comments for business logic
- English comments for technical implementation