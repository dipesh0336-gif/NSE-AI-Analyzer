// FILE: pages/api/market.js
// Returns market data + Nifty trend as market filter

function ema(data, p) {
  var k=2/(p+1), e=data[0];
  return data.map(function(v,i){if(i===0)return e;e=v*k+e*(1-k);return e;});
}
function rsi(closes, p) {
  if(!p)p=14;
  if(closes.length<p+1)return 50;
  var g=0,l=0;
  for(var i=1;i<=p;i++){var d=closes[i]-closes[i-1];if(d>0)g+=d;else l-=d;}
  var ag=g/p,al=l/p;
  for(var i=p+1;i<closes.length;i++){var d=closes[i]-closes[i-1];ag=(ag*(p-1)+(d>0?d:0))/p;al=(al*(p-1)+(d<0?-d:0))/p;}
  return al===0?100:100-(100/(1+ag/al));
}
function macdCalc(closes) {
  var e12=ema(closes,12),e26=ema(closes,26);
  var line=e12.map(function(v,i){return v-e26[i];});
  var signal=ema(line.slice(26),9);
  return{hist:line[line.length-1]-signal[signal.length-1],line:line[line.length-1],signal:signal[signal.length-1]};
}
function vwapCalc(highs,lows,closes,volumes){
  var ct=0,cv=0;
  for(var i=0;i<closes.length;i++){var tp=(highs[i]+lows[i]+closes[i])/3;ct+=tp*volumes[i];cv+=volumes[i];}
  return cv>0?ct/cv:closes[closes.length-1];
}

async function fetchYahoo(symbol, interval, range) {
  var yhInterval=interval;
  if(interval==='15min')yhInterval='15m';
  else if(interval==='5min')yhInterval='5m';
  else if(interval==='30min')yhInterval='30m';
  else if(interval==='1h')yhInterval='60m';
  if(!range)range=yhInterval==='5m'?'2d':'5d';

  var url='https://query1.finance.yahoo.com/v8/finance/chart/'+encodeURIComponent(symbol)+'?interval='+yhInterval+'&range='+range;
  var r=await fetch(url,{headers:{'User-Agent':'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36','Accept':'application/json','Referer':'https://finance.yahoo.com'}});
  if(!r.ok)throw new Error('Yahoo Finance returned '+r.status);
  var json=await r.json();
  var result=json.chart&&json.chart.result&&json.chart.result[0];
  if(!result)throw new Error('No data returned for '+symbol);
  var ts=result.timestamps||result.timestamp;
  var q=result.indicators.quote[0];
  var validIdx=ts.map(function(_,i){return i;}).filter(function(i){return q.close[i]!=null&&q.open[i]!=null&&q.high[i]!=null&&q.low[i]!=null;});
  return{
    timestamps:validIdx.map(function(i){return ts[i];}),
    opens:validIdx.map(function(i){return q.open[i];}),
    highs:validIdx.map(function(i){return q.high[i];}),
    lows:validIdx.map(function(i){return q.low[i];}),
    closes:validIdx.map(function(i){return q.close[i];}),
    volumes:validIdx.map(function(i){return q.volume[i]||0;}),
  };
}

function computeSignals(data) {
  var closes=data.closes, highs=data.highs, lows=data.lows, volumes=data.volumes;
  var last=closes[closes.length-1], prev=closes[closes.length-2];
  var change=last-prev, changePct=(change/prev)*100;
  var dayN=Math.min(closes.length,78);
  var dayHigh=Math.max.apply(null,highs.slice(-dayN));
  var dayLow=Math.min.apply(null,lows.slice(-dayN));
  var e9=ema(closes,9), e21=ema(closes,21);
  var rsiVal=rsi(closes), macdData=macdCalc(closes), vwapVal=vwapCalc(highs,lows,closes,volumes);
  var avgVol=volumes.slice(-20).reduce(function(a,b){return a+b;},0)/20;
  var lastVol=volumes[volumes.length-1];
  var volRatio=avgVol>0?lastVol/avgVol:1;
  var mom10=closes.length>10?((last-closes[closes.length-11])/closes[closes.length-11])*100:0;
  return{
    last:last,prev:prev,change:change,changePct:changePct,dayHigh:dayHigh,dayLow:dayLow,
    ema9:e9[e9.length-1],ema21:e21[e21.length-1],rsi:rsiVal,macd:macdData,vwap:vwapVal,
    avgVol:avgVol,lastVol:lastVol,volRatio:volRatio,mom10:mom10,
    trendUp:e9[e9.length-1]>e21[e21.length-1],recentCloses:closes.slice(-8),
  };
}

