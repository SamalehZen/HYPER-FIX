#!/usr/bin/env python3
"""
Script pour parser la structure CYRUS et créer les données d'import
Parse le fichier StructureCYRUS.txt en tenant compte de l'indentation
"""

import re
import json
from pathlib import Path

def parse_cyrus_structure(file_path: str):
    """Parser le fichier StructureCYRUS.txt en tenant compte de l'indentation"""
    
    with open(file_path, 'r', encoding='utf-8') as f:
        lines = f.readlines()
    
    items = []
    context_stack = []  # Pour garder trace du contexte hiérarchique
    
    for line_num, original_line in enumerate(lines, 1):
        line = original_line.rstrip()
        
        # Ignorer les lignes vides et la ligne "Structure"
        if not line.strip() or line.strip() == "Structure":
            continue
            
        # Détecter le niveau d'indentation (nombre de tabs/espaces au début)
        stripped_line = line.lstrip()
        indent_level = len(line) - len(stripped_line)
        
        # Matcher le pattern code + nom
        match = re.match(r'^(\d+)\s+(.+)$', stripped_line)
        if not match:
            continue
            
        code = match.group(1)
        name = match.group(2)
        
        # Déterminer le niveau hiérarchique basé sur l'indentation et la longueur du code
        level = None
        if len(code) == 3 and indent_level == 0:
            level = 1  # Secteur
        elif len(code) == 2 and indent_level > 0:
            level = 2  # Rayon
        elif len(code) == 3 and indent_level > 0:
            # Peut être famille (niveau 3) ou sous-famille (niveau 4)
            # On détermine en fonction du contexte
            if len(context_stack) >= 2:
                level = 3  # Famille
            else:
                level = 4  # Sous-famille si on a déjà une famille
        
        # Ajuster le contexte selon l'indentation
        target_depth = min(level - 1 if level else 0, len(context_stack))
        context_stack = context_stack[:target_depth]
        
        # Déterminer le parent
        parent_code = context_stack[-1]['code'] if context_stack else None
        
        # Construire le chemin complet
        path_parts = [item['code'] + " " + item['name'] for item in context_stack]
        path_parts.append(code + " " + name)
        full_path = " > ".join(path_parts)
        
        item = {
            'level': level,
            'code': code,
            'name': name,
            'parent_code': parent_code,
            'full_path': full_path,
            'line_number': line_num,
            'indent_level': indent_level
        }
        
        items.append(item)
        
        # Mettre à jour le contexte
        if level and level <= 3:  # Secteur, Rayon, ou Famille
            context_stack.append(item)
    
    return items

def analyze_structure_v2(items):
    """Analyser la structure parsée version 2"""
    
    stats = {
        'total': len(items),
        'secteurs': len([i for i in items if i.get('level') == 1]),
        'rayons': len([i for i in items if i.get('level') == 2]),
        'familles': len([i for i in items if i.get('level') == 3]),
        'sous_familles': len([i for i in items if i.get('level') == 4]),
        'non_classes': len([i for i in items if i.get('level') is None])
    }
    
    print(f"Structure CYRUS analysée (v2) :")
    print(f"  Total des éléments: {stats['total']}")
    print(f"  Secteurs (niveau 1): {stats['secteurs']}")
    print(f"  Rayons (niveau 2): {stats['rayons']}")
    print(f"  Familles (niveau 3): {stats['familles']}")
    print(f"  Sous-familles (niveau 4): {stats['sous_familles']}")
    print(f"  Non classés: {stats['non_classes']}")
    
    # Exemples par niveau
    print("\nExemples par niveau :")
    for level in range(1, 5):
        examples = [i for i in items if i.get('level') == level][:5]
        level_names = ['Secteur', 'Rayon', 'Famille', 'Sous-famille']
        if examples:
            print(f"\n{level_names[level-1]} (niveau {level}) :")
            for ex in examples:
                print(f"  {ex['code']} - {ex['name']} (indent: {ex['indent_level']})")
    
    # Afficher quelques chemins complets
    print(f"\nExemples de chemins hiérarchiques :")
    for item in items[:10]:
        if item.get('level') == 4:  # Sous-familles
            print(f"  {item['full_path']}")
    
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
        stats = analyze_structure_v2(items)
        
        # Sauvegarder en JSON pour import
        output_file = script_dir / "cyrus_structure_v2.json"
        with open(output_file, 'w', encoding='utf-8') as f:
            json.dump({
                'metadata': {
                    'source_file': 'StructureCYRUS.txt',
                    'total_items': len(items),
                    'stats': stats,
                    'parsed_at': '2025-01-04',
                    'version': 2
                },
                'items': items
            }, f, indent=2, ensure_ascii=False)
        
        print(f"\nDonnées sauvegardées dans: {output_file}")
        
        # Générer le SQL d'insertion pour les éléments classés
        classified_items = [item for item in items if item.get('level') is not None]
        
        sql_file = script_dir / "cyrus_insert_v2.sql"
        with open(sql_file, 'w', encoding='utf-8') as f:
            f.write("-- Script d'insertion de la structure CYRUS v2\n")
            f.write("-- Généré automatiquement à partir de StructureCYRUS.txt\n\n")
            f.write("DELETE FROM cyrus_structure;\n\n")
            
            for item in classified_items:
                parent_code = f"'{item['parent_code']}'" if item['parent_code'] else 'NULL'
                name_escaped = item['name'].replace("'", "''")
                path_escaped = item['full_path'].replace("'", "''")
                
                sql_line = "INSERT INTO cyrus_structure (level, code, name, parent_code, full_path) VALUES "
                sql_line += f"({item['level']}, '{item['code']}', '{name_escaped}', {parent_code}, '{path_escaped}');\n"
                f.write(sql_line)
        
        print(f"Script SQL généré dans: {sql_file}")
        print(f"Éléments classés à insérer: {len(classified_items)}")
        
    except Exception as e:
        print(f"Erreur: {e}")
        import traceback
        traceback.print_exc()

if __name__ == "__main__":
    main()