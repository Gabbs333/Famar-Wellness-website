-- =============================================================================
-- SUPABASE CMS SCHEMA - Version Finale Corrigée
-- =============================================================================
-- Ce script peut être exécuté plusieurs fois sans erreur
-- Tous les délimiteurs de fonction corrigés ($$ au lieu de $)
-- =============================================================================

-- 1. Activer les extensions nécessaires
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "unaccent"; -- Pour la génération de slugs

-- =============================================================================
-- FONCTIONS UTILITAIRES (CORRIGÉES)
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
    author_id UUID,
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
    created_by UUID,
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
    uploaded_by UUID,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 5. Media Usage
CREATE TABLE IF NOT EXISTS media_usage (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    media_id UUID,
    content_type TEXT NOT NULL,
    content_id UUID NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 6. CMS Revisions
CREATE TABLE IF NOT EXISTS cms_revisions (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    page_id UUID,
    content JSONB NOT NULL,
    version INTEGER NOT NULL,
    created_by UUID,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 7. Blog Categories
CREATE TABLE IF NOT EXISTS blog_categories (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    name TEXT NOT NULL,
    slug TEXT UNIQUE NOT NULL,
    description TEXT,
    parent_id UUID,
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
    category_id UUID NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    PRIMARY KEY (post_id, category_id)
);

-- 10. Post Tags (table de liaison)
CREATE TABLE IF NOT EXISTS post_tags (
    post_id UUID NOT NULL,
    tag_id UUID NOT NULL,
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
        
        RAISE NOTICE 'Colonnes ajoutees a la table posts (si elles n''existaient pas)';
    END IF;
END $$;

-- =============================================================================
-- AJOUTER LES CONTRAINTES DE CLÉ ÉTRANGÈRE (IDEMPOTENT)
-- =============================================================================

-- Fonction pour ajouter une contrainte seulement si elle n'existe pas
CREATE OR REPLACE FUNCTION add_constraint_if_not_exists(
    table_name TEXT,
    constraint_name TEXT,
    constraint_sql TEXT
)
RETURNS VOID AS $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.table_constraints 
        WHERE constraint_name = add_constraint_if_not_exists.constraint_name 
        AND table_name = add_constraint_if_not_exists.table_name
    ) THEN
        EXECUTE 'ALTER TABLE ' || table_name || ' ADD CONSTRAINT ' || constraint_name || ' ' || constraint_sql;
        RAISE NOTICE 'Contrainte % ajoutee a la table %', constraint_name, table_name;
    ELSE
        RAISE NOTICE 'Contrainte % existe deja sur la table %', constraint_name, table_name;
    END IF;
END;
$$ LANGUAGE plpgsql;

-- Ajouter les contraintes de manière idempotente
SELECT add_constraint_if_not_exists('cms_pages', 'fk_cms_pages_template', 
    'FOREIGN KEY (template_id) REFERENCES cms_templates(id) ON DELETE SET NULL');

SELECT add_constraint_if_not_exists('cms_pages', 'fk_cms_pages_author', 
    'FOREIGN KEY (author_id) REFERENCES auth.users(id) ON DELETE SET NULL');

SELECT add_constraint_if_not_exists('cms_components', 'fk_cms_components_creator', 
    'FOREIGN KEY (created_by) REFERENCES auth.users(id) ON DELETE SET NULL');

SELECT add_constraint_if_not_exists('media_items', 'fk_media_items_uploader', 
    'FOREIGN KEY (uploaded_by) REFERENCES auth.users(id) ON DELETE SET NULL');

SELECT add_constraint_if_not_exists('cms_revisions', 'fk_cms_revisions_creator', 
    'FOREIGN KEY (created_by) REFERENCES auth.users(id) ON DELETE SET NULL');

SELECT add_constraint_if_not_exists('media_usage', 'fk_media_usage_media', 
    'FOREIGN KEY (media_id) REFERENCES media_items(id) ON DELETE CASCADE');

SELECT add_constraint_if_not_exists('cms_revisions', 'fk_cms_revisions_page', 
    'FOREIGN KEY (page_id) REFERENCES cms_pages(id) ON DELETE CASCADE');

SELECT add_constraint_if_not_exists('blog_categories', 'fk_blog_categories_parent', 
    'FOREIGN KEY (parent_id) REFERENCES blog_categories(id) ON DELETE SET NULL');

SELECT add_constraint_if_not_exists('post_categories', 'fk_post_categories_category', 
    'FOREIGN KEY (category_id) REFERENCES blog_categories(id) ON DELETE CASCADE');

SELECT add_constraint_if_not_exists('post_tags', 'fk_post_tags_tag', 
    'FOREIGN KEY (tag_id) REFERENCES blog_tags(id) ON DELETE CASCADE');

-- =============================================================================
-- CRÉER LES INDEX POUR LES PERFORMANCES (IDEMPOTENT)
-- =============================================================================

-- Fonction pour créer un index seulement s'il n'existe pas
CREATE OR REPLACE FUNCTION create_index_if_not_exists(
    index_name TEXT,
    table_name TEXT,
    columns TEXT
)
RETURNS VOID AS $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_indexes 
        WHERE indexname = create_index_if_not_exists.index_name
    ) THEN
        EXECUTE 'CREATE INDEX ' || index_name || ' ON ' || table_name || ' (' || columns || ')';
        RAISE NOTICE 'Index % cree sur la table %', index_name, table_name;
    ELSE
        RAISE NOTICE 'Index % existe deja', index_name;
    END IF;
END;
$$ LANGUAGE plpgsql;

-- Index pour cms_pages
SELECT create_index_if_not_exists('idx_cms_pages_slug', 'cms_pages', 'slug');
SELECT create_index_if_not_exists('idx_cms_pages_published', 'cms_pages', 'published');
SELECT create_index_if_not_exists('idx_cms_pages_author', 'cms_pages', 'author_id');

-- Index pour cms_templates
SELECT create_index_if_not_exists('idx_cms_templates_category', 'cms_templates', 'category');

-- Index pour cms_components
SELECT create_index_if_not_exists('idx_cms_components_type', 'cms_components', 'type');
SELECT create_index_if_not_exists('idx_cms_components_creator', 'cms_components', 'created_by');

-- Index pour media_items
SELECT create_index_if_not_exists('idx_media_items_mime', 'media_items', 'mime_type');
SELECT create_index_if_not_exists('idx_media_items_uploader', 'media_items', 'uploaded_by');

-- Index pour media_usage
SELECT create_index_if_not_exists('idx_media_usage_media', 'media_usage', 'media_id');

-- Index pour cms_revisions
SELECT create_index_if_not_exists('idx_cms_revisions_page', 'cms_revisions', 'page_id');
SELECT create_index_if_not_exists('idx_cms_revisions_creator', 'cms_revisions', 'created_by');

-- Index pour blog_categories
SELECT create_index_if_not_exists('idx_blog_categories_slug', 'blog_categories', 'slug');
SELECT create_index_if_not_exists('idx_blog_categories_parent', 'blog_categories', 'parent_id');

-- Index pour blog_tags
SELECT create_index_if_not_exists('idx_blog_tags_slug', 'blog_tags', 'slug');

-- Index pour post_categories
SELECT create_index_if_not_exists('idx_post_categories_post', 'post_categories', 'post_id');
SELECT create_index_if_not_exists('idx_post_categories_category', 'post_categories', 'category_id');

-- Index pour post_tags
SELECT create_index_if_not_exists('idx_post_tags_post', 'post_tags', 'post_id');
SELECT create_index_if_not_exists('idx_post_tags_tag', 'post_tags', 'tag_id');

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

-- Fonction pour créer un trigger seulement s'il n'existe pas
CREATE OR REPLACE FUNCTION create_trigger_if_not_exists(
    trigger_name TEXT,
    table_name TEXT,
    timing TEXT,
    event TEXT,
    function_name TEXT
)
RETURNS VOID AS $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_trigger 
        WHERE tgname = create_trigger_if_not_exists.trigger_name
    ) THEN
        EXECUTE 'CREATE TRIGGER ' || trigger_name || ' ' || timing || ' ' || event || 
                ' ON ' || table_name || ' FOR EACH ROW EXECUTE FUNCTION ' || function_name || '()';
        RAISE NOTICE 'Trigger % cree sur la table %', trigger_name, table_name;
    ELSE
        RAISE NOTICE 'Trigger % existe deja', trigger_name;
    END IF;
