import { defineGuide } from '../../lib/guide-types';
import { calcola } from '../../lib/engine/fv';
import { fattoreOrientamento, luogoCitta } from '../../lib/engine/dati';
import { IT, EN, P, REGIONI } from '../../lib/fmt';

/** Orientamento: fattore PVGIS per inclinazione ed esposizione (Centro e Sicilia), con effetto su un 3 kWp romano. */
const LAZIO = REGIONI.findIndex((r) => r.nome === 'Lazio');
const LOMB = REGIONI.findIndex((r) => r.nome === 'Lombardia');
const SIC = REGIONI.findIndex((r) => r.nome === 'Sicilia');
const TILT = [0, 15, 30, 45, 60, 90];
const AZ: Array<[number, string, string]> = [[0, 'Sud', 'South'], [-45, 'Sud-est', 'South-east'], [45, 'Sud-ovest', 'South-west'], [-90, 'Est', 'East'], [90, 'Ovest', 'West'], [180, 'Nord', 'North']];
const f = (reg: number, t: number, a: number) => fattoreOrientamento(reg, t, a);
const roma = luogoCitta('roma');
const r = (t: number, a: number) => calcola({ luogo: roma, kwp: 3, tilt: t, az: a, consumo: 2700, batteria: 0, primaCasa: true });
const sud = r(30, 0), est = r(30, -90), nord = r(30, 180), piano = r(0, 0);
const best = TILT.map((t) => ({ t, v: f(LAZIO, t, 0) })).sort((a, b) => b.v - a.v)[0];

