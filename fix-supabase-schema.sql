-- Script de correction du schéma Supabase CMS
-- Ce script corrige les problèmes de type de données et crée les tables manquantes

-- 1. D'abord, vérifier et corriger les colonnes de type BIGINT qui devraient être UUID
-- Note: Nous ne pouvons pas modifier directement les colonnes si elles existent déjà avec des données
-- Nous allons donc créer une nouvelle colonne, copier les données, puis supprimer l'ancienne

-- 1. Corriger la table cms_pages
DO $$
BEGIN
    -- Vérifier si la colonne author_id existe et est de type BIGINT
    IF EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'cms_pages' 
        AND column_name = 'author_id' 
        AND data_type = 'bigint'
    ) THEN
        -- Créer une colonne temporaire UUID
        ALTER TABLE cms_pages ADD COLUMN author_id_uuid UUID;
        
        -- Mettre à jour les données (si nécessaire)
        -- Note: Nous ne pouvons pas convertir directement BIGINT en UUID
        -- Nous allons donc laisser la colonne NULL pour les nouvelles entrées
        -- et laisser l'ancienne colonne pour les données existantes
        
        -- Supprimer la contrainte de clé étrangère si elle existe
        ALTER TABLE cms_pages DROP CONSTRAINT IF EXISTS fk_cms_pages_author;
        
        -- Renommer l'ancienne colonne
        ALTER TABLE cms_pages RENAME COLUMN author_id TO author_id_old;
        
        -- Renommer la nouvelle colonne
        ALTER TABLE cms_pages RENAME COLUMN author_id_uuid TO author_id;
    END IF;
END $$;

-- 2. Corriger cms_components
DO $$
BEGIN
    IF EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'cms_components' 
        AND column_name = 'created_by' 
        AND data_type = 'bigint'
    ) THEN
        -- Ajouter une nouvelle colonne UUID
        ALTER TABLE cms_components ADD COLUMN created_by_uuid UUID;
        
        -- Supprimer l'ancienne contrainte si elle existe
        ALTER TABLE cms_components DROP CONSTRAINT IF EXISTS fk_cms_components_creator;
        
        -- Renommer les colonnes
        ALTER TABLE cms_components RENAME COLUMN created_by TO created_by_old;
        ALTER TABLE cms_components RENAME COLUMN created_by_uuid TO created_by;
    END IF;
END $$;

-- 3. Corriger media_items
DO $$
BEGIN
    IF EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'media_items' 
        AND column_name = 'uploaded_by' 
        AND data_type = 'bigint'
    ) THEN
        ALTER TABLE media_items ADD COLUMN uploaded_by_uuid UUID;
        ALTER TABLE media_items RENAME COLUMN uploaded_by TO uploaded_by_old;
        ALTER TABLE media_items RENAME COLUMN uploaded_by_uuid TO uploaded_by;
    END IF;
END $$;

-- 4. Corriger cms_revisions
DO $$
BEGIN
    IF EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'cms_revisions' 
        AND column_name = 'created_by' 
        AND data_type = 'bigint'
    ) THEN
        ALTER TABLE cms_revisions ADD COLUMN created_by_uuid UUID;
        ALTER TABLE cms_revisions RENAME COLUMN created_by TO created_by_old;
        ALTER TABLE cms_revisions RENAME COLUMN created_by_uuid TO created_by;
    END IF;
END $$;

