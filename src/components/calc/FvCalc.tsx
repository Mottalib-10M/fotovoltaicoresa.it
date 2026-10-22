/**
 * Simulatore fotovoltaico: comune (PVGIS), taglia, consumo, orientamento, batteria, detrazione, ritiro dedicato.
 * Una sola logica (lib/engine/fv.ts) e una « vista » per pagina, che sceglie il risultato in evidenza:
 * rientro, produzione, accumulo, costo, detrazione, ritiro dedicato, balcone, CER, dimensionamento.
 * Primo rendu = valori di default del build; l'URL si legge solo dopo il montaggio (lib/url-state.ts).
 */
import { useEffect, useMemo, useState } from 'react';
import NumberField from '../ui/NumberField';
import SelectField from '../ui/SelectField';
import Toggle from '../ui/Toggle';
import StackedBar from '../ui/StackedBar';
import ComuneField from '../ui/ComuneField';
import { calcola, costoRiferimento, PREZZO_EVITATO_CT, valoreRidKwh } from '../../lib/engine/fv';
import { consumoRegione, ROMA, type Luogo } from '../../lib/engine/dati';
import { P, REGIONI, RID } from '../../lib/engine/params';
import { readParams, num, str, updateURL } from '../../lib/url-state';
import type { Tool } from '../../lib/guide-types';
import { Zeilen, Aktionen, Kopf, Rechenweg, Hinweis, Monate, kasten, rahmen, raster, tx, fm, kwh, type L, type Zeile } from './kit';

export interface FvPreset { kwp?: number; bat?: number; cons?: number; tilt?: number; az?: number; q?: number }
const azOpt = (l: L) => [
  { value: '0', label: tx(l, 'Sud', 'South') }, { value: '-45', label: tx(l, 'Sud-est', 'South-east') }, { value: '45', label: tx(l, 'Sud-ovest', 'South-west') },
  { value: '-90', label: tx(l, 'Est', 'East') }, { value: '90', label: tx(l, 'Ovest', 'West') },
  { value: '-135', label: tx(l, 'Nord-est', 'North-east') }, { value: '135', label: tx(l, 'Nord-ovest', 'North-west') }, { value: '180', label: tx(l, 'Nord', 'North') },
];
const ombraOpt = (l: L) => [
  { value: '0', label: tx(l, 'nessuna', 'none') }, { value: '0.1', label: tx(l, 'poca (−10 %)', 'light (−10%)') },
  { value: '0.25', label: tx(l, 'media (−25 %)', 'moderate (−25%)') }, { value: '0.4', label: tx(l, 'forte (−40 %)', 'heavy (−40%)') },
];
const siNo = (l: L) => [{ value: '1', label: tx(l, 'Sì', 'Yes') }, { value: '0', label: tx(l, 'No', 'No') }];

