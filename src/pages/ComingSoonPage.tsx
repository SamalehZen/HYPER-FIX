import React from 'react';

const ComingSoonPage: React.FC = () => {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-[#1a1d18] via-black to-[#2a2e26]">
      <div className="text-center">
        <h1 className="text-4xl font-bold text-primary mb-4">Bientôt disponible</h1>
        <p className="text-muted-foreground mb-8">Cette page est en cours de développement.</p>
        <button 
          onClick={() => window.location.href = '/'}
          className="px-6 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors"
        >
          Retour à l'accueil
        </button>
      </div>
    </div>
  );
};

export default ComingSoonPage;