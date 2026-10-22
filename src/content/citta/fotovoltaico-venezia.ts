import { defineGuide } from '../../lib/guide-types';
import { citta } from '../../lib/citta-kit';
import { pannelli } from '../../lib/engine/fv';
import { IT, EN, P } from '../../lib/fmt';

/** Venezia: appartamento con consumo basso; kit da balcone, quota di tetto condominiale da 1,5-2 kWp o 3 kWp. */
const V = citta('venezia');
const base = V.R.cons_base, alto = V.R.cons_alto;
const balc = V.calc(0.8, base, 0, { tilt: 70, detraibile: false, ridAttivo: false, costo: 100 });
const CASI: Array<[string, string, number]> = [['1,5 kWp', '1.5 kWp', 1.5], ['2 kWp', '2 kWp', 2], ['3 kWp', '3 kWp', 3]];
const x = (k: number, c = base) => V.calc(k, c);
const a2 = x(2), a3 = x(3), a15 = x(1.5);
const mesi100 = (100 / balc.risparmio) * 12;
const prov = V.prov;
const pn2 = pannelli(2);

export default defineGuide({
  id: 'fotovoltaico-venezia',
  group: 'citta',
  order: 110,
  tool: 'dimensione',
  toolPreset: { citta: 'venezia', kwp: 2, cons: base },
  related: ['fotovoltaico-balcone', 'dimensionamento-impianto-fotovoltaico', 'fotovoltaico-bologna', 'fotovoltaico-milano', 'comunita-energetiche'],
  sources: ['pvgis', 'arera_consumi', 'gse_rid_prezzi', 'gse_cer', 'geonames'],
  it: {
    slug: 'fotovoltaico-venezia',
    nav: 'Venezia',
    card: `${IT.num(V.c.ey)} kWh per kWp; la taglia giusta per un appartamento con pochi consumi.`,
    title: 'Fotovoltaico Venezia 2026: taglia giusta per un appartamento',
    description: 'Fotovoltaico Venezia 2026: quale impianto per un appartamento che consuma poco, dal kit da balcone a 1,5, 2 o 3 kWp sul tetto condominiale, con resa e rientro.',
    h1: 'Fotovoltaico a Venezia: quanto impianto serve a un appartamento',
    intro: `Un cliente veneto con 1,5-3 kW consuma in media ${IT.num(base)} kWh l'anno. A Venezia, dove 1 kWp produce ${IT.num(V.c.ey)} kWh, bastano ${IT.num(base / V.c.ey, 1)} kWp per pareggiare quel consumo: 2 kWp sul tetto del condominio rientrano in ${IT.anni(a2.rientro)}.`,
    resume: `Molti abitanti di Venezia e di Mestre vivono in appartamento, con consumi bassi e un tetto condiviso con altre famiglie. Secondo le tabelle ARERA sui consumi del 2025, un cliente residente veneto con 1,5-3 kW di potenza consuma in media ${IT.num(base)} kWh l'anno, uno con 3-4,5 kW ${IT.num(alto)}. Con questi consumi l'impianto classico da 3 kWp è sovradimensionato: produce a Venezia ${IT.kwh(a3.produzione)} l'anno secondo PVGIS 5.3, molto più di quanto serve, e la maggior parte va in rete al prezzo del ritiro dedicato, circa ${IT.num(V.ridCt, 1)} centesimi nella zona Nord. Una quota di 1,5 o 2 kWp sul tetto del condominio rende in proporzione di più: con ${IT.num(base)} kWh, 2 kWp usano in casa il ${IT.pct(a2.quota)} della produzione contro il ${IT.pct(a3.quota)} di 3 kWp. Chi non ha accesso al tetto può guardare a un kit da balcone: 0,8 kWp inclinati a 70° producono circa ${IT.kwh(balc.produzione)} e fanno risparmiare ${IT.eur(balc.risparmio)} l'anno, perché quasi tutto viene consumato subito. Nel centro storico, invece, i vincoli paesaggistici rendono difficile qualsiasi impianto visibile: la comunità energetica è spesso la strada più semplice.`,
    faqs: [
      { q: 'Quanto produce un impianto fotovoltaico a Venezia?', a: `${IT.kwh(a2.produzione)} l'anno con 2 kWp e ${IT.kwh(a3.produzione)} con 3 kWp, a 30° verso sud secondo PVGIS 5.3. La provincia è quasi tutta pianura e laguna: da ${IT.num(prov.min[1])} kWh per kWp a ${prov.min[0]} a ${IT.num(prov.max[1])} a ${prov.max[0]}, quindi il dato di Venezia vale anche per Mestre, Chioggia e il litorale.` },
      { q: 'Quanti kWp servono per un appartamento a Venezia?', a: `Con ${IT.num(base)} kWh l'anno, il consumo medio veneto per chi ha un contratto fino a 3 kW, circa ${IT.num(base / V.c.ey, 1)} kWp producono in un anno quanto si consuma. Fra 1,5 e 2 kWp, cioè ${pannelli(1.5).n} o ${pn2.n} moduli da 430 W, si ottiene il miglior rapporto fra energia usata in casa e spesa. Scrivete il vostro consumo nel simulatore.` },
      { q: 'Nel centro storico di Venezia si può installare il fotovoltaico?', a: 'Il centro storico e la laguna sono patrimonio UNESCO e quasi tutti gli edifici sono soggetti a vincoli paesaggistici: pannelli visibili su tetti e altane richiedono autorizzazioni difficili da ottenere. Prima di ogni progetto chiedete al Comune e alla Soprintendenza. Una comunità energetica con impianti in terraferma permette comunque di partecipare alla condivisione dell\'energia.' },
      { q: 'Il kit da balcone conviene in un appartamento veneziano?', a: `Se il balcone è esposto e senza ombra, sì: 0,8 kWp inclinati a 70° producono circa ${IT.kwh(balc.produzione)} l'anno, ne usate in casa il ${IT.pct(balc.quota)} e risparmiate ${IT.eur(balc.risparmio)}. Ogni 100 € di prezzo del kit tornano in circa ${IT.num(mesi100)} mesi. Verificate prima regolamento condominiale e vincoli sulla facciata.` },
    ],
    body: (h) => `
<h2>Tre taglie per un appartamento</h2>
${h.table(['Impianto', `Consumo ${h.num(base)} kWh: usata in casa`, 'Beneficio', 'Rientro', `Consumo ${h.num(alto)} kWh: usata in casa`, 'Beneficio', 'Rientro'], CASI.map(([a, , k]) => { const y = x(k), z = x(k, alto); return [a, h.pct(y.quota), h.eur(y.beneficio), `${h.num(y.rientro ?? 0, 1)} a`, h.pct(z.quota), h.eur(z.beneficio), `${h.num(z.rientro ?? 0, 1)} a`]; }), 'Venezia, 30° sud, senza batteria, costo di riferimento, detrazione del 50 % sulla prima casa. Consumi medi ARERA del Veneto per le due fasce di potenza.', ['l', 'r', 'r', 'r', 'r', 'r', 'r'])}
<p>Con consumi bassi il rientro cambia poco fra le taglie, perché il surplus viene comunque pagato, ma la quota di energia usata in casa cala molto. Con 1,5 kWp e ${h.num(base)} kWh si usa il ${h.pct(a15.quota)} della produzione. Il valore del surplus segue i ${h.src('gse_rid_prezzi', 'prezzi GSE')} della zona Nord.</p>

<h2>Un tetto condiviso</h2>
<p>In condominio il tetto è una parte comune: per installare un impianto privato serve rispettare le regole dell'assemblea, e la soluzione più ordinata è spesso un impianto condominiale. Il ${h.src('gse_cer', 'GSE')} descrive i gruppi di autoconsumatori che agiscono collettivamente nello stesso edificio: l'energia prodotta sul tetto e consumata dai condomini nella stessa ora riceve un incentivo, come nelle comunità energetiche. Il simulatore calcola un impianto singolo; per un edificio intero servono i consumi di tutte le utenze.</p>

<h2>Venezia, Mestre e la provincia</h2>
<p>La Città metropolitana di Venezia conta ${prov.n} comuni, tutti in pianura o sulla costa, con una resa media di ${h.num(prov.ey)} kWh per kWp. Nella laguna l'umidità e la salsedine richiedono strutture resistenti alla corrosione e una pulizia più frequente dei moduli, fattori che ${h.src('pvgis', 'PVGIS')} non considera. I consumi medi vengono dalle tabelle ${h.src('arera_consumi', 'ARERA')}, i comuni dall'elenco ${h.src('geonames', 'GeoNames')}. Per il kit da balcone c'è la pagina ${h.a('fotovoltaico-balcone', 'fotovoltaico da balcone')}.</p>`,
  },
  en: {
    slug: 'solar-panels-venice',
    nav: 'Venice',
    card: `${EN.num(V.c.ey)} kWh per kWp; the right size for a flat with low use.`,
    title: 'Solar Panels Venice 2026: The Right Size for an Apartment',
    description: 'Solar panels in Venice in 2026: which system suits a flat with low use, from a balcony kit to 1.5, 2 or 3 kWp on the condominium roof, with output and payback.',
    h1: 'Solar in Venice: how much system a flat needs',
    intro: `A Veneto customer with 1.5 to 3 kW uses on average ${EN.num(base)} kWh a year. In Venice, where 1 kWp produces ${EN.num(V.c.ey)} kWh, ${EN.num(base / V.c.ey, 1)} kWp are enough to match that use: 2 kWp on the condominium roof pay back in ${EN.anni(a2.rientro)}.`,
    resume: `Many people in Venice and Mestre live in flats, with low use and a roof shared with other households. According to ARERA's 2025 consumption tables, a Veneto resident customer with 1.5 to 3 kW uses on average ${EN.num(base)} kWh a year, one with 3 to 4.5 kW ${EN.num(alto)}. With such use the classic 3 kWp system is oversized: in Venice it produces ${EN.kwh(a3.produzione)} a year according to PVGIS 5.3, far more than needed, and most goes to the grid at the ritiro dedicato price, about ${EN.num(V.ridCt, 1)} cents in the North zone. A 1.5 or 2 kWp share of the condominium roof earns proportionally more: with ${EN.num(base)} kWh, 2 kWp use ${EN.pct(a2.quota)} of output at home against ${EN.pct(a3.quota)} for 3 kWp. Those without roof access can look at a balcony kit: 0.8 kWp tilted at 70° produce about ${EN.kwh(balc.produzione)} and save ${EN.eur(balc.risparmio)} a year, because almost everything is consumed at once. In the historic centre, by contrast, landscape protection makes any visible system difficult: an energy community is often the simplest route.`,
    faqs: [
      { q: 'How much does a solar system produce in Venice?', a: `${EN.kwh(a2.produzione)} a year with 2 kWp and ${EN.kwh(a3.produzione)} with 3 kWp, at 30° facing south according to PVGIS 5.3. The province is almost all plain and lagoon: from ${EN.num(prov.min[1])} kWh per kWp in ${prov.min[0]} to ${EN.num(prov.max[1])} in ${prov.max[0]}, so the Venice figure also holds for Mestre, Chioggia and the coast.` },
      { q: 'How many kWp does a flat in Venice need?', a: `With ${EN.num(base)} kWh a year, the Veneto average for contracts up to 3 kW, about ${EN.num(base / V.c.ey, 1)} kWp produce in a year what you use. Between 1.5 and 2 kWp, that is ${pannelli(1.5).n} or ${pn2.n} modules of 430 W, gives the best balance between energy used at home and spending. Enter your own use in the calculator.` },
      { q: 'Can you install solar in Venice\'s historic centre?', a: 'The historic centre and the lagoon are a UNESCO World Heritage site and almost every building is under landscape protection: panels visible on roofs and roof terraces need permits that are hard to obtain. Before any project ask the Comune and the Soprintendenza. An energy community with plants on the mainland still lets you take part in energy sharing.' },
      { q: 'Is a balcony kit worth it in a Venetian flat?', a: `If the balcony is exposed and unshaded, yes: 0.8 kWp tilted at 70° produce about ${EN.kwh(balc.produzione)} a year, ${EN.pct(balc.quota)} of it is used at home and you save ${EN.eur(balc.risparmio)}. Each €100 of kit price comes back in about ${EN.num(mesi100)} months. Check the condominium rules and facade restrictions first.` },
    ],
    body: (h) => `
<h2>Three sizes for a flat</h2>
${h.table(['System', `Use ${h.num(base)} kWh: used at home`, 'Benefit', 'Payback', `Use ${h.num(alto)} kWh: used at home`, 'Benefit', 'Payback'], CASI.map(([, a, k]) => { const y = x(k), z = x(k, alto); return [a, h.pct(y.quota), h.eur(y.beneficio), `${h.num(y.rientro ?? 0, 1)} y`, h.pct(z.quota), h.eur(z.beneficio), `${h.num(z.rientro ?? 0, 1)} y`]; }), 'Venice, 30° south, no battery, reference cost, 50% main-home deduction. ARERA Veneto average use for the two contract sizes.', ['l', 'r', 'r', 'r', 'r', 'r', 'r'])}
<p>With low use payback changes little between sizes, because the surplus is paid for anyway, but the share of energy used at home falls a lot. With 1.5 kWp and ${h.num(base)} kWh, ${h.pct(a15.quota)} of output is used. The surplus value follows the ${h.src('gse_rid_prezzi', 'GSE prices')} of the North zone.</p>

<h2>A shared roof</h2>
<p>In a condominium the roof is a common part: a private system must follow the assembly's rules, and a building system is often the tidiest solution. The ${h.src('gse_cer', 'GSE')} describes groups of self-consumers acting collectively in the same building: energy produced on the roof and used by residents in the same hour earns an incentive, as in energy communities. The calculator models a single system; a whole building needs every unit's consumption.</p>

<h2>Venice, Mestre and the province</h2>
<p>The Metropolitan City of Venice has ${prov.n} comuni, all on the plain or the coast, with an average yield of ${h.num(prov.ey)} kWh per kWp. In the lagoon, humidity and salt call for corrosion-resistant mounts and more frequent panel cleaning, factors ${h.src('pvgis', 'PVGIS')} does not consider. Average use comes from the ${h.src('arera_consumi', 'ARERA')} tables, the comuni from the ${h.src('geonames', 'GeoNames')} list. For balcony kits see ${h.a('fotovoltaico-balcone', 'balcony solar')}.</p>`,
  },
});
