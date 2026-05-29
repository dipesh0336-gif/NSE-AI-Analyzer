# regime.py — Nifty regime detection + reversal warning

import config

def detect_regime(nifty_pct: float, banknifty_pct: float, vix_pct: float) -> dict:
    """
    Classify current market regime based on Nifty, BankNifty, VIX
    Returns regime name, color, and action guidance
    """
    # Primary: Nifty % change from day open
    if nifty_pct >= config.STRONG_BULL_PCT and banknifty_pct >= config.STRONG_BULL_PCT * config.BANKNIFTY_MULT:
        regime = "STRONG BULL"
        color = "#00e676"
        action = "High conviction LONG signals. Trade top RS stocks with volume."
        trade = "LONG"
        confidence = 85

    elif nifty_pct >= config.WEAK_BULL_PCT:
        regime = "WEAK BULL"
        color = "#69f0ae"
        action = "Moderate LONG bias. Wait for volume confirmation before entering."
        trade = "LONG"
        confidence = 65

    elif nifty_pct <= config.STRONG_BEAR_PCT and banknifty_pct <= config.STRONG_BEAR_PCT * config.BANKNIFTY_MULT:
        regime = "STRONG BEAR"
        color = "#ff4444"
        action = "EXIT ALL LONGS immediately. Do not enter new positions."
        trade = "EXIT"
        confidence = 85

    elif nifty_pct <= config.WEAK_BEAR_PCT:
        regime = "WEAK BEAR"
        color = "#ff8a65"
        action = "Avoid new longs. Consider reducing existing positions."
        trade = "AVOID"
        confidence = 65

    else:
        regime = "NEUTRAL"
        color = "#ffb300"
        action = "No clear direction. Wait for breakout above/below current range."
        trade = "WAIT"
        confidence = 50

    # VIX adjustment — rising VIX reduces confidence
    if vix_pct > 5:
        confidence = max(30, confidence - 20)
        action += " WARNING: VIX rising sharply — high uncertainty."
    elif vix_pct > 2:
        confidence = max(40, confidence - 10)

    return {
        "regime": regime,
        "color": color,
        "action": action,
        "trade": trade,
        "confidence": confidence,
        "nifty_pct": round(nifty_pct, 2),
        "banknifty_pct": round(banknifty_pct, 2),
        "vix_pct": round(vix_pct, 2),
    }


def compute_vwap(candles: list) -> float:
    """Compute VWAP from intraday candles"""
    if not candles:
        return 0
    total_pv = sum((c["high"] + c["low"] + c["close"]) / 3 * c["volume"] for c in candles)
    total_v  = sum(c["volume"] for c in candles)
    return round(total_pv / total_v, 2) if total_v > 0 else 0


def check_reversal_warnings(
    nifty_candles: list,
    banknifty_candles: list,
    nifty_ltp: float,
    banknifty_ltp: float,
    vix_pct: float,
    stock_data: list,
) -> dict:
    """
    Check 4 reversal warning signals
    Returns warning level and triggered signals
    """
    warnings = []
    level = 0  # 0=clear, 1=yellow, 2=orange, 3=red

    # Signal A — BankNifty divergence
    if len(nifty_candles) >= 3 and len(banknifty_candles) >= 3:
        n_dir  = [1 if nifty_candles[-i]["close"] > nifty_candles[-i]["open"] else -1 for i in range(1, 3)]
        bn_dir = [1 if banknifty_candles[-i]["close"] > banknifty_candles[-i]["open"] else -1 for i in range(1, 3)]
        if n_dir[0] != bn_dir[0] and n_dir[1] != bn_dir[1]:
            warnings.append({
                "signal": "A",
                "name": "BankNifty Diverging",
                "detail": "BankNifty moving opposite to Nifty for 2 bars — reversal likely in 3-5 min",
                "severity": 2
            })
            level = max(level, 2)

    # Signal B — VWAP deviation
    if nifty_candles and nifty_ltp > 0:
        vwap = compute_vwap(nifty_candles)
        if vwap > 0:
            dev = abs(nifty_ltp - vwap) / vwap * 100
            if dev >= config.VWAP_DEV_PCT:
                direction = "above" if nifty_ltp > vwap else "below"
                warnings.append({
                    "signal": "B",
                    "name": "VWAP Extended",
                    "detail": f"Nifty {dev:.2f}% {direction} VWAP ({vwap:.0f}) — mean reversion likely",
                    "severity": 1
                })
                level = max(level, 1)

    # Signal C — Breadth shift
    if stock_data:
        above_vwap = sum(1 for s in stock_data if s.get("above_vwap"))
        total = len(stock_data)
        ratio = above_vwap / total if total > 0 else 0.5
        prev_ratio = sum(1 for s in stock_data if s.get("prev_above_vwap", True)) / total if total > 0 else 0.5
        shift = (prev_ratio - ratio) * total
        if shift >= config.BREADTH_SHIFT:
            warnings.append({
                "signal": "C",
                "name": "Breadth Deteriorating",
                "detail": f"{int(shift)} stocks flipped below VWAP — selling spreading across market",
                "severity": 2
            })
            level = max(level, 2)

    # Signal D — VIX spike
    if vix_pct >= config.VIX_SPIKE_PCT:
        warnings.append({
            "signal": "D",
            "name": "VIX Spiking",
            "detail": f"India VIX up {vix_pct:.1f}% — institutional hedging active, expect sharp move",
            "severity": 3
        })
        level = max(level, 3)

    # Overall assessment
    if level == 0:
        summary = "No reversal signals — trend intact"
        color = "#00e676"
    elif level == 1:
        summary = "Monitor closely — 1 warning signal"
        color = "#ffb300"
    elif level == 2:
        summary = "Consider reducing position — 2 warning signals"
        color = "#ff8a65"
    else:
        summary = "EXIT IMMEDIATELY — multiple reversal signals"
        color = "#ff4444"

    return {
        "level": level,
        "summary": summary,
        "color": color,
        "warnings": warnings,
        "signals_count": len(warnings),
    }
