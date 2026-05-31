// FILE: pages/api/backtest.js
// FIXED: Intraday backtest - checks next bar direction, not next day close
// Also filters tiny moves as "noise" - only counts meaningful moves

const { ema, rsi, macdCalc, bollingerBands, adxCalc, vwapCalc, predictBar } = require('../../lib/indicators');

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

      var correct=null;
      if(finalSignal==='LONG'&&actualMove==='UP')correct=true;
      else if(finalSignal==='LONG'&&actualMove==='DOWN')correct=false;
      else if(finalSignal==='SHORT'&&actualMove==='DOWN')correct=true;
      else if(finalSignal==='SHORT'&&actualMove==='UP')correct=false;
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
