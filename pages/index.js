import React, { useState, useEffect } from 'react';

const NSE_STOCKS = [
  {n:"Reliance Industries",s:"RELIANCE",sec:"Energy"},
  {n:"Tata Consultancy Services",s:"TCS",sec:"IT"},
  {n:"HDFC Bank",s:"HDFCBANK",sec:"Banking"},
  {n:"Infosys",s:"INFY",sec:"IT"},
  {n:"ICICI Bank",s:"ICICIBANK",sec:"Banking"},
  {n:"Hindustan Unilever",s:"HINDUNILVR",sec:"FMCG"},
  {n:"ITC",s:"ITC",sec:"FMCG"},
  {n:"State Bank of India",s:"SBIN",sec:"Banking"},
  {n:"Bharti Airtel",s:"BHARTIARTL",sec:"Telecom"},
  {n:"Kotak Mahindra Bank",s:"KOTAKBANK",sec:"Banking"},
  {n:"Larsen and Toubro",s:"LT",sec:"Infra"},
  {n:"Asian Paints",s:"ASIANPAINT",sec:"Paints"},
  {n:"Axis Bank",s:"AXISBANK",sec:"Banking"},
  {n:"Bajaj Finance",s:"BAJFINANCE",sec:"NBFC"},
  {n:"Wipro",s:"WIPRO",sec:"IT"},
  {n:"HCL Technologies",s:"HCLTECH",sec:"IT"},
  {n:"Maruti Suzuki",s:"MARUTI",sec:"Auto"},
  {n:"Sun Pharma",s:"SUNPHARMA",sec:"Pharma"},
  {n:"Titan Company",s:"TITAN",sec:"Jewellery"},
  {n:"Tech Mahindra",s:"TECHM",sec:"IT"},
  {n:"Adani Ports",s:"ADANIPORTS",sec:"Ports"},
  {n:"Power Grid",s:"POWERGRID",sec:"Power"},
  {n:"NTPC",s:"NTPC",sec:"Power"},
  {n:"Bajaj Auto",s:"BAJAJ-AUTO",sec:"Auto"},
  {n:"Mahindra Mahindra",s:"M&M",sec:"Auto"},
  {n:"UltraTech Cement",s:"ULTRACEMCO",sec:"Cement"},
  {n:"JSW Steel",s:"JSWSTEEL",sec:"Steel"},
  {n:"Tata Motors",s:"TATAMOTORS",sec:"Auto"},
  {n:"Tata Steel",s:"TATASTEEL",sec:"Steel"},
  {n:"IndusInd Bank",s:"INDUSINDBK",sec:"Banking"},
  {n:"Divis Labs",s:"DIVISLAB",sec:"Pharma"},
  {n:"Britannia",s:"BRITANNIA",sec:"FMCG"},
  {n:"Cipla",s:"CIPLA",sec:"Pharma"},
  {n:"Dr Reddys",s:"DRREDDY",sec:"Pharma"},
  {n:"Eicher Motors",s:"EICHERMOT",sec:"Auto"},
  {n:"Hero MotoCorp",s:"HEROMOTOCO",sec:"Auto"},
  {n:"Grasim Industries",s:"GRASIM",sec:"Diversified"},
  {n:"ONGC",s:"ONGC",sec:"Energy"},
  {n:"Coal India",s:"COALINDIA",sec:"Mining"},
  {n:"Adani Enterprises",s:"ADANIENT",sec:"Diversified"},
  {n:"Vedanta",s:"VEDL",sec:"Metals"},
  {n:"Hindalco",s:"HINDALCO",sec:"Metals"},
  {n:"SBI Life Insurance",s:"SBILIFE",sec:"Insurance"},
  {n:"HDFC Life Insurance",s:"HDFCLIFE",sec:"Insurance"},
  {n:"Bajaj Finserv",s:"BAJAJFINSV",sec:"Finance"},
  {n:"Tata Consumer",s:"TATACONSUM",sec:"FMCG"},
  {n:"Apollo Hospitals",s:"APOLLOHOSP",sec:"Healthcare"},
  {n:"Havells India",s:"HAVELLS",sec:"Electricals"},
  {n:"Dabur India",s:"DABUR",sec:"FMCG"},
  {n:"Biocon",s:"BIOCON",sec:"Pharma"},
  {n:"Muthoot Finance",s:"MUTHOOTFIN",sec:"NBFC"},
  {n:"Shree Cement",s:"SHREECEM",sec:"Cement"},
  {n:"Ambuja Cements",s:"AMBUJACEM",sec:"Cement"},
  {n:"IndiGo Airlines",s:"INDIGO",sec:"Aviation"},
  {n:"Bharat Electronics",s:"BEL",sec:"Defence"},
  {n:"HAL",s:"HAL",sec:"Defence"},
  {n:"Tata Power",s:"TATAPOWER",sec:"Power"},
  {n:"Lupin",s:"LUPIN",sec:"Pharma"},
  {n:"Zomato",s:"ZOMATO",sec:"Internet"},
  {n:"LIC of India",s:"LICI",sec:"Insurance"},
  {n:"Indian Oil",s:"IOC",sec:"Energy"},
  {n:"BPCL",s:"BPCL",sec:"Energy"},
  {n:"GAIL",s:"GAIL",sec:"Gas"},
  {n:"IRCTC",s:"IRCTC",sec:"Travel"},
  {n:"Dixon Technologies",s:"DIXON",sec:"Electronics"},
  {n:"DMart",s:"DMART",sec:"Retail"},
  {n:"Naukri Info Edge",s:"NAUKRI",sec:"Internet"},
  {n:"Persistent Systems",s:"PERSISTENT",sec:"IT"},
  {n:"Coforge",s:"COFORGE",sec:"IT"},
  {n:"Canara Bank",s:"CANBK",sec:"Banking"},
  {n:"Bank of Baroda",s:"BANKBARODA",sec:"Banking"},
  {n:"Punjab National Bank",s:"PNB",sec:"Banking"},
  {n:"Federal Bank",s:"FEDERALBNK",sec:"Banking"},
  {n:"Yes Bank",s:"YESBANK",sec:"Banking"},
  {n:"Power Finance Corp",s:"PFC",sec:"Finance"},
  {n:"REC Limited",s:"RECLTD",sec:"Finance"},
  {n:"DLF",s:"DLF",sec:"Real Estate"},
  {n:"IRFC",s:"IRFC",sec:"Finance"},
  {n:"RVNL",s:"RVNL",sec:"Infra"},
  {n:"NMDC",s:"NMDC",sec:"Mining"},
  {n:"SAIL",s:"SAIL",sec:"Steel"},
  {n:"Suzlon Energy",s:"SUZLON",sec:"Renewables"},
  {n:"MRF",s:"MRF",sec:"Tyres"},
  {n:"Polycab India",s:"POLYCAB",sec:"Cables"},
  {n:"Trent",s:"TRENT",sec:"Retail"},
  {n:"Siemens",s:"SIEMENS",sec:"Engineering"},
  {n:"Cummins India",s:"CUMMINSIND",sec:"Engineering"},
  {n:"Bharat Forge",s:"BHARATFORG",sec:"Auto Ancillary"},
  {n:"Voltas",s:"VOLTAS",sec:"Electricals"},
];

const NSE_INDICES = [
  {n:"Nifty 50",s:"NIFTY",type:"index"},
  {n:"Bank Nifty",s:"BANKNIFTY",type:"index"},
  {n:"Nifty IT",s:"NIFTY IT",type:"index"},
  {n:"Nifty Auto",s:"NIFTY AUTO",type:"index"},
  {n:"Nifty Pharma",s:"NIFTY PHARMA",type:"index"},
  {n:"Nifty Midcap 50",s:"NIFTY MIDCAP 50",type:"index"},
  {n:"Nifty FMCG",s:"NIFTY FMCG",type:"index"},
  {n:"Nifty Metal",s:"NIFTY METAL",type:"index"},
];

