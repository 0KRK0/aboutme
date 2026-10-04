/* Career OS form replay and the AuTrad version log. Both only replay what the
   repositories document; neither talks to a job site or a market. */

import { careerOs, autrad } from '../data';
import { esc } from '../render';
import { $, $$ } from './core';

const reduced = typeof matchMedia !== 'undefined' && matchMedia('(prefers-reduced-motion: reduce)').matches;

export function initCareerOs() {
  const root = $('[data-cos]');
  if (!root) return { fill: () => {} };
  const fields = $$<HTMLElement>('.cos-field', root);
  const log = $('[data-cos-log]', root);
  const fillBtn = $<HTMLButtonElement>('[data-cos-fill]', root);
  const submit = $<HTMLButtonElement>('[data-cos-submit]', root);
  let timers: number[] = [];
  const say = (t: string) => { log.innerHTML = `<span class="p-sign">$</span> ${t}`; };

  const reset = () => {
    timers.forEach(clearTimeout); timers = [];
    fields.forEach(f => { f.classList.remove('is-on'); $('[data-cos-v]', f).textContent = '—'; });
    submit.disabled = true; submit.textContent = 'Submit'; fillBtn.disabled = false;
    root.classList.remove('is-sent');
    say('Press Run autofill.');
  };

  const fill = () => {
    reset();
    fillBtn.disabled = true;
    say('Filling the obvious fields first…');
    const order = [...careerOs.form.keys()];
    order.forEach((i, n) => {
      timers.push(window.setTimeout(() => {
        const f = fields[i];
        f.classList.add('is-on');
        $('[data-cos-v]', f).textContent = careerOs.form[i].value;
        if (careerOs.form[i].kind === 'draft') say('Reading the whole page, then drafting the long answer in my voice…');
        if (n === order.length - 1) {
          say('Stopped. 3 answered, 1 draft to read, 2 only you can fill. Submit is yours.');
          submit.disabled = false; fillBtn.disabled = false;
        }
      }, reduced ? 0 : 380 * (n + 1)));
    });
  };

  fillBtn.addEventListener('click', fill);
  $('[data-cos-reset]', root).addEventListener('click', reset);
  submit.addEventListener('click', () => {
    submit.disabled = true; submit.textContent = 'Submitted by you';
    root.classList.add('is-sent');
    say('You clicked the site’s Submit. Career OS waits, looks for the confirmation, then moves it to Track.');
  });
  return { fill };
}

export function initAutrad() {
  const root = $('[data-aut]');
  if (!root) return { show: (_i: number) => {} };
  const out = $('[data-aut-out]', root);
  const btns = $$<HTMLButtonElement>('[data-aut-v]', root);
  const show = (i: number) => {
    const v = autrad.versions[i];
    if (!v) return;
    btns.forEach((b, j) => { b.classList.toggle('is-on', j === i); b.setAttribute('aria-checked', String(j === i)); });
    out.innerHTML = `<p class="saa-k">Question</p><p>${esc(v.q)}</p><p class="saa-k">Finding</p><p class="aut-a">${esc(v.a)}</p>`;
  };
  btns.forEach((b, i) => b.addEventListener('click', () => show(i)));
  return { show };
}
