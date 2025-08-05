-- Schema pour L'HyperFix
-- Tables principales pour la plateforme multiservice

-- Table des articles historiques (97k articles)
CREATE TABLE IF NOT EXISTS articles (
  id BIGSERIAL PRIMARY KEY,
  ean TEXT,
  nartar TEXT,
  libelle TEXT NOT NULL,
  nomo TEXT,
  secteur TEXT,
  rayon TEXT,
  famille TEXT,
  ss_famille TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Index pour recherche rapide
CREATE INDEX IF NOT EXISTS idx_articles_libelle ON articles USING gin(to_tsvector('french', libelle));
CREATE INDEX IF NOT EXISTS idx_articles_ean ON articles(ean);
CREATE INDEX IF NOT EXISTS idx_articles_secteur ON articles(secteur);

-- Table de la structure CYRUS (hiérarchie de classification)
CREATE TABLE IF NOT EXISTS cyrus_structure (
  id BIGSERIAL PRIMARY KEY,
  level INTEGER NOT NULL, -- 1=Secteur, 2=Rayon, 3=Famille, 4=Sous-famille
  code TEXT NOT NULL,
  name TEXT NOT NULL,
  parent_code TEXT,
  full_path TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Index pour la structure CYRUS
CREATE INDEX IF NOT EXISTS idx_cyrus_code ON cyrus_structure(code);
CREATE INDEX IF NOT EXISTS idx_cyrus_level ON cyrus_structure(level);
CREATE INDEX IF NOT EXISTS idx_cyrus_parent ON cyrus_structure(parent_code);

-- Table des corrections de libellés
CREATE TABLE IF NOT EXISTS label_corrections (
  id BIGSERIAL PRIMARY KEY,
  original_label TEXT NOT NULL,
  corrected_label TEXT NOT NULL,
  correction_rules JSONB,
  confidence FLOAT DEFAULT 0,
  validated BOOLEAN DEFAULT FALSE,
  created_by TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Index pour les corrections
CREATE INDEX IF NOT EXISTS idx_corrections_original ON label_corrections(original_label);
CREATE INDEX IF NOT EXISTS idx_corrections_validated ON label_corrections(validated);

-- Table des classifications CYRUS par IA
CREATE TABLE IF NOT EXISTS cyrus_classifications (
  id BIGSERIAL PRIMARY KEY,
  label TEXT NOT NULL,
  secteur TEXT,
  rayon TEXT,
  famille TEXT,
  sous_famille TEXT,
  confidence FLOAT DEFAULT 0,
  ai_reasoning TEXT,
  validated BOOLEAN DEFAULT FALSE,
  created_by TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Index pour les classifications
CREATE INDEX IF NOT EXISTS idx_cyrus_class_label ON cyrus_classifications(label);
CREATE INDEX IF NOT EXISTS idx_cyrus_class_validated ON cyrus_classifications(validated);

-- Table des codes de nomenclature douanière
CREATE TABLE IF NOT EXISTS nomenclature_codes (
  id BIGSERIAL PRIMARY KEY,
  code TEXT UNIQUE NOT NULL,
  description TEXT,
  product_category TEXT,
  surface INTEGER DEFAULT 0,
  tic_base TEXT,
  tva_rate FLOAT DEFAULT 0,
  tic_rate FLOAT DEFAULT 0,
  taxe_sanitaire_rate FLOAT DEFAULT 0,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Index pour nomenclature
CREATE INDEX IF NOT EXISTS idx_nomenclature_code ON nomenclature_codes(code);
CREATE INDEX IF NOT EXISTS idx_nomenclature_category ON nomenclature_codes(product_category);

-- Table des utilisateurs (simple auth)
CREATE TABLE IF NOT EXISTS users (
  id BIGSERIAL PRIMARY KEY,
  username TEXT UNIQUE NOT NULL,
  password_hash TEXT NOT NULL,
  role TEXT DEFAULT 'user',
  last_login TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Index pour users
CREATE INDEX IF NOT EXISTS idx_users_username ON users(username);

-- Table des logs d'activité
CREATE TABLE IF NOT EXISTS activity_logs (
  id BIGSERIAL PRIMARY KEY,
  user_id BIGINT REFERENCES users(id),
  action TEXT NOT NULL,
  entity_type TEXT,
  entity_id TEXT,
  details JSONB,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Index pour les logs
CREATE INDEX IF NOT EXISTS idx_logs_user ON activity_logs(user_id);
CREATE INDEX IF NOT EXISTS idx_logs_action ON activity_logs(action);
CREATE INDEX IF NOT EXISTS idx_logs_created ON activity_logs(created_at);

-- Fonction pour mise à jour automatique du timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Triggers pour mise à jour automatique
CREATE TRIGGER update_articles_updated_at BEFORE UPDATE ON articles FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_nomenclature_updated_at BEFORE UPDATE ON nomenclature_codes FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Insertion des données de nomenclature de base (selon le plan)
INSERT INTO nomenclature_codes (code, description, product_category, surface, tic_base, tva_rate, tic_rate, taxe_sanitaire_rate) VALUES
('2350', 'LAP Parfum', 'Parfum', 500, '23%', 23, 5, 0),
('2315', 'BASE TIC VINS/ALCOOL', 'Vin/Alcool', 1500, '23%', 23, 5, 5),
('2340', 'P.NET JUS FRUITS', 'Jus de fruits', 0, '0%', 0, 0, 5),
('2314', 'LITRE EAU', 'Eau', 14, '23%', 23, 5, 5),
('2040', 'P.NET Pâtes alimentaires', 'Pâtes', 40, '20%', 20, 5, 5),
('2010', 'P. NET YAOURTS', 'Yaourts', 100, '10%', 10, 20, 20),
('1030', 'kg Viandes/Poissons/VOLAILLE', 'Viandes', 0, '10%', 10, 0, 30),
('1005', 'fil/riz/huile tournesol', 'Epicerie de base', 0, '0%', 0, 0, 0),
('2303', 'sac biodégradable', 'Emballage', 300, '23%', 23, 0, 0),
('2301', 'P.animaux/Gaziniere/fer à repasser', 'Bazar', 0, '0%', 0, 0, 0),
('2305', 'Produits entretien/luxe/Bazar', 'Bazar/Entretien', 0, '0%', 0, 0, 0),
('1020', 'fromages', 'Fromages', 0, '10%', 10, 20, 20),
('1010', 'kg crèmes DESSERTS', 'Desserts', 0, '10%', 10, 10, 10),
('1015', 'Epicerie normale/Lait enfantine', 'Epicerie', 0, '10%', 10, 5, 5),
('1305', 'Aliments enfantine', 'Enfantine', 0, '8%', 8, 5, 5),
('1000', 'Electroménager/Textile/Informatique', 'Non-alimentaire', 0, '10%', 10, 0, 0)
ON CONFLICT (code) DO NOTHING;

-- Insertion de l'utilisateur par défaut
INSERT INTO users (username, password_hash, role) VALUES
('men', '$2b$12$LQv3c1yqBWVHxkd0LQ4YCO7gnzS5VjEIZCu.n2U8eFnJxYhNh4P8O', 'admin') -- men2023
ON CONFLICT (username) DO NOTHING;