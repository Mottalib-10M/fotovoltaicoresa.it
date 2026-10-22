/** Luogo, orientamento e autoconsumo: interpolazioni sulle tabelle PVGIS e ARERA precalcolate. */
import { P, REG, REGIONI, ITALIA, ORIENT, CITTA, clamp } from './params';

/** Un comune: nome, sigla della provincia, indice della regione, kWh per kWp a 30° sud (PVGIS). */
export interface Luogo { nome: string; sigla: string; reg: number; ey: number }
export const luogoCitta = (slug: string): Luogo => { const c = CITTA[slug]; return { nome: c.nome, sigla: c.sigla, reg: c.reg, ey: c.ey }; };
export const ROMA = luogoCitta('roma');
export const regIndex = (nome: string) => REGIONI.findIndex((r) => r.nome === nome);

function lerp(xs: number[], x: number): [number, number, number] {
  const v = clamp(x, xs[0], xs[xs.length - 1]);
  let i = 0; while (i < xs.length - 2 && v > xs[i + 1]) i++;
  const t = xs[i + 1] === xs[i] ? 0 : (v - xs[i]) / (xs[i + 1] - xs[i]);
  return [i, i + 1, t];
}

/** Fattore di orientamento rispetto a 30° sud, dalla matrice PVGIS del punto di riferimento della regione. */
export function fattoreOrientamento(reg: number, tilt: number, az: number): number {
  const pt = ORIENT.punti[REGIONI[reg]?.punto ?? 'CE'];
  const f = (t: number, a: number) => (t === 0 ? pt.f['0_0'] : pt.f[`${t}_${a}`]);
  let a = ((az + 180) % 360 + 360) % 360 - 180; // -180..180
  const A = [...ORIENT.aspects, 180];
  let j = 0; while (j < A.length - 2 && a > A[j + 1]) j++;
  const ta = (a - A[j]) / (A[j + 1] - A[j]);
  const a0 = A[j], a1 = A[j + 1] === 180 ? -180 : A[j + 1];
  const [i0, i1, tt] = lerp(ORIENT.tilts, tilt);
  const at = (t: number) => f(t, a0) * (1 - ta) + f(t, a1) * ta;
  return at(ORIENT.tilts[i0]) * (1 - tt) + at(ORIENT.tilts[i1]) * tt;
}

/** Profilo di consumo: classe 1,5-3 kW sotto la soglia, 3-4,5 kW sopra (ARERA, residenti 2025). */
export const profilo = (consumo: number): 'base' | 'alto' => (consumo < P.modello.consumo_soglia_profilo ? 'base' : 'alto');

/**
 * Quota della produzione autoconsumata. p = produzione / consumo annuo, b = kWh di batteria per MWh di consumo.
 * Oltre la griglia (p > 5) l'energia autoconsumata resta quella di p = 5.
 */
export function quotaAutoconsumo(reg: number, produzione: number, consumo: number, batteriaKwh: number): number {
  if (produzione <= 0 || consumo <= 0) return 0;
  const R = REGIONI[reg] ?? REGIONI[0];
  const tab = profilo(consumo) === 'base' ? R.sc_base : R.sc_alto;
  const p = produzione / consumo, b = (batteriaKwh / consumo) * 1000;
  const pc = clamp(p, REG.p[0], REG.p[REG.p.length - 1]);
  const [i0, i1, tp] = lerp(REG.p, pc), [j0, j1, tb] = lerp(REG.b, b);
  const v = (i: number) => tab[i][j0] * (1 - tb) + tab[i][j1] * tb;
  let sc = v(i0) * (1 - tp) + v(i1) * tp;
  if (p > pc) sc = sc * pc / p;
  return clamp(sc, 0, 1);
}

/** Distribuzione mensile della produzione nella regione (quote che sommano a 1). */
export const mesiRegione = (reg: number) => REGIONI[reg]?.mesi ?? ITALIA.mesi;
/** Consumo annuo medio di riferimento: famiglie residenti con 3-4,5 kW nella regione (ARERA 2025). */
export const consumoRegione = (reg: number) => REGIONI[reg]?.cons_alto ?? ITALIA.cons_alto;
