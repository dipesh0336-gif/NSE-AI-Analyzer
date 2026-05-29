# NiftyPulse — How to Start

## One-time setup (run once)
```
pip install -r requirements.txt
```

## Every trading day (2 minutes)

### Step 1 — Start the server
```
cd niftypulse
python main.py
```
You'll see:
```
Starting NiftyPulse on http://localhost:8000
Login URL: https://api.icicidirect.com/apiuser/login?api_key=...
```

### Step 2 — Get session token
1. Open the Login URL shown in terminal
2. Login with ICICI Direct credentials
3. After login you'll be redirected to a URL like:
   `http://localhost/?apisession=XXXXXXXX&...`
4. Copy the value after `apisession=` — that's your session token

### Step 3 — Connect
1. Open http://localhost:8000 on your phone (same WiFi)
2. Tap "OPEN BREEZE LOGIN URL"
3. Login and copy session token
4. Paste token and tap CONNECT

### Step 4 — Trade
- App refreshes every 30 seconds automatically
- Regime shown at top — STRONG BULL = trade, STRONG BEAR = exit
- Trade Setups show entry/stop/target for top stocks
- Reversal warnings fire when 2+ signals align

## Security
After testing, regenerate API keys at api.icicidirect.com
Never commit config.py to GitHub
