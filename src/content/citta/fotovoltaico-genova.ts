import { defineGuide } from '../../lib/guide-types';
import { citta } from '../../lib/citta-kit';
import { calcola } from '../../lib/engine/fv';
import { fattoreOrientamento, type Luogo } from '../../lib/engine/dati';
import { IT, EN, P } from '../../lib/fmt';

/** Genova: città stretta fra mare e monti, tetti spesso a est o a ovest; impianto su due falde est-ovest. */
const G = citta('genova');
const cons = G.R.cons_alto;
const prov = G.prov;
const fE = fattoreOrientamento(G.c.reg, 30, -90), fW = fattoreOrientamento(G.c.reg, 30, 90);
/** Due falde est e ovest: stessa potenza divisa a metà, resa media delle due esposizioni. */
const ew: Luogo = { ...G.luogo, ey: G.luogo.ey * (fE + fW) / 2 };
const x = (kwp: number, az: number, l: Luogo = G.luogo) => calcola({ luogo: l, kwp, tilt: 30, az, consumo: cons, batteria: 0, primaCasa: true });
const CASI: Array<[string, string, ReturnType<typeof x>]> = [
  ['3 kWp a sud', '3 kWp south', x(3, 0)],
  ['3 kWp a sud-est', '3 kWp south-east', x(3, -45)],
  ['3 kWp a sud-ovest', '3 kWp south-west', x(3, 45)],
  ['3 kWp a est', '3 kWp east', x(3, -90)],
  ['3 kWp a ovest', '3 kWp west', x(3, 90)],
  ['3 kWp divisi est e ovest', '3 kWp split east and west', x(3, 0, ew)],
  ['6 kWp su due falde est e ovest', '6 kWp on east and west pitches', x(6, 0, ew)],
];
const sud = CASI[0][2], est = CASI[3][2], ew3 = CASI[5][2], ew6 = CASI[6][2];

