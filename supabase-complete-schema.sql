-- Complete Database Schema for Famar Wellness with CMS
-- This file combines the existing schema with CMS extensions
-- Run this in your Supabase SQL Editor to set up the complete database

-- ============================================
-- Existing Tables (from supabase-schema.sql)
-- ============================================

-- Users table (for admin access)
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
-- CMS Tables for Page Management
-- ============================================

-- Table `cms_pages` - Pages du site
CREATE TABLE IF NOT EXISTS cms_pages (
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

-- Table `cms_templates` - Templates de pages
CREATE TABLE IF NOT EXISTS cms_templates (
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

-- Table `cms_components` - Composants réutilisables
CREATE TABLE IF NOT EXISTS cms_components (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  type TEXT NOT NULL, -- 'hero', 'text', 'image', 'gallery', 'form', 'card', 'testimonial', 'cta'
  configuration JSONB NOT NULL DEFAULT '{}',
  preview_data JSONB,
  created_by BIGINT REFERENCES users(id),
  is_public BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- Media Management Tables
-- ============================================

-- Table `media_items` - Gestion des médias
CREATE TABLE IF NOT EXISTS media_items (
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
  created_at TIMESTAMptz DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Table de liaison pour l'utilisation des médias
CREATE TABLE IF NOT EXISTS media_usage (
  media_id UUID REFERENCES media_items(id) ON DELETE CASCADE,
  entity_type TEXT NOT NULL, -- 'page', 'post', 'component'
  entity_id TEXT NOT NULL, -- UUID ou ID selon l'entité
  usage_context TEXT, -- 'hero', 'content', 'thumbnail'
  created_at TIMESTAMPTZ DEFAULT NOW(),
  PRIMARY KEY (media_id, entity_type, entity_id)
);

-- ============================================
-- Blog Enhancement Tables
-- ============================================

-- Extension de la table posts existante avec des colonnes supplémentaires
ALTER TABLE posts ADD COLUMN IF NOT EXISTS meta_title TEXT;
ALTER TABLE posts ADD COLUMN IF NOT EXISTS meta_description TEXT;
ALTER TABLE posts ADD COLUMN IF NOT EXISTS featured_image_id UUID REFERENCES media_items(id);
ALTER TABLE posts ADD COLUMN IF NOT EXISTS author_id BIGINT REFERENCES users(id);
ALTER TABLE posts ADD COLUMN IF NOT EXISTS reading_time INTEGER; -- en minutes

-- Table pour les catégories de blog
CREATE TABLE IF NOT EXISTS blog_categories (
  id BIGSERIAL PRIMARY KEY,
  name TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  description TEXT,
  parent_id BIGINT REFERENCES blog_categories(id),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Table de liaison posts-catégories
CREATE TABLE IF NOT EXISTS post_categories (
  post_id BIGINT REFERENCES posts(id) ON DELETE CASCADE,
  category_id BIGINT REFERENCES blog_categories(id) ON DELETE CASCADE,
  PRIMARY KEY (post_id, category_id)
);

-- Table pour les tags
CREATE TABLE IF NOT EXISTS blog_tags (
  id BIGSERIAL PRIMARY KEY,
  name TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS post_tags (
  post_id BIGINT REFERENCES posts(id) ON DELETE CASCADE,
  tag_id BIGINT REFERENCES blog_tags(id) ON DELETE CASCADE,
  PRIMARY KEY (post_id, tag_id)
);

-- ============================================
-- Revision History Table
-- ============================================

-- Table `cms_revisions` - Historique des révisions
CREATE TABLE IF NOT EXISTS cms_revisions (
  id BIGSERIAL PRIMARY KEY,
  entity_type TEXT NOT NULL, -- 'page', 'post', 'component'
  entity_id TEXT NOT NULL, -- UUID ou ID selon l'entité
  content JSONB NOT NULL,
  version INTEGER NOT NULL,
  created_by BIGINT REFERENCES users(id),
  change_summary TEXT,
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
CREATE INDEX IF NOT EXISTS idx_cms_components_public ON cms_components(is_public);
CREATE INDEX IF NOT EXISTS idx_cms_components_created_by ON cms_components(created_by);

CREATE INDEX IF NOT EXISTS idx_media_items_mime_type ON media_items(mime_type);
CREATE INDEX IF NOT EXISTS idx_media_items_uploaded_by ON media_items(uploaded_by);
CREATE INDEX IF NOT EXISTS idx_media_items_created_at ON media_items(created_at DESC);

CREATE INDEX IF NOT EXISTS idx_media_usage_entity ON media_usage(entity_type, entity_id);

CREATE INDEX IF NOT EXISTS idx_blog_categories_slug ON blog_categories(slug);
CREATE INDEX IF NOT EXISTS idx_blog_categories_parent ON blog_categories(parent_id);

CREATE INDEX IF NOT EXISTS idx_blog_tags_slug ON blog_tags(slug);

CREATE INDEX IF NOT EXISTS idx_cms_revisions_entity ON cms_revisions(entity_type, entity_id);
CREATE INDEX IF NOT EXISTS idx_cms_revisions_version ON cms_revisions(version DESC);
CREATE INDEX IF NOT EXISTS idx_cms_revisions_created_by ON cms_revisions(created_by);

-- ============================================
-- Default Data
-- ============================================

-- Create default admin user (password: "admin" - CHANGE THIS IN PRODUCTION!)
-- Note: You should generate a proper password hash in your application
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
-- Functions and Triggers
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
CREATE TRIGGER update_posts_updated_at BEFORE UPDATE ON posts
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Trigger for cms_pages updated_at
CREATE TRIGGER update_cms_pages_updated_at BEFORE UPDATE ON cms_pages
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Trigger for cms_templates updated_at
CREATE TRIGGER update_cms_templates_updated_at BEFORE UPDATE ON cms_templates
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Trigger for cms_components updated_at
CREATE TRIGGER update_cms_components_updated_at BEFORE UPDATE ON cms_components
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Trigger for media_items updated_at
CREATE TRIGGER update_media_items_updated_at BEFORE UPDATE ON media_items
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
CREATE POLICY "Published CMS pages are viewable by everyone" ON cms_pages
  FOR SELECT USING (published = true OR auth.role() = 'authenticated');
CREATE POLICY "Authenticated users can manage CMS pages" ON cms_pages
  FOR ALL USING (auth.role() = 'authenticated');

CREATE POLICY "CMS templates are viewable by authenticated users" ON cms_templates
  FOR SELECT USING (auth.role() = 'authenticated');
CREATE POLICY "Authenticated users can manage CMS templates" ON cms_templates
  FOR ALL USING (auth.role() = 'authenticated');

CREATE POLICY "Public CMS components are viewable by everyone" ON cms_components
  FOR SELECT USING (is_public = true OR auth.role() = 'authenticated');
CREATE POLICY "Authenticated users can manage CMS components" ON cms_components
  FOR ALL USING (auth.role() = 'authenticated');

CREATE POLICY "Media items are viewable by authenticated users" ON media_items
  FOR SELECT USING (auth.role() = 'authenticated');
CREATE POLICY "Authenticated users can manage media items" ON media_items
  FOR ALL USING (auth.role() = 'authenticated');

CREATE POLICY "Media usage is viewable by authenticated users" ON media_usage
  FOR SELECT USING (auth.role() = 'authenticated');
CREATE POLICY "Authenticated users can manage media usage" ON media_usage
  FOR ALL USING (auth.role() = 'authenticated');

CREATE POLICY "Blog categories are viewable by everyone" ON blog_categories
  FOR SELECT USING (true);
CREATE POLICY "Authenticated users can manage blog categories" ON blog_categories
  FOR ALL USING (auth.role() = 'authenticated');

CREATE POLICY "Blog tags are viewable by everyone" ON blog_tags
  FOR SELECT USING (true);
CREATE POLICY "Authenticated users can manage blog tags" ON blog_tags
  FOR ALL USING (auth.role() = 'authenticated');

CREATE POLICY "Post categories are viewable by everyone" ON post_categories
  FOR SELECT USING (true);
CREATE POLICY "Authenticated users can manage post categories" ON post_categories
  FOR ALL USING (auth.role() = 'authenticated');

CREATE POLICY "Post tags are viewable by everyone" ON post_tags
  FOR SELECT USING (true);
CREATE POLICY "Authenticated users can manage post tags" ON post_tags
  FOR ALL USING (auth.role() = 'authenticated');

CREATE POLICY "CMS revisions are viewable by authenticated users" ON cms_revisions
  FOR SELECT USING (auth.role() = 'authenticated');
CREATE POLICY "Authenticated users can manage CMS revisions" ON cms_revisions
  FOR ALL USING (auth.role() = 'authenticated');

-- ============================================
-- Completion Message
-- ============================================

DO $ $ BEGIN
  RAISE NOTICE '============================================';
  RAISE NOTICE 'Famar Wellness Database Schema Created!';
  RAISE NOTICE '============================================';
  RAISE NOTICE 'Existing tables: users, contacts, subscribers, bookings, posts';
  RAISE NOTICE 'CMS tables: cms_pages, cms_templates, cms_components';
  RAISE NOTICE 'Media tables: media_items, media_usage';
  RAISE NOTICE 'Blog enhancement: blog_categories, blog_tags, post_categories, post_tags';
  RAISE NOTICE 'Revision history: cms_revisions';
  RAISE NOTICE '============================================';
  RAISE NOTICE 'Default admin user: username="admin", password="admin" (CHANGE THIS!)';
  RAISE NOTICE '4 system templates and 4 default components created';
  RAISE NOTICE 'All RLS policies and indexes configured';
  RAISE NOTICE '============================================';
END $ $;