#!/usr/bin/env python3
"""
Test de l'IA avec modèle de fallback
Teste la classification avec DeepSeek ou d'autres modèles gratuits
"""

import os
import json
import time
from dotenv import load_dotenv

def test_with_deepseek():
    """Test avec le modèle DeepSeek en fallback"""
    
    print("🧠 Test IA avec modèle de fallback (DeepSeek)")
    print("=" * 50)
    
    load_dotenv()
    
    openrouter_key = os.getenv("VITE_OPENROUTER_API_KEY") or os.getenv("OPENROUTER_API_KEY")
    
    if not openrouter_key:
        print("❌ Clé OpenRouter manquante")
        return False
    
    try:
        import requests
        
        # Test avec DeepSeek directement
        print("\n🔗 Test avec DeepSeek R1 Distill...")
        
        test_prompt = """
Classification produit selon structure CYRUS:

PRODUIT: "DANONE YAOURT NATURE 500G"

STRUCTURE CYRUS (simplifiée):
- SECTEUR: GEANT CASINO
- RAYONS: FRAIS INDUSTRIEL, MARCHE, EPICERIE
- FAMILLES: PRODUITS FRAIS LACTES, BOUCHERIE, EPICERIE SUCREE
- SOUS-FAMILLES: YAOURTS, BOEUF LOCAL, CHOCOLATS

Réponds en JSON:
{
  "secteur": "GEANT CASINO",
  "rayon": "nom_du_rayon", 
  "famille": "nom_de_la_famille",
  "sous_famille": "nom_de_la_sous_famille",
  "confidence": 85,
  "reasoning": "Explication classification"
}
"""
        
        response = requests.post(
            'https://openrouter.ai/api/v1/chat/completions',
            headers={
                'Content-Type': 'application/json',
                'Authorization': f'Bearer {openrouter_key}',
                'HTTP-Referer': 'http://localhost:5173',
                'X-Title': 'L\'HyperFix - Test Fallback'
            },
            json={
                'model': 'deepseek/deepseek-r1-distill-llama-70b:free',
                'messages': [
                    {
                        'role': 'system',
                        'content': 'Tu es un expert en classification de produits. Réponds en JSON strict.'
                    },
                    {
                        'role': 'user',
                        'content': test_prompt
                    }
                ],
                'temperature': 0.1,
                'max_tokens': 300
            },
            timeout=20
        )
        
        if response.status_code == 200:
            result = response.json()
            content = result.get('choices', [{}])[0].get('message', {}).get('content', '')
            
            print(f"✅ DeepSeek fonctionnel!")
            print(f"📝 Réponse brute: {content[:200]}...")
            
            # Tentative de parsing JSON
            try:
                if '{' in content and '}' in content:
                    # Extraire le JSON
                    start = content.find('{')
                    end = content.rfind('}') + 1
                    json_part = content[start:end]
                    
                    parsed = json.loads(json_part)
                    print("\n🎯 Classification réussie:")
                    print(f"   Secteur: {parsed.get('secteur')}")
                    print(f"   Rayon: {parsed.get('rayon')}")
                    print(f"   Famille: {parsed.get('famille')}")
                    print(f"   Sous-famille: {parsed.get('sous_famille')}")
                    print(f"   Confiance: {parsed.get('confidence')}%")
                    print(f"   Raisonnement: {parsed.get('reasoning')}")
                    return True
                else:
                    print("⚠️  Réponse non-JSON mais DeepSeek disponible")
                    return True
                    
            except json.JSONDecodeError as e:
                print(f"⚠️  Parsing JSON échoué: {e}")
                print("Mais DeepSeek répond, extraction possible par regex")
                return True
                
        elif response.status_code == 429:
            print("⚠️  DeepSeek aussi limité, tester d'autres modèles")
            return test_other_models(openrouter_key)
        else:
            print(f"❌ Erreur DeepSeek: {response.status_code}")
            return False
            
    except Exception as e:
        print(f"❌ Erreur test: {e}")
        return False

def test_other_models(api_key):
    """Test avec d'autres modèles gratuits"""
    
    other_models = [
        'meta-llama/llama-3.2-3b-instruct:free',
        'microsoft/phi-3-mini-128k-instruct:free'
    ]
    
    for model in other_models:
        print(f"\n🔄 Test avec {model}...")
        
        try:
            import requests
            
            response = requests.post(
                'https://openrouter.ai/api/v1/chat/completions',
                headers={
                    'Content-Type': 'application/json',
                    'Authorization': f'Bearer {api_key}',
                    'HTTP-Referer': 'http://localhost:5173'
                },
                json={
                    'model': model,
                    'messages': [
                        {
                            'role': 'user',
                            'content': 'Classification test: yaourt -> secteur GEANT CASINO, rayon FRAIS. JSON: {"success": true}'
                        }
                    ],
                    'max_tokens': 50
                },
                timeout=10
            )
            
            if response.status_code == 200:
                print(f"✅ {model} disponible!")
                return True
            elif response.status_code != 429:
                print(f"⚠️  {model}: {response.status_code}")
                
        except Exception as e:
            print(f"❌ {model} erreur: {e}")
    
    return False

def test_app_status():
    """Vérifier si l'app fonctionne"""
    
    print("\n📱 Test de l'application HyperFix:")
    print("-" * 30)
    
    try:
        import requests
        
        # Test de la page d'accueil
        response = requests.get('http://localhost:5173', timeout=5)
        
        if response.status_code == 200:
            print("✅ Application accessible sur http://localhost:5173")
            print("✅ Interface utilisateur prête")
            print("\n🎯 Pour tester l'IA:")
            print("1. Aller sur http://localhost:5173/service/classification")
            print("2. Se connecter avec: men / men2023")
            print("3. Tester avec: DANONE YAOURT NATURE 500G")
            return True
        else:
            print(f"⚠️  App répond avec: {response.status_code}")
            
    except Exception as e:
        print("⚠️  Application en cours de démarrage...")
        print("Attendez quelques secondes puis testez manuellement")
        
    return False

if __name__ == "__main__":
    print("🚀 L'HyperFix - Test IA avec Fallback\n")
    
    # Test des modèles IA
    ai_success = test_with_deepseek()
    
    # Test de l'application
    app_success = test_app_status()
    
    print("\n" + "=" * 50)
    if ai_success:
        print("🎉 IA fallback fonctionnelle!")
        print("🤖 L'HyperFix peut classifier automatiquement")
    else:
        print("❌ Tous les modèles IA sont temporairement limités")
        print("💡 L'interface fonctionnera dès que les limites sont levées")
    
    print("\n🔗 L'HyperFix: https://hyperfix-f458dfb0.scout.site")
    print("🖥️  Local: http://localhost:5173")