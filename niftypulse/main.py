# main.py — NiftyPulse FastAPI server

import os
from datetime import datetime

import pytz
import uvicorn
from fastapi import FastAPI, HTTPException
from fastapi.responses import HTMLResponse
from pydantic import BaseModel

import config
from breeze_client import client
from regime import check_reversal_warnings, compute_vwap, detect_regime
from signals import analyze_stocks, get_trade_setups

app = FastAPI()
IST = pytz.timezone("Asia/Kolkata")

_cache: dict = {}


@app.get("/", response_class=HTMLResponse)
async def index():
    path = os.path.join(os.path.dirname(__file__), "templates", "index.html")
    with open(path) as f:
        return f.read()


@app.get("/api/login-url")
async def login_url():
    return {"url": f"https://api.icicidirect.com/apiuser/login?api_key={config.API_KEY}"}


class ConnectRequest(BaseModel):
    session_token: str


@app.post("/api/connect")
async def connect(req: ConnectRequest):
    ok = client.connect(req.session_token)
    if ok:
        return {"status": "connected"}
    raise HTTPException(status_code=400, detail="Breeze connection failed — check session token")


@app.post("/api/refresh")
async def refresh():
    if not client.connected:
        raise HTTPException(status_code=403, detail="Not connected to Breeze")

    # Index quotes
    nifty_q  = client.get_index_quote(config.NIFTY_SYM)
    bnifty_q = client.get_index_quote(config.BANKNIFTY_SYM)
    vix_q    = client.get_index_quote(config.VIX_SYM)

    nifty_pct  = nifty_q["change_pct"]  if nifty_q  else 0.0
    bnifty_pct = bnifty_q["change_pct"] if bnifty_q else 0.0
    vix_pct    = vix_q["change_pct"]    if vix_q    else 0.0

    regime_data = detect_regime(nifty_pct, bnifty_pct, vix_pct)

    # Index candles for reversal detection
    nifty_candles  = client.get_candles("NIFTY 50",   interval="5minute")
    bnifty_candles = client.get_candles("NIFTY BANK",  interval="5minute")

    # Stock quotes + per-stock VWAP
    stock_quotes = []
    for cfg_item in config.NIFTY_TOP15:
        sym   = cfg_item["sym"]
        quote = client.get_quote(sym)
        if not quote:
            continue
        candles    = client.get_candles(sym, interval="5minute")
        vwap       = compute_vwap(candles) if candles else quote["ltp"]
        avg_vol    = (sum(c["volume"] for c in candles[-20:]) // max(len(candles[-20:]), 1)
                      if candles else quote["volume"])
        quote["vwap"]           = vwap
        quote["avg_volume"]     = avg_vol
        quote["above_vwap"]     = quote["ltp"] > vwap
        quote["prev_above_vwap"] = _cache.get("_prev_vwap", {}).get(sym, True)
        stock_quotes.append(quote)

    # Persist current above_vwap for next refresh's divergence calc
    _cache["_prev_vwap"] = {q["symbol"]: q["above_vwap"] for q in stock_quotes}

    analyzed = analyze_stocks(stock_quotes, nifty_pct, regime_data["regime"])
    setups   = get_trade_setups(analyzed, regime_data["regime"])
    warnings = check_reversal_warnings(
        nifty_candles, bnifty_candles,
        nifty_q["ltp"]  if nifty_q  else 0,
        bnifty_q["ltp"] if bnifty_q else 0,
        vix_pct,
        analyzed,
    )

    now = datetime.now(IST).strftime("%H:%M:%S")
    _cache.update({
        "regime":      regime_data,
        "nifty":       nifty_q,
        "banknifty":   bnifty_q,
        "vix":         vix_q,
        "warnings":    warnings,
        "setups":      setups,
        "stocks":      analyzed,
        "last_update": now,
    })

    return {"status": "ok", "last_update": now}


@app.get("/api/pulse")
async def pulse():
    data = {k: v for k, v in _cache.items() if not k.startswith("_")}
    if not data:
        return {"error": "No data yet — tap Refresh"}
    return data


if __name__ == "__main__":
    print(f"Starting NiftyPulse on http://localhost:8000")
    print(f"Login URL: https://api.icicidirect.com/apiuser/login?api_key={config.API_KEY}")
    uvicorn.run(app, host="0.0.0.0", port=8000)