export default function FvCalc({ lang = 'it', vista = 'rendimento', luogo: l0 = ROMA, preset = {}, methodHref, idp = 'fv' }: { lang?: L; vista?: Tool; luogo?: Luogo; preset?: FvPreset; methodHref?: string; idp?: string }) {
  const f = fm(lang);
  const balcone = vista === 'balcone';
  const [luogo, setLuogo] = useState<Luogo>(l0);
  const [kwp, setKwp] = useState(preset.kwp ?? (balcone ? 0.8 : 3));
  const [consMan, setConsMan] = useState<number | null>(preset.cons ?? null);
  const [bat, setBat] = useState(preset.bat ?? 0);
  const [az, setAz] = useState(String(preset.az ?? 0));
  const [tilt, setTilt] = useState(preset.tilt ?? (balcone ? 70 : 30));
  const [pc, setPc] = useState('1');
  const [costoMan, setCostoMan] = useState<number | null>(null);
  const [prezzo, setPrezzo] = useState(PREZZO_EVITATO_CT);
  const [ridMan, setRidMan] = useState<number | null>(null);
  const [ombra, setOmbra] = useState('0');
  const [quota, setQuota] = useState(preset.q ?? 50);
  const cons = consMan ?? consumoRegione(luogo.reg);
  const costo = costoMan ?? costoRiferimento(kwp, bat);
  const ridAuto = Math.round(valoreRidKwh(luogo.reg) * 10000) / 100;
  const ridCt = ridMan ?? ridAuto;
  useEffect(() => {
    const u = readParams(window.location.search); if (![...u.keys()].length) return;
    const c = str(u, 'c', ''); const m = c.match(/^(.+)\|([A-Z]{2})$/);
    if (m) fetch('/data/comuni.json').then((r) => r.json()).then((rows: Array<[string, string, number, number, number]>) => { const x = rows.find((r) => r[0] === m[1] && r[1] === m[2]); if (x) setLuogo({ nome: x[0], sigla: x[1], reg: x[2], ey: x[3] }); }).catch(() => {});
    setKwp(num(u, 'kwp', kwp)); if (u.has('cons')) setConsMan(num(u, 'cons', cons)); setBat(num(u, 'bat', bat)); setAz(str(u, 'az', az)); setTilt(num(u, 't', tilt));
    setPc(str(u, 'pc', pc)); if (u.has('k')) setCostoMan(num(u, 'k', costo)); setPrezzo(num(u, 'p', prezzo)); if (u.has('v')) setRidMan(num(u, 'v', ridCt)); setOmbra(str(u, 'o', ombra)); setQuota(num(u, 'q', quota));
  }, []);
  useEffect(() => {
    updateURL({ c: `${luogo.nome}|${luogo.sigla}`, kwp, cons: consMan ?? undefined, bat, az, t: tilt, pc, k: costoMan ?? undefined, p: prezzo, v: ridMan ?? undefined, o: ombra, q: vista === 'cer' ? quota : undefined });
  }, [luogo, kwp, consMan, bat, az, tilt, pc, costoMan, prezzo, ridMan, ombra, quota]);

  const inp = { luogo, kwp, tilt, az: Number(az), ombra: Number(ombra), consumo: cons, batteria: bat, primaCasa: pc === '1', costo, prezzoCt: prezzo, ridKwh: ridCt / 100, ridAttivo: !balcone, detraibile: !balcone, quotaCer: vista === 'cer' ? quota / 100 : 0 };
  const r = useMemo(() => calcola(inp), [luogo, kwp, tilt, az, ombra, cons, bat, pc, costo, prezzo, ridCt, quota, vista]);
  const r0 = useMemo(() => (vista === 'accumulo' ? calcola({ ...inp, batteria: 0, costo: costoMan ?? costoRiferimento(kwp, 0) }) : null), [luogo, kwp, tilt, az, ombra, cons, bat, pc, costo, prezzo, ridCt, vista]);
  const R = REGIONI[luogo.reg];
  const anni = (x: number | null) => (x === null ? tx(lang, 'oltre 20 anni', 'over 20 years') : tx(lang, `${f.num(x, 1)} anni`, `${f.num(x, 1)} years`));
  const kwpCopre = r.spec > 0 ? cons / r.spec : 0;

  const head: Record<Tool, [string, string, string]> = {
    rendimento: [tx(lang, 'Rientro dell\'investimento', 'Payback time'), anni(r.rientro), tx(lang, `${f.eur(r.beneficio)} l'anno in bolletta e dal GSE, più ${f.eur(r.rata)} di detrazione per dieci anni`, `${f.eur(r.beneficio)} a year on the bill and from the GSE, plus ${f.eur(r.rata)} of tax deduction for ten years`)],
    produzione: [tx(lang, 'Produzione in un anno', 'Output in a year'), kwh(lang, r.produzione), tx(lang, `${f.num(r.spec)} kWh per kWp a ${luogo.nome}, ${f.pct(r.quota, 0)} consumati in casa`, `${f.num(r.spec)} kWh per kWp in ${luogo.nome}, ${f.pct(r.quota, 0)} used at home`)],
    accumulo: [tx(lang, 'Autoconsumo con la batteria', 'Self-consumption with the battery'), f.pct(r.quota, 0), r0 ? tx(lang, `senza batteria ${f.pct(r0.quota, 0)}; la batteria vale ${f.eur(r.beneficio - r0.beneficio)} in più l'anno`, `without a battery ${f.pct(r0.quota, 0)}; the battery adds ${f.eur(r.beneficio - r0.beneficio)} a year`) : ''],
    costo: [tx(lang, 'Costo netto dopo la detrazione', 'Net cost after the tax deduction'), f.eur(r.costoNetto), tx(lang, `${f.eur(r.costo)} di spesa, ${f.eur(r.detrazione)} restituiti in dieci anni`, `${f.eur(r.costo)} spent, ${f.eur(r.detrazione)} returned over ten years`)],
    detrazione: [tx(lang, 'Detrazione ogni anno, per dieci anni', 'Tax deduction each year, for ten years'), f.eur(r.rata), tx(lang, `${f.eur(r.detrazione)} in tutto, il ${f.pct(r.aliquota, 0)} di ${f.eur(Math.min(r.costo, P.detrazione.tetto_eur))}`, `${f.eur(r.detrazione)} in total, ${f.pct(r.aliquota, 0)} of ${f.eur(Math.min(r.costo, P.detrazione.tetto_eur))}`)],
    rid: [tx(lang, 'Ricavo dal ritiro dedicato', 'Income from the ritiro dedicato'), tx(lang, `${f.eur(r.ricavoRid - r.fee)} l'anno`, `${f.eur(r.ricavoRid - r.fee)} a year`), tx(lang, `${kwh(lang, r.immessa)} immessi a ${f.num(ridCt, 2)} c€/kWh, zona ${R.zona}`, `${kwh(lang, r.immessa)} exported at ${f.num(ridCt, 2)} c€/kWh, ${R.zona} zone`)],
    balcone: [tx(lang, 'Risparmio in bolletta', 'Saving on the bill'), tx(lang, `${f.eur(r.risparmio)} l'anno`, `${f.eur(r.risparmio)} a year`), tx(lang, `${kwh(lang, r.produzione)} prodotti, ${f.pct(r.quota, 0)} usati in casa; rientro ${anni(r.rientro)}`, `${kwh(lang, r.produzione)} produced, ${f.pct(r.quota, 0)} used at home; payback ${anni(r.rientro)}`)],
    cer: [tx(lang, 'Incentivo CER sull\'energia condivisa', 'Community premium on shared energy'), tx(lang, `${f.eur(r.cer)} l'anno`, `${f.eur(r.cer)} a year`), tx(lang, `${f.num(r.tipCer)} €/MWh per ${P.cer.durata_anni} anni su ${kwh(lang, r.immessa * quota / 100)} condivisi`, `${f.num(r.tipCer)} €/MWh for ${P.cer.durata_anni} years on ${kwh(lang, r.immessa * quota / 100)} shared`)],
    dimensione: [tx(lang, 'Taglia che copre il consumo annuo', 'Size that covers annual use'), `${f.num(kwpCopre, 1)} kWp`, tx(lang, `con ${f.num(kwp, 1)} kWp coprite il ${f.pct(r.copertura, 0)} del consumo con energia vostra`, `with ${f.num(kwp, 1)} kWp you cover ${f.pct(r.copertura, 0)} of your use with your own power`)],
  };
  const [hl, hv, hu] = head[vista];

  const rows: Zeile[] = [
    { label: tx(lang, 'Produzione annua', 'Annual output'), value: kwh(lang, r.produzione), strong: true },
    { label: tx(lang, 'consumata in casa', 'used at home'), value: `${kwh(lang, r.autoconsumo)} · ${f.pct(r.quota, 0)}` },
    { label: tx(lang, 'immessa in rete', 'exported to the grid'), value: kwh(lang, r.immessa) },
    { label: tx(lang, `Risparmio in bolletta (${f.num(prezzo, 2)} c€/kWh)`, `Bill saving (${f.num(prezzo, 2)} c€/kWh)`), value: f.eur(r.risparmio), sep: true },
  ];
  if (!balcone) {
    rows.push({ label: tx(lang, `Ritiro dedicato (${f.num(ridCt, 2)} c€/kWh)`, `Ritiro dedicato (${f.num(ridCt, 2)} c€/kWh)`), value: f.eur(r.ricavoRid) });
    if (r.fee > 0) rows.push({ label: tx(lang, 'corrispettivo annuo al GSE', 'annual GSE fee'), value: `−${f.eur(r.fee, 2)}`, muted: true });
  }
  if (vista === 'cer') rows.push({ label: tx(lang, `Tariffa premio CER (${f.num(r.tipCer)} €/MWh)`, `CER premium (${f.num(r.tipCer)} €/MWh)`), value: f.eur(r.cer) });
  rows.push({ label: tx(lang, 'Beneficio annuo', 'Benefit per year'), value: f.eur(r.beneficio), strong: true });
  rows.push({ label: tx(lang, 'Costo dell\'impianto', 'System cost'), value: f.eur(r.costo), sep: true });
  if (!balcone) rows.push({ label: tx(lang, `Detrazione ${f.pct(r.aliquota, 0)} in 10 rate`, `${f.pct(r.aliquota, 0)} deduction in 10 instalments`), value: `${f.eur(r.detrazione)} · ${f.eur(r.rata)}/${tx(lang, 'anno', 'yr')}` });
  rows.push({ label: tx(lang, 'Rientro', 'Payback'), value: anni(r.rientro), strong: true });
  rows.push({ label: tx(lang, `Saldo dopo ${P.modello.anni_orizzonte} anni`, `Balance after ${P.modello.anni_orizzonte} years`), value: f.eur(r.saldo), muted: true });

  const steps = [
    tx(lang, `${luogo.nome} (${luogo.sigla}), ${R.nome}: PVGIS stima ${f.num(luogo.ey)} kWh per kWp a 30° verso sud; con orientamento e inclinazione scelti ${f.num(r.spec)} kWh per kWp.`, `${luogo.nome} (${luogo.sigla}), ${R.en}: PVGIS estimates ${f.num(luogo.ey)} kWh per kWp at 30° facing south; with your direction and tilt ${f.num(r.spec)} kWh per kWp.`),
    tx(lang, `Autoconsumo ora per ora: produzione PVGIS 2019-2023 contro il prelievo orario medio delle famiglie della regione (ARERA 2025), ${kwh(lang, cons)} l'anno${bat ? `, batteria da ${f.num(bat, 1)} kWh` : ''}: ${f.pct(r.quota, 0)} della produzione.`, `Self-consumption hour by hour: PVGIS output 2019-2023 against the average hourly household withdrawal in the region (ARERA 2025), ${kwh(lang, cons)} a year${bat ? `, ${f.num(bat, 1)} kWh battery` : ''}: ${f.pct(r.quota, 0)} of the output.`),
    tx(lang, `Ogni kWh consumato in casa evita ${f.num(prezzo, 2)} c€: materia energia, oneri e imposte, media dei quattro trimestri 2026 ARERA per il cliente tipo.`, `Each kWh used at home avoids ${f.num(prezzo, 2)} c€: energy, system charges and taxes, average of ARERA's four 2026 quarters for the reference customer.`),
    balcone
      ? tx(lang, 'Senza contratto di ritiro dedicato con il GSE l\'energia immessa non viene pagata: qui conta solo il risparmio.', 'Without a ritiro dedicato contract with the GSE, exported energy is not paid for: only the saving counts here.')
      : tx(lang, `Il surplus è valutato ${f.num(ridCt, 2)} c€/kWh: prezzi medi GSE del ritiro dedicato 2026 nella zona ${R.zona} (${RID.ultimo_mese}, ultimo mese pubblicato), pesati per fascia e per mese di produzione, mai sotto il prezzo minimo garantito di ${f.num(P.rid.pmg_eur_mwh, 1)} €/MWh.`, `The surplus is valued at ${f.num(ridCt, 2)} c€/kWh: GSE average ritiro dedicato prices 2026 in the ${R.zona} zone (up to ${RID.ultimo_mese}), weighted by time band and monthly output, never below the guaranteed minimum price of ${f.num(P.rid.pmg_eur_mwh, 1)} €/MWh.`),
    balcone
      ? tx(lang, 'La detrazione non è inclusa per i kit da balcone: verificate con il vostro consulente fiscale se la spesa rientra nei lavori agevolati.', 'The tax deduction is not included for balcony kits: check with your tax adviser whether the purchase qualifies.')
      : tx(lang, `Detrazione 2026: ${f.pct(P.detrazione.aliquota_prima_casa, 0)} per l'abitazione principale del proprietario, ${f.pct(P.detrazione.aliquota_altri, 0)} negli altri casi, su al massimo ${f.eur(P.detrazione.tetto_eur)}, in ${P.detrazione.rate} rate annuali.`, `2026 deduction: ${f.pct(P.detrazione.aliquota_prima_casa, 0)} for the owner's main home, ${f.pct(P.detrazione.aliquota_altri, 0)} otherwise, on up to ${f.eur(P.detrazione.tetto_eur)}, in ${P.detrazione.rate} annual instalments.`),
    tx(lang, `Rientro: anno dopo anno, beneficio più rata di detrazione fino a pagare il costo. Prezzi e produzione costanti, nessun degrado dei moduli.`, `Payback: year by year, benefit plus deduction instalment until the cost is covered. Constant prices and output, no panel degradation.`),
  ];

  return (
    <div className={rahmen} data-chrome>
      <div className="srg h-1.5" aria-hidden="true" />
      <div className={raster}>
        <form onSubmit={(e) => e.preventDefault()} className="space-y-5">
          <div className="grid grid-cols-2 gap-x-4 gap-y-4">
            <ComuneField id={`${idp}-c`} label={tx(lang, 'Comune', 'Comune (town)')} value={luogo} onChange={setLuogo} lang={lang} help={tx(lang, `${f.num(luogo.ey)} kWh/kWp · ${R.nome}`, `${f.num(luogo.ey)} kWh/kWp · ${R.en}`)} />
            <NumberField id={`${idp}-kwp`} label={tx(lang, 'Potenza impianto', 'System size')} value={kwp} onChange={setKwp} unit="kWp" max={200} decimals={2} lang={lang} />
          </div>
          <div className="grid grid-cols-2 gap-x-4 gap-y-4">
            <NumberField id={`${idp}-cons`} label={tx(lang, 'Consumo annuo', 'Annual use')} value={cons} onChange={(v) => setConsMan(v)} unit="kWh" max={100000} lang={lang} help={consMan === null ? tx(lang, 'media ARERA della regione', 'ARERA regional average') : undefined} />
            {vista === 'cer'
              ? <NumberField id={`${idp}-q`} label={tx(lang, 'Surplus condiviso nella CER', 'Surplus shared in the CER')} value={quota} onChange={setQuota} unit="%" max={100} lang={lang} />
              : <NumberField id={`${idp}-bat`} label={tx(lang, 'Batteria (capacità)', 'Battery (capacity)')} value={bat} onChange={setBat} unit="kWh" max={100} decimals={1} lang={lang} />}
          </div>
          <div className="grid grid-cols-2 gap-x-4 gap-y-4">
            <SelectField id={`${idp}-az`} label={tx(lang, 'Orientamento', 'Facing')} value={az} onChange={setAz} options={azOpt(lang)} />
            <NumberField id={`${idp}-t`} label={tx(lang, 'Inclinazione', 'Tilt')} value={tilt} onChange={setTilt} unit="°" max={90} lang={lang} />
          </div>
          <div className="grid grid-cols-2 gap-x-4 gap-y-4">
            <NumberField id={`${idp}-k`} label={tx(lang, 'Costo totale', 'Total cost')} value={costo} onChange={(v) => setCostoMan(v)} unit="€" max={2000000} lang={lang} help={costoMan === null ? tx(lang, 'riferimento, inserite il preventivo', 'reference, enter your quote') : undefined} />
            {balcone
              ? <SelectField id={`${idp}-o`} label={tx(lang, 'Ombra', 'Shade')} value={ombra} onChange={setOmbra} options={ombraOpt(lang)} />
              : <Toggle id={`${idp}-pc`} label={tx(lang, 'Prima casa, proprietario?', 'Main home, owner?')} value={pc} onChange={setPc} options={siNo(lang)} />}
          </div>
          <details className="rounded-lg border border-navy-200 p-3">
            <summary className="cursor-pointer text-sm font-semibold text-navy-900">{tx(lang, 'Prezzi e ombra', 'Prices and shade')}</summary>
            <div className="mt-3 grid grid-cols-2 gap-x-4 gap-y-4">
              <NumberField id={`${idp}-p`} label={tx(lang, 'Prezzo evitato', 'Avoided price')} value={prezzo} onChange={setPrezzo} unit="c€" max={200} decimals={2} lang={lang} />
              {!balcone && <NumberField id={`${idp}-v`} label={tx(lang, 'Valore energia immessa', 'Export value')} value={ridCt} onChange={(v) => setRidMan(v)} unit="c€" max={100} decimals={2} lang={lang} />}
              {!balcone && <SelectField id={`${idp}-o`} label={tx(lang, 'Ombra', 'Shade')} value={ombra} onChange={setOmbra} options={ombraOpt(lang)} />}
              {balcone && <Toggle id={`${idp}-pc`} label={tx(lang, 'Prima casa?', 'Main home?')} value={pc} onChange={setPc} options={siNo(lang)} />}
            </div>
          </details>
        </form>
        <div aria-live="polite" data-resultat className={kasten}>
          <Kopf label={hl} wert={hv} unter={hu} />
          <div className="mt-3"><StackedBar ariaPrefix={tx(lang, 'Dove va l\'energia prodotta', 'Where the output goes')} total={r.produzione} segments={[
            { label: tx(lang, 'in casa', 'at home'), value: r.autoconsumo, color: '#8f1d24' },
            { label: tx(lang, 'in rete', 'to the grid'), value: r.immessa, color: '#e9a3a8' },
          ]} /></div>
          <Zeilen rows={rows} />
          <Monate lang={lang} werte={r.mesi} />
          <Rechenweg lang={lang} steps={steps} />
          <Aktionen lang={lang} text={() => tx(lang, `Fotovoltaico ${f.num(kwp, 1)} kWp a ${luogo.nome}: ${kwh(lang, r.produzione)}, ${f.eur(r.beneficio)} l'anno, rientro ${anni(r.rientro)}`, `Solar ${f.num(kwp, 1)} kWp in ${luogo.nome}: ${kwh(lang, r.produzione)}, ${f.eur(r.beneficio)} a year, payback ${anni(r.rientro)}`)} />
          <Hinweis lang={lang} methodHref={methodHref} />
        </div>
      </div>
    </div>
  );
}
