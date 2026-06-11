export default async function handler(req, res) {
  const exists = (names) => names.some(n => !!process.env[n]);
  const info = {
    ok: true,
    checkedAt: new Date().toISOString(),
    env: process.env.VERCEL_ENV || "unknown",
    variables: {
      GEMINI_API_KEY: exists(["GEMINI_API_KEY", "GEMINI_KEY", "GOOGLE_API_KEY"]),
      ECOS_API_KEY: exists(["ECOS_API_KEY", "ECOS_KEY", "BOK_API_KEY"]),
      FASTFOREX_API_KEY: exists(["FASTFOREX_API_KEY", "FASTFOREX_KEY"]),
      FINNHUB_API_KEY: exists(["FINNHUB_API_KEY", "FINNHUB_KEY"]),
      MASSIVE_API_KEY: exists(["MASSIVE_API_KEY", "MASSIVE_KEY", "POLYGON_API_KEY"])
    },
    note: "This endpoint only shows whether variables exist. It never returns actual secret values."
  };
  res.setHeader("Content-Type", "application/json; charset=utf-8");
  return res.status(200).json(info);
}
