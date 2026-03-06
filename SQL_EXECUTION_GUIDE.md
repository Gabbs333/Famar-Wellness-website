# Guide d'Exécution des Scripts SQL Supabase

## Fichiers SQL Corrigés

Deux fichiers SQL ont été corrigés pour résoudre les erreurs de type de données et de contraintes:

### 1. Schéma CMS Final (`supabase-cms-schema-final.sql`)
**Problèmes résolus:**
- ✅ Toutes les colonnes référençant `auth.users` sont maintenant de type `UUID` (au lieu de `BIGINT`)
- ✅ Contraintes de clé étrangère compatibles avec `auth.users(id)`
- ✅ Suppression des anciennes contraintes problématiques avant création
- ✅ Messages de confirmation détaillés

### 2. Configuration du Stockage (`supabase-storage-setup-corrected.sql`)
**Problèmes résolus:**
- ✅ Élimination des erreurs `ON CONFLICT` dans la table `storage.buckets`
- ✅ Utilisation de `DO $` blocks pour vérifier l'existence avant insertion
- ✅ Politiques de sécurité corrigées
- ✅ Fonctions d'organisation du stockage compatibles avec UUID

## Étapes d'Exécution

### Étape 1: Exécuter le Schéma CMS
1. Ouvrir l'**Éditeur SQL Supabase** dans votre projet
2. Copier le contenu de `supabase-cms-schema-final.sql`
3. Exécuter le script complet
4. Vérifier les messages de succès dans la console

**Messages attendus:**
```
SCHÉMA CMS SUPABASE CRÉÉ AVEC SUCCÈS!
Toutes les tables ont été créées avec les types corrects:
- Toutes les colonnes référençant auth.users sont de type UUID
- Toutes les contraintes de clé étrangère sont compatibles
- RLS est activé avec des politiques de sécurité
- Index créés pour les performances
```

### Étape 2: Exécuter la Configuration du Stockage
1. Dans le même éditeur SQL (ou nouvelle session)
2. Copier le contenu de `supabase-storage-setup-corrected.sql`
3. Exécuter le script complet
4. Vérifier les messages de confirmation

**Messages attendus:**
```
CONFIGURATION DU STOCKAGE SUPABASE TERMINÉE!
Buckets configurés:
  - cms-images (public)
  - cms-documents (privé)
  - cms-media (privé)
```

## Vérification

Après exécution, vérifiez que:

### 1. Tables Créées
```sql
-- Vérifier les tables CMS
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public' 
AND table_name LIKE 'cms_%' 
OR table_name LIKE 'blog_%' 
OR table_name LIKE 'post_%' 
OR table_name LIKE 'media_%'
ORDER BY table_name;
```

### 2. Types de Colonnes Corrects
```sql
-- Vérifier que les colonnes sont de type UUID
SELECT 
    table_name,
    column_name,
    data_type
FROM information_schema.columns
WHERE column_name IN ('author_id', 'created_by', 'uploaded_by')
AND table_schema = 'public'
ORDER BY table_name, column_name;
```

### 3. Buckets de Stockage
```sql
-- Vérifier les buckets créés
SELECT id, name, public 
FROM storage.buckets 
WHERE id LIKE 'cms-%'
ORDER BY id;
```

## Prochaines Étapes

Une fois les scripts exécutés avec succès:

1. **Phase 1.3**: Créer l'API backend pour le CMS
2. **Phase 2**: Continuer avec les tests de gestion des médias
3. **Phase 3**: Finaliser l'éditeur de pages

## Dépannage

### Erreur: "relation already exists"
- Le script utilise `CREATE TABLE IF NOT EXISTS` pour éviter cette erreur
- Les anciennes contraintes sont supprimées avant création

### Erreur: "permission denied"
- Assurez-vous d'être connecté avec un compte administrateur
- Vérifiez les permissions RLS dans les politiques créées

### Erreur: "function does not exist"
- Le script active l'extension `uuid-ossp` si nécessaire
- Les fonctions sont créées avec `CREATE OR REPLACE FUNCTION`

## Fichiers de Référence

- `supabase-cms-schema-final.sql` - Schéma complet avec corrections
- `supabase-storage-setup-corrected.sql` - Configuration du stockage corrigée
- `PHASE1_COMPLETED.md` - Documentation de la Phase 1
- `.kiro/specs/admin-cms-improvement/tasks.md` - Suivi des tâches

---

**Note:** Ces scripts sont idempotents - ils peuvent être exécutés plusieurs fois sans causer d'erreurs.
## Option Alternative : Fichier Unique Corrigé

Si vous préférez exécuter un seul fichier au lieu de deux, vous pouvez utiliser :

### `supabase-complete-schema-corrected.sql`
Ce fichier combine toutes les corrections en un seul script :