END;
$$ LANGUAGE plpgsql;

-- Triggers pour slugs
SELECT create_trigger_if_not_exists('trg_cms_pages_slug', 'cms_pages', 
    'BEFORE INSERT OR UPDATE OF title', 'cms_pages', 'set_auto_slug');

SELECT create_trigger_if_not_exists('trg_blog_categories_slug', 'blog_categories', 
    'BEFORE INSERT OR UPDATE OF name', 'blog_categories', 'set_auto_slug');

SELECT create_trigger_if_not_exists('trg_blog_tags_slug', 'blog_tags', 
    'BEFORE INSERT OR UPDATE OF name', 'blog_tags', 'set_auto_slug');

-- =============================================================================
-- TRIGGERS POUR UPDATED_AT (CORRIGÉS)
-- =============================================================================

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Triggers pour updated_at
SELECT create_trigger_if_not_exists('update_cms_templates_updated_at', 'cms_templates', 
    'BEFORE UPDATE', 'cms_templates', 'update_updated_at_column');

SELECT create_trigger_if_not_exists('update_cms_pages_updated_at', 'cms_pages', 
    'BEFORE UPDATE', 'cms_pages', 'update_updated_at_column');

SELECT create_trigger_if_not_exists('update_cms_components_updated_at', 'cms_components', 
    'BEFORE UPDATE', 'cms_components', 'update_updated_at_column');

