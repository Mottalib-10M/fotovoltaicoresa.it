import { defineGuide } from '../../lib/guide-types';
import { calcola, costoRiferimento, detrazione } from '../../lib/engine/fv';
import { ROMA } from '../../lib/engine/dati';
import { P, IT, EN } from '../../lib/fmt';

/** Detrazione 2026 per il fotovoltaico: 50 % prima casa del proprietario, 36 % altri casi, tetto 96 000 €, 10 rate. */
const D = P.detrazione;
const CASI = [[3, 0], [4.5, 0], [6, 0], [6, 10]] as const;
const righe = CASI.map(([k, b]) => { const s = costoRiferimento(k, b); return { k, b, s, pc: detrazione(s, true), al: detrazione(s, false) }; });
const pc = calcola({ luogo: ROMA, kwp: 4.5, tilt: 30, az: 0, consumo: 3000, batteria: 0, primaCasa: true });
const sc = calcola({ luogo: ROMA, kwp: 4.5, tilt: 30, az: 0, consumo: 3000, batteria: 0, primaCasa: false });
const no = calcola({ luogo: ROMA, kwp: 4.5, tilt: 30, az: 0, consumo: 3000, batteria: 0, primaCasa: true, detraibile: false });
const s45 = costoRiferimento(4.5, 0);
const d27 = s45 * D.anno_2027.prima_casa, d26 = s45 * D.aliquota_prima_casa;

