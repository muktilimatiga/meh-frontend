/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
    "./components/**/*.{js,ts,jsx,tsx}",
    "./routes/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'class', // This fixes the theme switcher
  theme: {
    extend: {
      fontFamily: {
        sans: ['Inter', 'sans-serif'],
      },
      colors: {
        border: "var(--border)",
        background: "var(--background)",
        
        // Prime Pay Inspired Palette
        navy: {
          DEFAULT: '#343C6A', 
          light: '#5F6D96',
          dark: '#000000',    
        },
        slateBlue: {
          DEFAULT: '#718EBF', 
          light: '#8BA3C7',
          dark: '#A1A1AA'     
        },
        beige: {
          DEFAULT: '#DFEAF2', 
          light: '#EDF3F7',
          dark: '#27272A'     
        },
        cream: {
          DEFAULT: '#F5F7FA', 
          dark: '#000000'     
        },
        primary: {
          DEFAULT: '#2D60FF', 
          foreground: '#FFFFFF',
          glow: 'rgba(45, 96, 255, 0.5)'
        },
        main: '#F5F7FA',    
        card: '#FFFFFF',
        slate: {
          50: '#F8F9FD',
          100: '#F1F3F7',
          200: '#DFEAF2',
          300: '#CAD7E2',
          400: '#B1C1D2',
          500: '#718EBF',
          600: '#5A75A0',
          700: '#343C6A', 
          800: '#27272A', 
          900: '#18181B', 
          950: '#000000', 
        }
      },
      borderRadius: {
        'xl': '1rem',
        '2xl': '1.5rem',
        '3xl': '2rem',
      },
      boxShadow: {
        'soft': '0 4px 25px 0px rgba(0, 0, 0, 0.03)',
        'card': '0 2px 10px rgba(0,0,0,0.02)',
        'glow': '0 0 20px -5px rgba(45, 96, 255, 0.4)',
      }
    }
  },
  plugins: [],
}