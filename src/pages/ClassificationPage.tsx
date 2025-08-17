import React, { useState } from 'react';
import { Layout } from '../components/layout/Layout';
import { HeroSection } from '../components/layout/HeroSection';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Textarea } from '../components/ui/textarea';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../components/ui/table';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';
import { Alert, AlertDescription, AlertTitle } from '../components/ui/alert';
import { Loader2, Key, ListTree, Upload, Download, Timer } from 'lucide-react';
import { Progress } from '../components/ui/progress';

// Import the new services and data
import { CLASSIFICATION_HIERARCHY } from '../lib/classification-data';
import { parseHierarchy } from '../lib/classification-parser';
import { classifyProducts } from '../lib/ai-classification';
import { processExcelFile, exportResultsToExcel } from '../lib/excel-utils'; // Import export util
import type { ClassifiedProduct, Product } from '../lib/types';

const ClassificationPage: React.FC = () => {
  const [apiKey, setApiKey] = useState('');
  const [productInput, setProductInput] = useState('');
  const [rpm, setRpm] = useState(50); // Default RPM limit
  const [results, setResults] = useState<ClassifiedProduct[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [progress, setProgress] = useState(0);
  const [statusText, setStatusText] = useState('');

  const handleFileImport = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setError(null);
    try {
        const descriptions = await processExcelFile(file);
        setProductInput(descriptions.join('\n'));
    } catch (err) {
        console.error(err);
        setError("Échec du traitement du fichier Excel. Assurez-vous que le fichier est valide et que la première colonne contient les libellés.");
    }
    // Reset file input so user can upload the same file again
    event.target.value = '';
  };

  const handleExport = () => {
    exportResultsToExcel(results);
  };

  const handleProgressUpdate = (status: import('../lib/types').ProgressStatus) => {
    if (status.type === 'PROGRESS') {
      setProgress((status.current / status.total) * 100);
      setStatusText(`Traitement de ${status.current} sur ${status.total}...`);
    } else if (status.type === 'PAUSED') {
      setStatusText(`Limite de requêtes atteinte. En pause pour ${status.countdown} secondes...`);
    } else if (status.type === 'COMPLETE') {
      setStatusText('Traitement terminé !');
      setProgress(100);
    } else if (status.type === 'ERROR') {
        setError(status.message);
    }
  };

  const handleClassify = async () => {
    if (!apiKey) {
      setError('Veuillez entrer une clé API.');
      return;
    }
    if (!productInput.trim()) {
      setError('Veuillez entrer au moins un libellé de produit.');
      return;
    }

    setIsLoading(true);
    setError(null);
    setResults([]);
    setProgress(0);
    setStatusText('Initialisation du traitement...');

    try {
      // Prepare the data
      const products: Product[] = productInput.split('\n').filter(line => line.trim() !== '').map(line => ({ description: line.trim() }));
      const hierarchy = parseHierarchy(CLASSIFICATION_HIERARCHY);

      // Call the AI service with RPM and progress handler
      const classifiedResults = await classifyProducts(products, hierarchy, apiKey, rpm, handleProgressUpdate);
      setResults(classifiedResults);

    } catch (e) {
      console.error(e);
      setError(e instanceof Error ? e.message : 'Une erreur inconnue est survenue.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Layout currentPage="classification">
      <HeroSection
        title="Classification CYRUS IA"
        subtitle="Intelligence Artificielle"
        description="Entrez votre clé API Gemini et une liste de libellés de produits pour obtenir leur classification hiérarchique."
        compact={true}
        showBackground={false}
      />
      
      <div className="container mx-auto px-4 py-8 max-w-5xl">
        <div className="grid gap-8">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center"><Key className="mr-2 h-5 w-5" />Étape 1: Configuration</CardTitle>
              <CardDescription>Veuillez fournir votre clé API Google Gemini.</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label htmlFor="api-key" className="block text-sm font-medium mb-1">Clé API Gemini</label>
                  <Input
                    id="api-key"
                    type="password"
                    placeholder="Entrez votre clé API ici..."
                    value={apiKey}
                    onChange={(e) => setApiKey(e.target.value)}
                  />
                </div>
                <div>
                  <label htmlFor="rpm-limit" className="block text-sm font-medium mb-1">Limite de Requêtes/Minute (RPM)</label>
                  <Input
                    id="rpm-limit"
                    type="number"
                    value={rpm}
                    onChange={(e) => setRpm(Number(e.target.value))}
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center"><ListTree className="mr-2 h-5 w-5" />Étape 2: Libellés à Classifier</CardTitle>
              <CardDescription>Entrez les libellés manuellement ou importez un fichier Excel.</CardDescription>
            </CardHeader>
            <CardContent className="grid gap-4">
              <Textarea
                placeholder="Exemple:\n1KG PETIT POIS CAROT.CRF CLASS\n492G X6 BATS CHOCO AU LAIT PPB"
                value={productInput}
                onChange={(e) => setProductInput(e.target.value)}
                rows={10}
              />
              <div className="flex items-center space-x-4">
                <div className="flex-1">
                    <label htmlFor="excel-upload" className="sr-only">Importer Excel</label>
                    <Input id="excel-upload" type="file" className="w-full max-w-xs" accept=".xlsx, .xls" onChange={handleFileImport} />
                </div>
                <Button variant="outline" disabled={results.length === 0} onClick={handleExport}>
                  <Download className="mr-2 h-4 w-4" />
                  Exporter les Résultats
                </Button>
              </div>
            </CardContent>
          </Card>

          <div className="flex justify-center">
            <Button onClick={handleClassify} disabled={isLoading}>
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Classification en cours...
                </>
              ) : (
                'Lancer la Classification'
              )}
            </Button>
          </div>

          {error && (
            <Alert variant="destructive">
              <AlertTitle>Erreur</AlertTitle>
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          {isLoading && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center"><Timer className="mr-2 h-5 w-5" />Progression du Traitement</CardTitle>
              </CardHeader>
              <CardContent>
                <Progress value={progress} className="w-full" />
                <p className="text-center text-sm text-muted-foreground mt-2">{statusText}</p>
              </CardContent>
            </Card>
          )}

          {results.length > 0 && !isLoading && (
            <Card>
              <CardHeader>
                <CardTitle>Résultats de la Classification</CardTitle>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Libellé Original</TableHead>
                      <TableHead>Secteur</TableHead>
                      <TableHead>Rayon</TableHead>
                      <TableHead>Famille</TableHead>
                      <TableHead>Sous-Famille</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {results.map((result, index) => (
                      <TableRow key={index}>
                        <TableCell className="font-medium">{result.description}</TableCell>
                        <TableCell>{result.classification.secteur.name} ({result.classification.secteur.code})</TableCell>
                        <TableCell>{result.classification.rayon.name} ({result.classification.rayon.code})</TableCell>
                        <TableCell>{result.classification.famille.name} ({result.classification.famille.code})</TableCell>
                        <TableCell>{result.classification.sousFamille.name} ({result.classification.sousFamille.code})</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </Layout>
  );
};

export default ClassificationPage;