# Project Structure

## Root Directory Organization

```
├── .kiro/                    # Kiro configuration and specs
│   ├── specs/               # Feature specifications
│   └── steering/            # Steering documents (this file)
├── api/                     # API server files
│   ├── index.js            # Main API server
│   ├── optimize-image.js   # Image optimization API
│   └── test-diagnostic.js  # API testing utilities
├── netlify/                 # Netlify functions
│   └── functions/          # Serverless functions
├── public/                  # Static assets
│   └── logo.png            # Site logo
├── src/                     # Source code
│   ├── admin/              # Admin dashboard
│   ├── components/         # Public-facing components
│   ├── lib/                # Utility libraries
│   └── main.tsx            # Application entry point
└── *.sql                   # Database schema files
```

## Source Code Structure (`src/`)

### Admin Dashboard (`src/admin/`)
```
admin/
├── components/             # Reusable admin components
│   ├── AdminLayout.tsx    # Main admin layout
│   ├── Breadcrumb.tsx     # Navigation breadcrumbs
│   ├── GlobalSearch.tsx   # Global search functionality
│   ├── MediaManager.tsx   # Media library with optimization
│   ├── Tooltip.tsx        # Tooltip component
│   ├── blog/              # Blog management components
│   └── editor/            # Page editor components
│       ├── BlogEditor.tsx         # Blog post editor
│       ├── ComponentLibrary.tsx   # Reusable editor components
│       ├── PageEditor.tsx         # Page content editor
│       ├── PreviewPanel.tsx       # Live preview panel
│       ├── SaveStatus.tsx         # Auto-save status indicator
│       ├── components/            # Editor building blocks
│       ├── templates/             # Template management
│       └── toolbar/               # Editor toolbar
├── context/               # React context providers
│   ├── AuthContext.tsx   # Authentication state
│   └── ThemeContext.tsx  # Theme management
└── pages/                # Admin page components
    ├── Analytics.tsx     # Analytics dashboard
    ├── BlogCategories.tsx # Blog category management
    ├── BlogTags.tsx      # Blog tag management
    ├── Bookings.tsx      # Booking management
    ├── Contacts.tsx      # Contact form submissions
    ├── Dashboard.tsx     # Admin dashboard home
    ├── Login.tsx         # Admin login page
    ├── Media.tsx         # Media library page
    ├── Pages.tsx         # Page management
    ├── Posts.tsx         # Blog post management
    └── Settings.tsx      # System settings
```

### Public Components (`src/components/`)
- **Layout**: `Navbar.tsx`, `Footer.tsx`, `ScrollToTop.tsx`
- **Pages**: `Home.tsx`, `Services.tsx`, `Technologies.tsx`, `About.tsx`
- **Features**: `Gallery.tsx`, `Testimonials.tsx`, `Booking.tsx`, `Blog.tsx`, `Contact.tsx`
- **Utilities**: `LazyImage.tsx`, `Pagination.tsx`, `CallbackModal.tsx`
- **Specialized**: `BlogProfessional.tsx` (professional blog view)

### Utility Libraries (`src/lib/`)
- `supabase.ts` - Supabase client configuration
- `cache.ts` - Caching utilities
- `performance.ts` - Performance monitoring
- `image-optimization.ts` - Image processing utilities
- `intelligent-compression.ts` - Smart image compression
- `content-templates.ts` - Content template management
- `content-import-export.ts` - Content migration utilities
- `usePagination.ts` - Pagination React hook

## API Structure (`api/` and `netlify/functions/`)

### Express API (`api/`)
- `index.js` - Main Express server with routes
- `optimize-image.js` - Image optimization endpoint
- `test-diagnostic.js` - API testing utilities

### Netlify Functions (`netlify/functions/`)
- `server.mjs` - Main serverless function
- `api-info.mjs` - API information endpoint
- `book.mjs` - Booking API
- `contact.mjs` - Contact form API
- `newsletter.mjs` - Newsletter subscription
- `test-supabase.mjs` - Supabase connection testing

## Database Schema Files

### Primary Schema Files
- `supabase-cms-schema-idempotent-final.sql` - Final idempotent schema
- `SUPABASE_MIGRATION_READY.sql` - Migration-ready schema
- `supabase-cms-schema-final-corrected.sql` - Corrected final schema

### Supporting Files
- `run-migration.js` - Schema migration script
- `cms-schema.sql` - Basic CMS schema
- Various RLS (Row Level Security) policy files
- Storage setup scripts

## Configuration Files

### Build & Development
- `vite.config.ts` - Vite build configuration
- `tsconfig.json` - TypeScript configuration
- `tailwind.config.js` - Tailwind CSS configuration
- `postcss.config.js` - PostCSS configuration
- `package.json` - Dependencies and scripts

### Deployment
- `netlify.toml` - Netlify deployment configuration
- `vercel.json` - Vercel deployment configuration
- `dev-server.js` - Development server

## Documentation Files

### Phase Documentation
- `PHASE*_COMPLETED.md` - Phase completion reports
- `PHASE*_PROGRESS.md` - Phase progress tracking

### Setup Guides
- `SUPABASE_SETUP.md` - Supabase configuration guide
- `VERCEL_DEPLOYMENT_GUIDE.md` - Vercel deployment guide
- `CMS_SCHEMA_SETUP.md` - CMS schema setup guide
- `IMAGE_OPTIMIZATION_GUIDE.md` - Image optimization guide
- `SQL_EXECUTION_GUIDE.md` - SQL execution guide
- `ADMIN_GUIDE.md` - Admin user guide

### Credentials & Security
- `SUPABASE_CREDENTIALS.md` - Supabase credential management
- `.env.example` - Environment variable template

## Key Architectural Patterns

### 1. Component Organization
- Admin components separated from public components
- Editor components in dedicated `editor/` directory
- Context providers in `context/` directory
- Utility functions in `lib/` directory

### 2. File Naming Conventions
- Test files: `ComponentName.test.tsx`
- Accessibility improvements: `ComponentName.accessibility-improvements.md`
- Comprehensive tests: `ComponentName.comprehensive.test.tsx`

### 3. Database Management
- Idempotent SQL scripts for safe re-execution
- Separate RLS policy files
- Migration scripts with rollback capability

### 4. API Structure
- Express server for local development
- Netlify functions for serverless deployment
- Image optimization as separate service

### 5. Content Management
- Template system with version tracking
- Component library for page building
- Media management with optimization pipeline