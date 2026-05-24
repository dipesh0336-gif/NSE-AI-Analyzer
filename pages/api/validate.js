// FILE: pages/api/validate.js
// Runs pattern validation server-side - no CORS issues

const HDRS = {
  'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
  'Accept': 'application/json',
  'Referer': 'https://finance.yahoo.com',
};

async function fetchDaily(sym) {
  try {
    const r = await fetch(
      'https://query1.finance.yahoo.com/v8/finance/chart/' + encodeURIComponent(sym) + '?interval=1d&range=1y',
      { headers: HDRS }
    );
    if (!r.ok) return null;
    const j = await r.json();
    const res = j?.chart?.result?.[0];
    if (!res) return null;
    const ts = res.timestamps || res.timestamp;
    const q = res.indicators.quote[0];
    const vi = ts.map((_,i) => i).filter(i => q.close[i] != null && q.high[i] != null && q.low[i] != null && q.volume[i] != null);
    return {
      closes:  vi.map(i => q.close[i]),
      highs:   vi.map(i => q.high[i]),
      lows:    vi.map(i => q.low[i]),
      volumes: vi.map(i => q.volume[i] || 0),
    };
  } catch(e) { return null; }
}

function p1_volContraction(d, i) {
  if (i < 20) return { hit: false, score: 0 };
  const win = 5;
  const recVol = d.volumes.slice(i-win, i).reduce((a,b) => a+b, 0) / win;
  const prVol  = d.volumes.slice(i-win-15, i-win).reduce((a,b) => a+b, 0) / 15;
  const contracted = recVol < prVol * 0.75;
  const closes = d.closes.slice(i-win, i);
  const rng = (Math.max(...closes) - Math.min(...closes)) / Math.min(...closes) * 100;
  const tight = rng < 2.5;
  return { hit: contracted && tight, score: (contracted && tight) ? 100 : (contracted || tight) ? 50 : 0 };
}

function p2_near52High(d, i) {
  if (i < 50) return { hit: false, score: 0 };
  const high52 = Math.max(...d.highs.slice(Math.max(0, i-252), i));
  const price  = d.closes[i];
  const dist   = (high52 - price) / high52 * 100;
  const hit    = dist <= 8;
  return { hit, score: hit ? Math.round(100 - dist * 10) : 0, dist: dist.toFixed(1) };
}

function p3_relStrength(d, nifty, i) {
  if (i < 20) return { hit: false, score: 0 };
  const days = 15;
  const sRet = (d.closes[i] - d.closes[i-days]) / d.closes[i-days] * 100;
  const nIdx = Math.min(i, nifty.closes.length - 1);
  const nRet = (nifty.closes[nIdx] - nifty.closes[Math.max(0, nIdx-days)]) / nifty.closes[Math.max(0, nIdx-days)] * 100;
  const rs = sRet - nRet;
  const hit = rs > 3;
  return { hit, score: Math.min(100, Math.max(0, Math.round(50 + rs * 5))), rs: rs.toFixed(1) };
}

function p4_base(d, i) {
  if (i < 25) return { hit: false, score: 0 };
  let best = { hit: false, score: 0, weeks: 0 };
  for (let w = 3; w <= 8; w++) {
    const days = w * 5;
    if (i < days + 5) continue;
    const slice = d.closes.slice(i-days, i);
    const hi = Math.max(...slice), lo = Math.min(...slice);
    const width = (hi - lo) / lo * 100;
    if (width >= 4 && width <= 20) {
      const score = Math.round(100 - Math.abs(width - 10) * 4);
      if (score > best.score) best = { hit: true, score, weeks: w };
    }
  }
  return best;
}

function p5_volSpike(d, i) {
  if (i < 12) return { hit: false, score: 0 };
  const avg   = d.volumes.slice(i-10, i).reduce((a,b) => a+b, 0) / 10;
  const today = d.volumes[i];
  const ratio = avg > 0 ? today / avg : 1;
  const hit   = ratio >= 2.0;
  return { hit, score: hit ? Math.min(100, Math.round(ratio * 25)) : 0, ratio: ratio.toFixed(1) };
}

function compositeScore(p1, p2, p3, p4, p5) {
  return Math.round(p1.score*0.25 + p2.score*0.20 + p3.score*0.20 + p4.score*0.20 + p5.score*0.15);
}

