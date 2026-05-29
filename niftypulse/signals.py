# signals.py — Leading stocks scanner + momentum scoring

import config
from regime import compute_vwap

def compute_rs(stock_pct: float, nifty_pct: float) -> float:
    """Relative strength of stock vs Nifty"""
    return round(stock_pct - nifty_pct, 2)

def momentum_score(
    ltp: float,
    open_: float,
    high: float,
    low: float,
    prev_close: float,
    volume: int,
    avg_volume: int,
    vwap: float,
    rs: float,
) -> int:
    """
    Compute momentum score -100 to +100
    Positive = bullish momentum, Negative = bearish
    """
    score = 0

    # 1. Day change direction (+/- 30 pts)
    if prev_close > 0:
        chg = (ltp - prev_close) / prev_close * 100
        score += min(30, max(-30, int(chg * 10)))

    # 2. VWAP position (+/- 20 pts)
    if vwap > 0:
        vwap_dev = (ltp - vwap) / vwap * 100
        score += min(20, max(-20, int(vwap_dev * 10)))

    # 3. Relative strength vs Nifty (+/- 25 pts)
    score += min(25, max(-25, int(rs * 5)))

    # 4. Volume confirmation (+/- 15 pts)
    if avg_volume > 0:
        vol_ratio = volume / avg_volume
        if vol_ratio >= 1.5:
            score += 15 if score > 0 else -15
        elif vol_ratio >= 1.2:
            score += 8 if score > 0 else -8

    # 5. Price position in day range (+/- 10 pts)
    day_range = high - low
    if day_range > 0:
        pos = (ltp - low) / day_range  # 0=at low, 1=at high
        score += int((pos - 0.5) * 20)

    return max(-100, min(100, score))


def analyze_stocks(stock_quotes: list, nifty_pct: float, regime: str) -> list:
    """
    Analyze top 15 Nifty stocks and return ranked signals
    """
    results = []

    for stock in stock_quotes:
        if not stock or not stock.get("ltp"):
            continue

        sym        = stock["symbol"]
        ltp        = stock["ltp"]
        open_      = stock["open"]
        high       = stock["high"]
        low        = stock["low"]
        prev_close = stock["close"]
        volume     = stock["volume"]
        chg_pct    = stock["change_pct"]

        cfg        = next((s for s in config.NIFTY_TOP15 if s["sym"] == sym), {})
        weight     = cfg.get("weight", 1.0)

        vwap       = stock.get("vwap", ltp)
        avg_volume = stock.get("avg_volume", volume)
        rs         = compute_rs(chg_pct, nifty_pct)
        above_vwap = ltp > vwap
        score      = momentum_score(ltp, open_, high, low, prev_close, volume, avg_volume, vwap, rs)

        signal     = "NEUTRAL"
        conviction = 0

        if regime in ("STRONG BULL", "WEAK BULL"):
            if score >= 40 and above_vwap and rs > 0:
                signal     = "LONG"
                conviction = min(95, 50 + score // 2 + int(weight * 2))
            elif score >= 20:
                signal     = "WATCH"
                conviction = 35 + score // 3
            else:
                signal     = "AVOID"
                conviction = 20

        elif regime in ("STRONG BEAR", "WEAK BEAR"):
            signal     = "AVOID"
            conviction = 0

        else:
            signal     = "WATCH"
            conviction = 30

        results.append({
            "symbol":       sym,
            "name":         cfg.get("name", sym),
            "sector":       cfg.get("sector", ""),
            "weight":       weight,
            "ltp":          round(ltp, 2),
            "change_pct":   round(chg_pct, 2),
            "rs":           rs,
            "vwap":         round(vwap, 2),
            "above_vwap":   above_vwap,
            "score":        score,
            "signal":       signal,
            "conviction":   conviction,
            "volume_ratio": round(volume / avg_volume, 1) if avg_volume > 0 else 1.0,
        })

    order = {"LONG": 0, "WATCH": 1, "AVOID": 2, "NEUTRAL": 3}
    results.sort(key=lambda x: (order.get(x["signal"], 3), -x["conviction"]))

    return results


def get_trade_setups(analyzed: list, regime: str) -> list:
    """Extract top actionable trade setups based on regime"""
    if regime == "STRONG BULL":
        max_trades = 3
    elif regime == "WEAK BULL":
        max_trades = 2
    else:
        return []

    longs  = [s for s in analyzed if s["signal"] == "LONG"][:max_trades]
    setups = []

    for s in longs:
        ltp    = s["ltp"]
        vwap   = s["vwap"]
        stop   = round(min(vwap * 0.998, ltp * 0.985), 2)
        risk   = ltp - stop
        target = round(ltp + risk * 2, 2)
        rr     = round((target - ltp) / (ltp - stop), 1) if ltp > stop else 0

        setups.append({
            **s,
            "entry":  ltp,
            "stop":   stop,
            "target": target,
            "rr":     rr,
            "reason": _build_reason(s),
        })

    return setups


def _build_reason(s: dict) -> str:
    parts = []
    if s["rs"] > 2:
        parts.append(f"RS +{s['rs']}% vs Nifty")
    if s["above_vwap"]:
        parts.append(f"Above VWAP {s['vwap']}")
    if s["volume_ratio"] >= 1.5:
        parts.append(f"Volume {s['volume_ratio']}x avg")
    if s["score"] >= 60:
        parts.append("Strong momentum")
    return " · ".join(parts) if parts else "Nifty weight play"
