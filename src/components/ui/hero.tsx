"use client"
import { useEffect, useRef, useState } from "react"
import { MeshGradient, PulsingBorder } from "@paper-design/shaders-react"
import { motion } from "framer-motion"

export default function ShaderShowcase() {
  const containerRef = useRef(null)
  const [isActive, setIsActive] = useState(false)

  useEffect(() => {
    const handleMouseEnter = () => setIsActive(true)
    const handleMouseLeave = () => setIsActive(false)

    const container = containerRef.current
    if (container) {
      container.addEventListener("mouseenter", handleMouseEnter)
      container.addEventListener("mouseleave", handleMouseLeave)
    }

    return () => {
      if (container) {
        container.removeEventListener("mouseenter", handleMouseEnter)
        container.removeEventListener("mouseleave", handleMouseLeave)
      }
    }
  }, [])

  return (
    <div className="relative min-h-screen w-full bg-black text-white overflow-hidden" ref={containerRef}>
      {/* Background Shader */}
      <div className="absolute inset-0 z-0">
        <MeshGradient
          animate={isActive}
          className="w-full h-full"
          colors={["#111111", "#222222", "#333333"]}
          speed={0.005}
        />
      </div>

      {/* Content Container */}
      <div className="relative z-10 container mx-auto px-4 py-24 flex flex-col items-center">
        {/* Decorative Elements */}
        <div className="absolute inset-0 overflow-hidden">
          {[...Array(6)].map((_, i) => (
            <motion.div
              key={i}
              className="absolute w-64 h-64 rounded-full opacity-20"
              style={{
                background: `radial-gradient(circle, rgba(255,255,255,0.1) 0%, rgba(255,255,255,0) 70%)`,
                top: `${Math.random() * 100}%`,
                left: `${Math.random() * 100}%`,
                transform: "translate(-50%, -50%)"
              }}
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ 
                scale: isActive ? [0.8, 1.2, 1] : 0.8, 
                opacity: isActive ? 0.2 : 0.1 
              }}
              transition={{ 
                duration: 2 + i * 0.5, 
                repeat: Infinity, 
                repeatType: "reverse" 
              }}
            />
          ))}
        </div>

        {/* Navigation */}
        <nav className="w-full max-w-4xl flex justify-between items-center mb-24">
          <div className="flex space-x-8">
            <a href="#features" className="text-sm hover:text-blue-400 transition-colors">Features</a>
            <a href="#pricing" className="text-sm hover:text-blue-400 transition-colors">Pricing</a>
            <a href="#docs" className="text-sm hover:text-blue-400 transition-colors">Docs</a>
          </div>
          
          {/* Login Button Group with Arrow */}
          <div className="relative">
            <PulsingBorder
              active={isActive}
              color="#3b82f6"
              width={2}
              className="rounded-full"
            >
              <a href="/login" className="px-6 py-2 rounded-full flex items-center space-x-2 bg-black/50 backdrop-blur-sm">
                <span>Login</span>
                <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M3.33337 8H12.6667" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                  <path d="M8 3.33337L12.6667 8.00004L8 12.6667" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </a>
            </PulsingBorder>
          </div>
        </nav>

        {/* Badge */}
        <motion.div 
          className="mb-8 px-4 py-2 bg-gradient-to-r from-blue-600/20 to-purple-600/20 rounded-full backdrop-blur-sm"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <span className="text-xs font-medium flex items-center">
            <span className="mr-2">✨</span>
            New Paper Shaders Experience
          </span>
        </motion.div>

        {/* Main Heading */}
        <motion.h1 
          className="text-5xl md:text-7xl font-bold text-center mb-8 bg-clip-text text-transparent bg-gradient-to-r from-white to-gray-400"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
        >
          Beautiful Shader <br /> Experiences
        </motion.h1>

        {/* Description */}
        <motion.p 
          className="text-lg text-center max-w-2xl text-gray-300 mb-12"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
        >
          Create stunning visual experiences with our advanced shader technology. Interactive lighting, smooth animations, and beautiful effects that respond to your every move.
        </motion.p>

        {/* CTA Buttons */}
        <motion.div 
          className="flex flex-col sm:flex-row gap-4"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.8 }}
        >
          <PulsingBorder
            active={isActive}
            color="#3b82f6"
            width={2}
            className="rounded-full"
          >
            <button className="px-8 py-3 rounded-full bg-blue-600 text-white font-medium">
              Get Started
            </button>
          </PulsingBorder>
          
          <button className="px-8 py-3 rounded-full border border-gray-700 hover:border-gray-500 transition-colors">
            View Demo
          </button>
        </motion.div>
      </div>
    </div>
  )
}
