// FILE: pages/api/ai.js
// Paste this into pages/api/ai.js in Replit

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) return res.status(500).json({ error: 'ANTHROPIC_API_KEY not set in Secrets' });

  const { signals: s, symbol, displayName, interval, extras: ex } = req.body;

  const fINR = (v) => {
    if (v == null || isNaN(v)) return 'â€”';
    const a = Math.abs(v), sg = v < 0 ? '-' : '+';
    if (a >= 1e7) return sg + 'â‚¹' + (a / 1e7).toFixed(2) + 'Cr';
    if (a >= 1e5) return sg + 'â‚¹' + (a / 1e5).toFixed(2) + 'L';
    return (v < 0 ? '-' : '') + 'â‚¹' + a.toFixed(0);
  };

  const prompt = `You are an expert NSE India intraday trader. Analyze this live market data and return a JSON verdict.

INSTRUMENT: ${displayName} (${symbol}) | NSE India | ${interval}
TIME: ${new Date().toLocaleString('en-IN', { timeZone: 'Asia/Kolkata' })} IST

PRICE: â‚¹${s.last.toFixed(2)} | Change ${s.change >= 0 ? '+' : ''}${s.change.toFixed(2)} (${s.changePct.toFixed(2)}%)
Day High: â‚¹${s.dayHigh.toFixed(2)} | Day Low: â‚¹${s.dayLow.toFixed(2)}

TECHNICALS:
- RSI(14): ${s.rsi.toFixed(2)} ${s.rsi > 70 ? '(overbought)' : s.rsi < 30 ? '(oversold)' : '(neutral)'}
- MACD Hist: ${s.macd.hist.toFixed(3)} ${s.macd.hist > 0 ? '(bullish)' : '(bearish)'}
- EMA9 â‚¹${s.ema9.toFixed(2)} vs EMA21 â‚¹${s.ema21.toFixed(2)} â†’ ${s.trendUp ? 'UPTREND' : 'DOWNTREND'}
- VWAP â‚¹${s.vwap.toFixed(2)} â†’ Price ${s.last > s.vwap ? 'ABOVE (bullish)' : 'BELOW (bearish)'}
- Volume: ${s.volRatio.toFixed(2)}x avg
- 10-bar momentum: ${s.mom10.toFixed(2)}%
- Recent closes: ${s.recentCloses.map(v => 'â‚¹' + v.toFixed(0)).join(', ')}

NSE CONTEXT:
- India VIX: ${ex.vix.toFixed(1)} ${ex.vix > 20 ? '(high volatility)' : '(calm)'}
- FII Net: ${fINR(ex.fii * 1e5)}, DII Net: ${fINR(ex.dii * 1e5)}
- PCR: ${ex.pcr.toFixed(2)} | Max Pain: â‚¹${ex.maxPain}

Reply ONLY with valid JSON (no markdown):
{"verdict":"LONG or SHORT or NEUTRAL","confidence":"HIGH or MEDIUM or LOW","reasoning":"3-4 sentences with specific numbers","entry_zone":"â‚¹XXXXâ€“XXXX","stop_loss":"â‚¹XXXX","target":"â‚¹XXXX","key_risk":"one sentence"}`;

  try {
    const r = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': apiKey,
        'anthropic-version': '2023-06-01',
      },
      body: JSON.stringify({
        model: 'claude-sonnet-4-20250514',
        max_tokens: 800,
        messages: [{ role: 'user', content: prompt }],
      }),
    });
    const data = await r.json();
    const raw = (data.content || []).map(c => c.text || '').join('');
    const parsed = JSON.parse(raw.replace(/```json|```/g, '').trim());
    res.status(200).json(parsed);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}