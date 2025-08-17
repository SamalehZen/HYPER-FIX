import React, { useState } from 'react';
import { Layout } from '../components/layout/Layout';
import { HeroSection } from '../components/layout/HeroSection';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Textarea } from '../components/ui/textarea';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../components/ui/table';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';
import { Alert, AlertDescription, AlertTitle } from '../components/ui/alert';
import { Loader2, Key, ListTree } from 'lucide-react';

// Import the new services and data
import { CLASSIFICATION_HIERARCHY } from '../lib/classification-data';
import { parseHierarchy } from '../lib/classification-parser';
import { classifyProducts } from '../lib/ai-classification';
import type { ClassifiedProduct, Product } from '../lib/types';

const ClassificationPage: React.FC = () => {
  const [apiKey, setApiKey] = useState('');
  const [productInput, setProductInput] = useState('');
  const [results, setResults] = useState<ClassifiedProduct[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

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

    try {
      // Prepare the data
      const products: Product[] = productInput.split('\n').filter(line => line.trim() !== '').map(line => ({ description: line.trim() }));
      const hierarchy = parseHierarchy(CLASSIFICATION_HIERARCHY);

      // Call the AI service
      const classifiedResults = await classifyProducts(products, hierarchy, apiKey);
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
              <Input
                type="password"
                placeholder="Entrez votre clé API ici..."
                value={apiKey}
                onChange={(e) => setApiKey(e.target.value)}
                className="max-w-md"
              />
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center"><ListTree className="mr-2 h-5 w-5" />Étape 2: Libellés à Classifier</CardTitle>
              <CardDescription>Entrez un ou plusieurs libellés de produits, un par ligne.</CardDescription>
            </CardHeader>
            <CardContent>
              <Textarea
                placeholder="Exemple:\n1KG PETIT POIS CAROT.CRF CLASS\n492G X6 BATS CHOCO AU LAIT PPB"
                value={productInput}
                onChange={(e) => setProductInput(e.target.value)}
                rows={10}
              />
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

          {results.length > 0 && (
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