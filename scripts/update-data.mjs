#!/usr/bin/env node
/**
 * Aggiornamento dei dati che cambiano durante l'anno (lanciato ogni mese da .github/workflows/update-data.yml).
 *
 * 1. Ritiro dedicato (mensile): scarica il PDF GSE dei prezzi medi mensili per fascia e zona e riscrive
 *    src/data/rid-2026.json con scripts/data/update-rid.py se è uscito un mese nuovo.
 * 2. Prezzo evitato ARERA (trimestrale) e prezzo minimo garantito (annuale): non si estraggono in automatico,
 *    perché escono come comunicati stampa e delibere. Lo script controlla che le pagine citate rispondano e
 *    segnala quando inizia un trimestre non ancora presente in params-2026.json: il dato va inserito a mano.
 * 3. Se un dato è cambiato, aggiorna LAST_UPDATED in src/data/site-config.ts.
 *
 * Uscita: 0 se tutto è a posto (anche senza novità), 1 se un download o un controllo fallisce.
 * Nessun dato viene inventato: se il PDF non si legge, il file resta com'era.
 */
import { execFileSync } from 'node:child_process';
import { readFileSync, writeFileSync, mkdtempSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..');
const P = JSON.parse(readFileSync(join(ROOT, 'src/data/params-2026.json'), 'utf8'));
const UA = { 'user-agent': 'Mozilla/5.0 (aggiornamento dati fotovoltaico; Radif Partners)' };
let changed = false, failed = false;
const log = (...a) => console.log('[update-data]', ...a);

// 1. Ritiro dedicato -------------------------------------------------------------------------------
try {
  const url = P.sources.gse_rid_prezzi.url;
  const res = await fetch(url, { headers: UA });
  if (!res.ok) throw new Error(`GSE ${res.status}`);
  const buf = Buffer.from(await res.arrayBuffer());
  if (buf.subarray(0, 4).toString() !== '%PDF') throw new Error('il file GSE non è un PDF');
  const pdf = join(mkdtempSync(join(tmpdir(), 'rid-')), 'prezzi-rid.pdf');
  writeFileSync(pdf, buf);
  const out = execFileSync('python3', [join(ROOT, 'scripts/data/update-rid.py'), pdf], { encoding: 'utf8' }).trim();
  log('ritiro dedicato:', out);
  if (out.startsWith('aggiornato')) changed = true;
} catch (e) {
  failed = true;
  log('ritiro dedicato: ERRORE', e.message);
}

// 2. ARERA: pagine raggiungibili e trimestre corrente presente --------------------------------------
for (const k of ['arera_q4', 'arera_pmg', 'arera_consumi']) {
  try {
    const r = await fetch(P.sources[k].url, { headers: UA, method: 'GET' });
    log(`${k}: HTTP ${r.status}`);
    if (r.status >= 400) failed = true;
  } catch (e) {
    failed = true;
    log(`${k}: ERRORE`, e.message);
  }
}
const now = new Date();
const anno = now.getUTCFullYear(), trim = Math.floor(now.getUTCMonth() / 3) + 1;
const presenti = P.prezzo_evitato.trimestri.length;
if (anno > 2026) {
  log(`ATTENZIONE: siamo nel ${anno}. Servono params-${anno}.json (detrazione, prezzo minimo garantito, trimestri ARERA) e rid-${anno}.json.`);
} else if (trim > presenti) {
  log(`ATTENZIONE: il trimestre ${trim} del 2026 non è in params-2026.json (prezzo_evitato.trimestri): inserirlo dal comunicato ARERA.`);
}

// 3. Data di aggiornamento --------------------------------------------------------------------------
if (changed) {
  const f = join(ROOT, 'src/data/site-config.ts');
  const today = now.toISOString().slice(0, 10);
  writeFileSync(f, readFileSync(f, 'utf8').replace(/LAST_UPDATED = '\d{4}-\d{2}-\d{2}'/, `LAST_UPDATED = '${today}'`));
  log('LAST_UPDATED →', today);
}
log(changed ? 'dati aggiornati' : 'nessuna novità');
process.exit(failed ? 1 : 0);
