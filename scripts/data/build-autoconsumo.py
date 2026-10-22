#!/usr/bin/env python3
"""Tabelle di autoconsumo per regione, da dati orari reali.

Produzione : PVGIS 5.3 seriescalc (JRC), serie oraria 2019-2023 nel capoluogo di ogni regione,
1 kWp, perdite 14 %, 30 gradi, sud.
Consumo : ARERA, « Analisi dei consumi dei clienti domestici », prelievo medio orario 2025 per regione,
mese, tipo di giorno (feriale, sabato, domenica) e ora ; mercato « Tutti », clienti residenti,
classe di potenza 1,5-3 kW e 3-4,5 kW.
Batteria : carica solo dal surplus fotovoltaico, rendimento di andata e ritorno 90 %, capacità utile 90 %
della nominale, nessuna carica dalla rete.
Risultato : per regione e profilo, quota di produzione autoconsumata e quota di consumo coperta, su una
griglia (produzione annua / consumo annuo) x (kWh di batteria per MWh di consumo), media 2019-2023.
Rieseguibile : python3 scripts/data/build-autoconsumo.py
"""
import json, os, datetime, urllib.request, time
from zoneinfo import ZoneInfo
import openpyxl

ROOT = os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
R = os.path.join(ROOT, "research")
CACHE = os.path.join(R, "pvgis-ore"); os.makedirs(CACHE, exist_ok=True)

CAPOLUOGHI = {  # regione (nome ARERA) : (capoluogo, lat, lon)
    "Piemonte": ("Torino", 45.07, 7.69), "Valle d'Aosta": ("Aosta", 45.74, 7.32),
    "Lombardia": ("Milano", 45.46, 9.19), "Trentino-Alto Adige": ("Trento", 46.07, 11.12),
    "Veneto": ("Venezia-Mestre", 45.49, 12.24), "Friuli-Venezia Giulia": ("Trieste", 45.65, 13.78),
    "Liguria": ("Genova", 44.41, 8.93), "Emilia-Romagna": ("Bologna", 44.49, 11.34),
    "Toscana": ("Firenze", 43.77, 11.25), "Umbria": ("Perugia", 43.11, 12.39), "Marche": ("Ancona", 43.6, 13.5),
    "Lazio": ("Roma", 41.9, 12.5), "Abruzzo": ("L'Aquila", 42.35, 13.4), "Molise": ("Campobasso", 41.56, 14.66),
    "Campania": ("Napoli", 40.85, 14.27), "Puglia": ("Bari", 41.12, 16.87), "Basilicata": ("Potenza", 40.64, 15.8),
    "Calabria": ("Catanzaro", 38.91, 16.59), "Sicilia": ("Palermo", 38.12, 13.36), "Sardegna": ("Cagliari", 39.22, 9.12),
}
YEARS = (2019, 2023)


def serie(lat, lon):
    p = os.path.join(CACHE, f"{lat:.2f}_{lon:.2f}.json")
    if os.path.exists(p):
        return json.load(open(p))
    url = ("https://re.jrc.ec.europa.eu/api/v5_3/seriescalc?lat=%.4f&lon=%.4f&peakpower=1&loss=14&angle=30&aspect=0"
           "&pvcalculation=1&startyear=%d&endyear=%d&outputformat=json" % (lat, lon, YEARS[0], YEARS[1]))
    for a in range(6):
        try:
            with urllib.request.urlopen(url, timeout=120) as r:
                d = json.load(r)
            out = [[h["time"], h["P"]] for h in d["outputs"]["hourly"]]
            json.dump(out, open(p, "w"))
            return out
        except Exception:
            time.sleep(3 + 5 * a)
    raise RuntimeError(url)


# --- profili ARERA -----------------------------------------------------------------------------
def carica(file):
    wb = openpyxl.load_workbook(os.path.join(R, "arera", "consumi", "Dati regione 2025", file), read_only=True)
    prof = {}
    for i, r in enumerate(wb.worksheets[0].iter_rows(values_only=True)):
        if i == 0 or not isinstance(r[0], datetime.datetime):
            continue
        if r[2] != "Tutti" or (r[4] or "").strip() != "Residente":
            continue
        dt = {"Giorno feriale": 0, "Sabato": 1, "Domenica": 2}[r[5]]
        h = int(str(r[6]).replace("Ora", "")) - 1
        prof.setdefault(r[1], {})[(r[0].month, dt, h)] = float(r[7])
    return prof


PROFILI = {"base": carica("dati prelievo orario per regionale1_5_a_3 anno 2025.xlsx"),
           "alto": carica("dati prelievo orario per regionale3_a_4_5 anno 2025.xlsx")}

