/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,jsx}"],
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: "#7c3aed",
          50: "#f5f3ff",
          100: "#ede9fe",
          200: "#ddd6fe",
          300: "#c4b5fd",
          400: "#a78bfa",
          500: "#8b5cf6",
          600: "#7c3aed",
          700: "#6d28d9",
          800: "#5b21b6",
          900: "#4c1d95"
        },
        accent: {
          DEFAULT: "#f97316",
          50: "#fff7ed",
          100: "#ffedd5",
          500: "#f97316",
          600: "#ea580c"
        },
        ink: "#0f172a",
        paper: "#f8fafc",
        muted: "#64748b"
      },
      fontFamily: {
        sans: ["Inter", "ui-sans-serif", "system-ui", "-apple-system", "BlinkMacSystemFont", "Segoe UI", "sans-serif"],
        display: ["Inter", "ui-sans-serif", "system-ui", "sans-serif"]
      },
      borderRadius: {
        "4xl": "2rem"
      },
      boxShadow: {
        soft: "0 4px 24px -4px rgba(124, 58, 237, 0.12)",
        card: "0 8px 32px -8px rgba(15, 23, 42, 0.08)",
        glow: "0 0 40px -8px rgba(124, 58, 237, 0.35)"
      },
      backgroundImage: {
        "gradient-primary": "linear-gradient(135deg, #7c3aed 0%, #a855f7 50%, #c084fc 100%)",
        "gradient-accent": "linear-gradient(135deg, #f97316 0%, #fb923c 100%)",
        "gradient-hero": "linear-gradient(135deg, #4c1d95 0%, #7c3aed 45%, #a855f7 100%)",
        "gradient-mesh": "radial-gradient(at 40% 20%, rgba(124, 58, 237, 0.15) 0px, transparent 50%), radial-gradient(at 80% 0%, rgba(249, 115, 22, 0.1) 0px, transparent 50%), radial-gradient(at 0% 50%, rgba(124, 58, 237, 0.08) 0px, transparent 50%)"
      },
      animation: {
        "fade-in": "fadeIn 0.5s ease-out forwards",
        shimmer: "shimmer 1.5s infinite"
      },
      keyframes: {
        fadeIn: {
          "0%": { opacity: "0", transform: "translateY(8px)" },
          "100%": { opacity: "1", transform: "translateY(0)" }
        },
        shimmer: {
          "0%": { backgroundPosition: "-200% 0" },
          "100%": { backgroundPosition: "200% 0" }
        }
      }
    }
  },
  plugins: []
};
