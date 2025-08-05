-- Schema pour les articles historiques (97k articles)
-- Table optimisée pour recherche rapide et matching IA

CREATE TABLE IF NOT EXISTS articles_historiques (
    id BIGSERIAL PRIMARY KEY,
    
    -- Identifiants produit
    ean VARCHAR(20),
    nartar VARCHAR(50),
    
    -- Informations produit
    libelle TEXT NOT NULL,
    nomo VARCHAR(20),
    
    -- Classification CYRUS historique
    secteur VARCHAR(100),
    rayon VARCHAR(100), 
    famille VARCHAR(100),
    sous_famille VARCHAR(100),
    
    -- Métadonnées
    import_batch VARCHAR(50) DEFAULT 'batch_' || to_char(NOW(), 'YYYY_MM_DD_HH24_MI'),
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

-- Index pour performance optimale
CREATE INDEX IF NOT EXISTS idx_articles_ean ON articles_historiques(ean);
CREATE INDEX IF NOT EXISTS idx_articles_nartar ON articles_historiques(nartar);
CREATE INDEX IF NOT EXISTS idx_articles_libelle_gin ON articles_historiques USING gin(to_tsvector('french', libelle));
CREATE INDEX IF NOT EXISTS idx_articles_classification ON articles_historiques(secteur, rayon, famille);
CREATE INDEX IF NOT EXISTS idx_articles_import_batch ON articles_historiques(import_batch);

-- Index composite pour matching rapide
CREATE INDEX IF NOT EXISTS idx_articles_search ON articles_historiques(ean, libelle, secteur);

-- Statistiques pour le matching IA
CREATE TABLE IF NOT EXISTS articles_matching_stats (
    id BIGSERIAL PRIMARY KEY,
    total_articles BIGINT DEFAULT 0,
    unique_libelles BIGINT DEFAULT 0,
    unique_eans BIGINT DEFAULT 0,
    classification_coverage DECIMAL(5,2) DEFAULT 0,
    last_updated TIMESTAMP DEFAULT NOW()
);

-- Fonction de mise à jour automatique des timestamps
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_articles_updated_at 
    BEFORE UPDATE ON articles_historiques 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Vue pour recherche rapide
CREATE OR REPLACE VIEW articles_search_view AS
SELECT 
    id,
    ean,
    nartar,
    libelle,
    CONCAT(secteur, ' > ', rayon, ' > ', famille, ' > ', sous_famille) as classification_complete,
    secteur,
    rayon, 
    famille,
    sous_famille,
    created_at
FROM articles_historiques
WHERE libelle IS NOT NULL 
AND secteur IS NOT NULL;

-- Fonction de recherche par similarité de libellé
CREATE OR REPLACE FUNCTION search_similar_articles(
    search_libelle TEXT,
    limit_results INTEGER DEFAULT 10
)
RETURNS TABLE (
    id BIGINT,
    ean VARCHAR(20),
    libelle TEXT,
    secteur VARCHAR(100),
    rayon VARCHAR(100),
    famille VARCHAR(100),
    sous_famille VARCHAR(100),
    similarity_score REAL
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        a.id,
        a.ean,
        a.libelle,
        a.secteur,
        a.rayon,
        a.famille,
        a.sous_famille,
        similarity(a.libelle, search_libelle) as similarity_score
    FROM articles_historiques a
    WHERE a.libelle % search_libelle
    ORDER BY similarity_score DESC, a.created_at DESC
    LIMIT limit_results;
END;
$$ LANGUAGE plpgsql;

-- Activer l'extension pg_trgm si pas déjà fait
CREATE EXTENSION IF NOT EXISTS pg_trgm;

-- Commentaires pour documentation
COMMENT ON TABLE articles_historiques IS 'Articles historiques (97k) pour améliorer la précision de l''IA';
COMMENT ON COLUMN articles_historiques.libelle IS 'Libellé produit - utilisé pour le matching IA';
COMMENT ON COLUMN articles_historiques.ean IS 'Code-barres EAN13 du produit';
COMMENT ON COLUMN articles_historiques.import_batch IS 'Batch d''import pour traçabilité';
COMMENT ON INDEX idx_articles_libelle_gin IS 'Index GIN pour recherche full-text en français';
COMMENT ON FUNCTION search_similar_articles IS 'Recherche d''articles similaires par libellé avec score de similarité';