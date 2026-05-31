# breeze_client.py — Breeze API wrapper for NiftyPulse

from breeze_connect import BreezeConnect
from datetime import datetime, timedelta
import pytz
import config

IST = pytz.timezone("Asia/Kolkata")

class BreezeClient:
    def __init__(self):
        self.breeze = BreezeConnect(api_key=config.API_KEY)
        self.connected = False
        self.session_token = None

    def connect(self, session_token: str):
        """Connect using session token from daily login"""
        try:
            self.breeze.generate_session(
                api_secret=config.SECRET_KEY,
                session_token=session_token
            )
            self.connected = True
            self.session_token = session_token
            print("Breeze connected OK")
            return True
        except Exception as e:
            print(f"Breeze connect failed: {e}")
            return False

    def get_quote(self, symbol: str, exchange: str = "NSE") -> dict:
        """Get current quote for a stock"""
        try:
            r = self.breeze.get_quotes(
                stock_code=symbol,
                exchange_code=exchange,
                product_type="cash",
                expiry_date="",
                right="",
                strike_price=""
            )
            if r and r.get("Success"):
                d = r["Success"][0] if isinstance(r["Success"], list) else r["Success"]
                return {
                    "symbol": symbol,
                    "ltp": float(d.get("ltp", 0) or 0),
                    "open": float(d.get("open", 0) or 0),
                    "high": float(d.get("high", 0) or 0),
                    "low": float(d.get("low", 0) or 0),
                    "close": float(d.get("previous_close", 0) or 0),
                    "volume": int(d.get("total_quantity_traded", 0) or 0),
                    "change_pct": float(d.get("ltp_percent_change", 0) or 0),
                }
        except Exception as e:
            print(f"Quote error {symbol}: {e}")
        return None

    def get_index_quote(self, index_name: str) -> dict:
        """Get current index quote"""
        try:
            r = self.breeze.get_quotes(
                stock_code=index_name,
                exchange_code="NSE",
                product_type="cash",
                expiry_date="",
                right="",
                strike_price=""
            )
            if r and r.get("Success"):
                d = r["Success"][0] if isinstance(r["Success"], list) else r["Success"]
                return {
                    "symbol": index_name,
                    "ltp": float(d.get("ltp", 0) or 0),
                    "open": float(d.get("open", 0) or 0),
                    "change_pct": float(d.get("ltp_percent_change", 0) or 0),
                }
        except Exception as e:
            print(f"Index quote error {index_name}: {e}")
        return None

    def get_candles(self, symbol: str, interval: str = "5minute", exchange: str = "NSE") -> list:
        """Get recent OHLCV candles"""
        try:
            now = datetime.now(IST)
            from_dt = now - timedelta(hours=4)
            r = self.breeze.get_historical_data_v2(
                interval=interval,
                from_date=from_dt.strftime("%Y-%m-%dT%H:%M:%S.000Z"),
                to_date=now.strftime("%Y-%m-%dT%H:%M:%S.000Z"),
                stock_code=symbol,
                exchange_code=exchange,
                product_type="cash"
            )
            if r and r.get("Success"):
                candles = []
                for c in r["Success"]:
                    candles.append({
                        "time": c.get("datetime", ""),
                        "open": float(c.get("open", 0) or 0),
                        "high": float(c.get("high", 0) or 0),
                        "low": float(c.get("low", 0) or 0),
                        "close": float(c.get("close", 0) or 0),
                        "volume": int(c.get("volume", 0) or 0),
                    })
                return candles
        except Exception as e:
            print(f"Candles error {symbol}: {e}")
        return []

# Singleton
client = BreezeClient()
