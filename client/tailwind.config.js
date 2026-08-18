/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        deloitte: {
          green: "#86BC25",
          greenDark: "#6FA01F",
          black: "#000000",
          ink: "#0A0A0A",
          coal: "#1A1A1A",
          slate: "#2A2A2A",
          mute: "#666666",
          line: "#E5E5E5",
          paper: "#F7F7F5",
        },
        risk: {
          high: "#DC2626",
          med: "#F59E0B",
          low: "#16A34A",
        },
      },
      fontFamily: {
        sans: ['"Open Sans"', "system-ui", "sans-serif"],
        serif: ['"Source Serif 4"', '"Source Serif Pro"', "Georgia", "serif"],
        mono: ['"JetBrains Mono"', "ui-monospace", "monospace"],
      },
      boxShadow: {
        card: "0 1px 2px rgba(0,0,0,0.04), 0 4px 12px rgba(0,0,0,0.04)",
        cardHover: "0 2px 4px rgba(0,0,0,0.06), 0 8px 24px rgba(0,0,0,0.08)",
      },
    },
  },
  plugins: [],
};
