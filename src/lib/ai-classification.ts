/**
 * Service de classification IA intégré avec OpenRouter et base de données
 * Combine IA automatique + sauvegarde en base + fallback manuel
 */

import OpenRouterService from './openrouter';
import { supabase } from './supabase';
import { getCyrusStructure, saveClassification } from './database';
import type { CyrusClassification } from './supabase';

export interface AIClassificationResult {
  secteur: string;
  rayon: string; 
  famille: string;
  sous_famille: string;
  confidence: number;
  reasoning: string;
  ai_used: boolean;
  processing_time: number;
}

export class AIClassificationService {
  private openRouter: OpenRouterService;
  private cyrusCache: any[] | null = null;

  constructor() {
    this.openRouter = new OpenRouterService();
  }

  /**
   * Classification complète d'un libellé avec IA + sauvegarde
   */
  async classifyLabel(
    label: string,
    createdBy: string = 'ai_system'
  ): Promise<AIClassificationResult> {
    const startTime = Date.now();
    
    try {
      // 1. Charger la structure CYRUS (avec cache)
      if (!this.cyrusCache) {
        this.cyrusCache = await getCyrusStructure();
      }

      if (!this.cyrusCache || this.cyrusCache.length === 0) {
        throw new Error('Structure CYRUS non disponible');
      }

      // 2. Classification IA avec OpenRouter + Gemini
      const aiResult = await this.openRouter.classifyWithCyrus(label, this.cyrusCache);
      
      // 3. Validation et nettoyage du résultat
      const validatedResult = this.validateClassification(aiResult);

      // 4. Sauvegarde en base de données
      const classificationData: Omit<CyrusClassification, 'id' | 'created_at'> = {
        label: label,
        secteur: validatedResult.secteur,
        rayon: validatedResult.rayon,
        famille: validatedResult.famille,
        sous_famille: validatedResult.sous_famille,
        confidence: validatedResult.confidence,
        ai_reasoning: validatedResult.reasoning,
        validated: validatedResult.confidence >= 80, // Auto-validation si confiance élevée
        created_by: createdBy
      };

      await saveClassification(classificationData);

      const processingTime = Date.now() - startTime;

      return {
        ...validatedResult,
        ai_used: true,
        processing_time: processingTime
      };

    } catch (error) {
      console.error('Erreur classification IA:', error);
      
      // Fallback : classification manuelle requise
      const processingTime = Date.now() - startTime;
      
      return {
        secteur: 'GEANT CASINO',
        rayon: 'CLASSIFICATION_MANUELLE_REQUISE',
        famille: 'CLASSIFICATION_MANUELLE_REQUISE', 
        sous_famille: 'CLASSIFICATION_MANUELLE_REQUISE',
        confidence: 0,
        reasoning: `Erreur système: ${error}`,
        ai_used: false,
        processing_time: processingTime
      };
    }
  }

  /**
   * Classification par lot avec IA
   */
  async classifyBatch(
    labels: string[],
    createdBy: string = 'ai_batch_system',
    onProgress?: (current: number, total: number) => void
  ): Promise<AIClassificationResult[]> {
    const results: AIClassificationResult[] = [];
    
    for (let i = 0; i < labels.length; i++) {
      const label = labels[i];
      
      if (onProgress) {
        onProgress(i + 1, labels.length);
      }
      
      try {
        const result = await this.classifyLabel(label, createdBy);
        results.push(result);
        
        // Petite pause pour éviter le rate limiting
        if (i < labels.length - 1) {
          await new Promise(resolve => setTimeout(resolve, 100));
        }
      } catch (error) {
        console.error(`Erreur classification "${label}":`, error);
        results.push({
          secteur: 'GEANT CASINO',
          rayon: 'ERREUR_CLASSIFICATION',
          famille: 'ERREUR_CLASSIFICATION',
          sous_famille: 'ERREUR_CLASSIFICATION', 
          confidence: 0,
          reasoning: `Erreur: ${error}`,
          ai_used: false,
          processing_time: 0
        });
      }
    }

    return results;
  }

  /**
   * Validation et nettoyage des résultats IA
   */
  private validateClassification(result: any): AIClassificationResult {
    return {
      secteur: typeof result.secteur === 'string' ? result.secteur.trim() : 'GEANT CASINO',
      rayon: typeof result.rayon === 'string' ? result.rayon.trim() : 'CLASSIFICATION_MANUELLE_REQUISE',
      famille: typeof result.famille === 'string' ? result.famille.trim() : 'CLASSIFICATION_MANUELLE_REQUISE',
      sous_famille: typeof result.sous_famille === 'string' ? result.sous_famille.trim() : 'CLASSIFICATION_MANUELLE_REQUISE',
      confidence: typeof result.confidence === 'number' ? Math.min(100, Math.max(0, result.confidence)) : 0,
      reasoning: typeof result.reasoning === 'string' ? result.reasoning.trim() : 'Classification automatique',
      ai_used: true,
      processing_time: 0
    };
  }

  /**
   * Test de connexion IA
   */
  async testAIConnection(): Promise<{ success: boolean; model?: string; error?: string }> {
    try {
      return await this.openRouter.testConnection();
    } catch (error) {
      console.error('Test IA échoué:', error);
      return { success: false, error: `Erreur: ${error}` };
    }
  }

  /**
   * Obtenir les statistiques de classification
   */
  async getClassificationStats(): Promise<{
    total: number;
    ai_generated: number;
    validated: number;
    confidence_average: number;
  }> {
    try {
      const { data, error } = await supabase
        .from('cyrus_classifications')
        .select('confidence, validated, ai_reasoning');

      if (error) throw error;

      const total = data.length;
      const ai_generated = data.filter(item => item.ai_reasoning).length;
      const validated = data.filter(item => item.validated).length;
      const confidence_average = data.length > 0 
        ? data.reduce((sum, item) => sum + (item.confidence || 0), 0) / data.length 
        : 0;

      return {
        total,
        ai_generated,
        validated,
        confidence_average: Math.round(confidence_average)
      };
    } catch (error) {
      console.error('Erreur stats classification:', error);
      return { total: 0, ai_generated: 0, validated: 0, confidence_average: 0 };
    }
  }

  /**
   * Nettoyer le cache CYRUS (forcer rechargement)
   */
  clearCache(): void {
    this.cyrusCache = null;
  }
}

export default AIClassificationService;