import {heroui} from '@heroui/theme';
/** @type {import('tailwindcss').Config} */
const config = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx}",
    "./components/**/*.{js,ts,jsx,tsx}",
    "./node_modules/@heroui/theme/dist/components/(progress|spinner).js"
  ],
  theme: {
    extend: {
      backdropBlur: {
        xs: '2px',
      },
      colors: {
        glass: 'rgba(255, 255, 255, 0.1)',
        borderGlass: 'rgba(255, 255, 255, 0.2)',
      }
    },
  },
  plugins: [heroui()],
};

export default config;
