import re # On importe la bibliothèque pour les expressions régulières, c'est essentiel ici.

# --- 1. DÉFINITION DES CONSTANTES ET RÈGLES ---

# Liste des marques connues. On la met ici pour pouvoir l'enrichir facilement.
# On met les plus longues en premier pour éviter les faux positifs (ex: "CRF EXTRA" avant "CRF")
KNOWN_BRANDS = [
'CARREFOUR', 'BONDUELLE', 'SIMPL', 'SRP', 'LOTUS', 'TWIX', 'BOUNTY', 'NUTELLA',
'KINDER', 'RAFFAELLO', 'SNICKERS', 'CRF SENS', 'CRF EXTRA', 'CRF CLASSIC', 'CRF CLASS',
'CRF BIO', 'CRF OR', 'CRF EX', 'CRF CL', 'CRF E', 'CRF C', 'CRF S', 'CRFM',
'CRFCLA', 'CRFCL', 'CRFC', 'CRFEX'
]

# Un "pattern" (modèle) pour les unités, pour ne pas avoir à le réécrire partout.
UNITS_PATTERN = r'(G|KG|ML|CL|L)'

# --- 2. LA FONCTION DE TRAITEMENT PRINCIPALE (V2) ---

def process_single_label(label_text: str) -> dict:
    """
    Prend un libellé de produit brut en entrée et le transforme selon la logique V2.
    Retourne un dictionnaire avec l'original et le corrigé.
    """
    if not label_text or not isinstance(label_text, str) or not label_text.strip():
        return {'original': label_text, 'corrected': ''}

    original_label = label_text
    text = label_text.upper()

    # --- ÉTAPE A : PRÉ-NETTOYAGE ET EXTRACTION ---

    # Règle V2: On nettoie les points en espaces TÔT pour faciliter la détection.
    text = re.sub(r'[.]', ' ', text)

    # 1. Extraction de la marque
    brand = ""
    moved_brands = sorted([b for b in KNOWN_BRANDS if b.startswith('CRF')], key=len, reverse=True)
    for b in moved_brands:
        match = re.search(r'\b' + re.escape(b) + r'\b', text)
        if match:
            brand = b
            text = re.sub(r'\b' + re.escape(b) + r'\b', ' ', text, 1)
            break

    # 2. Extraction des quantités (DANS LE BON ORDRE)
    all_quantities = []

    # D'abord les multipacks (ex: X6)
    multipacks_pattern = r'(\bX\d+\b)'
    multipacks = re.findall(multipacks_pattern, text)
    text = re.sub(multipacks_pattern, ' ', text)

    # Ensuite les poids/volumes (ex: 15X30G, 500G, 451 G)
    weights_pattern = r'(\b\d+(?:X\d+)?[\d,]*\s*' + UNITS_PATTERN + r')\b'
    weights = re.findall(weights_pattern, text)
    text = re.sub(weights_pattern, ' ', text)

    # 3. Nettoyage de la description
    description = re.sub(r'[^A-Z0-9/]', ' ', text)
    description = re.sub(r'\s+', ' ', description).strip()

    # --- ÉTAPE B : RECOMPOSITION ---
    final_parts = []
    if brand:
        final_parts.append(brand)
    if description:
        final_parts.append(description)

    # On ajoute les quantités dans l'ordre: multipacks puis poids
    # Et on nettoie les espaces (ex: "451 G" -> "451G")
    final_parts.extend([p.replace(" ", "") for p in multipacks])
    # Le retour de findall pour weights est une liste de tuples
    final_parts.extend([w[0].replace(" ", "") for w in weights])

    corrected_label = " ".join(part for part in final_parts if part)

    return {
        'original': original_label,
        'corrected': corrected_label
    }

# --- 3. EXEMPLE D'UTILISATION (pour tester le fichier seul) ---

if __name__ == '__main__':
    # On utilise les exemples fournis pour valider la logique V2.
    test_cases = {
        "1KG PETIT POIS CAROT.CRF CLASS": "CRF CLASS PETIT POIS CAROT 1KG",
        "492G X6 BATS CHOCO AU LAIT PPB": "BATS CHOCO AU LAIT PPB X6 492G",
        "300G PAIN NOIX 0% P CRFM": "CRFM PAIN NOIX 0 P 300G",
        "750G PURE.4 LEG.VERT CRFCL OAB": "CRFCL PURE 4 LEG VERT OAB 750G",
        "15X30G BAT.POISSON PANE PP BLC": "BAT POISSON PANE PP BLC 15X30G",
        "451 G 12 BATS VANIL/CHO.CRF CL": "CRF CL 12 BATS VANIL/CHO 451G"
    }

    print("--- DÉBUT DU TEST DE LA LOGIQUE V2 ---")
    all_passed = True
    for original, expected in test_cases.items():
        result = process_single_label(original)
        corrected = result['corrected']

        print(f"Original : {original}")
        print(f"Corrigé   : {corrected}")
        print(f"Attendu  : {expected}")

        if corrected == expected:
            print("Statut   : ✅ PASS")
        else:
            print(f"Statut   : ❌ FAIL")
            all_passed = False
        print("-" * 30)

    print("\n--- RÉSUMÉ DU TEST ---")
    if all_passed:
        print("✅ Tous les tests sont passés avec succès !")
    else:
        print("❌ Certains tests ont échoué.")
