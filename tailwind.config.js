/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/app/**/*.{js,jsx}",
    "./src/components/**/*.{js,jsx}",
    "./src/context/**/*.{js,jsx}",
  ],
  theme: {
    extend: {
      colors: {
        parchment: {
          DEFAULT: "#EFEAE0",
          light: "#F7F4EC",
          dark: "#E2DACB",
        },
        ink: {
          DEFAULT: "#22271F",
          soft: "#454B3F",
          faint: "#767C6C",
        },
        shelf: {
          green: "#3C5A45",
          "green-dark": "#2B4232",
          gold: "#B08D3F",
          "gold-dark": "#8C6F2E",
          rust: "#A85C3F",
          "rust-dark": "#874A33",
        },
        paper: "#FFFDF8",
      },
      fontFamily: {
        display: ["var(--font-fraunces)", "Georgia", "serif"],
        body: ["var(--font-inter)", "system-ui", "sans-serif"],
      },
      boxShadow: {
        spine: "inset 6px 0 0 0 var(--tw-shadow-color)",
        card: "0 1px 2px rgba(34, 39, 31, 0.06), 0 6px 20px -8px rgba(34, 39, 31, 0.18)",
        "card-hover": "0 2px 4px rgba(34, 39, 31, 0.08), 0 14px 30px -10px rgba(34, 39, 31, 0.24)",
      },
      borderRadius: {
        card: "0.625rem",
      },
      keyframes: {
        "fade-in": {
          "0%": { opacity: "0", transform: "translateY(4px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
        "slide-up": {
          "0%": { opacity: "0", transform: "translateY(10px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
      },
      animation: {
        "fade-in": "fade-in 0.25s ease-out",
        "slide-up": "slide-up 0.3s cubic-bezier(0.16, 1, 0.3, 1)",
      },
    },
  },
  plugins: [],
};
