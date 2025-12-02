/** @type {import('tailwindcss').Config} */

const brandCore = {
  deep: '#0d3e51',
  base: '#2f8981',
  lift: '#67b999'
};

const brandScale = {
  950: '#041318',
  900: brandCore.deep,
  800: '#144d5b',
  700: '#1b5c64',
  600: brandCore.base,
  500: '#59a19a',
  400: '#82b8b3',
  300: '#a4d5c2',
  200: '#c2e3d6',
  100: '#e1f1eb',
  50: '#f0f8f5'
};

module.exports = {
  content: [
    './src/ui/index.html',
    './src/ui/src/**/*.{js,jsx,ts,tsx}'
  ],
  theme: {
    extend: {
      colors: {
        brand: brandScale,
        ink: brandCore.deep,
        'ink-soft': '#3d6574',
        'ink-subtle': '#6e8b97',
        accent: brandCore.base,
        moss: brandCore.lift,
        cloud: brandScale[50],
        mist: '#e1f1eb',
        sand: '#d5e7e6',
        foam: '#a4d5c2',
        tide: '#82b8b3'
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
        display: ['"Soehne"', 'Inter', 'system-ui', 'sans-serif']
      },
      boxShadow: {
        card: '0 10px 30px rgba(13, 62, 81, 0.12)'
      }
    }
  },
  plugins: []
};
