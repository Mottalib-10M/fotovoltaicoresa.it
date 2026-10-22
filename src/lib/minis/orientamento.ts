import { fattoreOrientamento, ROMA } from '../engine/dati';
import { T, num, pct, kwh, type L, type Rows } from './_kit';
const az = (l: L) => [
  { value: '0', label: T(l, 'Sud', 'South') }, { value: '-45', label: T(l, 'Sud-est', 'South-east') }, { value: '45', label: T(l, 'Sud-ovest', 'South-west') },
  { value: '-90', label: T(l, 'Est', 'East') }, { value: '90', label: T(l, 'Ovest', 'West') }, { value: '180', label: T(l, 'Nord', 'North') },
];
export default (l: L) => ({
  title: T(l, 'Quanto perde un tetto non orientato a sud (Roma)', 'How much a roof loses when it does not face south (Rome)'),
  cta: T(l, 'Calcola con il vostro comune', 'Calculate for your comune'),
  inputs: [{ id: 'az', label: T(l, 'Orientamento', 'Facing'), def: 0, options: az(l) }, { id: 't', label: T(l, 'Inclinazione', 'Tilt'), def: 30, unit: '°', max: 90 }],
  run: ({ az: a, t }: Record<string, number>) => { const f = fattoreOrientamento(ROMA.reg, t, a);
    return { head: [T(l, 'Resa rispetto a 30° sud', 'Yield compared with 30° south'), pct(f, l, 0)], rows: [
      [T(l, 'kWh per kWp a Roma', 'kWh per kWp in Rome'), num(ROMA.ey * f, l)],
      [T(l, 'Impianto da 3 kWp', '3 kWp system'), kwh(3 * ROMA.ey * f, l)],
      [T(l, 'Differenza annua', 'Annual difference'), kwh(3 * ROMA.ey * (f - 1), l)],
    ] as Rows }; },
});
