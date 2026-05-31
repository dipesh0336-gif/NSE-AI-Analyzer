'use client'; // v2.1
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
  {n:"Divi Labs",s:"DIVISLAB",sec:"Pharma"},
  {n:"Britannia",s:"BRITANNIA",sec:"FMCG"},
  {n:"Cipla",s:"CIPLA",sec:"Pharma"},
  {n:"Dr Reddys",s:"DRREDDY",sec:"Pharma"},
  {n:"Eicher Motors",s:"EICHERMOT",sec:"Auto"},
  {n:"Hero MotoCorp",s:"HEROMOTOCO",sec:"Auto"},
  {n:"ONGC",s:"ONGC",sec:"Energy"},
  {n:"Coal India",s:"COALINDIA",sec:"Mining"},
  {n:"Adani Enterprises",s:"ADANIENT",sec:"Diversified"},
  {n:"Hindalco",s:"HINDALCO",sec:"Metals"},
  {n:"SBI Life Insurance",s:"SBILIFE",sec:"Insurance"},
  {n:"HDFC Life Insurance",s:"HDFCLIFE",sec:"Insurance"},
  {n:"Bajaj Finserv",s:"BAJAJFINSV",sec:"Finance"},
  {n:"Tata Consumer",s:"TATACONSUM",sec:"FMCG"},
  {n:"Apollo Hospitals",s:"APOLLOHOSP",sec:"Healthcare"},
  {n:"Havells India",s:"HAVELLS",sec:"Electricals"},
  {n:"BPCL",s:"BPCL",sec:"Energy"},
  {n:"Nestle India",s:"NESTLEIND",sec:"FMCG"},
  {n:"Grasim Industries",s:"GRASIM",sec:"Diversified"},
  {n:"Shriram Finance",s:"SHRIRAMFIN",sec:"NBFC"},
  {n:"Pidilite Industries",s:"PIDILITIND",sec:"Chemicals"},
  {n:"Dabur India",s:"DABUR",sec:"FMCG"},
  {n:"Marico",s:"MARICO",sec:"FMCG"},
  {n:"Muthoot Finance",s:"MUTHOOTFIN",sec:"NBFC"},
  {n:"Shree Cement",s:"SHREECEM",sec:"Cement"},
  {n:"Ambuja Cements",s:"AMBUJACEM",sec:"Cement"},
  {n:"IndiGo Airlines",s:"INDIGO",sec:"Aviation"},
  {n:"BEL",s:"BEL",sec:"Defence"},
  {n:"HAL",s:"HAL",sec:"Defence"},
  {n:"Tata Power",s:"TATAPOWER",sec:"Power"},
  {n:"Lupin",s:"LUPIN",sec:"Pharma"},
  {n:"Aurobindo Pharma",s:"AUROPHARMA",sec:"Pharma"},
  {n:"Zomato",s:"ZOMATO",sec:"Internet"},
  {n:"LIC of India",s:"LICI",sec:"Insurance"},
  {n:"Indian Oil",s:"IOC",sec:"Energy"},
  {n:"HPCL",s:"HPCL",sec:"Energy"},
  {n:"GAIL",s:"GAIL",sec:"Gas"},
  {n:"IRCTC",s:"IRCTC",sec:"Travel"},
  {n:"Dixon Technologies",s:"DIXON",sec:"Electronics"},
  {n:"DMart",s:"DMART",sec:"Retail"},
  {n:"Naukri Info Edge",s:"NAUKRI",sec:"Internet"},
  {n:"Persistent Systems",s:"PERSISTENT",sec:"IT"},
  {n:"Coforge",s:"COFORGE",sec:"IT"},
  {n:"Canara Bank",s:"CANBK",sec:"Banking"},
  {n:"Bank of Baroda",s:"BANKBARODA",sec:"Banking"},
  {n:"PNB",s:"PNB",sec:"Banking"},
  {n:"Federal Bank",s:"FEDERALBNK",sec:"Banking"},
  {n:"IDFC First Bank",s:"IDFCFIRSTB",sec:"Banking"},
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
  {n:"Balkrishna Industries",s:"BALKRISIND",sec:"Tyres"},
  {n:"Voltas",s:"VOLTAS",sec:"Electricals"},
  {n:"Tata Elxsi",s:"TATAELXSI",sec:"IT"},
  {n:"KPIT Technologies",s:"KPITTECH",sec:"IT"},
  {n:"TVS Motor",s:"TVSMOTOR",sec:"Auto"},
  {n:"Escorts Kubota",s:"ESCORTS",sec:"Auto"},
  {n:"CONCOR",s:"CONCOR",sec:"Logistics"},
  {n:"Astral",s:"ASTRAL",sec:"Pipes"},
  {n:"APL Apollo Tubes",s:"APLAPOLLO",sec:"Steel"},
  {n:"KEI Industries",s:"KEI",sec:"Cables"},
  {n:"CDSL",s:"CDSL",sec:"Finance"},
  {n:"MCX",s:"MCX",sec:"Finance"},
  {n:"Indraprastha Gas",s:"IGL",sec:"Gas"},
  {n:"Mahanagar Gas",s:"MGL",sec:"Gas"},
  {n:"Petronet LNG",s:"PETRONET",sec:"Gas"},
  {n:"NHPC",s:"NHPC",sec:"Power"},
  {n:"Adani Green Energy",s:"ADANIGREEN",sec:"Renewables"},
  {n:"Bata India",s:"BATAINDIA",sec:"Retail"},
  {n:"Colgate Palmolive",s:"COLPAL",sec:"FMCG"},
  {n:"Jubilant FoodWorks",s:"JUBLFOOD",sec:"QSR"},
  {n:"Tata Chemicals",s:"TATACHEM",sec:"Chemicals"},
  {n:"Alkem Laboratories",s:"ALKEM",sec:"Pharma"},
  {n:"Biocon",s:"BIOCON",sec:"Pharma"},
  {n:"Yes Bank",s:"YESBANK",sec:"Banking"},
  {n:"HUDCO",s:"HUDCO",sec:"Finance"},
  {n:"Torrent Power",s:"TORNTPOWER",sec:"Power"},
  {n:"Torrent Pharma",s:"TORNTPHARM",sec:"Pharma"},
  {n:"Mphasis",s:"MPHASIS",sec:"IT"},
  {n:"LTIMindtree",s:"LTIM",sec:"IT"},
  {n:"Oracle Financial",s:"OFSS",sec:"IT"},
  {n:"Cyient",s:"CYIENT",sec:"IT"},
  {n:"Navin Fluorine",s:"NAVINFLUOR",sec:"Chemicals"},
  {n:"Aarti Industries",s:"AARTIIND",sec:"Chemicals"},
  {n:"Vinati Organics",s:"VINATIORGA",sec:"Chemicals"},
  {n:"Fine Organic Industries",s:"FINEORG",sec:"Chemicals"},
  {n:"Godrej Consumer",s:"GODREJCP",sec:"FMCG"},
  {n:"Emami",s:"EMAMILTD",sec:"FMCG"},
  {n:"Jyothy Labs",s:"JYOTHYLAB",sec:"FMCG"},
  {n:"Radico Khaitan",s:"RADICO",sec:"Beverages"},
  {n:"United Breweries",s:"UBL",sec:"Beverages"},
  {n:"Kansai Nerolac",s:"KANSAINER",sec:"Paints"},
  {n:"Berger Paints",s:"BERGEPAINT",sec:"Paints"},
  {n:"Kajaria Ceramics",s:"KAJARIACER",sec:"Building Materials"},
  {n:"Supreme Industries",s:"SUPREMEIND",sec:"Plastics"},
  {n:"Finolex Cables",s:"FINCABLES",sec:"Cables"},
  {n:"KEC International",s:"KEC",sec:"Power Equipment"},
  {n:"Thermax",s:"THERMAX",sec:"Engineering"},
  {n:"Data Patterns",s:"DATAPATTNS",sec:"Defence"},
  {n:"Paras Defence",s:"PARASDEF",sec:"Defence"},
  {n:"Amber Enterprises",s:"AMBER",sec:"Electronics"},
  {n:"Kaynes Technology",s:"KAYNES",sec:"Electronics"},
  {n:"Waaree Energies",s:"WAAREEENER",sec:"Renewables"},
  {n:"Inox Wind",s:"INOXWIND",sec:"Renewables"},
  {n:"Tata Communications",s:"TATACOMM",sec:"Telecom"},
  {n:"CESC",s:"CESC",sec:"Power"},
  {n:"Gujarat Gas",s:"GUJGASLTD",sec:"Gas"},
  {n:"Castrol India",s:"CASTROLIND",sec:"Energy"},
  {n:"Oil India",s:"OIL",sec:"Energy"},
  {n:"Max Financial",s:"MFSL",sec:"Insurance"},
  {n:"ICICI Lombard",s:"ICICIGI",sec:"Insurance"},
  {n:"Star Health Insurance",s:"STARHEALTH",sec:"Insurance"},
  {n:"SBI Cards",s:"SBICARD",sec:"Finance"},
  {n:"Bandhan Bank",s:"BANDHANBNK",sec:"Banking"},
  {n:"AU Small Finance",s:"AUBANK",sec:"Banking"},
  {n:"RBL Bank",s:"RBLBANK",sec:"Banking"},
  {n:"City Union Bank",s:"CUB",sec:"Banking"},
  {n:"Karur Vysya Bank",s:"KARURVYSYA",sec:"Banking"},
  {n:"LTI Finance",s:"LTF",sec:"NBFC"},
  {n:"Piramal Finance",s:"PIRAMALFIN",sec:"Finance"},
  {n:"IIFL Finance",s:"IIFL",sec:"Finance"},
  {n:"Five Star Business",s:"FIVESTAR",sec:"Finance"},
  {n:"Home First Finance",s:"HOMEFIRST",sec:"Finance"},
  {n:"Can Fin Homes",s:"CANFINHOME",sec:"Finance"},
  {n:"LIC Housing Finance",s:"LICHSGFIN",sec:"Finance"},
  {n:"PNB Housing Finance",s:"PNBHOUSING",sec:"Finance"},
  {n:"HDFC AMC",s:"HDFCAMC",sec:"Finance"},
  {n:"Angel One",s:"ANGELONE",sec:"Finance"},
  {n:"Motilal Oswal Financial",s:"MOTILALOFS",sec:"Finance"},
  {n:"ICICI Securities",s:"ISEC",sec:"Finance"},
  {n:"Max Healthcare",s:"MAXHEALTH",sec:"Healthcare"},
  {n:"Fortis Healthcare",s:"FORTIS",sec:"Healthcare"},
  {n:"Narayana Hrudayalaya",s:"NH",sec:"Healthcare"},
  {n:"Global Health Medanta",s:"MEDANTA",sec:"Healthcare"},
  {n:"Metropolis Healthcare",s:"METROPOLIS",sec:"Healthcare"},
  {n:"Dr Lal PathLabs",s:"LALPATHLAB",sec:"Healthcare"},
  {n:"Syngene International",s:"SYNGENE",sec:"Pharma"},
  {n:"Ipca Laboratories",s:"IPCALAB",sec:"Pharma"},
  {n:"Ajanta Pharma",s:"AJANTPHARM",sec:"Pharma"},
  {n:"JB Chemicals",s:"JBCHEPHARM",sec:"Pharma"},
  {n:"Glenmark Pharma",s:"GLENMARK",sec:"Pharma"},
  {n:"Natco Pharma",s:"NATCOPHARM",sec:"Pharma"},
  {n:"Granules India",s:"GRANULES",sec:"Pharma"},
  {n:"Gland Pharma",s:"GLAND",sec:"Pharma"},
  {n:"Ratnamani Metals",s:"RATNAMANI",sec:"Steel"},
  {n:"Welspun Corp",s:"WELCORP",sec:"Steel"},
  {n:"Jindal Saw",s:"JINDALSAW",sec:"Steel"},
  {n:"PSP Projects",s:"PSPPROJECT",sec:"Infra"},
  {n:"G R Infraprojects",s:"GRINFRA",sec:"Infra"},
  {n:"HG Infra Engineering",s:"HGINFRA",sec:"Infra"},
  {n:"PNC Infratech",s:"PNCINFRA",sec:"Infra"},
  {n:"NCC",s:"NCC",sec:"Infra"},
  {n:"Kalpataru Projects",s:"KPIL",sec:"Infra"},
  {n:"Ashoka Buildcon",s:"ASHOKA",sec:"Infra"},
  {n:"Motherson Sumi",s:"MOTHERSUMI",sec:"Auto Ancillary"},
  {n:"Minda Industries",s:"MINDAIND",sec:"Auto Ancillary"},
  {n:"Bosch India",s:"BOSCHLTD",sec:"Auto Ancillary"},
  {n:"Endurance Technologies",s:"ENDURANCE",sec:"Auto Ancillary"},
  {n:"Exide Industries",s:"EXIDEIND",sec:"Auto Ancillary"},
  {n:"Amara Raja Energy",s:"AMARAJABAT",sec:"Auto Ancillary"},
  {n:"Tube Investments",s:"TIINDIA",sec:"Auto Ancillary"},
  {n:"Sona BLW Precision",s:"SONACOMS",sec:"Auto Ancillary"},
  {n:"Uno Minda",s:"UNOMINDA",sec:"Auto Ancillary"},
  {n:"Samvardhana Motherson",s:"MOTHERSON",sec:"Auto Ancillary"},
  {n:"Sundaram Finance",s:"SUNDARMFIN",sec:"NBFC"},
  {n:"Mahindra Finance",s:"M&MFIN",sec:"NBFC"},
  {n:"FSN Ecommerce Nykaa",s:"NYKAA",sec:"Internet"},
  {n:"PB Fintech Policybazaar",s:"POLICYBZR",sec:"Insurance"},
  {n:"Delhivery",s:"DELHIVERY",sec:"Logistics"},
  {n:"Prestige Estates",s:"PRESTIGE",sec:"Real Estate"},
  {n:"Brigade Enterprises",s:"BRIGADE",sec:"Real Estate"},
  {n:"Sobha",s:"SOBHA",sec:"Real Estate"},
  {n:"Lodha Macrotech",s:"LODHA",sec:"Real Estate"},
  {n:"Oberoi Realty",s:"OBEROIRLTY",sec:"Real Estate"},
  {n:"EIH Hotels",s:"EIHOTEL",sec:"Hospitality"},
  {n:"Indian Hotels",s:"INDHOTEL",sec:"Hospitality"},
  {n:"Lemon Tree Hotels",s:"LEMONTREE",sec:"Hospitality"},
  {n:"Blue Dart Express",s:"BLUEDART",sec:"Logistics"},
  {n:"Coromandel International",s:"COROMANDEL",sec:"Agrochemicals"},
  {n:"PI Industries",s:"PIIND",sec:"Agrochemicals"},
  {n:"Gujarat Fluorochemicals",s:"FLUOROCHEM",sec:"Chemicals"},
  {n:"Anupam Rasayan",s:"ANURAS",sec:"Chemicals"},
  {n:"Balaji Amines",s:"BALAMINES",sec:"Chemicals"},
  {n:"Alkyl Amines",s:"ALKYLAMINE",sec:"Chemicals"},
  {n:"Praj Industries",s:"PRAJIND",sec:"Engineering"},
  {n:"Elgi Equipments",s:"ELGIEQUIP",sec:"Engineering"},
  {n:"Timken India",s:"TIMKEN",sec:"Engineering"},
  {n:"SKF India",s:"SKFINDIA",sec:"Engineering"},
  {n:"Schaeffler India",s:"SCHAEFFLER",sec:"Engineering"},
  {n:"HFCL",s:"HFCL",sec:"Telecom"},
  {n:"Sterlite Technologies",s:"STLTECH",sec:"Cables"},
  {n:"Apar Industries",s:"APARINDS",sec:"Cables"},
  {n:"Jyoti CNC",s:"JYOTICNC",sec:"Capital Goods"},
  {n:"Swiggy",s:"SWIGGY",sec:"Internet"},
  {n:"Hyundai India",s:"HYUNDAI",sec:"Auto"},
  {n:"Ola Electric",s:"OLAELEC",sec:"EV"},
  {n:"Bajaj Housing Finance",s:"BAJAJHFL",sec:"Finance"},
  {n:"Jio Financial Services",s:"JIOFIN",sec:"Finance"},
  {n:"NSDL",s:"NSDL",sec:"Finance"},
];

