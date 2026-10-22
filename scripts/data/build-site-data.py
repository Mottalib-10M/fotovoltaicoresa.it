#!/usr/bin/env python3
"""Prepara i file di dati del sito a partire dalle fonti scaricate in research/.

Ingressi : research/pvgis-comuni.json (PVGIS 5.3 per 7 896 comuni), research/autoconsumo.json
(PVGIS orario x prelievi orari ARERA 2025), research/comuni-json.json (nomi delle province),
research/arera/consumi (consumo medio annuo per regione), research/gse/prezzi-rid-2026.pdf.
Uscite : public/data/comuni.json (ricerca del comune nel browser), src/data/regioni.json,
src/data/province.json, src/data/citta.json, src/data/orientamento.json, src/data/rid-2026.json.
Rieseguibile : python3 scripts/data/build-site-data.py
"""
import json, os, re, collections, datetime
import openpyxl, pypdf

ROOT = os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
R = os.path.join(ROOT, "research")
D = os.path.join(ROOT, "src", "data")
PUB = os.path.join(ROOT, "public", "data"); os.makedirs(PUB, exist_ok=True)

pv = json.load(open(os.path.join(R, "pvgis-comuni.json")))
ac = json.load(open(os.path.join(R, "autoconsumo.json")))
cj = json.load(open(os.path.join(R, "comuni-json.json")))

# Regioni nell'ordine dei codici GeoNames (admin1) ; nomi ARERA per le tabelle di autoconsumo.
REG = [  # codice GeoNames, nome, inglese, zona di mercato, punto della matrice di orientamento
    ("01", "Abruzzo", "Abruzzo", "Centro Sud", "CE"), ("02", "Basilicata", "Basilicata", "Sud", "SU"),
    ("03", "Calabria", "Calabria", "Calabria", "SU"), ("04", "Campania", "Campania", "Centro Sud", "SU"),
    ("05", "Emilia-Romagna", "Emilia-Romagna", "Nord", "NE"), ("06", "Friuli-Venezia Giulia", "Friuli Venezia Giulia", "Nord", "NE"),
    ("07", "Lazio", "Lazio", "Centro Sud", "CE"), ("08", "Liguria", "Liguria", "Nord", "NO"),
    ("09", "Lombardia", "Lombardy", "Nord", "NO"), ("10", "Marche", "Marche", "Centro Nord", "CE"),
    ("11", "Molise", "Molise", "Sud", "CE"), ("12", "Piemonte", "Piedmont", "Nord", "NO"),
    ("13", "Puglia", "Apulia", "Sud", "SU"), ("14", "Sardegna", "Sardinia", "Sardegna", "SA"),
    ("15", "Sicilia", "Sicily", "Sicilia", "SI"), ("16", "Toscana", "Tuscany", "Centro Nord", "CE"),
    ("17", "Trentino-Alto Adige", "Trentino-South Tyrol", "Nord", "NE"), ("18", "Umbria", "Umbria", "Centro Sud", "CE"),
    ("19", "Valle d'Aosta", "Aosta Valley", "Nord", "NO"), ("20", "Veneto", "Veneto", "Nord", "NE"),
]
IDX = {c: i for i, (c, *_rest) in enumerate(REG)}
ARERA_NOME = {"Trentino-Alto Adige": "Trentino-Alto Adige/Südtirol", "Valle d'Aosta": "Valle d'Aosta/Vallée d'Aoste"}

# --- consumo medio annuo per regione (clienti domestici residenti, mercato « Tutti », 2025) -------
wb = openpyxl.load_workbook(os.path.join(R, "arera", "consumi", "Dati regione 2025", "Dati prelievo clienti domestici Regionale 2025.xlsx"), read_only=True)
cons = {}
for r in wb.worksheets[0].iter_rows(values_only=True):
    if r[1] == "Tutti" and r[3] == "Residente" and not isinstance(r[0], datetime.datetime) and str(r[0]).strip() == "2025":
        cons[(r[4], r[2])] = float(r[8])
