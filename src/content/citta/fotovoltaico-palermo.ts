import { defineGuide } from '../../lib/guide-types';
import { citta } from '../../lib/citta-kit';
import { PREZZO_EVITATO_CT, costoRiferimento } from '../../lib/engine/fv';
import { IT, EN, P } from '../../lib/fmt';

/** Palermo: il surplus vale meno che altrove (zona Sicilia), quindi la batteria rende di più; confronto con Milano. */
const PA = citta('palermo'), MI = citta('milano');
const cons = PA.R.cons_alto;
const BAT = [0, 5, 10, 15];
const rows = BAT.map((b) => ({ b, x: PA.calc(4.5, cons, b) }));
const r0 = rows[0].x, r5 = rows[1].x, r10 = rows[2].x;
const m0 = MI.calc(4.5, cons), m5 = MI.calc(4.5, cons, 5);
const gapPa = PREZZO_EVITATO_CT - PA.ridCt, gapMi = PREZZO_EVITATO_CT - MI.ridCt;
const extra = (x: typeof r0) => x.beneficio - r0.beneficio;
const prov = PA.prov;
const c5 = costoRiferimento(0, 5) * (1 - P.detrazione.aliquota_prima_casa);

export default defineGuide({
  id: 'fotovoltaico-palermo',
  group: 'citta',
  order: 50,
  tool: 'accumulo',
  toolPreset: { citta: 'palermo', kwp: 4.5, bat: 5, cons },
  related: ['fotovoltaico-catania', 'fotovoltaico-con-accumulo', 'fotovoltaico-cagliari', 'ritiro-dedicato', 'fotovoltaico-milano'],
  sources: ['pvgis', 'gse_rid_prezzi', 'arera_q4', 'arera_consumi', 'dl34_119'],
  it: {
    slug: 'fotovoltaico-palermo',
    nav: 'Palermo',
    card: `${IT.num(PA.c.ey)} kWh per kWp; il surplus vale ${IT.num(PA.ridCt, 1)} c€, quindi la batteria rende di più.`,
    title: 'Fotovoltaico Palermo 2026: resa, batteria e surplus pagato',
    description: 'Fotovoltaico Palermo 2026: quanto produce un impianto, quanto vale il surplus nella zona Sicilia e quanto aggiunge una batteria da 5, 10 o 15 kWh al risparmio.',
    h1: 'Fotovoltaico a Palermo: perché qui la batteria conta di più',
    intro: `A Palermo 4,5 kWp producono ${IT.kwh(r0.produzione)} l'anno. Il kWh immesso vale ${IT.num(PA.ridCt, 1)} centesimi, il più basso fra le zone italiane, mentre quello usato in casa ne vale ${IT.num(PREZZO_EVITATO_CT, 1)}: una batteria da 5 kWh aggiunge ${IT.eur(extra(r5))} l'anno al beneficio.`,
    resume: `Palermo ha uno dei soli più generosi d'Italia: secondo PVGIS 5.3 un impianto con moduli a 30° verso sud produce ${IT.num(PA.c.ey)} kWh per kWp l'anno alle coordinate del comune. La Sicilia è però una zona di mercato a sé, e nel 2026 il ritiro dedicato del GSE vi ha pagato il prezzo più basso d'Italia per l'energia immessa nelle ore di sole: circa ${IT.num(PA.ridCt, 1)} centesimi per kWh, contro ${IT.num(MI.ridCt, 1)} al Nord. Ogni kWh che resta in casa invece di andare in rete vale la differenza con il prezzo evitato in bolletta, circa ${IT.num(gapPa, 1)} centesimi a Palermo e ${IT.num(gapMi, 1)} a Milano. Per questo una batteria, che sposta alla sera l'energia prodotta a mezzogiorno, rende un po' di più in Sicilia che altrove. Con 4,5 kWp e il consumo medio siciliano di ${IT.num(cons)} kWh, 5 kWh di accumulo portano la quota usata in casa dal ${IT.pct(r0.quota)} al ${IT.pct(r5.quota)} e il beneficio annuo da ${IT.eur(r0.beneficio)} a ${IT.eur(r5.beneficio)}. Al costo di riferimento la batteria costa ${IT.eur(c5)} dopo la detrazione: si ripaga da sola in circa ${IT.num(c5 / extra(r5), 1)} anni, se dura abbastanza.`,
    faqs: [
      { q: 'Quanto produce un impianto fotovoltaico a Palermo?', a: `${IT.kwh(r0.produzione)} l'anno con 4,5 kWp a 30° verso sud e ${IT.kwh(PA.c.ey * 3)} con 3 kWp, secondo PVGIS 5.3. In provincia si va da ${IT.num(prov.min[1])} kWh per kWp a ${prov.min[0]}, sulle Madonie, a ${IT.num(prov.max[1])} a ${prov.max[0]}. Anche a dicembre 4,5 kWp producono circa ${IT.kwh(r0.mesi[11])}.` },
      { q: 'A Palermo conviene la batteria?', a: `Più che al Nord, perché il surplus è pagato meno. Una batteria da 5 kWh aggiunge ${IT.eur(extra(r5))} l'anno a Palermo e ${IT.eur(m5.beneficio - m0.beneficio)} a Milano con lo stesso impianto e consumo. Al costo di riferimento, ${IT.eur(P.costi.accumulo_eur_kwh)} per kWh, se ne recupera il costo netto in circa ${IT.num(c5 / extra(r5), 1)} anni; con un preventivo più basso prima.` },
      { q: 'Meglio una batteria da 5 o da 10 kWh a Palermo?', a: `Con 4,5 kWp e ${IT.num(cons)} kWh di consumo, 10 kWh aggiungono ${IT.eur(extra(r10))} l'anno contro ${IT.eur(extra(r5))} di 5 kWh: il secondo blocco da 5 kWh rende meno del primo, perché nelle sere d'inverno la batteria grande non si riempie. Conviene solo se la casa consuma molto la sera o se il prezzo per kWh è basso.` },
      { q: 'Il prezzo del surplus in Sicilia resterà basso?', a: `Non lo sappiamo: dipende dal mercato elettrico e dalla quantità di impianti solari nella zona. Il GSE pubblica i prezzi ogni mese e il simulatore usa la media dei mesi già pubblicati del 2026. Se il mercato scendesse ancora, sotto i ${IT.num(P.rid.pmg_eur_mwh / 10, 2)} centesimi scatterebbe il prezzo minimo garantito fissato da ARERA.` },
    ],
    body: (h) => `
<h2>Batteria e beneficio a Palermo</h2>
${h.table(['Batteria', 'Usata in casa', 'Copertura del consumo', 'Beneficio annuo', 'In più rispetto a 0 kWh', 'Rientro totale'], rows.map(({ b, x }) => [`${h.num(b)} kWh`, h.pct(x.quota), h.pct(x.copertura), h.eur(x.beneficio), h.eur(extra(x)), `${h.num(x.rientro ?? 0, 1)} anni`]), `4,5 kWp a 30° sud, consumo ${h.num(cons)} kWh, costo di riferimento ${h.eur(P.costi.fv_eur_kw)}/kW e ${h.eur(P.costi.accumulo_eur_kwh)}/kWh, detrazione ${h.pct(P.detrazione.aliquota_prima_casa)}.`, ['l', 'r', 'r', 'r', 'r', 'r'])}
<p>Il rientro totale si allunga con la batteria perché il ${h.src('dl34_119', 'riferimento di spesa')} dell'accumulo è alto rispetto al guadagno annuo. Se il vostro preventivo prevede la batteria a un prezzo molto più basso, scrivetelo nel campo del costo e il risultato cambia. La quota autoconsumata viene dai profili orari ${h.src('arera_consumi', 'ARERA')} della Sicilia combinati con la produzione oraria PVGIS.</p>

<h2>Il prezzo della zona Sicilia</h2>
<p>La Sicilia ha molti impianti solari ed eolici e collegamenti limitati con il continente: nelle ore centrali l'offerta è abbondante e il prezzo scende. Nei ${h.src('gse_rid_prezzi', 'prezzi mensili del GSE')} questo si vede soprattutto in primavera. Il prezzo evitato in bolletta, invece, è lo stesso in tutta Italia, perché le ${h.src('arera_q4', 'condizioni ARERA')} non cambiano da regione a regione. È questa forbice che premia l'autoconsumo e quindi la batteria.</p>

<h2>Spostare i consumi prima di comprare la batteria</h2>
<p>Una lavatrice, una lavastoviglie o uno scaldabagno elettrico fatti partire con un timer nelle ore di sole spostano energia in casa senza costo. Il condizionatore estivo lavora già nelle ore di produzione. Solo dopo aver spostato quello che si può conviene dimensionare la batteria sul consumo serale che resta. Per i dettagli tecnici c'è la pagina ${h.a('fotovoltaico-con-accumulo', 'fotovoltaico con accumulo')}.</p>`,
  },
  en: {
    slug: 'solar-panels-palermo',
    nav: 'Palermo',
    card: `${EN.num(PA.c.ey)} kWh per kWp; the surplus earns ${EN.num(PA.ridCt, 1)} c€, so a battery pays more.`,
    title: 'Solar Panels Palermo 2026: Output, Battery and Sicily Price',
    description: 'Solar panels in Palermo in 2026: what a system produces, what the surplus earns in the Sicily zone and how much a 5, 10 or 15 kWh battery adds to the saving.',
    h1: 'Solar in Palermo: why a battery matters more here',
    intro: `In Palermo 4.5 kWp produce ${EN.kwh(r0.produzione)} a year. An exported kWh is worth ${EN.num(PA.ridCt, 1)} cents, the lowest of Italy's zones, while one used at home is worth ${EN.num(PREZZO_EVITATO_CT, 1)}: a 5 kWh battery adds ${EN.eur(extra(r5))} a year to the benefit.`,
    resume: `Palermo has some of the most generous sunshine in Italy: according to PVGIS 5.3 a system with panels at 30° facing south produces ${EN.num(PA.c.ey)} kWh per kWp a year at the comune's coordinates. Sicily, however, is a market zone of its own, and in 2026 the GSE ritiro dedicato paid there the lowest price in Italy for energy exported in sunny hours: about ${EN.num(PA.ridCt, 1)} cents per kWh, against ${EN.num(MI.ridCt, 1)} in the North. Each kWh that stays at home instead of going to the grid is worth the gap with the avoided bill price, about ${EN.num(gapPa, 1)} cents in Palermo and ${EN.num(gapMi, 1)} in Milan. So a battery, which moves midday output to the evening, pays a little more in Sicily than elsewhere. With 4.5 kWp and Sicily's average use of ${EN.num(cons)} kWh, 5 kWh of storage raise the share used at home from ${EN.pct(r0.quota)} to ${EN.pct(r5.quota)} and the yearly benefit from ${EN.eur(r0.beneficio)} to ${EN.eur(r5.beneficio)}. At the reference cost the battery costs ${EN.eur(c5)} after the deduction: it pays for itself in about ${EN.num(c5 / extra(r5), 1)} years, if it lasts long enough.`,
    faqs: [
      { q: 'How much does a solar system produce in Palermo?', a: `${EN.kwh(r0.produzione)} a year with 4.5 kWp at 30° facing south and ${EN.kwh(PA.c.ey * 3)} with 3 kWp, according to PVGIS 5.3. Across the province the range is from ${EN.num(prov.min[1])} kWh per kWp in ${prov.min[0]}, in the Madonie, to ${EN.num(prov.max[1])} in ${prov.max[0]}. Even in December 4.5 kWp produce about ${EN.kwh(r0.mesi[11])}.` },
      { q: 'Is a solar battery worth it in Palermo?', a: `More than in the North, because the surplus is paid less. A 5 kWh battery adds ${EN.eur(extra(r5))} a year in Palermo and ${EN.eur(m5.beneficio - m0.beneficio)} in Milan with the same system and use. At the reference cost, ${EN.eur(P.costi.accumulo_eur_kwh)} per kWh, its net cost is recovered in about ${EN.num(c5 / extra(r5), 1)} years; sooner with a lower quote.` },
      { q: 'A 5 or a 10 kWh battery in Palermo?', a: `With 4.5 kWp and ${EN.num(cons)} kWh of use, 10 kWh add ${EN.eur(extra(r10))} a year against ${EN.eur(extra(r5))} for 5 kWh: the second 5 kWh block earns less than the first, because on winter evenings a large battery does not fill. It only pays if the home uses a lot in the evening or the price per kWh is low.` },
      { q: 'Will the surplus price in Sicily stay low?', a: `We do not know: it depends on the power market and on how many solar plants the zone has. The GSE publishes prices every month and the calculator uses the average of the 2026 months already published. If the market fell further, below ${EN.num(P.rid.pmg_eur_mwh / 10, 2)} cents the guaranteed minimum price set by ARERA would apply.` },
    ],
    body: (h) => `
<h2>Battery and benefit in Palermo</h2>
${h.table(['Battery', 'Used at home', 'Share of use covered', 'Yearly benefit', 'Extra over 0 kWh', 'Total payback'], rows.map(({ b, x }) => [`${h.num(b)} kWh`, h.pct(x.quota), h.pct(x.copertura), h.eur(x.beneficio), h.eur(extra(x)), `${h.num(x.rientro ?? 0, 1)} years`]), `4.5 kWp at 30° south, ${h.num(cons)} kWh use, reference cost ${h.eur(P.costi.fv_eur_kw)}/kW and ${h.eur(P.costi.accumulo_eur_kwh)}/kWh, ${h.pct(P.detrazione.aliquota_prima_casa)} deduction.`, ['l', 'r', 'r', 'r', 'r', 'r'])}
<p>Total payback lengthens with a battery because the storage ${h.src('dl34_119', 'spending reference')} is high compared with the yearly gain. If your quote includes a battery at a much lower price, enter it in the cost field and the result changes. The self-consumed share comes from Sicily's ${h.src('arera_consumi', 'ARERA')} hourly profiles combined with PVGIS hourly output.</p>

<h2>The Sicily zone price</h2>
<p>Sicily has many solar and wind plants and limited links with the mainland: in the middle hours supply is plentiful and the price drops. In the ${h.src('gse_rid_prezzi', 'GSE monthly prices')} this shows mostly in spring. The avoided bill price, by contrast, is the same across Italy, because the ${h.src('arera_q4', 'ARERA conditions')} do not change by region. It is this gap that rewards self-consumption, and therefore the battery.</p>

<h2>Shift use before buying a battery</h2>
<p>A washing machine, dishwasher or electric water heater started on a timer in sunny hours moves energy into the home at no cost. Summer air conditioning already runs in production hours. Only after shifting what you can is it worth sizing a battery on the evening use that remains. Technical details are on the ${h.a('fotovoltaico-con-accumulo', 'solar with battery storage')} page.</p>`,
  },
});
