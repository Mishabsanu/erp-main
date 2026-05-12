/** @type {import('tailwindcss').Config} */
const config = {
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
    './src/**/*.{js,ts,jsx,tsx,mdx}', // Added to ensure all src files are scanned
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: '#0f766e',
          light: '#14b8a6',
          dark: '#134e4a',
        },
        secondary: '#0ea5e9',
        accent: '#f59e0b',
        background: '#f8fafc',
        text: {
          main: '#1e293b',
          muted: '#64748b',
        },
      },
      backgroundImage: {
        'gradient-radial': 'radial-gradient(var(--tw-gradient-stops))',
        'gradient-conic':
          'conic-gradient(from 180deg at 50% 50%, var(--tw-gradient-stops))',
      },
    },
  },
  plugins: [],
};
module.exports = config;
