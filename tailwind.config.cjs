/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './src/ui/index.html',
    './src/ui/src/**/*.{js,jsx,ts,tsx}'
  ],
  theme: {
    extend: {
      colors: {
        ink: '#0f172a',
        cloud: '#f8fafc',
        accent: '#2563eb',
        moss: '#16a34a',
        sand: '#e2e8f0'
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
        display: ['"Soehne"', 'Inter', 'system-ui', 'sans-serif']
      },
      boxShadow: {
        card: '0 10px 30px rgba(15, 23, 42, 0.08)'
      }
    }
  },
  plugins: []
};
