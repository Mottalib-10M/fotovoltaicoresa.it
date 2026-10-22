import { defineGuide } from '../../lib/guide-types';
import { calcola, costoRiferimento, PREZZO_EVITATO_CT, valoreRidKwh } from '../../lib/engine/fv';
import { luogoCitta } from '../../lib/engine/dati';
import { P, IT, EN } from '../../lib/fmt';

/** Accumulo: 6 kWp a Roma con 3 000 kWh, batteria da 0 a 15 kWh; stesso impianto a Milano e Palermo. */
const roma = luogoCitta('roma'), milano = luogoCitta('milano'), palermo = luogoCitta('palermo');
const b = (l: typeof roma, kwp: number, bat: number, cons = 3000) => calcola({ luogo: l, kwp, tilt: 30, az: 0, consumo: cons, batteria: bat, primaCasa: true });
const SIZES = [0, 5, 10, 15];
const rows = SIZES.map((s) => ({ s, r: b(roma, 6, s) }));
const r0 = rows[0].r, r5 = rows[1].r, r10 = rows[2].r, r15 = rows[3].r;
const extra = (r: typeof r0) => r.beneficio - r0.beneficio;
const costoB = (kwh: number) => costoRiferimento(0, kwh);
/** Rientro della sola batteria: costo netto (dopo detrazione) diviso il beneficio in più. */
const rientroB = (kwh: number, r: typeof r0) => (extra(r) > 0 ? costoB(kwh) * (1 - P.detrazione.aliquota_prima_casa) / extra(r) : null);
const gap = PREZZO_EVITATO_CT - valoreRidKwh(roma.reg) * 100;
const mi10 = b(milano, 6, 10), mi0 = b(milano, 6, 0), pa10 = b(palermo, 6, 10), pa0 = b(palermo, 6, 0);
const small = b(roma, 3, 5), small0 = b(roma, 3, 0);

