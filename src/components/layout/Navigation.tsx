"use client";
import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Menu, X, Sun, Moon } from "lucide-react";
import { useNavigate } from "../../lib/router";
import { useTheme } from "../../lib/theme-context";

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
  const { theme, toggleTheme } = useTheme();

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
    <nav className={`fixed top-0 left-0 right-0 z-50 backdrop-blur-sm border-b ${
      theme === 'dark'
        ? 'bg-black/20 border-white/10'
        : 'bg-[#f8f7f5]/80 border-[#1a1d18]/10'
    }`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center">
            <button
              onClick={() => navigate("/")}
              className="flex items-center space-x-2 hover:opacity-80 transition-opacity"
            >
              <h1 className="text-xl font-bold" style={{
                color: theme === 'dark' ? colors[100] : '#1a1d18'
              }}>
                L'HyperFix
              </h1>
              <div
                className="w-2 h-2 rounded-full"
                style={{
                  background: theme === 'dark' ? colors[200] : '#6b5545'
                }}
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
                  className={`transition-colors px-3 py-2 rounded-md text-sm font-medium ${
                    theme === 'dark'
                      ? 'hover:text-[#c8b4a0]'
                      : 'hover:text-[#6b5545]'
                  } ${
                    currentPage === item.id
                      ? theme === 'dark'
                        ? "text-[#c8b4a0] border-b border-[#c8b4a0]"
                        : "text-[#6b5545] border-b border-[#6b5545]"
                      : theme === 'dark'
                        ? "text-[#a89080]"
                        : "text-[#544237]"
                  }`}
                  style={{
                    color: currentPage === item.id
                      ? (theme === 'dark' ? colors[200] : '#6b5545')
                      : (theme === 'dark' ? colors[300] : '#544237')
                  }}
                >
                  {item.label}
                </button>
              ))}
              <Button
                variant="outline"
                size="sm"
                onClick={toggleTheme}
                className={
                  theme === 'dark'
                    ? "border-[#c8b4a0] text-[#c8b4a0] hover:bg-[#c8b4a0] hover:text-[#1a1d18] ml-4"
                    : "border-[#6b5545] text-[#6b5545] hover:bg-[#6b5545] hover:text-[#f8f7f5] ml-4"
                }
              >
                {theme === 'dark' ? <Sun size={16} /> : <Moon size={16} />}
              </Button>
              <Button
                variant="outline"
                size="sm"
                className={
                  theme === 'dark'
                    ? "border-[#c8b4a0] text-[#c8b4a0] hover:bg-[#c8b4a0] hover:text-[#1a1d18] ml-2"
                    : "border-[#6b5545] text-[#6b5545] hover:bg-[#6b5545] hover:text-[#f8f7f5] ml-2"
                }
              >
                Connexion
              </Button>
            </div>
          </div>
          
          {/* Mobile menu button */}
          <div className="md:hidden">
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className={`p-2 rounded-md transition-colors ${
                theme === 'dark'
                  ? 'text-[#c8b4a0] hover:bg-white/10'
                  : 'text-[#6b5545] hover:bg-black/10'
              }`}
            >
              {isMenuOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
          </div>
        </div>
      </div>
      
      {/* Mobile Menu */}
      {isMenuOpen && (
        <div className={`md:hidden backdrop-blur-sm border-t ${
          theme === 'dark'
            ? 'bg-black/90 border-white/10'
            : 'bg-[#f8f7f5]/90 border-[#1a1d18]/10'
        }`}>
          <div className="px-2 pt-2 pb-3 space-y-1">
            {navigationItems.map((item) => (
              <button
                key={item.id}
                onClick={() => handleNavigation(item)}
                className={`block w-full text-left px-3 py-2 rounded-md text-base font-medium transition-colors ${
                  theme === 'dark'
                    ? currentPage === item.id
                      ? "text-[#c8b4a0] bg-white/10"
                      : "text-[#a89080] hover:bg-white/5 hover:text-[#c8b4a0]"
                    : currentPage === item.id
                      ? "text-[#6b5545] bg-black/10"
                      : "text-[#544237] hover:bg-black/5 hover:text-[#6b5545]"
                }`}
              >
                {item.label}
              </button>
            ))}
            <div className="px-3 pt-4 flex space-x-2">
              <Button
                variant="outline"
                size="sm"
                onClick={toggleTheme}
                className={`flex-1 ${
                  theme === 'dark'
                    ? "border-[#c8b4a0] text-[#c8b4a0] hover:bg-[#c8b4a0] hover:text-[#1a1d18]"
                    : "border-[#6b5545] text-[#6b5545] hover:bg-[#6b5545] hover:text-[#f8f7f5]"
                }`}
              >
                {theme === 'dark' ? <Sun size={16} /> : <Moon size={16} />}
              </Button>
              <Button
                variant="outline"
                size="sm"
                className={`flex-1 ${
                  theme === 'dark'
                    ? "border-[#c8b4a0] text-[#c8b4a0] hover:bg-[#c8b4a0] hover:text-[#1a1d18]"
                    : "border-[#6b5545] text-[#6b5545] hover:bg-[#6b5545] hover:text-[#f8f7f5]"
                }`}
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