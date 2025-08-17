// --- Types for Classification Hierarchy ---

export interface ClassificationNode {
    level: number;
    code: string;
    name: string;
    parentCode: string | null;
}

// --- Types for Products ---

export interface Product {
    description: string;
}

export interface ClassifiedProduct {
    description: string;
    classification: ClassificationPath;
}

// --- Types for AI Classification Logic ---

export interface ClassificationCategory {
    code: string;
    name: string;
}

export interface ClassificationPath {
    secteur: ClassificationCategory;
    rayon: ClassificationCategory;
    famille: ClassificationCategory;
    sousFamille: ClassificationCategory;
}

// Defines the raw JSON structure expected from the Gemini API call
export interface GeminiResponse {
    secteur_code: string;
    secteur_name: string;
    rayon_code: string;
    rayon_name: string;
    famille_code: string;
    famille_name: string;
    sous_famille_code: string;
    sous_famille_name: string;
}
