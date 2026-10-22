import { defineGuide } from '../../lib/guide-types';
import { citta } from '../../lib/citta-kit';
import { feeRid, pannelli } from '../../lib/engine/fv';
import { IT, EN, P } from '../../lib/fmt';

/** Bari: villetta con tetto grande, 6 kWp (anche 8), consumo pugliese; provincia piana e omogenea. */
const B = citta('bari');
const cons = B.R.cons_alto;
const KWP = [3, 4.5, 6, 8];
const x = (k: number, bat = 0) => B.calc(k, cons, bat);
const a6 = x(6), a3 = x(3), a8 = x(8), a6b = x(6, 10);
const marg = (lo: ReturnType<typeof x>, hi: ReturnType<typeof x>, dk: number) => (hi.beneficio - lo.beneficio) / dk;
const pn6 = pannelli(6), pn8 = pannelli(8);
const prov = B.prov;

export default defineGuide({
  id: 'fotovoltaico-bari',
  group: 'citta',
  order: 90,
  tool: 'rendimento',
  toolPreset: { citta: 'bari', kwp: 6, cons },
  related: ['impianto-fotovoltaico-6-kw', 'fotovoltaico-napoli', 'fotovoltaico-catania', 'dimensionamento-impianto-fotovoltaico', 'ritiro-dedicato'],
  sources: ['pvgis', 'arera_consumi', 'gse_rid_prezzi', 'gse_rid', 'geonames'],
  it: {
    slug: 'fotovoltaico-bari',
    nav: 'Bari',
    card: `${IT.num(B.c.ey)} kWh per kWp; 6 kWp su una villetta, con il valore di ogni kWp in più.`,
    title: 'Fotovoltaico Bari 2026: 6 kW su una villetta, resa e rientro',
    description: 'Fotovoltaico Bari 2026: quanto produce e quanto rende un impianto da 6 kW su una casa indipendente, quanto vale ogni kWp in più e quando aggiungere la batteria.',
    h1: 'Fotovoltaico a Bari: un impianto da 6 kW su una casa indipendente',
    intro: `A Bari 6 kWp producono ${IT.kwh(a6.produzione)} l'anno, più del doppio del consumo medio pugliese di ${IT.num(cons)} kWh. Il beneficio è di ${IT.eur(a6.beneficio)} l'anno contro ${IT.eur(a3.beneficio)} di 3 kWp, e il rientro di ${IT.anni(a6.rientro)}.`,
    resume: `Nella provincia di Bari molte famiglie vivono in case indipendenti o villette a schiera con tetti piani o terrazzi, dove c'è spazio per più dei classici 3 kWp. Secondo PVGIS 5.3 un impianto con moduli a 30° verso sud produce a Bari ${IT.num(B.c.ey)} kWh per kWp l'anno, fra i valori più alti delle città continentali. La Puglia è nella zona di mercato Sud, dove nel 2026 il ritiro dedicato del GSE ha pagato circa ${IT.num(B.ridCt, 1)} centesimi per kWh immesso nelle ore di sole. Con il consumo medio pugliese di ${IT.num(cons)} kWh indicato da ARERA, un impianto da 6 kWp usa in casa il ${IT.pct(a6.quota)} della produzione e vende il resto. Il conto resta positivo: beneficio di ${IT.eur(a6.beneficio)} l'anno e saldo di ${IT.eur(a6.saldo)} dopo vent'anni al costo di riferimento, contro ${IT.eur(a3.saldo)} di un 3 kWp. Ogni kWp aggiunto oltre i 3 rende però meno del precedente: fra 3 e 6 kWp circa ${IT.eur(marg(a3, a6, 3))} l'anno per kWp, fra 6 e 8 kWp circa ${IT.eur(marg(a6, a8, 2))}. Oltre i 3 kW si paga anche il corrispettivo del ritiro dedicato, ${IT.eur(feeRid(6), 2)} l'anno per 6 kWp.`,
    faqs: [
      { q: 'Quanto produce un impianto da 6 kW a Bari?', a: `${IT.kwh(a6.produzione)} l'anno a 30° verso sud secondo PVGIS 5.3, cioè circa ${IT.kwh(a6.produzione / 12)} al mese in media, da ${IT.kwh(a6.mesi[11])} a dicembre a ${IT.kwh(a6.mesi[6])} a luglio. In provincia la resa cambia poco: da ${IT.num(prov.min[1])} kWh per kWp a ${prov.min[0]} a ${IT.num(prov.max[1])} a ${prov.max[0]}.` },
      { q: 'Conviene fare 8 kW invece di 6 su una villetta?', a: `Se il tetto lo permette e il preventivo per kW resta uguale, sì in valore assoluto: 8 kWp danno un saldo dopo vent'anni di ${IT.eur(a8.saldo)} contro ${IT.eur(a6.saldo)}. Ma ogni kWp in più rende circa ${IT.eur(marg(a6, a8, 2))} l'anno, quasi tutto dal ritiro dedicato. Se prevedete un'auto elettrica o una pompa di calore, la taglia maggiore diventa più utile.` },
      { q: 'Quanto spazio serve per 6 kW su un tetto piano?', a: `Servono ${pn6.n} moduli da 430 W, circa ${IT.num(pn6.m2)} metri quadrati di superficie dei soli pannelli; per 8 kWp ${pn8.n} moduli e circa ${IT.num(pn8.m2)} metri quadrati. Su un terrazzo piano le file inclinate vanno distanziate per non farsi ombra in inverno, quindi la superficie occupata è maggiore. Con inclinazioni basse le file possono stare più vicine.` },
      { q: 'Con 6 kW a Bari conviene la batteria?', a: `Con ${IT.num(cons)} kWh di consumo, 10 kWh di accumulo portano la quota usata in casa dal ${IT.pct(a6.quota)} al ${IT.pct(a6b.quota)} e la copertura dei consumi al ${IT.pct(a6b.copertura)}. Al costo di riferimento il rientro dell'insieme passa da ${IT.anni(a6.rientro)} a ${IT.anni(a6b.rientro)}. Conviene se il preventivo della batteria è basso o se la sera i consumi sono alti.` },
    ],
    body: (h) => `
<h2>Quattro taglie sulla stessa casa</h2>
${h.table(['Impianto', 'Produzione', 'Usata in casa', 'Ritiro dedicato', 'Beneficio annuo', 'Rientro', 'Saldo in 20 anni'], KWP.map((k) => { const y = x(k); return [`${h.num(k, 1)} kWp`, `${h.num(y.produzione)} kWh`, h.pct(y.quota), h.eur(y.ricavoRid - y.fee), h.eur(y.beneficio), `${h.num(y.rientro ?? 0, 1)} anni`, h.eur(y.saldo)]; }), `Bari, 30° sud, consumo ${h.num(cons)} kWh (media ARERA della Puglia), costo di riferimento, detrazione ${h.pct(P.detrazione.aliquota_prima_casa)}. Ritiro dedicato al netto del corrispettivo GSE.`, ['l', 'r', 'r', 'r', 'r', 'r', 'r'])}
<p>Il saldo dopo vent'anni cresce con la taglia, ma la quota usata in casa scende e il rientro si allunga un poco. La scelta dipende da cosa conta di più: recuperare presto la spesa o massimizzare il guadagno nel tempo. Su una casa indipendente con un tetto ampio la taglia da 6 kWp è un buon compromesso con i consumi di oggi.</p>

<h2>Il surplus nella zona Sud</h2>
<p>Con 6 kWp la maggior parte della produzione va in rete. Il contratto di ${h.src('gse_rid', 'ritiro dedicato')} la paga con i ${h.src('gse_rid_prezzi', 'prezzi mensili del GSE')} della zona Sud, che nel 2026 sono stati un po' più bassi di quelli del Nord. Se il mercato scendesse molto, interverrebbe il prezzo minimo garantito di ${h.num(P.rid.pmg_eur_mwh, 1)} euro per MWh. Spostare consumi nelle ore di sole, come lavatrice, lavastoviglie e scaldabagno, alza la quota che vale il prezzo pieno della bolletta.</p>

<h2>Una provincia di pianura</h2>
<p>La Città metropolitana di Bari conta ${prov.n} comuni con una resa media di ${h.num(prov.ey)} kWh per kWp, e la differenza fra il migliore e il peggiore è di appena ${h.num(prov.max[1] - prov.min[1])} kWh. Da Molfetta a Monopoli, da Altamura a Conversano il dato di Bari è quindi una buona stima: quello che cambia è il tetto. I numeri vengono da ${h.src('pvgis', 'PVGIS 5.3')} alle coordinate dei comuni dell'elenco ${h.src('geonames', 'GeoNames')}; il consumo medio dalle tabelle ${h.src('arera_consumi', 'ARERA')} per i residenti pugliesi con 3-4,5 kW.</p>`,
  },
  en: {
    slug: 'solar-panels-bari',
    nav: 'Bari',
    card: `${EN.num(B.c.ey)} kWh per kWp; 6 kWp on a detached house, with the value of each extra kWp.`,
    title: 'Solar Panels Bari 2026: a 6 kW System on a Detached House',
    description: 'Solar panels in Bari in 2026: what a 6 kW system on a detached house produces and earns, what each extra kWp is worth and when to add a battery, from PVGIS.',
    h1: 'Solar in Bari: a 6 kW system on a detached house',
    intro: `In Bari 6 kWp produce ${EN.kwh(a6.produzione)} a year, more than twice Apulia's average use of ${EN.num(cons)} kWh. The benefit is ${EN.eur(a6.beneficio)} a year against ${EN.eur(a3.beneficio)} for 3 kWp, and payback ${EN.anni(a6.rientro)}.`,
    resume: `In the province of Bari many families live in detached or terraced houses with flat roofs or terraces, where there is room for more than the classic 3 kWp. According to PVGIS 5.3 a system with panels at 30° facing south produces ${EN.num(B.c.ey)} kWh per kWp a year in Bari, among the highest values of mainland cities. Apulia is in the South market zone, where in 2026 the GSE ritiro dedicato paid about ${EN.num(B.ridCt, 1)} cents per kWh exported in sunny hours. With the Apulian average use of ${EN.num(cons)} kWh given by ARERA, a 6 kWp system uses ${EN.pct(a6.quota)} of its output at home and sells the rest. The sum stays positive: a benefit of ${EN.eur(a6.beneficio)} a year and a balance of ${EN.eur(a6.saldo)} after twenty years at the reference cost, against ${EN.eur(a3.saldo)} for 3 kWp. Each kWp added beyond 3 earns less than the one before, though: between 3 and 6 kWp about ${EN.eur(marg(a3, a6, 3))} a year per kWp, between 6 and 8 kWp about ${EN.eur(marg(a6, a8, 2))}. Above 3 kW you also pay the ritiro dedicato fee, ${EN.eur(feeRid(6), 2)} a year for 6 kWp.`,
    faqs: [
      { q: 'How much does a 6 kW system produce in Bari?', a: `${EN.kwh(a6.produzione)} a year at 30° facing south according to PVGIS 5.3, about ${EN.kwh(a6.produzione / 12)} a month on average, from ${EN.kwh(a6.mesi[11])} in December to ${EN.kwh(a6.mesi[6])} in July. Across the province yield changes little: from ${EN.num(prov.min[1])} kWh per kWp in ${prov.min[0]} to ${EN.num(prov.max[1])} in ${prov.max[0]}.` },
      { q: 'Is 8 kW better than 6 on a detached house?', a: `If the roof allows it and the price per kW stays the same, yes in absolute terms: 8 kWp give a twenty-year balance of ${EN.eur(a8.saldo)} against ${EN.eur(a6.saldo)}. But each extra kWp earns about ${EN.eur(marg(a6, a8, 2))} a year, almost all from the ritiro dedicato. If you plan an electric car or a heat pump, the larger size becomes more useful.` },
      { q: 'How much space does 6 kW need on a flat roof?', a: `You need ${pn6.n} modules of 430 W, about ${EN.num(pn6.m2)} square metres of panel area; for 8 kWp ${pn8.n} modules and about ${EN.num(pn8.m2)} square metres. On a flat terrace tilted rows must be spaced so as not to shade each other in winter, so the area used is larger. At low tilts rows can sit closer.` },
      { q: 'With 6 kW in Bari, is a battery worth it?', a: `With ${EN.num(cons)} kWh of use, 10 kWh of storage raise the share used at home from ${EN.pct(a6.quota)} to ${EN.pct(a6b.quota)} and coverage of use to ${EN.pct(a6b.copertura)}. At the reference cost payback for the whole goes from ${EN.anni(a6.rientro)} to ${EN.anni(a6b.rientro)}. It pays if the battery quote is low or evening use is high.` },
    ],
    body: (h) => `
<h2>Four sizes on the same house</h2>
${h.table(['System', 'Output', 'Used at home', 'Ritiro dedicato', 'Yearly benefit', 'Payback', '20-year balance'], KWP.map((k) => { const y = x(k); return [`${h.num(k, 1)} kWp`, `${h.num(y.produzione)} kWh`, h.pct(y.quota), h.eur(y.ricavoRid - y.fee), h.eur(y.beneficio), `${h.num(y.rientro ?? 0, 1)} years`, h.eur(y.saldo)]; }), `Bari, 30° south, ${h.num(cons)} kWh use (ARERA average for Apulia), reference cost, ${h.pct(P.detrazione.aliquota_prima_casa)} deduction. Ritiro dedicato net of the GSE fee.`, ['l', 'r', 'r', 'r', 'r', 'r', 'r'])}
<p>The twenty-year balance grows with size, but the share used at home falls and payback lengthens slightly. The choice depends on what matters more: recovering the cost quickly or maximising the gain over time. On a detached house with a large roof, 6 kWp is a good compromise with today's use.</p>

<h2>The surplus in the South zone</h2>
<p>With 6 kWp most of the output goes to the grid. The ${h.src('gse_rid', 'ritiro dedicato')} contract pays for it at the ${h.src('gse_rid_prezzi', 'GSE monthly prices')} of the South zone, which in 2026 were slightly lower than in the North. If the market fell a long way, the guaranteed minimum price of ${h.num(P.rid.pmg_eur_mwh, 1)} euros per MWh would apply. Shifting use into sunny hours, such as the washing machine, dishwasher and water heater, raises the share worth the full bill price.</p>

<h2>A province on the plain</h2>
<p>The Metropolitan City of Bari has ${prov.n} comuni with an average yield of ${h.num(prov.ey)} kWh per kWp, and the gap between best and worst is just ${h.num(prov.max[1] - prov.min[1])} kWh. From Molfetta to Monopoli, from Altamura to Conversano, the Bari figure is therefore a good estimate: what changes is the roof. The numbers come from ${h.src('pvgis', 'PVGIS 5.3')} at the coordinates of the comuni in the ${h.src('geonames', 'GeoNames')} list; average use from the ${h.src('arera_consumi', 'ARERA')} tables for Apulian residents with 3-4.5 kW.</p>`,
  },
});
