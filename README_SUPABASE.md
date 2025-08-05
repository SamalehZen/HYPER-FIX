# 🗃️ Configuration Supabase - L'HyperFix

## Fichiers de Configuration

### 📝 Guides
- **`GUIDE_CONFIGURATION_SUPABASE.md`** - Guide pas à pas complet avec captures
- **`README_SUPABASE.md`** - Ce fichier (aperçu rapide)

### ⚙️ Configuration
- **`.env`** - Variables d'environnement (à modifier avec tes clés Supabase)
- **`.env.example`** - Template de configuration

### 🗄️ Base de Données
- **`database/schema.sql`** - Schéma complet (7 tables)
- **`scripts/cyrus_insert_v3.sql`** - Import structure CYRUS (2294 éléments)

### 🧪 Scripts de Test
- **`scripts/test_supabase.py`** - Test de connexion automatisé
- **`scripts/check_config.py`** - Vérification de la configuration
- **`setup_supabase.sh`** - Script de setup rapide

### 🔧 Code TypeScript
- **`src/lib/supabase.ts`** - Client Supabase + types
- **`src/lib/database.ts`** - Utilitaires de base de données

---

## ⚡ Démarrage Rapide

### 1. Lancer la vérification
```bash
python scripts/check_config.py
```

### 2. Créer le projet Supabase
- Aller sur https://supabase.com
- Créer le projet `hyperfix-production`
- Récupérer les clés API

### 3. Configurer les variables
Modifier `.env` avec tes vraies clés :
```env
SUPABASE_URL=https://ton-projet.supabase.co
SUPABASE_ANON_KEY=ta_clé_anon
SUPABASE_SERVICE_ROLE_KEY=ta_clé_service
```

### 4. Créer les tables
Dans Supabase SQL Editor :
```sql
-- Copier/coller database/schema.sql
```

### 5. Importer les données
Dans Supabase SQL Editor :
```sql
-- Copier/coller scripts/cyrus_insert_v3.sql
```

### 6. Tester la connexion
```bash
python scripts/test_supabase.py
```

### 7. Démarrer l'application
```bash
bun dev
```

---

## 📊 Données Importées

### Structure CYRUS (2294 éléments)
- **1 Secteur** : 201 GEANT CASINO
- **8 Rayons** : MARCHE, FRAIS INDUSTRIEL, etc.
- **8 Familles** : BOUCHERIE, PRODUITS FRAIS LACTES, etc.
- **2277 Sous-familles** : Hiérarchie complète

### Tables Créées
1. **`articles`** - Articles historiques (prêt pour 97k imports)
2. **`cyrus_structure`** - Hiérarchie de classification (2294 rows)
3. **`label_corrections`** - Corrections de libellés
4. **`cyrus_classifications`** - Classifications IA
5. **`nomenclature_codes`** - Codes douaniers avec taxes
6. **`users`** - Authentification
7. **`activity_logs`** - Logs d'activité

---

## 🔒 Sécurité

### Row Level Security (RLS)
- Activé sur les tables sensibles
- Politiques de lecture publique pour les services
- Politiques d'écriture authentifiées

### Variables d'Environnement
- `.env` dans `.gitignore`
- Clés publiques vs secrètes séparées
- Configuration Next.js compatible

---

## 🆘 Support

### Problème de connexion ?
```bash
python scripts/test_supabase.py
```

### Configuration manquante ?
```bash
python scripts/check_config.py
```

### Guide complet
📖 **`GUIDE_CONFIGURATION_SUPABASE.md`**