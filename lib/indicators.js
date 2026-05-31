// Pure technical indicator functions extracted from pages/api/backtest.js

function ema(data, p) {
  var k = 2 / (p + 1), e = data[0];
  return data.map(function(v, i) { if (i === 0) return e; e = v * k + e * (1 - k); return e; });
}

function rsi(closes, p) {
  if (!p) p = 14;
  if (closes.length < p + 1) return 50;
  var g = 0, l = 0;
  for (var i = 1; i <= p; i++) { var d = closes[i] - closes[i - 1]; if (d > 0) g += d; else l -= d; }
  var ag = g / p, al = l / p;
  for (var i = p + 1; i < closes.length; i++) { var d = closes[i] - closes[i - 1]; ag = (ag * (p - 1) + (d > 0 ? d : 0)) / p; al = (al * (p - 1) + (d < 0 ? -d : 0)) / p; }
  return al === 0 ? 100 : 100 - (100 / (1 + ag / al));
}

function stochRsi(closes, rsiP, stochP) {
  if (!rsiP) rsiP = 14; if (!stochP) stochP = 14;
  var rsiSeries = [];
  for (var i = rsiP; i < closes.length; i++) rsiSeries.push(rsi(closes.slice(0, i + 1), rsiP));
  if (rsiSeries.length < stochP) return 50;
  var recent = rsiSeries.slice(-stochP);
  var minR = Math.min.apply(null, recent), maxR = Math.max.apply(null, recent);
  if (maxR === minR) return 50;
  return ((rsiSeries[rsiSeries.length - 1] - minR) / (maxR - minR)) * 100;
}

function macdCalc(closes) {
  var e12 = ema(closes, 12), e26 = ema(closes, 26);
  var line = e12.map(function(v, i) { return v - e26[i]; });
  var signal = ema(line.slice(26), 9);
  return { hist: line[line.length - 1] - signal[signal.length - 1], line: line[line.length - 1], signal: signal[signal.length - 1] };
}

function bollingerBands(closes, p, mult) {
  if (!p) p = 20; if (!mult) mult = 2;
  if (closes.length < p) return { pct: 50 };
  var recent = closes.slice(-p);
  var mean = recent.reduce(function(a, b) { return a + b; }, 0) / p;
  var variance = recent.reduce(function(s, v) { return s + (v - mean) * (v - mean); }, 0) / p;
  var std = Math.sqrt(variance);
  var upper = mean + mult * std, lower = mean - mult * std;
  var last = closes[closes.length - 1];
  return { upper: upper, lower: lower, mid: mean, pct: upper === lower ? 50 : ((last - lower) / (upper - lower)) * 100 };
}

function adxCalc(highs, lows, closes, p) {
  if (!p) p = 14;
  if (closes.length < p + 2) return { adx: 20, pdi: 0, ndi: 0 };
  var trArr = [], pdmArr = [], ndmArr = [];
  for (var i = 1; i < closes.length; i++) {
    trArr.push(Math.max(highs[i] - lows[i], Math.abs(highs[i] - closes[i - 1]), Math.abs(lows[i] - closes[i - 1])));
    var up = highs[i] - highs[i - 1], dn = lows[i - 1] - lows[i];
    pdmArr.push(up > dn && up > 0 ? up : 0);
    ndmArr.push(dn > up && dn > 0 ? dn : 0);
  }
  function smth(arr, per) { var s = arr.slice(0, per).reduce(function(a, b) { return a + b; }, 0); var res = [s]; for (var i = per; i < arr.length; i++) { s = s - s / per + arr[i]; res.push(s); } return res; }
  var tr14 = smth(trArr, p), pd14 = smth(pdmArr, p), nd14 = smth(ndmArr, p);
  var pdiArr = pd14.map(function(v, i) { return tr14[i] > 0 ? 100 * v / tr14[i] : 0; });
  var ndiArr = nd14.map(function(v, i) { return tr14[i] > 0 ? 100 * v / tr14[i] : 0; });
  var dxArr = pdiArr.map(function(v, i) { var s = v + ndiArr[i]; return s > 0 ? 100 * Math.abs(v - ndiArr[i]) / s : 0; });
  return { adx: dxArr.slice(-p).reduce(function(a, b) { return a + b; }, 0) / p, pdi: pdiArr[pdiArr.length - 1], ndi: ndiArr[ndiArr.length - 1] };
}

function vwapCalc(highs, lows, closes, volumes) {
  var ct = 0, cv = 0;
  for (var i = 0; i < closes.length; i++) { var tp = (highs[i] + lows[i] + closes[i]) / 3; ct += tp * volumes[i]; cv += volumes[i]; }
  return cv > 0 ? ct / cv : closes[closes.length - 1];
}

