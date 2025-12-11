/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: ["class"],
  content: ["./src/**/*.{js,jsx,ts,tsx}"],
  theme: {
    extend: {
      colors: {
        background: "hsl(40, 20%, 96%)",
        foreground: "hsl(180, 25%, 15%)",
        card: {
          DEFAULT: "hsl(0, 0%, 100%)",
          foreground: "hsl(180, 25%, 15%)"
        },
        primary: {
          DEFAULT: "hsl(180, 25%, 25%)",
          foreground: "hsl(40, 20%, 96%)"
        },
        secondary: {
          DEFAULT: "hsl(24, 10%, 90%)",
          foreground: "hsl(180, 25%, 25%)"
        },
        accent: {
          DEFAULT: "hsl(13, 69%, 63%)",
          foreground: "hsl(0, 0%, 100%)"
        },
        muted: {
          DEFAULT: "hsl(40, 10%, 90%)",
          foreground: "hsl(180, 10%, 40%)"
        },
        border: "hsl(180, 10%, 85%)",
        input: "hsl(180, 10%, 90%)",
        ring: "hsl(180, 25%, 25%)"
      },
      borderRadius: {
        lg: "1rem",
        md: "0.75rem",
        sm: "0.5rem"
      },
      fontFamily: {
        sans: ['DM Sans', 'sans-serif'],
        serif: ['Playfair Display', 'serif']
      }
    }
  },
  plugins: [require("tailwindcss-animate")]
};