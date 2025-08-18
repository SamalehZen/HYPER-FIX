// Utilitaires pour la correction automatique de libellés
// Selon les spécifications du plan

export interface CorrectionRule {
  name: string;
  pattern: RegExp;
  replacement: string | ((match: string, ...groups: string[]) => string);
  description: string;
}

export interface CorrectionResult {
  original: string;
  corrected: string;
  rules: string[];
  confidence: number;
}

// Règles de correction de base
export const CORRECTION_RULES: CorrectionRule[] = [
  // Suppression des caractères spéciaux
  {
    name: 'remove_special_chars',
    pattern: /[^\w\s\-\.]/g,
    replacement: '',
    description: 'Suppression des caractères spéciaux'
  },
  
  // Normalisation des grammages et volumes
  {
    name: 'normalize_volume_liters',
    pattern: /(\d+(?:\.\d+)?)\s*L(?:ITRES?)?/gi,
    replacement: (match, number) => `${number.replace('.', ',')}L`,
    description: 'Normalisation des volumes en litres'
  },
  
  {
    name: 'normalize_volume_ml',
    pattern: /(\d+(?:\.\d+)?)\s*ML/gi,
    replacement: (match, number) => `${number.replace('.', ',')}ML`,
    description: 'Normalisation des volumes en millilitres'
  },
  
  {
    name: 'normalize_weight_kg',
    pattern: /(\d+(?:\.\d+)?)\s*KG/gi,
    replacement: (match, number) => `${number.replace('.', ',')}KG`,
    description: 'Normalisation des poids en kilogrammes'
  },
  
  {
    name: 'normalize_weight_g',
    pattern: /(\d+(?:\.\d+)?)\s*G(?:RAMMES?)?/gi,
    replacement: (match, number) => `${number.replace('.', ',')}G`,
    description: 'Normalisation des poids en grammes'
  },
  
  // Conversion des fractions courantes
  {
    name: 'convert_fraction_half',
    pattern: /1\/2/g,
    replacement: '0,5',
    description: 'Conversion fraction 1/2'
  },
  
  {
    name: 'convert_fraction_quarter',
    pattern: /1\/4/g,
    replacement: '0,25',
    description: 'Conversion fraction 1/4'
  },
  
  {
    name: 'convert_fraction_three_quarter',
    pattern: /3\/4/g,
    replacement: '0,75',
    description: 'Conversion fraction 3/4'
  },
  
  // Nettoyage des espaces multiples
  {
    name: 'clean_multiple_spaces',
    pattern: /\s+/g,
    replacement: ' ',
    description: 'Nettoyage des espaces multiples'
  },
  
  // Nettoyage des tirets multiples
  {
    name: 'clean_multiple_dashes',
    pattern: /\-+/g,
    replacement: '-',
    description: 'Nettoyage des tirets multiples'
  }
];

// Liste des marques connues
export const KNOWN_BRANDS = [
  // Marques de la nouvelle spec
  'BEUCHAT', 'PERRIER', 'VOLVIC', 'OASIS', 'CRF', 'SIMPL', 'PIERRE CARD', 'TRAVEL WORLD', 'SPORT AND FUN', 'NECTAR OF BEAUTY',
  // Anciennes marques
  'CARREFOUR', 'BONDUELLE', 'SRP', 'LOTUS', 'TWIX', 'BOUNTY', 'NUTELLA',
  'KINDER', 'RAFFAELLO', 'SNICKERS', 'CRF SENS', 'CRF EXTRA', 'CRF CLASSIC', 'CRF CLASS',
  'CRF BIO', 'CRF OR', 'CRF EX', 'CRF CL', 'CRF E', 'CRF C', 'CRF S', 'CRFM',
  'CRFCLA', 'CRFCL', 'CRFC', 'CRFEX'
];

