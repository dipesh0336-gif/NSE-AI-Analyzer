// FILE: pages/api/nifty50-analysis.js
// Batch-analyses all Nifty 50 stocks: pattern backtest + RS ranking

const { p1, p2, p3, p4, p5, composite, relStrength } = require('../../lib/patterns');

const HDRS = {
  'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
  'Accept': 'application/json',
  'Referer': 'https://finance.yahoo.com',
};

const NIFTY50_STOCKS = [
  {sym:'RELIANCE.NS',  name:'Reliance Industries',  sector:'Energy'},
  {sym:'TCS.NS',       name:'TCS',                  sector:'IT'},
  {sym:'HDFCBANK.NS',  name:'HDFC Bank',             sector:'Banking'},
  {sym:'INFY.NS',      name:'Infosys',               sector:'IT'},
  {sym:'ICICIBANK.NS', name:'ICICI Bank',             sector:'Banking'},
  {sym:'HINDUNILVR.NS',name:'Hindustan Unilever',    sector:'FMCG'},
  {sym:'ITC.NS',       name:'ITC',                   sector:'FMCG'},
  {sym:'SBIN.NS',      name:'SBI',                   sector:'Banking'},
  {sym:'BHARTIARTL.NS',name:'Bharti Airtel',         sector:'Telecom'},
  {sym:'KOTAKBANK.NS', name:'Kotak Bank',             sector:'Banking'},
  {sym:'LT.NS',        name:'Larsen & Toubro',        sector:'Infra'},
  {sym:'ASIANPAINT.NS',name:'Asian Paints',           sector:'Paints'},
  {sym:'AXISBANK.NS',  name:'Axis Bank',              sector:'Banking'},
  {sym:'BAJFINANCE.NS',name:'Bajaj Finance',          sector:'NBFC'},
  {sym:'WIPRO.NS',     name:'Wipro',                  sector:'IT'},
  {sym:'HCLTECH.NS',   name:'HCL Technologies',       sector:'IT'},
  {sym:'MARUTI.NS',    name:'Maruti Suzuki',           sector:'Auto'},
  {sym:'SUNPHARMA.NS', name:'Sun Pharma',              sector:'Pharma'},
  {sym:'TITAN.NS',     name:'Titan Company',           sector:'Jewellery'},
  {sym:'TECHM.NS',     name:'Tech Mahindra',           sector:'IT'},
  {sym:'NTPC.NS',      name:'NTPC',                   sector:'Power'},
  {sym:'POWERGRID.NS', name:'Power Grid',              sector:'Power'},
  {sym:'ONGC.NS',      name:'ONGC',                   sector:'Energy'},
  {sym:'COALINDIA.NS', name:'Coal India',              sector:'Mining'},
  {sym:'HINDALCO.NS',  name:'Hindalco',               sector:'Metals'},
  {sym:'TATAMOTORS.NS',name:'Tata Motors',             sector:'Auto'},
  {sym:'TATASTEEL.NS', name:'Tata Steel',              sector:'Steel'},
  {sym:'JSWSTEEL.NS',  name:'JSW Steel',               sector:'Steel'},
  {sym:'INDUSINDBK.NS',name:'IndusInd Bank',           sector:'Banking'},
  {sym:'BAJAJ-AUTO.NS',name:'Bajaj Auto',              sector:'Auto'},
  {sym:'M&M.NS',       name:'Mahindra & Mahindra',     sector:'Auto'},
  {sym:'ULTRACEMCO.NS',name:'UltraTech Cement',        sector:'Cement'},
  {sym:'DIVISLAB.NS',  name:'Divi Labs',               sector:'Pharma'},
  {sym:'CIPLA.NS',     name:'Cipla',                   sector:'Pharma'},
  {sym:'DRREDDY.NS',   name:'Dr Reddys',               sector:'Pharma'},
  {sym:'EICHERMOT.NS', name:'Eicher Motors',            sector:'Auto'},
  {sym:'HEROMOTOCO.NS',name:'Hero MotoCorp',            sector:'Auto'},
  {sym:'GRASIM.NS',    name:'Grasim Industries',        sector:'Diversified'},
  {sym:'ADANIENT.NS',  name:'Adani Enterprises',        sector:'Diversified'},
  {sym:'BPCL.NS',      name:'BPCL',                    sector:'Energy'},
  {sym:'SBILIFE.NS',   name:'SBI Life Insurance',       sector:'Insurance'},
  {sym:'HDFCLIFE.NS',  name:'HDFC Life Insurance',      sector:'Insurance'},
  {sym:'BAJAJFINSV.NS',name:'Bajaj Finserv',            sector:'Finance'},
  {sym:'TATACONSUM.NS',name:'Tata Consumer',            sector:'FMCG'},
  {sym:'APOLLOHOSP.NS',name:'Apollo Hospitals',         sector:'Healthcare'},
  {sym:'HAVELLS.NS',   name:'Havells India',             sector:'Electricals'},
  {sym:'BRITANNIA.NS', name:'Britannia',                sector:'FMCG'},
  {sym:'NESTLEIND.NS', name:'Nestle India',              sector:'FMCG'},
  {sym:'ADANIPORTS.NS',name:'Adani Ports',              sector:'Ports'},
];