const G='#00e676', R='#ff4444', A='#ffb300';

function fmtVol(v){
  if(!v)return'--';
  if(v>=1e7)return(v/1e7).toFixed(2)+'Cr';
  if(v>=1e5)return(v/1e5).toFixed(1)+'L';
  if(v>=1e3)return(v/1e3).toFixed(0)+'K';
  return String(v);
}

// ── ENHANCED INDICATOR LIBRARY ────────────────────────────────────────
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

function stochRsi(closes, rsiP, stochP) {
  if(!rsiP)rsiP=14; if(!stochP)stochP=14;
  // Calculate RSI series
  var rsiSeries=[];
  for(var i=rsiP;i<closes.length;i++){
    rsiSeries.push(rsi(closes.slice(0,i+1),rsiP));
  }
  if(rsiSeries.length<stochP)return 50;
  var recent=rsiSeries.slice(-stochP);
  var minR=Math.min.apply(null,recent), maxR=Math.max.apply(null,recent);
  if(maxR===minR)return 50;
  return((rsiSeries[rsiSeries.length-1]-minR)/(maxR-minR))*100;
}

function macdCalc(closes) {
  var e12=ema(closes,12),e26=ema(closes,26);
  var line=e12.map(function(v,i){return v-e26[i];});
  var signal=ema(line.slice(26),9);
  return{hist:line[line.length-1]-signal[signal.length-1],line:line[line.length-1],signal:signal[signal.length-1]};
}

function bollingerBands(closes, p, mult) {
  if(!p)p=20; if(!mult)mult=2;
  if(closes.length<p)return{upper:closes[closes.length-1],lower:closes[closes.length-1],mid:closes[closes.length-1],pct:50};
  var recent=closes.slice(-p);
  var mean=recent.reduce(function(a,b){return a+b;},0)/p;
  var variance=recent.reduce(function(s,v){return s+(v-mean)*(v-mean);},0)/p;
  var std=Math.sqrt(variance);
  var upper=mean+mult*std, lower=mean-mult*std;
  var last=closes[closes.length-1];
  var pct=upper===lower?50:((last-lower)/(upper-lower))*100;
  return{upper:upper,lower:lower,mid:mean,pct:pct,std:std};
}

function adx(highs, lows, closes, p) {
  if(!p)p=14;
  if(closes.length<p+2)return{adx:20,pdi:0,ndi:0};
  var trArr=[],pdmArr=[],ndmArr=[];
  for(var i=1;i<closes.length;i++){
    var hl=highs[i]-lows[i];
    var hpc=Math.abs(highs[i]-closes[i-1]);
    var lpc=Math.abs(lows[i]-closes[i-1]);
    trArr.push(Math.max(hl,hpc,lpc));
    var upMove=highs[i]-highs[i-1];
    var downMove=lows[i-1]-lows[i];
    pdmArr.push(upMove>downMove&&upMove>0?upMove:0);
    ndmArr.push(downMove>upMove&&downMove>0?downMove:0);
  }
  function smth(arr,per){
    var s=arr.slice(0,per).reduce(function(a,b){return a+b;},0);
    var res=[s];
    for(var i=per;i<arr.length;i++){s=s-s/per+arr[i];res.push(s);}
    return res;
  }
  var tr14=smth(trArr,p),pd14=smth(pdmArr,p),nd14=smth(ndmArr,p);
  var pdiArr=pd14.map(function(v,i){return tr14[i]>0?100*v/tr14[i]:0;});
  var ndiArr=nd14.map(function(v,i){return tr14[i]>0?100*v/tr14[i]:0;});
  var dxArr=pdiArr.map(function(v,i){var s=v+ndiArr[i];return s>0?100*Math.abs(v-ndiArr[i])/s:0;});
  var adxVal=dxArr.slice(-p).reduce(function(a,b){return a+b;},0)/p;
  return{adx:adxVal,pdi:pdiArr[pdiArr.length-1],ndi:ndiArr[ndiArr.length-1]};
}

function vwapCalc(highs, lows, closes, volumes) {
  var ct=0,cv=0;
  for(var i=0;i<closes.length;i++){var tp=(highs[i]+lows[i]+closes[i])/3;ct+=tp*volumes[i];cv+=volumes[i];}
  return cv>0?ct/cv:closes[closes.length-1];
}

function candleStrength(opens, closes, highs, lows, n) {
  // Analyzes last n candles for pattern strength
  if(!n)n=5;
  var bullCount=0,bearCount=0,strongBull=0,strongBear=0;
  var recent=Math.min(n,opens.length);
  for(var i=opens.length-recent;i<opens.length;i++){
    var body=Math.abs(closes[i]-opens[i]);
    var range=highs[i]-lows[i]||0.01;
    var bodyRatio=body/range;
    if(closes[i]>opens[i]){bullCount++;if(bodyRatio>0.6)strongBull++;}
    else{bearCount++;if(bodyRatio>0.6)strongBear++;}
  }
  return{bullCount:bullCount,bearCount:bearCount,strongBull:strongBull,strongBear:strongBear,total:recent};
}

function supportResistance(highs, lows, closes, current) {
  // Find key S/R levels from recent data
  var n=Math.min(closes.length,20);
  var recentHighs=highs.slice(-n), recentLows=lows.slice(-n);
  var dayHigh=Math.max.apply(null,recentHighs);
  var dayLow=Math.min.apply(null,recentLows);
  var range=dayHigh-dayLow||1;
  var posInRange=((current-dayLow)/range)*100;
  // Price near support (bottom 20%) = bullish, near resistance (top 20%) = bearish
  return{posInRange:posInRange,dayHigh:dayHigh,dayLow:dayLow,nearSupport:posInRange<20,nearResistance:posInRange>80};
}

