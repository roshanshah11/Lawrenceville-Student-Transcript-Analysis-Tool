/** @type {import('tailwindcss').Config} */
// tailwind.config.js
module.exports = {
  content: ["./src/**/*.{js,jsx,ts,tsx}"],
  darkMode: "class",
  theme: {
      extend: {
          keyframes: {
              fadeIn: {
                  "0%": { opacity: "0" },
                  "100%": { opacity: "1" },
              },
              slideDown: {
                  "0%": { transform: "translateY(-100%)" },
                  "100%": { transform: "translateY(0)" },
              },
              slideRight: {
                  "0%": { transform: "translateX(-100%)" },
                  "100%": { transform: "translateX(0)" },
              },
          },
          animation: {
              fadeIn: "fadeIn 1s ease-in-out",
              slideDown: "slideDown 1s ease-in-out",
              slideRight: "slideRight 1s ease-in-out",
          },
      },
  },
  plugins: [],
};

