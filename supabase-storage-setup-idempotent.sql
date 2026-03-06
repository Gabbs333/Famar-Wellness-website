-- Supabase Storage Configuration for CMS Media Management - Version Idempotente
-- Ce script configure les buckets de stockage et les politiques sans erreur
-- Tous les délimiteurs de fonction corrigés ($$ au lieu de $)

-- ============================================
-- CRÉATION DES BUCKETS DE STOCKAGE
-- ============================================

-- Note: Dans Supabase, les buckets sont généralement créés via l'API ou le Dashboard
-- Ce script utilise une approche sécurisée pour éviter les erreurs

-- 1. Vérifier et créer le bucket 'cms-images' (public)
DO $$
BEGIN
    -- Vérifier si le bucket existe déjà
    IF NOT EXISTS (SELECT 1 FROM storage.buckets WHERE id = 'cms-images') THEN
        -- Créer le bucket
        INSERT INTO storage.buckets (id, name, public) 
        VALUES ('cms-images', 'cms-images', true);
        RAISE NOTICE 'Bucket cms-images créé (public)';
    ELSE
        -- Mettre à jour si nécessaire
        UPDATE storage.buckets 
        SET public = true 
        WHERE id = 'cms-images';
        RAISE NOTICE 'Bucket cms-images déjà existant, mis à jour';
    END IF;
END $$;

-- 2. Vérifier et créer le bucket 'cms-documents' (privé)
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM storage.buckets WHERE id = 'cms-documents') THEN
        INSERT INTO storage.buckets (id, name, public) 
        VALUES ('cms-documents', 'cms-documents', false);
        RAISE NOTICE 'Bucket cms-documents créé (privé)';
    ELSE
        UPDATE storage.buckets 
        SET public = false 
        WHERE id = 'cms-documents';
        RAISE NOTICE 'Bucket cms-documents déjà existant, mis à jour';
    END IF;
END $$;

-- 3. Vérifier et créer le bucket 'cms-media' (privé)
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM storage.buckets WHERE id = 'cms-media') THEN
        INSERT INTO storage.buckets (id, name, public) 
        VALUES ('cms-media', 'cms-media', false);
        RAISE NOTICE 'Bucket cms-media créé (privé)';
    ELSE
        UPDATE storage.buckets 
        SET public = false 
        WHERE id = 'cms-media';
        RAISE NOTICE 'Bucket cms-media déjà existant, mis à jour';
    END IF;
END $$;

-- ============================================
-- SUPPRIMER LES ANCIENNES POLITIQUES (si elles existent)
-- ============================================

-- Supprimer toutes les anciennes politiques pour éviter les conflits
DO $$
BEGIN
    -- Supprimer les politiques pour cms-images
    DROP POLICY IF EXISTS "Public images are viewable by everyone" ON storage.objects;
    DROP POLICY IF EXISTS "Authenticated users can upload images" ON storage.objects;
    DROP POLICY IF EXISTS "Authenticated users can update images" ON storage.objects;
    DROP POLICY IF EXISTS "Authenticated users can delete images" ON storage.objects;
    
    -- Supprimer les politiques pour cms-documents
    DROP POLICY IF EXISTS "Authenticated users can view documents" ON storage.objects;
    DROP POLICY IF EXISTS "Authenticated users can upload documents" ON storage.objects;
    DROP POLICY IF EXISTS "Authenticated users can update documents" ON storage.objects;
    DROP POLICY IF EXISTS "Authenticated users can delete documents" ON storage.objects;
    
    -- Supprimer les politiques pour cms-media
    DROP POLICY IF EXISTS "Authenticated users can view media" ON storage.objects;
    DROP POLICY IF EXISTS "Authenticated users can upload media" ON storage.objects;
    DROP POLICY IF EXISTS "Authenticated users can update media" ON storage.objects;
    DROP POLICY IF EXISTS "Authenticated users can delete media" ON storage.objects;
    
    RAISE NOTICE 'Anciennes politiques supprimées (si elles existaient)';
END $$;

-- ============================================
-- POLITIQUES DE STOCKAGE POUR LE BUCKET 'cms-images'
-- ============================================

-- Politique 1: Tout le monde peut voir les images (bucket public)
CREATE POLICY "Public images are viewable by everyone"
ON storage.objects FOR SELECT
USING (bucket_id = 'cms-images');

