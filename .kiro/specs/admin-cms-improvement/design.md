# Design Document: CMS Admin Improvement

## Overview

Ce document décrit la conception d'un système de gestion de contenu (CMS) complet intégré à l'application admin existante. L'objectif est de transformer l'admin actuel (qui gère les réservations, contacts et articles basiques) en un véritable CMS permettant la gestion complète du contenu du site web, incluant l'édition de pages, la gestion des médias, et un système de blog professionnel.

L'architecture s'appuie sur l'infrastructure existante : React/TypeScript frontend, Supabase backend avec PostgreSQL, et l'interface admin déjà en place. Le design prévoit une extension progressive des fonctionnalités tout en préservant l'expérience utilisateur existante.

## Architecture

### Architecture Système

```
┌─────────────────────────────────────────────────────────────┐
│                    Frontend (React/TypeScript)              │
├─────────────────────────────────────────────────────────────┤
│  ┌─────────────┐  ┌─────────────┐  ┌───────────────────┐   │
│  │   Admin UI  │  │  Page Editor│  │   Media Manager   │   │
│  │   Existing  │  │   (New)     │  │      (New)        │   │
│  └─────────────┘  └─────────────┘  └───────────────────┘   │
├─────────────────────────────────────────────────────────────┤
│                    API Layer (Node.js/Express)              │
│  ┌─────────────┐  ┌─────────────┐  ┌───────────────────┐   │
│  │  Admin API  │  │   CMS API   │  │  Media API        │   │
│  │  (Existing) │  │   (New)     │  │   (New)           │   │
│  └─────────────┘  └─────────────┘  └───────────────────┘   │
├─────────────────────────────────────────────────────────────┤
│                    Backend (Supabase)                       │
│  ┌─────────────┐  ┌─────────────┐  ┌───────────────────┐   │
│  │   Auth      │  │  PostgreSQL │  │   Storage         │   │
│  │  (Existing) │  │   Database  │  │   (New tables)    │   │
│  └─────────────┘  └─────────────┘  └───────────────────┘   │
└─────────────────────────────────────────────────────────────┘
```

### Principes Architecturaux

1. **Extension Progressive** : Ajouter des fonctionnalités sans perturber l'existant
2. **Séparation des Préoccupations** : Isoler le CMS du reste de l'admin
3. **Réutilisabilité** : Créer des composants réutilisables pour le frontend et backend
4. **Performance** : Optimiser le chargement et la mise en cache
5. **Sécurité** : Maintenir et étendre les politiques RLS de Supabase

### Flux de Données

```
Utilisateur Admin → Interface React → API CMS → Supabase (DB + Storage)
        ↓                ↓                ↓              ↓
   Navigation      État Local      Validation      Persistance
        ↓                ↓                ↓              ↓
   Composants      Éditeur WYSIWYG  Traitement      Récupération
   React CMS       Drag & Drop      Médias          Données
```

## Components and Interfaces

### Composants Frontend (React/TypeScript)

#### 1. CMS Dashboard Component
```typescript
interface CMSDashboardProps {
  userRole: UserRole;
  recentActivity: Activity[];
  contentStats: ContentStatistics;
}

// Fournit une vue d'ensemble du CMS avec métriques et accès rapide
```

#### 2. Page Editor Component
```typescript
interface PageEditorProps {
  pageId?: string;
  templateId?: string;
  initialContent: PageContent;
  onSave: (content: PageContent) => Promise<void>;
  onPreview: () => void;
}

// Éditeur WYSIWYG avec fonctionnalités drag & drop
```

#### 3. Media Manager Component
```typescript
interface MediaManagerProps {
  currentSelection?: MediaItem[];
  onSelect: (items: MediaItem[]) => void;
  allowedTypes: MediaType[];
  multiple?: boolean;
}

// Gestionnaire de médias avec upload, prévisualisation et organisation
```

#### 4. Template Library Component
```typescript
interface TemplateLibraryProps {
  category?: TemplateCategory;
  onSelectTemplate: (template: PageTemplate) => void;
  onCreateTemplate: () => void;
}

// Bibliothèque de templates et composants réutilisables
```

