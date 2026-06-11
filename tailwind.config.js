/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        background: "#F7F5F2",
        card: "#FFFFFF",
        primary: "#FF6B4A",
        secondary: "#7F77DD",
        "text-primary": "#1A1A1A",
        "text-muted": "#6B7280",
        border: "#E5E7EB",
        success: "#1D9E75",
      },
      borderRadius: {
        '2xl': '1rem',
      },
      boxShadow: {
        card: '0 2px 12px rgba(0, 0, 0, 0.06)',
      },
      fontFamily: {
        sans: ['Inter', 'sans-serif'],
      },
    },
  },
  plugins: [],
};
