/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{html,ts,scss,css}",
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: "#328E6E",
          light: "#67AE6E",
          lighter: "#90C67C",
          pale: "#E1EEBC"
        }
      }
    },
  },
  plugins: [],
}