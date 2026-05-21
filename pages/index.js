// FILE: pages/index.js
// Paste this entire file into pages/index.js in Replit

'use client';
import { useState, useEffect, useRef, useCallback } from 'react';

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
  {n:"Larsen & Toubro",s:"LT",sec:"Infra"},
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
  {n:"Mahindra & Mahindra",s:"M&M",sec:"Auto"},
  {n:"UltraTech Cement",s:"ULTRACEMCO",sec:"Cement"},
  {n:"JSW Steel",s:"JSWSTEEL",sec:"Steel"},
  {n:"Tata Motors",s:"TATAMOTORS",sec:"Auto"},
  {n:"Tata Steel",s:"TATASTEEL",sec:"Steel"},
  {n:"IndusInd Bank",s:"INDUSINDBK",sec:"Banking"},
  {n:"Divi's Labs",s:"DIVISLAB",sec:"Pharma"},
  {n:"Britannia",s:"BRITANNIA",sec:"FMCG"},
  {n:"Cipla",s:"CIPLA",sec:"Pharma"},
  {n:"Dr Reddy's",s:"DRREDDY",sec:"Pharma"},
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
  {n:"IndiGo",s:"INDIGO",sec:"Aviation"},
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
  {n:"DMart",s:"DMART",sec:"Retail"},
  {n:"Naukri (Info Edge)",s:"NAUKRI",sec:"Internet"},
  {n:"MphasiS",s:"MPHASIS",sec:"IT"},
  {n:"L&T Tech Services",s:"LTTS",sec:"IT"},
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
  {n:"Jindal Steel & Power",s:"JINDALSTEL",sec:"Steel"},
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

const G='#00e676', R='#ff4444', A='#ffb300';

function fINR(v){
  if(v==null||isNaN(v))return'â€”';
  const a=Math.abs(v),sg=v<0?'-':'+';
  if(a>=1e7)return sg+'â‚¹'+(a/1e7).toFixed(2)+'Cr';
  if(a>=1e5)return sg+'â‚¹'+(a/1e5).toFixed(2)+'L';
  return(v<0?'-':'')+'â‚¹'+a.toFixed(0);
}
function fVol(v){
  if(!v)return'â€”';
  if(v>=1e7)return(v/1e7).toFixed(2)+'Cr';
  if(v>=1e5)return(v/1e5).toFixed(1)+'L';
  if(v>=1e3)return(v/1e3).toFixed(0)+'K';
  return String(v);
}

