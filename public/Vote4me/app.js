/* Vote4me · first-person walk through Google Photorealistic 3D Tiles of the University of Edinburgh.
   Rendering: CesiumJS. Movement: our own controller that ray-casts into the photographic mesh
   for the ground under your feet and for walls in front of you. */
const C = window.Cesium;
const $ = id => document.getElementById(id);
const CFG = window.VOTE4ME_CONFIG || {};
const VOTE_URL = "https://www.eusa.ed.ac.uk/elections/vote/905";
const CLOSES = new Date("2026-10-15T17:00:00+01:00");
const isTouch = matchMedia("(pointer:coarse)").matches;
const status = (t, p) => { $("status").textContent = t; if (p != null) $("bar").firstChild.style.width = Math.round(p * 100) + "%"; };

/* ---------- countdown ---------- */
function tickCountdown() {
  const ms = CLOSES - Date.now(); let txt;
  if (ms <= 0) txt = "closed";
  else { const h = Math.floor(ms / 3.6e6), m = Math.floor(ms / 6e4) % 60; txt = h >= 24 ? `${Math.floor(h / 24)}d ${h % 24}h` : `${h}h ${String(m).padStart(2, "0")}m`; }
  document.querySelectorAll("[data-countdown]").forEach(e => { e.textContent = txt; });
}
tickCountdown(); setInterval(tickCountdown, 30000);

/* ---------- poster sheet (works even without 3D) ---------- */
const POSTERS = ["img/poster.webp", "img/manifesto.webp"];
let posterIdx = 0;
function openPoster(i) { if (i != null) posterIdx = i; $("posterimg").src = POSTERS[posterIdx]; $("poster").hidden = false; if (document.pointerLockElement) document.exitPointerLock(); }
$("bclose").onclick = () => { $("poster").hidden = true; };
$("bswap").onclick = () => { posterIdx = (posterIdx + 1) % POSTERS.length; $("posterimg").src = POSTERS[posterIdx]; };
$("bposter").onclick = () => openPoster();
document.querySelectorAll("[data-open-poster]").forEach(b => b.onclick = () => openPoster(0));
addEventListener("keydown", e => { if (e.key === "Escape" && !$("poster").hidden) $("poster").hidden = true; });

if (!C) { status("The 3D engine didn't load. Check your connection and reload."); throw new Error("Cesium missing"); }
if (!CFG.cesiumIonToken && !CFG.googleMapsKey) { $("start").hidden = true; $("setup").hidden = false; throw new Error("no key"); }

/* ---------- places (from OpenStreetMap positions) ---------- */
const MCEWAN = { lat: 55.945345, lon: -3.189430 };
const PLACES = [
  { t: "Bristo Square, facing McEwan Hall", lat: 55.9454091, lon: -3.1883639, face: 266 },
  { t: "McEwan Hall steps", lat: 55.945330, lon: -3.188780, face: 258 },
  { t: "Teviot Row House", lat: 55.945460, lon: -3.188650, face: 178 },
  { t: "Bristo Square, north side by Potterrow", lat: 55.945780, lon: -3.188267, face: 20 },
  { t: "Bayes Centre", lat: 55.9454181, lon: -3.186856, face: 245 },
  { t: "Informatics Forum, Crichton Street", lat: 55.9443650, lon: -3.1873800, face: 20 },
  { t: "George Square Gardens", lat: 55.9438983, lon: -3.1888292, face: 180 },
  { t: "The Meadows", lat: 55.942342, lon: -3.194293, face: 200 },
  { t: "National Museum of Scotland", lat: 55.946700, lon: -3.189334, face: 0 },
  { t: "Greyfriars Kirk", lat: 55.946300, lon: -3.19227, face: 315 },
];
/* Poster stands: positions checked against building footprints so they stand on open paving. face = compass bearing the poster looks towards. */
const STANDS = [
  { lat: 55.9455177, lon: -3.1884762, face: 150, img: 0 },  // Bristo Square, by the start
  { lat: 55.9451829, lon: -3.1887008, face: 0, img: 1 },    // in front of Teviot
  { lat: 55.9445949, lon: -3.1872731, face: 200, img: 0 },  // Crichton Street, outside the Informatics Forum
  { lat: 55.9454181, lon: -3.1868560, face: 70, img: 1 },   // Potterrow, by the Bayes Centre
  { lat: 55.9438983, lon: -3.1888292, face: 0, img: 0 },    // George Square Gardens
];

