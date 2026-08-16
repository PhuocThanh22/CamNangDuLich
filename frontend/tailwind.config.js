/** @type {import('tailwindcss').Config} */
export default {
  darkMode: 'class',
  content: ['./src/**/*.{js,ts,jsx,tsx,mdx}'],
  theme: {
    extend: {
      fontFamily: {
        sans: ['"Plus Jakarta Sans"', 'sans-serif'],
      },
      colors: {
        brand: '#4299e1',
        brandDeep: '#3182ce',
        textDark: '#1a202c',
        textMuted: '#718096',
        accentOrange: '#ed8936',
        accentGreen: '#38a169',
        skyLight: '#ebf8ff',
      },
      boxShadow: {
        soft: '0 2px 6px rgba(0,0,0,0.05)',
        card: '0 4px 20px rgba(0,0,0,0.08)',
        hero: '0 16px 48px rgba(0,0,0,0.4)',
      },
      borderRadius: {
        '4xl': '2rem',
      },
    },
  },
  plugins: [],
};
