"use client"

import * as React from "react"
import { useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Menu, X, Sun, Moon } from "lucide-react"
import { useNavigate } from "../../lib/router"
import { useTheme } from "../../lib/theme-context"
import { Button } from "@/components/ui/button"

interface NavigationProps {
  currentPage?: string;
}

export function Navigation({ currentPage = "home" }: NavigationProps) {
  const [isOpen, setIsOpen] = useState(false)

  const toggleMenu = () => setIsOpen(!isOpen)
  const { theme, toggleTheme } = useTheme()
  const navigate = useNavigate()

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
    setIsOpen(false);
  };

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

  return (
    <div className={`fixed top-0 left-0 right-0 z-50 flex justify-center w-full py-6 px-4`}>
      <div className={`flex items-center justify-between px-6 py-3 rounded-full shadow-lg w-full max-w-3xl relative z-10 ${
        theme === 'dark'
          ? 'bg-black/20 border-white/10'
          : 'bg-[#f8f7f5]/80 border-[#1a1d18]/10'
      }`}>
        <div className="flex items-center">
          <button
            onClick={() => navigate("/")}
            className="flex items-center space-x-2 hover:opacity-80 transition-opacity"
          >
            <h1 className="text-xl font-bold" style={{ color: theme === 'dark' ? colors[100] : colors[900] }}>
              L'HyperFix
            </h1>
            <div
              className="w-2 h-2 rounded-full"
              style={{ background: theme === 'dark' ? colors[200] : colors[500] }}
            ></div>
          </button>
        </div>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center space-x-8">
            {navigationItems.map((item) => (
              <motion.div
                key={item.id}
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3 }}
                whileHover={{ scale: 1.05 }}
              >
                <button
                  onClick={() => handleNavigation(item)}
                  className={`text-sm transition-colors font-medium ${
                    currentPage === item.id
                      ? theme === 'dark' ? 'text-white' : 'text-black'
                      : theme === 'dark' ? 'text-gray-400 hover:text-white' : 'text-gray-500 hover:text-black'
                  }`}
                >
                  {item.label}
                </button>
              </motion.div>
            ))}
          </nav>

        {/* Desktop CTA Button */}
        <motion.div
          className="hidden md:block"
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.3, delay: 0.2 }}
        >
          <Button
            variant="outline"
            size="sm"
            onClick={toggleTheme}
            className={theme === 'dark' ? "text-white" : ""}
          >
            {theme === 'dark' ? <Sun size={16} /> : <Moon size={16} />}
          </Button>
          <Button
            variant="outline"
            size="sm"
            className={`ml-2 ${theme === 'dark' ? "text-white" : ""}`}
          >
            Connexion
          </Button>
        </motion.div>

        {/* Mobile Menu Button */}
        <motion.button className="md:hidden flex items-center" onClick={toggleMenu} whileTap={{ scale: 0.9 }}>
          <Menu className={`h-6 w-6 ${theme === 'dark' ? 'text-white' : 'text-black'}`} />
        </motion.button>
      </div>

      {/* Mobile Menu Overlay */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            className={`fixed inset-0 z-50 pt-24 px-6 md:hidden ${
              theme === 'dark' ? 'bg-black/95' : 'bg-white'
            }`}
            initial={{ opacity: 0, x: "100%" }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: "100%" }}
            transition={{ type: "spring", damping: 25, stiffness: 300 }}
          >
            <motion.button
              className="absolute top-6 right-6 p-2"
              onClick={toggleMenu}
              whileTap={{ scale: 0.9 }}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.2 }}
            >
              <X className={`h-6 w-6 ${theme === 'dark' ? 'text-white' : 'text-black'}`} />
            </motion.button>
            <div className="flex flex-col space-y-6">
              {navigationItems.map((item, i) => (
                <motion.div
                  key={item.id}
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.1 + 0.1 }}
                  exit={{ opacity: 0, x: 20 }}
                >
                  <button
                    onClick={() => handleNavigation(item)}
                    className={`text-base font-medium ${theme === 'dark' ? 'text-white' : 'text-black'}`}
                  >
                    {item.label}
                  </button>
                </motion.div>
              ))}

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5 }}
                exit={{ opacity: 0, y: 20 }}
                className="pt-6"
              >
                <div className="px-3 pt-4 flex space-x-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={toggleTheme}
                    className={`flex-1 ${theme === 'dark' ? "text-white" : ""}`}
                  >
                    {theme === 'dark' ? <Sun size={16} /> : <Moon size={16} />}
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    className={`flex-1 ml-2 ${theme === 'dark' ? "text-white" : ""}`}
                  >
                    Connexion
                  </Button>
                </div>
              </motion.div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}