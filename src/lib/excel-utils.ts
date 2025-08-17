import * as XLSX from 'xlsx';
import type { ClassifiedProduct } from './types';

/**
 * Reads an Excel file and extracts product descriptions from the first column.
 * @param file The Excel file to process.
 * @returns A promise that resolves to an array of product descriptions.
 */
export const processExcelFile = (file: File): Promise<string[]> => {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = (event) => {
            try {
                const data = event.target?.result;
                if (!data) {
                    throw new Error("Failed to read file data.");
                }
                const workbook = XLSX.read(data, { type: 'binary' });
                const sheetName = workbook.SheetNames[0];
                const worksheet = workbook.Sheets[sheetName];

                // Extract data from the first column (A)
                const jsonData = XLSX.utils.sheet_to_json(worksheet, { header: 1 });
                const descriptions = jsonData
                    .map(row => (row as any[])[0])
                    .filter(cell => cell !== undefined && cell !== null)
                    .map(cell => String(cell).trim())
                    .filter(cell => cell.length > 0);

                resolve(descriptions);
            } catch (error) {
                console.error("Error processing Excel file:", error);
                reject(error);
            }
        };
        reader.onerror = (error) => {
            console.error("FileReader error:", error);
            reject(error);
        };
        reader.readAsBinaryString(file);
    });
};

/**
 * Exports classification results to an Excel file.
 * @param results The classification results to export.
 * @param fileName The desired name for the output file.
 */
export const exportResultsToExcel = (results: ClassifiedProduct[], fileName: string = 'classification-results.xlsx') => {
    if (!results || results.length === 0) {
        console.warn("No results to export.");
        return;
    }

    // 1. Format the data to match the required 10-column structure.
    const formattedData = results.map(result => ({
        'Libellé Produit': result.description,
        'Code Secteur': result.classification.secteur.code,
        'Nom Secteur': result.classification.secteur.name,
        'Code Rayon': result.classification.rayon.code,
        'Nom Rayon': result.classification.rayon.name,
        'Code Famille': result.classification.famille.code,
        'Nom Famille': result.classification.famille.name,
        'Code Sous-Famille': result.classification.sousFamille.code,
        'Nom Sous-Famille': result.classification.sousFamille.name,
        'Score de Confiance': 'N/A' // Placeholder as per plan
    }));

    // 2. Create a new worksheet from the formatted data.
    const worksheet = XLSX.utils.json_to_sheet(formattedData);

    // 3. Create a new workbook and append the worksheet.
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Classifications');

    // 4. Trigger the download of the Excel file.
    XLSX.writeFile(workbook, fileName);
};
