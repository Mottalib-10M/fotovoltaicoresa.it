import { defineGuide } from '../../lib/guide-types';
import { calcola } from '../../lib/engine/fv';
import { luogoCitta, fattoreOrientamento } from '../../lib/engine/dati';
import { P, IT, EN, ITALIA, CITTA } from '../../lib/fmt';

/** Produzione: kWh per kWp e mese per mese, da PVGIS 5.3, per Milano, Roma, Catania e la media nazionale. */
const CITY = ['milano', 'roma', 'catania'] as const;
const prod = (s: string, kwp = 3) => calcola({ luogo: luogoCitta(s), kwp, tilt: 30, az: 0, consumo: 2700, batteria: 0, primaCasa: true });
const mi = prod('milano'), ro = prod('roma'), ct = prod('catania');
const MESI_IT = ['gen', 'feb', 'mar', 'apr', 'mag', 'giu', 'lug', 'ago', 'set', 'ott', 'nov', 'dic'];
const MESI_EN = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
const it3 = ITALIA.ey * 3;
const minIt = ITALIA.ey_min, maxIt = ITALIA.ey_max;
const lug = (r: typeof ro) => r.mesi[6], dic = (r: typeof ro) => r.mesi[11];
const est = fattoreOrientamento(CITTA.roma.reg, 30, -90), piano = fattoreOrientamento(CITTA.roma.reg, 0, 0);

