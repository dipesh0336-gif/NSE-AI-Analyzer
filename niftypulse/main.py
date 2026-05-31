# main.py — NiftyPulse FastAPI server

from fastapi import FastAPI, HTTPException
from fastapi.staticfiles import StaticFiles
from fastapi.responses import HTMLResponse, FileResponse
from pydantic import BaseModel
import asyncio, json, time
from datetime import datetime
import pytz

import config
from breeze_client import client as breeze
from regime import detect_regime, check_reversal_warnings, compute_vwap
from signals import analyze_stocks, get_trade_setups

IST = pytz.timezone("Asia/Kolkata")
app = FastAPI(title="NiftyPulse")

# In-memory state
state = {
    "connected": False,
    "last_update": None,
    "regime": None,
    "stocks": [],
    "setups": [],
    "warnings": None,
    "nifty": None,
    "banknifty": None,
    "vix": None,
    "error": None,
    # History for reversal detection
    "nifty_candles": [],
    "banknifty_candles": [],
    "prev_breadth": None,
}

# ── API ROUTES ─────────────────────────────────────────────────────

class SessionRequest(BaseModel):
    session_token: str

@app.post("/api/connect")
def connect(req: SessionRequest):
    """Connect to Breeze with session token"""
    ok = breeze.connect(req.session_token)
    if ok:
        state["connected"] = True
        state["error"] = None
        return {"status": "connected"}
    raise HTTPException(status_code=400, detail="Failed to connect to Breeze")

@app.get("/api/status")
def get_status():
    return {
        "connected": state["connected"],
        "last_update": state["last_update"],
        "error": state["error"],
    }

@app.get("/api/pulse")
def get_pulse():
    """Get full market pulse — regime + stocks + warnings"""
    if not state["connected"]:
        return {"error": "Not connected. Enter session token first."}
    return {
        "regime":   state["regime"],
        "nifty":    state["nifty"],
        "banknifty": state["banknifty"],
        "vix":      state["vix"],
        "stocks":   state["stocks"],
        "setups":   state["setups"],
        "warnings": state["warnings"],
        "last_update": state["last_update"],
    }

@app.post("/api/refresh")
async def manual_refresh():
    """Manually trigger a data refresh"""
    if not state["connected"]:
        raise HTTPException(status_code=400, detail="Not connected")
    await refresh_data()
    return {"status": "refreshed", "last_update": state["last_update"]}

@app.get("/api/login-url")
def get_login_url():
    """Get Breeze login URL for session token"""
    url = f"https://api.icicidirect.com/apiuser/login?api_key={config.API_KEY}"
    return {"url": url, "instructions": "Open this URL, login with ICICI Direct, copy the session token from the redirected URL"}

# ── DATA REFRESH ───────────────────────────────────────────────────

async def refresh_data():
    try:
        # 1. Fetch Nifty, BankNifty, VIX
        nifty_q    = breeze.get_index_quote(config.NIFTY_SYM)
        bnifty_q   = breeze.get_index_quote(config.BANKNIFTY_SYM)
        vix_q      = breeze.get_index_quote(config.VIX_SYM)

        nifty_pct  = nifty_q["change_pct"]  if nifty_q  else 0
        bnifty_pct = bnifty_q["change_pct"] if bnifty_q else 0
        vix_pct    = vix_q["change_pct"]    if vix_q    else 0

        state["nifty"]    = nifty_q
        state["banknifty"] = bnifty_q
        state["vix"]      = vix_q

        # 2. Detect regime
        regime_data = detect_regime(nifty_pct, bnifty_pct, vix_pct)
        state["regime"] = regime_data

        # 3. Fetch top 15 stock quotes
        stock_quotes = []
        for cfg_item in config.NIFTY_TOP15:
            q = breeze.get_quote(cfg_item["sym"])
            if q:
                # Get candles for VWAP
                candles = breeze.get_candles(cfg_item["sym"], interval="5minute")
                if candles:
                    q["vwap"]       = compute_vwap(candles)
                    volumes         = [c["volume"] for c in candles if c["volume"] > 0]
                    q["avg_volume"] = int(sum(volumes) / len(volumes)) if volumes else q["volume"]
                stock_quotes.append(q)
            await asyncio.sleep(0.1)  # small delay to avoid rate limiting

        # 4. Analyze stocks
        analyzed  = analyze_stocks(stock_quotes, nifty_pct, regime_data["regime"])
        setups    = get_trade_setups(analyzed, regime_data["regime"])

        # Track breadth for reversal detection
        prev_breadth = state.get("prev_breadth")
        if prev_breadth is not None:
            for s in analyzed:
                s["prev_above_vwap"] = prev_breadth.get(s["symbol"], True)
        state["prev_breadth"] = {s["symbol"]: s["above_vwap"] for s in analyzed}

        state["stocks"] = analyzed
        state["setups"] = setups

        # 5. Reversal warnings
        nifty_candles   = breeze.get_candles(config.NIFTY_SYM, interval="5minute")
        bnifty_candles  = breeze.get_candles(config.BANKNIFTY_SYM, interval="5minute")

        warnings = check_reversal_warnings(
            nifty_candles  = nifty_candles,
            banknifty_candles = bnifty_candles,
            nifty_ltp      = nifty_q["ltp"] if nifty_q else 0,
            banknifty_ltp  = bnifty_q["ltp"] if bnifty_q else 0,
            vix_pct        = vix_pct,
            stock_data     = analyzed,
        )
        state["warnings"]    = warnings
        state["last_update"] = datetime.now(IST).strftime("%H:%M:%S")
        state["error"]       = None

    except Exception as e:
        state["error"] = str(e)
        print(f"Refresh error: {e}")

# ── BACKGROUND REFRESH LOOP ────────────────────────────────────────

@app.on_event("startup")
async def start_refresh_loop():
    async def loop():
        while True:
            if state["connected"]:
                await refresh_data()
            await asyncio.sleep(30)  # refresh every 30 seconds
    asyncio.create_task(loop())

# ── SERVE FRONTEND ─────────────────────────────────────────────────

@app.get("/", response_class=HTMLResponse)
def serve_ui():
    with open("index.html", "r") as f:
        return f.read()

if __name__ == "__main__":
    import uvicorn
    print("Starting NiftyPulse on http://localhost:8000")
    print(f"Login URL: https://api.icicidirect.com/apiuser/login?api_key={config.API_KEY}")
    uvicorn.run(app, host="0.0.0.0", port=8000, reload=False)
