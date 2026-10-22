import { defineGuide } from '../../lib/guide-types';
import { citta } from '../../lib/citta-kit';
import { prezzoZonaleFv } from '../../lib/engine/fv';
import { IT, EN, P, RID, REGIONI } from '../../lib/fmt';

/** Cagliari: zona di mercato Sardegna; quanto renderebbe lo stesso surplus con il prezzo di ogni zona; provincia piccola. */
const C = citta('cagliari');
const cons = C.R.cons_alto;
const r = C.calc(4.5, cons), rb = C.calc(4.5, cons, 5);
const ZONE = Object.keys(RID.zone) as (keyof typeof RID.zone)[];
const zv = ZONE.map((z) => ({ z, v: Math.max(prezzoZonaleFv(z, C.R.mesi), P.rid.pmg_eur_mwh) / 1000 })).sort((a, b) => b.v - a.v);
const posSa = zv.findIndex((x) => x.z === 'Sardegna') + 1;
const prov = C.prov;
const nord = zv.find((x) => x.z === 'Nord')!.v, sic = zv.find((x) => x.z === 'Sicilia')!.v;

export default defineGuide({
  id: 'fotovoltaico-cagliari',
  group: 'citta',
  order: 120,
  tool: 'rid',
  toolPreset: { citta: 'cagliari', kwp: 4.5, cons },
  related: ['fotovoltaico-catania', 'fotovoltaico-palermo', 'ritiro-dedicato', 'fotovoltaico-con-accumulo', 'comunita-energetiche'],
  sources: ['pvgis', 'gse_rid_prezzi', 'arera_pmg', 'arera_consumi', 'geonames'],
  it: {
    slug: 'fotovoltaico-cagliari',
    nav: 'Cagliari',
    card: `${IT.num(C.c.ey)} kWh per kWp; il surplus nella zona Sardegna vale ${IT.num(C.ridCt, 1)} c€.`,
    title: 'Fotovoltaico Cagliari 2026: resa e prezzo in zona Sardegna',
    description: 'Fotovoltaico Cagliari 2026: quanto produce un impianto, quanto paga il ritiro dedicato nella zona Sardegna rispetto alle altre zone e il valore della batteria.',
    h1: 'Fotovoltaico a Cagliari: tanto sole e un mercato a sé',
    intro: `A Cagliari 4,5 kWp producono ${IT.kwh(r.produzione)} l'anno e immettono in rete ${IT.kwh(r.immessa)}. Nella zona Sardegna quel surplus vale circa ${IT.num(C.ridCt, 1)} centesimi per kWh e rende ${IT.eur(r.ricavoRid)} l'anno.`,
    resume: `Cagliari ha una delle rese fotovoltaiche più alte d'Italia: secondo PVGIS 5.3 un impianto con moduli a 30° verso sud produce ${IT.num(C.c.ey)} kWh per kWp l'anno alle coordinate del comune, quasi come Catania e il ${IT.pct(C.c.ey / 1408 - 1)} sopra la media nazionale. La Sardegna, però, è collegata al continente da pochi cavi e forma una zona di mercato elettrico a sé, con prezzi propri. Nel 2026 il ritiro dedicato del GSE, pesato sulle ore e sui mesi di produzione solare della Sardegna, ha pagato circa ${IT.num(C.ridCt, 1)} centesimi per kWh: ${posSa}° fra le sette zone, meno del Nord con ${IT.num(nord * 100, 1)} e più della Sicilia con ${IT.num(sic * 100, 1)}. Con il consumo medio sardo, ${IT.num(cons)} kWh secondo ARERA, il più alto fra le regioni, un impianto da 4,5 kWp usa in casa il ${IT.pct(r.quota)} della produzione, risparmia ${IT.eur(r.risparmio)} in bolletta e vende il resto per ${IT.eur(r.ricavoRid)}. Il rientro al costo di riferimento è di ${IT.anni(r.rientro)}. La provincia, con ${prov.n} comuni, è piccola e soleggiata: da ${IT.num(prov.min[1])} kWh a ${prov.min[0]} a ${IT.num(prov.max[1])} a ${prov.max[0]}.`,
    faqs: [
      { q: 'Quanto produce un impianto fotovoltaico a Cagliari?', a: `${IT.kwh(r.produzione)} l'anno con 4,5 kWp e ${IT.kwh(C.c.ey * 3)} con 3 kWp, a 30° verso sud secondo PVGIS 5.3. A dicembre 4,5 kWp danno circa ${IT.kwh(r.mesi[11])}, a luglio ${IT.kwh(r.mesi[6])}. Sono stime medie di lungo periodo, senza ombre locali.` },
      { q: 'Quanto paga il ritiro dedicato in Sardegna?', a: `Con i prezzi GSE del 2026, pesati sulla produzione solare, circa ${IT.num(C.ridCt, 1)} centesimi per kWh immesso. Su 4,5 kWp a Cagliari sono ${IT.eur(r.ricavoRid)} l'anno. Il prezzo della zona Sardegna segue un mercato con pochi collegamenti, quindi può cambiare più che altrove da un mese all'altro. Sotto i ${IT.num(P.rid.pmg_eur_mwh / 10, 2)} centesimi scatta il prezzo minimo garantito.` },
      { q: 'In Sardegna conviene la batteria?', a: `I consumi sardi sono i più alti d'Italia nella media ARERA, quindi la batteria ha più energia serale da coprire. Con 4,5 kWp e ${IT.num(cons)} kWh, 5 kWh di accumulo portano la quota usata in casa dal ${IT.pct(r.quota)} al ${IT.pct(rb.quota)} e aggiungono ${IT.eur(rb.beneficio - r.beneficio)} l'anno. Al costo di riferimento il rientro dell'insieme passa a ${IT.anni(rb.rientro)}.` },
      { q: 'Il surplus della Sardegna vale meno che sul continente?', a: `Dipende dalla zona di confronto. Nel 2026 il kWh immesso è valso in Sardegna circa ${IT.num(C.ridCt, 1)} centesimi, meno del Nord con ${IT.num(nord * 100, 1)} ma più della Sicilia con ${IT.num(sic * 100, 1)}. Per un impianto domestico la differenza vale poche decine di euro l'anno. Il simulatore usa sempre la media dei mesi già pubblicati dal GSE.` },
    ],
    body: (h) => `
<h2>Lo stesso surplus nelle sette zone</h2>
${h.table(['Zona', 'Valore del kWh immesso', 'Ricavo per 4,5 kWp a Cagliari'], zv.map(({ z, v }) => [z === 'Sardegna' ? `<strong>${z}</strong>` : z, `${h.num(v * 100, 1)} c€`, h.eur(v * r.immessa - r.fee)]), `Media dei prezzi GSE del 2026 per fascia, pesata sui mesi di produzione della Sardegna, con il minimo garantito. Energia immessa ${h.num(r.immessa)} kWh, corrispettivo GSE sottratto.`, ['l', 'r', 'r'])}
<p>La tabella è un esercizio: un impianto a Cagliari riceve sempre il prezzo della zona Sardegna. Serve a capire quanto pesa il mercato locale sul risultato. Fra la zona migliore e la peggiore la differenza per un impianto domestico è di qualche decina di euro l'anno, molto meno della differenza fra un tetto a sud e uno a nord. I prezzi vengono dalle ${h.src('gse_rid_prezzi', 'tabelle mensili del GSE')}, il minimo garantito dalla ${h.src('arera_pmg', 'delibera ARERA')}.</p>

<h2>Consumi sardi e autoconsumo</h2>
<p>Secondo le tabelle ${h.src('arera_consumi', 'ARERA')} un cliente residente sardo con 3-4,5 kW consuma in media ${h.num(cons)} kWh l'anno, il valore regionale più alto. Nell'isola la rete del gas è poco diffusa, quindi molte case usano l'elettricità per l'acqua calda e la cucina, e i condizionatori lavorano a lungo d'estate. Un consumo alto alza la quota di produzione usata in casa, che vale il prezzo pieno della bolletta: è il motivo per cui il fotovoltaico a Cagliari rende bene anche con un surplus pagato nella media.</p>

<h2>La provincia di Cagliari</h2>
<p>Dopo la riforma delle province sarde la Città metropolitana di Cagliari conta ${prov.n} comuni, tutti con una resa sopra i 1 500 kWh per kWp. ${prov.max[0]} è il più soleggiato, ${prov.min[0]}, ai piedi dei monti dei Sette Fratelli, il meno. Per Quartu, Selargius o Assemini scrivete il nome nel simulatore: le coordinate vengono dall'elenco ${h.src('geonames', 'GeoNames')} e la resa da ${h.src('pvgis', 'PVGIS 5.3')}.</p>`,
  },
  en: {
    slug: 'solar-panels-cagliari',
    nav: 'Cagliari',
    card: `${EN.num(C.c.ey)} kWh per kWp; the surplus in the Sardinia zone earns ${EN.num(C.ridCt, 1)} c€.`,
    title: 'Solar Panels Cagliari 2026: Output and the Sardinia Price',
    description: 'Solar panels in Cagliari 2026: what a system produces, what the ritiro dedicato pays in the Sardinia zone against the other zones and what a battery is worth.',
    h1: 'Solar in Cagliari: plenty of sun and a market of its own',
    intro: `In Cagliari 4.5 kWp produce ${EN.kwh(r.produzione)} a year and export ${EN.kwh(r.immessa)}. In the Sardinia zone that surplus is worth about ${EN.num(C.ridCt, 1)} cents per kWh and earns ${EN.eur(r.ricavoRid)} a year.`,
    resume: `Cagliari has one of the highest solar yields in Italy: according to PVGIS 5.3 a system with panels at 30° facing south produces ${EN.num(C.c.ey)} kWh per kWp a year at the comune's coordinates, almost as much as Catania and ${EN.pct(C.c.ey / 1408 - 1)} above the national average. Sardinia, however, is linked to the mainland by only a few cables and forms a power market zone of its own, with its own prices. In 2026 the GSE ritiro dedicato, weighted on Sardinia's solar production hours and months, paid about ${EN.num(C.ridCt, 1)} cents per kWh: number ${posSa} of the seven zones, less than the North at ${EN.num(nord * 100, 1)} and more than Sicily at ${EN.num(sic * 100, 1)}. With Sardinia's average use, ${EN.num(cons)} kWh according to ARERA, the highest of any region, a 4.5 kWp system uses ${EN.pct(r.quota)} of its output at home, saves ${EN.eur(r.risparmio)} on the bill and sells the rest for ${EN.eur(r.ricavoRid)}. Payback at the reference cost is ${EN.anni(r.rientro)}. The province, with ${prov.n} comuni, is small and sunny: from ${EN.num(prov.min[1])} kWh in ${prov.min[0]} to ${EN.num(prov.max[1])} in ${prov.max[0]}.`,
    faqs: [
      { q: 'How much does a solar system produce in Cagliari?', a: `${EN.kwh(r.produzione)} a year with 4.5 kWp and ${EN.kwh(C.c.ey * 3)} with 3 kWp, at 30° facing south according to PVGIS 5.3. In December 4.5 kWp give about ${EN.kwh(r.mesi[11])}, in July ${EN.kwh(r.mesi[6])}. These are long-term average estimates, without local shade.` },
      { q: 'What does the ritiro dedicato pay in Sardinia?', a: `At 2026 GSE prices, weighted on solar output, about ${EN.num(C.ridCt, 1)} cents per exported kWh. On 4.5 kWp in Cagliari that is ${EN.eur(r.ricavoRid)} a year. The Sardinia zone price follows a market with few links, so it can change more than elsewhere from month to month. Below ${EN.num(P.rid.pmg_eur_mwh / 10, 2)} cents the guaranteed minimum price applies.` },
      { q: 'Is a battery worth it in Sardinia?', a: `Sardinian use is the highest in Italy in the ARERA averages, so a battery has more evening energy to cover. With 4.5 kWp and ${EN.num(cons)} kWh, 5 kWh of storage raise the share used at home from ${EN.pct(r.quota)} to ${EN.pct(rb.quota)} and add ${EN.eur(rb.beneficio - r.beneficio)} a year. At the reference cost payback for the whole moves to ${EN.anni(rb.rientro)}.` },
      { q: 'Is Sardinia\'s surplus worth less than on the mainland?', a: `It depends on the comparison zone. In 2026 an exported kWh was worth about ${EN.num(C.ridCt, 1)} cents in Sardinia, less than the North at ${EN.num(nord * 100, 1)} but more than Sicily at ${EN.num(sic * 100, 1)}. For a home system the difference is a few tens of euros a year. The calculator always uses the average of the months already published by the GSE.` },
    ],
    body: (h) => `
<h2>The same surplus in the seven zones</h2>
${h.table(['Zone', 'Value of an exported kWh', 'Income for 4.5 kWp in Cagliari'], zv.map(({ z, v }) => [z === 'Sardegna' ? `<strong>${z}</strong>` : z, `${h.num(v * 100, 1)} c€`, h.eur(v * r.immessa - r.fee)]), `Average of 2026 GSE prices by band, weighted on Sardinia's production months, with the guaranteed minimum. Energy exported ${h.num(r.immessa)} kWh, GSE fee subtracted.`, ['l', 'r', 'r'])}
<p>The table is an exercise: a system in Cagliari always receives the Sardinia zone price. It shows how much the local market weighs on the result. Between the best and worst zone the difference for a home system is a few tens of euros a year, far less than the gap between a south and a north roof. Prices come from the ${h.src('gse_rid_prezzi', 'GSE monthly tables')}, the guaranteed minimum from the ${h.src('arera_pmg', 'ARERA resolution')}.</p>

<h2>Sardinian use and self-consumption</h2>
<p>According to the ${h.src('arera_consumi', 'ARERA')} tables a Sardinian resident customer with 3-4.5 kW uses on average ${h.num(cons)} kWh a year, the highest regional value. On the island the gas network is not widespread, so many homes use electricity for hot water and cooking, and air conditioners run for long hours in summer. High use raises the share of output used at home, worth the full bill price: that is why solar in Cagliari pays well even with an average surplus price.</p>

<h2>The province of Cagliari</h2>
<p>After the reform of the Sardinian provinces the Metropolitan City of Cagliari has ${prov.n} comuni, all with a yield above 1,500 kWh per kWp. ${prov.max[0]} is the sunniest, ${prov.min[0]}, at the foot of the Sette Fratelli mountains, the least. For Quartu, Selargius or Assemini type the name into the calculator: coordinates come from the ${h.src('geonames', 'GeoNames')} list and yield from ${h.src('pvgis', 'PVGIS 5.3')}.</p>`,
  },
});
