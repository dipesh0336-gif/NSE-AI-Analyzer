// FILE: pages/api/validate.js
// Two strategies: pattern scoring and momentum relative strength

const HDRS = {
  'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
  'Accept': 'application/json',
  'Referer': 'https://finance.yahoo.com',
};

const STOCKS = {
  nifty50: ["RELIANCE.NS","TCS.NS","HDFCBANK.NS","INFY.NS","ICICIBANK.NS","HINDUNILVR.NS","ITC.NS","SBIN.NS","BHARTIARTL.NS","KOTAKBANK.NS","LT.NS","ASIANPAINT.NS","AXISBANK.NS","BAJFINANCE.NS","WIPRO.NS","HCLTECH.NS","MARUTI.NS","SUNPHARMA.NS","TITAN.NS","TECHM.NS","NTPC.NS","POWERGRID.NS","ONGC.NS","COALINDIA.NS","HINDALCO.NS","TATAMOTORS.NS","TATASTEEL.NS","JSWSTEEL.NS","INDUSINDBK.NS","BAJAJ-AUTO.NS","M&M.NS","ULTRACEMCO.NS","DIVISLAB.NS","CIPLA.NS","DRREDDY.NS","EICHERMOT.NS","HEROMOTOCO.NS","GRASIM.NS","ADANIENT.NS","BPCL.NS","SBILIFE.NS","HDFCLIFE.NS","BAJAJFINSV.NS","TATACONSUM.NS","APOLLOHOSP.NS","HAVELLS.NS","BRITANNIA.NS","NESTLEIND.NS","ADANIPORTS.NS","KOTAKBANK.NS"],
  top20: ["RELIANCE.NS","TCS.NS","HDFCBANK.NS","INFY.NS","ICICIBANK.NS","SBIN.NS","BHARTIARTL.NS","LT.NS","AXISBANK.NS","BAJFINANCE.NS","MARUTI.NS","SUNPHARMA.NS","TITAN.NS","NTPC.NS","ONGC.NS","TATAMOTORS.NS","JSWSTEEL.NS","BAJAJ-AUTO.NS","M&M.NS","HCLTECH.NS"],
  midcap: ["DIXON.NS","TRENT.NS","POLYCAB.NS","VBL.NS","LAURUSLABS.NS","KPITTECH.NS","TATAELXSI.NS","PERSISTENT.NS","COFORGE.NS","RVNL.NS","IRFC.NS","PFC.NS","RECLTD.NS","IRCTC.NS","APLAPOLLO.NS","KEI.NS","RATNAMANI.NS","ASTRAL.NS","CHOLAFIN.NS","CAMS.NS"],
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

async function fetchAllStocks(stocks) {
  const allData = {};
  const batchSize = 5;
  for (let b = 0; b < stocks.length; b += batchSize) {
    const batch = stocks.slice(b, b + batchSize);
    const results = await Promise.all(batch.map(s => fetchDaily(s)));
    batch.forEach((sym, idx) => {
      if (results[idx] && results[idx].closes.length >= 60) allData[sym] = results[idx];
    });
  }
  return allData;
}

// ── PATTERN FUNCTIONS ─────────────────────────────────────────────────
function p1(d, i) {
  if (i < 20) return { hit: false, score: 0 };
  const win = 5;
  const rv = d.volumes.slice(i-win, i).reduce((a,b)=>a+b,0)/win;
  const pv = d.volumes.slice(i-win-15, i-win).reduce((a,b)=>a+b,0)/15;
  const contracted = rv < pv * 0.75;
  const closes = d.closes.slice(i-win, i);
  const rng = (Math.max(...closes)-Math.min(...closes))/Math.min(...closes)*100;
  const tight = rng < 2.5;
  return { hit: contracted && tight, score: (contracted&&tight)?100:(contracted||tight)?50:0 };
}
function p2(d, i) {
  if (i < 50) return { hit: false, score: 0 };
  const h52 = Math.max(...d.highs.slice(Math.max(0,i-252),i));
  const dist = (h52 - d.closes[i]) / h52 * 100;
  const hit = dist <= 8;
  return { hit, score: hit ? Math.round(100-dist*10) : 0 };
}
function p3(d, nifty, i) {
  if (i < 20) return { hit: false, score: 0 };
  const days = 15;
  const sr = (d.closes[i]-d.closes[i-days])/d.closes[i-days]*100;
  const ni = Math.min(i, nifty.closes.length-1);
  const nr = (nifty.closes[ni]-nifty.closes[Math.max(0,ni-days)])/nifty.closes[Math.max(0,ni-days)]*100;
  const rs = sr - nr;
  const hit = rs > 3;
  return { hit, score: Math.min(100,Math.max(0,Math.round(50+rs*5))) };
}
function p4(d, i) {
  if (i < 25) return { hit: false, score: 0 };
  let best = { hit: false, score: 0 };
  for (let w = 3; w <= 8; w++) {
    const days = w*5; if (i < days+5) continue;
    const sl = d.closes.slice(i-days,i);
    const wid = (Math.max(...sl)-Math.min(...sl))/Math.min(...sl)*100;
    if (wid >= 4 && wid <= 20) {
      const sc = Math.round(100-Math.abs(wid-10)*4);
      if (sc > best.score) best = { hit: true, score: sc };
    }
  }
  return best;
}
function p5(d, i) {
  if (i < 12) return { hit: false, score: 0 };
  const avg = d.volumes.slice(i-10,i).reduce((a,b)=>a+b,0)/10;
  const ratio = avg > 0 ? d.volumes[i]/avg : 1;
  const hit = ratio >= 2.0;
  return { hit, score: hit ? Math.min(100,Math.round(ratio*25)) : 0 };
}
function composite(a,b,c,dd,e) {
  return Math.round(a.score*0.25+b.score*0.20+c.score*0.20+dd.score*0.20+e.score*0.15);
}

// ── MOMENTUM FUNCTION ─────────────────────────────────────────────────
function relStrength(stockData, niftyData, dayIdx, lookbackDays) {
  if (dayIdx < lookbackDays + 2) return null;
  const ni = Math.min(dayIdx, niftyData.closes.length-1);
  const sRet = (stockData.closes[dayIdx]-stockData.closes[dayIdx-lookbackDays])/stockData.closes[dayIdx-lookbackDays]*100;
  const nRet = (niftyData.closes[ni]-niftyData.closes[Math.max(0,ni-lookbackDays)])/niftyData.closes[Math.max(0,ni-lookbackDays)]*100;
  return sRet - nRet;
}

export default async function handler(req, res) {
  const method = (req.query.method || 'pattern').trim();
  const universe = req.query.universe || 'top20';
  const holdDays = parseInt(req.query.hold || '10');
  const minMove = parseFloat(req.query.minMove || '5');

  const stocks = [...new Set(STOCKS[universe] || STOCKS.top20)];
  const nifty = await fetchDaily('^NSEI');
  if (!nifty) return res.status(500).json({ error: 'Failed to fetch Nifty benchmark' });

  const allData = await fetchAllStocks(stocks);
  const done = Object.keys(allData).length;
  if (done < 3) return res.status(500).json({ error: 'Not enough stock data' });

  // ── MOMENTUM PATH ─────────────────────────────────────────────────
  if (method === 'momentum') {
    const lookback = parseInt(req.query.lookback || '20');
    const topN = 5;
    const minLen = Math.min(...Object.values(allData).map(d => d.closes.length));
    const testStart = Math.max(lookback+5, minLen-100-holdDays);
    const testEnd = minLen-holdDays-1;

    let totalTrades=0, wins=0, losses=0, totalRet=0;
    const examples = [];

    for (let i = testStart; i <= testEnd; i += 5) {
      const scored = stocks
        .filter(sym => allData[sym] && allData[sym].closes.length > i+holdDays)
        .map(sym => ({
          sym,
          rs: relStrength(allData[sym], nifty, i, lookback),
          fwd: (allData[sym].closes[i+holdDays]-allData[sym].closes[i])/allData[sym].closes[i]*100,
        }))
        .filter(x => x.rs !== null)
        .sort((a,b) => b.rs - a.rs);

      if (scored.length < topN) continue;
      const picks = scored.slice(0, topN);

      picks.forEach(pick => {
        totalTrades++;
        totalRet += pick.fwd;
        const win = pick.fwd >= minMove;
        if (win) {
          wins++;
          if (examples.length < 6) examples.push({ sym: pick.sym.replace('.NS',''), rs: parseFloat(pick.rs.toFixed(1)), ret: parseFloat(pick.fwd.toFixed(1)), win: true });
        } else {
          losses++;
        }
      });
    }

    const accuracy = totalTrades > 0 ? Math.round(wins/totalTrades*100) : 0;
    const avgReturn = totalTrades > 0 ? parseFloat((totalRet/totalTrades).toFixed(1)) : 0;

    return res.status(200).json({
      method: 'momentum',
      settings: { universe, holdDays, minMove, lookback, topN },
      stocksDone: done,
      totalTrades, accuracy, avgReturn, wins, losses,
      examples,
      verdict: accuracy >= 65 ? 'BUILD' : accuracy >= 50 ? 'TUNE' : 'WEAK',
      note: 'Buy top ' + topN + ' stocks by ' + lookback + '-day RS vs Nifty, hold ' + holdDays + ' days, win = >' + minMove + '%',
    });
  }

  // ── PATTERN PATH ──────────────────────────────────────────────────
  const P = [
    { name:'Volume Contraction', desc:'5-day vol shrink + tight range <2.5%', hits:0,wins:0,losses:0,totalRet:0,examples:[] },
    { name:'Near 52-Week High',  desc:'Price within 8% of 52-week high',       hits:0,wins:0,losses:0,totalRet:0,examples:[] },
    { name:'Relative Strength',  desc:'Outperforming Nifty by >3% over 15d',   hits:0,wins:0,losses:0,totalRet:0,examples:[] },
    { name:'Base Formation',     desc:'3-8 week consolidation, 4-20% range',    hits:0,wins:0,losses:0,totalRet:0,examples:[] },
    { name:'Volume Spike',       desc:'Today volume 2x+ 10-day average',        hits:0,wins:0,losses:0,totalRet:0,examples:[] },
  ];
  const C = { hits:0, wins:0, losses:0, totalRet:0, examples:[] };

  for (const sym of stocks) {
    const d = allData[sym];
    if (!d) continue;
    const sname = sym.replace('.NS','');
    const testStart = Math.max(60, d.closes.length-120-holdDays);
    const testEnd = d.closes.length-holdDays-1;

    for (let i = testStart; i <= testEnd; i++) {
      if (i+holdDays >= d.closes.length) continue;
      const fwd = (d.closes[i+holdDays]-d.closes[i])/d.closes[i]*100;
      const win = fwd >= minMove;
      const pRes = [p1(d,i), p2(d,i), p3(d,nifty,i), p4(d,i), p5(d,i)];

      pRes.forEach((p, pi) => {
        if (p.hit) {
          P[pi].hits++; P[pi].totalRet += fwd;
          if (win) { P[pi].wins++; if (P[pi].examples.length<4) P[pi].examples.push({sym:sname,ret:parseFloat(fwd.toFixed(1)),win:true}); }
          else { P[pi].losses++; }
        }
      });

      const cs = composite(...pRes);
      if (cs >= 65) {
        C.hits++; C.totalRet += fwd;
        if (win) { C.wins++; if (C.examples.length<6) C.examples.push({sym:sname,ret:parseFloat(fwd.toFixed(1)),win:true,score:cs}); }
        else { C.losses++; }
      }
    }
  }

  const compAcc = C.hits>0 ? Math.round(C.wins/C.hits*100) : 0;
  const compAvg = C.hits>0 ? parseFloat((C.totalRet/C.hits).toFixed(1)) : 0;

  return res.status(200).json({
    method: 'pattern',
    settings: { universe, holdDays, minMove },
    stocksDone: done,
    composite: { accuracy:compAcc, hits:C.hits, wins:C.wins, losses:C.losses, avgReturn:compAvg, examples:C.examples },
    patterns: P.map(p => ({
      name: p.name, desc: p.desc,
      accuracy: p.hits>0 ? Math.round(p.wins/p.hits*100) : 0,
      hits:p.hits, wins:p.wins, losses:p.losses,
      avgReturn: p.hits>0 ? parseFloat((p.totalRet/p.hits).toFixed(1)) : 0,
      examples: p.examples,
    })),
    verdict: compAcc>=80?'BUILD':compAcc>=65?'TUNE':'REVISE',
  });
}
