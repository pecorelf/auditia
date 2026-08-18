// Health check — útil para verificar que las funciones desplegaron bien.
export const config = { runtime: "nodejs" };

export default async function handler(): Promise<Response> {
  return new Response(
    JSON.stringify({
      ok: true,
      model: process.env.ANTHROPIC_MODEL || "claude-sonnet-4-5",
      apiKeyPresente: Boolean(process.env.ANTHROPIC_API_KEY),
      gateActivo: Boolean(process.env.DEMO_PASSWORD),
      ts: Date.now(),
    }),
    { headers: { "Content-Type": "application/json" } },
  );
}