#### 5. Blog Editor Component
```typescript
interface BlogEditorProps {
  postId?: number;
  initialData?: BlogPost;
  categories: BlogCategory[];
  tags: string[];
  onPublish: (post: BlogPost) => Promise<void>;
  onSaveDraft: (post: BlogPost) => Promise<void>;
}

// Éditeur de blog avancé avec SEO, catégories et métadonnées
```

### Interfaces Backend (API)

#### 1. CMS API Endpoints
```
GET    /api/admin/cms/pages           # Liste des pages
GET    /api/admin/cms/pages/:id       # Détails d'une page
POST   /api/admin/cms/pages           # Créer une page
PUT    /api/admin/cms/pages/:id       # Mettre à jour une page
DELETE /api/admin/cms/pages/:id       # Supprimer une page

GET    /api/admin/cms/templates       # Liste des templates
POST   /api/admin/cms/templates       # Créer un template

GET    /api/admin/cms/blocks          # Blocs de contenu
POST   /api/admin/cms/blocks          # Créer un bloc
```

#### 2. Media API Endpoints
```
GET    /api/admin/media               # Liste des médias
POST   /api/admin/media/upload        # Upload de fichiers
PUT    /api/admin/media/:id           # Mettre à jour les métadonnées
DELETE /api/admin/media/:id           # Supprimer un fichier
POST   /api/admin/media/optimize      # Optimiser les images
GET    /api/admin/media/usage/:id     # Utilisation d'un média
```

#### 3. Blog API Endpoints
```
GET    /api/admin/blog/posts          # Articles avec filtres
POST   /api/admin/blog/posts          # Créer un article
PUT    /api/admin/blog/posts/:id      # Mettre à jour un article
GET    /api/admin/blog/categories     # Gestion des catégories
GET    /api/admin/blog/tags           # Gestion des tags
POST   /api/admin/blog/publish/:id    # Workflow de publication
```

### Interfaces de Base de Données

#### 1. Service Layer
```typescript
interface CMSService {
  // Gestion des pages
  getPages(filter?: PageFilter): Promise<Page[]>;
  getPageById(id: string): Promise<Page | null>;
  createPage(pageData: CreatePageInput): Promise<Page>;
  updatePage(id: string, updates: UpdatePageInput): Promise<Page>;
  deletePage(id: string): Promise<void>;
  
  // Gestion des médias
  uploadMedia(file: File, metadata: MediaMetadata): Promise<MediaItem>;
  optimizeImage(mediaId: string, options: OptimizationOptions): Promise<MediaItem>;
  getMediaUsage(mediaId: string): Promise<MediaUsage[]>;
  
  // Gestion du blog
  createBlogPost(postData: CreatePostInput): Promise<BlogPost>;
  updateBlogPost(id: number, updates: UpdatePostInput): Promise<BlogPost>;
  publishBlogPost(id: number, publish: boolean): Promise<BlogPost>;
}
```

#### 2. Repository Layer
```typescript
interface CMSRepository {
  // Opérations CRUD pour les entités CMS
  findPages(where?: Partial<Page>): Promise<Page[]>;
  findPageById(id: string): Promise<Page | null>;
  createPage(page: Omit<Page, 'id' | 'created_at' | 'updated_at'>): Promise<Page>;
  updatePage(id: string, updates: Partial<Page>): Promise<Page>;
  
  // Transactions et relations
  withTransaction<T>(callback: (tx: Transaction) => Promise<T>): Promise<T>;
  getPageWithComponents(pageId: string): Promise<PageWithComponents>;
}
```

## Data Models

### Schéma de Base de Données (PostgreSQL)

#### 1. Table `cms_pages` - Pages du site
```sql
CREATE TABLE cms_pages (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  content JSONB NOT NULL DEFAULT '{}', -- Structure JSON pour le contenu
  template_id UUID REFERENCES cms_templates(id),
  meta_title TEXT,
  meta_description TEXT,
  meta_keywords TEXT[],
  published BOOLEAN DEFAULT FALSE,
  published_at TIMESTAMPTZ,
  author_id BIGINT REFERENCES users(id),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  version INTEGER DEFAULT 1
);

-- Index pour la recherche et performances
CREATE INDEX idx_cms_pages_slug ON cms_pages(slug);
CREATE INDEX idx_cms_pages_published ON cms_pages(published);
CREATE INDEX idx_cms_pages_author ON cms_pages(author_id);
```