export default defineGuide({
  id: 'orientamento-pannelli-solari',
  group: 'impianto',
  order: 40,
  tool: 'produzione',
  toolPreset: { kwp: 3, cons: 2700 },
  mini: 'orientamento',
  related: ['quanto-produce-un-impianto-fotovoltaico', 'pannelli-fotovoltaici', 'fotovoltaico-balcone', 'fotovoltaico-genova', 'fotovoltaico-conviene'],
  sources: ['pvgis', 'arera_consumi'],
  it: {
    slug: 'orientamento-pannelli-solari',
    nav: 'Orientamento dei pannelli',
    card: 'Quanto perde un tetto a est, a ovest o a nord, e quale inclinazione rende di più nella vostra zona.',
    title: 'Orientamento pannelli solari 2026: est, ovest e inclinazione',
    description: 'Orientamento pannelli solari 2026: quanto produce un tetto a sud, est, ovest o nord con ogni inclinazione da 0 a 90° secondo PVGIS, al Nord, al Centro e al Sud.',
    h1: 'Orientamento e inclinazione dei pannelli: quanto si perde',
    intro: `Rispetto a 30° verso sud, un tetto verso est rende il ${IT.pct(f(LAZIO, 30, -90))} al Centro, uno verso nord il ${IT.pct(f(LAZIO, 30, 180))} e i pannelli appoggiati in piano il ${IT.pct(f(LAZIO, 0, 0))}. A Roma, su 3 kWp, la differenza fra sud ed est vale ${IT.eur(sud.beneficio - est.beneficio)} l'anno.`,
    resume: `L'orientamento di un impianto fotovoltaico si descrive con due angoli: l'inclinazione rispetto al piano orizzontale e l'esposizione, cioè la direzione verso cui guardano i pannelli. In Italia la combinazione migliore è verso sud con un'inclinazione fra 30 e 35 gradi, ma la produzione cala poco allontanandosi da quel punto. Abbiamo calcolato con PVGIS 5.3 la resa di 89 combinazioni in sei punti del paese, dal Nord alla Sicilia, e il simulatore usa quella più vicina alla vostra regione. Al Centro un tetto a sud-est o sud-ovest perde pochi punti, uno a est o a ovest circa un quinto, uno a nord con 30° quasi la metà. Con pannelli verticali, come su una facciata o una ringhiera, si scende a due terzi. In euro, però, la perdita è minore che in kWh, perché con meno produzione cresce la quota usata in casa, che vale il prezzo pieno della bolletta: a Roma, su 3 kWp e 2 700 kWh di consumo, il beneficio scende da ${IT.eur(sud.beneficio)} a ${IT.eur(est.beneficio)} l'anno.`,
    faqs: [
      { q: 'I pannelli solari rivolti a est o a ovest convengono?', a: `Sì. Al Centro un tetto verso est a 30° produce il ${IT.pct(f(LAZIO, 30, -90))} di uno verso sud e uno verso ovest il ${IT.pct(f(LAZIO, 30, 90))}. Su un tetto a due falde est-ovest si possono usare entrambe, raddoppiando la potenza: la produzione si distribuisce meglio nella giornata e la quota usata in casa sale.` },
      { q: 'Qual è l\'inclinazione migliore per i pannelli in Italia?', a: `Verso sud, fra 30 e 35 gradi in quasi tutto il paese; al Centro la resa più alta fra quelle calcolate si ha a ${best.t}°. Fra 15 e 45 gradi la produzione cambia di pochi punti, quindi di solito conviene seguire la falda del tetto. Su un tetto piano un'inclinazione bassa permette file più vicine e più potenza.` },
      { q: 'Vale la pena mettere i pannelli su un tetto a nord?', a: `A 30° un tetto verso nord produce il ${IT.pct(f(LAZIO, 30, 180))} del sud al Centro e il ${IT.pct(f(LOMB, 30, 180))} al Nord. Con un'inclinazione bassa, 10 o 15 gradi, la perdita si riduce. A Roma 3 kWp a nord a 30° renderebbero ${IT.eur(nord.beneficio)} l'anno: il simulatore dice se il rientro resta accettabile al vostro prezzo.` },
    ],
    body: (h) => `
<h2>Fattore di resa al Centro (Lazio, Umbria, Toscana, Marche)</h2>
${h.table(['Inclinazione', ...AZ.map(([, a]) => a)], TILT.map((t) => [`${t}°`, ...AZ.map(([a]) => h.pct(f(LAZIO, t, a)))]), 'Produzione rispetto a 30° sud, PVGIS 5.3, punto di riferimento in Umbria. A 0° l\'esposizione non conta.', ['l', 'r', 'r', 'r', 'r', 'r', 'r'])}

<h2>Lo stesso tetto al Nord e in Sicilia</h2>
${h.table(['Caso', 'Nord (Milano)', 'Centro', 'Sicilia'], [['Est 30°', -90, 30], ['Ovest 30°', 90, 30], ['Nord 30°', 180, 30], ['Sud 60°', 0, 60], ['Sud 90°', 0, 90], ['Piano 0°', 0, 0]].map(([n, a, t]) => [n as string, h.pct(f(LOMB, t as number, a as number)), h.pct(f(LAZIO, t as number, a as number)), h.pct(f(SIC, t as number, a as number))]), 'Rispetto a 30° sud nello stesso punto.', ['l', 'r', 'r', 'r'])}
<p>Al Nord il sole d'inverno è più basso, quindi i pannelli molto inclinati o verticali perdono meno e quelli rivolti a nord perdono di più. In Sicilia succede il contrario. Le differenze però restano di pochi punti: l'esposizione conta molto più della latitudine nel confronto fra due tetti della stessa città.</p>

<h2>kWh contro euro</h2>
<p>Un impianto verso sud ha un picco di produzione a mezzogiorno, quando molte famiglie sono fuori casa. Uno verso ovest sposta parte della produzione al tardo pomeriggio, quando secondo i ${h.src('arera_consumi', 'profili orari ARERA')} i consumi salgono. Il simulatore non modella questo spostamento orario, che alzerebbe ancora un po' l'autoconsumo: tiene conto solo della produzione minore. A Roma il beneficio con i pannelli piatti è ${h.eur(piano.beneficio)} l'anno contro ${h.eur(sud.beneficio)} a 30° sud. I fattori vengono da ${h.src('pvgis', 'PVGIS 5.3')} con il ${h.num(P.modello.perdite_pct)} % di perdite; il mini-simulatore applica il fattore al vostro caso.</p>`,
  },
  en: {
    slug: 'solar-panel-orientation-italy',
    nav: 'Panel orientation',
    card: 'How much an east, west or north roof loses, and which tilt yields most in your area.',
    title: 'Solar Panel Orientation Italy 2026: East, West and Tilt',
    description: 'Solar panel orientation in Italy 2026: what a south, east, west or north roof produces at every tilt from 0 to 90° per PVGIS, in the North, Centre and Sicily.',
    h1: 'Panel orientation and tilt: how much you lose',
    intro: `Compared with 30° south, an east-facing roof yields ${EN.pct(f(LAZIO, 30, -90))} in central Italy, a north-facing one ${EN.pct(f(LAZIO, 30, 180))} and panels laid flat ${EN.pct(f(LAZIO, 0, 0))}. In Rome, on 3 kWp, the gap between south and east is worth ${EN.eur(sud.beneficio - est.beneficio)} a year.`,
    resume: `A solar system's orientation is described by two angles: the tilt from horizontal and the aspect, meaning the direction the panels face. In Italy the best combination is south with a tilt of 30 to 35 degrees, but output falls only slowly away from that point. We used PVGIS 5.3 to compute the yield of 89 combinations at six points in the country, from the North to Sicily, and the calculator uses the one closest to your region. In central Italy a south-east or south-west roof loses a few points, an east or west one about a fifth, and a north one at 30° almost half. With vertical panels, as on a facade or railing, it drops to two thirds. In euros, though, the loss is smaller than in kWh, because with less output the share used at home, worth the full bill price, grows: in Rome, on 3 kWp and 2,700 kWh of use, the benefit falls from ${EN.eur(sud.beneficio)} to ${EN.eur(est.beneficio)} a year.`,
    faqs: [
      { q: 'Are east- or west-facing solar panels worth it?', a: `Yes. In central Italy an east roof at 30° produces ${EN.pct(f(LAZIO, 30, -90))} of a south one and a west roof ${EN.pct(f(LAZIO, 30, 90))}. On a two-pitch east-west roof both sides can be used, doubling the power: output spreads better over the day and the share used at home rises.` },
      { q: 'What is the best tilt for solar panels in Italy?', a: `Facing south, 30 to 35 degrees in almost the whole country; in central Italy the highest yield among the tilts computed is at ${best.t}°. Between 15 and 45 degrees output changes by only a few points, so following the roof pitch is usually best. On a flat roof a low tilt allows closer rows and more power.` },
      { q: 'Is it worth putting panels on a north-facing roof?', a: `At 30° a north roof produces ${EN.pct(f(LAZIO, 30, 180))} of south in central Italy and ${EN.pct(f(LOMB, 30, 180))} in the North. At a low tilt, 10 or 15 degrees, the loss shrinks. In Rome 3 kWp facing north at 30° would earn ${EN.eur(nord.beneficio)} a year: the calculator shows whether payback stays acceptable at your price.` },
    ],
    body: (h) => `
<h2>Yield factor in central Italy (Lazio, Umbria, Tuscany, Marche)</h2>
${h.table(['Tilt', ...AZ.map(([, , a]) => a)], TILT.map((t) => [`${t}°`, ...AZ.map(([a]) => h.pct(f(LAZIO, t, a)))]), 'Output relative to 30° south, PVGIS 5.3, reference point in Umbria. At 0° the facing does not matter.', ['l', 'r', 'r', 'r', 'r', 'r', 'r'])}

<h2>The same roof in the North and in Sicily</h2>
${h.table(['Case', 'North (Milan)', 'Centre', 'Sicily'], [['East 30°', -90, 30], ['West 30°', 90, 30], ['North 30°', 180, 30], ['South 60°', 0, 60], ['South 90°', 0, 90], ['Flat 0°', 0, 0]].map(([n, a, t]) => [n as string, h.pct(f(LOMB, t as number, a as number)), h.pct(f(LAZIO, t as number, a as number)), h.pct(f(SIC, t as number, a as number))]), 'Relative to 30° south at the same point.', ['l', 'r', 'r', 'r'])}
<p>In the North the winter sun is lower, so steeply tilted or vertical panels lose less and north-facing ones lose more. In Sicily the opposite happens. The differences stay within a few points, though: facing matters far more than latitude when comparing two roofs in the same city.</p>

<h2>kWh versus euros</h2>
<p>A south-facing system peaks at midday, when many households are out. A west-facing one moves part of its output to late afternoon, when according to the ${h.src('arera_consumi', 'ARERA hourly profiles')} use rises. The calculator does not model this hourly shift, which would raise self-consumption a little more: it only accounts for the lower output. In Rome the benefit with flat panels is ${h.eur(piano.beneficio)} a year against ${h.eur(sud.beneficio)} at 30° south. The factors come from ${h.src('pvgis', 'PVGIS 5.3')} with ${h.num(P.modello.perdite_pct)}% losses; the mini-calculator applies the factor to your case.</p>`,
  },
});
