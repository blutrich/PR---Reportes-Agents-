/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        cream: {
          50: '#FAF7F2',
          100: '#F3EEE4',
          200: '#ECE5D6',
          300: '#D9D1BF',
        },
        ink: {
          DEFAULT: '#1A1815',
          light: '#4A4640',
          muted: '#8A857D',
        },
        accent: {
          DEFAULT: '#C2453B',
          light: '#D4665E',
          dark: '#A33830',
        },
        success: '#3B7A57',
        warning: '#D4A017',
      },
      fontFamily: {
        serif: ['Georgia', 'Cambria', '"Times New Roman"', 'serif'],
        sans: ['-apple-system', 'BlinkMacSystemFont', '"Segoe UI"', 'Roboto', 'sans-serif'],
      },
    },
  },
  plugins: [],
}