export default defineGuide({
  id: 'fotovoltaico-con-accumulo',
  group: 'calcolo',
  order: 10,
  tool: 'accumulo',
  toolPreset: { kwp: 6, bat: 10, cons: 3000 },
  related: ['costo-impianto-fotovoltaico', 'dimensionamento-impianto-fotovoltaico', 'impianto-fotovoltaico-6-kw', 'bonus-fotovoltaico', 'ritiro-dedicato'],
  sources: ['arera_consumi', 'pvgis', 'dl34_119', 'ade_come', 'gse_rid_prezzi'],
  it: {
    slug: 'fotovoltaico-con-accumulo',
    nav: 'Fotovoltaico con accumulo',
    card: 'Quanta energia in più resta in casa con la batteria, quanto vale ogni anno e in quanti anni la batteria si ripaga.',
    title: 'Fotovoltaico con accumulo 2026: quanto rende la batteria',
    description: `Fotovoltaico con accumulo 2026: autoconsumo ora per ora con e senza batteria, beneficio annuo in più, detrazione e rientro della sola batteria in casa.`,
    h1: 'Pannelli solari e fotovoltaico con accumulo: quanto rende la batteria nel 2026',
    intro: `Con 6 kWp a Roma e 3 000 kWh di consumo, 10 kWh di batteria portano l'autoconsumo dal ${IT.pct(r0.quota)} al ${IT.pct(r10.quota)} e valgono ${IT.eur(extra(r10))} in più ogni anno.`,
    resume: `Una batteria non produce energia: sposta alla sera quella che a mezzogiorno andrebbe in rete. Il suo valore è quindi la differenza fra due prezzi. Nel 2026 ogni kWh consumato in casa evita in media ${IT.ct(PREZZO_EVITATO_CT)} di materia energia, oneri e imposte, secondo i quattro trimestri ARERA, mentre lo stesso kWh immesso in rete con il ritiro dedicato vale a Roma circa ${IT.ct(valoreRidKwh(roma.reg) * 100)}: ogni kWh spostato guadagna circa ${IT.num(gap, 1)} centesimi. Abbiamo simulato ora per ora un impianto da 6 kWp a Roma con 3 000 kWh di consumo, usando la produzione PVGIS 2019-2023 e i prelievi orari medi delle famiglie del Lazio misurati da ARERA. Senza batteria la casa usa il ${IT.pct(r0.quota)} della produzione; con 5 kWh il ${IT.pct(r5.quota)}, con 10 kWh il ${IT.pct(r10.quota)}, con 15 kWh il ${IT.pct(r15.quota)}. Il guadagno cresce sempre meno: i primi kWh di batteria si riempiono e si svuotano quasi ogni giorno, gli ultimi solo d'estate. Al costo di riferimento di ${IT.eur(P.costi.accumulo_eur_kwh)} per kWh e con la detrazione del ${IT.pct(P.detrazione.aliquota_prima_casa)}, 10 kWh si ripagano in ${IT.anni(rientroB(10, r10))}.`,
    faqs: [
      { q: 'Quanti kWh di batteria servono per un impianto da 6 kW?', a: `Dipende dai consumi serali, non dalla potenza. Con 3 000 kWh l'anno a Roma, 5 kWh portano l'autoconsumo al ${IT.pct(r5.quota)} e 10 kWh al ${IT.pct(r10.quota)}; oltre, il guadagno per kWh scende. Una regola pratica è guardare quanta energia comprate fra il tramonto e la mattina: una batteria più grande di quel consumo resta in parte vuota per gran parte dell'anno.` },
      { q: 'Il simulatore applica la detrazione anche alla batteria?', a: `Sì: la batteria viene di solito installata e fatturata insieme all'impianto, e il simulatore applica a tutta la spesa la detrazione del ${IT.pct(P.detrazione.aliquota_prima_casa)} sulla prima casa del proprietario o del ${IT.pct(P.detrazione.aliquota_altri)} negli altri casi, in dieci rate. L'Agenzia delle Entrate chiede bonifico « parlante » e, per gli interventi con fonti rinnovabili, la comunicazione all'ENEA entro ${P.detrazione.enea_giorni} giorni: fate confermare la spesa al vostro consulente.` },
      { q: 'Conviene aggiungere la batteria a un impianto piccolo da 3 kW?', a: `Meno che su un impianto grande, perché il surplus da spostare è minore. A Roma, con 3 kWp e 3 000 kWh di consumo, 5 kWh di batteria alzano l'autoconsumo dal ${IT.pct(small0.quota)} al ${IT.pct(small.quota)} e valgono ${IT.eur(small.beneficio - small0.beneficio)} l'anno. Inserite il prezzo reale della batteria nel simulatore: è il dato che decide.` },
      { q: 'La batteria rende di più al Nord o al Sud?', a: `Le differenze sono piccole perché i consumi serali sono simili. Con 6 kWp e 10 kWh la batteria vale ${IT.eur(mi10.beneficio - mi0.beneficio)} l'anno a Milano e ${IT.eur(pa10.beneficio - pa0.beneficio)} a Palermo. Conta di più il prezzo del ritiro dedicato nella vostra zona: dove il surplus vale meno, spostarlo in casa rende un po' di più.` },
    ],
    body: (h) => `
<h2>Con e senza batteria, kWh per kWh</h2>
${h.table(['Batteria', 'Autoconsumo', 'Energia in rete', 'Beneficio annuo', 'In più', 'Rientro della batteria'], rows.map(({ s, r }) => [s ? `${h.num(s)} kWh` : 'nessuna', h.pct(r.quota, 0), `${h.num(r.immessa)} kWh`, h.eur(r.beneficio), s ? h.eur(extra(r)) : '–', s ? (rientroB(s, r) === null ? '–' : `${h.num(rientroB(s, r)!, 1)} anni`) : '–']), `Roma, 6 kWp a 30° sud, consumo 3 000 kWh, batteria al costo di riferimento di ${h.eur(P.costi.accumulo_eur_kwh)} per kWh meno la detrazione del ${h.pct(P.detrazione.aliquota_prima_casa, 0)}.`, ['l', 'r', 'r', 'r', 'r', 'r'])}
<p>Il beneficio annuo somma il risparmio in bolletta e il ricavo del ritiro dedicato, meno il piccolo corrispettivo del GSE. La batteria toglie energia alla rete e la dà alla casa: il ricavo dal GSE scende, il risparmio sale di più. Il rientro dell'ultima colonna riguarda solo la batteria, al costo netto dopo la detrazione, ed è il numero da confrontare con la sua garanzia.</p>

<h2>Perché ogni kWh in più vale meno</h2>
<p>Il simulatore lavora ora per ora su cinque anni di meteo reale. Una batteria piccola si riempie quasi ogni giorno di sole e si svuota ogni sera: lavora molto. Una batteria grande si riempie solo nelle giornate lunghe e luminose e d'inverno resta in parte vuota, perché il surplus non c'è. Per questo il beneficio in più fra 10 e 15 kWh è molto minore di quello fra 0 e 5 kWh. Calcoliamo una carica solo dal fotovoltaico, con rendimento di andata e ritorno del ${h.pct(P.modello.batteria_rendimento, 0)} e capacità utile del ${h.pct(P.modello.batteria_utile, 0)} di quella nominale.</p>
<p>Il costo è l'altra metà del conto. Non pubblichiamo un prezzo di mercato: come valore iniziale usiamo ${h.eur(P.costi.accumulo_eur_kwh)} per kWh, il limite di spesa per i sistemi di accumulo fissato dal ${h.src('dl34_119', 'decreto-legge 34/2020, articolo 119')}. Se il vostro preventivo è più basso, la batteria si ripaga prima; scrivete il totale nel campo « Costo totale ».</p>

<h2>Quando la batteria ha più senso</h2>
<p>Rende di più se la casa consuma molto la sera e la notte: cucina a induzione, pompa di calore, ricarica dell'auto dopo il lavoro. Rende meno se si è a casa di giorno e si possono spostare lavatrice e lavastoviglie nelle ore di sole, perché quell'energia è già autoconsumata senza batteria. Prima di comprarla, conviene guardare le letture orarie del contatore nell'area clienti del fornitore: mostrano quanto si consuma fra il tramonto e la mattina, e quella è la taglia che la batteria può davvero coprire. La ${h.src('ade_come', 'scheda « Come e quando » dell\'Agenzia delle Entrate')} spiega pagamenti e comunicazioni per la detrazione.</p>`,
  },
  en: {
    slug: 'solar-battery-storage',
    nav: 'Solar with battery storage',
    card: 'How much more energy stays at home with a battery, what it is worth each year and how many years the battery takes to pay back.',
    title: 'Solar Battery Storage Italy 2026: What a Battery Earns',
    description: `Solar with battery storage in Italy 2026: hour-by-hour self-consumption with and without a battery, extra yearly benefit, tax deduction and battery payback.`,
    h1: 'Solar with battery storage in Italy: what a battery really earns in 2026',
    intro: `With 6 kWp in Rome and 3,000 kWh of use, a 10 kWh battery lifts self-consumption from ${EN.pct(r0.quota)} to ${EN.pct(r10.quota)} and is worth ${EN.eur(extra(r10))} more each year.`,
    resume: `A battery produces no energy: it moves to the evening what would otherwise go to the grid at midday. Its value is therefore the gap between two prices. In 2026 each kWh used at home avoids on average ${EN.ct(PREZZO_EVITATO_CT)} of energy, system charges and taxes, according to ARERA's four quarters, while the same kWh exported under the ritiro dedicato (the GSE's export scheme) is worth about ${EN.ct(valoreRidKwh(roma.reg) * 100)} in Rome: each shifted kWh earns about ${EN.num(gap, 1)} cents. We simulated, hour by hour, a 6 kWp system in Rome with 3,000 kWh of consumption, using PVGIS output for 2019 to 2023 and the average hourly withdrawals of households in Lazio metered by ARERA. Without a battery the home uses ${EN.pct(r0.quota)} of the output; with 5 kWh, ${EN.pct(r5.quota)}; with 10 kWh, ${EN.pct(r10.quota)}; with 15 kWh, ${EN.pct(r15.quota)}. The gain keeps shrinking: the first kWh of storage fill and empty almost every day, the last ones only in summer. At the reference cost of ${EN.eur(P.costi.accumulo_eur_kwh)} per kWh and with the ${EN.pct(P.detrazione.aliquota_prima_casa)} tax deduction, 10 kWh pay back in ${EN.anni(rientroB(10, r10))}.`,
    faqs: [
      { q: 'How many kWh of battery suit a 6 kW system?', a: `It depends on evening use, not on the system size. With 3,000 kWh a year in Rome, 5 kWh bring self-consumption to ${EN.pct(r5.quota)} and 10 kWh to ${EN.pct(r10.quota)}; beyond that, the gain per kWh falls. A practical rule is to look at how much energy you buy between sunset and morning: a battery larger than that stays partly empty for much of the year.` },
      { q: 'Does the calculator apply the tax deduction to the battery?', a: `Yes: a battery is usually installed and invoiced together with the system, so the calculator applies the deduction to the whole cost, ${EN.pct(P.detrazione.aliquota_prima_casa)} on the owner's main home or ${EN.pct(P.detrazione.aliquota_altri)} otherwise, in ten instalments. The Agenzia delle Entrate requires a dedicated bank transfer and, for works using renewables, notice to ENEA within ${P.detrazione.enea_giorni} days: have your adviser confirm the cost.` },
      { q: 'Is a battery worth adding to a small 3 kW system?', a: `Less than on a large one, because there is less surplus to shift. In Rome, with 3 kWp and 3,000 kWh of use, a 5 kWh battery lifts self-consumption from ${EN.pct(small0.quota)} to ${EN.pct(small.quota)} and is worth ${EN.eur(small.beneficio - small0.beneficio)} a year. Enter the real battery price in the calculator: that is the figure that decides.` },
      { q: 'Does a battery earn more in northern or southern Italy?', a: `The differences are small because evening use is similar. With 6 kWp and 10 kWh, the battery is worth ${EN.eur(mi10.beneficio - mi0.beneficio)} a year in Milan and ${EN.eur(pa10.beneficio - pa0.beneficio)} in Palermo. The ritiro dedicato price in your zone matters more: where exported power is worth less, keeping it at home earns a little more.` },
    ],
    body: (h) => `
<h2>With and without a battery, kWh by kWh</h2>
${h.table(['Battery', 'Self-use', 'To the grid', 'Benefit a year', 'Extra', 'Battery payback'], rows.map(({ s, r }) => [s ? `${h.num(s)} kWh` : 'none', h.pct(r.quota, 0), `${h.num(r.immessa)} kWh`, h.eur(r.beneficio), s ? h.eur(extra(r)) : '–', s ? (rientroB(s, r) === null ? '–' : `${h.num(rientroB(s, r)!, 1)} years`) : '–']), `Rome, 6 kWp at 30° south, 3,000 kWh of use, battery at the reference cost of ${h.eur(P.costi.accumulo_eur_kwh)} per kWh less the ${h.pct(P.detrazione.aliquota_prima_casa, 0)} deduction.`, ['l', 'r', 'r', 'r', 'r', 'r'])}
<p>The annual benefit adds the bill saving and the ritiro dedicato income, less the small GSE fee. The battery takes energy away from the grid and gives it to the home: GSE income falls, the saving rises by more. The payback in the last column covers the battery alone, at its net cost after the deduction, and is the figure to compare with its warranty.</p>

<h2>Why each extra kWh is worth less</h2>
<p>The calculator works hour by hour over five years of real weather. A small battery fills on almost every sunny day and empties every evening: it works hard. A large battery only fills on long bright days and stays partly empty in winter, because there is no surplus. That is why the extra benefit between 10 and 15 kWh is far smaller than between 0 and 5 kWh. We model charging from solar only, with a round-trip efficiency of ${h.pct(P.modello.batteria_rendimento, 0)} and usable capacity of ${h.pct(P.modello.batteria_utile, 0)} of the nameplate.</p>
<p>Cost is the other half of the sum. We publish no market price: as a starting value we use ${h.eur(P.costi.accumulo_eur_kwh)} per kWh, the spending cap for storage set by ${h.src('dl34_119', 'Decree-Law 34/2020, article 119')}. If your quote is lower, the battery pays back sooner; enter the total in the « Total cost » field.</p>

<h2>When a battery makes most sense</h2>
<p>It earns more if the home uses a lot in the evening and at night: induction cooking, a heat pump, charging the car after work. It earns less if someone is home in the daytime and can run the washing machine and dishwasher in sunny hours, because that energy is already self-consumed without a battery. Before buying, check the hourly meter readings in your supplier's customer area: they show how much you use between sunset and morning, and that is the size a battery can really cover. The Agenzia delle Entrate's ${h.src('ade_come', '« how and when » page')} explains payments and notices for the deduction.</p>`,
  },
});
