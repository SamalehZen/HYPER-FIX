"use client";
import React, { ReactNode } from "react";
import { Navigation } from "./Navigation";

interface LayoutProps {
  children: ReactNode;
  currentPage?: string;
  showNavigation?: boolean;
}

export function Layout({ children, currentPage = "home", showNavigation = true }: LayoutProps) {
  return (
    <div className="min-h-screen bg-gradient-to-br from-[#1a1d18] via-black to-[#2a2e26]">
      {showNavigation && <Navigation currentPage={currentPage} />}
      <main className={showNavigation ? "pt-16" : ""}>
        {children}
      </main>
    </div>
  );
}