const STOCKS = {
  nifty50: ["RELIANCE.NS","TCS.NS","HDFCBANK.NS","INFY.NS","ICICIBANK.NS","HINDUNILVR.NS","ITC.NS","SBIN.NS","BHARTIARTL.NS","KOTAKBANK.NS","LT.NS","ASIANPAINT.NS","AXISBANK.NS","BAJFINANCE.NS","WIPRO.NS","HCLTECH.NS","MARUTI.NS","SUNPHARMA.NS","TITAN.NS","TECHM.NS","NTPC.NS","POWERGRID.NS","ONGC.NS","COALINDIA.NS","HINDALCO.NS","TATAMOTORS.NS","TATASTEEL.NS","JSWSTEEL.NS","INDUSINDBK.NS","BAJAJ-AUTO.NS","M&M.NS","ULTRACEMCO.NS","DIVISLAB.NS","CIPLA.NS","DRREDDY.NS","EICHERMOT.NS","HEROMOTOCO.NS","GRASIM.NS","ADANIENT.NS","BPCL.NS","SBILIFE.NS","HDFCLIFE.NS","BAJAJFINSV.NS","TATACONSUM.NS","APOLLOHOSP.NS","HAVELLS.NS","BRITANNIA.NS","NESTLEIND.NS","ADANIPORTS.NS","KOTAKBANK.NS"],
  top20: ["RELIANCE.NS","TCS.NS","HDFCBANK.NS","INFY.NS","ICICIBANK.NS","SBIN.NS","BHARTIARTL.NS","LT.NS","AXISBANK.NS","BAJFINANCE.NS","MARUTI.NS","SUNPHARMA.NS","TITAN.NS","NTPC.NS","ONGC.NS","TATAMOTORS.NS","JSWSTEEL.NS","BAJAJ-AUTO.NS","M&M.NS","HCLTECH.NS"],
  midcap: ["DIXON.NS","TRENT.NS","POLYCAB.NS","VBL.NS","LAURUSLABS.NS","KPITTECH.NS","TATAELXSI.NS","PERSISTENT.NS","COFORGE.NS","RVNL.NS","IRFC.NS","PFC.NS","RECLTD.NS","IRCTC.NS","APLAPOLLO.NS","KEI.NS","RATNAMANI.NS","ASTRAL.NS","CHOLAFIN.NS","CAMS.NS"],
};

// ── MOMENTUM APPROACH ────────────────────────────────────────────────
// Rank stocks by relative strength vs Nifty over lookback window
// Buy top N, check forward return. Simple, proven, academic backing.

function momentumScore(stockData, niftyData, dayIdx, lookbackDays) {
  if (dayIdx < lookbackDays + 2) return null;
  const nIdx = Math.min(dayIdx, niftyData.closes.length - 1);
  const nStart = Math.max(0, nIdx - lookbackDays);
  const stockRet = (stockData.closes[dayIdx] - stockData.closes[dayIdx - lookbackDays]) / stockData.closes[dayIdx - lookbackDays] * 100;
  const niftyRet = (niftyData.closes[nIdx] - niftyData.closes[nStart]) / niftyData.closes[nStart] * 100;
  return stockRet - niftyRet; // relative strength vs Nifty
}

export default async function handler(req, res) {
  const method = (req.query.method || 'pattern').trim().toLowerCase();
  console.log('Validate API called with method:', method, 'query:', JSON.stringify(req.query));
  if (method === 'momentum') {
    console.log('Routing to momentum handler');
    return handleMomentum(req, res);
  }
  console.log('Routing to pattern handler');
  return handlePattern(req, res);
}

