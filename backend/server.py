"""Finanz-Globus Backend

Holt Kursdaten über yfinance (inoffizielle Yahoo-Finance-Schnittstelle, Kurse meist verzögert), berechnet die
Tagesveränderung in % und liefert sie als JSON. Das Frontend (index.html usw.) wird gleich mit ausgeliefert.

Die Symbole werden in Blöcken abgerufen. Nach JEDEM Block gibt es neue Werte, die Karte aktualisiert sich also alle
paar Sekunden schrittweise, statt nur alle paar Minuten komplett.

Start (aus dem Projektordner):   python backend/server.py     ->     http://127.0.0.1:8000
"""
import asyncio
import time
from contextlib import asynccontextmanager
from datetime import datetime, timezone
from pathlib import Path

import uvicorn
import yfinance as yf
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles

from symbols import COMPANY_SYMBOLS, COUNTRY_SYMBOLS, REGION_PROXIES

ROOT = Path(__file__).resolve().parent.parent
CHUNK = 40        # Symbole pro Abruf. Kleiner = häufigere, kleinere Updates; größer = schnellerer Gesamtdurchlauf
PAUSE_S = 1       # Pause zwischen zwei Blöcken. Nicht auf 0 setzen, sonst droht ein Rate-Limit bei Yahoo.
BACKOFF_S = 20    # Wartezeit, wenn ein Block gar nichts geliefert hat

quotes = {}       # Symbol -> Tagesveränderung in %
failed = set()    # Symbole, für die Yahoo nichts geliefert hat
state = {"updated": None, "countries": {}, "companies": {}, "regions": {}, "error": None, "cycle_s": None}


def fetch_changes(symbols):
    """{Symbol: Tagesveränderung in %}: aktueller Kurs bzw. letzter Schlusskurs gegenüber dem Vortag."""
    data = yf.download(symbols, period="5d", interval="1d", group_by="ticker",
                       auto_adjust=True, progress=False, threads=True)
    out = {}
    for s in symbols:
        try:
            close = (data["Close"] if len(symbols) == 1 else data[s]["Close"]).dropna()
        except KeyError:
            continue
        if len(close) >= 2 and close.iloc[-2]:
            out[s] = float((close.iloc[-1] / close.iloc[-2] - 1) * 100)
    return out


def all_symbols():
    """Reihenfolge: erst Länder und Regionen (die Karte füllt sich zuerst), dann Firmen."""
    regions = [sym for cands in REGION_PROXIES.values() for sym, _ in cands]
    ordered = list(COUNTRY_SYMBOLS.values()) + regions + list(COMPANY_SYMBOLS.values())
    return list(dict.fromkeys(ordered))


def region_values():
    out = {}
    for name, candidates in REGION_PROXIES.items():
        for sym, label in candidates:
            if sym in quotes:
                out[name] = {"pct": round(quotes[sym], 3), "label": f"{label} ({sym})"}
                break
    return out


def rebuild():
    state["countries"] = {k: round(quotes[s], 3) for k, s in COUNTRY_SYMBOLS.items() if s in quotes}
    state["companies"] = {k: round(quotes[s], 3) for k, s in COMPANY_SYMBOLS.items() if s in quotes}
    state["regions"] = region_values()
    state["updated"] = datetime.now(timezone.utc).isoformat(timespec="seconds")


async def refresher():
    symbols = all_symbols()
    chunks = [symbols[i:i + CHUNK] for i in range(0, len(symbols), CHUNK)]
    if len(chunks) > 1 and len(chunks[-1]) < 2:
        chunks[-2] += chunks.pop()
    print(f"{len(symbols)} Symbole in {len(chunks)} Blöcken")
    while True:
        t0 = time.time()
        for chunk in chunks:
            try:
                got = await asyncio.to_thread(fetch_changes, chunk)
                quotes.update(got)
                failed.difference_update(got)
                failed.update(s for s in chunk if s not in got)
                if got:
                    rebuild()
                    state["error"] = None
                else:
                    state["error"] = "Yahoo Finance hat für einen Block keine Daten geliefert (Rate-Limit?)"
                    await asyncio.sleep(BACKOFF_S)
            except Exception as e:   # das Backend soll bei Fehlern weiterlaufen und die letzten Werte behalten
                state["error"] = str(e)
                print("Fehler beim Abruf:", e)
                await asyncio.sleep(BACKOFF_S)
            await asyncio.sleep(PAUSE_S)
        state["cycle_s"] = round(time.time() - t0)
        print(f"Durchlauf fertig in {state['cycle_s']} s: {len(quotes)} Kurse, {len(failed)} ohne Daten")


@asynccontextmanager
async def lifespan(_app):
    task = asyncio.create_task(refresher())
    yield
    task.cancel()


app = FastAPI(title="Finanz-Globus", lifespan=lifespan)
app.add_middleware(CORSMiddleware, allow_origins=["*"], allow_methods=["GET"])   # nur für lokale Entwicklung


@app.get("/api/snapshot")
def snapshot():
    if state["updated"] is None:
        raise HTTPException(503, "Noch keine Daten (erster Abruf läuft oder ist fehlgeschlagen)")
    return {"updated": state["updated"], "source": "yfinance", "countries": state["countries"],
            "companies": state["companies"], "regions": state["regions"]}


@app.get("/api/status")
def status():
    return {"updated": state["updated"], "error": state["error"], "durchlauf_s": state["cycle_s"],
            "ok": {"countries": len(state["countries"]), "companies": len(state["companies"]), "regions": len(state["regions"])},
            "ohne_daten": sorted(failed)}


app.mount("/", StaticFiles(directory=ROOT, html=True), name="web")   # Frontend, muss als Letztes stehen

if __name__ == "__main__":
    uvicorn.run(app, host="127.0.0.1", port=8000)
