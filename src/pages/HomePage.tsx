import React from "react";
import { Layout } from "../components/layout/Layout";
import { HeroSection } from "../components/layout/HeroSection";
import { Button } from "@/components/ui/button";
import { ArrowRight, Cpu, Database, BarChart3, Shield, Zap, Target } from "lucide-react";
import { useNavigate } from "../lib/router";
import { useTheme } from "../lib/theme-context";
import { TrustedBy } from "../components/layout/TrustedBy";
import { AnimatedTestimonialsDemo } from "../components/layout/AnimatedTestimonialsDemo";

export default function HomePage() {
  const { theme } = useTheme();
  const navigate = useNavigate();

  return (
    <Layout currentPage="home">
      {/* Hero Section */}
      <HeroSection
        subtitle="Bienvenue dans L'HyperFix — Propulsez votre transformation digitale."
        title="Optimisez vos processus avec l'intelligence artificielle."
        description="Correction, classification, et nomenclature douanière — tout en une plateforme sécurisée."
      >
        <div className="flex flex-col sm:flex-row gap-4 justify-center items-center mt-8">
          <Button
            size="lg"
            className={`group font-medium ${theme === 'dark'
              ? 'bg-[#c8b4a0] hover:bg-[#a89080] text-[#1a1d18]'
              : 'bg-[#6b5545] hover:bg-[#544237] text-[#f8f7f5]'}`}
            onClick={() => document.getElementById('services')?.scrollIntoView({ behavior: 'smooth' })}
          >
            Découvrir nos services
            <ArrowRight className="ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform" />
          </Button>
          <Button
            variant="outline"
            size="lg"
            className={theme === 'dark'
              ? "border-[#c8b4a0] text-[#c8b4a0] hover:bg-[#c8b4a0] hover:text-[#1a1d18]"
              : "border-[#6b5545] text-[#6b5545] hover:bg-[#6b5545] hover:text-[#f8f7f5]"}
            onClick={() => navigate('/service/correction-libelle')}
          >
            Essayer maintenant
          </Button>
        </div>
      </HeroSection>

      {/* Section Services */}
      <section id="services" className="py-20 px-4">
        <div className="container mx-auto">
          <div className="text-center mb-16">
            <h2 className={`text-3xl md:text-4xl font-bold mb-6 ${theme === 'dark' ? 'text-primary' : 'text-black'}`}>
              Nos Services Intelligents
            </h2>
            <p className={`text-xl max-w-3xl mx-auto ${theme === 'dark' ? 'text-muted-foreground' : 'text-black'}`}>
              Trois modules puissants pour optimiser votre gestion produit,
              alimentés par l'intelligence artificielle et vos données métier.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* Service 1: Correction */}
            <div className={`group relative rounded-2xl p-8 transition-all duration-300 ${theme === 'dark'
              ? 'bg-gradient-to-br from-[#2a2e26]/50 to-[#1a1d18]/50 border border-[#3a3e36]/30 hover:border-[#c8b4a0]/30'
              : 'bg-gradient-to-br from-[#f8f7f5] to-[#e6e1d7] border border-[#c8b4a0]/30 hover:border-[#6b5545]/30'}`}>
              <div className={`absolute inset-0 rounded-2xl transition-opacity ${theme === 'dark'
                ? 'bg-gradient-to-br from-[#c8b4a0]/5 to-transparent opacity-0 group-hover:opacity-100'
                : 'bg-gradient-to-br from-[#6b5545]/5 to-transparent opacity-0 group-hover:opacity-100'}`} />
              <div className="relative z-10">
                <div className={`w-16 h-16 rounded-xl flex items-center justify-center mb-6 transition-colors ${theme === 'dark'
                  ? 'bg-[#c8b4a0]/10 group-hover:bg-[#c8b4a0]/20'
                  : 'bg-[#6b5545]/10 group-hover:bg-[#6b5545]/20'}`}>
                  <Zap className={`h-8 w-8 ${theme === 'dark' ? 'text-[#c8b4a0]' : 'text-[#6b5545]'}`} />
                </div>
                <h3 className="text-xl font-semibold text-primary mb-4">Correction de Libellés</h3>
                <p className="text-muted-foreground mb-6">
                  Normalisation automatique de vos libellés : suppression caractères spéciaux,
                  grammages, format MARQUE - NOM - GRAMMAGE.
                </p>
                <Button
                  variant="ghost"
                  className={`group/btn p-0 ${theme === 'dark'
                    ? 'text-[#c8b4a0] hover:text-[#a89080]'
                    : 'text-[#6b5545] hover:text-[#544237]'}`}
                  onClick={() => navigate('/service/correction-libelle')}
                >
                  Essayer maintenant
                  <ArrowRight className="ml-2 h-4 w-4 group-hover/btn:translate-x-1 transition-transform" />
                </Button>
              </div>
            </div>

            {/* Service 2: Classification */}
            <div className={`group relative rounded-2xl p-8 transition-all duration-300 ${theme === 'dark'
              ? 'bg-gradient-to-br from-[#2a2e26]/50 to-[#1a1d18]/50 border border-[#3a3e36]/30 hover:border-[#c8b4a0]/30'
              : 'bg-gradient-to-br from-[#f8f7f5] to-[#e6e1d7] border border-[#c8b4a0]/30 hover:border-[#6b5545]/30'}`}>
              <div className={`absolute inset-0 rounded-2xl transition-opacity ${theme === 'dark'
                ? 'bg-gradient-to-br from-[#c8b4a0]/5 to-transparent opacity-0 group-hover:opacity-100'
                : 'bg-gradient-to-br from-[#6b5545]/5 to-transparent opacity-0 group-hover:opacity-100'}`} />
              <div className="relative z-10">
                <div className={`w-16 h-16 rounded-xl flex items-center justify-center mb-6 transition-colors ${theme === 'dark'
                  ? 'bg-[#c8b4a0]/10 group-hover:bg-[#c8b4a0]/20'
                  : 'bg-[#6b5545]/10 group-hover:bg-[#6b5545]/20'}`}>
                  <Cpu className={`h-8 w-8 ${theme === 'dark' ? 'text-[#c8b4a0]' : 'text-[#6b5545]'}`} />
                </div>
                <h3 className="text-xl font-semibold text-primary mb-4">Classification CYRUS IA</h3>
                <p className="text-muted-foreground mb-6">
                  Classification automatique selon votre structure personnalisée :
                  Secteur → Rayon → Famille → Sous-famille par IA.
                </p>
                <Button
                  variant="ghost"
                  className={`group/btn p-0 ${theme === 'dark'
                    ? 'text-[#c8b4a0] hover:text-[#a89080]'
                    : 'text-[#6b5545] hover:text-[#544237]'}`}
                  onClick={() => navigate('/service/classification')}
                >
                  Classer maintenant
                  <ArrowRight className="ml-2 h-4 w-4 group-hover/btn:translate-x-1 transition-transform" />
                </Button>
              </div>
            </div>

            {/* Service 3: Nomenclature */}
            <div className={`group relative rounded-2xl p-8 transition-all duration-300 ${theme === 'dark'
              ? 'bg-gradient-to-br from-[#2a2e26]/50 to-[#1a1d18]/50 border border-[#3a3e36]/30 hover:border-[#c8b4a0]/30'
              : 'bg-gradient-to-br from-[#f8f7f5] to-[#e6e1d7] border border-[#c8b4a0]/30 hover:border-[#6b5545]/30'}`}>
              <div className={`absolute inset-0 rounded-2xl transition-opacity ${theme === 'dark'
                ? 'bg-gradient-to-br from-[#c8b4a0]/5 to-transparent opacity-0 group-hover:opacity-100'
                : 'bg-gradient-to-br from-[#6b5545]/5 to-transparent opacity-0 group-hover:opacity-100'}`} />
              <div className="relative z-10">
                <div className={`w-16 h-16 rounded-xl flex items-center justify-center mb-6 transition-colors ${theme === 'dark'
                  ? 'bg-[#c8b4a0]/10 group-hover:bg-[#c8b4a0]/20'
                  : 'bg-[#6b5545]/10 group-hover:bg-[#6b5545]/20'}`}>
                  <Database className={`h-8 w-8 ${theme === 'dark' ? 'text-[#c8b4a0]' : 'text-[#6b5545]'}`} />
                </div>
                <h3 className="text-xl font-semibold text-primary mb-4">Nomenclature Douanière</h3>
                <p className="text-muted-foreground mb-6">
                  Suggestion automatique codes douaniers 4 chiffres + calcul taxes :
                  TVA, TIC, taxe sanitaire selon produit.
                </p>
                <Button
                  variant="ghost"
                  className={`group/btn p-0 ${theme === 'dark'
                    ? 'text-[#c8b4a0] hover:text-[#a89080]'
                    : 'text-[#6b5545] hover:text-[#544237]'}`}
                  onClick={() => navigate('/service/nomenclature-douaniere')}
                >
                  Calculer maintenant
                  <ArrowRight className="ml-2 h-4 w-4 group-hover/btn:translate-x-1 transition-transform" />
                </Button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Section Workflow */}
      <section className={`py-20 px-4 border-t ${theme === 'dark' ? 'border-[#3a3e36]/30' : 'border-[#c8b4a0]/30'}`}>
        <div className="container mx-auto">
          <div className="text-center mb-16">
            <h2 className={`text-3xl md:text-4xl font-bold mb-6 ${theme === 'dark' ? 'text-primary' : 'text-black'}`}>
              Workflow Global Intégré
            </h2>
            <p className={`text-xl max-w-3xl mx-auto ${theme === 'dark' ? 'text-muted-foreground' : 'text-black'}`}>
              Pipeline unifié pour un traitement automatisé complet de vos données produit
            </p>
          </div>

          <div className="max-w-4xl mx-auto">
            <div className="grid grid-cols-1 md:grid-cols-6 gap-4 items-center">
              <div className="text-center">
                <div className={`w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-3 ${theme === 'dark' ? 'bg-[#c8b4a0]/10' : 'bg-[#6b5545]/10'}`}>
                  <span className={`font-bold ${theme === 'dark' ? 'text-[#c8b4a0]' : 'text-[#6b5545]'}`}>1</span>
                </div>
                <p className="text-sm text-muted-foreground">Libellé brut</p>
              </div>
              
              <div className="hidden md:flex justify-center">
                <ArrowRight className={`h-5 w-5 ${theme === 'dark' ? 'text-[#c8b4a0]' : 'text-[#6b5545]'}`} />
              </div>
              
              <div className="text-center">
                <div className={`w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-3 ${theme === 'dark' ? 'bg-[#c8b4a0]/10' : 'bg-[#6b5545]/10'}`}>
                  <span className={`font-bold ${theme === 'dark' ? 'text-[#c8b4a0]' : 'text-[#6b5545]'}`}>2</span>
                </div>
                <p className="text-sm text-muted-foreground">Correction</p>
              </div>
              
              <div className="hidden md:flex justify-center">
                <ArrowRight className={`h-5 w-5 ${theme === 'dark' ? 'text-[#c8b4a0]' : 'text-[#6b5545]'}`} />
              </div>
              
              <div className="text-center">
                <div className={`w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-3 ${theme === 'dark' ? 'bg-[#c8b4a0]/10' : 'bg-[#6b5545]/10'}`}>
                  <span className={`font-bold ${theme === 'dark' ? 'text-[#c8b4a0]' : 'text-[#6b5545]'}`}>3</span>
                </div>
                <p className="text-sm text-muted-foreground">Classification</p>
              </div>
              
              <div className="hidden md:flex justify-center">
                <ArrowRight className={`h-5 w-5 ${theme === 'dark' ? 'text-[#c8b4a0]' : 'text-[#6b5545]'}`} />
              </div>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-center mt-8">
              <div className="text-center">
                <div className={`w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-3 ${theme === 'dark' ? 'bg-[#c8b4a0]/10' : 'bg-[#6b5545]/10'}`}>
                  <span className={`font-bold ${theme === 'dark' ? 'text-[#c8b4a0]' : 'text-[#6b5545]'}`}>4</span>
                </div>
                <p className="text-sm text-muted-foreground">Code douanier</p>
              </div>
              
              <div className="text-center">
                <div className={`w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-3 ${theme === 'dark' ? 'bg-[#c8b4a0]/10' : 'bg-[#6b5545]/10'}`}>
                  <span className={`font-bold ${theme === 'dark' ? 'text-[#c8b4a0]' : 'text-[#6b5545]'}`}>5</span>
                </div>
                <p className="text-sm text-muted-foreground">Calcul taxes</p>
              </div>
              
              <div className="text-center">
                <div className={`w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-3 ${theme === 'dark' ? 'bg-[#c8b4a0]/10' : 'bg-[#6b5545]/10'}`}>
                  <span className={`font-bold ${theme === 'dark' ? 'text-[#c8b4a0]' : 'text-[#6b5545]'}`}>6</span>
                </div>
                <p className="text-sm text-muted-foreground">Export final</p>
              </div>
            </div>
          </div>

          <div className="text-center mt-12">
            <Button
              size="lg"
              className={`font-medium ${theme === 'dark'
                ? 'bg-[#c8b4a0] hover:bg-[#a89080] text-[#1a1d18]'
                : 'bg-[#6b5545] hover:bg-[#544237] text-[#f8f7f5]'}`}
              onClick={() => navigate('/service/correction-libelle')}
            >
              Commencer le workflow complet
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </div>
        </div>
      </section>

      {/* Section Fonctionnalités */}
      <section className={`py-20 px-4 border-t ${theme === 'dark' ? 'border-[#3a3e36]/30' : 'border-[#c8b4a0]/30'}`}>
        <div className="container mx-auto">
          <div className="text-center mb-16">
            <h2 className={`text-3xl md:text-4xl font-bold mb-6 ${theme === 'dark' ? 'text-primary' : 'text-black'}`}>
              Fonctionnalités Avancées
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-5xl mx-auto">
            <div className="text-center">
              <div className={`w-16 h-16 rounded-xl flex items-center justify-center mx-auto mb-6 ${theme === 'dark' ? 'bg-[#c8b4a0]/10' : 'bg-[#6b5545]/10'}`}>
                <Shield className={`h-8 w-8 ${theme === 'dark' ? 'text-[#c8b4a0]' : 'text-[#6b5545]'}`} />
              </div>
              <h3 className="text-xl font-semibold text-primary mb-4">Base 97k Articles</h3>
              <p className="text-muted-foreground">
                Matching intelligent avec votre historique complet pour des suggestions personnalisées
              </p>
            </div>

            <div className="text-center">
              <div className={`w-16 h-16 rounded-xl flex items-center justify-center mx-auto mb-6 ${theme === 'dark' ? 'bg-[#c8b4a0]/10' : 'bg-[#6b5545]/10'}`}>
                <BarChart3 className={`h-8 w-8 ${theme === 'dark' ? 'text-[#c8b4a0]' : 'text-[#6b5545]'}`} />
              </div>
              <h3 className="text-xl font-semibold text-primary mb-4">Analytics & Alertes</h3>
              <p className="text-muted-foreground">
                Tableaux de bord temps réel, alertes intelligentes et rapports automatisés
              </p>
            </div>

            <div className="text-center">
              <div className={`w-16 h-16 rounded-xl flex items-center justify-center mx-auto mb-6 ${theme === 'dark' ? 'bg-[#c8b4a0]/10' : 'bg-[#6b5545]/10'}`}>
                <Target className={`h-8 w-8 ${theme === 'dark' ? 'text-[#c8b4a0]' : 'text-[#6b5545]'}`} />
              </div>
              <h3 className="text-xl font-semibold text-primary mb-4">Formation Assistée</h3>
              <p className="text-muted-foreground">
                Interface guidée et formation personnalisée pour tous les utilisateurs
              </p>
            </div>
          </div>
        </div>
      </section>

      <AnimatedTestimonialsDemo />

      {/* Section CTA finale */}
      <section className={`py-20 px-4 border-t ${theme === 'dark' ? 'border-[#3a3e36]/30' : 'border-[#c8b4a0]/30'}`}>
        <div className="container mx-auto text-center">
          <h2 className={`text-3xl md:text-4xl font-bold mb-6 ${theme === 'dark' ? 'text-primary' : 'text-black'}`}>
            Prêt à transformer vos processus ?
          </h2>
          <p className={`text-xl mb-8 max-w-2xl mx-auto ${theme === 'dark' ? 'text-muted-foreground' : 'text-black'}`}>
            Découvrez comment L'HyperFix peut optimiser votre gestion produit
            dès aujourd'hui avec l'intelligence artificielle.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
            <Button
              size="lg"
              className={`font-medium ${theme === 'dark'
                ? 'bg-[#c8b4a0] hover:bg-[#a89080] text-[#1a1d18]'
                : 'bg-[#6b5545] hover:bg-[#544237] text-[#f8f7f5]'}`}
              onClick={() => navigate('/service/correction-libelle')}
            >
              Commencer maintenant
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
            <Button
              variant="outline"
              size="lg"
              className={theme === 'dark'
                ? "border-[#c8b4a0] text-[#c8b4a0] hover:bg-[#c8b4a0] hover:text-[#1a1d18]"
                : "border-[#6b5545] text-[#6b5545] hover:bg-[#6b5545] hover:text-[#f8f7f5]"}
              onClick={() => navigate('/login')}
            >
              Se connecter
            </Button>
          </div>
        </div>
      </section>
      <TrustedBy />
    </Layout>
  );
}