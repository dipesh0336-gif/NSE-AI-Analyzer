'use strict';

const { ema, rsi, stochRsi, macdCalc, bollingerBands, adxCalc, vwapCalc, predictBar } = require('../../lib/indicators');

// ─── ema ──────────────────────────────────────────────────────────────────────

describe('ema', () => {
  test('period-1 returns data unchanged', () => {
    // k = 2/(1+1) = 1, so e = v*1 + e*0 = v each step
    expect(ema([10, 20, 30], 1)).toEqual([10, 20, 30]);
  });

  test('constant series stays constant', () => {
    ema([5, 5, 5, 5, 5], 3).forEach(v => expect(v).toBeCloseTo(5));
  });

  test('single element returns that element', () => {
    expect(ema([42], 3)).toEqual([42]);
  });

  test('output length equals input length', () => {
    expect(ema([1, 2, 3, 4, 5], 2)).toHaveLength(5);
  });

  test('period-3 computes correct EMA values', () => {
    // k = 2/(3+1) = 0.5
    // e[0]=10, e[1]=11*0.5+10*0.5=10.5, e[2]=12*0.5+10.5*0.5=11.25, e[3]=13*0.5+11.25*0.5=12.125
    const result = ema([10, 11, 12, 13], 3);
    expect(result[0]).toBeCloseTo(10);
    expect(result[1]).toBeCloseTo(10.5);
    expect(result[2]).toBeCloseTo(11.25);
    expect(result[3]).toBeCloseTo(12.125);
  });

  test('longer period lags behind faster period on a rising series', () => {
    const data = Array.from({ length: 30 }, (_, i) => i + 1);
    const fast = ema(data, 5);
    const slow = ema(data, 20);
    // On a monotonically rising series the faster EMA is always closer to the latest price
    expect(fast[fast.length - 1]).toBeGreaterThan(slow[slow.length - 1]);
  });
});

// ─── rsi ──────────────────────────────────────────────────────────────────────

describe('rsi', () => {
  test('returns 50 when there are fewer bars than period+1', () => {
    expect(rsi([10, 20, 30], 14)).toBe(50);
    expect(rsi([], 14)).toBe(50);
  });

  test('returns 100 for an all-rising close series', () => {
    // Only gains → average loss = 0 → RSI = 100
    const closes = Array.from({ length: 16 }, (_, i) => 10 + i);
    expect(rsi(closes, 14)).toBe(100);
  });

  test('returns 0 for an all-falling close series', () => {
    // Only losses → average gain = 0 → 100 - 100/(1+0/al) = 0
    const closes = Array.from({ length: 16 }, (_, i) => 25 - i);
    expect(rsi(closes, 14)).toBe(0);
  });

  test('result is within [0, 100] for any valid series', () => {
    const closes = [100, 102, 101, 103, 99, 104, 98, 105, 100, 106, 102, 107, 103, 108, 104, 109];
    const r = rsi(closes, 14);
    expect(r).toBeGreaterThanOrEqual(0);
    expect(r).toBeLessThanOrEqual(100);
  });

  test('default period is 14', () => {
    const closes = Array.from({ length: 20 }, (_, i) => 100 + Math.sin(i) * 5);
    // Calling without period arg and with period=14 should produce same result
    expect(rsi(closes)).toBeCloseTo(rsi(closes, 14), 10);
  });
});

// ─── stochRsi ─────────────────────────────────────────────────────────────────

describe('stochRsi', () => {
  test('returns 50 when RSI series is shorter than stochastic period', () => {
    expect(stochRsi([1, 2, 3], 14, 14)).toBe(50);
  });

  test('returns 50 for a perfectly flat series (all RSI values equal)', () => {
    // Flat closes → all RSI values identical → maxR === minR → 50
    const closes = Array(30).fill(100);
    expect(stochRsi(closes, 14, 14)).toBe(50);
  });

  test('result is within [0, 100] for valid oscillating data', () => {
    const closes = Array.from({ length: 40 }, (_, i) => 100 + Math.sin(i * 0.5) * 10);
    const result = stochRsi(closes, 14, 14);
    expect(result).toBeGreaterThanOrEqual(0);
    expect(result).toBeLessThanOrEqual(100);
  });
});

// ─── bollingerBands ───────────────────────────────────────────────────────────

