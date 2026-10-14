/* Cloudflare Worker for 0krk0.dev/Vote4me.
   POST /submit      {name, problem}   -> saved in KV (binding ISSUES)
   POST /transcribe  multipart "audio" -> OpenAI speech-to-text, returns {text}
   GET  /list?key=ADMIN_KEY            -> every submission, newest first (add &format=json for JSON)
   Secrets: OPENAI_API_KEY, ADMIN_KEY.  KV binding: ISSUES.
   Protection for your OpenAI credit: only your site's pages may call it, each visitor gets a few
   requests an hour, and the whole service stops transcribing after DAILY_TRANSCRIBE a day. */
const ORIGINS = ["https://0krk0.dev", "https://www.0krk0.dev"];
const PER_IP_HOUR = { submit: 10, transcribe: 15 };
const DAILY_TRANSCRIBE = 400;
const MAX_AUDIO = 4 * 1024 * 1024; // about 4 minutes of speech

const cors = o => ({ "access-control-allow-origin": o, "access-control-allow-methods": "POST, GET, OPTIONS", "access-control-allow-headers": "content-type", vary: "origin" });
const json = (obj, status, o) => new Response(JSON.stringify(obj), { status: status || 200, headers: { "content-type": "application/json", ...cors(o || ORIGINS[0]) } });

async function allow(env, key, limit, ttl) {
  const n = parseInt((await env.ISSUES.get(key)) || "0", 10);
  if (n >= limit) return false;
  await env.ISSUES.put(key, String(n + 1), { expirationTtl: ttl });
  return true;
}

export default {
  async fetch(req, env) {
    const url = new URL(req.url), origin = req.headers.get("origin") || "";
    const ip = req.headers.get("cf-connecting-ip") || "unknown", hour = new Date().toISOString().slice(0, 13), day = hour.slice(0, 10);
    if (req.method === "OPTIONS") return new Response(null, { headers: cors(ORIGINS.includes(origin) ? origin : ORIGINS[0]) });

    if (req.method === "POST" && (url.pathname === "/submit" || url.pathname === "/transcribe")) {
      if (!ORIGINS.includes(origin)) return json({ error: "forbidden" }, 403);
      const kind = url.pathname.slice(1);
      if (!(await allow(env, `rl:${kind}:${ip}:${hour}`, PER_IP_HOUR[kind], 3700))) return json({ error: "Too many requests. Try again later." }, 429, origin);

      if (kind === "submit") {
        const b = await req.json().catch(() => null);
        const problem = b ? String(b.problem || "").trim().slice(0, 2000) : "";
        if (problem.length < 5) return json({ error: "empty" }, 400, origin);
        const at = new Date().toISOString();
        await env.ISSUES.put(`issue:${at}:${crypto.randomUUID().slice(0, 8)}`, JSON.stringify({ at, name: String(b.name || "").trim().slice(0, 80), problem }));
        return json({ ok: true }, 200, origin);
      }

      if (!(await allow(env, `rl:day:${day}`, DAILY_TRANSCRIBE, 90000))) return json({ error: "Voice is resting for today. Please type." }, 429, origin);
      const form = await req.formData().catch(() => null), audio = form && form.get("audio");
      if (!audio || typeof audio === "string" || audio.size > MAX_AUDIO) return json({ error: "no audio" }, 400, origin);
      const fd = new FormData(); fd.append("file", audio, "voice.webm"); fd.append("model", "whisper-1"); fd.append("language", "en");
      const r = await fetch("https://api.openai.com/v1/audio/transcriptions", { method: "POST", headers: { authorization: "Bearer " + env.OPENAI_API_KEY }, body: fd });
      const j = await r.json().catch(() => ({}));
      return r.ok ? json({ text: j.text || "" }, 200, origin) : json({ error: "transcription failed" }, 502, origin);
    }

    if (req.method === "GET" && url.pathname === "/list") {
      if (!env.ADMIN_KEY || url.searchParams.get("key") !== env.ADMIN_KEY) return new Response("Not found", { status: 404 });
      const out = []; let cursor;
      do { const l = await env.ISSUES.list({ prefix: "issue:", cursor }); for (const k of l.keys) { const v = await env.ISSUES.get(k.name); if (v) out.push(JSON.parse(v)); } cursor = l.list_complete ? null : l.cursor; } while (cursor);
      out.sort((a, b) => b.at.localeCompare(a.at));
      if (url.searchParams.get("format") === "json") return new Response(JSON.stringify(out, null, 1), { headers: { "content-type": "application/json" } });
      const esc = s => String(s).replace(/[&<>]/g, c => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;" }[c]));
      const rows = out.map(i => `<tr><td>${esc(i.at.slice(0, 16).replace("T", " "))}</td><td>${esc(i.name || "–")}</td><td>${esc(i.problem)}</td></tr>`).join("");
      return new Response(`<!doctype html><meta charset=utf-8><meta name=viewport content="width=device-width,initial-scale=1"><title>Vote4me problems</title><style>body{font:15px/1.5 system-ui;margin:20px;color:#1c2541}table{border-collapse:collapse;width:100%}td,th{border-bottom:1px solid #ddd;padding:8px;text-align:left;vertical-align:top}td:first-child{white-space:nowrap;color:#666}</style><h1>Problems sent from Vote4me (${out.length})</h1><table><tr><th>When (UTC)</th><th>Name</th><th>Problem</th></tr>${rows}</table>`, { headers: { "content-type": "text/html; charset=utf-8" } });
    }
    return new Response("Not found", { status: 404 });
  }
};
