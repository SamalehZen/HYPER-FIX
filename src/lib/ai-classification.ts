/**
 * Service de classification IA intégré avec OpenRouter et base de données
 * Combine IA automatique + sauvegarde en base + fallback manuel
 */

import OpenRouterService from './openrouter';
import { supabase } from './supabase';
import { getCyrusStructure, saveClassification } from './database';
import type { CyrusClassification } from './supabase';

// --- NOUVELLE LOGIQUE DE CLASSIFICATION (GEMINI) ---
import { GoogleGenerativeAI, HarmCategory, HarmBlockThreshold, GenerationConfig, GenerativeModel, InputContent } from "@google/generative-ai";
import type { Product, ClassifiedProduct, ClassificationNode, GeminiResponse, ClassificationPath } from './types';


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


// --- NOUVELLE LOGIQUE DE CLASSIFICATION (GEMINI) ---

const UNCLASSIFIED_CATEGORY = { code: "N/A", name: "NON CLASSIFIÉ" };
const UNCLASSIFIED_RESULT: ClassificationPath = {
    secteur: UNCLASSIFIED_CATEGORY,
    rayon: UNCLASSIFIED_CATEGORY,
    famille: UNCLASSIFIED_CATEGORY,
    sousFamille: UNCLASSIFIED_CATEGORY,
};

const buildPrompt = (productDescription: string, hierarchyText: string): string => {
    return `
    You are an expert product classifier for a supermarket. Your task is to classify a given product description into a predefined hierarchical structure.

    This is the complete classification hierarchy:
    --- HIERARCHY START ---
    ${hierarchyText}
    --- HIERARCHY END ---

    Rules:
    1. Analyze the product description: "${productDescription}".
    2. Find the most appropriate complete path from the hierarchy: Secteur > Rayon > Famille > Sous-famille.
    3. You MUST return the full path, including codes and names for all four levels.
    4. If no suitable classification can be found with high confidence, you MUST return "NON CLASSIFIÉ" for all names and "N/A" for all codes.
    5. Respond ONLY with the JSON object. Do not add any extra text or explanations.
    `;
};

const getHierarchyAsText = (hierarchy: ClassificationNode[]): string => {
    const lines: string[] = [];
    // This creates a simpler text representation for the prompt.
    hierarchy.forEach(node => {
        const indent = "  ".repeat(node.level);
        lines.push(`${indent}${node.code} ${node.name}`);
    });
    return lines.join('\n');
};

export const classifyProducts = async (products: Product[], hierarchy: ClassificationNode[], apiKey: string): Promise<ClassifiedProduct[]> => {
    if (!apiKey) {
        throw new Error("API key is required.");
    }

    const genAI = new GoogleGenerativeAI(apiKey);
    const model = genAI.getGenerativeModel({
      model: "gemini-1.5-flash",
    });

    const generationConfig: GenerationConfig = {
      responseMimeType: "application/json",
      responseSchema: {
        type: "object",
        properties: {
            secteur_code: { type: "string" },
            secteur_name: { type: "string" },
            rayon_code: { type: "string" },
            rayon_name: { type: "string" },
            famille_code: { type: "string" },
            famille_name: { type: "string" },
            sous_famille_code: { type: "string" },
            sous_famille_name: { type: "string" },
        },
        required: ["secteur_code", "secteur_name", "rayon_code", "rayon_name", "famille_code", "famille_name", "sous_famille_code", "sous_famille_name"]
      },
      temperature: 0.2,
      topP: 0.9,
      topK: 40,
    };

    const safetySettings = [
      { category: HarmCategory.HARM_CATEGORY_HARASSMENT, threshold: HarmBlockThreshold.BLOCK_NONE },
      { category: HarmCategory.HARM_CATEGORY_HATE_SPEECH, threshold: HarmBlockThreshold.BLOCK_NONE },
      { category: HarmCategory.HARM_CATEGORY_SEXUALLY_EXPLICIT, threshold: HarmBlockThreshold.BLOCK_NONE },
      { category: HarmCategory.HARM_CATEGORY_DANGEROUS_CONTENT, threshold: HarmBlockThreshold.BLOCK_NONE },
    ];

    const hierarchyText = getHierarchyAsText(hierarchy);
    const classifiedProducts: ClassifiedProduct[] = [];

    for (const product of products) {
        try {
            const prompt = buildPrompt(product.description, hierarchyText);

            const result = await model.generateContent({
                contents: [{ role: "user", parts: [{ text: prompt }] }],
                generationConfig,
                safetySettings,
            });

            const jsonText = result.response.text();
            const responseData = JSON.parse(jsonText) as GeminiResponse;

            classifiedProducts.push({
                description: product.description,
                classification: {
                    secteur: { code: responseData.secteur_code, name: responseData.secteur_name },
                    rayon: { code: responseData.rayon_code, name: responseData.rayon_name },
                    famille: { code: responseData.famille_code, name: responseData.famille_name },
                    sousFamille: { code: responseData.sous_famille_code, name: responseData.sous_famille_name },
                },
            });

        } catch (error) {
            console.error(`Failed to classify product: "${product.description}"`, error);
            classifiedProducts.push({
                description: product.description,
                classification: UNCLASSIFIED_RESULT,
            });
        }
    }

    return classifiedProducts;
};