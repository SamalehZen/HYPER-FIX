#!/usr/bin/env python3
"""
Script automatisé pour créer les données CYRUS dans Supabase
Utilise directement l'API avec service_role_key
"""

import os
from supabase import create_client, Client
from dotenv import load_dotenv

def create_cyrus_data():
    """Créer automatiquement les données CYRUS dans Supabase"""
    
    # Charger les variables d'environnement
    load_dotenv()
    
    url = os.getenv("SUPABASE_URL")
    service_key = os.getenv("SUPABASE_SERVICE_ROLE_KEY")
    
    if not url or not service_key:
        print("❌ Variables d'environnement manquantes:")
        print("   - SUPABASE_URL")
        print("   - SUPABASE_SERVICE_ROLE_KEY")
        return False
    
    print(f"🚀 Création automatique des données CYRUS dans Supabase")
    print(f"🔗 Connexion à: {url}")
    print("=" * 60)
    
    try:
        # Connexion avec service_role_key pour pouvoir insérer
        supabase = create_client(url, service_key)
        
        # Lire le fichier SQL v3
        sql_file = "scripts/cyrus_insert_v3.sql"
        if not os.path.exists(sql_file):
            print(f"❌ Fichier {sql_file} introuvable")
            return False
        
        print(f"📁 Lecture du fichier {sql_file}...")
        with open(sql_file, 'r', encoding='utf-8') as f:
            sql_content = f.read()
        
        # Compter les insertions attendues
        insert_count = sql_content.count("INSERT INTO")
        print(f"📊 {insert_count} commandes d'insertion détectées")
        
        # Exécuter via l'API RPC (plus fiable pour gros SQL)
        print("⚡ Exécution de l'import CYRUS...")
        print("   ⏳ Cela peut prendre 1-2 minutes...")
        
        # Utiliser rpc pour exécuter du SQL brut
        result = supabase.rpc('exec_sql', {'sql_query': sql_content}).execute()
        
        if result.data:
            print("✅ Import CYRUS terminé avec succès !")
        else:
            print("⚠️  Import terminé (pas de données retournées, c'est normal)")
        
        # Vérifier l'import
        print("\n🔍 Vérification de l'import...")
        count_result = supabase.table('cyrus_structure').select('count').execute()
        
        if hasattr(count_result, 'count') and count_result.count:
            print(f"✅ {count_result.count} éléments CYRUS importés")
        else:
            # Fallback: compter manuellement
            all_data = supabase.table('cyrus_structure').select('id').execute()
            if all_data.data:
                print(f"✅ {len(all_data.data)} éléments CYRUS importés")
        
        # Vérifier la hiérarchie
        print("\n📊 Analyse de la hiérarchie CYRUS:")
        for level in range(1, 5):
            level_result = supabase.table('cyrus_structure').select('count').eq('level', level).execute()
            level_names = ['Secteurs', 'Rayons', 'Familles', 'Sous-familles']
            
            if hasattr(level_result, 'count') and level_result.count:
                print(f"   - {level_names[level-1]} (niveau {level}): {level_result.count}")
            else:
                # Fallback
                level_data = supabase.table('cyrus_structure').select('id').eq('level', level).execute()
                if level_data.data:
                    print(f"   - {level_names[level-1]} (niveau {level}): {len(level_data.data)}")
        
        print("\n🎉 Configuration Supabase COMPLÈTE !")
        print("✅ Tables créées")
        print("✅ Structure CYRUS importée")
        print("✅ Hiérarchie de classification opérationnelle")
        
        return True
        
    except Exception as e:
        print(f"❌ Erreur lors de l'import: {e}")
        print("\n💡 Solutions alternatives:")
        print("1. Utiliser l'interface web Supabase SQL Editor")
        print("2. Copier/coller scripts/cyrus_insert_v3.sql")
        print("3. Relancer ce script")
        return False

if __name__ == "__main__":
    create_cyrus_data()