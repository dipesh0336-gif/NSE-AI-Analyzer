# NiftyPulse Configuration — copy to config.py and fill in your keys
# Get keys from: https://api.icicidirect.com/

API_KEY    = "YOUR_BREEZE_API_KEY"
SECRET_KEY = "YOUR_BREEZE_SECRET_KEY"
APP_NAME   = "NiftyPulse"

# Top 15 Nifty 50 stocks by index weight
NIFTY_TOP15 = [
    {"sym": "HDFCBANK",   "name": "HDFC Bank",        "weight": 13.1, "sector": "Banking"},
    {"sym": "RELIANCE",   "name": "Reliance",          "weight": 9.8,  "sector": "Energy"},
    {"sym": "ICICIBANK",  "name": "ICICI Bank",        "weight": 8.2,  "sector": "Banking"},
    {"sym": "INFY",       "name": "Infosys",           "weight": 6.8,  "sector": "IT"},
    {"sym": "TCS",        "name": "TCS",               "weight": 5.1,  "sector": "IT"},
    {"sym": "BHARTIARTL", "name": "Bharti Airtel",     "weight": 4.2,  "sector": "Telecom"},
    {"sym": "KOTAKBANK",  "name": "Kotak Bank",        "weight": 3.9,  "sector": "Banking"},
    {"sym": "LT",         "name": "L&T",               "weight": 3.8,  "sector": "Infra"},
    {"sym": "AXISBANK",   "name": "Axis Bank",         "weight": 3.2,  "sector": "Banking"},
    {"sym": "SBIN",       "name": "SBI",               "weight": 3.1,  "sector": "Banking"},
    {"sym": "BAJFINANCE", "name": "Bajaj Finance",     "weight": 2.8,  "sector": "NBFC"},
    {"sym": "HINDUNILVR", "name": "HUL",               "weight": 2.4,  "sector": "FMCG"},
    {"sym": "NTPC",       "name": "NTPC",              "weight": 2.1,  "sector": "Power"},
    {"sym": "POWERGRID",  "name": "Power Grid",        "weight": 1.9,  "sector": "Power"},
    {"sym": "ADANIENT",   "name": "Adani Enterprises", "weight": 1.8,  "sector": "Diversified"},
]

# Index symbols
NIFTY_SYM     = "NIFTY 50"
BANKNIFTY_SYM = "NIFTY BANK"
VIX_SYM       = "INDIA VIX"

# Regime thresholds
STRONG_BULL_PCT  =  0.40
WEAK_BULL_PCT    =  0.15
WEAK_BEAR_PCT    = -0.15
STRONG_BEAR_PCT  = -0.40
BANKNIFTY_MULT   =  1.3

# Reversal warning thresholds
VWAP_DEV_PCT  = 0.40
VIX_SPIKE_PCT = 3.0
BREADTH_SHIFT = 15
