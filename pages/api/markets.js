// FILE: pages/api/market.js
// Paste this into pages/api/market.js in Replit

function ema(data, period) {
  const k = 2 / (period + 1); let e = data[0];
  return data.map((v, i) => { if (i === 0) return e; e = v * k + e * (1 - k); return e; });
}
function rsi(closes, period = 14) {
  if (closes.length < period + 1) return 50;
  let g = 0, l = 0;
  for (let i = 1; i <= period; i++) { const d = closes[i] - closes[i-1]; d > 0 ? g += d : l -= d; }
  let ag = g / period, al = l / period;
  for (let i = period + 1; i < closes.length; i++) {
    const d = closes[i] - closes[i-1];
    ag = (ag * (period-1) + (d > 0 ? d : 0)) / period;
    al = (al * (period-1) + (d < 0 ? -d : 0)) / period;
  }
  return al === 0 ? 100 : 100 - (100 / (1 + ag / al));
}
function macd(closes) {
  const e12 = ema(closes, 12), e26 = ema(closes, 26);
  const line = e12.map((v, i) => v - e26[i]);
  const signal = ema(line.slice(26), 9);
  return { hist: line[line.length-1] - signal[signal.length-1], line: line[line.length-1], signal: signal[signal.length-1] };
}
function vwap(highs, lows, closes, volumes) {
  let ct = 0, cv = 0;
  for (let i = 0; i < closes.length; i++) { const tp = (highs[i]+lows[i]+closes[i])/3; ct += tp*volumes[i]; cv += volumes[i]; }
  return cv > 0 ? ct / cv : closes[closes.length-1];
}

export default async function handler(req, res) {
  const { symbol, type, interval } = req.query;
  if (!symbol) return res.status(400).json({ error: 'Symbol is required' });

  const apiKey = process.env.TWELVEDATA_API_KEY;
  if (!apiKey) return res.status(500).json({ error: 'TWELVEDATA_API_KEY not set in Secrets' });

  try {
    const url = type === 'index'
      ? `https://api.twelvedata.com/time_series?symbol=${encodeURIComponent(symbol)}&type=index&interval=${interval}&outputsize=60&apikey=${apiKey}`
      : `https://api.twelvedata.com/time_series?symbol=${encodeURIComponent(symbol)}&exchange=NSE&interval=${interval}&outputsize=60&apikey=${apiKey}`;

    const r = await fetch(url);
    const json = await r.json();
    if (json.status === 'error') return res.status(400).json({ error: json.message });
    if (!json.values?.length) return res.status(404).json({ error: 'No data. Market may be closed or symbol not found.' });

    const vals = json.values.reverse();
    const data = {
      timestamps: vals.map(v => Math.floor(new Date(v.datetime).getTime() / 1000)),
      opens:   vals.map(v => parseFloat(v.open)),
      highs:   vals.map(v => parseFloat(v.high)),
      lows:    vals.map(v => parseFloat(v.low)),
      closes:  vals.map(v => parseFloat(v.close)),
      volumes: vals.map(v => parseFloat(v.volume) || 0),
    };

    const closes = data.closes, highs = data.highs, lows = data.lows, volumes = data.volumes;
    const last = closes[closes.length-1], prev = closes[closes.length-2];
    const change = last - prev, changePct = (change / prev) * 100;
    const dayN = Math.min(closes.length, 26);
    const dayHigh = Math.max(...highs.slice(-dayN)), dayLow = Math.min(...lows.slice(-dayN));
    const e9 = ema(closes, 9), e21 = ema(closes, 21);
    const rsiVal = rsi(closes), macdData = macd(closes), vwapVal = vwap(highs, lows, closes, volumes);
    const avgVol = volumes.slice(-20).reduce((a,b) => a+b, 0) / 20;
    const lastVol = volumes[volumes.length-1], volRatio = avgVol > 0 ? lastVol / avgVol : 1;
    const mom10 = closes.length > 10 ? ((last - closes[closes.length-11]) / closes[closes.length-11]) * 100 : 0;

    const signals = {
      last, prev, change, changePct, dayHigh, dayLow,
      ema9: e9[e9.length-1], ema21: e21[e21.length-1],
      rsi: rsiVal, macd: macdData, vwap: vwapVal,
      avgVol, lastVol, volRatio, mom10, trendUp: e9[e9.length-1] > e21[e21.length-1],
      recentCloses: closes.slice(-8),
    };

    res.status(200).json({ data, signals });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}