const NSE_INDICES = [
  {n:"Nifty 50",s:"NIFTY",type:"index"},{n:"Bank Nifty",s:"BANKNIFTY",type:"index"},
  {n:"Nifty IT",s:"NIFTY IT",type:"index"},{n:"Nifty Auto",s:"NIFTY AUTO",type:"index"},
  {n:"Nifty Pharma",s:"NIFTY PHARMA",type:"index"},{n:"Nifty Midcap 50",s:"NIFTY MIDCAP 50",type:"index"},
];

const G='#00e676', R='#ff4444', A='#ffb300', B='#4fc3f7';

function StockSearch({onSelect, selected, onClear}) {
  const [q,setQ]=useState(''); const [res,setRes]=useState([]); const [open,setOpen]=useState(false);
  function search(v){
    if(v.length<2){setRes([]);setOpen(false);return;}
    const lv=v.toLowerCase();
    setRes(NSE_STOCKS.filter(s=>s.n.toLowerCase().indexOf(lv)>=0||s.s.toLowerCase().indexOf(lv)>=0||s.sec.toLowerCase().indexOf(lv)>=0).slice(0,10));
    setOpen(true);
  }
  return React.createElement('div',{style:{position:'relative',marginBottom:10}},
    React.createElement('div',{style:{display:'flex',gap:8,marginBottom:6}},
      React.createElement('input',{type:'text',value:q,onChange:e=>{setQ(e.target.value);if(selected)onClear();search(e.target.value);},onFocus:()=>{if(q.length>=2&&res.length)setOpen(true);},placeholder:'Type: Reliance, TCS, HDFC...',autoComplete:'off',style:{flex:1,padding:'11px 13px',background:'#1a2235',border:'1px solid '+(selected?G:'#1e2d45'),borderRadius:8,color:'#e2e8f0',fontSize:14,outline:'none',fontFamily:'monospace'}}),
      q?React.createElement('button',{onPointerDown:e=>{e.preventDefault();setQ('');setRes([]);setOpen(false);onClear();},style:{padding:'11px 13px',background:'#1a2235',border:'1px solid #1e2d45',borderRadius:8,color:'#8899bb',fontSize:13,cursor:'pointer'}},'X'):null
    ),
    selected?React.createElement('div',{style:{background:'#052e16',border:'1px solid #00e67633',borderRadius:8,padding:'7px 12px',marginBottom:6}},
      React.createElement('div',{style:{fontSize:13,fontWeight:700,color:G}},selected.n),
      React.createElement('div',{style:{fontSize:10,color:'#4a6080',marginTop:2}},selected.s+' - NSE - '+selected.sec)
    ):null,
    open&&res.length>0?React.createElement('div',{style:{position:'absolute',top:'calc(100% + 2px)',left:0,right:0,background:'#0d1520',border:'1px solid #2a3f5f',borderRadius:10,zIndex:9999,maxHeight:'50vh',overflowY:'auto',boxShadow:'0 8px 32px rgba(0,0,0,0.7)'}},
      res.map(s=>React.createElement('div',{key:s.s,onPointerDown:e=>{e.preventDefault();onSelect(s);setQ(s.n);setOpen(false);setRes([]);},style:{padding:'11px 14px',display:'flex',justifyContent:'space-between',alignItems:'center',borderBottom:'1px solid #1e2d45',cursor:'pointer',userSelect:'none'},onPointerEnter:e=>e.currentTarget.style.background='#1a2235',onPointerLeave:e=>e.currentTarget.style.background='transparent'},
        React.createElement('div',null,React.createElement('div',{style:{fontSize:13,color:'#e2e8f0',fontWeight:500}},s.n),React.createElement('div',{style:{fontSize:10,color:'#4a6080',marginTop:2}},s.s)),
        React.createElement('div',{style:{fontSize:10,color:'#4a6080',flexShrink:0,paddingLeft:8}},s.sec)
      ))
    ):null,
    open&&res.length===0&&q.length>=2?React.createElement('div',{style:{position:'absolute',top:'calc(100% + 2px)',left:0,right:0,background:'#0d1520',border:'1px solid #2a3f5f',borderRadius:10,zIndex:9999,padding:14,textAlign:'center',fontSize:12,color:'#4a6080'}},'No results for "'+q+'"'):null
  );
}

function LevelChart({data}) {
  if (!data) return null;
  var price = data.price, pdh = data.pdh, pdl = data.pdl, pdc = data.pdc;
  var orHigh = data.orHigh, orLow = data.orLow, vwap = data.vwap;
  var entry = data.entry, stop = data.stop, target = data.target;

  var allLevels = [
    {label:'OR High', val:orHigh, color:A, dash:false},
    {label:'PDH',     val:pdh,    color:R, dash:true},
    {label:'VWAP',    val:vwap,   color:B, dash:true},
    {label:'PDC',     val:pdc,    color:'#8899bb', dash:true},
    {label:'PDL',     val:pdl,    color:G, dash:true},
    {label:'OR Low',  val:orLow,  color:A, dash:false},
  ].filter(function(l){return l.val;});
  if (target) allLevels.push({label:'Target', val:target, color:G, dash:false, bold:true});
  if (stop)   allLevels.push({label:'Stop',   val:stop,   color:R, dash:false, bold:true});

  allLevels.sort(function(a,b){return b.val - a.val;});

  var allVals = allLevels.map(function(l){return l.val;}).concat([price]);
  var minV = Math.min.apply(null, allVals);
  var maxV = Math.max.apply(null, allVals);
  var span = maxV - minV || 1;

  // Add 15% padding so labels at extremes do not get clipped
  var padded = span * 0.15;
  var minVp = minV - padded;
  var maxVp = maxV + padded;
  var spanP = maxVp - minVp;

  function linePct(v) {
    return Math.min(97, Math.max(3, ((maxVp - v) / spanP) * 100));
  }

  // Spread label positions with min gap
  var minGap = 12;
  var labelPos = allLevels.map(function(l){ return {label:l.label, pos:linePct(l.val)}; });

  // Forward pass: push down
  for (var i = 1; i < labelPos.length; i++) {
    if (labelPos[i].pos < labelPos[i-1].pos + minGap) {
      labelPos[i].pos = labelPos[i-1].pos + minGap;
    }
  }
  // Backward pass: pull up if overflowed bottom
  for (var i = labelPos.length - 2; i >= 0; i--) {
    if (labelPos[i].pos > labelPos[i+1].pos - minGap) {
      labelPos[i].pos = labelPos[i+1].pos - minGap;
    }
  }
  labelPos.forEach(function(d){ d.pos = Math.max(2, Math.min(97, d.pos)); });

  function getLblPos(label) {
    var d = labelPos.find(function(x){return x.label===label;});
    return d ? d.pos : 50;
  }

  var pricePct = linePct(price);

  return React.createElement('div',{style:{position:'relative',height:280,background:'#0d1520',borderRadius:8,overflow:'hidden',marginBottom:4}},
    allLevels.map(function(l) {
      var lp = linePct(l.val);
      var dp = getLblPos(l.label);
      return React.createElement('div',{key:l.label},
        // Horizontal level line at true price position
        React.createElement('div',{style:{position:'absolute',left:0,right:0,top:lp+'%',borderTop:'1px '+(l.dash?'dashed':'solid')+' '+l.color,opacity:0.5}}),
        // Label at spread position (left side)
        React.createElement('div',{style:{position:'absolute',left:4,top:'calc('+dp+'% - 7px)',fontSize:9,color:l.color,fontWeight:l.bold?700:400,whiteSpace:'nowrap',lineHeight:1.2,background:'#0d1520',paddingRight:3}},
          l.label+' '+l.val.toFixed(1))
      );
    }),
    // Price line at true position
    React.createElement('div',{style:{position:'absolute',left:0,right:0,top:pricePct+'%',borderTop:'2px solid #e2e8f0',zIndex:5}}),
    // Price label on RIGHT side to avoid clashing with level labels
    React.createElement('div',{style:{position:'absolute',right:6,top:'calc('+pricePct+'% - 9px)',fontSize:10,color:'#e2e8f0',fontWeight:700,whiteSpace:'nowrap',zIndex:7,background:'#0d1520',paddingLeft:3}},
      'Rs '+price.toFixed(1)),
    // Dot at right end of price line
    React.createElement('div',{style:{position:'absolute',right:4,top:'calc('+pricePct+'% - 4px)',width:8,height:8,borderRadius:'50%',background:'#e2e8f0',zIndex:6}}),
    entry?React.createElement('div',{style:{position:'absolute',left:0,right:0,top:linePct(entry)+'%',borderTop:'2px solid '+G,zIndex:4,opacity:0.9}}):null
  );
}

