import { defineGuide } from '../../lib/guide-types';
import { calcola, PREZZO_EVITATO_CT } from '../../lib/engine/fv';
import { luogoCitta } from '../../lib/engine/dati';
import { IT, EN } from '../../lib/fmt';

/**
 * Fotovoltaico da balcone: 0,8 kWp in verticale o inclinato sulla ringhiera. Nessun prezzo di kit inventato:
 * il rientro si esprime in mesi per ogni 100 € spesi. Nessuna regola di connessione affermata senza fonte.
 */
const roma = luogoCitta('roma'), milano = luogoCitta('milano'), palermo = luogoCitta('palermo');
const b = (l: typeof roma, kwp: number, tilt: number, cons = 2700, az = 0) => calcola({ luogo: l, kwp, tilt, az, consumo: cons, batteria: 0, primaCasa: true, ridAttivo: false, detraibile: false, costo: 100 });
const v = b(roma, 0.8, 90), i70 = b(roma, 0.8, 70), mi = b(milano, 0.8, 70), pa = b(palermo, 0.8, 70);
const ov = b(roma, 0.8, 70, 2700, 90), es = b(roma, 0.8, 70, 2700, -90);
const due = b(roma, 1.6, 70), poco = b(roma, 0.8, 70, 1500);
/** Mesi per ripagare 100 € di kit con il solo risparmio in bolletta. */
const mesi100 = (x: typeof v) => (100 / x.risparmio) * 12;
const CASI = [
  ['Roma, 70° sud', 'Rome, 70° south', i70], ['Roma, verticale sud', 'Rome, vertical south', v], ['Roma, 70° ovest', 'Rome, 70° west', ov],
  ['Roma, 70° est', 'Rome, 70° east', es], ['Milano, 70° sud', 'Milan, 70° south', mi], ['Palermo, 70° sud', 'Palermo, 70° south', pa],
] as const;

