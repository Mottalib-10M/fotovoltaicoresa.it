/** Accesso tipizzato ai file di dati: ogni valore di legge e ogni ipotesi sta lì, mai nelle pagine o nel codice. */
import raw from '../../data/params-2026.json';
import regRaw from '../../data/regioni.json';
import ridRaw from '../../data/rid-2026.json';
import oriRaw from '../../data/orientamento.json';
import provRaw from '../../data/province.json';
import cittaRaw from '../../data/citta.json';

export type SourceKey = keyof typeof raw.sources;
export type Params = typeof raw;
export const P: Params = raw;

export interface Regione {
  nome: string; en: string; zona: Zona; punto: string; capoluogo_ac: string; n_comuni: number; pop: number;
  ey: number; ey_min: number; ey_max: number; cons_base: number; cons_alto: number; mesi: number[];
  sc_base: number[][]; sc_alto: number[][];
}
export type Zona = 'Nord' | 'Centro Nord' | 'Centro Sud' | 'Sud' | 'Calabria' | 'Sicilia' | 'Sardegna';
export const REG = regRaw as unknown as { source: Record<string, string>; p: number[]; b: number[]; italia: { n_comuni: number; pop: number; ey: number; ey_min: number; ey_max: number; min_nome: string; max_nome: string; cons_base: number; cons_alto: number; mesi: number[] }; regioni: Regione[] };
export const REGIONI = REG.regioni;
export const ITALIA = REG.italia;
export const RID = ridRaw as { source: string; ultimo_mese: string; mesi_disponibili: number; unita: string; zone: Record<Zona, { F1: number[]; F2: number[]; F3: number[] }> };
export const ORIENT = oriRaw as { tilts: number[]; aspects: number[]; punti: Record<string, { lat: number; lon: number; f: Record<string, number> }> };
export interface Provincia { sigla: string; nome: string; reg: number; n: number; pop: number; ey: number; min: [string, number]; max: [string, number]; maggiore: [string, number] }
export const PROVINCE = provRaw as Provincia[];
export interface Citta { nome: string; sigla: string; reg: number; istat: string; lat: number; lon: number; pop: number; ey: number; em: number[]; elev: number }
export const CITTA = cittaRaw as Record<string, Citta>;

export const r2 = (x: number) => Math.round((x + Number.EPSILON) * 100) / 100;
export const clamp = (x: number, a: number, b: number) => Math.min(b, Math.max(a, x));
