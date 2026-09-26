import type { Config } from "tailwindcss";

export default {
  darkMode: "class",
  content: ["./index.html", "./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        notability: {
          50: "#eef7ff",
          100: "#d8edff",
          500: "#1f9cf0",
          600: "#0b7ed0",
          700: "#0767ad"
        }
      },
      boxShadow: {
        soft: "0 18px 50px -28px rgba(15, 23, 42, 0.35)"
      }
    }
  },
  plugins: []
} satisfies Config;
