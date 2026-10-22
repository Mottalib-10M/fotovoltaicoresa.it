import { defineGuide } from '../../lib/guide-types';
import { calcola, costoRiferimento, detrazione } from '../../lib/engine/fv';
import { luogoCitta } from '../../lib/engine/dati';
import { P, IT, EN, ITALIA } from '../../lib/fmt';

/**
 * Costo: nessun prezzo di mercato inventato. Riferimento di legge (DM CER 1 500 €/kW fino a 20 kW, IVA esclusa;
 * DL 34/2020 1 000 €/kWh per l'accumulo) e costo per kWh prodotto su vent'anni, dal motore.
 */
const roma = luogoCitta('roma'), torino = luogoCitta('torino'), bari = luogoCitta('bari');
const ANNI = P.modello.anni_orizzonte;
const TAGLIE = [3, 4.5, 6, 10];
const c = (kwp: number, bat = 0, l = roma) => calcola({ luogo: l, kwp, tilt: 30, az: 0, consumo: 3000, batteria: bat, primaCasa: true });
const righe = TAGLIE.map((k) => ({ k, r: c(k) }));
/** Centesimi per kWh prodotto: costo netto dopo detrazione diviso la produzione di vent'anni. */
const ctKwh = (costo: number, prod: number) => (costo / (prod * ANNI)) * 100;
const r3 = c(3), r6 = c(6), r6b = c(6, 10), t3 = c(3, 0, torino), b3 = c(3, 0, bari);
const d6 = detrazione(costoRiferimento(6, 0), true), d6s = detrazione(costoRiferimento(6, 0), false);
const prezzoPareggio = (r: typeof r3, kwp: number) => (r.beneficio * ANNI + 0) / (kwp * (1 - P.detrazione.aliquota_prima_casa));

