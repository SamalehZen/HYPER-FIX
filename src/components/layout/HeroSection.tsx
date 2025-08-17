"use client";
import React, { useEffect, useRef, ReactNode } from "react";
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

interface HeroSectionProps {
  title?: string;
  subtitle?: string;
  description?: string;
  children?: ReactNode;
  showBackground?: boolean;
  compact?: boolean;
}

export function HeroSection({
  title,
  subtitle,
  description,
  children,
  showBackground = true,
  compact = false
}: HeroSectionProps) {
  const { theme } = useTheme();
  const gradientRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Animate words
    const words = document.querySelectorAll<HTMLElement>(".word");
    words.forEach((word) => {
      const delay = parseInt(word.getAttribute("data-delay") || "0", 10);
      setTimeout(() => {
        word.style.animation = "word-appear 0.8s ease-out forwards";
      }, delay);
    });

    // Mouse gradient
    const gradient = gradientRef.current;
    function onMouseMove(e: MouseEvent) {
      if (gradient) {
        gradient.style.left = e.clientX - 192 + "px";
        gradient.style.top = e.clientY - 192 + "px";
        gradient.style.opacity = "1";
      }
    }
    function onMouseLeave() {
      if (gradient) gradient.style.opacity = "0";
    }
    document.addEventListener("mousemove", onMouseMove);
    document.addEventListener("mouseleave", onMouseLeave);

    // Word hover effects
    words.forEach((word) => {
      word.addEventListener("mouseenter", () => {
        word.style.textShadow = theme === 'dark'
          ? "0 0 20px rgba(200, 180, 160, 0.5)"
          : "0 0 20px rgba(26, 29, 24, 0.5)";
      });
      word.addEventListener("mouseleave", () => {
        word.style.textShadow = "none";
      });
    });

    // Click ripple effect
    function onClick(e: MouseEvent) {
      const ripple = document.createElement("div");
      ripple.style.position = "fixed";
      ripple.style.left = e.clientX + "px";
      ripple.style.top = e.clientY + "px";
      ripple.style.width = "4px";
      ripple.style.height = "4px";
      ripple.style.background = theme === 'dark'
        ? "rgba(200, 180, 160, 0.6)"
        : "rgba(26, 29, 24, 0.6)";
      ripple.style.borderRadius = "50%";
      ripple.style.transform = "translate(-50%, -50%)";
      ripple.style.pointerEvents = "none";
      ripple.style.animation = "pulse-glow 1s ease-out forwards";
      document.body.appendChild(ripple);
      setTimeout(() => ripple.remove(), 1000);
    }
    document.addEventListener("click", onClick);

    // Floating elements on scroll
    let scrolled = false;
    function onScroll() {
      if (!scrolled) {
        scrolled = true;
        document.querySelectorAll<HTMLElement>(".floating-element").forEach((el, index) => {
          setTimeout(() => {
            el.style.animationPlayState = "running";
          }, index * 200);
        });
      }
    }
    window.addEventListener("scroll", onScroll);

    return () => {
      document.removeEventListener("mousemove", onMouseMove);
      document.removeEventListener("mouseleave", onMouseLeave);
      document.removeEventListener("click", onClick);
      window.removeEventListener("scroll", onScroll);
    };
  }, []);

  const backgroundClass = theme === 'dark'
    ? "bg-gradient-to-br from-[#1a1d18] via-black to-[#2a2e26]"
    : "bg-gradient-to-br from-[#f8f7f5] via-[#e6e1d7] to-[#c8b4a0]";
    
  const textColorClass = theme === 'dark' ? "text-[#e6e1d7]" : "text-[#1a1d18]";

  return (
    <div
      className={`${compact ? 'min-h-[60vh]' : ''} ${backgroundClass} ${textColorClass} font-primary overflow-hidden relative w-full`}
    >
      {/* Background Grid */}
      {showBackground && (
        <>
          <svg className="absolute inset-0 w-full h-full" xmlns="http://www.w3.org/2000/svg">
            <defs>
              <pattern id="grid" width="60" height="60" patternUnits="userSpaceOnUse">
                <path
                  d="M 60 0 L 0 0 0 60"
                  fill="none"
                  stroke={theme === 'dark' ? "rgba(200,180,160,0.08)" : "rgba(26,29,24,0.08)"}
                  strokeWidth="0.5"
                />
              </pattern>
            </defs>
            <rect width="100%" height="100%" fill="url(#grid)" />
            
            {/* Animated grid lines */}
            <line
              x1="0" y1="20%" x2="100%" y2="20%"
              className="grid-line"
              style={{
                animationDelay: "0.5s",
                stroke: theme === 'dark' ? "rgba(200, 180, 160, 0.15)" : "rgba(26, 29, 24, 0.15)"
              }}
            />
            <line
              x1="0" y1="80%" x2="100%" y2="80%"
              className="grid-line"
              style={{
                animationDelay: "1s",
                stroke: theme === 'dark' ? "rgba(200, 180, 160, 0.15)" : "rgba(26, 29, 24, 0.15)"
              }}
            />
            <line
              x1="20%" y1="0" x2="20%" y2="100%"
              className="grid-line"
              style={{
                animationDelay: "1.5s",
                stroke: theme === 'dark' ? "rgba(200, 180, 160, 0.15)" : "rgba(26, 29, 24, 0.15)"
              }}
            />
            <line
              x1="80%" y1="0" x2="80%" y2="100%"
              className="grid-line"
              style={{
                animationDelay: "2s",
                stroke: theme === 'dark' ? "rgba(200, 180, 160, 0.15)" : "rgba(26, 29, 24, 0.15)"
              }}
            />
            
            {/* Center lines */}
            <line
              x1="50%"
              y1="0"
              x2="50%"
              y2="100%"
              className="grid-line"
              style={{
                animationDelay: "2.5s",
                opacity: 0.05,
                stroke: theme === 'dark' ? "rgba(200, 180, 160, 0.15)" : "rgba(26, 29, 24, 0.15)"
              }}
            />
            <line
              x1="0"
              y1="50%"
              x2="100%"
              y2="50%"
              className="grid-line"
              style={{
                animationDelay: "3s",
                opacity: 0.05,
                stroke: theme === 'dark' ? "rgba(200, 180, 160, 0.15)" : "rgba(26, 29, 24, 0.15)"
              }}
            />
            
            {/* Corner dots */}
            <circle
              cx="20%" cy="20%" r="2"
              className="detail-dot"
              style={{
                animationDelay: "3s",
                fill: theme === 'dark' ? "rgba(200, 180, 160, 0.4)" : "rgba(26, 29, 24, 0.4)"
              }}
            />
            <circle
              cx="80%" cy="20%" r="2"
              className="detail-dot"
              style={{
                animationDelay: "3.2s",
                fill: theme === 'dark' ? "rgba(200, 180, 160, 0.4)" : "rgba(26, 29, 24, 0.4)"
              }}
            />
            <circle
              cx="20%" cy="80%" r="2"
              className="detail-dot"
              style={{
                animationDelay: "3.4s",
                fill: theme === 'dark' ? "rgba(200, 180, 160, 0.4)" : "rgba(26, 29, 24, 0.4)"
              }}
            />
            <circle
              cx="80%" cy="80%" r="2"
              className="detail-dot"
              style={{
                animationDelay: "3.6s",
                fill: theme === 'dark' ? "rgba(200, 180, 160, 0.4)" : "rgba(26, 29, 24, 0.4)"
              }}
            />
            <circle
              cx="50%" cy="50%" r="1.5"
              className="detail-dot"
              style={{
                animationDelay: "4s",
                fill: theme === 'dark' ? "rgba(200, 180, 160, 0.4)" : "rgba(26, 29, 24, 0.4)"
              }}
            />
          </svg>

          {/* Corner elements */}
          <div className="corner-element top-8 left-8" style={{ animationDelay: "4s" }}>
            <div
              className="absolute top-0 left-0 w-2 h-2 opacity-30"
              style={{ background: theme === 'dark' ? colors[200] : colors[700] }}
            ></div>
          </div>
          <div className="corner-element top-8 right-8" style={{ animationDelay: "4.2s" }}>
            <div
              className="absolute top-0 right-0 w-2 h-2 opacity-30"
              style={{ background: theme === 'dark' ? colors[200] : colors[700] }}
            ></div>
          </div>
          <div className="corner-element bottom-8 left-8" style={{ animationDelay: "4.4s" }}>
            <div
              className="absolute bottom-0 left-0 w-2 h-2 opacity-30"
              style={{ background: theme === 'dark' ? colors[200] : colors[700] }}
            ></div>
          </div>
          <div className="corner-element bottom-8 right-8" style={{ animationDelay: "4.6s" }}>
            <div
              className="absolute bottom-0 right-0 w-2 h-2 opacity-30"
              style={{ background: theme === 'dark' ? colors[200] : colors[700] }}
            ></div>
          </div>

          {/* Floating elements */}
          <div
            className="floating-element"
            style={{
              top: "25%",
              left: "15%",
              animationDelay: "5s",
              background: theme === 'dark' ? "rgba(200, 180, 160, 0.2)" : "rgba(26, 29, 24, 0.2)"
            }}
          ></div>
          <div
            className="floating-element"
            style={{
              top: "60%",
              left: "85%",
              animationDelay: "5.5s",
              background: theme === 'dark' ? "rgba(200, 180, 160, 0.2)" : "rgba(26, 29, 24, 0.2)"
            }}
          ></div>
          <div
            className="floating-element"
            style={{
              top: "40%",
              left: "10%",
              animationDelay: "6s",
              background: theme === 'dark' ? "rgba(200, 180, 160, 0.2)" : "rgba(26, 29, 24, 0.2)"
            }}
          ></div>
          <div
            className="floating-element"
            style={{
              top: "75%",
              left: "90%",
              animationDelay: "6.5s",
              background: theme === 'dark' ? "rgba(200, 180, 160, 0.2)" : "rgba(26, 29, 24, 0.2)"
            }}
          ></div>
        </>
      )}

      <div className={`relative z-10 ${compact ? 'min-h-[60vh]' : ''} flex flex-col justify-center items-center px-8 py-12 md:px-16 ${compact ? 'md:py-16' : 'md:py-20'}`}>
        <div className="text-center max-w-5xl mx-auto">
          {subtitle && (
            <div className="mb-8">
              <h2
                className="text-xs md:text-sm font-mono font-light uppercase tracking-[0.2em] opacity-80"
                style={{ color: theme === 'dark' ? colors[200] : colors[700] }}
              >
                <span className="word" data-delay="0">
                  {subtitle}
                </span>
              </h2>
              <div
                className="mt-4 w-16 h-px opacity-30 mx-auto"
                style={{
                  background: theme === 'dark'
                    ? `linear-gradient(to right, transparent, ${colors[200]}, transparent)`
                    : `linear-gradient(to right, transparent, ${colors[700]}, transparent)`,
                }}
              ></div>
            </div>
          )}

          {title && (
            <div className="mb-8">
              <h1
                className={`${compact ? 'text-2xl md:text-4xl lg:text-5xl' : 'text-3xl md:text-5xl lg:text-6xl'} font-extralight leading-tight tracking-tight`}
                style={{ color: theme === 'dark' ? colors[50] : colors[900] }}
              >
                <span className="word" data-delay="200">
                  {title}
                </span>
              </h1>
            </div>
          )}

          {description && (
            <div className="mb-8">
              <p
                className={`${compact ? 'text-base md:text-lg' : 'text-lg md:text-xl'} font-light leading-relaxed max-w-3xl mx-auto`}
                style={{ color: theme === 'dark' ? colors[200] : colors[700] }}
              >
                <span className="word" data-delay="400">
                  {description}
                </span>
              </p>
            </div>
          )}

          {children && (
            <div className="mt-8">
              {children}
            </div>
          )}
        </div>
      </div>

      <div
        id="mouse-gradient"
        ref={gradientRef}
        className="fixed pointer-events-none w-96 h-96 rounded-full blur-3xl transition-all duration-500 ease-out opacity-0"
        style={{
          background: theme === 'dark'
            ? `radial-gradient(circle, ${colors[500]}0D 0%, transparent 100%)`
            : `radial-gradient(circle, ${colors[200]}0D 0%, transparent 100%)`,
        }}
      ></div>
    </div>
  );
}