/* ---------- quality: detected tier, automatic tuning, manual override ---------- */
const TIERS = {
  low: { sse: 20, res: .7, aa: 1, ao: false },
  medium: { sse: 12, res: .9, aa: 1, ao: false },
  high: { sse: 6, res: 1, aa: 2, ao: false },
  ultra: { sse: 2, res: 1.35, aa: 2, ao: true },
};
const TIER_NAMES = ["low", "medium", "high", "ultra"];
let gpu = "unknown GPU";
try { const g = document.createElement("canvas").getContext("webgl2"); const x = g && g.getExtension("WEBGL_debug_renderer_info"); if (x) gpu = g.getParameter(x.UNMASKED_RENDERER_WEBGL) || gpu; } catch (e) {}
function detectTier() {
  const g = gpu.toLowerCase();
  if (/swiftshader|llvmpipe|software|basic render/.test(g)) return "low";
  if (isTouch) return /apple gpu|adreno \(tm\) 7[3-9]\d|mali-g7[1-9]|xclipse/.test(g) ? "medium" : "low";
  if (/rtx|rx ?[67]\d{3}|radeon pro w|m[1-9] (pro|max|ultra)|arc\(tm\) a7|arc a7/.test(g)) return "ultra";
  if (/gtx|rx ?5\d{3}|apple m[1-9]|iris\(r\) xe|arc|quadro|radeon pro/.test(g)) return "high";
  return navigator.hardwareConcurrency >= 8 ? "high" : "medium";
}
const AUTO = detectTier();
let curTier = AUTO;
let Q = { preset: "auto", ...TIERS[AUTO], fov: 70, fps: false };
try { const s = JSON.parse(localStorage.getItem("vote4me-gfx") || "null"); if (s && typeof s === "object") Q = { ...Q, ...s }; } catch (e) {}
if (Q.preset === "auto") Object.assign(Q, TIERS[curTier]);
const saveQ = () => { try { localStorage.setItem("vote4me-gfx", JSON.stringify(Q)); } catch (e) {} };

/* ---------- viewer ---------- */
status("Starting the 3D engine", .05);
if (CFG.cesiumIonToken) C.Ion.defaultAccessToken = CFG.cesiumIonToken;
if (CFG.googleMapsKey) C.GoogleMaps.defaultApiKey = CFG.googleMapsKey;
const viewer = new C.Viewer("globe", {
  globe: false, baseLayerPicker: false, geocoder: false, homeButton: false, sceneModePicker: false, navigationHelpButton: false,
  animation: false, timeline: false, fullscreenButton: false, infoBox: false, selectionIndicator: false, vrButton: false,
  skyAtmosphere: new C.SkyAtmosphere(), msaaSamples: 4, contextOptions: { webgl: { powerPreference: "high-performance" } },
});
const scene = viewer.scene, camera = viewer.camera;
scene.skyAtmosphere.show = true;
scene.fog.enabled = true; scene.fog.density = 2.0e-4;
scene.screenSpaceCameraController.enableInputs = false;
scene.highDynamicRange = false;
camera.frustum.near = 0.1;
let tileset;
try {
  status("Connecting to Google Photorealistic 3D Tiles", .1);
  tileset = await C.createGooglePhotorealistic3DTileset({ onlyUsingWithGoogleGeocoder: true }, { maximumScreenSpaceError: Q.sse, enableCollision: false, cacheBytes: 1024 * 1024 * 1024 });
  scene.primitives.add(tileset);
} catch (e) {
  status("Couldn't open the 3D tiles: " + (e && e.message ? e.message : e) + ". Check the key in config.js and that it allows this website.");
  throw e;
}

