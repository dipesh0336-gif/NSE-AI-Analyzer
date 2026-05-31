#!/usr/bin/env node
// Run: node scripts/analyse-nifty50.js
// Requires Node 18+ (built-in fetch). No extra npm installs needed.
// Takes ~3-5 minutes (rate-limited to avoid Yahoo Finance bans).

const { predictBar } = require('../lib/indicators');
const { p1, p2, p3, p4, p5, composite, relStrength } = require('../lib/patterns');

// ─── Config ──────────────────────────────────────────────────────────────────

const INTERVAL   = '15min';   // intraday interval for backtest
const HOLD_DAYS  = 10;        // days to hold for pattern backtest
const MIN_MOVE   = 5;         // % move that counts as a win
const LOOKBACK   = 20;        // days of RS lookback for momentum

const HDRS = {
  'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
  'Accept': 'application/json',
  'Referer': 'https://finance.yahoo.com',
};

const NIFTY50 = [
  'RELIANCE','TCS','HDFCBANK','INFY','ICICIBANK','HINDUNILVR','ITC','SBIN',
  'BHARTIARTL','KOTAKBANK','LT','ASIANPAINT','AXISBANK','BAJFINANCE','WIPRO',
  'HCLTECH','MARUTI','SUNPHARMA','TITAN','TECHM','NTPC','POWERGRID','ONGC',
  'COALINDIA','HINDALCO','TATAMOTORS','TATASTEEL','JSWSTEEL','INDUSINDBK',
  'BAJAJ-AUTO','M&M','ULTRACEMCO','DIVISLAB','CIPLA','DRREDDY','EICHERMOT',
  'HEROMOTOCO','GRASIM','ADANIENT','BPCL','SBILIFE','HDFCLIFE','BAJAJFINSV',
  'TATACONSUM','APOLLOHOSP','HAVELLS','BRITANNIA','NESTLEIND','ADANIPORTS',
];

// ─── Fetch helpers ────────────────────────────────────────────────────────────

async function sleep(ms) { return new Promise(r => setTimeout(r, ms)); }

async function fetchIntraday(sym) {
  const iMap = { '15min': '15m', '5min': '5m', '30min': '30m', '1h': '60m' };
  const yi = iMap[INTERVAL] || '15m';
  const range = yi === '5m' ? '10d' : '60d';
  try {
    const r = await fetch(
      `https://query1.finance.yahoo.com/v8/finance/chart/${encodeURIComponent(sym)}?interval=${yi}&range=${range}`,
      { headers: HDRS }
    );
    if (!r.ok) return null;
    const j = await r.json();
    const res = j?.chart?.result?.[0];
    if (!res) return null;
    const ts = res.timestamps || res.timestamp;
    const q = res.indicators.quote[0];
    const vi = ts.map((_, i) => i).filter(i =>
      q.close[i] != null && q.open[i] != null && q.high[i] != null && q.low[i] != null
    );
    return {
      ts:      vi.map(i => ts[i]),
      opens:   vi.map(i => q.open[i]),
      highs:   vi.map(i => q.high[i]),
      lows:    vi.map(i => q.low[i]),
      closes:  vi.map(i => q.close[i]),
      volumes: vi.map(i => q.volume[i] || 0),
    };
  } catch { return null; }
}

