// Pure scoring/signal functions extracted from pages/api/scanner.js

const NIFTY50 = new Set([
  'RELIANCE.NS','TCS.NS','HDFCBANK.NS','INFY.NS','ICICIBANK.NS','HINDUNILVR.NS','ITC.NS','SBIN.NS','BHARTIARTL.NS','KOTAKBANK.NS',
  'LT.NS','ASIANPAINT.NS','AXISBANK.NS','BAJFINANCE.NS','WIPRO.NS','HCLTECH.NS','MARUTI.NS','SUNPHARMA.NS','TITAN.NS','TECHM.NS',
  'NESTLEIND.NS','ADANIPORTS.NS','POWERGRID.NS','NTPC.NS','BAJAJ-AUTO.NS','M&M.NS','ULTRACEMCO.NS','JSWSTEEL.NS','TATAMOTORS.NS','TATASTEEL.NS',
  'INDUSINDBK.NS','DIVISLAB.NS','BRITANNIA.NS','CIPLA.NS','DRREDDY.NS','EICHERMOT.NS','HEROMOTOCO.NS','GRASIM.NS','ONGC.NS','COALINDIA.NS',
  'ADANIENT.NS','HINDALCO.NS','SBILIFE.NS','HDFCLIFE.NS','BAJAJFINSV.NS','TATACONSUM.NS','APOLLOHOSP.NS','HAVELLS.NS','BPCL.NS',
]);

const NAMES = {
  'RELIANCE.NS': 'Reliance Industries', 'TCS.NS': 'TCS', 'HDFCBANK.NS': 'HDFC Bank',
  'INFY.NS': 'Infosys', 'ICICIBANK.NS': 'ICICI Bank',
};

const SECTORS = {
  'RELIANCE.NS': 'Energy', 'TCS.NS': 'IT', 'HDFCBANK.NS': 'Banking',
  'INFY.NS': 'IT', 'ICICIBANK.NS': 'Banking',
};

function vwap(d) {
  let ct = 0, cv = 0;
  for (let i = 0; i < d.closes.length; i++) {
    const tp = (d.highs[i] + d.lows[i] + d.closes[i]) / 3;
    ct += tp * d.volumes[i];
    cv += d.volumes[i];
  }
  return cv > 0 ? ct / cv : d.closes[d.closes.length - 1];
}

function phase1Score(sym, q) {
  if (!q.price || q.price <= 0) return -1;
  const vr = q.volume / (q.avgVolume || 1);
  const dayRange = (q.dayHigh - q.dayLow) / q.prevClose * 100;
  if (dayRange < 0.2 || vr < 0.3) return -1;
  let s = 0;
  if (vr >= 3) s += 35; else if (vr >= 2) s += 25; else if (vr >= 1.5) s += 15; else if (vr >= 1.2) s += 8;
  if (Math.abs(q.changePct) > 2.5) s += 20; else if (Math.abs(q.changePct) > 1.5) s += 14; else if (Math.abs(q.changePct) > 0.8) s += 8;
  const gap = (q.open - q.prevClose) / q.prevClose * 100;
  if (Math.abs(gap) > 1.5) s += 15; else if (Math.abs(gap) > 0.7) s += 8;
  if (dayRange > 2.5) s += 12; else if (dayRange > 1.5) s += 7;
  if (NIFTY50.has(sym)) s += 8;
  if (q.price > q.prevClose * 1.008) s += 10; else if (q.price < q.prevClose * 0.992) s += 10;
  return s;
}

