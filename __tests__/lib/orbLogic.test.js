'use strict';

const { computeVwap, computeCPR, getNiftyTrend } = require('../../lib/orbLogic');

// ─── computeVwap ──────────────────────────────────────────────────────────────

describe('computeVwap', () => {
  test('computes correct weighted average of typical price', () => {
    // bar1: tp=(12+8+10)/3=10, vol=100; bar2: tp=(22+18+20)/3=20, vol=100 → vwap=15
    const d = { highs: [12, 22], lows: [8, 18], closes: [10, 20], volumes: [100, 100] };
    expect(computeVwap(d)).toBeCloseTo(15);
  });

  test('falls back to last close when all volumes are zero', () => {
    const d = { highs: [10], lows: [8], closes: [9], volumes: [0] };
    expect(computeVwap(d)).toBe(9);
  });

  test('equal volumes weight all bars equally', () => {
    const d = { highs: [11, 11], lows: [9, 9], closes: [10, 10], volumes: [50, 50] };
    expect(computeVwap(d)).toBeCloseTo(10);
  });

  test('high-volume bar pulls VWAP toward its typical price', () => {
    // bar1: tp=10, vol=10; bar2: tp=20, vol=90 → vwap = (100+1800)/100 = 19
    const d = { highs: [11, 21], lows: [9, 19], closes: [10, 20], volumes: [10, 90] };
    expect(computeVwap(d)).toBeCloseTo(19);
  });

  test('single bar VWAP equals its typical price', () => {
    const d = { highs: [15], lows: [5], closes: [10], volumes: [100] };
    // tp = (15+5+10)/3 ≈ 10
    expect(computeVwap(d)).toBeCloseTo(10);
  });
});

// ─── computeCPR ──────────────────────────────────────────────────────────────

describe('computeCPR', () => {
  test('pivot is the average of pdh, pdl and pdc', () => {
    const result = computeCPR(120, 100, 115);
    expect(result.pivot).toBeCloseTo((120 + 100 + 115) / 3, 8);
  });

  test('tc is always >= bc (swap logic applies)', () => {
    // When bc_raw > tc_raw the swap must be applied
    // pdh=120,pdl=80,pdc=90 → pivot≈96.67, bc_raw=100, tc_raw≈93.33 → swapped
    const r1 = computeCPR(120, 80, 90);
    expect(r1.tc).toBeGreaterThanOrEqual(r1.bc);

    // Normal case: no swap needed
    const r2 = computeCPR(120, 100, 115);
    expect(r2.tc).toBeGreaterThanOrEqual(r2.bc);
  });

  test('width equals tc - bc', () => {
    const result = computeCPR(120, 100, 110);
    expect(result.width).toBeCloseTo(result.tc - result.bc, 10);
  });

  test('equal pdh/pdl/pdc gives zero-width CPR', () => {
    const result = computeCPR(100, 100, 100);
    expect(result.width).toBeCloseTo(0, 10);
    expect(result.pivot).toBeCloseTo(100, 10);
  });

  test('swap case: bc and tc are correctly ordered', () => {
    // pdh=120,pdl=80,pdc=90: pivot≈96.67, bc_raw=100, tc_raw≈93.33
    // After swap: bc=93.33, tc=100
    const result = computeCPR(120, 80, 90);
    expect(result.bc).toBeCloseTo(93.33, 1);
    expect(result.tc).toBeCloseTo(100, 1);
  });

  test('standard case values are correct', () => {
    // pdh=120,pdl=100,pdc=115 → pivot=335/3≈111.67, bc=110, tc≈113.33
    const result = computeCPR(120, 100, 115);
    expect(result.pivot).toBeCloseTo(111.67, 1);
    expect(result.bc).toBeCloseTo(110, 1);
    expect(result.tc).toBeCloseTo(113.33, 1);
  });
});

// ─── getNiftyTrend ────────────────────────────────────────────────────────────

describe('getNiftyTrend', () => {
  function makeData(closes, vol = 1000) {
    return {
      closes,
      highs:   closes.map(c => c + 1),
      lows:    closes.map(c => c - 1),
      volumes: Array(closes.length).fill(vol),
    };
  }

  test('returns NEUTRAL for null input', () => {
    expect(getNiftyTrend(null).trend).toBe('NEUTRAL');
  });

  test('returns NEUTRAL when fewer than 5 bars', () => {
    expect(getNiftyTrend(makeData([100, 101, 102])).trend).toBe('NEUTRAL');
  });

  test('BULLISH when last close > VWAP and change > 0.2%', () => {
    // Rising series: last > vwap (rising prices pull last close above weighted avg) and change > 0.2%
    const closes = [100, 101, 102, 103, 104, 105];
    expect(getNiftyTrend(makeData(closes)).trend).toBe('BULLISH');
  });

  test('BEARISH when last close < VWAP and change < -0.2%', () => {
    const closes = [105, 104, 103, 102, 101, 100];
    expect(getNiftyTrend(makeData(closes)).trend).toBe('BEARISH');
  });

  test('change percentage reflects last-to-prev bar move', () => {
    const closes = [100, 101, 102, 103, 104, 105];
    const result = getNiftyTrend(makeData(closes));
    // (105 - 104) / 104 * 100 ≈ 0.96
    expect(result.change).toBeCloseTo((105 - 104) / 104 * 100, 1);
  });

  test('returns a vwap field', () => {
    const closes = [100, 101, 102, 103, 104];
    const result = getNiftyTrend(makeData(closes));
    expect(typeof result.vwap).toBe('number');
    expect(result.vwap).toBeGreaterThan(0);
  });
});
