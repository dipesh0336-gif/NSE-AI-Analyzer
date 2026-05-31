'use strict';

const { p1, p2, p3, p4, p5, composite, relStrength } = require('../../lib/patterns');

// ─── p1 — Volume Contraction ─────────────────────────────────────────────────

describe('p1 — Volume Contraction', () => {
  test('returns no-hit when i < 20', () => {
    const d = { volumes: Array(25).fill(1000), closes: Array(25).fill(100) };
    expect(p1(d, 19)).toEqual({ hit: false, score: 0 });
    expect(p1(d, 0)).toEqual({ hit: false, score: 0 });
  });

  test('detects contracted volume + tight range (full hit, score 100)', () => {
    // At i=24: recent 5 (indices 19-23) avg vol=500; prior 15 (indices 4-18) avg vol=1000
    // 500 < 1000*0.75=750 → contracted ✓
    // closes[19-23] range < 2.5% → tight ✓
    const volumes = [...Array(19).fill(1000), ...Array(5).fill(500)];
    const closes  = [...Array(19).fill(100), 100, 100.2, 100.4, 100.1, 100.3];
    const result  = p1({ volumes, closes }, 24);
    expect(result.hit).toBe(true);
    expect(result.score).toBe(100);
  });

  test('partial hit (only volume contracted, range too wide) gives score 50', () => {
    const volumes = [...Array(19).fill(1000), ...Array(5).fill(500)]; // contracted ✓
    const closes  = [...Array(19).fill(100), 100, 101, 102, 103, 104]; // range = 4% > 2.5% → not tight
    const result  = p1({ volumes, closes }, 24);
    expect(result.hit).toBe(false);
    expect(result.score).toBe(50);
  });

  test('partial hit (only tight range, volume NOT contracted) gives score 50', () => {
    const volumes = [...Array(19).fill(500), ...Array(5).fill(1000)]; // recent > prior → not contracted
    const closes  = [...Array(19).fill(100), 100, 100.1, 100.2, 100.1, 100.0]; // tight ✓
    const result  = p1({ volumes, closes }, 24);
    expect(result.hit).toBe(false);
    expect(result.score).toBe(50);
  });

  test('no hit and score 0 when neither condition met', () => {
    const volumes = [...Array(19).fill(500), ...Array(5).fill(1000)]; // NOT contracted
    const closes  = [...Array(19).fill(100), 100, 101, 102, 103, 104]; // NOT tight
    const result  = p1({ volumes, closes }, 24);
    expect(result.hit).toBe(false);
    expect(result.score).toBe(0);
  });
});

// ─── p2 — Near 52-Week High ───────────────────────────────────────────────────

describe('p2 — Near 52-Week High', () => {
  test('returns no-hit when i < 50', () => {
    const d = { highs: Array(60).fill(100), closes: Array(60).fill(95) };
    expect(p2(d, 49)).toEqual({ hit: false, score: 0 });
  });

  test('price within 8% of 52-week high is a hit', () => {
    const highs  = Array(60).fill(100); // 52w high = 100
    const closes = Array(60).fill(93);  // dist = 7% ≤ 8% → hit
    expect(p2({ highs, closes }, 55).hit).toBe(true);
  });

  test('price more than 8% below 52-week high is not a hit', () => {
    const highs  = Array(60).fill(100);
    const closes = Array(60).fill(90); // dist = 10% > 8% → no hit
    expect(p2({ highs, closes }, 55).hit).toBe(false);
    expect(p2({ highs, closes }, 55).score).toBe(0);
  });

  test('price exactly at 52-week high gives score 100', () => {
    const highs  = Array(60).fill(100);
    const closes = Array(60).fill(100); // dist = 0 → score = 100 - 0*10 = 100
    const result = p2({ highs, closes }, 55);
    expect(result.hit).toBe(true);
    expect(result.score).toBe(100);
  });

  test('score decreases as distance from 52-week high increases', () => {
    const highs = Array(60).fill(100);
    const r1 = p2({ highs, closes: Array(60).fill(99) }, 55); // dist=1%  → score=90
    const r2 = p2({ highs, closes: Array(60).fill(95) }, 55); // dist=5%  → score=50
    const r3 = p2({ highs, closes: Array(60).fill(92) }, 55); // dist=8%  → score=20
    expect(r1.score).toBeGreaterThan(r2.score);
    expect(r2.score).toBeGreaterThan(r3.score);
  });
});

