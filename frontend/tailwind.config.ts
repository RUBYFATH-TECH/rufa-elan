import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx}",
    "./components/**/*.{js,ts,jsx,tsx}",
    "./lib/**/*.{js,ts,jsx,tsx}",
    "!./backend/**/*"
  ],
  theme: {
    extend: {
      colors: {
        brand: {
          50: "#eef2ff",
          100: "#e0e7ff",
          200: "#c7d2fe",
          300: "#a5b4fc",
          400: "#818cf8",
          500: "#4f46e5",
          600: "#4338ca",
          700: "#3730a3",
          800: "#312e81",
          900: "#1e1b4b"
        },
        temu: {
          orange: "#E65100",        // Custom orange for RUFA ELAN
          "orange-dark": "#D84315", // Darker variant for hover states
          dark: "#2E2E2E",          // Dark neutrals for contrast
          "dark-light": "#424242",  // Slightly lighter dark
          gray: "#FAFAFA",          // Light background
          "gray-light": "#F5F5F5"   // Even lighter background
        },
        rufaelan: {
          primary: "#E65100",       // Main brand color
          "primary-dark": "#D84315", // Dark variant
          secondary: "#FF8F65",     // Light orange
          accent: "#FFF3E0",        // Very light orange
          dark: "#2E2E2E",
          "dark-light": "#424242",
          gray: "#FAFAFA",
          "gray-light": "#F5F5F5"
        }
      },
      boxShadow: {
        soft: "0 10px 30px rgba(15, 23, 42, 0.08)"
      },
      animation: {
        blob: "blob 7s infinite",
      },
      keyframes: {
        blob: {
          "0%, 100%": {
            transform: "translate(0, 0) scale(1)",
          },
          "33%": {
            transform: "translate(30px, -50px) scale(1.1)",
          },
          "66%": {
            transform: "translate(-20px, 20px) scale(0.9)",
          },
        },
      }
    }
  },
  plugins: []
};

export default config;