export default defineGuide({
  id: 'costo-impianto-fotovoltaico',
  group: 'impianto',
  order: 20,
  tool: 'costo',
  toolPreset: { kwp: 4.5, cons: 3000 },
  related: ['fotovoltaico-con-accumulo', 'bonus-fotovoltaico', 'impianto-fotovoltaico-3-kw', 'impianto-fotovoltaico-6-kw', 'fotovoltaico-conviene'],
  sources: ['dm_cer', 'dl34_119', 'ade_misura', 'pvgis', 'ade_come'],
  it: {
    slug: 'costo-impianto-fotovoltaico',
    nav: 'Costo impianto fotovoltaico',
    card: 'Costo di riferimento per kW, costo netto dopo la detrazione e quanto costa ogni kWh prodotto in vent\'anni.',
    title: 'Costo impianto fotovoltaico 2026: prezzo netto e per kWh',
    description: 'Costo impianto fotovoltaico 2026: riferimento di 1 500 € per kW del decreto CER, costo netto dopo la detrazione e costo di ogni kWh prodotto in vent\'anni.',
    h1: 'Costo di un impianto fotovoltaico nel 2026: quanto pagate davvero',
    intro: `Al riferimento di ${IT.eur(P.costi.fv_eur_kw)} per kW, 6 kWp costano ${IT.eur(r6.costo)}; con la detrazione del ${IT.pct(P.detrazione.aliquota_prima_casa)} restano ${IT.eur(r6.costoNetto)}, pari a ${IT.num(ctKwh(r6.costoNetto, r6.produzione), 1)} centesimi per ogni kWh prodotto a Roma in ${ANNI} anni.`,
    resume: `Il prezzo di un impianto fotovoltaico cambia con il tetto, la regione, la marca dei moduli e dell'inverter e il lavoro necessario, per questo non pubblichiamo una tabella di prezzi di mercato che nessuno può verificare. Usiamo invece un riferimento pubblico: il decreto CER del Ministero dell'Ambiente fissa in ${IT.eur(P.costi.fv_eur_kw)} per kW, IVA esclusa, il costo massimo ammesso per impianti fino a 20 kW, e il decreto-legge 34/2020 fissa in ${IT.eur(P.costi.accumulo_eur_kwh)} per kWh il limite di spesa per l'accumulo. Con questi valori un impianto da 3 kWp costa ${IT.eur(r3.costo)}, uno da 6 kWp ${IT.eur(r6.costo)} e con 10 kWh di batteria ${IT.eur(r6b.costo)}. La detrazione per il recupero edilizio restituisce il ${IT.pct(P.detrazione.aliquota_prima_casa)} sulla prima casa del proprietario e il ${IT.pct(P.detrazione.aliquota_altri)} negli altri casi, in dieci rate. Il numero più utile per confrontare due preventivi è il costo di ogni kWh prodotto: a Roma, con 6 kWp, ${IT.num(ctKwh(r6.costoNetto, r6.produzione), 1)} centesimi in vent'anni dopo la detrazione, contro i circa 25 centesimi che si pagano in bolletta per materia energia, oneri e imposte.`,
    faqs: [
      { q: 'Quanto costa un impianto fotovoltaico da 6 kW nel 2026?', a: `Al costo di riferimento del decreto CER, ${IT.eur(costoRiferimento(6, 0))} IVA esclusa. Sulla prima casa del proprietario la detrazione restituisce ${IT.eur(d6.totale)} in dieci anni, cioè ${IT.eur(d6.rata)} l'anno; su una seconda casa ${IT.eur(d6s.totale)}. Un preventivo reale può essere più alto o più basso: inserite il totale con IVA nel simulatore e il calcolo si aggiorna.` },
      { q: 'Il costo dell\'impianto cambia da Nord a Sud?', a: `Il prezzo dipende dall'installatore, ma il valore dell'impianto cambia con il sole. Con lo stesso costo, 3 kWp producono ${IT.num(t3.produzione)} kWh l'anno a Torino e ${IT.num(b3.produzione)} a Bari: ogni kWh costa quindi il ${IT.pct(b3.produzione / t3.produzione - 1)} in più a Torino. Per questo il simulatore parte dal comune.` },
      { q: 'Quale prezzo per kW rende ancora conveniente l\'impianto?', a: `Per 3 kWp a Roma, con la detrazione del ${IT.pct(P.detrazione.aliquota_prima_casa)}, l'impianto si ripaga entro ${ANNI} anni finché costa meno di circa ${IT.eur(prezzoPareggio(r3, 3))} per kW. Sopra quel valore il beneficio di vent'anni non copre la spesa netta. È un conto a prezzi costanti, senza degrado dei moduli, che il simulatore rifà con il vostro comune.` },
      { q: 'Che cosa deve contenere un preventivo fotovoltaico?', a: `Marca, modello e numero dei moduli con la potenza totale in kWp, l'inverter, la batteria con la capacità utile, struttura di fissaggio, cavi e quadro, manodopera, pratiche con il distributore e il GSE, e l'IVA applicata. Due preventivi si confrontano dividendo il totale per i kWp e poi per la produzione del vostro comune, non per il prezzo pubblicizzato.` },
    ],
    body: (h) => `
<h2>Il costo per taglia, al riferimento di legge</h2>
${h.table(['Potenza', 'Costo di riferimento', 'Detrazione prima casa', 'Costo netto', 'Produzione a Roma', 'Costo per kWh in 20 anni'], righe.map(({ k, r }) => [`${h.num(k, 1)} kWp`, h.eur(r.costo), h.eur(r.detrazione), h.eur(r.costoNetto), `${h.num(r.produzione)} kWh`, `${h.num(ctKwh(r.costoNetto, r.produzione), 1)} c€`]), `Costo di riferimento ${h.eur(P.costi.fv_eur_kw)} per kW fino a 20 kW (decreto CER, IVA esclusa), detrazione ${h.pct(P.detrazione.aliquota_prima_casa, 0)}, 30° sud, produzione costante per ${ANNI} anni.`, ['l', 'r', 'r', 'r', 'r', 'r'])}
<p>Il ${h.src('dm_cer', 'decreto CER n. 414/2023')} indica ${h.eur(P.costi.fv_eur_kw)} per kW fino a 20 kW e ${h.eur(P.costi.fv_eur_kw_20_200)} per kW fra 20 e 200 kW come costo massimo ammesso per i contributi alle comunità energetiche, IVA esclusa. Non è un listino, ma è l'unico valore pubblico e verificabile sul costo di un impianto; per questo lo usiamo come punto di partenza e lo chiamiamo « riferimento ». Il vostro preventivo, IVA compresa, va nel campo « Costo totale ».</p>

<h2>Il costo per kWh, il numero che conta</h2>
<p>Un impianto più grande costa di più ma produce anche di più, e uno al Sud produce più dello stesso al Nord. Dividere il costo netto per l'energia prodotta in vent'anni rende confrontabili casi diversi. Nella tabella il costo per kWh resta uguale fra 3 e 10 kWp perché il riferimento è lineare; nella realtà le spese fisse, come pratiche e cantiere, pesano di più sugli impianti piccoli, e un preventivo da 3 kWp costa spesso di più per kW di uno da 6.</p>
<p>Il confronto giusto è con il prezzo che evitate: un kWh consumato in casa evita circa 25 centesimi nel 2026, uno immesso in rete vale circa 11 centesimi con il ritiro dedicato. Se il costo per kWh del vostro impianto resta sotto il valore medio dell'energia prodotta, l'impianto si ripaga entro la sua vita.</p>

<h2>Detrazione e pagamento</h2>
<p>La ${h.src('ade_misura', 'detrazione')} si calcola sulla spesa sostenuta, IVA compresa, fino a ${h.eur(P.detrazione.tetto_eur)} per unità immobiliare. L'${h.src('ade_come', 'Agenzia delle Entrate')} chiede il pagamento con bonifico « parlante », con causale, codice fiscale di chi detrae e partita IVA dell'impresa, e per gli interventi con fonti rinnovabili la comunicazione all'ENEA entro ${P.detrazione.enea_giorni} giorni dalla fine dei lavori. La detrazione si usa solo fino all'IRPEF dovuta ogni anno: chi ha poca imposta lorda ne recupera meno.</p>`,
  },
  en: {
    slug: 'solar-system-cost',
    nav: 'Solar system cost',
    card: 'Reference cost per kW, net cost after the tax deduction and what each kWh produced over twenty years costs.',
    title: 'Solar Panel Cost Italy 2026: Net Price and Cost per kWh',
    description: 'Solar panel cost in Italy 2026: the €1,500 per kW legal reference, net cost after the tax deduction and the cost of each kWh produced over twenty years of use.',
    h1: 'What a solar system costs in Italy in 2026, and what you really pay',
    intro: `At the reference of ${EN.eur(P.costi.fv_eur_kw)} per kW, 6 kWp cost ${EN.eur(r6.costo)}; with the ${EN.pct(P.detrazione.aliquota_prima_casa)} deduction ${EN.eur(r6.costoNetto)} remain, or ${EN.num(ctKwh(r6.costoNetto, r6.produzione), 1)} cents per kWh produced in Rome over ${ANNI} years.`,
    resume: `The price of a solar system depends on the roof, the region, the panel and inverter brands and the work involved, which is why we publish no table of market prices that nobody can check. Instead we use a public reference: the energy community decree of the Ministry of Environment sets ${EN.eur(P.costi.fv_eur_kw)} per kW, VAT excluded, as the maximum cost allowed for systems up to 20 kW, and Decree-Law 34/2020 sets ${EN.eur(P.costi.accumulo_eur_kwh)} per kWh as the spending cap for storage. With these values a 3 kWp system costs ${EN.eur(r3.costo)}, a 6 kWp one ${EN.eur(r6.costo)} and, with a 10 kWh battery, ${EN.eur(r6b.costo)}. The home renovation deduction (detrazione) returns ${EN.pct(P.detrazione.aliquota_prima_casa)} on the owner's main home and ${EN.pct(P.detrazione.aliquota_altri)} otherwise, in ten instalments. The most useful figure for comparing quotes is the cost of each kWh produced: in Rome, with 6 kWp, ${EN.num(ctKwh(r6.costoNetto, r6.produzione), 1)} cents over twenty years after the deduction, against the roughly 25 cents paid on the bill for energy, system charges and taxes.`,
    faqs: [
      { q: 'How much does a 6 kW solar system cost in Italy in 2026?', a: `At the energy community decree's reference cost, ${EN.eur(costoRiferimento(6, 0))} excluding VAT. On the owner's main home the deduction returns ${EN.eur(d6.totale)} over ten years, or ${EN.eur(d6.rata)} a year; on a second home ${EN.eur(d6s.totale)}. A real quote may be higher or lower: enter the total including VAT in the calculator and the result updates.` },
      { q: 'Does the cost of solar change between northern and southern Italy?', a: `The price depends on the installer, but the system's value changes with the sun. At the same cost, 3 kWp produce ${EN.num(t3.produzione)} kWh a year in Turin and ${EN.num(b3.produzione)} in Bari, so each kWh costs ${EN.pct(b3.produzione / t3.produzione - 1)} more in Turin. That is why the calculator starts from the comune.` },
      { q: 'Up to what price per kW does solar still pay back?', a: `For 3 kWp in Rome, with the ${EN.pct(P.detrazione.aliquota_prima_casa)} deduction, the system pays back within ${ANNI} years as long as it costs less than about ${EN.eur(prezzoPareggio(r3, 3))} per kW. Above that, twenty years of benefit do not cover the net cost. It is a constant-price sum with no panel degradation, which the calculator redoes for your comune.` },
      { q: 'What should an Italian solar quote include?', a: `Make, model and number of panels with the total size in kWp, the inverter, the battery with its usable capacity, mounting, cables and switchboard, labour, paperwork with the distributor and the GSE, and the VAT rate applied. Compare two quotes by dividing the total by the kWp and then by your comune's output, not by the advertised price.` },
    ],
    body: (h) => `
<h2>Cost by size, at the legal reference</h2>
${h.table(['Size', 'Reference cost', 'Main-home deduction', 'Net cost', 'Output in Rome', 'Cost per kWh over 20 years'], righe.map(({ k, r }) => [`${h.num(k, 1)} kWp`, h.eur(r.costo), h.eur(r.detrazione), h.eur(r.costoNetto), `${h.num(r.produzione)} kWh`, `${h.num(ctKwh(r.costoNetto, r.produzione), 1)} c€`]), `Reference cost ${h.eur(P.costi.fv_eur_kw)} per kW up to 20 kW (energy community decree, VAT excluded), ${h.pct(P.detrazione.aliquota_prima_casa, 0)} deduction, 30° south, constant output for ${ANNI} years.`, ['l', 'r', 'r', 'r', 'r', 'r'])}
<p>The ${h.src('dm_cer', 'energy community decree no. 414/2023')} sets ${h.eur(P.costi.fv_eur_kw)} per kW up to 20 kW and ${h.eur(P.costi.fv_eur_kw_20_200)} per kW between 20 and 200 kW as the maximum cost eligible for energy community grants, VAT excluded. It is not a price list, but it is the only public and checkable figure on what a system costs; so we use it as a starting point and call it a « reference ». Your quote, including VAT, goes in the « Total cost » field.</p>

<h2>Cost per kWh, the figure that matters</h2>
<p>A larger system costs more but also produces more, and one in the South produces more than the same system in the North. Dividing the net cost by twenty years of output makes different cases comparable. In the table the cost per kWh is the same from 3 to 10 kWp because the reference is linear; in reality fixed costs, such as paperwork and site set-up, weigh more on small systems, and a 3 kWp quote often costs more per kW than a 6 kWp one.</p>
<p>The right comparison is with the price you avoid: a kWh used at home avoids about 25 cents in 2026, while one exported earns about 11 cents under the ritiro dedicato. If your system's cost per kWh stays below the average value of the energy it produces, it pays for itself within its lifetime.</p>

<h2>Deduction and payment</h2>
<p>The ${h.src('ade_misura', 'deduction')} is calculated on the amount spent, VAT included, up to ${h.eur(P.detrazione.tetto_eur)} per dwelling. The ${h.src('ade_come', 'Agenzia delle Entrate')} requires payment by a dedicated bank transfer (bonifico parlante) stating the purpose, the tax code of the person claiming and the company's VAT number, and for works using renewables a notice to ENEA within ${P.detrazione.enea_giorni} days of completion. The deduction only offsets the income tax you owe each year: people with little tax recover less.</p>`,
  },
});
