import React, { useState, useCallback, useEffect } from 'react';
import { Button } from '../ui/button';
import { Textarea } from '../ui/textarea';
import { Input } from '../ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../ui/table';
import { Badge } from '../ui/badge';
import { Progress } from '../ui/progress';
import { Separator } from '../ui/separator';
import { Brain, Upload, Copy, Check, X, RefreshCw, FileText, AlertCircle, Zap, Clock } from 'lucide-react';
import AIClassificationService, { type AIClassificationResult } from '../../lib/ai-classification';
import { testAIConnection } from '../../lib/openrouter';

interface ClassificationResult {
  label: string;
  secteur?: string;
  rayon?: string;
  famille?: string;
  sous_famille?: string;
  confidence: number;
  reasoning?: string;
  validated?: boolean;
  ai_used?: boolean;
  processing_time?: number;
}

const ClassificationService: React.FC = () => {
  const [inputText, setInputText] = useState('');
  const [results, setResults] = useState<ClassificationResult[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [selectedResults, setSelectedResults] = useState<Set<number>>(new Set());
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [aiService] = useState(() => new AIClassificationService());
  const [aiStatus, setAiStatus] = useState<'unknown' | 'connected' | 'disconnected' | 'limited'>('unknown');
  const [processingProgress, setProcessingProgress] = useState(0);
  
  // Test de connexion IA au démarrage
  useEffect(() => {
    const checkAIStatus = async () => {
      try {
        const connectionTest = await testAIConnection();
        setAiStatus(connectionTest ? 'connected' : 'limited');
      } catch (error) {
        console.error('Test IA échoué:', error);
        setAiStatus('disconnected');
      }
    };
    
    if (isAuthenticated) {
      checkAIStatus();
    }
  }, [isAuthenticated]);
  
  // Classification avec IA réelle
  const classifyLabel = useCallback(async (label: string): Promise<ClassificationResult> => {
    try {
      const result = await aiService.classifyLabel(label, username);
      return {
        label,
        secteur: result.secteur,
        rayon: result.rayon,
        famille: result.famille,
        sous_famille: result.sous_famille,
        confidence: result.confidence,
        reasoning: result.reasoning,
        validated: result.confidence >= 80,
        ai_used: result.ai_used,
        processing_time: result.processing_time
      };
    } catch (error) {
      console.error('Erreur classification IA:', error);
      // Fallback en cas d'erreur
      return {
        label,
        secteur: 'GEANT CASINO',
        rayon: 'ERREUR_CLASSIFICATION',
        famille: 'ERREUR_CLASSIFICATION',
        sous_famille: 'ERREUR_CLASSIFICATION',
        confidence: 0,
        reasoning: `Erreur: ${error}`,
        validated: false,
        ai_used: false,
        processing_time: 0
      };
    }
  }, [aiService, username]);
  
  // Authentification simple
  const handleAuth = useCallback(() => {
    if (username === 'men' && password === 'men2023') {
      setIsAuthenticated(true);
    } else {
      alert('Identifiants incorrects');
    }
  }, [username, password]);
  
  // Traitement des classifications avec IA
  const handleClassification = useCallback(async () => {
    if (!inputText.trim()) return;
    
    setIsProcessing(true);
    setResults([]);
    setProcessingProgress(0);
    
    try {
      // Séparer les lignes pour traitement par lot
      const labels = inputText
        .split('\n')
        .map(line => line.trim())
        .filter(line => line.length > 0);
      
      const classificationResults: ClassificationResult[] = [];
      
      // Classification une par une avec progrès
      for (let i = 0; i < labels.length; i++) {
        const label = labels[i];
        const result = await classifyLabel(label);
        classificationResults.push(result);
        
        // Mise à jour du progrès
        setProcessingProgress(((i + 1) / labels.length) * 100);
        
        // Mise à jour des résultats en temps réel
        setResults([...classificationResults]);
        
        // Petite pause pour éviter le rate limiting
        if (i < labels.length - 1) {
          await new Promise(resolve => setTimeout(resolve, 500));
        }
      }
      
    } catch (error) {
      console.error('Erreur lors de la classification:', error);
    } finally {
      setIsProcessing(false);
      setProcessingProgress(0);
    }
  }, [inputText, classifyLabel]);
  
  // Validation manuelle d'un résultat
  const handleValidation = useCallback((index: number, isValid: boolean) => {
    const updatedResults = [...results];
    updatedResults[index] = {
      ...updatedResults[index],
      validated: isValid,
      confidence: isValid ? 100 : 0
    };
    setResults(updatedResults);
  }, [results]);
  
  // Copier les résultats
  const handleCopyResults = useCallback(() => {
    const selectedIndices = Array.from(selectedResults);
    const selectedData = selectedIndices.length > 0 
      ? results.filter((_, index) => selectedIndices.includes(index))
      : results;
    
    const textToCopy = selectedData
      .map(result => `${result.label}\t${result.secteur}\t${result.rayon}\t${result.famille}\t${result.sous_famille}\t${result.confidence}%`)
      .join('\n');
    
    navigator.clipboard.writeText(textToCopy);
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
    
    const reader = new FileReader();
    reader.onload = (e) => {
      const content = e.target?.result as string;
      setInputText(content);
    };
    reader.readAsText(file);
  }, []);
  
  // Si pas authentifié, afficher le formulaire de connexion
  if (!isAuthenticated) {
    return (
      <div className="max-w-md mx-auto">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Brain className="h-5 w-5" />
              Classification CYRUS IA
            </CardTitle>
            <CardDescription>
              Connexion requise pour accéder au service de classification automatique
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <label htmlFor="username" className="block text-sm font-medium mb-2">
                Nom d'utilisateur
              </label>
              <Input
                id="username"
                type="text"
                placeholder="men"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
              />
            </div>
            
            <div>
              <label htmlFor="password" className="block text-sm font-medium mb-2">
                Mot de passe
              </label>
              <Input
                id="password"
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleAuth()}
              />
            </div>
            
            <Button onClick={handleAuth} className="w-full">
              Se connecter
            </Button>
            
            <div className="text-xs text-muted-foreground text-center">
              <AlertCircle className="h-4 w-4 inline mr-1" />
              Utilisez les identifiants fournis dans votre documentation
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }
  
  // Statistiques avancées
  const stats = {
    total: results.length,
    highConfidence: results.filter(r => r.confidence >= 80).length,
    mediumConfidence: results.filter(r => r.confidence >= 50 && r.confidence < 80).length,
    lowConfidence: results.filter(r => r.confidence < 50).length,
    validated: results.filter(r => r.validated === true).length,
    aiGenerated: results.filter(r => r.ai_used === true).length,
    avgProcessingTime: results.length > 0 
      ? Math.round(results.reduce((sum, r) => sum + (r.processing_time || 0), 0) / results.length)
      : 0
  };
  
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-primary">Classification CYRUS IA</h1>
          <p className="text-muted-foreground">
            Classification automatique selon votre structure personnalisée
          </p>
        </div>
        
        <div className="flex items-center gap-2">
          <Badge variant="outline" className="text-green-600">
            Connecté: {username}
          </Badge>
          
          {/* Statut IA */}
          <Badge variant={aiStatus === 'connected' ? 'default' : aiStatus === 'limited' ? 'secondary' : 'destructive'}>
            {aiStatus === 'connected' && <Zap className="h-3 w-3 mr-1" />}
            {aiStatus === 'limited' && <Clock className="h-3 w-3 mr-1" />}
            {aiStatus === 'disconnected' && <AlertCircle className="h-3 w-3 mr-1" />}
            IA {aiStatus === 'connected' ? 'Active' : aiStatus === 'limited' ? 'Limitée' : 'Inactive'}
          </Badge>
          
          {results.length > 0 && (
            <>
              <Button variant="outline" size="sm" onClick={handleCopyResults}>
                <Copy className="h-4 w-4 mr-2" />
                Copier
              </Button>
              <Button variant="outline" size="sm" onClick={() => setIsAuthenticated(false)}>
                Déconnexion
              </Button>
            </>
          )}
        </div>
      </div>
      
      {/* Zone de saisie */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5" />
            Saisie des Libellés à Classifier
          </CardTitle>
          <CardDescription>
            Saisissez les libellés à classifier (un par ligne) ou importez un fichier
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-4">
            <div className="lg:col-span-3">
              <Textarea
                placeholder="Saisissez vos libellés ici, un par ligne...&#10;Exemple:&#10;DANONE YAOURT GREC 500G&#10;EVIAN EAU MINERALE 1,5L&#10;BOEUF STEACK HACHE 500G"
                value={inputText}
                onChange={(e) => setInputText(e.target.value)}
                rows={6}
                className="resize-none"
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
                  accept=".txt,.csv"
                  onChange={handleFileImport}
                  className="text-sm"
                />
              </div>
              
              <Button 
                onClick={handleClassification}
                disabled={!inputText.trim() || isProcessing}
                className="w-full"
              >
                {isProcessing ? (
                  <>
                    <Brain className="h-4 w-4 mr-2 animate-pulse" />
                    Classification IA en cours...
                  </>
                ) : (
                  <>
                    <Brain className="h-4 w-4 mr-2" />
                    Classifier avec IA {aiStatus === 'limited' ? '(Limitée)' : ''}
                  </>
                )}
              </Button>
              
              {/* Barre de progrès pendant traitement */}
              {isProcessing && (
                <div className="space-y-2">
                  <Progress value={processingProgress} className="w-full" />
                  <p className="text-xs text-muted-foreground text-center">
                    Classification en cours: {Math.round(processingProgress)}%
                  </p>
                </div>
              )}
              
              {inputText.trim() && (
                <p className="text-xs text-muted-foreground">
                  {inputText.split('\n').filter(line => line.trim()).length} libellé(s) à classifier
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
            <div className="grid grid-cols-2 lg:grid-cols-7 gap-4">
              <div className="text-center">
                <div className="text-2xl font-bold text-primary">{stats.total}</div>
                <div className="text-sm text-muted-foreground">Total</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-green-600">{stats.highConfidence}</div>
                <div className="text-sm text-muted-foreground">Haute confiance</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-yellow-600">{stats.mediumConfidence}</div>
                <div className="text-sm text-muted-foreground">Moyenne confiance</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-red-600">{stats.lowConfidence}</div>
                <div className="text-sm text-muted-foreground">Faible confiance</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-blue-600">{stats.validated}</div>
                <div className="text-sm text-muted-foreground">Validées</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-purple-600">{stats.aiGenerated}</div>
                <div className="text-sm text-muted-foreground">Générées IA</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-indigo-600">{stats.avgProcessingTime}ms</div>
                <div className="text-sm text-muted-foreground">Temps moyen</div>
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
              <CardTitle>Résultats de Classification</CardTitle>
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
            <div className="rounded-md border overflow-x-auto">
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
                    <TableHead>Libellé</TableHead>
                    <TableHead>Secteur</TableHead>
                    <TableHead>Rayon</TableHead>
                    <TableHead>Famille</TableHead>
                    <TableHead>Sous-famille</TableHead>
                    <TableHead>Confiance</TableHead>
                    <TableHead>IA/Temps</TableHead>
                    <TableHead>Actions</TableHead>
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
                      <TableCell className="font-mono text-sm max-w-[200px]">
                        <div className="truncate" title={result.label}>
                          {result.label}
                        </div>
                      </TableCell>
                      <TableCell className="text-sm">{result.secteur}</TableCell>
                      <TableCell className="text-sm">{result.rayon}</TableCell>
                      <TableCell className="text-sm">{result.famille}</TableCell>
                      <TableCell className="text-sm">{result.sous_famille}</TableCell>
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
                        <div className="text-xs space-y-1">
                          <div className="flex items-center gap-1">
                            {result.ai_used ? (
                              <><Zap className="h-3 w-3 text-blue-500" />IA</>
                            ) : (
                              <><RefreshCw className="h-3 w-3 text-gray-500" />Manuel</>
                            )}
                          </div>
                          {result.processing_time && (
                            <div className="text-muted-foreground">
                              {result.processing_time}ms
                            </div>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-1">
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => handleValidation(index, true)}
                            className="text-green-600 hover:text-green-700 h-8 w-8 p-0"
                          >
                            <Check className="h-4 w-4" />
                          </Button>
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => handleValidation(index, false)}
                            className="text-red-600 hover:text-red-700 h-8 w-8 p-0"
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

export default ClassificationService;