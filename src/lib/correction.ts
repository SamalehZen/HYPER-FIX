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