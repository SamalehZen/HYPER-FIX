import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = import.meta.env.VITE_PUBLIC_SUPABASE_ANON_KEY!;

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Database types
export interface Article {
  id: number;
  ean?: string;
  nartar?: string;
  libelle: string;
  nomo?: string;
  secteur?: string;
  rayon?: string;
  famille?: string;
  ss_famille?: string;
  created_at?: string;
}

export interface LabelCorrection {
  id: number;
  original_label: string;
  corrected_label: string;
  correction_rules: any;
  confidence: number;
  validated: boolean;
  created_by?: string;
  created_at?: string;
}

export interface CyrusClassification {
  id: number;
  label: string;
  secteur?: string;
  rayon?: string;
  famille?: string;
  sous_famille?: string;
  confidence: number;
  ai_reasoning?: string;
  validated: boolean;
  created_by?: string;
  created_at?: string;
}

export interface NomenclatureCode {
  id: number;
  code: string;
  description?: string;
  tva_rate: number;
  tic_rate: number;
  taxe_sanitaire_rate: number;
  product_category?: string;
  updated_at?: string;
}