#### 2. Table `cms_templates` - Templates de pages
```sql
CREATE TABLE cms_templates (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT,
  category TEXT NOT NULL, -- 'homepage', 'blog', 'contact', 'custom'
  structure JSONB NOT NULL, -- Définition JSON de la structure
  preview_image_url TEXT,
  is_system_template BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);
```

#### 3. Table `cms_components` - Composants réutilisables
```sql
CREATE TABLE cms_components (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  type TEXT NOT NULL, -- 'hero', 'text', 'image', 'gallery', 'form', 'card'
  configuration JSONB NOT NULL DEFAULT '{}',
  preview_data JSONB,
  created_by BIGINT REFERENCES users(id),
  is_public BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);
```

#### 4. Table `media_items` - Gestion des médias
```sql
CREATE TABLE media_items (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  filename TEXT NOT NULL,
  original_filename TEXT NOT NULL,
  file_path TEXT NOT NULL, -- Chemin dans Supabase Storage
  file_size BIGINT NOT NULL,
  mime_type TEXT NOT NULL,
  width INTEGER,
  height INTEGER,
  alt_text TEXT,
  caption TEXT,
  credits TEXT,
  uploaded_by BIGINT REFERENCES users(id),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Table de liaison pour l'utilisation des médias
CREATE TABLE media_usage (
  media_id UUID REFERENCES media_items(id) ON DELETE CASCADE,
  entity_type TEXT NOT NULL, -- 'page', 'post', 'component'
  entity_id TEXT NOT NULL, -- UUID ou ID selon l'entité
  usage_context TEXT, -- 'hero', 'content', 'thumbnail'
  created_at TIMESTAMPTZ DEFAULT NOW(),
  PRIMARY KEY (media_id, entity_type, entity_id)
);
```

#### 5. Table `blog_posts` - Articles de blog (extension de `posts`)
```sql
-- Extension de la table posts existante avec des colonnes supplémentaires
ALTER TABLE posts ADD COLUMN IF NOT EXISTS meta_title TEXT;
ALTER TABLE posts ADD COLUMN IF NOT EXISTS meta_description TEXT;
ALTER TABLE posts ADD COLUMN IF NOT EXISTS featured_image_id UUID REFERENCES media_items(id);
ALTER TABLE posts ADD COLUMN IF NOT EXISTS author_id BIGINT REFERENCES users(id);
ALTER TABLE posts ADD COLUMN IF NOT EXISTS reading_time INTEGER; -- en minutes

-- Table pour les catégories de blog
CREATE TABLE blog_categories (
  id BIGSERIAL PRIMARY KEY,
  name TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  description TEXT,
  parent_id BIGINT REFERENCES blog_categories(id),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Table de liaison posts-catégories
CREATE TABLE post_categories (
  post_id BIGINT REFERENCES posts(id) ON DELETE CASCADE,
  category_id BIGINT REFERENCES blog_categories(id) ON DELETE CASCADE,
  PRIMARY KEY (post_id, category_id)
);

-- Table pour les tags
CREATE TABLE blog_tags (
  id BIGSERIAL PRIMARY KEY,
  name TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE post_tags (
  post_id BIGINT REFERENCES posts(id) ON DELETE CASCADE,
  tag_id BIGINT REFERENCES blog_tags(id) ON DELETE CASCADE,
  PRIMARY KEY (post_id, tag_id)
);
```

#### 6. Table `cms_revisions` - Historique des révisions
```sql
CREATE TABLE cms_revisions (
  id BIGSERIAL PRIMARY KEY,
  entity_type TEXT NOT NULL, -- 'page', 'post', 'component'
  entity_id TEXT NOT NULL, -- UUID ou ID selon l'entité
  content JSONB NOT NULL,
  version INTEGER NOT NULL,
  created_by BIGINT REFERENCES users(id),
  change_summary TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);
```

### Modèles TypeScript