function getNiftyTrend(data) {
  // Returns nifty market condition: BULLISH, BEARISH, or NEUTRAL
  // Uses multiple timeframe signals on Nifty itself
  var closes=data.closes, highs=data.highs, lows=data.lows;
  if(closes.length<21)return{trend:'NEUTRAL',strength:0,reason:'Insufficient data'};
  var last=closes[closes.length-1];
  var e9=ema(closes,9), e21=ema(closes,21);
  var rsiV=rsi(closes);
  var macdD=macdCalc(closes);
  var vwapV=vwapCalc(highs,lows,closes,data.volumes);
  var change=last-(closes[closes.length-2]||last);
  var changePct=(change/(closes[closes.length-2]||last))*100;
  // 5-bar momentum
  var mom5=closes.length>5?((last-closes[closes.length-6])/closes[closes.length-6])*100:0;

  var score=0;
  if(e9[e9.length-1]>e21[e21.length-1])score+=2; else score-=2;
  if(macdD.hist>0)score+=2; else score-=2;
  if(last>vwapV)score+=1; else score-=1;
  if(rsiV>52)score+=1; else if(rsiV<48)score-=1;
  if(mom5>0.3)score+=1; else if(mom5<-0.3)score-=1;
  if(changePct>0.2)score+=1; else if(changePct<-0.2)score-=1;

  var trend, reason;
  if(score>=4){
    trend='BULLISH';
    reason='Nifty EMA uptrend, MACD positive, price above VWAP Rs '+vwapV.toFixed(0)+', RSI '+rsiV.toFixed(0);
  } else if(score<=-4){
    trend='BEARISH';
    reason='Nifty EMA downtrend, MACD negative, price below VWAP Rs '+vwapV.toFixed(0)+', RSI '+rsiV.toFixed(0);
  } else {
    trend='NEUTRAL';
    reason='Nifty mixed signals - score '+score+', RSI '+rsiV.toFixed(0)+', momentum '+mom5.toFixed(2)+'%';
  }

  return{
    trend:trend,
    score:score,
    reason:reason,
    niftyLast:last,
    niftyChange:changePct.toFixed(2),
    niftyRsi:rsiV.toFixed(0),
    niftyEmaUp:e9[e9.length-1]>e21[e21.length-1],
    niftyAboveVwap:last>vwapV,
    niftyMacdBull:macdD.hist>0,
  };
}

export default async function handler(req, res) {
  var symbol=req.query.symbol, type=req.query.type||'stock', interval=req.query.interval||'15min';
  if(!symbol)return res.status(400).json({error:'Symbol required'});

  // Convert symbol to Yahoo format
  var yhSymbol;
  if(type==='index'){
    var indexMap={'NIFTY':'^NSEI','BANKNIFTY':'^NSEBANK','NIFTY IT':'^CNXIT','NIFTY AUTO':'^CNXAUTO','NIFTY PHARMA':'^CNXPHARMA','NIFTY MIDCAP 50':'^CNXMIDCAP','NIFTY FMCG':'^CNXFMCG','NIFTY METAL':'^CNXMETAL'};
    yhSymbol=indexMap[symbol]||('^'+symbol);
  } else {
    yhSymbol=symbol+'.NS';
  }

  try{
    // Fetch instrument data and Nifty data in parallel
    var isNifty=(symbol==='NIFTY'&&type==='index');
    var promises=[fetchYahoo(yhSymbol, interval)];
    if(!isNifty){
      // Also fetch Nifty 50 as market filter
      promises.push(fetchYahoo('^NSEI', interval));
    }

    var results=await Promise.all(promises);
    var data=results[0];
    var niftyData=isNifty?data:results[1];

    if(data.closes.length<10)throw new Error('Not enough data. Try during NSE hours: 09:15-15:30 IST on weekdays.');

    var signals=computeSignals(data);
    var niftyTrend=getNiftyTrend(niftyData);

    res.status(200).json({data:data, signals:signals, niftyTrend:niftyTrend});

  }catch(err){
    res.status(500).json({error:err.message});
  }
}
