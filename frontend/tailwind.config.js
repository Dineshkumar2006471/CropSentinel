// tailwind.config.js
/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        "board-green": "#26392E",
        "kraft-paper": "#E9DFC4",
        "turmeric-gold": "#DE9F2E",
        "chili-vermillion": "#BF3C2B",
        "soil-ink": "#2A2116",
        "stone": "#8C8573",
        "stone-accessible": "#5C5647"
      },
      borderRadius: {
        none: "0px",
        button: "12px"
      },
      spacing: {
        4: "4px",
        8: "8px",
        12: "12px",
        16: "16px",
        24: "24px",
        32: "32px",
        48: "48px",
        64: "64px",
        120: "120px"
      },
      fontFamily: {
        display: ["Manrope", "sans-serif"],
        body: ["Manrope", "sans-serif"],
        data: ["'JetBrains Mono'", "monospace"]
      },
      keyframes: {
        marquee: {
          '0%': { transform: 'translateX(0%)' },
          '100%': { transform: 'translateX(-50%)' },
        }
      },
      animation: {
        marquee: 'marquee 25s linear infinite',
      },
    },
  },
  plugins: [],
}