function predictBar(opens, highs, lows, closes, volumes) {
  if (closes.length < 26) return { signal: 'NEUTRAL', score: 0 };
  var last = closes[closes.length - 1];
  var e9 = ema(closes, 9), e21 = ema(closes, 21);
  var rsiV = rsi(closes);
  var stRsiV = stochRsi(closes, 14, 14);
  var macdD = macdCalc(closes);
  var bbD = bollingerBands(closes, 20, 2);
  var adxD = adxCalc(highs, lows, closes, 14);
  var vwapV = vwapCalc(highs, lows, closes, volumes);
  var avgVol = volumes.slice(-10).reduce(function(a, b) { return a + b; }, 0) / 10;
  var volRatio = avgVol > 0 ? volumes[volumes.length - 1] / avgVol : 1;
  var mom10 = closes.length > 10 ? ((last - closes[closes.length - 11]) / closes[closes.length - 11]) * 100 : 0;
  var trendUp = e9[e9.length - 1] > e21[e21.length - 1];
  var emaDiff = ((e9[e9.length - 1] - e21[e21.length - 1]) / e21[e21.length - 1]) * 100;
  var change = last - (closes[closes.length - 2] || last);
  var dayHigh = Math.max.apply(null, highs.slice(-Math.min(highs.length, 10)));
  var dayLow = Math.min.apply(null, lows.slice(-Math.min(lows.length, 10)));
  var posInRange = dayHigh === dayLow ? 50 : ((last - dayLow) / (dayHigh - dayLow)) * 100;
  var bullC = 0, bearC = 0, sBull = 0, sBear = 0;
  var cn = Math.min(5, opens.length);
  for (var i = opens.length - cn; i < opens.length; i++) {
    var body = Math.abs(closes[i] - opens[i]), range = highs[i] - lows[i] || 0.01;
    if (closes[i] > opens[i]) { bullC++; if (body / range > 0.6) sBull++; }
    else { bearC++; if (body / range > 0.6) sBear++; }
  }
  var score = 0;
  if (rsiV < 30) score += 2; else if (rsiV < 42) score += 1; else if (rsiV > 70) score -= 2; else if (rsiV > 58) score -= 1;
  if (stRsiV < 20) score += 2; else if (stRsiV < 35) score += 1; else if (stRsiV > 80) score -= 2; else if (stRsiV > 65) score -= 1;
  if (macdD.hist > 0 && macdD.line > macdD.signal) score += 2; else if (macdD.hist > 0) score += 1;
  else if (macdD.hist < 0 && macdD.line < macdD.signal) score -= 2; else score -= 1;
  if (trendUp && emaDiff > 0.3) score += 2; else if (trendUp) score += 1;
  else if (!trendUp && emaDiff < -0.3) score -= 2; else score -= 1;
  if (bbD.pct < 10) score += 2; else if (bbD.pct < 25) score += 1; else if (bbD.pct > 90) score -= 2; else if (bbD.pct > 75) score -= 1;
  if (adxD.adx > 25) { if (adxD.pdi > adxD.ndi) score += 2; else score -= 2; }
  else if (adxD.adx > 18) { if (adxD.pdi > adxD.ndi) score += 1; else score -= 1; }
  else score = Math.round(score * 0.8);
  var vwapDiff = ((last - vwapV) / vwapV) * 100;
  if (last > vwapV && vwapDiff > 0.3) score += 2; else if (last > vwapV) score += 1;
  else if (last < vwapV && vwapDiff < -0.3) score -= 2; else score -= 1;
  if (volRatio > 2) { if (change > 0) score += 2; else score -= 2; }
  else if (volRatio > 1.4) { if (change > 0) score += 1; else score -= 1; }
  if (mom10 > 2) score += 2; else if (mom10 > 0.8) score += 1; else if (mom10 < -2) score -= 2; else if (mom10 < -0.8) score -= 1;
  if (sBull >= 3 && bearC <= 1) score += 2; else if (bullC >= 4) score += 1;
  else if (sBear >= 3 && bullC <= 1) score -= 2; else if (bearC >= 4) score -= 1;
  if (posInRange < 20) score += 2; else if (posInRange > 80) score -= 2;
  if (closes.length >= 50) { var e50 = ema(closes, 50); if (last > e50[e50.length - 1]) score += 1; else score -= 1; }
  return { signal: score >= 5 ? 'LONG' : score <= -5 ? 'SHORT' : 'NEUTRAL', score: score };
}

module.exports = { ema, rsi, stochRsi, macdCalc, bollingerBands, adxCalc, vwapCalc, predictBar };