/* ---------- player state ---------- */
const EYE = 1.7, R = 0.35, STEP = 0.55;
const P = { lat: PLACES[0].lat, lon: PLACES[0].lon, h: 147.5, heading: C.Math.toRadians(PLACES[0].face), pitch: C.Math.toRadians(2), vx: 0, vy: 0, fly: false, ready: false };
const scratch = { enu: new C.Matrix4(), e: new C.Cartesian3(), n: new C.Cartesian3(), u: new C.Cartesian3() };
function frameAt(pos) {
  C.Transforms.eastNorthUpToFixedFrame(pos, C.Ellipsoid.WGS84, scratch.enu);
  C.Matrix4.getColumn(scratch.enu, 0, scratch.e); C.Matrix4.getColumn(scratch.enu, 1, scratch.n); C.Matrix4.getColumn(scratch.enu, 2, scratch.u);
  return { e: C.Cartesian3.clone(scratch.e), n: C.Cartesian3.clone(scratch.n), u: C.Cartesian3.clone(scratch.u) };
}
const eyePos = () => C.Cartesian3.fromDegrees(P.lon, P.lat, P.h);
const exclude = [];
function rayHit(origin, dir) {
  try { const r = scene.pickFromRay(new C.Ray(origin, dir), exclude, 0.1); return r && r.position ? r.position : null; } catch (e) { return null; }
}
/* height of the surface under a point: cast down from just above eye level so tree canopies above you are ignored */
/* Ground anywhere in this 2.5 km square is 25–160 m above sea level, i.e. roughly 75–215 m above the
   WGS84 ellipsoid that the tiles use. Anything outside that came from a coarse, not-yet-refined tile. */
const H_MIN = 60, H_MAX = 260;
const plausible = h => h != null && isFinite(h) && h > H_MIN && h < H_MAX;
function groundUnder(lat, lon, fromH) {
  const o = C.Cartesian3.fromDegrees(lon, lat, fromH), f = frameAt(o);
  const hit = rayHit(o, C.Cartesian3.negate(f.u, new C.Cartesian3()));
  const h = hit ? C.Cartographic.fromCartesian(hit).height : null;
  return plausible(h) ? h : null;
}
function wallAhead(lat, lon, feetH, dirE, dirN, dist) {
  for (const up of [0.45, 1.25]) {
    const o = C.Cartesian3.fromDegrees(lon, lat, feetH + up), f = frameAt(o);
    const d = C.Cartesian3.add(C.Cartesian3.multiplyByScalar(f.e, dirE, new C.Cartesian3()), C.Cartesian3.multiplyByScalar(f.n, dirN, new C.Cartesian3()), new C.Cartesian3());
    C.Cartesian3.normalize(d, d);
    const hit = rayHit(o, d);
    if (hit && C.Cartesian3.distance(hit, o) < dist) return true;
  }
  return false;
}
const M_PER_DEG_LAT = 111320, mPerDegLon = lat => 111320 * Math.cos(lat * Math.PI / 180);
function distFromMcEwan(lat, lon) { return Math.hypot((lat - MCEWAN.lat) * M_PER_DEG_LAT, (lon - MCEWAN.lon) * mPerDegLon(lat)); }

/* ---------- input ---------- */
const keys = new Set(); let started = false, locked = false;
addEventListener("keydown", e => {
  if (!started || e.target.tagName === "INPUT") return;
  const k = e.key.toLowerCase(); keys.add(k);
  if (k === "e" && nearStand) openPoster(nearStand.img);
  if (k === "f") toggleFly();
  if (["arrowup", "arrowdown", "arrowleft", "arrowright", " "].includes(k)) e.preventDefault();
});
addEventListener("keyup", e => keys.delete(e.key.toLowerCase()));
addEventListener("blur", () => keys.clear());
const canvas = scene.canvas;
canvas.addEventListener("click", () => { if (!started || isTouch) return; for (const id of ["places", "settings"]) $(id).hidden = true; try { const r = canvas.requestPointerLock(); if (r && r.catch) r.catch(() => {}); } catch (e) {} });
document.addEventListener("pointerlockchange", () => { locked = document.pointerLockElement === canvas; $("cross").hidden = !locked; });
document.addEventListener("mousemove", e => { if (!locked) return; P.heading += e.movementX * .0022; P.pitch = C.Math.clamp(P.pitch - e.movementY * .0022, -1.45, 1.45); });
let drag = null;
canvas.addEventListener("pointerdown", e => { if (!started || locked) return; drag = { id: e.pointerId, x: e.clientX, y: e.clientY }; try { canvas.setPointerCapture(e.pointerId); } catch (_) {} });
canvas.addEventListener("pointermove", e => { if (!drag || drag.id !== e.pointerId) return; const s = isTouch ? .0045 : .003; P.heading += (e.clientX - drag.x) * s; P.pitch = C.Math.clamp(P.pitch - (e.clientY - drag.y) * s, -1.45, 1.45); drag.x = e.clientX; drag.y = e.clientY; });
canvas.addEventListener("pointerup", e => { if (drag && drag.id === e.pointerId) drag = null; });
canvas.addEventListener("pointercancel", () => { drag = null; });
const joy = $("joy"), knob = joy.firstElementChild; let jv = { x: 0, y: 0 }, jid = null;
function jset(e) { const r = joy.getBoundingClientRect(); let dx = e.clientX - (r.left + r.width / 2), dy = e.clientY - (r.top + r.height / 2); const l = Math.hypot(dx, dy), m = r.width / 2 - 12; if (l > m) { dx = dx / l * m; dy = dy / l * m; } knob.style.transform = `translate(${dx}px,${dy}px)`; jv = { x: dx / m, y: dy / m }; }
joy.addEventListener("pointerdown", e => { jid = e.pointerId; joy.setPointerCapture(jid); jset(e); e.stopPropagation(); });
joy.addEventListener("pointermove", e => { if (e.pointerId === jid) jset(e); });
const jend = () => { jid = null; jv = { x: 0, y: 0 }; knob.style.transform = ""; };
joy.addEventListener("pointerup", jend); joy.addEventListener("pointercancel", jend);

