/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        ffcm: {
          red: '#C8102E',
          'red-light': 'rgba(200, 16, 46, 0.12)',
          'red-glow': 'rgba(200, 16, 46, 0.35)',
          gold: '#DAA520',
          'gold-light': 'rgba(218, 165, 32, 0.15)',
          'gold-accent': '#D4AF37',
        },
        pablo: {
          blue: '#1f5fae',
          'blue-deep': '#173f78',
          aqua: '#69b7ca',
          coral: '#e06b59',
          papel: '#f4f1ea',
        }
      },
      fontFamily: {
        sans: ['DM Sans', 'sans-serif'],
      }
    },
  },
  plugins: [],
}
