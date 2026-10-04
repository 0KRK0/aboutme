/* Rajesh World layout: the island, districts, exhibits and trees, in tile units.
   Shared by the isometric map view and the 3D walk-through. */

import { zones, secretSpot, type Zone, type Exhibit, type Lane } from '../data';

/* ── geometry ─────────────────────────────────────────────── */
export const N = 56, C = 28, TW = 64, TH = 32;
export type V = { x: number; y: number };
export const iso = (x: number, y: number, z = 0) => ({ sx: (x - y) * TW / 2, sy: (x + y) * TH / 2 - z });
export const dist = (a: V, b: V) => Math.hypot(a.x - b.x, a.y - b.y);

export function rng(seed: number) { return () => { seed |= 0; seed = seed + 0x6D2B79F5 | 0; let t = Math.imul(seed ^ seed >>> 15, 1 | seed); t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t; return ((t ^ t >>> 14) >>> 0) / 4294967296; }; }
export const islandR = (a: number) => 23.6 + 1.5 * Math.sin(3 * a) + 1.1 * Math.cos(5 * a + 1);
export const isLand = (x: number, y: number) => { const dx = x - C, dy = y - C; return Math.hypot(dx, dy) < islandR(Math.atan2(dy, dx)); };

export interface Placed extends Exhibit { x: number; y: number; zone: string; lane: Lane }
export interface ZoneL extends Zone { cx: number; cy: number; v: V; road: V[]; b: { x0: number; y0: number; x1: number; y1: number; h: number } }

export function layout() {
  const zs: ZoneL[] = zones.map(z => {
    const th = z.angle * Math.PI / 180, Rs = 22;
    const sx = Rs * Math.sin(th), sy = -Rs * Math.cos(th);
    const cx = C + (sx + sy) / 2, cy = C + (sy - sx) / 2;
    // buildings sit on the far side of their plaza as seen on screen, so they never hide the exhibits
    const up = { x: -Math.SQRT1_2, y: -Math.SQRT1_2 };
    const len = Math.hypot(cx - C, cy - C); const away = { x: (cx - C) / len, y: (cy - C) / len };
    const u = Math.cos(th) < -.2 ? up : away;
    const v = { x: -u.x, y: -u.y };
    const bx = cx + u.x * 2.6, by = cy + u.y * 2.6;
    const { w, d, h } = z.building;
    // road from the hub; if the building stands between hub and plaza, the road bends around it
    const perp = { x: -u.y, y: u.x };
    const road: V[] = u === up
      ? [{ x: C, y: C }, { x: cx + u.x * 1.2 + perp.x * 4.4, y: cy + u.y * 1.2 + perp.y * 4.4 }, { x: cx, y: cy }]
      : [{ x: C, y: C }, { x: cx, y: cy }];
    return { ...z, cx, cy, v, road, b: { x0: bx - w / 2, y0: by - d / 2, x1: bx + w / 2, y1: by + d / 2, h } };
  });
  const props: Placed[] = [];
  for (const z of zs) {
    const perp = { x: -z.v.y, y: z.v.x };
    const n = z.exhibits.length, perRow = n > 5 ? Math.ceil(n / 2) : n;
    z.exhibits.forEach((e, i) => {
      const row = Math.floor(i / perRow), col = i % perRow, cols = Math.min(perRow, n - row * perRow);
      const off = (col - (cols - 1) / 2) * 1.55;
      props.push({ ...e, zone: z.id, lane: z.lane, x: z.cx + z.v.x * (0.6 + row * 1.7) + perp.x * off, y: z.cy + z.v.y * (0.6 + row * 1.7) + perp.y * off });
    });
  }
  // tiles: 0 water, 1 land, 2 path, 3 plaza, 4 zone floor
  const tiles = new Uint8Array(N * N);
  const zoneTint = new Int8Array(N * N).fill(-1);
  for (let y = 0; y < N; y++) for (let x = 0; x < N; x++) {
    const px = x + .5, py = y + .5;
    if (!isLand(px, py)) continue;
    let t = 1;
    if (dist({ x: px, y: py }, { x: C, y: C }) < 3.6) t = 3;
    zs.forEach((z, zi) => { if (dist({ x: px, y: py }, { x: z.cx, y: z.cy }) < 3.4) { t = 4; zoneTint[y * N + x] = zi; } });
    if (t === 1) outer: for (const z of zs) for (let i = 0; i < z.road.length - 1; i++) {
      const ax = z.road[i].x, ay = z.road[i].y, bx = z.road[i + 1].x, by = z.road[i + 1].y;
      const l2 = (bx - ax) ** 2 + (by - ay) ** 2; let k = ((px - ax) * (bx - ax) + (py - ay) * (by - ay)) / l2; k = Math.max(0, Math.min(1, k));
      if (Math.hypot(px - (ax + k * (bx - ax)), py - (ay + k * (by - ay))) < .95) { t = 2; break outer; }
    }
    tiles[y * N + x] = t;
  }
  // trees: deterministic scatter, kept clear of paths, plazas and buildings
  const r = rng(7), trees: V[] = [];
  const clearOf = (x: number, y: number) => zs.every(z => x < z.b.x0 - 1.4 || x > z.b.x1 + 1.4 || y < z.b.y0 - 1.4 || y > z.b.y1 + 1.4);
  for (let y = 0; y < N; y++) for (let x = 0; x < N; x++) {
    const px = x + .2 + r() * .6, py = y + .2 + r() * .6;
    if (tiles[y * N + x] !== 1 || !isLand(px + .8, py + .8) || !isLand(px - .8, py - .8)) continue;
    if (dist({ x: px, y: py }, secretSpot) < 3.3) continue;
    const edge = Math.hypot(px - C, py - C) > islandR(Math.atan2(py - C, px - C)) - 4.5;
    if (r() < (edge ? .2 : .06) && clearOf(px, py) && zs.every(z => dist({ x: px, y: py }, { x: z.cx, y: z.cy }) > 4.2)) trees.push({ x: px, y: py });
  }
  // the hedge around the old server: a ring of trees with one gap facing away from the hub
  for (let i = 0; i < 16; i++) {
    const a = i / 16 * Math.PI * 2;
    const gap = Math.atan2(secretSpot.y - C, secretSpot.x - C); // gap points outward
    if (Math.abs(Math.atan2(Math.sin(a - gap), Math.cos(a - gap))) < .42) continue;
    trees.push({ x: secretSpot.x + Math.cos(a) * 2.2, y: secretSpot.y + Math.sin(a) * 2.2 });
  }
  return { zs, props, tiles, zoneTint, trees };
}