-- Politique 2: Les utilisateurs authentifiés peuvent uploader des images
CREATE POLICY "Authenticated users can upload images"
ON storage.objects FOR INSERT
WITH CHECK (
    bucket_id = 'cms-images' 
    AND auth.role() = 'authenticated'
);

-- Politique 3: Les utilisateurs authentifiés peuvent mettre à jour leurs propres images
CREATE POLICY "Authenticated users can update images"
ON storage.objects FOR UPDATE
USING (
    bucket_id = 'cms-images' 
    AND auth.role() = 'authenticated'
    -- Vérifier que l'utilisateur est propriétaire du fichier
    AND (owner = auth.uid() OR (storage.foldername(name))[1] = auth.uid()::text)
);

-- Politique 4: Les utilisateurs authentifiés peuvent supprimer leurs propres images
CREATE POLICY "Authenticated users can delete images"
ON storage.objects FOR DELETE
USING (
    bucket_id = 'cms-images' 
    AND auth.role() = 'authenticated'
    -- Vérifier que l'utilisateur est propriétaire du fichier
    AND (owner = auth.uid() OR (storage.foldername(name))[1] = auth.uid()::text)
);

-- ============================================
-- POLITIQUES DE STOCKAGE POUR LE BUCKET 'cms-documents'
-- ============================================

-- Politique 1: Les utilisateurs authentifiés peuvent voir les documents
CREATE POLICY "Authenticated users can view documents"
ON storage.objects FOR SELECT
USING (
    bucket_id = 'cms-documents' 
    AND auth.role() = 'authenticated'
);

-- Politique 2: Les utilisateurs authentifiés peuvent uploader des documents
CREATE POLICY "Authenticated users can upload documents"
ON storage.objects FOR INSERT
WITH CHECK (
    bucket_id = 'cms-documents' 
    AND auth.role() = 'authenticated'
);

-- Politique 3: Les utilisateurs authentifiés peuvent mettre à jour leurs propres documents
CREATE POLICY "Authenticated users can update documents"
ON storage.objects FOR UPDATE
USING (
    bucket_id = 'cms-documents' 
    AND auth.role() = 'authenticated'
    AND (owner = auth.uid() OR (storage.foldername(name))[1] = auth.uid()::text)
);

-- Politique 4: Les utilisateurs authentifiés peuvent supprimer leurs propres documents
CREATE POLICY "Authenticated users can delete documents"
ON storage.objects FOR DELETE
USING (
    bucket_id = 'cms-documents' 
    AND auth.role() = 'authenticated'
    AND (owner = auth.uid() OR (storage.foldername(name))[1] = auth.uid()::text)
);

-- ============================================
-- POLITIQUES DE STOCKAGE POUR LE BUCKET 'cms-media'
-- ============================================

-- Politique 1: Les utilisateurs authentifiés peuvent voir les médias
CREATE POLICY "Authenticated users can view media"
ON storage.objects FOR SELECT
USING (
    bucket_id = 'cms-media' 
    AND auth.role() = 'authenticated'
);

-- Politique 2: Les utilisateurs authentifiés peuvent uploader des médias
CREATE POLICY "Authenticated users can upload media"
ON storage.objects FOR INSERT
WITH CHECK (
    bucket_id = 'cms-media' 
    AND auth.role() = 'authenticated'
);

-- Politique 3: Les utilisateurs authentifiés peuvent mettre à jour leurs propres médias
CREATE POLICY "Authenticated users can update media"
ON storage.objects FOR UPDATE
USING (
    bucket_id = 'cms-media' 
    AND auth.role() = 'authenticated'
    AND (owner = auth.uid() OR (storage.foldername(name))[1] = auth.uid()::text)
);

-- Politique 4: Les utilisateurs authentifiés peuvent supprimer leurs propres médias
CREATE POLICY "Authenticated users can delete media"
ON storage.objects FOR DELETE
USING (
    bucket_id = 'cms-media' 
    AND auth.role() = 'authenticated'
    AND (owner = auth.uid() OR (storage.foldername(name))[1] = auth.uid()::text)
);

-- ============================================
-- FONCTIONS D'ORGANISATION DU STOCKAGE (corrigées)
-- ============================================