export default defineGuide({
  id: 'fotovoltaico-genova',
  group: 'citta',
  order: 60,
  tool: 'rendimento',
  toolPreset: { citta: 'genova', kwp: 3, az: 90, cons },
  related: ['orientamento-pannelli-solari', 'fotovoltaico-torino', 'fotovoltaico-milano', 'impianto-fotovoltaico-6-kw', 'fotovoltaico-balcone'],
  sources: ['pvgis', 'arera_consumi', 'gse_rid_prezzi', 'geonames'],
  it: {
    slug: 'fotovoltaico-genova',
    nav: 'Genova',
    card: `${IT.num(G.c.ey)} kWh per kWp a sud; tetti a est o a ovest e impianti su due falde.`,
    title: 'Fotovoltaico Genova 2026: tetti a est, ovest e su due falde',
    description: 'Fotovoltaico Genova 2026: quanto produce un impianto su un tetto a sud, a est, a ovest o su due falde est-ovest, con il risparmio e gli anni di rientro.',
    h1: 'Fotovoltaico a Genova: tetti a est, a ovest e su due falde',
    intro: `A Genova 3 kWp verso sud producono ${IT.kwh(sud.produzione)} l'anno, verso est ${IT.kwh(est.produzione)}. Su un tetto a due falde est-ovest si può raddoppiare la potenza: 6 kWp rendono ${IT.eur(ew6.beneficio)} l'anno e rientrano in ${IT.anni(ew6.rientro)}.`,
    resume: `Genova è stretta fra il mare e l'Appennino, con quartieri costruiti sulle colline e strade che seguono le curve di livello: molti tetti non guardano a sud, ma a est, a ovest o verso il mare. Secondo PVGIS 5.3 alle coordinate del comune un impianto con moduli a 30° verso sud produce ${IT.num(G.c.ey)} kWh per kWp l'anno, un valore vicino a quello di Milano. Con l'esposizione a est la resa scende al ${IT.pct(fE)} del sud, a ovest al ${IT.pct(fW)}, secondo la matrice di orientamento che abbiamo calcolato con PVGIS per il Nord-Ovest. Su un tetto a capanna con le falde a est e a ovest c'è però un'alternativa: usare entrambe le falde. Così si installa il doppio della potenza a parità di falda, e la produzione si distribuisce fra mattina e pomeriggio. Con 6 kWp divisi sulle due falde e il consumo medio ligure di ${IT.num(cons)} kWh, il beneficio annuo è di ${IT.eur(ew6.beneficio)}, contro ${IT.eur(sud.beneficio)} di 3 kWp a sud. In provincia la resa va da ${IT.num(prov.min[1])} kWh a ${prov.min[0]}, nell'entroterra, a ${IT.num(prov.max[1])} a ${prov.max[0]}, sulla costa.`,
    faqs: [
      { q: 'Quanto produce un impianto fotovoltaico a Genova?', a: `${IT.kwh(sud.produzione)} l'anno con 3 kWp a 30° verso sud, secondo PVGIS 5.3. Con lo stesso impianto a est ${IT.kwh(est.produzione)} e diviso fra est e ovest ${IT.kwh(ew3.produzione)}. A luglio 3 kWp a sud producono circa ${IT.kwh(sud.mesi[6])}, a dicembre ${IT.kwh(sud.mesi[11])}. Il simulatore usa le coordinate del vostro comune.` },
      { q: 'Conviene il fotovoltaico su due falde est-ovest?', a: `Sì, se il tetto lo permette. Rispetto a 3 kWp su una sola falda a est, 6 kWp sulle due falde producono più del doppio dell'energia e rendono ${IT.eur(ew6.beneficio)} l'anno contro ${IT.eur(est.beneficio)}. Il rientro è di ${IT.anni(ew6.rientro)} contro ${IT.anni(est.rientro)} al costo di riferimento, perché il kWh in più va soprattutto in rete al prezzo del ritiro dedicato.` },
      { q: 'Il mare e la salsedine danneggiano i pannelli?', a: 'L\'aria salina può corrodere strutture e connettori se non sono adatti. Per gli impianti vicino al mare chiedete moduli certificati per la nebbia salina e strutture in alluminio o acciaio inossidabile, e una pulizia periodica. PVGIS non tiene conto dello sporco sui moduli, quindi una superficie sporca produce meno della stima.' },
    ],
    body: (h) => `
<h2>Sette tetti genovesi a confronto</h2>
${h.table(['Impianto', 'Produzione', 'Usata in casa', 'Beneficio annuo', 'Rientro'], CASI.map(([a, , r]) => [a, `${h.num(r.produzione)} kWh`, h.pct(r.quota), h.eur(r.beneficio), `${h.num(r.rientro ?? 0, 1)} anni`]), `Genova, 30° di inclinazione, consumo ${h.num(cons)} kWh, costo di riferimento, detrazione ${h.pct(P.detrazione.aliquota_prima_casa)}.`, ['l', 'r', 'r', 'r', 'r'])}
<p>Fra sud-est e sud-ovest le differenze sono di pochi punti; fra sud ed est di circa un quinto. Il rientro però cambia poco, perché con meno produzione la quota usata in casa sale. Nel simulatore scegliete l'orientamento e l'inclinazione della vostra falda: la pagina parte da un tetto a ovest per mostrare un caso frequente in città. Se il tetto è piano, anche un'inclinazione bassa verso sud resta una buona soluzione.</p>

<h2>Due falde, il doppio della potenza</h2>
<p>Su un tetto a capanna con il colmo nord-sud le due falde guardano a est e a ovest. Mettere i moduli su entrambe raddoppia la potenza installabile e allunga la giornata di produzione: la falda est lavora al mattino, quella ovest al pomeriggio. Nel nostro calcolo la produzione è la media delle due esposizioni; l'effetto dello spostamento orario sull'autoconsumo non è modellato, quindi la quota usata in casa reale può essere un po' più alta. Servono un inverter con due ingressi indipendenti o ottimizzatori, perché le due falde producono in momenti diversi.</p>

<h2>Dalla costa all'entroterra</h2>
<p>La provincia di Genova conta ${prov.n} comuni con una resa media di ${h.num(prov.ey)} kWh per kWp. Sulla costa, come a ${prov.max[0]}, il sole è pieno; nelle valli dell'entroterra, come a ${prov.min[0]}, le montagne tolgono ore di luce d'inverno. I dati sono di ${h.src('pvgis', 'PVGIS 5.3')} alle coordinate dei comuni dell'elenco ${h.src('geonames', 'GeoNames')}. Il consumo di ${h.num(cons)} kWh è la media ${h.src('arera_consumi', 'ARERA')} per i residenti liguri con 3-4,5 kW; il surplus vale i ${h.src('gse_rid_prezzi', 'prezzi GSE')} della zona Nord.</p>`,
  },
  en: {
    slug: 'solar-panels-genoa',
    nav: 'Genoa',
    card: `${EN.num(G.c.ey)} kWh per kWp facing south; east or west roofs and two-pitch systems.`,
    title: 'Solar Panels Genoa 2026: East, West and Two-Pitch Roofs',
    description: 'Solar panels in Genoa in 2026: what a system produces on a south, east or west roof or on two east-west pitches, with the bill saving and the payback years.',
    h1: 'Solar in Genoa: east, west and two-pitch roofs',
    intro: `In Genoa 3 kWp facing south produce ${EN.kwh(sud.produzione)} a year, facing east ${EN.kwh(est.produzione)}. On a roof with east and west pitches you can double the power: 6 kWp earn ${EN.eur(ew6.beneficio)} a year and pay back in ${EN.anni(ew6.rientro)}.`,
    resume: `Genoa is squeezed between the sea and the Apennines, with districts built on hillsides and streets that follow the contours: many roofs face not south but east, west or towards the sea. According to PVGIS 5.3 at the comune's coordinates a system with panels at 30° facing south produces ${EN.num(G.c.ey)} kWh per kWp a year, close to Milan. Facing east the yield falls to ${EN.pct(fE)} of south, facing west to ${EN.pct(fW)}, according to the orientation matrix we computed with PVGIS for the North-West. On a gabled roof with east and west pitches there is an alternative, though: use both pitches. That installs twice the power for the same pitch area, and output spreads between morning and afternoon. With 6 kWp split over the two pitches and Liguria's average use of ${EN.num(cons)} kWh, the yearly benefit is ${EN.eur(ew6.beneficio)}, against ${EN.eur(sud.beneficio)} for 3 kWp facing south. Across the province the yield ranges from ${EN.num(prov.min[1])} kWh in ${prov.min[0]}, inland, to ${EN.num(prov.max[1])} in ${prov.max[0]}, on the coast.`,
    faqs: [
      { q: 'How much does a solar system produce in Genoa?', a: `${EN.kwh(sud.produzione)} a year with 3 kWp at 30° facing south, according to PVGIS 5.3. The same system facing east gives ${EN.kwh(est.produzione)}, and split between east and west ${EN.kwh(ew3.produzione)}. In July 3 kWp facing south produce about ${EN.kwh(sud.mesi[6])}, in December ${EN.kwh(sud.mesi[11])}. The calculator uses your comune's coordinates.` },
      { q: 'Is solar on two east-west pitches worth it?', a: `Yes, if the roof allows it. Compared with 3 kWp on one east pitch, 6 kWp on both pitches produce more than twice the energy and earn ${EN.eur(ew6.beneficio)} a year against ${EN.eur(est.beneficio)}. Payback is ${EN.anni(ew6.rientro)} against ${EN.anni(est.rientro)} at the reference cost, because the extra kWh mostly goes to the grid at the ritiro dedicato price.` },
      { q: 'Do sea air and salt damage solar panels?', a: 'Salty air can corrode mounts and connectors if they are not suitable. For systems near the sea ask for modules certified for salt mist and aluminium or stainless steel mounts, plus periodic cleaning. PVGIS does not account for dirt on the modules, so a dirty surface produces less than the estimate.' },
    ],
    body: (h) => `
<h2>Seven Genoa roofs compared</h2>
${h.table(['System', 'Output', 'Used at home', 'Yearly benefit', 'Payback'], CASI.map(([, a, r]) => [a, `${h.num(r.produzione)} kWh`, h.pct(r.quota), h.eur(r.beneficio), `${h.num(r.rientro ?? 0, 1)} years`]), `Genoa, 30° tilt, ${h.num(cons)} kWh use, reference cost, ${h.pct(P.detrazione.aliquota_prima_casa)} deduction.`, ['l', 'r', 'r', 'r', 'r'])}
<p>Between south-east and south-west the differences are a few points; between south and east about a fifth. Payback changes little, though, because with less output the share used at home rises. In the calculator choose your pitch's facing and tilt: the page starts from a west roof to show a case often found in the city. If the roof is flat, a low tilt towards the south is still a good solution.</p>

<h2>Two pitches, twice the power</h2>
<p>On a gabled roof with a north-south ridge the two pitches face east and west. Putting modules on both doubles the installable power and lengthens the production day: the east pitch works in the morning, the west in the afternoon. In our calculation output is the average of the two facings; the effect of the hourly shift on self-consumption is not modelled, so the real share used at home may be a little higher. You need an inverter with two independent inputs or optimisers, because the two pitches produce at different times.</p>

<h2>From the coast to the hinterland</h2>
<p>The province of Genoa has ${prov.n} comuni with an average yield of ${h.num(prov.ey)} kWh per kWp. On the coast, as in ${prov.max[0]}, the sun is full; in the inland valleys, as in ${prov.min[0]}, the mountains take away winter hours of light. The data are from ${h.src('pvgis', 'PVGIS 5.3')} at the coordinates of the comuni in the ${h.src('geonames', 'GeoNames')} list. The use of ${h.num(cons)} kWh is the ${h.src('arera_consumi', 'ARERA')} average for Ligurian residents with 3-4.5 kW; the surplus earns the ${h.src('gse_rid_prezzi', 'GSE prices')} of the North zone.</p>`,
  },
});
