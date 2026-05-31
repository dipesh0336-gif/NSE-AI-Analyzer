# regime.py — Market regime detection and reversal warnings

import config


def compute_vwap(candles: list) -> float:
    """Volume-weighted average price from candles"""
    total_vol = 0
    total_tp_vol = 0.0
    for c in candles:
        tp = (c["high"] + c["low"] + c["close"]) / 3
        vol = c["volume"]
        total_tp_vol += tp * vol
        total_vol += vol
    return round(total_tp_vol / total_vol, 2) if total_vol > 0 else 0.0


def detect_regime(nifty_pct: float, banknifty_pct: float, vix_pct: float) -> dict:
    """
    Classify market regime based on index moves and VIX.
    Returns regime name, color, action guidance, and confidence.
    """
    nifty_pct     = round(nifty_pct, 2)
    banknifty_pct = round(banknifty_pct, 2)
    vix_pct       = round(vix_pct, 2)

    # Score-based regime detection
    score = 0
    score += nifty_pct * 10
    score += (banknifty_pct / config.BANKNIFTY_MULT) * 5
    score -= vix_pct * 3  # rising VIX is bearish

    if nifty_pct >= config.STRONG_BULL_PCT and banknifty_pct >= config.STRONG_BULL_PCT * config.BANKNIFTY_MULT:
        regime = "STRONG BULL"
        color  = "#00e676"
        action = "High-conviction long setups. Buy leading stocks above VWAP with volume. Trail stops tightly."
        confidence = min(95, 70 + int(abs(score)))
    elif nifty_pct >= config.WEAK_BULL_PCT:
        regime = "WEAK BULL"
        color  = "#69f0ae"
        action = "Selective longs only. Focus on top 2-3 RS leaders. Avoid chasing."
        confidence = min(85, 55 + int(abs(score)))
    elif nifty_pct <= config.STRONG_BEAR_PCT and banknifty_pct <= config.STRONG_BEAR_PCT * config.BANKNIFTY_MULT:
        regime = "STRONG BEAR"
        color  = "#ff4444"
        action = "No longs. Exit all positions. Wait for stabilization before re-entering."
        confidence = min(95, 70 + int(abs(score)))
    elif nifty_pct <= config.WEAK_BEAR_PCT:
        regime = "WEAK BEAR"
        color  = "#ff8a65"
        action = "Avoid new longs. Reduce exposure. Let open positions trail stop."
        confidence = min(85, 55 + int(abs(score)))
    else:
        regime = "NEUTRAL"
        color  = "#ffb300"
        action = "No clear edge. Wait for regime to develop. Watch for breakouts above/below range."
        confidence = max(30, 50 - int(abs(score)))

    return {
        "regime":        regime,
        "color":         color,
        "action":        action,
        "confidence":    confidence,
        "nifty_pct":     nifty_pct,
        "banknifty_pct": banknifty_pct,
        "vix_pct":       vix_pct,
        "score":         round(score, 1),
    }


def check_reversal_warnings(
    nifty_candles: list,
    banknifty_candles: list,
    nifty_ltp: float,
    banknifty_ltp: float,
    vix_pct: float,
    stock_data: list,
) -> dict:
    """
    Check for reversal warning signals. Returns warning level 0-3 and details.
    Level 0 = clear, 1 = caution, 2 = warning, 3 = danger
    """
    warnings = []

    # Signal 1: VIX spike
    if vix_pct >= config.VIX_SPIKE_PCT:
        warnings.append({
            "signal": "VIX",
            "detail": f"VIX surging +{vix_pct:.1f}% — volatility spike, risk-off likely",
        })

    # Signal 2: Nifty extended above VWAP
    if nifty_candles:
        nifty_vwap = compute_vwap(nifty_candles)
        if nifty_vwap > 0:
            dev = (nifty_ltp - nifty_vwap) / nifty_vwap * 100
            if abs(dev) >= config.VWAP_DEV_PCT:
                direction = "above" if dev > 0 else "below"
                warnings.append({
                    "signal": "VWAP",
                    "detail": f"Nifty {abs(dev):.2f}% {direction} VWAP — mean reversion risk",
                })

    # Signal 3: BankNifty diverging from Nifty
    if nifty_candles and banknifty_candles and len(nifty_candles) >= 3:
        nifty_recent   = [c["close"] for c in nifty_candles[-3:]]
        bnifty_recent  = [c["close"] for c in banknifty_candles[-3:]] if len(banknifty_candles) >= 3 else []
        if len(nifty_recent) == 3 and len(bnifty_recent) == 3:
            nifty_dir  = nifty_recent[-1] > nifty_recent[0]
            bnifty_dir = bnifty_recent[-1] > bnifty_recent[0]
            if nifty_dir != bnifty_dir:
                warnings.append({
                    "signal": "DIV",
                    "detail": "BankNifty diverging from Nifty — breadth deteriorating",
                })

    # Signal 4: Breadth shift (stocks flipping below VWAP)
    if stock_data:
        above = sum(1 for s in stock_data if s.get("above_vwap"))
        prev_above = sum(1 for s in stock_data if s.get("prev_above_vwap", s.get("above_vwap")))
        breadth_drop = (prev_above - above) / len(stock_data) * 100
        if breadth_drop >= config.BREADTH_SHIFT:
            warnings.append({
                "signal": "BREADTH",
                "detail": f"{int(breadth_drop)}% of stocks just flipped below VWAP — distribution in progress",
            })

    level = min(3, len(warnings))

    summaries = {
        0: "Market clear",
        1: "Minor caution — monitor closely",
        2: "Warning — tighten stops, reduce size",
        3: "Danger — consider exiting positions",
    }

    return {
        "level":    level,
        "summary":  summaries[level],
        "warnings": warnings,
    }
