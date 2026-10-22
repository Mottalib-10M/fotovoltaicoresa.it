import { P } from '../engine/params';
import { prezzoEvitatoTrim, PREZZO_EVITATO_CT } from '../engine/fv';
import { T, eur, num, type L, type Rows } from './_kit';
export default (l: L) => ({
  title: T(l, 'Quanto vale ogni kWh che non comprate, trimestre per trimestre', 'What each kWh you do not buy is worth, quarter by quarter'),
  cta: T(l, 'Calcola il vostro autoconsumo', 'Work out your self-consumption'),
  inputs: [{ id: 'kwh', label: T(l, 'kWh autoconsumati in un anno', 'kWh self-consumed in a year'), def: 1500, unit: 'kWh', max: 100000 }],
  run: ({ kwh }: Record<string, number>) => ({
    head: [T(l, 'Risparmio in un anno', 'Saving in a year'), eur(kwh * PREZZO_EVITATO_CT / 100, l)],
    rows: P.prezzo_evitato.trimestri.map((t) => [T(l, `${t.t} trimestre 2026`, `Q${['I', 'II', 'III', 'IV'].indexOf(t.t) + 1} 2026`), `${num(prezzoEvitatoTrim(t), l, 2)} c€/kWh`]) as Rows,
    note: T(l, 'Materia energia, oneri generali e imposte del cliente tipo ARERA; trasporto e quote fisse restano in bolletta.', 'Energy, system charges and taxes for ARERA\'s reference customer; network and fixed charges stay on the bill.'),
  }),
});
