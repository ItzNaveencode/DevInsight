import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ["Inter", "system-ui", "sans-serif"],
        mono: ["JetBrains Mono", "Menlo", "monospace"],
      },
      colors: {
        bg: {
          primary:   "#09090b",
          secondary: "#111113",
          card:      "#141418",
          elevated:  "#1c1c22",
        },
        accent: {
          violet:  "#8b5cf6",
          blue:    "#3b82f6",
          cyan:    "#06b6d4",
          emerald: "#10b981",
          amber:   "#f59e0b",
          rose:    "#f43f5e",
        },
      },
      borderRadius: { "2xl": "16px", "3xl": "20px" },
      animation: {
        "fade-in-up": "fadeInUp 0.4s ease forwards",
        shimmer:      "shimmer 1.5s infinite",
      },
    },
  },
  plugins: [],
};

export default config;