**Corrections incluses :**
1. ✅ **Syntaxe de fonction corrigée** : `$$` au lieu de `$` seul
2. ✅ **Types UUID pour auth.users** : Toutes les colonnes `author_id`, `created_by`, `uploaded_by` sont de type `UUID`
3. ✅ **RLS policies corrigées** : Compatibles avec les types UUID
4. ✅ **Messages de confirmation** : Suivi détaillé de l'exécution

**Pour exécuter :**
1. Ouvrir l'Éditeur SQL Supabase
2. Copier le contenu de `supabase-complete-schema-corrected.sql`
3. Exécuter le script complet

**Messages attendus :**
```
FAMAR WELLNESS DATABASE SCHEMA CREATED - CORRECTED VERSION!
All errors fixed:
1. Syntax error in function definition ($$ instead of $)
2. UUID foreign keys for auth.users compatibility
3. Corrected RLS policies
```

## Comparaison des Options

### Option 1 : Fichiers Séparés (Recommandé)
- **`supabase-cms-schema-final.sql`** + **`supabase-storage-setup-corrected.sql`**
- Avantage : Plus modulaire, plus facile à déboguer
- Inconvénient : Deux fichiers à exécuter

### Option 2 : Fichier Unique
- **`supabase-complete-schema-corrected.sql`**
- Avantage : Un seul fichier à exécuter
- Inconvénient : Plus long, moins modulaire

## Recommandation

**Utilisez l'Option 1 (fichiers séparés)** si :
- Vous voulez un contrôle plus fin sur l'exécution
- Vous préférez une approche modulaire
- Vous voulez pouvoir ré-exécuter seulement une partie

**Utilisez l'Option 2 (fichier unique)** si :
- Vous voulez une exécution simple en une seule étape
- Vous n'avez pas besoin de modularité
- Vous préférez un seul script complet

## Fichiers à NE PAS Utiliser

❌ **`supabase-complete-schema.sql`** - Ancienne version avec erreurs de syntaxe
❌ **`supabase-cms-schema.sql`** - Ancienne version avec erreurs de type
❌ **`supabase-storage-setup.sql`** - Ancienne version avec erreurs ON CONFLICT

## Vérification Finale

Quelle que soit l'option choisie, vérifiez après exécution :

```sql
-- Vérifier les tables créées
SELECT COUNT(*) as table_count FROM information_schema.tables 
WHERE table_schema = 'public' 
AND table_name LIKE 'cms_%' OR table_name LIKE 'blog_%' 
OR table_name LIKE 'post_%' OR table_name LIKE 'media_%';

-- Doit retourner 10 tables CMS
```

Si vous obtenez 10 tables, le schéma a été créé avec succès !
## Option 3 : Version Améliorée avec Fonctions SEO

### `supabase-cms-schema-enhanced.sql`
Ce fichier inclut toutes les fonctions manquantes pour un CMS professionnel :

**Fonctions ajoutées :**
1. ✅ **`generate_slug()`** : Génère des slugs SEO-friendly
2. ✅ **`is_slug_unique()`** : Vérifie l'unicité des slugs
3. ✅ **`generate_unique_slug()`** : Génère des slugs uniques avec fallback
4. ✅ **`calculate_reading_time()`** : Calcule le temps de lecture
5. ✅ **Triggers automatiques** : Génération automatique de slugs pour :
   - `cms_pages`
   - `blog_categories`
   - `blog_tags`

**Pour exécuter :**
1. Ouvrir l'Éditeur SQL Supabase
2. Copier le contenu de `supabase-cms-schema-enhanced.sql`
3. Exécuter le script complet
4. Exécuter `supabase-storage-setup-corrected.sql` pour le stockage

**Messages attendus :**
```
SCHÉMA CMS SUPABASE CRÉÉ AVEC SUCCÈS - VERSION AMÉLIORÉE!
Améliorations incluses:
1. Fonctions pour slugs SEO-friendly
2. Triggers automatiques pour slugs uniques
3. Fonction de calcul du temps de lecture
4. Toutes les syntaxes corrigées ($$ au lieu de $)
5. Types UUID compatibles avec auth.users
```

## Résumé des Options

### Option 1 : Fichiers Séparés (Basique)
```
1. supabase-cms-schema-final.sql
2. supabase-storage-setup-corrected.sql
```

### Option 2 : Fichier Unique (Complet)
```
supabase-complete-schema-corrected.sql
```

### Option 3 : Version Améliorée (RECOMMANDÉ)
```
1. supabase-cms-schema-enhanced.sql  # Avec fonctions SEO
2. supabase-storage-setup-corrected.sql
```

## Fonctions Disponibles dans la Version Améliorée

Après exécution de `supabase-cms-schema-enhanced.sql`, vous aurez accès à :

### 1. Génération de Slugs
```sql
-- Générer un slug SEO-friendly
SELECT generate_slug('Mon Article de Blog Incroyable');
-- Retourne: mon-article-de-blog-incroyable

-- Vérifier l'unicité d'un slug
SELECT is_slug_unique('cms_pages', 'mon-article', '123e4567-e89b-12d3-a456-426614174000');

-- Générer un slug unique
SELECT generate_unique_slug('cms_pages', 'Mon Titre', NULL, 10);
```

