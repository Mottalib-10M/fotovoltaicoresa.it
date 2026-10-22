/** Impianto fotovoltaico domestico: produzione, autoconsumo, ritiro dedicato, detrazione, rientro. */
import { P, REGIONI, RID, clamp, type Zona } from './params';
import { fattoreOrientamento, quotaAutoconsumo, mesiRegione, type Luogo } from './dati';

/** Prezzo evitato medio 2026 in c€/kWh: materia energia + oneri + imposte, media dei quattro trimestri ARERA. */
export const prezzoEvitatoTrim = (t: (typeof P.prezzo_evitato.trimestri)[number]) => t.energia + t.oneri + t.imposte;
export const PREZZO_EVITATO_CT = Math.round(P.prezzo_evitato.trimestri.reduce((a, t) => a + prezzoEvitatoTrim(t), 0) / P.prezzo_evitato.trimestri.length * 100) / 100;
export const PREZZO_TOTALE_MEDIO_CT = Math.round(P.prezzo_evitato.trimestri.reduce((a, t) => a + t.totale, 0) / P.prezzo_evitato.trimestri.length * 100) / 100;

/** Prezzo medio del ritiro dedicato nella zona, pesato per fascia e per la produzione di ogni mese disponibile (€/MWh). */
export function prezzoZonaleFv(zona: Zona, mesi: number[]): number {
  const z = RID.zone[zona]; const w = P.rid.pesi_fasce; const n = RID.mesi_disponibili;
  let num = 0, den = 0;
  for (let m = 0; m < n; m++) { const pm = w.F1 * z.F1[m] + w.F2 * z.F2[m] + w.F3 * z.F3[m]; num += pm * mesi[m]; den += mesi[m]; }
  return den > 0 ? num / den : 0;
}
/** Valore dell'energia immessa in €/kWh: il maggiore tra prezzo di mercato stimato e prezzo minimo garantito. */
export function valoreRidKwh(reg: number): number {
  const R = REGIONI[reg] ?? REGIONI[0];
  return Math.max(prezzoZonaleFv(R.zona, R.mesi), P.rid.pmg_eur_mwh) / 1000;
}
/** Corrispettivo annuo al GSE per il ritiro dedicato (esente fino a 3 kW). */
export function feeRid(kwp: number): number {
  if (kwp <= P.rid.fee_esente_fino_kw) return 0;
  const s = P.rid.fee_eur_kw.find((x) => kwp <= x.fino_kw) ?? P.rid.fee_eur_kw[P.rid.fee_eur_kw.length - 1];
  return Math.min(P.rid.fee_max_eur, kwp * s.eur);
}
/** Detrazione 2026: 50 % sulla prima casa del proprietario, 36 % negli altri casi, tetto 96 000 €, dieci rate. */
export function detrazione(spesa: number, primaCasa: boolean) {
  const aliquota = primaCasa ? P.detrazione.aliquota_prima_casa : P.detrazione.aliquota_altri;
  const base = Math.min(Math.max(spesa, 0), P.detrazione.tetto_eur);
  const totale = base * aliquota;
  return { aliquota, base, totale, rata: totale / P.detrazione.rate };
}
/** Costo di riferimento (IVA esclusa): 1 500 €/kW fino a 20 kW (DM CER) più 1 000 €/kWh di accumulo. */
export function costoRiferimento(kwp: number, batteriaKwh: number): number {
  const fv = kwp <= 20 ? kwp * P.costi.fv_eur_kw : 20 * P.costi.fv_eur_kw + (kwp - 20) * P.costi.fv_eur_kw_20_200;
  return Math.round(fv + batteriaKwh * P.costi.accumulo_eur_kwh);
}
/** Tariffa premio CER (impianti fino a 200 kW) in €/MWh, data il prezzo zonale, con la correzione per zona geografica. */
export function tariffaCer(reg: number, pz: number): number {
  const c = P.cer; const nome = REGIONI[reg]?.nome ?? '';
  const base = Math.min(c.tip_max_eur_mwh, c.tip_base_eur_mwh + Math.max(0, c.tip_pz_rif - pz));
  const centro = ['Lazio', 'Marche', 'Toscana', 'Umbria', 'Abruzzo'].includes(nome);
  const nord = ['Emilia-Romagna', 'Friuli-Venezia Giulia', 'Liguria', 'Lombardia', 'Piemonte', 'Trentino-Alto Adige', "Valle d'Aosta", 'Veneto'].includes(nome);
  return base + (nord ? c.correzione_nord : centro ? c.correzione_centro : 0);
}