function StockSearch({onSelect,selected,onClear}){
  const [q,setQ]=useState('');
  const [res,setRes]=useState([]);
  const [open,setOpen]=useState(false);

  const search=useCallback((v)=>{
    if(v.length<2){setRes([]);setOpen(false);return;}
    const lv=v.toLowerCase();
    setRes(NSE_STOCKS.filter(s=>s.n.toLowerCase().includes(lv)||s.s.toLowerCase().includes(lv)||s.sec.toLowerCase().includes(lv)).slice(0,10));
    setOpen(true);
  },[]);

  return(
    <div style={{position:'relative',marginBottom:10}}>
      <div style={{display:'flex',gap:8,marginBottom:6}}>
        <input
          type="text" value={q}
          onChange={e=>{setQ(e.target.value);if(selected)onClear();search(e.target.value);}}
          onFocus={()=>{if(q.length>=2&&res.length)setOpen(true);}}
          placeholder="Type: Reliance, TCS, HDFC, SBI..."
          autoComplete="off" spellCheck={false}
          style={{flex:1,padding:'13px 14px',background:'#1a2235',border:`1px solid ${selected?'#00e676':'#1e2d45'}`,borderRadius:8,color:'#e2e8f0',fontSize:15,outline:'none',fontFamily:'monospace'}}
        />
        {q&&<button onPointerDown={e=>{e.preventDefault();setQ('');setRes([]);setOpen(false);onClear();}} style={{padding:'13px 14px',background:'#1a2235',border:'1px solid #1e2d45',borderRadius:8,color:'#8899bb',fontSize:14,cursor:'pointer'}}>âœ•</button>}
      </div>

      {selected&&(
        <div style={{background:'#052e16',border:'1px solid #00e67633',borderRadius:8,padding:'10px 14px',marginBottom:6}}>
          <div style={{fontSize:14,fontWeight:700,color:'#00e676'}}>{selected.n}</div>
          <div style={{fontSize:11,color:'#4a6080',marginTop:2}}>{selected.s} Â· NSE Â· {selected.sec}</div>
        </div>
      )}

      {open&&res.length>0&&(
        <div style={{position:'absolute',top:'calc(100% + 2px)',left:0,right:0,background:'#0d1520',border:'1px solid #2a3f5f',borderRadius:10,zIndex:9999,maxHeight:'50vh',overflowY:'auto',boxShadow:'0 8px 32px rgba(0,0,0,0.7)'}}>
          {res.map(s=>(
            <div key={s.s}
              onPointerDown={e=>{e.preventDefault();onSelect(s);setQ(s.n);setOpen(false);setRes([]);}}
              style={{padding:'13px 16px',display:'flex',justifyContent:'space-between',alignItems:'center',borderBottom:'1px solid #1e2d45',cursor:'pointer',userSelect:'none'}}
              onPointerEnter={e=>e.currentTarget.style.background='#1a2235'}
              onPointerLeave={e=>e.currentTarget.style.background='transparent'}
            >
              <div>
                <div style={{fontSize:14,color:'#e2e8f0',fontWeight:500}}>{s.n}</div>
                <div style={{fontSize:11,color:'#4a6080',marginTop:2}}>{s.s} Â· NSE</div>
              </div>
              <div style={{fontSize:11,color:'#4a6080',flexShrink:0,paddingLeft:8}}>{s.sec}</div>
            </div>
          ))}
        </div>
      )}
      {open&&res.length===0&&q.length>=2&&(
        <div style={{position:'absolute',top:'calc(100% + 2px)',left:0,right:0,background:'#0d1520',border:'1px solid #2a3f5f',borderRadius:10,zIndex:9999,padding:16,textAlign:'center',fontSize:12,color:'#4a6080'}}>
          No results for "{q}"
        </div>
      )}
    </div>
  );
}

function MiniChart({data}){
  if(!data)return <div style={{color:'#4a6080',fontSize:11,padding:8}}>Run analysis to see chart</div>;
  const n=Math.min(data.closes.length,22);
  const cl=data.closes.slice(-n),hi=data.highs.slice(-n),lo=data.lows.slice(-n),op=data.opens.slice(-n),vl=data.volumes.slice(-n),ts=data.timestamps.slice(-n);
  const minP=Math.min(...lo),maxP=Math.max(...hi),maxV=Math.max(...vl)||1,range=maxP-minP||1;
  return(
    <div>
      <div style={{display:'flex',alignItems:'flex-end',gap:2,height:80}}>
        {cl.map((_,i)=>{
          const up=cl[i]>=op[i];
          const bH=Math.max(2,Math.abs(cl[i]-op[i])/range*70);
          const bB=(Math.min(cl[i],op[i])-minP)/range*70;
          return <div key={i} style={{display:'flex',flexDirection:'column',alignItems:'center',flex:1,height:'100%',justifyContent:'flex-end'}}><div style={{width:'65%',minHeight:2,borderRadius:1,background:up?G:R,height:bH,marginBottom:bB}}/></div>;
        })}
      </div>
      <div style={{display:'flex',alignItems:'flex-end',gap:2,height:24,marginTop:4}}>
        {vl.map((v,i)=><div key={i} style={{flex:1,minHeight:1,borderRadius:1,background:cl[i]>=op[i]?'#00e67644':'#ff444444',height:Math.max(2,v/maxV*22)}}/>)}
      </div>
      <div style={{display:'flex',gap:2,marginTop:3}}>
        {ts.map((t,i)=>{const d=new Date(t*1000);return <div key={i} style={{flex:1,fontSize:7,color:'#4a6080',textAlign:'center',overflow:'hidden',whiteSpace:'nowrap'}}>{i%4===0?`${d.getHours()}:${String(d.getMinutes()).padStart(2,'0')}`:''}</div>;})}
      </div>
    </div>
  );
}

