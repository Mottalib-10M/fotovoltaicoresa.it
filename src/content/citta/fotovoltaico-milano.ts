import { defineGuide } from '../../lib/guide-types';
import { citta } from '../../lib/citta-kit';
import { IT, EN, P } from '../../lib/fmt';

/** Milano: meno sole di Roma ma ritiro dedicato più caro (zona Nord) e tariffa CER con +10 €/MWh; provincia piatta. */
const M = citta('milano'), R = citta('roma');
const cons = M.R.cons_alto;
const m = M.calc(4.5, cons), r = R.calc(4.5, cons);
const mCer = M.calc(4.5, cons, 0, { quotaCer: 0.5 }), rCer = R.calc(4.5, cons, 0, { quotaCer: 0.5 });
const prov = M.prov;
const gapProd = 1 - m.produzione / r.produzione;
const gapBen = 1 - m.beneficio / r.beneficio;
const ROWS: Array<[string, string, (x: typeof m) => string, 'eur' | 'kwh' | 'ct' | 'anni']> = [
  ['Produzione', 'Output', (x) => String(x.produzione), 'kwh'],
  ['Energia immessa', 'Energy exported', (x) => String(x.immessa), 'kwh'],
  ['Valore del kWh immesso', 'Value of an exported kWh', (x) => String(x.ridKwh * 100), 'ct'],
  ['Ricavo ritiro dedicato', 'Ritiro dedicato income', (x) => String(x.ricavoRid), 'eur'],
  ['Risparmio in bolletta', 'Bill saving', (x) => String(x.risparmio), 'eur'],
  ['Beneficio annuo', 'Yearly benefit', (x) => String(x.beneficio), 'eur'],
  ['Rientro', 'Payback', (x) => String(x.rientro ?? 0), 'anni'],
];

