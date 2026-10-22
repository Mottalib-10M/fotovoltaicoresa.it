import { defineGuide } from '../../lib/guide-types';
import { calcola, type FvInput } from '../../lib/engine/fv';
import { ROMA, luogoCitta } from '../../lib/engine/dati';
import { IT, EN, P, PROVINCE } from '../../lib/fmt';

/** Conviene? Lo stesso 3 kWp romano in otto scenari sfavorevoli: dove il rientro si allunga e perché. */
const base: FvInput = { luogo: ROMA, kwp: 3, tilt: 30, az: 0, consumo: 2700, batteria: 0, primaCasa: true };
const bz = PROVINCE.find((p) => p.sigla === 'BZ')!;
const montagna = { nome: bz.min[0], sigla: 'BZ', reg: bz.reg, ey: bz.min[1] };
const S: Array<[string, string, Partial<FvInput>]> = [
  ['Caso base: Roma, prima casa, 2 700 kWh', 'Base case: Rome, main home, 2,700 kWh', {}],
  [`Seconda casa (detrazione ${IT.pct(P.detrazione.aliquota_altri)})`, `Second home (${EN.pct(P.detrazione.aliquota_altri)} deduction)`, { primaCasa: false }],
  ['Nessuna imposta da detrarre', 'No tax to deduct from', { detraibile: false }],
  ['Consumo basso, 1 200 kWh', 'Low use, 1,200 kWh', { consumo: 1200 }],
  ['Tetto verso nord a 30°', 'North-facing roof at 30°', { az: 180 }],
  ['Ombra sul 20 % della produzione', 'Shade on 20% of output', { ombra: 0.2 }],
  ['Preventivo a 2 500 € per kW', 'Quote at €2,500 per kW', { costo: 7500 }],
  [`Valle alpina (${montagna.nome})`, `Alpine valley (${montagna.nome})`, { luogo: montagna }],
  ['Tutto insieme: nord, ombra, seconda casa, 2 500 €/kW', 'All at once: north, shade, second home, €2,500/kW', { az: 180, ombra: 0.2, primaCasa: false, costo: 7500 }],
];
const rows = S.map(([a, b, o]) => ({ a, b, x: calcola({ ...base, ...o }) }));
const b0 = rows[0].x, worst = rows[rows.length - 1].x, nd = rows[2].x, pr = rows[6].x;

