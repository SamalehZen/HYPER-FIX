#!/usr/bin/env python3
"""
Analyse du fichier Excel 97k articles historiques
Examine la structure et prépare l'import dans Supabase
"""

import pandas as pd
import os
from pathlib import Path

def analyze_excel_file():
    """Analyser le fichier Excel des articles historiques"""
    
    excel_path = "/project/workspace/Tytyty.xlsx"
    
    if not os.path.exists(excel_path):
        print("❌ Fichier Excel non trouvé:", excel_path)
        return None
    
    print("📊 Analyse du fichier Excel des 97k articles")
    print("=" * 50)
    
    try:
        # Lire le fichier Excel
        print("📖 Lecture du fichier Excel...")
        
        # Essayer de lire toutes les feuilles
        excel_file = pd.ExcelFile(excel_path)
        print(f"📋 Feuilles disponibles: {excel_file.sheet_names}")
        
        # Lire la première feuille
        df = pd.read_excel(excel_path, sheet_name=0)
        
        print(f"\n📈 Informations générales:")
        print(f"   - Nombre de lignes: {len(df)}")
        print(f"   - Nombre de colonnes: {len(df.columns)}")
        print(f"   - Taille mémoire: {df.memory_usage(deep=True).sum() / 1024 / 1024:.2f} MB")
        
        print(f"\n📋 Structure des colonnes:")
        for i, col in enumerate(df.columns):
            print(f"   {i+1}. {col} ({df[col].dtype})")
        
        print(f"\n👀 Aperçu des données (5 premières lignes):")
        print(df.head().to_string())
        
        print(f"\n🔍 Statistiques des colonnes:")
        for col in df.columns:
            non_null = df[col].notna().sum()
            null_count = df[col].isna().sum()
            unique_count = df[col].nunique()
            
            print(f"   {col}:")
            print(f"     - Valeurs non-nulles: {non_null}")
            print(f"     - Valeurs nulles: {null_count}")
            print(f"     - Valeurs uniques: {unique_count}")
            
            # Exemples de valeurs
            if non_null > 0:
                sample_values = df[col].dropna().unique()[:3]
                print(f"     - Exemples: {list(sample_values)}")
            print()
        
        # Rechercher des colonnes potentielles
        print("🎯 Mapping potentiel des colonnes:")
        
        potential_mappings = {
            'EAN': ['ean', 'code_barre', 'barcode', 'ean13'],
            'LIBELLE': ['libelle', 'libellé', 'nom', 'designation', 'article'],
            'SECTEUR': ['secteur', 'sector'],
            'RAYON': ['rayon', 'ray'],
            'FAMILLE': ['famille', 'family'],
            'SOUS_FAMILLE': ['sous_famille', 'sous-famille', 'sous famille', 'sf'],
            'NARTAR': ['nartar', 'code_article', 'reference'],
            'NOMO': ['nomo', 'nomenclature']
        }
        
        found_mappings = {}
        for target, possibilities in potential_mappings.items():
            for col in df.columns:
                for possibility in possibilities:
                    if possibility.lower() in col.lower():
                        found_mappings[target] = col
                        break
                if target in found_mappings:
                    break
        
        for target, found_col in found_mappings.items():
            print(f"   {target} → {found_col}")
        
        return {
            'dataframe': df,
            'mappings': found_mappings,
            'sheet_names': excel_file.sheet_names
        }
        
    except Exception as e:
        print(f"❌ Erreur lors de l'analyse: {e}")
        return None

def create_import_plan(analysis_result):
    """Créer un plan d'import basé sur l'analyse"""
    
    if not analysis_result:
        return
    
    df = analysis_result['dataframe']
    mappings = analysis_result['mappings']
    
    print("\n🚀 Plan d'import pour Supabase")
    print("=" * 40)
    
    # Structure de table recommandée
    print("📋 Table recommandée: articles_historiques")
    print("""
    CREATE TABLE articles_historiques (
        id BIGSERIAL PRIMARY KEY,
        ean VARCHAR(20),
        nartar VARCHAR(50),
        libelle TEXT NOT NULL,
        nomo VARCHAR(20),
        secteur VARCHAR(100),
        rayon VARCHAR(100),
        famille VARCHAR(100),
        sous_famille VARCHAR(100),
        created_at TIMESTAMP DEFAULT NOW(),
        INDEX (ean),
        INDEX (libelle),
        INDEX (secteur, rayon, famille)
    );
    """)
    
    print("🔄 Script d'import recommandé:")
    print("1. Nettoyer les données (trim, upper, normalisation)")
    print("2. Déduplication par EAN + LIBELLE")
    print("3. Import par batch de 1000 lignes")
    print("4. Validation des données")
    print("5. Indexation pour recherche rapide")
    
    # Estimation du temps
    total_rows = len(df)
    batch_size = 1000
    batches = (total_rows + batch_size - 1) // batch_size
    estimated_time = batches * 2  # 2 secondes par batch
    
    print(f"\n⏱️  Estimation:")
    print(f"   - Total articles: {total_rows:,}")
    print(f"   - Batches de {batch_size}: {batches}")
    print(f"   - Temps estimé: {estimated_time//60}min {estimated_time%60}s")
    
    return True

if __name__ == "__main__":
    print("🎯 L'HyperFix - Import Articles Historiques\n")
    
    # Analyser le fichier
    analysis = analyze_excel_file()
    
    if analysis:
        # Créer le plan d'import
        create_import_plan(analysis)
        
        print("\n✅ Analyse terminée!")
        print("📂 Prochaines étapes:")
        print("1. Créer la table dans Supabase")
        print("2. Développer le script d'import")
        print("3. Intégrer avec l'IA pour matching")
    else:
        print("\n❌ Impossible d'analyser le fichier")
        print("💡 Vérifiez le format et l'emplacement")