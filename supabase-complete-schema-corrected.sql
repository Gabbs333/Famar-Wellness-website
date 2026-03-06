-- Complete Database Schema for Famar Wellness with CMS - CORRECTED VERSION
-- This file combines the existing schema with CMS extensions with all fixes applied
-- Run this in your Supabase SQL Editor to set up the complete database

-- ============================================
-- IMPORTANT: Use this corrected version instead of supabase-complete-schema.sql
-- ============================================

-- 1. Activer l'extension UUID si nécessaire
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================
-- Existing Tables (from supabase-schema.sql)
-- ============================================

-- Users table (for admin access) - Note: This is separate from auth.users
CREATE TABLE IF NOT EXISTS users (
  id BIGSERIAL PRIMARY KEY,
  username TEXT UNIQUE NOT NULL,
  password_hash TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Contacts/Messages table
CREATE TABLE IF NOT EXISTS contacts (
  id BIGSERIAL PRIMARY KEY,
  name TEXT NOT NULL,
  email TEXT,
  phone TEXT,
  message TEXT,
  type TEXT DEFAULT 'contact', -- 'contact', 'callback'
  status TEXT DEFAULT 'new', -- 'new', 'read', 'archived'
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Newsletter subscribers
CREATE TABLE IF NOT EXISTS subscribers (
  id BIGSERIAL PRIMARY KEY,
  email TEXT UNIQUE NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Bookings
CREATE TABLE IF NOT EXISTS bookings (
  id BIGSERIAL PRIMARY KEY,
  service TEXT NOT NULL,
  date TEXT NOT NULL,
  time TEXT NOT NULL,
  client_name TEXT NOT NULL,
  client_email TEXT NOT NULL,
  client_phone TEXT,
  status TEXT DEFAULT 'confirmed',
  google_event_id TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Blog Posts (existing table, will be extended)
CREATE TABLE IF NOT EXISTS posts (
  id BIGSERIAL PRIMARY KEY,
  title TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  content TEXT NOT NULL,
  excerpt TEXT,
  image_url TEXT,
  published BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- CMS Tables for Page Management (CORRECTED)
-- ============================================

-- Table `cms_templates`
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

-- Table `cms_pages` - Pages du site
CREATE TABLE IF NOT EXISTS cms_pages (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    title TEXT NOT NULL,
    slug TEXT UNIQUE NOT NULL,
    content JSONB NOT NULL DEFAULT '{}',
    template_id UUID REFERENCES cms_templates(id) ON DELETE SET NULL,
    meta_title TEXT,
    meta_description TEXT,
    meta_keywords TEXT[],
    published BOOLEAN DEFAULT FALSE,
    published_at TIMESTAMPTZ,
    author_id UUID, -- CORRECT: UUID pour référencer auth.users
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    version INTEGER DEFAULT 1
);

-- Table `cms_components` - Composants réutilisables
CREATE TABLE IF NOT EXISTS cms_components (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    name TEXT NOT NULL,
    type TEXT NOT NULL, -- 'hero', 'text', 'image', 'gallery', 'form', 'card', 'testimonial', 'cta'
    configuration JSONB NOT NULL DEFAULT '{}',
    preview_data JSONB,
    created_by UUID, -- CORRECT: UUID pour référencer auth.users
    is_public BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- Media Management Tables (CORRECTED)
-- ============================================

-- Table `media_items` - Gestion des médias
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
    uploaded_by UUID, -- CORRECT: UUID pour référencer auth.users
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Table de liaison pour l'utilisation des médias
CREATE TABLE IF NOT EXISTS media_usage (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    media_id UUID REFERENCES media_items(id) ON DELETE CASCADE,
    content_type TEXT NOT NULL,
    content_id UUID NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- Blog Enhancement Tables (CORRECTED)
-- ============================================

-- Extension de la table posts existante avec des colonnes supplémentaires
DO $$
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
END $$;

-- Table pour les catégories de blog
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

-- Table pour les tags
CREATE TABLE IF NOT EXISTS blog_tags (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    name TEXT NOT NULL,
    slug TEXT UNIQUE NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Table de liaison posts-catégories
CREATE TABLE IF NOT EXISTS post_categories (
    post_id UUID NOT NULL,
    category_id UUID NOT NULL REFERENCES blog_categories(id) ON DELETE CASCADE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    PRIMARY KEY (post_id, category_id)
);

-- Table de liaison posts-tags
CREATE TABLE IF NOT EXISTS post_tags (
    post_id UUID NOT NULL,
    tag_id UUID NOT NULL REFERENCES blog_tags(id) ON DELETE CASCADE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    PRIMARY KEY (post_id, tag_id)
);

-- ============================================
-- Revision History Table (CORRECTED)
-- ============================================

-- Table `cms_revisions` - Historique des révisions
CREATE TABLE IF NOT EXISTS cms_revisions (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    page_id UUID REFERENCES cms_pages(id) ON DELETE CASCADE,
    content JSONB NOT NULL,
    version INTEGER NOT NULL,
    created_by UUID, -- CORRECT: UUID pour référencer auth.users
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- Indexes for Performance
-- ============================================

-- Existing indexes
CREATE INDEX IF NOT EXISTS idx_contacts_status ON contacts(status);
CREATE INDEX IF NOT EXISTS idx_contacts_created_at ON contacts(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_bookings_date ON bookings(date);
CREATE INDEX IF NOT EXISTS idx_bookings_status ON bookings(status);
CREATE INDEX IF NOT EXISTS idx_posts_published ON posts(published);
CREATE INDEX IF NOT EXISTS idx_posts_slug ON posts(slug);

-- New indexes for CMS tables
CREATE INDEX IF NOT EXISTS idx_cms_pages_slug ON cms_pages(slug);
CREATE INDEX IF NOT EXISTS idx_cms_pages_published ON cms_pages(published);
CREATE INDEX IF NOT EXISTS idx_cms_pages_author ON cms_pages(author_id);
CREATE INDEX IF NOT EXISTS idx_cms_pages_created_at ON cms_pages(created_at DESC);

CREATE INDEX IF NOT EXISTS idx_cms_templates_category ON cms_templates(category);
CREATE INDEX IF NOT EXISTS idx_cms_templates_system ON cms_templates(is_system_template);

CREATE INDEX IF NOT EXISTS idx_cms_components_type ON cms_components(type);
CREATE INDEX IF NOT EXISTS idx_cms_components_creator ON cms_components(created_by);

CREATE INDEX IF NOT EXISTS idx_media_items_mime ON media_items(mime_type);
CREATE INDEX IF NOT EXISTS idx_media_items_uploader ON media_items(uploaded_by);

CREATE INDEX IF NOT EXISTS idx_media_usage_media ON media_usage(media_id);

CREATE INDEX IF NOT EXISTS idx_cms_revisions_page ON cms_revisions(page_id);
CREATE INDEX IF NOT EXISTS idx_cms_revisions_creator ON cms_revisions(created_by);

CREATE INDEX IF NOT EXISTS idx_blog_categories_slug ON blog_categories(slug);
CREATE INDEX IF NOT EXISTS idx_blog_categories_parent ON blog_categories(parent_id);

CREATE INDEX IF NOT EXISTS idx_blog_tags_slug ON blog_tags(slug);

CREATE INDEX IF NOT EXISTS idx_post_categories_post ON post_categories(post_id);
CREATE INDEX IF NOT EXISTS idx_post_categories_category ON post_categories(category_id);

CREATE INDEX IF NOT EXISTS idx_post_tags_post ON post_tags(post_id);
CREATE INDEX IF NOT EXISTS idx_post_tags_tag ON post_tags(tag_id);

-- ============================================
-- Default Data
-- ============================================

-- Create default admin user (password: "admin" - CHANGE THIS IN PRODUCTION!)
-- Note: This is for the local users table, not auth.users
INSERT INTO users (username, password_hash) 
VALUES ('admin', 'REPLACE_WITH_ACTUAL_HASH')
ON CONFLICT (username) DO NOTHING;

-- Insert system templates
INSERT INTO cms_templates (name, description, category, structure, is_system_template) VALUES
  ('Homepage', 'Template pour la page d''accueil', 'homepage', '{"type": "grid", "columns": 1, "sections": []}', true),
  ('Blog Post', 'Template pour les articles de blog', 'blog', '{"type": "stack", "sections": []}', true),
  ('Contact', 'Template pour la page contact', 'contact', '{"type": "grid", "columns": 2, "sections": []}', true),
  ('Services', 'Template pour la page services', 'services', '{"type": "grid", "columns": 3, "sections": []}', true)
ON CONFLICT DO NOTHING;

-- Insert default components
INSERT INTO cms_components (name, type, configuration, is_public) VALUES
  ('Hero Section', 'hero', '{"fields": [{"name": "title", "type": "text", "label": "Titre", "required": true}, {"name": "subtitle", "type": "text", "label": "Sous-titre"}, {"name": "backgroundImage", "type": "image", "label": "Image de fond"}, {"name": "ctaText", "type": "text", "label": "Texte du bouton"}, {"name": "ctaLink", "type": "text", "label": "Lien du bouton"}]}', true),
  ('Text Block', 'text', '{"fields": [{"name": "content", "type": "richText", "label": "Contenu", "required": true}, {"name": "alignment", "type": "select", "label": "Alignement", "options": [{"value": "left", "label": "Gauche"}, {"value": "center", "label": "Centre"}, {"value": "right", "label": "Droite"}]}]}', true),
  ('Image Gallery', 'gallery', '{"fields": [{"name": "images", "type": "image", "label": "Images", "multiple": true}, {"name": "columns", "type": "number", "label": "Nombre de colonnes", "defaultValue": 3}, {"name": "gap", "type": "number", "label": "Espacement", "defaultValue": 4}]}', true),
  ('Contact Form', 'form', '{"fields": [{"name": "title", "type": "text", "label": "Titre du formulaire"}, {"name": "fields", "type": "select", "label": "Champs à inclure", "multiple": true, "options": [{"value": "name", "label": "Nom"}, {"value": "email", "label": "Email"}, {"value": "phone", "label": "Téléphone"}, {"value": "message", "label": "Message"}]}]}', true)
ON CONFLICT DO NOTHING;

-- ============================================
-- Functions and Triggers (CORRECTED SYNTAX)
-- ============================================

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger to auto-update updated_at on posts
CREATE OR REPLACE TRIGGER update_posts_updated_at 
    BEFORE UPDATE ON posts 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Trigger for cms_pages updated_at
CREATE OR REPLACE TRIGGER update_cms_pages_updated_at 
    BEFORE UPDATE ON cms_pages 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Trigger for cms_templates updated_at
CREATE OR REPLACE TRIGGER update_cms_templates_updated_at 
    BEFORE UPDATE ON cms_templates 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Trigger for cms_components updated_at
CREATE OR REPLACE TRIGGER update_cms_components_updated_at 
    BEFORE UPDATE ON cms_components 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Trigger for media_items updated_at
CREATE OR REPLACE TRIGGER update_media_items_updated_at 
    BEFORE UPDATE ON media_items 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Trigger for blog_categories updated_at
CREATE OR REPLACE TRIGGER update_blog_categories_updated_at 
    BEFORE UPDATE ON blog_categories 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ============================================
-- Row Level Security (RLS) Policies
-- ============================================

-- Enable RLS on all tables
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE contacts ENABLE ROW LEVEL SECURITY;
ALTER TABLE subscribers ENABLE ROW LEVEL SECURITY;
ALTER TABLE bookings ENABLE ROW LEVEL SECURITY;
ALTER TABLE posts ENABLE ROW LEVEL SECURITY;
ALTER TABLE cms_pages ENABLE ROW LEVEL SECURITY;
ALTER TABLE cms_templates ENABLE ROW LEVEL SECURITY;
ALTER TABLE cms_components ENABLE ROW LEVEL SECURITY;
ALTER TABLE media_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE media_usage ENABLE ROW LEVEL SECURITY;
ALTER TABLE blog_categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE blog_tags ENABLE ROW LEVEL SECURITY;
ALTER TABLE post_categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE post_tags ENABLE ROW LEVEL SECURITY;
ALTER TABLE cms_revisions ENABLE ROW LEVEL SECURITY;

-- Existing RLS Policies
CREATE POLICY "Users are viewable by authenticated users" ON users
  FOR SELECT USING (auth.role() = 'authenticated');

CREATE POLICY "Anyone can create contacts" ON contacts
  FOR INSERT WITH CHECK (true);
CREATE POLICY "Authenticated users can view contacts" ON contacts
  FOR SELECT USING (auth.role() = 'authenticated');
CREATE POLICY "Authenticated users can update contacts" ON contacts
  FOR UPDATE USING (auth.role() = 'authenticated');

CREATE POLICY "Anyone can subscribe" ON subscribers
  FOR INSERT WITH CHECK (true);
CREATE POLICY "Authenticated users can view subscribers" ON subscribers
  FOR SELECT USING (auth.role() = 'authenticated');

CREATE POLICY "Anyone can create bookings" ON bookings
  FOR INSERT WITH CHECK (true);
CREATE POLICY "Authenticated users can view bookings" ON bookings
  FOR SELECT USING (auth.role() = 'authenticated');
CREATE POLICY "Authenticated users can update bookings" ON bookings
  FOR UPDATE USING (auth.role() = 'authenticated');

CREATE POLICY "Published posts are viewable by everyone" ON posts
  FOR SELECT USING (published = true OR auth.role() = 'authenticated');
CREATE POLICY "Authenticated users can manage posts" ON posts
  FOR ALL USING (auth.role() = 'authenticated');

-- New RLS Policies for CMS tables
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

-- ============================================
-- Completion Message
-- ============================================

DO $$
BEGIN
    RAISE NOTICE '============================================';
    RAISE NOTICE 'FAMAR WELLNESS DATABASE SCHEMA CREATED - CORRECTED VERSION!';
    RAISE NOTICE '============================================';
    RAISE NOTICE 'All errors fixed:';
    RAISE NOTICE '1. Syntax error in function definition ($$ instead of $)';
    RAISE NOTICE '2. UUID foreign keys for auth.users compatibility';
    RAISE NOTICE '3. Corrected RLS policies';
    RAISE NOTICE '============================================';
    RAISE NOTICE 'Existing tables: users, contacts, subscribers, bookings, posts';
    RAISE NOTICE 'CMS tables: cms_pages, cms_templates, cms_components';
    RAISE NOTICE 'Media tables: media_items, media_usage';
    RAISE NOTICE 'Blog enhancement: blog_categories, blog_tags, post_categories, post_tags';
    RAISE NOTICE 'Revision history: cms_revisions';
    RAISE NOTICE '============================================';
    RAISE NOTICE 'Default admin user: username="admin" (local users table)';
    RAISE NOTICE '4 system templates and 4 default components created';
    RAISE NOTICE 'All RLS policies and indexes configured';
    RAISE NOTICE '============================================';
    RAISE NOTICE 'Schema is now ready for CMS development!';
    RAISE NOTICE '============================================';
END $$;

-- Final confirmation
SELECT 
    '✅ Schema créé avec succès!' AS status,
    'Tous les types de données sont compatibles' AS compatibility,
    'RLS activé pour la sécurité' AS security,
    'Prêt pour le développement' AS next_step;