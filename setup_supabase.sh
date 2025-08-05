#!/bin/bash

# Script de configuration rapide Supabase pour L'HyperFix
# Usage: ./setup_supabase.sh

echo "🚀 Configuration Supabase pour L'HyperFix"
echo "=========================================="

# Vérification des prérequis
echo "🔍 Vérification des prérequis..."

# Vérifier Python
if ! command -v python3 &> /dev/null; then
    echo "❌ Python 3 n'est pas installé"
    exit 1
fi

# Vérifier les dépendances Python
echo "📦 Installation des dépendances Python..."
pip3 install supabase python-dotenv

# Vérifier la configuration
echo "🔧 Vérification de la configuration..."
python3 scripts/check_config.py

echo ""
echo "📖 Étapes suivantes :"
echo "1. 🌐 Aller sur https://supabase.com"
echo "2. 📝 Créer votre compte et projet 'hyperfix-production'"
echo "3. ⚙️  Récupérer vos clés API et modifier le fichier .env"
echo "4. 📊 Créer les tables avec database/schema.sql"
echo "5. 📥 Importer les données avec scripts/cyrus_insert_v3.sql"
echo "6. 🧪 Tester avec: python scripts/test_supabase.py"
echo "7. 🚀 Démarrer: bun dev"
echo ""
echo "📚 Guide détaillé: GUIDE_CONFIGURATION_SUPABASE.md"