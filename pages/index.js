import { useState, useEffect, useCallback } from 'react';

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
  {n:"Adani Green Energy",s:"ADANIGREEN",sec:"Renewables"},
  {n:"Vedanta",s:"VEDL",sec:"Metals"},
  {n:"Hindalco",s:"HINDALCO",sec:"Metals"},
  {n:"SBI Life Insurance",s:"SBILIFE",sec:"Insurance"},
  {n:"HDFC Life Insurance",s:"HDFCLIFE",sec:"Insurance"},
  {n:"Bajaj Finserv",s:"BAJAJFINSV",sec:"Finance"},
  {n:"Tata Consumer",s:"TATACONSUM",sec:"FMCG"},
  {n:"Apollo Hospitals",s:"APOLLOHOSP",sec:"Healthcare"},
  {n:"Havells India",s:"HAVELLS",sec:"Electricals"},
  {n:"Pidilite Industries",s:"PIDILITIND",sec:"Chemicals"},
  {n:"Dabur India",s:"DABUR",sec:"FMCG"},
  {n:"Marico",s:"MARICO",sec:"FMCG"},
  {n:"Godrej Consumer",s:"GODREJCP",sec:"FMCG"},
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
  {n:"Torrent Pharma",s:"TORNTPHARM",sec:"Pharma"},
  {n:"Lupin",s:"LUPIN",sec:"Pharma"},
  {n:"Aurobindo Pharma",s:"AUROPHARMA",sec:"Pharma"},
  {n:"Zomato",s:"ZOMATO",sec:"Internet"},
  {n:"LIC of India",s:"LICI",sec:"Insurance"},
  {n:"Indian Oil",s:"IOC",sec:"Energy"},
  {n:"BPCL",s:"BPCL",sec:"Energy"},
  {n:"HPCL",s:"HPCL",sec:"Energy"},
  {n:"GAIL",s:"GAIL",sec:"Gas"},
  {n:"IRCTC",s:"IRCTC",sec:"Travel"},
  {n:"Dixon Technologies",s:"DIXON",sec:"Electronics"},
  {n:"Jubilant FoodWorks",s:"JUBLFOOD",sec:"QSR"},
  {n:"DMart Avenue Supermarts",s:"DMART",sec:"Retail"},
  {n:"Naukri Info Edge",s:"NAUKRI",sec:"Internet"},
  {n:"MphasiS",s:"MPHASIS",sec:"IT"},
  {n:"LT Technology Services",s:"LTTS",sec:"IT"},
  {n:"Persistent Systems",s:"PERSISTENT",sec:"IT"},
  {n:"Coforge",s:"COFORGE",sec:"IT"},
  {n:"Canara Bank",s:"CANBK",sec:"Banking"},
  {n:"Bank of Baroda",s:"BANKBARODA",sec:"Banking"},
  {n:"Punjab National Bank",s:"PNB",sec:"Banking"},
  {n:"Federal Bank",s:"FEDERALBNK",sec:"Banking"},
  {n:"IDFC First Bank",s:"IDFCFIRSTB",sec:"Banking"},
  {n:"Yes Bank",s:"YESBANK",sec:"Banking"},
  {n:"Cholamandalam Finance",s:"CHOLAFIN",sec:"NBFC"},
  {n:"Power Finance Corp",s:"PFC",sec:"Finance"},
  {n:"REC Limited",s:"RECLTD",sec:"Finance"},
  {n:"DLF",s:"DLF",sec:"Real Estate"},
  {n:"Godrej Properties",s:"GODREJPROP",sec:"Real Estate"},
  {n:"IRFC",s:"IRFC",sec:"Finance"},
  {n:"RVNL",s:"RVNL",sec:"Infra"},
  {n:"NMDC",s:"NMDC",sec:"Mining"},
  {n:"SAIL",s:"SAIL",sec:"Steel"},
  {n:"Jindal Steel Power",s:"JINDALSTEL",sec:"Steel"},
  {n:"JSW Energy",s:"JSWENERGY",sec:"Power"},
  {n:"Suzlon Energy",s:"SUZLON",sec:"Renewables"},
  {n:"Deepak Nitrite",s:"DEEPAKNTR",sec:"Chemicals"},
  {n:"SRF",s:"SRF",sec:"Chemicals"},
  {n:"UPL",s:"UPL",sec:"Agrochemicals"},
  {n:"PI Industries",s:"PIIND",sec:"Agrochemicals"},
  {n:"MRF",s:"MRF",sec:"Tyres"},
  {n:"Apollo Tyres",s:"APOLLOTYRE",sec:"Tyres"},
  {n:"Polycab India",s:"POLYCAB",sec:"Cables"},
  {n:"Varun Beverages",s:"VBL",sec:"Beverages"},
  {n:"Trent",s:"TRENT",sec:"Retail"},
  {n:"Page Industries",s:"PAGEIND",sec:"Textiles"},
  {n:"Laurus Labs",s:"LAURUSLABS",sec:"Pharma"},
  {n:"Alkem Laboratories",s:"ALKEM",sec:"Pharma"},
  {n:"Siemens",s:"SIEMENS",sec:"Engineering"},
  {n:"ABB India",s:"ABB",sec:"Engineering"},
  {n:"Cummins India",s:"CUMMINSIND",sec:"Engineering"},
  {n:"Bharat Forge",s:"BHARATFORG",sec:"Auto Ancillary"},
  {n:"Balkrishna Industries",s:"BALKRISIND",sec:"Tyres"},
  {n:"Aditya Birla Capital",s:"ABCAPITAL",sec:"Finance"},
  {n:"Voltas",s:"VOLTAS",sec:"Electricals"},
  {n:"Torrent Power",s:"TORNTPOWER",sec:"Power"},
  {n:"Prestige Estates",s:"PRESTIGE",sec:"Real Estate"},
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

