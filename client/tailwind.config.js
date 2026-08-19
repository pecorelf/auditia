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
          ink: "#0C0D0F",      // riel oscuro del sistema
          coal: "#1A1A1A",
          slate: "#2A2A2A",
          mute: "#666666",
          line: "#E5E5E5",
          paper: "#F6F6F4",    // lienzo del sistema
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
        // Misma familia que Loyalty Studio y Discovery Studio: los tres
        // productos deben leerse como parte de un mismo sistema.
        sans: ["Poppins", "system-ui", "sans-serif"],
        // "serif" se conserva como nombre de clase para no tocar 30 archivos,
        // pero apunta a Poppins: el display es la misma familia en peso ligero.
        serif: ["Poppins", "system-ui", "sans-serif"],
        mono: ['"JetBrains Mono"', "ui-monospace", "monospace"],
      },
      boxShadow: {
        card: "0 1px 2px rgba(12,13,15,0.03), 0 6px 20px rgba(12,13,15,0.045)",
        cardHover: "0 2px 6px rgba(12,13,15,0.05), 0 12px 32px rgba(12,13,15,0.08)",
      },
    },
  },
  plugins: [],
};
