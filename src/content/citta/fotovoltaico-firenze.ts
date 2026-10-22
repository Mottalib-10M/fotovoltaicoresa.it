import { defineGuide } from '../../lib/guide-types';
import { citta, tabellaMesi } from '../../lib/citta-kit';
import { IT, EN, P } from '../../lib/fmt';

/** Firenze: le stagioni dell'impianto (trimestri), zona Centro Nord con correzione CER del Centro, colline e Appennino. */
const F = citta('firenze');
const cons = F.R.cons_alto;
const r = F.calc(3, cons), rCer = F.calc(3, cons, 0, { quotaCer: 0.5 });
const Q = [[0, 1, 2], [3, 4, 5], [6, 7, 8], [9, 10, 11]];
const QN = { it: ['Inverno (gen-mar)', 'Primavera (apr-giu)', 'Estate (lug-set)', 'Autunno (ott-dic)'], en: ['Winter (Jan-Mar)', 'Spring (Apr-Jun)', 'Summer (Jul-Sep)', 'Autumn (Oct-Dec)'] };
const q = (i: number) => Q[i].reduce((s, m) => s + r.mesi[m], 0);
const prov = F.prov;
const best = [0, 1, 2, 3].sort((a, b) => q(b) - q(a))[0];

export default defineGuide({
  id: 'fotovoltaico-firenze',
  group: 'citta',
  order: 80,
  tool: 'produzione',
  toolPreset: { citta: 'firenze', kwp: 3, cons },
  related: ['fotovoltaico-bologna', 'fotovoltaico-roma', 'quanto-produce-un-impianto-fotovoltaico', 'comunita-energetiche', 'orientamento-pannelli-solari'],
  sources: ['pvgis', 'gse_rid_prezzi', 'dm_cer', 'arera_consumi', 'geonames'],
  it: {
    slug: 'fotovoltaico-firenze',
    nav: 'Firenze',
    card: `${IT.num(F.c.ey)} kWh per kWp; l'impianto stagione per stagione e la tariffa CER del Centro.`,
    title: 'Fotovoltaico Firenze 2026: produzione stagione per stagione',
    description: 'Fotovoltaico Firenze 2026: quanto produce un impianto mese per mese e stagione per stagione, quanto vale il surplus in Toscana e il premio delle CER locali.',
    h1: 'Fotovoltaico a Firenze: le quattro stagioni di un impianto',
    intro: `A Firenze 3 kWp producono ${IT.kwh(r.produzione)} l'anno: ${IT.kwh(q(2))} da luglio a settembre e ${IT.kwh(q(0))} da gennaio a marzo. Il surplus vale circa ${IT.num(F.ridCt, 1)} centesimi per kWh nella zona Centro Nord.`,
    resume: `Firenze sta in una conca circondata da colline, fra la pianura dell'Arno e l'Appennino. Secondo PVGIS 5.3, alle coordinate del comune un impianto con moduli a 30° verso sud produce ${IT.num(F.c.ey)} kWh per kWp l'anno, poco sotto la media italiana e meno di Roma, ma più di Bologna e Milano. Quello che conta per la bolletta, però, è come si distribuisce l'energia nell'anno. Con 3 kWp la stagione migliore è ${QN.it[best].toLowerCase().split(' (')[0]}, con ${IT.kwh(q(best))}; l'inverno da gennaio a marzo dà ${IT.kwh(q(0))} e l'ultimo trimestre ${IT.kwh(q(3))}. La Toscana è nella zona di mercato Centro Nord, dove nel 2026 il ritiro dedicato del GSE, pesato sulle ore di sole, ha pagato circa ${IT.num(F.ridCt, 1)} centesimi per kWh, quasi come al Nord. Per le comunità energetiche, invece, la Toscana conta come Centro: la tariffa premio ha la correzione di ${P.cer.correzione_centro} euro per MWh e arriva a ${IT.num(F.tip)} euro. Con il consumo medio toscano di ${IT.num(cons)} kWh, 3 kWp rendono ${IT.eur(r.beneficio)} l'anno e rientrano in ${IT.anni(r.rientro)} al costo di riferimento. In provincia la resa va da ${IT.num(prov.min[1])} kWh a ${prov.min[0]} a ${IT.num(prov.max[1])} a ${prov.max[0]}.`,
    faqs: [
      { q: 'Quanto produce un impianto fotovoltaico a Firenze?', a: `${IT.kwh(r.produzione)} l'anno con 3 kWp a 30° verso sud, secondo PVGIS 5.3, cioè ${IT.num(F.c.ey)} kWh per ogni kWp. Il mese migliore è luglio con ${IT.kwh(r.mesi[6])}, il peggiore dicembre con ${IT.kwh(r.mesi[11])}. Sulle colline esposte a sud la resa può essere più alta della città; nelle valli dell'Appennino più bassa.` },
      { q: 'Quanto rende una comunità energetica a Firenze?', a: `La tariffa premio vale ${IT.num(F.tip)} euro per MWh condiviso, con la correzione del Centro. Se metà dell'energia immessa da 3 kWp viene condivisa, la comunità riceve ${IT.eur(rCer.cer)} l'anno, che si aggiungono al ritiro dedicato. Quanto ne arriva a voi dipende dallo statuto della comunità.` },
      { q: 'In quale stagione il fotovoltaico fa risparmiare di più a Firenze?', a: `In estate produce di più, ${IT.kwh(q(2))} da luglio a settembre con 3 kWp, ma una parte maggiore va in rete al prezzo del ritiro dedicato. In autunno e in inverno produce meno, ma quasi tutto viene usato in casa al prezzo pieno della bolletta. Il simulatore calcola il risultato sull'anno intero, con il consumo che inserite.` },
      { q: 'Nel centro storico di Firenze si possono mettere i pannelli?', a: 'Il centro storico è patrimonio UNESCO e molti edifici sono vincolati, quindi i pannelli visibili dalla strada o dai punti panoramici possono richiedere autorizzazioni paesaggistiche ed essere negati. Prima del preventivo chiedete all\'installatore di verificare i vincoli del vostro edificio con il Comune. Nei quartieri esterni e in provincia i vincoli sono in genere minori, ma vale la pena chiedere comunque.' },
    ],
    body: (h) => `
<h2>Le quattro stagioni con 3 kWp</h2>
${h.table([h.lang === 'it' ? 'Stagione' : 'Season', 'kWh', h.lang === 'it' ? 'Quota dell\'anno' : 'Share of year'], [0, 1, 2, 3].map((i) => [QN.it[i], h.num(q(i)), h.pct(q(i) / r.produzione)]), 'Firenze, 3 kWp a 30° sud, PVGIS 5.3.', ['l', 'r', 'r'])}
<p>Primavera ed estate insieme danno il ${h.pct((q(1) + q(2)) / r.produzione)} della produzione. Il primo e l'ultimo trimestre, quando si accendono luci e riscaldamento, producono il resto. In autunno e in inverno la casa usa in proporzione più energia del proprio impianto, mentre d'estate una parte maggiore va in rete.</p>

<h2>Mese per mese</h2>
${tabellaMesi(h, r, 'Firenze, 3 kWp a 30° sud, PVGIS 5.3, ripartizione mensile della regione.')}
<p>La ripartizione mensile viene dalla serie oraria ${h.src('pvgis', 'PVGIS')} della Toscana, scalata sulla resa del comune. L'energia immessa è pagata con i ${h.src('gse_rid_prezzi', 'prezzi GSE')} della zona Centro Nord, che variano molto da un mese all'altro: in primavera, quando il sole è forte e la domanda bassa, i prezzi del mercato sono più deboli.</p>

<h2>Firenze e la sua provincia</h2>
<p>La Città metropolitana conta ${prov.n} comuni, con una resa media di ${h.num(prov.ey)} kWh per kWp. ${prov.max[0]}, nel Valdarno inferiore, è il più soleggiato; ${prov.min[0]}, nella Val di Sieve, il meno. Chi abita sulle colline del Chianti o di Fiesole deve scrivere il proprio comune nel simulatore: la resa cambia con l'esposizione del versante e l'orizzonte. La tariffa delle comunità energetiche segue l'allegato del ${h.src('dm_cer', 'decreto CER')}, il consumo medio di ${h.num(cons)} kWh le tabelle ${h.src('arera_consumi', 'ARERA')} per i residenti toscani. I comuni vengono dall'elenco ${h.src('geonames', 'GeoNames')}.</p>`,
  },
  en: {
    slug: 'solar-panels-florence',
    nav: 'Florence',
    card: `${EN.num(F.c.ey)} kWh per kWp; the system season by season and the Centre's CER premium.`,
    title: 'Solar Panels Florence 2026: Output Season by Season',
    description: 'Solar panels in Florence in 2026: what a system produces month by month and season by season, what the surplus earns in Tuscany and the community premium.',
    h1: 'Solar in Florence: the four seasons of a system',
    intro: `In Florence 3 kWp produce ${EN.kwh(r.produzione)} a year: ${EN.kwh(q(2))} from July to September and ${EN.kwh(q(0))} from January to March. The surplus earns about ${EN.num(F.ridCt, 1)} cents per kWh in the Centro Nord zone.`,
    resume: `Florence lies in a basin surrounded by hills, between the Arno plain and the Apennines. According to PVGIS 5.3, at the comune's coordinates a system with panels at 30° facing south produces ${EN.num(F.c.ey)} kWh per kWp a year, slightly below the Italian average and less than Rome, but more than Bologna and Milan. What matters for the bill, though, is how energy is spread over the year. With 3 kWp the best season is ${QN.en[best].toLowerCase().split(' (')[0]}, with ${EN.kwh(q(best))}; winter from January to March gives ${EN.kwh(q(0))} and the last quarter ${EN.kwh(q(3))}. Tuscany is in the Centro Nord market zone, where in 2026 the GSE ritiro dedicato, weighted on sunny hours, paid about ${EN.num(F.ridCt, 1)} cents per kWh, almost as much as in the North. For energy communities, however, Tuscany counts as the Centre: the premium carries the ${P.cer.correzione_centro} euro per MWh adjustment and reaches ${EN.num(F.tip)} euros. With Tuscany's average use of ${EN.num(cons)} kWh, 3 kWp earn ${EN.eur(r.beneficio)} a year and pay back in ${EN.anni(r.rientro)} at the reference cost. Across the province yield ranges from ${EN.num(prov.min[1])} kWh in ${prov.min[0]} to ${EN.num(prov.max[1])} in ${prov.max[0]}.`,
    faqs: [
      { q: 'How much does a solar system produce in Florence?', a: `${EN.kwh(r.produzione)} a year with 3 kWp at 30° facing south, according to PVGIS 5.3, that is ${EN.num(F.c.ey)} kWh per kWp. The best month is July with ${EN.kwh(r.mesi[6])}, the worst December with ${EN.kwh(r.mesi[11])}. On south-facing hills the yield may be higher than in the city; in the Apennine valleys lower.` },
      { q: 'What does an energy community earn in Florence?', a: `The premium is worth ${EN.num(F.tip)} euros per shared MWh, with the Centre adjustment. If half the energy exported by 3 kWp is shared, the community receives ${EN.eur(rCer.cer)} a year, on top of the ritiro dedicato. How much of it reaches you depends on the community's statute.` },
      { q: 'In which season does solar save most in Florence?', a: `In summer it produces most, ${EN.kwh(q(2))} from July to September with 3 kWp, but a larger part goes to the grid at the ritiro dedicato price. In autumn and winter it produces less, but nearly all of it is used at home at the full bill price. The calculator works out the result over the whole year, with the use you enter.` },
      { q: 'Can you put panels on roofs in Florence\'s historic centre?', a: 'The historic centre is a UNESCO World Heritage site and many buildings are protected, so panels visible from the street or viewpoints may need landscape permits and can be refused. Before quoting, ask the installer to check your building\'s constraints with the Comune. In outer districts and the province constraints are usually lighter, but it is still worth asking.' },
    ],
    body: (h) => `
<h2>The four seasons with 3 kWp</h2>
${h.table(['Season', 'kWh', 'Share of year'], [0, 1, 2, 3].map((i) => [QN.en[i], h.num(q(i)), h.pct(q(i) / r.produzione)]), 'Florence, 3 kWp at 30° south, PVGIS 5.3.', ['l', 'r', 'r'])}
<p>Spring and summer together give ${h.pct((q(1) + q(2)) / r.produzione)} of output. The first and last quarters, when lights and heating come on, produce the rest. In autumn and winter the home uses proportionally more of its own system's energy, while in summer a larger part goes to the grid.</p>

<h2>Month by month</h2>
${tabellaMesi(h, r, 'Florence, 3 kWp at 30° south, PVGIS 5.3, regional monthly split.')}
<p>The monthly split comes from the Tuscan ${h.src('pvgis', 'PVGIS')} hourly series, scaled to the comune's yield. Exported energy is paid at the ${h.src('gse_rid_prezzi', 'GSE prices')} of the Centro Nord zone, which vary a lot from month to month: in spring, when the sun is strong and demand low, market prices are weaker.</p>

<h2>Florence and its province</h2>
<p>The Metropolitan City has ${prov.n} comuni, with an average yield of ${h.num(prov.ey)} kWh per kWp. ${prov.max[0]}, in the lower Valdarno, is the sunniest; ${prov.min[0]}, in the Val di Sieve, the least. Anyone living on the Chianti or Fiesole hills should type their own comune into the calculator: yield changes with the slope's facing and the horizon. The energy community premium follows the annex of the ${h.src('dm_cer', 'energy community decree')}, the average use of ${h.num(cons)} kWh the ${h.src('arera_consumi', 'ARERA')} tables for Tuscan residents. The comuni come from the ${h.src('geonames', 'GeoNames')} list.</p>`,
  },
});