export interface FvInput {
  luogo: Luogo; kwp: number; tilt: number; az: number; ombra?: number; consumo: number; batteria: number;
  primaCasa: boolean; detraibile?: boolean; costo?: number; prezzoCt?: number; ridKwh?: number; ridAttivo?: boolean; quotaCer?: number; anni?: number;
}
export interface FvResult {
  spec: number; produzione: number; mesi: number[]; quota: number; autoconsumo: number; copertura: number; immessa: number;
  prezzoCt: number; risparmio: number; ridKwh: number; ricavoRid: number; fee: number; cer: number; tipCer: number; beneficio: number;
  costo: number; detrazione: number; aliquota: number; rata: number; costoNetto: number; rientro: number | null; saldo: number;
}
export function calcola(e: FvInput): FvResult {
  const f = fattoreOrientamento(e.luogo.reg, e.tilt, e.az);
  const spec = e.luogo.ey * f * (1 - clamp(e.ombra ?? 0, 0, 0.9));
  const produzione = Math.max(0, e.kwp) * spec;
  const quota = quotaAutoconsumo(e.luogo.reg, produzione, e.consumo, e.batteria);
  const autoconsumo = produzione * quota;
  const immessa = produzione - autoconsumo;
  const prezzoCt = e.prezzoCt ?? PREZZO_EVITATO_CT;
  const ridKwh = e.ridKwh ?? valoreRidKwh(e.luogo.reg);
  const rid = e.ridAttivo ?? true;
  const risparmio = autoconsumo * prezzoCt / 100;
  const ricavoRid = rid ? immessa * ridKwh : 0;
  const fee = rid && immessa > 0 ? feeRid(e.kwp) : 0;
  const tipCer = tariffaCer(e.luogo.reg, ridKwh * 1000);
  const cer = (e.quotaCer ?? 0) * immessa * tipCer / 1000;
  const beneficio = risparmio + ricavoRid - fee + cer;
  const costo = e.costo ?? costoRiferimento(e.kwp, e.batteria);
  const d = (e.detraibile ?? true) ? detrazione(costo, e.primaCasa) : { totale: 0, rata: 0, aliquota: 0, base: 0 };
  const anni = e.anni ?? P.modello.anni_orizzonte;
  let cum = 0, rientro: number | null = null;
  for (let y = 1; y <= 40; y++) {
    const flusso = beneficio + (y <= P.detrazione.rate ? d.rata : 0);
    if (rientro === null && flusso > 0 && cum + flusso >= costo) rientro = y - 1 + (costo - cum) / flusso;
    cum += flusso;
    if (y === anni) break;
  }
  const saldo = beneficio * anni + d.totale - costo;
  const mesi = mesiRegione(e.luogo.reg).map((q) => q * produzione);
  return {
    spec, produzione, mesi, quota, autoconsumo, copertura: e.consumo > 0 ? autoconsumo / e.consumo : 0, immessa, prezzoCt, risparmio, ridKwh, ricavoRid, fee, cer, tipCer,
    beneficio, costo, detrazione: d.totale, aliquota: d.aliquota, rata: d.rata, costoNetto: costo - d.totale, rientro, saldo,
  };
}
/** Pannelli necessari e superficie occupata (ipotesi: moduli da 430 W, 1,95 m² ciascuno). */
export function pannelli(kwp: number) {
  const n = Math.ceil(kwp / P.modello.kwp_per_pannello - 1e-9);
  return { n, m2: n * P.modello.m2_per_pannello, kwpEffettivi: n * P.modello.kwp_per_pannello };
}
