/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{js,jsx,ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        'dream-black': '#000000',
        'dream-orange': '#ec7058',
        'dream-pink': '#e688af',
        'dream-dark-pink': '#b03e70',
        'dream-purple': '#9678d1',
        'dream-blue': '#889adc',
        'dream-dark-purple': '#871d78',
        'dream-pink-red': '#e34252',
      },
      fontFamily: {
        'sans': ['DM Sans', 'sans-serif'],
        'title': ['Lora', 'serif'],
      },
    },
  },
  plugins: [],
} 