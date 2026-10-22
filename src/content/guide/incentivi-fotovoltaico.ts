import { defineGuide } from '../../lib/guide-types';
import { calcola, PREZZO_EVITATO_CT } from '../../lib/engine/fv';
import { luogoCitta } from '../../lib/engine/dati';
import { P, IT, EN } from '../../lib/fmt';
import { displayDate } from '../../lib/format';

/** Incentivi 2026 in un solo conto: risparmio, ritiro dedicato, tariffa CER, detrazione. Esempio Napoli 4,5 kWp. */
const na = luogoCitta('napoli');
const base = { luogo: na, kwp: 4.5, tilt: 30, az: 0, consumo: 3300, batteria: 0, primaCasa: true };
const solo = calcola({ ...base, detraibile: false, ridAttivo: false });
const conRid = calcola({ ...base, detraibile: false });
const conDet = calcola(base);
const conCer = calcola({ ...base, quotaCer: 0.5 });
const VOCI = [
  ['Solo risparmio in bolletta', 'Bill saving only', solo],
  ['+ ritiro dedicato', '+ ritiro dedicato', conRid],
  [`+ detrazione ${IT.pct(P.detrazione.aliquota_prima_casa)}`, `+ ${EN.pct(P.detrazione.aliquota_prima_casa)} deduction`, conDet],
  ['+ comunità energetica (50 % condiviso)', '+ energy community (50% shared)', conCer],
] as const;

