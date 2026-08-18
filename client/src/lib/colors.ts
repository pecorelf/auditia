export const C = {
  brand: "#86BC25",
  brandDark: "#6FA01F",
  ink: "#0A0A0A",
  slate: "#2A2A2A",
  mute: "#666666",
  line: "#E5E5E5",
  paper: "#F7F7F5",
  riskHigh: "#DC2626",
  riskMed: "#F59E0B",
  riskLow: "#16A34A",
  // Chart palette (qualitative, accessible)
  chart: [
    "#86BC25", // brand green
    "#000000", // ink
    "#F59E0B", // amber
    "#0EA5E9", // sky
    "#A855F7", // purple
    "#DC2626", // red
    "#16A34A", // green
    "#6366F1", // indigo
  ],
};

export const riskColor = (level: "high" | "med" | "low" | string) =>
  level === "high" ? C.riskHigh : level === "med" ? C.riskMed : C.riskLow;