async function handleMomentum(req, res) {
  const universe  = req.query.universe  || 'top20';
  const holdDays  = parseInt(req.query.hold    || '10');
  const minMovePct = parseFloat(req.query.minMove || '3');
  const lookback  = parseInt(req.query.lookback || '20'); // RS lookback window
  const topN      = parseInt(req.query.topN     || '5');  // buy top N stocks

  const stocks = [...new Set(STOCKS[universe] || STOCKS.top20)];

  const nifty = await fetchDaily('^NSEI');
  if (!nifty) return res.status(500).json({ error: 'Failed to fetch Nifty' });

  // Fetch all stock data in parallel batches
  const allData = {};
  const batchSize = 5;
  for (let b = 0; b < stocks.length; b += batchSize) {
    const batch = stocks.slice(b, b + batchSize);
    const results = await Promise.all(batch.map(s => fetchDaily(s)));
    batch.forEach((sym, idx) => { if (results[idx] && results[idx].closes.length >= 60) allData[sym] = results[idx]; });
  }

  const done = Object.keys(allData).length;
  if (done < 5) return res.status(500).json({ error: 'Not enough stock data fetched' });

  // Walk forward: every week, rank stocks by momentum, buy top N, check forward return
  const minLen = Math.min(...Object.values(allData).map(d => d.closes.length));
  const testStart = Math.max(lookback + 5, minLen - 100 - holdDays);
  const testEnd   = minLen - holdDays - 1;

  let totalTrades = 0, wins = 0, losses = 0, totalRet = 0;
  const examples = [];
  const weeklyResults = [];

  // Test every 5 trading days (weekly rebalance)
  for (let i = testStart; i <= testEnd; i += 5) {
    // Rank all stocks by momentum score at this point in time
    const scored = stocks
      .filter(sym => allData[sym] && allData[sym].closes.length > i + holdDays)
      .map(sym => ({
        sym,
        rs: momentumScore(allData[sym], nifty, i, lookback),
        fwd: (allData[sym].closes[i + holdDays] - allData[sym].closes[i]) / allData[sym].closes[i] * 100,
      }))
      .filter(x => x.rs !== null)
      .sort((a, b) => b.rs - a.rs);

    if (scored.length < topN) continue;

    // Buy top N momentum stocks
    const topPicks = scored.slice(0, topN);
    const bottomN  = scored.slice(-topN); // for comparison

    topPicks.forEach(pick => {
      totalTrades++;
      totalRet += pick.fwd;
      const win = pick.fwd >= minMovePct;
      if (win) { wins++; if (examples.length < 8) examples.push({ sym: pick.sym.replace('.NS',''), rs: pick.rs.toFixed(1), ret: pick.fwd.toFixed(1), win: true }); }
      else { losses++; if (examples.length < 8 && Math.random() < 0.3) examples.push({ sym: pick.sym.replace('.NS',''), rs: pick.rs.toFixed(1), ret: pick.fwd.toFixed(1), win: false }); }
    });

    // Track weekly result for display
    const avgTopRet = topPicks.reduce((a, b) => a + b.fwd, 0) / topPicks.length;
    const avgBotRet = bottomN.reduce((a, b) => a + b.fwd, 0) / bottomN.length;
    weeklyResults.push({
      dayIdx: i,
      topPicks: topPicks.slice(0, 3).map(p => p.sym.replace('.NS','')),
      avgTopRet: parseFloat(avgTopRet.toFixed(1)),
      avgBotRet: parseFloat(avgBotRet.toFixed(1)),
      spread: parseFloat((avgTopRet - avgBotRet).toFixed(1)),
    });
  }

  const accuracy    = totalTrades > 0 ? Math.round(wins / totalTrades * 100) : 0;
  const avgReturn   = totalTrades > 0 ? parseFloat((totalRet / totalTrades).toFixed(1)) : 0;
  const avgSpread   = weeklyResults.length > 0 ? parseFloat((weeklyResults.reduce((a,b)=>a+b.spread,0)/weeklyResults.length).toFixed(1)) : 0;
  const verdict     = accuracy >= 80 ? 'BUILD' : accuracy >= 65 ? 'TUNE' : 'REVISE';

  res.status(200).json({
    method: 'momentum',
    debug: 'momentum_handler_ran',
    settings: { universe, holdDays, minMovePct, lookback, topN },
    stocksDone: done,
    totalTrades,
    accuracy,
    avgReturn,
    wins, losses,
    avgSpread, // avg outperformance of top vs bottom quintile
    weeklyResults: weeklyResults.slice(-10),
    examples,
    verdict,
    note: 'Momentum: buy top ' + topN + ' stocks by ' + lookback + '-day RS vs Nifty, hold ' + holdDays + ' days, rebalance weekly',
  });
}

