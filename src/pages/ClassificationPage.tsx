import React from 'react';
import { Layout } from '../components/layout/Layout';
import { HeroSection } from '../components/layout/HeroSection';
import ClassificationService from '../components/services/ClassificationService';
import { Button } from '../components/ui/button';
import { Lock } from 'lucide-react';

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
        {/* Overlay "Coming Soon" */}
        <div className="relative">
          <div className="absolute inset-0 bg-background/80 backdrop-blur-sm z-10 flex items-center justify-center rounded-lg">
            <div className="text-center p-8 bg-card border border-border rounded-lg shadow-lg max-w-md">
              <Lock className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-2xl font-bold text-primary mb-2">Bientôt disponible</h3>
              <p className="text-muted-foreground mb-6">
                Le service de classification IA est en cours de développement.
              </p>
              <Button variant="outline" disabled>
                Coming Soon
              </Button>
            </div>
          </div>
          <div className="blur-sm">
            <ClassificationService />
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default ClassificationPage;