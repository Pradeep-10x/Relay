import type { Config } from "tailwindcss";

const config: Config = {
  // Lock to class strategy so `dark:` variants never activate from OS preference.
  // The product is a light, professional theme.
  darkMode: "class",
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: [
          "var(--font-inter)",
          "ui-sans-serif",
          "system-ui",
          "-apple-system",
          "Segoe UI",
          "Roboto",
          "Helvetica Neue",
          "Arial",
          "sans-serif",
        ],
      },
      boxShadow: {
        card: "0 1px 2px rgba(16,24,40,0.04), 0 1px 3px rgba(16,24,40,0.04)",
        "card-hover": "0 4px 16px rgba(16,24,40,0.08)",
        pop: "0 8px 30px rgba(16,24,40,0.12)",
      },
    },
  },
  plugins: [],
};
export default config;
