// FILE: pages/api/backtest.js
// Fetches 30 days daily data from Yahoo Finance and runs prediction engine

function ema(data, period) {
  var k = 2 / (period + 1), e = data[0];
  return data.map(function(v, i) { if (i === 0) return e; e = v * k + e * (1 - k); return e; });
}
function rsi(closes, period) {
  if (!period) period = 14;
  if (closes.length < period + 1) return 50;
  var g = 0, l = 0;
  for (var i = 1; i <= period; i++) { var d = closes[i] - closes[i-1]; if (d > 0) g += d; else l -= d; }
  var ag = g/period, al = l/period;
  for (var i = period+1; i < closes.length; i++) {
    var d = closes[i] - closes[i-1];
    ag = (ag*(period-1) + (d>0?d:0)) / period;
    al = (al*(period-1) + (d<0?-d:0)) / period;
  }
  return al === 0 ? 100 : 100 - (100 / (1 + ag/al));
}
function macd(closes) {
  var e12 = ema(closes, 12), e26 = ema(closes, 26);
  var line = e12.map(function(v, i) { return v - e26[i]; });
  var signal = ema(line.slice(26), 9);
  return { hist: line[line.length-1] - signal[signal.length-1], line: line[line.length-1] };
}
function vwap(highs, lows, closes, volumes) {
  var ct = 0, cv = 0;
  for (var i = 0; i < closes.length; i++) { var tp = (highs[i]+lows[i]+closes[i])/3; ct += tp*volumes[i]; cv += volumes[i]; }
  return cv > 0 ? ct/cv : closes[closes.length-1];
}

function predictDay(closes, highs, lows, volumes) {
  if (closes.length < 20) return 'NEUTRAL';
  var last = closes[closes.length-1];
  var e9 = ema(closes, 9), e21 = ema(closes, 21);
  var rsiVal = rsi(closes);
  var macdData = macd(closes);
  var vwapVal = vwap(highs, lows, closes, volumes);
  var avgVol = volumes.slice(-10).reduce(function(a,b){return a+b;},0)/10;
  var lastVol = volumes[volumes.length-1];
  var volRatio = avgVol > 0 ? lastVol/avgVol : 1;
  var mom = closes.length > 5 ? ((last - closes[closes.length-6]) / closes[closes.length-6]) * 100 : 0;
  var trendUp = e9[e9.length-1] > e21[e21.length-1];
  var score = 0;
  if (rsiVal < 35) score += 2; else if (rsiVal < 45) score += 1;
  else if (rsiVal > 65) score -= 2; else if (rsiVal > 55) score -= 1;
  if (macdData.hist > 0) score += 2; else score -= 2;
  if (trendUp) score += 2; else score -= 2;
  if (last > vwapVal) score += 1; else score -= 1;
  if (mom > 1.5) score += 1; else if (mom < -1.5) score -= 1;
  if (volRatio > 1.5) { if (last > closes[closes.length-2]) score += 1; else score -= 1; }
  if (score >= 4) return 'LONG';
  if (score <= -4) return 'SHORT';
  return 'NEUTRAL';
}