export default defineGuide({
  id: 'bonus-fotovoltaico',
  group: 'incentivi',
  order: 10,
  tool: 'detrazione',
  toolPreset: { kwp: 4.5, cons: 3000 },
  related: ['costo-impianto-fotovoltaico', 'incentivi-fotovoltaico', 'fotovoltaico-con-accumulo', 'fotovoltaico-conviene', 'ritiro-dedicato'],
  sources: ['ade_misura', 'ade_come', 'ade_lavori', 'dl34_119'],
  it: {
    slug: 'bonus-fotovoltaico',
    nav: 'Bonus fotovoltaico',
    card: 'Detrazione del 50 o 36 % nel 2026: importo, rata annua e effetto sul tempo di rientro.',
    title: 'Bonus fotovoltaico 2026: detrazione 50 o 36 % e rata annua',
    description: 'Bonus fotovoltaico 2026: detrazione del 50 % sulla prima casa del proprietario e del 36 % negli altri casi, tetto di 96 000 €, dieci rate e tempo di rientro.',
    h1: 'Bonus fotovoltaico 2026: quanto vi torna la detrazione',
    intro: `Su un impianto da 4,5 kWp al costo di riferimento di ${IT.eur(s45)} la detrazione vale ${IT.eur(pc.detrazione)} sulla prima casa del proprietario, cioè ${IT.eur(pc.rata)} l'anno per dieci anni, e ${IT.eur(sc.detrazione)} su una seconda casa.`,
    resume: `Nel 2026 il fotovoltaico domestico si detrae come intervento di recupero edilizio, secondo le schede dell'Agenzia delle Entrate aggiornate dopo la legge di bilancio. L'aliquota è del ${IT.pct(D.aliquota_prima_casa)} per le spese sull'abitazione principale sostenute dal proprietario o dal titolare di un diritto reale, e del ${IT.pct(D.aliquota_altri)} in tutti gli altri casi, come la seconda casa o l'inquilino. Il limite di spesa è di ${IT.eur(D.tetto_eur)} per unità immobiliare e la detrazione si divide in ${D.rate} rate annuali uguali. Per le spese del 2027 le aliquote scendono al ${IT.pct(D.anno_2027.prima_casa)} e al ${IT.pct(D.anno_2027.altri)}. La detrazione riduce l'IRPEF, quindi serve imposta sufficiente ogni anno: la parte di rata che supera l'imposta dovuta si perde. A Roma, con 4,5 kWp e 3 000 kWh di consumo, la detrazione accorcia il rientro da ${IT.anni(no.rientro)} a ${IT.anni(pc.rientro)} sulla prima casa; su una seconda casa ${IT.anni(sc.rientro)}.`,
    faqs: [
      { q: 'Il bonus fotovoltaico 2026 è al 50 o al 36 %?', a: `Al ${IT.pct(D.aliquota_prima_casa)} se l'impianto è sull'abitazione principale e la spesa è sostenuta dal proprietario o da chi ha un diritto reale, come l'usufrutto. Al ${IT.pct(D.aliquota_altri)} negli altri casi, compresi inquilini e seconde case. Lo precisa la scheda dell'Agenzia delle Entrate sulla misura della detrazione, con il tetto di ${IT.eur(D.tetto_eur)} per unità.` },
      { q: 'La batteria rientra nella detrazione?', a: `Nel simulatore la detrazione si applica al costo totale, batteria compresa, come fanno di solito gli installatori. L'Agenzia delle Entrate cita gli interventi con fonti rinnovabili fra quelli da comunicare all'ENEA, ma l'elenco dei lavori non nomina in modo esplicito l'accumulo: per una spesa importante chiedete conferma al vostro consulente fiscale prima di firmare.` },
      { q: 'Cosa succede se compro l\'impianto nel 2027?', a: `Le aliquote scendono al ${IT.pct(D.anno_2027.prima_casa)} per la prima casa e al ${IT.pct(D.anno_2027.altri)} per gli altri immobili. Su ${IT.eur(s45)} di spesa la detrazione per la prima casa passa da ${IT.eur(d26)} a ${IT.eur(d27)}. Conta la data del bonifico, non quella dell'allacciamento: chi paga entro il 31 dicembre 2026 resta al ${IT.pct(D.aliquota_prima_casa)}.` },
      { q: 'Come si paga per non perdere la detrazione?', a: `Con bonifico « parlante », che riporta la causale di legge, il codice fiscale di chi detrae e la partita IVA dell'impresa, come indica la scheda Come e quando dell'Agenzia. Per gli interventi con fonti rinnovabili va inviata la comunicazione all'ENEA entro ${D.enea_giorni} giorni dalla fine dei lavori. Conservate fatture e ricevute dei bonifici.` },
    ],
    body: (h) => `
<h2>Detrazione per taglia, prima casa e altri immobili</h2>
${h.table(['Impianto', 'Spesa di riferimento', `Prima casa (${h.pct(D.aliquota_prima_casa)})`, 'Rata annua', `Altri casi (${h.pct(D.aliquota_altri)})`, 'Rata annua'], righe.map(({ k, b, s, pc: a, al }) => [`${h.num(k, 1)} kWp${b ? ` + ${h.num(b)} kWh` : ''}`, h.eur(s), h.eur(a.totale), h.eur(a.rata), h.eur(al.totale), h.eur(al.rata)]), `Spesa al costo di riferimento (${h.eur(P.costi.fv_eur_kw)}/kW, ${h.eur(P.costi.accumulo_eur_kwh)}/kWh di accumulo), rate in ${D.rate} anni.`, ['l', 'r', 'r', 'r', 'r', 'r'])}
<p>La rata annua è la cifra che conta per la vostra dichiarazione: ogni anno riduce l'IRPEF lorda, e se l'imposta dovuta è più bassa la differenza non si recupera. Un pensionato con poca imposta può quindi ricevere meno di quanto indicato. Il simulatore permette di togliere la detrazione per vedere il rientro senza di essa.</p>

<h2>Le regole del 2026, punto per punto</h2>
<p>La ${h.src('ade_misura', 'scheda sulla misura della detrazione')} fissa le due aliquote e il tetto di ${h.eur(D.tetto_eur)} per unità immobiliare, che comprende tutte le spese di recupero edilizio della stessa casa nell'anno. La ${h.src('ade_come', 'scheda Come e quando')} chiede il bonifico parlante e, per i lavori con fonti rinnovabili, la comunicazione all'ENEA entro ${D.enea_giorni} giorni. Lo sconto in fattura e la cessione del credito restano possibili solo nei casi in cui la normativa li consente ancora, come ricorda la stessa scheda; per un impianto nuovo nel 2026 la regola è la detrazione in dichiarazione.</p>
<p>Il ${h.src('ade_lavori', 'elenco dei lavori agevolati')} include gli interventi di risparmio energetico. Per l'accumulo esiste un riferimento di spesa nel ${h.src('dl34_119', 'decreto-legge 34/2020')}, nato per il Superbonus; lo usiamo solo come valore iniziale del costo.</p>

<h2>Dopo il 2027</h2>
<p>Per le spese dal 2028 al 2033 la scheda indica un'aliquota del ${h.pct(D.anni_2028_2033.aliquota)}. Il tetto di spesa di quegli anni non è riportato in modo chiaro nelle fonti che abbiamo consultato, quindi il simulatore non lo calcola. Le altre voci del conto sono nella pagina ${h.a('incentivi-fotovoltaico', 'incentivi fotovoltaico')}.</p>`,
  },
  en: {
    slug: 'solar-tax-deduction-italy',
    nav: 'Solar tax deduction',
    card: 'The 50% or 36% deduction in 2026: amount, yearly instalment and effect on payback.',
    title: 'Solar Tax Deduction Italy 2026: 50% or 36% Bonus Explained',
    description: 'Solar tax deduction in Italy 2026: 50% on the owner\'s main home and 36% otherwise, a €96,000 cap, ten yearly instalments and the payback time worked out.',
    h1: 'Italy\'s 2026 solar bonus: what the tax deduction gives back',
    intro: `On a 4.5 kWp system at the reference cost of ${EN.eur(s45)} the deduction is worth ${EN.eur(pc.detrazione)} on the owner's main home, that is ${EN.eur(pc.rata)} a year for ten years, and ${EN.eur(sc.detrazione)} on a second home.`,
    resume: `In 2026 home solar is deducted as a building renovation (recupero edilizio), according to the Agenzia delle Entrate fact sheets updated after the budget law. The rate is ${EN.pct(D.aliquota_prima_casa)} for spending on the main home paid by the owner or by the holder of a real right, and ${EN.pct(D.aliquota_altri)} in all other cases, such as a second home or a tenant. The spending cap is ${EN.eur(D.tetto_eur)} per dwelling and the deduction is split into ${D.rate} equal annual instalments. For 2027 spending the rates fall to ${EN.pct(D.anno_2027.prima_casa)} and ${EN.pct(D.anno_2027.altri)}. The deduction reduces income tax (IRPEF), so you need enough tax each year: any part of an instalment above the tax due is lost. In Rome, with 4.5 kWp and 3,000 kWh of use, the deduction shortens payback from ${EN.anni(no.rientro)} to ${EN.anni(pc.rientro)} on a main home; on a second home ${EN.anni(sc.rientro)}.`,
    faqs: [
      { q: 'Is Italy\'s 2026 solar bonus 50% or 36%?', a: `${EN.pct(D.aliquota_prima_casa)} if the system is on the main home and the spending is paid by the owner or by someone with a real right, such as usufruct. ${EN.pct(D.aliquota_altri)} otherwise, including tenants and second homes. The Agenzia delle Entrate fact sheet on the size of the deduction says so, with a cap of ${EN.eur(D.tetto_eur)} per dwelling.` },
      { q: 'Does a solar battery qualify for the deduction?', a: `In the calculator the deduction applies to the total cost, battery included, as installers usually do. The Agenzia delle Entrate lists works using renewables among those to report to ENEA, but its list of works does not name storage explicitly: for a large purchase ask your tax adviser to confirm before signing.` },
      { q: 'What happens if I buy the system in 2027?', a: `The rates fall to ${EN.pct(D.anno_2027.prima_casa)} for the main home and ${EN.pct(D.anno_2027.altri)} for other property. On ${EN.eur(s45)} of spending the main-home deduction goes from ${EN.eur(d26)} to ${EN.eur(d27)}. What counts is the date of the bank transfer, not the grid connection: paying by 31 December 2026 keeps the ${EN.pct(D.aliquota_prima_casa)} rate.` },
      { q: 'How do you pay so as not to lose the deduction?', a: `By a dedicated bank transfer (bonifico parlante) stating the legal purpose, the tax code of the person claiming and the company's VAT number, as the Agency's Come e quando sheet explains. For works with renewables a notice must be sent to ENEA within ${D.enea_giorni} days of completion. Keep the invoices and transfer receipts.` },
    ],
    body: (h) => `
<h2>Deduction by size, main home and other property</h2>
${h.table(['System', 'Reference spend', `Main home (${h.pct(D.aliquota_prima_casa)})`, 'Yearly instalment', `Other (${h.pct(D.aliquota_altri)})`, 'Yearly instalment'], righe.map(({ k, b, s, pc: a, al }) => [`${h.num(k, 1)} kWp${b ? ` + ${h.num(b)} kWh` : ''}`, h.eur(s), h.eur(a.totale), h.eur(a.rata), h.eur(al.totale), h.eur(al.rata)]), `Spend at the reference cost (${h.eur(P.costi.fv_eur_kw)}/kW, ${h.eur(P.costi.accumulo_eur_kwh)}/kWh of storage), instalments over ${D.rate} years.`, ['l', 'r', 'r', 'r', 'r', 'r'])}
<p>The yearly instalment is the figure that matters on your tax return: each year it reduces gross income tax, and if the tax due is lower the difference is not recovered. A pensioner with little tax may therefore receive less than shown. The calculator lets you remove the deduction to see payback without it.</p>

<h2>The 2026 rules, point by point</h2>
<p>The ${h.src('ade_misura', 'sheet on the size of the deduction')} sets the two rates and the ${h.eur(D.tetto_eur)} cap per dwelling, which covers all renovation spending on the same home in the year. The ${h.src('ade_come', 'Come e quando sheet')} requires the dedicated transfer and, for works with renewables, the ENEA notice within ${D.enea_giorni} days. Invoice discounts and credit transfers remain possible only where the rules still allow them, as the same sheet notes; for a new system in 2026 the rule is the deduction on the tax return.</p>
<p>The ${h.src('ade_lavori', 'list of eligible works')} includes energy-saving works. For storage there is a spending reference in ${h.src('dl34_119', 'Decree-Law 34/2020')}, written for the Superbonus; we use it only as the starting value of the cost.</p>

<h2>After 2027</h2>
<p>For spending from 2028 to 2033 the sheet gives a ${h.pct(D.anni_2028_2033.aliquota)} rate. The spending cap for those years is not stated clearly in the sources we checked, so the calculator does not compute it. The other items in the sum are on the ${h.a('incentivi-fotovoltaico', 'solar incentives')} page.</p>`,
  },
});
