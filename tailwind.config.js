/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        'spotify-green': '#1DB954',
        'spotify-dark': '#0b0b0b',
        'spotify-black': '#000000',
        'glass-white': 'rgba(255, 255, 255, 0.05)',
        'glass-white-strong': 'rgba(255, 255, 255, 0.1)',
        'glass-black': 'rgba(0, 0, 0, 0.6)',
        'glass-border': 'rgba(255, 255, 255, 0.12)',
        'accent-green': '#1ed760',
      },
      backgroundImage: {
        'liquid-mesh': 'radial-gradient(at 0% 0%, rgba(29, 185, 84, 0.15) 0, transparent 50%), radial-gradient(at 50% 0%, rgba(0, 217, 255, 0.1) 0, transparent 50%), radial-gradient(at 100% 0%, rgba(138, 43, 226, 0.1) 0, transparent 50%)',
        'glass-gradient': 'linear-gradient(180deg, rgba(255, 255, 255, 0.1) 0%, rgba(255, 255, 255, 0.02) 100%)',
        'glass-shine': 'linear-gradient(135deg, rgba(255, 255, 255, 0.15) 0%, rgba(255, 255, 255, 0) 40%, rgba(255, 255, 255, 0) 60%, rgba(255, 255, 255, 0.15) 100%)',
      },
      backdropBlur: {
        'xs': '2px',
        'sm': '4px',
        'md': '12px',
        'lg': '24px',
        'xl': '40px',
        '2xl': '64px',
        '3xl': '100px',
      },
      animation: {
        'liquid-slow': 'liquid-move 25s ease-in-out infinite alternate',
        'glass-shine': 'glass-shine 3s ease-in-out infinite',
        'float': 'float 8s ease-in-out infinite',
        'pulse-soft': 'pulse-soft 4s ease-in-out infinite',
      },
      keyframes: {
        'liquid-move': {
          '0%': { transform: 'translate(0, 0) scale(1)' },
          '33%': { transform: 'translate(5%, 5%) scale(1.1)' },
          '66%': { transform: 'translate(-5%, 10%) scale(0.95)' },
          '100%': { transform: 'translate(0, 0) scale(1)' },
        },
        'glass-shine': {
          '0%': { backgroundPosition: '-200% 0' },
          '100%': { backgroundPosition: '200% 0' },
        },
        float: {
          '0%, 100%': { transform: 'translateY(0) rotate(0deg)' },
          '50%': { transform: 'translateY(-15px) rotate(1deg)' },
        },
        'pulse-soft': {
          '0%, 100%': { opacity: 0.4, scale: 1 },
          '50%': { opacity: 0.6, scale: 1.05 },
        }
      },
      boxShadow: {
      }
    },
  },
  plugins: [],
}
