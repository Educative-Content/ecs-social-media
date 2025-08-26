
/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html","./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      colors: {
        brand: { 50:"#f5f8ff",100:"#e6edff",200:"#c7d5ff",300:"#a3b7ff",400:"#7e97ff",500:"#5d7aff",600:"#435ee6",700:"#3348b3",800:"#263684",900:"#1b285f" }
      },
      boxShadow: { soft: "0 8px 24px rgba(0,0,0,0.08)" },
      borderRadius: { xl2: "1rem" }
    },
  },
  plugins: [],
}
