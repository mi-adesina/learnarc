import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  darkMode: "class",
  theme: {
    extend: {
      fontFamily: {
        sans: ["Sora", "sans-serif"],
        mono: ["JetBrains Mono", "monospace"],
      },
      colors: {
        accent: {
          DEFAULT: "#7c6af7",
          2: "#a78bfa",
          3: "#c4b5fd",
        },
        surface: {
          1: "#0a0a0f",
          2: "#111118",
          3: "#1a1a24",
          4: "#22222f",
        },
      },
    },
  },
  plugins: [],
};

export default config;
