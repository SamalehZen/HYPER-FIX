import React, { useState, useCallback } from 'react';
import { Button } from '../ui/button';
import { BorderBeam } from '../ui/border-beam';
import { Textarea } from '../ui/textarea';
import { Input } from '../ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../ui/table';
import { Badge } from '../ui/badge';
import { Progress } from '../ui/progress';
import { Separator } from '../ui/separator';
import { Download, Upload, Copy, Check, X, RefreshCw, FileText } from 'lucide-react';
import { correctLabelsWithGemini, correctLabelOffline, exportCorrections, type CorrectionResult } from '../../lib/correction';
import { saveCorrection } from '../../lib/database';
import { useTheme } from '../../lib/theme-context';
import * as XLSX from 'xlsx';

import { Shield, KeyRound, Save } from 'lucide-react';
import { Switch } from '../ui/switch';
import { Label } from '../ui/label';
import { Alert, AlertDescription, AlertTitle } from '../ui/alert';
import { Terminal } from 'lucide-react';

const CorrectionService: React.FC = () => {
  const { theme } = useTheme();
  const [inputText, setInputText] = useState('');
  const [results, setResults] = useState<CorrectionResult[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [selectedResults, setSelectedResults] = useState<Set<number>>(new Set());

  // Nouveaux états pour le mode IA et la clé API
  const [isAiMode, setIsAiMode] = useState(false);
  const [apiKey, setApiKey] = useState('');
  const [apiKeyError, setApiKeyError] = useState('');

  // Charger la configuration depuis le localStorage au montage
  useEffect(() => {
    const savedApiKey = localStorage.getItem('googleApiKey');
    const savedAiMode = localStorage.getItem('isAiMode');
    if (savedApiKey) {
      setApiKey(savedApiKey);
    }
    if (savedAiMode) {
      setIsAiMode(savedAiMode === 'true');
    }
  }, []);
  
  // Traitement des libellés individuels ou par lot
  const handleCorrection = useCallback(async () => {
    if (!inputText.trim()) return;

    if (isAiMode && (!apiKey || !apiKey.startsWith('AIza'))) {
      setApiKeyError('Veuillez saisir et sauvegarder une clé API Google valide pour utiliser le mode IA.');
      return;
    }
    
    setIsProcessing(true);
    setResults([]); // Vider les anciens résultats
    
    try {
      const labels = inputText
        .split('\n')
        .map(line => line.trim())
        .filter(line => line.length > 0);
      
      let correctionResults: CorrectionResult[] = [];

      if (isAiMode) {
        // Mode IA
        correctionResults = await correctLabelsWithGemini(labels, apiKey);
      } else {
        // Mode Hors ligne
        correctionResults = labels.map(label => correctLabelOffline(label));
      }

      setResults(correctionResults);
      
      // Sauvegarder automatiquement en base
      for (const result of correctionResults) {
        try {
          await saveCorrection({
            original_label: result.original,
            corrected_label: result.corrected,
            correction_rules: { rules: result.rules },
            confidence: result.confidence,
            validated: false,
            created_by: 'user'
          });
        } catch (error) {
          console.error('Erreur sauvegarde:', error);
        }
      }
      
    } catch (error) {
      console.error('Erreur lors de la correction:', error);
    } finally {
      setIsProcessing(false);
    }
  }, [inputText, isAiMode, apiKey]);
  
  // Validation manuelle d'un résultat
  const handleValidation = useCallback(async (index: number, isValid: boolean) => {
    const result = results[index];
    if (!result) return;
    
    try {
      // Mettre à jour en base avec le statut validé
      await saveCorrection({
        original_label: result.original,
        corrected_label: result.corrected,
        correction_rules: { rules: result.rules },
        confidence: isValid ? 100 : 0,
        validated: true,
        created_by: 'user'
      });
      
      // Mettre à jour l'état local
      const updatedResults = [...results];
      updatedResults[index] = {
        ...result,
        confidence: isValid ? 100 : 0
      };
      setResults(updatedResults);
      
    } catch (error) {
      console.error('Erreur validation:', error);
    }
  }, [results]);
  
  // Copier les résultats dans le presse-papiers
  const handleCopyResults = useCallback(() => {
    const selectedIndices = Array.from(selectedResults);
    const selectedData = selectedIndices.length > 0 
      ? results.filter((_, index) => selectedIndices.includes(index))
      : results;
    
    const textToCopy = selectedData
      .map(result => result.corrected)
      .join('\n');
    
    navigator.clipboard.writeText(textToCopy);
  }, [results, selectedResults]);
  
  // Export CSV
  const handleExport = useCallback(() => {
    const selectedIndices = Array.from(selectedResults);
    const dataToExport = selectedIndices.length > 0
      ? results.filter((_, index) => selectedIndices.includes(index))
      : results;
    
    const csvContent = exportCorrections(dataToExport, 'csv');
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    
    const link = document.createElement('a');
    link.href = url;
    link.download = `corrections-${new Date().toISOString().split('T')[0]}.csv`;
    link.click();
    
    URL.revokeObjectURL(url);
  }, [results, selectedResults]);
  
  // Export XLSX
  const handleExportXlsx = useCallback(() => {
    const selectedIndices = Array.from(selectedResults);
    const dataToExport = selectedIndices.length > 0
      ? results.filter((_, index) => selectedIndices.includes(index))
      : results;
    
    // Create worksheet data
    const worksheetData = [
      ['Libellé Original', 'Libellé Corrigé', 'Confiance (%)', 'Règles Appliquées'],
      ...dataToExport.map(result => [
        result.original,
        result.corrected,
        result.confidence,
        result.rules.join(', ')
      ])
    ];
    
    // Create workbook
    const worksheet = XLSX.utils.aoa_to_sheet(worksheetData);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Corrections');
    
    // Export to file
    XLSX.writeFile(workbook, `corrections-${new Date().toISOString().split('T')[0]}.xlsx`);
  }, [results, selectedResults]);
  
  // Sélection des résultats
  const toggleSelection = useCallback((index: number) => {
    const newSelection = new Set(selectedResults);
    if (newSelection.has(index)) {
      newSelection.delete(index);
    } else {
      newSelection.add(index);
    }
    setSelectedResults(newSelection);
  }, [selectedResults]);
  
  const selectAll = useCallback(() => {
    if (selectedResults.size === results.length) {
      setSelectedResults(new Set());
    } else {
      setSelectedResults(new Set(results.map((_, index) => index)));
    }
  }, [results, selectedResults]);
  
  // Import de fichier
  const handleFileImport = useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;
    
    const fileName = file.name.toLowerCase();
    
    if (fileName.endsWith('.xlsx')) {
      // Handle XLSX file
      const reader = new FileReader();
      reader.onload = (e) => {
        try {
          const data = new Uint8Array(e.target?.result as ArrayBuffer);
          const workbook = XLSX.read(data, { type: 'array' });
          
          // Get the first worksheet
          const firstSheetName = workbook.SheetNames[0];
          const worksheet = workbook.Sheets[firstSheetName];
          
          // Convert to JSON
          const jsonData = XLSX.utils.sheet_to_json(worksheet, { header: 1 });
          
          // Convert to text format (assuming first column contains the labels)
          const textContent = jsonData
            .filter((row): row is any[] => Array.isArray(row) && row.length > 0 && row[0])
            .map(row => row[0])
            .join('\n');
          
          setInputText(textContent);
        } catch (error) {
          console.error('Error parsing XLSX file:', error);
        }
      };
      reader.readAsArrayBuffer(file);
    } else {
      // Handle TXT/CSV files
      const reader = new FileReader();
      reader.onload = (e) => {
        const content = e.target?.result as string;
        setInputText(content);
      };
      reader.readAsText(file);
    }
  }, []);
  
  // Statistiques
  const stats = {
    total: results.length,
    highConfidence: results.filter(r => r.confidence >= 80).length,
    mediumConfidence: results.filter(r => r.confidence >= 50 && r.confidence < 80).length,
    lowConfidence: results.filter(r => r.confidence < 50).length
  };
  
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-primary">Correction de Libellés</h1>
          <p className="text-muted-foreground">
            Correction automatique et normalisation des libellés produits avec le nouveau pipeline
          </p>
        </div>
        
        {results.length > 0 && (
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" onClick={handleCopyResults}>
              <Copy className="h-4 w-4 mr-2" />
              Copier
            </Button>
            <Button variant="outline" size="sm" onClick={handleExport}>
              <Download className="h-4 w-4 mr-2" />
              Export CSV
            </Button>
            <Button variant="outline" size="sm" onClick={() => handleExportXlsx()}>
              <Download className="h-4 w-4 mr-2" />
              Export XLSX
            </Button>
          </div>
        )}
      </div>

      {/* Zone de Configuration IA */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield className="h-5 w-5" />
            Configuration du Mode de Correction
          </CardTitle>
          <CardDescription>
            Choisissez entre la correction rapide hors ligne et la correction avancée par IA (nécessite une clé API).
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center space-x-4 rounded-md border p-4">
            <div className="flex-1 space-y-1">
              <p className="text-sm font-medium leading-none">
                Mode de Correction IA
              </p>
              <p className={`text-sm ${isAiMode ? 'text-green-500' : 'text-muted-foreground'}`}>
                {isAiMode ? 'Activé : Utilise l\'API Google Gemini pour une correction plus précise.' : 'Désactivé : Utilise l\'algorithme local rapide.'}
              </p>
            </div>
            <Switch
              checked={isAiMode}
              onCheckedChange={(checked) => {
                setIsAiMode(checked);
                localStorage.setItem('isAiMode', String(checked));
              }}
              aria-readonly
            />
          </div>

          {isAiMode && (
            <div className="space-y-2">
              <Label htmlFor="api-key-input">Clé API Google Gemini</Label>
              <div className="flex items-center gap-2">
                <Input
                  id="api-key-input"
                  type="password"
                  value={apiKey}
                  onChange={(e) => {
                    setApiKey(e.target.value);
                    setApiKeyError('');
                  }}
                  placeholder="Saisissez votre clé API ici..."
                />
                <Button onClick={() => {
                  if (apiKey && apiKey.startsWith('AIza')) {
                    localStorage.setItem('googleApiKey', apiKey);
                    setApiKeyError('');
                    // On pourrait ajouter un toast de succès ici
                  } else {
                    setApiKeyError('Clé API invalide. Elle doit commencer par "AIza".');
                  }
                }}>
                  <Save className="h-4 w-4 mr-2" />
                  Sauvegarder
                </Button>
              </div>
              {apiKeyError && <p className="text-sm text-destructive">{apiKeyError}</p>}
            </div>
          )}
        </CardContent>
      </Card>
      
      {/* Zone de saisie */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5" />
            Saisie des Libellés
          </CardTitle>
          <CardDescription>
            Saisissez les libellés à corriger (un par ligne) ou importez un fichier. Le nouveau pipeline de correction extrait les marques, descriptions, poids/volumes et fractions.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-4">
            <div className="lg:col-span-3 relative">
              <Textarea
                placeholder="Saisissez vos libellés ici, un par ligne...&#10;Exemple:&#10;2.5 KG FRITES 9/9 SIMPL&#10;500G BOULE PAIN BIO 0%POUS.CRF&#10;yaour.grec danon 500g"
                value={inputText}
                onChange={(e) => setInputText(e.target.value)}
                rows={6}
                className="resize-none"
              />
              <BorderBeam
                colorFrom={theme === 'dark' ? '#c8b4a0' : '#6b5545'}
                colorTo={theme === 'dark' ? '#a89080' : '#544237'}
              />
            </div>
            
            <div className="space-y-3">
              <div>
                <label htmlFor="file-import" className="block text-sm font-medium mb-2">
                  Import Fichier
                </label>
                <Input
                  id="file-import"
                  type="file"
                  accept=".txt,.csv,.xlsx"
                  onChange={handleFileImport}
                  className="text-sm"
                />
              </div>
              
              <Button 
                onClick={handleCorrection}
                disabled={!inputText.trim() || isProcessing}
                className="w-full"
              >
                {isProcessing ? (
                  <>
                    <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                    Traitement...
                  </>
                ) : (
                  <>
                    <RefreshCw className="h-4 w-4 mr-2" />
                    Corriger
                  </>
                )}
              </Button>
              
              {inputText.trim() && (
                <p className="text-xs text-muted-foreground">
                  {inputText.split('\n').filter(line => line.trim()).length} libellé(s) à traiter
                </p>
              )}
            </div>
          </div>
        </CardContent>
      </Card>
      
      {/* Statistiques */}
      {results.length > 0 && (
        <Card>
          <CardContent className="pt-6">
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="text-center">
                <div className="text-2xl font-bold text-primary">{stats.total}</div>
                <div className="text-sm text-muted-foreground">Total</div>
              </div>
              <div className="text-center">
                <div className={`text-2xl font-bold ${theme === 'dark' ? 'text-green-600' : 'text-green-700'}`}>{stats.highConfidence}</div>
                <div className="text-sm text-muted-foreground">Haute confiance</div>
              </div>
              <div className="text-center">
                <div className={`text-2xl font-bold ${theme === 'dark' ? 'text-yellow-600' : 'text-yellow-700'}`}>{stats.mediumConfidence}</div>
                <div className="text-sm text-muted-foreground">Moyenne confiance</div>
              </div>
              <div className="text-center">
                <div className={`text-2xl font-bold ${theme === 'dark' ? 'text-red-600' : 'text-red-700'}`}>{stats.lowConfidence}</div>
                <div className="text-sm text-muted-foreground">Faible confiance</div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
      
      {/* Résultats */}
      {results.length > 0 && (
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>Résultats de Correction</CardTitle>
              <div className="flex items-center gap-2">
                <Button variant="ghost" size="sm" onClick={selectAll}>
                  {selectedResults.size === results.length ? 'Désélectionner' : 'Tout sélectionner'}
                </Button>
                <span className="text-sm text-muted-foreground">
                  {selectedResults.size} sélectionné(s)
                </span>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-[50px]">
                      <input
                        type="checkbox"
                        checked={selectedResults.size === results.length && results.length > 0}
                        onChange={selectAll}
                      />
                    </TableHead>
                    <TableHead>Libellé Original</TableHead>
                    <TableHead>Libellé Corrigé</TableHead>
                    <TableHead>Confiance</TableHead>
                    <TableHead>Règles</TableHead>
                    <TableHead className="w-[120px]">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {results.map((result, index) => (
                    <TableRow key={index}>
                      <TableCell>
                        <input
                          type="checkbox"
                          checked={selectedResults.has(index)}
                          onChange={() => toggleSelection(index)}
                        />
                      </TableCell>
                      <TableCell className="font-mono text-sm">
                        {result.original}
                      </TableCell>
                      <TableCell className="font-mono text-sm font-medium">
                        {result.corrected}
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Progress value={result.confidence} className="w-16" />
                          <Badge variant={
                            result.confidence >= 80 ? 'default' :
                            result.confidence >= 50 ? 'secondary' : 'destructive'
                          }>
                            {result.confidence}%
                          </Badge>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex flex-wrap gap-1">
                          {result.rules.slice(0, 2).map(rule => (
                            <Badge key={rule} variant="outline" className="text-xs">
                              {rule.replace(/_/g, ' ')}
                            </Badge>
                          ))}
                          {result.rules.length > 2 && (
                            <Badge variant="outline" className="text-xs">
                              +{result.rules.length - 2}
                            </Badge>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-1">
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => handleValidation(index, true)}
                            className={`${theme === 'dark' ? 'text-green-600 hover:text-green-700' : 'text-green-700 hover:text-green-800'} h-8 w-8 p-0`}
                          >
                            <Check className="h-4 w-4" />
                          </Button>
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => handleValidation(index, false)}
                            className={`${theme === 'dark' ? 'text-red-600 hover:text-red-700' : 'text-red-700 hover:text-red-800'} h-8 w-8 p-0`}
                          >
                            <X className="h-4 w-4" />
                          </Button>
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

export default CorrectionService;