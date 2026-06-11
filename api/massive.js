const CACHE = globalThis.__QC_MASSIVE_CACHE__ || (globalThis.__QC_MASSIVE_CACHE__ = new Map());
const TTL_MS = 90 * 1000;
function safePath(path) {
  const p = String(path || "");
  if (!p.startsWith("/")) throw new Error("Invalid path");
  if (p.includes("..") || p.includes("://")) throw new Error("Invalid path");
  return p;
}
export default async function handler(req, res) {
  try {
    const key = (process.env.MASSIVE_API_KEY || process.env.MASSIVE_KEY || process.env.POLYGON_API_KEY);
    if (!key) return res.status(500).json({ error: "Missing MASSIVE_API_KEY" });
    const path = safePath(req.query.path);
    let params = {};
    try { params = JSON.parse(req.query.params || "{}"); } catch {}
    const u = new URL(`https://api.massive.com${path}`);
    Object.entries(params || {}).forEach(([k, v]) => {
      if (v != null && v !== "") u.searchParams.set(k, String(v));
    });
    u.searchParams.set("apiKey", key);
    const cacheKey = u.toString().replace(key, "KEY");
    const cached = CACHE.get(cacheKey);
    if (cached && Date.now() - cached.t < TTL_MS) {
      res.setHeader("Content-Type", "application/json; charset=utf-8");
      res.setHeader("X-QuillCompass-Cache", "HIT");
      return res.status(200).send(cached.text);
    }
    const r = await fetch(u.toString());
    const text = await r.text();
    res.setHeader("Content-Type", "application/json; charset=utf-8");
    res.setHeader("Access-Control-Allow-Origin", "*");
    if (r.ok) CACHE.set(cacheKey, { t: Date.now(), text });
    if (r.status === 429 && cached) {
      res.setHeader("X-QuillCompass-Cache", "STALE");
      return res.status(200).send(cached.text);
    }
    return res.status(r.status).send(text);
  } catch (e) {
    return res.status(500).json({ error: e?.message || "Massive proxy failed" });
  }
}
