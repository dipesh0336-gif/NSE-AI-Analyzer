// Pure functions extracted from pages/api/market.js

function computeVwap(d) {
  let ct = 0, cv = 0;
  d.closes.forEach((c, i) => {
    const tp = (d.highs[i] + d.lows[i] + c) / 3;
    ct += tp * d.volumes[i];
    cv += d.volumes[i];
  });
  return cv > 0 ? ct / cv : d.closes[d.closes.length - 1];
}

function computeCPR(pdh, pdl, pdc) {
  const pivot = (pdh + pdl + pdc) / 3;
  const bc = (pdh + pdl) / 2;
  const tc = pivot * 2 - bc;
  return { pivot, bc: Math.min(bc, tc), tc: Math.max(bc, tc), width: Math.abs(tc - bc) };
}

function getNiftyTrend(d) {
  if (!d || d.closes.length < 5) return { trend: 'NEUTRAL', change: 0 };
  const last = d.closes[d.closes.length - 1];
  const prev = d.closes[d.closes.length - 2] || last;
  const change = (last - prev) / prev * 100;
  const vwapV = computeVwap(d);
  let score = 0;
  if (last > vwapV) score += 2; else score -= 2;
  if (change > 0.2) score += 2; else if (change < -0.2) score -= 2;
  const trend = score >= 2 ? 'BULLISH' : score <= -2 ? 'BEARISH' : 'NEUTRAL';
  return { trend, change: parseFloat(change.toFixed(2)), vwap: parseFloat(vwapV.toFixed(2)) };
}

module.exports = { computeVwap, computeCPR, getNiftyTrend };
