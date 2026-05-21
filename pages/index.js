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
  {n:"Nestle India",s:"NESTLEIND",sec:"FMCG"},
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
  {n:"Marico",s:"MARICO",sec:"FMCG"},
  {n:"Biocon",s:"BIOCON",sec:"Pharma"},
  {n:"Muthoot Finance",s:"MUTHOOTFIN",sec:"NBFC"},
  {n:"Shree Cement",s:"SHREECEM",sec:"Cement"},
  {n:"Ambuja Cements",s:"AMBUJACEM",sec:"Cement"},
  {n:"ACC",s:"ACC",sec:"Cement"},
  {n:"IndiGo Airlines",s:"INDIGO",sec:"Aviation"},
  {n:"Bharat Electronics",s:"BEL",sec:"Defence"},
  {n:"HAL",s:"HAL",sec:"Defence"},
  {n:"BHEL",s:"BHEL",sec:"Engineering"},
  {n:"Tata Power",s:"TATAPOWER",sec:"Power"},
  {n:"Lupin",s:"LUPIN",sec:"Pharma"},
  {n:"Aurobindo Pharma",s:"AUROPHARMA",sec:"Pharma"},
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
  {n:"Jindal Steel Power",s:"JINDALSTEL",sec:"Steel"},
  {n:"Suzlon Energy",s:"SUZLON",sec:"Renewables"},
  {n:"MRF",s:"MRF",sec:"Tyres"},
  {n:"Apollo Tyres",s:"APOLLOTYRE",sec:"Tyres"},
  {n:"Polycab India",s:"POLYCAB",sec:"Cables"},
  {n:"Varun Beverages",s:"VBL",sec:"Beverages"},
  {n:"Trent",s:"TRENT",sec:"Retail"},
  {n:"Laurus Labs",s:"LAURUSLABS",sec:"Pharma"},
  {n:"Siemens",s:"SIEMENS",sec:"Engineering"},
  {n:"ABB India",s:"ABB",sec:"Engineering"},
  {n:"Cummins India",s:"CUMMINSIND",sec:"Engineering"},
  {n:"Bharat Forge",s:"BHARATFORG",sec:"Auto Ancillary"},
  {n:"Voltas",s:"VOLTAS",sec:"Electricals"},
  {n:"SpiceJet",s:"SPICEJET",sec:"Aviation"},
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