#### 1. Modèle Page
```typescript
interface Page {
  id: string;
  title: string;
  slug: string;
  content: PageContent;
  templateId?: string;
  metaTitle?: string;
  metaDescription?: string;
  metaKeywords?: string[];
  published: boolean;
  publishedAt?: Date;
  authorId: number;
  createdAt: Date;
  updatedAt: Date;
  version: number;
}

interface PageContent {
  structure: PageStructure;
  components: ComponentInstance[];
  styles?: PageStyles;
}

interface PageStructure {
  type: 'grid' | 'flex' | 'stack';
  columns?: number;
  gap?: number;
  sections: PageSection[];
}

interface PageSection {
  id: string;
  type: string;
  components: string[]; // IDs des composants
  configuration: Record<string, any>;
}
```

#### 2. Modèle Component
```typescript
interface Component {
  id: string;
  name: string;
  type: ComponentType;
  configuration: ComponentConfiguration;
  previewData?: Record<string, any>;
  createdBy: number;
  isPublic: boolean;
  createdAt: Date;
  updatedAt: Date;
}

type ComponentType = 
  | 'hero' 
  | 'text' 
  | 'image' 
  | 'gallery' 
  | 'form' 
  | 'card' 
  | 'testimonial' 
  | 'cta';

interface ComponentConfiguration {
  fields: ComponentField[];
  validation?: ValidationRules;
  defaultValues?: Record<string, any>;
}

interface ComponentField {
  name: string;
  type: 'text' | 'richText' | 'image' | 'number' | 'boolean' | 'select' | 'color';
  label: string;
  required?: boolean;
  defaultValue?: any;
  options?: SelectOption[];
}
```

#### 3. Modèle Media
```typescript
interface MediaItem {
  id: string;
  filename: string;
  originalFilename: string;
  filePath: string;
  fileSize: number;
  mimeType: string;
  width?: number;
  height?: number;
  altText?: string;
  caption?: string;
  credits?: string;
  uploadedBy: number;
  createdAt: Date;
  updatedAt: Date;
  url: string; // URL complète pour l'accès
  thumbnails: Thumbnail[]; // Différentes tailles générées
}

interface Thumbnail {
  size: 'xs' | 'sm' | 'md' | 'lg' | 'xl';
  width: number;
  height: number;
  url: string;
}

interface MediaUsage {
  mediaId: string;
  entityType: 'page' | 'post' | 'component';
  entityId: string;
  usageContext?: string;
  createdAt: Date;
}
```

#### 4. Modèle Blog (extension)
```typescript
interface BlogPost extends Post {
  metaTitle?: string;
  metaDescription?: string;
  featuredImageId?: string;
  authorId: number;
  readingTime?: number;
  categories: BlogCategory[];
  tags: Tag[];
  featuredImage?: MediaItem;
  author?: User;
}

interface BlogCategory {
  id: number;
  name: string;
  slug: string;
  description?: string;
  parentId?: number;
  createdAt: Date;
  postCount?: number;
}

interface Tag {
  id: number;
  name: string;
  slug: string;
  createdAt: Date;
}
```

### Relations et Intégrité des Données

```
users (existing)
  ├── cms_pages (author_id)
  ├── media_items (uploaded_by)
  ├── cms_components (created_by)
  └── posts (author_id via extension)

cms_pages
  ├── cms_templates (template_id)
  ├── media_items (via media_usage)
  └── cms_components (via content JSON)

posts (existing)
  ├── media_items (featured_image_id)
  ├── blog_categories (via post_categories)
  └── blog_tags (via post_tags)

media_items
  └── media_usage (pour le tracking d'utilisation)
```

### Politiques RLS (Row Level Security)

Les nouvelles tables hériteront du même modèle de sécurité que l'existant :
- Authentification requise pour toutes les opérations
- Politiques spécifiques par rôle (admin, editor, author)
- Accès public uniquement pour le contenu publié
- Tracking des modifications par utilisateur
## Correctness Properties

*A property is a characteristic or behavior that should hold true across all valid executions of a system-essentially, a formal statement about what the system should do. Properties serve as the bridge between human-readable specifications and machine-verifiable correctness guarantees.*

### Property-Based Testing Overview

Property-based testing (PBT) validates software correctness by testing universal properties across many generated inputs. Each property is a formal specification that should hold for all valid inputs.

#### Core Principles