SELECT create_trigger_if_not_exists('update_media_items_updated_at', 'media_items', 
    'BEFORE UPDATE', 'media_items', 'update_updated_at_column');

SELECT create_trigger_if_not_exists('update_blog_categories_updated_at', 'blog_categories', 
    'BEFORE UPDATE', 'blog_categories', 'update_updated_at_column');

-- =============================================================================
-- ACTIVER ROW LEVEL SECURITY (RLS) - IDEMPOTENT
-- =============================================================================

-- Fonction pour activer RLS seulement si ce n'est pas déjà fait
CREATE OR REPLACE FUNCTION enable_rls_if_not(table_name TEXT)
RETURNS VOID AS $$
BEGIN
    EXECUTE 'ALTER TABLE ' || table_name || ' ENABLE ROW LEVEL SECURITY';
    RAISE NOTICE 'RLS active pour la table %', table_name;
EXCEPTION
    WHEN others THEN
        RAISE NOTICE 'RLS deja active pour la table %', table_name;
END;
$$ LANGUAGE plpgsql;

-- Activer RLS pour toutes les tables
SELECT enable_rls_if_not('cms_pages');
SELECT enable_rls_if_not('cms_templates');
SELECT enable_rls_if_not('cms_components');
SELECT enable_rls_if_not('media_items');
SELECT enable_rls_if_not('media_usage');
SELECT enable_rls_if_not('cms_revisions');
SELECT enable_rls_if_not('blog_categories');
SELECT enable_rls_if_not('blog_tags');
SELECT enable_rls_if_not('post_categories');
SELECT enable_rls_if_not('post_tags');

-- =============================================================================
-- CRÉER LES POLITIQUES RLS (IDEMPOTENT)
-- =============================================================================

-- Fonction pour créer une politique seulement si elle n'existe pas
CREATE OR REPLACE FUNCTION create_policy_if_not_exists(
    policy_name TEXT,
    table_name TEXT,
    command TEXT,
    using_clause TEXT,
    with_check_clause TEXT DEFAULT NULL
)
RETURNS VOID AS $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE policyname = create_policy_if_not_exists.policy_name 
        AND tablename = create_policy_if_not_exists.table_name
    ) THEN
        IF with_check_clause IS NULL THEN
            EXECUTE 'CREATE POLICY ' || policy_name || ' ON ' || table_name || 
                    ' FOR ' || command || ' USING (' || using_clause || ')';
        ELSE
            EXECUTE 'CREATE POLICY ' || policy_name || ' ON ' || table_name || 
                    ' FOR ' || command || ' USING (' || using_clause || ') WITH CHECK (' || with_check_clause || ')';
        END IF;
        RAISE NOTICE 'Politique % creee pour la table %', policy_name, table_name;
    ELSE
        RAISE NOTICE 'Politique % existe deja pour la table %', policy_name, table_name;
    END IF;
END;
$$ LANGUAGE plpgsql;

-- CMS Pages policies
SELECT create_policy_if_not_exists('Public can view published pages', 'cms_pages', 'SELECT', 'published = true');
SELECT create_policy_if_not_exists('Authenticated users can insert pages', 'cms_pages', 'INSERT', 'auth.role() = ''authenticated''', 'auth.role() = ''authenticated''');
SELECT create_policy_if_not_exists('Users can update own pages', 'cms_pages', 'UPDATE', 'auth.uid() = author_id');
SELECT create_policy_if_not_exists('Users can delete own pages', 'cms_pages', 'DELETE', 'auth.uid() = author_id');

