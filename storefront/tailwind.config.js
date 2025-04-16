/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './app/**/*.{js,ts,jsx,tsx,mdx}',
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        'primary': {
          '50': '#f5f7ff',
          '100': '#ebeefe',
          '200': '#d8defd',
          '300': '#b8c4fb',
          '400': '#9aa5f8',
          '500': '#7c85f3',
          '600': '#6163e8',
          '700': '#5451d1',
          '800': '#4643a9',
          '900': '#3c3d85',
          '950': '#232252',
        },
      },
    },
  },
  plugins: [],
} 