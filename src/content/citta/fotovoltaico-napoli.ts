import { defineGuide } from '../../lib/guide-types';
import { citta } from '../../lib/citta-kit';
import { IT, EN, P, ITALIA } from '../../lib/fmt';

/** Napoli: consumi domestici fra i più alti d'Italia (Campania), quindi impianti più grandi; il Vesuvio in provincia. */
const N = citta('napoli');
const cons = N.R.cons_alto, base = N.R.cons_base;
const CONS = [cons, 4500, 6000];
const KWP = [3, 4.5, 6];
const x = (k: number, c: number) => N.calc(k, c);
const a = x(4.5, cons), a3 = x(3, cons), big = x(6, 6000), big3 = x(3, 6000);
const prov = N.prov;

export default defineGuide({
  id: 'fotovoltaico-napoli',
  group: 'citta',
  order: 30,
  tool: 'rendimento',
  toolPreset: { citta: 'napoli', kwp: 4.5, cons },
  related: ['fotovoltaico-roma', 'fotovoltaico-bari', 'dimensionamento-impianto-fotovoltaico', 'impianto-fotovoltaico-6-kw', 'fotovoltaico-con-accumulo'],
  sources: ['pvgis', 'arera_consumi', 'gse_rid_prezzi', 'arera_q4', 'geonames'],
  it: {
    slug: 'fotovoltaico-napoli',
    nav: 'Napoli',
    card: `${IT.num(N.c.ey)} kWh per kWp e consumi alti: la taglia da scegliere per una famiglia grande.`,
    title: 'Fotovoltaico Napoli 2026: resa e taglia per consumi alti',
    description: 'Fotovoltaico Napoli 2026: quanto produce un impianto in città e in provincia, che taglia scegliere coi consumi campani sopra la media e in quanti anni rientra.',
    h1: 'Fotovoltaico a Napoli: quale impianto per una casa che consuma molto',
    intro: `Le famiglie campane consumano in media ${IT.num(cons)} kWh l'anno, fra i valori più alti d'Italia. A Napoli, dove 1 kWp produce ${IT.num(N.c.ey)} kWh, un impianto da 4,5 kWp copre il ${IT.pct(a.copertura)} di quel consumo e rientra in ${IT.anni(a.rientro)}.`,
    resume: `Secondo le tabelle ARERA sui consumi domestici del 2025, in Campania un cliente residente con 3-4,5 kW di potenza consuma in media ${IT.num(cons)} kWh l'anno e uno con 1,5-3 kW ${IT.num(base)}, contro una media italiana di ${IT.num(ITALIA.cons_alto)} e ${IT.num(ITALIA.cons_base)}. Famiglie più numerose e l'uso estivo del condizionatore possono contribuire alla differenza. Per chi consuma di più il fotovoltaico rende meglio, perché una quota maggiore dell'energia prodotta viene usata in casa e vale il prezzo pieno della bolletta, circa 25 centesimi, invece degli ${IT.num(N.ridCt, 1)} centesimi del ritiro dedicato nella zona Centro Sud. Napoli ha anche molto sole: PVGIS 5.3 stima ${IT.num(N.c.ey)} kWh per kWp alle coordinate del comune, con moduli a 30° verso sud. Con il consumo medio campano, 3 kWp rientrano in ${IT.anni(a3.rientro)} e 4,5 kWp in ${IT.anni(a.rientro)}. Per una casa da 6 000 kWh l'anno la taglia da 6 kWp rende ${IT.eur(big.beneficio)} l'anno contro ${IT.eur(big3.beneficio)} di un 3 kWp.`,
    faqs: [
      { q: 'Quanto produce un impianto fotovoltaico a Napoli?', a: `${IT.kwh(a3.produzione)} l'anno con 3 kWp e ${IT.kwh(a.produzione)} con 4,5 kWp, a 30° verso sud secondo PVGIS 5.3. In provincia si va da ${IT.num(prov.min[1])} kWh per kWp a ${prov.min[0]} a ${IT.num(prov.max[1])} a ${prov.max[0]}, sulle pendici del Vesuvio. Il simulatore usa le coordinate del vostro comune.` },
      { q: 'Che impianto serve a Napoli per 4 500 kWh di consumo?', a: `Con 4 500 kWh l'anno 4,5 kWp coprono il ${IT.pct(x(4.5, 4500).copertura)} del consumo senza batteria e rientrano in ${IT.anni(x(4.5, 4500).rientro)}; 6 kWp arrivano al ${IT.pct(x(6, 4500).copertura)}. Oltre una certa taglia ogni kWp in più finisce quasi tutto in rete. La tabella confronta tre consumi e tre taglie.` },
      { q: 'Con consumi serali alti a Napoli conviene la batteria?', a: `Una batteria sposta alla sera l'energia prodotta di giorno, quindi rende di più quando la casa consuma molto dopo il tramonto. Con 4,5 kWp e ${IT.num(cons)} kWh, 5 kWh di accumulo portano la quota usata in casa dal ${IT.pct(a.quota)} al ${IT.pct(N.calc(4.5, cons, 5).quota)}. Al costo di riferimento il rientro dell'insieme passa però da ${IT.anni(a.rientro)} a ${IT.anni(N.calc(4.5, cons, 5).rientro)}.` },
      { q: 'Il condizionatore estivo aumenta il risparmio del fotovoltaico?', a: 'Sì, perché consuma nelle ore centrali dei mesi estivi, quando i pannelli producono di più. Ogni kWh usato dal condizionatore mentre c\'è sole vale il prezzo pieno della bolletta. I profili orari ARERA che usiamo sono medie regionali e includono già una parte di questo effetto; chi usa molto il condizionatore di giorno avrà una quota autoconsumata un po\' più alta.' },
    ],
    body: (h) => `
<h2>Consumo e taglia: nove combinazioni</h2>
${h.table(['Consumo annuo', ...KWP.map((k) => `${h.num(k, 1)} kWp`)], CONS.map((c) => [`${h.num(c)} kWh`, ...KWP.map((k) => { const y = x(k, c); return `${h.eur(y.beneficio)} · ${h.num(y.rientro ?? 0, 1)} a`; })]), 'Napoli, 30° sud, senza batteria. In ogni cella: beneficio annuo · anni di rientro con detrazione del 50 % al costo di riferimento.', ['l', 'r', 'r', 'r'])}
<p>Il beneficio cresce con il consumo a parità di impianto, perché più energia resta in casa. La crescita più forte si vede passando da 3 a 4,5 kWp con 4 500 o 6 000 kWh di consumo. Il prezzo evitato in bolletta viene dalle ${h.src('arera_q4', 'condizioni ARERA')} del 2026, il valore del surplus dai ${h.src('gse_rid_prezzi', 'prezzi GSE')} della zona Centro Sud.</p>

<h2>Dal centro storico al Vesuvio</h2>
<p>La Città metropolitana di Napoli ha ${prov.n} comuni e una resa media di ${h.num(prov.ey)} kWh per kWp. ${prov.min[0]}, sui Monti Lattari, perde sole per il rilievo; ${prov.max[0]}, sul versante sud del Vesuvio, è il comune più produttivo della provincia. Le isole e la costa stanno vicino al valore di Napoli. I dati sono di ${h.src('pvgis', 'PVGIS 5.3')} alle coordinate dei comuni dell'elenco ${h.src('geonames', 'GeoNames')}.</p>

<h2>Prima di chiedere un preventivo</h2>
<p>Prendete il consumo degli ultimi dodici mesi dalla bolletta: la media campana di ${h.num(cons)} kWh viene da ${h.src('arera_consumi', 'ARERA')} ma una famiglia può essere molto sopra o sotto. Nel centro storico molti tetti sono terrazzi condominiali e alcuni edifici sono vincolati: chiedete all'installatore di verificare permessi e assemblea. Per capire se conviene una batteria con un consumo serale alto, c'è la pagina ${h.a('fotovoltaico-con-accumulo', 'fotovoltaico con accumulo')}.</p>`,
  },
  en: {
    slug: 'solar-panels-naples',
    nav: 'Naples',
    card: `${EN.num(N.c.ey)} kWh per kWp and high use: which size suits a large household.`,
    title: 'Solar Panels Naples 2026: Output and Size for High Use',
    description: 'Solar panels in Naples in 2026: output in the city and province, which size to pick with Campania\'s above-average consumption and how long the payback takes.',
    h1: 'Solar in Naples: which system for a home that uses a lot',
    intro: `Households in Campania use on average ${EN.num(cons)} kWh a year, among the highest values in Italy. In Naples, where 1 kWp produces ${EN.num(N.c.ey)} kWh, a 4.5 kWp system covers ${EN.pct(a.copertura)} of that use and pays back in ${EN.anni(a.rientro)}.`,
    resume: `According to ARERA's 2025 tables on household consumption, in Campania a resident customer with 3 to 4.5 kW uses on average ${EN.num(cons)} kWh a year and one with 1.5 to 3 kW ${EN.num(base)}, against Italian averages of ${EN.num(ITALIA.cons_alto)} and ${EN.num(ITALIA.cons_base)}. Larger families and summer air conditioning may contribute to the gap. For heavier users solar pays better, because a larger share of the energy produced is used at home and is worth the full bill price, about 25 cents, instead of the ${EN.num(N.ridCt, 1)} cents of the ritiro dedicato in the Centro Sud zone. Naples also has plenty of sun: PVGIS 5.3 estimates ${EN.num(N.c.ey)} kWh per kWp at the comune's coordinates, with panels at 30° facing south. With Campania's average use, 3 kWp pay back in ${EN.anni(a3.rientro)} and 4.5 kWp in ${EN.anni(a.rientro)}. For a home using 6,000 kWh a year a 6 kWp system earns ${EN.eur(big.beneficio)} a year against ${EN.eur(big3.beneficio)} for 3 kWp.`,
    faqs: [
      { q: 'How much does a solar system produce in Naples?', a: `${EN.kwh(a3.produzione)} a year with 3 kWp and ${EN.kwh(a.produzione)} with 4.5 kWp, at 30° facing south according to PVGIS 5.3. Across the province the range is from ${EN.num(prov.min[1])} kWh per kWp in ${prov.min[0]} to ${EN.num(prov.max[1])} in ${prov.max[0]}, on the slopes of Vesuvius. The calculator uses your comune's coordinates.` },
      { q: 'What system does a Naples home using 4,500 kWh need?', a: `With 4,500 kWh a year, 4.5 kWp cover ${EN.pct(x(4.5, 4500).copertura)} of use without a battery and pay back in ${EN.anni(x(4.5, 4500).rientro)}; 6 kWp reach ${EN.pct(x(6, 4500).copertura)}. Beyond a certain size almost every extra kWp goes to the grid. The table compares three levels of use and three sizes.` },
      { q: 'With high evening use in Naples, is a battery worth it?', a: `A battery moves daytime output to the evening, so it pays more when the home uses a lot after sunset. With 4.5 kWp and ${EN.num(cons)} kWh, 5 kWh of storage raise the share used at home from ${EN.pct(a.quota)} to ${EN.pct(N.calc(4.5, cons, 5).quota)}. At the reference cost, though, payback for the whole goes from ${EN.anni(a.rientro)} to ${EN.anni(N.calc(4.5, cons, 5).rientro)}.` },
      { q: 'Does summer air conditioning increase solar savings?', a: 'Yes, because it runs in the middle hours of summer months, when panels produce most. Every kWh the air conditioner uses while the sun shines is worth the full bill price. The ARERA hourly profiles we use are regional averages and already include part of this effect; heavy daytime air-conditioning users will have a slightly higher self-consumed share.' },
    ],
    body: (h) => `
<h2>Use and size: nine combinations</h2>
${h.table(['Annual use', ...KWP.map((k) => `${h.num(k, 1)} kWp`)], CONS.map((c) => [`${h.num(c)} kWh`, ...KWP.map((k) => { const y = x(k, c); return `${h.eur(y.beneficio)} · ${h.num(y.rientro ?? 0, 1)} y`; })]), 'Naples, 30° south, no battery. Each cell: yearly benefit · payback years with the 50% deduction at the reference cost.', ['l', 'r', 'r', 'r'])}
<p>For the same system the benefit grows with use, because more energy stays at home. The strongest growth shows when moving from 3 to 4.5 kWp with 4,500 or 6,000 kWh of use. The avoided bill price comes from the 2026 ${h.src('arera_q4', 'ARERA conditions')}, the surplus value from the ${h.src('gse_rid_prezzi', 'GSE prices')} for the Centro Sud zone.</p>

<h2>From the old town to Vesuvius</h2>
<p>The Metropolitan City of Naples has ${prov.n} comuni and an average yield of ${h.num(prov.ey)} kWh per kWp. ${prov.min[0]}, in the Lattari mountains, loses sun to the terrain; ${prov.max[0]}, on the southern side of Vesuvius, is the province's most productive comune. The islands and the coast stay close to the Naples figure. The data are from ${h.src('pvgis', 'PVGIS 5.3')} at the coordinates of the comuni in the ${h.src('geonames', 'GeoNames')} list.</p>

<h2>Before asking for a quote</h2>
<p>Take the last twelve months' use from your bill: the Campania average of ${h.num(cons)} kWh comes from ${h.src('arera_consumi', 'ARERA')}, but a household can be well above or below it. In the old town many roofs are shared terraces and some buildings are protected: ask the installer to check permits and the condominium assembly. To see whether a battery pays with high evening use, see ${h.a('fotovoltaico-con-accumulo', 'solar with battery storage')}.</p>`,
  },
});
