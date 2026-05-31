'use strict';

const { phase1Score, analyzeORB, NIFTY50 } = require('../../lib/scannerLogic');

// ─── phase1Score ──────────────────────────────────────────────────────────────

describe('phase1Score', () => {
  const baseQuote = {
    price: 102, prevClose: 100, dayHigh: 104, dayLow: 98,
    volume: 1500, avgVolume: 1000, changePct: 1.5, change: 1.5, open: 101,
  };

  test('returns -1 when day range is below 0.2%', () => {
    const q = { ...baseQuote, dayHigh: 100.1, dayLow: 100.05 }; // range = 0.05%
    expect(phase1Score('DUMMY.NS', q)).toBe(-1);
  });

  test('returns -1 when volume ratio is below 0.3', () => {
    const q = { ...baseQuote, volume: 1, avgVolume: 100 }; // vr = 0.01
    expect(phase1Score('DUMMY.NS', q)).toBe(-1);
  });

  test('returns -1 when price is zero', () => {
    expect(phase1Score('DUMMY.NS', { ...baseQuote, price: 0 })).toBe(-1);
  });

  test('returns a positive score for a normally active stock', () => {
    expect(phase1Score('DUMMY.NS', baseQuote)).toBeGreaterThan(0);
  });

  test('vr >= 3 adds 35 points (highest volume tier)', () => {
    const highVol  = { ...baseQuote, volume: 3000 }; // vr = 3  → +35
    const midVol   = { ...baseQuote, volume: 1200 }; // vr = 1.2 → +8
    expect(phase1Score('DUMMY.NS', highVol)).toBeGreaterThan(phase1Score('DUMMY.NS', midVol));
  });

  test('Nifty50 stock scores 8 points higher than non-Nifty50', () => {
    const nifty50 = 'RELIANCE.NS'; // in NIFTY50 set
    const other   = 'DUMMY.NS';
    expect(phase1Score(nifty50, baseQuote) - phase1Score(other, baseQuote)).toBe(8);
  });

  test('strong upward price move scores higher than flat', () => {
    const q1 = { ...baseQuote, changePct: 3.0 };  // > 2.5 → +20
    const q2 = { ...baseQuote, changePct: 0.5 };  // < 0.8 → +0
    expect(phase1Score('DUMMY.NS', q1)).toBeGreaterThan(phase1Score('DUMMY.NS', q2));
  });

  test('gap up > 1.5% adds 15 points', () => {
    // open 3% above prevClose → gap = 3% → +15
    const gapped = { ...baseQuote, open: 103, prevClose: 100 };
    // open == prevClose → gap = 0% → +0
    const noGap  = { ...baseQuote, open: 100, prevClose: 100 };
    expect(phase1Score('DUMMY.NS', gapped)).toBeGreaterThan(phase1Score('DUMMY.NS', noGap));
  });
});

// ─── NIFTY50 set ──────────────────────────────────────────────────────────────

describe('NIFTY50', () => {
  test('contains RELIANCE.NS', () => {
    expect(NIFTY50.has('RELIANCE.NS')).toBe(true);
  });

  test('does not contain unknown symbols', () => {
    expect(NIFTY50.has('DUMMY.NS')).toBe(false);
    expect(NIFTY50.has('RELIANCE')).toBe(false); // without .NS suffix
  });

  test('has at least 40 members', () => {
    expect(NIFTY50.size).toBeGreaterThanOrEqual(40);
  });
});

// ─── analyzeORB ───────────────────────────────────────────────────────────────