// Fonctions de correction principales
export function correctLabel(originalLabel: string): CorrectionResult {
  let corrected = originalLabel.trim();
  const appliedRules: string[] = [];
  
  // Appliquer toutes les règles
  for (const rule of CORRECTION_RULES) {
    const before = corrected;
    
    if (typeof rule.replacement === 'string') {
      corrected = corrected.replace(rule.pattern, rule.replacement);
    } else {
      corrected = corrected.replace(rule.pattern, rule.replacement);
    }
    
    if (before !== corrected) {
      appliedRules.push(rule.name);
    }
  }
  
  // Mise en forme finale: MARQUE - NOM - GRAMMAGE
  corrected = formatFinalLabel(corrected);
  
  // Calcul de la confiance basé sur le nombre de corrections
  const confidence = calculateConfidence(originalLabel, corrected, appliedRules.length);
  
  return {
    original: originalLabel,
    corrected: corrected.toUpperCase(),
    rules: appliedRules,
    confidence
  };
}

function formatFinalLabel(label: string): string {
  // Logique pour organiser en format MARQUE - NOM - GRAMMAGE
  // Cette fonction peut être affinée selon les besoins spécifiques
  
  // Nettoyer les espaces en début et fin
  label = label.trim();
  
  // Remplacer les séparateurs variés par des tirets
  label = label.replace(/[\s]*[-–—]\s*/g, ' - ');
  label = label.replace(/\s*[,;]\s*/g, ' - ');
  
  // Si pas de tirets, essayer de détecter marque/nom/grammage automatiquement
  if (!label.includes(' - ')) {
    // Pattern simple: premier mot = marque, derniers caractères avec chiffres = grammage
    const grammagePatter = /(\d+(?:,\d+)?(?:G|ML|L|KG))\s*$/i;
    const grammageMatch = label.match(grammagePatter);
    
    if (grammageMatch) {
      const grammage = grammageMatch[1];
      const restLabel = label.replace(grammagePatter, '').trim();
      
      // Séparer marque (premier mot) du reste
      const words = restLabel.split(/\s+/);
      if (words.length > 1) {
        const marque = words[0];
        const nom = words.slice(1).join(' ');
        return `${marque} - ${nom} - ${grammage}`;
      }
    }
  }
  
  return label;
}

function calculateConfidence(original: string, corrected: string, rulesCount: number): number {
  // Confiance basée sur:
  // - Nombre de corrections appliquées (moins = mieux)
  // - Longueur relative du texte corrigé
  // - Présence d'éléments structurés (grammage, marque, etc.)
  
  let confidence = 100;
  
  // Pénalité pour chaque règle appliquée
  confidence -= rulesCount * 5;
  
  // Bonus si le format final semble bien structuré
  if (corrected.includes(' - ')) confidence += 10;
  if (/\d+(?:,\d+)?(?:G|ML|L|KG)/i.test(corrected)) confidence += 10;
  
  // Pénalité si trop de différence avec l'original
  const similarity = calculateSimilarity(original, corrected);
  if (similarity < 0.7) confidence -= 20;
  
  return Math.max(0, Math.min(100, confidence));
}

function calculateSimilarity(str1: string, str2: string): number {
  // Similarité simple basée sur la longueur et les caractères communs
  const len1 = str1.length;
  const len2 = str2.length;
  const maxLen = Math.max(len1, len2);
  
  if (maxLen === 0) return 1;
  
  let common = 0;
  const shorter = len1 < len2 ? str1 : str2;
  const longer = len1 < len2 ? str2 : str1;
  
  for (let i = 0; i < shorter.length; i++) {
    if (longer.includes(shorter[i])) common++;
  }
  
  return common / maxLen;
}

// Correction par lots
export function correctLabels(labels: string[]): CorrectionResult[] {
  return labels.map(label => correctLabel(label));
}

// Validation manuelle d'une correction
export function validateCorrection(result: CorrectionResult, isValid: boolean): CorrectionResult {
  return {
    ...result,
    confidence: isValid ? 100 : 0
  };
}

