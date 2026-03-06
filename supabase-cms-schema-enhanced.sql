-- =============================================================================
-- SUPABASE CMS SCHEMA - Version Améliorée
-- =============================================================================
-- Ce script crée ou met à jour le schéma CMS avec :
-- 1. Types de données corrects (UUID pour auth.users)
-- 2. Fonctions utilitaires pour slugs SEO-friendly
-- 3. Triggers automatiques pour slugs uniques
-- 4. Toutes les corrections de syntaxe appliquées
-- =============================================================================

-- 1. Activer les extensions nécessaires
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "unaccent"; -- Pour la génération de slugs

-- 2. Supprimer d'abord les contraintes problématiques si elles existent
DO $$
BEGIN
    -- Supprimer les contraintes de clé étrangère qui pourraient causer des erreurs
    ALTER TABLE IF EXISTS cms_components DROP CONSTRAINT IF EXISTS fk_cms_components_creator;
    ALTER TABLE IF EXISTS media_items DROP CONSTRAINT IF EXISTS fk_media_items_uploader;
    ALTER TABLE IF EXISTS cms_revisions DROP CONSTRAINT IF EXISTS fk_cms_revisions_creator;
    ALTER TABLE IF EXISTS cms_pages DROP CONSTRAINT IF EXISTS fk_cms_pages_author;
    
    RAISE NOTICE 'Anciennes contraintes supprimées (si elles existaient)';
END $$;

-- =============================================================================
-- FONCTIONS UTILITAIRES (AJOUTÉES)
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

-- Function to generate unique slug with fallback
CREATE OR REPLACE FUNCTION generate_unique_slug(
    table_name TEXT,
    title TEXT,
    exclude_id UUID DEFAULT NULL,
    max_attempts INTEGER DEFAULT 10
)
RETURNS TEXT AS $$
DECLARE
    base_slug TEXT;
    candidate_slug TEXT;
    attempt INTEGER := 1;
BEGIN
    -- Generate base slug
    base_slug := generate_slug(title);
    candidate_slug := base_slug;
    
    -- Try base slug first
    WHILE attempt <= max_attempts LOOP
        IF is_slug_unique(table_name, candidate_slug, exclude_id) THEN
            RETURN candidate_slug;
        END IF;
        
        -- Try with suffix
        candidate_slug := base_slug || '-' || attempt;
        attempt := attempt + 1;
    END LOOP;
    
    -- If all attempts fail, add timestamp
    RETURN base_slug || '-' || extract(epoch from now())::integer;
END;
$$ LANGUAGE plpgsql;

-- Function to calculate reading time from content
CREATE OR REPLACE FUNCTION calculate_reading_time(content TEXT)
RETURNS INTEGER AS $$
DECLARE
    word_count INTEGER;
    reading_time INTEGER;
    words_per_minute CONSTANT INTEGER := 200;
BEGIN
    -- Estimate word count (rough approximation)
    word_count := length(regexp_replace(content, '\s+', ' ', 'g')) - length(replace(regexp_replace(content, '\s+', ' ', 'g'), ' ', '')) + 1;
    
    -- Calculate reading time in minutes (minimum 1 minute)
    reading_time := greatest(ceil(word_count::float / words_per_minute), 1);
    
    RETURN reading_time;
END;
$$ LANGUAGE plpgsql IMMUTABLE;

-- =============================================================================
-- CRÉATION DES TABLES (si elles n'existent pas)
-- =============================================================================

-- 1. CMS Templates
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

-- 2. CMS Pages
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
    author_id UUID, -- CORRECT: UUID pour référencer auth.users
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    version INTEGER DEFAULT 1
);

