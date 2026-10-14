/* Cloudflare Worker for 0krk0.dev/Vote4me (optional backend).
   POST /submit      {name, problem, page}  -> stored in KV (binding ISSUES)
   POST /transcribe  multipart "audio"      -> OpenAI speech-to-text, returns {text}
   GET  /list?key=   -> all submissions as JSON (key = ADMIN_KEY secret)
   Secrets: OPENAI_API_KEY, ADMIN_KEY. KV binding: ISSUES. */
const ORIGIN = "https://0krk0.dev";
const cors = { "access-control-allow-origin": ORIGIN, "access-control-allow-methods": "POST, GET, OPTIONS", "access-control-allow-headers": "content-type" };
const json = (o, s = 200) => new Response(JSON.stringify(o), { status: s, headers: { "content-type": "application/json", ...cors } });

export default {
  async fetch(req, env) {
    const url = new URL(req.url);
    if (req.method === "OPTIONS") return new Response(null, { headers: cors });
    if (url.pathname === "/submit" && req.method === "POST") {
      const b = await req.json().catch(() => null);
      const problem = (b && String(b.problem || "").trim().slice(0, 2000)) || "";
      if (problem.length < 5) return json({ error: "empty" }, 400);
      const rec = { name: String(b.name || "").trim().slice(0, 80), problem, at: new Date().toISOString() };
      await env.ISSUES.put(rec.at + "-" + crypto.randomUUID().slice(0, 8), JSON.stringify(rec));
      return json({ ok: true });
    }
    if (url.pathname === "/transcribe" && req.method === "POST") {
      const form = await req.formData(); const audio = form.get("audio");
      if (!audio || audio.size > 10 * 1024 * 1024) return json({ error: "no audio" }, 400);
      const fd = new FormData(); fd.append("file", audio, "voice.webm"); fd.append("model", "whisper-1"); fd.append("language", "en");
      const r = await fetch("https://api.openai.com/v1/audio/transcriptions", { method: "POST", headers: { authorization: "Bearer " + env.OPENAI_API_KEY }, body: fd });
      const j = await r.json().catch(() => ({}));
      return r.ok ? json({ text: j.text || "" }) : json({ error: "transcription failed" }, 502);
    }
    if (url.pathname === "/list" && url.searchParams.get("key") === env.ADMIN_KEY && env.ADMIN_KEY) {
      const out = []; let cursor;
      do { const l = await env.ISSUES.list({ cursor }); for (const k of l.keys) out.push(JSON.parse(await env.ISSUES.get(k.name))); cursor = l.list_complete ? null : l.cursor; } while (cursor);
      return json(out);
    }
    return json({ error: "not found" }, 404);
  }
};