async function handlePattern(req, res) {
  const universe  = req.query.universe  || 'top20';
  const holdDays  = parseInt(req.query.hold || '10');
  const minMovePct = parseFloat(req.query.minMove || '5');

  const stocks = [...new Set(STOCKS[universe] || STOCKS.top20)];

  // Fetch Nifty benchmark
  const nifty = await fetchDaily('^NSEI');
  if (!nifty) return res.status(500).json({ error: 'Failed to fetch Nifty benchmark' });

  const P = [
    { name: 'Volume Contraction', desc: '5-day vol shrink + tight range <2.5%',       hits:0, wins:0, losses:0, totalRet:0, examples:[] },
    { name: 'Near 52-Week High',  desc: 'Price within 8% of 52-week high',              hits:0, wins:0, losses:0, totalRet:0, examples:[] },
    { name: 'Relative Strength',  desc: 'Outperforming Nifty by >3% over 15 days',     hits:0, wins:0, losses:0, totalRet:0, examples:[] },
    { name: 'Base Formation',     desc: '3-8 week consolidation, 4-20% range width',   hits:0, wins:0, losses:0, totalRet:0, examples:[] },
    { name: 'Volume Spike',       desc: 'Today volume 2x+ the 10-day average',         hits:0, wins:0, losses:0, totalRet:0, examples:[] },
  ];
  const C = { hits:0, wins:0, losses:0, totalRet:0, examples:[] };
  let done = 0, failed = 0;

  // Fetch all stocks in parallel batches of 5
  const batchSize = 5;
  for (let b = 0; b < stocks.length; b += batchSize) {
    const batch = stocks.slice(b, b + batchSize);
    const results = await Promise.all(batch.map(s => fetchDaily(s)));

    batch.forEach((sym, idx) => {
      const d = results[idx];
      if (!d || d.closes.length < 80) { failed++; return; }
      done++;
      const sname = sym.replace('.NS','');
      const testStart = Math.max(60, d.closes.length - 120 - holdDays);
      const testEnd   = d.closes.length - holdDays - 1;

      for (let i = testStart; i <= testEnd; i++) {
        if (i + holdDays >= d.closes.length) continue;
        const fwd = (d.closes[i + holdDays] - d.closes[i]) / d.closes[i] * 100;
        const win = fwd >= minMovePct;

        const pRes = [
          p1_volContraction(d, i),
          p2_near52High(d, i),
          p3_relStrength(d, nifty, i),
          p4_base(d, i),
          p5_volSpike(d, i),
        ];

        pRes.forEach((p, pi) => {
          if (p.hit) {
            P[pi].hits++;
            P[pi].totalRet += fwd;
            if (win) { P[pi].wins++; if (P[pi].examples.length < 4) P[pi].examples.push({ sym: sname, ret: parseFloat(fwd.toFixed(1)), win: true }); }
            else { P[pi].losses++; }
          }
        });

        const cs = compositeScore(...pRes);
        if (cs >= 65) {
          C.hits++; C.totalRet += fwd;
          if (win) { C.wins++; if (C.examples.length < 8) C.examples.push({ sym: sname, ret: parseFloat(fwd.toFixed(1)), win: true, score: cs }); }
          else { C.losses++; if (C.examples.length < 8 && Math.random() < 0.2) C.examples.push({ sym: sname, ret: parseFloat(fwd.toFixed(1)), win: false, score: cs }); }
        }
      }
    });
  }

  const compAcc    = C.hits > 0 ? Math.round(C.wins / C.hits * 100) : 0;
  const compAvgRet = C.hits > 0 ? parseFloat((C.totalRet / C.hits).toFixed(1)) : 0;

  res.status(200).json({
    settings: { universe, holdDays, minMovePct },
    stocksDone: done, stocksFailed: failed,
    composite: { accuracy: compAcc, hits: C.hits, wins: C.wins, losses: C.losses, avgReturn: compAvgRet, examples: C.examples },
    patterns: P.map(p => ({
      name: p.name, desc: p.desc,
      accuracy: p.hits > 0 ? Math.round(p.wins / p.hits * 100) : 0,
      hits: p.hits, wins: p.wins, losses: p.losses,
      avgReturn: p.hits > 0 ? parseFloat((p.totalRet / p.hits).toFixed(1)) : 0,
      examples: p.examples,
    })),
    verdict: compAcc >= 80 ? 'BUILD' : compAcc >= 65 ? 'TUNE' : 'REVISE',
  });
}
}
