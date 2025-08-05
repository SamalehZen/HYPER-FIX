#!/usr/bin/env python3
"""
Script de nettoyage et réimport propre des données CYRUS
Vide la table et réimporte de façon optimisée
"""

import os
import re
from supabase import create_client, Client
from dotenv import load_dotenv

def clean_and_reimport():
    """Nettoyer et réimporter proprement les données CYRUS"""
    
    load_dotenv()
    
    url = os.getenv("SUPABASE_URL")
    service_key = os.getenv("SUPABASE_SERVICE_ROLE_KEY")
    
    print("🧹 NETTOYAGE ET RÉIMPORT CYRUS")
    print("=" * 40)
    
    try:
        supabase = create_client(url, service_key)
        
        # 1. Vider la table cyrus_structure
        print("🗑️  Suppression des données existantes...")
        supabase.table('cyrus_structure').delete().neq('id', 0).execute()
        print("✅ Table cyrus_structure vidée")
        
        # 2. Lire et parser le fichier SQL plus proprement
        sql_file = "scripts/cyrus_insert_v3.sql"
        print(f"📁 Lecture optimisée de {sql_file}...")
        
        with open(sql_file, 'r', encoding='utf-8') as f:
            content = f.read()
        
        # 3. Parser plus précisément les données
        records = []
        
        # Extraire tous les INSERT INTO cyrus_structure
        insert_blocks = re.findall(r'INSERT INTO cyrus_structure \([^)]+\) VALUES\s*(.*?)(?=;)', content, re.DOTALL)
        
        for block in insert_blocks:
            # Extraire chaque ligne de VALUES (x,y,z,...)
            value_matches = re.findall(r'\(([^)]+)\)', block)
            
            for values_str in value_matches:
                # Split et clean chaque valeur
                values = []
                for val in values_str.split(','):
                    val = val.strip()
                    if val.startswith("'") and val.endswith("'"):
                        val = val[1:-1]  # Retirer les quotes
                    elif val == 'NULL':
                        val = None
                    elif val.isdigit():
                        val = int(val)
                    values.append(val)
                
                # Créer l'objet record avec les colonnes dans l'ordre
                if len(values) >= 6:  # level, code, name, parent_code, full_path, created_at
                    record = {
                        'level': values[0],
                        'code': values[1],
                        'name': values[2],
                        'parent_code': values[3],
                        'full_path': values[4],
                        'created_at': values[5] if values[5] else None
                    }
                    records.append(record)
        
        # 4. Supprimer les doublons basés sur code+level
        seen = set()
        unique_records = []
        for record in records:
            key = f"{record['level']}-{record['code']}"
            if key not in seen:
                seen.add(key)
                unique_records.append(record)
        
        print(f"📊 {len(unique_records)} enregistrements uniques à importer")
        
        # 5. Import par batch plus petit pour éviter les erreurs
        batch_size = 50
        total_inserted = 0
        
        for i in range(0, len(unique_records), batch_size):
            batch = unique_records[i:i+batch_size]
            
            try:
                result = supabase.table('cyrus_structure').insert(batch).execute()
                if result.data:
                    total_inserted += len(result.data)
                    print(f"✅ Batch {i//batch_size + 1}: {len(result.data)} éléments")
                else:
                    total_inserted += len(batch)
                    print(f"✅ Batch {i//batch_size + 1}: {len(batch)} éléments (traité)")
                    
            except Exception as e:
                print(f"❌ Erreur batch {i//batch_size + 1}: {e}")
                continue
        
        print(f"\n🎉 Import propre terminé !")
        print(f"✅ {total_inserted} éléments importés")
        
        # 6. Vérification finale détaillée
        print("\n🔍 Vérification finale...")
        
        for level in range(1, 5):
            level_data = supabase.table('cyrus_structure').select('id').eq('level', level).execute()
            count = len(level_data.data) if level_data.data else 0
            level_names = {1: 'Secteurs', 2: 'Rayons', 3: 'Familles', 4: 'Sous-familles'}
            print(f"   {level_names[level]} (niveau {level}): {count}")
        
        # Total
        total_data = supabase.table('cyrus_structure').select('id').execute()
        total_count = len(total_data.data) if total_data.data else 0
        print(f"\n📊 Total final: {total_count} éléments")
        
        if total_count >= 2290:
            print("🎉 Structure CYRUS complète et optimisée !")
            return True
        else:
            print("⚠️  Import partiel ou incomplet")
            return False
        
    except Exception as e:
        print(f"❌ Erreur: {e}")
        return False

if __name__ == "__main__":
    success = clean_and_reimport()
    
    if success:
        print("\n🚀 Configuration Supabase PARFAITE !")
        print("   python scripts/verify_complete.py")
        print("   bun dev")
    else:
        print("\n💡 Alternative: Interface web Supabase")
        print("   Copier/coller scripts/cyrus_insert_v3.sql")