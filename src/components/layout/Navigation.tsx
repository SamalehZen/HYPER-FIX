"use client";
import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Menu, X } from "lucide-react";
import { useNavigate } from "../../lib/router";

const colors = {
  50: "#f8f7f5",
  100: "#e6e1d7",
  200: "#c8b4a0",
  300: "#a89080",
  400: "#8a7060",
  500: "#6b5545",
  600: "#544237",
  700: "#3c4237",
  800: "#2a2e26",
  900: "#1a1d18",
};

interface NavigationProps {
  currentPage?: string;
}

export function Navigation({ currentPage = "home" }: NavigationProps) {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const navigate = useNavigate();

  const navigationItems = [
    { path: "/", label: "Accueil", id: "home" },
    { path: "/#services", label: "Services", id: "services", isAnchor: true },
    { path: "/service/correction-libelle", label: "Correction", id: "correction" },
    { path: "/service/classification", label: "Classification", id: "classification" },
    { path: "/service/nomenclature-douaniere", label: "Nomenclature", id: "nomenclature" },
    { path: "/dashboard", label: "Dashboard", id: "dashboard" },
  ];

  const handleNavigation = (item: typeof navigationItems[0]) => {
    if (item.isAnchor) {
      // Pour les liens anchor, naviguer d'abord vers la page puis scroller
      navigate("/");
      setTimeout(() => {
        document.getElementById('services')?.scrollIntoView({ behavior: 'smooth' });
      }, 100);
    } else {
      navigate(item.path);
    }
    setIsMenuOpen(false);
  };

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-black/20 backdrop-blur-sm border-b border-white/10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center">
            <button 
              onClick={() => navigate("/")} 
              className="flex items-center space-x-2 hover:opacity-80 transition-opacity"
            >
              <h1 className="text-xl font-bold" style={{ color: colors[100] }}>
                L'HyperFix
              </h1>
              <div 
                className="w-2 h-2 rounded-full" 
                style={{ background: colors[200] }}
              ></div>
            </button>
          </div>
          
          {/* Desktop Menu */}
          <div className="hidden md:block">
            <div className="ml-10 flex items-baseline space-x-6">
              {navigationItems.map((item) => (
                <button
                  key={item.id}
                  onClick={() => handleNavigation(item)}
                  className={`hover:text-[#c8b4a0] transition-colors px-3 py-2 rounded-md text-sm font-medium ${
                    currentPage === item.id
                      ? "text-[#c8b4a0] border-b border-[#c8b4a0]"
                      : "text-[#a89080]"
                  }`}
                  style={{ 
                    color: currentPage === item.id ? colors[200] : colors[300] 
                  }}
                >
                  {item.label}
                </button>
              ))}
              <Button 
                variant="outline" 
                size="sm" 
                className="border-[#c8b4a0] text-[#c8b4a0] hover:bg-[#c8b4a0] hover:text-[#1a1d18] ml-4"
              >
                Connexion
              </Button>
            </div>
          </div>
          
          {/* Mobile menu button */}
          <div className="md:hidden">
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="p-2 rounded-md text-[#c8b4a0] hover:bg-white/10 transition-colors"
            >
              {isMenuOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
          </div>
        </div>
      </div>
      
      {/* Mobile Menu */}
      {isMenuOpen && (
        <div className="md:hidden bg-black/90 backdrop-blur-sm border-t border-white/10">
          <div className="px-2 pt-2 pb-3 space-y-1">
            {navigationItems.map((item) => (
              <button
                key={item.id}
                onClick={() => handleNavigation(item)}
                className={`block w-full text-left px-3 py-2 rounded-md text-base font-medium transition-colors ${
                  currentPage === item.id
                    ? "text-[#c8b4a0] bg-white/10"
                    : "text-[#a89080] hover:bg-white/5 hover:text-[#c8b4a0]"
                }`}
              >
                {item.label}
              </button>
            ))}
            <div className="px-3 pt-4">
              <Button 
                variant="outline" 
                size="sm" 
                className="w-full border-[#c8b4a0] text-[#c8b4a0] hover:bg-[#c8b4a0] hover:text-[#1a1d18]"
              >
                Connexion
              </Button>
            </div>
          </div>
        </div>
      )}
    </nav>
  );
}