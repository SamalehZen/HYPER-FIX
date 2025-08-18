import React, { createContext, useContext, useState, ReactNode } from 'react';

// Types pour le router
export interface Route {
  path: string;
  component: React.ComponentType;
  title: string;
}

interface RouterContextType {
  currentPath: string;
  navigate: (path: string) => void;
  routes: Route[];
}

// Context du router
const RouterContext = createContext<RouterContextType | null>(null);

// Hook pour utiliser le router
export const useRouter = () => {
  const context = useContext(RouterContext);
  if (!context) {
    throw new Error('useRouter must be used within a RouterProvider');
  }
  return context;
};

// Provider du router
interface RouterProviderProps {
  children: ReactNode;
  routes: Route[];
  initialPath?: string;
}

export const RouterProvider: React.FC<RouterProviderProps> = ({ 
  children, 
  routes, 
  initialPath = '/' 
}) => {
  // Initialiser le chemin avec le chemin actuel de la fenêtre pour gérer les liens profonds
  const [currentPath, setCurrentPath] = useState(window.location.pathname || initialPath);

  const navigate = (path: string) => {
    setCurrentPath(path);
    // Mettre à jour l'URL du navigateur sans rechargement
    window.history.pushState({}, '', path);
  };

  const value = {
    currentPath,
    navigate,
    routes
  };

  return (
    <RouterContext.Provider value={value}>
      {children}
    </RouterContext.Provider>
  );
};

// Composant Router qui affiche la page courante
export const Router: React.FC = () => {
  const { currentPath, routes } = useRouter();
  
  // Trouver la route correspondante
  const currentRoute = routes.find(route => route.path === currentPath);
  
  if (!currentRoute) {
    // Page "Coming Soon"
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
  }

  // Rendre le composant de la route
  const Component = currentRoute.component;
  return <Component />;
};

// Hook pour la navigation
export const useNavigate = () => {
  const { navigate } = useRouter();
  return navigate;
};