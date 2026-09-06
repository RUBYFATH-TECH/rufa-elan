import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx}",
    "./components/**/*.{js,ts,jsx,tsx}",
    "./lib/**/*.{js,ts,jsx,tsx}"
  ],
  theme: {
    extend: {
      colors: {
        brand: {
          50: "#fef7ee",
          100: "#fdeedd",
          200: "#fbdabb",
          300: "#f8c088",
          400: "#f4a154",
          500: "#f1863f",
          600: "#e26d1a",
          700: "#bb5617",
          800: "#954419",
          900: "#793a17"
        },
        rose: {
          50: "#fff1f2",
          100: "#ffe4e6",
          200: "#fecdd3",
          300: "#fda4af",
          400: "#fb7185",
          500: "#f43f5e",
          600: "#e11d48",
          700: "#be185d",
          800: "#9f1239",
          900: "#881337"
        },
        pink: {
          50: "#fdf2f8",
          100: "#fce7f3",
          200: "#fbcfe8",
          300: "#f9a8d4",
          400: "#f472b6",
          500: "#ec4899",
          600: "#db2777",
          700: "#be185d",
          800: "#9d174d",
          900: "#831843"
        }
      },
      fontFamily: {
        'sans': ['Inter', 'ui-sans-serif', 'system-ui'],
        'serif': ['Playfair Display', 'serif']
      },
      boxShadow: {
        'soft': '0 10px 40px rgba(0, 0, 0, 0.1)',
        'medium': '0 20px 50px rgba(0, 0, 0, 0.15)',
        'strong': '0 30px 60px rgba(0, 0, 0, 0.2)',
        'colored': '0 20px 40px rgba(244, 63, 94, 0.2)',
        'glow': '0 0 40px rgba(244, 63, 94, 0.3)'
      },
      animation: {
        'fade-in-up': 'fadeInUp 0.6s ease-out forwards',
        'fade-in-down': 'fadeInDown 0.6s ease-out forwards', 
        'slide-in-right': 'slideInRight 0.6s ease-out forwards',
        'slide-in-left': 'slideInLeft 0.6s ease-out forwards',
        'scale-in': 'scaleIn 0.6s ease-out forwards',
        'float': 'float 6s ease-in-out infinite',
        'pulse-slow': 'pulse-slow 3s ease-in-out infinite',
        'shimmer': 'shimmer 2s infinite',
        'gradient': 'gradient-shift 3s ease infinite'
      },
      backdropBlur: {
        xs: '2px'
      },
      spacing: {
        '18': '4.5rem',
        '88': '22rem',
        '128': '32rem'
      }
    }
  },
  plugins: []
};

export default config;
