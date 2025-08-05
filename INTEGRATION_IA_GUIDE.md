# 🧠 Guide d'Intégration IA - L'HyperFix

## ✅ Intégration IA Terminée

L'intelligence artificielle est maintenant pleinement intégrée dans L'HyperFix avec **OpenRouter** et le modèle **Gemini 2.0 Flash** (avec fallback **DeepSeek**).

## 🎯 Fonctionnalités IA Disponibles

### Classification CYRUS Automatique
- **IA en temps réel** : Classification automatique selon votre structure CYRUS personnalisée
- **Modèles multiples** : Gemini 2.0 Flash + DeepSeek en fallback
- **Gestion d'erreurs** : Fallback automatique en cas de limitation de taux
- **Sauvegarde base** : Toutes les classifications sont sauvegardées dans Supabase

### Interface Utilisateur Améliorée
- **Statut IA en temps réel** : Badge indiquant l'état de l'IA (Active/Limitée/Inactive)
- **Progression en direct** : Barre de progression pour les classifications par lot
- **Statistiques avancées** : Temps de traitement, générations IA, taux de confiance
- **Validation manuelle** : Possibilité de valider ou corriger les résultats IA

## 🚀 Utilisation

### 1. Accès à l'Interface
```
URL Locale: http://localhost:5173/service/classification
URL Déployée: https://hyperfix-f458dfb0.scout.site/service/classification
```

### 2. Authentification
```
Utilisateur: men
Mot de passe: men2023
```

### 3. Test de Classification
Exemples de libellés à tester :
- `DANONE YAOURT NATURE 500G`
- `EVIAN EAU MINERALE 1,5L`
- `BOEUF STEACK HACHE 500G`
- `LINDT CHOCOLAT NOIR 100G`

## 🔧 Configuration Technique

### Variables d'Environnement
```bash
# OpenRouter IA
VITE_OPENROUTER_API_KEY=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

# Supabase Base de Données
VITE_PUBLIC_SUPABASE_URL=https://jwkfreetlgermepowxwp.supabase.co
VITE_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

### Architecture des Services

#### 1. OpenRouterService (`src/lib/openrouter.ts`)
- Gestion de l'API OpenRouter
- Modèles multiples avec fallback automatique
- Extraction intelligente de réponses non-JSON
- Gestion des erreurs et timeouts

#### 2. AIClassificationService (`src/lib/ai-classification.ts`)
- Classification complète avec IA + base de données
- Cache de la structure CYRUS pour performance
- Statistiques et monitoring
- Classification par lot avec progression

#### 3. Interface Utilisateur (`src/components/services/ClassificationService.tsx`)
- Intégration complète de l'IA
- Statut en temps réel
- Progression et statistiques avancées
- Validation manuelle des résultats

## 📊 Fonctionnalités Avancées

### Statistiques en Temps Réel
- **Total** : Nombre de classifications effectuées
- **Haute/Moyenne/Faible confiance** : Répartition selon le score IA
- **Validées** : Classifications approuvées manuellement
- **Générées IA** : Classifications automatiques vs manuelles
- **Temps moyen** : Performance de traitement

### Gestion des Modèles IA
- **Modèle principal** : `google/gemini-2.0-flash-exp:free`
- **Modèle fallback** : `deepseek/deepseek-r1-distill-llama-70b:free`
- **Rate limiting** : Gestion automatique des limitations
- **Extraction robuste** : Parse JSON et extraction par regex

### Base de Données
- **Table** : `cyrus_classifications`
- **Champs IA** : `confidence`, `ai_reasoning`, `validated`, `processing_time`
- **Historique** : Toutes les classifications sont conservées
- **Analytics** : Requêtes pour statistiques avancées

## 🧪 Tests et Validation

### Scripts de Test
```bash
# Test complet de l'intégration IA
python scripts/test_ai_integration.py

# Test avec modèles de fallback
python scripts/test_ai_with_fallback.py
```

### Tests Manuels
1. **Connexion IA** : Badge de statut dans l'interface
2. **Classification simple** : Un libellé à la fois
3. **Classification par lot** : Plusieurs libellés simultanément
4. **Validation manuelle** : Boutons ✓ et ✗ sur chaque résultat
5. **Export** : Copie des résultats en format tabulé

## 🎨 Interface Utilisateur

### Statuts IA
- 🟢 **IA Active** : Gemini ou DeepSeek fonctionnel
- 🟡 **IA Limitée** : Rate limit temporaire, fallback activé
- 🔴 **IA Inactive** : Tous les modèles indisponibles

### Indicateurs Visuels
- **Badge de confiance** : Vert (>80%), Jaune (50-80%), Rouge (<50%)
- **Icônes de source** : ⚡ IA vs 🔄 Manuel
- **Temps de traitement** : Affiché en millisecondes
- **Progression** : Barre de progression pour traitement par lot

## 🔮 Prochaines Évolutions

### Améliorations Possibles
1. **Import des 97k articles** : Historique complet pour améliorer l'IA
2. **Dashboard administrateur** : Analytics avancées et monitoring
3. **API endpoints** : Accès programmatique aux classifications
4. **Modèles personnalisés** : Fine-tuning sur vos données spécifiques
5. **Cache intelligent** : Classifications fréquentes en cache Redis

### Optimisations
- **Batch processing** : Classification de gros volumes
- **Rate limiting** : Gestion plus fine des quotas API
- **Confidence learning** : Amélioration continue des scores
- **Multi-langue** : Support d'autres langues que le français

## 📞 Support

### Dépannage Rapide
- **IA indisponible** : Vérifier les logs console et badge de statut
- **Erreurs de classification** : Utiliser la validation manuelle
- **Performance lente** : Augmenter le délai entre classifications par lot

### Contact
- Interface locale : http://localhost:5173
- Interface déployée : https://hyperfix-f458dfb0.scout.site
- Tests : Scripts dans `/scripts/`

---

🎉 **L'HyperFix dispose maintenant d'une IA de classification automatique complète et robuste !**