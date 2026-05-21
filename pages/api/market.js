// FILE: pages/api/market.js
// Uses Yahoo Finance - completely free, no API key needed, called server-side so no CORS

function ema(data, period) {
  var k = 2 / (period + 1);
  var e = data[0];
  return data.map(function(v, i) {
    if (i === 0) return e;
    e = v * k + e * (1 - k);
    return e;
  });
}

function rsi(closes, period) {
  if (!period) period = 14;
  if (closes.length < period + 1) return 50;
  var g = 0, l = 0;
  for (var i = 1; i <= period; i++) {
    var d = closes[i] - closes[i-1];
    if (d > 0) g += d; else l -= d;
  }
  var ag = g/period, al = l/period;
  for (var i = period+1; i < closes.length; i++) {
    var d = closes[i] - closes[i-1];
    ag = (ag*(period-1) + (d>0?d:0)) / period;
    al = (al*(period-1) + (d<0?-d:0)) / period;
  }
  return al===0 ? 100 : 100-(100/(1+ag/al));
}

function macd(closes) {
  var e12=ema(closes,12), e26=ema(closes,26);
  var line=e12.map(function(v,i){return v-e26[i];});
  var signal=ema(line.slice(26),9);
  return {
    hist: line[line.length-1]-signal[signal.length-1],
    line: line[line.length-1],
    signal: signal[signal.length-1]
  };
}

function vwap(highs,lows,closes,volumes) {
  var ct=0,cv=0;
  for (var i=0;i<closes.length;i++) {
    var tp=(highs[i]+lows[i]+closes[i])/3;
    ct+=tp*volumes[i]; cv+=volumes[i];
  }
  return cv>0 ? ct/cv : closes[closes.length-1];
}

export default async function handler(req, res) {
  var symbol = req.query.symbol;
  var type = req.query.type || 'stock';
  var interval = req.query.interval || '15min';

  if (!symbol) return res.status(400).json({error:'Symbol is required'});

  // Convert interval to Yahoo Finance format
  var yhInterval = interval;
  if (interval==='15min') yhInterval='15m';
  else if (interval==='5min') yhInterval='5m';
  else if (interval==='30min') yhInterval='30m';
  else if (interval==='1h') yhInterval='60m';

  // Convert symbol to Yahoo Finance format
  var yhSymbol;
  if (type==='index') {
    var indexMap = {
      'NIFTY': '^NSEI',
      'BANKNIFTY': '^NSEBANK',
      'NIFTY IT': '^CNXIT',
      'NIFTY AUTO': '^CNXAUTO',
      'NIFTY PHARMA': '^CNXPHARMA',
      'NIFTY MIDCAP 50': '^CNXMIDCAP',
      'NIFTY FMCG': '^CNXFMCG',
      'NIFTY METAL': '^CNXMETAL',
    };
    yhSymbol = indexMap[symbol] || ('^'+symbol);
  } else {
    // NSE stocks need .NS suffix in Yahoo Finance
    yhSymbol = symbol + '.NS';
  }

  var range = '5d';
  if (yhInterval==='5m') range='2d';

  var url = 'https://query1.finance.yahoo.com/v8/finance/chart/'+encodeURIComponent(yhSymbol)+'?interval='+yhInterval+'&range='+range;

  try {
    var r = await fetch(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
        'Accept': 'application/json',
        'Referer': 'https://finance.yahoo.com',
      }
    });

    if (!r.ok) throw new Error('Yahoo Finance returned '+r.status+'. Try again or check symbol.');

    var json = await r.json();
    var result = json.chart && json.chart.result && json.chart.result[0];
    if (!result) throw new Error('No data from Yahoo Finance. Market may be closed or symbol invalid.');

    var ts = result.timestamps || result.timestamp;
    var q = result.indicators.quote[0];

    // Filter out null values
    var validIdx = ts.map(function(_,i){return i;}).filter(function(i){
      return q.close[i]!=null && q.open[i]!=null && q.high[i]!=null && q.low[i]!=null;
    });

    if (validIdx.length < 10) throw new Error('Not enough data points. Please try during NSE market hours: 09:15-15:30 IST on weekdays.');

    var data = {
      timestamps: validIdx.map(function(i){return ts[i];}),
      opens:   validIdx.map(function(i){return q.open[i];}),
      highs:   validIdx.map(function(i){return q.high[i];}),
      lows:    validIdx.map(function(i){return q.low[i];}),
      closes:  validIdx.map(function(i){return q.close[i];}),
      volumes: validIdx.map(function(i){return q.volume[i]||0;}),
    };

    var closes=data.closes, highs=data.highs, lows=data.lows, volumes=data.volumes;
    var last=closes[closes.length-1], prev=closes[closes.length-2];
    var change=last-prev, changePct=(change/prev)*100;
    var dayN=Math.min(closes.length,78);
    var dayHigh=Math.max.apply(null,highs.slice(-dayN));
    var dayLow=Math.min.apply(null,lows.slice(-dayN));
    var e9=ema(closes,9), e21=ema(closes,21);
    var rsiVal=rsi(closes), macdData=macd(closes), vwapVal=vwap(highs,lows,closes,volumes);
    var avgVol=volumes.slice(-20).reduce(function(a,b){return a+b;},0)/20;
    var lastVol=volumes[volumes.length-1];
    var volRatio=avgVol>0?lastVol/avgVol:1;
    var mom10=closes.length>10?((last-closes[closes.length-11])/closes[closes.length-11])*100:0;

    var signals = {
      last:last, prev:prev, change:change, changePct:changePct,
      dayHigh:dayHigh, dayLow:dayLow,
      ema9:e9[e9.length-1], ema21:e21[e21.length-1],
      rsi:rsiVal, macd:macdData, vwap:vwapVal,
      avgVol:avgVol, lastVol:lastVol, volRatio:volRatio,
      mom10:mom10, trendUp:e9[e9.length-1]>e21[e21.length-1],
      recentCloses:closes.slice(-8),
    };

    res.status(200).json({data:data, signals:signals});

  } catch(err) {
    res.status(500).json({error:err.message});
  }
}