export default async function handler(req, res) {
  var symbol = req.query.symbol;
  var type = req.query.type || 'stock';
  if (!symbol) return res.status(400).json({ error: 'Symbol required' });

  var yhSymbol;
  if (type === 'index') {
    var indexMap = { 'NIFTY':'^NSEI','BANKNIFTY':'^NSEBANK','NIFTY IT':'^CNXIT','NIFTY AUTO':'^CNXAUTO','NIFTY PHARMA':'^CNXPHARMA','NIFTY MIDCAP 50':'^CNXMIDCAP','NIFTY FMCG':'^CNXFMCG','NIFTY METAL':'^CNXMETAL' };
    yhSymbol = indexMap[symbol] || ('^'+symbol);
  } else {
    yhSymbol = symbol + '.NS';
  }

  try {
    // Fetch 3 months of daily data for backtesting
    var url = 'https://query1.finance.yahoo.com/v8/finance/chart/'+encodeURIComponent(yhSymbol)+'?interval=1d&range=3mo';
    var r = await fetch(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
        'Accept': 'application/json',
        'Referer': 'https://finance.yahoo.com',
      }
    });
    if (!r.ok) throw new Error('Yahoo Finance error: '+r.status);
    var json = await r.json();
    var result = json.chart && json.chart.result && json.chart.result[0];
    if (!result) throw new Error('No data returned');

    var ts = result.timestamps || result.timestamp;
    var q = result.indicators.quote[0];
    var validIdx = ts.map(function(_,i){return i;}).filter(function(i){
      return q.close[i]!=null && q.open[i]!=null && q.high[i]!=null && q.low[i]!=null;
    });
    if (validIdx.length < 25) throw new Error('Not enough historical data for backtest');

    var allCloses  = validIdx.map(function(i){return q.close[i];});
    var allHighs   = validIdx.map(function(i){return q.high[i];});
    var allLows    = validIdx.map(function(i){return q.low[i];});
    var allVolumes = validIdx.map(function(i){return q.volume[i]||0;});
    var allDates   = validIdx.map(function(i){
      var d = new Date(ts[i]*1000);
      return d.toLocaleDateString('en-IN',{day:'2-digit',month:'short'});
    });

    // Use last 30 trading days, need at least 20 bars of history before each
    var results = [];
    var startIdx = Math.max(20, allCloses.length - 30);

    for (var i = startIdx; i < allCloses.length - 1; i++) {
      var histCloses  = allCloses.slice(0, i+1);
      var histHighs   = allHighs.slice(0, i+1);
      var histLows    = allLows.slice(0, i+1);
      var histVolumes = allVolumes.slice(0, i+1);

      var prediction = predictDay(histCloses, histHighs, histLows, histVolumes);
      var currentClose = allCloses[i];
      var nextClose    = allCloses[i+1];
      var actualMove   = nextClose > currentClose ? 'UP' : nextClose < currentClose ? 'DOWN' : 'FLAT';
      var changePct    = ((nextClose - currentClose) / currentClose) * 100;

      var correct = false;
      if (prediction === 'LONG' && actualMove === 'UP') correct = true;
      if (prediction === 'SHORT' && actualMove === 'DOWN') correct = true;
      if (prediction === 'NEUTRAL') correct = null; // skip neutral

      results.push({
        date: allDates[i],
        prediction: prediction,
        actualMove: actualMove,
        currentClose: currentClose.toFixed(2),
        nextClose: nextClose.toFixed(2),
        changePct: changePct.toFixed(2),
        correct: correct
      });
    }

    // Calculate accuracy (excluding NEUTRAL)
    var directional = results.filter(function(r){return r.prediction !== 'NEUTRAL';});
    var correct = directional.filter(function(r){return r.correct === true;});
    var accuracy = directional.length > 0 ? Math.round(correct.length / directional.length * 100) : 0;

    var longCalls  = results.filter(function(r){return r.prediction==='LONG';});
    var shortCalls = results.filter(function(r){return r.prediction==='SHORT';});
    var neutrals   = results.filter(function(r){return r.prediction==='NEUTRAL';});
    var longCorrect  = longCalls.filter(function(r){return r.correct;});
    var shortCorrect = shortCalls.filter(function(r){return r.correct;});

    res.status(200).json({
      symbol: symbol,
      totalDays: results.length,
      directionalCalls: directional.length,
      correctCalls: correct.length,
      accuracy: accuracy,
      longCalls: longCalls.length,
      shortCalls: shortCalls.length,
      neutralCalls: neutrals.length,
      longAccuracy: longCalls.length > 0 ? Math.round(longCorrect.length/longCalls.length*100) : 0,
      shortAccuracy: shortCalls.length > 0 ? Math.round(shortCorrect.length/shortCalls.length*100) : 0,
      results: results.slice(-30) // last 30 days
    });

  } catch(err) {
    res.status(500).json({ error: err.message });
  }
}
