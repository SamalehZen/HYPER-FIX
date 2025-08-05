#!/usr/bin/env python3
"""
Script simplifié pour importer les données CYRUS via l'API Supabase
Parse le fichier SQL et fait les insertions via l'API Python
"""

import os
import re
import json
from supabase import create_client, Client
from dotenv import load_dotenv

def parse_sql_inserts(sql_content):
    """Parser les INSERT statements du fichier SQL"""
    
    # Pattern pour matcher les INSERT INTO statements
    insert_pattern = r"INSERT INTO cyrus_structure \(([^)]+)\) VALUES\s*(.*?)(?=INSERT INTO|$)"
    
    matches = re.findall(insert_pattern, sql_content, re.DOTALL)
    
    records = []
    
    for match in matches:
        columns = [col.strip() for col in match[0].split(',')]
        values_section = match[1].strip()
        
        # Extraire chaque ligne de VALUES
        value_lines = re.findall(r'\(([^)]+)\)', values_section)
        
        for value_line in value_lines:
            values = [val.strip().strip("'") for val in value_line.split(',')]
            
            # Créer un dictionnaire pour chaque record
            record = {}
            for i, col in enumerate(columns):
                if i < len(values):
                    value = values[i]
                    # Convertir les types
                    if value == 'NULL':
                        record[col] = None
                    elif value.isdigit():
                        record[col] = int(value)
                    else:
                        record[col] = value
            
            records.append(record)
    
    return records

def import_cyrus_simple():
    """Import CYRUS de manière simple via l'API"""
    
    # Charger les variables d'environnement
    load_dotenv()
    
    url = os.getenv("SUPABASE_URL")
    service_key = os.getenv("SUPABASE_SERVICE_ROLE_KEY")
    
    if not url or not service_key:
        print("❌ Variables d'environnement manquantes:")
        print("   - SUPABASE_URL")
        print("   - SUPABASE_SERVICE_ROLE_KEY")
        return False
    
    print(f"🚀 Import CYRUS simplifié dans Supabase")
    print(f"🔗 Connexion à: {url}")
    print("=" * 50)
    
    try:
        # Connexion avec service_role_key
        supabase = create_client(url, service_key)
        
        # Vérifier la connexion
        try:
            test = supabase.table('cyrus_structure').select('count').limit(1).execute()
            print("✅ Connexion Supabase OK")
        except Exception as e:
            print(f"❌ Erreur de connexion: {e}")
            return False
        
        # Lire et parser le fichier SQL
        sql_file = "scripts/cyrus_insert_v3.sql"
        if not os.path.exists(sql_file):
            print(f"❌ Fichier {sql_file} introuvable")
            return False
        
        print(f"📁 Lecture du fichier {sql_file}...")
        with open(sql_file, 'r', encoding='utf-8') as f:
            sql_content = f.read()
        
        print("⚙️  Parsing des données SQL...")
        records = parse_sql_inserts(sql_content)
        
        if not records:
            print("❌ Aucune donnée parsée du fichier SQL")
            return False
        
        print(f"📊 {len(records)} enregistrements à importer")
        
        # Import par batch pour éviter les timeouts
        batch_size = 100
        total_inserted = 0
        
        for i in range(0, len(records), batch_size):
            batch = records[i:i+batch_size]
            
            print(f"📥 Import batch {i//batch_size + 1}/{(len(records)-1)//batch_size + 1} ({len(batch)} éléments)...")
            
            try:
                result = supabase.table('cyrus_structure').insert(batch).execute()
                if result.data:
                    total_inserted += len(result.data)
                    print(f"   ✅ {len(result.data)} éléments insérés")
                else:
                    print(f"   ⚠️  Batch traité (pas de données retournées)")
                    total_inserted += len(batch)
                    
            except Exception as e:
                print(f"   ❌ Erreur sur ce batch: {e}")
                continue
        
        print(f"\n🎉 Import terminé !")
        print(f"✅ {total_inserted} éléments traités")
        
        # Vérification finale
        final_count = supabase.table('cyrus_structure').select('count').execute()
        if hasattr(final_count, 'count') and final_count.count:
            print(f"🔍 Vérification: {final_count.count} éléments en base")
        
        return True
        
    except Exception as e:
        print(f"❌ Erreur générale: {e}")
        return False

if __name__ == "__main__":
    success = import_cyrus_simple()
    
    if success:
        print("\n🚀 Prochain étape: Tester la connexion complète")
        print("   python scripts/test_supabase.py")
    else:
        print("\n💡 Alternative: Utiliser l'interface web Supabase")
        print("   - Aller dans SQL Editor")
        print("   - Copier/coller scripts/cyrus_insert_v3.sql")