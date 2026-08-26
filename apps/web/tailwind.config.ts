import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./app/**/*.{ts,tsx}", "./components/**/*.{ts,tsx}"],
  darkMode: "class",
  theme: {
    extend: {
      fontFamily: {
        sans: ["var(--font-sans)", "system-ui", "sans-serif"],
      },
      colors: {
        ink: {
          950: "#0a0c10",
          900: "#12151b",
          800: "#1a1e26",
          700: "#262b35",
        },
        gold: {
          400: "#e6c869",
          500: "#d4af37",
          600: "#b8912a",
        },
        silver: {
          300: "#e4e6ea",
          400: "#c7cbd1",
          500: "#9aa0aa",
        },
      },
    },
  },
  plugins: [],
};

export default config;
