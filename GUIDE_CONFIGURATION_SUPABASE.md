# 🚀 Guide Pas à Pas : Configuration Supabase pour L'HyperFix

## Étape 1 : Création du compte Supabase

### 1.1 Aller sur https://supabase.com
- Cliquer sur **"Start your project"**

### 1.2 Créer un compte
**Option A - GitHub (Recommandée) :**
- Cliquer sur **"Continue with GitHub"**
- Autoriser Supabase à accéder à ton compte GitHub
- Accepter les conditions d'utilisation

**Option B - Email/Password :**
- Saisir ton email
- Créer un mot de passe sécurisé
- Cliquer sur **"Sign Up"**
- Vérifier ton email

---

## Étape 2 : Création du projet

### 2.1 Nouveau projet
Une fois connecté, tu verras le dashboard Supabase :
- Cliquer sur **"New Project"** ou **"+ New project"**

### 2.2 Configuration du projet
Remplir les informations :
- **Project name :** `hyperfix-production`
- **Database Password :** `HyperFix2025!` (ou ton choix)
- **Region :** `Europe West (Frankfurt)` (ou plus proche de toi)
- **Pricing Plan :** Free (suffisant pour commencer)

### 2.3 Création
- Cliquer sur **"Create new project"**
- ⏳ **Attendre 2-3 minutes** que le projet soit créé

---

## Étape 3 : Récupération des clés API

### 3.1 Accéder aux paramètres
Dans le dashboard de ton projet :
- Aller dans **"Settings"** (dans la sidebar gauche)
- Cliquer sur **"API"**

### 3.2 Noter les informations importantes
Tu verras :
```
Project URL: https://xxxxx.supabase.co
API Keys:
  - anon (public): eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
  - service_role (secret): eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

⚠️ **Important :** Garde ces clés secrètes !

---

## Étape 4 : Configuration des variables d'environnement

### 4.1 Créer le fichier .env
Dans le dossier `hyperfix`, créer le fichier `.env` :

```env
# Configuration Supabase pour L'HyperFix
SUPABASE_URL=https://ton-projet.supabase.co
SUPABASE_ANON_KEY=ta_clé_anon
SUPABASE_SERVICE_ROLE_KEY=ta_clé_service_role

# Configuration App (mêmes valeurs)
NEXT_PUBLIC_SUPABASE_URL=https://ton-projet.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=ta_clé_anon

# Configuration OpenRouter pour l'IA (optionnel)
OPENROUTER_API_KEY=ton_openrouter_key

# Auth simple
BASIC_AUTH_USERNAME=men
BASIC_AUTH_PASSWORD=men2023
```

### 4.2 Remplacer les valeurs
- `https://ton-projet.supabase.co` → ton Project URL
- `ta_clé_anon` → ta clé anon public
- `ta_clé_service_role` → ta clé service_role secret

---

## Étape 5 : Création des tables

### 5.1 Accéder au SQL Editor
Dans le dashboard Supabase :
- Aller dans **"SQL Editor"** (dans la sidebar)
- Cliquer sur **"New Query"**

### 5.2 Exécuter le schéma
- Copier le contenu du fichier `database/schema.sql`
- Coller dans l'éditeur SQL
- Cliquer sur **"Run"** ou appuyer sur `Ctrl+Enter`

✅ Tu verras : "Success. No rows returned"

### 5.3 Vérifier les tables
- Aller dans **"Table Editor"**
- Tu dois voir les tables : `articles`, `cyrus_structure`, `label_corrections`, etc.

---

## Étape 6 : Import des données CYRUS

### 6.1 Nouvelle requête SQL
- Retourner dans **"SQL Editor"**
- Cliquer sur **"New Query"**

### 6.2 Importer la structure CYRUS
- Copier le contenu du fichier `scripts/cyrus_insert_v3.sql`
- Coller dans l'éditeur SQL
- Cliquer sur **"Run"**

⏳ **Attendre 1-2 minutes** pour l'import de 2294 éléments