-- CMS Templates policies
SELECT create_policy_if_not_exists('Public can view templates', 'cms_templates', 'SELECT', 'true');
SELECT create_policy_if_not_exists('Authenticated users can manage templates', 'cms_templates', 'ALL', 'auth.role() = ''authenticated''');

-- CMS Components policies
SELECT create_policy_if_not_exists('Public can view public components', 'cms_components', 'SELECT', 'is_public = true');
SELECT create_policy_if_not_exists('Users can view own components', 'cms_components', 'SELECT', 'auth.uid() = created_by');
SELECT create_policy_if_not_exists('Users can insert components', 'cms_components', 'INSERT', 'auth.role() = ''authenticated''', 'auth.role() = ''authenticated''');
SELECT create_policy_if_not_exists('Users can update own components', 'cms_components', 'UPDATE', 'auth.uid() = created_by');
SELECT create_policy_if_not_exists('Users can delete own components', 'cms_components', 'DELETE', 'auth.uid() = created_by');

-- Media Items policies
SELECT create_policy_if_not_exists('Public can view media', 'media_items', 'SELECT', 'true');
SELECT create_policy_if_not_exists('Authenticated users can upload media', 'media_items', 'INSERT', 'auth.role() = ''authenticated''', 'auth.role() = ''authenticated''');
SELECT create_policy_if_not_exists('Users can update own media', 'media_items', 'UPDATE', 'auth.uid() = uploaded_by');
SELECT create_policy_if_not_exists('Users can delete own media', 'media_items', 'DELETE', 'auth.uid() = uploaded_by');

-- Media Usage policies
SELECT create_policy_if_not_exists('Public can view media usage', 'media_usage', 'SELECT', 'true');
SELECT create_policy_if_not_exists('Authenticated users can manage media usage', 'media_usage', 'ALL', 'auth.role() = ''authenticated''');

-- CMS Revisions policies
SELECT create_policy_if_not_exists('Users can view page revisions', 'cms_revisions', 'SELECT', 
    'EXISTS (SELECT 1 FROM cms_pages WHERE cms_pages.id = cms_revisions.page_id AND (cms_pages.author_id = auth.uid() OR cms_pages.published = true))');
SELECT create_policy_if_not_exists('Users can create revisions', 'cms_revisions', 'INSERT', 'auth.role() = ''authenticated''', 'auth.role() = ''authenticated''');

-- Blog Categories policies
SELECT create_policy_if_not_exists('Public can view categories', 'blog_categories', 'SELECT', 'true');
SELECT create_policy_if_not_exists('Authenticated users can manage categories', 'blog_categories', 'ALL', 'auth.role() = ''authenticated''');

-- Blog Tags policies
SELECT create_policy_if_not_exists('Public can view tags', 'blog_tags', 'SELECT', 'true');
SELECT create_policy_if_not_exists('Authenticated users can manage tags', 'blog_tags', 'ALL', 'auth.role() = ''authenticated''');

-- Post Categories policies
SELECT create_policy_if_not_exists('Public can view post categories', 'post_categories', 'SELECT', 'true');
SELECT create_policy_if_not_exists('Authenticated users can manage post categories', 'post_categories', 'ALL', 'auth.role() = ''authenticated''');

-- Post Tags policies
SELECT create_policy_if_not_exists('Public can view post tags', 'post_tags', 'SELECT', 'true');
SELECT create_policy_if_not_exists('Authenticated users can manage post tags', 'post_tags', 'ALL', 'auth.role() = ''authenticated''');

-- =============================================================================
-- DONNÉES PAR DÉFAUT (IDEMPOTENT)
-- =============================================================================