1. **Universal Quantification**: Every property must contain an explicit "for all" statement
2. **Requirements Traceability**: Each property must reference the requirements it validates
3. **Executable Specifications**: Properties must be implementable as automated tests
4. **Comprehensive Coverage**: Properties should cover all testable acceptance criteria

### Property Creation Process

Based on the prework analysis, we have identified testable acceptance criteria and consolidated them into comprehensive properties to eliminate redundancy.

### Correctness Properties

#### Property 1: Media Management Integrity
*For any* media item uploaded to the system, the Media_Manager shall correctly store, optimize, track usage, and allow replacement while maintaining all references.

**Validates: Requirements 1.1, 1.3, 1.4, 5.1, 5.2, 5.4, 5.5, 8.2**

**Rationale**: This property combines all media-related functionality into a comprehensive test that ensures:
- Media items are properly stored and retrievable
- Images are optimized with multiple sizes generated
- Usage tracking accurately records where media is used
- Search functionality works across all metadata
- Unused files can be identified for cleanup
- Image replacement updates all references

#### Property 2: Page Content Round-Trip Consistency
*For any* page content edited through the Page_Editor, saving and then retrieving the content shall produce equivalent content with all internal links validated.

**Validates: Requirements 2.3, 2.4, 2.5**

**Rationale**: This property ensures the fundamental content editing functionality works correctly:
- Content modifications are properly persisted
- Saved content can be retrieved unchanged
- Internal links within content are validated for correctness
- The system maintains content integrity through edit cycles

#### Property 3: Template and Component Reusability
*For any* template or component created in the system, it shall be duplicable, modifiable, and reusable across multiple pages with consistent application of changes.

**Validates: Requirements 6.1, 6.2, 6.3, 6.4**

**Rationale**: This property validates the template and component system:
- Custom components can be saved and reused
- Templates can be duplicated and modified
- Template changes can be propagated to all using pages
- The component library maintains organization by category

#### Property 4: Blog Publication Workflow
*For any* blog post going through the publication workflow, the system shall correctly manage drafts, approvals, publishing, and archiving with proper permission enforcement.

**Validates: Requirements 3.2, 3.4, 3.5, 3.6, 7.2, 7.3, 7.4, 7.5**

**Rationale**: This property covers the complete blog management lifecycle:
- SEO-friendly URLs are generated from titles
- Category and tag management works hierarchically
- Draft auto-save functions correctly
- Publication workflow with notifications works
- Unpublished content is not publicly accessible
- Change history and authorship are tracked
- Archiving preserves content without deletion

#### Property 5: Role-Based Access Control
*For any* user action in the CMS, the system shall enforce role-based permissions consistently across all operations and content types.

**Validates: Requirements 7.1**

**Rationale**: This property ensures security and access control:
- Different roles have appropriate permissions
- Permission checks are applied consistently
- Unauthorized actions are properly blocked
- Permission changes propagate correctly

#### Property 6: Cache and Performance Optimization
*For any* content update operation, the system shall manage caching efficiently, maintain performance standards, and allow selective cache invalidation.

**Validates: Requirements 8.1, 8.3, 8.4, 8.5**

**Rationale**: This property validates performance characteristics:
- Static pages are properly cached after updates
- Response times meet performance requirements
- Delta updates minimize data transfer
- Cache can be invalidated selectively when needed

#### Property 7: System Integration Consistency
*For any* data operation in the CMS, the system shall use the existing Supabase connections and database schemas without conflicts or data loss.

**Validates: Requirements 9.4**

**Rationale**: This property ensures proper integration with the existing system:
- CMS uses same database connections as existing admin
- Data schemas are compatible and extensible
- Operations don't conflict with existing functionality
- Data integrity is maintained during integration

### Property Patterns Used

1. **Round-Trip Properties**: Property 2 uses round-trip testing for content editing
2. **Invariant Properties**: Property 5 maintains permission invariants across operations
3. **State Machine Properties**: Property 4 models the blog publication workflow as a state machine
4. **Performance Properties**: Property 6 specifies performance characteristics
5. **Integration Properties**: Property 7 ensures system integration consistency

### Edge Cases and Example Tests

The following acceptance criteria are best tested as specific examples or edge cases:

