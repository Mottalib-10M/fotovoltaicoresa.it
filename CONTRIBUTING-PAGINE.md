# Aggiungere o modificare una pagina

Una pagina = **un file** in `src/content/calcolatori/`, `src/content/guide/` o `src/content/citta/`.
Il nome del file è l'`id` della pagina. Rotte, menu, sitemap, hreflang e schema si generano da soli.

## Struttura del file

```ts
import { defineGuide } from '../../lib/guide-types';
export default defineGuide({
  id: 'nome-del-file',
  group: 'calcolo' | 'incentivi' | 'impianto' | 'citta',
  order: 10,
  tool: 'rendimento',           // vista del simulatore principale (FvCalc), oppure `mini`
  toolPreset: { kwp: 3, cons: 2700 }, // valori iniziali; nelle città anche `citta: 'roma'`
  related: ['altra-pagina', ...], // almeno 3 id esistenti
  sources: ['pvgis', ...],      // almeno 2 chiavi di src/data/params-2026.json → sources
  it: { slug, nav, card, title, description, h1, intro, resume, faqs, body: (h) => `...` },
  en: { ... },
});
```

## Regole controllate da `tests/pages.test.ts`

- `title` 50-60 caratteri, `description` 150-160, entrambi con « 2026 », termine cercato per primo, nessun trattino lungo.
- `resume` (paragrafo citabile) di almeno 120 parole, con i numeri.
- FAQ: da 3 a 8 per le pagine con simulatore, risposte di 40-90 parole.
- Lunghezza totale: almeno 450 parole (pagine con simulatore), 650 (città), 1 100 (guide senza simulatore).
- Slug senza anno; link interni solo con `h.a('id', 'testo')`, fonti solo con `h.src('chiave', 'testo')`.

Verifica di una sola pagina: `PAGE_FILES=nome-del-file npx vitest run tests/pages.test.ts`.

## Numeri

- Ogni numero di legge viene da `P` (`src/data/params-2026.json`), ogni esempio dal motore (`calcola`, `src/lib/engine/fv.ts`).
- Nei testi fuori da `body` si usano i formattatori `IT` / `EN` di `src/lib/fmt.ts`; in `body` gli helper `h.eur`, `h.num`, `h.pct`.
- Nessun prezzo di mercato inventato: il costo di partenza è il riferimento del decreto CER (1 500 €/kW) e del DL 34/2020 (1 000 €/kWh), sempre chiamato « riferimento ».
- Un dato non ancora pubblicato si scrive « à paraître » / « in arrivo », mai stimato senza dirlo.

## Dati

- `npm run` non scarica nulla: i dati PVGIS, GeoNames e ARERA si ricostruiscono con `scripts/data/fetch-pvgis.py`, `build-autoconsumo.py` e `build-site-data.py` (dati grezzi in `research/`).
- I prezzi del ritiro dedicato si aggiornano ogni mese con `node scripts/update-data.mjs` (anche via GitHub Actions, il 25 del mese).
- Trimestri ARERA e prezzo minimo garantito vanno inseriti a mano in `params-2026.json`: lo script lo segnala.
