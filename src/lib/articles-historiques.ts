/**
 * Service de gestion des articles historiques (97k articles)
 * Matching intelligent et amélioration de l'IA
 */

import { supabase } from './supabase';

export interface ArticleHistorique {
  id?: number;
  ean?: string;
  nartar?: string;
  libelle: string;
  nomo?: string;
  secteur?: string;
  rayon?: string;
  famille?: string;
  sous_famille?: string;
  import_batch?: string;
  created_at?: string;
}

export interface SimilarityMatch {
  id: number;
  ean?: string;
  libelle: string;
  secteur: string;
  rayon: string;
  famille: string;
  sous_famille: string;
  similarity_score: number;
}

export interface HistoricalStats {
  total_articles: number;
  unique_libelles: number;
  unique_eans: number;
  classification_coverage: number;
  last_updated: string;
}

export class ArticlesHistoriquesService {
  
  /**
   * Rechercher des articles similaires par libellé
   */
  async searchSimilarArticles(
    libelle: string, 
    limit: number = 10
  ): Promise<SimilarityMatch[]> {
    try {
      const { data, error } = await supabase.rpc('search_similar_articles', {
        search_libelle: libelle,
        limit_results: limit
      });

      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('Erreur recherche similarité:', error);
      return [];
    }
  }

  /**
   * Trouver le meilleur match historique pour un libellé
   */
  async findBestMatch(libelle: string): Promise<SimilarityMatch | null> {
    const matches = await this.searchSimilarArticles(libelle, 1);
    
    if (matches.length > 0 && matches[0].similarity_score >= 0.6) {
      return matches[0];
    }
    
    return null;
  }

  /**
   * Rechercher par EAN exact
   */
  async findByEAN(ean: string): Promise<ArticleHistorique | null> {
    try {
      const { data, error } = await supabase
        .from('articles_historiques')
        .select('*')
        .eq('ean', ean)
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Erreur recherche EAN:', error);
      return null;
    }
  }

  /**
   * Recherche full-text avancée
   */
  async searchFullText(query: string, limit: number = 20): Promise<ArticleHistorique[]> {
    try {
      const { data, error } = await supabase
        .from('articles_historiques')
        .select('*')
        .textSearch('libelle', query, {
          type: 'websearch',
          config: 'french'
        })
        .limit(limit);

      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('Erreur recherche full-text:', error);
      return [];
    }
  }

  /**
   * Obtenir des suggestions de classification basées sur l'historique
   */
  async getClassificationSuggestions(libelle: string): Promise<{
    historical_match?: SimilarityMatch;
    similar_classifications: Array<{
      secteur: string;
      rayon: string;
      famille: string;
      sous_famille: string;
      frequency: number;
    }>;
  }> {
    // 1. Chercher un match direct
    const bestMatch = await this.findBestMatch(libelle);
    
    // 2. Chercher des classifications similaires
    const { data: similar, error } = await supabase
      .from('articles_historiques')
      .select('secteur, rayon, famille, sous_famille')
      .textSearch('libelle', libelle, { type: 'websearch', config: 'french' })
      .not('secteur', 'is', null)
      .limit(50);

    if (error) {
      console.error('Erreur suggestions:', error);
      return { similar_classifications: [] };
    }

    // Grouper et compter les classifications
    const classificationCounts = new Map();
    
    similar?.forEach(item => {
      const key = `${item.secteur}|${item.rayon}|${item.famille}|${item.sous_famille}`;
      classificationCounts.set(key, (classificationCounts.get(key) || 0) + 1);
    });

    // Trier par fréquence
    const sortedClassifications = Array.from(classificationCounts.entries())
      .map(([key, frequency]) => {
        const [secteur, rayon, famille, sous_famille] = key.split('|');
        return { secteur, rayon, famille, sous_famille, frequency };
      })
      .sort((a, b) => b.frequency - a.frequency)
      .slice(0, 5);

    return {
      historical_match: bestMatch || undefined,
      similar_classifications: sortedClassifications
    };
  }

  /**
   * Statistiques des articles historiques
   */
  async getStats(): Promise<HistoricalStats> {
    try {
      const { data, error } = await supabase
        .from('articles_matching_stats')
        .select('*')
        .single();

      if (error || !data) {
        // Calculer les stats si pas encore en cache
        return await this.calculateStats();
      }

      return {
        total_articles: data.total_articles,
        unique_libelles: data.unique_libelles,
        unique_eans: data.unique_eans,
        classification_coverage: data.classification_coverage,
        last_updated: data.last_updated
      };
    } catch (error) {
      console.error('Erreur statistiques:', error);
      return {
        total_articles: 0,
        unique_libelles: 0,
        unique_eans: 0,
        classification_coverage: 0,
        last_updated: new Date().toISOString()
      };
    }
  }

