import React, { useState, useCallback } from 'react';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../ui/table';
import { Badge } from '../ui/badge';
import { Calculator, Search, Copy, FileText, Euro, Receipt } from 'lucide-react';
import { useTheme } from '../../lib/theme-context';

interface NomenclatureResult {
  libelle: string;
  code: string;
  description: string;
  tva_rate: number;
  tic_rate: number;
  taxe_sanitaire_rate: number;
  surface?: number;
  total_taxes?: number;
  weight_kg?: number;
}

// Base de données des codes de nomenclature (simulation)
const NOMENCLATURE_DB = [
  {
    code: '2350',
    description: 'LAP Parfum',
    product_category: 'Parfum',
    surface: 500,
    tic_base: '23%',
    tva_rate: 23,
    tic_rate: 5,
    taxe_sanitaire_rate: 0,
    keywords: ['parfum', 'fragrance', 'eau de toilette', 'eau de parfum']
  },
  {
    code: '2315',
    description: 'BASE TIC VINS/ALCOOL',
    product_category: 'Vin/Alcool',
    surface: 1500,
    tic_base: '23%',
    tva_rate: 23,
    tic_rate: 5,
    taxe_sanitaire_rate: 5,
    keywords: ['vin', 'alcool', 'bière', 'spiritueux', 'champagne']
  },
  {
    code: '2340',
    description: 'P.NET JUS FRUITS',
    product_category: 'Jus de fruits',
    surface: 0,
    tic_base: '0%',
    tva_rate: 0,
    tic_rate: 0,
    taxe_sanitaire_rate: 5,
    keywords: ['jus', 'nectar', 'fruit', 'orange', 'pomme', 'boisson fruitée']
  },
  {
    code: '2314',
    description: 'LITRE EAU',
    product_category: 'Eau',
    surface: 14,
    tic_base: '23%',
    tva_rate: 23,
    tic_rate: 5,
    taxe_sanitaire_rate: 5,
    keywords: ['eau', 'eau minérale', 'eau de source', 'eau gazeuse']
  },
  {
    code: '2040',
    description: 'P.NET Pâtes alimentaires',
    product_category: 'Pâtes',
    surface: 40,
    tic_base: '20%',
    tva_rate: 20,
    tic_rate: 5,
    taxe_sanitaire_rate: 5,
    keywords: ['pâtes', 'spaghetti', 'macaroni', 'tagliatelle', 'pasta']
  },
  {
    code: '2010',
    description: 'P. NET YAOURTS',
    product_category: 'Yaourts',
    surface: 100,
    tic_base: '10%',
    tva_rate: 10,
    tic_rate: 20,
    taxe_sanitaire_rate: 20,
    keywords: ['yaourt', 'yaourt grec', 'yogourt', 'laitage', 'fromage blanc']
  },
  {
    code: '1030',
    description: 'kg Viandes/Poissons/VOLAILLE',
    product_category: 'Viandes',
    surface: 0,
    tic_base: '10%',
    tva_rate: 10,
    tic_rate: 0,
    taxe_sanitaire_rate: 30,
    keywords: ['viande', 'boeuf', 'porc', 'agneau', 'volaille', 'poisson', 'poulet']
  },
  {
    code: '1005',
    description: 'fil/riz/huile tournesol',
    product_category: 'Epicerie de base',
    surface: 0,
    tic_base: '0%',
    tva_rate: 0,
    tic_rate: 0,
    taxe_sanitaire_rate: 0,
    keywords: ['riz', 'huile', 'tournesol', 'olive', 'farine', 'sucre', 'sel']
  },
  {
    code: '1020',
    description: 'fromages',
    product_category: 'Fromages',
    surface: 0,
    tic_base: '10%',
    tva_rate: 10,
    tic_rate: 20,
    taxe_sanitaire_rate: 20,
    keywords: ['fromage', 'camembert', 'emmental', 'chèvre', 'roquefort']
  },
  {
    code: '1010',
    description: 'kg crèmes DESSERTS',
    product_category: 'Desserts',
    surface: 0,
    tic_base: '10%',
    tva_rate: 10,
    tic_rate: 10,
    taxe_sanitaire_rate: 10,
    keywords: ['crème', 'dessert', 'mousse', 'flan', 'tiramisu']
  }
];

