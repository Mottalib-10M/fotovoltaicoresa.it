import { P, REGIONI } from '../engine/params';
import { tariffaCer, valoreRidKwh } from '../engine/fv';
import { T, eur, num, type L, type Rows } from './_kit';
export default (l: L) => ({
  title: T(l, 'Tariffa premio su ciò che condividete in una CER', 'Premium tariff on what you share in an energy community'),
  cta: T(l, 'Calcola produzione e surplus', 'Work out output and surplus'),
  inputs: [{ id: 'kwh', label: T(l, 'Energia condivisa in un anno', 'Energy shared in a year'), def: 1500, unit: 'kWh', max: 2000000 },
    { id: 'r', label: T(l, 'Regione', 'Region'), def: 8, options: REGIONI.map((r, i) => ({ value: String(i), label: l === 'en' ? r.en : r.nome })) }],
  run: ({ kwh, r }: Record<string, number>) => { const pz = valoreRidKwh(r) * 1000; const tip = tariffaCer(r, pz);
    return { head: [T(l, 'Incentivo in un anno', 'Premium in a year'), eur(kwh * tip / 1000, l)], rows: [
      [T(l, 'Tariffa premio stimata', 'Estimated premium'), `${num(tip, l)} €/MWh`],
      [T(l, 'Prezzo zonale usato', 'Zonal price used'), `${num(pz, l)} €/MWh`],
      [T(l, `In ${P.cer.durata_anni} anni`, `Over ${P.cer.durata_anni} years`), eur(kwh * tip / 1000 * P.cer.durata_anni, l)],
    ] as Rows, note: T(l, 'Il premio va alla comunità, che decide come ripartirlo tra i membri.', 'The premium is paid to the community, which decides how to share it among members.') }; },
});
