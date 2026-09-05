/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx}",
    "./components/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        cream: "#F7F4EF",
        card: "#F2EEE7",
        ink: "#26313F",
        burgundy: {
          DEFAULT: "#7A1E28",
          dark: "#5E161E",
        },
        gold: "#C9A24B",
      },
      fontFamily: {
        display: ["var(--font-display)", "serif"],
        sans: ["var(--font-sans)", "sans-serif"],
      },
    },
  },
  plugins: [],
};
