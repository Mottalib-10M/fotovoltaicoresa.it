import { defineGuide } from '../../lib/guide-types';
import { calcola, tariffaCer, valoreRidKwh } from '../../lib/engine/fv';
import { luogoCitta } from '../../lib/engine/dati';
import { P, IT, EN } from '../../lib/fmt';
import { displayDate } from '../../lib/format';

/**
 * CER: tariffa premio del decreto 414/2023 (min(120, 80 + max(0, 180 − Pz)) più correzione Nord/Centro) per 20 anni,
 * calcolata con il prezzo zonale stimato; contributo PNRR con la scadenza lavori del 30/06/2026 già passata.
 */
const C = P.cer;
const roma = luogoCitta('roma'), milano = luogoCitta('milano'), bari = luogoCitta('bari');
const tip = (l: typeof roma) => tariffaCer(l.reg, valoreRidKwh(l.reg) * 1000);
const r = (l: typeof roma, q: number) => calcola({ luogo: l, kwp: 4.5, tilt: 30, az: 0, consumo: 2700, batteria: 0, primaCasa: true, quotaCer: q });
const QUOTE = [0.25, 0.5, 0.75];
const ro50 = r(roma, 0.5), mi50 = r(milano, 0.5), ba50 = r(bari, 0.5);
/** Prezzo zonale oltre il quale la tariffa scende sotto il massimo. */
const soglia = C.tip_pz_rif - (C.tip_max_eur_mwh - C.tip_base_eur_mwh);
const fine = (l: string) => displayDate(C.pnrr_fine_lavori, l), eserc = (l: string) => displayDate(C.pnrr_esercizio_entro, l);

