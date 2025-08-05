#!/usr/bin/env python3
"""
Script d'import de la structure CYRUS dans Supabase
Parse le fichier StructureCYRUS.txt et importe la hiérarchie
"""

import re
import sys
from pathlib import Path
from supabase import create_client, Client
import os
from dotenv import load_dotenv

# Charger les variables d'environnement
load_dotenv()

def create_supabase_client() -> Client:
    """Créer le client Supabase"""
    url = os.getenv("SUPABASE_URL")
    key = os.getenv("SUPABASE_SERVICE_ROLE_KEY")  # Utiliser la clé service pour les imports
    
    if not url or not key:
        raise Exception("SUPABASE_URL et SUPABASE_SERVICE_ROLE_KEY doivent être définis")
    
    return create_client(url, key)

def parse_cyrus_structure(file_path: str):
    """Parser le fichier StructureCYRUS.txt"""
    
    with open(file_path, 'r', encoding='utf-8') as f:
        content = f.read()
    
    lines = content.split('\n')
    
    # Structure hiérarchique
    current_secteur = None
    current_rayon = None  
    current_famille = None
    
    items = []
    
    for line in lines:
        line = line.strip()
        if not line:
            continue
            
        # Détecter le niveau en fonction du pattern
        # Secteur: 3 chiffres + nom (ex: "201 GEANT CASINO")
        secteur_match = re.match(r'^(\d{3})\s+(.+)$', line)
        if secteur_match:
            current_secteur = secteur_match.group(1)
            secteur_name = secteur_match.group(2)
            current_rayon = None
            current_famille = None
            
            items.append({
                'level': 1,
                'code': current_secteur,
                'name': secteur_name,
                'parent_code': None,
                'full_path': f"{current_secteur} {secteur_name}"
            })
            continue
            
        # Rayon: 2 chiffres + nom (ex: "01 MARCHE")
        rayon_match = re.match(r'^(\d{2})\s+(.+)$', line)
        if rayon_match and current_secteur:
            current_rayon = rayon_match.group(1)
            rayon_name = rayon_match.group(2)
            current_famille = None
            
            items.append({
                'level': 2,
                'code': current_rayon,
                'name': rayon_name,
                'parent_code': current_secteur,
                'full_path': f"{current_secteur} > {current_rayon} {rayon_name}"
            })
            continue
            
        # Famille: 3 chiffres + nom (ex: "010 BOUCHERIE")
        famille_match = re.match(r'^(\d{3})\s+(.+)$', line)
        if famille_match and current_rayon and len(famille_match.group(1)) == 3:
            current_famille = famille_match.group(1)
            famille_name = famille_match.group(2)
            
            items.append({
                'level': 3,
                'code': current_famille,
                'name': famille_name,
                'parent_code': current_rayon,
                'full_path': f"{current_secteur} > {current_rayon} > {current_famille} {famille_name}"
            })
            continue
            
        # Sous-famille: 3 chiffres + nom (ex: "101 STAND TRADITIONNEL")
        sous_famille_match = re.match(r'^(\d{3})\s+(.+)$', line)
        if sous_famille_match and current_famille:
            sous_famille_code = sous_famille_match.group(1)
            sous_famille_name = sous_famille_match.group(2)
            
            items.append({
                'level': 4,
                'code': sous_famille_code,
                'name': sous_famille_name,
                'parent_code': current_famille,
                'full_path': f"{current_secteur} > {current_rayon} > {current_famille} > {sous_famille_code} {sous_famille_name}"
            })
            continue
    
    return items

def import_to_supabase(items, supabase: Client):
    """Importer les données dans Supabase"""
    
    print(f"Import de {len(items)} éléments CYRUS...")
    
    # Vider la table existante
    try:
        supabase.table('cyrus_structure').delete().neq('id', 0).execute()
        print("Table cyrus_structure vidée")
    except Exception as e:
        print(f"Erreur lors du vidage: {e}")
    
    # Importer par batches de 100
    batch_size = 100
    success_count = 0
    
    for i in range(0, len(items), batch_size):
        batch = items[i:i + batch_size]
        
        try:
            result = supabase.table('cyrus_structure').insert(batch).execute()
            success_count += len(batch)
            print(f"Batch {i//batch_size + 1}: {len(batch)} éléments importés")
        except Exception as e:
            print(f"Erreur batch {i//batch_size + 1}: {e}")
            # Essayer un par un en cas d'erreur
            for item in batch:
                try:
                    supabase.table('cyrus_structure').insert(item).execute()
                    success_count += 1
                except Exception as e2:
                    print(f"Erreur item {item['code']}: {e2}")
    
    print(f"Import terminé: {success_count}/{len(items)} éléments importés")

def main():
    """Fonction principale"""
    try:
        # Chemin vers le fichier CYRUS
        cyrus_file = Path(__file__).parent.parent.parent / "StructureCYRUS.txt"
        
        if not cyrus_file.exists():
            print(f"Fichier non trouvé: {cyrus_file}")
            sys.exit(1)
        
        print(f"Parsing du fichier: {cyrus_file}")
        items = parse_cyrus_structure(str(cyrus_file))
        
        print(f"Trouvé {len(items)} éléments à importer")
        
        # Afficher quelques exemples
        print("\nExemples d'éléments parsés:")
        for i, item in enumerate(items[:5]):
            print(f"  {i+1}. Level {item['level']}: {item['code']} - {item['name']}")
            print(f"     Parent: {item['parent_code']}, Path: {item['full_path']}")
        
        # Créer le client Supabase
        supabase = create_supabase_client()
        
        # Importer dans Supabase
        import_to_supabase(items, supabase)
        
    except Exception as e:
        print(f"Erreur: {e}")
        sys.exit(1)

if __name__ == "__main__":
    main()