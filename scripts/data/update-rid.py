"""Aggiorna src/data/rid-2026.json dal PDF GSE « Prezzi medi mensili per fascia oraria e zona di mercato ».

Uso: python3 scripts/data/update-rid.py <percorso del PDF>
Scrive il file solo se il PDF contiene almeno tanti mesi quanti quelli già pubblicati, e stampa « aggiornato » o « invariato ».
Stessa logica di estrazione di build-site-data.py, senza bisogno degli altri dati grezzi.
"""
import json, os, re, sys
import pypdf

ROOT = os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
OUT = os.path.join(ROOT, "src", "data", "rid-2026.json")
ZONE = ("Centro Nord", "Centro Sud", "Nord", "Sardegna", "Sicilia", "Sud", "Calabria")

t = "\n".join(p.extract_text() for p in pypdf.PdfReader(sys.argv[1]).pages)
ultimo = re.search(r"rilevati al mese di\s+(\w+)\s+(\d{4})", t)
zone = {}
blocchi = t.split("Allegato", 1)[1].split("Zona gen.")[1:]
for fascia, b in zip(("F1", "F2", "F3"), blocchi):
    for line in b.splitlines():
        m = re.match(r"\s*(" + "|".join(ZONE) + r")\s+([\d,\s]+)$", line)
        if m:
            zone.setdefault(m.group(1), {})[fascia] = [float(v.replace(",", ".")) for v in m.group(2).split()]

# Controlli: tutte le zone, tutte le fasce, stesso numero di mesi, valori plausibili (0-1000 €/MWh).
assert set(zone) == set(ZONE), f"zone mancanti: {set(ZONE) - set(zone)}"
n = len(zone["Nord"]["F1"])
for z in zone.values():
    assert set(z) == {"F1", "F2", "F3"} and all(len(v) == n and all(0 <= x < 1000 for x in v) for v in z.values()), "tabella incompleta"
old = json.load(open(OUT))
if n < old["mesi_disponibili"]:
    sys.exit(f"il PDF ha {n} mesi, meno dei {old['mesi_disponibili']} già pubblicati: nessuna modifica")
new = {**old, "ultimo_mese": f"{ultimo.group(1)} {ultimo.group(2)}" if ultimo else old["ultimo_mese"], "mesi_disponibili": n, "zone": zone}
if new == old:
    print("invariato")
else:
    json.dump(new, open(OUT, "w"), ensure_ascii=False, indent=1)
    print("aggiornato", new["ultimo_mese"], n, "mesi")
