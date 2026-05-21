// FILE: pages/api/backtest.js
// Enhanced backtest using 15-indicator engine with strict threshold filter

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
  var rsiSeries=[];
  for(var i=rsiP;i<closes.length;i++) rsiSeries.push(rsi(closes.slice(0,i+1),rsiP));
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
  if(closes.length<p)return{pct:50};
  var recent=closes.slice(-p);
  var mean=recent.reduce(function(a,b){return a+b;},0)/p;
  var variance=recent.reduce(function(s,v){return s+(v-mean)*(v-mean);},0)/p;
  var std=Math.sqrt(variance);
  var upper=mean+mult*std, lower=mean-mult*std;
  var last=closes[closes.length-1];
  return{upper:upper,lower:lower,mid:mean,pct:upper===lower?50:((last-lower)/(upper-lower))*100};
}
function adx(highs, lows, closes, p) {
  if(!p)p=14;
  if(closes.length<p+2)return{adx:20,pdi:0,ndi:0};
  var trArr=[],pdmArr=[],ndmArr=[];
  for(var i=1;i<closes.length;i++){
    trArr.push(Math.max(highs[i]-lows[i],Math.abs(highs[i]-closes[i-1]),Math.abs(lows[i]-closes[i-1])));
    var up=highs[i]-highs[i-1], dn=lows[i-1]-lows[i];
    pdmArr.push(up>dn&&up>0?up:0);
    ndmArr.push(dn>up&&dn>0?dn:0);
  }
  function smth(arr,per){var s=arr.slice(0,per).reduce(function(a,b){return a+b;},0);var res=[s];for(var i=per;i<arr.length;i++){s=s-s/per+arr[i];res.push(s);}return res;}
  var tr14=smth(trArr,p),pd14=smth(pdmArr,p),nd14=smth(ndmArr,p);
  var pdiArr=pd14.map(function(v,i){return tr14[i]>0?100*v/tr14[i]:0;});
  var ndiArr=nd14.map(function(v,i){return tr14[i]>0?100*v/tr14[i]:0;});
  var dxArr=pdiArr.map(function(v,i){var s=v+ndiArr[i];return s>0?100*Math.abs(v-ndiArr[i])/s:0;});
  return{adx:dxArr.slice(-p).reduce(function(a,b){return a+b;},0)/p,pdi:pdiArr[pdiArr.length-1],ndi:ndiArr[ndiArr.length-1]};
}
function vwapCalc(highs, lows, closes, volumes) {
  var ct=0,cv=0;
  for(var i=0;i<closes.length;i++){var tp=(highs[i]+lows[i]+closes[i])/3;ct+=tp*volumes[i];cv+=volumes[i];}
  return cv>0?ct/cv:closes[closes.length-1];
}

function predictEnhanced(opens, highs, lows, closes, volumes) {
  if(closes.length<26)return'NEUTRAL';
  var last=closes[closes.length-1];
  var e9=ema(closes,9),e21=ema(closes,21);
  var rsiV=rsi(closes);
  var stRsiV=stochRsi(closes,14,14);
  var macdD=macdCalc(closes);
  var bbD=bollingerBands(closes,20,2);
  var adxD=adx(highs,lows,closes,14);
  var vwapV=vwapCalc(highs,lows,closes,volumes);
  var avgVol=volumes.slice(-10).reduce(function(a,b){return a+b;},0)/10;
  var lastVol=volumes[volumes.length-1];
  var volRatio=avgVol>0?lastVol/avgVol:1;
  var mom10=closes.length>10?((last-closes[closes.length-11])/closes[closes.length-11])*100:0;
  var trendUp=e9[e9.length-1]>e21[e21.length-1];
  var emaDiff=((e9[e9.length-1]-e21[e21.length-1])/e21[e21.length-1])*100;
  var dayHigh=Math.max.apply(null,highs.slice(-Math.min(highs.length,10)));
  var dayLow=Math.min.apply(null,lows.slice(-Math.min(lows.length,10)));
  var posInRange=dayHigh===dayLow?50:((last-dayLow)/(dayHigh-dayLow))*100;
  var change=last-(closes[closes.length-2]||last);

  // Candle strength
  var bullC=0,bearC=0,sBull=0,sBear=0;
  var cn=Math.min(5,opens.length);
  for(var i=opens.length-cn;i<opens.length;i++){
    var body=Math.abs(closes[i]-opens[i]),range2=highs[i]-lows[i]||0.01;
    if(closes[i]>opens[i]){bullC++;if(body/range2>0.6)sBull++;}
    else{bearC++;if(body/range2>0.6)sBear++;}
  }

  var score=0;

  // RSI
  if(rsiV<30)score+=2; else if(rsiV<42)score+=1;
  else if(rsiV>70)score-=2; else if(rsiV>58)score-=1;

  // StochRSI
  if(stRsiV<20)score+=2; else if(stRsiV<35)score+=1;
  else if(stRsiV>80)score-=2; else if(stRsiV>65)score-=1;

  // MACD
  if(macdD.hist>0&&macdD.line>macdD.signal)score+=2;
  else if(macdD.hist>0)score+=1;
  else if(macdD.hist<0&&macdD.line<macdD.signal)score-=2;
  else score-=1;

  // EMA
  if(trendUp&&emaDiff>0.3)score+=2; else if(trendUp)score+=1;
  else if(!trendUp&&emaDiff<-0.3)score-=2; else score-=1;

  // Bollinger
  if(bbD.pct<10)score+=2; else if(bbD.pct<25)score+=1;
  else if(bbD.pct>90)score-=2; else if(bbD.pct>75)score-=1;

  // ADX
  if(adxD.adx>25){if(adxD.pdi>adxD.ndi)score+=2;else score-=2;}
  else if(adxD.adx>18){if(adxD.pdi>adxD.ndi)score+=1;else score-=1;}
  else score=Math.round(score*0.8);

  // VWAP
  var vwapDiff=((last-vwapV)/vwapV)*100;
  if(last>vwapV&&vwapDiff>0.3)score+=2; else if(last>vwapV)score+=1;
  else if(last<vwapV&&vwapDiff<-0.3)score-=2; else score-=1;

  // Volume
  if(volRatio>2){if(change>0)score+=2;else score-=2;}
  else if(volRatio>1.4){if(change>0)score+=1;else score-=1;}

  // Momentum
  if(mom10>2)score+=2; else if(mom10>0.8)score+=1;
  else if(mom10<-2)score-=2; else if(mom10<-0.8)score-=1;

  // Candle
  if(sBull>=3&&bearC<=1)score+=2; else if(bullC>=4)score+=1;
  else if(sBear>=3&&bullC<=1)score-=2; else if(bearC>=4)score-=1;

  // S/R
  if(posInRange<20)score+=2; else if(posInRange>80)score-=2;

  // EMA50
  if(closes.length>=50){var e50=ema(closes,50);if(last>e50[e50.length-1])score+=1;else score-=1;}

  // Strict threshold - only trade when highly confident
  if(score>=7)return'LONG';
  if(score<=-7)return'SHORT';
  return'NEUTRAL';
}

