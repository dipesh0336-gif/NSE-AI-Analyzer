// FILE: pages/api/market.js

function ema(data, period) {
  var k = 2 / (period + 1);
  var e = data[0];
  return data.map(function(v, i) {
    if (i === 0) return e;
    e = v * k + e * (1 - k);
    return e;
  });
}

function rsi(closes, period) {
  if (!period) period = 14;
  if (closes.length < period + 1) return 50;
  var g = 0, l = 0;
  for (var i = 1; i <= period; i++) {
    var d = closes[i] - closes[i - 1];
    if (d > 0) g += d; else l -= d;
  }
  var ag = g / period, al = l / period;
  for (var i = period + 1; i < closes.length; i++) {
    var d = closes[i] - closes[i - 1];
    ag = (ag * (period - 1) + (d > 0 ? d : 0)) / period;
    al = (al * (period - 1) + (d < 0 ? -d : 0)) / period;
  }
  return al === 0 ? 100 : 100 - (100 / (1 + ag / al));
}

function macd(closes) {
  var e12 = ema(closes, 12), e26 = ema(closes, 26);
  var line = e12.map(function(v, i) { return v - e26[i]; });
  var signal = ema(line.slice(26), 9);
  return {
    hist: line[line.length - 1] - signal[signal.length - 1],
    line: line[line.length - 1],
    signal: signal[signal.length - 1]
  };
}

function vwap(highs, lows, closes, volumes) {
  var ct = 0, cv = 0;
  for (var i = 0; i < closes.length; i++) {
    var tp = (highs[i] + lows[i] + closes[i]) / 3;
    ct += tp * volumes[i];
    cv += volumes[i];
  }
  return cv > 0 ? ct / cv : closes[closes.length - 1];
}

export default async function handler(req, res) {
  var symbol = req.query.symbol;
  var type = req.query.type || 'stock';
  var interval = req.query.interval || '15min';

  if (!symbol) {
    return res.status(400).json({ error: 'Symbol is required' });
  }

  var apiKey = process.env.TWELVEDATA_API_KEY;
  if (!apiKey) {
    return res.status(500).json({ error: 'TWELVEDATA_API_KEY not set in Vercel Environment Variables' });
  }

  try {
    var url;
    if (type === 'index') {
      // Twelve Data index symbols - use exact format they require
      url = 'https://api.twelvedata.com/time_series?symbol=' + encodeURIComponent(symbol) + '&type=index&interval=' + interval + '&outputsize=60&apikey=' + apiKey;
    } else {
      url = 'https://api.twelvedata.com/time_series?symbol=' + encodeURIComponent(symbol) + '&exchange=NSE&interval=' + interval + '&outputsize=60&apikey=' + apiKey;
    }

    var r = await fetch(url);
    var json = await r.json();

    if (json.status === 'error') {
      // If index fails, try without type=index
      if (type === 'index') {
        var url2 = 'https://api.twelvedata.com/time_series?symbol=' + encodeURIComponent(symbol) + '&interval=' + interval + '&outputsize=60&apikey=' + apiKey;
        var r2 = await fetch(url2);
        var json2 = await r2.json();
        if (json2.status !== 'error' && json2.values && json2.values.length) {
          json = json2;
        } else {
          return res.status(400).json({ error: 'Symbol not found. Note: Index data may require a paid Twelve Data plan. Try a stock instead (e.g. select NSE Stock and search Reliance).' });
        }
      } else {
        return res.status(400).json({ error: json.message });
      }
    }

    if (!json.values || !json.values.length) {
      return res.status(404).json({ error: 'No data returned. Market may be closed. Try during NSE hours: 09:15-15:30 IST weekdays.' });
    }

    var vals = json.values.reverse();
    var data = {
      timestamps: vals.map(function(v) { return Math.floor(new Date(v.datetime).getTime() / 1000); }),
      opens:   vals.map(function(v) { return parseFloat(v.open); }),
      highs:   vals.map(function(v) { return parseFloat(v.high); }),
      lows:    vals.map(function(v) { return parseFloat(v.low); }),
      closes:  vals.map(function(v) { return parseFloat(v.close); }),
      volumes: vals.map(function(v) { return parseFloat(v.volume) || 0; }),
    };

    var closes = data.closes, highs = data.highs, lows = data.lows, volumes = data.volumes;
    var last = closes[closes.length - 1], prev = closes[closes.length - 2];
    var change = last - prev, changePct = (change / prev) * 100;
    var dayN = Math.min(closes.length, 26);
    var dayHigh = Math.max.apply(null, highs.slice(-dayN));
    var dayLow = Math.min.apply(null, lows.slice(-dayN));
    var e9 = ema(closes, 9), e21 = ema(closes, 21);
    var rsiVal = rsi(closes);
    var macdData = macd(closes);
    var vwapVal = vwap(highs, lows, closes, volumes);
    var avgVol = volumes.slice(-20).reduce(function(a, b) { return a + b; }, 0) / 20;
    var lastVol = volumes[volumes.length - 1];
    var volRatio = avgVol > 0 ? lastVol / avgVol : 1;
    var mom10 = closes.length > 10 ? ((last - closes[closes.length - 11]) / closes[closes.length - 11]) * 100 : 0;

    var signals = {
      last: last, prev: prev, change: change, changePct: changePct,
      dayHigh: dayHigh, dayLow: dayLow,
      ema9: e9[e9.length - 1], ema21: e21[e21.length - 1],
      rsi: rsiVal, macd: macdData, vwap: vwapVal,
      avgVol: avgVol, lastVol: lastVol, volRatio: volRatio,
      mom10: mom10, trendUp: e9[e9.length - 1] > e21[e21.length - 1],
      recentCloses: closes.slice(-8),
    };

    res.status(200).json({ data: data, signals: signals });

  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}