export default defineGuide({
  id: 'fotovoltaico-conviene',
  group: 'impianto',
  order: 50,
  tool: 'rendimento',
  toolPreset: { kwp: 3, cons: 2700 },
  related: ['costo-impianto-fotovoltaico', 'bonus-fotovoltaico', 'incentivi-fotovoltaico', 'orientamento-pannelli-solari', 'dimensionamento-impianto-fotovoltaico'],
  sources: ['pvgis', 'arera_q4', 'gse_rid_prezzi', 'ade_misura', 'dm_cer'],
  it: {
    slug: 'fotovoltaico-conviene',
    nav: 'Il fotovoltaico conviene?',
    card: 'Quando il fotovoltaico conviene e quando no: otto scenari sfavorevoli e il loro effetto sul rientro.',
    title: 'Fotovoltaico conviene nel 2026? Otto casi in cui rende meno',
    description: 'Fotovoltaico, conviene nel 2026? Rientro e saldo in 20 anni di un impianto da 3 kW in otto casi sfavorevoli: seconda casa, tetto a nord, ombra, preventivo caro.',
    h1: 'Il fotovoltaico conviene ancora nel 2026?',
    intro: `Nel caso tipico, 3 kWp a Roma sulla prima casa, il rientro è di ${IT.anni(b0.rientro)}. Anche sommando tetto a nord, ombra, seconda casa e un preventivo alto si arriva a ${IT.anni(worst.rientro)}: l'impianto si ripaga, ma il margine si assottiglia molto.`,
    resume: `Un impianto fotovoltaico domestico conviene quando il valore dell'energia che produce in vent'anni supera il suo costo netto. Nel 2026 questo valore ha tre parti: l'energia usata in casa, che evita circa 25 centesimi per kWh in bolletta secondo le condizioni ARERA, l'energia venduta al GSE con il ritiro dedicato, a circa 11 o 12 centesimi, e la detrazione fiscale, che restituisce il ${IT.pct(P.detrazione.aliquota_prima_casa)} o il ${IT.pct(P.detrazione.aliquota_altri)} della spesa in dieci anni. Nel caso tipico, 3 kWp a Roma con 2 700 kWh di consumo al costo di riferimento di ${IT.eur(b0.costo)}, il beneficio annuo è di ${IT.eur(b0.beneficio)}, il rientro di ${IT.anni(b0.rientro)} e il saldo dopo vent'anni di ${IT.eur(b0.saldo)}, a prezzi costanti. Lo abbiamo messo alla prova con otto scenari sfavorevoli. Sul rientro il preventivo caro pesa più di tutto: a 2 500 euro per kW il rientro sale a ${IT.anni(pr.rientro)}. Chi non ha imposta da detrarre aspetta ${IT.anni(nd.rientro)}. Il caso peggiore, con tutti i difetti insieme, rientra in ${IT.anni(worst.rientro)}.`,
    faqs: [
      { q: 'In quanti anni si ripaga un impianto fotovoltaico?', a: `Nel caso tipico, 3 kWp a Roma sulla prima casa al costo di riferimento, in ${IT.anni(b0.rientro)}, grazie alla detrazione che restituisce metà della spesa. Senza detrazione in ${IT.anni(nd.rientro)}. Il calcolo tiene i prezzi costanti e ignora il calo di rendimento dei moduli: con prezzi dell'energia più alti il rientro si accorcia, con prezzi più bassi si allunga.` },
      { q: 'Quando il fotovoltaico non conviene?', a: `Quando il tetto è molto ombreggiato, quando il preventivo è molto sopra il riferimento di ${IT.eur(P.costi.fv_eur_kw)} per kW o quando la casa resterà vostra per pochi anni. Nei nostri scenari nessun caso supera i vent'anni di rientro, ma il caso peggiore lascia un saldo di soli ${IT.eur(worst.saldo)} dopo vent'anni, per un investimento di ${IT.eur(worst.costo)}.` },
      { q: 'Il prezzo dell\'energia che scende rende il fotovoltaico inutile?', a: 'No, ma allunga il rientro. Il simulatore usa la media 2026 dei prezzi ARERA e del ritiro dedicato: inserite nel campo « Prezzo energia » un valore più basso per vedere l\'effetto. Un impianto domestico dura in genere più di vent\'anni, quindi attraversa periodi di prezzi alti e bassi.' },
      { q: 'Conviene di più il fotovoltaico al Sud?', a: `Produce di più, ma il ritiro dedicato paga un po' meno per kWh nelle zone meridionali, e il costo è lo stesso. Nei nostri calcoli lo stesso impianto da 3 kWp rientra in circa cinque anni in tutte le grandi città. Il fattore che cambia davvero il risultato è il tetto: esposizione e ombre contano più della latitudine.` },
    ],
    body: (h) => `
<h2>Lo stesso impianto in nove scenari</h2>
${h.table(['Scenario', 'Beneficio annuo', 'Costo', 'Rientro', 'Saldo in 20 anni'], rows.map(({ a, x }) => [a, h.eur(x.beneficio), h.eur(x.costo), x.rientro === null ? 'oltre 20 anni' : `${h.num(x.rientro, 1)} anni`, h.eur(x.saldo)]), '3 kWp, 30° sud salvo indicazione, consumo 2 700 kWh, prezzi 2026 costanti, nessun degrado dei moduli.', ['l', 'r', 'r', 'r', 'r'])}

<h2>Che cosa pesa di più</h2>
<p>Il prezzo pagato. Il ${h.src('dm_cer', 'riferimento del decreto CER')} è ${h.eur(P.costi.fv_eur_kw)} per kW, IVA esclusa; un preventivo a 2 500 euro per kW allunga il rientro più di un tetto a nord. Poi la detrazione: chi ha poca IRPEF, come molti pensionati, perde la parte di ogni rata che supera l'imposta dovuta, perché la ${h.src('ade_misura', 'detrazione')} riduce l'IRPEF e non dà rimborsi. Infine il tetto: l'ombra fissa riduce la produzione in proporzione, l'esposizione a nord quasi la dimezza.</p>
<p>Il consumo basso conta meno di quanto si pensi, perché l'energia non usata viene venduta con il ${h.src('gse_rid_prezzi', 'ritiro dedicato')}, ma ogni kWh venduto vale meno della metà di uno usato al prezzo delle ${h.src('arera_q4', 'condizioni ARERA')}. Le stime di produzione vengono da ${h.src('pvgis', 'PVGIS 5.3')}.</p>

<h2>I limiti di questo conto</h2>
<p>Il calcolo non sconta il denaro nel tempo, non include manutenzione né sostituzione dell'inverter, e tiene costanti prezzi e produzione. Sono semplificazioni dichiarate nella pagina del metodo: servono a confrontare scenari, non a promettere un rendimento. Il vostro caso si calcola nel simulatore qui sopra, partendo dal comune.</p>`,
  },
  en: {
    slug: 'is-solar-worth-it-italy',
    nav: 'Is solar worth it?',
    card: 'When solar pays in Italy and when it does not: eight unfavourable scenarios and their effect on payback.',
    title: 'Is Solar Worth It in Italy in 2026? Eight Tougher Cases',
    description: 'Is solar worth it in Italy in 2026? Payback and 20-year balance of a 3 kW system in eight unfavourable cases: second home, north roof, shade or a high quote.',
    h1: 'Is solar still worth it in Italy in 2026?',
    intro: `In the typical case, 3 kWp in Rome on a main home, payback is ${EN.anni(b0.rientro)}. Even combining a north roof, shade, a second home and a high quote gives ${EN.anni(worst.rientro)}: the system still pays for itself, but the margin becomes very thin.`,
    resume: `A home solar system pays off when the value of the energy it produces over twenty years exceeds its net cost. In 2026 that value has three parts: energy used at home, which avoids about 25 cents per kWh on the bill according to ARERA conditions, energy sold to the GSE under the ritiro dedicato, at about 11 or 12 cents, and the tax deduction, which returns ${EN.pct(P.detrazione.aliquota_prima_casa)} or ${EN.pct(P.detrazione.aliquota_altri)} of the cost over ten years. In the typical case, 3 kWp in Rome with 2,700 kWh of use at the reference cost of ${EN.eur(b0.costo)}, the yearly benefit is ${EN.eur(b0.beneficio)}, payback ${EN.anni(b0.rientro)} and the balance after twenty years ${EN.eur(b0.saldo)}, at constant prices. We tested it against eight unfavourable scenarios. On payback an expensive quote weighs most: at 2,500 euros per kW payback rises to ${EN.anni(pr.rientro)}. Someone with no tax to deduct from waits ${EN.anni(nd.rientro)}. The worst case, with every drawback together, pays back in ${EN.anni(worst.rientro)}.`,
    faqs: [
      { q: 'How many years does a solar system take to pay back in Italy?', a: `In the typical case, 3 kWp in Rome on a main home at the reference cost, ${EN.anni(b0.rientro)}, thanks to the deduction returning half the cost. Without the deduction ${EN.anni(nd.rientro)}. The sum keeps prices constant and ignores panel degradation: with higher energy prices payback shortens, with lower ones it lengthens.` },
      { q: 'When is solar not worth it?', a: `When the roof is heavily shaded, when the quote is far above the ${EN.eur(P.costi.fv_eur_kw)} per kW reference or when the home will be yours for only a few years. In our scenarios no case goes beyond twenty years, but the worst leaves a balance of only ${EN.eur(worst.saldo)} after twenty years, for an investment of ${EN.eur(worst.costo)}.` },
      { q: 'Do falling energy prices make solar pointless?', a: 'No, but they lengthen payback. The calculator uses the 2026 average of ARERA prices and the ritiro dedicato: enter a lower value in the « Energy price » field to see the effect. A home system usually lasts more than twenty years, so it goes through periods of high and low prices.' },
      { q: 'Is solar more worthwhile in southern Italy?', a: `It produces more, but the ritiro dedicato pays slightly less per kWh in southern zones, and the cost is the same. In our calculations the same 3 kWp system pays back in about five years in every large city. The factor that really changes the result is the roof: facing and shade matter more than latitude.` },
    ],
    body: (h) => `
<h2>The same system in nine scenarios</h2>
${h.table(['Scenario', 'Yearly benefit', 'Cost', 'Payback', '20-year balance'], rows.map(({ b, x }) => [b, h.eur(x.beneficio), h.eur(x.costo), x.rientro === null ? 'over 20 years' : `${h.num(x.rientro, 1)} years`, h.eur(x.saldo)]), '3 kWp, 30° south unless stated, 2,700 kWh use, constant 2026 prices, no panel degradation.', ['l', 'r', 'r', 'r', 'r'])}

<h2>What weighs most</h2>
<p>The price paid. The ${h.src('dm_cer', 'energy community decree reference')} is ${h.eur(P.costi.fv_eur_kw)} per kW, VAT excluded; a quote at 2,500 euros per kW lengthens payback more than a north roof. Then the deduction: people with little income tax, like many pensioners, lose the part of each instalment above the tax due, because the ${h.src('ade_misura', 'deduction')} reduces income tax and pays no refund. Finally the roof: fixed shade cuts output proportionally, and facing north almost halves it.</p>
<p>Low use matters less than one might think, because unused energy is sold under the ${h.src('gse_rid_prezzi', 'ritiro dedicato')}, but each kWh sold is worth less than half one used at the price of the ${h.src('arera_q4', 'ARERA conditions')}. Output estimates come from ${h.src('pvgis', 'PVGIS 5.3')}.</p>

<h2>The limits of this sum</h2>
<p>The calculation does not discount money over time, includes neither maintenance nor inverter replacement, and holds prices and output constant. These simplifications are stated on the method page: they serve to compare scenarios, not to promise a return. Your own case is worked out in the calculator above, starting from your comune.</p>`,
  },
});
