import { GoogleGenerativeAI, HarmCategory, HarmBlockThreshold, GenerationConfig } from "@google/generative-ai";

// Interface pour le résultat attendu de l'IA
export interface CorrectionAIResult {
  "Libellé Original": string;
  "Libellé Corrigé": string;
}

// Interface pour la réponse JSON complète de l'IA
interface GeminiCorrectionResponse {
  corrections: CorrectionAIResult[];
}

/**
 * Construit le prompt pour la correction d'un seul libellé.
 * @param label Le libellé à corriger.
 * @returns Le prompt complet pour l'IA.
 */
function buildCorrectionPrompt(label: string): string {
  return `
TA MISSION : Tu es un Spécialiste de la Normalisation de Données. Ta mission est de transformer le libellé de produit brut fourni en un format standardisé, en suivant une stratégie rigoureuse.

FORMAT DE SORTIE : Réponds avec un unique objet JSON. Cet objet doit contenir une seule clé "corrections", qui est un tableau contenant un unique objet. Cet objet doit avoir deux clés : "Libellé Original" et "Libellé Corrigé". N'ajoute aucun commentaire ou formatage en dehors de cet objet JSON.

Exemple de format de sortie pour l'entrée "2.2L LESS.LIQ BLEU.MED.CRF EXP":
{
  "corrections": [
    {
      "Libellé Original": "2.2L LESS.LIQ BLEU.MED.CRF EXP",
      "Libellé Corrigé": "CRF LESS LIQ BLEU MED EXP 2,2L"
    }
  ]
}

STRATÉGIE DE TRAITEMENT OBLIGATOIRE :

1.  **IDENTIFICATION DES COMPOSANTS** : Pour le libellé, identifie et isole les 3 blocs suivants :
    *   **BLOC MARQUE** : Identifie la marque (ex: PERRIER, CRF, SIMPL, PIERRE CARD, SPORT AND FUN). Elle est souvent en fin de libellé.
    *   **BLOC QUANTITÉ/FORMAT** : Identifie tout ce qui est une mesure, un format ou un packaging (ex: 1.5L, 6X33CL, X20, PET, BLE, 4 AN, 50/70 CM). Ce bloc est inséparable.
    *   **BLOC DESCRIPTION** : Tout le reste.

2.  **NORMALISATION DES BLOCS** : Applique ces règles à chaque bloc extrait :
    *   Le libellé final doit être 100% en MAJUSCULES.
    *   Supprime tous les caractères spéciaux (tirets, points, apostrophes, slashs) SAUF la virgule.
    *   Dans le BLOC QUANTITÉ/FORMAT, remplace le point décimal par une virgule (ex: 2.5KG -> 2,5KG).
    *   Ne supprime pas le symbole de pourcentage (%) s'il suit un nombre (ex: 80%, 100%).

3.  **RECOMPOSITION FINALE** : Assemble les blocs normalisés dans cet ordre strict : \`[BLOC MARQUE] (si existant) [BLOC DESCRIPTION] [BLOC QUANTITÉ/FORMAT] (si existant)\`.

RÈGLES IMPÉRATIVES (INTERDICTIONS) :
*   NE JAMAIS COMPLÉTER LES ABRÉVIATIONS : Les mots comme CLAS, SFT, EXP, MED, LIQ doivent rester tels quels.
*   NE JAMAIS MODIFIER L'ORDRE DES MOTS au sein du BLOC DESCRIPTION.
*   NE JAMAIS INVENTER D'INFORMATION. Si une marque n'est pas identifiable, n'en ajoute pas.

LIBELLÉ À TRAITER :
"${label}"
`;
}

/**
 * Appelle l'API Gemini pour corriger un seul libellé.
 * @param label Le libellé à corriger.
 * @param apiKey La clé API pour le service Google AI.
 * @returns Une promesse qui se résout avec le résultat de la correction.
 */
export async function correctLabel(label: string, apiKey: string): Promise<CorrectionAIResult> {
  if (!apiKey) {
    throw new Error("La clé API Google est requise.");
  }
  if (!label) {
    return { "Libellé Original": "", "Libellé Corrigé": "" };
  }

  const genAI = new GoogleGenerativeAI(apiKey);
  const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

  const generationConfig: GenerationConfig = {
    response_mime_type: "application/json",
    temperature: 0.0,
  };

  const safetySettings = [
    { category: HarmCategory.HARM_CATEGORY_HARASSMENT, threshold: HarmBlockThreshold.BLOCK_NONE },
    { category: HarmCategory.HARM_CATEGORY_HATE_SPEECH, threshold: HarmBlockThreshold.BLOCK_NONE },
    { category: HarmCategory.HARM_CATEGORY_SEXUALLY_EXPLICIT, threshold: HarmBlockThreshold.BLOCK_NONE },
    { category: HarmCategory.HARM_CATEGORY_DANGEROUS_CONTENT, threshold: HarmBlockThreshold.BLOCK_NONE },
  ];

  const prompt = buildCorrectionPrompt(label);

  try {
    const result = await model.generateContent({
      contents: [{ role: "user", parts: [{ text: prompt }] }],
      generationConfig,
      safetySettings,
    });

    const responseText = result.response.text();
    const responseJson: GeminiCorrectionResponse = JSON.parse(responseText);

    if (!responseJson.corrections || responseJson.corrections.length === 0) {
        throw new Error("La réponse de l'IA est malformée ou ne contient pas de correction.");
    }

    return responseJson.corrections[0];

  } catch (error) {
    console.error(`Erreur lors de la correction du libellé "${label}" via l'API Gemini:`, error);
    // En cas d'erreur, retourner l'original pour ne pas bloquer le lot
    return { "Libellé Original": label, "Libellé Corrigé": label };
  }
}
