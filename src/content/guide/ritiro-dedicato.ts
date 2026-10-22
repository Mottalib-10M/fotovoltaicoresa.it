import { defineGuide } from '../../lib/guide-types';
import { calcola, feeRid, prezzoZonaleFv } from '../../lib/engine/fv';
import { luogoCitta } from '../../lib/engine/dati';
import { P, IT, EN, RID, REGIONI } from '../../lib/fmt';

/** Ritiro dedicato 2026: prezzi GSE per zona e fascia (gennaio-ultimo mese pubblicato), PMG ARERA, corrispettivo. */
const W = P.rid.pesi_fasce;
const ZONE = Object.keys(RID.zone) as (keyof typeof RID.zone)[];
const MESI_IT = ['gen', 'feb', 'mar', 'apr', 'mag', 'giu', 'lug', 'ago', 'set', 'ott', 'nov', 'dic'].slice(0, RID.mesi_disponibili);
const MESI_EN = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'].slice(0, RID.mesi_disponibili);
const mese = (z: keyof typeof RID.zone, m: number) => W.F1 * RID.zone[z].F1[m] + W.F2 * RID.zone[z].F2[m] + W.F3 * RID.zone[z].F3[m];
const flat = Array(12).fill(1);
const media = (z: keyof typeof RID.zone) => prezzoZonaleFv(z, REGIONI.find((r) => r.zona === z)?.mesi ?? flat);
const minMese = Math.min(...ZONE.flatMap((z) => MESI_IT.map((_, m) => mese(z, m))));
const roma = calcola({ luogo: luogoCitta('roma'), kwp: 4.5, tilt: 30, az: 0, consumo: 3000, batteria: 0, primaCasa: true });
const milano = calcola({ luogo: luogoCitta('milano'), kwp: 4.5, tilt: 30, az: 0, consumo: 3000, batteria: 0, primaCasa: true });
const nord = media('Nord'), sic = media('Sicilia');
/** Mese e zona con il prezzo pesato più basso dei mesi pubblicati. */
const peggio = ZONE.flatMap((z) => MESI_IT.map((_, m) => ({ z, m, v: mese(z, m) }))).sort((a, b) => a.v - b.v)[0];
const ultimoEn = (() => { const [m, y] = RID.ultimo_mese.split(' '); const i = ['gennaio', 'febbraio', 'marzo', 'aprile', 'maggio', 'giugno', 'luglio', 'agosto', 'settembre', 'ottobre', 'novembre', 'dicembre'].indexOf(m); return `${['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'][i]} ${y}`; })();
const MESE_IT = ['gennaio', 'febbraio', 'marzo', 'aprile', 'maggio', 'giugno', 'luglio', 'agosto'], MESE_EN = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August'];