function MiniChart({bars}) {
  if (!bars || !bars.closes || bars.closes.length < 2) return null;
  const n = Math.min(bars.closes.length, 20);
  const cl=bars.closes.slice(-n),hi=bars.highs.slice(-n),lo=bars.lows.slice(-n),op=bars.opens.slice(-n),vl=bars.volumes.slice(-n),ts=bars.ts.slice(-n);
  const minP=Math.min(...lo),maxP=Math.max(...hi),maxV=Math.max(...vl)||1,range=maxP-minP||1;
  return React.createElement('div',null,
    React.createElement('div',{style:{display:'flex',alignItems:'flex-end',gap:2,height:60}},
      cl.map((_,i)=>{const up=cl[i]>=op[i],bH=Math.max(2,Math.abs(cl[i]-op[i])/range*55),bB=(Math.min(cl[i],op[i])-minP)/range*55;
        return React.createElement('div',{key:i,style:{display:'flex',flexDirection:'column',alignItems:'center',flex:1,height:'100%',justifyContent:'flex-end'}},
          React.createElement('div',{style:{width:'65%',minHeight:2,borderRadius:1,background:up?G:R,height:bH,marginBottom:bB}}));})
    ),
    React.createElement('div',{style:{display:'flex',alignItems:'flex-end',gap:2,height:16,marginTop:3}},
      vl.map((v,i)=>React.createElement('div',{key:i,style:{flex:1,minHeight:1,borderRadius:1,background:cl[i]>=op[i]?'#00e67644':'#ff444444',height:Math.max(2,v/maxV*14)}}))
    ),
    React.createElement('div',{style:{display:'flex',gap:2,marginTop:2}},
      ts.map((t,i)=>{const d=new Date(t*1000);return React.createElement('div',{key:i,style:{flex:1,fontSize:7,color:'#4a6080',textAlign:'center',overflow:'hidden',whiteSpace:'nowrap'}},i%5===0?(d.getHours()+':'+String(d.getMinutes()).padStart(2,'0')):'');})
    )
  );
}

function ScannerCard({r, onDetail}) {
  const isLong = r.direction === 'LONG';
  const isShort = r.direction === 'SHORT';
  const isWatch = r.direction.startsWith('WATCH');
  const dc = isLong ? G : isShort ? R : A;
  const dbg = isLong ? '#052e16' : isShort ? '#2d0a0a' : '#2d1e00';
  const dborder = isLong ? '#00e67633' : isShort ? '#ff444433' : '#ffb30033';
  const pctBar = Math.min(r.conviction, 100);

  return React.createElement('div',{style:{background:'#111827',border:'1px solid #1e2d45',borderRadius:12,padding:12,marginBottom:8}},
    React.createElement('div',{style:{display:'flex',justifyContent:'space-between',alignItems:'flex-start',marginBottom:8}},
      React.createElement('div',null,
        React.createElement('div',{style:{fontSize:14,fontWeight:700,color:'#e2e8f0'}},r.symbol),
        React.createElement('div',{style:{fontSize:10,color:'#4a6080',marginTop:2}},r.name+' · '+r.sector+(r.isNifty50?' · N50':''))
      ),
      React.createElement('div',{style:{display:'flex',flexDirection:'column',alignItems:'flex-end',gap:4}},
        React.createElement('div',{style:{background:dbg,border:'1px solid '+dborder,borderRadius:4,padding:'2px 10px',fontSize:11,fontWeight:700,color:dc}},r.direction),
        React.createElement('div',{style:{fontSize:10,color:dc,fontWeight:600}},r.conviction+'% conviction')
      )
    ),
    React.createElement('div',{style:{height:5,background:'#1a2235',borderRadius:3,overflow:'hidden',marginBottom:8}},
      React.createElement('div',{style:{height:'100%',borderRadius:3,background:dc,width:pctBar+'%',transition:'width 0.5s'}})
    ),
    React.createElement('div',{style:{display:'flex',gap:6,marginBottom:8}},
      React.createElement('div',{style:{flex:1,background:'#1a2235',borderRadius:6,padding:'6px 8px'}},
        React.createElement('div',{style:{fontSize:8,color:'#4a6080',textTransform:'uppercase',marginBottom:2}},'Price'),
        React.createElement('div',{style:{fontSize:12,fontWeight:700,color:'#e2e8f0'}},'Rs '+r.price),
        React.createElement('div',{style:{fontSize:10,color:r.change>=0?G:R}},(r.change>=0?'+':'')+r.change+'%')
      ),
      r.entry?React.createElement('div',{style:{flex:1,background:'#1a2235',borderRadius:6,padding:'6px 8px'}},
        React.createElement('div',{style:{fontSize:8,color:'#4a6080',textTransform:'uppercase',marginBottom:2}},'Entry'),
        React.createElement('div',{style:{fontSize:12,fontWeight:700,color:'#e2e8f0'}},'Rs '+r.entry)
      ):null,
      r.stop?React.createElement('div',{style:{flex:1,background:'#1a2235',borderRadius:6,padding:'6px 8px'}},
        React.createElement('div',{style:{fontSize:8,color:R,textTransform:'uppercase',marginBottom:2}},'Stop'),
        React.createElement('div',{style:{fontSize:12,fontWeight:700,color:R}},'Rs '+r.stop)
      ):null,
      r.target?React.createElement('div',{style:{flex:1,background:'#1a2235',borderRadius:6,padding:'6px 8px'}},
        React.createElement('div',{style:{fontSize:8,color:G,textTransform:'uppercase',marginBottom:2}},'Target'),
        React.createElement('div',{style:{fontSize:12,fontWeight:700,color:G}},'Rs '+r.target),
        r.rr?React.createElement('div',{style:{fontSize:9,color:'#8899bb'}},'R:R '+r.rr+':1'):null
      ):null
    ),
    r.reasons&&r.reasons.length>0?React.createElement('div',{style:{fontSize:11,color:'#8899bb',lineHeight:1.6,borderTop:'1px solid #1a2235',paddingTop:7}},r.reasons.join(' · ')):null
  );
}