function toggleFly(force) {
  P.fly = force != null ? force : !P.fly;
  $("bfly").setAttribute("aria-pressed", String(P.fly)); $("bfly").textContent = P.fly ? "Land" : "Fly";
  if (P.fly) P.h += 25; else land();
}
/* Sampled heights come from the top-most surface, so a tree canopy can hide the pavement.
   Take a ring of samples a few metres round the point and keep the lowest: that is the ground. */
async function floorAt(lat, lon) {
  const pts = [[0, 0]]; for (let k = 0; k < 8; k++) { const a = k / 8 * Math.PI * 2; pts.push([Math.cos(a) * 3.5, Math.sin(a) * 3.5]); }
  const cs = pts.map(([dx, dn]) => new C.Cartographic(C.Math.toRadians(lon + dx / mPerDegLon(lat)), C.Math.toRadians(lat + dn / M_PER_DEG_LAT)));
  let hs = [];
  try { const r = await scene.sampleHeightMostDetailed(cs, exclude); hs = r.map(c => c && c.height).filter(plausible); } catch (e) {}
  if (!hs.length) for (const c of cs) { const h = groundUnder(C.Math.toDegrees(c.latitude), C.Math.toDegrees(c.longitude), 900); if (h != null) hs.push(h); }
  if (!hs.length) return null;
  hs.sort((a, b) => a - b); return hs[Math.floor((hs.length - 1) * .25)];
}
async function land() { const g = await floorAt(P.lat, P.lon); if (g != null) { P.h = g + EYE; P.targetH = P.h; } }
$("bfly").onclick = () => toggleFly();

