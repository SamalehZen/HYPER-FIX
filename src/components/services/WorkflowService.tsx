import React, { useState, useCallback, useMemo } from 'react';
import { Button } from '../ui/button';
import { Textarea } from '../ui/textarea';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../ui/table';
import { Badge } from '../ui/badge';
import { Progress } from '../ui/progress';
import { Separator } from '../ui/separator';
import { ArrowRight, Play, Download, Copy, RefreshCw, CheckCircle, AlertCircle, Zap, Brain, Calculator, FileInput } from 'lucide-react';
import { correctLabel } from '../../lib/correction';
import { useTheme } from '../../lib/theme-context';
import * as XLSX from 'xlsx';
import RadialOrbitalTimeline from '../ui/radial-orbital-timeline';

interface TimelineItem {
  id: number;
  title: string;
  date: string;
  content: string;
  category: string;
  icon: React.ElementType;
  relatedIds: number[];
  status: "completed" | "in-progress" | "pending";
  energy: number;
}

interface WorkflowResult {
  original: string;
  corrected: string;
  secteur: string;
  rayon: string;
  famille: string;
  sous_famille: string;
  code_douanier: string;
  tva: number;
  tic: number;
  taxe_sanitaire: number;
  total_taxes: number;
  confidence_correction: number;
  confidence_classification: number;
  processing_time: number;
}

