import { defineGuide } from '../../lib/guide-types';
import { citta } from '../../lib/citta-kit';
import { calcola } from '../../lib/engine/fv';
import type { Luogo } from '../../lib/engine/dati';
import { IT, EN, P } from '../../lib/fmt';

/** Torino: la provincia con più comuni d'Italia, dalle valli in ombra (Balme) alle conche alte e soleggiate (Bardonecchia). */
const T = citta('torino');
const cons = T.R.cons_alto;
const prov = T.prov;
const L = (nome: string, ey: number): Luogo => ({ nome, sigla: 'TO', reg: T.c.reg, ey });
const CASI: Array<[Luogo, string, string]> = [
  [L(prov.max[0], prov.max[1]), 'conca alpina aperta', 'open Alpine basin'],
  [T.luogo, 'città', 'city'],
  [L('media provinciale', prov.ey), 'media pesata', 'weighted average'],
  [L(prov.min[0], prov.min[1]), 'valle stretta', 'narrow valley'],
];
const r = (l: Luogo) => calcola({ luogo: l, kwp: 3, tilt: 30, az: 0, consumo: cons, batteria: 0, primaCasa: true });
const to = r(T.luogo), hi = r(CASI[0][0]), lo = r(CASI[3][0]);
const gap = prov.max[1] / prov.min[1] - 1;

