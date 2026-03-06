-- CMS Database Schema Extension for Famar Wellness
-- This extends the existing Supabase schema with CMS functionality

-- 1. Table `cms_pages` - Pages du site
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

-- 2. Table `cms_templates` - Templates de pages
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

-- 3. Table `cms_components` - Composants réutilisables
CREATE TABLE IF NOT EXISTS cms_components (
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

-- 4. Table `media_items` - Gestion des médias
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
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 5. Table `media_usage` - Tracking d'utilisation des médias
CREATE TABLE IF NOT EXISTS media_usage (
  media_id UUID REFERENCES media_items(id) ON DELETE CASCADE,
  entity_type TEXT NOT NULL, -- 'page', 'post', 'component'
  entity_id TEXT NOT NULL, -- UUID ou ID selon l'entité
  usage_context TEXT, -- 'hero', 'content', 'thumbnail'
  created_at TIMESTAMPTZ DEFAULT NOW(),
  PRIMARY KEY (media_id, entity_type, entity_id)
);

-- 6. Table `blog_categories` - Catégories de blog
CREATE TABLE IF NOT EXISTS blog_categories (
  id BIGSERIAL PRIMARY KEY,
  name TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  description TEXT,
  parent_id BIGINT REFERENCES blog_categories(id),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 7. Table `blog_tags` - Tags de blog
CREATE TABLE IF NOT EXISTS blog_tags (
  id BIGSERIAL PRIMARY KEY,
  name TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 8. Table `post_categories` - Liaison posts-catégories
CREATE TABLE IF NOT EXISTS post_categories (
  post_id BIGINT REFERENCES posts(id) ON DELETE CASCADE,
  category_id BIGINT REFERENCES blog_categories(id) ON DELETE CASCADE,
  PRIMARY KEY (post_id, category_id)
);

-- 9. Table `post_tags` - Liaison posts-tags
CREATE TABLE IF NOT EXISTS post_tags (
  post_id BIGINT REFERENCES posts(id) ON DELETE CASCADE,
  tag_id BIGINT REFERENCES blog_tags(id) ON DELETE CASCADE,
  PRIMARY KEY (post_id, tag_id)
);

-- 10. Table `cms_revisions` - Historique des révisions
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
-- INDEXES pour optimiser les performances
-- ============================================

-- Index pour cms_pages
CREATE INDEX IF NOT EXISTS idx_cms_pages_slug ON cms_pages(slug);
CREATE INDEX IF NOT EXISTS idx_cms_pages_published ON cms_pages(published);
CREATE INDEX IF NOT EXISTS idx_cms_pages_author ON cms_pages(author_id);
CREATE INDEX IF NOT EXISTS idx_cms_pages_created_at ON cms_pages(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_cms_pages_template ON cms_pages(template_id);

-- Index pour cms_templates
CREATE INDEX IF NOT EXISTS idx_cms_templates_category ON cms_templates(category);
CREATE INDEX IF NOT EXISTS idx_cms_templates_system ON cms_templates(is_system_template);

-- Index pour cms_components
CREATE INDEX IF NOT EXISTS idx_cms_components_type ON cms_components(type);
CREATE INDEX IF NOT EXISTS idx_cms_components_created_by ON cms_components(created_by);
CREATE INDEX IF NOT EXISTS idx_cms_components_is_public ON cms_components(is_public);

-- Index pour media_items
CREATE INDEX IF NOT EXISTS idx_media_items_mime_type ON media_items(mime_type);
CREATE INDEX IF NOT EXISTS idx_media_items_uploaded_by ON media_items(uploaded_by);
CREATE INDEX IF NOT EXISTS idx_media_items_created_at ON media_items(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_media_items_file_size ON media_items(file_size);

-- Index pour media_usage
CREATE INDEX IF NOT EXISTS idx_media_usage_entity ON media_usage(entity_type, entity_id);
CREATE INDEX IF NOT EXISTS idx_media_usage_context ON media_usage(usage_context);

-- Index pour blog_categories
CREATE INDEX IF NOT EXISTS idx_blog_categories_slug ON blog_categories(slug);
CREATE INDEX IF NOT EXISTS idx_blog_categories_parent ON blog_categories(parent_id);

-- Index pour blog_tags
CREATE INDEX IF NOT EXISTS idx_blog_tags_slug ON blog_tags(slug);

-- Index pour cms_revisions
CREATE INDEX IF NOT EXISTS idx_cms_revisions_entity ON cms_revisions(entity_type, entity_id);
CREATE INDEX IF NOT EXISTS idx_cms_revisions_version ON cms_revisions(version DESC);
CREATE INDEX IF NOT EXISTS idx_cms_revisions_created_by ON cms_revisions(created_by);

-- ============================================
-- EXTENSION de la table posts existante
-- ============================================

-- Ajouter les colonnes manquantes à la table posts existante
ALTER TABLE posts ADD COLUMN IF NOT EXISTS meta_title TEXT;
ALTER TABLE posts ADD COLUMN IF NOT EXISTS meta_description TEXT;
ALTER TABLE posts ADD COLUMN IF NOT EXISTS featured_image_id UUID REFERENCES media_items(id);
ALTER TABLE posts ADD COLUMN IF NOT EXISTS author_id BIGINT REFERENCES users(id);
ALTER TABLE posts ADD COLUMN IF NOT EXISTS reading_time INTEGER; -- en minutes

-- Index supplémentaires pour posts
CREATE INDEX IF NOT EXISTS idx_posts_author ON posts(author_id);
CREATE INDEX IF NOT EXISTS idx_posts_featured_image ON posts(featured_image_id);
CREATE INDEX IF NOT EXISTS idx_posts_reading_time ON posts(reading_time);

-- ============================================
-- CONTRAINTES et TRIGGERS
-- ============================================

-- Contrainte pour s'assurer que les slugs sont uniques
ALTER TABLE cms_pages ADD CONSTRAINT unique_cms_page_slug UNIQUE (slug);
ALTER TABLE blog_categories ADD CONSTRAINT unique_blog_category_slug UNIQUE (slug);
ALTER TABLE blog_tags ADD CONSTRAINT unique_blog_tag_slug UNIQUE (slug);

-- Trigger pour mettre à jour updated_at automatiquement
CREATE OR REPLACE FUNCTION update_cms_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Triggers pour les tables CMS
CREATE TRIGGER update_cms_pages_updated_at 
  BEFORE UPDATE ON cms_pages 
  FOR EACH ROW EXECUTE FUNCTION update_cms_updated_at();

CREATE TRIGGER update_cms_templates_updated_at 
  BEFORE UPDATE ON cms_templates 
  FOR EACH ROW EXECUTE FUNCTION update_cms_updated_at();

CREATE TRIGGER update_cms_components_updated_at 
  BEFORE UPDATE ON cms_components 
  FOR EACH ROW EXECUTE FUNCTION update_cms_updated_at();

CREATE TRIGGER update_media_items_updated_at 
  BEFORE UPDATE ON media_items 
  FOR EACH ROW EXECUTE FUNCTION update_cms_updated_at();

-- ============================================
-- RLS (Row Level Security) POLICIES
-- ============================================

-- Activer RLS pour toutes les nouvelles tables
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

-- Politiques RLS pour cms_pages
-- Pages publiées sont visibles par tous, autres seulement par authentifiés
CREATE POLICY "Published pages are viewable by everyone" ON cms_pages
  FOR SELECT USING (published = true OR auth.role() = 'authenticated');

CREATE POLICY "Authenticated users can manage pages" ON cms_pages
  FOR ALL USING (auth.role() = 'authenticated');

-- Politiques RLS pour cms_templates
CREATE POLICY "Authenticated users can manage templates" ON cms_templates
  FOR ALL USING (auth.role() = 'authenticated');

-- Politiques RLS pour cms_components
-- Composants publics sont visibles par tous, autres seulement par authentifiés
CREATE POLICY "Public components are viewable by everyone" ON cms_components
  FOR SELECT USING (is_public = true OR auth.role() = 'authenticated');

CREATE POLICY "Authenticated users can manage components" ON cms_components
  FOR ALL USING (auth.role() = 'authenticated');

-- Politiques RLS pour media_items
CREATE POLICY "Authenticated users can manage media" ON media_items
  FOR ALL USING (auth.role() = 'authenticated');

-- Politiques RLS pour media_usage
CREATE POLICY "Authenticated users can manage media usage" ON media_usage
  FOR ALL USING (auth.role() = 'authenticated');

-- Politiques RLS pour blog_categories
CREATE POLICY "Blog categories are viewable by everyone" ON blog_categories
  FOR SELECT USING (true);

CREATE POLICY "Authenticated users can manage categories" ON blog_categories
  FOR ALL USING (auth.role() = 'authenticated');

-- Politiques RLS pour blog_tags
CREATE POLICY "Blog tags are viewable by everyone" ON blog_tags
  FOR SELECT USING (true);

CREATE POLICY "Authenticated users can manage tags" ON blog_tags
  FOR ALL USING (auth.role() = 'authenticated');

-- Politiques RLS pour post_categories et post_tags
CREATE POLICY "Authenticated users can manage post relations" ON post_categories
  FOR ALL USING (auth.role() = 'authenticated');

CREATE POLICY "Authenticated users can manage post tags" ON post_tags
  FOR ALL USING (auth.role() = 'authenticated');

-- Politiques RLS pour cms_revisions
CREATE POLICY "Authenticated users can manage revisions" ON cms_revisions
  FOR ALL USING (auth.role() = 'authenticated');

-- ============================================
-- FONCTIONS UTILITAIRES
-- ============================================

-- Fonction pour générer un slug à partir d'un titre
CREATE OR REPLACE FUNCTION generate_slug(title TEXT)
RETURNS TEXT AS $$
BEGIN
  RETURN LOWER(
    REGEXP_REPLACE(
      REGEXP_REPLACE(title, '[^a-zA-Z0-9\s-]', '', 'g'),
      '\s+', '-', 'g'
    )
  );
END;
$$ LANGUAGE plpgsql IMMUTABLE;

-- Fonction pour calculer le temps de lecture d'un article
CREATE OR REPLACE FUNCTION calculate_reading_time(content TEXT)
RETURNS INTEGER AS $$
DECLARE
  word_count INTEGER;
  reading_time_minutes INTEGER;
BEGIN
  -- Compter les mots (approximatif)
  word_count := array_length(regexp_split_to_array(trim(content), '\s+'), 1);
  
  -- 200 mots par minute en moyenne
  reading_time_minutes := CEIL(word_count::FLOAT / 200);
  
  -- Minimum 1 minute
  RETURN GREATEST(reading_time_minutes, 1);
END;
$$ LANGUAGE plpgsql IMMUTABLE;

-- ============================================
-- DONNÉES INITIALES
-- ============================================

-- Templates système par défaut
INSERT INTO cms_templates (id, name, description, category, structure, is_system_template) VALUES
(
  '00000000-0000-0000-0000-000000000001',
  'Page d''accueil',
  'Template pour la page d''accueil principale',
  'homepage',
  '{"type": "grid", "columns": 1, "sections": [{"id": "hero", "type": "hero", "components": []}, {"id": "content", "type": "content", "components": []}]}',
  true
),
(
  '00000000-0000-0000-0000-000000000002',
  'Article de blog',
  'Template pour les articles de blog',
  'blog',
  '{"type": "stack", "sections": [{"id": "header", "type": "header", "components": []}, {"id": "content", "type": "content", "components": []}, {"id": "sidebar", "type": "sidebar", "components": []}]}',
  true
),
(
  '00000000-0000-0000-0000-000000000003',
  'Page de contact',
  'Template pour la page de contact',
  'contact',
  '{"type": "grid", "columns": 2, "sections": [{"id": "form", "type": "form", "components": []}, {"id": "info", "type": "info", "components": []}]}',
  true
)
ON CONFLICT (id) DO NOTHING;

-- Composants système par défaut
INSERT INTO cms_components (id, name, type, configuration, is_public, created_by) VALUES
(
  '00000000-0000-0000-0000-000000000101',
  'Hero Section',
  'hero',
  '{"fields": [{"name": "title", "type": "text", "label": "Titre", "required": true}, {"name": "subtitle", "type": "text", "label": "Sous-titre"}, {"name": "backgroundImage", "type": "image", "label": "Image de fond"}, {"name": "ctaText", "type": "text", "label": "Texte du bouton"}, {"name": "ctaLink", "type": "text", "label": "Lien du bouton"}]}',
  true,
  1
),
(
  '00000000-0000-0000-0000-000000000102',
  'Text Block',
  'text',
  '{"fields": [{"name": "content", "type": "richText", "label": "Contenu", "required": true}, {"name": "alignment", "type": "select", "label": "Alignement", "options": [{"value": "left", "label": "Gauche"}, {"value": "center", "label": "Centre"}, {"value": "right", "label": "Droite"}]}]}',
  true,
  1
),
(
  '00000000-0000-0000-0000-000000000103',
  'Image Gallery',
  'gallery',
  '{"fields": [{"name": "images", "type": "image", "label": "Images", "multiple": true}, {"name": "columns", "type": "number", "label": "Nombre de colonnes", "defaultValue": 3, "min": 1, "max": 6}]}',
  true,
  1
)
ON CONFLICT (id) DO NOTHING;

-- Catégories de blog par défaut
INSERT INTO blog_categories (name, slug, description) VALUES
('Bien-être', 'bien-etre', 'Articles sur le bien-être et la santé'),
('Nutrition', 'nutrition', 'Conseils nutritionnels et recettes'),
('Fitness', 'fitness', 'Exercices et programmes de fitness'),
('Méditation', 'meditation', 'Techniques de méditation et relaxation')
ON CONFLICT (slug) DO NOTHING;

-- ============================================
-- CONTRAINTES D'INTÉGRITÉ SUPPLÉMENTAIRES
-- ============================================

-- Contrainte pour s'assurer que les slugs ne sont pas vides
ALTER TABLE cms_pages ADD CONSTRAINT cms_pages_slug_not_empty CHECK (slug <> '');
ALTER TABLE blog_categories ADD CONSTRAINT blog_categories_slug_not_empty CHECK (slug <> '');
ALTER TABLE blog_tags ADD CONSTRAINT blog_tags_slug_not_empty CHECK (slug <> '');

-- Contrainte pour les tailles de fichiers raisonnables
ALTER TABLE media_items ADD CONSTRAINT media_items_file_size_positive CHECK (file_size > 0);
ALTER TABLE media_items ADD CONSTRAINT media_items_file_size_max CHECK (file_size <= 104857600); -- 100MB max

-- Contraintes pour les dimensions d'images
ALTER TABLE media_items ADD CONSTRAINT media_items_width_positive CHECK (width IS NULL OR width > 0);
ALTER TABLE media_items ADD CONSTRAINT media_items_height_positive CHECK (height IS NULL OR height > 0);

-- Contrainte pour les versions positives
ALTER TABLE cms_pages ADD CONSTRAINT cms_pages_version_positive CHECK (version > 0);
ALTER TABLE cms_revisions ADD CONSTRAINT cms_revisions_version_positive CHECK (version > 0);

-- Contrainte pour les temps de lecture raisonnables
ALTER TABLE posts ADD CONSTRAINT posts_reading_time_positive CHECK (reading_time IS NULL OR reading_time > 0);

-- ============================================
-- TRIGGERS SUPPLÉMENTAIRES
-- ============================================

-- Trigger pour générer automatiquement un slug si non fourni
CREATE OR REPLACE FUNCTION generate_page_slug()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.slug IS NULL OR NEW.slug = '' THEN
    NEW.slug := generate_slug(NEW.title);
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER generate_cms_page_slug 
  BEFORE INSERT ON cms_pages 
  FOR EACH ROW EXECUTE FUNCTION generate_page_slug();

-- Trigger pour générer automatiquement un slug pour les catégories
CREATE OR REPLACE FUNCTION generate_category_slug()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.slug IS NULL OR NEW.slug = '' THEN
    NEW.slug := generate_slug(NEW.name);
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER generate_blog_category_slug 
  BEFORE INSERT ON blog_categories 
  FOR EACH ROW EXECUTE FUNCTION generate_category_slug();

-- Trigger pour générer automatiquement un slug pour les tags
CREATE OR REPLACE FUNCTION generate_tag_slug()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.slug IS NULL OR NEW.slug = '' THEN
    NEW.slug := generate_slug(NEW.name);
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER generate_blog_tag_slug 
  BEFORE INSERT ON blog_tags 
  FOR EACH ROW EXECUTE FUNCTION generate_tag_slug();

-- Trigger pour calculer automatiquement le temps de lecture des articles
CREATE OR REPLACE FUNCTION calculate_post_reading_time()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.content IS NOT NULL AND (NEW.reading_time IS NULL OR TG_OP = 'INSERT') THEN
    NEW.reading_time := calculate_reading_time(NEW.content);
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER calculate_post_reading_time_trigger 
  BEFORE INSERT OR UPDATE ON posts 
  FOR EACH ROW EXECUTE FUNCTION calculate_post_reading_time();

-- Trigger pour mettre à jour published_at lors de la publication
CREATE OR REPLACE FUNCTION update_published_at()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.published = true AND OLD.published = false THEN
    NEW.published_at := NOW();
  ELSIF NEW.published = false THEN
    NEW.published_at := NULL;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_cms_page_published_at 
  BEFORE UPDATE ON cms_pages 
  FOR EACH ROW EXECUTE FUNCTION update_published_at();

CREATE TRIGGER update_post_published_at 
  BEFORE UPDATE ON posts 
  FOR EACH ROW EXECUTE FUNCTION update_published_at();

-- ============================================
-- VUES UTILITAIRES
-- ============================================

-- Vue pour les statistiques CMS
CREATE OR REPLACE VIEW cms_stats AS
SELECT 
  (SELECT COUNT(*) FROM cms_pages WHERE published = true) as published_pages,
  (SELECT COUNT(*) FROM cms_pages WHERE published = false) as draft_pages,
  (SELECT COUNT(*) FROM media_items) as total_media,
  (SELECT COUNT(*) FROM cms_components WHERE is_public = true) as public_components,
  (SELECT COUNT(*) FROM cms_templates) as total_templates;

-- Vue pour les articles de blog avec leurs catégories et tags
CREATE OR REPLACE VIEW blog_posts_with_details AS
SELECT 
  p.*,
  COALESCE(json_agg(DISTINCT jsonb_build_object('id', c.id, 'name', c.name, 'slug', c.slug)) FILTER (WHERE c.id IS NOT NULL), '[]') as categories,
  COALESCE(json_agg(DISTINCT jsonb_build_object('id', t.id, 'name', t.name, 'slug', t.slug)) FILTER (WHERE t.id IS NOT NULL), '[]') as tags,
  m.filename as featured_image_filename,
  m.file_path as featured_image_path
FROM posts p
LEFT JOIN post_categories pc ON p.id = pc.post_id
LEFT JOIN blog_categories c ON pc.category_id = c.id
LEFT JOIN post_tags pt ON p.id = pt.post_id
LEFT JOIN blog_tags t ON pt.tag_id = t.id
LEFT JOIN media_items m ON p.featured_image_id = m.id
GROUP BY p.id, m.id;

-- Vue pour l'utilisation des médias
CREATE OR REPLACE VIEW media_usage_summary AS
SELECT 
  m.*,
  COUNT(mu.media_id) as usage_count,
  json_agg(DISTINCT jsonb_build_object('entity_type', mu.entity_type, 'entity_id', mu.entity_id, 'context', mu.usage_context)) as usage_details
FROM media_items m
LEFT JOIN media_usage mu ON m.id = mu.media_id
GROUP BY m.id;

-- ============================================
-- COMMENTAIRES POUR LA DOCUMENTATION
-- ============================================

COMMENT ON TABLE cms_pages IS 'Pages du site web gérées par le CMS';
COMMENT ON TABLE cms_templates IS 'Templates de mise en page pour les pages';
COMMENT ON TABLE cms_components IS 'Composants réutilisables pour la construction de pages';
COMMENT ON TABLE media_items IS 'Fichiers multimédias (images, documents, etc.)';
COMMENT ON TABLE media_usage IS 'Tracking de l''utilisation des médias dans le contenu';
COMMENT ON TABLE blog_categories IS 'Catégories hiérarchiques pour les articles de blog';
COMMENT ON TABLE blog_tags IS 'Tags pour les articles de blog';
COMMENT ON TABLE cms_revisions IS 'Historique des révisions du contenu';

COMMENT ON COLUMN cms_pages.content IS 'Structure JSON du contenu de la page';
COMMENT ON COLUMN cms_templates.structure IS 'Définition JSON de la structure du template';
COMMENT ON COLUMN cms_components.configuration IS 'Configuration JSON des champs du composant';
COMMENT ON COLUMN media_items.file_path IS 'Chemin relatif dans le stockage Supabase';
COMMENT ON COLUMN posts.reading_time IS 'Temps de lecture estimé en minutes';

-- ============================================
-- MESSAGE DE CONFIRMATION
-- ============================================

DO $do$
BEGIN
  RAISE NOTICE 'Schéma CMS créé avec succès!';
  RAISE NOTICE 'Tables créées: cms_pages, cms_templates, cms_components, media_items, media_usage, blog_categories, blog_tags, post_categories, post_tags, cms_revisions';
  RAISE NOTICE 'Index créés: 20+ index pour optimiser les performances';
  RAISE NOTICE 'Contraintes ajoutées: intégrité référentielle, validation des données';
  RAISE NOTICE 'Triggers configurés: updated_at, slugs automatiques, temps de lecture';
  RAISE NOTICE 'RLS activé: politiques de sécurité pour toutes les tables';
  RAISE NOTICE 'Données initiales: templates et composants système insérés';
END
$do$;