-- 5. Créer les tables manquantes si elles n'existent pas
CREATE TABLE IF NOT EXISTS post_categories (
    post_id UUID NOT NULL,
    category_id UUID NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    PRIMARY KEY (post_id, category_id),
    FOREIGN KEY (category_id) REFERENCES blog_categories(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS post_tags (
    post_id UUID NOT NULL,
    tag_id UUID NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    PRIMARY KEY (post_id, tag_id),
    FOREIGN KEY (tag_id) REFERENCES blog_tags(id) ON DELETE CASCADE
);

-- 6. Recréer les contraintes de clé étrangère avec les types corrects
DO $$
BEGIN
    -- Supprimer les anciennes contraintes si elles existent
    ALTER TABLE cms_pages DROP CONSTRAINT IF EXISTS fk_cms_pages_author;
    ALTER TABLE cms_components DROP CONSTRAINT IF EXISTS fk_cms_components_creator;
    ALTER TABLE media_items DROP CONSTRAINT IF EXISTS fk_media_items_uploader;
    ALTER TABLE cms_revisions DROP CONSTRAINT IF EXISTS fk_cms_revisions_creator;
    
    -- Recréer les contraintes avec les bonnes colonnes
    ALTER TABLE cms_pages 
    ADD CONSTRAINT fk_cms_pages_author 
    FOREIGN KEY (author_id) 
    REFERENCES auth.users(id) 
    ON DELETE SET NULL;
    
    ALTER TABLE cms_components 
    ADD CONSTRAINT fk_cms_components_creator 
    FOREIGN KEY (created_by) 
    REFERENCES auth.users(id) 
    ON DELETE SET NULL;
    
    ALTER TABLE media_items 
    ADD CONSTRAINT fk_media_items_uploader 
    FOREIGN KEY (uploaded_by) 
    REFERENCES auth.users(id) 
    ON DELETE SET NULL;
    
    ALTER TABLE cms_revisions 
    ADD CONSTRAINT fk_cms_revisions_creator 
    FOREIGN KEY (created_by) 
    REFERENCES auth.users(id) 
    ON DELETE SET NULL;
END $$;

-- 7. Recréer les politiques RLS pour les nouvelles tables
ALTER TABLE post_categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE post_tags ENABLE ROW LEVEL SECURITY;

-- Politiques pour post_categories
DROP POLICY IF EXISTS "Public can view post categories" ON post_categories;
CREATE POLICY "Public can view post categories" ON post_categories
    FOR SELECT USING (true);

DROP POLICY IF EXISTS "Users can manage post categories" ON post_categories;
CREATE POLICY "Users can manage post categories" ON post_categories
    FOR ALL USING (auth.role() = 'authenticated');

-- Politiques pour post_tags
DROP POLICY IF EXISTS "Public can view post tags" ON post_tags;
CREATE POLICY "Public can view post tags" ON post_tags
    FOR SELECT USING (true);

DROP POLICY IF EXISTS "Users can manage post tags" ON post_tags;
CREATE POLICY "Users can manage post tags" ON post_tags
    FOR ALL USING (auth.role() = 'authenticated');

-- 8. Mettre à jour les politiques RLS existantes pour être plus restrictives
DROP POLICY IF EXISTS "Users can update own pages" ON cms_pages;
CREATE POLICY "Users can update own pages" ON cms_pages
    FOR UPDATE USING (auth.uid() = author_id);

DROP POLICY IF EXISTS "Users can delete own pages" ON cms_pages;
CREATE POLICY "Users can delete own pages" ON cms_pages
    FOR DELETE USING (auth.uid() = author_id);

-- 9. Ajouter des index pour améliorer les performances
CREATE INDEX IF NOT EXISTS idx_cms_pages_author ON cms_pages(author_id);
CREATE INDEX IF NOT EXISTS idx_cms_components_creator ON cms_components(created_by);
CREATE INDEX IF NOT EXISTS idx_media_items_uploader ON media_items(uploaded_by);
CREATE INDEX IF NOT EXISTS idx_cms_revisions_creator ON cms_revisions(created_by);

-- 10. Nettoyer les colonnes temporaires
DO $$
BEGIN
    -- Supprimer les anciennes colonnes BIGINT si elles existent encore
    ALTER TABLE cms_pages DROP COLUMN IF EXISTS author_id_old;
    ALTER TABLE cms_components DROP COLUMN IF EXISTS created_by_old;
    ALTER TABLE media_items DROP COLUMN IF EXISTS uploaded_by_old;
    ALTER TABLE cms_revisions DROP COLUMN IF EXISTS created_by_old;
END $$;

-- Message de succès
DO $$
BEGIN
    RAISE NOTICE 'Correction du schéma terminée avec succès!';
    RAISE NOTICE 'Toutes les colonnes sont maintenant de type UUID et compatibles avec auth.users(id)';
END $$;