export default defineGuide({
  id: 'fotovoltaico-torino',
  group: 'citta',
  order: 40,
  tool: 'rendimento',
  toolPreset: { citta: 'torino', kwp: 3, cons },
  related: ['fotovoltaico-milano', 'fotovoltaico-genova', 'produzione-fotovoltaico-provincia', 'orientamento-pannelli-solari', 'impianto-fotovoltaico-3-kw'],
  sources: ['pvgis', 'geonames', 'arera_consumi', 'gse_rid_prezzi'],
  it: {
    slug: 'fotovoltaico-torino',
    nav: 'Torino',
    card: `${IT.num(T.c.ey)} kWh per kWp in città, da ${IT.num(prov.min[1])} a ${IT.num(prov.max[1])} nei ${prov.n} comuni della provincia.`,
    title: 'Fotovoltaico Torino 2026: città, valli e alta montagna',
    description: 'Fotovoltaico Torino 2026: quanto produce un impianto in città e nei 312 comuni della provincia, dalle valli in ombra alle conche alpine, con il rientro.',
    h1: 'Fotovoltaico a Torino: dalla città alle valli alpine',
    intro: `A Torino 1 kWp produce ${IT.num(T.c.ey)} kWh l'anno. In provincia si va da ${IT.num(prov.min[1])} kWh a ${prov.min[0]} a ${IT.num(prov.max[1])} a ${prov.max[0]}: lo stesso impianto in montagna può produrre il ${IT.pct(gap)} in più o molto meno, secondo la valle.`,
    resume: `La provincia di Torino è quella con più comuni d'Italia, ${prov.n}, e una delle più varie per il fotovoltaico, perché va dalla pianura del Po fino alle valli alpine del confine francese. Abbiamo calcolato la resa di ognuno con PVGIS 5.3, il servizio solare della Commissione europea, che tiene conto delle montagne all'orizzonte. Il capoluogo ha ${IT.num(T.c.ey)} kWh per kWp con moduli a 30° verso sud, la media provinciale pesata sulla popolazione ${IT.num(prov.ey)}. Il risultato sorprendente è che il comune migliore non è in pianura: ${prov.max[0]}, a oltre mille metri in una conca aperta dell'alta Val di Susa, arriva a ${IT.num(prov.max[1])} kWh, grazie all'aria più limpida, alle temperature più basse che migliorano il rendimento dei moduli e a un orizzonte ampio. All'opposto ${prov.min[0]}, in fondo a una valle stretta delle Valli di Lanzo, scende a ${IT.num(prov.min[1])} kWh, perché le montagne nascondono il sole per molte ore d'inverno. Con 3 kWp e il consumo medio piemontese di ${IT.num(cons)} kWh il rientro va da ${IT.anni(hi.rientro)} a ${IT.anni(lo.rientro)}.`,
    faqs: [
      { q: 'Quanto produce un impianto fotovoltaico a Torino?', a: `${IT.kwh(to.produzione)} l'anno con 3 kWp a 30° verso sud, secondo PVGIS 5.3 alle coordinate del comune. A luglio circa ${IT.kwh(to.mesi[6])}, a dicembre ${IT.kwh(to.mesi[11])}. Il Piemonte è nella zona di mercato Nord, dove il ritiro dedicato ha pagato nel 2026 circa ${IT.num(T.ridCt, 1)} centesimi per kWh immesso.` },
      { q: 'Il fotovoltaico conviene in montagna?', a: `Dipende dalla valle più che dall'altitudine. In una conca aperta come ${prov.max[0]} 3 kWp producono ${IT.kwh(hi.produzione)}, più che a Torino; in una valle stretta come ${prov.min[0]} solo ${IT.kwh(lo.produzione)}. Contano l'orizzonte a sud e la neve sui moduli, che PVGIS non considera. Scrivete il vostro comune nel simulatore per il dato reale.` },
      { q: 'La neve sui pannelli riduce la produzione?', a: 'Sì, finché resta sui moduli. Con un\'inclinazione di 30° o più la neve di solito scivola via in pochi giorni di sole, mentre su moduli quasi piatti può restare a lungo. PVGIS non tiene conto della neve, quindi nei comuni di montagna la produzione invernale reale può essere più bassa della stima. Nelle seconde case in quota il consumo invernale è spesso alto proprio quando la produzione cala.' },
      { q: 'Per una seconda casa in montagna il fotovoltaico rende?', a: `La detrazione scende al ${IT.pct(P.detrazione.aliquota_altri)} e il consumo è concentrato nei fine settimana e nelle vacanze, quindi gran parte dell'energia va in rete al prezzo del ritiro dedicato. Con 3 kWp a ${prov.max[0]}, 1 200 kWh di consumo e la detrazione ridotta, il rientro è di ${IT.anni(calcola({ luogo: CASI[0][0], kwp: 3, tilt: 30, az: 0, consumo: 1200, batteria: 0, primaCasa: false }).rientro)}.` },
    ],
    body: (h) => `
<h2>Quattro luoghi della stessa provincia</h2>
${h.table(['Comune', 'Tipo di luogo', 'kWh per kWp', 'Produzione 3 kWp', 'Beneficio annuo', 'Rientro'], CASI.map(([l, t]) => { const x = r(l); return [l.nome, t, h.num(l.ey), `${h.num(x.produzione)} kWh`, h.eur(x.beneficio), `${h.num(x.rientro ?? 0, 1)} anni`]; }), `3 kWp a 30° sud, consumo ${h.num(cons)} kWh, costo di riferimento, detrazione ${h.pct(P.detrazione.aliquota_prima_casa)}.`, ['l', 'l', 'r', 'r', 'r', 'r'])}
<p>La differenza fra il primo e l'ultimo comune è del ${h.pct(gap)} sulla produzione. In euro pesa un po' meno, perché la quota consumata in casa cresce quando la produzione scende, ma resta di un paio d'anni sul rientro. Per questo il simulatore non usa la media della provincia: lavora sulle coordinate del vostro comune, prese dall'elenco ${h.src('geonames', 'GeoNames')}.</p>

<h2>Perché le conche alte producono di più</h2>
<p>Tre fattori. L'aria in quota è più secca e meno inquinata, quindi arriva più radiazione. Le temperature basse migliorano il rendimento dei moduli in silicio, che perdono efficienza quando scaldano. E una conca larga ha l'orizzonte libero, mentre una valle stretta orientata da est a ovest perde il sole basso d'inverno. ${h.src('pvgis', 'PVGIS 5.3')} considera tutti e tre, ma non la neve.</p>
<p>In pianura, invece, la nebbia d'inverno e la foschia estiva abbassano un po' la resa rispetto alle colline. Torino città sta poco sotto la media provinciale perché la media, pesata sugli abitanti, comprende anche i comuni della cintura e delle colline, alcuni più soleggiati.</p>

<h2>Consumi e prezzi in Piemonte</h2>
<p>Il consumo che usiamo, ${h.num(cons)} kWh, è la media ${h.src('arera_consumi', 'ARERA')} per i clienti residenti piemontesi con 3-4,5 kW. L'energia immessa vale i ${h.src('gse_rid_prezzi', 'prezzi GSE')} della zona Nord, un po' più alti che al Sud. La pagina ${h.a('produzione-fotovoltaico-provincia', 'produzione per provincia')} mette Torino a confronto con le altre province alpine, come Cuneo, Aosta e Sondrio.</p>`,
  },
  en: {
    slug: 'solar-panels-turin',
    nav: 'Turin',
    card: `${EN.num(T.c.ey)} kWh per kWp in the city, from ${EN.num(prov.min[1])} to ${EN.num(prov.max[1])} across the province's ${prov.n} comuni.`,
    title: 'Solar Panels Turin 2026: City, Valleys and Mountains',
    description: 'Solar panels in Turin in 2026: what a system produces in the city and in the province\'s 312 comuni, from shaded valleys to Alpine basins, with payback.',
    h1: 'Solar in Turin: from the city to the Alpine valleys',
    intro: `In Turin 1 kWp produces ${EN.num(T.c.ey)} kWh a year. Across the province the range is from ${EN.num(prov.min[1])} kWh in ${prov.min[0]} to ${EN.num(prov.max[1])} in ${prov.max[0]}: the same system in the mountains can produce ${EN.pct(gap)} more, or much less, depending on the valley.`,
    resume: `The province of Turin has more comuni than any other in Italy, ${prov.n}, and is one of the most varied for solar, because it runs from the Po plain to the Alpine valleys on the French border. We computed each one's yield with PVGIS 5.3, the European Commission's solar service, which accounts for mountains on the horizon. The city has ${EN.num(T.c.ey)} kWh per kWp with panels at 30° facing south, the population-weighted provincial average ${EN.num(prov.ey)}. The surprising result is that the best comune is not on the plain: ${prov.max[0]}, above a thousand metres in an open basin of the upper Susa Valley, reaches ${EN.num(prov.max[1])} kWh, thanks to clearer air, lower temperatures that improve panel efficiency and a wide horizon. At the other extreme ${prov.min[0]}, at the end of a narrow valley in the Lanzo Valleys, falls to ${EN.num(prov.min[1])} kWh, because the mountains hide the sun for many winter hours. With 3 kWp and Piedmont's average use of ${EN.num(cons)} kWh, payback ranges from ${EN.anni(hi.rientro)} to ${EN.anni(lo.rientro)}.`,
    faqs: [
      { q: 'How much does a solar system produce in Turin?', a: `${EN.kwh(to.produzione)} a year with 3 kWp at 30° facing south, according to PVGIS 5.3 at the comune's coordinates. About ${EN.kwh(to.mesi[6])} in July and ${EN.kwh(to.mesi[11])} in December. Piedmont is in the North market zone, where the ritiro dedicato paid about ${EN.num(T.ridCt, 1)} cents per exported kWh in 2026.` },
      { q: 'Is solar worth it in the mountains?', a: `It depends on the valley more than the altitude. In an open basin like ${prov.max[0]} 3 kWp produce ${EN.kwh(hi.produzione)}, more than in Turin; in a narrow valley like ${prov.min[0]} only ${EN.kwh(lo.produzione)}. What matters is the southern horizon and snow on the panels, which PVGIS ignores. Enter your comune in the calculator for the real figure.` },
      { q: 'Does snow on the panels reduce output?', a: 'Yes, as long as it stays on the modules. At a tilt of 30° or more snow usually slides off within a few sunny days, while on nearly flat modules it can stay a long time. PVGIS does not account for snow, so in mountain comuni real winter output may be lower than estimated. In holiday homes at altitude winter use is often high just when output drops.' },
      { q: 'Does solar pay on a mountain holiday home?', a: `The deduction falls to ${EN.pct(P.detrazione.aliquota_altri)} and use is concentrated in weekends and holidays, so much of the energy goes to the grid at the ritiro dedicato price. With 3 kWp in ${prov.max[0]}, 1,200 kWh of use and the reduced deduction, payback is ${EN.anni(calcola({ luogo: CASI[0][0], kwp: 3, tilt: 30, az: 0, consumo: 1200, batteria: 0, primaCasa: false }).rientro)}.` },
    ],
    body: (h) => `
<h2>Four places in the same province</h2>
${h.table(['Comune', 'Type of place', 'kWh per kWp', 'Output 3 kWp', 'Yearly benefit', 'Payback'], CASI.map(([l, , t]) => { const x = r(l); return [l.nome === 'media provinciale' ? 'province average' : l.nome, t, h.num(l.ey), `${h.num(x.produzione)} kWh`, h.eur(x.beneficio), `${h.num(x.rientro ?? 0, 1)} years`]; }), `3 kWp at 30° south, ${h.num(cons)} kWh use, reference cost, ${h.pct(P.detrazione.aliquota_prima_casa)} deduction.`, ['l', 'l', 'r', 'r', 'r', 'r'])}
<p>The gap between the first and last comune is ${h.pct(gap)} in output. In euros it weighs a little less, because the share used at home grows as output falls, but it still amounts to a couple of years of payback. That is why the calculator does not use the provincial average: it works on your comune's coordinates, taken from the ${h.src('geonames', 'GeoNames')} list.</p>

<h2>Why high basins produce more</h2>
<p>Three factors. Air at altitude is drier and cleaner, so more radiation arrives. Low temperatures improve the efficiency of silicon modules, which lose output as they heat up. And a wide basin has an open horizon, while a narrow east-west valley loses the low winter sun. ${h.src('pvgis', 'PVGIS 5.3')} accounts for all three, but not for snow.</p>
<p>On the plain, by contrast, winter fog and summer haze lower yield slightly compared with the hills. Turin itself sits just below the provincial average because the population-weighted average also includes the belt and hill comuni, some of them sunnier.</p>

<h2>Use and prices in Piedmont</h2>
<p>The use we apply, ${h.num(cons)} kWh, is the ${h.src('arera_consumi', 'ARERA')} average for Piedmont resident customers with 3-4.5 kW. Exported energy earns the ${h.src('gse_rid_prezzi', 'GSE prices')} of the North zone, a little higher than in the South. The ${h.a('produzione-fotovoltaico-provincia', 'output by province')} page compares Turin with the other Alpine provinces, such as Cuneo, Aosta and Sondrio.</p>`,
  },
});
