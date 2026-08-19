/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        deloitte: {
          green: "#86BC25",
          greenDark: "#6FA01F",
          greenTxt: "#4D7014",   // 5,76:1 sobre blanco — para texto en verde
          black: "#000000",
          ink: "#0A0A0A",
          coal: "#1A1A1A",
          slate: "#2A2A2A",
          mute: "#666666",
          line: "#E5E5E5",
          paper: "#F7F7F5",
        },
        // Dos escalas por severidad:
        //   · el color base se usa en BARRAS, PUNTOS y RELLENOS (no texto)
        //   · la variante -txt se usa en TEXTO y cumple WCAG AA (>=4.5:1)
        // El ámbar #F59E0B daba 2,15:1 sobre blanco: ilegible para una etiqueta
        // de severidad, que es justo lo que el usuario más necesita leer.
        risk: {
          high: "#DC2626",
          med: "#F59E0B",
          low: "#16A34A",
          highTxt: "#B91C1C",  // 6,47:1 sobre blanco
          medTxt: "#B45309",   // 5,02:1 sobre blanco
          lowTxt: "#15803D",   // 5,02:1 sobre blanco
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
