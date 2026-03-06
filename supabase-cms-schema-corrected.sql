-- =============================================================================
-- SUPABASE CMS SCHEMA - Famar Wellness (CORRIGÉ)
-- =============================================================================
-- Database schema for CMS functionality - Fixed type compatibility issues
-- =============================================================================

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- =============================================================================
-- CMS TABLES (in dependency order - no FK references to tables created later)
-- =============================================================================

-- 1. CMS Templates (no dependencies)
CREATE TABLE IF NOT EXISTS cms_templates (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    name TEXT NOT NULL,
    description TEXT,
    category TEXT NOT NULL,
    structure JSONB NOT NULL DEFAULT '{}',
    preview_image_url TEXT,
    is_system_template BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. CMS Pages (references cms_templates - but we make FK optional)
CREATE TABLE IF NOT EXISTS cms_pages (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    title TEXT NOT NULL,
    slug TEXT UNIQUE NOT NULL,
    content JSONB NOT NULL DEFAULT '{}',
    template_id UUID,
    meta_title TEXT,
    meta_description TEXT,
    meta_keywords TEXT[],
    published BOOLEAN DEFAULT FALSE,
    published_at TIMESTAMPTZ,
    author_id UUID, -- CORRIGÉ: BIGINT → UUID
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    version INTEGER DEFAULT 1
);

-- 3. CMS Components (no dependencies)
CREATE TABLE IF NOT EXISTS cms_components (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    name TEXT NOT NULL,
    type TEXT NOT NULL,
    configuration JSONB NOT NULL DEFAULT '{}',
    preview_data JSONB,
    created_by UUID, -- CORRIGÉ: BIGINT → UUID
    is_public BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 4. Media Items (no dependencies)
CREATE TABLE IF NOT EXISTS media_items (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    filename TEXT NOT NULL,
    original_filename TEXT NOT NULL,
    mime_type TEXT NOT NULL,
    file_size BIGINT NOT NULL,
    storage_path TEXT NOT NULL,
    public_url TEXT,
    thumbnail_url TEXT,
    alt_text TEXT,
    caption TEXT,
    uploaded_by UUID, -- CORRIGÉ: BIGINT → UUID
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 5. Media Usage (references media_items)
CREATE TABLE IF NOT EXISTS media_usage (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    media_id UUID REFERENCES media_items(id) ON DELETE CASCADE,
    content_type TEXT NOT NULL,
    content_id UUID NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 6. CMS Revisions (references cms_pages)
CREATE TABLE IF NOT EXISTS cms_revisions (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    page_id UUID REFERENCES cms_pages(id) ON DELETE CASCADE,
    content JSONB NOT NULL,
    version INTEGER NOT NULL,
    created_by UUID, -- CORRIGÉ: BIGINT → UUID
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- =============================================================================
-- BLOG TABLES
-- =============================================================================

-- 7. Blog Categories (self-referencing for hierarchy)
CREATE TABLE IF NOT EXISTS blog_categories (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    name TEXT NOT NULL,
    slug TEXT UNIQUE NOT NULL,
    description TEXT,
    parent_id UUID REFERENCES blog_categories(id) ON DELETE SET NULL,
    display_order INTEGER DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 8. Blog Tags (no dependencies)
CREATE TABLE IF NOT EXISTS blog_tags (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    name TEXT NOT NULL,
    slug TEXT UNIQUE NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 9. Posts table - Add columns if posts table exists
DO $
BEGIN
    IF EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'posts') THEN
        ALTER TABLE posts 
        ADD COLUMN IF NOT EXISTS excerpt TEXT,
        ADD COLUMN IF NOT EXISTS featured_image TEXT,
        ADD COLUMN IF NOT EXISTS meta_title TEXT,
        ADD COLUMN IF NOT EXISTS meta_description TEXT,
        ADD COLUMN IF NOT EXISTS reading_time INTEGER DEFAULT 5,
        ADD COLUMN IF NOT EXISTS status TEXT DEFAULT 'draft',
        ADD COLUMN IF NOT EXISTS category_id UUID;
    END IF;
END $;

-- 10. Post Categories (junction table for posts and categories) - AJOUTÉ
CREATE TABLE IF NOT EXISTS post_categories (
    post_id UUID NOT NULL,
    category_id UUID NOT NULL REFERENCES blog_categories(id) ON DELETE CASCADE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    PRIMARY KEY (post_id, category_id)
);

-- 11. Post Tags (junction table for posts and tags) - AJOUTÉ
CREATE TABLE IF NOT EXISTS post_tags (
    post_id UUID NOT NULL,
    tag_id UUID NOT NULL REFERENCES blog_tags(id) ON DELETE CASCADE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    PRIMARY KEY (post_id, tag_id)
);

-- =============================================================================
-- ADD FOREIGN KEYS (after all tables exist)
-- =============================================================================

-- Note: These foreign keys reference auth.users(id) which is UUID
ALTER TABLE cms_pages 
ADD CONSTRAINT fk_cms_pages_template 
FOREIGN KEY (template_id) REFERENCES cms_templates(id) ON DELETE SET NULL;

ALTER TABLE cms_pages 
ADD CONSTRAINT fk_cms_pages_author 
FOREIGN KEY (author_id) REFERENCES auth.users(id) ON DELETE SET NULL;

ALTER TABLE cms_components 
ADD CONSTRAINT fk_cms_components_creator 
FOREIGN KEY (created_by) REFERENCES auth.users(id) ON DELETE SET NULL;

ALTER TABLE media_items 
ADD CONSTRAINT fk_media_items_uploader 
FOREIGN KEY (uploaded_by) REFERENCES auth.users(id) ON DELETE SET NULL;

ALTER TABLE cms_revisions 
ADD CONSTRAINT fk_cms_revisions_page 
FOREIGN KEY (page_id) REFERENCES cms_pages(id) ON DELETE CASCADE;

ALTER TABLE cms_revisions 
ADD CONSTRAINT fk_cms_revisions_creator 
FOREIGN KEY (created_by) REFERENCES auth.users(id) ON DELETE SET NULL;

-- =============================================================================
-- INDEXES
-- =============================================================================

-- CMS Indexes
CREATE INDEX IF NOT EXISTS idx_cms_pages_slug ON cms_pages(slug);
CREATE INDEX IF NOT EXISTS idx_cms_pages_published ON cms_pages(published);
CREATE INDEX IF NOT EXISTS idx_cms_pages_author ON cms_pages(author_id);
CREATE INDEX IF NOT EXISTS idx_cms_templates_category ON cms_templates(category);
CREATE INDEX IF NOT EXISTS idx_cms_components_type ON cms_components(type);
CREATE INDEX IF NOT EXISTS idx_cms_components_creator ON cms_components(created_by);
CREATE INDEX IF NOT EXISTS idx_media_items_mime ON media_items(mime_type);
CREATE INDEX IF NOT EXISTS idx_media_items_uploader ON media_items(uploaded_by);
CREATE INDEX IF NOT EXISTS idx_media_usage_media ON media_usage(media_id);
CREATE INDEX IF NOT EXISTS idx_cms_revisions_page ON cms_revisions(page_id);
CREATE INDEX IF NOT EXISTS idx_cms_revisions_creator ON cms_revisions(created_by);

-- Blog Indexes
CREATE INDEX IF NOT EXISTS idx_blog_categories_slug ON blog_categories(slug);
CREATE INDEX IF NOT EXISTS idx_blog_categories_parent ON blog_categories(parent_id);
CREATE INDEX IF NOT EXISTS idx_blog_tags_slug ON blog_tags(slug);
CREATE INDEX IF NOT EXISTS idx_post_categories_post ON post_categories(post_id);
CREATE INDEX IF NOT EXISTS idx_post_categories_category ON post_categories(category_id);
CREATE INDEX IF NOT EXISTS idx_post_tags_post ON post_tags(post_id);
CREATE INDEX IF NOT EXISTS idx_post_tags_tag ON post_tags(tag_id);

-- =============================================================================
-- RLS POLICIES
-- =============================================================================

-- Enable RLS on all tables
ALTER TABLE cms_pages ENABLE ROW LEVEL SECURITY;
ALTER TABLE cms_templates ENABLE ROW LEVEL SECURITY;
ALTER TABLE cms_components ENABLE ROW LEVEL SECURITY;
ALTER TABLE media_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE media_usage ENABLE ROW LEVEL SECURITY;
ALTER TABLE cms_revisions ENABLE ROW LEVEL SECURITY;
ALTER TABLE blog_categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE blog_tags ENABLE ROW LEVEL SECURITY;
ALTER TABLE post_categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE post_tags ENABLE ROW LEVEL SECURITY;

-- CMS Pages policies
CREATE POLICY "Public can view published pages" ON cms_pages
    FOR SELECT USING (published = true);

CREATE POLICY "Authenticated users can insert pages" ON cms_pages
    FOR INSERT WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "Users can update own pages" ON cms_pages
    FOR UPDATE USING (auth.uid() = author_id);

CREATE POLICY "Users can delete own pages" ON cms_pages
    FOR DELETE USING (auth.uid() = author_id);

-- CMS Templates policies
CREATE POLICY "Public can view templates" ON cms_templates
    FOR SELECT USING (true);

CREATE POLICY "Authenticated users can manage templates" ON cms_templates
    FOR ALL USING (auth.role() = 'authenticated');

-- CMS Components policies
CREATE POLICY "Public can view public components" ON cms_components
    FOR SELECT USING (is_public = true);

CREATE POLICY "Users can view own components" ON cms_components
    FOR SELECT USING (auth.uid() = created_by);

CREATE POLICY "Users can insert components" ON cms_components
    FOR INSERT WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "Users can update own components" ON cms_components
    FOR UPDATE USING (auth.uid() = created_by);

CREATE POLICY "Users can delete own components" ON cms_components
    FOR DELETE USING (auth.uid() = created_by);

-- Media Items policies
CREATE POLICY "Public can view media" ON media_items
    FOR SELECT USING (true);

CREATE POLICY "Authenticated users can upload media" ON media_items
    FOR INSERT WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "Users can update own media" ON media_items
    FOR UPDATE USING (auth.uid() = uploaded_by);

CREATE POLICY "Users can delete own media" ON media_items
    FOR DELETE USING (auth.uid() = uploaded_by);

-- Media Usage policies
CREATE POLICY "Public can view media usage" ON media_usage
    FOR SELECT USING (true);

CREATE POLICY "Authenticated users can manage media usage" ON media_usage
    FOR ALL USING (auth.role() = 'authenticated');

-- CMS Revisions policies
CREATE POLICY "Users can view page revisions" ON cms_revisions
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM cms_pages 
            WHERE cms_pages.id = cms_revisions.page_id 
            AND (cms_pages.author_id = auth.uid() OR cms_pages.published = true)
        )
    );

CREATE POLICY "Users can create revisions" ON cms_revisions
    FOR INSERT WITH CHECK (auth.role() = 'authenticated');

-- Blog Categories policies
CREATE POLICY "Public can view categories" ON blog_categories
    FOR SELECT USING (true);

CREATE POLICY "Authenticated users can manage categories" ON blog_categories
    FOR ALL USING (auth.role() = 'authenticated');

-- Blog Tags policies
CREATE POLICY "Public can view tags" ON blog_tags
    FOR SELECT USING (true);

CREATE POLICY "Authenticated users can manage tags" ON blog_tags
    FOR ALL USING (auth.role() = 'authenticated');

-- Post Categories policies
CREATE POLICY "Public can view post categories" ON post_categories
    FOR SELECT USING (true);

CREATE POLICY "Authenticated users can manage post categories" ON post_categories
    FOR ALL USING (auth.role() = 'authenticated');

-- Post Tags policies
CREATE POLICY "Public can view post tags" ON post_tags
    FOR SELECT USING (true);

CREATE POLICY "Authenticated users can manage post tags" ON post_tags
    FOR ALL USING (auth.role() = 'authenticated');

-- =============================================================================
-- TRIGGERS FOR UPDATED_AT
-- =============================================================================

CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create triggers for all tables with updated_at column
CREATE TRIGGER update_cms_templates_updated_at 
    BEFORE UPDATE ON cms_templates 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_cms_pages_updated_at 
    BEFORE UPDATE ON cms_pages 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_cms_components_updated_at 
    BEFORE UPDATE ON cms_components 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_media_items_updated_at 
    BEFORE UPDATE ON media_items 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_blog_categories_updated_at 
    BEFORE UPDATE ON blog_categories 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- =============================================================================
-- FUNCTIONS AND UTILITIES
-- =============================================================================

-- Function to generate SEO-friendly slug
CREATE OR REPLACE FUNCTION generate_slug(title TEXT)
RETURNS TEXT AS $$
DECLARE
    slug TEXT;
BEGIN
    -- Convert to lowercase, remove accents, replace non-alphanumeric with hyphens
    slug := lower(unaccent(title));
    slug := regexp_replace(slug, '[^a-z0-9]+', '-', 'g');
    slug := regexp_replace(slug, '^-|-$', '', 'g');
    RETURN slug;
END;
$$ LANGUAGE plpgsql IMMUTABLE;

-- Function to check if slug is unique
CREATE OR REPLACE FUNCTION is_slug_unique(table_name TEXT, slug TEXT, exclude_id UUID DEFAULT NULL)
RETURNS BOOLEAN AS $$
DECLARE
    count INTEGER;
BEGIN
    EXECUTE format('SELECT COUNT(*) FROM %I WHERE slug = $1 AND ($2::uuid IS NULL OR id != $2)', table_name)
    INTO count
    USING slug, exclude_id;
    
    RETURN count = 0;
END;
$$ LANGUAGE plpgsql;

-- =============================================================================
-- COMPLETION MESSAGE
-- =============================================================================

DO $$
BEGIN
    RAISE NOTICE '========================================';
    RAISE NOTICE 'CMS DATABASE SCHEMA CREATION COMPLETE';
    RAISE NOTICE '========================================';
    RAISE NOTICE 'Tables created:';
    RAISE NOTICE '  - cms_templates';
    RAISE NOTICE '  - cms_pages';
    RAISE NOTICE '  - cms_components';
    RAISE NOTICE '  - media_items';
    RAISE NOTICE '  - media_usage';
    RAISE NOTICE '  - cms_revisions';
    RAISE NOTICE '  - blog_categories';
    RAISE NOTICE '  - blog_tags';
    RAISE NOTICE '  - post_categories';
    RAISE NOTICE '  - post_tags';
    RAISE NOTICE '========================================';
    RAISE NOTICE 'All foreign keys use UUID type (compatible with auth.users)';
    RAISE NOTICE 'RLS policies configured for all tables';
    RAISE NOTICE 'Indexes created for performance';
    RAISE NOTICE 'Triggers for updated_at columns';
    RAISE NOTICE '========================================';
END $$;

-- Return success message
SELECT 
    '✅ CMS database schema created successfully!' AS status,
    'All tables created with proper UUID foreign keys' AS details,
    'RLS policies configured for security' AS security,
    'Ready for CMS implementation' AS next_steps;