/* ---------- places and settings panels ---------- */
$("plist").innerHTML = PLACES.map((p, i) => `<button type="button" data-i="${i}">${p.t}<small>${Math.round(distFromMcEwan(p.lat, p.lon))} m from McEwan Hall</small></button>`).join("");
$("plist").addEventListener("click", async e => {
  const b = e.target.closest("button"); if (!b) return; const p = PLACES[+b.dataset.i];
  $("places").hidden = true; P.lat = p.lat; P.lon = p.lon; P.heading = C.Math.toRadians(p.face); P.pitch = C.Math.toRadians(3); P.vx = P.vy = 0;
  P.h = Math.max(P.h, 200); toggleFly(false);
});
const openPanel = id => { for (const o of ["places", "settings"]) $(o).hidden = o !== id ? true : !$(o).hidden; if (document.pointerLockElement) document.exitPointerLock(); };
$("bplaces").onclick = () => openPanel("places");
$("bset").onclick = () => { syncUI(); openPanel("settings"); };
const SEGS = {
  sq: { key: "preset", opts: [["auto", "Auto"], ["low", "Low"], ["medium", "Med"], ["high", "High"], ["ultra", "Ultra"]] },
  saa: { key: "aa", opts: [[0, "Off"], [1, "FXAA"], [2, "MSAA 4×"]] },
};
for (const [id, def] of Object.entries(SEGS)) {
  $(id).innerHTML = def.opts.map(([v, l]) => `<button type="button" data-v="${v}">${l}</button>`).join("");
  $(id).addEventListener("click", e => {
    const b = e.target.closest("button"); if (!b) return;
    if (def.key === "preset") { Q.preset = b.dataset.v; if (Q.preset === "auto") curTier = AUTO; Object.assign(Q, TIERS[Q.preset === "auto" ? curTier : Q.preset]); }
    else { Q[def.key] = +b.dataset.v; Q.preset = "custom"; }
    saveQ(); applyQ();
  });
}
const bindRange = (id, key, fmt, conv) => {
  $(id).addEventListener("input", e => { Q[key] = conv(e.target.value); if (key !== "fov") Q.preset = "custom"; $("v" + id.slice(1)).textContent = fmt(Q[key]); applyQ(true); });
  $(id).addEventListener("change", () => { saveQ(); applyQ(); });
};
bindRange("sdet", "sse", v => v <= 2 ? "Max" : v <= 6 ? "High" : v <= 12 ? "Medium" : "Low", x => 33 - +x);
bindRange("sres", "res", v => Math.round(v * 100) + "%", x => +x / 100);
bindRange("sfov", "fov", v => v + "°", x => +x);
$("tao").addEventListener("change", e => { Q.ao = e.target.checked; Q.preset = "custom"; saveQ(); applyQ(); });
$("tfps").addEventListener("change", e => { Q.fps = e.target.checked; saveQ(); applyQ(); });
function syncUI() {
  for (const [id, def] of Object.entries(SEGS)) for (const b of $(id).children) b.setAttribute("aria-pressed", String(String(Q[def.key]) === b.dataset.v));
  $("sdet").value = 33 - Q.sse; $("vdet").textContent = Q.sse <= 2 ? "Max" : Q.sse <= 6 ? "High" : Q.sse <= 12 ? "Medium" : "Low";
  $("sres").value = Math.round(Q.res * 100); $("vres").textContent = Math.round(Q.res * 100) + "%";
  $("sfov").value = Q.fov; $("vfov").textContent = Q.fov + "°";
  $("tao").checked = !!Q.ao; $("tfps").checked = !!Q.fps;
  $("vq").textContent = Q.preset === "auto" ? "Auto · " + curTier : Q.preset;
}
function applyQ(light) {
  tileset.maximumScreenSpaceError = Q.sse;
  viewer.resolutionScale = Math.max(.35, Math.min(2.5, Q.res));
  viewer.useBrowserRecommendedResolution = false;
  scene.postProcessStages.fxaa.enabled = Q.aa === 1;
  if (!light) { try { scene.msaaSamples = Q.aa === 2 ? 4 : 1; } catch (e) {} }
  const ao = scene.postProcessStages.ambientOcclusion; ao.enabled = !!Q.ao;
  if (Q.ao) { ao.uniforms.intensity = 2.2; ao.uniforms.bias = .1; ao.uniforms.lengthCap = .26; ao.uniforms.stepSize = 1.6; ao.uniforms.blurStepSize = .86; ao.uniforms.ambientOcclusionOnly = false; }
  camera.frustum.fov = C.Math.toRadians(Q.fov);
  $("fps").hidden = !Q.fps || !started;
  syncUI();
}
applyQ();

/* auto quality: settle on the best level that holds about 50+ fps */
let goodSince = 0;
function autoTune(fps, now) {
  if (Q.preset !== "auto") return;
  const i = TIER_NAMES.indexOf(curTier);
  if (fps < 38) {
    if (Q.res > .6) Q.res = Math.max(.55, +(Q.res - .1).toFixed(2));
    else if (i > 0) { curTier = TIER_NAMES[i - 1]; Object.assign(Q, TIERS[curTier]); }
    else Q.sse = Math.min(32, Q.sse + 4);
    applyQ(); goodSince = now;
  } else if (fps > 56) {
    if (now - goodSince > 6000) {
      goodSince = now; const top = TIERS[curTier];
      if (Q.res < top.res - .01) { Q.res = Math.min(top.res, +(Q.res + .1).toFixed(2)); applyQ(); }
      else if (Q.sse > top.sse) { Q.sse = top.sse; applyQ(); }
      else if (i < 3 && i <= TIER_NAMES.indexOf(AUTO) && fps > 58) { curTier = TIER_NAMES[i + 1]; Object.assign(Q, TIERS[curTier]); applyQ(); }
    }
  } else goodSince = now;
}

