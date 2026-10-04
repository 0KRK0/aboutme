/* Builds the 3D island from the same layout the isometric map uses: terrain, sea,
   sky, roads, the hub, trees, and one enterable building per district. Each
   building has one or more floors, and its inside walls carry the exhibits. */

import {
  Scene, Group, Mesh, Object3D, BoxGeometry, PlaneGeometry, CylinderGeometry, ConeGeometry, SphereGeometry, CircleGeometry,
  RingGeometry, TorusGeometry, BufferGeometry, Float32BufferAttribute, MeshStandardMaterial, MeshBasicMaterial, InstancedMesh,
  Color, Points, PointsMaterial, Vector3, ShaderMaterial, BackSide, DoubleSide, Material, Texture, Sprite,
} from 'three';
import { layout, C, islandR, type ZoneL, type Placed } from '../world/layout';
import { contentFor } from '../world/panels';
import { mergeGeometries } from 'three/examples/jsm/utils/BufferGeometryUtils.js';
import { secretSpot, identity, type Lane } from '../data';
import { LANE, panelTexture, bannerTexture, labelSprite, glowTexture, additive, type PanelInfo } from './tex';

export const S = 4;              // metres per map tile
export const FH = 5.2;           // floor height
const WT = 0.5;                  // wall thickness
const DW = 3.8, DH = 3.6;        // door width and height
export const toW = (tx: number, ty: number) => ({ x: (tx - C) * S, z: (ty - C) * S });

export interface Box { x0: number; x1: number; z0: number; z1: number; lv: number } // lv: -1 every level, -2 levels ≥ 1, n only level n
export interface Spot {
  kind: 'panel' | 'hub' | 'secret' | 'lift';
  id: string; label: string; level: number; pos: Vector3; normal: Vector3;
  target?: Placed | { id: 'hub' } | { id: 'secret' }; bld?: Bld; lane: Lane;
}
export interface Bld {
  zone: ZoneL; i: number; floors: number; lane: Lane;
  inner: { x0: number; x1: number; z0: number; z1: number };
  c: Vector3; f: Vector3; r: Vector3; hf: number; hr: number;
  door: Vector3; panels: { mesh: Mesh; info: PanelInfo; loaded: boolean }[];
  liftCol?: Mesh;
}

/** Plain text for a wall, taken from the same panel the map view opens. */
export function infoFor(t: Placed | { id: 'hub' } | { id: 'secret' }, lane: Lane): PanelInfo {
  const d = new DOMParser().parseFromString(`<div>${contentFor(t)}</div>`, 'text/html');
  const txt = (s: string) => (d.querySelector(s)?.textContent ?? '').replace(/\s+/g, ' ').trim();
  const metrics = [...d.querySelectorAll('.w-m')].map(m => ({ v: m.querySelector('b')?.textContent ?? '', k: m.querySelector('span')?.textContent ?? '' }));
  const body = d.querySelector('.w-p-body');
  body?.querySelectorAll('.w-metrics, .tags').forEach(n => n.remove());
  body?.querySelectorAll('li').forEach(li => { li.textContent = '• ' + li.textContent + ' '; });
  const ln = (d.querySelector('.w-p-head') as HTMLElement | null)?.dataset.lane as Lane | undefined;
  return { kicker: txt('.eyebrow'), title: txt('.w-p-title'), body: (body?.textContent ?? '').replace(/\s+/g, ' ').trim(), metrics, lane: ln && LANE[ln] ? ln : lane };
}

function std(color: string, o: Partial<{ rough: number; metal: number; emissive: string; ei: number; flat: boolean; opacity: number }> = {}) {
  return new MeshStandardMaterial({
    color, roughness: o.rough ?? .8, metalness: o.metal ?? 0, emissive: o.emissive ?? '#000000', emissiveIntensity: o.ei ?? 1,
    flatShading: o.flat ?? false, transparent: o.opacity !== undefined, opacity: o.opacity ?? 1,
  });
}