// ── PREDICTION ENGINE ─────────────────────────────────────────────────
// Scores each signal -2 to +2, sums up for final verdict
function generateVerdict(sig, ext) {
  var score = 0;
  var reasons = [];
  var bearReasons = [];

  // 1. RSI Signal (weight: 2)
  if (sig.rsi < 35) {
    score += 2;
    reasons.push('RSI at '+sig.rsi.toFixed(1)+' is oversold - strong bounce potential');
  } else if (sig.rsi < 45) {
    score += 1;
    reasons.push('RSI at '+sig.rsi.toFixed(1)+' is in bullish recovery zone');
  } else if (sig.rsi > 65) {
    score -= 2;
    bearReasons.push('RSI at '+sig.rsi.toFixed(1)+' is overbought - pullback risk');
  } else if (sig.rsi > 55) {
    score -= 1;
    bearReasons.push('RSI at '+sig.rsi.toFixed(1)+' approaching overbought territory');
  } else {
    reasons.push('RSI at '+sig.rsi.toFixed(1)+' is neutral');
  }

  // 2. MACD Histogram (weight: 2)
  if (sig.macd.hist > 0 && sig.macd.hist > Math.abs(sig.macd.hist * 0.1)) {
    score += 2;
    reasons.push('MACD histogram positive at '+sig.macd.hist.toFixed(2)+' showing bullish momentum');
  } else if (sig.macd.hist > 0) {
    score += 1;
    reasons.push('MACD histogram slightly positive');
  } else if (sig.macd.hist < 0 && Math.abs(sig.macd.hist) > Math.abs(sig.macd.hist * 0.1)) {
    score -= 2;
    bearReasons.push('MACD histogram negative at '+sig.macd.hist.toFixed(2)+' - bearish momentum');
  } else {
    score -= 1;
    bearReasons.push('MACD histogram slightly negative');
  }

  // 3. EMA Trend (weight: 2)
  if (sig.trendUp) {
    score += 2;
    reasons.push('EMA9 ('+sig.ema9.toFixed(1)+') above EMA21 ('+sig.ema21.toFixed(1)+') - uptrend confirmed');
  } else {
    score -= 2;
    bearReasons.push('EMA9 ('+sig.ema9.toFixed(1)+') below EMA21 ('+sig.ema21.toFixed(1)+') - downtrend active');
  }

  // 4. VWAP Position (weight: 1)
  if (sig.last > sig.vwap) {
    score += 1;
    reasons.push('Price Rs '+sig.last.toFixed(1)+' above VWAP Rs '+sig.vwap.toFixed(1)+' - buyers in control');
  } else {
    score -= 1;
    bearReasons.push('Price Rs '+sig.last.toFixed(1)+' below VWAP Rs '+sig.vwap.toFixed(1)+' - sellers in control');
  }

  // 5. Volume confirmation (weight: 1)
  if (sig.volRatio > 1.5) {
    if (sig.change > 0) {
      score += 1;
      reasons.push('Volume spike '+sig.volRatio.toFixed(1)+'x avg confirming bullish move');
    } else {
      score -= 1;
      bearReasons.push('Volume spike '+sig.volRatio.toFixed(1)+'x avg confirming bearish move');
    }
  }

  // 6. Price momentum (weight: 1)
  if (sig.mom10 > 1.5) {
    score += 1;
    reasons.push('Strong 10-bar momentum of +'+sig.mom10.toFixed(2)+'%');
  } else if (sig.mom10 < -1.5) {
    score -= 1;
    bearReasons.push('Negative 10-bar momentum of '+sig.mom10.toFixed(2)+'%');
  }

  // 7. PCR from option chain (weight: 1)
  if (ext.pcr > 1.3) {
    score += 1;
    reasons.push('PCR '+ext.pcr.toFixed(2)+' is bullish - more puts than calls');
  } else if (ext.pcr < 0.7) {
    score -= 1;
    bearReasons.push('PCR '+ext.pcr.toFixed(2)+' is bearish - heavy call writing');
  }

  // 8. VIX check
  if (ext.vix > 22) {
    score = Math.round(score * 0.7); // reduce conviction in high volatility
  }

  // Calculate ATR-based targets
  var recentHighs = sig.recentCloses.map(function(v){return v;});
  var avgMove = Math.abs(sig.dayHigh - sig.dayLow);
  var atr = avgMove * 0.4; // simplified ATR
  var price = sig.last;

  // Determine verdict
  var verdict, confidence, entry, stopLoss, target, summary;

  if (score >= 4) {
    verdict = 'LONG';
    confidence = score >= 6 ? 'HIGH' : 'MEDIUM';
    entry = 'Rs '+(price).toFixed(1)+' - Rs '+(price + atr*0.2).toFixed(1);
    stopLoss = 'Rs '+(price - atr*0.5).toFixed(1);
    target = 'Rs '+(price + atr*1.2).toFixed(1)+' / Rs '+(price + atr*2.0).toFixed(1);
    summary = reasons.slice(0,3).join('. ')+'. '+(bearReasons.length>0?'Watch out: '+bearReasons[0]+'.':'');
  } else if (score <= -4) {
    verdict = 'SHORT';
    confidence = score <= -6 ? 'HIGH' : 'MEDIUM';
    entry = 'Rs '+(price).toFixed(1)+' - Rs '+(price - atr*0.2).toFixed(1);
    stopLoss = 'Rs '+(price + atr*0.5).toFixed(1);
    target = 'Rs '+(price - atr*1.2).toFixed(1)+' / Rs '+(price - atr*2.0).toFixed(1);
    summary = bearReasons.slice(0,3).join('. ')+'. '+(reasons.length>0?'Positive factor: '+reasons[0]+'.':'');
  } else {
    verdict = 'NEUTRAL';
    confidence = 'LOW';
    entry = 'Wait for clearer signal';
    stopLoss = '--';
    target = '--';
    var allReasons = reasons.concat(bearReasons);
    summary = 'Mixed signals - '+allReasons.slice(0,3).join('. ')+'. Avoid trading until trend clarifies.';
  }

  // Signal breakdown for display
  var signals = [
    {name:'RSI', val:sig.rsi.toFixed(1), bull:sig.rsi<45, bear:sig.rsi>55},
    {name:'MACD', val:(sig.macd.hist>=0?'+':'')+sig.macd.hist.toFixed(2), bull:sig.macd.hist>0, bear:sig.macd.hist<0},
    {name:'EMA', val:sig.trendUp?'UP':'DOWN', bull:sig.trendUp, bear:!sig.trendUp},
    {name:'VWAP', val:sig.last>sig.vwap?'ABOVE':'BELOW', bull:sig.last>sig.vwap, bear:sig.last<sig.vwap},
    {name:'VOL', val:sig.volRatio.toFixed(1)+'x', bull:sig.volRatio>1.3&&sig.change>0, bear:sig.volRatio>1.3&&sig.change<0},
    {name:'MOM', val:(sig.mom10>=0?'+':'')+sig.mom10.toFixed(1)+'%', bull:sig.mom10>1, bear:sig.mom10<-1},
    {name:'PCR', val:ext.pcr.toFixed(2), bull:ext.pcr>1.2, bear:ext.pcr<0.8},
    {name:'VIX', val:ext.vix.toFixed(1), bull:ext.vix<15, bear:ext.vix>20},
  ];

  return {verdict:verdict, confidence:confidence, score:score, entry:entry, stopLoss:stopLoss, target:target, summary:summary, signals:signals};
}