-- Fonction pour générer une structure de dossiers organisée (version corrigée)
CREATE OR REPLACE FUNCTION generate_media_folder_path(
    user_id UUID, -- Changé de BIGINT à UUID
    media_type TEXT,
    original_filename TEXT
)
RETURNS TEXT AS $$
DECLARE
    folder_path TEXT;
    file_ext TEXT;
    timestamp TEXT;
    safe_filename TEXT;
    filename_without_ext TEXT;
BEGIN
    -- Obtenir l'extension du fichier
    file_ext := LOWER(SUBSTRING(original_filename FROM '\.([^\.]+)$'));
    
    -- Si pas d'extension, utiliser 'bin'
    IF file_ext IS NULL OR file_ext = '' THEN
        file_ext := 'bin';
    END IF;
    
    -- Générer un timestamp pour l'unicité
    timestamp := TO_CHAR(NOW(), 'YYYYMMDD_HH24MISS');
    
    -- Obtenir le nom de fichier sans extension
    filename_without_ext := SUBSTRING(original_filename FROM '^([^\.]+)');
    IF filename_without_ext IS NULL THEN
        filename_without_ext := 'file';
    END IF;
    
    -- Créer un nom de fichier sécurisé (supprimer les caractères spéciaux)
    safe_filename := REGEXP_REPLACE(
        filename_without_ext,
        '[^a-zA-Z0-9_-]',
        '_',
        'g'
    );
    
    -- Construire le chemin du dossier: user_id/media_type/YYYY/MM/DD/filename_timestamp.ext
    folder_path := format('%s/%s/%s/%s/%s/%s_%s.%s',
        user_id,
        media_type,
        EXTRACT(YEAR FROM NOW()),
        LPAD(EXTRACT(MONTH FROM NOW())::TEXT, 2, '0'),
        LPAD(EXTRACT(DAY FROM NOW())::TEXT, 2, '0'),
        safe_filename,
        timestamp,
        file_ext
    );
    
    RETURN folder_path;
END;
$$ LANGUAGE plpgsql IMMUTABLE;

-- Fonction pour obtenir le type de média à partir du type MIME
CREATE OR REPLACE FUNCTION get_media_type_from_mime(mime_type TEXT)
RETURNS TEXT AS $$
BEGIN
    RETURN CASE
        WHEN mime_type LIKE 'image/%' THEN 'images'
        WHEN mime_type LIKE 'video/%' THEN 'videos'
        WHEN mime_type LIKE 'audio/%' THEN 'audio'
        WHEN mime_type IN (
            'application/pdf',
            'application/msword',
            'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
            'application/vnd.ms-excel',
            'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
            'application/vnd.ms-powerpoint',
            'application/vnd.openxmlformats-officedocument.presentationml.presentation'
        ) THEN 'documents'
        ELSE 'other'
    END;
END;
$$ LANGUAGE plpgsql IMMUTABLE;

-- ============================================
-- CONFIGURATION DES TRANSFORMATIONS D'IMAGES
-- ============================================

