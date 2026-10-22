#!/usr/bin/env python3
"""Produzione fotovoltaica per ogni comune italiano (PVGIS 5.3, Centro comune di ricerca della Commissione europea).

1. Comuni : GeoNames IT (CC BY 4.0), elemento ADM3 = comune, con codice ISTAT, sigla di provincia,
   popolazione e coordinate del centro abitato.
2. Per ogni comune una chiamata PVcalc : 1 kWp, perdite di sistema 14 %, inclinazione 30 gradi, sud,
   orizzonte calcolato dal modello del terreno (DEM). Si salvano produzione annua (E_y) e mensile (E_m).
3. Matrice orientamento : in 6 punti di riferimento (Nord-ovest, Nord-est, Centro, Sud, Sicilia,
   Sardegna) inclinazione 0..90 x 8 orientamenti, rapporto alla produzione 30 gradi sud.
Tutte le risposte restano in research/pvgis-cache/ : una seconda esecuzione non richiama l'API.
Rieseguibile : python3 scripts/data/fetch-pvgis.py
"""
import json, os, time, urllib.request, concurrent.futures as cf, datetime

ROOT = os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
CACHE = os.path.join(ROOT, "research", "pvgis-cache"); os.makedirs(CACHE, exist_ok=True)
API = "https://re.jrc.ec.europa.eu/api/v5_3/PVcalc"
BASE_TILT = 30


def call(lat, lon, angle, aspect):
    key = f"{lat:.4f}_{lon:.4f}_{angle}_{aspect}.json"
    p = os.path.join(CACHE, key)
    if os.path.exists(p):
        return json.load(open(p))
    url = f"{API}?lat={lat:.4f}&lon={lon:.4f}&peakpower=1&loss=14&angle={angle}&aspect={aspect}&outputformat=json"
    for attempt in range(7):
        try:
            with urllib.request.urlopen(url, timeout=60) as r:
                d = json.load(r)
            slim = {"E_y": d["outputs"]["totals"]["fixed"]["E_y"], "H_y": d["outputs"]["totals"]["fixed"]["H(i)_y"],
                    "E_m": [m["E_m"] for m in d["outputs"]["monthly"]["fixed"]],
                    "elev": d["inputs"]["location"]["elevation"], "db": d["inputs"]["meteo_data"]["radiation_db"],
                    "years": [d["inputs"]["meteo_data"]["year_min"], d["inputs"]["meteo_data"]["year_max"]]}
            json.dump(slim, open(p, "w"))
            return slim
        except Exception as e:
            msg = str(e)
            if "400" in msg:  # punto in mare o fuori copertura
                json.dump({"error": msg}, open(p, "w"))
                return {"error": msg}
            time.sleep(2 + attempt * 4)
    raise RuntimeError(url)


comuni = []
for line in open(os.path.join(ROOT, "research", "geonames", "IT-dump.txt"), encoding="utf-8"):
    f = line.rstrip("\n").split("\t")
    if len(f) < 15 or f[7] != "ADM3":
        continue
    comuni.append({"istat": f[12], "nome": f[1], "sigla": f[11], "reg": f[10], "lat": float(f[4]), "lon": float(f[5]),
                   "pop": int(f[14] or 0)})
print(len(comuni), "comuni")

REFS = {"NO": (45.46, 9.19), "NE": (45.44, 11.88), "CE": (42.85, 12.35), "SU": (40.85, 15.6), "SI": (37.6, 14.0), "SA": (40.1, 9.0)}
TILTS = [0, 10, 15, 20, 25, 30, 35, 40, 50, 60, 70, 90]
ASPECTS = [-180, -135, -90, -45, 0, 45, 90, 135]
jobs = [(c["lat"], c["lon"], BASE_TILT, 0) for c in comuni]
for (a, b) in REFS.values():
    for t in TILTS:
        for az in (ASPECTS if t else [0]):
            jobs.append((a, b, t, az))
jobs = sorted(set(jobs))
print(len(jobs), "chiamate")
res = {}
with cf.ThreadPoolExecutor(6) as ex:
    futs = {ex.submit(call, *j): j for j in jobs}
    for i, fu in enumerate(cf.as_completed(futs)):
        res[futs[fu]] = fu.result()
        if i % 500 == 0:
            print(i, flush=True)

out = []
for c in comuni:
    d = res[(c["lat"], c["lon"], BASE_TILT, 0)]
    if "error" in d:
        print("errore", c["nome"], d["error"])
        continue
    out.append({**c, "ey": round(d["E_y"], 1), "em": [round(x, 1) for x in d["E_m"]], "elev": d["elev"]})
mat = {}
for r, (a, b) in REFS.items():
    base = res[(a, b, BASE_TILT, 0)]["E_y"]
    m = {}
    for t in TILTS:
        for az in (ASPECTS if t else [0]):
            m[f"{t}_{az}"] = round(res[(a, b, t, az)]["E_y"] / base, 4)
    mat[r] = {"lat": a, "lon": b, "f": m}
meta = next(v for v in res.values() if "db" in v)
json.dump({"source": "PVGIS 5.3, European Commission Joint Research Centre", "api": "PVcalc, re.jrc.ec.europa.eu/api/v5_3",
           "radiation_db": meta["db"], "years": meta["years"], "retrieved_at": datetime.date.today().isoformat(),
           "params": {"peakpower_kwp": 1, "loss_pct": 14, "angle": BASE_TILT, "aspect": 0, "horizon": "DEM-calculated"},
           "comuni": out, "matrix": mat, "tilts": TILTS, "aspects": ASPECTS},
          open(os.path.join(ROOT, "research", "pvgis-comuni.json"), "w"), ensure_ascii=False)
print("comuni:", len(out))