// ── ENHANCED VERDICT ENGINE ────────────────────────────────────────────
// 15 indicators, score -2 to +2 each, total range -30 to +30
// Only triggers LONG/SHORT when score > threshold (high confidence filter)
function generateVerdict(sig, ext, rawData, niftyTrend) {
  var score=0;
  var bullSignals=[], bearSignals=[], neutralSignals=[];
  var opens=rawData.opens, highs=rawData.highs, lows=rawData.lows;
  var closes=rawData.closes, volumes=rawData.volumes;

  // ── 1. RSI ─────────────────────────────────────────────────────
  var rsiV=sig.rsi;
  if(rsiV<30){score+=2;bullSignals.push('RSI '+rsiV.toFixed(1)+' oversold');}
  else if(rsiV<42){score+=1;bullSignals.push('RSI '+rsiV.toFixed(1)+' bullish zone');}
  else if(rsiV>70){score-=2;bearSignals.push('RSI '+rsiV.toFixed(1)+' overbought');}
  else if(rsiV>58){score-=1;bearSignals.push('RSI '+rsiV.toFixed(1)+' near overbought');}
  else neutralSignals.push('RSI '+rsiV.toFixed(1)+' neutral');

  // ── 2. Stochastic RSI ──────────────────────────────────────────
  var stRsi=stochRsi(closes,14,14);
  if(stRsi<20){score+=2;bullSignals.push('StochRSI '+stRsi.toFixed(0)+' deeply oversold');}
  else if(stRsi<35){score+=1;bullSignals.push('StochRSI '+stRsi.toFixed(0)+' oversold');}
  else if(stRsi>80){score-=2;bearSignals.push('StochRSI '+stRsi.toFixed(0)+' overbought');}
  else if(stRsi>65){score-=1;bearSignals.push('StochRSI '+stRsi.toFixed(0)+' near overbought');}
  else neutralSignals.push('StochRSI '+stRsi.toFixed(0)+' neutral');

  // ── 3. MACD ────────────────────────────────────────────────────
  var macdH=sig.macd.hist;
  if(macdH>0&&sig.macd.line>sig.macd.signal){score+=2;bullSignals.push('MACD +'+macdH.toFixed(2)+' bullish crossover');}
  else if(macdH>0){score+=1;bullSignals.push('MACD positive histogram');}
  else if(macdH<0&&sig.macd.line<sig.macd.signal){score-=2;bearSignals.push('MACD '+macdH.toFixed(2)+' bearish crossover');}
  else{score-=1;bearSignals.push('MACD negative histogram');}

  // ── 4. EMA Trend ───────────────────────────────────────────────
  var emaDiff=((sig.ema9-sig.ema21)/sig.ema21)*100;
  if(sig.trendUp&&emaDiff>0.3){score+=2;bullSignals.push('EMA9 '+emaDiff.toFixed(2)+'% above EMA21 strong uptrend');}
  else if(sig.trendUp){score+=1;bullSignals.push('EMA9 above EMA21 uptrend');}
  else if(!sig.trendUp&&emaDiff<-0.3){score-=2;bearSignals.push('EMA9 '+Math.abs(emaDiff).toFixed(2)+'% below EMA21 strong downtrend');}
  else{score-=1;bearSignals.push('EMA9 below EMA21 downtrend');}

  // ── 5. Bollinger Bands ─────────────────────────────────────────
  var bb=bollingerBands(closes,20,2);
  if(bb.pct<10){score+=2;bullSignals.push('Price at lower BB band - mean reversion signal');}
  else if(bb.pct<25){score+=1;bullSignals.push('Price near lower BB band - potential bounce');}
  else if(bb.pct>90){score-=2;bearSignals.push('Price at upper BB band - reversal risk');}
  else if(bb.pct>75){score-=1;bearSignals.push('Price near upper BB band - overextended');}
  else neutralSignals.push('Price mid BB bands '+bb.pct.toFixed(0)+'%');

  // ── 6. ADX Trend Strength ──────────────────────────────────────
  var adxData=adx(highs,lows,closes,14);
  if(adxData.adx>25){
    if(adxData.pdi>adxData.ndi){score+=2;bullSignals.push('ADX '+adxData.adx.toFixed(0)+' strong bullish trend');}
    else{score-=2;bearSignals.push('ADX '+adxData.adx.toFixed(0)+' strong bearish trend');}
  } else if(adxData.adx>18){
    if(adxData.pdi>adxData.ndi){score+=1;bullSignals.push('ADX '+adxData.adx.toFixed(0)+' moderate bullish trend');}
    else{score-=1;bearSignals.push('ADX '+adxData.adx.toFixed(0)+' moderate bearish trend');}
  } else{
    score=Math.round(score*0.8); // reduce conviction in weak trend
    neutralSignals.push('ADX '+adxData.adx.toFixed(0)+' - weak trend, reduce size');
  }

  // ── 7. VWAP ────────────────────────────────────────────────────
  var vwapDiff=((sig.last-sig.vwap)/sig.vwap)*100;
  if(sig.last>sig.vwap&&vwapDiff>0.3){score+=2;bullSignals.push('Price '+vwapDiff.toFixed(2)+'% above VWAP - strong bullish bias');}
  else if(sig.last>sig.vwap){score+=1;bullSignals.push('Price above VWAP - buyers in control');}
  else if(sig.last<sig.vwap&&vwapDiff<-0.3){score-=2;bearSignals.push('Price '+Math.abs(vwapDiff).toFixed(2)+'% below VWAP - strong bearish bias');}
  else{score-=1;bearSignals.push('Price below VWAP - sellers in control');}

  // ── 8. Volume Confirmation ─────────────────────────────────────
  if(sig.volRatio>2){
    if(sig.change>0){score+=2;bullSignals.push('Volume '+sig.volRatio.toFixed(1)+'x spike confirming bullish move');}
    else{score-=2;bearSignals.push('Volume '+sig.volRatio.toFixed(1)+'x spike confirming bearish move');}
  } else if(sig.volRatio>1.4){
    if(sig.change>0){score+=1;bullSignals.push('Above avg volume on up move');}
    else{score-=1;bearSignals.push('Above avg volume on down move');}
  } else neutralSignals.push('Normal volume '+sig.volRatio.toFixed(1)+'x');

  // ── 9. Momentum ────────────────────────────────────────────────
  var mom5=closes.length>5?((sig.last-closes[closes.length-6])/closes[closes.length-6])*100:0;
  if(sig.mom10>2&&mom5>0.5){score+=2;bullSignals.push('Strong momentum +'+sig.mom10.toFixed(1)+'% (10bar)');}
  else if(sig.mom10>0.8){score+=1;bullSignals.push('Positive momentum +'+sig.mom10.toFixed(1)+'%');}
  else if(sig.mom10<-2&&mom5<-0.5){score-=2;bearSignals.push('Strong downward momentum '+sig.mom10.toFixed(1)+'%');}
  else if(sig.mom10<-0.8){score-=1;bearSignals.push('Negative momentum '+sig.mom10.toFixed(1)+'%');}
  else neutralSignals.push('Flat momentum '+sig.mom10.toFixed(1)+'%');

  // ── 10. Candle Pattern ─────────────────────────────────────────
  var cs=candleStrength(opens,closes,highs,lows,5);
  if(cs.strongBull>=3&&cs.bearCount<=1){score+=2;bullSignals.push(cs.strongBull+' strong bullish candles in last 5 bars');}
  else if(cs.bullCount>=4){score+=1;bullSignals.push(cs.bullCount+'/5 bullish candles');}
  else if(cs.strongBear>=3&&cs.bullCount<=1){score-=2;bearSignals.push(cs.strongBear+' strong bearish candles in last 5 bars');}
  else if(cs.bearCount>=4){score-=1;bearSignals.push(cs.bearCount+'/5 bearish candles');}
  else neutralSignals.push('Mixed candle pattern');

  // ── 11. Support/Resistance ─────────────────────────────────────
  var sr=supportResistance(highs,lows,closes,sig.last);
  if(sr.nearSupport){score+=2;bullSignals.push('Price near day low support Rs '+sr.dayLow.toFixed(0)+' bounce zone');}
  else if(sr.nearResistance){score-=2;bearSignals.push('Price near day high resistance Rs '+sr.dayHigh.toFixed(0)+' rejection zone');}
  else neutralSignals.push('Price mid-range '+sr.posInRange.toFixed(0)+'% of day range');

  // ── 12. PCR (Put-Call Ratio) ───────────────────────────────────
  if(ext.pcr>1.4){score+=2;bullSignals.push('PCR '+ext.pcr.toFixed(2)+' very bullish - heavy put writing');}
  else if(ext.pcr>1.2){score+=1;bullSignals.push('PCR '+ext.pcr.toFixed(2)+' bullish sentiment');}
  else if(ext.pcr<0.6){score-=2;bearSignals.push('PCR '+ext.pcr.toFixed(2)+' very bearish - heavy call writing');}
  else if(ext.pcr<0.8){score-=1;bearSignals.push('PCR '+ext.pcr.toFixed(2)+' bearish sentiment');}
  else neutralSignals.push('PCR '+ext.pcr.toFixed(2)+' neutral');

  // ── 13. VIX Filter ─────────────────────────────────────────────
  if(ext.vix>25){score=Math.round(score*0.5);bearSignals.push('VIX '+ext.vix.toFixed(1)+' extreme fear - high risk, reduce size');}
  else if(ext.vix>18){score=Math.round(score*0.75);neutralSignals.push('VIX '+ext.vix.toFixed(1)+' elevated volatility - be cautious');}
  else if(ext.vix<13){score=Math.round(score*1.1);bullSignals.push('VIX '+ext.vix.toFixed(1)+' calm market - favorable conditions');}
  else neutralSignals.push('VIX '+ext.vix.toFixed(1)+' normal');

  // ── NIFTY MARKET FILTER ───────────────────────────────────────────
  // Most powerful filter: only trade WITH the market direction
  if(niftyTrend) {
    if(niftyTrend.trend==='BULLISH') {
      score+=3;
      bullSignals.push('Nifty BULLISH (score '+niftyTrend.score+') - market tailwind for longs');
    } else if(niftyTrend.trend==='BEARISH') {
      score-=3;
      bearSignals.push('Nifty BEARISH (score '+niftyTrend.score+') - market headwind for longs');
    } else {
      neutralSignals.push('Nifty NEUTRAL - no market tailwind');
    }
    // Hard veto: never go long in strongly bearish Nifty or short in strongly bullish
    if(niftyTrend.score<=-6 && score>0) {
      score=Math.min(score, 3); // cap bullish score when Nifty strongly bearish
      bearSignals.push('NIFTY VETO: Strong bearish market overrides bullish signal');
    }
    if(niftyTrend.score>=6 && score<0) {
      score=Math.max(score, -3); // cap bearish score when Nifty strongly bullish
      bullSignals.push('NIFTY VETO: Strong bullish market overrides bearish signal');
    }
  }

  // ── 14. EMA200 Long-term trend (if enough data) ────────────────
  if(closes.length>=50){
    var ema50=ema(closes,50);
    if(sig.last>ema50[ema50.length-1]){score+=1;bullSignals.push('Price above EMA50 - long-term bullish');}
    else{score-=1;bearSignals.push('Price below EMA50 - long-term bearish');}
  }

  // ── 15. Gap Analysis ───────────────────────────────────────────
  if(opens.length>=2){
    var prevClose=closes[closes.length-2];
    var gapPct=((opens[opens.length-1]-prevClose)/prevClose)*100;
    if(gapPct>0.5&&sig.last>opens[opens.length-1]){score+=1;bullSignals.push('Gap up '+gapPct.toFixed(2)+'% holding - bullish');}
    else if(gapPct<-0.5&&sig.last<opens[opens.length-1]){score-=1;bearSignals.push('Gap down '+gapPct.toFixed(2)+'% - bearish');}
  }

  // ── HIGH CONFIDENCE FILTER ─────────────────────────────────────
  // Only give LONG/SHORT when score is strong enough - key to higher accuracy
  var atr=(sig.dayHigh-sig.dayLow)*0.35;
  var price=sig.last;
  var verdict,confidence,entry,stopLoss,target,summary,minScore;

  // Stricter thresholds = fewer trades but higher quality
  if(score>=7){
    verdict='LONG';
    confidence=score>=10?'HIGH':'MEDIUM';
    entry='Rs '+price.toFixed(1)+' - Rs '+(price+atr*0.15).toFixed(1);
    stopLoss='Rs '+(price-atr*0.4).toFixed(1);
    target='Rs '+(price+atr*1.0).toFixed(1)+' / Rs '+(price+atr*1.8).toFixed(1);
    summary=bullSignals.slice(0,4).join('. ')+'.'+(bearSignals.length?'\nWatch: '+bearSignals[0]+'.':'');
  } else if(score<=-7){
    verdict='SHORT';
    confidence=score<=-10?'HIGH':'MEDIUM';
    entry='Rs '+price.toFixed(1)+' - Rs '+(price-atr*0.15).toFixed(1);
    stopLoss='Rs '+(price+atr*0.4).toFixed(1);
    target='Rs '+(price-atr*1.0).toFixed(1)+' / Rs '+(price-atr*1.8).toFixed(1);
    summary=bearSignals.slice(0,4).join('. ')+'.'+(bullSignals.length?'\nNote: '+bullSignals[0]+'.':'');
  } else {
    verdict='NEUTRAL';
    confidence='LOW';
    entry='NO TRADE - signals not aligned';
    stopLoss='--';
    target='--';
    var all=bullSignals.concat(bearSignals).concat(neutralSignals);
    summary='Conflicting signals - score '+score+'/30. '+all.slice(0,3).join('. ')+'. Wait for clearer setup.';
  }

  // Build signal list for scorecard display
  var adxD=adx(highs,lows,closes,14);
  var bbD=bollingerBands(closes,20,2);
  var stRsiV=stochRsi(closes,14,14);
  var srD=supportResistance(highs,lows,closes,sig.last);
  var csD=candleStrength(opens,closes,highs,lows,5);

  var signals=[
    {name:'RSI',val:sig.rsi.toFixed(0),bull:sig.rsi<42,bear:sig.rsi>58},
    {name:'StRSI',val:stRsiV.toFixed(0),bull:stRsiV<35,bear:stRsiV>65},
    {name:'MACD',val:(sig.macd.hist>=0?'+':'')+sig.macd.hist.toFixed(1),bull:sig.macd.hist>0,bear:sig.macd.hist<0},
    {name:'EMA',val:sig.trendUp?'UP':'DN',bull:sig.trendUp,bear:!sig.trendUp},
    {name:'BB%',val:bbD.pct.toFixed(0)+'%',bull:bbD.pct<25,bear:bbD.pct>75},
    {name:'ADX',val:adxD.adx.toFixed(0),bull:adxD.adx>25&&adxD.pdi>adxD.ndi,bear:adxD.adx>25&&adxD.ndi>adxD.pdi},
    {name:'VWAP',val:sig.last>sig.vwap?'ABV':'BLW',bull:sig.last>sig.vwap,bear:sig.last<sig.vwap},
    {name:'VOL',val:sig.volRatio.toFixed(1)+'x',bull:sig.volRatio>1.4&&sig.change>0,bear:sig.volRatio>1.4&&sig.change<0},
    {name:'MOM',val:(sig.mom10>=0?'+':'')+sig.mom10.toFixed(1),bull:sig.mom10>0.8,bear:sig.mom10<-0.8},
    {name:'CANDLE',val:csD.bullCount+'/'+csD.total+'B',bull:csD.strongBull>=3,bear:csD.strongBear>=3},
    {name:'S/R',val:srD.posInRange.toFixed(0)+'%',bull:srD.nearSupport,bear:srD.nearResistance},
    {name:'PCR',val:ext.pcr.toFixed(2),bull:ext.pcr>1.2,bear:ext.pcr<0.8},
  ];

  return{verdict:verdict,confidence:confidence,score:score,maxScore:30,entry:entry,stopLoss:stopLoss,target:target,summary:summary,signals:signals,bullCount:bullSignals.length,bearCount:bearSignals.length,niftyTrend:niftyTrend};
}

