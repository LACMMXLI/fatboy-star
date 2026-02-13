import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./pages/**/*.{js,ts,tsx,jsx,mdx}",
    "./components/**/*.{js,ts,tsx,jsx,mdx}",
    "./app/**/*.{js,ts,tsx,jsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        background: "var(--background)",
        foreground: "var(--foreground)",
        primary: {
          DEFAULT: "#000000",
          foreground: "#ffffff",
        },
        accent: {
          DEFAULT: "#f3f4f6",
          foreground: "#111827",
        },
      },
      borderRadius: {
        '3xl': '24px',
      },
      backgroundImage: {
        "gradient-radial": "radial-gradient(var(--tw-gradient-stops))",
        "gradient-conic":
          "conic-gradient(from 180deg at 50% 50%, var(--tw-gradient-stops))",
      },
    },
  },
  plugins: [],
};
export default config;
