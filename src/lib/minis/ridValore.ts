import { P, REGIONI } from '../engine/params';
import { valoreRidKwh, feeRid } from '../engine/fv';
import { T, eur, num, type L, type Rows } from './_kit';
/** Una regione rappresentativa per ogni zona di mercato. */
const ZONE: Array<[string, number]> = [['Nord', 8], ['Centro Nord', 15], ['Centro Sud', 6], ['Sud', 12], ['Calabria', 2], ['Sicilia', 14], ['Sardegna', 13]];
export default (l: L) => ({
  title: T(l, 'Quanto paga il GSE per l\'energia che immettete', 'What the GSE pays for the power you export'),
  cta: T(l, 'Calcola il surplus del vostro impianto', 'Work out your system\'s surplus'),
  inputs: [{ id: 'kwh', label: T(l, 'Energia immessa in un anno', 'Energy exported in a year'), def: 2500, unit: 'kWh', max: 2000000 },
    { id: 'z', label: T(l, 'Zona di mercato', 'Market zone'), def: 0, options: ZONE.map(([n], i) => ({ value: String(i), label: n })) },
    { id: 'kwp', label: T(l, 'Potenza impianto', 'System size'), def: 4, unit: 'kWp', max: 1000, decimals: 1 }],
  run: ({ kwh, z, kwp }: Record<string, number>) => { const reg = ZONE[z]?.[1] ?? 8; const v = valoreRidKwh(reg); const fee = feeRid(kwp);
    return { head: [T(l, 'Ricavo netto in un anno', 'Net income in a year'), eur(kwh * v - fee, l)], rows: [
      [T(l, 'Prezzo medio stimato', 'Estimated average price'), `${num(v * 100, l, 2)} c€/kWh`],
      [T(l, 'Corrispettivo al GSE', 'GSE fee'), eur(fee, l, 2)],
      [T(l, 'Prezzo minimo garantito', 'Guaranteed minimum price'), `${num(P.rid.pmg_eur_mwh / 10, l, 2)} c€/kWh`],
    ] as Rows, note: T(l, `Regione di riferimento: ${REGIONI[reg].nome}.`, `Reference region: ${REGIONI[reg].en}.`) }; },
});