const WorkflowService: React.FC = () => {
  const { theme } = useTheme();
  const [inputText, setInputText] = useState('');
  const [results, setResults] = useState<WorkflowResult[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [currentStep, setCurrentStep] = useState<string>('');

  const initialTimelineData: TimelineItem[] = useMemo(() => [
    { id: 1, title: "Saisie", date: "Étape 1", content: "Saisie des données brutes par l'utilisateur.", category: "Input", icon: FileInput, relatedIds: [2], status: "pending", energy: 0 },
    { id: 2, title: "Correction", date: "Étape 2", content: "Correction orthographique et sémantique des libellés.", category: "Processing", icon: Zap, relatedIds: [1, 3], status: "pending", energy: 0 },
    { id: 3, title: "Classification", date: "Étape 3", content: "Classification des produits selon la structure CYRUS.", category: "AI", icon: Brain, relatedIds: [2, 4], status: "pending", energy: 0 },
    { id: 4, title: "Nomenclature", date: "Étape 4", content: "Assignation du code douanier et des taxes associées.", category: "Rules", icon: Calculator, relatedIds: [3, 5], status: "pending", energy: 0 },
    { id: 5, title: "Export", date: "Étape 5", content: "Génération du fichier de résultats final.", category: "Output", icon: Download, relatedIds: [4], status: "pending", energy: 0 },
  ], []);

  const [timelineData, setTimelineData] = useState<TimelineItem[]>(initialTimelineData);

  // Simulation de classification CYRUS
  const classifyProduct = useCallback((correctedLabel: string) => {
    const labelLower = correctedLabel.toLowerCase();
    let secteur = "201 GEANT CASINO";
    let rayon = "03 EPICERIE";
    let famille = "031 EPICERIE SALEE";
    let sous_famille = "311 AUTRES";
    let confidence = 60;
    
    if (labelLower.includes('yaourt') || labelLower.includes('lait')) {
      rayon = "02 FRAIS INDUSTRIEL";
      famille = "020 PRODUITS FRAIS LACTES";
      sous_famille = "201 YAOURTS";
      confidence = 90;
    } else if (labelLower.includes('viande') || labelLower.includes('boeuf')) {
      rayon = "01 MARCHE";
      famille = "010 BOUCHERIE";
      sous_famille = "101 BOEUF LOCAL";
      confidence = 85;
    } else if (labelLower.includes('eau') || labelLower.includes('boisson')) {
      rayon = "04 LIQUIDES";
      famille = "040 BOISSONS";
      sous_famille = "401 EAUX";
      confidence = 92;
    }
    
    return { secteur, rayon, famille, sous_famille, confidence };
  }, []);
  
  // Simulation de nomenclature douanière
  const getNomenclature = useCallback((classification: any) => {
    const { sous_famille } = classification;
    let code = "2305";
    let tva = 23;
    let tic = 5;
    let taxe_sanitaire = 0;
    
    if (sous_famille.includes('YAOURT')) {
      code = "2010";
      tva = 10;
      tic = 20;
      taxe_sanitaire = 20;
    } else if (sous_famille.includes('BOEUF')) {
      code = "1030";
      tva = 10;
      tic = 0;
      taxe_sanitaire = 30;
    } else if (sous_famille.includes('EAU')) {
      code = "2314";
      tva = 23;
      tic = 5;
      taxe_sanitaire = 5;
    }
    
    const total_taxes = tva + tic + taxe_sanitaire;
    return { code, tva, tic, taxe_sanitaire, total_taxes };
  }, []);
  
  // Mise à jour du statut d'une étape
  const updateStepStatus = useCallback((stepId: number, status: TimelineItem['status'], energy: number) => {
    setTimelineData(prev => prev.map(item =>
      item.id === stepId ? { ...item, status, energy } : item
    ));
    if (status === 'in-progress') {
      setCurrentStep(stepId.toString());
    }
  }, []);

  // Traitement complet du workflow
  const processWorkflow = useCallback(async () => {
    if (!inputText.trim()) return;

    setIsProcessing(true);
    setResults([]);
    setTimelineData(initialTimelineData);

    try {
      const labels = inputText
        .split('\n')
        .map(line => line.trim())
        .filter(line => line.length > 0);

      const workflowResults: WorkflowResult[] = [];

      updateStepStatus(1, 'in-progress', 50);
      await new Promise(resolve => setTimeout(resolve, 200));
      updateStepStatus(1, 'completed', 100);

      for (const label of labels) {
        const startTime = Date.now();

        // Étape 2: Correction
        updateStepStatus(2, 'in-progress', 50);
        await new Promise(resolve => setTimeout(resolve, 300));
        const correction = correctLabel(label);
        updateStepStatus(2, 'completed', 100);

        // Étape 3: Classification
        updateStepStatus(3, 'in-progress', 50);
        await new Promise(resolve => setTimeout(resolve, 400));
        const classification = classifyProduct(correction.corrected);
        updateStepStatus(3, 'completed', 100);

        // Étape 4: Nomenclature
        updateStepStatus(4, 'in-progress', 50);
        await new Promise(resolve => setTimeout(resolve, 200));
        const nomenclature = getNomenclature(classification);
        updateStepStatus(4, 'completed', 100);

        const processingTime = Date.now() - startTime;

        workflowResults.push({
          original: label,
          corrected: correction.corrected,
          secteur: classification.secteur,
          rayon: classification.rayon,
          famille: classification.famille,
          sous_famille: classification.sous_famille,
          code_douanier: nomenclature.code,
          tva: nomenclature.tva,
          tic: nomenclature.tic,
          taxe_sanitaire: nomenclature.taxe_sanitaire,
          total_taxes: nomenclature.total_taxes,
          confidence_correction: correction.confidence,
          confidence_classification: classification.confidence,
          processing_time: processingTime
        });
      }

      // Étape 5: Export
      updateStepStatus(5, 'in-progress', 50);
      await new Promise(resolve => setTimeout(resolve, 100));
      setResults(workflowResults);
      updateStepStatus(5, 'completed', 100);

    } catch (error) {
      console.error('Erreur dans le workflow:', error);
      if (currentStep) {
        updateStepStatus(parseInt(currentStep), 'error', 0);
      }
    } finally {
      setIsProcessing(false);
      setCurrentStep('');
    }
  }, [inputText, correctLabel, classifyProduct, getNomenclature, updateStepStatus, currentStep, initialTimelineData]);
  
  // Export des résultats
  const exportResults = useCallback((format: 'csv' | 'json') => {
    if (format === 'csv') {
      const headers = [
        'Libellé Original',
        'Libellé Corrigé', 
        'Secteur',
        'Rayon',
        'Famille',
        'Sous-famille',
        'Code Douanier',
        'TVA (%)',
        'TIC (€)',
        'Taxe Sanitaire (€)',
        'Total Taxes (€)',
        'Confiance Correction (%)',
        'Confiance Classification (%)',
        'Temps Traitement (ms)'
      ];
      
      const csvLines = [headers.join(',')];
      
      for (const result of results) {
        const line = [
          `"${result.original.replace(/"/g, '""')}"`,
          `"${result.corrected.replace(/"/g, '""')}"`,
          `"${result.secteur}"`,
          `"${result.rayon}"`,
          `"${result.famille}"`,
          `"${result.sous_famille}"`,
          result.code_douanier,
          result.tva,
          result.tic,
          result.taxe_sanitaire,
          result.total_taxes,
          result.confidence_correction,
          result.confidence_classification,
          result.processing_time
        ];
        csvLines.push(line.join(','));
      }
      
      const csvContent = csvLines.join('\n');
      const blob = new Blob([csvContent], { type: 'text/csv' });
      const url = URL.createObjectURL(blob);
      
      const link = document.createElement('a');
      link.href = url;
      link.download = `hyperfix-workflow-${new Date().toISOString().split('T')[0]}.csv`;
      link.click();
      
      URL.revokeObjectURL(url);
    } else {
      const jsonContent = JSON.stringify({
        metadata: {
          generated_at: new Date().toISOString(),
          total_items: results.length,
          average_processing_time: results.reduce((acc, r) => acc + r.processing_time, 0) / results.length
        },
        results
      }, null, 2);
      
      const blob = new Blob([jsonContent], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      
      const link = document.createElement('a');
      link.href = url;
      link.download = `hyperfix-workflow-${new Date().toISOString().split('T')[0]}.json`;
      link.click();
      
      URL.revokeObjectURL(url);
    }
  }, [results]);
  
  // Copier les résultats
  const copyResults = useCallback(() => {
    const textToCopy = results
      .map(result => 
        `${result.original}\t${result.corrected}\t${result.code_douanier}\t${result.total_taxes}€`
      )
      .join('\n');
    
    navigator.clipboard.writeText(textToCopy);
  }, [results]);
  
  // Statistiques
  const stats = {
    total: results.length,
    avgCorrectionConfidence: results.length > 0 ? Math.round(results.reduce((acc, r) => acc + r.confidence_correction, 0) / results.length) : 0,
    avgClassificationConfidence: results.length > 0 ? Math.round(results.reduce((acc, r) => acc + r.confidence_classification, 0) / results.length) : 0,
    avgProcessingTime: results.length > 0 ? Math.round(results.reduce((acc, r) => acc + r.processing_time, 0) / results.length) : 0,
    totalTaxes: results.reduce((acc, r) => acc + r.total_taxes, 0)
  };
  
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-primary">Workflow Global Intégré</h1>
          <p className="text-muted-foreground">
            Pipeline unifié : Correction → Classification → Nomenclature → Export
          </p>
        </div>
        
        {results.length > 0 && (
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" onClick={copyResults}>
              <Copy className="h-4 w-4 mr-2" />
              Copier
            </Button>
            <Button variant="outline" size="sm" onClick={() => exportResults('csv')}>
              <Download className="h-4 w-4 mr-2" />
              CSV
            </Button>
            <Button variant="outline" size="sm" onClick={() => exportResultsXlsx()}>
              <Download className="h-4 w-4 mr-2" />
              XLSX
            </Button>
            <Button variant="outline" size="sm" onClick={() => exportResults('json')}>
              <Download className="h-4 w-4 mr-2" />
              JSON
            </Button>
          </div>
        )}
      </div>
      
      {/* Zone de saisie */}
      <Card>
        <CardHeader>
          <CardTitle>Données d'entrée</CardTitle>
          <CardDescription>
            Saisissez vos libellés pour un traitement complet automatisé
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <Textarea
            placeholder="Saisissez vos libellés ici, un par ligne...&#10;Exemple:&#10;yaour.grec danon 500g&#10;eau mineral evian 1.5L&#10;boeuf steack 400gr"
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            rows={6}
            className="resize-none"
          />
          
          <div className="flex items-center justify-between">
            <div className="text-sm text-muted-foreground">
              {inputText.trim() ? `${inputText.split('\n').filter(line => line.trim()).length} libellé(s) à traiter` : 'Saisissez vos données'}
            </div>
            
            <Button 
              onClick={processWorkflow}
              disabled={!inputText.trim() || isProcessing}
              size="lg"
            >
              {isProcessing ? (
                <>
                  <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                  Traitement en cours...
                </>
              ) : (
                <>
                  <Play className="h-4 w-4 mr-2" />
                  Lancer le workflow complet
                </>
              )}
            </Button>
          </div>
        </CardContent>
      </Card>
      
      {/* Timeline */}
      {(isProcessing || results.length > 0) && (
        <Card className="bg-transparent border-0 shadow-none">
          <CardHeader>
            <CardTitle>Progression du Workflow</CardTitle>
          </CardHeader>
          <CardContent className="h-[500px] p-0 bg-black rounded-lg">
            <RadialOrbitalTimeline timelineData={timelineData} />
          </CardContent>
        </Card>
      )}
      
      {/* Statistiques */}
      {results.length > 0 && (
        <Card>
          <CardContent className="pt-6">
            <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
              <div className="text-center">
                <div className="text-2xl font-bold text-primary">{stats.total}</div>
                <div className="text-sm text-muted-foreground">Éléments traités</div>
              </div>
              <div className="text-center">
                <div className={`text-2xl font-bold ${theme === 'dark' ? 'text-green-600' : 'text-green-700'}`}>{stats.avgCorrectionConfidence}%</div>
                <div className="text-sm text-muted-foreground">Confiance correction</div>
              </div>
              <div className="text-center">
                <div className={`text-2xl font-bold ${theme === 'dark' ? 'text-blue-600' : 'text-blue-700'}`}>{stats.avgClassificationConfidence}%</div>
                <div className="text-sm text-muted-foreground">Confiance classification</div>
              </div>
              <div className="text-center">
                <div className={`text-2xl font-bold ${theme === 'dark' ? 'text-purple-600' : 'text-purple-700'}`}>{stats.avgProcessingTime}ms</div>
                <div className="text-sm text-muted-foreground">Temps moyen</div>
              </div>
              <div className="text-center">
                <div className={`text-2xl font-bold ${theme === 'dark' ? 'text-orange-600' : 'text-orange-700'}`}>{stats.totalTaxes.toFixed(2)}€</div>
                <div className="text-sm text-muted-foreground">Total taxes</div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
      
      {/* Résultats */}
      {results.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Résultats du Workflow Complet</CardTitle>
            <CardDescription>
              Données traitées avec correction, classification et calcul de taxes
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="rounded-md border overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Original</TableHead>
                    <TableHead>Corrigé</TableHead>
                    <TableHead>Classification</TableHead>
                    <TableHead>Code</TableHead>
                    <TableHead>Taxes</TableHead>
                    <TableHead>Confiance</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {results.map((result, index) => (
                    <TableRow key={index}>
                      <TableCell className="font-mono text-sm max-w-[150px]">
                        <div className="truncate" title={result.original}>
                          {result.original}
                        </div>
                      </TableCell>
                      <TableCell className="font-mono text-sm max-w-[150px]">
                        <div className="truncate font-medium" title={result.corrected}>
                          {result.corrected}
                        </div>
                      </TableCell>
                      <TableCell className="text-sm max-w-[200px]">
                        <div className="space-y-1">
                          <div className="text-xs text-muted-foreground truncate">{result.rayon}</div>
                          <div className="font-medium truncate">{result.famille}</div>
                          <div className="text-xs truncate">{result.sous_famille}</div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant="default" className="font-mono">
                          {result.code_douanier}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <div className="space-y-1">
                          <div className="text-sm">TVA: {result.tva}%</div>
                          <div className="text-sm">TIC: {result.tic}€</div>
                          <div className="text-sm">Sanit.: {result.taxe_sanitaire}€</div>
                          <div className={`font-medium ${theme === 'dark' ? 'text-green-600' : 'text-green-700'}`}>Total: {result.total_taxes}€</div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="space-y-1">
                          <div className="flex items-center gap-2">
                            <Progress value={result.confidence_correction} className="w-12" />
                            <span className="text-xs">{result.confidence_correction}%</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <Progress value={result.confidence_classification} className="w-12" />
                            <span className="text-xs">{result.confidence_classification}%</span>
                          </div>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default WorkflowService;