/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}", "./index.html"],
  theme: {
    extend: {
      keyframes: {
        loading: {
          "0%": { width: "0%", marginLeft: "0%" },
          "50%": { width: "50%", marginLeft: "25%" },
          "100%": { width: "0%", marginLeft: "100%" },
        },
      },
      colors: {
        gold2: '#F1B81C',
        black2: '#313131'
      },
      fontFamily: {
        iowan: ["Iowan Old Style", "serif"],
        inter: ["Inter", "sans-serif"],
        nunito: ["Nunito Sans", "sans-serif"],
      },
    },
  },
  plugins: [],
};
