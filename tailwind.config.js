/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        aura: {
          bg: '#0a0a0f',
          surface: '#12121a',
          surfaceHover: '#1c1c28',
          card: '#161622',
          border: 'rgba(255, 255, 255, 0.08)',
          accent: '#8b5cf6',
          accentGlow: 'rgba(139, 92, 246, 0.35)',
          neonPink: '#ec4899',
          neonCyan: '#06b6d4',
          subtext: '#9ca3af',
        },
      },
      fontFamily: {
        sans: [
          '-apple-system',
          'BlinkMacSystemFont',
          '"SF Pro Display"',
          '"Segoe UI"',
          'Roboto',
          'sans-serif',
        ],
      },
      animation: {
        'pulse-slow': 'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'glow-spin': 'spin 12s linear infinite',
      },
      boxShadow: {
        'neon': '0 0 25px -5px rgba(139, 92, 246, 0.5)',
        'glass': '0 8px 32px 0 rgba(0, 0, 0, 0.37)',
      },
      backdropBlur: {
        'xs': '2px',
      },
    },
  },
  plugins: [],
};
