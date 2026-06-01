/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      fontFamily: {
        sans: ["Inter", "system-ui", "sans-serif"],
        heading: ["Syne", "system-ui", "sans-serif"],
      },
      colors: {
        coral: "#e8614a",
        night: "#08080f",
      },
    },
  },
  plugins: [],
}

