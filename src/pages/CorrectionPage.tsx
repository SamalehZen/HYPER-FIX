import React from 'react';
import { Layout } from '../components/layout/Layout';
import { HeroSection } from '../components/layout/HeroSection';
import CorrectionService from '../components/services/CorrectionService';

const CorrectionPage: React.FC = () => {
  return (
    <Layout currentPage="correction">
      {/* Hero Section compacte pour les pages de service */}
      <HeroSection 
        title="Correction de Libellés"
        subtitle="Normalisation Intelligente"
        description="Automatisez la correction et la normalisation de vos libellés produits avec des règles métier personnalisées."
        compact={true}
        showBackground={false}
      />
      
      {/* Contenu principal */}
      <div className="container mx-auto px-4 py-8">
        <CorrectionService />
      </div>
    </Layout>
  );
};

export default CorrectionPage;