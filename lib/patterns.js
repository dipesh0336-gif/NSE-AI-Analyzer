// Pure pattern/momentum functions extracted from pages/api/validate.js

function p1(d, i) {
  if (i < 20) return { hit: false, score: 0 };
  const win = 5;
  const rv = d.volumes.slice(i - win, i).reduce((a, b) => a + b, 0) / win;
  const pv = d.volumes.slice(i - win - 15, i - win).reduce((a, b) => a + b, 0) / 15;
  const contracted = rv < pv * 0.75;
  const closes = d.closes.slice(i - win, i);
  const rng = (Math.max(...closes) - Math.min(...closes)) / Math.min(...closes) * 100;
  const tight = rng < 2.5;
  return { hit: contracted && tight, score: (contracted && tight) ? 100 : (contracted || tight) ? 50 : 0 };
}

function p2(d, i) {
  if (i < 50) return { hit: false, score: 0 };
  const h52 = Math.max(...d.highs.slice(Math.max(0, i - 252), i));
  const dist = (h52 - d.closes[i]) / h52 * 100;
  const hit = dist <= 8;
  return { hit, score: hit ? Math.round(100 - dist * 10) : 0 };
}

function p3(d, nifty, i) {
  if (i < 20) return { hit: false, score: 0 };
  const days = 15;
  const sr = (d.closes[i] - d.closes[i - days]) / d.closes[i - days] * 100;
  const ni = Math.min(i, nifty.closes.length - 1);
  const nr = (nifty.closes[ni] - nifty.closes[Math.max(0, ni - days)]) / nifty.closes[Math.max(0, ni - days)] * 100;
  const rs = sr - nr;
  const hit = rs > 3;
  return { hit, score: Math.min(100, Math.max(0, Math.round(50 + rs * 5))) };
}

function p4(d, i) {
  if (i < 25) return { hit: false, score: 0 };
  let best = { hit: false, score: 0 };
  for (let w = 3; w <= 8; w++) {
    const days = w * 5; if (i < days + 5) continue;
    const sl = d.closes.slice(i - days, i);
    const wid = (Math.max(...sl) - Math.min(...sl)) / Math.min(...sl) * 100;
    if (wid >= 4 && wid <= 20) {
      const sc = Math.round(100 - Math.abs(wid - 10) * 4);
      if (sc > best.score) best = { hit: true, score: sc };
    }
  }
  return best;
}

function p5(d, i) {
  if (i < 12) return { hit: false, score: 0 };
  const avg = d.volumes.slice(i - 10, i).reduce((a, b) => a + b, 0) / 10;
  const ratio = avg > 0 ? d.volumes[i] / avg : 1;
  const hit = ratio >= 2.0;
  return { hit, score: hit ? Math.min(100, Math.round(ratio * 25)) : 0 };
}

function composite(a, b, c, dd, e) {
  return Math.round(a.score * 0.25 + b.score * 0.20 + c.score * 0.20 + dd.score * 0.20 + e.score * 0.15);
}

function relStrength(stockData, niftyData, dayIdx, lookbackDays) {
  if (dayIdx < lookbackDays + 2) return null;
  const ni = Math.min(dayIdx, niftyData.closes.length - 1);
  const sRet = (stockData.closes[dayIdx] - stockData.closes[dayIdx - lookbackDays]) / stockData.closes[dayIdx - lookbackDays] * 100;
  const nRet = (niftyData.closes[ni] - niftyData.closes[Math.max(0, ni - lookbackDays)]) / niftyData.closes[Math.max(0, ni - lookbackDays)] * 100;
  return sRet - nRet;
}

module.exports = { p1, p2, p3, p4, p5, composite, relStrength };
