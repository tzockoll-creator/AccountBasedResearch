/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        // Strategy brand colors
        'strategy-red': '#C41E3A',
        'strategy-dark': '#1a1a2e',
      }
    },
  },
  plugins: [],
}
