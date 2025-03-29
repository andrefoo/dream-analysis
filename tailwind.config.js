/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{js,jsx,ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        'dream-orange': '#ec7058',
        'dream-pink': '#e688af',
        'dream-dark-pink': '#b03e70',
        'dream-purple': '#9678d1',
        'dream-blue': '#889adc',
      },
    },
  },
  plugins: [],
} 