CL_BASE, CL_ALTO = "1.5<potenza_impegnata<=3", "3<potenza_impegnata<=4.5"


def consumo(nome, cl):
    for k in (nome, ARERA_NOME.get(nome, nome)):
        if (k, cl) in cons:
            return round(cons[(k, cl)])
    raise KeyError(nome)


comuni = pv["comuni"]
by_reg = collections.defaultdict(list)
for c in comuni:
    by_reg[c["reg"]].append(c)


def wavg(lst, key):
    w = sum(max(c["pop"] or 0, 1) for c in lst)
    return sum(key(c) * max(c["pop"] or 0, 1) for c in lst) / w


regioni = []
for cod, nome, en, zona, punto in REG:
    lst = by_reg[cod]
    mesi = [wavg(lst, lambda c, m=m: c["em"][m] / sum(c["em"])) for m in range(12)]
    s = sum(mesi)
    tab = ac["regioni"][nome]
    regioni.append({
        "nome": nome, "en": en, "zona": zona, "punto": punto, "capoluogo_ac": tab["capoluogo"],
        "n_comuni": len(lst), "pop": sum(c["pop"] or 0 for c in lst), "ey": round(wavg(lst, lambda c: c["ey"]), 1),
        "ey_min": round(min(c["ey"] for c in lst)), "ey_max": round(max(c["ey"] for c in lst)),
        "cons_base": consumo(nome, CL_BASE), "cons_alto": consumo(nome, CL_ALTO),
        "mesi": [round(x / s, 4) for x in mesi],
        "sc_base": tab["base"]["sc"], "sc_alto": tab["alto"]["sc"],
    })
tutti = comuni
naz = {
    "n_comuni": len(tutti), "pop": sum(c["pop"] or 0 for c in tutti), "ey": round(wavg(tutti, lambda c: c["ey"]), 1),
    "ey_min": min(tutti, key=lambda c: c["ey"])["ey"], "ey_max": max(tutti, key=lambda c: c["ey"])["ey"],
    "min_nome": min(tutti, key=lambda c: c["ey"])["nome"], "max_nome": max(tutti, key=lambda c: c["ey"])["nome"],
    "cons_base": consumo("TUTTO", CL_BASE), "cons_alto": consumo("TUTTO", CL_ALTO),
    "mesi": [round(wavg(tutti, lambda c, m=m: c["em"][m] / sum(c["em"])), 4) for m in range(12)],
}
json.dump({"source": {"pvgis": pv["source"] + ", " + pv["radiation_db"] + " " + "-".join(map(str, pv["years"])), "pvgis_retrieved_at": pv["retrieved_at"],
                      "autoconsumo": ac["source"], "autoconsumo_retrieved_at": ac["retrieved_at"], "consumi": "ARERA, prelievo clienti domestici residenti 2025"},
           "p": ac["p"], "b": ac["b"], "italia": naz, "regioni": regioni},
          open(os.path.join(D, "regioni.json"), "w"), ensure_ascii=False, separators=(",", ":"))

# --- comuni per la ricerca nel browser : [nome, sigla, indice regione, kWh/kWp, altitudine] -------
rows = sorted(([c["nome"], c["sigla"], IDX[c["reg"]], round(c["ey"]), round(c["elev"] or 0)] for c in comuni), key=lambda r: (r[0].lower(), r[1]))
json.dump(rows, open(os.path.join(PUB, "comuni.json"), "w"), ensure_ascii=False, separators=(",", ":"))

# --- province ----------------------------------------------------------------------------------
prov_nome = {}
for c in cj:
    prov_nome.setdefault(c["sigla"], c["provincia"]["nome"])
prov_nome.setdefault("SU", "Sud Sardegna")
by_prov = collections.defaultdict(list)
for c in comuni:
    by_prov[c["sigla"]].append(c)
