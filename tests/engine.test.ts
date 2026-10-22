/** Motore: valori di legge letti da params-2026.json, interpolazioni e casi limite. */
import { describe, expect, it } from 'vitest';
import { P, REGIONI, RID, ITALIA, PROVINCE, CITTA } from '../src/lib/engine/params';
import { calcola, detrazione, feeRid, valoreRidKwh, tariffaCer, costoRiferimento, PREZZO_EVITATO_CT, prezzoZonaleFv, pannelli } from '../src/lib/engine/fv';
import { fattoreOrientamento, quotaAutoconsumo, luogoCitta, profilo } from '../src/lib/engine/dati';

const roma = luogoCitta('roma');
const base = { luogo: roma, kwp: 3, tilt: 30, az: 0, consumo: 3000, batteria: 0, primaCasa: true };

describe('dati', () => {
  it('20 regioni, 107 province, 7 896 comuni, 7 zone con gli stessi mesi', () => {
    expect(REGIONI).toHaveLength(20); expect(PROVINCE).toHaveLength(107); expect(ITALIA.n_comuni).toBe(7896);
    expect(Object.keys(RID.zone)).toHaveLength(7);
    for (const z of Object.values(RID.zone)) for (const f of ['F1', 'F2', 'F3'] as const) expect(z[f]).toHaveLength(RID.mesi_disponibili);
    for (const r of REGIONI) { expect(r.mesi.reduce((a, x) => a + x, 0)).toBeCloseTo(1, 2); expect(r.ey).toBeGreaterThan(1100); expect(r.ey).toBeLessThan(1700); }
  });
  it('città con produzione PVGIS plausibile', () => { for (const c of Object.values(CITTA)) { expect(c.ey).toBeGreaterThan(1200); expect(c.em).toHaveLength(12); } });
});

describe('orientamento e autoconsumo', () => {
  it('30° sud vale 1, nord e verticale molto meno, simmetria est-ovest approssimata', () => {
    expect(fattoreOrientamento(6, 30, 0)).toBeCloseTo(1, 3);
    expect(fattoreOrientamento(6, 30, 180)).toBeLessThan(0.7);
    expect(fattoreOrientamento(6, 90, 0)).toBeLessThan(0.75);
    expect(Math.abs(fattoreOrientamento(6, 30, -90) - fattoreOrientamento(6, 30, 90))).toBeLessThan(0.05);
    expect(fattoreOrientamento(6, 30, -180)).toBeCloseTo(fattoreOrientamento(6, 30, 180), 6);
  });
  it('la quota autoconsumata scende con la taglia e sale con la batteria', () => {
    const q = (prod: number, b: number) => quotaAutoconsumo(6, prod, 3000, b);
    expect(q(1500, 0)).toBeGreaterThan(q(3000, 0)); expect(q(3000, 0)).toBeGreaterThan(q(6000, 0));
    expect(q(6000, 10)).toBeGreaterThan(q(6000, 5)); expect(q(6000, 5)).toBeGreaterThan(q(6000, 0));
    expect(q(60000, 0) * 60000).toBeLessThanOrEqual(3000);
    expect(profilo(1800)).toBe('base'); expect(profilo(3000)).toBe('alto');
  });
});

describe('incentivi e prezzi', () => {
  it('detrazione 2026: 50 % prima casa, 36 % altrimenti, tetto 96 000 €, dieci rate', () => {
    expect(detrazione(10000, true).totale).toBe(5000);
    expect(detrazione(10000, false).totale).toBeCloseTo(3600, 6);
    expect(detrazione(200000, true).totale).toBe(48000);
    expect(detrazione(10000, true).rata).toBe(500);
    expect(P.detrazione.rate).toBe(10);
  });
  it('corrispettivo GSE: esente fino a 3 kW, 0,7 €/kW fino a 20 kW, massimo 10 000 €', () => {
    expect(feeRid(3)).toBe(0); expect(feeRid(6)).toBeCloseTo(4.2, 6); expect(feeRid(100)).toBeCloseTo(65, 6); expect(feeRid(1e6)).toBe(10000);
  });
  it('valore RID tra il PMG e 200 €/MWh, prezzo evitato = energia + oneri + imposte', () => {
    for (let r = 0; r < 20; r++) { const v = valoreRidKwh(r); expect(v).toBeGreaterThanOrEqual(P.rid.pmg_eur_mwh / 1000); expect(v).toBeLessThan(0.2); }
    expect(PREZZO_EVITATO_CT).toBeCloseTo((19.55 + 21.82 + 23.34 + 35.14) / 4, 1);
    expect(prezzoZonaleFv('Nord', REGIONI[8].mesi)).toBeGreaterThan(50);
  });
  it('tariffa CER: 80 + max(0; 180 − Pz), tetto 120, +10 al Nord, +4 al Centro', () => {
    expect(tariffaCer(13, 200)).toBe(80); // Sardegna, nessuna correzione
    expect(tariffaCer(13, 100)).toBe(120);
    expect(tariffaCer(8, 150)).toBe(120); // Lombardia: 110 + 10
    expect(tariffaCer(6, 170)).toBe(94); // Lazio: 90 + 4
  });
  it('costo di riferimento DM CER e accumulo', () => {
    expect(costoRiferimento(6, 0)).toBe(9000); expect(costoRiferimento(6, 10)).toBe(19000); expect(costoRiferimento(25, 0)).toBe(36000);
    expect(pannelli(3).n).toBe(7);
  });
});

describe('calcolo completo', () => {
  it('3 kW a Roma: produzione, bilancio energetico, rientro coerente', () => {
    const r = calcola(base);
    expect(r.produzione).toBeCloseTo(3 * roma.ey, 0);
    expect(r.autoconsumo + r.immessa).toBeCloseTo(r.produzione, 6);
    expect(r.beneficio).toBeCloseTo(r.risparmio + r.ricavoRid - r.fee + r.cer, 6);
    expect(r.rientro).not.toBeNull(); expect(r.rientro!).toBeGreaterThan(2); expect(r.rientro!).toBeLessThan(15);
    expect(r.mesi.reduce((a, x) => a + x, 0)).toBeCloseTo(r.produzione, 0);
  });
  it('senza ritiro dedicato il surplus non rende; la batteria alza l\'autoconsumo', () => {
    expect(calcola({ ...base, ridAttivo: false }).ricavoRid).toBe(0);
    expect(calcola({ ...base, batteria: 5 }).autoconsumo).toBeGreaterThan(calcola(base).autoconsumo);
  });
  it('kWp a zero non produce NaN', () => {
    const r = calcola({ ...base, kwp: 0 });
    for (const v of [r.produzione, r.quota, r.beneficio, r.costo]) expect(Number.isFinite(v)).toBe(true);
    expect(r.rientro).toBeNull();
  });
});
