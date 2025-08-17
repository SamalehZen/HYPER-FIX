import { correctLabelsWithGemini } from '../src/lib/correction';

async function testGeminiCorrection() {
  console.log('--- Démarrage du test de correction via Google Gemini ---');

  const testCases = [
    // Cas fournis par l'utilisateur
    'LOT DE 3 VALISES 50/60/70 CM PIERRE CARD',
    'PET1,5L SCHW.ZERO INDIAN TONIC',
    '2.2L LESS.LIQ BLEU.MED.CRF EXP',
    'KIT PALMES REGLABLES MASQUE TUBA 38/41',
    // Cas supplémentaires
    'OASIS 100% PURE JUICE 6X20CL',
    'yaourt.grec danon 500g',
    'creme solaire 80% protection'
  ];

  console.log('Envoi des libellés suivants au service Gemini:', testCases);

  try {
    const results = await correctLabelsWithGemini(testCases);

    console.log('\n--- Résultats de la Correction Gemini ---');

    // Formatter pour une meilleure lisibilité
    const displayResults = results.map(r => ({
        "Original": r.original,
        "Corrigé": r.corrected,
        "Confiance": r.confidence,
        "Règle": r.rules.join(', ')
    }));

    console.table(displayResults);
    console.log('--- Test terminé avec succès ---');

  } catch (error) {
    console.error('--- Le test a échoué ---');
    if (error instanceof Error) {
        console.error('Erreur:', error.message);
    } else {
        console.error('Une erreur inattendue est survenue:', error);
    }
  }
}

testGeminiCorrection();
