# Configuration Supabase pour L'HyperFix

## 1. Création du projet Supabase

### Étapes sur supabase.com :

1. **Aller sur https://supabase.com**
2. **Cliquer sur "Start your project"**
3. **Se connecter avec GitHub ou créer un compte**
4. **Créer un nouveau projet :**
   - Nom du projet : `hyperfix-production`
   - Mot de passe de la base : `HyperFix2025!` (ou votre choix)
   - Région : Europe West (Frankfurt) ou plus proche de vous
5. **Attendre que le projet soit créé (2-3 minutes)**

## 2. Récupération des clés d'API

Une fois le projet créé :

1. **Aller dans "Settings" → "API"**
2. **Noter ces informations :**
   - Project URL : `https://xxxxx.supabase.co`
   - Project API Key (anon, public) : `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...`
   - Project API Key (service_role, secret) : `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...`

## 3. Configuration des variables d'environnement

Créer le fichier `.env` dans le dossier hyperfix :

```env
# Configuration Supabase pour L'HyperFix
SUPABASE_URL=https://votre-projet.supabase.co
SUPABASE_ANON_KEY=votre_anon_key
SUPABASE_SERVICE_ROLE_KEY=votre_service_role_key

# Configuration OpenRouter pour l'IA (optionnel pour l'instant)
OPENROUTER_API_KEY=votre_openrouter_key

# Configuration App
NEXT_PUBLIC_SUPABASE_URL=https://votre-projet.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=votre_anon_key

# Auth simple
BASIC_AUTH_USERNAME=men
BASIC_AUTH_PASSWORD=men2023
```

## 4. Création des tables

Dans l'interface Supabase :

1. **Aller dans "SQL Editor"**
2. **Créer une nouvelle requête**
3. **Coller le contenu du fichier `database/schema.sql`**
4. **Exécuter la requête**

## 5. Import des données CYRUS

1. **Dans "SQL Editor", créer une nouvelle requête**
2. **Coller le contenu du fichier `scripts/cyrus_insert_v3.sql`**
3. **Exécuter la requête (peut prendre 1-2 minutes)**

## 6. Vérification des données

Dans l'onglet "Table Editor" :
- Vérifier que les tables sont créées : `articles`, `cyrus_structure`, `label_corrections`, etc.
- Vérifier que `cyrus_structure` contient ~2294 enregistrements
- Vérifier que `nomenclature_codes` contient les codes de base

## 7. Configuration RLS (Row Level Security)

Pour la sécurité, activer RLS sur les tables sensibles :

```sql
-- Activer RLS sur les tables principales
ALTER TABLE articles ENABLE ROW LEVEL SECURITY;
ALTER TABLE label_corrections ENABLE ROW LEVEL SECURITY;
ALTER TABLE cyrus_classifications ENABLE ROW LEVEL SECURITY;

-- Politiques pour permettre la lecture publique (pour les services)
CREATE POLICY "Allow public read on articles" ON articles FOR SELECT USING (true);
CREATE POLICY "Allow public read on cyrus_structure" ON cyrus_structure FOR SELECT USING (true);
CREATE POLICY "Allow public read on nomenclature_codes" ON nomenclature_codes FOR SELECT USING (true);

-- Politiques pour les insertions (authentifiées)
CREATE POLICY "Allow authenticated insert on corrections" ON label_corrections FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow authenticated insert on classifications" ON cyrus_classifications FOR INSERT WITH CHECK (true);
```

## 8. Test de connexion

Après configuration, tester dans L'HyperFix :
1. **Service de correction** : doit fonctionner sans base
2. **Service de classification** : doit sauvegarder en base après connexion
3. **Service de nomenclature** : doit lire depuis la base

## 9. Monitoring

Dans Supabase Dashboard :
- **Database** → **Extensions** : Activer `pg_stat_statements` pour le monitoring
- **Storage** : Optionnel pour les futurs uploads de fichiers
- **Auth** : Configuration pour l'authentification avancée (plus tard)

## Prochaines étapes

1. ✅ Créer le projet Supabase
2. ✅ Configurer les variables d'environnement
3. ✅ Créer les tables et importer les données
4. 🔄 Tester la connexion
5. 🔄 Optimiser les performances
6. 🔄 Sécuriser avec RLS approprié

---

**Important :** Gardez vos clés API secrètes et ne les commitez jamais dans Git. Le fichier `.env` est déjà dans `.gitignore`.