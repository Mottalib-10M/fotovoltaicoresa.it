/** Funzioni comuni dei mini-simulatori (ignorate dal registro: prefisso « _ »). */
import { formatMoney, formatPercent, formatNumber } from '../format';
export type L = 'it' | 'en';
export const T = <A>(l: L, it: A, en: A) => (l === 'en' ? en : it);
export const eur = (x: number, l: L, d = 0) => formatMoney(x, d, l);
export const pct = (x: number, l: L, d = 0) => formatPercent(x, d, l);
export const num = (x: number, l: L, d = 0) => formatNumber(x, d, l);
export const kwh = (x: number, l: L) => `${formatNumber(Math.round(x), 0, l)} kWh`;
export const anni = (x: number | null, l: L) => (x === null || !isFinite(x) ? T(l, 'oltre 20 anni', 'over 20 years') : T(l, `${formatNumber(x, 1, l)} anni`, `${formatNumber(x, 1, l)} years`));
export const siNo = (l: L) => [{ value: '1', label: T(l, 'Sì', 'Yes') }, { value: '0', label: T(l, 'No', 'No') }];
export type Rows = [string, string][];
