/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: "class",
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./lib/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ["var(--font-geist-sans)", "ui-sans-serif", "system-ui", "sans-serif"],
        mono: ["var(--font-geist-mono)", "ui-monospace", "monospace"],
      },
      colors: {
        brand: {
          50:  "#f5f3ff",
          100: "#ede9fe",
          200: "#ddd6fe",
          300: "#c4b5fd",
          400: "#a78bfa",
          500: "#8b5cf6",
          600: "#7c3aed",
          700: "#6d28d9",
          800: "#5b21b6",
          900: "#4c1d95",
          950: "#2e1065",
        },
        accent: {
          50:  "#eff6ff",
          400: "#60a5fa",
          500: "#3b82f6",
          600: "#2563eb",
        },
      },
      keyframes: {
        "fade-in": {
          from: { opacity: "0" },
          to:   { opacity: "1" },
        },
        "slide-up": {
          from: { transform: "translateY(24px)", opacity: "0" },
          to:   { transform: "translateY(0)",    opacity: "1" },
        },
        "slide-down": {
          from: { transform: "translateY(-12px)", opacity: "0" },
          to:   { transform: "translateY(0)",     opacity: "1" },
        },
        float: {
          "0%, 100%": { transform: "translateY(0px)" },
          "50%":      { transform: "translateY(-14px)" },
        },
        shimmer: {
          "0%":   { transform: "translateX(-100%)" },
          "100%": { transform: "translateX(100%)" },
        },
        "spin-slow": {
          from: { transform: "rotate(0deg)" },
          to:   { transform: "rotate(360deg)" },
        },
      },
      animation: {
        "fade-in":   "fade-in 0.5s ease-out both",
        "slide-up":  "slide-up 0.6s ease-out both",
        "slide-down":"slide-down 0.3s ease-out both",
        float:       "float 4s ease-in-out infinite",
        shimmer:     "shimmer 2s linear infinite",
        "spin-slow": "spin-slow 8s linear infinite",
      },
      boxShadow: {
        card:       "0 1px 2px rgba(0,0,0,0.04), 0 4px 16px rgba(0,0,0,0.06)",
        "card-hover":"0 4px 6px rgba(0,0,0,0.04), 0 16px 40px rgba(0,0,0,0.10)",
        glow:       "0 0 30px rgba(124,58,237,0.35)",
        "glow-blue":"0 0 30px rgba(59,130,246,0.35)",
      },
      borderRadius: {
        DEFAULT: "0.75rem",
      },
    },
  },
  plugins: [require("tailwindcss-animate")],
};
