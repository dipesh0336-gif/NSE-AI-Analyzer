"""Fetch NSE market data from Yahoo Finance."""

import yfinance as yf
import pandas as pd

INDEX_MAP = {
    "NIFTY": "^NSEI",
    "BANKNIFTY": "^NSEBANK",
    "NIFTY IT": "^CNXIT",
    "NIFTY AUTO": "^CNXAUTO",
    "NIFTY PHARMA": "^CNXPHARMA",
    "NIFTY MIDCAP 50": "^CNXMIDCAP",
    "NIFTY FMCG": "^CNXFMCG",
    "NIFTY METAL": "^CNXMETAL",
}

INTERVAL_RANGE = {
    "5min":  ("5m",  "10d"),
    "15min": ("15m", "60d"),
    "30min": ("30m", "60d"),
    "1h":    ("60m", "60d"),
}

NSE_STOCKS = [
    {"name": "Reliance Industries",     "symbol": "RELIANCE",   "sector": "Energy"},
    {"name": "Tata Consultancy Services","symbol": "TCS",        "sector": "IT"},
    {"name": "HDFC Bank",               "symbol": "HDFCBANK",   "sector": "Banking"},
    {"name": "Infosys",                 "symbol": "INFY",       "sector": "IT"},
    {"name": "ICICI Bank",              "symbol": "ICICIBANK",  "sector": "Banking"},
    {"name": "Hindustan Unilever",      "symbol": "HINDUNILVR", "sector": "FMCG"},
    {"name": "ITC",                     "symbol": "ITC",        "sector": "FMCG"},
    {"name": "State Bank of India",     "symbol": "SBIN",       "sector": "Banking"},
    {"name": "Bharti Airtel",           "symbol": "BHARTIARTL", "sector": "Telecom"},
    {"name": "Kotak Mahindra Bank",     "symbol": "KOTAKBANK",  "sector": "Banking"},
    {"name": "Larsen & Toubro",         "symbol": "LT",         "sector": "Infra"},
    {"name": "Asian Paints",            "symbol": "ASIANPAINT", "sector": "Paints"},
    {"name": "Axis Bank",               "symbol": "AXISBANK",   "sector": "Banking"},
    {"name": "Bajaj Finance",           "symbol": "BAJFINANCE", "sector": "NBFC"},
    {"name": "Wipro",                   "symbol": "WIPRO",      "sector": "IT"},
    {"name": "HCL Technologies",        "symbol": "HCLTECH",    "sector": "IT"},
    {"name": "Maruti Suzuki",           "symbol": "MARUTI",     "sector": "Auto"},
    {"name": "Sun Pharma",              "symbol": "SUNPHARMA",  "sector": "Pharma"},
    {"name": "Titan Company",           "symbol": "TITAN",      "sector": "Jewellery"},
    {"name": "Tech Mahindra",           "symbol": "TECHM",      "sector": "IT"},
    {"name": "NTPC",                    "symbol": "NTPC",       "sector": "Power"},
    {"name": "Power Grid",              "symbol": "POWERGRID",  "sector": "Power"},
    {"name": "ONGC",                    "symbol": "ONGC",       "sector": "Energy"},
    {"name": "Tata Motors",             "symbol": "TATAMOTORS", "sector": "Auto"},
    {"name": "JSW Steel",               "symbol": "JSWSTEEL",   "sector": "Steel"},
    {"name": "Mahindra & Mahindra",     "symbol": "M&M",        "sector": "Auto"},
]


def _to_yahoo_symbol(symbol: str, asset_type: str = "stock") -> str:
    if asset_type == "index":
        return INDEX_MAP.get(symbol, f"^{symbol}")
    return f"{symbol}.NS"


def fetch_ohlcv(symbol: str, interval: str = "15min", asset_type: str = "stock") -> pd.DataFrame:
    """Return a DataFrame with columns: open, high, low, close, volume."""
    yh_interval, yh_range = INTERVAL_RANGE.get(interval, ("15m", "60d"))
    yh_symbol = _to_yahoo_symbol(symbol, asset_type)

    ticker = yf.Ticker(yh_symbol)
    df = ticker.history(interval=yh_interval, period=yh_range)

    if df.empty:
        raise ValueError(f"No data returned for {yh_symbol}")

    df = df.rename(columns={
        "Open": "open", "High": "high",
        "Low": "low", "Close": "close", "Volume": "volume",
    })[["open", "high", "low", "close", "volume"]].dropna()

    return df


def fetch_extras() -> dict:
    """Fetch India VIX and return mock FII/DII/PCR values (not publicly available)."""
    try:
        vix_ticker = yf.Ticker("^INDIAVIX")
        vix_df = vix_ticker.history(period="1d")
        vix = float(vix_df["Close"].iloc[-1]) if not vix_df.empty else 15.0
    except Exception:
        vix = 15.0

    return {
        "vix": vix,
        "fii": 0.0,
        "dii": 0.0,
        "pcr": 1.0,
        "maxPain": 0,
    }
