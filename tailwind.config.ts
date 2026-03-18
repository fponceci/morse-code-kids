import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        background: "var(--background)",
        foreground: "var(--foreground)",
        morse: {
          purple: { DEFAULT: '#7C3AED', light: '#A78BFA', dark: '#5B21B6' },
          yellow: { DEFAULT: '#F59E0B', light: '#FCD34D', dark: '#D97706' },
          teal:   { DEFAULT: '#0D9488', light: '#5EEAD4', dark: '#0F766E' },
          coral:  { DEFAULT: '#F43F5E', light: '#FB7185', dark: '#E11D48' },
          navy:   '#1E1B4B',
          cream:  '#FFF7ED',
        },
      },
      fontFamily: {
        rounded: ['Nunito', 'system-ui', 'sans-serif'],
      },
      keyframes: {
        'bounce-slow': {
          '0%, 100%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(-12px)' },
        },
        'pulse-glow': {
          '0%, 100%': { opacity: '1', transform: 'scale(1)' },
          '50%': { opacity: '0.8', transform: 'scale(1.08)' },
        },
        'slide-ticker': {
          '0%': { transform: 'translateX(100%)' },
          '100%': { transform: 'translateX(-100%)' },
        },
      },
      animation: {
        'bounce-slow': 'bounce-slow 2s ease-in-out infinite',
        'pulse-glow': 'pulse-glow 1.5s ease-in-out infinite',
        'slide-ticker': 'slide-ticker 12s linear infinite',
      },
    },
  },
  plugins: [],
};
export default config;