  /**
   * Calculer les statistiques en temps réel
   */
  private async calculateStats(): Promise<HistoricalStats> {
    try {
      // Total articles
      const { count: totalCount } = await supabase
        .from('articles_historiques')
        .select('*', { count: 'exact', head: true });

      // Libellés uniques
      const { data: uniqueLibelles } = await supabase
        .from('articles_historiques')
        .select('libelle')
        .not('libelle', 'is', null);

      // EANs uniques
      const { data: uniqueEans } = await supabase
        .from('articles_historiques')
        .select('ean')
        .not('ean', 'is', null);

      // Articles avec classification complète
      const { count: classifiedCount } = await supabase
        .from('articles_historiques')
        .select('*', { count: 'exact', head: true })
        .not('secteur', 'is', null)
        .not('rayon', 'is', null)
        .not('famille', 'is', null);

      const stats = {
        total_articles: totalCount || 0,
        unique_libelles: new Set(uniqueLibelles?.map(item => item.libelle)).size,
        unique_eans: new Set(uniqueEans?.map(item => item.ean)).size,
        classification_coverage: totalCount ? ((classifiedCount || 0) / totalCount) * 100 : 0,
        last_updated: new Date().toISOString()
      };

      // Sauvegarder en cache
      await supabase
        .from('articles_matching_stats')
        .upsert({
          id: 1,
          ...stats
        });

      return stats;
    } catch (error) {
      console.error('Erreur calcul stats:', error);
      return {
        total_articles: 0,
        unique_libelles: 0,
        unique_eans: 0,
        classification_coverage: 0,
        last_updated: new Date().toISOString()
      };
    }
  }

  /**
   * Import par batch pour gros volumes
   */
  async importBatch(articles: Omit<ArticleHistorique, 'id' | 'created_at'>[]): Promise<{
    success: number;
    errors: string[];
  }> {
    const results = { success: 0, errors: [] as string[] };
    const batchSize = 1000;

    try {
      for (let i = 0; i < articles.length; i += batchSize) {
        const batch = articles.slice(i, i + batchSize);
        
        const { error } = await supabase
          .from('articles_historiques')
          .insert(batch);

        if (error) {
          results.errors.push(`Batch ${i}-${i + batchSize}: ${error.message}`);
        } else {
          results.success += batch.length;
        }
      }
    } catch (error) {
      results.errors.push(`Erreur globale: ${error}`);
    }

    return results;
  }

  /**
   * Nettoyer et normaliser les données avant import
   */
  static normalizeArticleData(rawData: any): Omit<ArticleHistorique, 'id' | 'created_at'> {
    return {
      ean: rawData.ean?.toString().trim() || null,
      nartar: rawData.nartar?.toString().trim() || null,
      libelle: rawData.libelle?.toString().trim().toUpperCase() || '',
      nomo: rawData.nomo?.toString().trim() || null,
      secteur: rawData.secteur?.toString().trim().toUpperCase() || null,
      rayon: rawData.rayon?.toString().trim().toUpperCase() || null,
      famille: rawData.famille?.toString().trim().toUpperCase() || null,
      sous_famille: rawData.sous_famille?.toString().trim().toUpperCase() || null,
      import_batch: `batch_${new Date().toISOString().slice(0, 10)}`
    };
  }

  /**
   * Vérifier la santé de la base d'articles
   */
  async healthCheck(): Promise<{
    isHealthy: boolean;
    issues: string[];
    recommendations: string[];
  }> {
    const issues: string[] = [];
    const recommendations: string[] = [];

    try {
      const stats = await this.getStats();

      if (stats.total_articles === 0) {
        issues.push('Aucun article historique trouvé');
        recommendations.push('Importer les articles historiques');
      }

      if (stats.classification_coverage < 80) {
        issues.push(`Couverture classification faible: ${stats.classification_coverage.toFixed(1)}%`);
        recommendations.push('Nettoyer et compléter les classifications manquantes');
      }

      if (stats.unique_libelles / stats.total_articles < 0.8) {
        issues.push('Beaucoup de doublons détectés');
        recommendations.push('Déduplication des articles recommandée');
      }

      return {
        isHealthy: issues.length === 0,
        issues,
        recommendations
      };
    } catch (error) {
      return {
        isHealthy: false,
        issues: [`Erreur health check: ${error}`],
        recommendations: ['Vérifier la connectivité base de données']
      };
    }
  }
}

export default ArticlesHistoriquesService;