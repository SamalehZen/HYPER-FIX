import React from 'react';
import { Layout } from '../components/layout/Layout';
import { HeroSection } from '../components/layout/HeroSection';
import ClassificationService from '../components/services/ClassificationService';

const ClassificationPage: React.FC = () => {
  return (
    <Layout currentPage="classification">
      {/* Hero Section compacte pour les pages de service */}
      <HeroSection 
        title="Classification CYRUS IA"
        subtitle="Intelligence Artificielle"
        description="Classification automatique selon votre structure personnalisée : Secteur → Rayon → Famille → Sous-famille par IA avancée."
        compact={true}
        showBackground={false}
      />
      
      {/* Contenu principal */}
      <div className="container mx-auto px-4 py-8">
        <ClassificationService />
      </div>
    </Layout>
  );
};

export default ClassificationPage;