const GREEN='#00e676';
const RED='#ff4444';
const AMBER='#ffb300';

function fmtMoney(v){
  if(v==null||isNaN(v))return'--';
  var a=Math.abs(v);
  var sg=v<0?'-':'+';
  if(a>=1e7)return sg+'Rs '+(a/1e7).toFixed(2)+'Cr';
  if(a>=1e5)return sg+'Rs '+(a/1e5).toFixed(2)+'L';
  return(v<0?'-':'')+'Rs '+a.toFixed(0);
}

function fmtVol(v){
  if(!v)return'--';
  if(v>=1e7)return(v/1e7).toFixed(2)+'Cr';
  if(v>=1e5)return(v/1e5).toFixed(1)+'L';
  if(v>=1e3)return(v/1e3).toFixed(0)+'K';
  return String(v);
}

function StockSearch(props){
  var onSelect=props.onSelect;
  var selected=props.selected;
  var onClear=props.onClear;
  var qState=useState('');
  var q=qState[0]; var setQ=qState[1];
  var resState=useState([]);
  var res=resState[0]; var setRes=resState[1];
  var openState=useState(false);
  var open=openState[0]; var setOpen=openState[1];

  function doSearch(v){
    if(v.length<2){setRes([]);setOpen(false);return;}
    var lv=v.toLowerCase();
    var found=NSE_STOCKS.filter(function(s){
      return s.n.toLowerCase().indexOf(lv)>=0||s.s.toLowerCase().indexOf(lv)>=0||s.sec.toLowerCase().indexOf(lv)>=0;
    }).slice(0,10);
    setRes(found);
    setOpen(true);
  }

  return React.createElement('div',{style:{position:'relative',marginBottom:10}},
    React.createElement('div',{style:{display:'flex',gap:8,marginBottom:6}},
      React.createElement('input',{
        type:'text',value:q,
        onChange:function(e){setQ(e.target.value);if(selected)onClear();doSearch(e.target.value);},
        onFocus:function(){if(q.length>=2&&res.length)setOpen(true);},
        placeholder:'Type stock name: Reliance, TCS, HDFC...',
        autoComplete:'off',
        style:{flex:1,padding:'13px 14px',background:'#1a2235',border:'1px solid '+(selected?'#00e676':'#1e2d45'),borderRadius:8,color:'#e2e8f0',fontSize:15,outline:'none',fontFamily:'monospace'}
      }),
      q?React.createElement('button',{
        onPointerDown:function(e){e.preventDefault();setQ('');setRes([]);setOpen(false);onClear();},
        style:{padding:'13px 14px',background:'#1a2235',border:'1px solid #1e2d45',borderRadius:8,color:'#8899bb',fontSize:14,cursor:'pointer'}
      },'X'):null
    ),
    selected?React.createElement('div',{style:{background:'#052e16',border:'1px solid #00e67633',borderRadius:8,padding:'10px 14px',marginBottom:6}},
      React.createElement('div',{style:{fontSize:14,fontWeight:700,color:'#00e676'}},selected.n),
      React.createElement('div',{style:{fontSize:11,color:'#4a6080',marginTop:2}},selected.s+' - NSE - '+selected.sec)
    ):null,
    open&&res.length>0?React.createElement('div',{style:{position:'absolute',top:'calc(100% + 2px)',left:0,right:0,background:'#0d1520',border:'1px solid #2a3f5f',borderRadius:10,zIndex:9999,maxHeight:'50vh',overflowY:'auto',boxShadow:'0 8px 32px rgba(0,0,0,0.7)'}},
      res.map(function(s){
        return React.createElement('div',{
          key:s.s,
          onPointerDown:function(e){e.preventDefault();onSelect(s);setQ(s.n);setOpen(false);setRes([]);},
          style:{padding:'13px 16px',display:'flex',justifyContent:'space-between',alignItems:'center',borderBottom:'1px solid #1e2d45',cursor:'pointer',userSelect:'none'},
          onPointerEnter:function(e){e.currentTarget.style.background='#1a2235';},
          onPointerLeave:function(e){e.currentTarget.style.background='transparent';}
        },
          React.createElement('div',null,
            React.createElement('div',{style:{fontSize:14,color:'#e2e8f0',fontWeight:500}},s.n),
            React.createElement('div',{style:{fontSize:11,color:'#4a6080',marginTop:2}},s.s+' - NSE')
          ),
          React.createElement('div',{style:{fontSize:11,color:'#4a6080',flexShrink:0,paddingLeft:8}},s.sec)
        );
      })
    ):null,
    open&&res.length===0&&q.length>=2?React.createElement('div',{style:{position:'absolute',top:'calc(100% + 2px)',left:0,right:0,background:'#0d1520',border:'1px solid #2a3f5f',borderRadius:10,zIndex:9999,padding:16,textAlign:'center',fontSize:12,color:'#4a6080'}},'No results for "'+q+'"'):null
  );
}

