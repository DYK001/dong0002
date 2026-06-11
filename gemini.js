function makeGeminiBody(sys, usr, useSearch) {
  const parts = [
    { text: `System:\n${sys || ""}` },
    { text: String(usr || "") }
  ];
  const body = {
    contents: [{ role: "user", parts }],
    generationConfig: { temperature: 0.45, topP: 0.9, maxOutputTokens: 1400 }
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
    const endpoint = `https://generativelanguage.googleapis.com/v1beta/models/${encodeURIComponent(m)}:generateContent`;
    const r = await fetch(endpoint, {
      method: "POST",
      headers: { "Content-Type": "application/json", "x-goog-api-key": key },
      body: JSON.stringify(makeGeminiBody(sys, usr, !!useSearch))
    });
    const raw = await r.text();
    if (!r.ok) return res.status(r.status).json({ error: raw });
    const d = JSON.parse(raw);
    return res.status(200).json({ text: extractGeminiText(d) });
  } catch (e) {
    return res.status(500).json({ error: e?.message || "Gemini proxy failed" });
  }
}
