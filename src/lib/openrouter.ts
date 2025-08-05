/**
 * Service OpenRouter pour intégration IA avec Gemini 2.0 Flash
 * Classification automatique CYRUS en temps réel
 */

const OPENROUTER_API_URL = 'https://openrouter.ai/api/v1/chat/completions';
const PRIMARY_MODEL = 'google/gemini-2.0-flash-exp:free';
const FALLBACK_MODEL = 'deepseek/deepseek-r1-distill-llama-70b:free';

// Modèles gratuits disponibles pour fallback
const FREE_MODELS = [
  'google/gemini-2.0-flash-exp:free',
  'deepseek/deepseek-r1-distill-llama-70b:free',
  'meta-llama/llama-3.2-3b-instruct:free',
  'microsoft/phi-3-mini-128k-instruct:free'
];

interface OpenRouterResponse {
  choices: {
    message: {
      content: string;
    };
  }[];
  usage?: {
    prompt_tokens: number;
    completion_tokens: number;
    total_tokens: number;
  };
}

interface ClassificationResult {
  secteur: string;
  rayon: string;
  famille: string;
  sous_famille: string;
  confidence: number;
  reasoning: string;
}

export class OpenRouterService {
  private apiKey: string;

  constructor() {
    this.apiKey = import.meta.env.VITE_OPENROUTER_API_KEY;
    if (!this.apiKey) {
      throw new Error('VITE_OPENROUTER_API_KEY manquante dans les variables d\'environnement');
    }
  }