function analyzeORB(sym, q, d, niftyTrend, niftyChangeVal) {
  const vr = q.volume / (q.avgVolume || 1);
  let orH, orL, orConfirmed = false, breakDir = null, breakBar = null, vwapVal = null;
  let entry, stop, target;

  if (d && d.closes.length >= 3) {
    const orN = Math.min(2, d.closes.length - 1);
    orH = Math.max(...d.highs.slice(0, orN));
    orL = Math.min(...d.lows.slice(0, orN));
    vwapVal = vwap(d);
    const avgV = d.volumes.slice(0, Math.min(8, d.volumes.length)).reduce((a, b) => a + b, 0) / Math.min(8, d.volumes.length);

    for (let i = orN; i < d.closes.length; i++) {
      if (d.closes[i] > orH && d.volumes[i] > avgV * 1.1) {
        breakDir = 'LONG'; breakBar = i; orConfirmed = true; break;
      }
      if (d.closes[i] < orL && d.volumes[i] > avgV * 1.1) {
        breakDir = 'SHORT'; breakBar = i; orConfirmed = true; break;
      }
    }
  }

  let direction = 'NEUTRAL', conviction = 0, reasons = [];
  const niftyChangePct = niftyChangeVal || 0;

  if (orConfirmed && breakDir === 'LONG' && q.price > q.prevClose && niftyChangePct > -0.3) {
    direction = 'LONG';
    const bvRatio = d.volumes[breakBar] / (d.volumes.slice(0, breakBar).reduce((a, b) => a + b, 0) / Math.max(1, breakBar));
    conviction = 45;
    const bBar = breakBar || (d.closes.length - 1);
    const barRange = d.highs[bBar] - d.lows[bBar];
    const barClose = d.closes[bBar];
    const barLow = d.lows[bBar];
    const closeStrength = barRange > 0 ? (barClose - barLow) / barRange : 0.5;
    if (closeStrength >= 0.6) { conviction += 15; reasons.push('Strong breakout bar — closed in top ' + Math.round((1 - closeStrength) * 100) + '% of range'); }
    else if (closeStrength < 0.4) { conviction -= 10; reasons.push('Weak bar close — potential bull trap'); }
    if (bvRatio > 2) { conviction += 20; reasons.push('Strong volume ' + bvRatio.toFixed(1) + 'x on ORB breakout'); }
    else { conviction += 10; reasons.push('Volume confirmed ORB breakout above Rs ' + orH.toFixed(1)); }
    if (q.price > q.prevClose * 1.005) { conviction += 15; reasons.push('Above PDH Rs ' + (q.prevClose).toFixed(1) + ' - prior session bias bullish'); }
    if (vwapVal && q.price > vwapVal) { conviction += 10; reasons.push('Price above VWAP Rs ' + vwapVal.toFixed(1)); }
    if (niftyTrend === 'BULLISH') { conviction += 10; reasons.push('Nifty BULLISH — market tailwind'); }
    else if (niftyChangePct < -0.1) { conviction -= 5; reasons.push('Nifty slightly weak — reduce size'); }
    if (vr > 2) { conviction += 5; reasons.push('Day volume ' + vr.toFixed(1) + 'x avg'); }
    entry = parseFloat(q.price.toFixed(2));
    stop = parseFloat(orL.toFixed(2));
    target = parseFloat((q.price + (q.price - orL) * 2).toFixed(2));
  } else if (orConfirmed && breakDir === 'SHORT' && q.price < q.prevClose && niftyChangePct < 0.3) {
    direction = 'SHORT';
    const bvRatioS = d.volumes[breakBar] / (d.volumes.slice(0, breakBar).reduce((a, b) => a + b, 0) / Math.max(1, breakBar));
    conviction = 45;
    const bBarS = breakBar || (d.closes.length - 1);
    const barRangeS = d.highs[bBarS] - d.lows[bBarS];
    const closeStrengthS = barRangeS > 0 ? (d.closes[bBarS] - d.lows[bBarS]) / barRangeS : 0.5;
    if (closeStrengthS <= 0.4) { conviction += 15; reasons.push('Strong breakdown bar — closed in bottom ' + Math.round(closeStrengthS * 100) + '% of range'); }
    else if (closeStrengthS > 0.6) { conviction -= 10; reasons.push('Weak bar close — potential bear trap'); }
    if (bvRatioS > 2) { conviction += 20; reasons.push('Strong volume ' + bvRatioS.toFixed(1) + 'x on breakdown'); }
    else { conviction += 10; reasons.push('Volume confirmed breakdown below Rs ' + orL.toFixed(1)); }
    if (q.price < q.prevClose * 0.995) { conviction += 15; reasons.push('Below PDL — prior session bias bearish'); }
    if (vwapVal && q.price < vwapVal) { conviction += 10; reasons.push('Price below VWAP Rs ' + vwapVal.toFixed(1)); }
    if (niftyTrend === 'BEARISH') { conviction += 10; reasons.push('Nifty BEARISH — market tailwind for short'); }
    else if (niftyChangePct > 0.1) { conviction -= 5; reasons.push('Nifty slightly strong — cover quickly'); }
    if (vr > 2) { conviction += 5; reasons.push('Day volume ' + vr.toFixed(1) + 'x avg'); }
    entry = parseFloat(q.price.toFixed(2));
    stop = parseFloat(orH.toFixed(2));
    target = parseFloat((q.price - (orH - q.price) * 2).toFixed(2));
  } else if (!orConfirmed) {
    const abovePDC = q.price > q.prevClose;
    const strongVol = vr > 1.5;
    const strongMove = Math.abs(q.changePct) > 0.8;
    if (abovePDC && strongVol && strongMove && q.changePct > 0) {
      direction = 'WATCH_LONG';
      conviction = Math.min(40, Math.round(vr * 8 + q.changePct * 4));
      reasons.push('Building bullish setup - Rs ' + q.price.toFixed(1) + ' up ' + q.changePct.toFixed(2) + '%');
      reasons.push('Volume ' + vr.toFixed(1) + 'x avg - accumulation in progress');
      if (orH) reasons.push('Watch: break above Rs ' + orH.toFixed(1) + ' with volume for LONG entry');
    } else if (!abovePDC && strongVol && strongMove && q.changePct < 0) {
      direction = 'WATCH_SHORT';
      conviction = Math.min(40, Math.round(vr * 8 + Math.abs(q.changePct) * 4));
      reasons.push('Building bearish setup - Rs ' + q.price.toFixed(1) + ' down ' + q.changePct.toFixed(2) + '%');
      reasons.push('Volume ' + vr.toFixed(1) + 'x avg - distribution in progress');
      if (orL) reasons.push('Watch: break below Rs ' + orL.toFixed(1) + ' with volume for SHORT entry');
    }
  }

  if (direction === 'NEUTRAL') {
    const pctMove = Math.abs(q.changePct || 0);
    if (pctMove > 0.4 && orH && orL) {
      conviction = Math.min(30, Math.round(pctMove * 10));
      reasons.push('Price moved ' + pctMove.toFixed(2) + '% - watch for ORB at Rs ' + (q.changePct > 0 ? orH.toFixed(1) : orL.toFixed(1)));
    } else {
      return null;
    }
  }

  const rrRatio = entry && stop && target ? Math.abs((target - entry) / (entry - stop)) : null;

  return {
    symbol: sym.replace('.NS', ''),
    name: NAMES[sym] || sym.replace('.NS', ''),
    sector: SECTORS[sym] || 'Other',
    direction,
    conviction: Math.min(conviction, 100),
    price: parseFloat(q.price.toFixed(2)),
    change: parseFloat(q.changePct.toFixed(2)),
    entry, stop, target,
    pdc: parseFloat(q.prevClose.toFixed(2)),
    orHigh: orH ? parseFloat(orH.toFixed(2)) : null,
    orLow: orL ? parseFloat(orL.toFixed(2)) : null,
    vwap: vwapVal ? parseFloat(vwapVal.toFixed(2)) : null,
    volRatio: parseFloat(vr.toFixed(1)),
    rr: rrRatio ? parseFloat(rrRatio.toFixed(1)) : null,
    reasons: reasons.slice(0, 3),
    isNifty50: NIFTY50.has(sym),
  };
}

module.exports = { vwap, phase1Score, analyzeORB, NIFTY50 };
