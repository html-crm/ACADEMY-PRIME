import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/app/**/*.{ts,tsx}",
    "./src/components/**/*.{ts,tsx}",
    "./src/features/**/*.{ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        ink: {
          950: "#0A111C",
          900: "#0E1726",
          800: "#152234",
          700: "#1C2E44",
          500: "#3C5066",
          300: "#8595A6",
        },
        paper: {
          50: "#F4F4F1",
          100: "#EAEBE5",
          200: "#DCDED6",
        },
        brass: {
          300: "#DEC382",
          400: "#C7A354",
          500: "#AD8737",
          600: "#8A6B2C",
        },
        emerald: {
          500: "#2A8570",
          600: "#1F6F5C",
          700: "#17564A",
        },
        line: "#DADFE1",
      },
      fontFamily: {
        display: ["var(--font-display)", "serif"],
        body: ["var(--font-body)", "sans-serif"],
        "display-ar": ["var(--font-display-ar)", "serif"],
        "body-ar": ["var(--font-body-ar)", "sans-serif"],
      },
      maxWidth: {
        content: "1180px",
      },
      boxShadow: {
        card: "0 1px 2px rgba(10,17,28,0.04), 0 8px 24px -12px rgba(10,17,28,0.12)",
        elevated: "0 4px 8px rgba(10,17,28,0.06), 0 24px 48px -20px rgba(10,17,28,0.20)",
      },
      borderRadius: {
        xl2: "1.25rem",
      },
    },
  },
  plugins: [],
};

export default config;
