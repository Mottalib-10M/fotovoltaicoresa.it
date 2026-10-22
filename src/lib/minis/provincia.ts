import { PROVINCE, REGIONI } from '../engine/params';
import { T, num, kwh, type L, type Rows } from './_kit';
const ord = [...PROVINCE].sort((a, b) => a.nome.localeCompare(b.nome, 'it'));
export default (l: L) => ({
  title: T(l, 'Resa media e comune migliore della vostra provincia', 'Average yield and best comune in your province'),
  cta: T(l, 'Calcola per il vostro comune', 'Calculate for your comune'),
  inputs: [{ id: 'p', label: T(l, 'Provincia', 'Province'), def: Math.max(0, ord.findIndex((p) => p.sigla === 'RM')), options: ord.map((p, i) => ({ value: String(i), label: `${p.nome} (${p.sigla})` })) }],
  run: ({ p }: Record<string, number>) => { const x = ord[p] ?? ord[0];
    return { head: [T(l, 'kWh per kWp, media pesata', 'kWh per kWp, weighted average'), num(x.ey, l)], rows: [
      [T(l, 'Comuni', 'Comuni'), `${num(x.n, l)} · ${l === 'en' ? REGIONI[x.reg].en : REGIONI[x.reg].nome}`],
      [T(l, 'Il più soleggiato', 'Sunniest'), `${x.max[0]} · ${num(x.max[1], l)}`],
      [T(l, 'Il meno soleggiato', 'Least sunny'), `${x.min[0]} · ${num(x.min[1], l)}`],
      [T(l, '3 kWp in media', '3 kWp on average'), kwh(3 * x.ey, l)],
    ] as Rows }; },
});
