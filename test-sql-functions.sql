-- Test des fonctions SQL du schéma CMS amélioré
-- Exécuter ce script après avoir exécuté supabase-cms-schema-enhanced.sql

-- =============================================================================
-- TEST 1: Fonction generate_slug()
-- =============================================================================
SELECT 'TEST 1: Fonction generate_slug()' as test_name;

-- Test avec différents types de texte
SELECT 
    'Élément avec accents' as input,
    generate_slug('Élément avec accents') as output,
    CASE 
        WHEN generate_slug('Élément avec accents') = 'element-avec-accents' 
        THEN '✅ PASS' 
        ELSE '❌ FAIL' 
    END as result;

SELECT 
    'Texte avec MAJUSCULES et ponctuation!' as input,
    generate_slug('Texte avec MAJUSCULES et ponctuation!') as output,
    CASE 
        WHEN generate_slug('Texte avec MAJUSCULES et ponctuation!') = 'texte-avec-majuscules-et-ponctuation' 
        THEN '✅ PASS' 
        ELSE '❌ FAIL' 
    END as result;

SELECT 
    '  espaces  au  début et à la fin  ' as input,
    generate_slug('  espaces  au  début et à la fin  ') as output,
    CASE 
        WHEN generate_slug('  espaces  au  début et à la fin  ') = 'espaces-au-debut-et-a-la-fin' 
        THEN '✅ PASS' 
        ELSE '❌ FAIL' 
    END as result;

-- =============================================================================
-- TEST 2: Fonction calculate_reading_time()
-- =============================================================================
SELECT 'TEST 2: Fonction calculate_reading_time()' as test_name;

-- Test avec différents contenus
SELECT 
    'Court texte' as description,
    calculate_reading_time('Ceci est un court texte.') as reading_time,
    CASE 
        WHEN calculate_reading_time('Ceci est un court texte.') = 1 
        THEN '✅ PASS' 
        ELSE '❌ FAIL' 
    END as result;

-- Texte d'environ 400 mots (devrait retourner 2 minutes)
SELECT 
    'Texte moyen (400 mots)' as description,
    calculate_reading_time(repeat('mot ', 400)) as reading_time,
    CASE 
        WHEN calculate_reading_time(repeat('mot ', 400)) = 2 
        THEN '✅ PASS' 
        ELSE '❌ FAIL' 
    END as result;

-- =============================================================================
-- TEST 3: Fonction is_slug_unique()
-- =============================================================================
SELECT 'TEST 3: Fonction is_slug_unique()' as test_name;

-- Note: Ce test nécessite que la table cms_pages existe
-- Vérifier si la table existe
DO $$
BEGIN
    IF EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'cms_pages') THEN
        -- Tester avec un slug qui n'existe probablement pas
        PERFORM 
            'Slug unique test' as description,
            is_slug_unique('cms_pages', 'slug-test-unique-' || extract(epoch from now())::text) as is_unique,
            CASE 
                WHEN is_slug_unique('cms_pages', 'slug-test-unique-' || extract(epoch from now())::text) = true 
                THEN '✅ PASS' 
                ELSE '❌ FAIL' 
            END as result;
        
        RAISE NOTICE 'Test is_slug_unique() exécuté (table cms_pages existe)';
    ELSE
        RAISE NOTICE 'Table cms_pages n''existe pas - test is_slug_unique() ignoré';
    END IF;
END $$;

-- =============================================================================
-- TEST 4: Fonction generate_unique_slug()
-- =============================================================================
SELECT 'TEST 4: Fonction generate_unique_slug()' as test_name;

-- Tester la génération de slug unique
DO $$
DECLARE
    test_slug TEXT;
BEGIN
    test_slug := generate_unique_slug('cms_pages', 'Titre de Test', NULL, 5);
    
    RAISE NOTICE 'Slug généré: %', test_slug;
    
    IF test_slug LIKE 'titre-de-test%' THEN
        RAISE NOTICE '✅ TEST 4 PASS: Slug généré correctement';
    ELSE
        RAISE NOTICE '❌ TEST 4 FAIL: Slug incorrect: %', test_slug;
    END IF;
END $$;

-- =============================================================================
-- TEST 5: Vérification des extensions
-- =============================================================================
SELECT 'TEST 5: Vérification des extensions' as test_name;

-- Vérifier que les extensions sont activées
SELECT 
    extname as extension,
    CASE 
        WHEN extname IN ('uuid-ossp', 'unaccent') THEN '✅ ACTIVÉE'
        ELSE '❌ MANQUANTE'
    END as status
FROM pg_extension 
WHERE extname IN ('uuid-ossp', 'unaccent')
UNION ALL
SELECT 
    'unaccent' as extension,
    CASE 
        WHEN EXISTS (SELECT 1 FROM pg_extension WHERE extname = 'unaccent') 
        THEN '✅ ACTIVÉE' 
        ELSE '❌ MANQUANTE (nécessaire pour generate_slug)' 
    END as status
WHERE NOT EXISTS (SELECT 1 FROM pg_extension WHERE extname = 'unaccent');

-- =============================================================================
-- TEST 6: Vérification des tables
-- =============================================================================
SELECT 'TEST 6: Vérification des tables CMS' as test_name;

-- Compter les tables CMS créées
SELECT 
    COUNT(*) as tables_cms_count,
    CASE 
        WHEN COUNT(*) >= 10 THEN '✅ SUFFISANT'
        ELSE '❌ INSUFFISANT'
    END as status
FROM information_schema.tables 
WHERE table_schema = 'public' 
AND table_name IN (
    'cms_templates', 'cms_pages', 'cms_components',
    'media_items', 'media_usage', 'cms_revisions',
    'blog_categories', 'blog_tags', 'post_categories', 'post_tags'
);

-- Lister les tables créées
SELECT 
    table_name,
    '✅ CRÉÉE' as status
FROM information_schema.tables 
WHERE table_schema = 'public' 
AND table_name LIKE 'cms_%' 
OR table_name LIKE 'blog_%' 
OR table_name LIKE 'post_%' 
OR table_name LIKE 'media_%'
ORDER BY table_name;

-- =============================================================================
-- RÉSUMÉ DES TESTS
-- =============================================================================
DO $$
BEGIN
    RAISE NOTICE '========================================';
    RAISE NOTICE 'TESTS DES FONCTIONS SQL TERMINÉS';
    RAISE NOTICE '========================================';
    RAISE NOTICE 'Fonctions testées:';
    RAISE NOTICE '1. generate_slug() - Génération de slugs SEO';
    RAISE NOTICE '2. calculate_reading_time() - Calcul temps lecture';
    RAISE NOTICE '3. is_slug_unique() - Vérification unicité';
    RAISE NOTICE '4. generate_unique_slug() - Génération slugs uniques';
    RAISE NOTICE '5. Extensions - uuid-ossp et unaccent';
    RAISE NOTICE '6. Tables - Vérification création tables CMS';
    RAISE NOTICE '========================================';
    RAISE NOTICE 'Pour exécuter manuellement:';
    RAISE NOTICE 'SELECT generate_slug(''Mon Titre Test'');';
    RAISE NOTICE 'SELECT calculate_reading_time(''Contenu test...'');';
    RAISE NOTICE '========================================';
END $$;

-- Exemples d'utilisation manuelle
SELECT 'EXEMPLES D''UTILISATION:' as section;
SELECT '1. generate_slug(''Élément Test''): ' || generate_slug('Élément Test') as example;
SELECT '2. calculate_reading_time(''Texte de 50 mots...''): ' || calculate_reading_time(repeat('mot ', 50)) || ' minutes' as example;