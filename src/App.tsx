import React from "react";
import { RouterProvider, Router } from "./lib/router";
import { ThemeProvider } from "./lib/theme-context";
import HomePage from "./pages/HomePage";
import CorrectionPage from "./pages/CorrectionPage";
import ClassificationPage from "./pages/ClassificationPage";
import NomenclaturePage from "./pages/NomenclaturePage";
import WorkflowPage from "./pages/WorkflowPage";
import ComingSoonPage from "./pages/ComingSoonPage";
import HeroTemplatePage from "./pages/HeroTemplatePage";
// Import des autres pages (à créer)
// import LoginPage from "./pages/LoginPage";
// import DashboardPage from "./pages/DashboardPage";

// Configuration des routes
const routes = [
  {
    path: "/",
    component: HomePage,
    title: "Accueil - L'HyperFix"
  },
  {
    path: "/service/correction-libelle",
    component: CorrectionPage,
    title: "Correction de Libellés - L'HyperFix"
  },
  {
    path: "/service/classification",
    component: ClassificationPage,
    title: "Classification CYRUS - L'HyperFix"
  },
  {
    path: "/service/nomenclature-douaniere",
    component: NomenclaturePage,
    title: "Nomenclature Douanière - L'HyperFix"
  },
  {
    path: "/workflow",
    component: WorkflowPage,
    title: "Workflow Intégré - L'HyperFix"
  },
  {
    path: "/hero-template",
    component: HeroTemplatePage,
    title: "Hero Template - L'HyperFix"
  },
  // Autres routes à ajouter progressivement
  // {
  //   path: "/login",
  //   component: LoginPage,
  //   title: "Connexion - L'HyperFix"
  // },
  {
    path: "/dashboard",
    component: ComingSoonPage,
    title: "Dashboard - L'HyperFix"
  }
];

export default function App() {
  return (
    <ThemeProvider>
      <RouterProvider routes={routes} initialPath="/">
        <Router />
      </RouterProvider>
    </ThemeProvider>
  );
}