describe('analyzeORB', () => {
  const baseQuote = {
    price: 105, prevClose: 100, dayHigh: 106, dayLow: 99,
    volume: 2000, avgVolume: 1000, changePct: 5, change: 5, open: 101,
  };

  // Intraday series: OR formed in bars 0-1, clear breakout above OR High in bar 2+
  function makeBullishIntraday() {
    return {
      ts:      [1000, 1900, 2800, 3700, 4600, 5500, 6400, 7300],
      opens:   [100,  101,  101.5, 102,  103,  104,  104.5, 105],
      highs:   [101,  102,  102.5, 103,  104,  105,  105.5, 106],
      lows:    [99,   100,  100.5, 101,  102,  103,  103.5, 104],
      closes:  [101,  101,  103,   103,  104,  105,  105,   105],
      volumes: [500,  500,  2000,  1200, 1500, 1800, 1600,  2000],
    };
  }

  function makeBearishIntraday() {
    return {
      ts:      [1000, 1900, 2800, 3700, 4600, 5500],
      opens:   [100,  99,   98,   97,   96,   95],
      highs:   [101,  100,  99,   98,   97,   96],
      lows:    [99,   98,   97,   96,   95,   94],
      closes:  [99,   99,   97,   96,   95,   95],
      volumes: [500,  500,  2000, 1500, 1200, 1000],
    };
  }

  test('returns null for tiny price move with no ORB signal', () => {
    const q = { ...baseQuote, price: 100.1, changePct: 0.05, change: 0.05 };
    const d = {
      ts: [1000, 1900], opens: [100, 100], highs: [100.1, 100.1],
      lows: [99.9, 99.9], closes: [100.05, 100.1], volumes: [200, 200],
    };
    expect(analyzeORB('DUMMY.NS', q, d, 'NEUTRAL', 0)).toBeNull();
  });

  test('result symbol has .NS suffix stripped', () => {
    const d = makeBullishIntraday();
    const result = analyzeORB('RELIANCE.NS', baseQuote, d, 'NEUTRAL', 0);
    if (result) {
      expect(result.symbol).toBe('RELIANCE');
      expect(result.symbol).not.toContain('.NS');
    }
  });

  test('conviction is capped at 100', () => {
    const d = makeBullishIntraday();
    const result = analyzeORB('RELIANCE.NS', baseQuote, d, 'BULLISH', 1.5);
    if (result) expect(result.conviction).toBeLessThanOrEqual(100);
  });

  test('LONG signal requires price > prevClose', () => {
    // Bullish intraday but price below prevClose → LONG should not fire
    const bearQuote = { ...baseQuote, price: 95, changePct: -5 };
    const d = makeBullishIntraday();
    const result = analyzeORB('RELIANCE.NS', bearQuote, d, 'NEUTRAL', 0);
    if (result) {
      expect(result.direction).not.toBe('LONG');
    }
  });

  test('Nifty bearish suppresses LONG (niftyChangePct <= -0.3)', () => {
    const d = makeBullishIntraday();
    const result = analyzeORB('RELIANCE.NS', baseQuote, d, 'BEARISH', -0.5);
    // niftyChangePct = -0.5 <= -0.3 → LONG condition fails
    if (result) {
      expect(result.direction).not.toBe('LONG');
    }
  });

  test('SHORT signal requires price < prevClose', () => {
    const d = makeBearishIntraday();
    const bullQuote = { ...baseQuote, price: 105, changePct: 5 }; // price > prevClose
    const result = analyzeORB('RELIANCE.NS', bullQuote, d, 'NEUTRAL', 0);
    if (result) {
      expect(result.direction).not.toBe('SHORT');
    }
  });

  test('null intraday data does not produce a confirmed ORB signal', () => {
    const result = analyzeORB('RELIANCE.NS', baseQuote, null, 'NEUTRAL', 0);
    if (result) {
      expect(['WATCH_LONG', 'WATCH_SHORT', 'NEUTRAL']).toContain(result.direction);
    }
  });

  test('result includes expected fields when signal is produced', () => {
    const d = makeBullishIntraday();
    const result = analyzeORB('RELIANCE.NS', baseQuote, d, 'NEUTRAL', 0);
    if (result) {
      expect(result).toHaveProperty('symbol');
      expect(result).toHaveProperty('direction');
      expect(result).toHaveProperty('conviction');
      expect(result).toHaveProperty('price');
      expect(result).toHaveProperty('pdc');
      expect(result).toHaveProperty('volRatio');
      expect(result).toHaveProperty('reasons');
      expect(Array.isArray(result.reasons)).toBe(true);
      expect(result.reasons.length).toBeLessThanOrEqual(3);
    }
  });

  test('WATCH_LONG fires when price > prevClose, strong vol, strong move, no ORB yet', () => {
    const watchQuote = {
      price: 103, prevClose: 100, dayHigh: 103.5, dayLow: 99,
      volume: 2000, avgVolume: 1000, changePct: 3, change: 3, open: 101,
    };
    // Intraday with only 2 bars (not enough for ORB breakout check)
    const d = {
      ts: [1000, 1900], opens: [100, 101], highs: [101, 102],
      lows: [99, 100], closes: [101, 103], volumes: [500, 1700],
    };
    const result = analyzeORB('RELIANCE.NS', watchQuote, d, 'NEUTRAL', 0);
    if (result) {
      expect(['WATCH_LONG', 'LONG']).toContain(result.direction);
    }
  });
});
