import { supabase } from './supabase';
import type { Article, LabelCorrection, CyrusClassification, NomenclatureCode } from './supabase';

// Utilitaires pour interagir avec la base de données

// Articles (base des 97k)
export async function searchArticles(query: string, limit = 50) {
  const { data, error } = await supabase
    .from('articles')
    .select('*')
    .textSearch('libelle', query)
    .limit(limit);
  
  if (error) throw error;
  return data;
}

export async function getArticleByEAN(ean: string) {
  const { data, error } = await supabase
    .from('articles')
    .select('*')
    .eq('ean', ean)
    .single();
  
  if (error) throw error;
  return data;
}

// Corrections de libellés
export async function saveCorrection(correction: Omit<LabelCorrection, 'id' | 'created_at'>) {
  const { data, error } = await supabase
    .from('label_corrections')
    .insert(correction)
    .select()
    .single();
  
  if (error) throw error;
  return data;
}

export async function getCorrections(validated?: boolean) {
  let query = supabase.from('label_corrections').select('*');
  
  if (validated !== undefined) {
    query = query.eq('validated', validated);
  }
  
  const { data, error } = await query.order('created_at', { ascending: false });
  
  if (error) throw error;
  return data;
}

// Classifications CYRUS
export async function saveClassification(classification: Omit<CyrusClassification, 'id' | 'created_at'>) {
  const { data, error } = await supabase
    .from('cyrus_classifications')
    .insert(classification)
    .select()
    .single();
  
  if (error) throw error;
  return data;
}

export async function getClassifications(validated?: boolean) {
  let query = supabase.from('cyrus_classifications').select('*');
  
  if (validated !== undefined) {
    query = query.eq('validated', validated);
  }
  
  const { data, error } = await query.order('created_at', { ascending: false });
  
  if (error) throw error;
  return data;
}

// Structure CYRUS
export async function getCyrusStructure(level?: number) {
  let query = supabase.from('cyrus_structure').select('*');
  
  if (level) {
    query = query.eq('level', level);
  }
  
  const { data, error } = await query.order('code');
  
  if (error) throw error;
  return data;
}

export async function getCyrusHierarchy(parentCode?: string) {
  let query = supabase.from('cyrus_structure').select('*');
  
  if (parentCode) {
    query = query.eq('parent_code', parentCode);
  } else {
    query = query.eq('level', 1); // Secteurs uniquement
  }
  
  const { data, error } = await query.order('code');
  
  if (error) throw error;
  return data;
}

// Nomenclature douanière
export async function getNomenclatureCodes() {
  const { data, error } = await supabase
    .from('nomenclature_codes')
    .select('*')
    .order('code');
  
  if (error) throw error;
  return data;
}

export async function getNomenclatureByCode(code: string) {
  const { data, error } = await supabase
    .from('nomenclature_codes')
    .select('*')
    .eq('code', code)
    .single();
  
  if (error) throw error;
  return data;
}

export async function searchNomenclature(query: string) {
  const { data, error } = await supabase
    .from('nomenclature_codes')
    .select('*')
    .or(`description.ilike.%${query}%,product_category.ilike.%${query}%`)
    .limit(20);
  
  if (error) throw error;
  return data;
}

// Utilisateurs et auth
export async function authenticateUser(username: string, password: string) {
  // Pour l'instant, auth simple en dur
  if (username === 'men' && password === 'men2023') {
    return { id: 1, username: 'men', role: 'admin' };
  }
  throw new Error('Identifiants invalides');
}

// Analytics et stats
export async function getStats() {
  try {
    const [
      { count: totalArticles },
      { count: totalCorrections },
      { count: totalClassifications },
      { count: validatedCorrections },
      { count: validatedClassifications }
    ] = await Promise.all([
      supabase.from('articles').select('*', { count: 'exact', head: true }),
      supabase.from('label_corrections').select('*', { count: 'exact', head: true }),
      supabase.from('cyrus_classifications').select('*', { count: 'exact', head: true }),
      supabase.from('label_corrections').select('*', { count: 'exact', head: true }).eq('validated', true),
      supabase.from('cyrus_classifications').select('*', { count: 'exact', head: true }).eq('validated', true)
    ]);

    return {
      totalArticles: totalArticles || 0,
      totalCorrections: totalCorrections || 0,
      totalClassifications: totalClassifications || 0,
      validatedCorrections: validatedCorrections || 0,
      validatedClassifications: validatedClassifications || 0,
      correctionRate: (totalCorrections || 0) > 0 ? Math.round((validatedCorrections || 0) / (totalCorrections || 1) * 100) : 0,
      classificationRate: (totalClassifications || 0) > 0 ? Math.round((validatedClassifications || 0) / (totalClassifications || 1) * 100) : 0
    };
  } catch (error) {
    console.error('Erreur lors du calcul des stats:', error);
    return {
      totalArticles: 0,
      totalCorrections: 0,
      totalClassifications: 0,
      validatedCorrections: 0,
      validatedClassifications: 0,
      correctionRate: 0,
      classificationRate: 0
    };
  }
}