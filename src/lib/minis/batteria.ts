import { calcola, costoRiferimento } from '../engine/fv';
import { ROMA } from '../engine/dati';
import { T, eur, pct, anni, type L, type Rows } from './_kit';
export default (l: L) => ({
  title: T(l, 'Quanto rende una batteria in più (Roma, 3 000 kWh di consumo)', 'What an added battery earns (Rome, 3,000 kWh of use)'),
  cta: T(l, 'Calcola con il vostro comune', 'Calculate for your comune'),
  inputs: [{ id: 'kwp', label: T(l, 'Impianto', 'System'), def: 4.5, unit: 'kWp', max: 50, decimals: 1 }, { id: 'bat', label: T(l, 'Batteria', 'Battery'), def: 5, unit: 'kWh', max: 50, decimals: 1 }],
  run: ({ kwp, bat }: Record<string, number>) => {
    const b = { luogo: ROMA, kwp, tilt: 30, az: 0, consumo: 3000, primaCasa: true };
    const s = calcola({ ...b, batteria: 0 }), c = calcola({ ...b, batteria: bat });
    const extra = c.beneficio - s.beneficio; const costoB = costoRiferimento(0, bat);
    return { head: [T(l, 'Beneficio in più ogni anno', 'Extra benefit each year'), eur(extra, l)], rows: [
      [T(l, 'Autoconsumo senza / con', 'Self-use without / with'), `${pct(s.quota, l)} / ${pct(c.quota, l)}`],
      [T(l, 'Batteria al costo di riferimento', 'Battery at reference cost'), eur(costoB, l)],
      [T(l, 'Rientro della sola batteria, con detrazione 50 %', 'Battery-only payback, with 50% deduction'), anni(extra > 0 ? (costoB / 2) / extra : null, l)],
    ] as Rows }; },
});
