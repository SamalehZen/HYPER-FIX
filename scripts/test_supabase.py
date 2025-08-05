#!/usr/bin/env python3
"""
Script de test de connexion Supabase
À exécuter après avoir configuré les variables d'environnement
"""

import os
import json
from supabase import create_client, Client
from dotenv import load_dotenv

def test_supabase_connection():
    """Tester la connexion à Supabase"""
    
    # Charger les variables d'environnement
    load_dotenv()
    
    url = os.getenv("SUPABASE_URL")
    key = os.getenv("SUPABASE_ANON_KEY")
    service_key = os.getenv("SUPABASE_SERVICE_ROLE_KEY")
    
    if not url or not key:
        print("❌ Variables d'environnement manquantes:")
        print("   - SUPABASE_URL")
        print("   - SUPABASE_ANON_KEY")
        print("   Configurez votre fichier .env")
        return False
    
    print(f"🔗 Test de connexion à: {url}")
    
    try:
        # Test avec la clé anonyme
        supabase_anon = create_client(url, key)
        
        # Test 1: Vérifier les tables
        print("\n📊 Test des tables...")
        
        # Test structure CYRUS
        cyrus_result = supabase_anon.table('cyrus_structure').select('count').execute()
        if cyrus_result.data:
            print(f"✅ Table cyrus_structure: accessible")
        
        # Test nomenclature
        nomenclature_result = supabase_anon.table('nomenclature_codes').select('code,description').limit(5).execute()
        if nomenclature_result.data:
            print(f"✅ Table nomenclature_codes: {len(nomenclature_result.data)} codes disponibles")
            for code in nomenclature_result.data:
                print(f"   - {code['code']}: {code['description']}")
        
        # Test 2: Compter les données CYRUS
        if service_key:
            print("\n🔢 Statistiques des données...")
            supabase_admin = create_client(url, service_key)
            
            # Compter par niveau
            for level in range(1, 5):
                level_result = supabase_admin.table('cyrus_structure').select('count').eq('level', level).execute()
                level_names = ['Secteurs', 'Rayons', 'Familles', 'Sous-familles']
                if hasattr(level_result, 'count') and level_result.count is not None:
                    print(f"   {level_names[level-1]} (niveau {level}): {level_result.count}")
        
        # Test 3: Insertion test
        print("\n💾 Test d'insertion...")
        test_correction = {
            'original_label': 'test yaourt',
            'corrected_label': 'TEST YAOURT 500G',
            'correction_rules': {'rules': ['test']},
            'confidence': 100,
            'validated': False,
            'created_by': 'test_script'
        }
        
        insert_result = supabase_anon.table('label_corrections').insert(test_correction).execute()
        if insert_result.data:
            print("✅ Insertion test réussie")
            
            # Nettoyer le test
            supabase_anon.table('label_corrections').delete().eq('created_by', 'test_script').execute()
            print("✅ Nettoyage effectué")
        
        print("\n🎉 Connexion Supabase opérationnelle !")
        return True
        
    except Exception as e:
        print(f"❌ Erreur de connexion: {e}")
        print("\nVérifiez:")
        print("1. Les variables d'environnement dans .env")
        print("2. Que les tables sont créées dans Supabase")
        print("3. Que les politiques RLS permettent l'accès")
        return False

def install_dependencies():
    """Installer les dépendances Python nécessaires"""
    import subprocess
    import sys
    
    packages = ['supabase', 'python-dotenv']
    
    for package in packages:
        try:
            __import__(package.replace('-', '_'))
        except ImportError:
            print(f"📦 Installation de {package}...")
            subprocess.check_call([sys.executable, '-m', 'pip', 'install', package])

if __name__ == "__main__":
    print("🚀 Test de connexion Supabase pour L'HyperFix")
    print("=" * 50)
    
    # Installer les dépendances si nécessaire
    try:
        install_dependencies()
    except Exception as e:
        print(f"❌ Erreur d'installation: {e}")
        print("Installez manuellement: pip install supabase python-dotenv")
        exit(1)
    
    # Tester la connexion
    success = test_supabase_connection()
    
    if success:
        print("\n✅ Configuration Supabase terminée avec succès !")
        print("Vous pouvez maintenant utiliser L'HyperFix avec une vraie base de données.")
    else:
        print("\n❌ Configuration incomplète. Consultez SUPABASE_SETUP.md pour plus d'aide.")
        exit(1)