function getNiftyScore(nOpens, nHighs, nLows, nCloses, nVolumes) {
  if(nCloses.length<21)return 0;
  var last=nCloses[nCloses.length-1];
  var e9=ema(nCloses,9), e21=ema(nCloses,21);
  var rsiV=rsi(nCloses);
  var macdD=macdCalc(nCloses);
  var vwapV=vwapCalc(nHighs,nLows,nCloses,nVolumes);
  var mom5=nCloses.length>5?((last-nCloses[nCloses.length-6])/nCloses[nCloses.length-6])*100:0;
  var changePct=((last-(nCloses[nCloses.length-2]||last))/(nCloses[nCloses.length-2]||last))*100;
  var s=0;
  if(e9[e9.length-1]>e21[e21.length-1])s+=2;else s-=2;
  if(macdD.hist>0)s+=2;else s-=2;
  if(last>vwapV)s+=1;else s-=1;
  if(rsiV>52)s+=1;else if(rsiV<48)s-=1;
  if(mom5>0.3)s+=1;else if(mom5<-0.3)s-=1;
  if(changePct>0.2)s+=1;else if(changePct<-0.2)s-=1;
  return s;
}

function predictWithNiftyFilter(opens, highs, lows, closes, volumes, nOpens, nHighs, nLows, nCloses, nVolumes) {
  var prediction = predictEnhanced(opens, highs, lows, closes, volumes);
  if(prediction === 'NEUTRAL') return 'NEUTRAL';
  
  // Get Nifty market direction
  var niftyScore = getNiftyScore(nOpens, nHighs, nLows, nCloses, nVolumes);
  
  // Hard veto: don't go long when Nifty strongly bearish
  if(prediction === 'LONG' && niftyScore <= -4) return 'NEUTRAL';
  // Hard veto: don't go short when Nifty strongly bullish  
  if(prediction === 'SHORT' && niftyScore >= 4) return 'NEUTRAL';
  
  return prediction;
}