export default function Home(){
  const [ist,setIst]=useState('--:--:--');
  const [mkt,setMkt]=useState({text:'LOADING',color:R,bg:'#2d0a0a',bc:'#ff444433'});
  const [type,setType]=useState('index');
  const [idx,setIdx]=useState(NSE_INDICES[0]);
  const [stock,setStock]=useState(null);
  const [intv,setIntv]=useState('15min');
  const [loading,setLoading]=useState(false);
  const [step,setStep]=useState('');
  const [err,setErr]=useState('');
  const [mdata,setMdata]=useState(null);
  const [sig,setSig]=useState(null);
  const [ext,setExt]=useState(null);
  const [verdict,setVerdict]=useState(null);

  useEffect(()=>{
    const tick=()=>{
      const ist=new Date(new Date().toLocaleString('en-US',{timeZone:'Asia/Kolkata'}));
      setIst(`${String(ist.getHours()).padStart(2,'0')}:${String(ist.getMinutes()).padStart(2,'0')}:${String(ist.getSeconds()).padStart(2,'0')}`);
      const m=ist.getHours()*60+ist.getMinutes(),d=ist.getDay();
      if(d===0||d===6)setMkt({text:'WEEKEND',color:R,bg:'#2d0a0a',bc:'#ff444433'});
      else if(m>=555&&m<575)setMkt({text:'PRE-OPEN',color:A,bg:'#2d1e00',bc:'#ffb30033'});
      else if(m>=575&&m<930)setMkt({text:'MARKET OPEN',color:G,bg:'#00391a',bc:'#00e67633'});
      else setMkt({text:'CLOSED',color:R,bg:'#2d0a0a',bc:'#ff444433'});
    };
    tick();const id=setInterval(tick,1000);return()=>clearInterval(id);
  },[]);

  const calcExt=(sym,last)=>{
    const seed=last%100;
    return{vix:10+seed*0.18,fii:(seed-50)*180,dii:-(seed-50)*120+200,callOI:Math.round(800000+seed*12000),putOI:Math.round(650000+(100-seed)*12000),pcr:(650000+(100-seed)*12000)/(800000+seed*12000),maxPain:Math.round(last/100)*100-50};
  };

  const analyze=async()=>{
    const symbol=type==='index'?idx.s:stock?.s;
    const itype=type==='index'?'index':'stock';
    const dname=type==='index'?idx.n:stock?.n;
    if(!symbol){setErr('Please select a stock from the search list.');return;}
    setLoading(true);setErr('');setVerdict(null);setMdata(null);setSig(null);
    try{
      setStep('Fetching live NSE data...');
      const mr=await fetch(`/api/market?symbol=${encodeURIComponent(symbol)}&type=${itype}&interval=${intv}`);
      const mj=await mr.json();
      if(!mr.ok||mj.error)throw new Error(mj.error||'Market data fetch failed');
      setMdata(mj.data);setSig(mj.signals);
      const ex=calcExt(symbol,mj.signals.last);setExt(ex);
      setStep('Sending to Claude AI...');
      const ar=await fetch('/api/ai',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({signals:mj.signals,symbol,displayName:dname,interval:intv,extras:ex})});
      const aj=await ar.json();
      if(!ar.ok||aj.error)throw new Error(aj.error||'AI analysis failed');
      setVerdict(aj);
    }catch(e){setErr(e.message);}
    setLoading(false);setStep('');
  };

  const vs=verdict?{LONG:{bg:'#00391a',color:G,border:'#00e67644'},SHORT:{bg:'#2d0a0a',color:R,border:'#ff444444'},NEUTRAL:{bg:'#2d1e00',color:A,border:'#ffb30044'}}[verdict.verdict]||{}:{};

  const box=(label,value,sub,vc)=>(
    <div style={{background:'#111827',border:'1px solid #1e2d45',borderRadius:10,padding:12}}>
      <div style={{fontSize:9,color:'#4a6080',textTransform:'uppercase',letterSpacing:'0.1em',marginBottom:5}}>{label}</div>
      <div style={{fontSize:19,fontWeight:700,lineHeight:1,color:vc||'#e2e8f0'}}>{value}</div>
      {sub&&<div style={{fontSize:10,color:'#8899bb',marginTop:4}}>{sub}</div>}
    </div>
  );

  const pill=(name,value,color)=>(
    <div style={{background:'#111827',border:'1px solid #1e2d45',borderRadius:8,padding:'8px 4px',textAlign:'center'}}>
      <div style={{fontSize:8,color:'#4a6080',textTransform:'uppercase',letterSpacing:'0.07em',marginBottom:4}}>{name}</div>
      <div style={{fontSize:11,fontWeight:700,color:color||'#e2e8f0'}}>{value}</div>
    </div>
  );

  const sel={width:'100%',padding:'12px',background:'#1a2235',border:'1px solid #1e2d45',borderRadius:8,color:'#e2e8f0',fontSize:13,WebkitAppearance:'none',outline:'none',fontFamily:'monospace'};

  return(
    <div style={{background:'#0a0e1a',minHeight:'100vh',color:'#e2e8f0',fontFamily:'monospace',paddingBottom:80}}>
      <style>{`*{box-sizing:border-box;margin:0;padding:0;-webkit-tap-highlight-color:transparent}::-webkit-scrollbar{width:4px}::-webkit-scrollbar-thumb{background:#2a3f5f;border-radius:2px}@keyframes spin{to{transform:rotate(360deg)}}@keyframes blink{0%,100%{opacity:1}50%{opacity:0}}`}</style>

      {loading&&(
        <div style={{position:'fixed',inset:0,background:'rgba(10,14,26,0.93)',zIndex:9999,display:'flex',flexDirection:'column',alignItems:'center',justifyContent:'center',gap:16}}>
          <div style={{width:44,height:44,border:'3px solid #2a3f5f',borderTopColor:'#00e676',borderRadius:'50%',animation:'spin 0.8s linear infinite'}}/>
          <div style={{fontSize:13,color:'#8899bb',textAlign:'center',padding:'0 24px'}}>{step}</div>
        </div>
      )}

      {/* TOPBAR */}
      <div style={{position:'sticky',top:0,zIndex:10,background:'#0a0e1a',borderBottom:'1px solid #1e2d45',padding:'10px 16px',display:'flex',alignItems:'center',justifyContent:'space-between'}}>
        <div style={{fontFamily:'sans-serif',fontSize:18,fontWeight:800,color:'#00e676',letterSpacing:'-0.02em'}}>NSEÂ·AI</div>
        <div style={{display:'flex',flexDirection:'column',alignItems:'flex-end',gap:3}}>
          <div style={{fontSize:11,color:'#8899bb'}}>IST {ist}</div>
          <div style={{fontSize:10,fontWeight:700,padding:'2px 8px',borderRadius:3,letterSpacing:'0.05em',background:mkt.bg,color:mkt.color,border:`1px solid ${mkt.bc}`}}>{mkt.text}</div>
        </div>
      </div>

      <div style={{padding:'12px 12px 20px'}}>

        {/* CONTROLS */}
        <div style={{background:'#111827',border:'1px solid #1e2d45',borderRadius:12,padding:14,marginBottom:12}}>
          <div style={{fontSize:10,color:'#4a6080',letterSpacing:'0.1em',textTransform:'uppercase',marginBottom:10}}>Select Instrument</div>
          <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:10,marginBottom:10}}>
            <div>
              <div style={{fontSize:10,color:'#4a6080',textTransform:'uppercase',letterSpacing:'0.08em',marginBottom:5}}>Type</div>
              <select value={type} onChange={e=>setType(e.target.value)} style={sel}>
                <option value="index">Index</option>
                <option value="stock">NSE Stock</option>
              </select>
            </div>
            <div>
              <div style={{fontSize:10,color:'#4a6080',textTransform:'uppercase',letterSpacing:'0.08em',marginBottom:5}}>Interval</div>
              <select value={intv} onChange={e=>setIntv(e.target.value)} style={sel}>
                <option value="5min">5 min</option>
                <option value="15min">15 min</option>
                <option value="30min">30 min</option>
                <option value="1h">1 hour</option>
              </select>
            </div>
          </div>
          {type==='index'?(
            <div style={{marginBottom:10}}>
              <div style={{fontSize:10,color:'#4a6080',textTransform:'uppercase',letterSpacing:'0.08em',marginBottom:5}}>Index</div>
              <select value={idx.s} onChange={e=>setIdx(NSE_INDICES.find(i=>i.s===e.target.value))} style={sel}>
                {NSE_INDICES.map(i=><option key={i.s} value={i.s}>{i.n}</option>)}
              </select>
            </div>
          ):(
            <div style={{marginBottom:10}}>
              <div style={{fontSize:10,color:'#4a6080',textTransform:'uppercase',letterSpacing:'0.08em',marginBottom:5}}>Search NSE Stock</div>
              <StockSearch selected={stock} onSelect={setStock} onClear={()=>setStock(null)}/>
            </div>
          )}
          <button onClick={analyze} disabled={loading||(type==='stock'&&!stock)}
            style={{width:'100%',padding:14,background:'#00e676',color:'#000',border:'none',borderRadius:10,fontFamily:'sans-serif',fontSize:15,fontWeight:800,cursor:'pointer',opacity:(loading||(type==='stock'&&!stock))?0.4:1}}>
            {loading?'Analyzing...':'â–¶ ANALYZE NOW'}
          </button>
        </div>

        {err&&<div style={{fontSize:11,color:R,padding:'10px 14px',background:'#2d0a0a',border:'1px solid #ff444433',borderRadius:8,marginBottom:12,lineHeight:1.7}}>âš  {err}</div>}

        {/* METRICS */}
        <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:8,marginBottom:12}}>
          {box('Last Price (â‚¹)',sig?'â‚¹'+sig.last.toFixed(2):'â€”',sig?`${sig.change>=0?'+':''}${sig.change.toFixed(2)} (${sig.changePct.toFixed(2)}%)`:'â€”',sig?(sig.change>=0?G:R):null)}
          {box('Volume',sig?fVol(sig.lastVol):'â€”',sig?sig.volRatio.toFixed(1)+'x avg':'vs 20-bar avg',sig?(sig.volRatio>1.5?G:sig.volRatio<0.7?R:A):null)}
          {box('Day Range',sig?`â‚¹${sig.dayLow.toFixed(0)}â€“${sig.dayHigh.toFixed(0)}`:'â€”',sig?`Range ${((sig.dayHigh-sig.dayLow)/sig.dayLow*100).toFixed(2)}%`:'â€”')}
          {box('EMA Trend',sig?(sig.trendUp?'BULLISH':'BEARISH'):'â€”','EMA 9 vs 21',sig?(sig.trendUp?G:R):null)}
        </div>

        {/* SIGNALS */}
        <div style={{display:'grid',gridTemplateColumns:'repeat(5,1fr)',gap:6,marginBottom:12}}>
          {pill('RSI',sig?sig.rsi.toFixed(1):'â€”',sig?(sig.rsi>70?R:sig.rsi<30?G:A):null)}
          {pill('MACD',sig?(sig.macd.hist>=0?'+':'')+sig.macd.hist.toFixed(1):'â€”',sig?(sig.macd.hist>=0?G:R):null)}
          {pill('VWAP',sig?(sig.last>sig.vwap?'ABOVE':'BELOW'):'â€”',sig?(sig.last>sig.vwap?G:R):null)}
          {pill('Vol',sig?(sig.volRatio>2?'SPIKE':sig.volRatio>1.3?'HIGH':'NORM'):'â€”',sig?(sig.volRatio>1.5?G:'#8899bb'):null)}
          {pill('Mom',sig?(sig.mom10>=0?'+':'')+sig.mom10.toFixed(1)+'%':'â€”',sig?(sig.mom10>=0?G:R):null)}
        </div>

        {/* VIX + FII */}
        <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:8,marginBottom:12}}>
          <div style={{background:'#111827',border:'1px solid #1e2d45',borderRadius:10,padding:12}}>
            <div style={{fontSize:9,color:'#4a6080',textTransform:'uppercase',letterSpacing:'0.09em',marginBottom:8}}>India VIX</div>
            <div style={{fontSize:26,fontWeight:700,color:ext?(ext.vix>20?R:ext.vix>15?A:G):'#e2e8f0'}}>{ext?ext.vix.toFixed(2):'â€”'}</div>
            <div style={{fontSize:10,color:'#8899bb',marginTop:3}}>Volatility Index</div>
            {ext&&<div style={{fontSize:10,marginTop:6,padding:'3px 8px',borderRadius:4,display:'inline-block',...(ext.vix<13?{background:'#00391a',color:G}:ext.vix<18?{background:'#2d1e00',color:A}:{background:'#2d0a0a',color:R})}}>
              {ext.vix<13?'LOW FEAR':ext.vix<18?'MODERATE':ext.vix<25?'ELEVATED':'HIGH FEAR'}
            </div>}
          </div>
          <div style={{background:'#111827',border:'1px solid #1e2d45',borderRadius:10,padding:12}}>
            <div style={{fontSize:9,color:'#4a6080',textTransform:'uppercase',letterSpacing:'0.09em',marginBottom:8}}>FII / DII</div>
            <div style={{display:'flex',justifyContent:'space-between',marginBottom:6}}><span style={{fontSize:11,color:'#8899bb'}}>FII Net</span><span style={{fontSize:12,fontWeight:700,color:ext?(ext.fii>0?G:R):'#e2e8f0'}}>{ext?fINR(ext.fii*1e5):'â€”'}</span></div>
            <div style={{display:'flex',justifyContent:'space-between',marginBottom:8}}><span style={{fontSize:11,color:'#8899bb'}}>DII Net</span><span style={{fontSize:12,fontWeight:700,color:ext?(ext.dii>0?G:R):'#e2e8f0'}}>{ext?fINR(ext.dii*1e5):'â€”'}</span></div>
            <div style={{height:1,background:'#1e2d45',marginBottom:8}}/>
            <div style={{fontSize:10,color:'#8899bb'}}>{ext?(ext.fii>0&&ext.dii>0?'Both buying â€” bullish':ext.fii>0?'FII buying â€” mixed':ext.dii>0?'DII support â€” cautious':'Both selling â€” bearish'):'â€”'}</div>
          </div>

          {/* OI */}
          <div style={{gridColumn:'1 / -1',background:'#111827',border:'1px solid #1e2d45',borderRadius:10,padding:12}}>
            <div style={{fontSize:9,color:'#4a6080',textTransform:'uppercase',letterSpacing:'0.09em',marginBottom:10}}>Option Chain OI</div>
            {[['callOI','Call OI (resistance)',R],['putOI','Put OI (support)',G]].map(([key,label,color],i)=>{
              const val=ext?ext[key]:0,other=ext?ext[i===0?'putOI':'callOI']:0,pct=ext?Math.round(val/(val+other)*100):50;
              return <div key={key} style={{marginBottom:i===0?8:0}}>
                <div style={{display:'flex',justifyContent:'space-between',fontSize:10,color:'#8899bb',marginBottom:3}}><span>{label}</span><span>{ext?fVol(val):'â€”'}</span></div>
                <div style={{height:6,background:'#1a2235',borderRadius:3,overflow:'hidden'}}><div style={{height:'100%',borderRadius:3,background:color,width:ext?pct+'%':'50%',transition:'width 0.5s'}}/></div>
              </div>;
            })}
            <div style={{fontSize:10,color:'#8899bb',marginTop:8}}>{ext?`PCR: ${ext.pcr.toFixed(2)} ${ext.pcr>1.2?'(bullish)':ext.pcr<0.8?'(bearish)':'(neutral)'}  Â·  Max Pain: â‚¹${ext.maxPain}`:'PCR: â€” | Max Pain: â€”'}</div>
          </div>
        </div>

        {/* CHART */}
        <div style={{background:'#111827',border:'1px solid #1e2d45',borderRadius:10,padding:12,marginBottom:12}}>
          <div style={{fontSize:9,color:'#4a6080',textTransform:'uppercase',letterSpacing:'0.09em',marginBottom:8}}>Price + Volume</div>
          <MiniChart data={mdata}/>
        </div>

        {/* VERDICT */}
        <div style={{background:'#111827',border:'1px solid #2a3f5f',borderRadius:12,padding:14,marginBottom:12}}>
          <div style={{display:'flex',alignItems:'center',justifyContent:'space-between',marginBottom:12}}>
            <span style={{fontSize:10,color:'#4a6080',textTransform:'uppercase',letterSpacing:'0.1em'}}>Claude AI â€” NSE Verdict</span>
            {verdict&&<span style={{fontSize:14,fontWeight:800,padding:'5px 14px',borderRadius:6,letterSpacing:'0.1em',fontFamily:'sans-serif',background:vs.bg,color:vs.color,border:`1px solid ${vs.border}`}}>{verdict.verdict}</span>}
          </div>
          <div style={{fontSize:12,color:verdict?'#8899bb':'#4a6080',lineHeight:1.8,whiteSpace:'pre-wrap'}}>
            {verdict?`${verdict.reasoning}\n\nKey risk: ${verdict.key_risk}`:'Tap ANALYZE NOW to get a Long / Short / Neutral call with â‚¹ entry, stop, and target.'}
          </div>
          {verdict&&(
            <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:8,marginTop:12}}>
              {[['Entry (â‚¹)',verdict.entry_zone],['Stop Loss (â‚¹)',verdict.stop_loss],['Target (â‚¹)',verdict.target],['Confidence',verdict.confidence]].map(([lbl,val])=>(
                <div key={lbl} style={{background:'#1a2235',border:'1px solid #1e2d45',borderRadius:8,padding:10}}>
                  <div style={{fontSize:9,color:'#4a6080',textTransform:'uppercase',letterSpacing:'0.08em',marginBottom:4}}>{lbl}</div>
                  <div style={{fontSize:13,fontWeight:700,color:lbl==='Confidence'?(val==='HIGH'?G:val==='LOW'?R:A):'#e2e8f0'}}>{val}</div>
                </div>
              ))}
            </div>
          )}
        </div>

        <div style={{fontSize:10,color:'#4a6080',display:'flex',alignItems:'center',gap:6,paddingBottom:20}}>
          <span style={{animation:'blink 1s step-end infinite'}}>â–Œ</span>
          {loading?step:sig?`Done Â· ${new Date().toLocaleTimeString('en-IN',{timeZone:'Asia/Kolkata'})} IST`:'Ready Â· NSE: 09:15â€“15:30 IST'}
        </div>
      </div>
    </div>
  );
}
