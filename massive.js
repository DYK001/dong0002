function safePath(path) {
  const p = String(path || "");
  if (!p.startsWith("/")) throw new Error("Invalid path");
  if (p.includes("..") || p.includes("://")) throw new Error("Invalid path");
  return p;
}
export default async function handler(req, res) {
  try {
    const key = process.env.FASTFOREX_API_KEY;
    if (!key) return res.status(500).json({ error: "Missing FASTFOREX_API_KEY" });
    const path = safePath(req.query.path);
    let params = {};
    try { params = JSON.parse(req.query.params || "{}"); } catch {}
    const u = new URL(`https://api.fastforex.io${path}`);
    Object.entries(params || {}).forEach(([k, v]) => {
      if (v != null && v !== "") u.searchParams.set(k, String(v));
    });
    u.searchParams.set("api_key", key);
    const r = await fetch(u.toString(), { headers: { "X-API-Key": key } });
    const text = await r.text();
    res.setHeader("Content-Type", "application/json; charset=utf-8");
    res.setHeader("Access-Control-Allow-Origin", "*");
    return res.status(r.status).send(text);
  } catch (e) {
    return res.status(500).json({ error: e?.message || "FastForex proxy failed" });
  }
}