- **1.2, 1.5**: Media upload UI interactions and error handling
- **2.1, 2.2**: Page listing and selection UI interactions  
- **2.6**: HTML validation and error correction
- **3.1**: Rich text editor functionality
- **4.1, 4.2**: Template selection and drag-and-drop UI
- **5.3**: Multiple file upload functionality
- **9.1**: Navigation menu integration
- **9.5**: Conflict resolution scenarios

These will be implemented as unit tests with specific examples rather than property-based tests.

## Error Handling

### Error Categories

#### 1. Media Processing Errors
- **Image Optimization Failures**: When image processing fails, maintain original and log error
- **Upload Errors**: Handle network failures, storage quota exceeded, invalid file types
- **Reference Errors**: When media replacement fails, rollback to previous version

#### 2. Content Validation Errors
- **HTML Validation**: Sanitize or reject invalid HTML with clear error messages
- **Link Validation**: Detect broken internal links and provide repair suggestions
- **Schema Validation**: Validate content against template schemas

#### 3. Workflow Errors
- **Permission Denied**: Clear messaging when users lack required permissions
- **Workflow State Errors**: Prevent invalid state transitions (e.g., publishing without approval)
- **Concurrent Modification**: Handle edit conflicts with merge or lock strategies

#### 4. Performance Errors
- **Timeout Handling**: Gracefully handle slow operations with progress indicators
- **Cache Inconsistency**: Detect and repair cache staleness
- **Memory Limits**: Handle large content operations with pagination or streaming

### Error Recovery Strategies

#### 1. Automatic Recovery
- **Transaction Rollback**: Use database transactions for atomic operations
- **Auto-retry**: Retry transient failures with exponential backoff
- **Cache Invalidation**: Automatically invalidate stale cache entries

#### 2. Manual Recovery
- **Revision History**: Allow rollback to previous versions
- **Conflict Resolution**: Provide tools to resolve edit conflicts
- **Bulk Operations**: Support batch fixes for systematic issues

#### 3. User Communication
- **Clear Error Messages**: Provide actionable error information
- **Progress Feedback**: Show progress for long operations
- **Recovery Options**: Present recovery choices when available

### Error Logging and Monitoring

#### 1. Structured Logging
- **Context Information**: Include user, action, and system state in logs
- **Error Classification**: Categorize errors by type and severity
- **Performance Metrics**: Log operation timing and resource usage

#### 2. Alerting
- **Critical Errors**: Immediate alerts for data loss or security issues
- **Performance Degradation**: Alerts for response time increases
- **Usage Patterns**: Monitor for unusual activity patterns

#### 3. Analytics
- **Error Rates**: Track error frequency by type and component
- **Recovery Success**: Measure success rates of automatic recovery
- **User Impact**: Assess which errors most affect user experience

## Testing Strategy

### Dual Testing Approach

The CMS will use a complementary approach of unit tests and property-based tests:

#### Unit Tests
- **Purpose**: Verify specific examples, edge cases, and error conditions
- **Scope**: Individual components, functions, and UI interactions
- **Examples**: 
  - Media upload with specific file types
  - HTML validation with known invalid input
  - Permission checks for different user roles
  - Template selection UI interactions

#### Property-Based Tests
- **Purpose**: Verify universal properties across all valid inputs
- **Scope**: System behaviors, data integrity, and business logic
- **Configuration**: Minimum 100 iterations per property test

### Test Organization

#### 1. Unit Test Structure
```
tests/
├── unit/
│   ├── media/
│   │   ├── upload.test.ts
│   │   ├── optimization.test.ts
│   │   └── search.test.ts
│   ├── content/
│   │   ├── editor.test.ts
│   │   ├── validation.test.ts
│   │   └── templates.test.ts
│   ├── blog/
│   │   ├── workflow.test.ts
│   │   ├── categories.test.ts
│   │   └── seo.test.ts
│   └── integration/
│       ├── navigation.test.ts
│       └── permissions.test.ts
```

#### 2. Property Test Structure
```
tests/
├── properties/
│   ├── media.properties.test.ts    # Property 1
│   ├── content.properties.test.ts  # Property 2
│   ├── templates.properties.test.ts # Property 3
│   ├── blog.properties.test.ts     # Property 4
│   ├── security.properties.test.ts # Property 5
│   ├── performance.properties.test.ts # Property 6
│   └── integration.properties.test.ts # Property 7
```