// ─── p3 — Relative Strength ───────────────────────────────────────────────────

describe('p3 — Relative Strength', () => {
  test('returns no-hit when i < 20', () => {
    const d     = { closes: Array(25).fill(100) };
    const nifty = { closes: Array(25).fill(100) };
    expect(p3(d, nifty, 19)).toEqual({ hit: false, score: 0 });
  });

  test('detects outperformance > 3% vs Nifty', () => {
    // stock: 100→110 (+10%) over 15d; nifty: 100→106 (+6%) → RS = 4% > 3% → hit
    const closes = Array(25).fill(100); closes[24] = 110;
    const niftyCloses = Array(25).fill(100); niftyCloses[24] = 106;
    expect(p3({ closes }, { closes: niftyCloses }, 24).hit).toBe(true);
  });

  test('underperformance vs Nifty is not a hit', () => {
    // stock: +2%, nifty: +6% → RS = -4% < 3% → no hit
    const closes = Array(25).fill(100); closes[24] = 102;
    const niftyCloses = Array(25).fill(100); niftyCloses[24] = 106;
    expect(p3({ closes }, { closes: niftyCloses }, 24).hit).toBe(false);
  });

  test('score is bounded between 0 and 100', () => {
    const closes = Array(25).fill(100); closes[24] = 120;      // +20%
    const niftyCloses = Array(25).fill(100); niftyCloses[24] = 100; // 0%
    const result = p3({ closes }, { closes: niftyCloses }, 24);
    expect(result.score).toBeGreaterThanOrEqual(0);
    expect(result.score).toBeLessThanOrEqual(100);
  });
});

// ─── p4 — Base Formation ──────────────────────────────────────────────────────

describe('p4 — Base Formation', () => {
  test('returns no-hit when i < 25', () => {
    expect(p4({ closes: Array(30).fill(100) }, 24)).toEqual({ hit: false, score: 0 });
  });

  test('detects a 4-20% consolidation window', () => {
    // Build a 40-bar series with a 8% oscillation in the last 30 bars
    const closes = Array(40).fill(0).map((_, i) => {
      if (i < 10) return 100;
      return 100 + (i % 2) * 8; // oscillates between 100 and 108 → 8% range
    });
    const result = p4({ closes }, 39);
    expect(result.hit).toBe(true);
    expect(result.score).toBeGreaterThan(0);
  });

  test('range too tight (< 4%) is not a base formation', () => {
    // 0.4% oscillation → below 4% threshold for all window sizes
    const closes = Array(50).fill(100).map((_, i) => 100 + (i % 2) * 0.2);
    expect(p4({ closes }, 49).hit).toBe(false);
  });

  test('range too wide (> 20%) is not a base formation', () => {
    // *3 step → smallest 15-bar window covers indices 34-48: (244-202)/202*100 ≈ 20.8% > 20
    const closes = Array(50).fill(0).map((_, i) => 100 + i * 3);
    expect(p4({ closes }, 49).hit).toBe(false);
  });

  test('score is highest near 10% range (optimal base width)', () => {
    // Two bases: one near 10% range, one near 18% range
    // p4 scores: 100 - |wid-10| * 4
    function buildBase(rangePct) {
      // Oscillates between 100 and 100+rangePct, so wid ≈ rangePct%
      return Array(55).fill(0).map((_, i) => {
        if (i < 20) return 100;
        return 100 + (i % 2) * rangePct;
      });
    }
    const r10 = p4({ closes: buildBase(10) }, 54);
    const r18 = p4({ closes: buildBase(18) }, 54);
    if (r10.hit && r18.hit) {
      expect(r10.score).toBeGreaterThan(r18.score);
    }
  });
});

// ─── p5 — Volume Spike ────────────────────────────────────────────────────────