describe('bollingerBands', () => {
  test('returns {pct:50} when closes.length < period', () => {
    expect(bollingerBands([1, 2, 3], 20, 2)).toEqual({ pct: 50 });
  });

  test('returns pct=50 for a perfectly flat series (std = 0)', () => {
    const result = bollingerBands(Array(20).fill(10), 20, 2);
    expect(result.pct).toBe(50);
  });

  test('last close exactly at upper band gives pct = 100', () => {
    // [10,10,10,10,12] with p=5, mult=2:
    // mean=10.4, std=0.8, upper=10.4+1.6=12, lower=10.4-1.6=8.8, last=12
    // pct = (12-8.8)/(12-8.8)*100 = 100
    const result = bollingerBands([10, 10, 10, 10, 12], 5, 2);
    expect(result.pct).toBeCloseTo(100, 5);
  });

  test('exposes upper, lower, and mid properties', () => {
    const closes = Array.from({ length: 20 }, (_, i) => 100 + i * 0.5);
    const result = bollingerBands(closes, 20, 2);
    expect(result).toHaveProperty('upper');
    expect(result).toHaveProperty('lower');
    expect(result).toHaveProperty('mid');
    expect(result.upper).toBeGreaterThan(result.mid);
    expect(result.mid).toBeGreaterThan(result.lower);
  });

  test('wider multiplier produces wider band', () => {
    const closes = Array.from({ length: 20 }, (_, i) => 100 + i * 0.5);
    const b1 = bollingerBands(closes, 20, 1);
    const b2 = bollingerBands(closes, 20, 2);
    expect(b2.upper - b2.lower).toBeCloseTo(2 * (b1.upper - b1.lower), 5);
  });

  test('uses only the last p bars for calculation', () => {
    // Prepend 100 bars far from the last 5 — only the last 5 should matter
    const prefix = Array(100).fill(999);
    const tail = [10, 10, 10, 10, 12];
    const r1 = bollingerBands(tail, 5, 2);
    const r2 = bollingerBands([...prefix, ...tail], 5, 2);
    expect(r1.pct).toBeCloseTo(r2.pct, 8);
  });
});

// ─── vwapCalc ─────────────────────────────────────────────────────────────────

describe('vwapCalc', () => {
  test('computes correct weighted average of typical price', () => {
    // bar1: tp=(12+8+10)/3=10, vol=100 → weight=1000
    // bar2: tp=(22+18+20)/3=20, vol=100 → weight=2000
    // vwap = 3000/200 = 15
    expect(vwapCalc([12, 22], [8, 18], [10, 20], [100, 100])).toBeCloseTo(15);
  });

  test('falls back to last close when total volume is zero', () => {
    expect(vwapCalc([10], [8], [9], [0])).toBe(9);
  });

  test('equal volumes weight all bars equally', () => {
    expect(vwapCalc([11, 11], [9, 9], [10, 10], [50, 50])).toBeCloseTo(10);
  });

  test('high-volume bar pulls VWAP toward its typical price', () => {
    // bar1: tp=10, vol=10; bar2: tp=20, vol=90 → vwap = (100+1800)/100 = 19
    const result = vwapCalc([11, 21], [9, 19], [10, 20], [10, 90]);
    expect(result).toBeGreaterThan(15);
    expect(result).toBeCloseTo(19, 5);
  });
});

// ─── adxCalc ──────────────────────────────────────────────────────────────────

describe('adxCalc', () => {
  test('returns default sentinel {adx:20,pdi:0,ndi:0} for insufficient data', () => {
    expect(adxCalc([10, 11], [8, 9], [9, 10], 14)).toEqual({ adx: 20, pdi: 0, ndi: 0 });
    expect(adxCalc([], [], [], 14)).toEqual({ adx: 20, pdi: 0, ndi: 0 });
  });

  test('returns numeric adx/pdi/ndi for a valid series', () => {
    const highs  = Array.from({ length: 30 }, (_, i) => 105 + i);
    const lows   = Array.from({ length: 30 }, (_, i) => 95 + i);
    const closes = Array.from({ length: 30 }, (_, i) => 100 + i);
    const result = adxCalc(highs, lows, closes, 14);
    expect(typeof result.adx).toBe('number');
    expect(typeof result.pdi).toBe('number');
    expect(typeof result.ndi).toBe('number');
  });

  test('uptrend has +DI > -DI', () => {
    const highs  = Array.from({ length: 40 }, (_, i) => 105 + i * 2);
    const lows   = Array.from({ length: 40 }, (_, i) => 95 + i * 2);
    const closes = Array.from({ length: 40 }, (_, i) => 100 + i * 2);
    const result = adxCalc(highs, lows, closes, 14);
    expect(result.pdi).toBeGreaterThan(result.ndi);
  });

  test('downtrend has -DI > +DI', () => {
    const highs  = Array.from({ length: 40 }, (_, i) => 200 - i * 2);
    const lows   = Array.from({ length: 40 }, (_, i) => 190 - i * 2);
    const closes = Array.from({ length: 40 }, (_, i) => 195 - i * 2);
    const result = adxCalc(highs, lows, closes, 14);
    expect(result.ndi).toBeGreaterThan(result.pdi);
  });
});

