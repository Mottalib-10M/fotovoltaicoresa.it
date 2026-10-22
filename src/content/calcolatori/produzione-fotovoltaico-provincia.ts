import { defineGuide } from '../../lib/guide-types';
import { P, IT, EN, ITALIA, PROVINCE, REGIONI } from '../../lib/fmt';

/** Produzione per provincia: 107 province, media pesata sulla popolazione, comune migliore e peggiore (PVGIS 5.3). */
const ord = [...PROVINCE].sort((a, b) => b.ey - a.ey);
const top = ord[0], ult = ord[ord.length - 1];
const spread = [...PROVINCE].sort((a, b) => (b.max[1] - b.min[1]) - (a.max[1] - a.min[1]));
const largo = spread[0], stretto = spread[spread.length - 1];
const sopraMedia = PROVINCE.filter((p) => p.ey >= ITALIA.ey).length;
const rm = PROVINCE.find((p) => p.sigla === 'RM')!, mi = PROVINCE.find((p) => p.sigla === 'MI')!;
const pct3 = (p: typeof top) => p.ey * 3;

export default defineGuide({
  id: 'produzione-fotovoltaico-provincia',
  group: 'calcolo',
  order: 25,
  tool: 'produzione',
  toolPreset: { kwp: 3, cons: 2700 },
  related: ['quanto-produce-un-impianto-fotovoltaico', 'orientamento-pannelli-solari', 'impianto-fotovoltaico-3-kw', 'fotovoltaico-conviene'],
  sources: ['pvgis', 'geonames'],
  it: {
    slug: 'produzione-fotovoltaico-provincia',
    nav: 'Produzione per provincia',
    card: 'Le 107 province italiane in ordine di resa, con il comune migliore e il peggiore di ognuna.',
    title: 'Produzione fotovoltaico per provincia 2026: le 107 province',
    description: 'Produzione fotovoltaico per provincia 2026: kWh per kWp nelle 107 province, media pesata sulla popolazione, con il comune più soleggiato e il meno soleggiato.',
    h1: 'Produzione fotovoltaica nelle 107 province italiane',
    intro: `Al primo posto ${top.nome} con ${IT.num(top.ey)} kWh per kWp, all'ultimo ${ult.nome} con ${IT.num(ult.ey)}: lo stesso impianto da 3 kWp produce ${IT.kwh(pct3(top))} nella prima e ${IT.kwh(pct3(ult))} nell'ultima.`,
    resume: `Abbiamo calcolato la resa fotovoltaica di ognuno dei ${IT.num(ITALIA.n_comuni)} comuni italiani con PVGIS 5.3, il servizio solare del Centro comune di ricerca della Commissione europea, per moduli a 30° verso sud con il ${IT.num(P.modello.perdite_pct)} % di perdite. Poi abbiamo raggruppato i comuni per provincia e fatto la media pesata sulla popolazione, così il dato rappresenta dove vive la gente e non le montagne disabitate. La classifica va da ${top.nome}, con ${IT.num(top.ey)} kWh per kWp, a ${ult.nome}, con ${IT.num(ult.ey)}; la media nazionale è ${IT.num(ITALIA.ey)} e ${sopraMedia} province su ${PROVINCE.length} stanno sopra. Dentro la stessa provincia le differenze possono essere grandi: in quella di ${largo.nome} si va da ${IT.num(largo.min[1])} kWh a ${largo.min[0]} a ${IT.num(largo.max[1])} a ${largo.max[0]}, perché valli e versanti in ombra cambiano il sole disponibile. Per questo il simulatore lavora per comune: la media provinciale serve a confrontare, non a progettare un impianto.`,
    faqs: [
      { q: 'Qual è la provincia italiana dove il fotovoltaico produce di più?', a: `${top.nome}, con ${IT.num(top.ey)} kWh per kWp in media pesata sulla popolazione, seguita da ${ord[1].nome} e ${ord[2].nome}. Le prime posizioni sono tutte in Sicilia e Sardegna, dove l'irraggiamento è più alto e gli inverni sono più luminosi. Il singolo comune migliore d'Italia è ${ITALIA.max_nome}, con ${IT.num(ITALIA.ey_max)} kWh.` },
      { q: 'Nelle province del Nord il fotovoltaico conviene?', a: `Sì: anche ${ult.nome}, ultima in classifica, fa ${IT.num(ult.ey)} kWh per kWp, il ${IT.pct(ult.ey / top.ey)} della prima. Al Nord inoltre il ritiro dedicato paga un po' di più per l'energia immessa, perché il prezzo zonale è più alto. La differenza di produzione allunga il rientro di circa un anno, non lo cancella.` },
      { q: 'Perché la media della provincia è diversa dal mio comune?', a: `La media pesa ogni comune per i suoi abitanti, quindi conta soprattutto il capoluogo. Un comune di montagna può stare molto sotto: nella provincia di Roma si va da ${IT.num(rm.min[1])} kWh a ${rm.min[0]} a ${IT.num(rm.max[1])} a ${rm.max[0]}. Scrivete il vostro comune nel simulatore per avere il dato preciso.` },
    ],
    body: (h) => `
<!--mini:provincia-->
<h2>Tutte le province in ordine di resa</h2>
${h.table(['#', 'Provincia', 'Regione', 'kWh/kWp', 'Comune migliore', 'Comune peggiore'], ord.map((p, i) => [i + 1, `${p.nome} (${p.sigla})`, REGIONI[p.reg].nome, h.num(p.ey), `${p.max[0]} ${h.num(p.max[1])}`, `${p.min[0]} ${h.num(p.min[1])}`]), 'PVGIS 5.3, 30° sud, perdite 14 %. Media dei comuni pesata sulla popolazione.', ['r', 'l', 'l', 'r', 'l', 'l'])}

<h2>Come leggere la tabella</h2>
<p>La colonna kWh/kWp moltiplicata per la potenza dà la produzione annua: con 3 kWp a Milano ${h.num(mi.ey * 3)} kWh, a Roma ${h.num(rm.ey * 3)} kWh. Le due colonne a destra mostrano quanto varia il sole dentro la provincia. La provincia più omogenea è ${stretto.nome}, dove fra il comune migliore e il peggiore ci sono ${h.num(stretto.max[1] - stretto.min[1])} kWh; la più varia è ${largo.nome}, con ${h.num(largo.max[1] - largo.min[1])} kWh di scarto.</p>
<p>I dati vengono da ${h.src('pvgis', 'PVGIS 5.3')}, interrogato alle coordinate di ogni comune dell'elenco ${h.src('geonames', 'GeoNames')}, con l'orizzonte calcolato dal servizio. Le province sono le 107 dell'elenco amministrativo usato da GeoNames. La resa di un tetto reale dipende anche da orientamento e ombre, che trovate nella pagina ${h.a('orientamento-pannelli-solari', 'orientamento dei pannelli')}.</p>`,
  },
  en: {
    slug: 'solar-output-by-province',
    nav: 'Output by province',
    card: 'Italy\'s 107 provinces ranked by solar yield, with the best and worst comune in each.',
    title: 'Solar Output by Province Italy 2026: All 107 Provinces',
    description: 'Solar output by province in Italy 2026: kWh per kWp across all 107 provinces, weighted by population, with the sunniest and the least sunny comune in each.',
    h1: 'Solar output across Italy\'s 107 provinces',
    intro: `First is ${top.nome} with ${EN.num(top.ey)} kWh per kWp, last ${ult.nome} with ${EN.num(ult.ey)}: the same 3 kWp system produces ${EN.kwh(pct3(top))} in the first and ${EN.kwh(pct3(ult))} in the last.`,
    resume: `We calculated the solar yield of each of Italy's ${EN.num(ITALIA.n_comuni)} comuni with PVGIS 5.3, the solar service of the European Commission's Joint Research Centre, for panels at 30° facing south with ${EN.num(P.modello.perdite_pct)}% losses. We then grouped the comuni by province and took the population-weighted average, so the figure reflects where people live rather than empty mountains. The ranking runs from ${top.nome}, with ${EN.num(top.ey)} kWh per kWp, to ${ult.nome}, with ${EN.num(ult.ey)}; the national average is ${EN.num(ITALIA.ey)} and ${sopraMedia} of the ${PROVINCE.length} provinces are above it. Within one province the gaps can be large: in ${largo.nome} the range goes from ${EN.num(largo.min[1])} kWh in ${largo.min[0]} to ${EN.num(largo.max[1])} in ${largo.max[0]}, because valleys and shaded slopes change the sun available. That is why the calculator works by comune: the provincial average is for comparing, not for designing a system.`,
    faqs: [
      { q: 'Which Italian province has the highest solar output?', a: `${top.nome}, with ${EN.num(top.ey)} kWh per kWp as a population-weighted average, followed by ${ord[1].nome} and ${ord[2].nome}. The top places are all in Sicily and Sardinia, where irradiance is higher and winters are brighter. The single best comune in Italy is ${ITALIA.max_nome}, with ${EN.num(ITALIA.ey_max)} kWh.` },
      { q: 'Is solar worth it in northern Italian provinces?', a: `Yes: even ${ult.nome}, last in the ranking, gets ${EN.num(ult.ey)} kWh per kWp, ${EN.pct(ult.ey / top.ey)} of the first. In the North the ritiro dedicato also pays a little more for exported energy, because the zonal price is higher. The output gap lengthens payback by about a year; it does not cancel it.` },
      { q: 'Why does the province average differ from my comune?', a: `The average weights each comune by its population, so the provincial capital counts most. A mountain comune can be well below: in the province of Rome the range is from ${EN.num(rm.min[1])} kWh in ${rm.min[0]} to ${EN.num(rm.max[1])} in ${rm.max[0]}. Type your comune into the calculator for the exact figure.` },
    ],
    body: (h) => `
<!--mini:provincia-->
<h2>Every province ranked by yield</h2>
${h.table(['#', 'Province', 'Region', 'kWh/kWp', 'Best comune', 'Worst comune'], ord.map((p, i) => [i + 1, `${p.nome} (${p.sigla})`, REGIONI[p.reg].en, h.num(p.ey), `${p.max[0]} ${h.num(p.max[1])}`, `${p.min[0]} ${h.num(p.min[1])}`]), 'PVGIS 5.3, 30° south, 14% losses. Population-weighted average of the comuni.', ['r', 'l', 'l', 'r', 'l', 'l'])}

<h2>How to read the table</h2>
<p>The kWh/kWp column times the system size gives yearly output: with 3 kWp, ${h.num(mi.ey * 3)} kWh in Milan and ${h.num(rm.ey * 3)} kWh in Rome. The two right-hand columns show how much the sun varies within the province. The most uniform province is ${stretto.nome}, where the best and worst comune are ${h.num(stretto.max[1] - stretto.min[1])} kWh apart; the most varied is ${largo.nome}, with a ${h.num(largo.max[1] - largo.min[1])} kWh gap.</p>
<p>The data come from ${h.src('pvgis', 'PVGIS 5.3')}, queried at the coordinates of each comune in the ${h.src('geonames', 'GeoNames')} list, with the horizon computed by the service. The provinces are the 107 of the administrative list used by GeoNames. A real roof's yield also depends on facing and shade, covered on the ${h.a('orientamento-pannelli-solari', 'panel orientation')} page.</p>`,
  },
});
