#!/bin/bash

# Script d'installation du schéma CMS pour Famar Wellness
# Ce script applique les extensions CMS à la base de données existante

echo "============================================"
echo "Installation du schéma CMS pour Famar Wellness"
echo "============================================"

# Vérifier si le fichier de schéma existe
if [ ! -f "supabase-complete-schema.sql" ]; then
    echo "❌ Erreur: Fichier supabase-complete-schema.sql non trouvé"
    exit 1
fi

echo "📋 Fichier de schéma trouvé: supabase-complete-schema.sql"
echo ""
echo "📝 Instructions pour appliquer le schéma:"
echo ""
echo "1. Accédez à votre projet Supabase"
echo "2. Allez dans l'éditeur SQL (SQL Editor)"
echo "3. Copiez le contenu de supabase-complete-schema.sql"
echo "4. Collez-le dans l'éditeur SQL"
echo "5. Exécutez la requête (Run)"
echo ""
echo "⚠️  IMPORTANT: Ce schéma étend la base de données existante avec:"
echo "   - Tables CMS (cms_pages, cms_templates, cms_components)"
echo "   - Gestion des médias (media_items, media_usage)"
echo "   - Amélioration du blog (catégories, tags)"
echo "   - Historique des révisions (cms_revisions)"
echo ""
echo "📊 Le schéma inclut:"
echo "   - 10 nouvelles tables"
echo "   - Indexes pour les performances"
echo "   - Politiques RLS (Row Level Security)"
echo "   - Données par défaut (templates et composants)"
echo "   - Triggers pour les timestamps automatiques"
echo ""
echo "✅ Après l'exécution, vérifiez que:"
echo "   - Toutes les tables ont été créées"
echo "   - Les politiques RLS sont activées"
echo "   - Les données par défaut sont présentes"
echo ""
echo "🔧 Pour tester l'installation, exécutez:"
echo "   psql -h [your-supabase-host] -p 5432 -U postgres -d postgres -f supabase-complete-schema.sql"
echo ""
echo "============================================"
echo "Installation prête à être appliquée!"
echo "============================================"