export default defineGuide({
  id: 'ritiro-dedicato',
  group: 'incentivi',
  order: 20,
  tool: 'rid',
  toolPreset: { kwp: 4.5, cons: 3000 },
  related: ['scambio-sul-posto', 'comunita-energetiche', 'incentivi-fotovoltaico', 'fotovoltaico-con-accumulo', 'dimensionamento-impianto-fotovoltaico'],
  sources: ['gse_rid', 'gse_rid_prezzi', 'gse_rid_dtf', 'arera_pmg'],
  it: {
    slug: 'ritiro-dedicato',
    nav: 'Ritiro dedicato',
    card: 'Quanto paga il GSE per l\'energia immessa nel 2026, zona per zona, con il prezzo minimo garantito.',
    title: 'Ritiro dedicato 2026: quanto paga il GSE per kWh immesso',
    description: 'Ritiro dedicato 2026: prezzi GSE per zona e mese nel 2026, prezzo minimo garantito di 47,5 €/MWh, corrispettivo annuo e ricavo del vostro impianto in euro.',
    h1: 'Ritiro dedicato 2026: quanto vale l\'energia che mandate in rete',
    intro: `Con i prezzi GSE da gennaio a ${RID.ultimo_mese}, un kWh immesso vale in media ${IT.num(nord / 10, 1)} centesimi al Nord e ${IT.num(sic / 10, 1)} in Sicilia; un impianto da 4,5 kWp a Roma incassa circa ${IT.eur(roma.ricavoRid)} l'anno.`,
    resume: `Il ritiro dedicato è il contratto con cui il GSE compra l'energia che il vostro impianto immette in rete e la rivende sul mercato. Dopo la chiusura dello scambio sul posto è la strada normale per chi installa un impianto domestico nel 2026. Il GSE paga per ogni ora il prezzo zonale del mercato elettrico; per i piccoli impianti esiste in alternativa il prezzo minimo garantito, che ARERA ha fissato a ${IT.num(P.rid.pmg_eur_mwh, 1)} euro per MWh per il 2026 e che conviene solo quando il mercato scende sotto quel livello. Nei primi ${RID.mesi_disponibili} mesi del 2026 il prezzo medio mensile pesato sulle fasce di produzione solare non è mai sceso sotto ${IT.num(minMese, 1)} euro per MWh in nessuna zona, quindi è rimasto sopra il minimo. Il GSE trattiene un corrispettivo di ${IT.num(P.rid.fee_eur_kw[0].eur, 2)} euro per kW l'anno oltre i ${P.rid.fee_esente_fino_kw} kW. Per un impianto da 4,5 kWp con 3 000 kWh di consumo il ricavo è circa ${IT.eur(roma.ricavoRid)} a Roma e ${IT.eur(milano.ricavoRid)} a Milano.`,
    faqs: [
      { q: 'Quanto paga il ritiro dedicato nel 2026?', a: `Il prezzo zonale orario del mercato, che nei primi ${RID.mesi_disponibili} mesi del 2026, pesato sulle ore di sole, vale in media ${IT.num(nord / 10, 1)} centesimi per kWh al Nord e ${IT.num(sic / 10, 1)} in Sicilia. Le stime per le altre zone sono nella tabella. Il GSE pubblica i prezzi del mese entro il 22 del mese successivo; il dato si aggiorna con la pubblicazione.` },
      { q: 'Conviene scegliere il prezzo minimo garantito?', a: `Solo se il mercato scende sotto ${IT.num(P.rid.pmg_eur_mwh, 1)} euro per MWh, cioè ${IT.num(P.rid.pmg_eur_mwh / 10, 2)} centesimi per kWh. Nel 2026 i prezzi pesati sulle ore di sole sono stati sempre più alti in tutte le zone. Il prezzo minimo riguarda i primi ${IT.num(P.rid.pmg_kwh_max / 1000)} MWh l'anno, quindi un impianto domestico è sempre coperto.` },
      { q: 'Quanto costa il ritiro dedicato?', a: `Fino a ${P.rid.fee_esente_fino_kw} kW nulla. Oltre, ${IT.num(P.rid.fee_eur_kw[0].eur, 2)} euro per kW l'anno fino a 20 kW: ${IT.eur(feeRid(4.5), 2)} per 4,5 kWp e ${IT.eur(feeRid(6), 2)} per 6 kWp. Il corrispettivo copre i costi amministrativi del GSE e ha un massimo di ${IT.eur(P.rid.fee_max_eur)} l'anno. Il simulatore lo sottrae dal ricavo.` },
    ],
    body: (h) => `
<h2>Prezzo medio mensile per zona, 2026</h2>
${h.table(['Zona', ...MESI_IT], ZONE.map((z) => [z, ...MESI_IT.map((_, m) => h.num(mese(z, m) / 10, 1))]), `Centesimi per kWh. Media dei prezzi GSE per fascia F1, F2 e F3 pesata con le quote della produzione solare (${h.pct(W.F1)}, ${h.pct(W.F2)}, ${h.pct(W.F3)}). Ultimo mese pubblicato: ${RID.ultimo_mese}.`, ['l', ...MESI_IT.map(() => 'r' as const)])}
<p>Il ${h.src('gse_rid_prezzi', 'GSE pubblica')} i prezzi medi mensili per fascia oraria e zona di mercato; la regione di casa vostra decide la zona. Noi li pesiamo con le ore in cui un impianto solare produce davvero, calcolate da PVGIS: per questo il prezzo di una zona può essere più basso del prezzo medio del mercato, perché a mezzogiorno l'offerta di energia solare abbassa il prezzo. Il valore più basso del 2026 finora è ${h.num(peggio.v / 10, 1)} centesimi, in zona ${peggio.z} a ${MESE_IT[peggio.m]}.</p>

<h2>Come funziona il contratto</h2>
<p>La domanda si presenta sul portale del ${h.src('gse_rid', 'GSE')} dopo l'allacciamento. Le ${h.src('gse_rid_dtf', 'regole tecniche')} spiegano come si applicano il prezzo zonale orario e il ${h.src('arera_pmg', 'prezzo minimo garantito ARERA')}. L'energia usata in casa non passa dal contratto: si risparmia direttamente in bolletta, a un valore più che doppio. Il ritiro dedicato è compatibile con la ${h.a('comunita-energetiche', 'comunità energetica')}, che aggiunge una tariffa premio sull'energia condivisa.</p>

<h2>Il valore usato nel simulatore</h2>
<p>Il simulatore prende la media dei mesi pubblicati, pesata sulla produzione mensile della vostra regione, e la confronta con il prezzo minimo: usa il più alto. Potete scrivere un valore diverso nel campo « Valore energia immessa » per provare scenari con prezzi più bassi, per esempio ${h.num(P.rid.pmg_eur_mwh / 10, 2)} centesimi se il mercato scendesse al minimo garantito.</p>`,
  },
  en: {
    slug: 'ritiro-dedicato-solar-export',
    nav: 'Ritiro dedicato (export)',
    card: 'What the GSE pays for exported energy in 2026, zone by zone, with the guaranteed minimum price.',
    title: 'Ritiro Dedicato 2026: What the GSE Pays per Exported kWh',
    description: 'Ritiro dedicato 2026: GSE export prices by zone and month, the €47.5/MWh guaranteed minimum price, the yearly fee and what your own system earns in euros.',
    h1: 'Ritiro dedicato 2026: what the energy you export is worth',
    intro: `With GSE prices from January to ${ultimoEn}, an exported kWh is worth on average ${EN.num(nord / 10, 1)} cents in the North and ${EN.num(sic / 10, 1)} in Sicily; a 4.5 kWp system in Rome earns about ${EN.eur(roma.ricavoRid)} a year.`,
    resume: `The ritiro dedicato is the contract under which the GSE, Italy's energy services operator, buys the energy your system sends to the grid and resells it on the market. Since net metering closed it is the normal route for anyone installing a home system in 2026. The GSE pays the hourly zonal market price for each hour; for small systems there is also the guaranteed minimum price, which ARERA set at ${EN.num(P.rid.pmg_eur_mwh, 1)} euros per MWh for 2026 and which only helps when the market falls below that level. In the first ${RID.mesi_disponibili} months of 2026 the monthly average price weighted on solar production bands never fell below ${EN.num(minMese, 1)} euros per MWh in any zone, so it stayed above the minimum. The GSE charges a fee of ${EN.num(P.rid.fee_eur_kw[0].eur, 2)} euros per kW a year above ${P.rid.fee_esente_fino_kw} kW. For a 4.5 kWp system with 3,000 kWh of use the income is about ${EN.eur(roma.ricavoRid)} in Rome and ${EN.eur(milano.ricavoRid)} in Milan.`,
    faqs: [
      { q: 'How much does the ritiro dedicato pay in 2026?', a: `The hourly zonal market price, which in the first ${RID.mesi_disponibili} months of 2026, weighted on sunny hours, averaged ${EN.num(nord / 10, 1)} cents per kWh in the North and ${EN.num(sic / 10, 1)} in Sicily. Estimates for the other zones are in the table. The GSE publishes each month's prices by the 22nd of the next month; the figure updates on publication.` },
      { q: 'Should you choose the guaranteed minimum price?', a: `Only if the market falls below ${EN.num(P.rid.pmg_eur_mwh, 1)} euros per MWh, that is ${EN.num(P.rid.pmg_eur_mwh / 10, 2)} cents per kWh. In 2026 prices weighted on sunny hours were always higher in every zone. The minimum price covers the first ${EN.num(P.rid.pmg_kwh_max / 1000)} MWh a year, so a home system is always covered.` },
      { q: 'What does the ritiro dedicato cost?', a: `Nothing up to ${P.rid.fee_esente_fino_kw} kW. Above that, ${EN.num(P.rid.fee_eur_kw[0].eur, 2)} euros per kW a year up to 20 kW: ${EN.eur(feeRid(4.5), 2)} for 4.5 kWp and ${EN.eur(feeRid(6), 2)} for 6 kWp. The fee covers the GSE's administrative costs and is capped at ${EN.eur(P.rid.fee_max_eur)} a year. The calculator subtracts it from the income.` },
    ],
    body: (h) => `
<h2>Average monthly price by zone, 2026</h2>
${h.table(['Zone', ...MESI_EN], ZONE.map((z) => [z, ...MESI_EN.map((_, m) => h.num(mese(z, m) / 10, 1))]), `Cents per kWh. Average of GSE prices for bands F1, F2 and F3 weighted by the share of solar output (${h.pct(W.F1)}, ${h.pct(W.F2)}, ${h.pct(W.F3)}). Latest month published: ${ultimoEn}.`, ['l', ...MESI_EN.map(() => 'r' as const)])}
<p>The ${h.src('gse_rid_prezzi', 'GSE publishes')} average monthly prices by time band and market zone; the region you live in sets the zone. We weight them by the hours when a solar system actually produces, computed from PVGIS: that is why a zone's price can be lower than the market average, since at midday the supply of solar power pushes prices down. The lowest value so far in 2026 is ${h.num(peggio.v / 10, 1)} cents, in the ${peggio.z} zone in ${MESE_EN[peggio.m]}.</p>

<h2>How the contract works</h2>
<p>You apply on the ${h.src('gse_rid', 'GSE')} portal after grid connection. The ${h.src('gse_rid_dtf', 'technical rules')} explain how the hourly zonal price and the ${h.src('arera_pmg', 'ARERA guaranteed minimum price')} apply. Energy used at home does not go through the contract: it saves money directly on the bill, at more than twice the value. The ritiro dedicato is compatible with an ${h.a('comunita-energetiche', 'energy community')}, which adds a premium on shared energy.</p>

<h2>The value used in the calculator</h2>
<p>The calculator takes the average of the published months, weighted by your region's monthly output, and compares it with the minimum price: it uses the higher one. You can enter another value in the « Export value » field to try lower-price scenarios, for example ${h.num(P.rid.pmg_eur_mwh / 10, 2)} cents if the market fell to the guaranteed minimum.</p>`,
  },
});