-- 3. CMS Components
CREATE TABLE IF NOT EXISTS cms_components (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    name TEXT NOT NULL,
    type TEXT NOT NULL,
    configuration JSONB NOT NULL DEFAULT '{}',
    preview_data JSONB,
    created_by UUID, -- CORRECT: UUID pour référencer auth.users
    is_public BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 4. Media Items
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

-- 5. Media Usage
CREATE TABLE IF NOT EXISTS media_usage (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    media_id UUID REFERENCES media_items(id) ON DELETE CASCADE,
    content_type TEXT NOT NULL,
    content_id UUID NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 6. CMS Revisions
CREATE TABLE IF NOT EXISTS cms_revisions (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    page_id UUID REFERENCES cms_pages(id) ON DELETE CASCADE,
    content JSONB NOT NULL,
    version INTEGER NOT NULL,
    created_by UUID, -- CORRECT: UUID pour référencer auth.users
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 7. Blog Categories
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

-- 8. Blog Tags
CREATE TABLE IF NOT EXISTS blog_tags (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    name TEXT NOT NULL,
    slug TEXT UNIQUE NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 9. Post Categories (table de liaison)
CREATE TABLE IF NOT EXISTS post_categories (
    post_id UUID NOT NULL,
    category_id UUID NOT NULL REFERENCES blog_categories(id) ON DELETE CASCADE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    PRIMARY KEY (post_id, category_id)
);

-- 10. Post Tags (table de liaison)
CREATE TABLE IF NOT EXISTS post_tags (
    post_id UUID NOT NULL,
    tag_id UUID NOT NULL REFERENCES blog_tags(id) ON DELETE CASCADE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    PRIMARY KEY (post_id, tag_id)
);

-- =============================================================================
-- AJOUTER LES COLONNES MANQUANTES À LA TABLE POSTS (si elle existe)
-- =============================================================================
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
        
        RAISE NOTICE 'Colonnes ajoutées à la table posts (si elles n''existaient pas)';
    END IF;
END $$;

-- =============================================================================
-- AJOUTER LES CONTRAINTES DE CLÉ ÉTRANGÈRE
-- =============================================================================

-- Note: Nous ajoutons les contraintes APRÈS avoir créé les tables
-- pour éviter les problèmes d'ordre de création

-- Contrainte pour cms_pages -> cms_templates
ALTER TABLE cms_pages 
ADD CONSTRAINT fk_cms_pages_template 
FOREIGN KEY (template_id) 
REFERENCES cms_templates(id) 
ON DELETE SET NULL;

-- Contrainte pour cms_pages -> auth.users
ALTER TABLE cms_pages 
ADD CONSTRAINT fk_cms_pages_author 
FOREIGN KEY (author_id) 
REFERENCES auth.users(id) 
ON DELETE SET NULL;

-- Contrainte pour cms_components -> auth.users
ALTER TABLE cms_components 
ADD CONSTRAINT fk_cms_components_creator 
FOREIGN KEY (created_by) 
REFERENCES auth.users(id) 
ON DELETE SET NULL;

-- Contrainte pour media_items -> auth.users
ALTER TABLE media_items 
ADD CONSTRAINT fk_media_items_uploader 
FOREIGN KEY (uploaded_by) 
REFERENCES auth.users(id) 
ON DELETE SET NULL;

-- Contrainte pour cms_revisions -> auth.users
ALTER TABLE cms_revisions 
ADD CONSTRAINT fk_cms_revisions_creator 
FOREIGN KEY (created_by) 
REFERENCES auth.users(id) 
ON DELETE SET NULL;

-- =============================================================================
-- CRÉER LES INDEX POUR LES PERFORMANCES
-- =============================================================================

-- Index pour cms_pages
CREATE INDEX IF NOT EXISTS idx_cms_pages_slug ON cms_pages(slug);
CREATE INDEX IF NOT EXISTS idx_cms_pages_published ON cms_pages(published);
CREATE INDEX IF NOT EXISTS idx_cms_pages_author ON cms_pages(author_id);

-- Index pour cms_templates
CREATE INDEX IF NOT EXISTS idx_cms_templates_category ON cms_templates(category);

-- Index pour cms_components
CREATE INDEX IF NOT EXISTS idx_cms_components_type ON cms_components(type);
CREATE INDEX IF NOT EXISTS idx_cms_components_creator ON cms_components(created_by);

-- Index pour media_items
CREATE INDEX IF NOT EXISTS idx_media_items_mime ON media_items(mime_type);
CREATE INDEX IF NOT EXISTS idx_media_items_uploader ON media_items(uploaded_by);

-- Index pour media_usage
CREATE INDEX IF NOT EXISTS idx_media_usage_media ON media_usage(media_id);

-- Index pour cms_revisions
CREATE INDEX IF NOT EXISTS idx_cms_revisions_page ON cms_revisions(page_id);
CREATE INDEX IF NOT EXISTS idx_cms_revisions_creator ON cms_revisions(created_by);

-- Index pour blog_categories
CREATE INDEX IF NOT EXISTS idx_blog_categories_slug ON blog_categories(slug);
CREATE INDEX IF NOT EXISTS idx_blog_categories_parent ON blog_categories(parent_id);

-- Index pour blog_tags
CREATE INDEX IF NOT EXISTS idx_blog_tags_slug ON blog_tags(slug);

-- Index pour post_categories
CREATE INDEX IF NOT EXISTS idx_post_categories_post ON post_categories(post_id);
CREATE INDEX IF NOT EXISTS idx_post_categories_category ON post_categories(category_id);

-- Index pour post_tags
CREATE INDEX IF NOT EXISTS idx_post_tags_post ON post_tags(post_id);
CREATE INDEX IF NOT EXISTS idx_post_tags_tag ON post_tags(tag_id);

-- =============================================================================
-- TRIGGERS POUR SLUGS AUTOMATIQUES (AJOUTÉS)
-- =============================================================================

-- Trigger function for automatic slug generation
CREATE OR REPLACE FUNCTION set_auto_slug()
RETURNS TRIGGER AS $$
BEGIN
    -- Only generate slug if it's not already set or title changed
    IF NEW.slug IS NULL OR NEW.slug = '' OR (OLD.title IS NOT NULL AND NEW.title != OLD.title) THEN
        NEW.slug := generate_unique_slug(TG_TABLE_NAME, NEW.title, NEW.id);
    END IF;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger for cms_pages slug
CREATE OR REPLACE TRIGGER trg_cms_pages_slug
    BEFORE INSERT OR UPDATE OF title ON cms_pages
    FOR EACH ROW
    EXECUTE FUNCTION set_auto_slug();

-- Trigger for blog_categories slug
CREATE OR REPLACE TRIGGER trg_blog_categories_slug
    BEFORE INSERT OR UPDATE OF name ON blog_categories
    FOR EACH ROW
    EXECUTE FUNCTION set_auto_slug();

-- Trigger for blog_tags slug
CREATE OR REPLACE TRIGGER trg_blog_tags_slug
    BEFORE INSERT OR UPDATE OF name ON blog_tags
    FOR EACH ROW
    EXECUTE FUNCTION set_auto_slug();

-- =============================================================================
-- TRIGGERS POUR UPDATED_AT (CORRIGÉS)
-- =============================================================================

-- Function to update updated_at timestamp (CORRECTED SYNTAX)
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Triggers pour toutes les tables avec updated_at
CREATE OR REPLACE TRIGGER update_cms_templates_updated_at 
    BEFORE UPDATE ON cms_templates 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE OR REPLACE TRIGGER update_cms_pages_updated_at 
    BEFORE UPDATE ON cms_pages 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE OR REPLACE TRIGGER update_cms_components_updated_at 
    BEFORE UPDATE ON cms_components 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE OR REPLACE TRIGGER update_media_items_updated_at 
    BEFORE UPDATE ON media_items 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE OR REPLACE TRIGGER update_blog_categories_updated_at 
    BEFORE UPDATE ON blog_categories 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- =============================================================================
-- ACTIVER ROW LEVEL SECURITY (RLS)
-- =============================================================================

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

-- =============================================================================
-- CRÉER LES POLITIQUES RLS
-- =============================================================================

-- Supprimer les anciennes politiques si elles existent
DO $$
BEGIN
    -- CMS Pages
    DROP POLICY IF EXISTS "Public can view published pages" ON cms_pages;
    DROP POLICY IF EXISTS "Authenticated users can insert pages" ON cms_pages;
    DROP POLICY IF EXISTS "Users can update own pages" ON cms_pages;
    DROP POLICY IF EXISTS "Users can delete own pages" ON cms_pages;
    
    -- CMS Templates
    DROP POLICY IF EXISTS "Public can view templates" ON cms_templates;
    DROP POLICY IF EXISTS "Authenticated users can manage templates" ON cms_templates;
    
    -- CMS Components
    DROP POLICY IF EXISTS "Public can view public components" ON cms_components;
    DROP POLICY IF EXISTS "Users can view own components" ON cms_components;
    DROP POLICY IF EXISTS "Users can insert components" ON cms_components;
    DROP POLICY IF EXISTS "Users can update own components" ON cms_components;
    DROP POLICY IF EXISTS "Users can delete own components" ON cms_components;
    
    -- Media Items
    DROP POLICY IF EXISTS "Public can view media" ON media_items;
    DROP POLICY IF EXISTS "Authenticated users can upload media" ON media_items;
    DROP POLICY IF EXISTS "Users can update own media" ON media_items;
    DROP POLICY IF EXISTS "Users can delete own media" ON media_items;
    
    -- Media Usage
    DROP POLICY IF EXISTS "Public can view media usage" ON media_usage;
    DROP POLICY IF EXISTS "Authenticated users can manage media usage" ON media_usage;
    
    -- CMS Revisions
    DROP POLICY IF EXISTS "Users can view page revisions" ON cms_revisions;
    DROP POLICY IF EXISTS "Users can create revisions" ON cms_revisions;
    
    -- Blog Categories
    DROP POLICY IF EXISTS "Public can view categories" ON blog_categories;
    DROP POLICY IF EXISTS "Authenticated users can manage categories" ON blog_categories;
    
    -- Blog Tags
    DROP POLICY IF EXISTS "Public can view tags" ON blog_tags;
    DROP POLICY IF EXISTS "Authenticated users can manage tags" ON blog_tags;
    
    -- Post Categories
    DROP POLICY IF EXISTS "Public can view post categories" ON post_categories;
    DROP POLICY IF EXISTS "Authenticated users can manage post categories" ON post_categories;
    
    -- Post Tags
    DROP POLICY IF EXISTS "Public can view post tags" ON post_tags;
    DROP POLICY IF EXISTS "Authenticated users can manage post tags" ON post_tags;
END $$;

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
-- DONNÉES PAR DÉFAUT
-- =============================================================================

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

-- =============================================================================
-- MESSAGE DE SUCCÈS
-- =============================================================================

DO $$
BEGIN
    RAISE NOTICE '====================================================';
    RAISE NOTICE 'SCHÉMA CMS SUPABASE CRÉÉ AVEC SUCCÈS - VERSION AMÉLIORÉE!';
    RAISE NOTICE '====================================================';
    RAISE NOTICE 'Améliorations incluses:';
    RAISE NOTICE '1. Fonctions pour slugs SEO-friendly';
    RAISE NOTICE '2. Triggers automatiques pour slugs uniques';
    RAISE NOTICE '3. Fonction de calcul du temps de lecture';
    RAISE NOTICE '4. Toutes les syntaxes corrigées ($$ au lieu de $)';
    RAISE NOTICE '5. Types UUID compatibles avec auth.users';
    RAISE NOTICE '====================================================';
    RAISE NOTICE 'Fonctions créées:';
    RAISE NOTICE '- generate_slug() : Génère des slugs SEO-friendly';
    RAISE NOTICE '- is_slug_unique() : Vérifie l''unicité des slugs';
    RAISE NOTICE '- generate_unique_slug() : Génère des slugs uniques';
    RAISE NOTICE '- calculate_reading_time() : Calcule le temps de lecture';
    RAISE NOTICE '====================================================';
    RAISE NOTICE 'Triggers automatiques:';
    RAISE NOTICE '- Génération automatique de slugs pour cms_pages';
    RAISE NOTICE '- Génération automatique de slugs pour blog_categories';
    RAISE NOTICE '- Génération automatique de slugs pour blog_tags';
    RAISE NOTICE '====================================================';
    RAISE NOTICE 'Tables créées/mises à jour:';
    RAISE NOTICE '1. cms_templates';
    RAISE NOTICE '2. cms_pages';
    RAISE NOTICE '3. cms_components';
    RAISE NOTICE '4. media_items';
    RAISE NOTICE '5. media_usage';
    RAISE NOTICE '6. cms_revisions';
    RAISE NOTICE '7. blog_categories';
    RAISE NOTICE '8. blog_tags';
    RAISE NOTICE '9. post_categories';
    RAISE NOTICE '10. post_tags';
    RAISE NOTICE '====================================================';
    RAISE NOTICE 'Le schéma est maintenant prêt pour l''utilisation!';
    RAISE NOTICE '====================================================';
END $$;

-- Message final
SELECT 
    '✅ Schéma CMS amélioré créé avec succès!' AS status,
    'Fonctions SEO et triggers automatiques inclus' AS features,
    'Tous les types de données sont compatibles avec auth.users' AS compatibility,
    'RLS activé pour la sécurité' AS security,
    'Prêt pour le développement' AS next_step;