/* ---------- loading: wait for the start point to stream in at full detail ---------- */
/* stand at street level where the walk begins and let that view stream in fully before measuring the ground */
camera.setView({ destination: C.Cartesian3.fromDegrees(P.lon, P.lat, P.h), orientation: { heading: P.heading, pitch: P.pitch, roll: 0 } });
status("Streaming Bristo Square", .2);
let loaded = 0;
tileset.loadProgress.addEventListener((pending, processing) => { if (!P.ready) status(`Streaming Bristo Square · ${pending + processing} tiles to go`, Math.min(.8, .2 + loaded++ / 400)); });
await new Promise(res => { const t = setTimeout(res, 45000); const off = tileset.allTilesLoaded.addEventListener(() => { clearTimeout(t); off(); res(); }); });
{ const g = await floorAt(P.lat, P.lon); if (g != null) { P.h = g + EYE; P.targetH = P.h; } }
P.ready = true;
/* poster stands: a slim dark frame, two legs and the poster face, standing on the sampled pavement */
/* stands are put up when you come within 200 m, so start-up only streams the start point */
async function raiseStand(s) {
  s.placing = true;
  const gh = await floorAt(s.lat, s.lon); if (gh == null) { s.retry = performance.now() + 4000; s.placing = false; return; } s.gh = gh;
  const hpr = new C.HeadingPitchRoll(C.Math.toRadians(s.face), 0, 0);
  const at = (dz, side = 0) => {
    const base = C.Cartesian3.fromDegrees(s.lon, s.lat, gh + dz); if (!side) return base;
    const f = frameAt(base), a = C.Math.toRadians(s.face);
    const right = C.Cartesian3.add(C.Cartesian3.multiplyByScalar(f.e, Math.cos(a), new C.Cartesian3()), C.Cartesian3.multiplyByScalar(f.n, -Math.sin(a), new C.Cartesian3()), new C.Cartesian3());
    return C.Cartesian3.add(base, C.Cartesian3.multiplyByScalar(right, side, right), new C.Cartesian3());
  };
  const ori = p => C.Transforms.headingPitchRollQuaternion(p, hpr);
  const W = 1.5, H = s.img === 0 ? 2.25 : 2.12, mid = 0.55 + H / 2;
  const ents = [
    viewer.entities.add({ position: at(mid), orientation: ori(at(mid)), box: { dimensions: new C.Cartesian3(W + .12, .06, H + .12), material: C.Color.fromCssColorString("#151a2e") } }),
    viewer.entities.add({ position: at(.3, -W / 2 + .1), orientation: ori(at(.3)), box: { dimensions: new C.Cartesian3(.05, .05, .6), material: C.Color.fromCssColorString("#151a2e") } }),
    viewer.entities.add({ position: at(.3, W / 2 - .1), orientation: ori(at(.3)), box: { dimensions: new C.Cartesian3(.05, .05, .6), material: C.Color.fromCssColorString("#151a2e") } }),
    viewer.entities.add({ position: at(mid), orientation: ori(at(mid)), plane: { plane: new C.Plane(C.Cartesian3.UNIT_Y, -.035), dimensions: new C.Cartesian2(W, H), material: new C.ImageMaterialProperty({ image: POSTERS[s.img] }) } }),
  ];
  exclude.push(...ents); s.placed = true;
}

