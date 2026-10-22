import { defineGuide } from '../../lib/guide-types';
import { calcola, pannelli } from '../../lib/engine/fv';
import { ROMA } from '../../lib/engine/dati';
import { P, IT, EN, ITALIA } from '../../lib/fmt';

/** Dimensionamento: quale potenza per quale consumo, a Roma, senza batteria; taglia che copre il consumo annuo. */
const CONS = [1800, 2700, 3500, 5000];
const KWP = [2, 3, 4.5, 6];
const r = (cons: number, kwp: number, bat = 0) => calcola({ luogo: ROMA, kwp, tilt: 30, az: 0, consumo: cons, batteria: bat, primaCasa: true });
const copre = (cons: number) => cons / ROMA.ey;
const a = r(2700, 3), b = r(2700, 6), c5 = r(5000, 4.5), c5b = r(5000, 3);
const pn3 = pannelli(3), pn6 = pannelli(6);
const base = ITALIA.cons_base, alto = ITALIA.cons_alto;

export default defineGuide({
  id: 'dimensionamento-impianto-fotovoltaico',
  group: 'calcolo',
  order: 30,
  tool: 'dimensione',
  toolPreset: { kwp: 3, cons: 2700 },
  related: ['quanto-produce-un-impianto-fotovoltaico', 'impianto-fotovoltaico-3-kw', 'impianto-fotovoltaico-6-kw', 'fotovoltaico-con-accumulo', 'pannelli-fotovoltaici'],
  sources: ['arera_consumi', 'pvgis', 'gse_rid_prezzi', 'arera_pmg'],
  it: {
    slug: 'dimensionamento-impianto-fotovoltaico',
    nav: 'Dimensionamento',
    card: 'Quanti kWp per il vostro consumo: copertura, energia usata in casa e saldo in vent\'anni per ogni taglia.',
    title: 'Dimensionamento impianto fotovoltaico 2026: kWp necessari',
    description: 'Dimensionamento impianto fotovoltaico 2026: i kWp per il vostro consumo annuo, quanta energia usate davvero in casa e quanto rende ogni taglia in vent\'anni.',
    h1: 'Quanti kWp servono: dimensionare il fotovoltaico sul consumo',
    intro: `A Roma ${IT.num(copre(2700), 1)} kWp producono in un anno i 2 700 kWh di una famiglia tipo, ma senza batteria in casa se ne usa solo il ${IT.pct(a.copertura)}: il resto va in rete al prezzo del ritiro dedicato.`,
    resume: `Dimensionare un impianto fotovoltaico vuol dire scegliere la potenza in kWp partendo dal consumo annuo scritto in bolletta. La regola più diffusa, produrre quanto si consuma, porta a ${IT.num(copre(2700), 1)} kWp a Roma per 2 700 kWh, ma non dice quanta energia si usa davvero: i pannelli producono di giorno e soprattutto d'estate, mentre la casa consuma anche la sera e d'inverno. Secondo i profili orari dei prelievi pubblicati da ARERA per il 2025, con 3 kWp e 2 700 kWh l'anno si usa in casa il ${IT.pct(a.quota)} dell'energia prodotta, che copre il ${IT.pct(a.copertura)} del consumo. Raddoppiando a 6 kWp la copertura sale solo al ${IT.pct(b.copertura)}, perché il surplus cresce nelle stesse ore. Il surplus non è perso: il GSE lo paga con il ritiro dedicato a circa 11 o 12 centesimi, meno della metà dei circa 25 centesimi evitati in bolletta. Per questo un impianto più grande rende di più in euro, ma ogni kWp in più rende meno del precedente.`,
    faqs: [
      { q: 'Quanti kW di fotovoltaico servono per una famiglia di 4 persone?', a: `Dipende dal consumo, non dalle persone. ARERA indica per il 2025 un consumo medio di ${IT.num(base)} kWh per i clienti residenti con 1,5-3 kW di potenza e di ${IT.num(alto)} kWh per chi ha 3-4,5 kW. Prendete il totale annuo dall'ultima bolletta e dividetelo per i kWh per kWp del vostro comune: a Roma ${IT.num(ROMA.ey)}.` },
      { q: 'Conviene fare un impianto più grande del consumo?', a: `In euro sì, entro il tetto: a Roma, con 2 700 kWh, 6 kWp rendono ${IT.eur(b.beneficio)} l'anno contro ${IT.eur(a.beneficio)} di 3 kWp. Però il tempo di rientro passa da ${IT.anni(a.rientro)} a ${IT.anni(b.rientro)}, perché il kWh immesso vale meno di quello usato. Se prevedete una pompa di calore o un'auto elettrica, la taglia maggiore diventa più interessante.` },
      { q: 'Quanto spazio sul tetto serve per 3 kWp?', a: `Con moduli da 430 W servono ${pn3.n} pannelli, circa ${IT.num(pn3.m2)} metri quadrati di superficie utile; per 6 kWp ${pn6.n} pannelli e circa ${IT.num(pn6.m2)} metri quadrati. Su un tetto piano servono distanze fra le file per evitare l'ombra reciproca. Il mini-simulatore dei pannelli fa il conto per qualsiasi potenza.` },
    ],
    body: (h) => `
<h2>Taglie e consumi a confronto</h2>
${h.table(['Consumo annuo', ...KWP.map((k) => `${h.num(k, 1)} kWp`)], CONS.map((c) => [`${h.num(c)} kWh`, ...KWP.map((k) => { const x = r(c, k); return `${h.pct(x.copertura)} · ${x.rientro === null ? '>20' : h.num(x.rientro, 1)} a`; })]), 'Roma, 30° sud, senza batteria. Per ogni cella: quota del consumo coperta con energia propria · anni di rientro con detrazione del 50 %.', ['l', 'r', 'r', 'r', 'r'])}
<p>La tabella mostra il limite dell'autoconsumo diretto: anche con un impianto molto più grande del consumo, la copertura senza batteria resta sotto la metà. Il tempo di rientro cresce poco con la taglia perché il costo di riferimento è lineare e il surplus viene comunque pagato. Con 5 000 kWh, tipici di una casa con pompa di calore, 4,5 kWp rendono ${h.eur(c5.beneficio)} l'anno contro ${h.eur(c5b.beneficio)} di 3 kWp.</p>

<h2>Tre passi per scegliere</h2>
<p>Primo: il consumo annuo, dalla bolletta o dall'area clienti del fornitore; ${h.src('arera_consumi', 'ARERA')} pubblica le medie per fascia di potenza se la bolletta non è a portata di mano. Secondo: la resa del vostro comune, nel simulatore qui sopra. Terzo: lo spazio sul tetto e il budget. Se il tetto permette di più, il ritiro dedicato a prezzo zonale con il ${h.src('arera_pmg', 'prezzo minimo garantito')} rende la potenza extra comunque redditizia, ma con un margine minore.</p>
<p>Oltre i 3 kW il GSE applica un ${h.src('gse_rid_prezzi', 'corrispettivo annuo')} per il ritiro dedicato, pochi euro per un impianto domestico. La batteria cambia i conti in un altro modo: sposta l'energia del giorno alla sera ed è trattata nella pagina ${h.a('fotovoltaico-con-accumulo', 'fotovoltaico con accumulo')}.</p>`,
  },
  en: {
    slug: 'solar-system-sizing',
    nav: 'System sizing',
    card: 'How many kWp for your consumption: coverage, energy used at home and twenty-year balance for each size.',
    title: 'Solar System Sizing Italy 2026: How Many kWp You Need',
    description: 'Solar system sizing in Italy 2026: how many kWp your yearly use needs, how much energy you really use at home and what each system size earns over 20 years.',
    h1: 'How many kWp you need: sizing solar on your consumption',
    intro: `In Rome ${EN.num(copre(2700), 1)} kWp produce in a year the 2,700 kWh of a typical household, but without a battery only ${EN.pct(a.copertura)} of that use is met at home: the rest goes to the grid at the ritiro dedicato price.`,
    resume: `Sizing a solar system means choosing the capacity in kWp from the annual consumption on your bill. The common rule, produce what you use, gives ${EN.num(copre(2700), 1)} kWp in Rome for 2,700 kWh, but it says nothing about how much energy you actually use: panels produce by day and mostly in summer, while the home also uses power in the evening and in winter. According to the hourly withdrawal profiles published by ARERA for 2025, with 3 kWp and 2,700 kWh a year ${EN.pct(a.quota)} of the output is used at home, covering ${EN.pct(a.copertura)} of consumption. Doubling to 6 kWp raises coverage only to ${EN.pct(b.copertura)}, because the surplus grows in the same hours. The surplus is not lost: the GSE pays for it under the ritiro dedicato at about 11 or 12 cents, less than half the roughly 25 cents avoided on the bill. So a larger system earns more in euros, but each extra kWp earns less than the one before.`,
    faqs: [
      { q: 'How many kW of solar does a family of four need in Italy?', a: `It depends on consumption, not on the number of people. ARERA gives 2025 averages of ${EN.num(base)} kWh for resident customers with 1.5 to 3 kW contracts and ${EN.num(alto)} kWh for 3 to 4.5 kW. Take the yearly total from your latest bill and divide it by your comune's kWh per kWp: ${EN.num(ROMA.ey)} in Rome.` },
      { q: 'Is it worth installing more than you consume?', a: `In euros yes, within limits: in Rome, with 2,700 kWh, 6 kWp earn ${EN.eur(b.beneficio)} a year against ${EN.eur(a.beneficio)} for 3 kWp. But payback moves from ${EN.anni(a.rientro)} to ${EN.anni(b.rientro)}, because an exported kWh is worth less than one used. If you plan a heat pump or an electric car, the larger size becomes more attractive.` },
      { q: 'How much roof space does 3 kWp need?', a: `With 430 W panels you need ${pn3.n} panels, about ${EN.num(pn3.m2)} square metres of usable area; for 6 kWp ${pn6.n} panels and about ${EN.num(pn6.m2)} square metres. On a flat roof rows need spacing to avoid shading each other. The panel mini-calculator works it out for any size.` },
    ],
    body: (h) => `
<h2>Sizes and consumption compared</h2>
${h.table(['Annual use', ...KWP.map((k) => `${h.num(k, 1)} kWp`)], CONS.map((c) => [`${h.num(c)} kWh`, ...KWP.map((k) => { const x = r(c, k); return `${h.pct(x.copertura)} · ${x.rientro === null ? '>20' : h.num(x.rientro, 1)} y`; })]), 'Rome, 30° south, no battery. Each cell: share of use covered by own power · payback years with the 50% deduction.', ['l', 'r', 'r', 'r', 'r'])}
<p>The table shows the limit of direct self-consumption: even with a system far larger than consumption, coverage without a battery stays below half. Payback grows little with size because the reference cost is linear and the surplus is paid for anyway. With 5,000 kWh, typical of a home with a heat pump, 4.5 kWp earn ${h.eur(c5.beneficio)} a year against ${h.eur(c5b.beneficio)} for 3 kWp.</p>

<h2>Three steps to choose</h2>
<p>First: annual consumption, from the bill or the supplier's customer area; ${h.src('arera_consumi', 'ARERA')} publishes averages by contract power if the bill is not at hand. Second: your comune's yield, in the calculator above. Third: roof space and budget. If the roof allows more, the ritiro dedicato at the zonal price with the ${h.src('arera_pmg', 'guaranteed minimum price')} still makes the extra capacity profitable, with a smaller margin.</p>
<p>Above 3 kW the GSE charges a small ${h.src('gse_rid_prezzi', 'annual fee')} for the ritiro dedicato, a few euros for a home system. A battery changes the sums in another way: it moves daytime energy to the evening and is covered on the ${h.a('fotovoltaico-con-accumulo', 'solar with battery storage')} page.</p>`,
  },
});