async function fetchDaily(sym) {
  try {
    const r = await fetch(
      `https://query1.finance.yahoo.com/v8/finance/chart/${encodeURIComponent(sym)}?interval=1d&range=1y`,
      { headers: HDRS }
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
    return {
      closes:  vi.map(i => q.close[i]),
      highs:   vi.map(i => q.high[i]),
      lows:    vi.map(i => q.low[i]),
      volumes: vi.map(i => q.volume[i] || 0),
    };
  } catch { return null; }
}

// ─── Intraday backtest for one stock ─────────────────────────────────────────

function runIntradayBacktest(d, niftyD, sym) {
  if (!d || d.closes.length < 35) return null;

  // Dynamic noise filter
  let avgBarMove = 0;
  for (let i = 1; i < Math.min(d.closes.length, 30); i++) {
    avgBarMove += Math.abs((d.closes[i] - d.closes[i-1]) / d.closes[i-1]) * 100;
  }
  avgBarMove /= Math.min(d.closes.length - 1, 29);
  const minMovePct = Math.max(0.04, avgBarMove * 0.3);

  const startIdx = Math.max(30, d.closes.length - 200);
  let longCalls = 0, longCorrect = 0, shortCalls = 0, shortCorrect = 0;
  let directional = 0, correct = 0;

  for (let i = startIdx; i < d.closes.length - 1; i++) {
    const pred = predictBar(
      d.opens.slice(0, i+1), d.highs.slice(0, i+1),
      d.lows.slice(0, i+1),  d.closes.slice(0, i+1),
      d.volumes.slice(0, i+1)
    );

    let sig = pred.signal;

    // Nifty filter
    if (niftyD && sig !== 'NEUTRAL') {
      const nLen = Math.min(i+1, niftyD.closes.length);
      const nPred = predictBar(
        niftyD.opens.slice(0, nLen), niftyD.highs.slice(0, nLen),
        niftyD.lows.slice(0, nLen),  niftyD.closes.slice(0, nLen),
        niftyD.volumes.slice(0, nLen)
      );
      if (sig === 'LONG'  && nPred.score <= -4) sig = 'NEUTRAL';
      if (sig === 'SHORT' && nPred.score >=  4) sig = 'NEUTRAL';
    }

    if (sig === 'NEUTRAL') continue;

    const changePct = (d.closes[i+1] - d.closes[i]) / d.closes[i] * 100;
    if (Math.abs(changePct) < minMovePct) continue; // FLAT

    const up = changePct > 0;
    directional++;
    if (sig === 'LONG')  { longCalls++;  if (up)  { longCorrect++;  correct++; } }
    if (sig === 'SHORT') { shortCalls++; if (!up)  { shortCorrect++; correct++; } }
  }

  const accuracy      = directional > 0 ? Math.round(correct      / directional  * 100) : 0;
  const longAccuracy  = longCalls   > 0 ? Math.round(longCorrect  / longCalls    * 100) : 0;
  const shortAccuracy = shortCalls  > 0 ? Math.round(shortCorrect / shortCalls   * 100) : 0;

  return { sym, accuracy, longAccuracy, shortAccuracy, directional, longCalls, shortCalls };
}

// ─── Pattern backtest for one stock ──────────────────────────────────────────

function runPatternBacktest(d, niftyDaily, sym) {
  if (!d || d.closes.length < 60) return null;

  const testStart = Math.max(60, d.closes.length - 120 - HOLD_DAYS);
  const testEnd   = d.closes.length - HOLD_DAYS - 1;

  let hits = 0, wins = 0, totalRet = 0;

  for (let i = testStart; i <= testEnd; i++) {
    if (i + HOLD_DAYS >= d.closes.length) continue;
    const fwd = (d.closes[i + HOLD_DAYS] - d.closes[i]) / d.closes[i] * 100;
    const pRes = [p1(d,i), p2(d,i), p3(d, niftyDaily, i), p4(d,i), p5(d,i)];
    const cs = composite(...pRes);
    if (cs >= 65) {
      hits++;
      totalRet += fwd;
      if (fwd >= MIN_MOVE) wins++;
    }
  }

  if (hits < 5) return null; // too few signals to be meaningful

  return {
    sym,
    patternAcc:    Math.round(wins / hits * 100),
    patternAvgRet: parseFloat((totalRet / hits).toFixed(1)),
    patternHits:   hits,
  };
}

// ─── Main ─────────────────────────────────────────────────────────────────────

async function main() {
  console.log('\n═══════════════════════════════════════════════════════════');
  console.log('  NSE-AI-Analyzer — Nifty 50 Backtest Analysis');
  console.log(`  Intraday: ${INTERVAL} | Pattern hold: ${HOLD_DAYS}d | Win: >${MIN_MOVE}%`);
  console.log('═══════════════════════════════════════════════════════════\n');

  // ── Step 1: Fetch Nifty index data (used as benchmark + filter) ──────────
  process.stdout.write('Fetching Nifty 50 index data... ');
  const niftyIntraday = await fetchIntraday('^NSEI');
  const niftyDaily    = await fetchDaily('^NSEI');
  console.log(niftyIntraday ? 'OK' : 'FAILED');
  await sleep(500);

  // ── Step 2: Fetch all stocks in batches ──────────────────────────────────
  console.log(`Fetching ${NIFTY50.length} stocks (intraday + daily)...\n`);

  const intradayData = {};
  const dailyData    = {};
  const BATCH = 5;

  for (let b = 0; b < NIFTY50.length; b += BATCH) {
    const batch = NIFTY50.slice(b, b + BATCH);
    const [intraRes, dailyRes] = await Promise.all([
      Promise.all(batch.map(s => fetchIntraday(s + '.NS'))),
      Promise.all(batch.map(s => fetchDaily(s + '.NS'))),
    ]);
    batch.forEach((sym, idx) => {
      if (intraRes[idx]) intradayData[sym] = intraRes[idx];
      if (dailyRes[idx]) dailyData[sym]    = dailyRes[idx];
    });
    const done = Math.min(b + BATCH, NIFTY50.length);
    process.stdout.write(`\r  Progress: ${done}/${NIFTY50.length} stocks`);
    if (b + BATCH < NIFTY50.length) await sleep(800);
  }
  console.log('\n');

  // ── Step 3: Run backtests ─────────────────────────────────────────────────
  const intradayResults = [];
  const patternResults  = [];

  for (const sym of NIFTY50) {
    const iRes = runIntradayBacktest(intradayData[sym], niftyIntraday, sym);
    if (iRes) intradayResults.push(iRes);

    const pRes = runPatternBacktest(dailyData[sym], niftyDaily, sym);
    if (pRes) patternResults.push(pRes);
  }

  // ── Step 4: Momentum backtest (portfolio-level) ───────────────────────────
  let momTrades = 0, momWins = 0, momTotalRet = 0;
  const minLen = Math.min(...Object.values(dailyData).filter(Boolean).map(d => d.closes.length));
  const topN   = 5;
  const testStart = Math.max(LOOKBACK + 5, minLen - 100 - HOLD_DAYS);
  const testEnd   = minLen - HOLD_DAYS - 1;

  for (let i = testStart; i <= testEnd; i += 5) {
    const scored = NIFTY50
      .filter(sym => dailyData[sym] && dailyData[sym].closes.length > i + HOLD_DAYS)
      .map(sym => ({
        sym,
        rs:  relStrength(dailyData[sym], niftyDaily, i, LOOKBACK),
        fwd: (dailyData[sym].closes[i + HOLD_DAYS] - dailyData[sym].closes[i]) / dailyData[sym].closes[i] * 100,
      }))
      .filter(x => x.rs !== null)
      .sort((a, b) => b.rs - a.rs)
      .slice(0, topN);

    scored.forEach(pick => {
      momTrades++;
      momTotalRet += pick.fwd;
      if (pick.fwd >= MIN_MOVE) momWins++;
    });
  }

  const momAccuracy  = momTrades > 0 ? Math.round(momWins / momTrades * 100) : 0;
  const momAvgReturn = momTrades > 0 ? parseFloat((momTotalRet / momTrades).toFixed(1)) : 0;

  // ── Step 5: Build combined ranking ───────────────────────────────────────
  // Score = weighted combination of intraday accuracy + pattern accuracy
  const combined = NIFTY50.map(sym => {
    const ir = intradayResults.find(r => r.sym === sym);
    const pr = patternResults.find(r => r.sym === sym);

    // Prefer the direction with higher intraday accuracy
    const bestIntraday   = ir ? Math.max(ir.longAccuracy, ir.shortAccuracy) : null;
    const bestDirection  = ir ? (ir.longAccuracy >= ir.shortAccuracy ? 'LONG' : 'SHORT') : '—';
    const enoughSamples  = ir && ir.directional >= 15;

    // Combined score (only if both datasets available)
    let score = null;
    if (ir && pr && enoughSamples) {
      score = Math.round(bestIntraday * 0.6 + pr.patternAcc * 0.4);
    } else if (ir && enoughSamples) {
      score = bestIntraday;
    } else if (pr) {
      score = pr.patternAcc;
    }

    return { sym, ir, pr, bestDirection, score };
  }).filter(r => r.score !== null)
    .sort((a, b) => b.score - a.score);

  // ── Step 6: Print results ─────────────────────────────────────────────────

  // — INTRADAY BACKTEST TABLE —
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log(' INTRADAY SIGNAL BACKTEST (15-min bars, last ~60 days)');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log(' Stock          Overall%  Long%  Short%  Signals  Best Direction');
  console.log('────────────────────────────────────────────────────────────────────');

  intradayResults
    .sort((a, b) => Math.max(b.longAccuracy, b.shortAccuracy) - Math.max(a.longAccuracy, a.shortAccuracy))
    .forEach(r => {
      const best = Math.max(r.longAccuracy, r.shortAccuracy);
      const dir  = r.longAccuracy >= r.shortAccuracy ? 'LONG ' : 'SHORT';
      const flag = best >= 65 ? '✓' : best >= 55 ? '~' : ' ';
      console.log(
        ` ${flag} ${r.sym.padEnd(13)} ${String(r.accuracy).padStart(5)}%` +
        `    ${String(r.longAccuracy).padStart(3)}%   ${String(r.shortAccuracy).padStart(3)}%` +
        `     ${String(r.directional).padStart(4)}     ${dir}`
      );
    });

  // — PATTERN BACKTEST TABLE —
  console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log(` PATTERN BACKTEST (daily bars, hold=${HOLD_DAYS}d, win>+${MIN_MOVE}%)`);
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log(' Stock          Win Rate  Avg Return  Signals');
  console.log('────────────────────────────────────────────────────────────────────');

  patternResults
    .sort((a, b) => b.patternAcc - a.patternAcc)
    .forEach(r => {
      const flag = r.patternAcc >= 70 ? '✓' : r.patternAcc >= 55 ? '~' : ' ';
      const ret  = (r.patternAvgRet >= 0 ? '+' : '') + r.patternAvgRet + '%';
      console.log(
        ` ${flag} ${r.sym.padEnd(13)} ${String(r.patternAcc).padStart(5)}%` +
        `      ${ret.padStart(7)}      ${r.patternHits}`
      );
    });

  // — MOMENTUM SUMMARY —
  console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log(` MOMENTUM STRATEGY (top-5 RS stocks, hold=${HOLD_DAYS}d, lookback=${LOOKBACK}d)`);
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  const momVerdict = momAccuracy >= 65 ? 'BUILD' : momAccuracy >= 50 ? 'TUNE' : 'WEAK';
  console.log(` Win rate: ${momAccuracy}%  |  Avg return/trade: ${momAvgReturn >= 0 ? '+' : ''}${momAvgReturn}%`);
  console.log(` Trades:   ${momTrades}     |  Wins: ${momWins}  Losses: ${momTrades - momWins}`);
  console.log(` Verdict:  ${momVerdict}`);

  // — FINAL RANKED SHORTLIST —
  console.log('\n═══════════════════════════════════════════════════════════════════════');
  console.log(' FINAL SHORTLIST — Ranked by combined score (intraday 60% + pattern 40%)');
  console.log('═══════════════════════════════════════════════════════════════════════');
  console.log(' Rank  Stock          Score  Intraday  Pattern  Best Direction  Verdict');
  console.log('───────────────────────────────────────────────────────────────────────');

  combined.slice(0, 15).forEach((r, idx) => {
    const iAcc  = r.ir ? Math.max(r.ir.longAccuracy, r.ir.shortAccuracy) : '—';
    const pAcc  = r.pr ? r.pr.patternAcc : '—';
    const verdict =
      r.score >= 65 ? 'TRADE' :
      r.score >= 55 ? 'WATCH' : 'SKIP';
    console.log(
      `  ${String(idx+1).padStart(2)}.  ${r.sym.padEnd(13)} ${String(r.score).padStart(4)}%` +
      `   ${String(iAcc).padStart(5)}%   ${String(pAcc).padStart(5)}%` +
      `   ${r.bestDirection.padEnd(6)}         ${verdict}`
    );
  });

  // — KEY INSIGHTS —
  console.log('\n═══════════════════════════════════════════════════════════════════════');
  console.log(' KEY INSIGHTS');
  console.log('═══════════════════════════════════════════════════════════════════════');

  const tradeable    = combined.filter(r => r.score >= 65);
  const watchlist    = combined.filter(r => r.score >= 55 && r.score < 65);
  const longBiased   = combined.filter(r => r.ir && r.ir.longAccuracy  >= 65 && r.ir.longAccuracy  > r.ir.shortAccuracy);
  const shortBiased  = combined.filter(r => r.ir && r.ir.shortAccuracy >= 65 && r.ir.shortAccuracy > r.ir.longAccuracy);
  const patternStars = patternResults.filter(r => r.patternAcc >= 70 && r.patternAvgRet > 0).map(r => r.sym);

  console.log(`\n  TRADEABLE (score ≥ 65%): ${tradeable.length} stocks`);
  if (tradeable.length) console.log(`    ${tradeable.map(r => r.sym).join(', ')}`);

  console.log(`\n  WATCHLIST (score 55–65%): ${watchlist.length} stocks`);
  if (watchlist.length) console.log(`    ${watchlist.map(r => r.sym).join(', ')}`);

  console.log(`\n  LONG ONLY (intraday long accuracy ≥ 65%):`);
  if (longBiased.length) console.log(`    ${longBiased.map(r => r.sym).join(', ')}`);
  else console.log('    None this period');

  console.log(`\n  SHORT ONLY (intraday short accuracy ≥ 65%):`);
  if (shortBiased.length) console.log(`    ${shortBiased.map(r => r.sym).join(', ')}`);
  else console.log('    None this period');

  console.log(`\n  PATTERN STARS (swing trade, win rate ≥ 70% + positive avg return):`);
  if (patternStars.length) console.log(`    ${patternStars.join(', ')}`);
  else console.log('    None this period');

  console.log(`\n  MOMENTUM: ${momVerdict} — ${momAccuracy}% win rate, avg ${momAvgReturn >= 0 ? '+' : ''}${momAvgReturn}% per trade`);
  if (momVerdict === 'BUILD') {
    console.log('    → Momentum is working. Use the Scanner Relative Strength filter.');
  } else if (momVerdict === 'TUNE') {
    console.log('    → Momentum has some edge. Try shorter lookback (10d) or longer hold (15d).');
  } else {
    console.log('    → Momentum is NOT working this period. Mean reversion may be dominant.');
  }

  console.log('\n  HOW TO USE THESE RESULTS IN THE APP:');
  console.log('  1. Use TRADEABLE stocks as your primary scanner watchlist');
  console.log('  2. In Analyze Stock, only take signals in the Best Direction column');
  console.log('  3. For PATTERN STARS, use the Validate tab to confirm before each trade');
  console.log('  4. Stocks marked SKIP — avoid even if the scanner shows a signal');
  console.log('\n═══════════════════════════════════════════════════════════════════════\n');
}

main().catch(err => {
  console.error('\nFATAL ERROR:', err.message);
  process.exit(1);
});