  /**
   * Classification automatique d'un libellé avec la structure CYRUS
   */
  async classifyWithCyrus(
    libelle: string, 
    cyrusStructure: any[]
  ): Promise<ClassificationResult> {
    
    // Construire le prompt avec la structure CYRUS
    const prompt = this.buildClassificationPrompt(libelle, cyrusStructure);
    
    // Essayer avec le modèle principal, puis fallback
    for (const model of [PRIMARY_MODEL, FALLBACK_MODEL]) {
      try {
        const response = await fetch(OPENROUTER_API_URL, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${this.apiKey}`,
            'HTTP-Referer': window.location.origin,
            'X-Title': 'L\'HyperFix - Classification CYRUS'
          },
          body: JSON.stringify({
            model: model,
            messages: [
              {
                role: 'system',
                content: 'Tu es un expert en classification de produits. Tu analyses les libellés et les classes selon la structure CYRUS fournie. Réponds UNIQUEMENT en JSON valide.'
              },
              {
                role: 'user',
                content: prompt
              }
            ],
            temperature: 0.1, // Faible pour plus de consistance
            max_tokens: 500,
            ...(model.includes('gemini') ? { response_format: { type: 'json_object' } } : {})
          })
        });

        if (!response.ok) {
          // Si rate limit sur le modèle principal, essayer le fallback
          if (response.status === 429 && model === PRIMARY_MODEL) {
            console.warn(`Rate limit sur ${model}, tentative avec ${FALLBACK_MODEL}`);
            continue;
          }
          throw new Error(`Erreur OpenRouter: ${response.status} ${response.statusText}`);
        }

        const data: OpenRouterResponse = await response.json();
        const content = data.choices[0]?.message?.content;

        if (!content) {
          throw new Error('Réponse vide de l\'IA');
        }

        // Parser la réponse JSON
        let result;
        try {
          result = JSON.parse(content);
        } catch (parseError) {
          // Si ce n'est pas du JSON valide, essayer d'extraire les infos
          console.warn('Réponse non-JSON, tentative d\'extraction:', content);
          result = this.extractClassificationFromText(content);
        }
        
        return {
          secteur: result.secteur || '',
          rayon: result.rayon || '',
          famille: result.famille || '',
          sous_famille: result.sous_famille || '',
          confidence: result.confidence || 75,
          reasoning: result.reasoning || `Classification automatique par IA (${model})`
        };

      } catch (error) {
        console.error(`Erreur avec ${model}:`, error);
        
        // Si c'est le dernier modèle, utiliser le fallback manuel
        if (model === FALLBACK_MODEL) {
          break;
        }
      }
    }
      
    // Fallback classification basique
    return {
      secteur: 'GEANT CASINO',
      rayon: 'CLASSIFICATION_MANUELLE_REQUISE',
      famille: 'CLASSIFICATION_MANUELLE_REQUISE',
      sous_famille: 'CLASSIFICATION_MANUELLE_REQUISE',
      confidence: 0,
      reasoning: `Tous les modèles IA sont indisponibles. Classification manuelle recommandée.`
    };
  }

  /**
   * Extraction de classification depuis du texte non-JSON
   */
  private extractClassificationFromText(text: string): any {
    const result: any = {};
    
    // Patterns pour extraire les infos
    const patterns = {
      secteur: /secteur[":]\s*["']([^"']+)["']/i,
      rayon: /rayon[":]\s*["']([^"']+)["']/i,
      famille: /famille[":]\s*["']([^"']+)["']/i,
      sous_famille: /sous[_-]?famille[":]\s*["']([^"']+)["']/i,
      confidence: /confidence[":]\s*(\d+)/i
    };
    
    for (const [key, pattern] of Object.entries(patterns)) {
      const match = text.match(pattern);
      if (match) {
        result[key] = key === 'confidence' ? parseInt(match[1]) : match[1];
      }
    }
    
    return result;
  }

  /**
   * Construire le prompt de classification avec la structure CYRUS
   */
  private buildClassificationPrompt(libelle: string, cyrusStructure: any[]): string {
    // Organiser la structure par niveaux
    const secteurs = cyrusStructure.filter(item => item.level === 1);
    const rayons = cyrusStructure.filter(item => item.level === 2);
    const familles = cyrusStructure.filter(item => item.level === 3);
    const sousFamilles = cyrusStructure.filter(item => item.level === 4);

    return `
TÂCHE: Classifier le libellé "${libelle}" selon la structure CYRUS fournie.

STRUCTURE CYRUS DISPONIBLE:

SECTEURS (niveau 1):
${secteurs.map(s => `- ${s.code}: ${s.name}`).join('\n')}

RAYONS (niveau 2):
${rayons.slice(0, 20).map(r => `- ${r.code}: ${r.name} (parent: ${r.parent_code})`).join('\n')}
${rayons.length > 20 ? `... et ${rayons.length - 20} autres rayons` : ''}

FAMILLES (niveau 3):
${familles.slice(0, 20).map(f => `- ${f.code}: ${f.name} (parent: ${f.parent_code})`).join('\n')}
${familles.length > 20 ? `... et ${familles.length - 20} autres familles` : ''}

SOUS-FAMILLES (niveau 4 - échantillon):
${sousFamilles.slice(0, 30).map(sf => `- ${sf.code}: ${sf.name} (parent: ${sf.parent_code})`).join('\n')}
${sousFamilles.length > 30 ? `... et ${sousFamilles.length - 30} autres sous-familles` : ''}

INSTRUCTIONS:
1. Analyse le libellé "${libelle}"
2. Trouve la classification la plus appropriée dans la hiérarchie CYRUS
3. Assure-toi que la hiérarchie est cohérente (secteur → rayon → famille → sous-famille)
4. Donne un score de confiance entre 0 et 100

RÉPONSE (format JSON uniquement):
{
  "secteur": "nom_du_secteur",
  "rayon": "nom_du_rayon", 
  "famille": "nom_de_la_famille",
  "sous_famille": "nom_de_la_sous_famille",
  "confidence": 85,
  "reasoning": "Explication courte de la classification"
}
`;
  }

  /**
   * Test de connexion à l'API OpenRouter avec fallback
   */
  async testConnection(): Promise<{ success: boolean; model?: string; error?: string }> {
    for (const model of [PRIMARY_MODEL, FALLBACK_MODEL]) {
      try {
        const response = await fetch(OPENROUTER_API_URL, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${this.apiKey}`,
            'HTTP-Referer': window.location.origin,
          },
          body: JSON.stringify({
            model: model,
            messages: [
              {
                role: 'user',
                content: 'Test de connexion. Réponds juste "OK".'
              }
            ],
            max_tokens: 10
          })
        });

        if (response.ok) {
          return { success: true, model };
        } else if (response.status !== 429) {
          // Si ce n'est pas un rate limit, arrêter
          const errorText = await response.text();
          return { success: false, error: `${response.status}: ${errorText}` };
        }
      } catch (error) {
        console.error(`Test connexion ${model} échoué:`, error);
      }
    }
    
    return { success: false, error: 'Tous les modèles sont indisponibles' };
  }
}

/**
 * Service simplifié pour tests rapides
 */
export const testAIConnection = async (): Promise<boolean> => {
  try {
    const service = new OpenRouterService();
    const result = await service.testConnection();
    return result.success;
  } catch {
    return false;
  }
};

export default OpenRouterService;