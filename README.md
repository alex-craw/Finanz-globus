# Finanz-Globus

3D-Globus mit Länderfarben (-3 % bis +3 %), Höhenrelief und über 100 Firmensitzen. Zeigt Live-Kursveränderungen
über ein Python-Backend. Ohne Backend läuft die App mit simulierten Demo-Daten.

## Starten
```
python -m venv .venv
.venv\Scripts\activate          (macOS/Linux: source .venv/bin/activate)
pip install -r requirements.txt
python backend/server.py
```
Dann http://127.0.0.1:8000 öffnen. Internet nötig (globe.gl, Weltkarte und Kursdaten werden geladen).

Nur das Frontend ansehen: `index.html` mit "Live Server" öffnen. Läuft das Backend zusätzlich auf Port 8000, werden trotzdem Live-Daten genutzt.

## Daten
- Quelle: yfinance (inoffizielle Yahoo-Finance-Schnittstelle, meist verzögert, Rate-Limits möglich). Die Symbole werden in Blöcken abgerufen, die Karte aktualisiert sich nach jedem Block (Blockgröße und Pause oben in `backend/server.py`).
- Länder = Leitindex oder Länder-ETF, Firmen = Aktie. Länder ohne eigene Börsendaten zeigen den Wert ihrer Weltregion (Regions-Proxy, im Tooltip gekennzeichnet). Die Zuordnung steht in `backend/symbols.py`.
- Nicht aufgelöste Kürzel zeigt http://127.0.0.1:8000/api/status unter `ohne_daten`.
- Marktgewicht (Höhe) und Börsenwerte sind noch Platzhalter aus `data.js`.

## Roadmap
1. Globus mit Demo-Daten (fertig)
2. Python-Backend mit Live-Kursen (fertig, in Test)
3. Nachrichten und Stimmungsanalyse
4. C++-Modul für Analysen (z. B. Korrelationen)
