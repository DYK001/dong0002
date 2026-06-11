const CACHE = globalThis.__QC_GEMINI_CACHE__ || (globalThis.__QC_GEMINI_CACHE__ = new Map());
const TTL_MS = 10 * 60 * 1000;
function makeGeminiBody(sys, usr, useSearch) {
  const parts = [
    { text: `System:\n${sys || ""}` },
    { text: String(usr || "") }
  ];
  const body = {
    contents: [{ role: "user", parts }],
    generationConfig: { temperature: 0.35, topP: 0.9, maxOutputTokens: 900 }
  };
  if (useSearch) body.tools = [{ googleSearch: {} }];
  return body;
}
function extractGeminiText(d) {
  const c = d?.candidates?.[0];
  const parts = c?.content?.parts || [];
  const text = parts.map(p => p.text || "").join("\n").trim();
  return text || "";
}
export default async function handler(req, res) {
  if (req.method !== "POST") return res.status(405).json({ error: "Method not allowed" });
  try {
    const key = (process.env.GEMINI_API_KEY || process.env.GEMINI_KEY || process.env.GOOGLE_API_KEY);
    if (!key) return res.status(500).json({ error: "Missing GEMINI_API_KEY" });
    const { sys, usr, useSearch, model } = req.body || {};
    const m = model || "gemini-2.0-flash";
    const cacheKey = JSON.stringify({ sys, usr, useSearch: !!useSearch, model: m }).slice(0, 6000);
    const cached = CACHE.get(cacheKey);
    if (cached && Date.now() - cached.t < TTL_MS) {
      res.setHeader("X-QuillCompass-Cache", "HIT");
      return res.status(200).json({ text: cached.text });
    }
    const endpoint = `https://generativelanguage.googleapis.com/v1beta/models/${encodeURIComponent(m)}:generateContent`;
    const r = await fetch(endpoint, {
      method: "POST",
      headers: { "Content-Type": "application/json", "x-goog-api-key": key },
      body: JSON.stringify(makeGeminiBody(sys, usr, !!useSearch))
    });
    const raw = await r.text();
    if (!r.ok) {
      if (r.status === 429) {
        return res.status(429).json({ error: "Gemini quota exceeded. Local fallback will be used." });
      }
      return res.status(r.status).json({ error: raw });
    }
    const d = JSON.parse(raw);
    const text = extractGeminiText(d);
    CACHE.set(cacheKey, { t: Date.now(), text });
    return res.status(200).json({ text });
  } catch (e) {
    return res.status(500).json({ error: e?.message || "Gemini proxy failed" });
  }
}