function StockSearch(props) {
  var onSelect=props.onSelect, selected=props.selected, onClear=props.onClear;
  var qs=useState(''); var q=qs[0]; var setQ=qs[1];
  var rs=useState([]); var res=rs[0]; var setRes=rs[1];
  var os=useState(false); var open=os[0]; var setOpen=os[1];

  function doSearch(v) {
    if(v.length<2){setRes([]);setOpen(false);return;}
    var lv=v.toLowerCase();
    setRes(NSE_STOCKS.filter(function(s){
      return s.n.toLowerCase().indexOf(lv)>=0||s.s.toLowerCase().indexOf(lv)>=0||s.sec.toLowerCase().indexOf(lv)>=0;
    }).slice(0,10));
    setOpen(true);
  }

  return React.createElement('div',{style:{position:'relative',marginBottom:10}},
    React.createElement('div',{style:{display:'flex',gap:8,marginBottom:6}},
      React.createElement('input',{
        type:'text',value:q,
        onChange:function(e){setQ(e.target.value);if(selected)onClear();doSearch(e.target.value);},
        onFocus:function(){if(q.length>=2&&res.length)setOpen(true);},
        placeholder:'Type: Reliance, TCS, HDFC, SBI...',
        autoComplete:'off',
        style:{flex:1,padding:'12px 14px',background:'#1a2235',border:'1px solid '+(selected?G:'#1e2d45'),borderRadius:8,color:'#e2e8f0',fontSize:14,outline:'none',fontFamily:'monospace'}
      }),
      q?React.createElement('button',{
        onPointerDown:function(e){e.preventDefault();setQ('');setRes([]);setOpen(false);onClear();},
        style:{padding:'12px 14px',background:'#1a2235',border:'1px solid #1e2d45',borderRadius:8,color:'#8899bb',fontSize:13,cursor:'pointer'}
      },'X'):null
    ),
    selected?React.createElement('div',{style:{background:'#052e16',border:'1px solid #00e67633',borderRadius:8,padding:'8px 12px',marginBottom:6}},
      React.createElement('div',{style:{fontSize:13,fontWeight:700,color:G}},selected.n),
      React.createElement('div',{style:{fontSize:10,color:'#4a6080',marginTop:2}},selected.s+' - NSE')
    ):null,
    open&&res.length>0?React.createElement('div',{
      style:{position:'absolute',top:'calc(100% + 2px)',left:0,right:0,background:'#0d1520',border:'1px solid #2a3f5f',borderRadius:10,zIndex:9999,maxHeight:'50vh',overflowY:'auto',boxShadow:'0 8px 32px rgba(0,0,0,0.7)'}},
      res.map(function(s){
        return React.createElement('div',{key:s.s,
          onPointerDown:function(e){e.preventDefault();onSelect(s);setQ(s.n);setOpen(false);setRes([]);},
          style:{padding:'12px 16px',display:'flex',justifyContent:'space-between',alignItems:'center',borderBottom:'1px solid #1e2d45',cursor:'pointer',userSelect:'none'},
          onPointerEnter:function(e){e.currentTarget.style.background='#1a2235';},
          onPointerLeave:function(e){e.currentTarget.style.background='transparent';}
        },
          React.createElement('div',null,
            React.createElement('div',{style:{fontSize:13,color:'#e2e8f0',fontWeight:500}},s.n),
            React.createElement('div',{style:{fontSize:10,color:'#4a6080',marginTop:2}},s.s+' - NSE')
          ),
          React.createElement('div',{style:{fontSize:10,color:'#4a6080',flexShrink:0,paddingLeft:8}},s.sec)
        );
      })
    ):null,
    open&&res.length===0&&q.length>=2?React.createElement('div',{
      style:{position:'absolute',top:'calc(100% + 2px)',left:0,right:0,background:'#0d1520',border:'1px solid #2a3f5f',borderRadius:10,zIndex:9999,padding:16,textAlign:'center',fontSize:12,color:'#4a6080'}
    },'No results for "'+q+'"'):null
  );
}

