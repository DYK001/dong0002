export default async function handler(req, res) {
  try {
    const key = (process.env.ECOS_API_KEY || process.env.ECOS_KEY || process.env.BOK_API_KEY);
    if (!key) return res.status(500).json({ error: "Missing ECOS_API_KEY" });
    const target = req.query.url;
    if (!target || typeof target !== "string") return res.status(400).json({ error: "Missing url" });
    let decoded = decodeURIComponent(target);
    if (!decoded.startsWith("https://ecos.bok.or.kr/api/")) {
      return res.status(403).json({ error: "Only ECOS API URLs are allowed" });
    }
    // Replace the placeholder/fake key segment with the real environment variable.
    decoded = decoded.replace(/(https:\/\/ecos\.bok\.or\.kr\/api\/[^\/]+\/)[^\/]+(\/)/, `$1${key}$2`);
    const r = await fetch(decoded, { headers: { "User-Agent": "QuillCompass/1.0" } });
    const text = await r.text();
    res.setHeader("Access-Control-Allow-Origin", "*");
    res.setHeader("Content-Type", "application/json; charset=utf-8");
    return res.status(r.status).send(text);
  } catch (e) {
    return res.status(500).json({ error: e?.message || "ECOS proxy failed" });
  }
}
