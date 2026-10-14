# Vote4me backend (Cloudflare Worker)

Collects the problems students send from 0krk0.dev/Vote4me in one list, and turns speech into text
with OpenAI for browsers that have no built-in speech recognition (Firefox, some Android browsers).

Your OpenAI key lives only in Cloudflare as a secret. It is never in the page or this repo.
The Worker only answers your site, limits each visitor to a few requests an hour, and stops
transcribing after 400 a day, so nobody can run up your OpenAI bill.

## Set it up in the Cloudflare dashboard (about 5 minutes)

1. Workers & Pages → Create → Create Worker. Name it `vote4me` → Deploy.
2. Edit code → replace everything with `worker.js` from this folder → Deploy.
3. Storage & Databases → KV → Create a namespace called `vote4me-issues`.
4. Back in the Worker → Settings → Bindings → Add → KV namespace: variable name `ISSUES`,
   namespace `vote4me-issues`.
5. Settings → Variables and Secrets → Add, type Secret:
   - `OPENAI_API_KEY` = your OpenAI key
   - `ADMIN_KEY` = any long password you choose (for reading the list)
6. Copy the Worker's address, e.g. `https://vote4me.<you>.workers.dev`.

Then set `const API = "https://vote4me.<you>.workers.dev";` in `public/Vote4me/index.html`.

Read what students sent: `https://vote4me.<you>.workers.dev/list?key=<ADMIN_KEY>`
(add `&format=json` for JSON).

Also set a monthly budget limit on your OpenAI account as a second safety net.
