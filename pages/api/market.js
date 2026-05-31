// FILE: pages/api/market.js
// ORB + Previous Day Levels strategy
// Fetches daily + intraday in parallel, computes PDH/PDL/PDC/CPR/OR/VWAP

const { computeVwap, computeCPR, getNiftyTrend } = require('../../lib/orbLogic');

const HDRS = {
  'User-Agent':'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
  'Accept':'application/json','Referer':'https://finance.yahoo.com',
};

async function fetchYahoo(sym, interval, range) {
  const iMap = {'15min':'15m','5min':'5m','30min':'30m','1h':'60m'};
  const yh = iMap[interval] || '15m';
  const r = await fetch(
    'https://query1.finance.yahoo.com/v8/finance/chart/'+encodeURIComponent(sym)+'?interval='+yh+'&range='+(range||'1d'),
    { headers: HDRS }
  );
  if (!r.ok) throw new Error('Yahoo Finance '+r.status+' for '+sym);
  const j = await r.json();
  const res = j?.chart?.result?.[0];
  if (!res) throw new Error('No data for '+sym);
  const ts = res.timestamps || res.timestamp;
  const q = res.indicators.quote[0];
  const vi = ts.map((_,i)=>i).filter(i=>q.close[i]!=null&&q.open[i]!=null&&q.high[i]!=null&&q.low[i]!=null);
  return {
    ts: vi.map(i=>ts[i]), opens: vi.map(i=>q.open[i]), highs: vi.map(i=>q.high[i]),
    lows: vi.map(i=>q.low[i]), closes: vi.map(i=>q.close[i]), volumes: vi.map(i=>q.volume[i]||0),
  };
}


