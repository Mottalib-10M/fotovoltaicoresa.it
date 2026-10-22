/**
 * Formato dei numeri per i testi fuori da `body(h)`: paragrafo citabile, FAQ, titoli. Ogni numero di legge viene
 * da P, ogni esempio dal motore; si scrive solo con questi formattatori (RECETTE §4.1, §17.4).
 */
import { formatMoney, formatNumber, formatPercent } from './format';
export { P, REGIONI, ITALIA, RID, PROVINCE, CITTA } from './engine/params';
const mk = (l: 'it' | 'en') => ({
  eur: (n: number, d = 0) => formatMoney(n, d, l),
  num: (n: number, d = 0) => formatNumber(n, d, l),
  pct: (x: number, d = 0) => formatPercent(x, d, l),
  ct: (x: number) => `${formatNumber(x, 2, l)} c€/kWh`,
  kwh: (x: number) => `${formatNumber(Math.round(x), 0, l)} kWh`,
  anni: (x: number | null) => (x === null ? (l === 'it' ? 'oltre 20 anni' : 'over 20 years') : `${formatNumber(x, 1, l)} ${l === 'it' ? 'anni' : 'years'}`),
});
export const IT = mk('it');
export const EN = mk('en');