export default defineGuide({
  id: 'fotovoltaico-milano',
  group: 'citta',
  order: 20,
  tool: 'rendimento',
  toolPreset: { citta: 'milano', kwp: 4.5, cons },
  related: ['fotovoltaico-torino', 'fotovoltaico-bologna', 'ritiro-dedicato', 'comunita-energetiche', 'fotovoltaico-roma'],
  sources: ['pvgis', 'gse_rid_prezzi', 'dm_cer', 'arera_consumi', 'geonames'],
  it: {
    slug: 'fotovoltaico-milano',
    nav: 'Milano',
    card: `${IT.num(M.c.ey)} kWh per kWp; il surplus vale ${IT.num(M.ridCt, 1)} c€, più che a Roma.`,
    title: 'Fotovoltaico Milano 2026: resa, ritiro dedicato e CER',
    description: 'Fotovoltaico Milano 2026: produzione per kWp, valore del surplus nella zona Nord, tariffa premio CER con la correzione di 10 €/MWh e confronto con Roma.',
    h1: 'Fotovoltaico a Milano: meno sole, surplus pagato di più',
    intro: `A Milano 4,5 kWp producono ${IT.kwh(m.produzione)} l'anno, il ${IT.pct(gapProd)} meno che a Roma. Ma il kWh immesso vale ${IT.num(M.ridCt, 1)} centesimi contro ${IT.num(R.ridCt, 1)}, e il beneficio annuo resta solo il ${IT.pct(gapBen)} sotto: ${IT.eur(m.beneficio)}.`,
    resume: `Milano ha meno sole del Centro e del Sud: secondo PVGIS 5.3 un impianto con moduli a 30° verso sud produce ${IT.num(M.c.ey)} kWh per kWp l'anno, contro ${IT.num(R.c.ey)} a Roma. La differenza in euro, però, è più piccola di quella in kWh, per due motivi. Il primo è il prezzo: la Lombardia è nella zona di mercato Nord, dove nel 2026 il ritiro dedicato del GSE, pesato sulle ore di sole, ha pagato in media ${IT.num(M.ridCt, 1)} centesimi per kWh immesso, contro ${IT.num(R.ridCt, 1)} nella zona Centro Sud. Il secondo è la comunità energetica: il decreto CER aggiunge ${P.cer.correzione_nord} euro per MWh alla tariffa premio nelle regioni del Nord, per compensare la minore produzione, quindi a Milano la tariffa arriva a ${IT.num(M.tip)} euro per MWh contro ${IT.num(R.tip)} a Roma. Con 4,5 kWp e il consumo medio lombardo di ${IT.num(cons)} kWh, il rientro è di ${IT.anni(m.rientro)} al costo di riferimento, contro ${IT.anni(r.rientro)} a Roma. La provincia è quasi tutta pianura: fra il comune migliore e il peggiore ci sono appena ${IT.num(prov.max[1] - prov.min[1])} kWh per kWp.`,
    faqs: [
      { q: 'Quanto produce un impianto fotovoltaico a Milano?', a: `${IT.kwh(m.produzione)} l'anno con 4,5 kWp a 30° verso sud, ${IT.kwh(M.c.ey * 3)} con 3 kWp, secondo PVGIS 5.3. D'inverno la produzione cala più che al Sud: a dicembre 4,5 kWp danno circa ${IT.kwh(m.mesi[11])}, a luglio ${IT.kwh(m.mesi[6])}. Nebbia e foschia della pianura sono già comprese nei dati satellitari medi.` },
      { q: 'Il fotovoltaico a Milano conviene come a Roma?', a: `Quasi. Con lo stesso impianto da 4,5 kWp e lo stesso consumo il beneficio annuo a Milano è di ${IT.eur(m.beneficio)} contro ${IT.eur(r.beneficio)} a Roma, e il rientro di ${IT.anni(m.rientro)} contro ${IT.anni(r.rientro)}. Il prezzo zonale più alto del Nord recupera una parte della produzione persa.` },
      { q: 'Quanto rende una comunità energetica a Milano?', a: `La tariffa premio vale ${IT.num(M.tip)} euro per MWh condiviso, con la correzione di ${P.cer.correzione_nord} euro prevista per il Nord. Se metà dell'energia immessa da 4,5 kWp viene condivisa, la comunità riceve ${IT.eur(mCer.cer)} l'anno, contro ${IT.eur(rCer.cer)} a Roma, dove si immette di più ma la tariffa è più bassa.` },
      { q: 'In un condominio milanese si può installare il fotovoltaico?', a: 'Sì, sul tetto comune con una delibera dell\'assemblea, oppure con un impianto condominiale che alimenta le parti comuni o i singoli appartamenti tramite una configurazione di autoconsumo collettivo. Le regole operative del GSE descrivono i gruppi di autoconsumatori. Il simulatore calcola un singolo impianto: per un condominio servono i consumi di ogni utenza.' },
    ],
    body: (h) => `
<h2>Milano e Roma con lo stesso impianto</h2>
${h.table(['', 'Milano', 'Roma'], ROWS.map(([it, , f, t]) => [it, ...[m, r].map((x) => { const v = Number(f(x)); return t === 'eur' ? h.eur(v) : t === 'kwh' ? `${h.num(v)} kWh` : t === 'ct' ? `${h.num(v, 1)} c€` : `${h.num(v, 1)} anni`; })]), `4,5 kWp a 30° sud, consumo ${h.num(cons)} kWh, costo di riferimento, detrazione ${h.pct(P.detrazione.aliquota_prima_casa)}.`, ['l', 'r', 'r'])}
<p>Milano produce meno ma vende meglio. Il valore del kWh immesso viene dai ${h.src('gse_rid_prezzi', 'prezzi mensili del GSE')} per la zona Nord, pesati sulle fasce orarie in cui un impianto solare produce. La differenza con il Centro Sud non è garantita per il futuro: dipende dal mercato elettrico, e il simulatore permette di scrivere un valore diverso. Con il prezzo minimo garantito, il caso peggiore, la differenza fra le due città sparirebbe.</p>

<h2>Una provincia senza montagne</h2>
<p>La Città metropolitana di Milano conta ${prov.n} comuni, tutti in pianura. La resa va da ${h.num(prov.min[1])} kWh per kWp a ${prov.min[0]} a ${h.num(prov.max[1])} a ${prov.max[0]}: in pratica il dato di Milano vale per tutta la provincia, e quello che cambia da un tetto all'altro sono l'orientamento e le ombre dei palazzi vicini. ${h.src('pvgis', 'PVGIS')} non conosce le ombre degli edifici, solo quelle del rilievo, quindi in città il campo « Ombra » del simulatore va usato con attenzione. I comuni vengono dall'elenco ${h.src('geonames', 'GeoNames')}.</p>

<h2>La correzione del Nord nelle comunità energetiche</h2>
<p>Il ${h.src('dm_cer', 'decreto CER')} riconosce alle regioni del Nord ${P.cer.correzione_nord} euro per MWh in più sulla tariffa premio, al Centro ${P.cer.correzione_centro}. In una città densa come Milano trovare membri che consumano di giorno è più facile che in un paese: uffici, negozi e scuole nella stessa cabina primaria alzano la quota condivisa. Il consumo medio di ${h.num(cons)} kWh viene dalle tabelle ${h.src('arera_consumi', 'ARERA')} per i residenti lombardi con 3-4,5 kW. Per le province vicine c'è la pagina ${h.a('produzione-fotovoltaico-provincia', 'produzione per provincia')}.</p>`,
  },
  en: {
    slug: 'solar-panels-milan',
    nav: 'Milan',
    card: `${EN.num(M.c.ey)} kWh per kWp; the surplus earns ${EN.num(M.ridCt, 1)} c€, more than in Rome.`,
    title: 'Solar Panels Milan 2026: Output, Export Price and CER',
    description: 'Solar panels in Milan in 2026: output per kWp, the surplus value in the North zone, the energy community premium with its €10/MWh boost and a Rome comparison.',
    h1: 'Solar in Milan: less sun, a better price for the surplus',
    intro: `In Milan 4.5 kWp produce ${EN.kwh(m.produzione)} a year, ${EN.pct(gapProd)} less than in Rome. But an exported kWh is worth ${EN.num(M.ridCt, 1)} cents against ${EN.num(R.ridCt, 1)}, and the yearly benefit is only ${EN.pct(gapBen)} lower: ${EN.eur(m.beneficio)}.`,
    resume: `Milan gets less sun than the Centre and South: according to PVGIS 5.3 a system with panels at 30° facing south produces ${EN.num(M.c.ey)} kWh per kWp a year, against ${EN.num(R.c.ey)} in Rome. The gap in euros, however, is smaller than the gap in kWh, for two reasons. The first is price: Lombardy is in the North market zone, where in 2026 the GSE ritiro dedicato, weighted on sunny hours, paid on average ${EN.num(M.ridCt, 1)} cents per exported kWh, against ${EN.num(R.ridCt, 1)} in the Centro Sud zone. The second is the energy community: the decree adds ${P.cer.correzione_nord} euros per MWh to the premium in northern regions, to offset lower output, so in Milan the premium reaches ${EN.num(M.tip)} euros per MWh against ${EN.num(R.tip)} in Rome. With 4.5 kWp and Lombardy's average use of ${EN.num(cons)} kWh, payback is ${EN.anni(m.rientro)} at the reference cost, against ${EN.anni(r.rientro)} in Rome. The province is almost entirely flat: the best and worst comune are just ${EN.num(prov.max[1] - prov.min[1])} kWh per kWp apart.`,
    faqs: [
      { q: 'How much does a solar system produce in Milan?', a: `${EN.kwh(m.produzione)} a year with 4.5 kWp at 30° facing south, ${EN.kwh(M.c.ey * 3)} with 3 kWp, according to PVGIS 5.3. In winter output falls more than in the South: in December 4.5 kWp give about ${EN.kwh(m.mesi[11])}, in July ${EN.kwh(m.mesi[6])}. Fog and haze over the plain are already included in the average satellite data.` },
      { q: 'Is solar in Milan as worthwhile as in Rome?', a: `Almost. With the same 4.5 kWp system and the same use, the yearly benefit in Milan is ${EN.eur(m.beneficio)} against ${EN.eur(r.beneficio)} in Rome, and payback ${EN.anni(m.rientro)} against ${EN.anni(r.rientro)}. The North's higher zonal price recovers part of the lost output.` },
      { q: 'What does an energy community earn in Milan?', a: `The premium is worth ${EN.num(M.tip)} euros per shared MWh, including the ${P.cer.correzione_nord} euro adjustment for the North. If half the energy exported by 4.5 kWp is shared, the community receives ${EN.eur(mCer.cer)} a year, against ${EN.eur(rCer.cer)} in Rome, where more is exported but the premium is lower.` },
      { q: 'Can you install solar in a Milan apartment block?', a: 'Yes, on the common roof with a resolution of the condominium assembly, or with a building system that supplies common areas or individual flats through a collective self-consumption set-up. The GSE operating rules describe self-consumer groups. The calculator models a single system: a building needs the consumption of every unit.' },
    ],
    body: (h) => `
<h2>Milan and Rome with the same system</h2>
${h.table(['', 'Milan', 'Rome'], ROWS.map(([, en, f, t]) => [en, ...[m, r].map((x) => { const v = Number(f(x)); return t === 'eur' ? h.eur(v) : t === 'kwh' ? `${h.num(v)} kWh` : t === 'ct' ? `${h.num(v, 1)} c€` : `${h.num(v, 1)} years`; })]), `4.5 kWp at 30° south, ${h.num(cons)} kWh use, reference cost, ${h.pct(P.detrazione.aliquota_prima_casa)} deduction.`, ['l', 'r', 'r'])}
<p>Milan produces less but sells better. The value of an exported kWh comes from the ${h.src('gse_rid_prezzi', 'GSE monthly prices')} for the North zone, weighted on the time bands in which a solar system produces. The gap with Centro Sud is not guaranteed in future: it depends on the power market, and the calculator lets you enter another value. At the guaranteed minimum price, the worst case, the gap between the two cities would disappear.</p>

<h2>A province without mountains</h2>
<p>The Metropolitan City of Milan has ${prov.n} comuni, all on the plain. Yield ranges from ${h.num(prov.min[1])} kWh per kWp in ${prov.min[0]} to ${h.num(prov.max[1])} in ${prov.max[0]}: in practice Milan's figure holds for the whole province, and what changes from one roof to the next is facing and the shade of nearby buildings. ${h.src('pvgis', 'PVGIS')} knows terrain shade, not building shade, so in the city the calculator's « Shade » field should be used with care. The comuni come from the ${h.src('geonames', 'GeoNames')} list.</p>

<h2>The northern adjustment in energy communities</h2>
<p>The ${h.src('dm_cer', 'energy community decree')} gives northern regions ${P.cer.correzione_nord} euros per MWh more on the premium, the Centre ${P.cer.correzione_centro}. In a dense city like Milan it is easier than in a village to find members who use power by day: offices, shops and schools in the same primary substation raise the shared share. The average use of ${h.num(cons)} kWh comes from ${h.src('arera_consumi', 'ARERA')} tables for Lombard residents with 3-4.5 kW. For nearby provinces see ${h.a('produzione-fotovoltaico-provincia', 'output by province')}.</p>`,
  },
});
