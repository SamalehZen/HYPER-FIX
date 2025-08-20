import type { Product, ClassifiedProduct } from './types';

// Helper function to parse the AI's CSV response
export const parseCsvResponse = (csv: string, originalProducts: Product[]): ClassifiedProduct[] => {
    const lines = csv.trim().split('\n');
    const results: ClassifiedProduct[] = [];

    const productMap = new Map(originalProducts.map(p => [p.description.toUpperCase(), p]));

    for (const line of lines) {
        const parts = line.split(',');
        if (parts.length < 9) continue; // Malformed line

        const description = parts[0].trim();

        results.push({
            description: description, // Keep original casing from map if possible
            classification: {
                secteur: { name: parts[1], code: parts[2] },
                rayon: { name: parts[3], code: parts[4] },
                famille: { name: parts[5], code: parts[6] },
                sousFamille: { name: parts[7], code: parts[8] },
            },
        });
    }
    return results;
};
