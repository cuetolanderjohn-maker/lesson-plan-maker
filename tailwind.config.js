/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        canvas: "#FAF8F5",
        surface: "#FFFFFF",
        sage: {
          50: "#F2F7F5",
          100: "#E3ECE8",
          200: "#C7D8D1",
          500: "#5F8D7A",
          600: "#4D7363",
          700: "#3E5B4F",
        },
        pastel: {
          peach: {
            bg: "#FDF1EC",
            text: "#8C4A3E",
            border: "#F5D4CA",
          },
          mint: {
            bg: "#EDF7F2",
            text: "#326852",
            border: "#CEE8DD",
          },
          lavender: {
            bg: "#F3F0F8",
            text: "#5D4D78",
            border: "#E1DAED",
          },
          butter: {
            bg: "#FEF7E6",
            text: "#7C6329",
            border: "#FBE6B6",
          },
        },
        borderMuted: "#EAE6DF",
      },
      fontFamily: {
        sans: ["Inter", "-apple-system", "BlinkMacSystemFont", "Segoe UI", "Roboto", "sans-serif"],
      },
    },
  },
  plugins: [],
};
