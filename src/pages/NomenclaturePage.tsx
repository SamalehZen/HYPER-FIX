import React from 'react';
import { Layout } from '../components/layout/Layout';
import { HeroSection } from '../components/layout/HeroSection';
import NomenclatureService from '../components/services/NomenclatureService';

const NomenclaturePage: React.FC = () => {
  return (
    <Layout currentPage="nomenclature">
      {/* Hero Section compacte pour les pages de service */}
      <HeroSection 
        title="Nomenclature Douanière"
        subtitle="Calcul Automatique des Taxes"
        description="Suggestion automatique des codes douaniers 4 chiffres et calcul précis des taxes : TVA, TIC, taxe sanitaire selon le produit."
        compact={true}
        showBackground={false}
      />
      
      {/* Contenu principal */}
      <div className="container mx-auto px-4 py-8">
        <NomenclatureService />
      </div>
    </Layout>
  );
};

export default NomenclaturePage;