const NomenclatureService: React.FC = () => {
  const { theme } = useTheme();
  const [searchTerm, setSearchTerm] = useState('');
  const [results, setResults] = useState<NomenclatureResult[]>([]);
  const [selectedCode, setSelectedCode] = useState('');
  const [customWeight, setCustomWeight] = useState<number>(1);
  const [isSearching, setIsSearching] = useState(false);
  
  // Recherche intelligente de code de nomenclature
  const searchNomenclature = useCallback((query: string): NomenclatureResult[] => {
    if (!query.trim()) return [];
    
    const queryLower = query.toLowerCase();
    const matchedCodes = NOMENCLATURE_DB.filter(item => {
      // Recherche dans les mots-clés
      const keywordMatch = item.keywords.some(keyword => 
        queryLower.includes(keyword) || keyword.includes(queryLower)
      );
      
      // Recherche dans la description
      const descriptionMatch = item.description.toLowerCase().includes(queryLower);
      
      // Recherche dans la catégorie
      const categoryMatch = item.product_category.toLowerCase().includes(queryLower);
      
      return keywordMatch || descriptionMatch || categoryMatch;
    });
    
    // Transformer en résultats avec calcul des taxes
    return matchedCodes.map(item => {
      const weight = customWeight;
      const taxe_sanitaire_total = item.taxe_sanitaire_rate * weight;
      const total_taxes = item.tva_rate + item.tic_rate + taxe_sanitaire_total;
      
      return {
        libelle: query,
        code: item.code,
        description: item.description,
        tva_rate: item.tva_rate,
        tic_rate: item.tic_rate,
        taxe_sanitaire_rate: item.taxe_sanitaire_rate,
        surface: item.surface,
        total_taxes,
        weight_kg: weight
      };
    });
  }, [customWeight]);
  
  // Recherche par code spécifique
  const searchByCode = useCallback((code: string): NomenclatureResult | null => {
    const item = NOMENCLATURE_DB.find(item => item.code === code);
    if (!item) return null;
    
    const weight = customWeight;
    const taxe_sanitaire_total = item.taxe_sanitaire_rate * weight;
    const total_taxes = item.tva_rate + item.tic_rate + taxe_sanitaire_total;
    
    return {
      libelle: `Code ${code}`,
      code: item.code,
      description: item.description,
      tva_rate: item.tva_rate,
      tic_rate: item.tic_rate,
      taxe_sanitaire_rate: item.taxe_sanitaire_rate,
      surface: item.surface,
      total_taxes,
      weight_kg: weight
    };
  }, [customWeight]);
  
  // Gérer la recherche
  const handleSearch = useCallback(() => {
    setIsSearching(true);
    
    setTimeout(() => {
      let searchResults: NomenclatureResult[] = [];
      
      if (selectedCode) {
        // Recherche par code spécifique
        const codeResult = searchByCode(selectedCode);
        if (codeResult) {
          searchResults = [codeResult];
        }
      } else if (searchTerm) {
        // Recherche par libellé
        searchResults = searchNomenclature(searchTerm);
      }
      
      setResults(searchResults);
      setIsSearching(false);
    }, 500);
  }, [searchTerm, selectedCode, searchNomenclature, searchByCode]);
  
  // Copier les résultats
  const handleCopyResults = useCallback(() => {
    const textToCopy = results
      .map(result => 
        `${result.libelle}\t${result.code}\t${result.description}\t${result.tva_rate}%\t${result.tic_rate}€\t${result.taxe_sanitaire_rate}€/kg\t${result.total_taxes?.toFixed(2)}€`
      )
      .join('\n');
    
    navigator.clipboard.writeText(textToCopy);
  }, [results]);
  
  // Calculer les totaux
  const calculateTotals = useCallback((result: NomenclatureResult) => {
    const tva = result.tva_rate;
    const tic = result.tic_rate;
    const taxe_sanitaire = result.taxe_sanitaire_rate * (result.weight_kg || 1);
    
    return {
      tva,
      tic,
      taxe_sanitaire,
      total: tva + tic + taxe_sanitaire
    };
  }, []);
  
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-primary">Nomenclature Douanière</h1>
          <p className="text-muted-foreground">
            Suggestion automatique des codes douaniers et calcul des taxes
          </p>
        </div>
        
        {results.length > 0 && (
          <Button variant="outline" size="sm" onClick={handleCopyResults}>
            <Copy className="h-4 w-4 mr-2" />
            Copier résultats
          </Button>
        )}
      </div>
      
      {/* Zone de recherche */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Search className="h-5 w-5" />
            Recherche de Code Douanier
          </CardTitle>
          <CardDescription>
            Recherchez par libellé produit ou code douanier spécifique
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-4">
            <div className="lg:col-span-2">
              <label htmlFor="search" className="block text-sm font-medium mb-2">
                Libellé produit
              </label>
              <Input
                id="search"
                placeholder="Ex: yaourt grec, eau minérale, boeuf..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
              />
            </div>
            
            <div>
              <label htmlFor="code" className="block text-sm font-medium mb-2">
                Code douanier (optionnel)
              </label>
              <Input
                id="code"
                placeholder="Ex: 2010, 1030..."
                value={selectedCode}
                onChange={(e) => setSelectedCode(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
              />
            </div>
            
            <div>
              <label htmlFor="weight" className="block text-sm font-medium mb-2">
                Poids (kg)
              </label>
              <Input
                id="weight"
                type="number"
                min="0.1"
                step="0.1"
                placeholder="1.0"
                value={customWeight}
                onChange={(e) => setCustomWeight(parseFloat(e.target.value) || 1)}
              />
            </div>
          </div>
          
          <div className="flex flex-col sm:flex-row gap-4">
            <Button 
              onClick={handleSearch}
              disabled={(!searchTerm.trim() && !selectedCode.trim()) || isSearching}
              className="flex-1"
            >
              {isSearching ? (
                <>
                  <Calculator className="h-4 w-4 mr-2 animate-spin" />
                  Recherche en cours...
                </>
              ) : (
                <>
                  <Calculator className="h-4 w-4 mr-2" />
                  Rechercher et Calculer
                </>
              )}
            </Button>
            
            <Button 
              variant="outline"
              onClick={() => {
                setSearchTerm('');
                setSelectedCode('');
                setResults([]);
              }}
            >
              Effacer
            </Button>
          </div>
          
          {(searchTerm || selectedCode) && (
            <div className="text-sm text-muted-foreground">
              <FileText className="h-4 w-4 inline mr-1" />
              Recherche : {searchTerm || `Code ${selectedCode}`} • Poids : {customWeight} kg
            </div>
          )}
        </CardContent>
      </Card>
      
      {/* Codes disponibles */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Receipt className="h-5 w-5" />
            Codes Disponibles
          </CardTitle>
          <CardDescription>
            Liste des codes de nomenclature douanière configurés
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {NOMENCLATURE_DB.map((item) => (
              <div
                key={item.code}
                className="p-4 border rounded-lg hover:bg-accent cursor-pointer transition-colors"
                onClick={() => {
                  setSelectedCode(item.code);
                  setSearchTerm('');
                  handleSearch();
                }}
              >
                <div className="font-semibold text-primary">{item.code}</div>
                <div className="text-sm text-muted-foreground mb-2">{item.description}</div>
                <div className="flex items-center gap-2 text-xs">
                  <Badge variant="outline">TVA {item.tva_rate}%</Badge>
                  <Badge variant="outline">TIC {item.tic_rate}€</Badge>
                  {item.taxe_sanitaire_rate > 0 && (
                    <Badge variant="outline">Sanitaire {item.taxe_sanitaire_rate}€/kg</Badge>
                  )}
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
      
      {/* Résultats */}
      {results.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Euro className="h-5 w-5" />
              Résultats et Calculs de Taxes
            </CardTitle>
            <CardDescription>
              Codes suggérés avec détail des taxes applicables
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="rounded-md border overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Code</TableHead>
                    <TableHead>Description</TableHead>
                    <TableHead>TVA</TableHead>
                    <TableHead>TIC</TableHead>
                    <TableHead>Taxe Sanitaire</TableHead>
                    <TableHead>Total Taxes</TableHead>
                    <TableHead>Détail</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {results.map((result, index) => {
                    const totals = calculateTotals(result);
                    return (
                      <TableRow key={index}>
                        <TableCell>
                          <Badge variant="default" className="font-mono">
                            {result.code}
                          </Badge>
                        </TableCell>
                        <TableCell className="font-medium">
                          {result.description}
                        </TableCell>
                        <TableCell>
                          <Badge variant="outline">
                            {totals.tva}%
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <Badge variant="outline">
                            {totals.tic}€
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <Badge variant="outline">
                            {totals.taxe_sanitaire.toFixed(2)}€
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <Badge variant="default" className={theme === 'dark' ? 'bg-green-600' : 'bg-green-700'}>
                            {totals.total.toFixed(2)}€
                          </Badge>
                        </TableCell>
                        <TableCell className="text-xs text-muted-foreground">
                          <div>Poids: {result.weight_kg}kg</div>
                          {result.surface && result.surface > 0 && (
                            <div>Surface: {result.surface}</div>
                          )}
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </div>
            
            {results.length > 0 && (
              <div className="mt-4 p-4 bg-accent rounded-lg">
                <h4 className="font-semibold mb-2">Exemple de calcul pour "{results[0].libelle}":</h4>
                <div className="text-sm space-y-1">
                  <div>• Code douanier suggéré: <strong>{results[0].code}</strong></div>
                  <div>• TVA: <strong>{results[0].tva_rate}%</strong></div>
                  <div>• TIC: <strong>{results[0].tic_rate}€</strong></div>
                  <div>• Taxe sanitaire: <strong>{results[0].taxe_sanitaire_rate}€/kg × {results[0].weight_kg}kg = {(results[0].taxe_sanitaire_rate * (results[0].weight_kg || 1)).toFixed(2)}€</strong></div>
                  <div className="pt-2 border-t">
                    <strong>Total taxes: {calculateTotals(results[0]).total.toFixed(2)}€</strong>
                  </div>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default NomenclatureService;