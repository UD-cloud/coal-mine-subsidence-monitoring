/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,jsx}"],
  theme: {
    extend: {
      colors: {
        ink: "#07110f",
        panel: "#0b1815",
        mint: "#8ff0c0",
        lime: "#c9f46a"
      },
      boxShadow: {
        glow: "0 0 40px rgba(143,240,192,.12)"
      }
    }
  },
  plugins: []
};