# Configuration du Schéma CMS pour Famar Wellness

## Vue d'ensemble

Ce document explique comment configurer le schéma de base de données CMS pour l'application admin de Famar Wellness. Le schéma étend la base de données existante avec des fonctionnalités CMS complètes.

## Fichiers créés

1. **`supabase-complete-schema.sql`** - Schéma complet avec toutes les tables CMS
2. **`supabase-cms-schema.sql`** - Extension CMS seule (si vous avez déjà le schéma de base)
3. **`install-cms-schema.sh`** - Script d'installation avec instructions
4. **`CMS_SCHEMA_SETUP.md`** - Ce document

## Étapes d'installation

### Option 1: Via l'interface Supabase (recommandé)

1. **Accédez à votre projet Supabase**
   - Connectez-vous à [supabase.com](https://supabase.com)
   - Sélectionnez votre projet Famar Wellness

2. **Ouvrez l'éditeur SQL**
   - Dans le menu de gauche, cliquez sur "SQL Editor"
   - Cliquez sur "New query"

3. **Appliquez le schéma**
   - Ouvrez le fichier `supabase-complete-schema.sql`
   - Copiez tout le contenu
   - Collez dans l'éditeur SQL
   - Cliquez sur "Run" ou appuyez sur `Cmd+Enter` (Mac) / `Ctrl+Enter` (Windows)

4. **Vérifiez l'installation**
   - Allez dans "Table Editor"
   - Vérifiez que les nouvelles tables apparaissent:
     - `cms_pages`, `cms_templates`, `cms_components`
     - `media_items`, `media_usage`
     - `blog_categories`, `blog_tags`, `post_categories`, `post_tags`
     - `cms_revisions`

### Option 2: Via ligne de commande (PSQL)

```bash
# Assurez-vous d'avoir psql installé
brew install postgresql  # macOS
# ou
sudo apt-get install postgresql-client  # Ubuntu

# Exécutez le schéma
psql "postgresql://postgres:[VOTRE_MOT_DE_PASSE]@db.[VOTRE_PROJET].supabase.co:5432/postgres" -f supabase-complete-schema.sql
```

## Tables créées

### Tables CMS principales
- **`cms_pages`** - Pages du site web (avec contenu JSON, SEO, versioning)
- **`cms_templates`** - Templates de mise en page (homepage, blog, contact, etc.)
- **`cms_components`** - Composants réutilisables (hero, text, gallery, form, etc.)

### Gestion des médias
- **`media_items`** - Fichiers multimédias uploadés
- **`media_usage`** - Tracking de l'utilisation des médias

### Amélioration du blog
- **`blog_categories`** - Catégories hiérarchiques
- **`blog_tags`** - Tags pour les articles
- **`post_categories`** - Liaison articles-catégories
- **`post_tags`** - Liaison articles-tags

### Historique et révisions
- **`cms_revisions`** - Historique des modifications

## Données par défaut

### Templates système (4)
1. **Homepage** - Template pour la page d'accueil
2. **Blog Post** - Template pour les articles de blog
3. **Contact** - Template pour la page contact
4. **Services** - Template pour la page services

### Composants par défaut (4)
1. **Hero Section** - Section hero avec titre, sous-titre, image de fond, CTA
2. **Text Block** - Bloc de texte avec alignement
3. **Image Gallery** - Galerie d'images avec configuration de colonnes
4. **Contact Form** - Formulaire de contact configurable

## Sécurité (RLS)

Toutes les tables ont des politiques RLS (Row Level Security):

- **Contenu publié** : Accessible par tout le monde
- **Contenu non publié** : Seulement par utilisateurs authentifiés
- **Gestion complète** : Seulement par utilisateurs authentifiés

## Indexes de performance

Des indexes ont été créés pour:
- Recherche par slug
- Filtrage par statut (publié/non publié)
- Recherche par auteur
- Performance des requêtes fréquentes

## Prochaines étapes

Après avoir appliqué le schéma:

1. **Configurez Supabase Storage** (Tâche 1.2)
   - Créez des buckets pour les médias
   - Configurez les transformations d'images

2. **Développez l'API backend** (Tâche 1.3)
   - Créez les endpoints API pour le CMS
   - Implémentez l'authentification et l'autorisation

3. **Développez l'interface admin** (Phase 2)
   - Créez le composant Media Manager
   - Implémentez l'upload et la gestion des médias

## Dépannage

### Problèmes courants

1. **"relation already exists"**
   - Le schéma a déjà été appliqué
   - Utilisez `DROP TABLE IF EXISTS` si vous voulez repartir de zéro

2. **Permissions insuffisantes**
   - Assurez-vous d'utiliser les identifiants de l'utilisateur `postgres`
   - Vérifiez les politiques RLS dans Supabase

3. **Tables non visibles**
   - Rafraîchissez la page Table Editor
   - Vérifiez les logs SQL pour les erreurs

### Vérification de l'installation

```sql
-- Vérifiez que les tables existent
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public'
ORDER BY table_name;

-- Vérifiez les données par défaut
SELECT * FROM cms_templates;
SELECT * FROM cms_components;
```

## Support

Pour toute question ou problème:
1. Consultez les logs SQL dans Supabase
2. Vérifiez les erreurs dans la console
3. Consultez la documentation Supabase

---

**✅ Schéma CMS prêt à être déployé!**