### Property-Based Testing Configuration

#### 1. Test Framework
- **Library**: Use `fast-check` for property-based testing in TypeScript
- **Configuration**: Each property test runs 100+ iterations
- **Reporting**: Detailed counterexamples for failing properties

#### 2. Test Annotations
Each property test will be annotated with:
```typescript
/**
 * Feature: admin-cms-improvement
 * Property 1: Media Management Integrity
 * Validates: Requirements 1.1, 1.3, 1.4, 5.1, 5.2, 5.4, 5.5, 8.2
 */
test.prop({
  // Generator configuration
})('Media management maintains integrity', () => {
  // Property implementation
});
```

#### 3. Test Data Generation

##### Media Generators
```typescript
const mediaItemArb = fc.record({
  filename: fc.string(),
  fileSize: fc.nat(),
  mimeType: fc.constantFrom('image/jpeg', 'image/png', 'image/gif'),
  width: fc.nat({ max: 5000 }),
  height: fc.nat({ max: 5000 }),
});
```

##### Content Generators
```typescript
const pageContentArb = fc.record({
  title: fc.string(),
  content: fc.string(),
  structure: fc.constantFrom('grid', 'flex', 'stack'),
  components: fc.array(componentArb, { maxLength: 20 }),
});
```

##### Blog Generators
```typescript
const blogPostArb = fc.record({
  title: fc.string(),
  content: fc.string(),
  categories: fc.array(categoryArb, { maxLength: 5 }),
  tags: fc.array(fc.string(), { maxLength: 10 }),
  status: fc.constantFrom('draft', 'submitted', 'published', 'archived'),
});
```

### Integration Testing

#### 1. API Integration Tests
- **End-to-End**: Test complete API flows from request to database
- **Authentication**: Verify permission enforcement at API level
- **Error Responses**: Test error handling and HTTP status codes

#### 2. UI Integration Tests
- **Component Integration**: Test component interactions
- **State Management**: Verify state consistency across components
- **Navigation**: Test routing and navigation flows

#### 3. Database Integration Tests
- **Schema Validation**: Verify database schema matches TypeScript types
- **Transaction Integrity**: Test atomic operations and rollbacks
- **Performance**: Verify query performance and indexing

### Performance Testing

#### 1. Load Testing
- **Concurrent Users**: Test with simulated multiple admin users
- **Large Content**: Test with large pages and media libraries
- **Cache Effectiveness**: Measure cache hit rates and performance impact

#### 2. Response Time Testing
- **API Response Times**: Ensure < 2s response time for all operations
- **UI Responsiveness**: Test interactive UI performance
- **Initial Load**: Measure time to first meaningful paint

### Test Environment

#### 1. Local Development
- **Database**: Local Supabase instance or test containers
- **Storage**: Mock storage or local file system
- **Isolation**: Each test runs in isolated transaction

#### 2. CI/CD Pipeline
- **Automated Runs**: Run on every commit and pull request
- **Parallel Execution**: Run tests in parallel for speed
- **Reporting**: Detailed test reports and coverage

#### 3. Production Monitoring
- **Synthetic Tests**: Regular health checks of critical paths
- **Performance Monitoring**: Real-user monitoring of admin operations
- **Error Tracking**: Production error collection and analysis

### Test Coverage Goals

- **Line Coverage**: > 80% for core business logic
- **Branch Coverage**: > 70% for decision points
- **Property Coverage**: All 7 correctness properties implemented
- **Integration Coverage**: All API endpoints and UI flows

### Continuous Testing

#### 1. Pre-commit Hooks
- **Type Checking**: Run TypeScript compiler
- **Linting**: Enforce code style and best practices
- **Unit Tests**: Run fast unit tests

#### 2. CI Pipeline
- **Full Test Suite**: Run all tests on CI server
- **Property Tests**: Run property tests with sufficient iterations
- **Integration Tests**: Test with production-like environment

#### 3. Deployment Gates
- **Test Pass Requirement**: All tests must pass before deployment
- **Performance Thresholds**: Meet performance requirements
- **Security Scans**: Run security vulnerability scans