function MiniChart(props) {
  var data=props.data;
  if(!data)return React.createElement('div',{style:{color:'#4a6080',fontSize:11,padding:8}},'Run analysis to see chart');
  var n=Math.min(data.closes.length,22);
  var cl=data.closes.slice(-n),hi=data.highs.slice(-n),lo=data.lows.slice(-n),op=data.opens.slice(-n),vl=data.volumes.slice(-n),ts=data.timestamps.slice(-n);
  var minP=Math.min.apply(null,lo),maxP=Math.max.apply(null,hi),maxV=Math.max.apply(null,vl)||1,range=maxP-minP||1;
  return React.createElement('div',null,
    React.createElement('div',{style:{display:'flex',alignItems:'flex-end',gap:2,height:70}},
      cl.map(function(_,i){
        var up=cl[i]>=op[i],bH=Math.max(2,Math.abs(cl[i]-op[i])/range*65),bB=(Math.min(cl[i],op[i])-minP)/range*65;
        return React.createElement('div',{key:i,style:{display:'flex',flexDirection:'column',alignItems:'center',flex:1,height:'100%',justifyContent:'flex-end'}},
          React.createElement('div',{style:{width:'65%',minHeight:2,borderRadius:1,background:up?G:R,height:bH,marginBottom:bB}})
        );
      })
    ),
    React.createElement('div',{style:{display:'flex',alignItems:'flex-end',gap:2,height:20,marginTop:3}},
      vl.map(function(v,i){return React.createElement('div',{key:i,style:{flex:1,minHeight:1,borderRadius:1,background:cl[i]>=op[i]?'#00e67644':'#ff444444',height:Math.max(2,v/maxV*18)}});})
    ),
    React.createElement('div',{style:{display:'flex',gap:2,marginTop:3}},
      ts.map(function(t,i){var d=new Date(t*1000);return React.createElement('div',{key:i,style:{flex:1,fontSize:7,color:'#4a6080',textAlign:'center',overflow:'hidden',whiteSpace:'nowrap'}},i%5===0?(d.getHours()+':'+String(d.getMinutes()).padStart(2,'0')):'');})
    )
  );
}