// Export de données corrigées
export function exportCorrections(results: CorrectionResult[], format: 'csv' | 'json' = 'csv'): string {
  if (format === 'json') {
    return JSON.stringify(results, null, 2);
  }
  
  // Export CSV
  const headers = ['Original', 'Corrected', 'Rules', 'Confidence'];
  const csvLines = [headers.join(',')];
  
  for (const result of results) {
    const line = [
      `"${result.original.replace(/"/g, '""')}"`,
      `"${result.corrected.replace(/"/g, '""')}"`,
      `"${result.rules.join(';')}"`,
      result.confidence.toString()
    ];
    csvLines.push(line.join(','));
  }
  
  return csvLines.join('\n');
}

// Nouvelle fonction de correction basée sur le pipeline spécifié (V2)
export function correctLabelPipeline(originalLabel: string): CorrectionResult {
    if (!originalLabel || typeof originalLabel !== 'string' || !originalLabel.trim()) {
        return { original: originalLabel, corrected: '', rules: [], confidence: 0 };
    }

    let text = originalLabel.toUpperCase();
    const appliedRules: string[] = [];

    // --- ÉTAPE A : PRÉ-NETTOYAGE ET EXTRACTION ---

    // Règle V2: On nettoie les points en espaces TÔT pour faciliter la détection.
    if (text.includes('.')) {
        text = text.replace(/\./g, ' ');
        appliedRules.push('dots_to_spaces');
    }

    // 1. Extraction de la marque
    let brand = "";
    const moved_brands = KNOWN_BRANDS.filter(b => b.startsWith('CRF')).sort((a, b) => b.length - a.length);

    for (const b of moved_brands) {
        const brandRegex = new RegExp(`\\b${b.replace(/([.*+?^=!:${}()|\[\]\/\\])/g, "\\$1")}\\b`);
        const match = text.match(brandRegex);
        if (match) {
            brand = b;
            text = text.replace(brandRegex, ' ').trim();
            appliedRules.push('brand_extraction');
            break;
        }
    }

    // 2. Extraction des quantités (DANS LE BON ORDRE)
    const UNITS_PATTERN = '(G|KG|ML|CL|L)';
    
    // D'abord les multipacks (ex: X6)
    const multipacks_pattern = /\bX\d+\b/g;
    const multipacks = text.match(multipacks_pattern) || [];
    if (multipacks.length > 0) {
        text = text.replace(multipacks_pattern, ' ').trim();
        appliedRules.push('multipack_extraction');
    }

    // Ensuite les poids/volumes (ex: 15X30G, 500G, 451 G)
    const weights_pattern = new RegExp(`\\b\\d+(?:X\\d+)?[\\d,]*\\s*${UNITS_PATTERN}\\b`, 'g');
    const weights = text.match(weights_pattern) || [];
    if (weights.length > 0) {
        text = text.replace(weights_pattern, ' ').trim();
        appliedRules.push('weight_extraction');
    }
    
    // 3. Nettoyage de la description
    let description = text.replace(/[^A-Z0-9/]/g, ' ');
    description = description.replace(/\s+/g, ' ').trim();

    // --- ÉTAPE B : RECOMPOSITION ---
    const final_parts: string[] = [];
    if (brand) {
        final_parts.push(brand);
    }
    if (description) {
        final_parts.push(description);
    }

    // On ajoute les quantités dans l'ordre: multipacks puis poids
    // Et on nettoie les espaces (ex: "451 G" -> "451G")
    final_parts.push(...multipacks.map(p => p.replace(/\s/g, '')));
    final_parts.push(...weights.map(w => w.replace(/\s/g, '')));
    
    const corrected_label = final_parts.filter(part => part).join(' ');

    return {
        original: originalLabel,
        corrected: corrected_label,
        rules: appliedRules,
        confidence: calculatePipelineConfidence(brand, description, [...multipacks, ...weights], "")
    };
}

