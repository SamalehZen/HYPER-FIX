#!/usr/bin/env python3
"""
Script de vérification de la configuration avant Supabase
Vérifie que tous les fichiers nécessaires sont présents
"""

import os

def check_configuration():
    """Vérifier que tous les éléments sont présents pour Supabase"""
    
    print("🔍 Vérification de la configuration L'HyperFix")
    print("=" * 50)
    
    # Vérifier les fichiers essentiels
    essential_files = [
        "database/schema.sql",
        "scripts/cyrus_insert_v3.sql",
        "scripts/test_supabase.py",
        ".env",
        "src/lib/supabase.ts",
        "src/lib/database.ts"
    ]
    
    all_good = True
    
    for file in essential_files:
        if os.path.exists(file):
            print(f"✅ {file}")
        else:
            print(f"❌ {file} - MANQUANT")
            all_good = False
    
    print("\n📊 Statistiques des données:")
    
    # Vérifier la taille du script CYRUS
    cyrus_file = "scripts/cyrus_insert_v3.sql"
    if os.path.exists(cyrus_file):
        size = os.path.getsize(cyrus_file)
        print(f"   - Structure CYRUS: {size:,} bytes (~2294 éléments)")
    
    # Vérifier la structure SQL
    schema_file = "database/schema.sql"
    if os.path.exists(schema_file):
        with open(schema_file, 'r') as f:
            content = f.read()
            tables = content.count("CREATE TABLE")
            print(f"   - Schéma SQL: {tables} tables définies")
    
    print("\n🔧 Configuration TypeScript:")
    
    # Vérifier les types
    supabase_file = "src/lib/supabase.ts"
    if os.path.exists(supabase_file):
        with open(supabase_file, 'r') as f:
            content = f.read()
            interfaces = content.count("interface")
            print(f"   - Types TypeScript: {interfaces} interfaces définies")
    
    # Vérifier les utilitaires
    database_file = "src/lib/database.ts"
    if os.path.exists(database_file):
        with open(database_file, 'r') as f:
            content = f.read()
            functions = content.count("export async function")
            print(f"   - Fonctions utilitaires: {functions} fonctions de base de données")
    
    print("\n📝 Fichier .env:")
    
    # Vérifier le .env
    env_file = ".env"
    if os.path.exists(env_file):
        with open(env_file, 'r') as f:
            content = f.read()
            if "votre-projet.supabase.co" in content:
                print("   ⚠️  Les clés Supabase ne sont pas encore configurées")
                print("   ➡️  Suivez le GUIDE_CONFIGURATION_SUPABASE.md")
            else:
                print("   ✅ Configuration personnalisée détectée")
    
    print("\n" + "=" * 50)
    
    if all_good:
        print("🎉 Configuration prête !")
        print("📖 Étapes suivantes :")
        print("   1. Créer votre projet Supabase sur https://supabase.com")
        print("   2. Modifier le fichier .env avec vos vraies clés")
        print("   3. Exécuter: python scripts/test_supabase.py")
        print("   4. Démarrer: bun dev")
    else:
        print("❌ Configuration incomplète")
        print("   Certains fichiers essentiels sont manquants")
    
    return all_good

if __name__ == "__main__":
    check_configuration()