export function buildWorld(scene: Scene, opts: { shadows: boolean; low: boolean }) {
  const L = layout();
  const colliders: Box[] = [];
  const circles: { x: number; z: number; r: number }[] = [];
  const spots: Spot[] = [];
  const occluders: Object3D[] = [];
  const blds: Bld[] = [];
  const animated: ((t: number) => void)[] = [];
  const disposables: { dispose(): void }[] = [];
  const keep = <T extends { dispose(): void }>(x: T) => { disposables.push(x); return x; };

  const statics = new Group(); scene.add(statics);
  const cast = (m: Mesh, receive = true) => { if (opts.shadows) { m.castShadow = true; m.receiveShadow = receive; } return m; };

  /* ── sky ──────────────────────────────────────────────── */
  const sunDir = new Vector3(-0.55, 0.5, -0.7).normalize();
  const sky = new Mesh(keep(new SphereGeometry(900, 32, 16)), keep(new ShaderMaterial({
    side: BackSide, depthWrite: false, fog: false,
    uniforms: { top: { value: new Color('#0b1638') }, mid: { value: new Color('#4b4f9a') }, hor: { value: new Color('#ffb48a') }, sun: { value: sunDir } },
    vertexShader: 'varying vec3 vP; void main(){ vP = normalize(position); gl_Position = projectionMatrix * modelViewMatrix * vec4(position,1.); }',
    fragmentShader: `uniform vec3 top; uniform vec3 mid; uniform vec3 hor; uniform vec3 sun; varying vec3 vP;
      void main(){ float h = vP.y; vec3 c = mix(hor, mid, smoothstep(-.02,.25,h)); c = mix(c, top, smoothstep(.25,.85,h));
        float s = max(dot(vP, sun), 0.); c += vec3(1.,.75,.5) * (pow(s, 900.) * 6. + pow(s, 12.) * .35);
        c = mix(c, vec3(.05,.08,.16), smoothstep(0.,-.25,h)); gl_FragColor = vec4(c,1.); }`,
  })));
  sky.renderOrder = -1; scene.add(sky);

  // stars
  {
    const n = opts.low ? 400 : 900, pos = new Float32Array(n * 3);
    for (let i = 0; i < n; i++) {
      const u = Math.random() * Math.PI * 2, v = Math.acos(1 - Math.random() * .9);
      pos.set([Math.sin(v) * Math.cos(u) * 850, Math.cos(v) * 850, Math.sin(v) * Math.sin(u) * 850], i * 3);
    }
    const g = keep(new BufferGeometry()); g.setAttribute('position', new Float32BufferAttribute(pos, 3));
    const stars = new Points(g, keep(new PointsMaterial({ size: 2.2, sizeAttenuation: false, color: '#dfe8ff', transparent: true, opacity: .75, fog: false })));
    scene.add(stars);
  }

  /* ── sea ──────────────────────────────────────────────── */
  const tU = { value: 0 };
  const seaMat = keep(new MeshStandardMaterial({ color: '#235f8c', roughness: .12, metalness: .4 }));
  seaMat.onBeforeCompile = sh => {
    sh.uniforms.uT = tU;
    sh.vertexShader = 'uniform float uT;\n' + sh.vertexShader.replace('#include <begin_vertex>',
      '#include <begin_vertex>\n transformed.z += sin(position.x*.045+uT*1.1)*.45 + cos(position.y*.06+uT*.8)*.35;');
  };
  const sea = new Mesh(keep(new PlaneGeometry(1600, 1600, opts.low ? 48 : 96, opts.low ? 48 : 96)), seaMat);
  sea.rotation.x = -Math.PI / 2; sea.position.y = -1.4; scene.add(sea);
  animated.push(t => { tU.value = t; });

  /* ── island ───────────────────────────────────────────── */
  {
    const segs = 160, rings = 46, pos: number[] = [], col: number[] = [], idx: number[] = [];
    const grass = new Color('#6fae74'), grass2 = new Color('#4f8f63'), sand = new Color('#e9d8ae'), wet = new Color('#7f8a7a');
    for (let r = 0; r <= rings; r++) {
      const k = r / rings * 1.16;
      for (let s = 0; s <= segs; s++) {
        const a = s / segs * Math.PI * 2, R = islandR(a) * k;
        const x = Math.cos(a) * R * S, z = Math.sin(a) * R * S;
        let y = 0; const c = new Color();
        if (k < .9) { y = (k > .5 ? Math.sin(a * 7 + k * 9) * .12 * (k - .5) : 0); c.copy(grass).lerp(grass2, .5 + .5 * Math.sin(a * 13 + k * 21)); }
        else if (k < 1.0) { const q = (k - .9) / .1; y = -q * .9; c.copy(grass).lerp(sand, Math.min(1, q * 1.6)); }
        else { const q = (k - 1) / .16; y = -.9 - q * 3.4; c.copy(sand).lerp(wet, q); }
        pos.push(x, y, z); col.push(c.r, c.g, c.b);
      }
    }
    for (let r = 0; r < rings; r++) for (let s = 0; s < segs; s++) {
      const a = r * (segs + 1) + s, b = a + segs + 1;
      idx.push(a, a + 1, b, b, a + 1, b + 1);
    }
    const g = keep(new BufferGeometry());
    g.setAttribute('position', new Float32BufferAttribute(pos, 3)); g.setAttribute('color', new Float32BufferAttribute(col, 3));
    g.setIndex(idx); g.computeVertexNormals();
    const land = new Mesh(g, keep(new MeshStandardMaterial({ vertexColors: true, roughness: .95 })));
    if (opts.shadows) land.receiveShadow = true;
    scene.add(land);
  }

  /* ── roads and plazas ─────────────────────────────────── */
  const stone = keep(std('#b9b1a2', { rough: .95 }));
  const plazaMat = keep(std('#a9a191', { rough: .9 }));
  for (const z of L.zs) {
    for (let i = 0; i < z.road.length - 1; i++) {
      const a = toW(z.road[i].x, z.road[i].y), b = toW(z.road[i + 1].x, z.road[i + 1].y);
      const len = Math.hypot(b.x - a.x, b.z - a.z);
      const m = new Mesh(keep(new PlaneGeometry(5, len + 5)), stone);
      m.rotation.x = -Math.PI / 2; m.rotation.z = -Math.atan2(b.x - a.x, b.z - a.z) + Math.PI;
      m.position.set((a.x + b.x) / 2, .03 + i * .002, (a.z + b.z) / 2);
      if (opts.shadows) m.receiveShadow = true; scene.add(m);
    }
    const c = toW(z.cx, z.cy);
    const p = new Mesh(keep(new CircleGeometry(13, 48)), plazaMat); p.rotation.x = -Math.PI / 2; p.position.set(c.x, .05, c.z);
    if (opts.shadows) p.receiveShadow = true; scene.add(p);
    const ring = new Mesh(keep(new RingGeometry(12.2, 12.8, 64)), keep(new MeshBasicMaterial({ color: LANE[z.lane], ...additive, opacity: .8 })));
    ring.rotation.x = -Math.PI / 2; ring.position.set(c.x, .07, c.z); scene.add(ring);
    const rm = ring.material as MeshBasicMaterial; const ph = z.key;
    animated.push(t => { rm.opacity = .45 + .35 * Math.sin(t * 1.6 + ph); });
  }

  /* ── the hub ──────────────────────────────────────────── */
  {
    const hubFloor = new Mesh(keep(new CircleGeometry(14.4, 64)), keep(std('#b8b0a0', { rough: .8 })));
    hubFloor.rotation.x = -Math.PI / 2; hubFloor.position.y = .06; if (opts.shadows) hubFloor.receiveShadow = true; scene.add(hubFloor);
    for (const [r, o] of [[5, .9], [9, .55], [13.6, .4]] as const) {
      const ring = new Mesh(keep(new RingGeometry(r - .18, r, 96)), keep(new MeshBasicMaterial({ color: LANE.main, ...additive, opacity: o })));
      ring.rotation.x = -Math.PI / 2; ring.position.y = .08; scene.add(ring);
    }
    const mono = cast(new Mesh(keep(new BoxGeometry(2.4, 10, 1.3)), keep(std('#0b0f1a', { rough: .18, metal: .7 }))));
    mono.position.y = 5; scene.add(mono);
    const edge = keep(new MeshBasicMaterial({ color: '#bfe3ff', toneMapped: false }));
    for (const sx of [-1.23, 1.23]) for (const sz of [-.67, .67]) { const e = new Mesh(keep(new BoxGeometry(.07, 10, .07)), edge); e.position.set(sx, 5, sz); scene.add(e); }
    const rings: Mesh[] = [];
    [[3.2, 6.2], [2.6, 7.6], [2.0, 8.8]].forEach(([r, y], i) => {
      const t = new Mesh(keep(new TorusGeometry(r, .07, 8, 96)), keep(new MeshBasicMaterial({ color: i === 1 ? LANE.ai : LANE.main, toneMapped: false })));
      t.position.y = y; t.rotation.x = Math.PI / 2; t.userData.dyn = true; scene.add(t); rings.push(t);
    });
    animated.push(t => rings.forEach((r, i) => { r.rotation.z = t * (.4 + i * .25) * (i % 2 ? -1 : 1); r.rotation.x = Math.PI / 2 + Math.sin(t * .7 + i) * .18; }));
    const name = labelSprite('RAJESH KUMAR KONA', identity.role + ' · ' + identity.location, 'main', 1.05);
    name.position.y = 14.2; scene.add(name); disposables.push((name.material as Material), (name.material as any).map as Texture);
    circles.push({ x: 0, z: 0, r: 2.2 });
    spots.push({ kind: 'hub', id: 'hub', label: 'Central hub', level: 0, pos: new Vector3(0, 1.6, 1.6), normal: new Vector3(0, 0, 1), target: { id: 'hub' }, lane: 'main' });
  }

  /* ── trees ────────────────────────────────────────────── */
  {
    const n = L.trees.length;
    const trunk = new InstancedMesh(keep(new CylinderGeometry(.22, .32, 2.4, 6)), keep(std('#7a5a40', { flat: true })), n);
    const leaf = new InstancedMesh(keep(new ConeGeometry(1.9, 4.2, 7)), keep(std('#ffffff', { flat: true, rough: .9 })), n);
    const leaf2 = new InstancedMesh(keep(new ConeGeometry(1.35, 3.0, 7)), keep(std('#ffffff', { flat: true, rough: .9 })), n);
    const o = new Object3D(), c = new Color();
    L.trees.forEach((t, i) => {
      const w = toW(t.x, t.y), s = .8 + ((i * 9301 + 49297) % 233280) / 233280 * .6;
      o.position.set(w.x, 1.2 * s, w.z); o.scale.setScalar(s); o.rotation.y = i; o.updateMatrix(); trunk.setMatrixAt(i, o.matrix);
      o.position.y = 3.7 * s; o.updateMatrix(); leaf.setMatrixAt(i, o.matrix);
      o.position.y = 5.6 * s; o.updateMatrix(); leaf2.setMatrixAt(i, o.matrix);
      c.setHSL(.3 + (i % 7) * .012, .42, .32 + (i % 5) * .03); leaf.setColorAt(i, c); c.offsetHSL(.01, .02, .06); leaf2.setColorAt(i, c);
      circles.push({ x: w.x, z: w.z, r: .7 * s });
    });
    for (const m of [trunk, leaf, leaf2]) { if (opts.shadows) { m.castShadow = true; } scene.add(m); }
  }

  /* ── the old build server, hidden in its hedge ────────── */
  {
    const w = toW(secretSpot.x, secretSpot.y);
    const rack = cast(new Mesh(keep(new BoxGeometry(1.3, 2.3, 1)), keep(std('#20242c', { rough: .5, metal: .6 }))));
    rack.position.set(w.x, 1.15, w.z); scene.add(rack);
    const leds: MeshBasicMaterial[] = [];
    for (let i = 0; i < 6; i++) {
      const m = keep(new MeshBasicMaterial({ color: i % 2 ? '#33c9a0' : '#ff7c46', toneMapped: false })); leds.push(m);
      const led = new Mesh(keep(new BoxGeometry(.12, .06, .02)), m); led.position.set(w.x - .4 + (i % 3) * .4, .6 + Math.floor(i / 3) * .9, w.z + .51); scene.add(led);
    }
    animated.push(t => leds.forEach((m, i) => { m.color.set(Math.sin(t * (3 + i) + i) > .2 ? (i % 2 ? '#33c9a0' : '#ff7c46') : '#222'); }));
    colliders.push({ x0: w.x - .9, x1: w.x + .9, z0: w.z - .8, z1: w.z + .8, lv: -1 });
    spots.push({ kind: 'secret', id: 'secret', label: 'An old build server', level: 0, pos: new Vector3(w.x, 1.4, w.z + .6), normal: new Vector3(0, 0, 1), target: { id: 'secret' }, lane: 'main' });
  }

  /* ── buildings ────────────────────────────────────────── */
  const KIND: Record<string, { wall: string; rough: number; metal: number }> = {
    towers: { wall: '#2d3b5c', rough: .3, metal: .55 }, vault: { wall: '#7d848f', rough: .35, metal: .75 },
    library: { wall: '#c7b896', rough: .85, metal: 0 }, gothic: { wall: '#7d746a', rough: .9, metal: 0 },
    lab: { wall: '#b9c6d6', rough: .45, metal: .15 }, dome: { wall: '#c3cad6', rough: .5, metal: .15 },
    studio: { wall: '#2b2b35', rough: .6, metal: .2 }, hall: { wall: '#b8ad9a', rough: .85, metal: 0 }, pavilion: { wall: '#c9b38f', rough: .8, metal: 0 },
  };
  const interiorWall = keep(std('#3a4560', { rough: .75, emissive: '#1c2438', ei: 1 }));
  const interiorFloor = keep(std('#1a2030', { rough: .3, metal: .3, emissive: '#0b0f18', ei: 1 }));
  const slabMat = keep(std('#3a4258', { rough: .7, emissive: '#151b2a', ei: 1 }));

  L.zs.forEach((z, i) => {
    const lane = z.lane, col = LANE[lane];
    const k = KIND[z.building.kind] ?? KIND.hall;
    const wallMat = keep(std(k.wall, { rough: k.rough, metal: k.metal }));
    const glow = keep(new MeshStandardMaterial({ color: '#111', emissive: col, emissiveIntensity: 1.6 }));
    const glass = keep(new MeshStandardMaterial({ color: '#0d1626', roughness: .15, metalness: .6, emissive: col, emissiveIntensity: .55 }));
    const wgX = keep(new BoxGeometry(1.7, 1.6, .06)), wgZ = keep(new BoxGeometry(.06, 1.6, 1.7));
    const winGeo = (alongX: boolean) => alongX ? wgX : wgZ;
    const x0 = (z.b.x0 - C) * S, x1 = (z.b.x1 - C) * S, z0 = (z.b.y0 - C) * S, z1 = (z.b.y1 - C) * S;
    const cx = (x0 + x1) / 2, cz = (z0 + z1) / 2;
    // door side: the wall whose outward normal points most toward the plaza
    const v = { x: z.v.x, z: z.v.y };
    const cands = [{ x: 1, z: 0 }, { x: -1, z: 0 }, { x: 0, z: 1 }, { x: 0, z: -1 }];
    const n = cands.reduce((a, b) => (b.x * v.x + b.z * v.z > a.x * v.x + a.z * v.z ? b : a));
    const f = new Vector3(n.x, 0, n.z), r = new Vector3(n.z, 0, -n.x);
    const hf = Math.abs(n.x) ? (x1 - x0) / 2 : (z1 - z0) / 2;
    const hr = Math.abs(n.x) ? (z1 - z0) / 2 : (x1 - x0) / 2;
    const backSlots = Math.max(1, Math.min(3, Math.floor((2 * hr - 2) / 5.4)));
    const sideSlots = Math.max(1, Math.min(2, Math.floor((2 * hf - 5) / 5.4)));
    const perFloor = backSlots + sideSlots * 2;
    const floors = Math.max(1, Math.min(3, Math.ceil(z.exhibits.length / perFloor)));
    const H = floors * FH;
    const g = new Group(); statics.add(g);
    const c = new Vector3(cx, 0, cz);
    const P = (a: number, b: number, y = 0) => c.clone().addScaledVector(f, a).addScaledVector(r, b).setY(y); // local (forward, right) → world

    // a wall segment between two local points along r at forward offset a
    const seg = (a: number, b0: number, b1: number, y0: number, y1: number, along: 'r' | 'f', mat: Material, coll: number | null, inner = true) => {
      const len = Math.abs(b1 - b0); if (len < .05) return;
      const mid = along === 'r' ? P(a, (b0 + b1) / 2, (y0 + y1) / 2) : P((b0 + b1) / 2, a, (y0 + y1) / 2);
      const alongX = along === 'r' ? Math.abs(r.x) > .5 : Math.abs(f.x) > .5;
      const geo = keep(alongX ? new BoxGeometry(len, y1 - y0, WT) : new BoxGeometry(WT, y1 - y0, len));
      const m = cast(new Mesh(geo, mat)); m.position.copy(mid); m.userData.occ = true; g.add(m);
      if (inner) { // interior lining, slightly inset
        const inw = along === 'r' ? f.clone().multiplyScalar(-Math.sign(a)) : r.clone().multiplyScalar(-Math.sign(a));
        const lg = keep(alongX ? new BoxGeometry(len - (along === 'r' ? 0 : 0), y1 - y0, .04) : new BoxGeometry(.04, y1 - y0, len));
        const lm = new Mesh(lg, interiorWall); lm.position.copy(mid).addScaledVector(inw, WT / 2 + .03); g.add(lm);
      }
      if (coll !== null) {
        const hx = alongX ? len / 2 : WT / 2 + .05, hz = alongX ? WT / 2 + .05 : len / 2;
        colliders.push({ x0: mid.x - hx, x1: mid.x + hx, z0: mid.z - hz, z1: mid.z + hz, lv: coll });
      }
    };
    // back wall, side walls, door wall (with the door gap on the ground floor)
    seg(-hf, -hr, hr, 0, H, 'r', wallMat, -1);
    seg(hr, -hf, hf, 0, H, 'f', wallMat, -1);
    seg(-hr, -hf, hf, 0, H, 'f', wallMat, -1);
    seg(hf, -hr, -DW / 2, 0, H, 'r', wallMat, -1);
    seg(hf, DW / 2, hr, 0, H, 'r', wallMat, -1);
    seg(hf, -DW / 2, DW / 2, DH, H, 'r', wallMat, null);
    // upper floors: the door gap is a wall
    { const m = P(hf, 0); const alongX = Math.abs(r.x) > .5; const hx = alongX ? DW / 2 : WT / 2 + .05, hz = alongX ? WT / 2 + .05 : DW / 2; colliders.push({ x0: m.x - hx, x1: m.x + hx, z0: m.z - hz, z1: m.z + hz, lv: -2 }); }
    // door frame glow + threshold
    { const alongX = Math.abs(r.x) > .5;
      const top = new Mesh(keep(alongX ? new BoxGeometry(DW + .3, .18, WT + .1) : new BoxGeometry(WT + .1, .18, DW + .3)), glow); top.position.copy(P(hf, 0, DH + .09)); g.add(top);
      for (const s of [-1, 1]) { const side = new Mesh(keep(alongX ? new BoxGeometry(.18, DH, WT + .1) : new BoxGeometry(WT + .1, DH, .18)), glow); side.position.copy(P(hf, s * (DW / 2 + .09), DH / 2)); g.add(side); }
      const mat = new Mesh(keep(new PlaneGeometry(DW, 3)), keep(new MeshBasicMaterial({ color: col, ...additive, opacity: .35 })));
      mat.rotation.x = -Math.PI / 2; mat.rotation.z = Math.atan2(f.x, f.z); mat.position.copy(P(hf + 1.6, 0, .09)); g.add(mat);
    }
    // floors, ceilings, roof
    const innerW = Math.abs(n.x) ? { x: 2 * hf - WT, z: 2 * hr - WT } : { x: 2 * hr - WT, z: 2 * hf - WT };
    const gf = new Mesh(keep(new BoxGeometry(innerW.x, .08, innerW.z)), interiorFloor); gf.position.set(cx, .04, cz); if (opts.shadows) gf.receiveShadow = true; g.add(gf);
    for (let lv = 1; lv <= floors; lv++) {
      const top = lv === floors;
      const sl = cast(new Mesh(keep(new BoxGeometry(top ? 2 * (Math.abs(n.x) ? hf : hr) + .4 : innerW.x, top ? .5 : .3, top ? 2 * (Math.abs(n.x) ? hr : hf) + .4 : innerW.z)), top ? wallMat : slabMat));
      sl.position.set(cx, lv * FH - (top ? -.25 : .15), cz); sl.userData.occ = true; g.add(sl);
      if (!top) { const fl = new Mesh(keep(new BoxGeometry(innerW.x, .02, innerW.z)), interiorFloor); fl.position.set(cx, lv * FH + .01, cz); g.add(fl); }
      // ceiling light strips
      const strip = new Mesh(keep(Math.abs(f.x) > .5 ? new BoxGeometry(innerW.x * .7, .05, .25) : new BoxGeometry(.25, .05, innerW.z * .7)), glow);
      strip.position.set(cx, lv * FH - .34, cz); g.add(strip);
    }
    // exterior window bands, per floor, on the side and back walls
    for (let lv = 0; lv < floors; lv++) {
      const y = lv * FH + 2.6;
      const band = (a: number, len: number, along: 'r' | 'f') => {
        const alongX = along === 'r' ? Math.abs(r.x) > .5 : Math.abs(f.x) > .5;
        const out = along === 'r' ? f.clone().multiplyScalar(Math.sign(a)) : r.clone().multiplyScalar(Math.sign(a));
        const n = Math.max(1, Math.floor(len / 2.6)), step = len / n;
        for (let q = 0; q < n; q++) {
          const o = -len / 2 + step * (q + .5);
          const m = new Mesh(winGeo(alongX), glass);
          m.position.copy(along === 'r' ? P(a, o, y) : P(o, a, y)).addScaledVector(out, WT / 2 + .03); g.add(m);
        }
      };
      band(-hf, 2 * hr - 2, 'r'); band(hr, 2 * hf - 2, 'f'); band(-hr, 2 * hf - 2, 'f');
      if (lv > 0) band(hf, 2 * hr - 2, 'r');
    }
    // plinth and a glowing cornice that outlines the roof at dusk
    { const ox = Math.abs(n.x) ? hf : hr, oz = Math.abs(n.x) ? hr : hf;
      const plinth = cast(new Mesh(keep(new BoxGeometry(2 * ox + .9, .7, 2 * oz + .9)), keep(std('#4a4f5c', { rough: .8 }))));
      plinth.position.set(cx, .35 - .62, cz); g.add(plinth);
      for (const [w2, d2, px, pz] of [[2 * ox + .7, .2, 0, oz + .25], [2 * ox + .7, .2, 0, -oz - .25], [.2, 2 * oz + .7, ox + .25, 0], [.2, 2 * oz + .7, -ox - .25, 0]] as const) {
        const cor = new Mesh(keep(new BoxGeometry(w2, .22, d2)), glow); cor.position.set(cx + px, H + .55, cz + pz); g.add(cor);
      }
    }
    // roof decoration by building kind
    const kind = z.building.kind;
    if (kind === 'dome' || kind === 'lab') {
      const d = cast(new Mesh(keep(new SphereGeometry(Math.min(hf, hr) * .85, 32, 16, 0, Math.PI * 2, 0, Math.PI / 2)),
        keep(new MeshStandardMaterial({ color: kind === 'lab' ? '#bfe3ff' : '#f5f7fb', roughness: .15, metalness: .3, transparent: kind === 'lab', opacity: kind === 'lab' ? .55 : 1, emissive: col, emissiveIntensity: .12 }))));
      d.position.set(cx, H + .5, cz); g.add(d);
    } else if (kind === 'gothic') {
      for (const a of [-1, 1]) for (const b of [-1, 1]) {
        const sp = cast(new Mesh(keep(new ConeGeometry(.9, 7, 6)), wallMat)); sp.position.copy(P(a * (hf - .6), b * (hr - .6), H + 3.5)); g.add(sp);
      }
      const big = cast(new Mesh(keep(new ConeGeometry(1.8, 13, 6)), wallMat)); big.position.set(cx, H + 6.5, cz); g.add(big);
    } else if (kind === 'towers') {
      for (const b of [-1, 1]) {
        const tw = cast(new Mesh(keep(new BoxGeometry(4, FH * 2.4, 4)), wallMat)); tw.position.copy(P(-hf * .4, b * hr * .5, H + FH * 1.2)); g.add(tw);
        for (let q = 0; q < 5; q++) { const wb = new Mesh(keep(new BoxGeometry(4.1, .35, 4.1)), glow); wb.position.copy(P(-hf * .4, b * hr * .5, H + 1.3 + q * 2.3)); g.add(wb); }
      }
    } else if (kind === 'library') {
      for (let q = -hr + 1.2; q <= hr - 1.2; q += 3) {
        if (Math.abs(q) < DW / 2 + .8) continue;
        const colm = cast(new Mesh(keep(new CylinderGeometry(.35, .4, H, 12)), wallMat)); colm.position.copy(P(hf + 1.2, q, H / 2)); g.add(colm);
        const cp = P(hf + 1.2, q); circles.push({ x: cp.x, z: cp.z, r: .5 });
      }
    } else if (kind === 'vault') {
      const ring = new Mesh(keep(new TorusGeometry(2.6, .28, 12, 48)), keep(std('#c9ced6', { rough: .2, metal: .95 })));
      ring.position.copy(P(hf + .3, 0, DH + 2.4)); ring.rotation.y = Math.atan2(f.x, f.z); g.add(ring);
    } else if (kind === 'studio') {
      const screen = new Mesh(keep(new PlaneGeometry(7, 4)), keep(new MeshBasicMaterial({ color: '#ff3b3b', toneMapped: false })));
      screen.position.copy(P(0, hr + WT / 2 + .06, FH * floors * .55)); screen.rotation.y = Math.atan2(r.x, r.z); g.add(screen);
      const play = new Mesh(keep(new CircleGeometry(1.1, 3)), keep(new MeshBasicMaterial({ color: '#ffffff', toneMapped: false })));
      play.position.copy(screen.position).addScaledVector(r, .02); play.rotation.y = screen.rotation.y; g.add(play);
    } else if (kind === 'pavilion') {
      const roof = cast(new Mesh(keep(new ConeGeometry(Math.hypot(hf, hr) + .6, 4.5, 4)), keep(std('#b8794e', { flat: true })))); roof.position.set(cx, H + 2.5, cz); roof.rotation.y = Math.PI / 4; g.add(roof);
    }
    // the sign above the roof
    const lbl = labelSprite(z.building.label, `${z.key} · ${z.name}`, lane, 1);
    lbl.position.set(cx, H + (kind === 'gothic' ? 16 : kind === 'towers' ? 17 : 8), cz); g.add(lbl);
    disposables.push(lbl.material as Material, (lbl.material as any).map as Texture);
    const door = P(hf + 2.4, 0, 0);

    const bld: Bld = {
      zone: z, i, floors, lane, c, f, r, hf, hr, door, panels: [],
      inner: { x0: Math.min(x0, x1) + WT, x1: Math.max(x0, x1) - WT, z0: Math.min(z0, z1) + WT, z1: Math.max(z0, z1) - WT },
    };
    // banners on the inside of the door wall
    for (let lv = 0; lv < floors; lv++) {
      const bt = keep(bannerTexture(z.building.label, floors > 1 ? `floor ${lv + 1} of ${floors} · ${z.name}` : z.name, lane));
      const bm = new Mesh(keep(new PlaneGeometry(lv === 0 ? 4.2 : 6, lv === 0 ? 1.05 : 1.5)), keep(new MeshBasicMaterial({ map: bt, toneMapped: false })));
      bm.position.copy(P(hf - WT / 2 - .1, 0, lv * FH + (lv === 0 ? DH + .55 : 3.4))); bm.rotation.y = Math.atan2(-f.x, -f.z); g.add(bm);
    }
    // exhibit walls
    const slots: { a: number; b: number; nrm: Vector3 }[] = [];
    for (let q = 0; q < backSlots; q++) slots.push({ a: -hf + WT / 2 + .12, b: (q - (backSlots - 1) / 2) * (2 * hr - 2) / backSlots, nrm: f.clone() });
    for (const sd of [-1, 1]) for (let q = 0; q < sideSlots; q++) slots.push({ a: -hf + 3 + (q + .5) * (2 * hf - 6.5) / sideSlots, b: sd * (hr - WT / 2 - .12), nrm: r.clone().multiplyScalar(-sd) });
    z.exhibits.forEach((e, j) => {
      const lv = Math.floor(j / perFloor), sl = slots[j % perFloor];
      if (lv >= floors) return;
      const placed = L.props.find(p => p.id === e.id && p.zone === z.id)!;
      const info = infoFor(placed, lane);
      const pos = P(sl.a, sl.b, lv * FH + 2.45);
      const mesh = new Mesh(keep(new PlaneGeometry(4.1, 2.56)), keep(new MeshBasicMaterial({ color: '#0d1424', toneMapped: false })));
      mesh.position.copy(pos); mesh.rotation.y = Math.atan2(sl.nrm.x, sl.nrm.z); mesh.userData.dyn = true; g.add(mesh);
      const frame = new Mesh(keep(new PlaneGeometry(4.35, 2.8)), glow); frame.position.copy(pos).addScaledVector(sl.nrm, -.01); frame.rotation.y = mesh.rotation.y; g.add(frame);
      const pool = new Mesh(keep(new CircleGeometry(1.8, 24)), keep(new MeshBasicMaterial({ color: col, ...additive, opacity: .18 })));
      pool.rotation.x = -Math.PI / 2; pool.position.copy(pos).addScaledVector(sl.nrm, 1.4).setY(lv * FH + .1); g.add(pool);
      bld.panels.push({ mesh, info, loaded: false });
      spots.push({ kind: 'panel', id: e.id, label: e.label, level: lv, pos, normal: sl.nrm, target: placed, bld, lane: info.lane });
    });
    // lift between floors
    if (floors > 1) {
      for (let lv = 0; lv < floors; lv++) {
        const pad = new Mesh(keep(new CylinderGeometry(1.3, 1.3, .1, 32)), glow); pad.position.set(cx, lv * FH + .08, cz); g.add(pad);
        spots.push({ kind: 'lift', id: `lift-${z.id}-${lv}`, label: lv < floors - 1 ? `Lift · up to floor ${lv + 2}` : 'Lift · back down to floor 1', level: lv, pos: new Vector3(cx, lv * FH + 1, cz), normal: f.clone(), bld, lane });
      }
      const colm = new Mesh(keep(new CylinderGeometry(1.25, 1.25, H, 32, 1, true)), keep(new MeshBasicMaterial({ color: col, ...additive, opacity: 0, side: DoubleSide })));
      colm.position.set(cx, H / 2, cz); colm.userData.dyn = true; g.add(colm); bld.liftCol = colm;
    }
    blds.push(bld);
  });

  /* ── fireflies ────────────────────────────────────────── */
  {
    const n = opts.low ? 120 : 260, pos = new Float32Array(n * 3), base = new Float32Array(n * 3);
    for (let i = 0; i < n; i++) {
      const a = Math.random() * Math.PI * 2, rr = Math.sqrt(Math.random()) * islandR(a) * S * .92;
      base.set([Math.cos(a) * rr, .6 + Math.random() * 3.5, Math.sin(a) * rr], i * 3);
    }
    pos.set(base);
    const g = keep(new BufferGeometry()); g.setAttribute('position', new Float32BufferAttribute(pos, 3));
    const m = keep(new PointsMaterial({ size: .5, map: keep(glowTexture('#fff2b0')), color: '#ffe9a0', ...additive, opacity: .9 }));
    const pts = new Points(g, m); scene.add(pts);
    animated.push(t => {
      const p = g.attributes.position as Float32BufferAttribute;
      for (let i = 0; i < n; i++) {
        p.array[i * 3] = base[i * 3] + Math.sin(t * .5 + i) * .8;
        p.array[i * 3 + 1] = base[i * 3 + 1] + Math.sin(t * .9 + i * 1.7) * .5;
        p.array[i * 3 + 2] = base[i * 3 + 2] + Math.cos(t * .4 + i * .7) * .8;
      }
      p.needsUpdate = true;
    });
  }

  /* ── merge everything static into one mesh per material, so the GPU gets few draw calls ── */
  {
    statics.updateMatrixWorld(true);
    const buckets = new Map<string, { mat: Material; occ: boolean; shadow: boolean; geos: BufferGeometry[] }>();
    const remove: Mesh[] = [];
    statics.traverse(o => {
      const m = o as Mesh;
      if (!m.isMesh || m.userData.dyn || (m as unknown as InstancedMesh).isInstancedMesh) return;
      const mat = m.material as Material;
      const key = `${mat.uuid}|${m.userData.occ ? 1 : 0}|${m.castShadow ? 1 : 0}`;
      let bk = buckets.get(key);
      if (!bk) { bk = { mat, occ: !!m.userData.occ, shadow: m.castShadow, geos: [] }; buckets.set(key, bk); }
      const geo = m.geometry.index ? m.geometry.clone() : m.geometry.clone();
      geo.applyMatrix4(m.matrixWorld);
      for (const k of Object.keys(geo.attributes)) if (!['position', 'normal', 'uv'].includes(k)) geo.deleteAttribute(k);
      bk.geos.push(geo); remove.push(m);
    });
    remove.forEach(m => m.parent?.remove(m));
    for (const bk of buckets.values()) {
      const merged = mergeGeometries(bk.geos.map(g2 => g2.index ? g2 : g2), false);
      bk.geos.forEach(g2 => g2.dispose());
      if (!merged) continue;
      keep(merged);
      const mm = new Mesh(merged, bk.mat);
      if (opts.shadows) { mm.castShadow = bk.shadow; mm.receiveShadow = true; }
      scene.add(mm);
      if (bk.occ) occluders.push(mm);
    }
  }

  /** Panel textures are drawn only near a building, and released when you walk away. */
  function streamPanels(px: number, pz: number) {
    for (const b of blds) {
      const d = Math.hypot(px - b.c.x, pz - b.c.z);
      for (const p of b.panels) {
        if (d < 40 && !p.loaded) {
          const m = p.mesh.material as MeshBasicMaterial;
          m.map = panelTexture(p.info); m.color.set('#ffffff'); m.needsUpdate = true; p.loaded = true;
        } else if (d > 80 && p.loaded) {
          const m = p.mesh.material as MeshBasicMaterial;
          m.map?.dispose(); m.map = null; m.color.set('#0d1424'); m.needsUpdate = true; p.loaded = false;
        }
      }
    }
  }

  function dispose() {
    for (const b of blds) for (const p of b.panels) (p.mesh.material as MeshBasicMaterial).map?.dispose();
    for (const d of disposables) d?.dispose?.();
    scene.traverse(o => { const s = o as Sprite; if (s.isSprite) { s.material.map?.dispose(); s.material.dispose(); } });
  }

  return { L, colliders, circles, spots, occluders, blds, sunDir, animate: (t: number) => animated.forEach(a => a(t)), streamPanels, dispose };
}