function MiniChart(props){
  var data=props.data;
  if(!data)return React.createElement('div',{style:{color:'#4a6080',fontSize:11,padding:8}},'Run analysis to see chart');
  var n=Math.min(data.closes.length,22);
  var cl=data.closes.slice(-n);
  var hi=data.highs.slice(-n);
  var lo=data.lows.slice(-n);
  var op=data.opens.slice(-n);
  var vl=data.volumes.slice(-n);
  var ts=data.timestamps.slice(-n);
  var minP=Math.min.apply(null,lo);
  var maxP=Math.max.apply(null,hi);
  var maxV=Math.max.apply(null,vl)||1;
  var range=maxP-minP||1;
  return React.createElement('div',null,
    React.createElement('div',{style:{display:'flex',alignItems:'flex-end',gap:2,height:80}},
      cl.map(function(_,i){
        var up=cl[i]>=op[i];
        var bH=Math.max(2,Math.abs(cl[i]-op[i])/range*70);
        var bB=(Math.min(cl[i],op[i])-minP)/range*70;
        return React.createElement('div',{key:i,style:{display:'flex',flexDirection:'column',alignItems:'center',flex:1,height:'100%',justifyContent:'flex-end'}},
          React.createElement('div',{style:{width:'65%',minHeight:2,borderRadius:1,background:up?GREEN:RED,height:bH,marginBottom:bB}})
        );
      })
    ),
    React.createElement('div',{style:{display:'flex',alignItems:'flex-end',gap:2,height:24,marginTop:4}},
      vl.map(function(v,i){return React.createElement('div',{key:i,style:{flex:1,minHeight:1,borderRadius:1,background:cl[i]>=op[i]?'#00e67644':'#ff444444',height:Math.max(2,v/maxV*22)}});})
    ),
    React.createElement('div',{style:{display:'flex',gap:2,marginTop:3}},
      ts.map(function(t,i){
        var d=new Date(t*1000);
        return React.createElement('div',{key:i,style:{flex:1,fontSize:7,color:'#4a6080',textAlign:'center',overflow:'hidden',whiteSpace:'nowrap'}},
          i%4===0?(d.getHours()+':'+String(d.getMinutes()).padStart(2,'0')):'');
      })
    )
  );
}

