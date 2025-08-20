import React from "react";
import { Layout } from "../components/layout/Layout";
import DemoOne from "@/components/DemoOne";

export default function HeroTemplatePage() {
  return (
    <Layout currentPage="hero-template">
      {/* Display the new Hero Template */}
      <DemoOne />
      
      {/* Additional content could be added below the hero if needed */}
      <div className="container mx-auto py-12 px-4">
        <h2 className="text-3xl font-bold text-center mb-8">Hero Template Showcase</h2>
        <p className="text-lg text-center max-w-3xl mx-auto">
          This page demonstrates the new shader-based hero template with interactive animations and beautiful visual effects.
        </p>
      </div>
    </Layout>
  );
}
