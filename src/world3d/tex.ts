/* Canvas-drawn textures for the 3D world: exhibit walls, floating labels and glow
   sprites. Everything is generated in the browser, so the world ships no images. */

import { CanvasTexture, SRGBColorSpace, LinearFilter, Sprite, SpriteMaterial, AdditiveBlending } from 'three';
import type { Lane } from '../data';

export const LANE: Record<Lane, string> = {
  main: '#9fd3ff', systems: '#33c9a0', enterprise: '#7394ff', ai: '#ff7c46', research: '#e866b4',
};
const FONT = `'Schibsted Grotesk Variable', 'Schibsted Grotesk', system-ui, -apple-system, 'Segoe UI', sans-serif`;
const MONO = `'Martian Mono', ui-monospace, Menlo, Consolas, monospace`;

function canvas(w: number, h: number) {
  const c = document.createElement('canvas'); c.width = w; c.height = h;
  return { c, g: c.getContext('2d')! };
}
function tex(c: HTMLCanvasElement) {
  const t = new CanvasTexture(c); t.colorSpace = SRGBColorSpace; t.anisotropy = 4; t.minFilter = LinearFilter; t.generateMipmaps = false;
  return t;
}
function wrap(g: CanvasRenderingContext2D, text: string, maxW: number, maxLines: number) {
  const words = text.split(/\s+/); const lines: string[] = []; let line = '';
  for (const w of words) {
    const t = line ? line + ' ' + w : w;
    if (g.measureText(t).width > maxW && line) { lines.push(line); line = w; if (lines.length === maxLines) break; }
    else line = t;
  }
  if (lines.length < maxLines && line) lines.push(line);
  if (lines.length === maxLines && words.join(' ').length > lines.join(' ').length + 1) lines[maxLines - 1] = lines[maxLines - 1].replace(/\s*\S*$/, ' …');
  return lines;
}

export interface PanelInfo { kicker: string; title: string; body: string; metrics: { v: string; k: string }[]; lane: Lane }

/** An exhibit wall: dark glass, a lane-coloured bar, the title, headline numbers and a few lines. */
export function panelTexture(p: PanelInfo, w = 1024, h = 640) {
  const { c, g } = canvas(w, h);
  const col = LANE[p.lane];
  const bg = g.createLinearGradient(0, 0, w, h);
  bg.addColorStop(0, '#0d1424'); bg.addColorStop(1, '#151d33');
  g.fillStyle = bg; g.fillRect(0, 0, w, h);
  // grid
  g.strokeStyle = 'rgba(255,255,255,.04)'; g.lineWidth = 1;
  for (let x = 0; x < w; x += 32) { g.beginPath(); g.moveTo(x, 0); g.lineTo(x, h); g.stroke(); }
  for (let y = 0; y < h; y += 32) { g.beginPath(); g.moveTo(0, y); g.lineTo(w, y); g.stroke(); }
  // frame
  g.strokeStyle = col; g.lineWidth = 6; g.strokeRect(3, 3, w - 6, h - 6);
  g.fillStyle = col; g.fillRect(0, 0, w, 14);
  const pad = 56;
  g.fillStyle = col; g.font = `600 26px ${MONO}`; g.textBaseline = 'top';
  g.fillText(p.kicker.toUpperCase().slice(0, 52), pad, 48);
  g.fillStyle = '#ffffff'; g.font = `700 64px ${FONT}`;
  const tl = wrap(g, p.title, w - pad * 2, 2);
  tl.forEach((l, i) => g.fillText(l, pad, 92 + i * 72));
  let y = 92 + tl.length * 72 + 22;
  if (p.metrics.length) {
    const n = Math.min(4, p.metrics.length), cw = (w - pad * 2) / n;
    p.metrics.slice(0, n).forEach((m, i) => {
      g.fillStyle = col; g.font = `700 54px ${FONT}`; g.fillText(m.v.slice(0, 10), pad + i * cw, y);
      g.fillStyle = 'rgba(255,255,255,.7)'; g.font = `500 22px ${FONT}`; g.fillText(m.k.slice(0, 26), pad + i * cw, y + 62);
    });
    y += 112;
  }
  g.fillStyle = 'rgba(232,237,244,.86)'; g.font = `400 30px ${FONT}`;
  const left = h - y - 96;
  const bl = wrap(g, p.body, w - pad * 2, Math.max(1, Math.floor(left / 40)));
  bl.forEach((l, i) => g.fillText(l, pad, y + i * 40));
  // footer
  g.fillStyle = 'rgba(255,255,255,.08)'; g.fillRect(0, h - 70, w, 70);
  g.fillStyle = col; g.font = `700 24px ${MONO}`; g.fillText('E · OPEN', pad, h - 50);
  g.fillStyle = 'rgba(255,255,255,.55)'; g.font = `500 22px ${MONO}`;
  const r = 'RAJESH WORLD'; g.fillText(r, w - pad - g.measureText(r).width, h - 49);
  return tex(c);
}

/** A big banner, e.g. "AI LAB · FLOOR 2". */
export function bannerTexture(title: string, sub: string, lane: Lane, w = 1024, h = 256) {
  const { c, g } = canvas(w, h);
  g.fillStyle = '#0b1120'; g.fillRect(0, 0, w, h);
  const col = LANE[lane];
  g.fillStyle = col; g.fillRect(0, h - 10, w, 10);
  g.textAlign = 'center'; g.textBaseline = 'middle';
  g.fillStyle = '#fff'; let fs = 92; do { g.font = `800 ${fs}px ${FONT}`; fs -= 4; } while (g.measureText(title).width > w - 60 && fs > 36); g.fillText(title, w / 2, h / 2 - 22);
  g.fillStyle = col; g.font = `600 30px ${MONO}`; g.fillText(sub.toUpperCase(), w / 2, h / 2 + 58);
  return tex(c);
}

/** A floating hologram label. */
export function labelSprite(text: string, sub: string, lane: Lane, scale = 1) {
  const w = 1024, h = 300;
  const { c, g } = canvas(w, h);
  const col = LANE[lane];
  g.textAlign = 'center'; g.textBaseline = 'middle';
  g.shadowColor = col; g.shadowBlur = 28;
  g.fillStyle = '#ffffff';
  let fs = 120; do { g.font = `800 ${fs}px ${FONT}`; fs -= 6; } while (g.measureText(text).width > w - 60 && fs > 40);
  g.fillText(text, w / 2, 120);
  g.shadowBlur = 14; g.fillStyle = col;
  let ss = 40; do { g.font = `600 ${ss}px ${MONO}`; ss -= 2; } while (g.measureText(sub.toUpperCase()).width > w - 40 && ss > 18);
  g.fillText(sub.toUpperCase(), w / 2, 232);
  const m = new SpriteMaterial({ map: tex(c), transparent: true, depthWrite: false, fog: true });
  const s = new Sprite(m); s.scale.set(14 * scale, 14 * scale * h / w, 1);
  return s;
}

/** A soft round glow for particles and light pools. */
export function glowTexture(color = '#ffffff') {
  const { c, g } = canvas(128, 128);
  const r = g.createRadialGradient(64, 64, 0, 64, 64, 64);
  r.addColorStop(0, color); r.addColorStop(.25, color + 'aa'); r.addColorStop(1, color + '00');
  g.fillStyle = r; g.fillRect(0, 0, 128, 128);
  return tex(c);
}
export const additive = { transparent: true, depthWrite: false, blending: AdditiveBlending } as const;