/* ---------- main loop ---------- */
let nearStand = null, last = performance.now(), fN = 0, fT = performance.now(), groundCooldown = 0, bob = 0;
scene.preRender.addEventListener(() => {
  const now = performance.now(), dt = Math.min(.05, (now - last) / 1000); last = now;
  if (started) {
    let f = 0, s = 0;
    if (keys.has("w") || keys.has("arrowup")) f += 1; if (keys.has("s") || keys.has("arrowdown")) f -= 1;
    if (keys.has("a")) s -= 1; if (keys.has("d")) s += 1;
    if (keys.has("arrowleft")) P.heading -= 1.7 * dt; if (keys.has("arrowright")) P.heading += 1.7 * dt;
    if (jv.x || jv.y) { f -= jv.y; s += jv.x; }
    const speed = P.fly ? (keys.has("shift") ? 40 : 14) : (keys.has("shift") ? 4.6 : 1.7) * (isTouch ? 1.3 : 1);
    let tx = 0, ty = 0; const l = Math.hypot(f, s);
    if (l > 0) { const m = Math.min(1, l); f /= l; s /= l; const sh = Math.sin(P.heading), ch = Math.cos(P.heading);
      tx = (sh * f + ch * s) * speed * m; ty = (ch * f - sh * s) * speed * m; }
    const a = 1 - Math.exp(-dt * 9); P.vx += (tx - P.vx) * a; P.vy += (ty - P.vy) * a;
    const v = Math.hypot(P.vx, P.vy);
    if (P.fly) {
      if (keys.has(" ")) P.h += 12 * dt; if (keys.has("c") || keys.has("control")) P.h -= 12 * dt;
      P.lat += P.vy * dt / M_PER_DEG_LAT; P.lon += P.vx * dt / mPerDegLon(P.lat);
    } else if (v > .02) {
      const nLat = P.lat + P.vy * dt / M_PER_DEG_LAT, nLon = P.lon + P.vx * dt / mPerDegLon(P.lat);
      const feet = P.h - EYE;
      const blocked = wallAhead(P.lat, P.lon, feet, P.vx / v, P.vy / v, R + v * dt + .05);
      const g = blocked ? null : groundUnder(nLat, nLon, P.h + .4);
      if (!blocked && (g == null || (g - feet < STEP && feet - g < 6)) && distFromMcEwan(nLat, nLon) < 2600) {
        P.lat = nLat; P.lon = nLon; bob += dt * v * 3.1;
        if (g != null) P.targetH = g + EYE;
      } else { P.vx *= .2; P.vy *= .2; }
    }
    if (!P.fly) {
      if ((groundCooldown -= dt) <= 0) { groundCooldown = .12; let g = groundUnder(P.lat, P.lon, P.h + .4); if (g != null && P.h - EYE - g > 6) g = null; if (g == null && (P.miss = (P.miss || 0) + 1) > 8) { g = groundUnder(P.lat, P.lon, P.h + 300); P.miss = 0; } if (g != null) { P.targetH = g + EYE; P.miss = 0; } }
      if (P.targetH != null) P.h += (P.targetH - P.h) * Math.min(1, dt * (P.targetH < P.h ? 6 : 12));
    }
    nearStand = null; let best = 7;
    for (const st of STANDS) { const d = Math.hypot((st.lat - P.lat) * M_PER_DEG_LAT, (st.lon - P.lon) * mPerDegLon(P.lat)); if (st.placed && d < best) { best = d; nearStand = st; } if (!st.placed && !st.placing && d < 200 && !(st.retry > now)) raiseStand(st); }
    $("prompt").hidden = !nearStand || !$("poster").hidden;
  }
  const amp = P.fly ? 0 : Math.min(1, Math.hypot(P.vx, P.vy) / 2);
  camera.setView({ destination: C.Cartesian3.fromDegrees(P.lon, P.lat, P.h + Math.abs(Math.sin(bob)) * .04 * amp), orientation: { heading: P.heading, pitch: P.pitch, roll: 0 } });
  fN++;
  if (now - fT > 1500) {
    const fps = fN / ((now - fT) / 1000); fN = 0; fT = now;
    if (started) autoTune(fps, now);
    if (Q.fps) $("fps").textContent = `${Math.round(fps)} fps · ${Math.round(Q.res * 100)}% · ${Q.preset === "auto" ? "Auto " + curTier : Q.preset}`;
    $("qstat").textContent = `${Q.preset === "auto" ? `Auto picked ${curTier} for ${gpu.replace(/^ANGLE \(|\)$/g, "").slice(0, 60)}. ` : ""}${Math.round(fps)} fps at ${Math.round(Q.res * 100)}% resolution.`;
  }
});
$("bread").onclick = () => nearStand && openPoster(nearStand.img);

status("Ready", 1);
const go = $("go"); go.disabled = false; go.textContent = "Step onto Bristo Square";
go.onclick = () => {
  started = true; $("start").hidden = true;
  for (const id of ["who", "tools", "cta"]) $(id).hidden = false;
  $("hint").hidden = isTouch; $("joy").hidden = !isTouch; applyQ();
  if (!isTouch) { try { const r = canvas.requestPointerLock(); if (r && r.catch) r.catch(() => {}); } catch (e) {} }
};
window.__vote4me = { P, viewer, tileset, Q, STANDS };