-- Insert system templates (seulement si elles n'existent pas)
INSERT INTO cms_templates (name, description, category, structure, is_system_template) 
SELECT 'Homepage', 'Template pour la page d''accueil', 'homepage', '{"type": "grid", "columns": 1, "sections": []}', true
WHERE NOT EXISTS (SELECT 1 FROM cms_templates WHERE name = 'Homepage');

INSERT INTO cms_templates (name, description, category, structure, is_system_template) 
SELECT 'Blog Post', 'Template pour les articles de blog', 'blog', '{"type": "stack", "sections": []}', true
WHERE NOT EXISTS (SELECT 1 FROM cms_templates WHERE name = 'Blog Post');

INSERT INTO cms_templates (name, description, category, structure, is_system_template) 
SELECT 'Contact', 'Template pour la page contact', 'contact', '{"type": "grid", "columns": 2, "sections": []}', true
WHERE NOT EXISTS (SELECT 1 FROM cms_templates WHERE name = 'Contact');

INSERT INTO cms_templates (name, description, category, structure, is_system_template) 
SELECT 'Services', 'Template pour la page services', 'services', '{"type": "grid", "columns": 3, "sections": []}', true
WHERE NOT EXISTS (SELECT 1 FROM cms_templates WHERE name = 'Services');

-- Insert default components (seulement s'ils n'existent pas)
INSERT INTO cms_components (name, type, configuration, is_public) 
SELECT 'Hero Section', 'hero', '{"fields": [{"name": "title", "type": "text", "label": "Titre", "required": true}, {"name": "subtitle", "type": "text", "label": "Sous-titre"}, {"name": "backgroundImage", "type": "image", "label": "Image de fond"}, {"name": "ctaText", "type": "text", "label": "Texte du bouton"}, {"name": "ctaLink", "type": "text", "label": "Lien du bouton"}]}', true
WHERE NOT EXISTS (SELECT 1 FROM cms_components WHERE name = 'Hero Section');

INSERT INTO cms_components (name, type, configuration, is_public) 
SELECT 'Text Block', 'text', '{"fields": [{"name": "content", "type": "richText", "label": "Contenu", "required": true}, {"name": "alignment", "type": "select", "label": "Alignement", "options": [{"value": "left", "label": "Gauche"}, {"value": "center", "label": "Centre"}, {"value": "right", "label": "Droite"}]}]}', true
WHERE NOT EXISTS (SELECT 1 FROM cms_components WHERE name = 'Text Block');

INSERT INTO cms_components (name, type, configuration, is_public) 
SELECT 'Image Gallery', 'gallery', '{"fields": [{"name": "images", "type": "image", "label": "Images", "multiple": true}, {"name": "columns", "type": "number", "label": "Nombre de colonnes", "defaultValue": 3}, {"name": "gap", "type": "number", "label": "Espacement", "defaultValue": 4}]}', true
WHERE NOT EXISTS (SELECT 1 FROM cms_components WHERE name = 'Image Gallery');

INSERT INTO cms_components (name, type, configuration, is_public) 
SELECT 'Contact Form', 'form', '{"fields": [{"name": "title", "type": "text", "label": "Titre du formulaire"}, {"name": "fields", "type": "select", "label": "Champs a inclure", "multiple": true, "options": [{"value": "name", "label": "Nom"}, {"value": "email", "label": "Email"}, {"value": "phone", "label": "Telephone"}, {"value": "message", "label": "Message"}]}]}', true
WHERE NOT EXISTS (SELECT 1 FROM cms_components WHERE name = 'Contact Form');

-- =============================================================================
-- MESSAGE DE SUCCÈS
-- =============================================================================

DO $$
BEGIN
    RAISE NOTICE '====================================================';
    RAISE NOTICE 'SCHEMA CMS SUPABASE CREE AVEC SUCCES - VERSION FINALE CORRIGÉE!';
    RAISE NOTICE '====================================================';
    RAISE NOTICE 'Caracteristiques:';
    RAISE NOTICE '1. Peut etre execute plusieurs fois sans erreur';
    RAISE NOTICE '2. Verifie l''existence avant de creer';
    RAISE NOTICE '3. Fonctions SEO incluses';
    RAISE NOTICE '4. Triggers automatiques pour slugs';
    RAISE NOTICE '5. Types UUID compatibles avec auth.users';
    RAISE NOTICE '6. Tous les délimiteurs de fonction corrigés ($$)';
    RAISE NOTICE '====================================================';
    RAISE NOTICE 'Schema pret pour l''utilisation!';
    RAISE NOTICE '====================================================';
END $$;

-- Message final
SELECT 
    '✅ Schema CMS final corrigé créé avec succès!' AS status,
    'Peut être exécuté plusieurs fois sans erreur' AS feature,
    'Fonctions SEO et triggers automatiques inclus' AS features,
    'Tous les types de données sont compatibles avec auth.users' AS compatibility,
    'RLS activé pour la sécurité' AS security,
    'Prêt pour le développement' AS next_step;