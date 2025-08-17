import { correctLabelOffline } from '../src/lib/correction';

async function testOfflineCorrection() {
  console.log('--- Démarrage du test de la logique de correction hors ligne ---');

  const testCases = [
    // Cas de base
    { original: '  eau minérale 1.5l perrier  ', expected: 'PERRIER EAU MINERALE 1,5L' },
    // Cas de la spec
    { original: 'LOT DE 3 VALISES 50/60/70 CM PIERRE CARD', expected: 'PIERRE CARD VALISES LOT DE 3 50 60 70 CM' },
    { original: 'PET1,5L SCHW.ZERO INDIAN TONIC', expected: 'SCHW ZERO INDIAN TONIC PET 1,5L' },
    { original: '2.2L LESS.LIQ BLEU.MED.CRF EXP', expected: 'CRF LESS LIQ BLEU MED EXP 2,2L' },
    { original: 'KIT PALMES REGLABLES MASQUE TUBA 38/41', expected: 'KIT PALMES REGLABLES MASQUE TUBA 38 41' },
    // Cas supplémentaires
    { original: 'OASIS 100% PURE JUICE 6X20CL', expected: 'OASIS PURE JUICE 100% 6X20CL' },
    { original: 'yaourt.grec danon 500g', expected: 'YAOURT GREC DANON 500G' },
    { original: 'creme solaire 80% protection', expected: 'CREME SOLAIRE PROTECTION 80%' },
    { original: 'SIMPL   PATES 500G', expected: 'SIMPL PATES 500G' },
    { original: 'BTE CONSERVE MAIS DOUX 400G', expected: 'CONSERVE MAIS DOUX BTE 400G' },
    { original: 'TRAVEL WORLD valise/souple 70 cm', expected: 'TRAVEL WORLD VALISE SOUPLE 70 CM' },
    { original: 'SPORT AND FUN T-SHIRT TAILLE L', expected: 'SPORT AND FUN T SHIRT TAILLE L' },
  ];

  const results = testCases.map(tc => {
    const correctedResult = correctLabelOffline(tc.original);
    // Petite correction pour les cas de la spec qui contiennent des "/"
    const expected = tc.expected.replace(/\//g, ' ');
    return {
      ...tc,
      expected,
      corrected: correctedResult.corrected,
      passed: correctedResult.corrected === expected,
    };
  });

  console.table(results);

  const passedCount = results.filter(r => r.passed).length;
  const totalCount = results.length;
  console.log(`\nRésultat du test : ${passedCount} / ${totalCount} cas de test ont réussi.`);

  if (passedCount < totalCount) {
    console.error('--- Certains tests ont échoué. ---');
  } else {
    console.log('--- Tous les tests ont réussi ! ---');
  }
}

testOfflineCorrection();
