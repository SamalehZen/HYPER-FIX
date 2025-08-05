#!/usr/bin/env python3
"""
Script pour parser la structure CYRUS et créer les données d'import
Parse le fichier StructureCYRUS.txt et génère un JSON avec la hiérarchie
"""

import re
import json
from pathlib import Path

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
    
    for line_num, line in enumerate(lines, 1):
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
                'full_path': f"{current_secteur} {secteur_name}",
                'line_number': line_num
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
                'full_path': f"{current_secteur} > {current_rayon} {rayon_name}",
                'line_number': line_num
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
                'full_path': f"{current_secteur} > {current_rayon} > {current_famille} {famille_name}",
                'line_number': line_num
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
                'full_path': f"{current_secteur} > {current_rayon} > {current_famille} > {sous_famille_code} {sous_famille_name}",
                'line_number': line_num
            })
            continue
    
    return items

def analyze_structure(items):
    """Analyser la structure parsée"""
    
    stats = {
        'total': len(items),
        'secteurs': len([i for i in items if i['level'] == 1]),
        'rayons': len([i for i in items if i['level'] == 2]),
        'familles': len([i for i in items if i['level'] == 3]),
        'sous_familles': len([i for i in items if i['level'] == 4])
    }
    
    print(f"Structure CYRUS analysée :")
    print(f"  Total des éléments: {stats['total']}")
    print(f"  Secteurs (niveau 1): {stats['secteurs']}")
    print(f"  Rayons (niveau 2): {stats['rayons']}")
    print(f"  Familles (niveau 3): {stats['familles']}")
    print(f"  Sous-familles (niveau 4): {stats['sous_familles']}")
    
    # Exemples par niveau
    print("\nExemples par niveau :")
    for level in range(1, 5):
        examples = [i for i in items if i['level'] == level][:3]
        level_names = ['Secteur', 'Rayon', 'Famille', 'Sous-famille']
        print(f"\n{level_names[level-1]} (niveau {level}) :")
        for ex in examples:
            print(f"  {ex['code']} - {ex['name']}")
    
    return stats

def main():
    """Fonction principale"""
    try:
        # Chemin vers le fichier CYRUS
        script_dir = Path(__file__).parent
        cyrus_file = script_dir.parent.parent / "StructureCYRUS.txt"
        
        if not cyrus_file.exists():
            print(f"Fichier non trouvé: {cyrus_file}")
            return
        
        print(f"Parsing du fichier: {cyrus_file}")
        items = parse_cyrus_structure(str(cyrus_file))
        
        # Analyser la structure
        stats = analyze_structure(items)
        
        # Sauvegarder en JSON pour import
        output_file = script_dir / "cyrus_structure.json"
        with open(output_file, 'w', encoding='utf-8') as f:
            json.dump({
                'metadata': {
                    'source_file': 'StructureCYRUS.txt',
                    'total_items': len(items),
                    'stats': stats,
                    'parsed_at': '2025-01-04'
                },
                'items': items
            }, f, indent=2, ensure_ascii=False)
        
        print(f"\nDonnées sauvegardées dans: {output_file}")
        
        # Générer le SQL d'insertion
        sql_file = script_dir / "cyrus_insert.sql"
        with open(sql_file, 'w', encoding='utf-8') as f:
            f.write("-- Script d'insertion de la structure CYRUS\n")
            f.write("-- Généré automatiquement à partir de StructureCYRUS.txt\n\n")
            f.write("DELETE FROM cyrus_structure;\n\n")
            
            for item in items:
                parent_code = f"'{item['parent_code']}'" if item['parent_code'] else 'NULL'
                name_escaped = item['name'].replace("'", "''")
                path_escaped = item['full_path'].replace("'", "''")
                
                sql_line = "INSERT INTO cyrus_structure (level, code, name, parent_code, full_path) VALUES "
                sql_line += f"({item['level']}, '{item['code']}', '{name_escaped}', {parent_code}, '{path_escaped}');\n"
                f.write(sql_line)
        
        print(f"Script SQL généré dans: {sql_file}")
        
    except Exception as e:
        print(f"Erreur: {e}")

if __name__ == "__main__":
    main()