// Fonction pour calculer la confiance basée sur les composants extraits
function calculatePipelineConfidence(marque: string, description: string, poidsVolume: string[], fractionSeule: string): number {
  let confidence = 100;
  
  // Pénalité si la marque n'est pas trouvée
  if (!marque) confidence -= 20;
  
  // Pénalité si la description est vide
  if (!description) confidence -= 30;
  
  // Pénalité si aucun poids/volume n'est trouvé
  if (poidsVolume.length === 0) confidence -= 25;
  
  // Bonus si une fraction seule est trouvée
  if (fractionSeule) confidence += 10;
  
  // Ajustement basé sur la longueur de la description
  if (description && description.length < 3) confidence -= 10;
  
  return Math.max(0, Math.min(100, confidence));
}

// Correction par lots avec le nouveau pipeline
export function correctLabelsPipeline(labels: string[]): CorrectionResult[] {
  return labels.map(label => correctLabelPipeline(label));
}

// Test function for the new pipeline algorithm
export function testPipelineAlgorithm(): void {
  console.log('Testing new pipeline algorithm...');
  
  const testCases = [
    '2.5 KG FRITES 9/9 SIMPL',
    '500G BOULE PAIN BIO 0%POUS.CRF',
    'yaour.grec danon 500g',
    'eau mineral evian 1.5L',
    'pain de.mie haribo 400gr'
  ];
  
  testCases.forEach((testCase, index) => {
    console.log(`\nTest case ${index + 1}: "${testCase}"`);
    const result = correctLabelPipeline(testCase);
    console.log(`Original: ${result.original}`);
    console.log(`Corrected: ${result.corrected}`);
    console.log(`Confidence: ${result.confidence}%`);
    console.log(`Rules applied: ${result.rules.join(', ')}`);
  });
}


// --- NOUVELLE LOGIQUE DE CORRECTION VIA L'API GOOGLE GEMINI ---
import { correctLabels as correctLabelsWithGeminiAPI } from './ai-correction';

/**
 * Corrige une liste de libellés en utilisant le service Google Gemini en mode lot.
 * C'est la fonction de pont entre l'UI et le service IA.
 * @param labels La liste des libellés à corriger.
 * @param apiKey La clé API Google fournie par l'utilisateur.
 * @returns Une promesse qui se résout en un tableau de CorrectionResult.
 */
export async function correctLabelsWithGemini(labels: string[], apiKey: string): Promise<CorrectionResult[]> {
  if (!labels || labels.length === 0) {
    return [];
  }

  if (!apiKey) {
    throw new Error("La clé API n'a pas été fournie.");
  }

  try {
    const aiResults = await correctLabelsWithGeminiAPI(labels, apiKey);

    // Mapper les résultats de l'IA au format attendu par le frontend
    return labels.map(originalLabel => {
      const matchingAiResult = aiResults.find(res => res["Libellé Original"] === originalLabel);

      if (matchingAiResult && matchingAiResult["Libellé Corrigé"]) {
        return {
          original: originalLabel,
          corrected: matchingAiResult["Libellé Corrigé"],
          rules: ['gemini_correction'],
          confidence: 95,
        };
      } else {
        // Si l'IA n'a pas retourné de correction pour ce libellé (cas du traitement par lot)
        return {
          original: originalLabel,
          corrected: originalLabel,
          rules: ['gemini_no_correction'],
          confidence: 10,
        };
      }
    });

  } catch (error) {
    console.error("Erreur lors de l'appel au service de correction Gemini:", error);
    // En cas d'échec global de l'API, retourner les originaux avec une erreur
    return labels.map(label => ({
      original: label,
      corrected: label,
      rules: ['api_error', error.message],
      confidence: 0,
    }));
  }
}


// --- NOUVELLE LOGIQUE DE CORRECTION HORS LIGNE (PROGRAMMATIQUE) ---

