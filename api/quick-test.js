async function readText(r) {
  const text = await r.text();
  try { return { json: JSON.parse(text), text }; } catch { return { text }; }
}
export default async function handler(req, res) {
  const base = `https://${req.headers.host}`;
  const out = {};
  async function test(name, url, opt) {
    try {
      const r = await fetch(url, opt);
      const body = await readText(r);
      out[name] = { status: r.status, ok: r.ok, rateLimited: r.status === 429, sample: JSON.stringify(body.json || body.text || "").slice(0, 260) };
    } catch (e) {
      out[name] = { ok: false, error: e?.message || String(e) };
    }
  }
  await test("fastforex", `${base}/api/fastforex?path=%2Ffetch-multi&params=%7B%22from%22%3A%22USD%22%2C%22to%22%3A%22KRW%22%7D`);
  await test("finnhub", `${base}/api/finnhub?path=%2Fquote&params=%7B%22symbol%22%3A%22AAPL%22%7D`);
  await test("massive", `${base}/api/massive?path=%2Fv2%2Faggs%2Fticker%2FAAPL%2Fprev&params=%7B%7D`);
  await test("gemini", `${base}/api/gemini`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ sys: "Reply with OK only.", usr: "Say OK", useSearch: false, model: "gemini-2.0-flash" })
  });
  res.setHeader("Content-Type", "application/json; charset=utf-8");
  return res.status(200).json({ checkedAt: new Date().toISOString(), results: out });
}
