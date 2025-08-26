/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./src/**/*.{js,jsx,ts,tsx}", "./public/index.html"],
  darkMode: 'class', // Enable class-based dark mode
  theme: {
    extend: {
      colors: {
        // Canary brand colors
        canary: {
          50: "#fffbeb",
          100: "#fef3c7",
          500: "#f59e0b",
          600: "#d97706",
          700: "#b45309", // ← For text-canary-700
        },
        // Alert colors
        danger: "#dc2626",
        success: "#16a34a",
        warning: "#ca8a04",
      },
      keyframes: {
        slowBounce: {
          "0%, 100%": { transform: "translateY(0)" },
          "50%": { transform: "translateY(-6%)" }, // jarak bounce kecil
        },
      },
      animation: {
        "slow-bounce": "slowBounce 2s ease-in-out infinite", // 2 detik per cycle
      },
    },
  },
  plugins: [],
};
