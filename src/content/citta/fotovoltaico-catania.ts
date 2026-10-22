import { defineGuide } from '../../lib/guide-types';
import { citta } from '../../lib/citta-kit';
import { pannelli } from '../../lib/engine/fv';
import { IT, EN, P, CITTA } from '../../lib/fmt';

/** Catania: la resa più alta fra le grandi città; quanti kWp servono per 3 000 kWh città per città; l'Etna in provincia. */
const C = citta('catania'), M = citta('milano');
const cons = C.R.cons_alto;
const TARGET = 3000;
const rank = Object.keys(CITTA).map((s) => ({ s, ey: CITTA[s].ey, kwp: TARGET / CITTA[s].ey })).sort((a, b) => b.ey - a.ey);
const pos = rank.findIndex((r) => r.s === 'catania') + 1;
const r3 = C.calc(3, cons), m3 = M.calc(3, cons);
const dic = (r: typeof r3) => r.mesi[11];
const prov = C.prov;
const kC = TARGET / C.c.ey, kM = TARGET / M.c.ey;

export default defineGuide({
  id: 'fotovoltaico-catania',
  group: 'citta',
  order: 100,
  tool: 'produzione',
  toolPreset: { citta: 'catania', kwp: 3, cons },
  related: ['fotovoltaico-palermo', 'fotovoltaico-cagliari', 'quanto-produce-un-impianto-fotovoltaico', 'produzione-fotovoltaico-provincia', 'pannelli-fotovoltaici'],
  sources: ['pvgis', 'gse_rid_prezzi', 'arera_consumi', 'geonames'],
  it: {
    slug: 'fotovoltaico-catania',
    nav: 'Catania',
    card: `${IT.num(C.c.ey)} kWh per kWp, la resa più alta fra le dodici città; l'Etna in provincia.`,
    title: 'Fotovoltaico Catania 2026: la resa più alta fra le città',
    description: 'Fotovoltaico Catania 2026: la resa per kWp più alta fra le grandi città, quanti kWp servono per 3 000 kWh, la produzione d\'inverno e i comuni dell\'Etna.',
    h1: 'Fotovoltaico a Catania: la città che produce di più',
    intro: `Con ${IT.num(C.c.ey)} kWh per kWp Catania è ${pos === 1 ? 'la prima' : `la ${pos}ª`} delle dodici grandi città che confrontiamo. Per produrre ${IT.num(TARGET)} kWh l'anno bastano ${IT.num(kC, 2)} kWp, contro ${IT.num(kM, 2)} a Milano.`,
    resume: `Catania, sulla costa orientale della Sicilia ai piedi dell'Etna, ha la resa fotovoltaica più alta fra le dodici grandi città italiane di questo sito: secondo PVGIS 5.3, alle coordinate del comune, un impianto con moduli a 30° verso sud produce ${IT.num(C.c.ey)} kWh per kWp l'anno, il ${IT.pct(C.c.ey / M.c.ey - 1)} in più di Milano. Il vantaggio è ancora più forte d'inverno: a dicembre 3 kWp producono a Catania circa ${IT.kwh(dic(r3))}, a Milano ${IT.kwh(dic(m3))}. Più resa significa impianti più piccoli per lo stesso risultato: per produrre ${IT.num(TARGET)} kWh in un anno a Catania servono ${IT.num(kC, 2)} kWp, cioè ${pannelli(kC).n} moduli da 430 W, mentre a Milano ne servono ${pannelli(kM).n}. Il surplus, invece, vale meno: la Sicilia è una zona di mercato a parte, e nel 2026 il ritiro dedicato vi ha pagato circa ${IT.num(C.ridCt, 1)} centesimi per kWh, il valore più basso d'Italia. Con 3 kWp e il consumo medio siciliano di ${IT.num(cons)} kWh, il beneficio annuo è di ${IT.eur(r3.beneficio)} e il rientro di ${IT.anni(r3.rientro)}. In provincia si va da ${IT.num(prov.min[1])} kWh a ${prov.min[0]}, in quota sull'Etna, a ${IT.num(prov.max[1])} a ${prov.max[0]}.`,
    faqs: [
      { q: 'Quanto produce un impianto fotovoltaico a Catania?', a: `${IT.kwh(r3.produzione)} l'anno con 3 kWp a 30° verso sud, secondo PVGIS 5.3. Il mese migliore è luglio con circa ${IT.kwh(r3.mesi[6])}, dicembre il peggiore con ${IT.kwh(dic(r3))}, il valore invernale più alto fra le grandi città. Su un tetto verso est o ovest la produzione scende di circa un quinto.` },
      { q: 'Perché a Catania il fotovoltaico non rende molto più che a Milano?', a: `Perché produce di più ma vende peggio. Il kWh immesso vale circa ${IT.num(C.ridCt, 1)} centesimi in Sicilia e ${IT.num(M.ridCt, 1)} al Nord. Con lo stesso impianto da 3 kWp e lo stesso consumo il beneficio annuo è di ${IT.eur(r3.beneficio)} a Catania e ${IT.eur(m3.beneficio)} a Milano: la differenza è molto più piccola di quella in kWh.` },
      { q: 'Sull\'Etna il fotovoltaico produce meno?', a: `Dipende dal versante e dalla quota. ${prov.min[0]}, sul versante nord-occidentale a oltre 900 metri, è il comune meno produttivo della provincia con ${IT.num(prov.min[1])} kWh per kWp, comunque sopra la media italiana. La cenere vulcanica sui moduli, che PVGIS non considera, riduce la produzione finché non viene lavata: dopo le eruzioni conviene pulire i pannelli.` },
      { q: 'Con tanto sole conviene un impianto più piccolo?', a: `A Catania bastano meno kWp per coprire lo stesso consumo, quindi la spesa iniziale è più bassa. Per ${IT.num(cons)} kWh, il consumo medio siciliano, servono circa ${IT.num(cons / C.c.ey, 1)} kWp per produrre in un anno quanto si consuma. Un impianto un po' più grande resta utile se prevedete condizionatori, pompa di calore o auto elettrica.` },
    ],
    body: (h) => `
<h2>Quanti kWp servono per ${h.num(TARGET)} kWh l'anno</h2>
${h.table(['#', 'Città', 'kWh per kWp', 'kWp per 3 000 kWh', 'Moduli da 430 W'], rank.map((r, i) => [i + 1, h.a(`fotovoltaico-${r.s}`, CITTA[r.s].nome), h.num(r.ey), h.num(r.kwp, 2), pannelli(r.kwp).n]), 'PVGIS 5.3, moduli a 30° sud, perdite 14 %, coordinate del comune.', ['r', 'l', 'r', 'r', 'r'])}
<p>Fra la prima e l'ultima città della tabella c'è circa un modulo di differenza su un impianto domestico. Le isole e il Sud dominano la classifica, ma anche le città del Nord restano sopra i 1 300 kWh per kWp. La resa di ogni comune è nel simulatore; la classifica completa per provincia nella pagina ${h.a('produzione-fotovoltaico-provincia', 'produzione per provincia')}.</p>

<h2>L'inverno di Catania</h2>
<p>Il vantaggio della Sicilia orientale è più forte nei mesi freddi: a dicembre e gennaio il sole è più alto sull'orizzonte che al Nord, e la produzione invernale stimata da PVGIS è la più alta fra le grandi città. Per una casa con pompa di calore questo conta più della resa annua, perché il consumo invernale trova più energia propria. I dati mensili vengono dalla serie oraria ${h.src('pvgis', 'PVGIS')} della Sicilia.</p>

<h2>Il prezzo del surplus e il consumo</h2>
<p>La ${h.src('gse_rid_prezzi', 'tabella GSE')} dei prezzi per zona mostra per la Sicilia i valori più bassi del 2026 nelle ore di sole. Per questo a Catania conviene più che altrove usare in casa l'energia prodotta: timer per gli elettrodomestici, scaldabagno elettrico di giorno, e una batteria se il prezzo lo consente. Il consumo medio di ${h.num(cons)} kWh viene dalle tabelle ${h.src('arera_consumi', 'ARERA')} per i residenti siciliani con 3-4,5 kW. I ${prov.n} comuni della provincia sono quelli dell'elenco ${h.src('geonames', 'GeoNames')}.</p>`,
  },
  en: {
    slug: 'solar-panels-catania',
    nav: 'Catania',
    card: `${EN.num(C.c.ey)} kWh per kWp, the highest yield of the twelve cities; Etna in the province.`,
    title: 'Solar Panels Catania 2026: Highest Yield of Any Big City',
    description: 'Solar panels in Catania in 2026: the highest yield per kWp of Italy\'s big cities, how many kWp 3,000 kWh need, winter output and the comuni on Mount Etna.',
    h1: 'Solar in Catania: the city that produces most',
    intro: `With ${EN.num(C.c.ey)} kWh per kWp Catania ranks ${pos === 1 ? 'first' : `number ${pos}`} of the twelve large cities we compare. Producing ${EN.num(TARGET)} kWh a year takes only ${EN.num(kC, 2)} kWp, against ${EN.num(kM, 2)} in Milan.`,
    resume: `Catania, on Sicily's east coast at the foot of Etna, has the highest solar yield of the twelve large Italian cities on this site: according to PVGIS 5.3, at the comune's coordinates, a system with panels at 30° facing south produces ${EN.num(C.c.ey)} kWh per kWp a year, ${EN.pct(C.c.ey / M.c.ey - 1)} more than Milan. The advantage is even stronger in winter: in December 3 kWp produce about ${EN.kwh(dic(r3))} in Catania and ${EN.kwh(dic(m3))} in Milan. Higher yield means smaller systems for the same result: producing ${EN.num(TARGET)} kWh a year in Catania takes ${EN.num(kC, 2)} kWp, or ${pannelli(kC).n} modules of 430 W, while Milan needs ${pannelli(kM).n}. The surplus, however, is worth less: Sicily is a market zone of its own, and in 2026 the ritiro dedicato paid about ${EN.num(C.ridCt, 1)} cents per kWh there, the lowest in Italy. With 3 kWp and Sicily's average use of ${EN.num(cons)} kWh, the yearly benefit is ${EN.eur(r3.beneficio)} and payback ${EN.anni(r3.rientro)}. Across the province the range is from ${EN.num(prov.min[1])} kWh in ${prov.min[0]}, high on Etna, to ${EN.num(prov.max[1])} in ${prov.max[0]}.`,
    faqs: [
      { q: 'How much does a solar system produce in Catania?', a: `${EN.kwh(r3.produzione)} a year with 3 kWp at 30° facing south, according to PVGIS 5.3. The best month is July with about ${EN.kwh(r3.mesi[6])}, the worst December with ${EN.kwh(dic(r3))}, the highest winter value among large cities. On an east or west roof output falls by about a fifth.` },
      { q: 'Why does solar in Catania not earn much more than in Milan?', a: `Because it produces more but sells for less. An exported kWh is worth about ${EN.num(C.ridCt, 1)} cents in Sicily and ${EN.num(M.ridCt, 1)} in the North. With the same 3 kWp system and the same use, the yearly benefit is ${EN.eur(r3.beneficio)} in Catania and ${EN.eur(m3.beneficio)} in Milan: the gap is much smaller than in kWh.` },
      { q: 'Does solar produce less on Mount Etna?', a: `It depends on the slope and altitude. ${prov.min[0]}, on the north-western slope above 900 metres, is the province's least productive comune at ${EN.num(prov.min[1])} kWh per kWp, still above the Italian average. Volcanic ash on the modules, which PVGIS ignores, cuts output until it is washed off: after eruptions it is worth cleaning the panels.` },
      { q: 'With so much sun, is a smaller system enough?', a: `In Catania fewer kWp cover the same use, so the upfront cost is lower. For ${EN.num(cons)} kWh, Sicily's average use, about ${EN.num(cons / C.c.ey, 1)} kWp produce in a year what you consume. A slightly larger system is still useful if you plan air conditioning, a heat pump or an electric car.` },
    ],
    body: (h) => `
<h2>How many kWp for ${h.num(TARGET)} kWh a year</h2>
${h.table(['#', 'City', 'kWh per kWp', 'kWp for 3,000 kWh', '430 W modules'], rank.map((r, i) => [i + 1, h.a(`fotovoltaico-${r.s}`, CITTA[r.s].nome), h.num(r.ey), h.num(r.kwp, 2), pannelli(r.kwp).n]), 'PVGIS 5.3, modules at 30° south, 14% losses, comune coordinates.', ['r', 'l', 'r', 'r', 'r'])}
<p>Between the first and last city in the table there is about one module of difference on a home system. The islands and the South lead the ranking, but northern cities also stay above 1,300 kWh per kWp. Every comune's yield is in the calculator; the full ranking by province is on the ${h.a('produzione-fotovoltaico-provincia', 'output by province')} page.</p>

<h2>Catania's winter</h2>
<p>Eastern Sicily's advantage is strongest in the cold months: in December and January the sun stands higher above the horizon than in the North, and the winter output PVGIS estimates is the highest of the large cities. For a home with a heat pump this matters more than yearly yield, because winter use finds more of its own energy. Monthly data come from the Sicilian ${h.src('pvgis', 'PVGIS')} hourly series.</p>

<h2>The surplus price and use</h2>
<p>The ${h.src('gse_rid_prezzi', 'GSE table')} of prices by zone shows the lowest 2026 values for Sicily in sunny hours. So in Catania it pays more than elsewhere to use the energy produced at home: timers for appliances, an electric water heater by day, and a battery if the price allows. The average use of ${h.num(cons)} kWh comes from the ${h.src('arera_consumi', 'ARERA')} tables for Sicilian residents with 3-4.5 kW. The province's ${prov.n} comuni are those in the ${h.src('geonames', 'GeoNames')} list.</p>`,
  },
});
