import React from 'react';
import { Layout } from '../components/layout/Layout';
import { HeroSection } from '../components/layout/HeroSection';
import WorkflowService from '../components/services/WorkflowService';

const WorkflowPage: React.FC = () => {
  return (
    <Layout currentPage="workflow">
      {/* Hero Section compacte pour les pages de service */}
      <HeroSection 
        title="Workflow Global Intégré"
        subtitle="Pipeline Automatisé Complet"
        description="Traitement automatisé unifié : correction de libellés → classification CYRUS → nomenclature douanière → export final."
        compact={true}
        showBackground={false}
      />
      
      {/* Contenu principal */}
      <div className="container mx-auto px-4 py-8">
        <WorkflowService />
      </div>
    </Layout>
  );
};

export default WorkflowPage;