FESTE = {(1, 1), (1, 6), (4, 25), (5, 1), (6, 2), (8, 15), (11, 1), (12, 8), (12, 25), (12, 26)}


def pasqua(y):
    a = y % 19; b = y // 100; c = y % 100; d = b // 4; e = b % 4; f = (b + 8) // 25; g = (b - f + 1) // 3
    h = (19 * a + b - d - g + 15) % 30; i = c // 4; k = c % 4; l = (32 + 2 * e + 2 * i - h - k) % 7
    m = (a + 11 * h + 22 * l) // 451; mo = (h + l - 7 * m + 114) // 31; da = ((h + l - 7 * m + 114) % 31) + 1
    return datetime.date(y, mo, da)


def tipo_giorno(d):
    if (d.month, d.day) in FESTE or d == pasqua(d.year) + datetime.timedelta(days=1) or d.weekday() == 6:
        return 2
    return 1 if d.weekday() == 5 else 0


ROME = ZoneInfo("Europe/Rome")
P_GRID = [0.1, 0.2, 0.3, 0.4, 0.5, 0.6, 0.7, 0.8, 0.9, 1.0, 1.2, 1.4, 1.6, 1.8, 2.0, 2.5, 3.0, 4.0, 5.0]
B_GRID = [0, 1, 2, 3, 4, 5, 6, 8, 10]  # kWh di batteria per MWh di consumo annuo
ETA = 0.9 ** 0.5  # per verso
UTILE = 0.9


def simula(pv, load, p_ratio, b):
    """pv e load normalizzati a 1 kWh/anno di consumo (load) ; pv scalato a p_ratio."""
    cap = b / 1000.0 * UTILE
    soc = 0.0; auto = 0.0; prod = 0.0; cons = 0.0
    for g, l in zip(pv, load):
        g *= p_ratio
        prod += g; cons += l
        diretto = min(g, l)
        auto += diretto
        sur = g - diretto; need = l - diretto
        if cap > 0:
            if sur > 0:
                soc = min(cap, soc + sur * ETA)
            elif need > 0 and soc > 0:
                out = min(need, soc * ETA)
                soc -= out / ETA
                auto += out
    return auto / prod, auto / cons


out = {"source": {"pv": "PVGIS 5.3 seriescalc, JRC", "carico": "ARERA, prelievo medio orario clienti domestici 2025",
                  "anni_pv": list(YEARS), "batteria": {"rendimento_ciclo": 0.9, "capacita_utile": UTILE}},
       "retrieved_at": datetime.date.today().isoformat(), "p": P_GRID, "b": B_GRID, "regioni": {}}
for reg, (cap, lat, lon) in CAPOLUOGHI.items():
    s = serie(lat, lon)
    pv_by_year = {}
    for t, P in s:
        utc = datetime.datetime.strptime(t, "%Y%m%d:%H%M").replace(tzinfo=datetime.timezone.utc)
        loc = utc.astimezone(ROME)
        pv_by_year.setdefault(utc.year, []).append((loc, P / 1000.0))
    res = {"capoluogo": cap}
    for nome, prof in PROFILI.items():
        pr = prof[reg]
        tabs_sc = []; tabs_cop = []
        for y, rows in sorted(pv_by_year.items()):
            load = [pr[(loc.month, tipo_giorno(loc.date()), loc.hour)] for loc, _ in rows]
            pv = [g for _, g in rows]
            L = sum(load); G = sum(pv)
            load = [x / L for x in load]; pv = [x / G for x in pv]
            tabs_sc.append([[simula(pv, load, p, b)[0] for b in B_GRID] for p in P_GRID])
            tabs_cop.append([[simula(pv, load, p, b)[1] for b in B_GRID] for p in P_GRID])
        n = len(tabs_sc)
        res[nome] = {
            "sc": [[round(sum(t[i][j] for t in tabs_sc) / n, 4) for j in range(len(B_GRID))] for i in range(len(P_GRID))],
            "cop": [[round(sum(t[i][j] for t in tabs_cop) / n, 4) for j in range(len(B_GRID))] for i in range(len(P_GRID))],
        }
    out["regioni"][reg] = res
    print(reg, "sc(p=1,b=0)=", res["base"]["sc"][P_GRID.index(1.0)][0], "con 5 kWh/MWh:", res["base"]["sc"][P_GRID.index(1.0)][5], flush=True)

json.dump(out, open(os.path.join(R, "autoconsumo.json"), "w"), ensure_ascii=False)
