export default {
  darkMode: 'class',
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      boxShadow: {
        soft: '0 28px 60px rgba(15, 23, 42, 0.08)',
      },
      colors: {
        brand: {
          DEFAULT: '#3B82F6',
          sky: '#38BDF8',
          violet: '#7C3AED',
        },
      },
      borderRadius: {
        '4xl': '2rem',
      },
    },
  },
  plugins: [],
}
