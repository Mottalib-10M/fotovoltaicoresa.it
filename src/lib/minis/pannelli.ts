import { P, ITALIA } from '../engine/params';
import { pannelli } from '../engine/fv';
import { T, num, kwh, type L, type Rows } from './_kit';
export default (l: L) => ({
  title: T(l, 'Quanti pannelli servono e quanto tetto occupano', 'How many panels you need and how much roof they take'),
  cta: T(l, 'Calcola la resa nel vostro comune', 'Work out the yield in your comune'),
  inputs: [{ id: 'kwp', label: T(l, 'Potenza desiderata', 'Target size'), def: 3, unit: 'kWp', max: 200, decimals: 2 }],
  run: ({ kwp }: Record<string, number>) => { const p = pannelli(kwp);
    return { head: [T(l, 'Pannelli', 'Panels'), num(p.n, l)], rows: [
      [T(l, 'Superficie dei moduli', 'Panel area'), `${num(p.m2, l, 1)} m²`],
      [T(l, 'Potenza effettiva', 'Actual size'), `${num(p.kwpEffettivi, l, 2)} kWp`],
      [T(l, 'Produzione, media italiana', 'Output, Italian average'), kwh(p.kwpEffettivi * ITALIA.ey, l)],
    ] as Rows, note: T(l, `Ipotesi: moduli da ${num(P.modello.kwp_per_pannello * 1000, l)} W e ${num(P.modello.m2_per_pannello, l, 2)} m², 30° a sud.`, `Assumption: ${num(P.modello.kwp_per_pannello * 1000, l)} W panels of ${num(P.modello.m2_per_pannello, l, 2)} m², 30° facing south.`) }; },
});