export default defineGuide({
  id: 'comunita-energetiche',
  group: 'incentivi',
  order: 40,
  tool: 'cer',
  toolPreset: { kwp: 4.5, q: 50, cons: 2700 },
  related: ['ritiro-dedicato', 'incentivi-fotovoltaico', 'scambio-sul-posto', 'fotovoltaico-con-accumulo'],
  sources: ['dm_cer', 'gse_cer', 'gse_cer_tariffa', 'regole_cacer', 'gse_rid_prezzi'],
  it: {
    slug: 'comunita-energetiche',
    nav: 'Comunità energetiche',
    card: 'Tariffa premio CER per zona, quanto vale la quota condivisa del vostro impianto e il contributo PNRR.',
    title: 'Comunità energetiche 2026: tariffa premio CER e guadagno',
    description: 'Comunità energetiche 2026: tariffa premio CER fino a 120 €/MWh più la correzione di zona per 20 anni, quanto vale l\'energia condivisa e la scadenza del PNRR.',
    h1: 'Comunità energetiche: quanto vale la tariffa premio nel 2026',
    intro: `Con i prezzi di mercato del 2026 la tariffa premio è al massimo: ${IT.num(tip(milano))} €/MWh al Nord, ${IT.num(tip(roma))} a Roma, ${IT.num(tip(bari))} al Sud. Se metà dell'energia immessa da 4,5 kWp a Roma viene condivisa, la comunità incassa ${IT.eur(ro50.cer)} l'anno.`,
    resume: `Una comunità energetica rinnovabile, o CER, è un'associazione di cittadini, imprese ed enti locali che condividono l'energia prodotta da impianti a fonti rinnovabili nella stessa area della cabina primaria. Il decreto del Ministero dell'Ambiente n. 414/2023 riconosce per ${C.durata_anni} anni una tariffa premio sull'energia condivisa, cioè la parte di energia immessa che nella stessa ora viene consumata da altri membri. Per gli impianti fino a 200 kW la tariffa vale ${C.tip_base_eur_mwh} euro per MWh più la differenza fra ${C.tip_pz_rif} euro e il prezzo zonale, con un massimo di ${C.tip_max_eur_mwh}, e aumenta di ${C.correzione_nord} euro al Nord e di ${C.correzione_centro} al Centro per la minore produzione. Con prezzi zonali sopra ${soglia} euro per MWh, come nel 2026, la tariffa è sempre al massimo. Il premio si somma al ritiro dedicato, ma lo riceve la comunità, che lo ripartisce secondo il proprio statuto. Il contributo PNRR del ${IT.pct(C.pnrr_quota)} per i comuni sotto ${IT.num(C.pnrr_comuni_sotto)} abitanti richiedeva la fine dei lavori entro il ${fine('it-IT')}.`,
    faqs: [
      { q: 'Quanto si guadagna entrando in una comunità energetica?', a: `Dipende da quanta energia viene condivisa e da come lo statuto divide il premio. Con 4,5 kWp e metà dell'energia immessa condivisa, la tariffa porta ${IT.eur(ro50.cer)} l'anno alla comunità a Roma, ${IT.eur(mi50.cer)} a Milano e ${IT.eur(ba50.cer)} a Bari. Il simulatore attribuisce tutta la tariffa a voi: nella realtà ne riceverete una parte.` },
      { q: 'Il contributo PNRR del 40 % è ancora disponibile?', a: `Le regole del GSE chiedevano la fine dei lavori entro il ${fine('it-IT')} e l'entrata in esercizio entro il ${eserc('it-IT')}, per impianti nei comuni sotto ${IT.num(C.pnrr_comuni_sotto)} abitanti. Alla data di oggi la scadenza dei lavori è passata, quindi per un impianto che parte ora il contributo non è utilizzabile salvo proroghe. Controllate la pagina del GSE.` },
      { q: 'Posso avere comunità energetica e ritiro dedicato insieme?', a: `Sì. L'energia immessa continua a essere venduta con il ritiro dedicato, e la parte condivisa nella comunità riceve in più la tariffa premio. L'energia consumata in casa resta fuori da entrambi: si risparmia in bolletta. Per questo la comunità aggiunge ricavo senza toglierne, come mostra il simulatore con il campo della quota condivisa.` },
      { q: 'Chi riceve la tariffa premio della CER?', a: 'Il GSE la versa al referente della comunità, che la distribuisce fra i membri secondo lo statuto e il regolamento interno. Alcune comunità la usano in parte per progetti sociali o per coprire i costi di gestione. Prima di aderire leggete come viene ripartita: è la cifra che conta per il vostro bilancio.' },
    ],
    body: (h) => `
<!--mini:cer-->
<h2>Tariffa e ricavo per quota condivisa</h2>
${h.table(['Quota condivisa', 'Roma', 'Milano', 'Bari'], QUOTE.map((q) => [h.pct(q), h.eur(r(roma, q).cer), h.eur(r(milano, q).cer), h.eur(r(bari, q).cer)]).concat([['Tariffa €/MWh', h.num(tip(roma)), h.num(tip(milano)), h.num(tip(bari))]]), 'Premio annuo per la comunità, 4,5 kWp, 2 700 kWh di consumo, 30° sud. Quota condivisa = parte dell\'energia immessa consumata dagli altri membri nella stessa ora.', ['l', 'r', 'r', 'r'])}
<p>La quota condivisa non dipende da voi ma dai consumi degli altri membri nelle ore di sole: una comunità con scuole, uffici o negozi aperti di giorno condivide di più di una fatta solo di famiglie. La formula della tariffa è nell'allegato 1 del ${h.src('dm_cer', 'decreto CER')}; il prezzo zonale lo stimiamo con i ${h.src('gse_rid_prezzi', 'prezzi GSE del 2026')}.</p>

<h2>Come si entra</h2>
<p>Si cerca una comunità attiva nell'area della propria cabina primaria, oppure se ne costituisce una con un atto e uno statuto; il ${h.src('gse_cer', 'GSE')} pubblica una mappa delle cabine primarie e le ${h.src('regole_cacer', 'regole operative')}. L'impianto può essere nuovo o già esistente entro i limiti delle regole, e il produttore può essere un membro o un soggetto terzo. La ${h.src('gse_cer_tariffa', 'pagina del GSE sulla tariffa')} spiega i requisiti per ottenerla.</p>

<h2>Il contributo PNRR e la sua scadenza</h2>
<p>Per i comuni sotto ${h.num(C.pnrr_comuni_sotto)} abitanti il decreto prevedeva un contributo a fondo perduto fino al ${h.pct(C.pnrr_quota)} dei costi ammissibili, con un costo massimo di ${h.eur(P.costi.fv_eur_kw)} per kW. Le opere dovevano finire entro il ${fine('it-IT')}, data già passata, e gli impianti entrare in esercizio entro il ${eserc('it-IT')}. Chi ha completato i lavori in tempo segue la propria pratica; chi parte ora conta solo sulla tariffa premio, oltre al ${h.a('ritiro-dedicato', 'ritiro dedicato')}.</p>`,
  },
  en: {
    slug: 'energy-communities-italy',
    nav: 'Energy communities',
    card: 'The energy community premium by zone, what your system\'s shared energy is worth and the PNRR grant.',
    title: 'Energy Communities Italy 2026: CER Premium and Earnings',
    description: 'Energy communities in Italy 2026: the CER premium of up to €120/MWh plus a zone adjustment for 20 years, what shared energy is worth and the PNRR deadline.',
    h1: 'Italian energy communities: what the premium is worth in 2026',
    intro: `At 2026 market prices the premium sits at its maximum: ${EN.num(tip(milano))} €/MWh in the North, ${EN.num(tip(roma))} in Rome, ${EN.num(tip(bari))} in the South. If half the energy exported by 4.5 kWp in Rome is shared, the community receives ${EN.eur(ro50.cer)} a year.`,
    resume: `A renewable energy community, or CER (comunità energetica rinnovabile), is an association of citizens, businesses and local bodies that share energy from renewable plants within the area of the same primary substation. Decree no. 414/2023 of the Ministry of Environment grants a premium for ${C.durata_anni} years on shared energy, that is the part of exported energy consumed by other members in the same hour. For systems up to 200 kW the premium is ${C.tip_base_eur_mwh} euros per MWh plus the gap between ${C.tip_pz_rif} euros and the zonal price, capped at ${C.tip_max_eur_mwh}, with ${C.correzione_nord} euros more in the North and ${C.correzione_centro} in the Centre for the lower output. With zonal prices above ${soglia} euros per MWh, as in 2026, the premium is always at its cap. It adds to the ritiro dedicato, but it goes to the community, which divides it according to its statute. The PNRR grant of ${EN.pct(C.pnrr_quota)} for comuni under ${EN.num(C.pnrr_comuni_sotto)} inhabitants required works to finish by ${fine('en-GB')}.`,
    faqs: [
      { q: 'How much do you earn by joining an energy community in Italy?', a: `It depends on how much energy is shared and how the statute divides the premium. With 4.5 kWp and half the exported energy shared, the premium brings the community ${EN.eur(ro50.cer)} a year in Rome, ${EN.eur(mi50.cer)} in Milan and ${EN.eur(ba50.cer)} in Bari. The calculator gives you the whole premium: in reality you will receive a share.` },
      { q: 'Is the 40% PNRR grant still available?', a: `The GSE rules required works to finish by ${fine('en-GB')} and entry into operation by ${eserc('en-GB')}, for systems in comuni under ${EN.num(C.pnrr_comuni_sotto)} inhabitants. As of today the works deadline has passed, so a system starting now cannot use the grant unless it is extended. Check the GSE page.` },
      { q: 'Can I have an energy community and the ritiro dedicato together?', a: `Yes. Exported energy is still sold under the ritiro dedicato, and the part shared in the community earns the premium on top. Energy used at home stays outside both: it saves money on the bill. So the community adds income without taking any away, as the calculator shows with the shared-share field.` },
      { q: 'Who receives the energy community premium?', a: 'The GSE pays it to the community\'s representative, who distributes it among members according to the statute and internal rules. Some communities use part of it for social projects or to cover running costs. Before joining, read how it is divided: that is the figure that matters for your own budget.' },
    ],
    body: (h) => `
<!--mini:cer-->
<h2>Premium and income by shared share</h2>
${h.table(['Shared share', 'Rome', 'Milan', 'Bari'], QUOTE.map((q) => [h.pct(q), h.eur(r(roma, q).cer), h.eur(r(milano, q).cer), h.eur(r(bari, q).cer)]).concat([['Premium €/MWh', h.num(tip(roma)), h.num(tip(milano)), h.num(tip(bari))]]), 'Yearly premium for the community, 4.5 kWp, 2,700 kWh of use, 30° south. Shared share = part of exported energy used by other members in the same hour.', ['l', 'r', 'r', 'r'])}
<p>The shared share does not depend on you but on other members' use in sunny hours: a community with schools, offices or shops open by day shares more than one made only of households. The premium formula is in annex 1 of the ${h.src('dm_cer', 'energy community decree')}; we estimate the zonal price with the ${h.src('gse_rid_prezzi', 'GSE 2026 prices')}.</p>

<h2>How to join</h2>
<p>Look for an active community in the area of your primary substation, or set one up with a deed and statute; the ${h.src('gse_cer', 'GSE')} publishes a map of primary substations and the ${h.src('regole_cacer', 'operating rules')}. The system can be new or existing within the rules' limits, and the producer can be a member or a third party. The ${h.src('gse_cer_tariffa', 'GSE page on the premium')} explains the requirements.</p>

<h2>The PNRR grant and its deadline</h2>
<p>For comuni under ${h.num(C.pnrr_comuni_sotto)} inhabitants the decree provided a grant of up to ${h.pct(C.pnrr_quota)} of eligible costs, with a maximum cost of ${h.eur(P.costi.fv_eur_kw)} per kW. Works had to finish by ${fine('en-GB')}, a date already passed, and systems enter operation by ${eserc('en-GB')}. Those who completed works in time follow their own application; anyone starting now relies on the premium alone, on top of the ${h.a('ritiro-dedicato', 'ritiro dedicato')}.</p>`,
  },
});