describe('p5 — Volume Spike', () => {
  test('returns no-hit when i < 12', () => {
    expect(p5({ volumes: Array(15).fill(1000) }, 11)).toEqual({ hit: false, score: 0 });
  });

  test('detects a volume spike >= 2x the 10-day average', () => {
    // avg of volumes[2..11] = 1000; today volume[12] = 2500 → ratio=2.5 ≥ 2 → hit
    const volumes = [...Array(12).fill(1000), 2500];
    const result  = p5({ volumes }, 12);
    expect(result.hit).toBe(true);
    expect(result.score).toBeGreaterThan(0);
  });

  test('volume below 2x average is not a spike', () => {
    const volumes = [...Array(12).fill(1000), 1900]; // ratio=1.9 < 2.0
    expect(p5({ volumes }, 12).hit).toBe(false);
    expect(p5({ volumes }, 12).score).toBe(0);
  });

  test('score at exactly 2x average equals 50', () => {
    // ratio=2.0 → score = min(100, round(2.0*25)) = min(100,50) = 50
    const volumes = [...Array(12).fill(1000), 2000];
    expect(p5({ volumes }, 12).score).toBe(50);
  });

  test('score is capped at 100', () => {
    // ratio=10 → round(10*25)=250 → capped at 100
    const volumes = [...Array(12).fill(1000), 10000];
    expect(p5({ volumes }, 12).score).toBe(100);
  });

  test('score increases with higher volume ratio (up to cap)', () => {
    const vol2x  = [...Array(12).fill(1000), 2000];
    const vol4x  = [...Array(12).fill(1000), 4000];
    const vol100 = [...Array(12).fill(1000), 100000];
    expect(p5({ volumes: vol4x }, 12).score).toBeGreaterThan(p5({ volumes: vol2x }, 12).score);
    expect(p5({ volumes: vol100 }, 12).score).toBe(100); // capped
  });
});

// ─── composite ────────────────────────────────────────────────────────────────

describe('composite', () => {
  test('all 100 scores give composite 100', () => {
    const full = { score: 100 };
    expect(composite(full, full, full, full, full)).toBe(100);
  });

  test('all zero scores give composite 0', () => {
    const zero = { score: 0 };
    expect(composite(zero, zero, zero, zero, zero)).toBe(0);
  });

  test('only p1=100 contributes 25 (weight 0.25)', () => {
    const z = { score: 0 };
    expect(composite({ score: 100 }, z, z, z, z)).toBe(25);
  });

  test('only p2=100 contributes 20 (weight 0.20)', () => {
    const z = { score: 0 };
    expect(composite(z, { score: 100 }, z, z, z)).toBe(20);
  });

  test('only p3=100 contributes 20 (weight 0.20)', () => {
    const z = { score: 0 };
    expect(composite(z, z, { score: 100 }, z, z)).toBe(20);
  });

  test('only p4=100 contributes 20 (weight 0.20)', () => {
    const z = { score: 0 };
    expect(composite(z, z, z, { score: 100 }, z)).toBe(20);
  });

  test('only p5=100 contributes 15 (weight 0.15)', () => {
    const z = { score: 0 };
    expect(composite(z, z, z, z, { score: 100 })).toBe(15);
  });

  test('weights sum to 1 (mixed scores)', () => {
    // 60*0.25 + 70*0.20 + 80*0.20 + 50*0.20 + 40*0.15 = 15+14+16+10+6 = 61
    expect(composite({ score: 60 }, { score: 70 }, { score: 80 }, { score: 50 }, { score: 40 })).toBe(61);
  });
});

// ─── relStrength ──────────────────────────────────────────────────────────────

describe('relStrength', () => {
  test('returns null when dayIdx < lookbackDays + 2', () => {
    const d = { closes: Array(15).fill(100) };
    const nifty = { closes: Array(15).fill(100) };
    expect(relStrength(d, nifty, 5, 10)).toBeNull();  // 5 < 10+2
    expect(relStrength(d, nifty, 11, 10)).toBeNull(); // 11 < 12
  });

  test('computes outperformance vs Nifty correctly', () => {
    // stock: 100→110 over 10 bars (+10%); nifty: 200→206 over 10 bars (+3%)
    const closes = Array(21).fill(100); closes[20] = 110;
    const niftyCloses = Array(21).fill(200); niftyCloses[20] = 206;
    expect(relStrength({ closes }, { closes: niftyCloses }, 20, 10)).toBeCloseTo(7, 5);
  });

  test('returns 0 when stock and Nifty move identically', () => {
    const closes = Array(21).fill(100); closes[20] = 105;
    const niftyCloses = Array(21).fill(100); niftyCloses[20] = 105;
    expect(relStrength({ closes }, { closes: niftyCloses }, 20, 10)).toBeCloseTo(0, 5);
  });

  test('returns negative RS when stock underperforms Nifty', () => {
    const closes = Array(21).fill(100); closes[20] = 102; // +2%
    const niftyCloses = Array(21).fill(100); niftyCloses[20] = 108; // +8%
    expect(relStrength({ closes }, { closes: niftyCloses }, 20, 10)).toBeCloseTo(-6, 5);
  });
});