// ─── macdCalc ─────────────────────────────────────────────────────────────────

describe('macdCalc', () => {
  test('histogram equals line minus signal', () => {
    const closes = Array.from({ length: 50 }, (_, i) => 100 + i * 0.5);
    const result = macdCalc(closes);
    expect(result.hist).toBeCloseTo(result.line - result.signal, 10);
  });

  test('rising series produces a positive MACD line (EMA12 > EMA26)', () => {
    const closes = Array.from({ length: 40 }, (_, i) => 100 + i);
    expect(macdCalc(closes).line).toBeGreaterThan(0);
  });

  test('falling series produces a negative MACD line', () => {
    const closes = Array.from({ length: 40 }, (_, i) => 200 - i);
    expect(macdCalc(closes).line).toBeLessThan(0);
  });
});

// ─── predictBar ───────────────────────────────────────────────────────────────

describe('predictBar', () => {
  test('returns NEUTRAL with score=0 when closes.length < 26', () => {
    const arr = Array(20).fill(100);
    expect(predictBar(arr, arr, arr, arr, arr)).toEqual({ signal: 'NEUTRAL', score: 0 });
  });

  test('returns a valid signal object for a 50-bar series', () => {
    const n = 50;
    const closes = Array.from({ length: n }, (_, i) => 100 + i * 0.1);
    const highs  = closes.map(c => c + 1);
    const lows   = closes.map(c => c - 1);
    const opens  = closes.map((c, i) => i > 0 ? closes[i - 1] : c);
    const vols   = Array(n).fill(1000);
    const result = predictBar(opens, highs, lows, closes, vols);
    expect(['LONG', 'SHORT', 'NEUTRAL']).toContain(result.signal);
    expect(typeof result.score).toBe('number');
  });

  test('LONG signal only emitted when score >= 5', () => {
    // Deeply oversold setup: sharp decline then slow recovery
    const down  = Array.from({ length: 30 }, (_, i) => 200 - i * 4);
    const up    = Array.from({ length: 20 }, (_, i) => down[29] + i * 0.5);
    const closes = [...down, ...up];
    const highs  = closes.map(c => c + 0.5);
    const lows   = closes.map(c => c - 0.5);
    const opens  = closes.map((c, i) => i === 0 ? c : closes[i - 1]);
    const vols   = Array(closes.length).fill(1000);
    const result = predictBar(opens, highs, lows, closes, vols);
    if (result.signal === 'LONG') expect(result.score).toBeGreaterThanOrEqual(5);
  });

  test('SHORT signal only emitted when score <= -5', () => {
    // Overbought setup: strong sustained rally
    const n = 50;
    const closes = Array.from({ length: n }, (_, i) => 100 + i * 3);
    const highs  = closes.map(c => c + 0.5);
    const lows   = closes.map(c => c - 0.5);
    const opens  = closes.map((c, i) => i === 0 ? c : closes[i - 1]);
    const vols   = Array(n).fill(1000);
    const result = predictBar(opens, highs, lows, closes, vols);
    if (result.signal === 'SHORT') expect(result.score).toBeLessThanOrEqual(-5);
  });

  test('NEUTRAL signal emitted when -5 < score < 5', () => {
    // Construct a mixed series designed to produce a near-zero score
    const n = 50;
    const closes = Array.from({ length: n }, (_, i) => 100 + Math.sin(i) * 2);
    const highs  = closes.map(c => c + 1);
    const lows   = closes.map(c => c - 1);
    const opens  = closes.map((c, i) => i === 0 ? c : closes[i - 1]);
    const vols   = Array(n).fill(1000);
    const result = predictBar(opens, highs, lows, closes, vols);
    if (result.signal === 'NEUTRAL') {
      expect(result.score).toBeGreaterThan(-5);
      expect(result.score).toBeLessThan(5);
    }
  });
});