### 2. Calcul du Temps de Lecture
```sql
-- Calculer le temps de lecture d'un contenu
SELECT calculate_reading_time('Ceci est un article de blog avec environ 300 mots...');
-- Retourne: 2 (minutes)
```

### 3. Triggers Automatiques
- Les slugs sont générés automatiquement lors de l'insertion/mise à jour
- Garantit l'unicité des slugs
- Supporte les caractères accentués

## Recommandation Finale

**Utilisez l'Option 3 (Version Améliorée)** pour :
- ✅ Fonctions SEO complètes
- ✅ Génération automatique de slugs
- ✅ Calcul du temps de lecture
- ✅ Meilleure expérience utilisateur
- ✅ CMS plus professionnel

**Étapes :**
1. Exécuter `supabase-cms-schema-enhanced.sql`
2. Exécuter `supabase-storage-setup-corrected.sql`
3. Vérifier avec les scripts de validation

## Validation des Fonctions

Après exécution, testez les fonctions :
```sql
-- Tester la génération de slug
SELECT generate_slug('Élément avec accents et espaces') as slug_test;

-- Vérifier les triggers
INSERT INTO cms_pages (title, content) 
VALUES ('Nouvelle Page Test', '{}')
RETURNING slug; -- Doit retourner un slug généré automatiquement
```
## Test des Fonctions

Après avoir exécuté `supabase-cms-schema-enhanced.sql`, vous pouvez tester les fonctions avec :

### `test-sql-functions.sql`
Ce script teste toutes les fonctions créées :

**Tests inclus :**
1. ✅ **`generate_slug()`** - Test avec différents types de texte
2. ✅ **`calculate_reading_time()`** - Test avec contenus de différentes longueurs
3. ✅ **`is_slug_unique()`** - Test d'unicité des slugs
4. ✅ **`generate_unique_slug()`** - Test de génération de slugs uniques
5. ✅ **Extensions** - Vérification des extensions activées
6. ✅ **Tables** - Vérification des tables créées

**Pour exécuter les tests :**
1. Ouvrir l'Éditeur SQL Supabase
2. Copier le contenu de `test-sql-functions.sql`
3. Exécuter le script complet

**Résultats attendus :**
```
TESTS DES FONCTIONS SQL TERMINÉS
Fonctions testées:
1. generate_slug() - Génération de slugs SEO
2. calculate_reading_time() - Calcul temps lecture
3. is_slug_unique() - Vérification unicité
4. generate_unique_slug() - Génération slugs uniques
5. Extensions - uuid-ossp et unaccent
6. Tables - Vérification création tables CMS
```

## Workflow Complet Recommandé

### Étape 1 : Préparation
```sql
-- Vérifier les extensions (dans Supabase SQL Editor)
SELECT * FROM pg_extension WHERE extname IN ('uuid-ossp', 'unaccent');
```

### Étape 2 : Exécution du Schéma
```sql
-- 1. Exécuter supabase-cms-schema-enhanced.sql
-- 2. Exécuter supabase-storage-setup-corrected.sql
```

### Étape 3 : Validation
```sql
-- 1. Exécuter test-sql-functions.sql
-- 2. Vérifier les résultats des tests
```

### Étape 4 : Test Manuel
```sql
-- Tester manuellement les fonctions
SELECT generate_slug('Mon Article de Blog') as slug_example;
SELECT calculate_reading_time('Ceci est un contenu de test...') as reading_time;
```

## Dépannage des Fonctions

### Problème : "function unaccent(text) does not exist"
**Solution :** L'extension `unaccent` n'est pas activée
```sql
-- Activer l'extension
CREATE EXTENSION IF NOT EXISTS "unaccent";
```

### Problème : "function uuid_generate_v4() does not exist"
**Solution :** L'extension `uuid-ossp` n'est pas activée
```sql
-- Activer l'extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
```

### Problème : Les triggers ne fonctionnent pas
**Solution :** Vérifier que les triggers sont créés
```sql
-- Lister les triggers
SELECT tgname, tgrelid::regclass, tgfoid::regproc
FROM pg_trigger
WHERE tgname LIKE '%slug%' OR tgname LIKE '%updated%';
```

## Fichiers de Référence

- `supabase-cms-schema-enhanced.sql` - Schéma avec fonctions SEO
- `supabase-storage-setup-corrected.sql` - Configuration stockage
- `test-sql-functions.sql` - Tests des fonctions
- `SQL_EXECUTION_GUIDE.md` - Ce guide

## Support

Si vous rencontrez des problèmes :
1. Vérifiez les messages d'erreur dans l'Éditeur SQL
2. Exécutez `test-sql-functions.sql` pour diagnostiquer
3. Consultez les solutions de dépannage ci-dessus
4. Vérifiez que toutes les extensions sont activées