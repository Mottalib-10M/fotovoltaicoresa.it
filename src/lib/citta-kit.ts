/**
 * Funzioni comuni delle pagine città (`src/content/citta/`): calcolo con il comune della città, provincia,
 * zona di mercato e tabella mensile. I testi restano in ogni pagina, diversi da città a città.
 */
import { calcola, valoreRidKwh, tariffaCer, type FvInput, type FvResult } from './engine/fv';
import { luogoCitta } from './engine/dati';
import { CITTA, PROVINCE, REGIONI } from './engine/params';
import type { Helpers } from './guide-types';

export const MESI = {
  it: ['gen', 'feb', 'mar', 'apr', 'mag', 'giu', 'lug', 'ago', 'set', 'ott', 'nov', 'dic'],
  en: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'],
};

export function citta(slug: string) {
  const c = CITTA[slug];
  const luogo = luogoCitta(slug);
  const R = REGIONI[c.reg];
  const prov = PROVINCE.find((p) => p.sigla === c.sigla)!;
  const rid = valoreRidKwh(c.reg);
  const calc = (kwp: number, consumo: number, batteria = 0, extra: Partial<FvInput> = {}): FvResult =>
    calcola({ luogo, kwp, tilt: 30, az: 0, consumo, batteria, primaCasa: true, ...extra });
  return { c, luogo, R, prov, rid, ridCt: rid * 100, tip: tariffaCer(c.reg, rid * 1000), calc };
}

/** Tabella mese per mese della produzione (kWh) e della quota sull'anno. */
export function tabellaMesi(h: Helpers, r: FvResult, caption: string) {
  const m = MESI[h.lang];
  return h.table([h.lang === 'it' ? 'Mese' : 'Month', 'kWh', h.lang === 'it' ? 'Quota dell\'anno' : 'Share of year'],
    m.map((n, i) => [n, h.num(r.mesi[i]), h.pct(r.mesi[i] / r.produzione, 1)]), caption, ['l', 'r', 'r']);
}