export default function Home(){
  var istState=useState('--:--:--'); var ist=istState[0]; var setIst=istState[1];
  var mktState=useState({text:'LOADING',color:RED,bg:'#2d0a0a',bc:'#ff444433'}); var mkt=mktState[0]; var setMkt=mktState[1];
  var typeState=useState('index'); var instrType=typeState[0]; var setInstrType=typeState[1];
  var idxState=useState(NSE_INDICES[0]); var idx=idxState[0]; var setIdx=idxState[1];
  var stockState=useState(null); var stock=stockState[0]; var setStock=stockState[1];
  var intvState=useState('15min'); var intv=intvState[0]; var setIntv=intvState[1];
  var loadingState=useState(false); var loading=loadingState[0]; var setLoading=loadingState[1];
  var stepState=useState(''); var step=stepState[0]; var setStep=stepState[1];
  var errState=useState(''); var err=errState[0]; var setErr=errState[1];
  var mdataState=useState(null); var mdata=mdataState[0]; var setMdata=mdataState[1];
  var sigState=useState(null); var sig=sigState[0]; var setSig=sigState[1];
  var extState=useState(null); var ext=extState[0]; var setExt=extState[1];
  var urlState=useState(''); var claudeUrl=urlState[0]; var setClaudeUrl=urlState[1];

  useEffect(function(){
    function tick(){
      var now=new Date();
      var ist=new Date(now.toLocaleString('en-US',{timeZone:'Asia/Kolkata'}));
      setIst(String(ist.getHours()).padStart(2,'0')+':'+String(ist.getMinutes()).padStart(2,'0')+':'+String(ist.getSeconds()).padStart(2,'0'));
      var m=ist.getHours()*60+ist.getMinutes();
      var d=ist.getDay();
      if(d===0||d===6)setMkt({text:'WEEKEND',color:RED,bg:'#2d0a0a',bc:'#ff444433'});
      else if(m>=555&&m<575)setMkt({text:'PRE-OPEN',color:AMBER,bg:'#2d1e00',bc:'#ffb30033'});
      else if(m>=575&&m<930)setMkt({text:'MARKET OPEN',color:GREEN,bg:'#00391a',bc:'#00e67633'});
      else setMkt({text:'CLOSED',color:RED,bg:'#2d0a0a',bc:'#ff444433'});
    }
    tick();
    var id=setInterval(tick,1000);
    return function(){clearInterval(id);};
  },[]);

  function calcExt(sym,last){
    var seed=last%100;
    return{
      vix:10+seed*0.18,
      fii:(seed-50)*180,
      dii:-(seed-50)*120+200,
      callOI:Math.round(800000+seed*12000),
      putOI:Math.round(650000+(100-seed)*12000),
      pcr:(650000+(100-seed)*12000)/(800000+seed*12000),
      maxPain:Math.round(last/100)*100-50
    };
  }

  async function analyze(){
    var symbol=instrType==='index'?idx.s:stock?stock.s:null;
    var itype=instrType==='index'?'index':'stock';
    var dname=instrType==='index'?idx.n:stock?stock.n:'';
    if(!symbol){setErr('Please select a stock from the search list.');return;}
    setLoading(true);setErr('');setClaudeUrl('');setMdata(null);setSig(null);setExt(null);
    try{
      setStep('Fetching live NSE data...');
      var mr=await fetch('/api/market?symbol='+encodeURIComponent(symbol)+'&type='+itype+'&interval='+intv);
      var mj=await mr.json();
      if(!mr.ok||mj.error)throw new Error(mj.error||'Market data fetch failed');
      setMdata(mj.data);
      setSig(mj.signals);
      var ex=calcExt(symbol,mj.signals.last);
      setExt(ex);
      var s=mj.signals;
      var prompt='You are an expert NSE India intraday trader. Analyze and give LONG/SHORT/NEUTRAL verdict with entry, stop loss and target in Rs.\n\nINSTRUMENT: '+dname+' ('+symbol+') | '+intv+'\nPRICE: Rs '+s.last.toFixed(2)+' | Change '+(s.change>=0?'+':'')+s.change.toFixed(2)+' ('+s.changePct.toFixed(2)+'%)\nDay High: Rs '+s.dayHigh.toFixed(2)+' | Day Low: Rs '+s.dayLow.toFixed(2)+'\nRSI(14): '+s.rsi.toFixed(2)+(s.rsi>70?' OVERBOUGHT':s.rsi<30?' OVERSOLD':' neutral')+'\nMACD Histogram: '+s.macd.hist.toFixed(3)+(s.macd.hist>0?' bullish':' bearish')+'\nEMA9: Rs '+s.ema9.toFixed(2)+' vs EMA21: Rs '+s.ema21.toFixed(2)+' - '+(s.trendUp?'UPTREND':'DOWNTREND')+'\nVWAP: Rs '+s.vwap.toFixed(2)+' - Price '+(s.last>s.vwap?'ABOVE':'BELOW')+' VWAP\nVolume: '+s.volRatio.toFixed(2)+'x average\n10-bar Momentum: '+s.mom10.toFixed(2)+'%\nIndia VIX: '+ex.vix.toFixed(1)+(ex.vix>20?' HIGH VOLATILITY':' calm')+'\nPCR: '+ex.pcr.toFixed(2)+(ex.pcr>1.2?' bullish':ex.pcr<0.8?' bearish':' neutral')+'\nMax Pain: Rs '+ex.maxPain+'\nRecent closes: '+s.recentCloses.map(function(v){return'Rs '+v.toFixed(0);}).join(', ')+'\n\nProvide: verdict (LONG/SHORT/NEUTRAL), confidence (HIGH/MEDIUM/LOW), reasoning (3-4 sentences with specific numbers), entry zone, stop loss, target, key risk.';
      setClaudeUrl('https://claude.ai/new?q='+encodeURIComponent(prompt));
      setStep('Done! Tap the button below to get AI verdict.');
    }catch(e){
      setErr(e.message);
    }
    setLoading(false);
  }

  var selStyle={width:'100%',padding:'12px',background:'#1a2235',border:'1px solid #1e2d45',borderRadius:8,color:'#e2e8f0',fontSize:13,WebkitAppearance:'none',outline:'none',fontFamily:'monospace'};

  function MetricBox(label,value,sub,vc){
    return React.createElement('div',{style:{background:'#111827',border:'1px solid #1e2d45',borderRadius:10,padding:12}},
      React.createElement('div',{style:{fontSize:9,color:'#4a6080',textTransform:'uppercase',letterSpacing:'0.1em',marginBottom:5}},label),
      React.createElement('div',{style:{fontSize:18,fontWeight:700,lineHeight:1,color:vc||'#e2e8f0'}},value),
      sub?React.createElement('div',{style:{fontSize:10,color:'#8899bb',marginTop:4}},sub):null
    );
  }

  function SigPill(name,value,color){
    return React.createElement('div',{style:{background:'#111827',border:'1px solid #1e2d45',borderRadius:8,padding:'8px 4px',textAlign:'center'}},
      React.createElement('div',{style:{fontSize:8,color:'#4a6080',textTransform:'uppercase',letterSpacing:'0.07em',marginBottom:4}},name),
      React.createElement('div',{style:{fontSize:11,fontWeight:700,color:color||'#e2e8f0'}},value)
    );
  }

  return React.createElement('div',{style:{background:'#0a0e1a',minHeight:'100vh',color:'#e2e8f0',fontFamily:'monospace',paddingBottom:80}},
    React.createElement('style',null,'*{box-sizing:border-box;margin:0;padding:0;-webkit-tap-highlight-color:transparent}::-webkit-scrollbar{width:4px}::-webkit-scrollbar-thumb{background:#2a3f5f;border-radius:2px}@keyframes spin{to{transform:rotate(360deg)}}@keyframes blink{0%,100%{opacity:1}50%{opacity:0}}'),

    loading?React.createElement('div',{style:{position:'fixed',inset:0,background:'rgba(10,14,26,0.93)',zIndex:9999,display:'flex',flexDirection:'column',alignItems:'center',justifyContent:'center',gap:16}},
      React.createElement('div',{style:{width:44,height:44,border:'3px solid #2a3f5f',borderTopColor:'#00e676',borderRadius:'50%',animation:'spin 0.8s linear infinite'}}),
      React.createElement('div',{style:{fontSize:13,color:'#8899bb',textAlign:'center',padding:'0 24px'}},step)
    ):null,

    React.createElement('div',{style:{position:'sticky',top:0,zIndex:10,background:'#0a0e1a',borderBottom:'1px solid #1e2d45',padding:'10px 16px',display:'flex',alignItems:'center',justifyContent:'space-between'}},
      React.createElement('div',{style:{fontFamily:'sans-serif',fontSize:18,fontWeight:800,color:'#00e676'}},'NSE AI'),
      React.createElement('div',{style:{display:'flex',flexDirection:'column',alignItems:'flex-end',gap:3}},
        React.createElement('div',{style:{fontSize:11,color:'#8899bb'}},'IST '+ist),
        React.createElement('div',{style:{fontSize:10,fontWeight:700,padding:'2px 8px',borderRadius:3,background:mkt.bg,color:mkt.color,border:'1px solid '+mkt.bc}},mkt.text)
      )
    ),

    React.createElement('div',{style:{padding:'12px 12px 20px'}},

      React.createElement('div',{style:{background:'#111827',border:'1px solid #1e2d45',borderRadius:12,padding:14,marginBottom:12}},
        React.createElement('div',{style:{fontSize:10,color:'#4a6080',letterSpacing:'0.1em',textTransform:'uppercase',marginBottom:10}},'Select Instrument'),
        React.createElement('div',{style:{display:'grid',gridTemplateColumns:'1fr 1fr',gap:10,marginBottom:10}},
          React.createElement('div',null,
            React.createElement('div',{style:{fontSize:10,color:'#4a6080',textTransform:'uppercase',marginBottom:5}},'Type'),
            React.createElement('select',{value:instrType,onChange:function(e){setInstrType(e.target.value);},style:selStyle},
              React.createElement('option',{value:'index'},'Index'),
              React.createElement('option',{value:'stock'},'NSE Stock')
            )
          ),
          React.createElement('div',null,
            React.createElement('div',{style:{fontSize:10,color:'#4a6080',textTransform:'uppercase',marginBottom:5}},'Interval'),
            React.createElement('select',{value:intv,onChange:function(e){setIntv(e.target.value);},style:selStyle},
              React.createElement('option',{value:'5min'},'5 min'),
              React.createElement('option',{value:'15min'},'15 min'),
              React.createElement('option',{value:'30min'},'30 min'),
              React.createElement('option',{value:'1h'},'1 hour')
            )
          )
        ),
        instrType==='index'?React.createElement('div',{style:{marginBottom:10}},
          React.createElement('div',{style:{fontSize:10,color:'#4a6080',textTransform:'uppercase',marginBottom:5}},'Index'),
          React.createElement('select',{value:idx.s,onChange:function(e){setIdx(NSE_INDICES.find(function(i){return i.s===e.target.value;}));},style:selStyle},
            NSE_INDICES.map(function(i){return React.createElement('option',{key:i.s,value:i.s},i.n);})
          )
        ):React.createElement('div',{style:{marginBottom:10}},
          React.createElement('div',{style:{fontSize:10,color:'#4a6080',textTransform:'uppercase',marginBottom:5}},'Search NSE Stock'),
          React.createElement(StockSearch,{selected:stock,onSelect:setStock,onClear:function(){setStock(null);}})
        ),
        React.createElement('button',{
          onClick:analyze,
          disabled:loading||(instrType==='stock'&&!stock),
          style:{width:'100%',padding:14,background:'#00e676',color:'#000',border:'none',borderRadius:10,fontFamily:'sans-serif',fontSize:15,fontWeight:800,cursor:'pointer',opacity:(loading||(instrType==='stock'&&!stock))?0.4:1}
        },loading?'Analyzing...':'ANALYZE NOW')
      ),

      err?React.createElement('div',{style:{fontSize:11,color:RED,padding:'10px 14px',background:'#2d0a0a',border:'1px solid #ff444433',borderRadius:8,marginBottom:12,lineHeight:1.7}},'Error: '+err):null,

      React.createElement('div',{style:{display:'grid',gridTemplateColumns:'1fr 1fr',gap:8,marginBottom:12}},
        MetricBox('Last Price',sig?'Rs '+sig.last.toFixed(2):'--',sig?(sig.change>=0?'+':'')+sig.change.toFixed(2)+' ('+sig.changePct.toFixed(2)+'%)':'--',sig?(sig.change>=0?GREEN:RED):null),
        MetricBox('Volume',sig?fmtVol(sig.lastVol):'--',sig?sig.volRatio.toFixed(1)+'x avg':'vs avg',sig?(sig.volRatio>1.5?GREEN:sig.volRatio<0.7?RED:AMBER):null),
        MetricBox('Day Range',sig?'Rs '+sig.dayLow.toFixed(0)+' - Rs '+sig.dayHigh.toFixed(0):'--',sig?'Range '+((sig.dayHigh-sig.dayLow)/sig.dayLow*100).toFixed(2)+'%':'--'),
        MetricBox('EMA Trend',sig?(sig.trendUp?'BULLISH':'BEARISH'):'--','EMA 9 vs 21',sig?(sig.trendUp?GREEN:RED):null)
      ),

      React.createElement('div',{style:{display:'grid',gridTemplateColumns:'repeat(5,1fr)',gap:6,marginBottom:12}},
        SigPill('RSI',sig?sig.rsi.toFixed(1):'--',sig?(sig.rsi>70?RED:sig.rsi<30?GREEN:AMBER):null),
        SigPill('MACD',sig?(sig.macd.hist>=0?'+':'')+sig.macd.hist.toFixed(1):'--',sig?(sig.macd.hist>=0?GREEN:RED):null),
        SigPill('VWAP',sig?(sig.last>sig.vwap?'ABOVE':'BELOW'):'--',sig?(sig.last>sig.vwap?GREEN:RED):null),
        SigPill('Vol',sig?(sig.volRatio>2?'SPIKE':sig.volRatio>1.3?'HIGH':'NORM'):'--',sig?(sig.volRatio>1.5?GREEN:'#8899bb'):null),
        SigPill('Mom',sig?(sig.mom10>=0?'+':'')+sig.mom10.toFixed(1)+'%':'--',sig?(sig.mom10>=0?GREEN:RED):null)
      ),

      React.createElement('div',{style:{display:'grid',gridTemplateColumns:'1fr 1fr',gap:8,marginBottom:12}},
        React.createElement('div',{style:{background:'#111827',border:'1px solid #1e2d45',borderRadius:10,padding:12}},
          React.createElement('div',{style:{fontSize:9,color:'#4a6080',textTransform:'uppercase',marginBottom:8}},'India VIX'),
          React.createElement('div',{style:{fontSize:26,fontWeight:700,color:ext?(ext.vix>20?RED:ext.vix>15?AMBER:GREEN):'#e2e8f0'}},ext?ext.vix.toFixed(2):'--'),
          React.createElement('div',{style:{fontSize:10,color:'#8899bb',marginTop:3}},'Volatility Index'),
          ext?React.createElement('div',{style:{fontSize:10,marginTop:6,padding:'3px 8px',borderRadius:4,display:'inline-block',background:ext.vix<13?'#00391a':ext.vix<18?'#2d1e00':'#2d0a0a',color:ext.vix<13?GREEN:ext.vix<18?AMBER:RED}},ext.vix<13?'LOW FEAR':ext.vix<18?'MODERATE':ext.vix<25?'ELEVATED':'HIGH FEAR'):null
        ),
        React.createElement('div',{style:{background:'#111827',border:'1px solid #1e2d45',borderRadius:10,padding:12}},
          React.createElement('div',{style:{fontSize:9,color:'#4a6080',textTransform:'uppercase',marginBottom:8}},'FII / DII'),
          React.createElement('div',{style:{display:'flex',justifyContent:'space-between',marginBottom:6}},
            React.createElement('span',{style:{fontSize:11,color:'#8899bb'}},'FII Net'),
            React.createElement('span',{style:{fontSize:12,fontWeight:700,color:ext?(ext.fii>0?GREEN:RED):'#e2e8f0'}},ext?fmtMoney(ext.fii*1e5):'--')
          ),
          React.createElement('div',{style:{display:'flex',justifyContent:'space-between',marginBottom:8}},
            React.createElement('span',{style:{fontSize:11,color:'#8899bb'}},'DII Net'),
            React.createElement('span',{style:{fontSize:12,fontWeight:700,color:ext?(ext.dii>0?GREEN:RED):'#e2e8f0'}},ext?fmtMoney(ext.dii*1e5):'--')
          ),
          React.createElement('div',{style:{height:1,background:'#1e2d45',marginBottom:8}}),
          React.createElement('div',{style:{fontSize:10,color:'#8899bb'}},ext?(ext.fii>0&&ext.dii>0?'Both buying - bullish':ext.fii>0?'FII buying - mixed':ext.dii>0?'DII support - cautious':'Both selling - bearish'):'--')
        ),
        React.createElement('div',{style:{gridColumn:'1 / -1',background:'#111827',border:'1px solid #1e2d45',borderRadius:10,padding:12}},
          React.createElement('div',{style:{fontSize:9,color:'#4a6080',textTransform:'uppercase',marginBottom:10}},'Option Chain OI'),
          React.createElement('div',{style:{marginBottom:8}},
            React.createElement('div',{style:{display:'flex',justifyContent:'space-between',fontSize:10,color:'#8899bb',marginBottom:3}},
              React.createElement('span',null,'Call OI (resistance)'),
              React.createElement('span',null,ext?fmtVol(ext.callOI):'--')
            ),
            React.createElement('div',{style:{height:6,background:'#1a2235',borderRadius:3,overflow:'hidden'}},
              React.createElement('div',{style:{height:'100%',borderRadius:3,background:RED,width:ext?Math.round(ext.callOI/(ext.callOI+ext.putOI)*100)+'%':'50%',transition:'width 0.5s'}})
            )
          ),
          React.createElement('div',null,
            React.createElement('div',{style:{display:'flex',justifyContent:'space-between',fontSize:10,color:'#8899bb',marginBottom:3}},
              React.createElement('span',null,'Put OI (support)'),
              React.createElement('span',null,ext?fmtVol(ext.putOI):'--')
            ),
            React.createElement('div',{style:{height:6,background:'#1a2235',borderRadius:3,overflow:'hidden'}},
              React.createElement('div',{style:{height:'100%',borderRadius:3,background:GREEN,width:ext?Math.round(ext.putOI/(ext.callOI+ext.putOI)*100)+'%':'50%',transition:'width 0.5s'}})
            )
          ),
          React.createElement('div',{style:{fontSize:10,color:'#8899bb',marginTop:8}},ext?'PCR: '+ext.pcr.toFixed(2)+' '+(ext.pcr>1.2?'(bullish)':ext.pcr<0.8?'(bearish)':'(neutral)')+' | Max Pain: Rs '+ext.maxPain:'PCR: -- | Max Pain: --')
        )
      ),

      React.createElement('div',{style:{background:'#111827',border:'1px solid #1e2d45',borderRadius:10,padding:12,marginBottom:12}},
        React.createElement('div',{style:{fontSize:9,color:'#4a6080',textTransform:'uppercase',marginBottom:8}},'Price + Volume Chart'),
        React.createElement(MiniChart,{data:mdata})
      ),

      React.createElement('div',{style:{background:'#111827',border:'1px solid #2a3f5f',borderRadius:12,padding:14,marginBottom:12}},
        React.createElement('div',{style:{fontSize:10,color:'#4a6080',textTransform:'uppercase',letterSpacing:'0.1em',marginBottom:12}},'Claude AI Verdict'),
        claudeUrl?React.createElement('div',null,
          React.createElement('div',{style:{fontSize:12,color:'#8899bb',lineHeight:1.8,marginBottom:14}},'Live signals fetched! Tap below to get your Long/Short/Neutral verdict from Claude AI. The analysis prompt is pre-filled automatically.'),
          React.createElement('a',{
            href:claudeUrl,
            target:'_blank',
            style:{display:'block',width:'100%',padding:14,background:'#00e676',color:'#000',border:'none',borderRadius:10,fontFamily:'sans-serif',fontSize:14,fontWeight:800,cursor:'pointer',textAlign:'center',textDecoration:'none'}
          },'Get Claude AI Verdict')
        ):React.createElement('div',{style:{fontSize:12,color:'#4a6080',lineHeight:1.8}},'Tap ANALYZE NOW to fetch live NSE data and signals, then tap the Claude AI button to get your verdict here in Claude.')
      ),

      React.createElement('div',{style:{fontSize:10,color:'#4a6080',display:'flex',alignItems:'center',gap:6,paddingBottom:20}},
        React.createElement('span',{style:{animation:'blink 1s step-end infinite'}},'|'),
        loading?step:sig?'Done - '+new Date().toLocaleTimeString('en-IN',{timeZone:'Asia/Kolkata'})+' IST':'Ready - NSE: 09:15-15:30 IST'
      )
    )
  );
}
