/**
 * Una pagina = UN file in `src/content/calcolatori/`, `src/content/guide/` o `src/content/citta/`. Il file porta
 * le due lingue, testo, FAQ, fonti, simulatore e collegamenti. Il nucleo (rotte, menu, sitemap, hreflang, schema)
 * lo legge da solo. Istruzioni: CONTRIBUTING-PAGINE.md.
 */
import type { SourceKey, Params } from './engine/params';

export type Lang = 'it' | 'en';
/** Gruppo di menu. */
export type Group = 'calcolo' | 'incentivi' | 'impianto' | 'citta';
export interface FAQ { q: string; a: string }

export interface Helpers {
  lang: Lang;
  /** Link interno per ID di pagina. */
  a: (id: string, text: string) => string;
  eur: (n: number, decimals?: number) => string;
  num: (n: number, decimals?: number) => string;
  /** Percentuale da una quota (0,247 → « 24,7 % »). */
  pct: (x: number, decimals?: number) => string;
  /** Centesimi per kWh con due decimali (« 24,96 c€/kWh »). */
  ct: (x: number) => string;
  date: (iso: string) => string;
  table: (headers: string[], rows: Array<Array<string | number>>, caption?: string, align?: Array<'l' | 'r'>) => string;
  /** Link a una fonte ufficiale di params-2026.json. */
  src: (key: SourceKey, text?: string) => string;
  P: Params;
}

export interface PageText {
  /** Segmento d'URL senza barra e senza anno. */
  slug: string;
  nav: string;
  card: string;
  /** 50-60 caratteri, termine cercato per primo, con 2026. */
  title: string;
  /** 150-160 caratteri, con 2026. */
  description: string;
  h1: string;
  /** Una o due frasi sotto l'H1, con il risultato principale. */
  intro: string;
  /** Paragrafo citabile, almeno 120 parole, con i numeri (RECETTE §21). */
  resume: string;
  faqs: FAQ[];
  /** Corpo HTML. `<!--mini:kind-->` inserisce un mini-simulatore. */
  body: (h: Helpers) => string;
}

/** Vista del simulatore principale: cambia il risultato in evidenza e i campi mostrati. */
export type Tool = 'rendimento' | 'produzione' | 'accumulo' | 'costo' | 'detrazione' | 'rid' | 'balcone' | 'cer' | 'dimensione';

export interface PageDef {
  id: string;
  group: Group;
  order: number;
  /** Mini-simulatore dopo l'intestazione (file `src/lib/minis/<kind>.ts`). Non serve con `tool`. */
  mini?: string;
  miniDefaults?: Record<string, number>;
  miniHref?: string;
  tool?: Tool;
  /** Valori iniziali del simulatore, per esempio il comune di una pagina città. */
  toolPreset?: Record<string, number | string | boolean>;
  related: string[];
  sources: SourceKey[];
  it: PageText;
  en: PageText;
}
export const defineGuide = (g: PageDef): PageDef => g;
