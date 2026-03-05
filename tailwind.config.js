/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['./src/**/*.{js,ts,jsx,tsx,mdx}'],
  theme: {
    extend: {
      colors: {
        'cartoosh': {
          900: '#0A0A1A',
          800: '#12122B',
          700: '#1A1A3E',
          600: '#252560',
          500: '#3B3B8F',
          400: '#6C6CFF',
          300: '#9D9DFF',
          200: '#C4C4FF',
          100: '#EDEDFF',
          50:  '#F6F6FF',
        },
        'accent': {
          coral: '#FF6B6B',
          gold: '#FFD93D',
          cyan: '#4ECDC4',
          violet: '#A855F7',
          pink: '#FF79C6',
        },
      },
      fontFamily: {
        display: ['Clash Display', 'system-ui', 'sans-serif'],
        body: ['Satoshi', 'system-ui', 'sans-serif'],
        mono: ['JetBrains Mono', 'monospace'],
      },
    },
  },
  plugins: [],
};
