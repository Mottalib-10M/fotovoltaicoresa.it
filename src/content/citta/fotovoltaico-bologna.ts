import { defineGuide } from '../../lib/guide-types';
import { citta, tabellaMesi } from '../../lib/citta-kit';
import { IT, EN, P } from '../../lib/fmt';

/** Bologna: casa elettrificata (pompa di calore, auto elettrica) con 5 000-7 000 kWh; produzione invernale bassa. */
const B = citta('bologna');
const avg = B.R.cons_alto;
const CONS = [avg, 5000, 7000];
const KWP = [3, 6, 8];
const x = (k: number, c: number, b = 0) => B.calc(k, c, b);
const a6 = x(6, 5000), a3 = x(3, 5000), a8 = x(8, 7000), b6 = x(6, 5000, 10);
const inv = (r: typeof a6) => r.mesi[0] + r.mesi[1] + r.mesi[10] + r.mesi[11];
const est = (r: typeof a6) => r.mesi[5] + r.mesi[6] + r.mesi[7];
const prov = B.prov;

export default defineGuide({
  id: 'fotovoltaico-bologna',
  group: 'citta',
  order: 70,
  tool: 'rendimento',
  toolPreset: { citta: 'bologna', kwp: 6, cons: 5000 },
  related: ['impianto-fotovoltaico-6-kw', 'fotovoltaico-milano', 'fotovoltaico-firenze', 'dimensionamento-impianto-fotovoltaico', 'fotovoltaico-con-accumulo'],
  sources: ['pvgis', 'arera_consumi', 'gse_rid_prezzi', 'dl34_119', 'geonames'],
  it: {
    slug: 'fotovoltaico-bologna',
    nav: 'Bologna',
    card: `${IT.num(B.c.ey)} kWh per kWp; quale impianto per una casa con pompa di calore o auto elettrica.`,
    title: 'Fotovoltaico Bologna 2026: casa elettrica e pompa di calore',
    description: 'Fotovoltaico a Bologna nel 2026: quale impianto scegliere per una casa elettrica da 5 000 o 7 000 kWh, quanto produce d\'inverno e quando conviene una batteria.',
    h1: 'Fotovoltaico a Bologna per una casa tutta elettrica',
    intro: `Con pompa di calore o auto elettrica una casa può arrivare a 5 000 kWh l'anno, contro una media emiliana di ${IT.num(avg)}. A Bologna 6 kWp coprono il ${IT.pct(a6.copertura)} di quel consumo e rientrano in ${IT.anni(a6.rientro)}; da novembre a febbraio però producono solo ${IT.kwh(inv(a6))}.`,
    resume: `Sempre più case dell'Emilia-Romagna sostituiscono la caldaia a gas con una pompa di calore e aggiungono un'auto elettrica caricata in garage. Il consumo di elettricità sale, spesso oltre i 5 000 kWh l'anno, contro la media di ${IT.num(avg)} kWh che ARERA indica per i residenti emiliani con 3-4,5 kW. Per queste case il fotovoltaico va dimensionato in modo diverso. A Bologna, secondo PVGIS 5.3, 1 kWp con moduli a 30° verso sud produce ${IT.num(B.c.ey)} kWh l'anno, ma con forte stagionalità: un impianto da 6 kWp dà ${IT.kwh(est(a6))} in giugno, luglio e agosto e solo ${IT.kwh(inv(a6))} nei quattro mesi da novembre a febbraio, quando la pompa di calore lavora di più. Per questo neanche un impianto grande rende la casa autonoma d'inverno. Con 5 000 kWh di consumo, 6 kWp coprono il ${IT.pct(a6.copertura)} del fabbisogno senza batteria e il ${IT.pct(b6.copertura)} con 10 kWh di accumulo. Il beneficio annuo passa da ${IT.eur(a3.beneficio)} con 3 kWp a ${IT.eur(a6.beneficio)} con 6 kWp. L'Emilia-Romagna è nella zona di mercato Nord, dove il surplus vale circa ${IT.num(B.ridCt, 1)} centesimi per kWh.`,
    faqs: [
      { q: 'Quanto produce un impianto fotovoltaico a Bologna?', a: `${IT.kwh(B.c.ey * 3)} l'anno con 3 kWp e ${IT.kwh(a6.produzione)} con 6 kWp, a 30° verso sud secondo PVGIS 5.3. In provincia si va da ${IT.num(prov.min[1])} kWh per kWp a ${prov.min[0]}, sull'Appennino, a ${IT.num(prov.max[1])} a ${prov.max[0]}. La pianura bolognese è quasi uniforme; le differenze vere sono in montagna.` },
      { q: 'Quanti kW di fotovoltaico per una pompa di calore a Bologna?', a: `Dipende dal consumo totale della casa, che leggete in bolletta dopo il primo inverno. Con 5 000 kWh l'anno, 6 kWp coprono il ${IT.pct(a6.copertura)} del consumo; con 7 000 kWh, 8 kWp ne coprono il ${IT.pct(a8.copertura)}. D'inverno la produzione resta bassa, quindi la copertura del riscaldamento è sempre parziale. L'acqua calda, invece, si accoppia bene con il sole.` },
      { q: 'Con l\'auto elettrica conviene la batteria di casa?', a: `Se l'auto si carica di sera, la batteria di casa sposta l'energia di mezzogiorno nelle ore di ricarica. Con 6 kWp e 5 000 kWh, 10 kWh di accumulo portano la copertura dal ${IT.pct(a6.copertura)} al ${IT.pct(b6.copertura)}, ma il rientro sale a ${IT.anni(b6.rientro)} al costo di riferimento. Caricare l'auto di giorno, quando possibile, ottiene parte dello stesso effetto gratis.` },
      { q: 'Il fotovoltaico basta a scaldare la casa d\'inverno?', a: `No. Da novembre a febbraio un impianto da 6 kWp a Bologna produce ${IT.kwh(inv(a6))}, circa il ${IT.pct(inv(a6) / a6.produzione)} della produzione annua, mentre in quei mesi si concentra gran parte del riscaldamento. Il fotovoltaico riduce la bolletta della pompa di calore soprattutto in primavera e in autunno, e copre bene acqua calda e condizionamento estivo.` },
    ],
    body: (h) => `
<h2>Nove combinazioni per una casa elettrica</h2>
${h.table(['Consumo annuo', ...KWP.map((k) => `${h.num(k)} kWp`)], CONS.map((c) => [`${h.num(c)} kWh`, ...KWP.map((k) => { const y = x(k, c); return `${h.pct(y.copertura)} · ${h.eur(y.beneficio)}`; })]), 'Bologna, 30° sud, senza batteria. In ogni cella: quota del consumo coperta · beneficio annuo.', ['l', 'r', 'r', 'r'])}
<p>La prima riga è la famiglia media emiliana secondo ${h.src('arera_consumi', 'ARERA')}; le altre due sono case con pompa di calore, auto elettrica o entrambe. I profili orari che usiamo sono quelli medi dei residenti, quindi per una casa tutta elettrica la quota invernale reale può essere diversa: il simulatore resta una stima d'ordine di grandezza.</p>

<h2>Mese per mese con 6 kWp</h2>
${tabellaMesi(h, a6, 'Bologna, 6 kWp a 30° sud, PVGIS 5.3.')}
<p>Luglio produce circa ${h.num(a6.mesi[6] / a6.mesi[11], 1)} volte dicembre. Con una pompa di calore il consumo segue la curva opposta, quindi d'inverno gran parte dell'energia prodotta resta in casa e d'estate la maggior parte va in rete, pagata con i ${h.src('gse_rid_prezzi', 'prezzi GSE')} della zona Nord.</p>

<h2>Batteria o no</h2>
<p>Una batteria da 10 kWh è utile quando i consumi serali sono alti, come la ricarica dell'auto dopo il lavoro. Al ${h.src('dl34_119', 'riferimento di spesa')} di ${h.eur(P.costi.accumulo_eur_kwh)} per kWh allunga però il rientro di 6 kWp da ${h.num(a6.rientro ?? 0, 1)} a ${h.num(b6.rientro ?? 0, 1)} anni. Con un preventivo più basso il conto migliora: scrivetelo nel simulatore. I comuni della provincia sono nell'elenco ${h.src('geonames', 'GeoNames')} con la resa ${h.src('pvgis', 'PVGIS')} di ognuno; la pagina ${h.a('impianto-fotovoltaico-6-kw', 'impianto da 6 kW')} confronta tutte le regioni.</p>`,
  },
  en: {
    slug: 'solar-panels-bologna',
    nav: 'Bologna',
    card: `${EN.num(B.c.ey)} kWh per kWp; which system for a home with a heat pump or electric car.`,
    title: 'Solar Panels Bologna 2026: All-Electric Home and Heat Pump',
    description: 'Solar panels in Bologna in 2026: which system to choose for an all-electric home using 5,000 or 7,000 kWh, what it produces in winter and when a battery pays.',
    h1: 'Solar in Bologna for an all-electric home',
    intro: `With a heat pump or an electric car a home can reach 5,000 kWh a year, against an Emilia-Romagna average of ${EN.num(avg)}. In Bologna 6 kWp cover ${EN.pct(a6.copertura)} of that use and pay back in ${EN.anni(a6.rientro)}; from November to February, though, they produce only ${EN.kwh(inv(a6))}.`,
    resume: `More and more homes in Emilia-Romagna are replacing the gas boiler with a heat pump and adding an electric car charged in the garage. Electricity use rises, often above 5,000 kWh a year, against the ${EN.num(avg)} kWh average that ARERA gives for Emilia-Romagna residents with 3 to 4.5 kW. For these homes solar must be sized differently. In Bologna, according to PVGIS 5.3, 1 kWp with panels at 30° facing south produces ${EN.num(B.c.ey)} kWh a year, but with strong seasonality: a 6 kWp system gives ${EN.kwh(est(a6))} in June, July and August and only ${EN.kwh(inv(a6))} in the four months from November to February, when the heat pump works hardest. So not even a large system makes the home self-sufficient in winter. With 5,000 kWh of use, 6 kWp cover ${EN.pct(a6.copertura)} of needs without a battery and ${EN.pct(b6.copertura)} with 10 kWh of storage. The yearly benefit goes from ${EN.eur(a3.beneficio)} with 3 kWp to ${EN.eur(a6.beneficio)} with 6 kWp. Emilia-Romagna is in the North market zone, where the surplus is worth about ${EN.num(B.ridCt, 1)} cents per kWh.`,
    faqs: [
      { q: 'How much does a solar system produce in Bologna?', a: `${EN.kwh(B.c.ey * 3)} a year with 3 kWp and ${EN.kwh(a6.produzione)} with 6 kWp, at 30° facing south according to PVGIS 5.3. Across the province the range is from ${EN.num(prov.min[1])} kWh per kWp in ${prov.min[0]}, in the Apennines, to ${EN.num(prov.max[1])} in ${prov.max[0]}. The Bologna plain is almost uniform; the real differences are in the mountains.` },
      { q: 'How many kW of solar for a heat pump in Bologna?', a: `It depends on the home's total use, which you read on the bill after the first winter. With 5,000 kWh a year, 6 kWp cover ${EN.pct(a6.copertura)} of use; with 7,000 kWh, 8 kWp cover ${EN.pct(a8.copertura)}. In winter output stays low, so heating coverage is always partial. Hot water, by contrast, pairs well with the sun.` },
      { q: 'With an electric car, is a home battery worth it?', a: `If the car charges in the evening, a home battery moves midday energy into charging hours. With 6 kWp and 5,000 kWh, 10 kWh of storage raise coverage from ${EN.pct(a6.copertura)} to ${EN.pct(b6.copertura)}, but payback rises to ${EN.anni(b6.rientro)} at the reference cost. Charging the car by day, where possible, gets part of the same effect for free.` },
      { q: 'Can solar heat the house in winter?', a: `No. From November to February a 6 kWp system in Bologna produces ${EN.kwh(inv(a6))}, about ${EN.pct(inv(a6) / a6.produzione)} of yearly output, while most heating falls in those months. Solar cuts the heat pump's bill mainly in spring and autumn, and covers hot water and summer cooling well.` },
    ],
    body: (h) => `
<h2>Nine combinations for an all-electric home</h2>
${h.table(['Annual use', ...KWP.map((k) => `${h.num(k)} kWp`)], CONS.map((c) => [`${h.num(c)} kWh`, ...KWP.map((k) => { const y = x(k, c); return `${h.pct(y.copertura)} · ${h.eur(y.beneficio)}`; })]), 'Bologna, 30° south, no battery. Each cell: share of use covered · yearly benefit.', ['l', 'r', 'r', 'r'])}
<p>The first row is the average Emilia-Romagna household according to ${h.src('arera_consumi', 'ARERA')}; the other two are homes with a heat pump, an electric car or both. The hourly profiles we use are average resident profiles, so for an all-electric home the real winter share may differ: the calculator remains an order-of-magnitude estimate.</p>

<h2>Month by month with 6 kWp</h2>
${tabellaMesi(h, a6, 'Bologna, 6 kWp at 30° south, PVGIS 5.3.')}
<p>July produces about ${h.num(a6.mesi[6] / a6.mesi[11], 1)} times as much as December. With a heat pump use follows the opposite curve, so in winter most output stays at home and in summer most goes to the grid, paid at the ${h.src('gse_rid_prezzi', 'GSE prices')} of the North zone.</p>

<h2>Battery or not</h2>
<p>A 10 kWh battery helps when evening use is high, such as charging the car after work. At the ${h.src('dl34_119', 'spending reference')} of ${h.eur(P.costi.accumulo_eur_kwh)} per kWh, though, it lengthens payback on 6 kWp from ${h.num(a6.rientro ?? 0, 1)} to ${h.num(b6.rientro ?? 0, 1)} years. With a lower quote the sum improves: enter it in the calculator. The province's comuni are in the ${h.src('geonames', 'GeoNames')} list with each one's ${h.src('pvgis', 'PVGIS')} yield; the ${h.a('impianto-fotovoltaico-6-kw', '6 kW system')} page compares every region.</p>`,
  },
});
