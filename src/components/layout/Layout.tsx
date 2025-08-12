"use client";
import React, { ReactNode } from "react";
import { Navigation } from "./Navigation";
import { useTheme } from "../../lib/theme-context";

interface LayoutProps {
  children: ReactNode;
  currentPage?: string;
  showNavigation?: boolean;
}

export function Layout({ children, currentPage = "home", showNavigation = true }: LayoutProps) {
  const { theme } = useTheme();
  
  const backgroundClass = theme === 'dark'
    ? "bg-gradient-to-br from-[#1a1d18] via-black to-[#2a2e26]"
    : "bg-gradient-to-br from-[#f8f7f5] via-[#e6e1d7] to-[#c8b4a0]";

  return (
    <div className={`min-h-screen ${backgroundClass}`}>
      {showNavigation && <Navigation currentPage={currentPage} />}
      <main className={showNavigation ? "pt-16" : ""}>
        {children}
      </main>
    </div>
  );
}