export default function Home() {
  const [ist,setIst]=useState('--:--:--');
  const [mkt,setMkt]=useState({text:'LOADING',color:R,bg:'#2d0a0a',bc:'#ff444433'});
  const [tab,setTab]=useState('scanner');
  const [instrType,setInstrType]=useState('index');
  const [idx,setIdx]=useState(NSE_INDICES[0]);
  const [stock,setStock]=useState(null);
  const [intv,setIntv]=useState('15min');
  const [loading,setLoading]=useState(false);
  const [step,setStep]=useState('');
  const [err,setErr]=useState('');
  const [mktData,setMktData]=useState(null);
  const [scanData,setScanData]=useState(null);
  const [scanLoading,setScanLoading]=useState(false);
  const [scanErr,setScanErr]=useState('');
  const [valLoading,setValLoading]=useState(false);
  const [valResult,setValResult]=useState(null);
  const [valErr,setValErr]=useState('');
  const [valUniverse,setValUniverse]=useState('top20');
  const [valHold,setValHold]=useState('10');
  const [valMin,setValMin]=useState('5');
  const [trades,setTrades]=useState([]);
  const [tradeEntry,setTradeEntry]=useState('');
  const [tradeStop,setTradeStop]=useState('');
  const [tradeTarget,setTradeTarget]=useState('');
  const [tradeSym,setTradeSym]=useState('');
  const [tradeDir,setTradeDir]=useState('LONG');
  const [tradeStock,setTradeStock]=useState(null);
  const [tradePrices,setTradePrices]=useState({});
  const [refreshCountdown,setRefreshCountdown]=useState(60);
  const [autoRefreshing,setAutoRefreshing]=useState(false);
  const [niftyLive,setNiftyLive]=useState(null);
  const [adWatchlist,setAdWatchlist]=useState('');
  const [adScanData,setAdScanData]=useState(null);
  const [adScanLoading,setAdScanLoading]=useState(false);
  const [adScanErr,setAdScanErr]=useState('');
  const [valMethod,setValMethod]=useState('pattern');
  const [momLookback,setMomLookback]=useState('20');
  const [momResult,setMomResult]=useState(null);

  useEffect(()=>{
    const tick=()=>{
      const ist=new Date(new Date().toLocaleString('en-US',{timeZone:'Asia/Kolkata'}));
      setIst(String(ist.getHours()).padStart(2,'0')+':'+String(ist.getMinutes()).padStart(2,'0')+':'+String(ist.getSeconds()).padStart(2,'0'));
      const m=ist.getHours()*60+ist.getMinutes(),d=ist.getDay();
      if(d===0||d===6)setMkt({text:'WEEKEND',color:R,bg:'#2d0a0a',bc:'#ff444433'});
      else if(m>=555&&m<575)setMkt({text:'PRE-OPEN',color:A,bg:'#2d1e00',bc:'#ffb30033'});
      else if(m>=575&&m<930)setMkt({text:'MARKET OPEN',color:G,bg:'#00391a',bc:'#00e67633'});
      else setMkt({text:'CLOSED',color:R,bg:'#2d0a0a',bc:'#ff444433'});
    };
    tick(); const id=setInterval(tick,1000); return ()=>clearInterval(id);
  },[]);

  async function analyze() {
    const symbol=instrType==='index'?idx.s:(stock?stock.s:null);
    const type=instrType==='index'?'index':'stock';
    if(!symbol){setErr('Please select a stock.');return;}
    setLoading(true);setErr('');setMktData(null);
    try {
      setStep('Fetching price levels + intraday data...');
      const r=await fetch('/api/market?symbol='+encodeURIComponent(symbol)+'&type='+type+'&interval='+intv);
      const j=await r.json();
      if(!r.ok||j.error)throw new Error(j.error||'Fetch failed');
      setMktData(j);
    } catch(e){setErr(e.message);}
    setLoading(false);setStep('');
  }

  async function runScanner() {
    setScanLoading(true);setScanErr('');setScanData(null);
    try {
      const r=await fetch('/api/scanner');
      const j=await r.json();
      if(!r.ok||j.error)throw new Error(j.error||'Scanner failed');
      setScanData(j);
    } catch(e){setScanErr(e.message);}
    setScanLoading(false);
  }

  const sel={width:'100%',padding:'11px 12px',background:'#1a2235',border:'1px solid #1e2d45',borderRadius:8,color:'#e2e8f0',fontSize:13,WebkitAppearance:'none',outline:'none',fontFamily:'monospace'};
  const d=mktData;
  const sigColor=d?(d.signal==='LONG'?G:d.signal==='SHORT'?R:d.signal==='WATCH_LONG'?A:d.signal==='WATCH_SHORT'?A:'#8899bb'):'#8899bb';
  const sigBg=d?(d.signal==='LONG'?'#052e16':d.signal==='SHORT'?'#2d0a0a':'#2d1e00'):'#1a2235';
  const nColor=d&&d.niftyTrend?(d.niftyTrend.trend==='BULLISH'?G:d.niftyTrend.trend==='BEARISH'?R:A):A;

  async function runValidate(){
    setValLoading(true);setValErr('');setValResult(null);setMomResult(null);console.log('Running with method:',valMethod);
    try{
      var url='/api/validate?universe='+valUniverse+'&hold='+valHold+'&minMove='+valMin+'&method='+valMethod+'&lookback='+momLookback;
      const r=await fetch(url);
      const j=await r.json();
      if(!r.ok||j.error)throw new Error(j.error||'Validation failed');
      if(j.method==='momentum')setMomResult(j);
      else setValResult(j);
    }catch(e){setValErr(e.message);}
    setValLoading(false);
  }

  function addTrade(){
    var sym=tradeStock?tradeStock.s:tradeSym.toUpperCase();
    if(!sym||!tradeEntry||!tradeStop||!tradeTarget)return;
    const t={
      id:Date.now(),sym:sym,
      name:tradeStock?tradeStock.n:sym,
      sector:tradeStock?tradeStock.sec:'',
      dir:tradeDir,
      entry:parseFloat(tradeEntry),stop:parseFloat(tradeStop),
      target:parseFloat(tradeTarget),
      time:new Date().toLocaleTimeString('en-IN',{timeZone:'Asia/Kolkata',hour:'2-digit',minute:'2-digit'}),
      current:parseFloat(tradeEntry),status:'OPEN'
    };
    setTrades(function(prev){return[t,...prev];});
    setTradeSym('');setTradeEntry('');setTradeStop('');setTradeTarget('');
    setTradeStock(null);
  }

  function removeTrade(id){setTrades(function(prev){return prev.filter(function(t){return t.id!==id;});});}

  async function refreshPrices(){
    var syms=[...new Set(trades.map(function(t){return t.sym+'.NS';}))];
    if(!syms.length)return;
    setAutoRefreshing(true);
    var updated={};
    await Promise.all(syms.map(async function(sym){
      try{
        var r=await fetch('/api/market?symbol='+sym.replace('.NS','')+'&type=stock&interval=15min');
        var j=await r.json();
        if(j&&j.price)updated[sym.replace('.NS','')]=j.price;
      }catch(e){}
    }));
    setTradePrices(function(prev){return Object.assign({},prev,updated);});
    setAutoRefreshing(false);
    setRefreshCountdown(60);
  }

  // Fetch Nifty live data
  async function fetchNiftyLive(){
    try{
      var r=await fetch('/api/market?symbol=NIFTY&type=index&interval=15min');
      var j=await r.json();
      if(j&&j.price){
        setNiftyLive({price:j.price,change:j.change||0,changePct:j.changePct||0,trend:j.niftyTrend?j.niftyTrend.trend:'NEUTRAL'});
      }
    }catch(e){}
  }

  // Load saved AD watchlist from localStorage
  React.useEffect(function(){
    try {
      var saved = localStorage.getItem('adWatchlist');
      if (saved) setAdWatchlist(saved);
    } catch(e) {}
  }, []);

  // Save watchlist to localStorage whenever it changes
  React.useEffect(function(){
    try {
      if (adWatchlist) localStorage.setItem('adWatchlist', adWatchlist);
    } catch(e) {}
  }, [adWatchlist]);

  // Auto-refresh trade prices every 60 seconds when on trades tab
  React.useEffect(function(){
    if(tab!=='trades')return;
    fetchNiftyLive();
    if(trades.length===0)return;
    setRefreshCountdown(60);
    var countdown=60;
    var timer=setInterval(function(){
      countdown--;
      setRefreshCountdown(countdown);
      if(countdown<=0){
        countdown=60;
        setRefreshCountdown(60);
        setAutoRefreshing(true);
        fetchNiftyLive();
        var syms=[...new Set(trades.map(function(t){return t.sym+'.NS';}))];
        Promise.all(syms.map(async function(sym){
          try{
            var r=await fetch('/api/market?symbol='+sym.replace('.NS','')+'&type=stock&interval=15min');
            var j=await r.json();
            if(j&&j.price)return{sym:sym.replace('.NS',''),price:j.price};
          }catch(e){}
          return null;
        })).then(function(results){
          var updated={};
          results.forEach(function(r){if(r)updated[r.sym]=r.price;});
          setTradePrices(function(prev){return Object.assign({},prev,updated);});
          setAutoRefreshing(false);
        });
      }
    },1000);
    return function(){clearInterval(timer);};
  },[tab,trades.length]);

  async function runAdScan(){
    // Parse symbols - handle comma, newline, space separated
    var raw=adWatchlist.trim();
    if(!raw){setAdScanErr('Please enter at least one stock symbol');return;}
    var syms=raw.split(/[,\n\r\s]+/)
      .map(function(s){return s.trim().toUpperCase().replace(/\.NS$/,'');})
      .filter(function(s){return s.length>=2;});
    // Remove duplicates
    syms=[...new Set(syms)];
    if(!syms.length){setAdScanErr('No valid symbols found. Enter symbols like: EIHOTEL, COALINDIA, DIVISLAB');return;}
    setAdScanLoading(true);setAdScanErr('');setAdScanData(null);
    try{
      var url='/api/scanner?mode=watchlist&symbols='+encodeURIComponent(syms.join(','));
      var r=await fetch(url);
      var j=await r.json();
      if(!r.ok||j.error)throw new Error(j.error||'Scan failed');
      // Attach the original symbols requested so we can show missing ones
      j.requestedSyms=syms;
      setAdScanData(j);
    }catch(e){setAdScanErr(e.message);}
    setAdScanLoading(false);
  }

  const instrSelector=React.createElement('div',{style:{background:'#111827',border:'1px solid #1e2d45',borderRadius:12,padding:12,marginBottom:10}},
    React.createElement('div',{style:{display:'grid',gridTemplateColumns:'1fr 1fr',gap:8,marginBottom:8}},
      React.createElement('div',null,
        React.createElement('div',{style:{fontSize:9,color:'#4a6080',textTransform:'uppercase',marginBottom:4}},'Type'),
        React.createElement('select',{value:instrType,onChange:e=>setInstrType(e.target.value),style:sel},
          React.createElement('option',{value:'index'},'Index'),React.createElement('option',{value:'stock'},'NSE Stock'))
      ),
      React.createElement('div',null,
        React.createElement('div',{style:{fontSize:9,color:'#4a6080',textTransform:'uppercase',marginBottom:4}},'Interval'),
        React.createElement('select',{value:intv,onChange:e=>setIntv(e.target.value),style:sel},
          React.createElement('option',{value:'5min'},'5 min'),React.createElement('option',{value:'15min'},'15 min'),
          React.createElement('option',{value:'30min'},'30 min'),React.createElement('option',{value:'1h'},'1 hour'))
      )
    ),
    instrType==='index'?React.createElement('div',null,
      React.createElement('div',{style:{fontSize:9,color:'#4a6080',textTransform:'uppercase',marginBottom:4}},'Index'),
      React.createElement('select',{value:idx.s,onChange:e=>setIdx(NSE_INDICES.find(i=>i.s===e.target.value)),style:sel},
        NSE_INDICES.map(i=>React.createElement('option',{key:i.s,value:i.s},i.n)))
    ):React.createElement('div',null,
      React.createElement('div',{style:{fontSize:9,color:'#4a6080',textTransform:'uppercase',marginBottom:4}},'Search NSE Stock'),
      React.createElement(StockSearch,{selected:stock,onSelect:setStock,onClear:()=>setStock(null)})
    )
  );

  return React.createElement('div',{style:{background:'#0a0e1a',minHeight:'100vh',color:'#e2e8f0',fontFamily:'monospace',paddingBottom:60,maxWidth:'100vw',overflowX:'hidden'}},
    React.createElement('style',null,'*{box-sizing:border-box;margin:0;padding:0;-webkit-tap-highlight-color:transparent}::-webkit-scrollbar{width:3px}::-webkit-scrollbar-thumb{background:#2a3f5f;border-radius:2px}@keyframes spin{to{transform:rotate(360deg)}}@keyframes blink{0%,100%{opacity:1}50%{opacity:0}}@keyframes pulse{0%,100%{opacity:1}50%{opacity:0.7}}'),

    (loading||scanLoading)?React.createElement('div',{style:{position:'fixed',inset:0,background:'rgba(10,14,26,0.95)',zIndex:9999,display:'flex',flexDirection:'column',alignItems:'center',justifyContent:'center',gap:14}},
      React.createElement('div',{style:{width:44,height:44,border:'3px solid #1e2d45',borderTopColor:G,borderRadius:'50%',animation:'spin 0.8s linear infinite'}}),
      React.createElement('div',{style:{fontSize:13,color:'#8899bb',textAlign:'center',padding:'0 24px'}},scanLoading?'Scanning Nifty 500 stocks...':step)
    ):null,

    // TOPBAR
    React.createElement('div',{style:{position:'sticky',top:0,zIndex:10,background:'#0a0e1a',borderBottom:'1px solid #1e2d45',padding:'10px 14px',display:'flex',alignItems:'center',justifyContent:'space-between'}},
      React.createElement('div',{style:{display:'flex',alignItems:'center',gap:8}},
        React.createElement('div',{style:{fontFamily:'sans-serif',fontSize:17,fontWeight:800,color:G}},'NSE AI'),
        React.createElement('div',{style:{fontSize:9,color:'#4a6080',letterSpacing:'0.06em',paddingTop:2}},'ORB SCANNER')
      ),
      React.createElement('div',{style:{display:'flex',flexDirection:'column',alignItems:'flex-end',gap:2}},
        React.createElement('div',{style:{fontSize:10,color:'#8899bb'}},'IST '+ist),
        React.createElement('div',{style:{fontSize:9,fontWeight:700,padding:'2px 7px',borderRadius:3,background:mkt.bg,color:mkt.color,border:'1px solid '+mkt.bc}},mkt.text)
      )
    ),

    // TABS
    React.createElement('div',{style:{display:'flex',background:'#111827',borderBottom:'1px solid #1e2d45',overflowX:'auto',WebkitOverflowScrolling:'touch'}},
      [['scanner','Scanner (N500)'],['analyze','Analyze Stock'],['adwatch','AD Watch'],['trades','Trades'],['validate','Validate']].map(function(tabItem){
        var t=tabItem[0]; var label=tabItem[1];
        const active=tab===t;
        return React.createElement('button',{key:t,onClick:()=>setTab(t),style:{flex:'0 0 auto',padding:'10px 10px',background:'transparent',border:'none',borderBottom:active?'2px solid '+G:'2px solid transparent',color:active?G:'#4a6080',fontSize:10,fontWeight:active?700:400,cursor:'pointer',textTransform:'uppercase',letterSpacing:'0.06em',fontFamily:'monospace',whiteSpace:'nowrap'}},label);
      })
    ),

    // SCANNER TAB
    tab==='scanner'?React.createElement('div',{style:{padding:'12px 12px 20px'}},
      // Market context bar
      React.createElement('div',{style:{background:'#111827',border:'1px solid #1e2d45',borderRadius:10,padding:10,marginBottom:10,display:'flex',alignItems:'center',justifyContent:'space-between'}},
        React.createElement('div',{style:{fontSize:11,color:'#8899bb'}},
          scanData?'Scanned '+scanData.totalScanned+' stocks · '+scanData.phase2Count+' analysed in depth':'Scans all Nifty 500 stocks for ORB breakouts'
        ),
        scanData?React.createElement('div',{style:{display:'flex',alignItems:'center',gap:8}},
          React.createElement('div',{style:{fontSize:10,color:'#4a6080'}},'Nifty'),
          React.createElement('div',{style:{fontSize:11,fontWeight:700,color:scanData.niftyTrend==='BULLISH'?G:scanData.niftyTrend==='BEARISH'?R:A}},scanData.niftyTrend+' '+(scanData.niftyChange>=0?'+':'')+scanData.niftyChange+'%')
        ):null
      ),
      React.createElement('button',{onClick:runScanner,disabled:scanLoading,style:{width:'100%',padding:13,background:'#4fc3f7',color:'#000',border:'none',borderRadius:10,fontFamily:'sans-serif',fontSize:14,fontWeight:800,cursor:'pointer',opacity:scanLoading?0.4:1,marginBottom:10}},
        scanLoading?'Scanning 500 stocks...':'SCAN NIFTY 500 NOW'
      ),
      !mkt.text.includes('OPEN')&&!scanData?React.createElement('div',{style:{fontSize:11,color:A,padding:'10px 12px',background:'#2d1e00',border:'1px solid #ffb30033',borderRadius:8,marginBottom:10,lineHeight:1.7}},'Market is currently closed. Scanner works best during market hours 09:15-15:30 IST on weekdays. You can still run it to see pre/post-market setups.'):null,
      scanErr?React.createElement('div',{style:{fontSize:11,color:R,padding:'10px 12px',background:'#2d0a0a',border:'1px solid #ff444433',borderRadius:8,marginBottom:10}},'Error: '+scanErr):null,
      scanData?React.createElement('div',null,
        scanData.results.length===0?React.createElement('div',{style:{fontSize:12,color:'#4a6080',textAlign:'center',padding:'30px 0',lineHeight:1.8}},'No strong setups found right now.\nMarket may be in a consolidation phase.\nTry again after 10am IST when ORB has formed.'):
        React.createElement('div',null,
          React.createElement('div',{style:{fontSize:10,color:'#4a6080',textTransform:'uppercase',letterSpacing:'0.1em',marginBottom:10,display:'flex',justifyContent:'space-between'}},
            React.createElement('span',null,'Top '+scanData.results.length+' Setups'),
            React.createElement('span',null,scanData.scannedAt)
          ),
          scanData.results.map((r,i)=>React.createElement(ScannerCard,{key:r.symbol+i,r}))
        )
      ):React.createElement('div',{style:{fontSize:12,color:'#4a6080',lineHeight:2,padding:'20px 0',textAlign:'center'}},'Tap SCAN NIFTY 500 NOW to find\nthe strongest ORB breakout setups\nacross all 500 NSE stocks.')
    ):null,

    // ANALYZE TAB
    tab==='analyze'?React.createElement('div',{style:{padding:'12px 12px 20px'}},
      instrSelector,
      React.createElement('button',{onClick:analyze,disabled:loading||(instrType==='stock'&&!stock),style:{width:'100%',padding:13,background:G,color:'#000',border:'none',borderRadius:10,fontFamily:'sans-serif',fontSize:14,fontWeight:800,cursor:'pointer',opacity:(loading||(instrType==='stock'&&!stock))?0.35:1,marginBottom:10}},'ANALYZE LEVELS'),
      err?React.createElement('div',{style:{fontSize:11,color:R,padding:'10px 12px',background:'#2d0a0a',border:'1px solid #ff444433',borderRadius:8,marginBottom:10,lineHeight:1.7}},'Error: '+err):null,

      d?React.createElement('div',null,
        // Signal verdict
        React.createElement('div',{style:{background:sigBg,border:'2px solid '+sigColor+'44',borderRadius:14,padding:14,marginBottom:10}},
          React.createElement('div',{style:{display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:10}},
            React.createElement('div',null,
              React.createElement('div',{style:{fontSize:9,color:'#8899bb',textTransform:'uppercase',letterSpacing:'0.1em',marginBottom:3}},'ORB SIGNAL'),
              React.createElement('div',{style:{fontSize:28,fontWeight:800,color:sigColor,fontFamily:'sans-serif',animation:['LONG','SHORT'].includes(d.signal)?'pulse 2s infinite':'none'}},d.signal)
            ),
            React.createElement('div',{style:{textAlign:'right'}},
              React.createElement('div',{style:{fontSize:9,color:'#8899bb',marginBottom:2}},'NIFTY TREND'),
              React.createElement('div',{style:{fontSize:13,fontWeight:700,color:nColor}},(d.niftyTrend?d.niftyTrend.trend:'--')||'--'),
              React.createElement('div',{style:{fontSize:10,color:nColor}},((d.niftyTrend?d.niftyTrend.change:0)>=0?'+':'')+(d.niftyTrend?d.niftyTrend.change:0)+'%')
            )
          ),
          d.entry?React.createElement('div',{style:{display:'grid',gridTemplateColumns:'1fr 1fr 1fr',gap:6,marginBottom:10}},
            React.createElement('div',{style:{background:'rgba(0,0,0,0.3)',borderRadius:8,padding:'8px 10px'}},React.createElement('div',{style:{fontSize:8,color:'#8899bb',textTransform:'uppercase',marginBottom:3}},'Entry'),React.createElement('div',{style:{fontSize:11,fontWeight:700,color:'#e2e8f0'}},'Rs '+d.entry)),
            React.createElement('div',{style:{background:'rgba(0,0,0,0.3)',borderRadius:8,padding:'8px 10px'}},React.createElement('div',{style:{fontSize:8,color:R,textTransform:'uppercase',marginBottom:3}},'Stop Loss'),React.createElement('div',{style:{fontSize:11,fontWeight:700,color:R}},'Rs '+d.stop)),
            React.createElement('div',{style:{background:'rgba(0,0,0,0.3)',borderRadius:8,padding:'8px 10px'}},React.createElement('div',{style:{fontSize:8,color:G,textTransform:'uppercase',marginBottom:3}},'Target'),React.createElement('div',{style:{fontSize:11,fontWeight:700,color:G}},'Rs '+d.target+(d.rr?' ('+d.rr+':1)':'')))
          ):null,
          React.createElement('div',{style:{fontSize:11,color:'#c0ccdd',lineHeight:1.7,borderTop:'1px solid rgba(255,255,255,0.07)',paddingTop:8}},d.reason)
        ),

        // Level chart
        React.createElement('div',{style:{background:'#111827',border:'1px solid #1e2d45',borderRadius:10,padding:12,marginBottom:10}},
          React.createElement('div',{style:{fontSize:9,color:'#4a6080',textTransform:'uppercase',letterSpacing:'0.08em',marginBottom:8}},'Key Price Levels'),
          React.createElement(LevelChart,{data:d}),
          React.createElement('div',{style:{display:'flex',flexWrap:'wrap',gap:'4px 10px',marginTop:8}},
            [{label:'PDH',color:R},{label:'OR High/Low',color:A},{label:'VWAP',color:B},{label:'PDC/PDL',color:'#8899bb'},{label:'Price',color:'#e2e8f0'}].map(l=>
              React.createElement('div',{key:l.label,style:{display:'flex',alignItems:'center',gap:4,fontSize:9,color:l.color}},
                React.createElement('div',{style:{width:12,height:2,background:l.color}}),l.label)
            )
          )
        ),

        // Key levels table
        React.createElement('div',{style:{background:'#111827',border:'1px solid #1e2d45',borderRadius:10,padding:12,marginBottom:10}},
          React.createElement('div',{style:{fontSize:9,color:'#4a6080',textTransform:'uppercase',letterSpacing:'0.08em',marginBottom:8}},'All Levels'),
          d.levels.slice(0,6).map(l=>{
            const abv=l.distance>0;
            return React.createElement('div',{key:l.name,style:{display:'flex',justifyContent:'space-between',alignItems:'center',padding:'6px 0',borderBottom:'1px solid #0f1825'}},
              React.createElement('div',{style:{fontSize:12,color:'#8899bb'}},l.name),
              React.createElement('div',{style:{fontSize:12,fontWeight:700,color:'#e2e8f0'}},'Rs '+l.price),
              React.createElement('div',{style:{fontSize:11,color:abv?G:R}},(abv?'+':'')+l.distance.toFixed(2)+'%')
            );
          }),
          React.createElement('div',{style:{display:'grid',gridTemplateColumns:'1fr 1fr',gap:6,marginTop:8}},
            React.createElement('div',{style:{background:'#0d1520',borderRadius:6,padding:'7px 10px'}},
              React.createElement('div',{style:{fontSize:9,color:'#4a6080',marginBottom:2}},'CPR Width'),
              React.createElement('div',{style:{fontSize:12,fontWeight:700,color:d.cpr.width/d.price<0.005?G:A}},'Rs '+d.cpr.width.toFixed(1)+' ('+(d.cpr.width/d.price*100).toFixed(2)+'%)'),
              React.createElement('div',{style:{fontSize:9,color:'#4a6080'}},d.cpr.width/d.price<0.005?'Narrow - trending day':'Wide - range-bound day')
            ),
            React.createElement('div',{style:{background:'#0d1520',borderRadius:6,padding:'7px 10px'}},
              React.createElement('div',{style:{fontSize:9,color:'#4a6080',marginBottom:2}},'OR Range'),
              React.createElement('div',{style:{fontSize:12,fontWeight:700,color:d.orRangePct<0.8?G:d.orRangePct<1.5?A:R}},d.orRangePct.toFixed(2)+'%'),
              React.createElement('div',{style:{fontSize:9,color:'#4a6080'}},d.orRangePct<0.8?'Tight - good setup':d.orRangePct<1.5?'Normal range':'Wide - news event?')
            )
          )
        ),

        // Price chart
        React.createElement('div',{style:{background:'#111827',border:'1px solid #1e2d45',borderRadius:10,padding:12,marginBottom:10}},
          React.createElement('div',{style:{fontSize:9,color:'#4a6080',textTransform:'uppercase',marginBottom:6}},'15min Price + Volume'),
          React.createElement(MiniChart,{bars:d.bars})
        )
      ):React.createElement('div',{style:{fontSize:12,color:'#4a6080',lineHeight:2,padding:'20px 0',textAlign:'center'}},'Select a stock or index above\nand tap ANALYZE LEVELS to see\nPDH, PDL, OR High/Low, VWAP, CPR\nand get an ORB-based signal.')
    ):null,

    // BACKTEST TAB (placeholder - link to backtest API)
    tab==='adwatch'?React.createElement('div',{style:{padding:'10px 12px 20px'}},

      React.createElement('div',{style:{background:'#111827',border:'1px solid #1e2d45',borderRadius:12,padding:12,marginBottom:10}},
        React.createElement('div',{style:{display:'flex',alignItems:'center',gap:8,marginBottom:6}},
          React.createElement('div',{style:{width:8,height:8,borderRadius:'50%',background:'#ce93d8'}}),
          React.createElement('div',{style:{fontSize:12,fontWeight:700,color:'#e2e8f0'}},'AD Watch Scanner'),
          React.createElement('div',{style:{fontSize:10,color:'#4a6080',marginLeft:'auto'}},'Powered by tradingpartner.online')
        ),
        React.createElement('div',{style:{fontSize:11,color:'#4a6080',lineHeight:1.7,marginBottom:6}},'Paste stocks showing Bullish Divergence from tradingpartner.online. Scanner checks for ORB breakouts.'),
        React.createElement('div',{style:{display:'grid',gridTemplateColumns:'1fr 1fr',gap:6,marginBottom:10}},
          React.createElement('div',{style:{background:'#052e16',borderRadius:8,padding:'8px 10px',fontSize:10,color:G,lineHeight:1.6}},
            React.createElement('div',{style:{fontWeight:700,marginBottom:2}},'AD + ORB'),
            'Both systems agree — highest conviction LONG'
          ),
          React.createElement('div',{style:{background:'#2d1040',borderRadius:8,padding:'8px 10px',fontSize:10,color:'#ce93d8',lineHeight:1.6}},
            React.createElement('div',{style:{fontWeight:700,marginBottom:2}},'Contrarian LONG'),
            'ORB says SHORT but AD says BUY — price weakness = better entry'
          )
        ),
        React.createElement('div',{style:{position:'relative',marginBottom:8}},
          React.createElement('textarea',{
            value:adWatchlist,
            onChange:function(e){setAdWatchlist(e.target.value);},
            placeholder:'EIHOTEL, COROMANDEL, DIVISLAB - Paste symbols from tradingpartner.online',
            rows:5,
            style:{width:'100%',background:'#0d1520',border:'1px solid #1e2d45',borderRadius:8,color:'#e2e8f0',fontSize:12,padding:'10px 12px',fontFamily:'monospace',outline:'none',resize:'none'}
          }),
          adWatchlist?React.createElement('div',{style:{fontSize:9,color:'#00e676',marginTop:4,textAlign:'right'}},'Auto-saved'):null
        ),
        React.createElement('div',{style:{display:'grid',gridTemplateColumns:'2fr 1fr',gap:8}},
          React.createElement('button',{onClick:runAdScan,disabled:adScanLoading,
            style:{padding:13,background:'#ce93d8',color:'#000',border:'none',borderRadius:10,fontFamily:'sans-serif',fontSize:14,fontWeight:800,cursor:'pointer',opacity:adScanLoading?0.4:1}
          },adScanLoading?'Scanning watchlist...':'SCAN AD WATCHLIST'),
          React.createElement('button',{onClick:function(){
            setAdWatchlist('');setAdScanData(null);setAdScanErr('');
            try{localStorage.removeItem('adWatchlist');}catch(e){}
          },
            style:{padding:13,background:'#1a2235',color:'#4a6080',border:'1px solid #1e2d45',borderRadius:10,fontFamily:'sans-serif',fontSize:13,fontWeight:600,cursor:'pointer'}
          },'Clear')
        )
      ),

      adScanErr?React.createElement('div',{style:{fontSize:11,color:R,padding:'10px 12px',background:'#2d0a0a',border:'1px solid #ff444433',borderRadius:8,marginBottom:10}},'Error: '+adScanErr):null,

      adScanData?React.createElement('div',null,
        React.createElement('div',{style:{background:'#111827',border:'1px solid #1e2d45',borderRadius:10,padding:'8px 12px',marginBottom:10,display:'flex',justifyContent:'space-between',alignItems:'center'}},
          React.createElement('div',{style:{fontSize:11,color:'#8899bb'}},(adScanData.requestedSyms||[]).length+' stocks scanned · '+(adScanData.results.filter(function(r){return r.direction==='LONG';}).length)+' LONG · '+(adScanData.results.filter(function(r){return r.direction==='CONTRARIAN_LONG';}).length)+' Contrarian'),
          React.createElement('div',{style:{fontSize:11,fontWeight:700,color:adScanData.niftyTrend==='BULLISH'?G:adScanData.niftyTrend==='BEARISH'?R:A}},'Nifty '+adScanData.niftyTrend+' '+(adScanData.niftyChange>=0?'+':'')+adScanData.niftyChange+'%')
        ),
        adScanData.results.length===0?
          React.createElement('div',{style:{background:'#111827',border:'1px solid #ffb30033',borderRadius:12,padding:16,textAlign:'center'}},
            React.createElement('div',{style:{fontSize:13,color:A,marginBottom:6,fontWeight:700}},'No ORB breakouts yet'),
            React.createElement('div',{style:{fontSize:11,color:'#8899bb',lineHeight:1.8,marginBottom:8}},'Your watchlist stocks scanned: '+(adScanData.requestedSyms||[]).join(', ')),
            React.createElement('div',{style:{fontSize:11,color:'#4a6080',lineHeight:1.8}},'None have broken out of their Opening Range yet. Best time to check: 9:30am - 11:30am IST during market hours.')
          ):
          React.createElement('div',null,
            React.createElement('div',{style:{background:'#052e16',border:'1px solid #00e67633',borderRadius:8,padding:'8px 12px',marginBottom:10,fontSize:11,color:G,fontWeight:600}},
              adScanData.results.filter(function(r){return r.direction==='LONG';}).length+' LONG signals from your AD watchlist — these have both AD accumulation AND ORB breakout confirmed'
            ),
            adScanData.results.map(function(r,i){
              var isLong=r.direction==='LONG';
              var isContra=r.direction==='CONTRARIAN_LONG';
              var isWatch=r.direction.startsWith('WATCH');
              var dc=isLong?G:isContra?'#ce93d8':isWatch?A:R;
              var dbg=isLong?'#052e16':isContra?'#2d1040':isWatch?'#2d1e00':'#2d0a0a';
              var borderC=isLong?G:isContra?'#ce93d8':isWatch?A+'44':'#1e2d45';
              return React.createElement('div',{key:r.symbol+i,style:{background:'#111827',border:'2px solid '+borderC,borderRadius:12,padding:12,marginBottom:8}},
                React.createElement('div',{style:{display:'flex',justifyContent:'space-between',alignItems:'flex-start',marginBottom:6}},
                  React.createElement('div',null,
                    React.createElement('div',{style:{display:'flex',alignItems:'center',gap:6,flexWrap:'wrap'}},
                      React.createElement('div',{style:{fontSize:14,fontWeight:700,color:'#e2e8f0'}},r.symbol),
                      isLong?React.createElement('div',{style:{fontSize:9,background:'#052e16',color:G,border:'1px solid #00e67633',borderRadius:3,padding:'2px 6px',fontWeight:700}},'AD + ORB'):null,
                      isContra?React.createElement('div',{style:{fontSize:9,background:'#2d1040',color:'#ce93d8',border:'1px solid #ce93d844',borderRadius:3,padding:'2px 6px',fontWeight:700}},'CONTRARIAN'):null
                    ),
                    React.createElement('div',{style:{fontSize:10,color:'#4a6080',marginTop:2}},r.name+' · '+r.sector)
                  ),
                  React.createElement('div',{style:{textAlign:'right'}},
                    React.createElement('div',{style:{background:dbg,borderRadius:4,padding:'2px 8px',fontSize:11,fontWeight:700,color:dc,marginBottom:2}},isContra?'LONG ↗':r.direction),
                    React.createElement('div',{style:{fontSize:10,color:dc}},r.conviction+'% conviction')
                  )
                ),
                React.createElement('div',{style:{display:'grid',gridTemplateColumns:'1fr 1fr 1fr 1fr',gap:4,marginBottom:6}},
                  [['Price','Rs '+r.price,'#e2e8f0'],['Entry',r.entry?'Rs '+r.entry:'--','#e2e8f0'],['Stop',r.stop?'Rs '+r.stop:'--',R],['Target',r.target?'Rs '+r.target:'--',G]].map(function(x){
                    return React.createElement('div',{key:x[0],style:{background:'#0d1520',borderRadius:5,padding:'5px 6px',textAlign:'center'}},
                      React.createElement('div',{style:{fontSize:8,color:'#4a6080',textTransform:'uppercase',marginBottom:1}},x[0]),
                      React.createElement('div',{style:{fontSize:10,fontWeight:600,color:x[2]}},x[1])
                    );
                  })
                ),
                r.reasons&&r.reasons.length?React.createElement('div',{style:{fontSize:10,color:'#8899bb',lineHeight:1.6,borderTop:'1px solid #1a2235',paddingTop:6}},r.reasons.join(' · ')):null
              );
            })
          )
      ):React.createElement('div',{style:{fontSize:12,color:'#4a6080',textAlign:'center',padding:'20px 0',lineHeight:2}},'Add Bullish Divergence stocks above and tap SCAN AD WATCHLIST to check for ORB breakouts.')

    ):null,
    tab==='backtest'?React.createElement('div',{style:{padding:'12px 12px 20px'}},
      instrSelector,
      React.createElement('button',{onClick:async()=>{
        const symbol=instrType==='index'?idx.s:(stock?stock.s:null);
        const type=instrType==='index'?'index':'stock';
        if(!symbol){setErr('Please select a stock.');return;}
        setLoading(true);setErr('');
        try{
          setStep('Running backtest...');
          const r=await fetch('/api/backtest?symbol='+encodeURIComponent(symbol)+'&type='+type+'&interval='+intv);
          const j=await r.json();
          if(!r.ok||j.error)throw new Error(j.error);
          setMktData({_backtest:j});
        }catch(e){setErr(e.message);}
        setLoading(false);setStep('');
      },disabled:loading||(instrType==='stock'&&!stock),style:{width:'100%',padding:13,background:'#4fc3f7',color:'#000',border:'none',borderRadius:10,fontFamily:'sans-serif',fontSize:14,fontWeight:800,cursor:'pointer',opacity:(loading||(instrType==='stock'&&!stock))?0.35:1,marginBottom:10}},
        'RUN BACKTEST'
      ),
      err?React.createElement('div',{style:{fontSize:11,color:R,padding:'10px 12px',background:'#2d0a0a',border:'1px solid #ff444433',borderRadius:8,marginBottom:10}},'Error: '+err):null,
      mktData&&mktData._backtest?React.createElement('div',null,
        React.createElement('div',{style:{background:'#111827',border:'1px solid #1e2d45',borderRadius:12,padding:14,marginBottom:10}},
          React.createElement('div',{style:{fontSize:9,color:'#4a6080',textTransform:'uppercase',letterSpacing:'0.1em',marginBottom:8}},'Backtest Results'),
          React.createElement('div',{style:{fontSize:36,fontWeight:800,color:mktData._backtest.accuracy>=60?G:mktData._backtest.accuracy>=45?A:R,fontFamily:'sans-serif'}},mktData._backtest.accuracy+'%'),
          React.createElement('div',{style:{fontSize:11,color:'#8899bb',marginTop:4}},mktData._backtest.correctCalls+' correct / '+mktData._backtest.directionalCalls+' directional calls · '+mktData._backtest.totalBars+' bars'),
          React.createElement('div',{style:{display:'grid',gridTemplateColumns:'1fr 1fr 1fr',gap:8,marginTop:10}},
            [['LONG',mktData._backtest.longAccuracy+'%',G,mktData._backtest.longCalls+' calls'],
             ['SHORT',mktData._backtest.shortAccuracy+'%',R,mktData._backtest.shortCalls+' calls'],
             ['NEUTRAL',mktData._backtest.neutralRate+'%',A,mktData._backtest.neutralCalls+' skipped']].map(function(item){
                var lbl=item[0];var val=item[1];var c=item[2];var sub=item[3];
              return React.createElement('div',{key:lbl,style:{background:'#0d1520',borderRadius:8,padding:'8px 10px'}},
                React.createElement('div',{style:{fontSize:9,color:'#4a6080',marginBottom:3}},lbl),
                React.createElement('div',{style:{fontSize:16,fontWeight:700,color:c}},val),
                React.createElement('div',{style:{fontSize:9,color:'#4a6080'}},sub)
              );
            })
          )
        ),
        React.createElement('div',{style:{background:'#111827',border:'1px solid #1e2d45',borderRadius:12,padding:14,marginBottom:10}},
          React.createElement('div',{style:{fontSize:9,color:'#4a6080',textTransform:'uppercase',letterSpacing:'0.08em',marginBottom:10}},'Recent Signals'),
          React.createElement('table',{style:{width:'100%',borderCollapse:'collapse',fontSize:11}},
            React.createElement('thead',null,React.createElement('tr',null,['Date','Signal','Move','Chg%','Result'].map(h=>React.createElement('th',{key:h,style:{padding:'5px 5px',textAlign:'left',fontSize:9,color:'#4a6080',textTransform:'uppercase',borderBottom:'1px solid #1e2d45',whiteSpace:'nowrap'}},h)))),
            React.createElement('tbody',null,
              (mktData._backtest.results||[]).slice().reverse().slice(0,20).map((r,i)=>{
                const pc=r.prediction==='LONG'?G:r.prediction==='SHORT'?R:A;
                const ac=r.actualMove==='UP'?G:r.actualMove==='DOWN'?R:A;
                const rc=r.correct===true?G:r.correct===false?R:'#4a6080';
                return React.createElement('tr',{key:i,style:{borderBottom:'1px solid #0f1825'}},
                  React.createElement('td',{style:{padding:'6px 5px',color:'#8899bb',whiteSpace:'nowrap',fontSize:10}},r.date),
                  React.createElement('td',{style:{padding:'6px 5px',fontWeight:700,color:pc}},r.prediction),
                  React.createElement('td',{style:{padding:'6px 5px',color:ac}},r.actualMove),
                  React.createElement('td',{style:{padding:'6px 5px',color:parseFloat(r.changePct)>=0?G:R}},(parseFloat(r.changePct)>=0?'+':'')+r.changePct+'%'),
                  React.createElement('td',{style:{padding:'6px 5px',fontWeight:700,color:rc}},r.correct===true?'HIT':r.correct===false?'MISS':'SKIP')
                );
              })
            )
          )
        ),
        React.createElement('div',{style:{fontSize:10,color:'#4a6080',lineHeight:1.8}},(mktData._backtest.note||''))
      ):React.createElement('div',{style:{fontSize:12,color:'#4a6080',lineHeight:2,padding:'20px 0',textAlign:'center'}},'Select instrument above and\ntap RUN BACKTEST to see\nORB strategy accuracy\nover recent trading sessions.')
    ):null,

    tab==='trades'?React.createElement('div',{style:{padding:'10px 12px 20px'}},
      niftyLive?React.createElement('div',{
        style:{
          background:niftyLive.changePct<-0.3?'#2d0a0a':niftyLive.changePct>0.3?'#052e16':'#111827',
          border:'1px solid '+(niftyLive.changePct<-0.3?'#ff444455':niftyLive.changePct>0.3?'#00e67655':'#1e2d45'),
          borderRadius:12,padding:'10px 14px',marginBottom:10,
          display:'flex',justifyContent:'space-between',alignItems:'center'
        }
      },
        React.createElement('div',null,
          React.createElement('div',{style:{fontSize:9,color:'#4a6080',textTransform:'uppercase',letterSpacing:'0.1em',marginBottom:2}},'Nifty 50 Live'),
          React.createElement('div',{style:{fontSize:20,fontWeight:700,color:'#e2e8f0',fontFamily:'sans-serif'}},niftyLive.price.toLocaleString('en-IN'))
        ),
        React.createElement('div',{style:{textAlign:'right'}},
          React.createElement('div',{style:{fontSize:18,fontWeight:700,color:niftyLive.changePct<-0.3?'#ff4444':niftyLive.changePct>0.3?'#00e676':'#ffb300'}},(niftyLive.changePct>=0?'+':'')+niftyLive.changePct.toFixed(2)+'%'),
          React.createElement('div',{style:{fontSize:11,fontWeight:600,color:niftyLive.changePct<-0.3?'#ff4444':niftyLive.changePct>0.3?'#00e676':'#ffb300'}},niftyLive.trend),
          niftyLive.changePct<-0.3?React.createElement('div',{style:{fontSize:10,color:'#ff4444',marginTop:2,fontWeight:600}},'EXIT LONGS'):null
        )
      ):null,
      React.createElement('div',{style:{background:'#111827',border:'1px solid #1e2d45',borderRadius:12,padding:12,marginBottom:10}},
        React.createElement('div',{style:{fontSize:9,color:'#4a6080',textTransform:'uppercase',marginBottom:8}},'Log New Trade'),
        React.createElement('div',{style:{marginBottom:6}},
          React.createElement(StockSearch,{
            selected:tradeStock,
            onSelect:function(s){setTradeStock(s);setTradeSym(s.s);},
            onClear:function(){setTradeStock(null);setTradeSym('');}
          })
        ),
        React.createElement('div',{style:{marginBottom:6}},
          React.createElement('select',{value:tradeDir,onChange:function(e){setTradeDir(e.target.value);},style:sel},
            React.createElement('option',{value:'LONG'},'LONG'),
            React.createElement('option',{value:'SHORT'},'SHORT')
          )
        ),
        React.createElement('div',{style:{display:'grid',gridTemplateColumns:'1fr 1fr',gap:6,marginBottom:6}},
          React.createElement('input',{placeholder:'Entry price',value:tradeEntry,onChange:function(e){setTradeEntry(e.target.value);},type:'number',
            style:{background:'#0d1520',border:'1px solid #1e2d45',borderRadius:6,color:'#e2e8f0',fontSize:12,padding:'8px 10px',fontFamily:'monospace',outline:'none'}}),
          React.createElement('input',{placeholder:'Stop loss',value:tradeStop,onChange:function(e){setTradeStop(e.target.value);},type:'number',
            style:{background:'#0d1520',border:'1px solid #ff444455',borderRadius:6,color:'#ff4444',fontSize:12,padding:'8px 10px',fontFamily:'monospace',outline:'none'}})
        ),
        React.createElement('input',{placeholder:'Target price',value:tradeTarget,onChange:function(e){setTradeTarget(e.target.value);},type:'number',
          style:{width:'100%',background:'#0d1520',border:'1px solid #00e67655',borderRadius:6,color:'#00e676',fontSize:12,padding:'8px 10px',fontFamily:'monospace',outline:'none',marginBottom:8}}),
        React.createElement('div',{style:{display:'grid',gridTemplateColumns:'2fr 1fr',gap:6}},
          React.createElement('button',{onClick:addTrade,style:{padding:'10px',background:G,color:'#000',border:'none',borderRadius:8,fontFamily:'sans-serif',fontSize:13,fontWeight:700,cursor:'pointer'}},'+ ADD TRADE'),
          React.createElement('button',{onClick:refreshPrices,disabled:autoRefreshing,style:{padding:'10px',background:'#1a2235',color:B,border:'1px solid '+B,borderRadius:8,fontFamily:'sans-serif',fontSize:11,fontWeight:600,cursor:'pointer',opacity:autoRefreshing?0.6:1}},autoRefreshing?'REFRESHING...':'AUTO '+refreshCountdown+'s')
        )
      ),
      trades.length===0?React.createElement('div',{style:{fontSize:12,color:'#4a6080',textAlign:'center',padding:'30px 0',lineHeight:2}},'No trades logged yet. Add a trade above to track it live. Get signals from the Scanner tab.'):
      React.createElement('div',null,
        trades.map(function(t){
          var curr=tradePrices[t.sym]||t.entry;
          var pnlPct=t.dir==='LONG'?(curr-t.entry)/t.entry*100:(t.entry-curr)/t.entry*100;
          var distToStop=t.dir==='LONG'?(curr-t.stop)/t.stop*100:(t.stop-curr)/t.stop*100;
          var distToTarget=t.dir==='LONG'?(t.target-curr)/curr*100:(curr-t.target)/curr*100;
          var atRisk=distToStop<0.8&&distToStop>=0;
          var stopHit=distToStop<0;
          var targetHit=distToTarget<=0;
          var borderColor=stopHit?R:atRisk?A:targetHit?G:'#1e2d45';
          return React.createElement('div',{key:t.id,style:{background:'#111827',border:'1px solid '+borderColor,borderRadius:12,padding:12,marginBottom:8}},
            React.createElement('div',{style:{display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:8}},
              React.createElement('div',null,
                React.createElement('div',{style:{fontSize:13,fontWeight:700,color:'#e2e8f0'}},t.sym),
                React.createElement('div',{style:{fontSize:10,color:'#4a6080',marginTop:1}},t.name&&t.name!==t.sym?t.name+(t.sector?' · '+t.sector:''):''),
                React.createElement('div',{style:{fontSize:10,color:t.dir==='LONG'?G:R}},'Entry '+t.time+' · '+t.dir)
              ),
              React.createElement('div',{style:{textAlign:'right'}},
                React.createElement('div',{style:{fontSize:16,fontWeight:700,color:pnlPct>=0?G:R}},(pnlPct>=0?'+':'')+pnlPct.toFixed(2)+'%'),
                React.createElement('div',{style:{fontSize:10,color:'#4a6080'}},'Rs '+(curr||t.entry).toFixed(1))
              )
            ),
            React.createElement('div',{style:{display:'grid',gridTemplateColumns:'1fr 1fr 1fr',gap:6,marginBottom:8}},
              [['Entry',t.entry,'#e2e8f0'],['Stop',t.stop,R],['Target',t.target,G]].map(function(x){
                return React.createElement('div',{key:x[0],style:{background:'#0d1520',borderRadius:6,padding:'6px 8px',textAlign:'center'}},
                  React.createElement('div',{style:{fontSize:9,color:'#4a6080',textTransform:'uppercase'}},x[0]),
                  React.createElement('div',{style:{fontSize:12,fontWeight:600,color:x[2]}},'Rs '+x[1])
                );
              })
            ),
            stopHit?React.createElement('div',{style:{background:'#2d0a0a',border:'1px solid #ff444455',borderRadius:6,padding:'8px 10px',fontSize:11,color:R,fontWeight:600,marginBottom:6}},'STOP LOSS HIT — Exit immediately at Rs '+t.stop):
            atRisk?React.createElement('div',{style:{background:'#2d1e00',border:'1px solid #ffb30055',borderRadius:6,padding:'8px 10px',fontSize:11,color:A,fontWeight:600,marginBottom:6}},'WARNING — Price within 0.8% of stop loss Rs '+t.stop+'. Consider exiting.'):
            targetHit?React.createElement('div',{style:{background:'#052e16',border:'1px solid #00e67655',borderRadius:6,padding:'8px 10px',fontSize:11,color:G,fontWeight:600,marginBottom:6}},'TARGET REACHED — Consider booking profits at Rs '+t.target):null,
            React.createElement('div',{style:{display:'flex',justifyContent:'space-between',fontSize:10,color:'#4a6080',marginBottom:6}},
              React.createElement('span',null,'Stop: '+(distToStop>=0?'+'+distToStop.toFixed(1)+'% away':Math.abs(distToStop).toFixed(1)+'% BELOW')),
              React.createElement('span',null,'Target: '+(distToTarget>0?distToTarget.toFixed(1)+'% away':'REACHED'))
            ),
            React.createElement('button',{onClick:function(){removeTrade(t.id);},style:{width:'100%',padding:'6px',background:'transparent',border:'1px solid #1e2d45',borderRadius:6,color:'#4a6080',fontSize:11,cursor:'pointer'}},'Remove trade')
          );
        })
      )
    ):null,
    tab==='validate'?React.createElement('div',{style:{padding:'10px 12px 20px'}},
      React.createElement('div',{style:{background:'#111827',border:'1px solid #1e2d45',borderRadius:12,padding:12,marginBottom:10}},
        React.createElement('div',{style:{fontSize:9,color:'#4a6080',textTransform:'uppercase',marginBottom:8}},'Pattern Validation Settings'),
        React.createElement('div',{style:{marginBottom:8}},
          React.createElement('div',{style:{fontSize:9,color:'#4a6080',marginBottom:4}},'Stock Universe'),
          React.createElement('select',{value:valUniverse,onChange:function(e){setValUniverse(e.target.value);},style:sel},
            React.createElement('option',{value:'top20'},'Top 20 liquid stocks (fast ~30s)'),
            React.createElement('option',{value:'nifty50'},'Full Nifty 50 (thorough ~90s)'),
            React.createElement('option',{value:'midcap'},'Nifty Midcap samples (20 stocks)')
          )
        ),
        React.createElement('div',{style:{display:'grid',gridTemplateColumns:'1fr 1fr',gap:8,marginBottom:10}},
          React.createElement('div',null,
            React.createElement('div',{style:{fontSize:9,color:'#4a6080',marginBottom:4}},'Hold Period'),
            React.createElement('select',{value:valHold,onChange:function(e){setValHold(e.target.value);},style:sel},
              React.createElement('option',{value:'5'},'5 days'),
              React.createElement('option',{value:'10'},'10 days'),
              React.createElement('option',{value:'15'},'15 days'),
              React.createElement('option',{value:'20'},'20 days')
            )
          ),
          React.createElement('div',null,
            React.createElement('div',{style:{fontSize:9,color:'#4a6080',marginBottom:4}},'Win Threshold'),
            React.createElement('select',{value:valMin,onChange:function(e){setValMin(e.target.value);},style:sel},
              React.createElement('option',{value:'3'},'Move > 3%'),
              React.createElement('option',{value:'5'},'Move > 5%'),
              React.createElement('option',{value:'7'},'Move > 7%')
            )
          )
        ),
        React.createElement('div',{style:{display:'grid',gridTemplateColumns:'1fr 1fr',gap:8,marginBottom:10}},
          React.createElement('button',{
            onClick:function(){setValMethod('pattern');},
            style:{padding:'10px',background:valMethod==='pattern'?'#ce93d8':'#1a2235',color:valMethod==='pattern'?'#000':'#ce93d8',border:'1px solid #ce93d8',borderRadius:8,fontFamily:'sans-serif',fontSize:12,fontWeight:700,cursor:'pointer'}
          },'Pattern Score'),
          React.createElement('button',{
            onClick:function(){setValMethod('momentum');},
            style:{padding:'10px',background:valMethod==='momentum'?'#4fc3f7':'#1a2235',color:valMethod==='momentum'?'#000':'#4fc3f7',border:'1px solid #4fc3f7',borderRadius:8,fontFamily:'sans-serif',fontSize:12,fontWeight:700,cursor:'pointer'}
          },'Momentum RS')
        ),
        valMethod==='momentum'?React.createElement('div',{style:{marginBottom:8}},
          React.createElement('div',{style:{fontSize:9,color:'#4a6080',marginBottom:4}},'RS Lookback Window'),
          React.createElement('select',{value:momLookback,onChange:function(e){setMomLookback(e.target.value);},style:sel},
            React.createElement('option',{value:'10'},'10 days (2 weeks)'),
            React.createElement('option',{value:'20'},'20 days (1 month)'),
            React.createElement('option',{value:'40'},'40 days (2 months)'),
            React.createElement('option',{value:'60'},'60 days (3 months)')
          )
        ):null,
        React.createElement('button',{onClick:runValidate,disabled:valLoading,
          style:{width:'100%',padding:13,background:valMethod==='momentum'?'#4fc3f7':'#ce93d8',color:'#000',border:'none',borderRadius:10,fontFamily:'sans-serif',fontSize:14,fontWeight:800,cursor:'pointer',opacity:valLoading?0.4:1}
        },valLoading?'Running on server...':valMethod==='momentum'?'TEST MOMENTUM STRATEGY':'RUN PATTERN VALIDATION')
      ),
      valErr?React.createElement('div',{style:{fontSize:11,color:R,padding:'10px 12px',background:'#2d0a0a',border:'1px solid #ff444433',borderRadius:8,marginBottom:10}},'Error: '+valErr):null,
      momResult?React.createElement('div',{style:{background:momResult.accuracy>=65?'#052e16':momResult.accuracy>=50?'#2d1e00':'#2d0a0a',border:'1px solid '+(momResult.accuracy>=65?'#00e67644':momResult.accuracy>=50?'#ffb30044':'#ff444433'),borderRadius:12,padding:14,marginBottom:10}},
        React.createElement('div',{style:{fontSize:9,color:'#8899bb',textTransform:'uppercase',letterSpacing:'0.1em',marginBottom:6}},'Momentum strategy — buy top 5 by RS, hold '+valHold+' days'),
        React.createElement('div',{style:{fontSize:34,fontWeight:800,fontFamily:'sans-serif',color:momResult.accuracy>=65?G:momResult.accuracy>=50?A:R,marginBottom:4}},momResult.accuracy+'%'),
        React.createElement('div',{style:{fontSize:11,color:'#8899bb',marginBottom:8}},momResult.wins+' wins / '+momResult.totalTrades+' trades · Avg return +'+momResult.avgReturn+'% · Avg RS spread vs bottom: +'+momResult.avgSpread+'%'),
        React.createElement('div',{style:{height:8,background:'rgba(0,0,0,0.3)',borderRadius:4,overflow:'hidden',marginBottom:10}},
          React.createElement('div',{style:{height:'100%',borderRadius:4,width:Math.min(momResult.accuracy,100)+'%',background:momResult.accuracy>=65?G:momResult.accuracy>=50?A:R,transition:'width 1s'}})
        ),
        React.createElement('div',{style:{display:'grid',gridTemplateColumns:'1fr 1fr',gap:6,marginBottom:10}},
          [['Trades',momResult.totalTrades,'#e2e8f0'],['Avg Return','+'+momResult.avgReturn+'%',momResult.avgReturn>0?G:R],['Winners',momResult.wins,G],['Losses',momResult.losses,R]].map(function(x){
            return React.createElement('div',{key:x[0],style:{background:'rgba(0,0,0,0.3)',borderRadius:6,padding:'7px 10px'}},
              React.createElement('div',{style:{fontSize:14,fontWeight:700,color:x[2]}},x[1]),
              React.createElement('div',{style:{fontSize:9,color:'#4a6080',textTransform:'uppercase',marginTop:2}},x[0])
            );
          })
        ),
        React.createElement('div',{style:{fontSize:12,fontWeight:700,padding:'8px 12px',borderRadius:6,background:'rgba(0,0,0,0.3)',color:momResult.accuracy>=65?G:momResult.accuracy>=50?A:R}},
          momResult.verdict==='BUILD'?'PROCEED — momentum strategy works, build the scanner':
          momResult.verdict==='TUNE'?'PROMISING — moderate edge, try different lookback period':
          'WEAK — momentum not working on this universe/period'
        ),
        React.createElement('div',{style:{fontSize:10,color:'#4a6080',marginTop:8,lineHeight:1.8}},momResult.note)
      ):null,
      valResult?React.createElement('div',null,
        React.createElement('div',{style:{background:valResult.composite.accuracy>=80?'#052e16':valResult.composite.accuracy>=65?'#2d1e00':'#2d0a0a',border:'1px solid '+(valResult.composite.accuracy>=80?'#00e67644':valResult.composite.accuracy>=65?'#ffb30044':'#ff444444'),borderRadius:12,padding:14,marginBottom:10}},
          React.createElement('div',{style:{fontSize:9,color:'#8899bb',textTransform:'uppercase',letterSpacing:'0.1em',marginBottom:6}},'Combined accuracy — '+valHold+' day hold, win > '+valMin+'%'),
          React.createElement('div',{style:{fontSize:34,fontWeight:800,fontFamily:'sans-serif',color:valResult.composite.accuracy>=80?G:valResult.composite.accuracy>=65?A:R,marginBottom:4}},valResult.composite.accuracy+'%'),
          React.createElement('div',{style:{fontSize:11,color:'#8899bb',marginBottom:8}},valResult.composite.wins+' wins / '+valResult.composite.hits+' signals · Avg return +'+valResult.composite.avgReturn+'%'),
          React.createElement('div',{style:{height:8,background:'rgba(0,0,0,0.3)',borderRadius:4,overflow:'hidden',marginBottom:10}},
            React.createElement('div',{style:{height:'100%',borderRadius:4,width:Math.min(valResult.composite.accuracy,100)+'%',background:valResult.composite.accuracy>=80?G:valResult.composite.accuracy>=65?A:R,transition:'width 1s'}})
          ),
          React.createElement('div',{style:{display:'grid',gridTemplateColumns:'1fr 1fr',gap:6,marginBottom:10}},
            [['Signals',valResult.composite.hits,'#e2e8f0'],['Avg Return','+'+valResult.composite.avgReturn+'%','#e2e8f0'],['Winners',valResult.composite.wins,G],['Losses',valResult.composite.losses,R]].map(function(x){
              return React.createElement('div',{key:x[0],style:{background:'rgba(0,0,0,0.3)',borderRadius:6,padding:'7px 10px'}},
                React.createElement('div',{style:{fontSize:14,fontWeight:700,color:x[2]}},x[1]),
                React.createElement('div',{style:{fontSize:9,color:'#4a6080',textTransform:'uppercase',marginTop:2}},x[0])
              );
            })
          ),
          React.createElement('div',{style:{fontSize:12,fontWeight:700,padding:'8px 12px',borderRadius:6,background:'rgba(0,0,0,0.3)',color:valResult.composite.accuracy>=80?G:valResult.composite.accuracy>=65?A:R}},
            valResult.verdict==='BUILD'?'PROCEED — accuracy above 80%, build the scanner':
            valResult.verdict==='TUNE'?'TUNE — moderate edge, adjust thresholds first':
            'REVISE — below 65%, patterns need rethinking'
          )
        ),
        React.createElement('div',{style:{background:'#111827',border:'1px solid #1e2d45',borderRadius:12,padding:14,marginBottom:10}},
          React.createElement('div',{style:{fontSize:9,color:'#4a6080',textTransform:'uppercase',letterSpacing:'0.1em',marginBottom:10}},'Individual Pattern Accuracy'),
          valResult.patterns.map(function(p){
            var pc=p.accuracy>=80?G:p.accuracy>=65?A:R;
            return React.createElement('div',{key:p.name,style:{marginBottom:12,paddingBottom:12,borderBottom:'1px solid #1a2235'}},
              React.createElement('div',{style:{display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:3}},
                React.createElement('div',{style:{fontSize:11,fontWeight:700,color:'#e2e8f0'}},p.name),
                React.createElement('div',{style:{fontSize:12,fontWeight:700,color:pc}},p.accuracy+'%')
              ),
              React.createElement('div',{style:{fontSize:10,color:'#4a6080',marginBottom:4}},p.desc),
              React.createElement('div',{style:{height:5,background:'#1a2235',borderRadius:3,overflow:'hidden',marginBottom:3}},
                React.createElement('div',{style:{height:'100%',borderRadius:3,width:Math.min(p.accuracy,100)+'%',background:pc}})
              ),
              React.createElement('div',{style:{fontSize:10,color:'#8899bb'}},p.hits+' signals · '+p.wins+' wins · avg +'+p.avgReturn+'%')
            );
          })
        ),
        React.createElement('div',{style:{fontSize:10,color:'#4a6080',lineHeight:1.8}},'Tested: '+valResult.stocksDone+' stocks · '+valHold+'d hold · Win >'+valMin+'% · Yahoo Finance NSE data')
      ):React.createElement('div',{style:{fontSize:12,color:'#4a6080',lineHeight:2,padding:'20px 0',textAlign:'center'}},'Select settings above and tap RUN PATTERN VALIDATION to test the 5 pre-breakout patterns on real historical NSE data.')
    ):null,

    React.createElement('div',{style:{fontSize:10,color:'#4a6080',padding:'6px 14px 10px',display:'flex',alignItems:'center',gap:6}},
      React.createElement('span',{style:{animation:'blink 1s step-end infinite'}},'|'),
      loading?step:scanData?'Last scan: '+scanData.scannedAt:'Ready - NSE: 09:15-15:30 IST Mon-Fri'
    )
  );
}
