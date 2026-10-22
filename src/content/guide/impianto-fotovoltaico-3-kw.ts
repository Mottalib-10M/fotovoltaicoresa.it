import { defineGuide } from '../../lib/guide-types';
import { calcola, pannelli } from '../../lib/engine/fv';
import { luogoCitta } from '../../lib/engine/dati';
import { IT, EN, CITTA, P } from '../../lib/fmt';

/** 3 kWp, la taglia più installata nelle case: dodici città con 2 700 kWh di consumo, senza batteria. */
const SLUG = Object.keys(CITTA);
const r = (s: string, bat = 0) => calcola({ luogo: luogoCitta(s), kwp: 3, tilt: 30, az: 0, consumo: 2700, batteria: bat, primaCasa: true });
const rows = SLUG.map((s) => ({ s, x: r(s) })).sort((a, b) => b.x.produzione - a.x.produzione);
const best = rows[0], worst = rows[rows.length - 1];
const ro = r('roma'), roB = r('roma', 5);
const pn = pannelli(3);

export default defineGuide({
  id: 'impianto-fotovoltaico-3-kw',
  group: 'impianto',
  order: 10,
  tool: 'rendimento',
  toolPreset: { kwp: 3, cons: 2700 },
  related: ['impianto-fotovoltaico-6-kw', 'dimensionamento-impianto-fotovoltaico', 'costo-impianto-fotovoltaico', 'quanto-produce-un-impianto-fotovoltaico', 'fotovoltaico-con-accumulo'],
  sources: ['pvgis', 'arera_consumi', 'gse_rid_prezzi', 'ade_misura', 'dm_cer'],
  it: {
    slug: 'impianto-fotovoltaico-3-kw',
    nav: 'Impianto da 3 kW',
    card: 'Produzione, risparmio, ritiro dedicato e rientro di un impianto da 3 kWp in dodici città.',
    title: 'Impianto fotovoltaico 3 kW 2026: produzione, costo, rientro',
    description: 'Impianto fotovoltaico da 3 kW nel 2026: quanto produce in dodici città, quanto si risparmia in bolletta, quanto paga il GSE e in quanti anni rientra la spesa.',
    h1: 'Pannelli solari da 3 kW: prezzi, produzione e conti in dodici città',
    intro: `Un impianto da 3 kWp produce da ${IT.kwh(worst.x.produzione)} a ${CITTA[worst.s].nome} a ${IT.kwh(best.x.produzione)} a ${CITTA[best.s].nome}; con 2 700 kWh di consumo e la detrazione del 50 % rientra in circa cinque anni in tutte e dodici le città.`,
    resume: `Tre kilowatt di picco sono la taglia classica di un impianto domestico italiano, perché coprono in un anno il consumo medio di una famiglia e stanno su ${pn.n} moduli da 430 W, circa ${IT.num(pn.m2)} metri quadrati di tetto. Fino a 3 kW il ritiro dedicato del GSE non applica alcun corrispettivo. Abbiamo calcolato i conti in dodici grandi città con i dati PVGIS 5.3 per moduli a 30° verso sud, un consumo di 2 700 kWh e i profili orari ARERA per stimare quanta energia si usa in casa. A Roma l'impianto produce ${IT.kwh(ro.produzione)}, ne consuma in casa il ${IT.pct(ro.quota)}, risparmia ${IT.eur(ro.risparmio)} in bolletta e incassa ${IT.eur(ro.ricavoRid)} dal ritiro dedicato. Al costo di riferimento di ${IT.eur(ro.costo)} del decreto CER e con la detrazione del ${IT.pct(P.detrazione.aliquota_prima_casa)}, il rientro è di ${IT.anni(ro.rientro)}. Le differenze fra città sono minori di quanto si pensi, perché dove il sole è più forte il ritiro dedicato paga un po' meno per kWh.`,
    faqs: [
      { q: 'Quanto produce un impianto da 3 kW in un anno?', a: `Da ${IT.kwh(worst.x.produzione)} a ${CITTA[worst.s].nome} a ${IT.kwh(best.x.produzione)} a ${CITTA[best.s].nome}, con moduli a 30° verso sud secondo PVGIS. A Roma ${IT.kwh(ro.produzione)}. Un tetto verso est o ovest produce circa un quinto in meno. Nel simulatore inserite il vostro comune, l'orientamento e l'inclinazione per il valore preciso.` },
      { q: 'Un impianto da 3 kW basta per una casa?', a: `Produce in un anno quanto consuma una famiglia media, ma senza batteria copre direttamente circa il ${IT.pct(ro.copertura)} del consumo a Roma, perché l'energia arriva di giorno. Il resto va in rete e viene pagato dal ritiro dedicato. Con una pompa di calore o un'auto elettrica serve una taglia maggiore, come quella da 6 kW.` },
      { q: 'Conviene aggiungere una batteria a 3 kW?', a: `Una batteria da 5 kWh porta la quota usata in casa a Roma dal ${IT.pct(ro.quota)} al ${IT.pct(roB.quota)}, ma con 3 kWp in inverno resta spesso mezza vuota. Il rientro dell'insieme passa da ${IT.anni(ro.rientro)} a ${IT.anni(roB.rientro)} al costo di riferimento. Su questa taglia la batteria conviene solo se costa poco.` },
    ],
    body: (h) => `
<h2>Tre kilowatt in dodici città</h2>
${h.table(['Città', 'Produzione', 'Usata in casa', 'Risparmio', 'Ritiro dedicato', 'Rientro'], rows.map(({ s, x }) => [h.a(`fotovoltaico-${s}`, CITTA[s].nome), `${h.num(x.produzione)} kWh`, h.pct(x.quota), h.eur(x.risparmio), h.eur(x.ricavoRid), `${h.num(x.rientro ?? 0, 1)} anni`]), `3 kWp a 30° sud, 2 700 kWh di consumo, costo di riferimento ${h.eur(ro.costo)}, detrazione ${h.pct(P.detrazione.aliquota_prima_casa)}.`, ['l', 'r', 'r', 'r', 'r', 'r'])}
<p>Le città del Sud producono di più, ma la quota usata in casa è un po' più bassa perché la produzione supera di più il consumo, e il ${h.src('gse_rid_prezzi', 'prezzo GSE')} nelle zone meridionali è leggermente inferiore. Il risultato è uno scarto di pochi mesi sul rientro fra la prima e l'ultima città della tabella.</p>

<h2>Che cosa c'è in un impianto da 3 kW</h2>
<p>Servono ${pn.n} moduli da 430 W, un inverter monofase, la struttura di fissaggio, i cavi e il quadro di protezione, più l'allacciamento del distributore e la pratica del ritiro dedicato. Il ${h.src('dm_cer', 'decreto CER')} indica ${h.eur(P.costi.fv_eur_kw)} per kW come costo massimo di riferimento, IVA esclusa: noi lo usiamo come valore iniziale, ma conta il vostro preventivo. La ${h.src('ade_misura', 'detrazione')} restituisce metà della spesa sulla prima casa del proprietario in dieci anni.</p>
<p>La quota di energia usata in casa viene dai ${h.src('arera_consumi', 'profili orari ARERA')} della vostra regione: per una famiglia fuori casa di giorno è più bassa, per chi lavora da casa più alta. Per capire se vi serve di più, la pagina ${h.a('dimensionamento-impianto-fotovoltaico', 'dimensionamento')} confronta le taglie.</p>`,
  },
  en: {
    slug: '3-kw-solar-system-italy',
    nav: '3 kW system',
    card: 'Output, saving, ritiro dedicato and payback of a 3 kWp system in twelve Italian cities.',
    title: '3 kW Solar System Italy 2026: Output, Cost and Payback',
    description: 'A 3 kW solar system in Italy in 2026: output in twelve cities, the saving on the bill, what the GSE pays for exports and how many years the payback takes.',
    h1: '3 kW solar panels: prices, output and the numbers in twelve Italian cities',
    intro: `A 3 kWp system produces from ${EN.kwh(worst.x.produzione)} in ${CITTA[worst.s].nome} to ${EN.kwh(best.x.produzione)} in ${CITTA[best.s].nome}; with 2,700 kWh of use and the 50% deduction it pays back in about five years in all twelve cities.`,
    resume: `Three kilowatts peak is the classic size of an Italian home system, because it covers an average household's yearly use and fits on ${pn.n} panels of 430 W, about ${EN.num(pn.m2)} square metres of roof. Up to 3 kW the GSE's ritiro dedicato charges no fee. We worked out the numbers in twelve large cities with PVGIS 5.3 data for panels at 30° facing south, 2,700 kWh of consumption and ARERA hourly profiles to estimate how much energy is used at home. In Rome the system produces ${EN.kwh(ro.produzione)}, uses ${EN.pct(ro.quota)} of it at home, saves ${EN.eur(ro.risparmio)} on the bill and earns ${EN.eur(ro.ricavoRid)} from the ritiro dedicato. At the energy community decree's reference cost of ${EN.eur(ro.costo)} and with the ${EN.pct(P.detrazione.aliquota_prima_casa)} deduction, payback is ${EN.anni(ro.rientro)}. The gaps between cities are smaller than one might think, because where the sun is stronger the ritiro dedicato pays a little less per kWh.`,
    faqs: [
      { q: 'How much does a 3 kW solar system produce in a year in Italy?', a: `From ${EN.kwh(worst.x.produzione)} in ${CITTA[worst.s].nome} to ${EN.kwh(best.x.produzione)} in ${CITTA[best.s].nome}, with panels at 30° facing south according to PVGIS. In Rome ${EN.kwh(ro.produzione)}. An east or west roof produces about a fifth less. Enter your comune, facing and tilt in the calculator for the exact value.` },
      { q: 'Is a 3 kW system enough for a house?', a: `It produces in a year what an average household uses, but without a battery it directly covers about ${EN.pct(ro.copertura)} of use in Rome, because the energy arrives by day. The rest goes to the grid and is paid for by the ritiro dedicato. With a heat pump or an electric car you need a larger size, such as 6 kW.` },
      { q: 'Is it worth adding a battery to 3 kW?', a: `A 5 kWh battery raises the share used at home in Rome from ${EN.pct(ro.quota)} to ${EN.pct(roB.quota)}, but with 3 kWp it often stays half empty in winter. Payback for the whole goes from ${EN.anni(ro.rientro)} to ${EN.anni(roB.rientro)} at the reference cost. At this size a battery only pays if it is cheap.` },
    ],
    body: (h) => `
<h2>Three kilowatts in twelve cities</h2>
${h.table(['City', 'Output', 'Used at home', 'Saving', 'Ritiro dedicato', 'Payback'], rows.map(({ s, x }) => [h.a(`fotovoltaico-${s}`, CITTA[s].nome), `${h.num(x.produzione)} kWh`, h.pct(x.quota), h.eur(x.risparmio), h.eur(x.ricavoRid), `${h.num(x.rientro ?? 0, 1)} years`]), `3 kWp at 30° south, 2,700 kWh use, reference cost ${h.eur(ro.costo)}, ${h.pct(P.detrazione.aliquota_prima_casa)} deduction.`, ['l', 'r', 'r', 'r', 'r', 'r'])}
<p>Southern cities produce more, but the share used at home is slightly lower because output exceeds use by more, and the ${h.src('gse_rid_prezzi', 'GSE price')} in southern zones is a little lower. The result is a gap of a few months in payback between the first and last city in the table.</p>

<h2>What goes into a 3 kW system</h2>
<p>You need ${pn.n} panels of 430 W, a single-phase inverter, mounting, cables and a protection board, plus the distributor's connection and the ritiro dedicato paperwork. The ${h.src('dm_cer', 'energy community decree')} gives ${h.eur(P.costi.fv_eur_kw)} per kW as the maximum reference cost, VAT excluded: we use it as the starting value, but your quote is what counts. The ${h.src('ade_misura', 'deduction')} returns half the cost on the owner's main home over ten years.</p>
<p>The share of energy used at home comes from the ${h.src('arera_consumi', 'ARERA hourly profiles')} for your region: lower for a household out by day, higher for someone working from home. To see whether you need more, the ${h.a('dimensionamento-impianto-fotovoltaico', 'sizing')} page compares sizes.</p>`,
  },
});
