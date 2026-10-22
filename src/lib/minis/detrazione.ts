import { P } from '../engine/params';
import { detrazione } from '../engine/fv';
import { T, eur, pct, siNo, type L, type Rows } from './_kit';
export default (l: L) => ({
  title: T(l, 'Detrazione 2026 sul vostro preventivo', '2026 tax deduction on your quote'),
  cta: T(l, 'Calcola anche il rientro', 'Work out the payback too'),
  inputs: [{ id: 'k', label: T(l, 'Spesa con IVA', 'Cost including VAT'), def: 6000, unit: '€', max: 500000 }, { id: 'pc', label: T(l, 'Prima casa del proprietario?', 'Owner\'s main home?'), def: 1, options: siNo(l) }],
  run: ({ k, pc }: Record<string, number>) => { const d = detrazione(k, pc === 1);
    return { head: [T(l, 'Rata annua per 10 anni', 'Annual instalment for 10 years'), eur(d.rata, l)], rows: [
      [T(l, 'Aliquota', 'Rate'), pct(d.aliquota, l, 0)],
      [T(l, 'Detrazione totale', 'Total deduction'), eur(d.totale, l)],
      [T(l, 'Spesa che resta a vostro carico', 'Cost left to you'), eur(k - d.totale, l)],
    ] as Rows, note: k > P.detrazione.tetto_eur ? T(l, `Oltre ${eur(P.detrazione.tetto_eur, l)} la spesa non dà detrazione.`, `Spending above ${eur(P.detrazione.tetto_eur, l)} earns no deduction.`) : T(l, 'Serve imposta lorda sufficiente: la parte di rata che supera l\'IRPEF dovuta si perde.', 'You need enough income tax: any part of an instalment above the tax you owe is lost.') }; },
});
