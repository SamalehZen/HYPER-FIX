#!/usr/bin/env python3
"""
Script pour parser la structure CYRUS version 3
Parse le fichier StructureCYRUS.txt en utilisant la logique de séquence
La hiérarchie est implicite : secteur -> rayon -> famille -> sous-familles
"""

import re
import json
from pathlib import Path

def parse_cyrus_structure(file_path: str):
    """Parser le fichier StructureCYRUS.txt en utilisant la logique séquentielle"""
    
    with open(file_path, 'r', encoding='utf-8') as f:
        lines = f.readlines()
    
    items = []
    current_secteur = None
    current_rayon = None
    current_famille = None
    
    for line_num, original_line in enumerate(lines, 1):
        line = original_line.strip()
        
        # Ignorer les lignes vides et la ligne "Structure"
        if not line or line == "Structure":
            continue
            
        # Matcher le pattern code + nom
        match = re.match(r'^(\d+)\s+(.+)$', line)
        if not match:
            continue
            
        code = match.group(1)
        name = match.group(2)
        
        # Logique de classification basée sur la longueur du code et le contexte
        if len(code) == 3 and not current_secteur:
            # Premier code à 3 chiffres = secteur
            level = 1
            current_secteur = {'code': code, 'name': name}
            current_rayon = None
            current_famille = None
            parent_code = None
            
        elif len(code) == 2:
            # Code à 2 chiffres = rayon (sous le secteur actuel)
            level = 2
            current_rayon = {'code': code, 'name': name}
            current_famille = None
            parent_code = current_secteur['code'] if current_secteur else None
            
        elif len(code) == 3 and current_rayon and not current_famille:
            # Code à 3 chiffres après un rayon = famille
            level = 3
            current_famille = {'code': code, 'name': name}
            parent_code = current_rayon['code'] if current_rayon else None
            
        elif len(code) == 3 and current_famille:
            # Code à 3 chiffres après une famille = sous-famille
            level = 4
            parent_code = current_famille['code'] if current_famille else None
            
        else:
            # Cas par défaut : déterminer le niveau selon le contexte
            if not current_secteur:
                level = 1
                current_secteur = {'code': code, 'name': name}
                parent_code = None
            elif not current_rayon and len(code) == 2:
                level = 2
                current_rayon = {'code': code, 'name': name}
                parent_code = current_secteur['code']
            elif not current_famille and len(code) == 3:
                level = 3
                current_famille = {'code': code, 'name': name}
                parent_code = current_rayon['code'] if current_rayon else current_secteur['code']
            else:
                level = 4
                parent_code = current_famille['code'] if current_famille else (current_rayon['code'] if current_rayon else current_secteur['code'])
        
        # Construire le chemin complet
        path_parts = []
        if current_secteur:
            path_parts.append(f"{current_secteur['code']} {current_secteur['name']}")
        if current_rayon and level >= 2:
            path_parts.append(f"{current_rayon['code']} {current_rayon['name']}")
        if current_famille and level >= 3:
            path_parts.append(f"{current_famille['code']} {current_famille['name']}")
        if level == 4:
            path_parts.append(f"{code} {name}")
        elif level < 4:
            # Pour les niveaux 1-3, remplacer le dernier élément
            if path_parts:
                path_parts[-1] = f"{code} {name}"
            else:
                path_parts.append(f"{code} {name}")
        
        full_path = " > ".join(path_parts)
        
        item = {
            'level': level,
            'code': code,
            'name': name,
            'parent_code': parent_code,
            'full_path': full_path,
            'line_number': line_num
        }
        
        items.append(item)
    
    return items

def analyze_structure_v3(items):
    """Analyser la structure parsée version 3"""
    
    stats = {
        'total': len(items),
        'secteurs': len([i for i in items if i.get('level') == 1]),
        'rayons': len([i for i in items if i.get('level') == 2]),
        'familles': len([i for i in items if i.get('level') == 3]),
        'sous_familles': len([i for i in items if i.get('level') == 4])
    }
    
    print(f"Structure CYRUS analysée (v3) :")
    print(f"  Total des éléments: {stats['total']}")
    print(f"  Secteurs (niveau 1): {stats['secteurs']}")
    print(f"  Rayons (niveau 2): {stats['rayons']}")
    print(f"  Familles (niveau 3): {stats['familles']}")
    print(f"  Sous-familles (niveau 4): {stats['sous_familles']}")
    
    # Exemples par niveau
    print("\nExemples par niveau :")
    for level in range(1, 5):
        examples = [i for i in items if i.get('level') == level][:5]
        level_names = ['Secteur', 'Rayon', 'Famille', 'Sous-famille']
        if examples:
            print(f"\n{level_names[level-1]} (niveau {level}) :")
            for ex in examples:
                print(f"  {ex['code']} - {ex['name']}")
                print(f"    Parent: {ex['parent_code']}")
                print(f"    Chemin: {ex['full_path']}")
    
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
        stats = analyze_structure_v3(items)
        
        # Sauvegarder en JSON pour import
        output_file = script_dir / "cyrus_structure_v3.json"
        with open(output_file, 'w', encoding='utf-8') as f:
            json.dump({
                'metadata': {
                    'source_file': 'StructureCYRUS.txt',
                    'total_items': len(items),
                    'stats': stats,
                    'parsed_at': '2025-01-04',
                    'version': 3
                },
                'items': items
            }, f, indent=2, ensure_ascii=False)
        
        print(f"\nDonnées sauvegardées dans: {output_file}")
        
        # Générer le SQL d'insertion
        sql_file = script_dir / "cyrus_insert_v3.sql"
        with open(sql_file, 'w', encoding='utf-8') as f:
            f.write("-- Script d'insertion de la structure CYRUS v3\n")
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
        import traceback
        traceback.print_exc()

if __name__ == "__main__":
    main()