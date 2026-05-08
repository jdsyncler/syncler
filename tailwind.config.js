/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        background: '#000000',
        surface: '#121212',
        'surface-highlight': '#1e1e1e',
        primary: '#1DB954',
        accent: '#ffffff',
      },
      animation: {
        'glow': 'glow 2s ease-in-out infinite alternate',
      },
      keyframes: {
        glow: {
          '0%': { boxShadow: '0 0 5px rgba(29, 185, 84, 0.2)' },
          '100%': { boxShadow: '0 0 20px rgba(29, 185, 84, 0.6)' },
        }
      }
    },
  },
  plugins: [],
}
