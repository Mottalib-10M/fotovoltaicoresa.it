import { defineGuide } from '../../lib/guide-types';
import { calcola, feeRid, pannelli } from '../../lib/engine/fv';
import type { Luogo } from '../../lib/engine/dati';
import { IT, EN, REGIONI, P } from '../../lib/fmt';

/** 6 kWp: casa con pompa di calore o auto elettrica (5 000 kWh), regione per regione, con e senza batteria da 10 kWh. */
const reg = (i: number): Luogo => ({ nome: REGIONI[i].nome, sigla: '', reg: i, ey: REGIONI[i].ey });
const r = (i: number, bat = 0, cons = 5000) => calcola({ luogo: reg(i), kwp: 6, tilt: 30, az: 0, consumo: cons, batteria: bat, primaCasa: true });
const rows = REGIONI.map((_, i) => ({ i, a: r(i), b: r(i, 10) })).sort((x, y) => y.a.produzione - x.a.produzione);
const LAZIO = REGIONI.findIndex((x) => x.nome === 'Lazio');
const la = r(LAZIO), laB = r(LAZIO, 10), la3 = r(LAZIO, 0, 3000);
const pn = pannelli(6);
const top = rows[0], last = rows[rows.length - 1];

export default defineGuide({
  id: 'impianto-fotovoltaico-6-kw',
  group: 'impianto',
  order: 20,
  tool: 'rendimento',
  toolPreset: { kwp: 6, cons: 5000 },
  related: ['impianto-fotovoltaico-3-kw', 'fotovoltaico-con-accumulo', 'dimensionamento-impianto-fotovoltaico', 'costo-impianto-fotovoltaico', 'ritiro-dedicato'],
  sources: ['pvgis', 'arera_consumi', 'gse_rid_prezzi', 'ade_misura', 'dl34_119'],
  it: {
    slug: 'impianto-fotovoltaico-6-kw',
    nav: 'Impianto da 6 kW',
    card: 'Un impianto da 6 kWp per una casa con pompa di calore o auto elettrica, regione per regione.',
    title: 'Impianto fotovoltaico 6 kW 2026: rendimento per regione',
    description: 'Impianto fotovoltaico da 6 kW nel 2026: produzione e rientro nelle 20 regioni per una casa da 5 000 kWh con pompa di calore o auto elettrica, e con batteria.',
    h1: 'Impianto fotovoltaico da 6 kW: regione per regione',
    intro: `Per una casa che consuma 5 000 kWh, 6 kWp producono da ${IT.kwh(last.a.produzione)} in ${REGIONI[last.i].nome} a ${IT.kwh(top.a.produzione)} in ${REGIONI[top.i].nome}. Nel Lazio il rientro è di ${IT.anni(la.rientro)} senza batteria e di ${IT.anni(laB.rientro)} con 10 kWh di accumulo.`,
    resume: `Sei kilowatt di picco sono la taglia per chi consuma molto: una casa con pompa di calore per riscaldamento e acqua calda, un'auto elettrica caricata a casa o una famiglia numerosa. Servono ${pn.n} moduli da 430 W e circa ${IT.num(pn.m2)} metri quadrati di tetto, e oltre i 3 kW il GSE applica un corrispettivo per il ritiro dedicato di ${IT.eur(feeRid(6), 2)} l'anno. Abbiamo calcolato la resa media di ogni regione con PVGIS 5.3, pesata sulla popolazione dei comuni, e un consumo di 5 000 kWh, con i profili orari ARERA dei clienti fra 3 e 4,5 kW. Nel Lazio l'impianto produce ${IT.kwh(la.produzione)}, copre il ${IT.pct(la.copertura)} del consumo senza batteria e il ${IT.pct(laB.copertura)} con 10 kWh di accumulo. Al costo di riferimento, ${IT.eur(la.costo)} senza batteria e ${IT.eur(laB.costo)} con, e con la detrazione del ${IT.pct(P.detrazione.aliquota_prima_casa)}, il saldo dopo vent'anni è di ${IT.eur(la.saldo)} e ${IT.eur(laB.saldo)}. La batteria aumenta l'autonomia ma non sempre il guadagno.`,
    faqs: [
      { q: 'Quanto produce un impianto da 6 kW?', a: `Da ${IT.kwh(last.a.produzione)} l'anno in ${REGIONI[last.i].nome} a ${IT.kwh(top.a.produzione)} in ${REGIONI[top.i].nome}, con moduli a 30° verso sud secondo PVGIS, media pesata sulla popolazione. Nel Lazio ${IT.kwh(la.produzione)}. Il vostro comune può scostarsi dalla media regionale, soprattutto in montagna: scrivetelo nel simulatore.` },
      { q: 'Un impianto da 6 kW conviene con 3 000 kWh di consumo?', a: `Rende di più in euro di un 3 kW, ma la quota usata in casa scende: nel Lazio il ${IT.pct(la3.quota)} della produzione, e il resto va al ritiro dedicato. Il rientro resta di ${IT.anni(la3.rientro)} al costo di riferimento. Se prevedete una pompa di calore o un'auto elettrica nei prossimi anni, la taglia maggiore li anticipa.` },
      { q: 'Con 6 kW serve un contatore trifase?', a: 'Non necessariamente: molti impianti da 6 kW usano un inverter monofase, ma dipende dalla potenza del contatore e dalle regole di connessione del distributore. L\'installatore lo verifica nel sopralluogo. Il costo di un eventuale aumento di potenza del contatore va aggiunto al preventivo prima di confrontare le offerte.' },
    ],
    body: (h) => `
<h2>Sei kilowatt nelle 20 regioni</h2>
${h.table(['Regione', 'Produzione', 'Copertura senza batteria', 'Rientro', 'Copertura con 10 kWh', 'Rientro'], rows.map(({ i, a, b }) => [REGIONI[i].nome, `${h.num(a.produzione)} kWh`, h.pct(a.copertura), `${h.num(a.rientro ?? 0, 1)} a`, h.pct(b.copertura), `${h.num(b.rientro ?? 0, 1)} a`]), `6 kWp a 30° sud, consumo 5 000 kWh, costo di riferimento ${h.eur(la.costo)} (${h.eur(laB.costo)} con batteria), detrazione ${h.pct(P.detrazione.aliquota_prima_casa)}. Copertura = quota del consumo soddisfatta con energia propria.`, ['l', 'r', 'r', 'r', 'r', 'r'])}
<p>Con un consumo alto la batteria lavora tutto l'anno: nel Lazio porta la copertura dal ${h.pct(la.copertura)} al ${h.pct(laB.copertura)}. Il rientro si allunga perché il ${h.src('dl34_119', 'riferimento di spesa')} dell'accumulo, ${h.eur(P.costi.accumulo_eur_kwh)} per kWh, pesa sul totale; con un preventivo più basso il risultato cambia, e il simulatore lo ricalcola subito.</p>

<h2>Perché 6 kW con una pompa di calore</h2>
<p>Una pompa di calore sposta in bolletta elettrica il gas del riscaldamento, quindi il consumo sale, ma soprattutto d'inverno, quando i pannelli producono meno. L'acqua calda sanitaria, invece, si scalda anche d'estate e nelle ore di sole: è il consumo che si accoppia meglio al fotovoltaico. L'auto elettrica caricata di giorno nel weekend o da chi lavora da casa fa lo stesso.</p>
<p>I profili orari che usiamo sono quelli dei clienti residenti fra 3 e 4,5 kW pubblicati da ${h.src('arera_consumi', 'ARERA')}, non quelli di una casa con pompa di calore: per una casa tutta elettrica la quota invernale reale può essere diversa. I prezzi del ritiro dedicato vengono dalle ${h.src('gse_rid_prezzi', 'tabelle mensili del GSE')}.</p>`,
  },
  en: {
    slug: '6-kw-solar-system-italy',
    nav: '6 kW system',
    card: 'A 6 kWp system for a home with a heat pump or electric car, region by region.',
    title: '6 kW Solar System Italy 2026: Yield and Payback by Region',
    description: 'A 6 kW solar system in Italy in 2026: output and payback in all 20 regions for a 5,000 kWh home with a heat pump or electric car, with and without a battery.',
    h1: 'A 6 kW solar system in Italy, region by region',
    intro: `For a home using 5,000 kWh, 6 kWp produce from ${EN.kwh(last.a.produzione)} in ${REGIONI[last.i].en} to ${EN.kwh(top.a.produzione)} in ${REGIONI[top.i].en}. In Lazio payback is ${EN.anni(la.rientro)} without a battery and ${EN.anni(laB.rientro)} with 10 kWh of storage.`,
    resume: `Six kilowatts peak is the size for heavy users: a home with a heat pump for heating and hot water, an electric car charged at home or a large family. It takes ${pn.n} panels of 430 W and about ${EN.num(pn.m2)} square metres of roof, and above 3 kW the GSE charges a ritiro dedicato fee of ${EN.eur(feeRid(6), 2)} a year. We calculated each region's average yield with PVGIS 5.3, weighted by the comuni's population, and 5,000 kWh of use, with ARERA hourly profiles for customers between 3 and 4.5 kW. In Lazio the system produces ${EN.kwh(la.produzione)}, covers ${EN.pct(la.copertura)} of use without a battery and ${EN.pct(laB.copertura)} with 10 kWh of storage. At the reference cost, ${EN.eur(la.costo)} without a battery and ${EN.eur(laB.costo)} with one, and with the ${EN.pct(P.detrazione.aliquota_prima_casa)} deduction, the balance after twenty years is ${EN.eur(la.saldo)} and ${EN.eur(laB.saldo)}. A battery increases self-sufficiency but not always the gain.`,
    faqs: [
      { q: 'How much does a 6 kW solar system produce in Italy?', a: `From ${EN.kwh(last.a.produzione)} a year in ${REGIONI[last.i].en} to ${EN.kwh(top.a.produzione)} in ${REGIONI[top.i].en}, with panels at 30° facing south according to PVGIS, population-weighted. In Lazio ${EN.kwh(la.produzione)}. Your comune may differ from the regional average, especially in the mountains: enter it in the calculator.` },
      { q: 'Is a 6 kW system worth it with 3,000 kWh of use?', a: `It earns more in euros than 3 kW, but the share used at home falls: in Lazio ${EN.pct(la3.quota)} of output, with the rest going to the ritiro dedicato. Payback stays at ${EN.anni(la3.rientro)} at the reference cost. If you plan a heat pump or an electric car in the coming years, the larger size gets ahead of them.` },
      { q: 'Does a 6 kW system need a three-phase meter?', a: 'Not necessarily: many 6 kW systems use a single-phase inverter, but it depends on the meter\'s power and the distributor\'s connection rules. The installer checks this during the site visit. The cost of any increase in meter power should be added to the quote before comparing offers.' },
    ],
    body: (h) => `
<h2>Six kilowatts in the 20 regions</h2>
${h.table(['Region', 'Output', 'Coverage, no battery', 'Payback', 'Coverage with 10 kWh', 'Payback'], rows.map(({ i, a, b }) => [REGIONI[i].en, `${h.num(a.produzione)} kWh`, h.pct(a.copertura), `${h.num(a.rientro ?? 0, 1)} y`, h.pct(b.copertura), `${h.num(b.rientro ?? 0, 1)} y`]), `6 kWp at 30° south, 5,000 kWh use, reference cost ${h.eur(la.costo)} (${h.eur(laB.costo)} with battery), ${h.pct(P.detrazione.aliquota_prima_casa)} deduction. Coverage = share of use met with own power.`, ['l', 'r', 'r', 'r', 'r', 'r'])}
<p>With high use the battery works all year: in Lazio it lifts coverage from ${h.pct(la.copertura)} to ${h.pct(laB.copertura)}. Payback lengthens because the storage ${h.src('dl34_119', 'spending reference')}, ${h.eur(P.costi.accumulo_eur_kwh)} per kWh, weighs on the total; with a lower quote the result changes, and the calculator recomputes it at once.</p>

<h2>Why 6 kW with a heat pump</h2>
<p>A heat pump moves heating from the gas bill to the electricity bill, so use goes up, but mostly in winter, when panels produce less. Domestic hot water, by contrast, is heated in summer too and in sunny hours: it is the load that pairs best with solar. An electric car charged by day at weekends or by someone working from home does the same.</p>
<p>The hourly profiles we use are those of resident customers between 3 and 4.5 kW published by ${h.src('arera_consumi', 'ARERA')}, not those of a home with a heat pump: for an all-electric home the real winter share may differ. Ritiro dedicato prices come from the ${h.src('gse_rid_prezzi', 'GSE monthly tables')}.</p>`,
  },
});