-- Table pour stocker les configurations de transformation d'images
CREATE TABLE IF NOT EXISTS image_transformations (
    id BIGSERIAL PRIMARY KEY,
    name TEXT NOT NULL UNIQUE, -- Ajouté UNIQUE pour ON CONFLICT
    width INTEGER,
    height INTEGER,
    quality INTEGER DEFAULT 80,
    format TEXT DEFAULT 'webp',
    fit TEXT DEFAULT 'cover', -- 'cover', 'contain', 'fill'
    is_default BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Transformations d'images par défaut (avec ON CONFLICT correct)
INSERT INTO image_transformations (name, width, height, quality, format, fit, is_default) VALUES
('thumbnail', 150, 150, 80, 'webp', 'cover', true),
('small', 300, 300, 85, 'webp', 'cover', true),
('medium', 600, 600, 90, 'webp', 'cover', true),
('large', 1200, 1200, 90, 'webp', 'cover', true),
('xlarge', 1920, 1080, 95, 'webp', 'cover', true)
ON CONFLICT (name) DO UPDATE SET
    width = EXCLUDED.width,
    height = EXCLUDED.height,
    quality = EXCLUDED.quality,
    format = EXCLUDED.format,
    fit = EXCLUDED.fit,
    is_default = EXCLUDED.is_default;

-- ============================================
-- SURVEILLANCE DE L'UTILISATION DU STOCKAGE
-- ============================================

-- Vue pour surveiller l'utilisation du stockage par utilisateur
CREATE OR REPLACE VIEW storage_usage_by_user AS
SELECT 
    uploaded_by as user_id,
    COUNT(*) as file_count,
    SUM(file_size) as total_size_bytes,
    ROUND(SUM(file_size) / 1048576.0, 2) as total_size_mb,
    get_media_type_from_mime(mime_type) as media_type
FROM media_items
GROUP BY uploaded_by, get_media_type_from_mime(mime_type)
ORDER BY total_size_bytes DESC;

-- Vue pour surveiller l'utilisation du stockage par type de média
CREATE OR REPLACE VIEW storage_usage_by_type AS
SELECT 
    get_media_type_from_mime(mime_type) as media_type,
    COUNT(*) as file_count,
    SUM(file_size) as total_size_bytes,
    ROUND(SUM(file_size) / 1048576.0, 2) as total_size_mb,
    ROUND(AVG(file_size) / 1024.0, 2) as avg_size_kb
FROM media_items
GROUP BY get_media_type_from_mime(mime_type)
ORDER BY total_size_bytes DESC;

-- ============================================
-- FONCTIONS DE NETTOYAGE ET DE MAINTENANCE
-- ============================================

-- Fonction pour trouver et signaler les fichiers multimédias inutilisés
CREATE OR REPLACE FUNCTION find_unused_media(days_old INTEGER DEFAULT 30)
RETURNS TABLE (
    media_id UUID,
    filename TEXT,
    file_size BIGINT,
    created_at TIMESTAMPTZ,
    days_unused INTEGER
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        mi.id,
        mi.filename,
        mi.file_size,
        mi.created_at,
        EXTRACT(DAY FROM NOW() - mi.created_at)::INTEGER as days_unused
    FROM media_items mi
    LEFT JOIN media_usage mu ON mi.id = mu.media_id
    WHERE mu.media_id IS NULL
        AND mi.created_at < NOW() - (days_old || ' days')::INTERVAL
    ORDER BY mi.created_at ASC;
END;
$$ LANGUAGE plpgsql;

-- Fonction pour nettoyer les fichiers de stockage orphelins
CREATE OR REPLACE FUNCTION cleanup_orphaned_media(days_old INTEGER DEFAULT 90)
RETURNS INTEGER AS $$
DECLARE
    deleted_count INTEGER;
BEGIN
    -- Trouver les éléments multimédias sans utilisation et plus anciens que le nombre de jours spécifié
    WITH orphaned_media AS (
        SELECT mi.id, mi.storage_path
        FROM media_items mi
        LEFT JOIN media_usage mu ON mi.id = mu.media_id
        WHERE mu.media_id IS NULL
            AND mi.created_at < NOW() - (days_old || ' days')::INTERVAL
    )
    -- Supprimer de la base de données (les fichiers de stockage nécessiteraient un nettoyage séparé)
    DELETE FROM media_items
    WHERE id IN (SELECT id FROM orphaned_media)
    RETURNING COUNT(*) INTO deleted_count;
    
    RETURN deleted_count;
END;
$$ LANGUAGE plpgsql;

-- ============================================
-- MESSAGE DE CONFIRMATION
-- ============================================

DO $$
BEGIN
    RAISE NOTICE '========================================';
    RAISE NOTICE 'CONFIGURATION DU STOCKAGE SUPABASE TERMINÉE!';
    RAISE NOTICE '========================================';
    RAISE NOTICE 'Buckets configurés:';
    RAISE NOTICE '  - cms-images (public)';
    RAISE NOTICE '  - cms-documents (privé)';
    RAISE NOTICE '  - cms-media (privé)';
    RAISE NOTICE '';
    RAISE NOTICE 'Politiques de sécurité:';
    RAISE NOTICE '  - Lecture/écriture basées sur l''authentification';
    RAISE NOTICE '  - Vérification de propriété des fichiers';
    RAISE NOTICE '';
    RAISE NOTICE 'Fonctions utilitaires:';
    RAISE NOTICE '  - Organisation automatique des fichiers';
    RAISE NOTICE '  - Transformations d''images configurées';
    RAISE NOTICE '  - Surveillance de l''utilisation';
    RAISE NOTICE '  - Nettoyage des fichiers inutilisés';
    RAISE NOTICE '========================================';
    RAISE NOTICE 'Le stockage est maintenant prêt pour le CMS!';
    RAISE NOTICE '========================================';
END $$;