// FILE: pages/api/backtest.js
// FIXED: Intraday backtest - checks next bar direction, not next day close
// Also filters tiny moves as "noise" - only counts meaningful moves

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
function adxCalc(highs, lows, closes, p) {
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
function vwapCalc(highs,lows,closes,volumes){
  var ct=0,cv=0;
  for(var i=0;i<closes.length;i++){var tp=(highs[i]+lows[i]+closes[i])/3;ct+=tp*volumes[i];cv+=volumes[i];}
  return cv>0?ct/cv:closes[closes.length-1];
}

function predictBar(opens, highs, lows, closes, volumes) {
  if(closes.length<26)return{signal:'NEUTRAL',score:0};
  var last=closes[closes.length-1];
  var e9=ema(closes,9),e21=ema(closes,21);
  var rsiV=rsi(closes);
  var stRsiV=stochRsi(closes,14,14);
  var macdD=macdCalc(closes);
  var bbD=bollingerBands(closes,20,2);
  var adxD=adxCalc(highs,lows,closes,14);
  var vwapV=vwapCalc(highs,lows,closes,volumes);
  var avgVol=volumes.slice(-10).reduce(function(a,b){return a+b;},0)/10;
  var volRatio=avgVol>0?volumes[volumes.length-1]/avgVol:1;
  var mom10=closes.length>10?((last-closes[closes.length-11])/closes[closes.length-11])*100:0;
  var trendUp=e9[e9.length-1]>e21[e21.length-1];
  var emaDiff=((e9[e9.length-1]-e21[e21.length-1])/e21[e21.length-1])*100;
  var change=last-(closes[closes.length-2]||last);
  var dayHigh=Math.max.apply(null,highs.slice(-Math.min(highs.length,10)));
  var dayLow=Math.min.apply(null,lows.slice(-Math.min(lows.length,10)));
  var posInRange=dayHigh===dayLow?50:((last-dayLow)/(dayHigh-dayLow))*100;
  var bullC=0,bearC=0,sBull=0,sBear=0;
  var cn=Math.min(5,opens.length);
  for(var i=opens.length-cn;i<opens.length;i++){
    var body=Math.abs(closes[i]-opens[i]),range=highs[i]-lows[i]||0.01;
    if(closes[i]>opens[i]){bullC++;if(body/range>0.6)sBull++;}
    else{bearC++;if(body/range>0.6)sBear++;}
  }
  var score=0;
  // RSI
  if(rsiV<30)score+=2;else if(rsiV<42)score+=1;else if(rsiV>70)score-=2;else if(rsiV>58)score-=1;
  // StochRSI
  if(stRsiV<20)score+=2;else if(stRsiV<35)score+=1;else if(stRsiV>80)score-=2;else if(stRsiV>65)score-=1;
  // MACD
  if(macdD.hist>0&&macdD.line>macdD.signal)score+=2;else if(macdD.hist>0)score+=1;
  else if(macdD.hist<0&&macdD.line<macdD.signal)score-=2;else score-=1;
  // EMA
  if(trendUp&&emaDiff>0.3)score+=2;else if(trendUp)score+=1;
  else if(!trendUp&&emaDiff<-0.3)score-=2;else score-=1;
  // Bollinger
  if(bbD.pct<10)score+=2;else if(bbD.pct<25)score+=1;else if(bbD.pct>90)score-=2;else if(bbD.pct>75)score-=1;
  // ADX
  if(adxD.adx>25){if(adxD.pdi>adxD.ndi)score+=2;else score-=2;}
  else if(adxD.adx>18){if(adxD.pdi>adxD.ndi)score+=1;else score-=1;}
  else score=Math.round(score*0.8);
  // VWAP
  var vwapDiff=((last-vwapV)/vwapV)*100;
  if(last>vwapV&&vwapDiff>0.3)score+=2;else if(last>vwapV)score+=1;
  else if(last<vwapV&&vwapDiff<-0.3)score-=2;else score-=1;
  // Volume
  if(volRatio>2){if(change>0)score+=2;else score-=2;}
  else if(volRatio>1.4){if(change>0)score+=1;else score-=1;}
  // Momentum
  if(mom10>2)score+=2;else if(mom10>0.8)score+=1;else if(mom10<-2)score-=2;else if(mom10<-0.8)score-=1;
  // Candles
  if(sBull>=3&&bearC<=1)score+=2;else if(bullC>=4)score+=1;
  else if(sBear>=3&&bullC<=1)score-=2;else if(bearC>=4)score-=1;
  // S/R
  if(posInRange<20)score+=2;else if(posInRange>80)score-=2;
  // EMA50
  if(closes.length>=50){var e50=ema(closes,50);if(last>e50[e50.length-1])score+=1;else score-=1;}

  var signal=score>=5?'LONG':score<=-5?'SHORT':'NEUTRAL';
  return{signal:signal,score:score};
}

async function fetchIntraday(symbol, interval) {
  var intervalMap={'15min':'15m','5min':'5m','30min':'30m','1h':'60m'};
  var yhInterval=intervalMap[interval]||'15m';
  var range=yhInterval==='5m'?'10d':yhInterval==='15m'?'60d':'60d';
  var url='https://query1.finance.yahoo.com/v8/finance/chart/'+encodeURIComponent(symbol)+'?interval='+yhInterval+'&range='+range;
  var r=await fetch(url,{headers:{'User-Agent':'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36','Accept':'application/json','Referer':'https://finance.yahoo.com'}});
  if(!r.ok)throw new Error('Yahoo Finance error '+r.status);
  var json=await r.json();
  var result=json.chart&&json.chart.result&&json.chart.result[0];
  if(!result)throw new Error('No data returned');
  var ts=result.timestamps||result.timestamp;
  var q=result.indicators.quote[0];
  var vi=ts.map(function(_,i){return i;}).filter(function(i){return q.close[i]!=null&&q.open[i]!=null&&q.high[i]!=null&&q.low[i]!=null;});
  return{
    timestamps:vi.map(function(i){return ts[i];}),
    opens:vi.map(function(i){return q.open[i];}),
    highs:vi.map(function(i){return q.high[i];}),
    lows:vi.map(function(i){return q.low[i];}),
    closes:vi.map(function(i){return q.close[i];}),
    volumes:vi.map(function(i){return q.volume[i]||0;}),
  };
}

export default async function handler(req, res) {
  const mode = req.query.mode || 'normal'; // 'normal' or 'contrarian'
  var symbol=req.query.symbol, type=req.query.type||'stock', interval=req.query.interval||'15min';
  if(!symbol)return res.status(400).json({error:'Symbol required'});

  var yhSymbol;
  if(type==='index'){
    var indexMap={'NIFTY':'^NSEI','BANKNIFTY':'^NSEBANK','NIFTY IT':'^CNXIT','NIFTY AUTO':'^CNXAUTO','NIFTY PHARMA':'^CNXPHARMA','NIFTY MIDCAP 50':'^CNXMIDCAP','NIFTY FMCG':'^CNXFMCG','NIFTY METAL':'^CNXMETAL'};
    yhSymbol=indexMap[symbol]||('^'+symbol);
  } else {
    yhSymbol=symbol+'.NS';
  }

  try{
    // Fetch intraday bars - same interval as the prediction
    var isNifty=(symbol==='NIFTY'&&type==='index');
    var fetches=[fetchIntraday(yhSymbol, interval)];
    if(!isNifty)fetches.push(fetchIntraday('^NSEI', interval));
    var fetchResults=await Promise.all(fetches);
    var d=fetchResults[0];
    var niftyD=isNifty?d:fetchResults[1];

    if(d.closes.length<35)throw new Error('Not enough intraday bars. Need at least 35 bars. Try 15min or 30min interval.');

    // Minimum move threshold to count as real signal
    // Filters out noise - only count moves above this as directional
    var avgPrice=d.closes.reduce(function(a,b){return a+b;},0)/d.closes.length;
    // Dynamic noise filter: based on actual average bar size
    var avgBarMove=0;
    for(var bi=1;bi<Math.min(d.closes.length,30);bi++){
      avgBarMove+=Math.abs((d.closes[bi]-d.closes[bi-1])/d.closes[bi-1])*100;
    }
    avgBarMove=avgBarMove/Math.min(d.closes.length-1,29);
    // Only count moves larger than 30% of average bar size (filters noise, keeps signal)
    var minMovePct=Math.max(0.04, avgBarMove*0.3);

    var results=[];
    var startIdx=Math.max(30, d.closes.length-200); // last 200 bars max

    for(var i=startIdx;i<d.closes.length-1;i++){
      var hC=d.closes.slice(0,i+1),hH=d.highs.slice(0,i+1),hL=d.lows.slice(0,i+1),hO=d.opens.slice(0,i+1),hV=d.volumes.slice(0,i+1);
      var pred=predictBar(hO,hH,hL,hC,hV);

      // Nifty filter for stocks
      var finalSignal=pred.signal;
      if(!isNifty&&finalSignal!=='NEUTRAL'){
        var nLen=Math.min(i+1,niftyD.closes.length);
        var nhC=niftyD.closes.slice(0,nLen),nhH=niftyD.highs.slice(0,nLen),nhL=niftyD.lows.slice(0,nLen),nhO=niftyD.opens.slice(0,nLen),nhV=niftyD.volumes.slice(0,nLen);
        var nPred=predictBar(nhO,nhH,nhL,nhC,nhV);
        if(finalSignal==='LONG'&&nPred.score<=-4)finalSignal='NEUTRAL';
        if(finalSignal==='SHORT'&&nPred.score>=4)finalSignal='NEUTRAL';
      }

      // Check NEXT BAR (intraday) not next day
      var curClose=d.closes[i];
      var nextClose=d.closes[i+1];
      var nextHigh=d.highs[i+1];
      var nextLow=d.lows[i+1];
      var changePct=((nextClose-curClose)/curClose)*100;

      // For LONG: did price go up by at least minMovePct?
      // For SHORT: did price go down by at least minMovePct?
      var actualMove;
      var moveAbs=Math.abs(changePct);
      if(moveAbs<minMovePct){
        actualMove='FLAT'; // too small to count
      } else {
        actualMove=changePct>0?'UP':'DOWN';
      }

      // Contrarian mode: flip every signal
      var tradedSignal = finalSignal;
      if (mode === 'contrarian') {
        if (finalSignal === 'LONG') tradedSignal = 'SHORT';
        else if (finalSignal === 'SHORT') tradedSignal = 'LONG';
      }

      var correct=null;
      if(tradedSignal==='LONG'&&actualMove==='UP')correct=true;
      else if(tradedSignal==='LONG'&&actualMove==='DOWN')correct=false;
      else if(tradedSignal==='SHORT'&&actualMove==='DOWN')correct=true;
      else if(tradedSignal==='SHORT'&&actualMove==='UP')correct=false;
      // NEUTRAL or FLAT = skip

      var d2=new Date(d.timestamps[i]*1000);
      var dateStr=d2.toLocaleDateString('en-IN',{day:'2-digit',month:'short'})+' '+d2.getHours()+':'+(d2.getMinutes()<10?'0':'')+d2.getMinutes();

      results.push({
        date:dateStr,
        prediction:finalSignal,
        actualMove:actualMove,
        changePct:changePct.toFixed(3),
        correct:correct,
        score:pred.score
      });
    }

    // Only use last 60 bars for display
    var displayResults=results.slice(-100);
    var directional=displayResults.filter(function(r){return r.prediction!=='NEUTRAL'&&r.actualMove!=='FLAT';});
    var correct=directional.filter(function(r){return r.correct===true;});
    var accuracy=directional.length>0?Math.round(correct.length/directional.length*100):0;
    var longCalls=displayResults.filter(function(r){return r.prediction==='LONG';});
    var shortCalls=displayResults.filter(function(r){return r.prediction==='SHORT';});
    var neutrals=displayResults.filter(function(r){return r.prediction==='NEUTRAL';});
    var longDir=longCalls.filter(function(r){return r.actualMove!=='FLAT';});
    var shortDir=shortCalls.filter(function(r){return r.actualMove!=='FLAT';});
    var longCorrect=longDir.filter(function(r){return r.correct;});
    var shortCorrect=shortDir.filter(function(r){return r.correct;});

    res.status(200).json({
      mode: mode,
      symbol:symbol,
      interval:interval,
      totalBars:displayResults.length,
      directionalCalls:directional.length,
      correctCalls:correct.length,
      accuracy:accuracy,
      longCalls:longCalls.length,
      shortCalls:shortCalls.length,
      neutralCalls:neutrals.length,
      longAccuracy:longDir.length>0?Math.round(longCorrect.length/longDir.length*100):0,
      shortAccuracy:shortDir.length>0?Math.round(shortCorrect.length/shortDir.length*100):0,
      neutralRate:Math.round(neutrals.length/displayResults.length*100),
      minMovePct:minMovePct,
      note:'Intraday backtest on '+interval+' bars. Each signal vs next bar direction. Moves < '+minMovePct.toFixed(3)+'% (avg bar: '+avgBarMove.toFixed(3)+'%) counted as noise/FLAT.',
      results:displayResults.slice(-40)
    });

  }catch(err){
    res.status(500).json({error:err.message});
  }
}