export default async function handler(req, res) {
  const { symbol, type='stock', interval='15min' } = req.query;
  if (!symbol) return res.status(400).json({ error: 'Symbol required' });

  // Convert to Yahoo format
  const indexMap = {
    'NIFTY':'^NSEI','BANKNIFTY':'^NSEBANK','NIFTY IT':'^CNXIT','NIFTY AUTO':'^CNXAUTO',
    'NIFTY PHARMA':'^CNXPHARMA','NIFTY MIDCAP 50':'^CNXMIDCAP','NIFTY FMCG':'^CNXFMCG','NIFTY METAL':'^CNXMETAL',
  };
  const yhSym = type === 'index' ? (indexMap[symbol] || '^'+symbol) : symbol+'.NS';
  const isNifty = type === 'index' && symbol === 'NIFTY';

  try {
    // Fetch intraday + daily (for PDH/PDL) + Nifty trend — all in parallel
    const [intraday, daily, niftyIntraday] = await Promise.all([
      fetchYahoo(yhSym, interval, interval === '5min' ? '2d' : '1d'),
      fetchYahoo(yhSym, '1d', '5d'),  // for PDH/PDL/PDC
      isNifty ? Promise.resolve(null) : fetchYahoo('^NSEI', '15min', '1d'),
    ]);

    if (intraday.closes.length < 3) throw new Error('Not enough intraday bars. Try during NSE hours 09:15-15:30 IST.');

    // ── PREVIOUS DAY LEVELS ──────────────────────────────────────
    const pdh = daily.closes.length >= 2 ? daily.highs[daily.closes.length - 2] : daily.highs[0];
    const pdl = daily.closes.length >= 2 ? daily.lows[daily.closes.length - 2] : daily.lows[0];
    const pdc = daily.closes.length >= 2 ? daily.closes[daily.closes.length - 2] : daily.closes[0];
    const cpr = computeCPR(pdh, pdl, pdc);

    // ── OPENING RANGE ────────────────────────────────────────────
    // Filter to today's bars only (after 9:00am IST)
    const nowTs = Date.now() / 1000;
    const todayStart = nowTs - 8 * 3600; // last 8 hours
    const todayBars = intraday.ts.map((_,i)=>i).filter(i => intraday.ts[i] > todayStart);
    const orN = Math.min(2, todayBars.length > 0 ? todayBars.length : 2);
    const orIdxs = todayBars.length > 0 ? todayBars.slice(0, orN) : [0, 1];
    const orHigh = Math.max(...orIdxs.map(i => intraday.highs[i]));
    const orLow = Math.min(...orIdxs.map(i => intraday.lows[i]));
    const orRange = orHigh - orLow;
    const orRangePct = (orRange / pdc) * 100;

    // ── VWAP ─────────────────────────────────────────────────────
    const todayD = {
      closes: orIdxs.map(i=>intraday.closes[i]).concat(
        todayBars.slice(orN).map(i=>intraday.closes[i])
      ),
      highs: orIdxs.map(i=>intraday.highs[i]).concat(todayBars.slice(orN).map(i=>intraday.highs[i])),
      lows: orIdxs.map(i=>intraday.lows[i]).concat(todayBars.slice(orN).map(i=>intraday.lows[i])),
      volumes: orIdxs.map(i=>intraday.volumes[i]).concat(todayBars.slice(orN).map(i=>intraday.volumes[i])),
    };
    const vwapVal = todayD.closes.length > 0 ? computeVwap(todayD) : computeVwap(intraday);

    // ── CURRENT PRICE & SIGNAL ───────────────────────────────────
    const price = intraday.closes[intraday.closes.length - 1];
    const prevBarClose = intraday.closes[intraday.closes.length - 2] || price;
    const barChange = (price - prevBarClose) / prevBarClose * 100;
    const avgVol = intraday.volumes.slice(-10).reduce((a,b)=>a+b,0) / Math.min(10, intraday.volumes.length);
    const lastVol = intraday.volumes[intraday.volumes.length - 1];
    const volRatio = avgVol > 0 ? lastVol / avgVol : 1;

    // ── ORB SIGNAL ───────────────────────────────────────────────
    let orbSignal = 'NEUTRAL', orbReason = '';
    let entry = null, stop = null, target = null;

    // Check if breakout happened
    const priceAboveOR = price > orHigh;
    const priceBelowOR = price < orLow;
    const volConfirmed = volRatio >= 1.3;
    const priceAbovePDC = price > pdc;
    const priceBelowPDC = price < pdc;
    const orNotTooWide = orRangePct < 1.5; // skip if OR too wide (news event)

    if (priceAboveOR && volConfirmed && priceAbovePDC && orNotTooWide) {
      orbSignal = 'LONG';
      orbReason = 'Price broke above OR High Rs '+orHigh.toFixed(1)+' with volume '+volRatio.toFixed(1)+'x avg and above PDC Rs '+pdc.toFixed(1);
      entry = price;
      stop = orLow;
      target = price + (price - orLow) * 2;
    } else if (priceBelowOR && volConfirmed && priceBelowPDC && orNotTooWide) {
      orbSignal = 'SHORT';
      orbReason = 'Price broke below OR Low Rs '+orLow.toFixed(1)+' with volume '+volRatio.toFixed(1)+'x avg and below PDC Rs '+pdc.toFixed(1);
      entry = price;
      stop = orHigh;
      target = price - (orHigh - price) * 2;
    } else if (price >= orLow && price <= orHigh) {
      orbReason = 'Price inside Opening Range Rs '+orLow.toFixed(1)+' - Rs '+orHigh.toFixed(1)+'. Wait for breakout with volume.';
    } else if (priceAboveOR && !volConfirmed) {
      orbReason = 'Above OR High but volume only '+volRatio.toFixed(1)+'x avg — weak breakout. Wait for volume confirmation.';
    } else if (priceBelowOR && !volConfirmed) {
      orbReason = 'Below OR Low but volume only '+volRatio.toFixed(1)+'x avg — weak breakdown. Wait for volume confirmation.';
    } else if (!orNotTooWide) {
      orbReason = 'OR range '+orRangePct.toFixed(2)+'% is too wide — likely news/event driven. Avoid trading today.';
    }

    // ── NIFTY TREND ──────────────────────────────────────────────
    const niftyTrend = isNifty ? getNiftyTrend(intraday) : getNiftyTrend(niftyIntraday);

    // Nifty veto
    if (orbSignal === 'LONG' && niftyTrend.trend === 'BEARISH') {
      orbSignal = 'WATCH_LONG';
      orbReason += ' — CAUTION: Nifty is bearish. Counter-trend long. Reduce size.';
    }
    if (orbSignal === 'SHORT' && niftyTrend.trend === 'BULLISH') {
      orbSignal = 'WATCH_SHORT';
      orbReason += ' — CAUTION: Nifty is bullish. Counter-trend short. Reduce size.';
    }

    // ── DISTANCE TO KEY LEVELS ───────────────────────────────────
    const levels = [
      { name: 'PDH', price: pdh, type: 'resistance', distance: ((pdh - price) / price * 100) },
      { name: 'PDL', price: pdl, type: 'support', distance: ((pdl - price) / price * 100) },
      { name: 'PDC', price: pdc, type: 'pivot', distance: ((pdc - price) / price * 100) },
      { name: 'OR High', price: orHigh, type: 'or', distance: ((orHigh - price) / price * 100) },
      { name: 'OR Low', price: orLow, type: 'or', distance: ((orLow - price) / price * 100) },
      { name: 'VWAP', price: vwapVal, type: 'vwap', distance: ((vwapVal - price) / price * 100) },
      { name: 'CPR Top', price: cpr.tc, type: 'cpr', distance: ((cpr.tc - price) / price * 100) },
      { name: 'CPR Bot', price: cpr.bc, type: 'cpr', distance: ((cpr.bc - price) / price * 100) },
    ].map(l => ({ ...l, price: parseFloat(l.price.toFixed(2)), distance: parseFloat(l.distance.toFixed(3)) }))
     .sort((a, b) => Math.abs(a.distance) - Math.abs(b.distance));

    res.status(200).json({
      // Price data
      price: parseFloat(price.toFixed(2)),
      change: parseFloat(barChange.toFixed(3)),
      volRatio: parseFloat(volRatio.toFixed(2)),
      lastVol,

      // Key levels
      pdh: parseFloat(pdh.toFixed(2)),
      pdl: parseFloat(pdl.toFixed(2)),
      pdc: parseFloat(pdc.toFixed(2)),
      orHigh: parseFloat(orHigh.toFixed(2)),
      orLow: parseFloat(orLow.toFixed(2)),
      orRangePct: parseFloat(orRangePct.toFixed(3)),
      vwap: parseFloat(vwapVal.toFixed(2)),
      cpr,
      levels,

      // Signal
      signal: orbSignal,
      reason: orbReason,
      entry: entry ? parseFloat(entry.toFixed(2)) : null,
      stop: stop ? parseFloat(stop.toFixed(2)) : null,
      target: target ? parseFloat(target.toFixed(2)) : null,
      rr: entry && stop && target ? parseFloat(Math.abs((target-entry)/(entry-stop)).toFixed(1)) : null,

      // Market context
      niftyTrend,

      // Raw bars for chart
      bars: {
        ts: intraday.ts.slice(-24),
        opens: intraday.opens.slice(-24).map(v=>parseFloat(v.toFixed(2))),
        highs: intraday.highs.slice(-24).map(v=>parseFloat(v.toFixed(2))),
        lows: intraday.lows.slice(-24).map(v=>parseFloat(v.toFixed(2))),
        closes: intraday.closes.slice(-24).map(v=>parseFloat(v.toFixed(2))),
        volumes: intraday.volumes.slice(-24),
      },
    });

  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}
