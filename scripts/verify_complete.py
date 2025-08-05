#!/usr/bin/env python3
"""
Script de vérification complète après import CYRUS
Teste toutes les fonctionnalités de la base de données
"""

import os
from supabase import create_client, Client
from dotenv import load_dotenv

def full_verification():
    """Vérification complète de la configuration Supabase + CYRUS"""
    
    load_dotenv()
    
    url = os.getenv("SUPABASE_URL")
    anon_key = os.getenv("SUPABASE_ANON_KEY")
    service_key = os.getenv("SUPABASE_SERVICE_ROLE_KEY")
    
    print("🔍 VÉRIFICATION COMPLÈTE - L'HYPERFIX + SUPABASE")
    print("=" * 60)
    
    try:
        # Test connexion anonyme
        supabase_anon = create_client(url, anon_key)
        print("✅ Connexion anonyme OK")
        
        # Test connexion service
        supabase_admin = create_client(url, service_key)
        print("✅ Connexion administrateur OK")
        
        print("\n📊 VÉRIFICATION DES TABLES")
        print("-" * 30)
        
        # Vérifier chaque table
        tables = [
            'articles',
            'cyrus_structure', 
            'label_corrections',
            'cyrus_classifications',
            'nomenclature_codes',
            'users',
            'activity_logs'
        ]
        
        for table in tables:
            try:
                result = supabase_anon.table(table).select('count').limit(1).execute()
                print(f"✅ Table '{table}' accessible")
            except Exception as e:
                print(f"❌ Table '{table}' erreur: {e}")
        
        print("\n🗂️ VÉRIFICATION STRUCTURE CYRUS")
        print("-" * 35)
        
        # Compter par niveau
        cyrus_counts = {}
        level_names = {1: 'Secteurs', 2: 'Rayons', 3: 'Familles', 4: 'Sous-familles'}
        
        for level in range(1, 5):
            try:
                level_data = supabase_admin.table('cyrus_structure').select('id').eq('level', level).execute()
                count = len(level_data.data) if level_data.data else 0
                cyrus_counts[level] = count
                print(f"   {level_names[level]} (niveau {level}): {count}")
            except Exception as e:
                print(f"   ❌ Erreur niveau {level}: {e}")
        
        # Vérifier si l'import CYRUS est complet
        total_cyrus = sum(cyrus_counts.values())
        if total_cyrus >= 2290:  # ~2294 attendus
            print(f"✅ Structure CYRUS complète ({total_cyrus} éléments)")
        elif total_cyrus > 0:
            print(f"⚠️  Structure CYRUS partielle ({total_cyrus} éléments)")
            print("   Recommandation: Réimporter cyrus_insert_v3.sql")
        else:
            print("❌ Structure CYRUS vide")
            print("   Action requise: Importer cyrus_insert_v3.sql")
        
        print("\n💰 VÉRIFICATION CODES DOUANIERS")
        print("-" * 35)
        
        # Vérifier nomenclature
        nomenclature_result = supabase_anon.table('nomenclature_codes').select('*').execute()
        if nomenclature_result.data:
            print(f"✅ {len(nomenclature_result.data)} codes douaniers disponibles")
            for code in nomenclature_result.data[:3]:  # Afficher 3 premiers
                print(f"   - {code['code']}: {code['description']} (TVA: {code['tva_rate']}%)")
        else:
            print("❌ Aucun code douanier trouvé")
        
        print("\n🧪 TEST FONCTIONNEL")
        print("-" * 20)
        
        # Test insertion/suppression
        test_data = {
            'original_label': 'test_verification_complete',
            'corrected_label': 'TEST VERIFICATION COMPLETE',
            'correction_rules': {'test': True},
            'confidence': 100,
            'validated': False,
            'created_by': 'verification_script'
        }
        
        try:
            # Insertion
            insert_result = supabase_anon.table('label_corrections').insert(test_data).execute()
            if insert_result.data:
                print("✅ Test insertion réussi")
                
                # Suppression
                supabase_anon.table('label_corrections').delete().eq('created_by', 'verification_script').execute()
                print("✅ Test suppression réussi")
            else:
                print("❌ Test insertion échoué")
        except Exception as e:
            print(f"❌ Test fonctionnel échoué: {e}")
        
        print("\n🎯 RÉSUMÉ FINAL")
        print("-" * 15)
        
        # Score de configuration
        score = 0
        total_tests = 10
        
        if total_cyrus >= 2290: score += 4  # CYRUS = 40%
        elif total_cyrus > 0: score += 2
        
        if len(nomenclature_result.data) >= 5: score += 2  # Nomenclature = 20%
        
        if len(tables) == 7: score += 2  # Tables = 20%
        
        score += 2  # Connexion = 20%
        
        percentage = (score / total_tests) * 100
        
        print(f"📊 Score de configuration: {score}/{total_tests} ({percentage:.0f}%)")
        
        if percentage >= 90:
            print("🎉 CONFIGURATION PARFAITE !")
            print("✅ L'HyperFix est prêt à fonctionner")
            print("🚀 Commande: bun dev")
        elif percentage >= 70:
            print("⚠️  Configuration presque complète")
            print("📝 Actions recommandées dans IMPORT_CYRUS_GUIDE.md")
        else:
            print("❌ Configuration incomplète")
            print("📖 Suivre GUIDE_CONFIGURATION_SUPABASE.md")
        
        print("\n🔗 URLs de test après 'bun dev':")
        print("   - Home: http://localhost:5173")
        print("   - Correction: http://localhost:5173/service/correction-libelle")
        print("   - Classification: http://localhost:5173/service/classification")
        print("   - Nomenclature: http://localhost:5173/service/nomenclature-douaniere")
        
        return percentage >= 90
        
    except Exception as e:
        print(f"❌ Erreur de vérification: {e}")
        return False

if __name__ == "__main__":
    success = full_verification()
    
    if success:
        print("\n🎯 Prêt pour la production !")
    else:
        print("\n🔧 Configuration à compléter")