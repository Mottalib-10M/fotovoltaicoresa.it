import { defineGuide } from '../../lib/guide-types';
import { pannelli } from '../../lib/engine/fv';
import { IT, EN, P, ITALIA, CITTA } from '../../lib/fmt';

/** Pannelli: quanti moduli e quanti metri quadrati per ogni potenza, e kWh per metro quadrato di tetto. */
const M = P.modello;
const KWP = [2, 3, 4.5, 6, 8, 10];
const kwhM2 = (ey: number) => (ey * M.kwp_per_pannello) / M.m2_per_pannello;
const it = kwhM2(ITALIA.ey), mi = kwhM2(CITTA.milano.ey), pa = kwhM2(CITTA.palermo.ey);
const p3 = pannelli(3), p45 = pannelli(4.5);
const wM2 = (M.kwp_per_pannello * 1000) / M.m2_per_pannello;
const eff = wM2 / 1000;

export default defineGuide({
  id: 'pannelli-fotovoltaici',
  group: 'impianto',
  order: 30,
  tool: 'produzione',
  toolPreset: { kwp: 4.5, cons: 2700 },
  mini: 'pannelli',
  related: ['quanto-produce-un-impianto-fotovoltaico', 'dimensionamento-impianto-fotovoltaico', 'orientamento-pannelli-solari', 'impianto-fotovoltaico-3-kw', 'fotovoltaico-balcone'],
  sources: ['pvgis', 'dm_cer'],
  it: {
    slug: 'pannelli-fotovoltaici',
    nav: 'Pannelli fotovoltaici',
    card: 'Quanti pannelli servono per ogni potenza, quanto tetto occupano e quanti kWh dà un metro quadrato.',
    title: 'Pannelli fotovoltaici 2026: quanti ne servono e quanto tetto',
    description: 'Pannelli fotovoltaici 2026: quanti moduli servono per 3, 4,5 o 6 kWp, quanti metri quadrati di tetto occupano e quanti kWh produce un metro quadrato all\'anno.',
    h1: 'Pannelli fotovoltaici: numero, superficie e resa per metro quadrato',
    intro: `Con moduli da ${IT.num(M.kwp_per_pannello * 1000)} W servono ${p3.n} pannelli e circa ${IT.num(p3.m2)} m² per 3 kWp; in Italia ogni metro quadrato di pannello produce in media ${IT.num(it)} kWh l'anno, da ${IT.num(mi)} a Milano a ${IT.num(pa)} a Palermo.`,
    resume: `Un pannello fotovoltaico, o modulo, si descrive con la sua potenza di picco in watt, misurata in condizioni standard di laboratorio, e con le sue misure. I moduli in silicio cristallino per le case hanno oggi in genere potenze fra i 400 e i 450 watt; nei calcoli usiamo come ipotesi un modulo da ${IT.num(M.kwp_per_pannello * 1000)} W con una superficie di ${IT.num(M.m2_per_pannello, 2)} metri quadrati, pari a circa ${IT.num(wM2)} watt per metro quadrato e un'efficienza intorno al ${IT.pct(eff)}. Con questa ipotesi un impianto da 3 kWp richiede ${p3.n} moduli e uno da 4,5 kWp ne richiede ${p45.n}. La produzione non dipende dalla marca ma dalla potenza totale, dal sole del vostro comune e dall'orientamento: per questo PVGIS calcola i kWh per kWp e non per pannello. Moltiplicando la resa media italiana di ${IT.num(ITALIA.ey)} kWh per kWp per la potenza di un metro quadrato si ottengono circa ${IT.num(it)} kWh l'anno per metro quadrato di modulo. Il mini-simulatore converte una potenza in numero di pannelli e superficie.`,
    faqs: [
      { q: 'Quanti pannelli servono per 3 kW?', a: `Con moduli da ${IT.num(M.kwp_per_pannello * 1000)} W servono ${p3.n} pannelli, che danno ${IT.num(p3.kwpEffettivi, 2)} kWp, e circa ${IT.num(p3.m2)} metri quadrati di superficie. Con moduli da 400 W ne servono otto. Contano la potenza totale scritta nel preventivo e lo spazio libero sul tetto, al netto di camini, lucernari e distanze dai bordi richieste dall'installatore.` },
      { q: 'Quanto produce un pannello fotovoltaico da 430 W?', a: `In un anno, in media italiana, circa ${IT.num(ITALIA.ey * M.kwp_per_pannello)} kWh a 30° verso sud: ${IT.num(CITTA.milano.ey * M.kwp_per_pannello)} a Milano e ${IT.num(CITTA.palermo.ey * M.kwp_per_pannello)} a Palermo, secondo PVGIS. Un pannello in ombra parziale produce molto meno e, se è in serie con gli altri, può abbassare la resa di tutta la stringa senza ottimizzatori.` },
      { q: 'Meglio pannelli più potenti o più pannelli?', a: 'A parità di potenza totale la produzione è quasi la stessa. Moduli più potenti occupano meno tetto e richiedono meno fissaggi, quindi servono quando lo spazio è poco. Su un tetto grande conta di più il prezzo per kWp del preventivo. Confrontate le offerte dividendo il totale per i kWp, non per il numero di pannelli.' },
    ],
    body: (h) => `
<h2>Moduli e superficie per ogni potenza</h2>
${h.table(['Potenza', 'Moduli', 'Potenza effettiva', 'Superficie', 'Produzione media Italia'], KWP.map((k) => { const p = pannelli(k); return [`${h.num(k, 1)} kWp`, p.n, `${h.num(p.kwpEffettivi, 2)} kWp`, `${h.num(p.m2)} m²`, `${h.num(p.kwpEffettivi * ITALIA.ey)} kWh`]; }), `Ipotesi: moduli da ${h.num(M.kwp_per_pannello * 1000)} W e ${h.num(M.m2_per_pannello, 2)} m² ciascuno; produzione con ${h.num(ITALIA.ey)} kWh per kWp a 30° sud (media PVGIS pesata sulla popolazione).`, ['l', 'r', 'r', 'r', 'r'])}
<p>Il numero di moduli si arrotonda per eccesso, quindi la potenza effettiva supera di poco quella richiesta. La superficie è quella dei soli moduli: su un tetto a falda servono margini dai bordi e dal colmo, su un tetto piano le file vanno distanziate per non farsi ombra in inverno, e la superficie occupata cresce di molto.</p>

<h2>Che cosa guardare nella scheda tecnica</h2>
<p>La potenza di picco e la tolleranza, che dovrebbe essere solo positiva. Il coefficiente di temperatura, perché d'estate il modulo scalda e perde rendimento: più basso è, meglio è. La garanzia di prodotto e quella di rendimento, che indica la potenza minima dopo un certo numero di anni. Le dimensioni e il peso, per la verifica della struttura del tetto.</p>
<p>Le stime di produzione di questo sito vengono da ${h.src('pvgis', 'PVGIS 5.3')} per moduli in silicio cristallino con il ${h.num(M.perdite_pct)} % di perdite di sistema, e valgono per qualsiasi marca. Il costo di riferimento per kW del ${h.src('dm_cer', 'decreto CER')} comprende moduli, inverter, strutture e installazione. Per l'effetto dell'inclinazione e dell'esposizione c'è la pagina ${h.a('orientamento-pannelli-solari', 'orientamento dei pannelli')}.</p>`,
  },
  en: {
    slug: 'solar-panels-italy',
    nav: 'Solar panels',
    card: 'How many panels each size needs, how much roof they take and how many kWh one square metre gives.',
    title: 'Solar Panels Italy 2026: How Many and How Much Roof Space',
    description: 'Solar panels in Italy 2026: how many modules 3, 4.5 or 6 kWp need, how many square metres of roof they cover and how many kWh one square metre yields a year.',
    h1: 'Solar panels: number, area and output per square metre',
    intro: `With ${EN.num(M.kwp_per_pannello * 1000)} W modules, 3 kWp need ${p3.n} panels and about ${EN.num(p3.m2)} m²; in Italy each square metre of panel produces on average ${EN.num(it)} kWh a year, from ${EN.num(mi)} in Milan to ${EN.num(pa)} in Palermo.`,
    resume: `A solar panel, or module, is described by its peak power in watts, measured under standard laboratory conditions, and by its size. Crystalline silicon modules for homes today generally range from 400 to 450 watts; in our calculations we assume a ${EN.num(M.kwp_per_pannello * 1000)} W module with an area of ${EN.num(M.m2_per_pannello, 2)} square metres, about ${EN.num(wM2)} watts per square metre and an efficiency of around ${EN.pct(eff)}. On that basis a 3 kWp system needs ${p3.n} modules and a 4.5 kWp one needs ${p45.n}. Output depends not on the brand but on total power, the sun in your comune and orientation: that is why PVGIS works in kWh per kWp rather than per panel. Multiplying the Italian average yield of ${EN.num(ITALIA.ey)} kWh per kWp by the power of one square metre gives about ${EN.num(it)} kWh a year per square metre of module. The mini-calculator converts a target size into a number of panels and an area.`,
    faqs: [
      { q: 'How many solar panels do you need for 3 kW?', a: `With ${EN.num(M.kwp_per_pannello * 1000)} W modules you need ${p3.n} panels, giving ${EN.num(p3.kwpEffettivi, 2)} kWp, and about ${EN.num(p3.m2)} square metres. With 400 W modules you need eight. What counts is the total power in the quote and the free space on the roof, after chimneys, skylights and the edge distances the installer requires.` },
      { q: 'How much does a 430 W solar panel produce in Italy?', a: `In a year, on the Italian average, about ${EN.num(ITALIA.ey * M.kwp_per_pannello)} kWh at 30° facing south: ${EN.num(CITTA.milano.ey * M.kwp_per_pannello)} in Milan and ${EN.num(CITTA.palermo.ey * M.kwp_per_pannello)} in Palermo, according to PVGIS. A partly shaded panel produces much less and, if wired in series with others, can drag down the whole string without optimisers.` },
      { q: 'More powerful panels or more panels?', a: 'For the same total power, output is almost the same. More powerful modules take less roof and need fewer fixings, so they help when space is short. On a large roof the quote\'s price per kWp matters more. Compare offers by dividing the total by the kWp, not by the number of panels.' },
    ],
    body: (h) => `
<h2>Modules and area for each size</h2>
${h.table(['Size', 'Modules', 'Actual size', 'Area', 'Average output in Italy'], KWP.map((k) => { const p = pannelli(k); return [`${h.num(k, 1)} kWp`, p.n, `${h.num(p.kwpEffettivi, 2)} kWp`, `${h.num(p.m2)} m²`, `${h.num(p.kwpEffettivi * ITALIA.ey)} kWh`]; }), `Assumption: ${h.num(M.kwp_per_pannello * 1000)} W modules of ${h.num(M.m2_per_pannello, 2)} m² each; output at ${h.num(ITALIA.ey)} kWh per kWp at 30° south (PVGIS, population-weighted average).`, ['l', 'r', 'r', 'r', 'r'])}
<p>The number of modules is rounded up, so the actual size is slightly above the target. The area is that of the modules alone: a pitched roof needs margins from the edges and ridge, and on a flat roof rows must be spaced so as not to shade each other in winter, which greatly increases the area used.</p>

<h2>What to check on the datasheet</h2>
<p>Peak power and tolerance, which should be positive only. The temperature coefficient, because in summer the module heats up and loses efficiency: the lower the better. The product warranty and the performance warranty, which states the minimum power after a given number of years. Size and weight, for checking the roof structure.</p>
<p>This site's output estimates come from ${h.src('pvgis', 'PVGIS 5.3')} for crystalline silicon modules with ${h.num(M.perdite_pct)}% system losses, and apply to any brand. The reference cost per kW in the ${h.src('dm_cer', 'energy community decree')} covers modules, inverter, mounting and installation. For the effect of tilt and facing see ${h.a('orientamento-pannelli-solari', 'panel orientation')}.</p>`,
  },
});