async function fetchDaily(sym) {
  try {
    const r = await fetch(
      'https://query1.finance.yahoo.com/v8/finance/chart/' + encodeURIComponent(sym) + '?interval=1d&range=1y',
      { headers: HDRS, signal: AbortSignal.timeout(8000) }
    );
    if (!r.ok) return null;
    const j = await r.json();
    const res = j?.chart?.result?.[0];
    if (!res) return null;
    const ts = res.timestamps || res.timestamp;
    const q = res.indicators.quote[0];
    const vi = ts.map((_, i) => i).filter(i =>
      q.close[i] != null && q.high[i] != null && q.low[i] != null && q.volume[i] != null
    );
    if (vi.length < 60) return null;
    return {
      closes:  vi.map(i => q.close[i]),
      highs:   vi.map(i => q.high[i]),
      lows:    vi.map(i => q.low[i]),
      volumes: vi.map(i => q.volume[i] || 0),
    };
  } catch(e) { return null; }
}

function analyzeStock(d, nifty, holdDays, minMove) {
  const n = d.closes.length;
  const testStart = Math.max(25, n - 130 - holdDays);
  const testEnd   = n - holdDays - 1;

  let hits = 0, wins = 0, totalReturn = 0;
  for (let i = testStart; i <= testEnd; i++) {
    const comp = composite(p1(d, i), p2(d, i), p3(d, nifty, i), p4(d, i), p5(d, i));
    if (comp >= 65) {
      hits++;
      const fwd = (d.closes[i + holdDays] - d.closes[i]) / d.closes[i] * 100;
      totalReturn += fwd;
      if (fwd >= minMove) wins++;
    }
  }

  const last = n - 1;
  const currentScore = composite(p1(d, last), p2(d, last), p3(d, nifty, last), p4(d, last), p5(d, last));
  const rs20d = relStrength(d, nifty, last, 20);
  const rs60d = relStrength(d, nifty, last, 60);

  return {
    hits,
    wins,
    patternWinRate: hits > 0 ? Math.round(wins / hits * 100) : 0,
    avgReturn: hits > 0 ? parseFloat((totalReturn / hits).toFixed(1)) : 0,
    currentScore,
    rs20d: rs20d !== null ? parseFloat(rs20d.toFixed(1)) : null,
    rs60d: rs60d !== null ? parseFloat(rs60d.toFixed(1)) : null,
  };
}

export default async function handler(req, res) {
  const holdDays = Math.max(5, Math.min(20, parseInt(req.query.hold || '10')));
  const minMove  = Math.max(3, Math.min(10, parseFloat(req.query.minMove || '5')));

  const nifty = await fetchDaily('^NSEI');
  if (!nifty) return res.status(500).json({ error: 'Failed to fetch Nifty benchmark data' });

  const results = [];
  const errors  = [];
  const batchSize = 5;

  for (let b = 0; b < NIFTY50_STOCKS.length; b += batchSize) {
    const batch = NIFTY50_STOCKS.slice(b, b + batchSize);
    const data  = await Promise.all(batch.map(s => fetchDaily(s.sym)));

    batch.forEach((stock, idx) => {
      if (!data[idx]) { errors.push(stock.sym.replace('.NS', '') + ': no data'); return; }
      const analysis = analyzeStock(data[idx], nifty, holdDays, minMove);
      results.push({ symbol: stock.sym.replace('.NS', ''), name: stock.name, sector: stock.sector, ...analysis });
    });

    if (b + batchSize < NIFTY50_STOCKS.length) {
      await new Promise(r => setTimeout(r, 250));
    }
  }

  if (results.length < 5) return res.status(500).json({ error: 'Not enough data fetched (' + results.length + ' stocks)' });

  // Composite ranking: 50% pattern win-rate + 30% RS (normalised) + 20% current pattern score
  results.forEach(r => {
    const rsNorm = r.rs20d !== null
      ? Math.min(100, Math.max(0, (r.rs20d + 15) / 30 * 100))
      : 50;
    r.rankScore = Math.round(r.patternWinRate * 0.5 + rsNorm * 0.3 + r.currentScore * 0.2);
    r.verdict = r.rankScore >= 65 ? 'TRADE' : r.rankScore >= 50 ? 'WATCH' : 'SKIP';
  });

  results.sort((a, b) => b.rankScore - a.rankScore);
  results.forEach((r, i) => { r.rank = i + 1; });

  const nLast = nifty.closes.length - 1;
  const niftyStats = {
    change20d: nLast >= 20 ? parseFloat(((nifty.closes[nLast] - nifty.closes[nLast - 20]) / nifty.closes[nLast - 20] * 100).toFixed(1)) : null,
    change60d: nLast >= 60 ? parseFloat(((nifty.closes[nLast] - nifty.closes[nLast - 60]) / nifty.closes[nLast - 60] * 100).toFixed(1)) : null,
  };

  // Top 5 momentum picks (highest RS20d)
  const momentumPicks = results
    .filter(r => r.rs20d !== null)
    .sort((a, b) => b.rs20d - a.rs20d)
    .slice(0, 5)
    .map(r => ({ symbol: r.symbol, name: r.name, sector: r.sector, rs20d: r.rs20d, rs60d: r.rs60d }));

  return res.status(200).json({
    ranked: results,
    momentumPicks,
    nifty: niftyStats,
    analyzed: results.length,
    errors,
    holdDays,
    minMove,
    timestamp: new Date().toLocaleString('en-IN', { timeZone: 'Asia/Kolkata' }) + ' IST',
  });
}