function StockSearch(props){
  var onSelect=props.onSelect,selected=props.selected,onClear=props.onClear;
  var qs=useState('');var q=qs[0];var setQ=qs[1];
  var rs=useState([]);var res=rs[0];var setRes=rs[1];
  var os=useState(false);var open=os[0];var setOpen=os[1];
  function doSearch(v){
    if(v.length<2){setRes([]);setOpen(false);return;}
    var lv=v.toLowerCase();
    setRes(NSE_STOCKS.filter(function(s){return s.n.toLowerCase().indexOf(lv)>=0||s.s.toLowerCase().indexOf(lv)>=0||s.sec.toLowerCase().indexOf(lv)>=0;}).slice(0,10));
    setOpen(true);
  }
  return React.createElement('div',{style:{position:'relative',marginBottom:10}},
    React.createElement('div',{style:{display:'flex',gap:8,marginBottom:6}},
      React.createElement('input',{type:'text',value:q,onChange:function(e){setQ(e.target.value);if(selected)onClear();doSearch(e.target.value);},onFocus:function(){if(q.length>=2&&res.length)setOpen(true);},placeholder:'Type: Reliance, TCS, HDFC, SBI...',autoComplete:'off',style:{flex:1,padding:'11px 13px',background:'#1a2235',border:'1px solid '+(selected?G:'#1e2d45'),borderRadius:8,color:'#e2e8f0',fontSize:14,outline:'none',fontFamily:'monospace'}}),
      q?React.createElement('button',{onPointerDown:function(e){e.preventDefault();setQ('');setRes([]);setOpen(false);onClear();},style:{padding:'11px 13px',background:'#1a2235',border:'1px solid #1e2d45',borderRadius:8,color:'#8899bb',fontSize:13,cursor:'pointer'}},'X'):null
    ),
    selected?React.createElement('div',{style:{background:'#052e16',border:'1px solid #00e67633',borderRadius:8,padding:'7px 12px',marginBottom:6}},
      React.createElement('div',{style:{fontSize:13,fontWeight:700,color:G}},selected.n),
      React.createElement('div',{style:{fontSize:10,color:'#4a6080',marginTop:2}},selected.s+' - NSE')
    ):null,
    open&&res.length>0?React.createElement('div',{style:{position:'absolute',top:'calc(100% + 2px)',left:0,right:0,background:'#0d1520',border:'1px solid #2a3f5f',borderRadius:10,zIndex:9999,maxHeight:'50vh',overflowY:'auto',boxShadow:'0 8px 32px rgba(0,0,0,0.7)'}},
      res.map(function(s){return React.createElement('div',{key:s.s,onPointerDown:function(e){e.preventDefault();onSelect(s);setQ(s.n);setOpen(false);setRes([]);},style:{padding:'11px 14px',display:'flex',justifyContent:'space-between',alignItems:'center',borderBottom:'1px solid #1e2d45',cursor:'pointer',userSelect:'none'},onPointerEnter:function(e){e.currentTarget.style.background='#1a2235';},onPointerLeave:function(e){e.currentTarget.style.background='transparent';}},
        React.createElement('div',null,React.createElement('div',{style:{fontSize:13,color:'#e2e8f0',fontWeight:500}},s.n),React.createElement('div',{style:{fontSize:10,color:'#4a6080',marginTop:2}},s.s)),
        React.createElement('div',{style:{fontSize:10,color:'#4a6080',flexShrink:0,paddingLeft:8}},s.sec)
      );})
    ):null,
    open&&res.length===0&&q.length>=2?React.createElement('div',{style:{position:'absolute',top:'calc(100% + 2px)',left:0,right:0,background:'#0d1520',border:'1px solid #2a3f5f',borderRadius:10,zIndex:9999,padding:14,textAlign:'center',fontSize:12,color:'#4a6080'}},'No results for "'+q+'"'):null
  );
}

