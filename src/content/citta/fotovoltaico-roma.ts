import { defineGuide } from '../../lib/guide-types';
import { citta } from '../../lib/citta-kit';
import { IT, EN, P } from '../../lib/fmt';

/** Roma: prima casa al 50 % contro seconda casa o inquilino al 36 %; provincia da Roma ai Castelli e ai monti. */
const K = citta('roma');
const cons = K.R.cons_alto;
const KWP = [3, 4.5, 6];
const pc = (k: number) => K.calc(k, cons), sc = (k: number) => K.calc(k, cons, 0, { primaCasa: false });
const a = pc(3), b = sc(3), a45 = pc(4.5), b45 = sc(4.5);
const sc2 = K.calc(3, 1200, 0, { primaCasa: false });
const prov = K.prov;

export default defineGuide({
  id: 'fotovoltaico-roma',
  group: 'citta',
  order: 10,
  tool: 'rendimento',
  toolPreset: { citta: 'roma', kwp: 3, cons },
  related: ['fotovoltaico-napoli', 'fotovoltaico-firenze', 'bonus-fotovoltaico', 'impianto-fotovoltaico-3-kw', 'costo-impianto-fotovoltaico'],
  sources: ['pvgis', 'arera_consumi', 'ade_misura', 'gse_rid_prezzi', 'geonames'],
  it: {
    slug: 'fotovoltaico-roma',
    nav: 'Roma',
    card: `${IT.num(K.c.ey)} kWh per kWp; prima casa al 50 %, seconda casa al 36 %.`,
    title: 'Fotovoltaico Roma 2026: resa, prima e seconda casa',
    description: 'Fotovoltaico Roma 2026: quanto produce un impianto in città e in provincia e in quanti anni rientra sulla prima casa con il 50 % e sulla seconda con il 36 %.',
    h1: 'Fotovoltaico a Roma: prima casa, seconda casa e provincia',
    intro: `A Roma 1 kWp produce ${IT.num(K.c.ey)} kWh l'anno. Con 3 kWp e il consumo medio laziale di ${IT.num(cons)} kWh, l'impianto rientra in ${IT.anni(a.rientro)} sulla prima casa del proprietario e in ${IT.anni(b.rientro)} su una seconda casa o in affitto.`,
    resume: `Roma è il comune più popoloso d'Italia e uno dei più soleggiati del Centro: secondo PVGIS 5.3, alle coordinate del Campidoglio un impianto con moduli a 30° verso sud produce ${IT.num(K.c.ey)} kWh per kWp l'anno, contro una media nazionale di circa 1 400. In provincia la resa va da ${IT.num(prov.min[1])} kWh a ${prov.min[0]} a ${IT.num(prov.max[1])} a ${prov.max[0]}. Il Lazio è nella zona di mercato Centro Sud, dove il ritiro dedicato del GSE vale circa ${IT.num(K.ridCt, 1)} centesimi per kWh immesso con i prezzi del 2026. Il punto che cambia di più il conto a Roma, dove molte famiglie hanno una casa al mare o in affitto, è la detrazione: ${IT.pct(P.detrazione.aliquota_prima_casa)} sull'abitazione principale del proprietario, ${IT.pct(P.detrazione.aliquota_altri)} sulla seconda casa e per chi è in affitto. Su 3 kWp al costo di riferimento la differenza vale ${IT.eur(a.detrazione - b.detrazione)} in dieci anni e allunga il rientro da ${IT.anni(a.rientro)} a ${IT.anni(b.rientro)}.`,
    faqs: [
      { q: 'Quanto produce un impianto fotovoltaico a Roma?', a: `${IT.kwh(a.produzione)} l'anno con 3 kWp a 30° verso sud, ${IT.kwh(a45.produzione)} con 4,5 kWp, secondo PVGIS 5.3 alle coordinate del comune. Luglio è il mese migliore con circa ${IT.kwh(a.mesi[6])}, dicembre il peggiore con ${IT.kwh(a.mesi[11])}. In provincia il dato cambia di molto fra pianura, colline e monti.` },
      { q: 'Il fotovoltaico conviene su una seconda casa a Roma o al mare?', a: `La detrazione scende al ${IT.pct(P.detrazione.aliquota_altri)}, quindi il rientro di 3 kWp passa da ${IT.anni(a.rientro)} a ${IT.anni(b.rientro)} con lo stesso consumo. In una casa usata solo d'estate il consumo è più basso: con 1 200 kWh il rientro sale a ${IT.anni(sc2.rientro)}, perché gran parte dell'energia va in rete al prezzo del ritiro dedicato.` },
      { q: 'Chi è in affitto a Roma può detrarre il fotovoltaico?', a: `Sì, l'inquilino che sostiene la spesa con il consenso del proprietario può detrarla, ma al ${IT.pct(P.detrazione.aliquota_altri)}, perché il ${IT.pct(P.detrazione.aliquota_prima_casa)} spetta solo al proprietario o al titolare di un diritto reale sull'abitazione principale, secondo la scheda dell'Agenzia delle Entrate. Nel simulatore scegliete « No » alla domanda sulla prima casa.` },
      { q: 'Quanto costa un impianto fotovoltaico a Roma?', a: `Non pubblichiamo prezzi di mercato romani, che cambiano da installatore a installatore. Come riferimento usiamo il costo massimo del decreto CER, ${IT.eur(P.costi.fv_eur_kw)} per kW IVA esclusa: ${IT.eur(a.costo)} per 3 kWp e ${IT.eur(a45.costo)} per 4,5 kWp. Inserite nel simulatore il totale del vostro preventivo con IVA: rientro e saldo si aggiornano subito.` },
    ],
    body: (h) => `
<h2>Prima casa o seconda casa: la stessa resa, due rientri</h2>
${h.table(['Impianto', 'Produzione', 'Beneficio annuo', 'Detrazione 50 %', 'Rientro', 'Detrazione 36 %', 'Rientro'], KWP.map((k) => { const x = pc(k), y = sc(k); return [`${h.num(k, 1)} kWp`, `${h.num(x.produzione)} kWh`, h.eur(x.beneficio), h.eur(x.detrazione), `${h.num(x.rientro ?? 0, 1)} anni`, h.eur(y.detrazione), `${h.num(y.rientro ?? 0, 1)} anni`]; }), `Roma, 30° sud, consumo ${h.num(cons)} kWh (media ARERA del Lazio, clienti 3-4,5 kW), costo di riferimento.`, ['l', 'r', 'r', 'r', 'r', 'r', 'r'])}
<p>La resa e il risparmio non cambiano con il tipo di casa: cambia solo quanto vi restituisce lo Stato. Il beneficio annuo, ${h.eur(a.beneficio)} con 3 kWp, viene per ${h.eur(a.risparmio)} dalla bolletta e per ${h.eur(a.ricavoRid)} dal ${h.src('gse_rid_prezzi', 'ritiro dedicato')}. Su una casa al mare abitata pochi mesi, invece, il consumo crolla e la quota venduta in rete sale, quindi il beneficio scende anche a parità di detrazione.</p>

<h2>Dal centro ai Castelli e ai monti</h2>
<p>La provincia di Roma conta ${prov.n} comuni con una resa media di ${h.num(prov.ey)} kWh per kWp. Il valore più alto è a ${prov.max[0]}, sulla costa, il più basso a ${prov.min[0]}, fra i monti, dove le valli tolgono sole al mattino e alla sera. ${h.src('pvgis', 'PVGIS')} tiene conto dell'orizzonte reale di ogni comune: per Tivoli, Frascati o Civitavecchia scrivete il nome nel simulatore e il calcolo usa le loro coordinate, prese dall'elenco ${h.src('geonames', 'GeoNames')}.</p>

<h2>Cosa considerare a Roma</h2>
<p>Molti edifici del centro sono in aree vincolate, dove i pannelli sul tetto richiedono autorizzazioni paesaggistiche: chiedete all'installatore di verificarlo prima del preventivo. Nei condomini il tetto è una parte comune, quindi serve il passaggio in assemblea. Il consumo medio laziale che usiamo, ${h.num(cons)} kWh, viene dalle tabelle ${h.src('arera_consumi', 'ARERA')} per i clienti residenti con 3-4,5 kW; scrivete il vostro dalla bolletta. Le regole della ${h.src('ade_misura', 'detrazione')} sono spiegate nella pagina ${h.a('bonus-fotovoltaico', 'bonus fotovoltaico')}.</p>`,
  },
  en: {
    slug: 'solar-panels-rome',
    nav: 'Rome',
    card: `${EN.num(K.c.ey)} kWh per kWp; main home at 50%, second home at 36%.`,
    title: 'Solar Panels Rome 2026: Output, Main and Second Homes',
    description: 'Solar panels in Rome in 2026: what a system produces in the city and province, and the payback on a main home at the 50% rate and on a second home at 36%.',
    h1: 'Solar in Rome: main home, second home and the province',
    intro: `In Rome 1 kWp produces ${EN.num(K.c.ey)} kWh a year. With 3 kWp and Lazio's average use of ${EN.num(cons)} kWh, the system pays back in ${EN.anni(a.rientro)} on the owner's main home and in ${EN.anni(b.rientro)} on a second or rented home.`,
    resume: `Rome is Italy's most populous comune and one of the sunniest in the Centre: according to PVGIS 5.3, at the coordinates of the Campidoglio a system with panels at 30° facing south produces ${EN.num(K.c.ey)} kWh per kWp a year, against a national average of about 1,400. In the province the yield ranges from ${EN.num(prov.min[1])} kWh in ${prov.min[0]} to ${EN.num(prov.max[1])} in ${prov.max[0]}. Lazio is in the Centro Sud market zone, where the GSE ritiro dedicato is worth about ${EN.num(K.ridCt, 1)} cents per exported kWh at 2026 prices. What changes the sum most in Rome, where many families own a seaside home or rent, is the deduction: ${EN.pct(P.detrazione.aliquota_prima_casa)} on the owner's main home, ${EN.pct(P.detrazione.aliquota_altri)} on a second home and for tenants. On 3 kWp at the reference cost the difference is worth ${EN.eur(a.detrazione - b.detrazione)} over ten years and lengthens payback from ${EN.anni(a.rientro)} to ${EN.anni(b.rientro)}.`,
    faqs: [
      { q: 'How much does a solar system produce in Rome?', a: `${EN.kwh(a.produzione)} a year with 3 kWp at 30° facing south, ${EN.kwh(a45.produzione)} with 4.5 kWp, according to PVGIS 5.3 at the comune's coordinates. July is the best month at about ${EN.kwh(a.mesi[6])}, December the worst at ${EN.kwh(a.mesi[11])}. Across the province the figure varies a lot between plain, hills and mountains.` },
      { q: 'Is solar worth it on a second home in Rome or at the seaside?', a: `The deduction falls to ${EN.pct(P.detrazione.aliquota_altri)}, so payback on 3 kWp moves from ${EN.anni(a.rientro)} to ${EN.anni(b.rientro)} with the same use. In a home used only in summer, use is lower: with 1,200 kWh payback rises to ${EN.anni(sc2.rientro)}, because most of the energy goes to the grid at the ritiro dedicato price.` },
      { q: 'Can a tenant in Rome deduct a solar system?', a: `Yes, a tenant who pays with the owner's consent can deduct it, but at ${EN.pct(P.detrazione.aliquota_altri)}, because the ${EN.pct(P.detrazione.aliquota_prima_casa)} rate is only for the owner or holder of a real right on the main home, according to the Agenzia delle Entrate sheet. In the calculator answer « No » to the main-home question.` },
      { q: 'How much does a solar system cost in Rome?', a: `We publish no Roman market prices, which vary from installer to installer. As a reference we use the energy community decree's maximum cost, ${EN.eur(P.costi.fv_eur_kw)} per kW excluding VAT: ${EN.eur(a.costo)} for 3 kWp and ${EN.eur(a45.costo)} for 4.5 kWp. Enter your quote's total including VAT in the calculator: payback and balance update at once.` },
    ],
    body: (h) => `
<h2>Main home or second home: same yield, two paybacks</h2>
${h.table(['System', 'Output', 'Yearly benefit', '50% deduction', 'Payback', '36% deduction', 'Payback'], KWP.map((k) => { const x = pc(k), y = sc(k); return [`${h.num(k, 1)} kWp`, `${h.num(x.produzione)} kWh`, h.eur(x.beneficio), h.eur(x.detrazione), `${h.num(x.rientro ?? 0, 1)} years`, h.eur(y.detrazione), `${h.num(y.rientro ?? 0, 1)} years`]; }), `Rome, 30° south, ${h.num(cons)} kWh use (ARERA average for Lazio, 3-4.5 kW customers), reference cost.`, ['l', 'r', 'r', 'r', 'r', 'r', 'r'])}
<p>Yield and saving do not change with the type of home: only what the State gives back does. The yearly benefit, ${h.eur(a.beneficio)} with 3 kWp, comes ${h.eur(a.risparmio)} from the bill and ${h.eur(a.ricavoRid)} from the ${h.src('gse_rid_prezzi', 'ritiro dedicato')}. On a seaside home lived in for a few months, though, use collapses and the share sold to the grid rises, so the benefit falls even with the same deduction.</p>

<h2>From the centre to the Castelli and the mountains</h2>
<p>The province of Rome has ${prov.n} comuni with an average yield of ${h.num(prov.ey)} kWh per kWp. The highest value is in ${prov.max[0]}, on the coast, the lowest in ${prov.min[0]}, in the mountains, where valleys take away morning and evening sun. ${h.src('pvgis', 'PVGIS')} accounts for each comune's real horizon: for Tivoli, Frascati or Civitavecchia type the name into the calculator and it uses their coordinates, taken from the ${h.src('geonames', 'GeoNames')} list.</p>

<h2>What to consider in Rome</h2>
<p>Many buildings in the centre are in protected areas, where rooftop panels need landscape permits: ask the installer to check before quoting. In apartment blocks the roof is a common part, so the condominium assembly must approve. The Lazio average use we apply, ${h.num(cons)} kWh, comes from ${h.src('arera_consumi', 'ARERA')} tables for resident customers with 3-4.5 kW; enter yours from the bill. The ${h.src('ade_misura', 'deduction')} rules are explained on the ${h.a('bonus-fotovoltaico', 'solar tax deduction')} page.</p>`,
  },
});
