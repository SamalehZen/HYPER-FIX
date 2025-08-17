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

const buildPrompt = (productsToClassify: string, hierarchyText: string): string => {
    const fewShotExample1_input = "TSHIRT MC ANTIUV DE PLAGE BEUCHAT 6 AN";
    const fewShotExample1_output = "TSHIRT MC ANTIUV DE PLAGE BEUCHAT 6 AN,TEXTILE,06,BEBE ENFANTS,062,VTEMENT SPORT/FILLE 6-16,665,SPORTWEAR,501";
    const fewShotExample2_input = "KIT PALMES REGLABLES MASQUE ET TUBA 38/41";
    const fewShotExample2_output = "KIT PALMES REGLABLES MASQUE ET TUBA 38/41,BAZAR,07,SPORTS,071,SPORTS AQUATIQUES,712,SET PLONGEE,204";

    return `### RÔLE ET OBJECTIF ###
Tu es un gestionnaire de catégories expert et extrêmement méticuleux, dont la mission est de classifier des produits selon une hiérarchie de magasin précise. Ta tâche est d'assigner chaque produit au bon Secteur, Rayon, Famille et Sous-famille, sans aucune erreur.

### CONTEXTE : HIÉRARCHIE PRODUIT ###
La SEULE source que tu DOIS utiliser pour la classification est la structure fournie ci-dessous entre les balises \`\`\`
<HIERARCHY>
</HIERARCHY>
\`\`\`. Ne dévie sous aucun prétexte de cette structure.

<HIERARCHY>
${hierarchyText}
</HIERARCHY>

### INSTRUCTIONS DE LA TÂCHE ###
Une liste de produits te sera fournie. Pour chaque produit, suis rigoureusement les étapes suivantes :
1.  Lis attentivement le nom du produit ("libelle") et identifie les mots-clés qui décrivent le produit, sa nature, son usage ou sa cible.
2.  En te basant sur la hiérarchie fournie, trouve le **Secteur** le plus approprié (ex: "TEXTILE", "BAZAR") et son numéro.
3.  À l'intérieur de ce Secteur, identifie le **Rayon** le plus pertinent (ex: "BEBE ENFANTS", "SPORTS") et son numéro.
4.  À l'intérieur de ce Rayon, identifie la **Famille** la plus logique (ex: "VTEMENT SPORT/PLAGE GIRL", "SPORTS AQUATIQUES") et son numéro.
5.  Enfin, à l'intérieur de cette Famille, sélectionne la **Sous-famille** la plus spécifique et correcte (ex: "VETEMENT DE SPORT", "SET PLONGEE") et son numéro.
6.  Formate la sortie en une seule ligne par produit, au format CSV, avec les colonnes séparées par une virgule. N'inclus pas de ligne d'en-tête. L'ordre des colonnes doit être :
    \`libelle,nom_secteur,numero_secteur,nom_rayon,numero_rayon,nom_famille,numero_famille,nom_sous_famille,numero_sous_famille\`

### EXEMPLES (FORMAT DE SORTIE ATTENDU) ###
Voici des exemples exacts du format de sortie que j'attends de toi :

Exemple 1:
Input: ${fewShotExample1_input}
Output: ${fewShotExample1_output}

Exemple 2:
Input: ${fewShotExample2_input}
Output: ${fewShotExample2_output}

### PRODUITS À CLASSIFIER ###
Maintenant, classifie la liste de produits suivante en respectant toutes les instructions ci-dessus :

${productsToClassify}
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

export const classifyProducts = async (
    products: Product[],
    hierarchy: ClassificationNode[],
    apiKey: string,
    rpm: number, // Keep for potential future use, though we now send one big request.
    onProgress: (status: import("./types").ProgressStatus) => void
): Promise<ClassifiedProduct[]> => {
    if (!apiKey) {
        throw new Error("API key is required.");
    }

    const genAI = new GoogleGenerativeAI(apiKey);
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

    // Updated GenerationConfig: No JSON schema, expecting plain text (CSV).
    // Temperature adjusted as per user suggestion.
    const generationConfig: GenerationConfig = {
      temperature: 0.5,
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
    const productDescriptions = products.map(p => p.description).join('\n');

    try {
        onProgress({ type: 'PROGRESS', current: 1, total: 1 }); // Single batch request

        const prompt = buildPrompt(productDescriptions, hierarchyText);

        const result = await model.generateContent({
            contents: [{ role: "user", parts: [{ text: prompt }] }],
            generationConfig,
            safetySettings,
        });

        const csvResponse = result.response.text();
        const classifiedProducts = parseCsvResponse(csvResponse, products);

        onProgress({ type: 'COMPLETE' });
        return classifiedProducts;

    } catch (error) {
        console.error(`Failed to classify batch`, error);
        onProgress({ type: 'ERROR', message: `L'appel à l'API a échoué: ${error}` });
        // Return original products with unclassified status
        return products.map(p => ({
            description: p.description,
            classification: UNCLASSIFIED_RESULT,
        }));
    }
};

import { parseCsvResponse } from './csv-parser';