export default defineGuide({
  id: 'incentivi-fotovoltaico',
  group: 'incentivi',
  order: 5,
  tool: 'rendimento',
  toolPreset: { citta: 'napoli', kwp: 4.5, cons: 3300 },
  related: ['bonus-fotovoltaico', 'ritiro-dedicato', 'comunita-energetiche', 'scambio-sul-posto', 'fotovoltaico-conviene'],
  sources: ['ade_misura', 'gse_rid', 'arera_pmg', 'dm_cer', 'arera_213', 'arera_q4'],
  it: {
    slug: 'incentivi-fotovoltaico',
    nav: 'Incentivi fotovoltaico',
    card: 'Tutti gli incentivi del 2026 in un solo conto: detrazione, ritiro dedicato, comunità energetiche.',
    title: 'Incentivi fotovoltaico 2026: cosa resta e quanto vale',
    description: 'Incentivi fotovoltaico 2026: detrazione del 50 o 36 %, ritiro dedicato del GSE, premio delle comunità energetiche e scambio sul posto chiuso, in un conto.',
    h1: 'Incentivi fotovoltaico 2026: quanto pesa ciascuno sul rientro',
    intro: `A Napoli, con 4,5 kWp e 3 300 kWh di consumo, il solo risparmio in bolletta ripaga l'impianto in ${IT.anni(solo.rientro)}; con ritiro dedicato e detrazione si scende a ${IT.anni(conDet.rientro)}.`,
    resume: `Nel 2026 chi installa un impianto fotovoltaico domestico può contare su tre aiuti che si sommano. Il primo è la detrazione per il recupero edilizio, del ${IT.pct(P.detrazione.aliquota_prima_casa)} sulla prima casa del proprietario e del ${IT.pct(P.detrazione.aliquota_altri)} negli altri casi, in dieci rate annuali. Il secondo è il ritiro dedicato del GSE, che paga l'energia immessa in rete al prezzo zonale, con un minimo garantito di ${IT.num(P.rid.pmg_eur_mwh, 1)} euro per MWh. Il terzo è la tariffa premio delle comunità energetiche, fino a ${P.cer.tip_max_eur_mwh} euro per MWh sull'energia condivisa per ${P.cer.durata_anni} anni, più una correzione al Centro e al Nord. Lo scambio sul posto, invece, non accetta più nuovi impianti dal ${displayDate(P.ssp.ultimo_giorno_domande, 'it-IT')}. Il valore più grande resta comunque l'energia consumata in casa, che evita circa ${IT.num(PREZZO_EVITATO_CT, 1)} centesimi per kWh in bolletta. A Napoli, su 4,5 kWp, il risparmio vale ${IT.eur(solo.risparmio)} l'anno, il ritiro dedicato ${IT.eur(conRid.ricavoRid)} e la detrazione ${IT.eur(conDet.rata)} l'anno per dieci anni.`,
    faqs: [
      { q: 'Quali incentivi ci sono per il fotovoltaico nel 2026?', a: `La detrazione del ${IT.pct(P.detrazione.aliquota_prima_casa)} o del ${IT.pct(P.detrazione.aliquota_altri)} sulla spesa, il ritiro dedicato per l'energia immessa e la tariffa premio delle comunità energetiche per quella condivisa. Lo scambio sul posto è chiuso ai nuovi impianti. Alcune regioni e comuni pubblicano bandi propri: non li includiamo perché cambiano spesso, cercate quelli del vostro territorio.` },
      { q: 'Quale incentivo pesa di più sul rientro?', a: `La detrazione: a Napoli porta il rientro di 4,5 kWp da ${IT.anni(conRid.rientro)} a ${IT.anni(conDet.rientro)}, perché restituisce metà della spesa nei primi dieci anni. Il ritiro dedicato conta meno per kWh ma dura tutta la vita dell'impianto. La comunità energetica aggiunge un ricavo che dipende dalla quota condivisa e dallo statuto.` },
      { q: 'Gli incentivi si possono sommare?', a: 'Sì, nei limiti delle regole di ciascuno. Detrazione, ritiro dedicato e tariffa premio della comunità energetica riguardano cose diverse: la spesa, l\'energia immessa e l\'energia condivisa. Il contributo PNRR per le comunità nei piccoli comuni aveva invece regole di cumulo proprie, e la sua scadenza per la fine dei lavori è già passata.' },
    ],
    body: (h) => `
<h2>Lo stesso impianto, un incentivo alla volta</h2>
${h.table(['Voci incluse', 'Beneficio annuo', 'Rientro', 'Saldo in 20 anni'], VOCI.map(([a, , x]) => [a, h.eur(x.beneficio), x.rientro === null ? 'oltre 20 anni' : `${h.num(x.rientro, 1)} anni`, h.eur(x.saldo)]), `Napoli, 4,5 kWp, 3 300 kWh, 30° sud, costo di riferimento ${h.eur(conDet.costo)}. La riga della comunità attribuisce tutta la tariffa al produttore.`, ['l', 'r', 'r', 'r'])}

<h2>Che cosa fa ciascun incentivo</h2>
<p>La ${h.a('bonus-fotovoltaico', 'detrazione')} riduce l'IRPEF per dieci anni e serve imposta sufficiente. Il ${h.a('ritiro-dedicato', 'ritiro dedicato')} paga l'energia immessa con i prezzi zonali che il GSE pubblica ogni mese; il ${h.src('arera_pmg', 'prezzo minimo garantito')} protegge dai mesi peggiori. La tariffa delle ${h.a('comunita-energetiche', 'comunità energetiche')} premia l'energia condivisa nella stessa cabina primaria e segue la formula del ${h.src('dm_cer', 'decreto CER')}.</p>
<p>Lo ${h.a('scambio-sul-posto', 'scambio sul posto')} è chiuso ai nuovi impianti per la ${h.src('arera_213', 'delibera ARERA 213/2025')}. Per un impianto nuovo il guadagno maggiore resta l'autoconsumo, valorizzato al prezzo evitato delle ${h.src('arera_q4', 'condizioni ARERA')}: per questo conviene spostare i consumi nelle ore di sole prima ancora di pensare agli incentivi.</p>`,
  },
  en: {
    slug: 'solar-incentives-italy',
    nav: 'Solar incentives',
    card: 'All 2026 incentives in one sum: tax deduction, ritiro dedicato, energy communities.',
    title: 'Solar Incentives Italy 2026: What Is Left and Its Value',
    description: 'Solar incentives in Italy 2026: the 50% or 36% deduction, the GSE ritiro dedicato, the energy community premium and closed net metering, added up in one sum.',
    h1: 'Italian solar incentives in 2026: how much each one shortens payback',
    intro: `In Naples, with 4.5 kWp and 3,300 kWh of use, the bill saving alone repays the system in ${EN.anni(solo.rientro)}; with the ritiro dedicato and the deduction it falls to ${EN.anni(conDet.rientro)}.`,
    resume: `In 2026 anyone installing a home solar system in Italy can count on three forms of support that add up. The first is the building renovation tax deduction, ${EN.pct(P.detrazione.aliquota_prima_casa)} on the owner's main home and ${EN.pct(P.detrazione.aliquota_altri)} otherwise, in ten annual instalments. The second is the GSE's ritiro dedicato, which pays for exported energy at the zonal price, with a guaranteed minimum of ${EN.num(P.rid.pmg_eur_mwh, 1)} euros per MWh. The third is the energy community premium, up to ${P.cer.tip_max_eur_mwh} euros per MWh on shared energy for ${P.cer.durata_anni} years, plus an adjustment in the Centre and North. Net metering (scambio sul posto), on the other hand, has not accepted new systems since ${displayDate(P.ssp.ultimo_giorno_domande, 'en-GB')}. The largest value is still the energy used at home, which avoids about ${EN.num(PREZZO_EVITATO_CT, 1)} cents per kWh on the bill. In Naples, on 4.5 kWp, the saving is worth ${EN.eur(solo.risparmio)} a year, the ritiro dedicato ${EN.eur(conRid.ricavoRid)} and the deduction ${EN.eur(conDet.rata)} a year for ten years.`,
    faqs: [
      { q: 'What solar incentives exist in Italy in 2026?', a: `The ${EN.pct(P.detrazione.aliquota_prima_casa)} or ${EN.pct(P.detrazione.aliquota_altri)} deduction on the spending, the ritiro dedicato for exported energy and the energy community premium for shared energy. Net metering is closed to new systems. Some regions and comuni run their own grant calls: we leave them out because they change often, so look for those in your area.` },
      { q: 'Which incentive does most for payback?', a: `The deduction: in Naples it cuts payback on 4.5 kWp from ${EN.anni(conRid.rientro)} to ${EN.anni(conDet.rientro)}, because it returns half the cost over the first ten years. The ritiro dedicato counts for less per kWh but lasts the system's whole life. An energy community adds income that depends on the shared share and the statute.` },
      { q: 'Can the incentives be combined?', a: 'Yes, within each scheme\'s rules. The deduction, the ritiro dedicato and the energy community premium cover different things: the spending, exported energy and shared energy. The PNRR grant for communities in small comuni had its own stacking rules instead, and its deadline for finishing works has already passed.' },
    ],
    body: (h) => `
<h2>The same system, one incentive at a time</h2>
${h.table(['Items included', 'Yearly benefit', 'Payback', '20-year balance'], VOCI.map(([, a, x]) => [a, h.eur(x.beneficio), x.rientro === null ? 'over 20 years' : `${h.num(x.rientro, 1)} years`, h.eur(x.saldo)]), `Naples, 4.5 kWp, 3,300 kWh, 30° south, reference cost ${h.eur(conDet.costo)}. The community row gives the whole premium to the producer.`, ['l', 'r', 'r', 'r'])}

<h2>What each incentive does</h2>
<p>The ${h.a('bonus-fotovoltaico', 'deduction')} cuts income tax for ten years and needs enough tax to absorb it. The ${h.a('ritiro-dedicato', 'ritiro dedicato')} pays for exported energy at the zonal prices the GSE publishes each month; the ${h.src('arera_pmg', 'guaranteed minimum price')} protects against the worst months. The ${h.a('comunita-energetiche', 'energy community')} premium rewards energy shared within the same primary substation and follows the formula of the ${h.src('dm_cer', 'energy community decree')}.</p>
<p>${h.a('scambio-sul-posto', 'Net metering')} is closed to new systems under ${h.src('arera_213', 'ARERA resolution 213/2025')}. For a new system the biggest gain is still self-consumption, valued at the avoided price of the ${h.src('arera_q4', 'ARERA conditions')}: which is why shifting use into sunny hours comes before any incentive.</p>`,
  },
});
