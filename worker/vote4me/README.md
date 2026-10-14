# Vote4me backend (optional)

The page works without this: problems open as a ready-to-send email to Rajesh, and voice input uses
the browser's own speech recognition (Chrome, Edge, Safari).

Deploying this Worker collects every problem in one list and adds OpenAI speech-to-text for browsers
without built-in recognition (for example Firefox):

1. `npx wrangler kv namespace create ISSUES`, then put the id in `wrangler.toml`.
2. `npx wrangler secret put OPENAI_API_KEY` and `npx wrangler secret put ADMIN_KEY`.
3. `npx wrangler deploy`.
4. Set `const API = "https://<your-worker>.workers.dev"` near the bottom of `public/Vote4me/index.html`.
5. Read submissions at `https://<your-worker>.workers.dev/list?key=<ADMIN_KEY>`.