province = []
for sg, lst in by_prov.items():
    lo = min(lst, key=lambda c: c["ey"]); hi = max(lst, key=lambda c: c["ey"])
    capo = max(lst, key=lambda c: c["pop"] or 0)
    province.append({"sigla": sg, "nome": prov_nome.get(sg, sg), "reg": IDX[lst[0]["reg"]], "n": len(lst), "pop": sum(c["pop"] or 0 for c in lst),
                     "ey": round(wavg(lst, lambda c: c["ey"])), "min": [lo["nome"], round(lo["ey"])], "max": [hi["nome"], round(hi["ey"])],
                     "maggiore": [capo["nome"], round(capo["ey"])]})
province.sort(key=lambda p: p["nome"])
json.dump(province, open(os.path.join(D, "province.json"), "w"), ensure_ascii=False, separators=(",", ":"))

# --- città con pagina propria ---------------------------------------------------------------------
CITTA = {"roma": ("Roma", "RM"), "milano": ("Milano", "MI"), "napoli": ("Napoli", "NA"), "torino": ("Torino", "TO"),
         "palermo": ("Palermo", "PA"), "genova": ("Genova", "GE"), "bologna": ("Bologna", "BO"), "firenze": ("Firenze", "FI"),
         "bari": ("Bari", "BA"), "catania": ("Catania", "CT"), "venezia": ("Venezia", "VE"), "cagliari": ("Cagliari", "CA")}
citta = {}
for slug, (nome, sg) in CITTA.items():
    c = next(x for x in comuni if x["nome"] == nome and x["sigla"] == sg)
    citta[slug] = {"nome": nome, "sigla": sg, "reg": IDX[c["reg"]], "istat": c["istat"], "lat": c["lat"], "lon": c["lon"], "pop": c["pop"],
                   "ey": c["ey"], "em": c["em"], "elev": c["elev"]}
json.dump(citta, open(os.path.join(D, "citta.json"), "w"), ensure_ascii=False, separators=(",", ":"))

# --- orientamento ----------------------------------------------------------------------------------
json.dump({"tilts": pv["tilts"], "aspects": pv["aspects"], "punti": pv["matrix"]}, open(os.path.join(D, "orientamento.json"), "w"), ensure_ascii=False, separators=(",", ":"))

# --- prezzi medi mensili del ritiro dedicato 2026 (GSE) -------------------------------------------
t = "\n".join(p.extract_text() for p in pypdf.PdfReader(os.path.join(R, "gse", "prezzi-rid-2026.pdf")).pages)
ultimo = re.search(r"rilevati al mese di\s+(\w+)\s+(\d{4})", t)
zone = {}
blocchi = t.split("Allegato", 1)[1].split("Zona gen.")[1:]
for fascia, b in zip(("F1", "F2", "F3"), blocchi):
    for line in b.splitlines():
        m = re.match(r"\s*(Centro Nord|Centro Sud|Nord|Sardegna|Sicilia|Sud|Calabria)\s+([\d,\s]+)$", line)
        if m:
            vals = [float(v.replace(",", ".")) for v in m.group(2).split()]
            zone.setdefault(m.group(1), {})[fascia] = vals
json.dump({"source": "GSE, Prezzi medi mensili per fascia oraria e zona di mercato, ritiro dedicato 2026", "ultimo_mese": f"{ultimo.group(1)} {ultimo.group(2)}" if ultimo else "",
           "mesi_disponibili": len(zone["Nord"]["F1"]), "unita": "EUR/MWh", "zone": zone},
          open(os.path.join(D, "rid-2026.json"), "w"), ensure_ascii=False, indent=1)
print("comuni", len(rows), "province", len(province), "regioni", len(regioni), "zone RID", list(zone), "mesi", len(zone["Nord"]["F1"]))
print("Italia ey", naz["ey"], "cons", naz["cons_base"], naz["cons_alto"])