export default async function handler(req, res) {
  var symbol=req.query.symbol, type=req.query.type||'stock';
  if(!symbol)return res.status(400).json({error:'Symbol required'});

  var yhSymbol;
  if(type==='index'){
    var indexMap={'NIFTY':'^NSEI','BANKNIFTY':'^NSEBANK','NIFTY IT':'^CNXIT','NIFTY AUTO':'^CNXAUTO','NIFTY PHARMA':'^CNXPHARMA','NIFTY MIDCAP 50':'^CNXMIDCAP','NIFTY FMCG':'^CNXFMCG','NIFTY METAL':'^CNXMETAL'};
    yhSymbol=indexMap[symbol]||('^'+symbol);
  } else {
    yhSymbol=symbol+'.NS';
  }

  try{
    async function fetchData(sym) {
      var url='https://query1.finance.yahoo.com/v8/finance/chart/'+encodeURIComponent(sym)+'?interval=1d&range=6mo';
      var r=await fetch(url,{headers:{'User-Agent':'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36','Accept':'application/json','Referer':'https://finance.yahoo.com'}});
      if(!r.ok)throw new Error('Yahoo Finance error '+r.status+' for '+sym);
      var json=await r.json();
      var result=json.chart&&json.chart.result&&json.chart.result[0];
      if(!result)throw new Error('No data for '+sym);
      var ts=result.timestamps||result.timestamp;
      var q=result.indicators.quote[0];
      var vi=ts.map(function(_,i){return i;}).filter(function(i){return q.close[i]!=null&&q.open[i]!=null&&q.high[i]!=null&&q.low[i]!=null;});
      return{timestamps:vi.map(function(i){return ts[i];}),opens:vi.map(function(i){return q.open[i];}),highs:vi.map(function(i){return q.high[i];}),lows:vi.map(function(i){return q.low[i];}),closes:vi.map(function(i){return q.close[i];}),volumes:vi.map(function(i){return q.volume[i]||0;})};
    }

    var isNifty=(symbol==='NIFTY'&&type==='index');
    var fetches=[fetchData(yhSymbol)];
    if(!isNifty)fetches.push(fetchData('^NSEI'));
    var fetchResults=await Promise.all(fetches);
    var instrData=fetchResults[0];
    var niftyDataFull=isNifty?instrData:fetchResults[1];

    if(instrData.closes.length<35)throw new Error('Not enough historical data. Need at least 35 trading days.');

    var allOpens  =instrData.opens;
    var allHighs  =instrData.highs;
    var allLows   =instrData.lows;
    var allCloses =instrData.closes;
    var allVolumes=instrData.volumes;
    var allDates  =instrData.timestamps.map(function(t){var d=new Date(t*1000);return d.toLocaleDateString('en-IN',{day:'2-digit',month:'short'});});

    var nAllOpens  =niftyDataFull.opens;
    var nAllHighs  =niftyDataFull.highs;
    var nAllLows   =niftyDataFull.lows;
    var nAllCloses =niftyDataFull.closes;
    var nAllVolumes=niftyDataFull.volumes;

    var results=[];
    var startIdx=Math.max(30,allCloses.length-32);

    for(var i=startIdx;i<allCloses.length-1;i++){
      var hC=allCloses.slice(0,i+1),hH=allHighs.slice(0,i+1),hL=allLows.slice(0,i+1),hO=allOpens.slice(0,i+1),hV=allVolumes.slice(0,i+1);
      // Get corresponding Nifty history up to same date
      var nLen=Math.min(i+1,nAllCloses.length);
      var nhC=nAllCloses.slice(0,nLen),nhH=nAllHighs.slice(0,nLen),nhL=nAllLows.slice(0,nLen),nhO=nAllOpens.slice(0,nLen),nhV=nAllVolumes.slice(0,nLen);
      var prediction=predictWithNiftyFilter(hO,hH,hL,hC,hV,nhO,nhH,nhL,nhC,nhV);
      var currentClose=allCloses[i], nextClose=allCloses[i+1];
      var actualMove=nextClose>currentClose?'UP':nextClose<currentClose?'DOWN':'FLAT';
      var changePct=((nextClose-currentClose)/currentClose)*100;
      var correct=null;
      if(prediction==='LONG'&&actualMove==='UP')correct=true;
      else if(prediction==='LONG'&&actualMove!=='UP')correct=false;
      else if(prediction==='SHORT'&&actualMove==='DOWN')correct=true;
      else if(prediction==='SHORT'&&actualMove!=='DOWN')correct=false;
      results.push({date:allDates[i],prediction:prediction,actualMove:actualMove,currentClose:currentClose.toFixed(2),nextClose:nextClose.toFixed(2),changePct:changePct.toFixed(2),correct:correct});
    }

    var directional=results.filter(function(r){return r.prediction!=='NEUTRAL';});
    var correct=directional.filter(function(r){return r.correct===true;});
    var accuracy=directional.length>0?Math.round(correct.length/directional.length*100):0;
    var longCalls=results.filter(function(r){return r.prediction==='LONG';});
    var shortCalls=results.filter(function(r){return r.prediction==='SHORT';});
    var neutrals=results.filter(function(r){return r.prediction==='NEUTRAL';});
    var longCorrect=longCalls.filter(function(r){return r.correct;});
    var shortCorrect=shortCalls.filter(function(r){return r.correct;});

    res.status(200).json({
      symbol:symbol,totalDays:results.length,
      directionalCalls:directional.length,correctCalls:correct.length,accuracy:accuracy,
      longCalls:longCalls.length,shortCalls:shortCalls.length,neutralCalls:neutrals.length,
      longAccuracy:longCalls.length>0?Math.round(longCorrect.length/longCalls.length*100):0,
      shortAccuracy:shortCalls.length>0?Math.round(shortCorrect.length/shortCalls.length*100):0,
      neutralRate:Math.round(neutrals.length/results.length*100),
      results:results.slice(-30)
    });

  }catch(err){
    res.status(500).json({error:err.message});
  }
}