export default defineGuide({
  id: 'fotovoltaico-balcone',
  group: 'calcolo',
  order: 40,
  tool: 'balcone',
  toolPreset: { kwp: 0.8, tilt: 70, cons: 2700 },
  related: ['quanto-produce-un-impianto-fotovoltaico', 'orientamento-pannelli-solari', 'pannelli-fotovoltaici', 'fotovoltaico-conviene'],
  sources: ['pvgis', 'arera_q4', 'arera_consumi'],
  it: {
    slug: 'fotovoltaico-balcone',
    nav: 'Fotovoltaico da balcone',
    card: 'Quanto produce e quanto fa risparmiare un kit da balcone sulla ringhiera, in verticale o inclinato.',
    title: 'Fotovoltaico da balcone plug and play 2026: resa e risparmio',
    description: 'Fotovoltaico da balcone 2026: quanto produce un kit da 800 W sulla ringhiera nel vostro comune, quanta energia usate in casa e in quanti mesi torna ogni 100 €.',
    h1: 'Fotovoltaico da balcone: quanto produce e quanto fa risparmiare',
    intro: `A Roma un kit da 0,8 kWp inclinato a 70° verso sud produce ${IT.kwh(i70.produzione)} l'anno, ne usate in casa il ${IT.pct(i70.quota)} e risparmiate circa ${IT.eur(i70.risparmio)} in bolletta: ogni 100 € di prezzo del kit tornano in ${IT.num(mesi100(i70))} mesi.`,
    resume: `Un kit fotovoltaico da balcone, spesso venduto come « plug and play », è un piccolo impianto, di solito due moduli e un microinverter, fissato alla ringhiera o a una parete e collegato all'impianto elettrico di casa. Produce poco, ma quasi tutto viene consumato subito dagli apparecchi sempre accesi, come frigorifero, router e standby, quindi ogni kWh vale il prezzo pieno evitato in bolletta, circa ${IT.num(PREZZO_EVITATO_CT, 1)} centesimi nel 2026 secondo le condizioni ARERA di tutela per materia energia, oneri e imposte. Con i dati PVGIS, 0,8 kWp a Roma producono ${IT.kwh(i70.produzione)} l'anno inclinati a 70° verso sud e ${IT.kwh(v.produzione)} in verticale, perché una ringhiera dritta perde circa un terzo rispetto all'inclinazione ottimale. Un balcone esposto a est o a ovest produce ${IT.kwh(es.produzione)} o ${IT.kwh(ov.produzione)}. Non pubblichiamo un prezzo dei kit, che cambia molto fra modelli: il simulatore usa il valore che inserite e restituisce il tempo di rientro. Senza contratto di ritiro dedicato il poco surplus immesso non viene pagato.`,
    faqs: [
      { q: 'Quanto produce un pannello da balcone da 800 W?', a: `A Roma ${IT.kwh(i70.produzione)} l'anno inclinato a 70° verso sud, ${IT.kwh(v.produzione)} se appeso in verticale. A Milano, alla stessa inclinazione, ${IT.kwh(mi.produzione)}, a Palermo ${IT.kwh(pa.produzione)}. Sono stime PVGIS per il vostro comune senza ombre: un balcone coperto dal piano di sopra per parte del giorno produce meno.` },
      { q: 'Quanto si risparmia davvero con il fotovoltaico da balcone?', a: `A Roma circa ${IT.eur(i70.risparmio)} l'anno con 2 700 kWh di consumo, perché si usa in casa il ${IT.pct(i70.quota)} della produzione. Con un consumo più basso, 1 500 kWh, la quota scende al ${IT.pct(poco.quota)} e il risparmio a ${IT.eur(poco.risparmio)}. Il valore dipende dal prezzo che pagate: scrivete il vostro nel simulatore.` },
      { q: 'Ha senso mettere due kit sul balcone?', a: `Raddoppiando a 1,6 kWp la produzione raddoppia, ma la quota usata in casa scende dal ${IT.pct(i70.quota)} al ${IT.pct(due.quota)}, perché a mezzogiorno gli apparecchi accesi non bastano. Il risparmio passa da ${IT.eur(i70.risparmio)} a ${IT.eur(due.risparmio)}. Senza ritiro dedicato il surplus resta non pagato: oltre questa taglia conviene un impianto sul tetto.` },
      { q: 'Serve un permesso per il fotovoltaico da balcone?', a: 'Le regole di connessione alla rete, i limiti di potenza e il regolamento di condominio cambiano secondo il caso. Prima dell\'acquisto chiedete al vostro distributore di energia come comunicare l\'impianto e all\'amministratore se il regolamento limita gli interventi sulla facciata. Su questo punto non diamo indicazioni, perché non abbiamo una fonte ufficiale aggiornata.' },
    ],
    body: (h) => `
<h2>Esposizione del balcone e risultato</h2>
${h.table(['Caso', 'Produzione', 'Usata in casa', 'Risparmio annuo', 'Mesi per 100 €'], CASI.map(([a, , x]) => [a, `${h.num(x.produzione)} kWh`, h.pct(x.quota), h.eur(x.risparmio), h.num(mesi100(x))]), `0,8 kWp, consumo 2 700 kWh, prezzo evitato ${h.num(PREZZO_EVITATO_CT, 2)} c€/kWh, nessun ritiro dedicato.`, ['l', 'r', 'r', 'r', 'r'])}
<p>Il balcone a sud è il migliore, ma anche est e ovest danno un risultato utile, perché il kit è piccolo e quasi tutta l'energia viene usata. La verticale costa circa un quarto della produzione rispetto ai 70°; per molti balconi è l'unica possibilità e il risparmio resta comunque nell'ordine delle centinaia di euro.</p>

<h2>Perché il kit da balcone si ripaga presto</h2>
<p>Un impianto sul tetto immette in rete la metà o più della produzione. Un kit da 0,8 kWp, invece, lavora sotto il consumo di base della casa: frigorifero, congelatore, caldaia, router e apparecchi in standby assorbono già in media qualche centinaio di watt. Ogni kWh prodotto viene quindi pagato al prezzo pieno della ${h.src('arera_q4', 'bolletta ARERA')}, non al prezzo del ritiro dedicato.</p>
<p>Il limite è la taglia: con due kit il rendimento per kWp scende. Chi consuma molto di giorno, per esempio chi lavora da casa, usa in casa una quota maggiore; il simulatore stima questa quota con i profili orari dei ${h.src('arera_consumi', 'prelievi ARERA')} della vostra regione. Per confrontare con un impianto vero, la pagina ${h.a('quanto-produce-un-impianto-fotovoltaico', 'quanto produce un impianto')} mostra le taglie da tetto.</p>

<h2>Prima di comprare</h2>
<p>Verificate l'ombra del balcone in diverse ore, la portata della ringhiera e il fissaggio, che deve resistere al vento. La detrazione per i lavori in casa non è inclusa nel calcolo: non abbiamo trovato un'indicazione ufficiale che la riconosca per un kit acquistato e montato da sé, quindi chiedete al vostro consulente fiscale.</p>`,
  },
  en: {
    slug: 'balcony-solar-italy',
    nav: 'Balcony solar',
    card: 'How much a balcony kit on the railing produces and saves, vertical or tilted.',
    title: 'Balcony Solar Italy 2026: Real Output and Bill Savings',
    description: 'Balcony solar in Italy 2026: what an 800 W kit on the railing produces in your comune, how much of it you use at home and how many months repay €100 spent.',
    h1: 'Balcony solar in Italy: what it produces and saves',
    intro: `In Rome a 0.8 kWp kit tilted at 70° to the south produces ${EN.kwh(i70.produzione)} a year, ${EN.pct(i70.quota)} of it is used at home and it saves about ${EN.eur(i70.risparmio)} on the bill: each €100 of kit price comes back in ${EN.num(mesi100(i70))} months.`,
    resume: `A balcony solar kit, often sold as « plug and play », is a small system, usually two panels and a microinverter, fixed to the railing or a wall and plugged into the home's wiring. It produces little, but almost all of it is consumed at once by always-on appliances such as the fridge, router and standby loads, so each kWh is worth the full price avoided on the bill, about ${EN.num(PREZZO_EVITATO_CT, 1)} cents in 2026 according to ARERA's protected-tariff conditions for energy, system charges and taxes. With PVGIS data, 0.8 kWp in Rome produce ${EN.kwh(i70.produzione)} a year tilted at 70° south and ${EN.kwh(v.produzione)} vertical, because a straight railing loses about a third compared with the best tilt. A balcony facing east or west produces ${EN.kwh(es.produzione)} or ${EN.kwh(ov.produzione)}. We publish no kit price, which varies widely between models: the calculator uses the value you enter and returns the payback time. Without a ritiro dedicato contract, the small surplus sent to the grid is not paid for.`,
    faqs: [
      { q: 'How much does an 800 W balcony panel produce in Italy?', a: `In Rome ${EN.kwh(i70.produzione)} a year tilted at 70° south, ${EN.kwh(v.produzione)} if hung vertically. In Milan, at the same tilt, ${EN.kwh(mi.produzione)}, in Palermo ${EN.kwh(pa.produzione)}. These are PVGIS estimates for your comune without shade: a balcony shaded by the floor above for part of the day produces less.` },
      { q: 'How much does balcony solar really save?', a: `In Rome about ${EN.eur(i70.risparmio)} a year with 2,700 kWh of consumption, because ${EN.pct(i70.quota)} of the output is used at home. With lower use, 1,500 kWh, the share falls to ${EN.pct(poco.quota)} and the saving to ${EN.eur(poco.risparmio)}. The value depends on the price you pay: enter yours in the calculator.` },
      { q: 'Is it worth putting two kits on the balcony?', a: `Doubling to 1.6 kWp doubles output, but the share used at home drops from ${EN.pct(i70.quota)} to ${EN.pct(due.quota)}, because at midday the running appliances are not enough. The saving goes from ${EN.eur(i70.risparmio)} to ${EN.eur(due.risparmio)}. Without the ritiro dedicato the surplus is unpaid: beyond this size a rooftop system makes more sense.` },
      { q: 'Do you need a permit for balcony solar in Italy?', a: 'Grid connection rules, power limits and condominium regulations vary from case to case. Before buying, ask your electricity distributor how to notify the system and the building manager whether the rules restrict changes to the facade. We give no guidance on this point, because we have no up-to-date official source.' },
    ],
    body: (h) => `
<h2>Balcony facing and result</h2>
${h.table(['Case', 'Output', 'Used at home', 'Yearly saving', 'Months per €100'], CASI.map(([, a, x]) => [a, `${h.num(x.produzione)} kWh`, h.pct(x.quota), h.eur(x.risparmio), h.num(mesi100(x))]), `0.8 kWp, 2,700 kWh use, avoided price ${h.num(PREZZO_EVITATO_CT, 2)} c€/kWh, no ritiro dedicato.`, ['l', 'r', 'r', 'r', 'r'])}
<p>A south balcony is best, but east and west still give a useful result, because the kit is small and nearly all its energy is used. Vertical mounting costs about a quarter of output compared with 70°; for many balconies it is the only option, and the saving still runs to hundreds of euros.</p>

<h2>Why a balcony kit pays back quickly</h2>
<p>A rooftop system sends half or more of its output to the grid. A 0.8 kWp kit, by contrast, works below the home's base load: fridge, freezer, boiler, router and standby devices already draw a few hundred watts on average. Each kWh produced is therefore worth the full price of the ${h.src('arera_q4', 'ARERA bill')}, not the ritiro dedicato price.</p>
<p>The limit is size: with two kits the yield per kWp drops. People who use more power by day, for example those working from home, use a larger share; the calculator estimates it with the hourly ${h.src('arera_consumi', 'ARERA withdrawal profiles')} for your region. To compare with a full system, the ${h.a('quanto-produce-un-impianto-fotovoltaico', 'solar output')} page shows rooftop sizes.</p>

<h2>Before buying</h2>
<p>Check the balcony's shade at different times, the railing's strength and the mounting, which must withstand wind. The home renovation deduction is not included in the sum: we found no official guidance recognising it for a kit bought and fitted by the owner, so ask your tax adviser.</p>`,
  },
});
