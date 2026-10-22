import { defineGuide } from '../../lib/guide-types';
import { calcola, PREZZO_EVITATO_CT, valoreRidKwh } from '../../lib/engine/fv';
import { ROMA } from '../../lib/engine/dati';
import { P, IT, EN } from '../../lib/fmt';
import { displayDate } from '../../lib/format';

/** Scambio sul posto chiuso: date ARERA/GSE; chi installa oggi usa il ritiro dedicato. Nessun calcolo SSP inventato. */
const S = P.ssp;
const KWP = [3, 4.5, 6];
const r = (kwp: number, bat = 0) => calcola({ luogo: ROMA, kwp, tilt: 30, az: 0, consumo: 2700, batteria: bat, primaCasa: true });
const a = r(4.5), ab = r(4.5, 5);
const rid = valoreRidKwh(ROMA.reg) * 100;
const rapporto = PREZZO_EVITATO_CT / rid;
const dIT = (iso: string) => displayDate(iso, 'it-IT');
const dEN = (iso: string) => displayDate(iso, 'en-GB');

export default defineGuide({
  id: 'scambio-sul-posto',
  group: 'incentivi',
  order: 30,
  tool: 'rid',
  toolPreset: { kwp: 4.5, cons: 2700 },
  related: ['ritiro-dedicato', 'fotovoltaico-con-accumulo', 'comunita-energetiche', 'incentivi-fotovoltaico'],
  sources: ['gse_ssp', 'arera_213', 'gse_rid', 'arera_q4'],
  it: {
    slug: 'scambio-sul-posto',
    nav: 'Scambio sul posto',
    card: 'Lo scambio sul posto è chiuso ai nuovi impianti: date, cosa resta a chi lo ha e cosa usa chi installa oggi.',
    title: 'Scambio sul posto 2026: chiuso, cosa usare al suo posto',
    description: 'Scambio sul posto 2026: le date di chiusura fissate da ARERA, chi può ancora usarlo e quanto rende oggi l\'energia immessa con il ritiro dedicato del GSE.',
    h1: 'Scambio sul posto chiuso: cosa cambia per chi installa nel 2026',
    intro: `Le nuove domande di scambio sul posto si potevano presentare fino al ${dIT(S.ultimo_giorno_domande)}, e solo per impianti in esercizio entro il ${dIT(S.esercizio_entro)}. Chi installa oggi vende il surplus al GSE: a Roma circa ${IT.num(rid, 1)} centesimi per kWh.`,
    resume: `Lo scambio sul posto era il meccanismo con cui il GSE compensava l'energia immessa in rete con quella prelevata in altre ore, restituendo un contributo in conto scambio. Con la delibera 213/2025 l'ARERA ha chiuso l'accesso ai nuovi impianti: le domande si sono potute presentare fino al ${dIT(S.ultimo_giorno_domande)} e solo per impianti entrati in esercizio entro il ${dIT(S.esercizio_entro)}. Per un impianto installato nel 2026 l'alternativa è il ritiro dedicato, in cui il GSE paga l'energia immessa al prezzo zonale orario o al prezzo minimo garantito. La differenza pratica è che ogni kWh usato in casa vale molto più di uno immesso: a Roma circa ${IT.num(PREZZO_EVITATO_CT, 1)} centesimi contro ${IT.num(rid, 1)}, cioè ${IT.num(rapporto, 1)} volte tanto. Per questo, senza scambio sul posto, conviene dimensionare l'impianto sul consumo e valutare una batteria o una comunità energetica. Con 4,5 kWp e 2 700 kWh di consumo un impianto romano immette ${IT.kwh(a.immessa)} l'anno e ne ricava ${IT.eur(a.ricavoRid)}.`,
    faqs: [
      { q: 'Lo scambio sul posto esiste ancora nel 2026?', a: `Non per i nuovi impianti. L'ultimo giorno per presentare la domanda era il ${dIT(S.ultimo_giorno_domande)}, e valeva solo per gli impianti in esercizio entro il ${dIT(S.esercizio_entro)}, secondo la delibera ARERA 213/2025 e la nota del GSE. Chi lo aveva già attivo segue le condizioni della propria convenzione: controllate le comunicazioni del GSE nell'area clienti.` },
      { q: 'Cosa sostituisce lo scambio sul posto?', a: `Il ritiro dedicato: il GSE compra l'energia immessa al prezzo di mercato della vostra zona, con un minimo garantito di ${IT.num(P.rid.pmg_eur_mwh, 1)} euro per MWh per il 2026. In aggiunta si può entrare in una comunità energetica, che paga una tariffa premio sull'energia condivisa per ${P.cer.durata_anni} anni. Le due cose sono compatibili.` },
      { q: 'Senza scambio sul posto la batteria conviene di più?', a: `Sposta energia dal giorno alla sera, quindi trasforma kWh pagati ${IT.num(rid, 1)} centesimi in kWh che ne valgono ${IT.num(PREZZO_EVITATO_CT, 1)}. A Roma, con 4,5 kWp, una batteria da 5 kWh porta la quota usata in casa dal ${IT.pct(a.quota)} al ${IT.pct(ab.quota)}. Se si ripaghi dipende dal suo prezzo: il simulatore dell'accumulo fa il conto.` },
    ],
    body: (h) => `
<h2>Le date della chiusura</h2>
<ul>
<li><strong>${h.date(S.esercizio_entro)}</strong>: ultimo giorno di entrata in esercizio per poter chiedere lo scambio sul posto.</li>
<li><strong>${h.date(S.ultimo_giorno_domande)}</strong>: ultimo giorno per presentare la domanda al GSE.</li>
<li>Dal giorno dopo: per i nuovi impianti l'energia immessa si valorizza con il ${h.a('ritiro-dedicato', 'ritiro dedicato')}.</li>
</ul>
<p>Le date vengono dalla ${h.src('arera_213', 'delibera ARERA 213/2025')} e dalla pagina del ${h.src('gse_ssp', 'GSE sullo stop al meccanismo')}. Se il vostro impianto ha già lo scambio sul posto, nulla cambia con questa pagina: le regole sono quelle della convenzione in essere.</p>

<h2>Quanto vale oggi l'energia immessa</h2>
${h.table(['Impianto', 'Energia immessa', 'Ricavo ritiro dedicato', 'Risparmio in bolletta'], KWP.map((k) => { const x = r(k); return [`${h.num(k, 1)} kWp`, `${h.num(x.immessa)} kWh`, h.eur(x.ricavoRid), h.eur(x.risparmio)]; }), 'Roma, consumo 2 700 kWh, 30° sud, senza batteria, corrispettivo GSE sottratto dal ricavo nel simulatore.', ['l', 'r', 'r', 'r'])}
<p>Il ricavo del ritiro dedicato supera il risparmio in bolletta perché l'energia immessa è la maggior parte della produzione. Ma ogni kWh in più consumato in casa, per esempio spostando lavatrice e lavastoviglie nelle ore di sole, vale ${h.num(rapporto, 1)} volte uno immesso. Il prezzo evitato viene dalle ${h.src('arera_q4', 'condizioni ARERA')} del 2026.</p>`,
  },
  en: {
    slug: 'net-metering-italy-scambio-sul-posto',
    nav: 'Net metering (closed)',
    card: 'Net metering is closed to new systems: dates, what remains for those who have it and what new installs use.',
    title: 'Scambio sul Posto 2026: Italy\'s Net Metering Has Closed',
    description: 'Scambio sul posto 2026: the net metering closing dates set by ARERA, who can still use it and what exported energy is worth today under the GSE ritiro dedicato.',
    h1: 'Net metering closed: what changes if you install solar in 2026',
    intro: `New net metering (scambio sul posto) applications were accepted until ${dEN(S.ultimo_giorno_domande)}, and only for systems in operation by ${dEN(S.esercizio_entro)}. Anyone installing today sells the surplus to the GSE: about ${EN.num(rid, 1)} cents per kWh in Rome.`,
    resume: `Scambio sul posto was the mechanism by which the GSE offset energy sent to the grid against energy drawn at other times, paying back an exchange contribution. With resolution 213/2025 ARERA, the energy regulator, closed it to new systems: applications could be filed until ${dEN(S.ultimo_giorno_domande)} and only for systems in operation by ${dEN(S.esercizio_entro)}. For a system installed in 2026 the alternative is the ritiro dedicato, in which the GSE pays for exported energy at the hourly zonal price or the guaranteed minimum price. The practical difference is that each kWh used at home is worth much more than one exported: in Rome about ${EN.num(PREZZO_EVITATO_CT, 1)} cents against ${EN.num(rid, 1)}, or ${EN.num(rapporto, 1)} times as much. So, without net metering, it pays to size the system on consumption and to consider a battery or an energy community. With 4.5 kWp and 2,700 kWh of use a system in Rome exports ${EN.kwh(a.immessa)} a year and earns ${EN.eur(a.ricavoRid)} from it.`,
    faqs: [
      { q: 'Does scambio sul posto still exist in 2026?', a: `Not for new systems. The last day to apply was ${dEN(S.ultimo_giorno_domande)}, and only for systems in operation by ${dEN(S.esercizio_entro)}, according to ARERA resolution 213/2025 and the GSE notice. People who already had it follow the terms of their own agreement: check the GSE messages in your customer area.` },
      { q: 'What replaces net metering in Italy?', a: `The ritiro dedicato: the GSE buys exported energy at your zone's market price, with a guaranteed minimum of ${EN.num(P.rid.pmg_eur_mwh, 1)} euros per MWh for 2026. On top of that you can join an energy community, which pays a premium on shared energy for ${P.cer.durata_anni} years. The two are compatible.` },
      { q: 'Without net metering, is a battery worth more?', a: `It moves energy from day to evening, turning kWh paid ${EN.num(rid, 1)} cents into kWh worth ${EN.num(PREZZO_EVITATO_CT, 1)}. In Rome, with 4.5 kWp, a 5 kWh battery raises the share used at home from ${EN.pct(a.quota)} to ${EN.pct(ab.quota)}. Whether it pays back depends on its price: the storage calculator does the sum.` },
    ],
    body: (h) => `
<h2>The closing dates</h2>
<ul>
<li><strong>${h.date(S.esercizio_entro)}</strong>: last day of entry into operation to be able to request net metering.</li>
<li><strong>${h.date(S.ultimo_giorno_domande)}</strong>: last day to apply to the GSE.</li>
<li>From the next day: for new systems, exported energy is paid under the ${h.a('ritiro-dedicato', 'ritiro dedicato')}.</li>
</ul>
<p>The dates come from ${h.src('arera_213', 'ARERA resolution 213/2025')} and the ${h.src('gse_ssp', 'GSE page on the end of the scheme')}. If your system already has net metering, nothing on this page changes it: the rules are those of your existing agreement.</p>

<h2>What exported energy is worth today</h2>
${h.table(['System', 'Energy exported', 'Ritiro dedicato income', 'Bill saving'], KWP.map((k) => { const x = r(k); return [`${h.num(k, 1)} kWp`, `${h.num(x.immessa)} kWh`, h.eur(x.ricavoRid), h.eur(x.risparmio)]; }), 'Rome, 2,700 kWh use, 30° south, no battery; the calculator subtracts the GSE fee from the income.', ['l', 'r', 'r', 'r'])}
<p>Ritiro dedicato income exceeds the bill saving because exported energy is most of the output. But each extra kWh used at home, for example by running the washing machine and dishwasher in sunny hours, is worth ${h.num(rapporto, 1)} times an exported one. The avoided price comes from ARERA's 2026 ${h.src('arera_q4', 'tariff conditions')}.</p>`,
  },
});