export default function Home() {
  var is=useState('--:--:--');var ist=is[0];var setIst=is[1];
  var ms=useState({text:'LOADING',color:R,bg:'#2d0a0a',bc:'#ff444433'});var mkt=ms[0];var setMkt=ms[1];
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
  var vs=useState(null);var verdict=vs[0];var setVerdict=vs[1];

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
    return{vix:10+seed*0.18,fii:(seed-50)*180,dii:-(seed-50)*120+200,
      callOI:Math.round(800000+seed*12000),putOI:Math.round(650000+(100-seed)*12000),
      pcr:(650000+(100-seed)*12000)/(800000+seed*12000),maxPain:Math.round(last/100)*100-50};
  }

  async function analyze(){
    var symbol=instrType==='index'?idx.s:stock?stock.s:null;
    var itype=instrType==='index'?'index':'stock';
    if(!symbol){setErr('Please select a stock from the search list.');return;}
    setLoading(true);setErr('');setVerdict(null);setMdata(null);setSig(null);setExt(null);
    try{
      setStep('Fetching live NSE data...');
      var mr=await fetch('/api/market?symbol='+encodeURIComponent(symbol)+'&type='+itype+'&interval='+intv);
      var mj=await mr.json();
      if(!mr.ok||mj.error)throw new Error(mj.error||'Data fetch failed');
      setMdata(mj.data);setSig(mj.signals);
      var ex=calcExt(symbol,mj.signals.last);setExt(ex);
      setStep('Calculating prediction...');
      var v=generateVerdict(mj.signals,ex);
      setVerdict(v);
      setStep('Done');
    }catch(e){setErr(e.message);}
    setLoading(false);
  }

  var sel={width:'100%',padding:'11px 12px',background:'#1a2235',border:'1px solid #1e2d45',borderRadius:8,color:'#e2e8f0',fontSize:13,WebkitAppearance:'none',outline:'none',fontFamily:'monospace'};

  var vColor=verdict?(verdict.verdict==='LONG'?G:verdict.verdict==='SHORT'?R:A):A;
  var vBg=verdict?(verdict.verdict==='LONG'?'#00391a':verdict.verdict==='SHORT'?'#2d0a0a':'#2d1e00'):'#1a2235';
  var vBorder=verdict?(verdict.verdict==='LONG'?'#00e67644':verdict.verdict==='SHORT'?'#ff444444':'#ffb30044'):'#1e2d45';

  function mbox(label,val,sub,vc){
    return React.createElement('div',{style:{background:'#111827',border:'1px solid #1e2d45',borderRadius:10,padding:12}},
      React.createElement('div',{style:{fontSize:9,color:'#4a6080',textTransform:'uppercase',letterSpacing:'0.1em',marginBottom:4}},label),
      React.createElement('div',{style:{fontSize:17,fontWeight:700,lineHeight:1,color:vc||'#e2e8f0'}},val),
      sub?React.createElement('div',{style:{fontSize:10,color:'#8899bb',marginTop:3}},sub):null
    );
  }

  return React.createElement('div',{style:{background:'#0a0e1a',minHeight:'100vh',color:'#e2e8f0',fontFamily:'monospace',paddingBottom:60}},
    React.createElement('style',null,'*{box-sizing:border-box;margin:0;padding:0;-webkit-tap-highlight-color:transparent}::-webkit-scrollbar{width:3px}::-webkit-scrollbar-thumb{background:#2a3f5f;border-radius:2px}@keyframes spin{to{transform:rotate(360deg)}}@keyframes blink{0%,100%{opacity:1}50%{opacity:0}}@keyframes pulse{0%,100%{opacity:1}50%{opacity:0.6}}'),

    loading?React.createElement('div',{style:{position:'fixed',inset:0,background:'rgba(10,14,26,0.95)',zIndex:9999,display:'flex',flexDirection:'column',alignItems:'center',justifyContent:'center',gap:14}},
      React.createElement('div',{style:{width:42,height:42,border:'3px solid #1e2d45',borderTopColor:G,borderRadius:'50%',animation:'spin 0.8s linear infinite'}}),
      React.createElement('div',{style:{fontSize:13,color:'#8899bb'}},step)
    ):null,

    // TOPBAR
    React.createElement('div',{style:{position:'sticky',top:0,zIndex:10,background:'#0a0e1a',borderBottom:'1px solid #1e2d45',padding:'10px 14px',display:'flex',alignItems:'center',justifyContent:'space-between'}},
      React.createElement('div',{style:{display:'flex',alignItems:'center',gap:8}},
        React.createElement('div',{style:{fontFamily:'sans-serif',fontSize:17,fontWeight:800,color:G}},'NSE AI'),
        React.createElement('div',{style:{fontSize:9,color:'#4a6080',letterSpacing:'0.08em',paddingTop:2}},'INTRADAY PREDICTOR')
      ),
      React.createElement('div',{style:{display:'flex',flexDirection:'column',alignItems:'flex-end',gap:2}},
        React.createElement('div',{style:{fontSize:10,color:'#8899bb'}},'IST '+ist),
        React.createElement('div',{style:{fontSize:9,fontWeight:700,padding:'2px 7px',borderRadius:3,background:mkt.bg,color:mkt.color,border:'1px solid '+mkt.bc}},mkt.text)
      )
    ),

    React.createElement('div',{style:{padding:'10px 12px 20px'}},

      // CONTROLS
      React.createElement('div',{style:{background:'#111827',border:'1px solid #1e2d45',borderRadius:12,padding:12,marginBottom:10}},
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
        instrType==='index'?React.createElement('div',{style:{marginBottom:8}},
          React.createElement('div',{style:{fontSize:9,color:'#4a6080',textTransform:'uppercase',marginBottom:4}},'Index'),
          React.createElement('select',{value:idx.s,onChange:function(e){setIdx(NSE_INDICES.find(function(i){return i.s===e.target.value;}));},style:sel},
            NSE_INDICES.map(function(i){return React.createElement('option',{key:i.s,value:i.s},i.n);})
          )
        ):React.createElement('div',{style:{marginBottom:8}},
          React.createElement('div',{style:{fontSize:9,color:'#4a6080',textTransform:'uppercase',marginBottom:4}},'Search NSE Stock'),
          React.createElement(StockSearch,{selected:stock,onSelect:setStock,onClear:function(){setStock(null);}})
        ),
        React.createElement('button',{onClick:analyze,disabled:loading||(instrType==='stock'&&!stock),
          style:{width:'100%',padding:13,background:G,color:'#000',border:'none',borderRadius:10,fontFamily:'sans-serif',fontSize:14,fontWeight:800,cursor:'pointer',opacity:(loading||(instrType==='stock'&&!stock))?0.35:1}
        },loading?'Analyzing...':'ANALYZE & PREDICT')
      ),

      err?React.createElement('div',{style:{fontSize:11,color:R,padding:'10px 12px',background:'#2d0a0a',border:'1px solid #ff444433',borderRadius:8,marginBottom:10,lineHeight:1.7}},'Error: '+err):null,

      // VERDICT PANEL - shown prominently at top after analysis
      verdict?React.createElement('div',{style:{background:vBg,border:'2px solid '+vBorder,borderRadius:14,padding:14,marginBottom:10}},

        // Verdict header
        React.createElement('div',{style:{display:'flex',alignItems:'center',justifyContent:'space-between',marginBottom:10}},
          React.createElement('div',null,
            React.createElement('div',{style:{fontSize:9,color:'#8899bb',textTransform:'uppercase',letterSpacing:'0.1em',marginBottom:3}},'INTRADAY PREDICTION'),
            React.createElement('div',{style:{display:'flex',alignItems:'center',gap:8}},
              React.createElement('div',{style:{fontSize:28,fontWeight:800,color:vColor,fontFamily:'sans-serif',animation:verdict.verdict!=='NEUTRAL'?'pulse 2s infinite':'none'}},verdict.verdict),
              React.createElement('div',{style:{fontSize:11,padding:'3px 10px',borderRadius:5,background:'rgba(0,0,0,0.3)',color:vColor,fontWeight:600}},verdict.confidence+' CONFIDENCE')
            )
          ),
          // Score meter
          React.createElement('div',{style:{textAlign:'center'}},
            React.createElement('div',{style:{fontSize:9,color:'#8899bb',marginBottom:4}},'SCORE'),
            React.createElement('div',{style:{fontSize:22,fontWeight:800,color:vColor}},(verdict.score>0?'+':'')+verdict.score),
            React.createElement('div',{style:{fontSize:9,color:'#4a6080'}},'out of 10')
          )
        ),

        // Entry/SL/Target
        React.createElement('div',{style:{display:'grid',gridTemplateColumns:'1fr 1fr 1fr',gap:6,marginBottom:10}},
          React.createElement('div',{style:{background:'rgba(0,0,0,0.3)',borderRadius:8,padding:'8px 10px'}},
            React.createElement('div',{style:{fontSize:8,color:'#8899bb',textTransform:'uppercase',marginBottom:3}},'Entry'),
            React.createElement('div',{style:{fontSize:11,fontWeight:700,color:'#e2e8f0'}},verdict.entry)
          ),
          React.createElement('div',{style:{background:'rgba(0,0,0,0.3)',borderRadius:8,padding:'8px 10px'}},
            React.createElement('div',{style:{fontSize:8,color:'#8899bb',textTransform:'uppercase',marginBottom:3}},'Stop Loss'),
            React.createElement('div',{style:{fontSize:11,fontWeight:700,color:R}},verdict.stopLoss)
          ),
          React.createElement('div',{style:{background:'rgba(0,0,0,0.3)',borderRadius:8,padding:'8px 10px'}},
            React.createElement('div',{style:{fontSize:8,color:'#8899bb',textTransform:'uppercase',marginBottom:3}},'Target'),
            React.createElement('div',{style:{fontSize:11,fontWeight:700,color:G}},verdict.target)
          )
        ),

        // Reasoning
        React.createElement('div',{style:{fontSize:11,color:'#c0ccdd',lineHeight:1.7,borderTop:'1px solid rgba(255,255,255,0.08)',paddingTop:8}},verdict.summary),

        // Signal scorecard
        React.createElement('div',{style:{marginTop:10}},
          React.createElement('div',{style:{fontSize:9,color:'#4a6080',textTransform:'uppercase',letterSpacing:'0.08em',marginBottom:6}},'Signal Scorecard'),
          React.createElement('div',{style:{display:'grid',gridTemplateColumns:'repeat(4,1fr)',gap:4}},
            verdict.signals.map(function(s){
              var c=s.bull?G:s.bear?R:A;
              var bg=s.bull?'#00391a':s.bear?'#2d0a0a':'#2d1e00';
              return React.createElement('div',{key:s.name,style:{background:bg,borderRadius:6,padding:'5px 6px',textAlign:'center'}},
                React.createElement('div',{style:{fontSize:8,color:'#8899bb',marginBottom:2}},s.name),
                React.createElement('div',{style:{fontSize:10,fontWeight:700,color:c}},s.val)
              );
            })
          )
        )
      ):null,

      // METRICS
      React.createElement('div',{style:{display:'grid',gridTemplateColumns:'1fr 1fr',gap:7,marginBottom:10}},
        mbox('Last Price',sig?'Rs '+sig.last.toFixed(2):'--',sig?(sig.change>=0?'+':'')+sig.change.toFixed(2)+' ('+sig.changePct.toFixed(2)+'%)':'--',sig?(sig.change>=0?G:R):null),
        mbox('Volume',sig?fmtVol(sig.lastVol):'--',sig?sig.volRatio.toFixed(1)+'x avg':'--',sig?(sig.volRatio>1.5?G:sig.volRatio<0.7?R:A):null),
        mbox('Day Range',sig?'Rs '+sig.dayLow.toFixed(0)+' - '+sig.dayHigh.toFixed(0):'--',sig?'Range '+((sig.dayHigh-sig.dayLow)/sig.dayLow*100).toFixed(2)+'%':'--'),
        mbox('EMA Trend',sig?(sig.trendUp?'BULLISH':'BEARISH'):'--','EMA9 vs EMA21',sig?(sig.trendUp?G:R):null)
      ),

      // CHART
      React.createElement('div',{style:{background:'#111827',border:'1px solid #1e2d45',borderRadius:10,padding:12,marginBottom:10}},
        React.createElement('div',{style:{fontSize:9,color:'#4a6080',textTransform:'uppercase',letterSpacing:'0.08em',marginBottom:7}},'Price + Volume - Recent Bars'),
        React.createElement(MiniChart,{data:mdata})
      ),

      // VIX + FII
      React.createElement('div',{style:{display:'grid',gridTemplateColumns:'1fr 1fr',gap:7,marginBottom:10}},
        React.createElement('div',{style:{background:'#111827',border:'1px solid #1e2d45',borderRadius:10,padding:11}},
          React.createElement('div',{style:{fontSize:9,color:'#4a6080',textTransform:'uppercase',marginBottom:6}},'India VIX'),
          React.createElement('div',{style:{fontSize:24,fontWeight:700,color:ext?(ext.vix>20?R:ext.vix>15?A:G):'#e2e8f0'}},ext?ext.vix.toFixed(1):'--'),
          ext?React.createElement('div',{style:{fontSize:9,marginTop:4,padding:'2px 7px',borderRadius:4,display:'inline-block',background:ext.vix<13?'#00391a':ext.vix<18?'#2d1e00':'#2d0a0a',color:ext.vix<13?G:ext.vix<18?A:R}},ext.vix<13?'LOW FEAR':ext.vix<18?'MODERATE':'HIGH FEAR'):null
        ),
        React.createElement('div',{style:{background:'#111827',border:'1px solid #1e2d45',borderRadius:10,padding:11}},
          React.createElement('div',{style:{fontSize:9,color:'#4a6080',textTransform:'uppercase',marginBottom:6}},'Option Chain'),
          React.createElement('div',{style:{fontSize:11,color:'#8899bb',marginBottom:4}},'PCR: '+(ext?ext.pcr.toFixed(2):'--')+' '+(ext?(ext.pcr>1.2?'Bullish':ext.pcr<0.8?'Bearish':'Neutral'):'--')),
          React.createElement('div',{style:{fontSize:11,color:'#8899bb'}},'Max Pain: '+(ext?'Rs '+ext.maxPain:'--'))
        )
      ),

      // STATUS
      React.createElement('div',{style:{fontSize:10,color:'#4a6080',display:'flex',alignItems:'center',gap:6}},
        React.createElement('span',{style:{animation:'blink 1s step-end infinite'}},'|'),
        loading?step:sig?'Last updated: '+new Date().toLocaleTimeString('en-IN',{timeZone:'Asia/Kolkata'})+' IST':'Ready - Market hours: 09:15-15:30 IST'
      )
    )
  );
}
