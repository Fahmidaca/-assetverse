import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ["Inter", "sans-serif"],
      },
      colors: {
        primary: "#4F46E5",
        "primary-dark": "#4338CA",
        secondary: "#7C3AED",
        accent: "#06B6D4",
        success: "#10B981",
        warning: "#F59E0B",
        danger: "#EF4444",
      },
    },
  },
  plugins: [require("daisyui")],
  daisyui: {
    themes: [
      {
        assetverse: {
          primary: "#4F46E5",
          "primary-content": "#ffffff",
          secondary: "#7C3AED",
          "secondary-content": "#ffffff",
          accent: "#06B6D4",
          "accent-content": "#ffffff",
          neutral: "#1f2937",
          "neutral-content": "#f3f4f6",
          "base-100": "#ffffff",
          "base-200": "#f9fafb",
          "base-300": "#f3f4f6",
          "base-content": "#111827",
          info: "#3b82f6",
          success: "#10b981",
          warning: "#f59e0b",
          error: "#ef4444",
        },
      },
    ],
    darkTheme: false,
  },
};

export default config;