✅ Tu verras : "Success. 2294 rows affected"

### 6.3 Vérifier l'import
- Aller dans **"Table Editor"**
- Cliquer sur la table `cyrus_structure`
- Tu dois voir ~2294 lignes avec la hiérarchie complète

---

## Étape 7 : Configuration de sécurité (RLS)

### 7.1 Activer Row Level Security
- Retourner dans **"SQL Editor"**
- Coller ce code :

```sql
-- Activer RLS sur les tables principales
ALTER TABLE articles ENABLE ROW LEVEL SECURITY;
ALTER TABLE label_corrections ENABLE ROW LEVEL SECURITY;
ALTER TABLE cyrus_classifications ENABLE ROW LEVEL SECURITY;

-- Politiques pour permettre la lecture publique
CREATE POLICY "Allow public read on articles" ON articles FOR SELECT USING (true);
CREATE POLICY "Allow public read on cyrus_structure" ON cyrus_structure FOR SELECT USING (true);
CREATE POLICY "Allow public read on nomenclature_codes" ON nomenclature_codes FOR SELECT USING (true);

-- Politiques pour les insertions authentifiées
CREATE POLICY "Allow authenticated insert on corrections" ON label_corrections FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow authenticated insert on classifications" ON cyrus_classifications FOR INSERT WITH CHECK (true);
```

- Cliquer sur **"Run"**

---

## Étape 8 : Test de connexion

### 8.1 Test automatisé
Dans le terminal, depuis le dossier `hyperfix` :

```bash
python scripts/test_supabase.py
```

### 8.2 Résultat attendu
```
🚀 Test de connexion Supabase pour L'HyperFix
==================================================
🔗 Test de connexion à: https://ton-projet.supabase.co
📊 Test des tables...
✅ Table cyrus_structure: accessible
✅ Table nomenclature_codes: 17 codes disponibles
💾 Test d'insertion...
✅ Insertion test réussie
✅ Nettoyage effectué
🎉 Connexion Supabase opérationnelle !
✅ Configuration Supabase terminée avec succès !
```

---

## Étape 9 : Test de l'application

### 9.1 Démarrer L'HyperFix
```bash
cd hyperfix
bun dev
```

### 9.2 Tester les services
1. **Service de correction** → http://localhost:3000/service/correction-libelle
2. **Service de classification** → http://localhost:3000/service/classification
3. **Service de nomenclature** → http://localhost:3000/service/nomenclature-douaniere

### 9.3 Vérifier la base de données
- Les corrections doivent maintenant se sauvegarder en base
- Les classifications IA utilisent la vraie structure CYRUS
- Les codes douaniers sont lus depuis la base

---

## 🎉 Configuration terminée !

Tu as maintenant :
- ✅ Projet Supabase opérationnel
- ✅ Base de données PostgreSQL configurée
- ✅ Structure CYRUS importée (2294 éléments)
- ✅ Tables sécurisées avec RLS
- ✅ Application connectée à la vraie base

### Prochaines étapes possibles :
1. **Intégrer l'API OpenRouter** pour la vraie classification IA
2. **Importer tes 97k articles** dans la table `articles`
3. **Développer le dashboard administrateur** avancé
4. **Optimiser les performances** avec des index
5. **Configurer les sauvegardes** automatiques

---

## 🆘 Problèmes courants

### Erreur de connexion
- Vérifier les variables d'environnement dans `.env`
- S'assurer que les clés API sont correctes
- Vérifier que le projet Supabase est bien créé

### Tables manquantes
- Exécuter de nouveau le fichier `schema.sql`
- Vérifier qu'il n'y a pas d'erreurs dans la console SQL

### Import CYRUS échoué
- Vérifier que les tables sont créées avant l'import
- Relancer le script `cyrus_insert_v3.sql`

### RLS bloque les requêtes
- Vérifier que les politiques sont bien créées
- Utiliser la clé `service_role` pour les opérations admin

---

**Support :** Si tu rencontres des problèmes, lance le script `test_supabase.py` pour diagnostiquer.