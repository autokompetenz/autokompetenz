export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        red:    { DEFAULT: '#C8102E', dark: '#9B0B22', light: '#E8294A' },
        dark:   { DEFAULT: '#111112', 2: '#18181A', 3: '#222224' },
        chrome: { DEFAULT: '#F0F0F0', dim: '#8A8A90' },
        surface:'#2A2A2D',
      },
      fontFamily: {
        sans:  ['Outfit', 'sans-serif'],
        serif: ['"Playfair Display"', 'serif'],
      },
    },
  },
  plugins: [],
};
