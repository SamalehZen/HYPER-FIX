import React, { useState } from "react";
import {
  Navbar,
  NavBody,
  NavItems,
  NavbarLogo,
  NavbarButton,
  MobileNav,
  MobileNavHeader,
  MobileNavMenu,
  MobileNavToggle,
} from "../ui/sizable-navbar";
import { useTheme } from "../../lib/theme-context";
import { useNavigate } from "../../lib/router";
import { Button } from "../ui/button";
import { Sun, Moon } from "lucide-react";

export function SizableNavigation({ currentPage = "home" }: { currentPage?: string }) {
  const [isOpen, setIsOpen] = useState(false);
  const { theme, toggleTheme } = useTheme();
  const navigate = useNavigate();

  const navigationItems = [
    { name: "Accueil", link: "/", id: "home" },
    { name: "Services", link: "/#services", id: "services" },
    { name: "Correction", link: "/service/correction-libelle", id: "correction" },
    { name: "Classification", link: "/service/classification", id: "classification" },
    { name: "Nomenclature", link: "/service/nomenclature-douaniere", id: "nomenclature" },
  ];

  const handleNavigation = (link: string) => {
    if (link.startsWith("/#")) {
      navigate("/");
      setTimeout(() => {
        document.getElementById(link.substring(2))?.scrollIntoView({ behavior: 'smooth' });
      }, 100);
    } else {
      navigate(link);
    }
    setIsOpen(false);
  };

  const HyperFixLogo = () => (
    <button
      onClick={() => navigate("/")}
      className="flex items-center space-x-2 hover:opacity-80 transition-opacity"
    >
      <h1 className="text-xl font-bold">
        L'HyperFix
      </h1>
      <div
        className="w-2 h-2 rounded-full bg-[#6b5545] dark:bg-[#c8b4a0]"
      ></div>
    </button>
  );

  return (
    <Navbar className="fixed top-0">
      <NavBody>
        <HyperFixLogo />
        <NavItems items={navigationItems} onItemClick={(item) => handleNavigation(item.link)} />
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={toggleTheme}>
            {theme === "dark" ? <Sun size={16} /> : <Moon size={16} />}
          </Button>
          <NavbarButton href="/login" as="a">
            Connexion
          </NavbarButton>
        </div>
      </NavBody>
      <MobileNav>
        <MobileNavHeader>
          <HyperFixLogo />
          <MobileNavToggle isOpen={isOpen} onClick={() => setIsOpen(!isOpen)} />
        </MobileNavHeader>
        <MobileNavMenu isOpen={isOpen} onClose={() => setIsOpen(false)}>
          {navigationItems.map((item) => (
            <button key={item.id} onClick={() => handleNavigation(item.link)} className="w-full text-left py-2">
              {item.name}
            </button>
          ))}
          <div className="pt-4 flex items-center justify-between w-full">
            <Button variant="outline" size="sm" onClick={toggleTheme}>
              {theme === "dark" ? <Sun size={16} /> : <Moon size={16} />}
            </Button>
            <NavbarButton href="/login" as="a">
              Connexion
            </NavbarButton>
          </div>
        </MobileNavMenu>
      </MobileNav>
    </Navbar>
  );
}