export default defineGuide({
  id: 'quanto-produce-un-impianto-fotovoltaico',
  group: 'calcolo',
  order: 20,
  tool: 'produzione',
  toolPreset: { kwp: 3, cons: 2700 },
  related: ['produzione-fotovoltaico-provincia', 'orientamento-pannelli-solari', 'dimensionamento-impianto-fotovoltaico', 'impianto-fotovoltaico-3-kw', 'pannelli-fotovoltaici'],
  sources: ['pvgis', 'geonames'],
  it: {
    slug: 'quanto-produce-un-impianto-fotovoltaico',
    nav: 'Quanto produce un impianto',
    card: 'kWh per kWp nel vostro comune, mese per mese, con orientamento e inclinazione.',
    title: 'Quanto produce un impianto fotovoltaico 2026: kWh per comune',
    description: 'Quanto produce un impianto fotovoltaico nel 2026: kWh per kWp in ognuno dei 7 896 comuni italiani da PVGIS, mese per mese, con orientamento e inclinazione.',
    h1: 'Quanto produce un impianto fotovoltaico nel vostro comune',
    intro: `Con i pannelli a 30° verso sud, 3 kWp producono ${IT.kwh(mi.produzione)} l'anno a Milano, ${IT.kwh(ro.produzione)} a Roma e ${IT.kwh(ct.produzione)} a Catania: la media italiana è ${IT.kwh(it3)}.`,
    resume: `La produzione di un impianto fotovoltaico si misura in kWh per kWp: quanta energia dà in un anno ogni kilowatt di picco installato. In Italia, secondo il servizio PVGIS 5.3 della Commissione europea che abbiamo interrogato per tutti i ${IT.num(ITALIA.n_comuni)} comuni, la media pesata sulla popolazione è di ${IT.num(ITALIA.ey)} kWh per kWp con moduli a 30° verso sud e il ${IT.num(P.modello.perdite_pct)} % di perdite di sistema. Il valore va da ${IT.num(minIt)} kWh a ${ITALIA.min_nome}, in una valle alpina, a ${IT.num(maxIt)} kWh a ${ITALIA.max_nome}, all'estremo sud della Sicilia. Per stimare la produzione si moltiplica la potenza per questo numero e per un fattore di orientamento: un tetto verso est a 30° rende circa il ${IT.pct(est)} di uno verso sud, un tetto piano con pannelli appoggiati circa il ${IT.pct(piano)}. Luglio produce più del doppio di dicembre, quindi l'energia non arriva quando serve di più per il riscaldamento.`,
    faqs: [
      { q: 'Quanti kWh produce 1 kW di fotovoltaico in Italia?', a: `In media ${IT.num(ITALIA.ey)} kWh l'anno con moduli a 30° verso sud, secondo PVGIS 5.3 pesato sulla popolazione dei comuni. A Milano ${IT.num(mi.spec)}, a Roma ${IT.num(ro.spec)}, a Catania ${IT.num(ct.spec)}. Nel simulatore scrivete il vostro comune: il dato è calcolato per le coordinate del municipio, quindi conta anche l'altitudine.` },
      { q: 'Quanto produce un impianto da 3 kW al mese?', a: `A Roma da ${IT.kwh(dic(ro))} a dicembre a ${IT.kwh(lug(ro))} a luglio, a Milano da ${IT.kwh(dic(mi))} a ${IT.kwh(lug(mi))}. Il totale dell'anno è ${IT.kwh(ro.produzione)} a Roma. Sono medie degli anni presenti in PVGIS: un mese molto nuvoloso può scendere del 20 o 30 % sotto la media.` },
      { q: 'La produzione cala con gli anni?', a: `Sì, i moduli perdono qualche decimo di punto di rendimento ogni anno; la garanzia di produzione del costruttore indica quanto. Il nostro calcolo usa la produzione del primo anno costante per vent'anni e lo dice nel metodo, quindi il beneficio di lungo periodo è leggermente sovrastimato. Controllate il valore nella scheda tecnica dei moduli del preventivo.` },
      { q: 'Perché il mio installatore stima un valore diverso?', a: `Può usare un altro database solare, un'altra percentuale di perdite o l'orientamento reale del tetto. Noi applichiamo il ${IT.num(P.modello.perdite_pct)} % di perdite indicato da PVGIS come valore standard. Inserite nel simulatore inclinazione, orientamento e ombra del vostro tetto: se la differenza resta oltre il 10 %, chiedete all'installatore da dove viene la sua stima.` },
    ],
    body: (h) => `
<h2>Mese per mese, 3 kWp a 30° sud</h2>
${h.table(['Mese', 'Milano', 'Roma', 'Catania'], MESI_IT.map((m, i) => [m, h.num(mi.mesi[i]), h.num(ro.mesi[i]), h.num(ct.mesi[i])]).concat([['Anno', h.num(mi.produzione), h.num(ro.produzione), h.num(ct.produzione)]]), 'kWh prodotti, PVGIS 5.3, perdite di sistema 14 %.', ['l', 'r', 'r', 'r'])}
<p>Fra Milano e Catania la differenza annua è del ${h.pct(ct.produzione / mi.produzione - 1)}, ma d'inverno sale molto: a dicembre Catania produce ${h.pct(dic(ct) / dic(mi) - 1)} in più. Chi usa l'energia per una pompa di calore deve guardare questa colonna, non il totale annuo. Le altre città sono nelle pagine dedicate, a partire da ${h.a('fotovoltaico-roma', 'Roma')} e ${h.a('fotovoltaico-milano', 'Milano')}.</p>

<h2>Da dove vengono i numeri</h2>
<p>Abbiamo chiesto a ${h.src('pvgis', 'PVGIS 5.3')} la produzione di 1 kWp per le coordinate di ogni comune dell'elenco ${h.src('geonames', 'GeoNames')}, con moduli in silicio cristallino, 30° di inclinazione, orientamento sud e ${h.num(P.modello.perdite_pct)} % di perdite. Il database usa immagini satellitari dell'irraggiamento e tiene conto delle montagne all'orizzonte. Per orientamenti diversi applichiamo un fattore calcolato con PVGIS in sei punti del paese, uno per area climatica, e lo scegliamo in base alla regione.</p>
<p>Il risultato è una stima della media di lungo periodo. Un impianto reale può fare qualche punto in più o in meno per la pulizia dei moduli, la temperatura del tetto e l'efficienza dell'inverter. Per una stima per tutta la provincia, con il comune migliore e il peggiore, c'è la pagina ${h.a('produzione-fotovoltaico-provincia', 'produzione per provincia')}.</p>

<h2>Orientamento e ombre</h2>
<p>Un tetto verso est o ovest perde circa un quinto rispetto al sud, ma spalma la produzione su mattina o pomeriggio, quando la casa consuma di più. Un'ombra fissa, come un camino o un albero, riduce la produzione più di quanto sembri, perché i moduli lavorano in serie: il campo « Ombra » del simulatore toglie una quota fissa, da usare come ordine di grandezza. La pagina ${h.a('orientamento-pannelli-solari', 'orientamento dei pannelli')} confronta tutti i casi.</p>`,
  },
  en: {
    slug: 'solar-output-italy',
    nav: 'Solar output by comune',
    card: 'kWh per kWp in your comune, month by month, with facing, tilt and shade.',
    title: 'Solar Panel Output Italy 2026: kWh per kWp by Comune',
    description: 'Solar panel output in Italy 2026: kWh per kWp in each of the 7,896 Italian comuni from PVGIS, month by month, adjusted for roof facing, tilt and shade.',
    h1: 'How much a solar system produces in your Italian comune',
    intro: `With panels at 30° facing south, 3 kWp produce ${EN.kwh(mi.produzione)} a year in Milan, ${EN.kwh(ro.produzione)} in Rome and ${EN.kwh(ct.produzione)} in Catania: the Italian average is ${EN.kwh(it3)}.`,
    resume: `A solar system's output is measured in kWh per kWp: how much energy each kilowatt of peak capacity delivers in a year. In Italy, according to the European Commission's PVGIS 5.3 service, which we queried for all ${EN.num(ITALIA.n_comuni)} comuni, the population-weighted average is ${EN.num(ITALIA.ey)} kWh per kWp with panels at 30° facing south and ${EN.num(P.modello.perdite_pct)}% system losses. The figure ranges from ${EN.num(minIt)} kWh in ${ITALIA.min_nome}, an Alpine valley, to ${EN.num(maxIt)} kWh in ${ITALIA.max_nome}, at the southern tip of Sicily. To estimate output, multiply the size by this number and by an orientation factor: an east-facing roof at 30° yields about ${EN.pct(est)} of a south-facing one, and a flat roof with panels laid flat about ${EN.pct(piano)}. July produces more than twice as much as December, so the energy does not arrive when heating needs it most.`,
    faqs: [
      { q: 'How many kWh does 1 kW of solar produce in Italy?', a: `On average ${EN.num(ITALIA.ey)} kWh a year with panels at 30° facing south, according to PVGIS 5.3 weighted by the comuni's population. Milan ${EN.num(mi.spec)}, Rome ${EN.num(ro.spec)}, Catania ${EN.num(ct.spec)}. Type your comune in the calculator: the value is computed for the town hall's coordinates, so altitude counts too.` },
      { q: 'How much does a 3 kW system produce per month?', a: `In Rome from ${EN.kwh(dic(ro))} in December to ${EN.kwh(lug(ro))} in July, in Milan from ${EN.kwh(dic(mi))} to ${EN.kwh(lug(mi))}. The yearly total is ${EN.kwh(ro.produzione)} in Rome. These are averages of the years held in PVGIS: a very cloudy month can fall 20 to 30% below the average.` },
      { q: 'Does output fall over the years?', a: `Yes, panels lose a few tenths of a percentage point of efficiency each year; the maker's performance warranty states how much. Our calculation keeps first-year output constant for twenty years and says so in the method, so the long-term benefit is slightly overstated. Check the figure in the datasheet of the panels in your quote.` },
      { q: 'Why does my installer estimate a different figure?', a: `They may use another solar database, another loss percentage or the real orientation of the roof. We apply the ${EN.num(P.modello.perdite_pct)}% losses that PVGIS gives as its standard value. Enter your roof's tilt, facing and shade in the calculator: if the gap stays above 10%, ask the installer where their estimate comes from.` },
    ],
    body: (h) => `
<h2>Month by month, 3 kWp at 30° south</h2>
${h.table(['Month', 'Milan', 'Rome', 'Catania'], MESI_EN.map((m, i) => [m, h.num(mi.mesi[i]), h.num(ro.mesi[i]), h.num(ct.mesi[i])]).concat([['Year', h.num(mi.produzione), h.num(ro.produzione), h.num(ct.produzione)]]), 'kWh produced, PVGIS 5.3, 14% system losses.', ['l', 'r', 'r', 'r'])}
<p>Between Milan and Catania the yearly gap is ${h.pct(ct.produzione / mi.produzione - 1)}, but in winter it grows a lot: in December Catania produces ${h.pct(dic(ct) / dic(mi) - 1)} more. Anyone running a heat pump on solar should look at this column, not the yearly total. Other cities have their own pages, starting with ${h.a('fotovoltaico-roma', 'Rome')} and ${h.a('fotovoltaico-milano', 'Milan')}.</p>

<h2>Where the figures come from</h2>
<p>We asked ${h.src('pvgis', 'PVGIS 5.3')} for the output of 1 kWp at the coordinates of every comune in the ${h.src('geonames', 'GeoNames')} list, with crystalline silicon panels, 30° tilt, south facing and ${h.num(P.modello.perdite_pct)}% losses. The database uses satellite irradiance and accounts for mountains on the horizon. For other orientations we apply a factor computed with PVGIS at six points in the country, one per climate area, chosen by region.</p>
<p>The result is an estimate of the long-term average. A real system may do a few points better or worse depending on panel cleanliness, roof temperature and inverter efficiency. For a province-wide view, with the best and worst comune, see ${h.a('produzione-fotovoltaico-provincia', 'output by province')}.</p>

<h2>Facing and shade</h2>
<p>An east or west roof loses about a fifth compared with south, but spreads output over the morning or afternoon, when the home uses more. Fixed shade, such as a chimney or a tree, cuts output more than it seems, because panels work in series: the « Shade » field in the calculator removes a fixed share, to be used as an order of magnitude. The ${h.a('orientamento-pannelli-solari', 'panel orientation')} page compares every case.</p>`,
  },
});