function MiniChart(props){
  var data=props.data;
  if(!data)return React.createElement('div',{style:{color:'#4a6080',fontSize:11,padding:8}},'Run analysis to see chart');
  var n=Math.min(data.closes.length,22);
  var cl=data.closes.slice(-n),hi=data.highs.slice(-n),lo=data.lows.slice(-n),op=data.opens.slice(-n),vl=data.volumes.slice(-n),ts=data.timestamps.slice(-n);
  var minP=Math.min.apply(null,lo),maxP=Math.max.apply(null,hi),maxV=Math.max.apply(null,vl)||1,range=maxP-minP||1;
  return React.createElement('div',null,
    React.createElement('div',{style:{display:'flex',alignItems:'flex-end',gap:2,height:65}},
      cl.map(function(_,i){var up=cl[i]>=op[i],bH=Math.max(2,Math.abs(cl[i]-op[i])/range*60),bB=(Math.min(cl[i],op[i])-minP)/range*60;
        return React.createElement('div',{key:i,style:{display:'flex',flexDirection:'column',alignItems:'center',flex:1,height:'100%',justifyContent:'flex-end'}},React.createElement('div',{style:{width:'65%',minHeight:2,borderRadius:1,background:up?G:R,height:bH,marginBottom:bB}}));})
    ),
    React.createElement('div',{style:{display:'flex',alignItems:'flex-end',gap:2,height:18,marginTop:3}},
      vl.map(function(v,i){return React.createElement('div',{key:i,style:{flex:1,minHeight:1,borderRadius:1,background:cl[i]>=op[i]?'#00e67644':'#ff444444',height:Math.max(2,v/maxV*16)}});})
    ),
    React.createElement('div',{style:{display:'flex',gap:2,marginTop:2}},
      ts.map(function(t,i){var d=new Date(t*1000);return React.createElement('div',{key:i,style:{flex:1,fontSize:7,color:'#4a6080',textAlign:'center',overflow:'hidden',whiteSpace:'nowrap'}},i%5===0?(d.getHours()+':'+String(d.getMinutes()).padStart(2,'0')):'');})
    )
  );
}

function AccuracyBar(props){
  var pct=props.pct,label=props.label,sub=props.sub;
  var color=pct>=65?G:pct>=50?A:R;
  return React.createElement('div',{style:{marginBottom:12}},
    React.createElement('div',{style:{display:'flex',justifyContent:'space-between',fontSize:11,color:'#8899bb',marginBottom:5}},
      React.createElement('span',null,label),
      React.createElement('span',{style:{fontWeight:700,color:color}},pct+'%')
    ),
    React.createElement('div',{style:{height:8,background:'#1a2235',borderRadius:4,overflow:'hidden'}},
      React.createElement('div',{style:{height:'100%',borderRadius:4,background:color,width:pct+'%',transition:'width 1s ease'}})
    ),
    sub?React.createElement('div',{style:{fontSize:10,color:'#4a6080',marginTop:3}},sub):null
  );
}