const QF_PATTERNS = [
  // Packs / Lots (plus spécifiques en premier)
  /(\b\d+\s*X\s*\d+([,.]\d+)?\s*[A-Z]+\b)/gi, // e.g., 6X33CL, 10X1.5L
  /(\bLOT DE \d+\b)/gi,
  /(\bX\d+\b)/gi,
  /(\b\d+\s*RLX\b)/gi,
  // Dimensions / Tailles
  /(\b\d+(\s*[/]\s*\d+)+\s*[A-Z]*\b)/gi, // e.g., 50/70 CM or 38/41
  /(\b\d+\s*ANS?\b)/gi,
  /(\b(XS|S|M|L|XL|XXL)\b)/gi,
  // Volumes / Poids
  /(\d+([,.]\d+)?\s*(L|ML|CL|G|KG)[S]?\b)/gi,
  // Codes Packaging
  /(\b(PET|BLE|BTE|BRK|CAN)\b)/gi,
  // Pourcentages
  /(\b\d+%)/gi,
];

// Combine all patterns into one
const QF_REGEX = new RegExp(QF_PATTERNS.map(r => r.source).join('|'), 'gi');

/**
 * Corrige un libellé en utilisant la "Stratégie Dure" de manière programmatique.
 * @param originalLabel Le libellé brut.
 * @returns Un objet CorrectionResult.
 */
export function correctLabelOffline(originalLabel: string): CorrectionResult {
  let workLabel = originalLabel.trim();

  // Pré-traitement pour séparer les codes packaging collés aux chiffres
  workLabel = workLabel.replace(/\b(PET|BLE|BTE|BRK|CAN)(\d)/gi, '$1 $2');

  // --- ÉTAPE 1 & 2 : Identification et Extraction ---

  // 1. Extraire la MARQUE
  let brand = '';
  // Trier les marques par longueur pour éviter les correspondances partielles (ex: 'CRF' vs 'CRF SENS')
  const sortedBrands = [...KNOWN_BRANDS].sort((a, b) => b.length - a.length);
  for (const b of sortedBrands) {
    // Utiliser une regex pour trouver la marque comme un mot entier, insensible à la casse
    const brandRegex = new RegExp(`\\b${b}\\b`, 'i');
    if (brandRegex.test(workLabel)) {
      brand = b;
      workLabel = workLabel.replace(brandRegex, '').trim();
      break; // Prendre la première (et la plus longue) correspondance
    }
  }

  // 2. Extraire QUANTITÉ/FORMAT
  const quantitiesAndFormats: string[] = [];
  let match;
  while ((match = QF_REGEX.exec(workLabel)) !== null) {
    // `match[0]` contient la correspondance complète
    quantitiesAndFormats.push(match[0].trim());
  }
  // Nettoyer les correspondances de la chaîne de travail
  workLabel = workLabel.replace(QF_REGEX, ' ').replace(/\s+/g, ' ').trim();

  // 3. Le reste est la DESCRIPTION
  let description = workLabel;

  // --- ÉTAPE 3 : Normalisation Stricte ---

  // Convertir tout en majuscules
  brand = brand.toUpperCase();
  description = description.toUpperCase();

  // Normaliser les quantités
  const normalizedQuantities = quantitiesAndFormats.map(qf => {
    let normalized = qf.toUpperCase();
    // Remplacer le point décimal par une virgule
    normalized = normalized.replace(/(\d)\.(\d)/g, '$1,$2');
    // Supprimer les points et les slashes superflus, puis nettoyer les espaces
    normalized = normalized.replace(/[.\/]/g, ' ').replace(/\s+/g, ' ').trim();
    return normalized;
  });

  // Normaliser la description
  description = description.replace(/[.'-\/]/g, ' ').replace(/\s+/g, ' ').trim();
  description = description.normalize("NFD").replace(/[\u0300-\u036f]/g, "");

  // --- ÉTAPE 4 : Recomposition Structurée ---
  const finalParts = [
    brand,
    description,
    ...normalizedQuantities
  ];

  const corrected = finalParts.filter(Boolean).join(' ');

  return {
    original: originalLabel,
    corrected: corrected.trim(),
    rules: ['offline_correction'],
    confidence: 85, // Confiance fixe pour le mode hors ligne
  };
}