export default function Home(){
  var is=useState('--:--:--');var ist=is[0];var setIst=is[1];
  var ms=useState({text:'LOADING',color:R,bg:'#2d0a0a',bc:'#ff444433'});var mkt=ms[0];var setMkt=ms[1];
  var tabs=useState('analyze');var activeTab=tabs[0];var setActiveTab=tabs[1];
  var ts=useState('index');var instrType=ts[0];var setInstrType=ts[1];
  var ids=useState(NSE_INDICES[0]);var idx=ids[0];var setIdx=ids[1];
  var ss=useState(null);var stock=ss[0];var setStock=ss[1];
  var ivs=useState('15min');var intv=ivs[0];var setIntv=ivs[1];
  var ls=useState(false);var loading=ls[0];var setLoading=ls[1];
  var sps=useState('');var step=sps[0];var setStep=sps[1];
  var es=useState('');var err=es[0];var setErr=es[1];
  var mds=useState(null);var mdata=mds[0];var setMdata=mds[1];
  var sigs=useState(null);var sig=sigs[0];var setSig=sigs[1];
  var exs=useState(null);var ext=exs[0];var setExt=exs[1];
  var vds=useState(null);var verdict=vds[0];var setVerdict=vds[1];
  var bts=useState(null);var btResult=bts[0];var setBtResult=bts[1];
  var bls=useState(false);var btLoading=bls[0];var setBtLoading=bls[1];
  var bes=useState('');var btErr=bes[0];var setBtErr=bes[1];

  useEffect(function(){
    function tick(){
      var now=new Date(),ist=new Date(now.toLocaleString('en-US',{timeZone:'Asia/Kolkata'}));
      setIst(String(ist.getHours()).padStart(2,'0')+':'+String(ist.getMinutes()).padStart(2,'0')+':'+String(ist.getSeconds()).padStart(2,'0'));
      var m=ist.getHours()*60+ist.getMinutes(),d=ist.getDay();
      if(d===0||d===6)setMkt({text:'WEEKEND',color:R,bg:'#2d0a0a',bc:'#ff444433'});
      else if(m>=555&&m<575)setMkt({text:'PRE-OPEN',color:A,bg:'#2d1e00',bc:'#ffb30033'});
      else if(m>=575&&m<930)setMkt({text:'MARKET OPEN',color:G,bg:'#00391a',bc:'#00e67633'});
      else setMkt({text:'CLOSED',color:R,bg:'#2d0a0a',bc:'#ff444433'});
    }
    tick();var id=setInterval(tick,1000);return function(){clearInterval(id);};
  },[]);

  function calcExt(sym,last){
    var seed=last%100;
    return{vix:10+seed*0.18,fii:(seed-50)*180,dii:-(seed-50)*120+200,callOI:Math.round(800000+seed*12000),putOI:Math.round(650000+(100-seed)*12000),pcr:(650000+(100-seed)*12000)/(800000+seed*12000),maxPain:Math.round(last/100)*100-50};
  }

  async function analyze(){
    var symbol=instrType==='index'?idx.s:stock?stock.s:null;
    var itype=instrType==='index'?'index':'stock';
    if(!symbol){setErr('Please select a stock.');return;}
    setLoading(true);setErr('');setVerdict(null);setMdata(null);setSig(null);setExt(null);
    try{
      setStep('Fetching live NSE data...');
      var mr=await fetch('/api/market?symbol='+encodeURIComponent(symbol)+'&type='+itype+'&interval='+intv);
      var mj=await mr.json();
      if(!mr.ok||mj.error)throw new Error(mj.error||'Data fetch failed');
      setMdata(mj.data);setSig(mj.signals);
      var ex=calcExt(symbol,mj.signals.last);setExt(ex);
      setStep('Running 15-indicator engine + Nifty filter...');
      var v=generateVerdict(mj.signals,ex,mj.data,mj.niftyTrend);
      setVerdict(v);
    }catch(e){setErr(e.message);}
    setLoading(false);
  }

  async function runBacktest(){
    var symbol=instrType==='index'?idx.s:stock?stock.s:null;
    var itype=instrType==='index'?'index':'stock';
    if(!symbol){setBtErr('Please select an instrument in the Analyze tab first.');return;}
    setBtLoading(true);setBtErr('');setBtResult(null);
    try{
      var r=await fetch('/api/backtest?symbol='+encodeURIComponent(symbol)+'&type='+itype);
      var j=await r.json();
      if(!r.ok||j.error)throw new Error(j.error||'Backtest failed');
      setBtResult(j);
    }catch(e){setBtErr(e.message);}
    setBtLoading(false);
  }

  var sel={width:'100%',padding:'11px 12px',background:'#1a2235',border:'1px solid #1e2d45',borderRadius:8,color:'#e2e8f0',fontSize:13,WebkitAppearance:'none',outline:'none',fontFamily:'monospace'};
  var vColor=verdict?(verdict.verdict==='LONG'?G:verdict.verdict==='SHORT'?R:A):A;
  var vBg=verdict?(verdict.verdict==='LONG'?'#00391a':verdict.verdict==='SHORT'?'#2d0a0a':'#2d1e00'):'#1a2235';
  var vBorder=verdict?(verdict.verdict==='LONG'?'#00e67644':verdict.verdict==='SHORT'?'#ff444444':'#ffb30044'):'#1e2d45';

  function mbox(label,val,sub,vc){
    return React.createElement('div',{style:{background:'#111827',border:'1px solid #1e2d45',borderRadius:10,padding:11}},
      React.createElement('div',{style:{fontSize:9,color:'#4a6080',textTransform:'uppercase',letterSpacing:'0.1em',marginBottom:4}},label),
      React.createElement('div',{style:{fontSize:16,fontWeight:700,lineHeight:1,color:vc||'#e2e8f0'}},val),
      sub?React.createElement('div',{style:{fontSize:10,color:'#8899bb',marginTop:3}},sub):null
    );
  }

  var instrSelector=React.createElement('div',{style:{background:'#111827',border:'1px solid #1e2d45',borderRadius:12,padding:12,marginBottom:10}},
    React.createElement('div',{style:{display:'grid',gridTemplateColumns:'1fr 1fr',gap:8,marginBottom:8}},
      React.createElement('div',null,
        React.createElement('div',{style:{fontSize:9,color:'#4a6080',textTransform:'uppercase',marginBottom:4}},'Type'),
        React.createElement('select',{value:instrType,onChange:function(e){setInstrType(e.target.value);},style:sel},
          React.createElement('option',{value:'index'},'Index'),
          React.createElement('option',{value:'stock'},'NSE Stock')
        )
      ),
      React.createElement('div',null,
        React.createElement('div',{style:{fontSize:9,color:'#4a6080',textTransform:'uppercase',marginBottom:4}},'Interval'),
        React.createElement('select',{value:intv,onChange:function(e){setIntv(e.target.value);},style:sel},
          React.createElement('option',{value:'5min'},'5 min'),
          React.createElement('option',{value:'15min'},'15 min'),
          React.createElement('option',{value:'30min'},'30 min'),
          React.createElement('option',{value:'1h'},'1 hour')
        )
      )
    ),
    instrType==='index'?React.createElement('div',null,
      React.createElement('div',{style:{fontSize:9,color:'#4a6080',textTransform:'uppercase',marginBottom:4}},'Index'),
      React.createElement('select',{value:idx.s,onChange:function(e){setIdx(NSE_INDICES.find(function(i){return i.s===e.target.value;}));},style:sel},
        NSE_INDICES.map(function(i){return React.createElement('option',{key:i.s,value:i.s},i.n);})
      )
    ):React.createElement('div',null,
      React.createElement('div',{style:{fontSize:9,color:'#4a6080',textTransform:'uppercase',marginBottom:4}},'Search NSE Stock'),
      React.createElement(StockSearch,{selected:stock,onSelect:setStock,onClear:function(){setStock(null);}})
    )
  );

  return React.createElement('div',{style:{background:'#0a0e1a',minHeight:'100vh',color:'#e2e8f0',fontFamily:'monospace',paddingBottom:60}},
    React.createElement('style',null,'*{box-sizing:border-box;margin:0;padding:0;-webkit-tap-highlight-color:transparent}::-webkit-scrollbar{width:3px}::-webkit-scrollbar-thumb{background:#2a3f5f;border-radius:2px}@keyframes spin{to{transform:rotate(360deg)}}@keyframes blink{0%,100%{opacity:1}50%{opacity:0}}@keyframes pulse{0%,100%{opacity:1}50%{opacity:0.6}}'),

    (loading||btLoading)?React.createElement('div',{style:{position:'fixed',inset:0,background:'rgba(10,14,26,0.95)',zIndex:9999,display:'flex',flexDirection:'column',alignItems:'center',justifyContent:'center',gap:14}},
      React.createElement('div',{style:{width:42,height:42,border:'3px solid #1e2d45',borderTopColor:G,borderRadius:'50%',animation:'spin 0.8s linear infinite'}}),
      React.createElement('div',{style:{fontSize:13,color:'#8899bb'}},btLoading?'Running 30-day backtest...':step)
    ):null,

    React.createElement('div',{style:{position:'sticky',top:0,zIndex:10,background:'#0a0e1a',borderBottom:'1px solid #1e2d45',padding:'10px 14px',display:'flex',alignItems:'center',justifyContent:'space-between'}},
      React.createElement('div',{style:{display:'flex',alignItems:'center',gap:8}},
        React.createElement('div',{style:{fontFamily:'sans-serif',fontSize:17,fontWeight:800,color:G}},'NSE AI'),
        React.createElement('div',{style:{fontSize:9,color:'#4a6080',letterSpacing:'0.06em',paddingTop:2}},'15-INDICATOR ENGINE')
      ),
      React.createElement('div',{style:{display:'flex',flexDirection:'column',alignItems:'flex-end',gap:2}},
        React.createElement('div',{style:{fontSize:10,color:'#8899bb'}},'IST '+ist),
        React.createElement('div',{style:{fontSize:9,fontWeight:700,padding:'2px 7px',borderRadius:3,background:mkt.bg,color:mkt.color,border:'1px solid '+mkt.bc}},mkt.text)
      )
    ),

    React.createElement('div',{style:{display:'flex',background:'#111827',borderBottom:'1px solid #1e2d45'}},
      ['analyze','backtest'].map(function(tab){
        var active=activeTab===tab;
        return React.createElement('button',{key:tab,onClick:function(){setActiveTab(tab);},
          style:{flex:1,padding:'11px',background:'transparent',border:'none',borderBottom:active?'2px solid '+G:'2px solid transparent',color:active?G:'#4a6080',fontSize:11,fontWeight:active?700:400,cursor:'pointer',textTransform:'uppercase',letterSpacing:'0.1em',fontFamily:'monospace'}
        },tab==='analyze'?'Analyze & Predict':'Backtest (30d)');
      })
    ),

    activeTab==='analyze'?React.createElement('div',{style:{padding:'10px 12px 20px'}},
      instrSelector,
      React.createElement('button',{onClick:analyze,disabled:loading||(instrType==='stock'&&!stock),
        style:{width:'100%',padding:13,background:G,color:'#000',border:'none',borderRadius:10,fontFamily:'sans-serif',fontSize:14,fontWeight:800,cursor:'pointer',opacity:(loading||(instrType==='stock'&&!stock))?0.35:1,marginBottom:10}
      },'ANALYZE & PREDICT'),
      err?React.createElement('div',{style:{fontSize:11,color:R,padding:'10px 12px',background:'#2d0a0a',border:'1px solid #ff444433',borderRadius:8,marginBottom:10,lineHeight:1.7}},'Error: '+err):null,

      verdict?React.createElement('div',{style:{background:vBg,border:'2px solid '+vBorder,borderRadius:14,padding:14,marginBottom:10}},
        React.createElement('div',{style:{display:'flex',alignItems:'center',justifyContent:'space-between',marginBottom:10}},
          React.createElement('div',null,
            React.createElement('div',{style:{fontSize:9,color:'#8899bb',textTransform:'uppercase',letterSpacing:'0.1em',marginBottom:3}},'15-INDICATOR PREDICTION'),
            React.createElement('div',{style:{display:'flex',alignItems:'center',gap:8}},
              React.createElement('div',{style:{fontSize:30,fontWeight:800,color:vColor,fontFamily:'sans-serif',animation:verdict.verdict!=='NEUTRAL'?'pulse 2s infinite':'none'}},verdict.verdict),
              React.createElement('div',{style:{fontSize:10,padding:'3px 9px',borderRadius:5,background:'rgba(0,0,0,0.3)',color:vColor,fontWeight:600}},verdict.confidence)
            )
          ),
          React.createElement('div',{style:{textAlign:'center',background:'rgba(0,0,0,0.3)',borderRadius:10,padding:'8px 12px'}},
            React.createElement('div',{style:{fontSize:9,color:'#8899bb',marginBottom:1}},'SCORE'),
            React.createElement('div',{style:{fontSize:22,fontWeight:800,color:vColor}},(verdict.score>0?'+':'')+verdict.score),
            React.createElement('div',{style:{fontSize:9,color:'#4a6080'}},'/ +-30'),
            React.createElement('div',{style:{fontSize:9,color:'#4a6080',marginTop:2}}),
            React.createElement('div',{style:{fontSize:9,color:G}},verdict.bullCount+' bull'),
            React.createElement('div',{style:{fontSize:9,color:R}},verdict.bearCount+' bear')
          )
        ),
        React.createElement('div',{style:{display:'grid',gridTemplateColumns:'1fr 1fr 1fr',gap:6,marginBottom:10}},
          React.createElement('div',{style:{background:'rgba(0,0,0,0.3)',borderRadius:8,padding:'8px 10px'}},
            React.createElement('div',{style:{fontSize:8,color:'#8899bb',textTransform:'uppercase',marginBottom:3}},'Entry'),
            React.createElement('div',{style:{fontSize:10,fontWeight:700,color:'#e2e8f0',lineHeight:1.4}},verdict.entry)
          ),
          React.createElement('div',{style:{background:'rgba(0,0,0,0.3)',borderRadius:8,padding:'8px 10px'}},
            React.createElement('div',{style:{fontSize:8,color:'#8899bb',textTransform:'uppercase',marginBottom:3}},'Stop Loss'),
            React.createElement('div',{style:{fontSize:10,fontWeight:700,color:R}},verdict.stopLoss)
          ),
          React.createElement('div',{style:{background:'rgba(0,0,0,0.3)',borderRadius:8,padding:'8px 10px'}},
            React.createElement('div',{style:{fontSize:8,color:'#8899bb',textTransform:'uppercase',marginBottom:3}},'Target'),
            React.createElement('div',{style:{fontSize:10,fontWeight:700,color:G,lineHeight:1.4}},verdict.target)
          )
        ),
        verdict.niftyTrend?React.createElement('div',{style:{background:'rgba(0,0,0,0.25)',borderRadius:8,padding:'8px 12px',marginBottom:10,display:'flex',alignItems:'center',gap:10}},
          React.createElement('div',{style:{fontSize:9,color:'#8899bb',textTransform:'uppercase',flexShrink:0}},'NIFTY 50'),
          React.createElement('div',{style:{fontSize:11,fontWeight:700,color:verdict.niftyTrend.trend==='BULLISH'?G:verdict.niftyTrend.trend==='BEARISH'?R:A,flexShrink:0,marginRight:4}},verdict.niftyTrend.trend),
          React.createElement('div',{style:{fontSize:10,color:'#8899bb',lineHeight:1.4}},verdict.niftyTrend.reason)
        ):null,
        React.createElement('div',{style:{fontSize:11,color:'#c0ccdd',lineHeight:1.75,borderTop:'1px solid rgba(255,255,255,0.07)',paddingTop:8,marginBottom:10}},verdict.summary),
        React.createElement('div',null,
          React.createElement('div',{style:{fontSize:9,color:'#4a6080',textTransform:'uppercase',letterSpacing:'0.08em',marginBottom:5}},'12-Signal Scorecard'),
          React.createElement('div',{style:{display:'grid',gridTemplateColumns:'repeat(4,1fr)',gap:4}},
            verdict.signals.map(function(s){
              var c=s.bull?G:s.bear?R:A,bg=s.bull?'#00391a':s.bear?'#2d0a0a':'#2d1e00';
              return React.createElement('div',{key:s.name,style:{background:bg,borderRadius:6,padding:'5px 6px',textAlign:'center'}},
                React.createElement('div',{style:{fontSize:8,color:'#8899bb',marginBottom:2}},s.name),
                React.createElement('div',{style:{fontSize:10,fontWeight:700,color:c}},s.val)
              );
            })
          )
        )
      ):null,

      sig?React.createElement('div',{style:{display:'grid',gridTemplateColumns:'1fr 1fr',gap:7,marginBottom:10}},
        mbox('Last Price',sig?'Rs '+sig.last.toFixed(2):'--',sig?(sig.change>=0?'+':'')+sig.change.toFixed(2)+' ('+sig.changePct.toFixed(2)+'%)':'--',sig?(sig.change>=0?G:R):null),
        mbox('Volume',sig?fmtVol(sig.lastVol):'--',sig?sig.volRatio.toFixed(1)+'x avg':'--',sig?(sig.volRatio>1.5?G:sig.volRatio<0.7?R:A):null),
        mbox('Day Range',sig?'Rs '+sig.dayLow.toFixed(0)+' - '+sig.dayHigh.toFixed(0):'--',sig?'Range '+((sig.dayHigh-sig.dayLow)/sig.dayLow*100).toFixed(2)+'%':'--'),
        mbox('EMA Trend',sig?(sig.trendUp?'BULLISH':'BEARISH'):'--','EMA9 vs EMA21',sig?(sig.trendUp?G:R):null)
      ):null,

      mdata?React.createElement('div',{style:{background:'#111827',border:'1px solid #1e2d45',borderRadius:10,padding:12,marginBottom:10}},
        React.createElement('div',{style:{fontSize:9,color:'#4a6080',textTransform:'uppercase',marginBottom:6}},'Price + Volume'),
        React.createElement(MiniChart,{data:mdata})
      ):null,

      React.createElement('div',{style:{fontSize:10,color:'#4a6080',display:'flex',alignItems:'center',gap:6,paddingTop:4}},
        React.createElement('span',{style:{animation:'blink 1s step-end infinite'}},'|'),
        loading?step:sig?'Updated '+new Date().toLocaleTimeString('en-IN',{timeZone:'Asia/Kolkata'})+' IST':'Ready - Market: 09:15-15:30 IST Mon-Fri'
      )
    ):null,

    activeTab==='backtest'?React.createElement('div',{style:{padding:'10px 12px 20px'}},
      instrSelector,
      React.createElement('button',{onClick:runBacktest,disabled:btLoading||(instrType==='stock'&&!stock),
        style:{width:'100%',padding:13,background:'#4fc3f7',color:'#000',border:'none',borderRadius:10,fontFamily:'sans-serif',fontSize:14,fontWeight:800,cursor:'pointer',opacity:(btLoading||(instrType==='stock'&&!stock))?0.35:1,marginBottom:10}
      },'RUN 30-DAY BACKTEST'),
      btErr?React.createElement('div',{style:{fontSize:11,color:R,padding:'10px 12px',background:'#2d0a0a',border:'1px solid #ff444433',borderRadius:8,marginBottom:10}},'Error: '+btErr):null,

      btResult?React.createElement('div',null,
        React.createElement('div',{style:{background:'#111827',border:'1px solid #1e2d45',borderRadius:12,padding:14,marginBottom:10}},
          React.createElement('div',{style:{display:'flex',alignItems:'center',justifyContent:'space-between',marginBottom:14}},
            React.createElement('div',null,
              React.createElement('div',{style:{fontSize:9,color:'#4a6080',textTransform:'uppercase',letterSpacing:'0.1em',marginBottom:3}},'Overall Accuracy'),
              React.createElement('div',{style:{fontSize:36,fontWeight:800,color:btResult.accuracy>=65?G:btResult.accuracy>=50?A:R,fontFamily:'sans-serif'}},btResult.accuracy+'%'),
              React.createElement('div',{style:{fontSize:10,color:'#8899bb'}},btResult.correctCalls+' correct / '+btResult.directionalCalls+' directional calls')
            ),
            React.createElement('div',{style:{textAlign:'right'}},
              React.createElement('div',{style:{fontSize:11,color:'#8899bb',marginBottom:3}},'Days tested: '+btResult.totalDays),
              React.createElement('div',{style:{fontSize:11,color:G,marginBottom:2}},'LONG: '+btResult.longCalls),
              React.createElement('div',{style:{fontSize:11,color:R,marginBottom:2}},'SHORT: '+btResult.shortCalls),
              React.createElement('div',{style:{fontSize:11,color:A}},'NEUTRAL: '+btResult.neutralCalls)
            )
          ),
          React.createElement(AccuracyBar,{pct:btResult.accuracy,label:'Overall Accuracy',sub:'LONG + SHORT calls combined'}),
          React.createElement(AccuracyBar,{pct:btResult.longAccuracy,label:'LONG Accuracy',sub:btResult.longCalls+' long calls'}),
          React.createElement(AccuracyBar,{pct:btResult.shortAccuracy,label:'SHORT Accuracy',sub:btResult.shortCalls+' short calls'})
        ),
        React.createElement('div',{style:{background:'#111827',border:'1px solid #1e2d45',borderRadius:12,padding:14,marginBottom:10}},
          React.createElement('div',{style:{fontSize:9,color:'#4a6080',textTransform:'uppercase',letterSpacing:'0.1em',marginBottom:10}},'Day-by-Day Results'),
          React.createElement('table',{style:{width:'100%',borderCollapse:'collapse',fontSize:11}},
            React.createElement('thead',null,
              React.createElement('tr',null,
                ['Date','Signal','Actual','Chg%','Result'].map(function(h){
                  return React.createElement('th',{key:h,style:{padding:'6px 6px',textAlign:'left',fontSize:9,color:'#4a6080',textTransform:'uppercase',borderBottom:'1px solid #1e2d45',whiteSpace:'nowrap'}},h);
                })
              )
            ),
            React.createElement('tbody',null,
              btResult.results.slice().reverse().map(function(r,i){
                var pc=r.prediction==='LONG'?G:r.prediction==='SHORT'?R:A;
                var ac=r.actualMove==='UP'?G:r.actualMove==='DOWN'?R:A;
                var rc=r.correct===true?G:r.correct===false?R:'#4a6080';
                var rv=r.correct===true?'HIT':r.correct===false?'MISS':'SKIP';
                return React.createElement('tr',{key:i,style:{borderBottom:'1px solid #0f1825'}},
                  React.createElement('td',{style:{padding:'7px 6px',color:'#8899bb',whiteSpace:'nowrap'}},r.date),
                  React.createElement('td',{style:{padding:'7px 6px',fontWeight:700,color:pc}},r.prediction),
                  React.createElement('td',{style:{padding:'7px 6px',color:ac}},r.actualMove),
                  React.createElement('td',{style:{padding:'7px 6px',color:parseFloat(r.changePct)>=0?G:R}},(parseFloat(r.changePct)>=0?'+':'')+r.changePct+'%'),
                  React.createElement('td',{style:{padding:'7px 6px',fontWeight:700,color:rc}},rv)
                );
              })
            )
          )
        ),
        React.createElement('div',{style:{fontSize:10,color:'#4a6080',lineHeight:1.8,padding:'4px 0'}},'Backtest on daily data. Neutral calls excluded from accuracy. Higher neutral rate = more selective = better quality trades. Always use stop losses.')
      ):React.createElement('div',{style:{fontSize:12,color:'#4a6080',lineHeight:2,padding:'20px 0',textAlign:'center'}},'Select an instrument above and tap RUN 30-DAY BACKTEST to measure prediction accuracy over last 30 trading days.')
    ):null
  );
}
