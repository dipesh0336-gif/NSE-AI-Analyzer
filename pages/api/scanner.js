// FILE: pages/api/scanner.js
// Nifty 500 two-phase scanner
// Phase 1: batch quote all stocks (1 API call per 100 symbols)
// Phase 2: intraday ORB analysis for top 50 candidates

const NIFTY500 = [
  "RELIANCE.NS","TCS.NS","HDFCBANK.NS","INFY.NS","ICICIBANK.NS","HINDUNILVR.NS","ITC.NS","SBIN.NS","BHARTIARTL.NS","KOTAKBANK.NS",
  "LT.NS","ASIANPAINT.NS","AXISBANK.NS","BAJFINANCE.NS","WIPRO.NS","HCLTECH.NS","MARUTI.NS","SUNPHARMA.NS","TITAN.NS","TECHM.NS",
  "NESTLEIND.NS","ADANIPORTS.NS","POWERGRID.NS","NTPC.NS","BAJAJ-AUTO.NS","M&M.NS","ULTRACEMCO.NS","JSWSTEEL.NS","TATAMOTORS.NS","TATASTEEL.NS",
  "INDUSINDBK.NS","DIVISLAB.NS","BRITANNIA.NS","CIPLA.NS","DRREDDY.NS","EICHERMOT.NS","HEROMOTOCO.NS","GRASIM.NS","ONGC.NS","COALINDIA.NS",
  "ADANIENT.NS","HINDALCO.NS","SBILIFE.NS","HDFCLIFE.NS","BAJAJFINSV.NS","TATACONSUM.NS","APOLLOHOSP.NS","HAVELLS.NS","BPCL.NS","PIDILITIND.NS",
  "DABUR.NS","MARICO.NS","GODREJCP.NS","BIOCON.NS","MUTHOOTFIN.NS","SHREECEM.NS","AMBUJACEM.NS","ACC.NS","INDIGO.NS","BEL.NS",
  "HAL.NS","BHEL.NS","TATAPOWER.NS","TORNTPHARM.NS","LUPIN.NS","AUROPHARMA.NS","ZOMATO.NS","LICI.NS","IOC.NS","HPCL.NS",
  "GAIL.NS","IRCTC.NS","DIXON.NS","DMART.NS","NAUKRI.NS","MPHASIS.NS","LTTS.NS","PERSISTENT.NS","COFORGE.NS","CANBK.NS",
  "BANKBARODA.NS","PNB.NS","FEDERALBNK.NS","IDFCFIRSTB.NS","BANDHANBNK.NS","YESBANK.NS","CHOLAFIN.NS","PFC.NS","RECLTD.NS","DLF.NS",
  "GODREJPROP.NS","IRFC.NS","RVNL.NS","NMDC.NS","SAIL.NS","JINDALSTEL.NS","JSWENERGY.NS","SUZLON.NS","DEEPAKNTR.NS","SRF.NS",
  "UPL.NS","PIIND.NS","MRF.NS","APOLLOTYRE.NS","POLYCAB.NS","VBL.NS","TRENT.NS","PAGEIND.NS","LAURUSLABS.NS","ALKEM.NS",
  "SIEMENS.NS","ABB.NS","CUMMINSIND.NS","BHARATFORG.NS","BALKRISIND.NS","ABCAPITAL.NS","VOLTAS.NS","TORNTPOWER.NS","PRESTIGE.NS","TATAELXSI.NS",
  "KPITTECH.NS","CYIENT.NS","TVSMOTOR.NS","ESCORTS.NS","BOSCHLTD.NS","MOTHERSON.NS","CONCOR.NS","ASTRAL.NS","SUPREMEIND.NS","RATNAMANI.NS",
  "APLAPOLLO.NS","KEI.NS","CDSL.NS","CAMS.NS","MCX.NS","BSE.NS","ANGELONE.NS","MOTILALOFS.NS","IGL.NS","MGL.NS",
  "ATGL.NS","PETRONET.NS","NHPC.NS","SJVN.NS","ADANIGREEN.NS","BATAINDIA.NS","COLPAL.NS","JUBLFOOD.NS","DEVYANI.NS","TATACHEM.NS",
  "GNFC.NS","COROMANDEL.NS","VINATI.NS","NOCIL.NS","ATUL.NS","CANFINHOME.NS","AAVAS.NS","APTUS.NS","HOMEFIRST.NS","PNBHOUSING.NS",
  "HUDCO.NS","LICHSGFIN.NS","NAVINFLUOR.NS","MAXHEALTH.NS","FORTIS.NS","METROPOLIS.NS","THYROCARE.NS","OBEROIRLTY.NS","SOBHA.NS","NATIONALUM.NS",
  "MOIL.NS","HINDCOPPER.NS","GMRINFRA.NS","IRB.NS","NBCC.NS","RITES.NS","BEML.NS","BDL.NS","GRSE.NS","COCHINSHIP.NS",
  "PFIZER.NS","SANOFI.NS","GLAXO.NS","ASTRAZEN.NS","IPCALAB.NS","GRANULES.NS","WOCKPHARMA.NS","GLENMARK.NS","GODREJIND.NS","ABFRL.NS",
  "RAYMOND.NS","EMAMILTD.NS","BAJAJCON.NS","GILLETTE.NS","PGHH.NS","KRBL.NS","AVANTIFEED.NS","SKFINDIA.NS","TIMKEN.NS","ELGIEQUIP.NS",
  "KIRLOSENG.NS","GREENPANEL.NS","CENTURYPLY.NS","JKCEMENT.NS","ORIENTCEM.NS","RAMCOCEM.NS","HEIDELBERG.NS","BIRLACORPN.NS","RPOWER.NS","INOXWIND.NS",
  "SWSOLAR.NS","IEX.NS","CESC.NS","THERMAX.NS","AIAENG.NS","GRINDWELL.NS","CARBORUNIV.NS","SCHAEFFLER.NS","SUNDRMFAST.NS","ENDURANCE.NS",
  "TIINDIA.NS","MAHINDCIE.NS","BAJAJHLDNG.NS","SRTRANSFIN.NS","MANAPPURAM.NS","CREDITACC.NS","AUBANK.NS","EQUITASBNK.NS","SURYODAY.NS","UJJIVANSFB.NS",
  "SEQUENT.NS","WABCOINDIA.NS","WEBSOLTECH.NS","IEX.NS","CESC.NS","NLCINDIA.NS","IRCON.NS","PNCINFRA.NS","KNRCON.NS","GRINFRA.NS",
];

const NAMES = {
  "RELIANCE.NS":"Reliance Industries","TCS.NS":"TCS","HDFCBANK.NS":"HDFC Bank","INFY.NS":"Infosys","ICICIBANK.NS":"ICICI Bank",
  "HINDUNILVR.NS":"Hindustan Unilever","ITC.NS":"ITC","SBIN.NS":"SBI","BHARTIARTL.NS":"Bharti Airtel","KOTAKBANK.NS":"Kotak Bank",
  "LT.NS":"L&T","ASIANPAINT.NS":"Asian Paints","AXISBANK.NS":"Axis Bank","BAJFINANCE.NS":"Bajaj Finance","WIPRO.NS":"Wipro",
  "HCLTECH.NS":"HCL Technologies","MARUTI.NS":"Maruti Suzuki","SUNPHARMA.NS":"Sun Pharma","TITAN.NS":"Titan","TECHM.NS":"Tech Mahindra",
  "NESTLEIND.NS":"Nestle India","ADANIPORTS.NS":"Adani Ports","POWERGRID.NS":"Power Grid","NTPC.NS":"NTPC","BAJAJ-AUTO.NS":"Bajaj Auto",
  "M&M.NS":"Mahindra & Mahindra","ULTRACEMCO.NS":"UltraTech Cement","JSWSTEEL.NS":"JSW Steel","TATAMOTORS.NS":"Tata Motors","TATASTEEL.NS":"Tata Steel",
  "INDUSINDBK.NS":"IndusInd Bank","DIVISLAB.NS":"Divi's Labs","BRITANNIA.NS":"Britannia","CIPLA.NS":"Cipla","DRREDDY.NS":"Dr Reddy's",
  "EICHERMOT.NS":"Eicher Motors","HEROMOTOCO.NS":"Hero MotoCorp","GRASIM.NS":"Grasim","ONGC.NS":"ONGC","COALINDIA.NS":"Coal India",
  "ADANIENT.NS":"Adani Enterprises","HINDALCO.NS":"Hindalco","SBILIFE.NS":"SBI Life","HDFCLIFE.NS":"HDFC Life","BAJAJFINSV.NS":"Bajaj Finserv",
  "TATACONSUM.NS":"Tata Consumer","APOLLOHOSP.NS":"Apollo Hospitals","HAVELLS.NS":"Havells","BPCL.NS":"BPCL","PIDILITIND.NS":"Pidilite",
  "DABUR.NS":"Dabur","MARICO.NS":"Marico","GODREJCP.NS":"Godrej Consumer","BIOCON.NS":"Biocon","MUTHOOTFIN.NS":"Muthoot Finance",
  "SHREECEM.NS":"Shree Cement","AMBUJACEM.NS":"Ambuja Cements","ACC.NS":"ACC","INDIGO.NS":"IndiGo","BEL.NS":"BEL",
  "HAL.NS":"HAL","BHEL.NS":"BHEL","TATAPOWER.NS":"Tata Power","TORNTPHARM.NS":"Torrent Pharma","LUPIN.NS":"Lupin",
  "AUROPHARMA.NS":"Aurobindo Pharma","ZOMATO.NS":"Zomato","LICI.NS":"LIC","IOC.NS":"Indian Oil","HPCL.NS":"HPCL",
  "GAIL.NS":"GAIL","IRCTC.NS":"IRCTC","DIXON.NS":"Dixon Technologies","DMART.NS":"DMart","NAUKRI.NS":"Info Edge (Naukri)",
  "MPHASIS.NS":"MphasiS","LTTS.NS":"L&T Tech Services","PERSISTENT.NS":"Persistent Systems","COFORGE.NS":"Coforge","CANBK.NS":"Canara Bank",
  "BANKBARODA.NS":"Bank of Baroda","PNB.NS":"PNB","FEDERALBNK.NS":"Federal Bank","IDFCFIRSTB.NS":"IDFC First Bank","BANDHANBNK.NS":"Bandhan Bank",
  "YESBANK.NS":"Yes Bank","CHOLAFIN.NS":"Cholamandalam Finance","PFC.NS":"Power Finance Corp","RECLTD.NS":"REC Limited","DLF.NS":"DLF",
  "GODREJPROP.NS":"Godrej Properties","IRFC.NS":"IRFC","RVNL.NS":"RVNL","NMDC.NS":"NMDC","SAIL.NS":"SAIL",
  "JINDALSTEL.NS":"Jindal Steel & Power","JSWENERGY.NS":"JSW Energy","SUZLON.NS":"Suzlon Energy","DEEPAKNTR.NS":"Deepak Nitrite","SRF.NS":"SRF",
  "UPL.NS":"UPL","PIIND.NS":"PI Industries","MRF.NS":"MRF","APOLLOTYRE.NS":"Apollo Tyres","POLYCAB.NS":"Polycab India",
  "VBL.NS":"Varun Beverages","TRENT.NS":"Trent","PAGEIND.NS":"Page Industries","LAURUSLABS.NS":"Laurus Labs","ALKEM.NS":"Alkem Laboratories",
  "SIEMENS.NS":"Siemens","ABB.NS":"ABB India","CUMMINSIND.NS":"Cummins India","BHARATFORG.NS":"Bharat Forge","BALKRISIND.NS":"Balkrishna Industries",
  "ABCAPITAL.NS":"Aditya Birla Capital","VOLTAS.NS":"Voltas","TORNTPOWER.NS":"Torrent Power","PRESTIGE.NS":"Prestige Estates","TATAELXSI.NS":"Tata Elxsi",
  "KPITTECH.NS":"KPIT Technologies","CYIENT.NS":"Cyient","TVSMOTOR.NS":"TVS Motor","ESCORTS.NS":"Escorts Kubota","BOSCHLTD.NS":"Bosch",
  "MOTHERSON.NS":"Motherson Sumi","CONCOR.NS":"CONCOR","ASTRAL.NS":"Astral","SUPREMEIND.NS":"Supreme Industries","RATNAMANI.NS":"Ratnamani Metals",
  "APLAPOLLO.NS":"APL Apollo Tubes","KEI.NS":"KEI Industries","CDSL.NS":"CDSL","CAMS.NS":"CAMS","MCX.NS":"MCX",
  "BSE.NS":"BSE","ANGELONE.NS":"Angel One","MOTILALOFS.NS":"Motilal Oswal","IGL.NS":"Indraprastha Gas","MGL.NS":"Mahanagar Gas",
  "ATGL.NS":"Adani Total Gas","PETRONET.NS":"Petronet LNG","NHPC.NS":"NHPC","SJVN.NS":"SJVN","ADANIGREEN.NS":"Adani Green Energy",
  "BATAINDIA.NS":"Bata India","COLPAL.NS":"Colgate-Palmolive","JUBLFOOD.NS":"Jubilant FoodWorks","DEVYANI.NS":"Devyani International","TATACHEM.NS":"Tata Chemicals",
  "GNFC.NS":"GNFC","COROMANDEL.NS":"Coromandel International","VINATI.NS":"Vinati Organics","NOCIL.NS":"NOCIL","ATUL.NS":"Atul Ltd",
  "CANFINHOME.NS":"Can Fin Homes","AAVAS.NS":"Aavas Financiers","APTUS.NS":"Aptus Value Housing","HOMEFIRST.NS":"Home First Finance","PNBHOUSING.NS":"PNB Housing Finance",
  "HUDCO.NS":"HUDCO","LICHSGFIN.NS":"LIC Housing Finance","NAVINFLUOR.NS":"Navin Fluorine","MAXHEALTH.NS":"Max Healthcare","FORTIS.NS":"Fortis Healthcare",
  "METROPOLIS.NS":"Metropolis Healthcare","THYROCARE.NS":"Thyrocare Technologies","OBEROIRLTY.NS":"Oberoi Realty","SOBHA.NS":"Sobha Ltd",
  "NATIONALUM.NS":"National Aluminium","MOIL.NS":"MOIL","HINDCOPPER.NS":"Hindustan Copper","GMRINFRA.NS":"GMR Infrastructure","IRB.NS":"IRB Infrastructure",
  "NBCC.NS":"NBCC India","RITES.NS":"RITES","BEML.NS":"BEML","BDL.NS":"BDL","GRSE.NS":"GRSE","COCHINSHIP.NS":"Cochin Shipyard",
  "PFIZER.NS":"Pfizer India","SANOFI.NS":"Sanofi India","GLAXO.NS":"GSK Pharma","ASTRAZEN.NS":"AstraZeneca India","IPCALAB.NS":"IPCA Laboratories",
  "GRANULES.NS":"Granules India","WOCKPHARMA.NS":"Wockhardt","GLENMARK.NS":"Glenmark Pharma","GODREJIND.NS":"Godrej Industries","ABFRL.NS":"Aditya Birla Fashion",
  "RAYMOND.NS":"Raymond","EMAMILTD.NS":"Emami Ltd","BAJAJCON.NS":"Bajaj Consumer Care","GILLETTE.NS":"Gillette India","PGHH.NS":"P&G Hygiene",
  "KRBL.NS":"KRBL","AVANTIFEED.NS":"Avanti Feeds","SKFINDIA.NS":"SKF India","TIMKEN.NS":"Timken India","ELGIEQUIP.NS":"Elgi Equipments",
  "KIRLOSENG.NS":"Kirloskar Electric","GREENPANEL.NS":"Greenpanel Industries","CENTURYPLY.NS":"Century Plyboards","JKCEMENT.NS":"JK Cement",
  "ORIENTCEM.NS":"Orient Cement","RAMCOCEM.NS":"Ramco Cements","HEIDELBERG.NS":"Heidelberg Cement","BIRLACORPN.NS":"Birla Corporation",
  "RPOWER.NS":"Reliance Power","INOXWIND.NS":"Inox Wind","SWSOLAR.NS":"Sterling Wilson Solar","IEX.NS":"Indian Energy Exchange","CESC.NS":"CESC",
  "THERMAX.NS":"Thermax","AIAENG.NS":"AIA Engineering","GRINDWELL.NS":"Grindwell Norton","CARBORUNIV.NS":"Carborundum Universal",
  "SCHAEFFLER.NS":"Schaeffler India","SUNDRMFAST.NS":"Sundram Fasteners","ENDURANCE.NS":"Endurance Technologies","TIINDIA.NS":"Tube Investments",
  "MAHINDCIE.NS":"Mahindra CIE Automotive","BAJAJHLDNG.NS":"Bajaj Holdings","SRTRANSFIN.NS":"Shriram Transport Finance",
  "MANAPPURAM.NS":"Manappuram Finance","CREDITACC.NS":"Credit Access Grameen","AUBANK.NS":"AU Small Finance Bank",
  "EQUITASBNK.NS":"Equitas Small Finance Bank","SURYODAY.NS":"Suryoday Small Finance","UJJIVANSFB.NS":"Ujjivan Small Finance Bank",
  "IRCON.NS":"IRCON International","PNCINFRA.NS":"PNC Infratech","KNRCON.NS":"KNR Constructions","GRINFRA.NS":"G R Infraprojects",
};

const SECTORS = {
  "RELIANCE.NS":"Energy","TCS.NS":"IT","HDFCBANK.NS":"Banking","INFY.NS":"IT","ICICIBANK.NS":"Banking",
  "HINDUNILVR.NS":"FMCG","ITC.NS":"FMCG","SBIN.NS":"Banking","BHARTIARTL.NS":"Telecom","KOTAKBANK.NS":"Banking",
  "LT.NS":"Infra","ASIANPAINT.NS":"Paints","AXISBANK.NS":"Banking","BAJFINANCE.NS":"NBFC","WIPRO.NS":"IT",
  "HCLTECH.NS":"IT","MARUTI.NS":"Auto","SUNPHARMA.NS":"Pharma","TITAN.NS":"Jewellery","TECHM.NS":"IT",
  "ADANIPORTS.NS":"Ports","POWERGRID.NS":"Power","NTPC.NS":"Power","BAJAJ-AUTO.NS":"Auto","M&M.NS":"Auto",
  "ULTRACEMCO.NS":"Cement","JSWSTEEL.NS":"Steel","TATAMOTORS.NS":"Auto","TATASTEEL.NS":"Steel","INDUSINDBK.NS":"Banking",
  "DIVISLAB.NS":"Pharma","CIPLA.NS":"Pharma","DRREDDY.NS":"Pharma","EICHERMOT.NS":"Auto","HEROMOTOCO.NS":"Auto",
  "ONGC.NS":"Energy","COALINDIA.NS":"Mining","HINDALCO.NS":"Metals","SBILIFE.NS":"Insurance","HDFCLIFE.NS":"Insurance",
  "BAJAJFINSV.NS":"Finance","APOLLOHOSP.NS":"Healthcare","HAVELLS.NS":"Electricals","BPCL.NS":"Energy","PIDILITIND.NS":"Chemicals",
  "MARICO.NS":"FMCG","GODREJCP.NS":"FMCG","BIOCON.NS":"Pharma","MUTHOOTFIN.NS":"NBFC","INDIGO.NS":"Aviation",
  "BEL.NS":"Defence","HAL.NS":"Defence","BHEL.NS":"Engineering","TATAPOWER.NS":"Power","LUPIN.NS":"Pharma",
  "AUROPHARMA.NS":"Pharma","ZOMATO.NS":"Internet","IOC.NS":"Energy","HPCL.NS":"Energy","GAIL.NS":"Gas",
  "IRCTC.NS":"Travel","DIXON.NS":"Electronics","DMART.NS":"Retail","NAUKRI.NS":"Internet","MPHASIS.NS":"IT",
  "COFORGE.NS":"IT","CANBK.NS":"Banking","BANKBARODA.NS":"Banking","PNB.NS":"Banking","FEDERALBNK.NS":"Banking",
  "IDFCFIRSTB.NS":"Banking","YESBANK.NS":"Banking","CHOLAFIN.NS":"NBFC","PFC.NS":"Finance","RECLTD.NS":"Finance",
  "DLF.NS":"Real Estate","GODREJPROP.NS":"Real Estate","IRFC.NS":"Finance","RVNL.NS":"Infra","NMDC.NS":"Mining",
  "SAIL.NS":"Steel","JINDALSTEL.NS":"Steel","JSWENERGY.NS":"Power","SUZLON.NS":"Renewables","DEEPAKNTR.NS":"Chemicals",
  "SRF.NS":"Chemicals","UPL.NS":"Agrochemicals","MRF.NS":"Tyres","APOLLOTYRE.NS":"Tyres","POLYCAB.NS":"Cables",
  "VBL.NS":"Beverages","TRENT.NS":"Retail","ALKEM.NS":"Pharma","SIEMENS.NS":"Engineering","ABB.NS":"Engineering",
  "CUMMINSIND.NS":"Engineering","BHARATFORG.NS":"Auto Ancillary","VOLTAS.NS":"Electricals","TATAELXSI.NS":"IT",
  "KPITTECH.NS":"IT","TVSMOTOR.NS":"Auto","ESCORTS.NS":"Auto","CONCOR.NS":"Logistics","ASTRAL.NS":"Pipes",
  "APLAPOLLO.NS":"Steel","KEI.NS":"Cables","CDSL.NS":"Finance","MCX.NS":"Finance","IGL.NS":"Gas","MGL.NS":"Gas",
  "PETRONET.NS":"Gas","NHPC.NS":"Power","ADANIGREEN.NS":"Renewables","BATAINDIA.NS":"Retail","COLPAL.NS":"FMCG",
  "JUBLFOOD.NS":"QSR","TATACHEM.NS":"Chemicals","COROMANDEL.NS":"Agrochemicals","VINATI.NS":"Chemicals",
  "THERMAX.NS":"Engineering","IEX.NS":"Finance","CESC.NS":"Power",
};

const NIFTY50 = new Set([
  "RELIANCE.NS","TCS.NS","HDFCBANK.NS","INFY.NS","ICICIBANK.NS","HINDUNILVR.NS","ITC.NS","SBIN.NS","BHARTIARTL.NS","KOTAKBANK.NS",
  "LT.NS","ASIANPAINT.NS","AXISBANK.NS","BAJFINANCE.NS","WIPRO.NS","HCLTECH.NS","MARUTI.NS","SUNPHARMA.NS","TITAN.NS","TECHM.NS",
  "NESTLEIND.NS","ADANIPORTS.NS","POWERGRID.NS","NTPC.NS","BAJAJ-AUTO.NS","M&M.NS","ULTRACEMCO.NS","JSWSTEEL.NS","TATAMOTORS.NS","TATASTEEL.NS",
  "INDUSINDBK.NS","DIVISLAB.NS","BRITANNIA.NS","CIPLA.NS","DRREDDY.NS","EICHERMOT.NS","HEROMOTOCO.NS","GRASIM.NS","ONGC.NS","COALINDIA.NS",
  "ADANIENT.NS","HINDALCO.NS","SBILIFE.NS","HDFCLIFE.NS","BAJAJFINSV.NS","TATACONSUM.NS","APOLLOHOSP.NS","HAVELLS.NS","BPCL.NS",
]);

const HDRS = {
  'User-Agent':'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
  'Accept':'application/json','Referer':'https://finance.yahoo.com',
};

async function fetchQuote(sym) {
  // Use v8/chart endpoint (same as Analyze Stock - confirmed working)
  try {
    const r = await fetch(
      'https://query1.finance.yahoo.com/v8/finance/chart/' + encodeURIComponent(sym) + '?interval=1d&range=5d',
      { headers: HDRS }
    );
    if (!r.ok) return null;
    const j = await r.json();
    const res = j?.chart?.result?.[0];
    if (!res) return null;
    const q = res.indicators.quote[0];
    const meta = res.meta;
    const n = q.close.length - 1;
    // Get valid last close
    let lastClose = null, prevClose = null;
    for (let i = n; i >= 0; i--) { if (q.close[i] != null) { lastClose = q.close[i]; break; } }
    for (let i = n-1; i >= 0; i--) { if (q.close[i] != null) { prevClose = q.close[i]; break; } }
    if (!lastClose) return null;
    prevClose = prevClose || lastClose;
    const price = meta.regularMarketPrice || lastClose;
    const open = q.open[n] || price;
    const dayHigh = q.high[n] || price;
    const dayLow = q.low[n] || price;
    const volume = q.volume[n] || 0;
    // Avg volume from last 10 days
    const vols = q.volume.filter(v => v != null && v > 0);
    const avgVolume = vols.length > 0 ? vols.reduce((a,b)=>a+b,0)/vols.length : 100000;
    const changePct = prevClose > 0 ? (price - prevClose)/prevClose*100 : 0;
    return { price, prevClose, dayHigh, dayLow, volume, avgVolume, changePct, change: price-prevClose, open };
  } catch(e) { return null; }
}

async function batchQuotes(syms) {
  const out = {};
  // Fetch in parallel batches of 8 using the working v8/chart endpoint
  const batchSize = 8;
  for (let i = 0; i < syms.length; i += batchSize) {
    const batch = syms.slice(i, i + batchSize);
    const results = await Promise.all(batch.map(s => fetchQuote(s)));
    batch.forEach((sym, idx) => {
      if (results[idx]) out[sym] = results[idx];
    });
    if (i + batchSize < syms.length) await new Promise(r => setTimeout(r, 100));
  }
  return out;
  // placeholder closing brace below
}


async function intraday15m(sym) {
  try {
    const r = await fetch('https://query1.finance.yahoo.com/v8/finance/chart/'+encodeURIComponent(sym)+'?interval=15m&range=1d', { headers: HDRS });
    if (!r.ok) return null;
    const j = await r.json();
    const res = j?.chart?.result?.[0];
    if (!res) return null;
    const ts = res.timestamps || res.timestamp;
    const q = res.indicators.quote[0];
    const vi = ts.map((_,i)=>i).filter(i=>q.close[i]!=null&&q.open[i]!=null&&q.high[i]!=null&&q.low[i]!=null);
    if (vi.length < 3) return null;
    return {
      ts: vi.map(i=>ts[i]), opens: vi.map(i=>q.open[i]), highs: vi.map(i=>q.high[i]),
      lows: vi.map(i=>q.low[i]), closes: vi.map(i=>q.close[i]), volumes: vi.map(i=>q.volume[i]||0),
    };
  } catch(e) { return null; }
}

function vwap(d) {
  let ct=0,cv=0;
  for(let i=0;i<d.closes.length;i++){const tp=(d.highs[i]+d.lows[i]+d.closes[i])/3;ct+=tp*d.volumes[i];cv+=d.volumes[i];}
  return cv>0?ct/cv:d.closes[d.closes.length-1];
}

function phase1Score(sym, q) {
  if (!q.price || q.price <= 0) return -1;
  const vr = q.volume / (q.avgVolume || 1);
  const dayRange = (q.dayHigh - q.dayLow) / q.prevClose * 100;
  if (dayRange < 0.2 || vr < 0.3) return -1; // filter flat/illiquid
  let s = 0;
  if (vr >= 3) s += 35; else if (vr >= 2) s += 25; else if (vr >= 1.5) s += 15; else if (vr >= 1.2) s += 8;
  if (Math.abs(q.changePct) > 2.5) s += 20; else if (Math.abs(q.changePct) > 1.5) s += 14; else if (Math.abs(q.changePct) > 0.8) s += 8;
  const gap = (q.open - q.prevClose) / q.prevClose * 100;
  if (Math.abs(gap) > 1.5) s += 15; else if (Math.abs(gap) > 0.7) s += 8;
  if (dayRange > 2.5) s += 12; else if (dayRange > 1.5) s += 7;
  if (NIFTY50.has(sym)) s += 8;
  if (q.price > q.prevClose * 1.008) s += 10; else if (q.price < q.prevClose * 0.992) s += 10;
  return s;
}

function analyzeORB(sym, q, d, niftyTrend, niftyChangeVal) {
  const vr = q.volume / (q.avgVolume || 1);
  let orH, orL, orConfirmed = false, breakDir = null, breakBar = null, vwapVal = null;
  let entry, stop, target;

  if (d && d.closes.length >= 3) {
    const orN = Math.min(2, d.closes.length - 1);
    orH = Math.max(...d.highs.slice(0, orN));
    orL = Math.min(...d.lows.slice(0, orN));
    vwapVal = vwap(d);
    const avgV = d.volumes.slice(0, Math.min(8, d.volumes.length)).reduce((a,b)=>a+b,0) / Math.min(8, d.volumes.length);

    for (let i = orN; i < d.closes.length; i++) {
      if (d.closes[i] > orH && d.volumes[i] > avgV * 1.1) {
        breakDir = 'LONG'; breakBar = i;
        orConfirmed = true; break;
      }
      if (d.closes[i] < orL && d.volumes[i] > avgV * 1.1) {
        breakDir = 'SHORT'; breakBar = i;
        orConfirmed = true; break;
      }
    }
  }

  let direction = 'NEUTRAL', conviction = 0, reasons = [];

  // FILTER 1: Market regime — suppress LONG if Nifty bearish
  const niftyChangePct = niftyChangeVal || 0;
  if (orConfirmed && breakDir === 'LONG' && q.price > q.prevClose && niftyChangePct > -0.3) {
    direction = 'LONG';
    const bvRatio = d.volumes[breakBar] / (d.volumes.slice(0,breakBar).reduce((a,b)=>a+b,0)/Math.max(1,breakBar));
    conviction = 45;

    // FILTER 2: Strong bar confirmation — breakout bar must close in top 40% of its range
    const bBar = breakBar || (d.closes.length - 1);
    const barRange = d.highs[bBar] - d.lows[bBar];
    const barClose = d.closes[bBar];
    const barLow = d.lows[bBar];
    const closeStrength = barRange > 0 ? (barClose - barLow) / barRange : 0.5;
    if (closeStrength >= 0.6) { conviction += 15; reasons.push('Strong breakout bar — closed in top ' + Math.round((1-closeStrength)*100) + '% of range'); }
    else if (closeStrength < 0.4) { conviction -= 10; reasons.push('Weak bar close — potential bull trap'); }

    if (bvRatio > 2) { conviction += 20; reasons.push('Strong volume ' + bvRatio.toFixed(1) + 'x on ORB breakout'); }
    else { conviction += 10; reasons.push('Volume confirmed ORB breakout above Rs ' + orH.toFixed(1)); }
    if (q.price > q.prevClose * 1.005) { conviction += 15; reasons.push('Above PDH Rs ' + (q.prevClose).toFixed(1) + ' - prior session bias bullish'); }
    if (vwapVal && q.price > vwapVal) { conviction += 10; reasons.push('Price above VWAP Rs ' + vwapVal.toFixed(1)); }
    if (niftyTrend === 'BULLISH') { conviction += 10; reasons.push('Nifty BULLISH — market tailwind'); }
    else if (niftyChangePct < -0.1) { conviction -= 5; reasons.push('Nifty slightly weak — reduce size'); }
    if (vr > 2) { conviction += 5; reasons.push('Day volume ' + vr.toFixed(1) + 'x avg'); }

    // FILTER 3: Time filter — signals after 1:30pm IST have lower follow-through
    const istHour = new Date().toLocaleString('en-IN',{timeZone:'Asia/Kolkata',hour:'numeric',hour12:false});
    const hour = parseInt(istHour);
    if (hour >= 13) { conviction -= 15; reasons.push('Late signal (after 1:30pm) — lower follow-through'); }

    entry = parseFloat(q.price.toFixed(2));
    stop = parseFloat(orL.toFixed(2));
    target = parseFloat((q.price + (q.price - orL) * 2).toFixed(2));
  } else if (orConfirmed && breakDir === 'SHORT' && q.price < q.prevClose && niftyChangePct < 0.3) {
    direction = 'SHORT';
    const bvRatioS = d.volumes[breakBar] / (d.volumes.slice(0,breakBar).reduce((a,b)=>a+b,0)/Math.max(1,breakBar));
    conviction = 45;

    // Strong bar for SHORT — close in bottom 40% of range
    const bBarS = breakBar || (d.closes.length - 1);
    const barRangeS = d.highs[bBarS] - d.lows[bBarS];
    const closeStrengthS = barRangeS > 0 ? (d.closes[bBarS] - d.lows[bBarS]) / barRangeS : 0.5;
    if (closeStrengthS <= 0.4) { conviction += 15; reasons.push('Strong breakdown bar — closed in bottom ' + Math.round(closeStrengthS*100) + '% of range'); }
    else if (closeStrengthS > 0.6) { conviction -= 10; reasons.push('Weak bar close — potential bear trap'); }

    if (bvRatioS > 2) { conviction += 20; reasons.push('Strong volume ' + bvRatioS.toFixed(1) + 'x on breakdown'); }
    else { conviction += 10; reasons.push('Volume confirmed breakdown below Rs ' + orL.toFixed(1)); }
    if (q.price < q.prevClose * 0.995) { conviction += 15; reasons.push('Below PDL — prior session bias bearish'); }
    if (vwapVal && q.price < vwapVal) { conviction += 10; reasons.push('Price below VWAP Rs ' + vwapVal.toFixed(1)); }
    if (niftyTrend === 'BEARISH') { conviction += 10; reasons.push('Nifty BEARISH — market tailwind for short'); }
    else if (niftyChangePct > 0.1) { conviction -= 5; reasons.push('Nifty slightly strong — cover quickly'); }
    if (vr > 2) { conviction += 5; reasons.push('Day volume ' + vr.toFixed(1) + 'x avg'); }

    const istHourS = new Date().toLocaleString('en-IN',{timeZone:'Asia/Kolkata',hour:'numeric',hour12:false});
    if (parseInt(istHourS) >= 13) { conviction -= 15; reasons.push('Late signal (after 1:30pm) — lower follow-through'); }

    entry = parseFloat(q.price.toFixed(2));
    stop = parseFloat(orH.toFixed(2));
    target = parseFloat((q.price - (orH - q.price) * 2).toFixed(2));
  } else if (!orConfirmed) {
    // Setup forming - not yet broken out
    const abovePDC = q.price > q.prevClose;
    const strongVol = vr > 1.5;
    const strongMove = Math.abs(q.changePct) > 0.8;
    if (abovePDC && strongVol && strongMove && q.changePct > 0) {
      direction = 'WATCH_LONG';
      conviction = Math.min(40, Math.round(vr * 8 + q.changePct * 4));
      reasons.push('Building bullish setup - Rs ' + q.price.toFixed(1) + ' up ' + q.changePct.toFixed(2) + '%');
      reasons.push('Volume ' + vr.toFixed(1) + 'x avg - accumulation in progress');
      if (orH) reasons.push('Watch: break above Rs ' + orH.toFixed(1) + ' with volume for LONG entry');
    } else if (!abovePDC && strongVol && strongMove && q.changePct < 0) {
      direction = 'WATCH_SHORT';
      conviction = Math.min(40, Math.round(vr * 8 + Math.abs(q.changePct) * 4));
      reasons.push('Building bearish setup - Rs ' + q.price.toFixed(1) + ' down ' + q.changePct.toFixed(2) + '%');
      reasons.push('Volume ' + vr.toFixed(1) + 'x avg - distribution in progress');
      if (orL) reasons.push('Watch: break below Rs ' + orL.toFixed(1) + ' with volume for SHORT entry');
    }
  }

  if (direction === 'NEUTRAL') {
    // Still return WATCH if price is making a meaningful move
    const pctMove = Math.abs(q.changePct || 0);
    if (pctMove > 0.4 && orH && orL) {
      conviction = Math.min(30, Math.round(pctMove * 10));
      reasons.push('Price moved ' + pctMove.toFixed(2) + '% - watch for ORB at Rs ' + (q.changePct > 0 ? orH.toFixed(1) : orL.toFixed(1)));
    } else {
      return null;
    }
  }

  const rrRatio = entry && stop && target ? Math.abs((target - entry) / (entry - stop)) : null;

  return {
    symbol: sym.replace('.NS',''),
    name: NAMES[sym] || sym.replace('.NS',''),
    sector: SECTORS[sym] || 'Other',
    direction,
    conviction: Math.min(conviction, 100),
    price: parseFloat(q.price.toFixed(2)),
    change: parseFloat(q.changePct.toFixed(2)),
    entry, stop, target,
    pdc: parseFloat(q.prevClose.toFixed(2)),
    orHigh: orH ? parseFloat(orH.toFixed(2)) : null,
    orLow: orL ? parseFloat(orL.toFixed(2)) : null,
    vwap: vwapVal ? parseFloat(vwapVal.toFixed(2)) : null,
    volRatio: parseFloat(vr.toFixed(1)),
    rr: rrRatio ? parseFloat(rrRatio.toFixed(1)) : null,
    reasons: reasons.slice(0, 3),
    isNifty50: NIFTY50.has(sym),
  };
}

async function handleWatchlist(req, res) {
  try {
  const rawSyms = decodeURIComponent(req.query.symbols || '');
  const syms = rawSyms.split(',').map(s => s.trim().toUpperCase().replace(/\.NS$/, '')).filter(s => s.length >= 2);
  const isMarketHours = (() => {
    const ist = new Date(new Date().toLocaleString('en-US', {timeZone:'Asia/Kolkata'}));
    const m = ist.getHours()*60+ist.getMinutes(), d = ist.getDay();
    return d>=1&&d<=5&&m>=555&&m<930;
  })();

  // Fetch Nifty trend using fetchQuote (same as main scanner)
  let niftyTrend = 'NEUTRAL', niftyChange = 0;
  try {
    const nQ = await fetchQuote('^NSEI');
    if (nQ && nQ.changePct !== undefined) {
      niftyChange = parseFloat(nQ.changePct.toFixed(2));
      if (nQ.changePct > 0.35) niftyTrend = 'BULLISH';
      else if (nQ.changePct < -0.35) niftyTrend = 'BEARISH';
    }
  } catch(e) {}

  // Phase 1: fetch quotes for watchlist stocks
  const quotes = {};
  await Promise.all(syms.map(async function(sym) {
    const q = await fetchQuote(sym+'.NS');
    if (q) quotes[sym+'.NS'] = q;
  }));

  // Phase 2: fetch intraday for all
  const results = [];
  await Promise.all(syms.map(async function(sym) {
    const nseSym = sym+'.NS';
    const q = quotes[nseSym];
    if (!q) return;
    const d = await intraday15m(nseSym);
    if (!d) return;
    const setup = analyzeORB(nseSym, q, d, niftyTrend.trend, niftyChange);
    if (setup) {
      // CONTRARIAN LOGIC: if scanner says SHORT but stock has AD accumulation
      // (it's on our watchlist) → flip to CONTRARIAN_LONG
      if (setup.direction === 'SHORT') {
        const risk = setup.stop - setup.entry; // for short, stop > entry
        const target = parseFloat((setup.entry - risk * 2).toFixed(2));
        results.push({
          ...setup,
          direction: 'CONTRARIAN_LONG',
          conviction: Math.min(85, setup.conviction - 10),
          entry: setup.entry,
          stop: parseFloat((setup.entry * 0.985).toFixed(2)), // 1.5% stop below entry
          target: parseFloat((setup.entry * 1.03).toFixed(2)), // 3% target
          rr: 2,
          isWatchlist: true,
          reasons: [
            'AD accumulation confirmed on tradingpartner.online',
            'ORB showing SHORT — but AD divergence suggests institutional buying',
            'Contrarian LONG: price weakness = better entry for the AD play',
            ...setup.reasons.slice(0,1)
          ],
        });
      } else {
        results.push({...setup, isWatchlist: true});
      }
    }
    else {
      // Always include watchlist stocks even if no ORB signal yet
      results.push({
        symbol: sym,
        name: sym,
        sector: 'Watchlist',
        direction: 'WATCH',
        conviction: 20,
        price: q.price,
        change: parseFloat((q.changePct||0).toFixed(2)),
        entry: null, stop: null, target: null, rr: null,
        reasons: ['No ORB breakout yet — price inside opening range. Monitor for breakout above OR High.'],
        isNifty50: false,
        isWatchlist: true,
      });
    }
  }));

  results.sort((a,b) => {
    const ac = (a.direction==='LONG'||a.direction==='SHORT')?1:0;
    const bc = (b.direction==='LONG'||b.direction==='SHORT')?1:0;
    if(ac!==bc) return bc-ac;
    return b.conviction-a.conviction;
  });

  res.status(200).json({
    scannedAt: new Date().toLocaleString('en-IN',{timeZone:'Asia/Kolkata'}),
    isMarketHours, niftyTrend, niftyChange,
    totalScanned: syms.length,
    phase2Count: results.length,
    results,
  });
  } catch(err) {
    res.status(500).json({ error: 'Watchlist scan failed: ' + err.message });
  }
}


export default async function handler(req, res) {
  // Watchlist mode: scan specific symbols only
  if (req.query.mode === 'watchlist' && req.query.symbols) {
    return handleWatchlist(req, res);
  }
  const ist = new Date(new Date().toLocaleString('en-US', { timeZone: 'Asia/Kolkata' }));
  const m = ist.getHours() * 60 + ist.getMinutes();
  const isMarketHours = ist.getDay() >= 1 && ist.getDay() <= 5 && m >= 555 && m <= 930;

  try {
    // PHASE 1 — batch quotes for all Nifty500 symbols
    const quotes = await batchQuotes(NIFTY500);
    const scanned = Object.keys(quotes).length;

    // Get Nifty 50 trend
    let niftyTrend = 'NEUTRAL', niftyChange = '0.00';
    const nQ = quotes['^NSEI'] || quotes['NIFTY.NS'];
    if (nQ) {
      niftyChange = nQ.changePct.toFixed(2);
      if (nQ.changePct > 0.35) niftyTrend = 'BULLISH';
      else if (nQ.changePct < -0.35) niftyTrend = 'BEARISH';
    }

    // Score and filter top candidates
    const candidates = NIFTY500
      .filter(s => quotes[s])
      .map(s => ({ s, score: phase1Score(s, quotes[s]) }))
      .filter(x => x.score >= 20)
      .sort((a, b) => b.score - a.score)
      .slice(0, 50);

    // PHASE 2 — intraday data for top 50
    const results = [];
    const bSize = 8;
    for (let i = 0; i < candidates.length; i += bSize) {
      const batch = candidates.slice(i, i + bSize);
      const intradayArr = await Promise.all(batch.map(({ s }) => intraday15m(s)));
      batch.forEach(({ s }, idx) => {
        const setup = analyzeORB(s, quotes[s], intradayArr[idx], niftyTrend);
        if (setup) results.push(setup);
      });
      if (i + bSize < candidates.length) await new Promise(r => setTimeout(r, 350));
    }

    // Sort: confirmed signals first, then WATCH, sorted by conviction
    results.sort((a, b) => {
      const aConf = (a.direction === 'LONG' || a.direction === 'SHORT') ? 1 : 0;
      const bConf = (b.direction === 'LONG' || b.direction === 'SHORT') ? 1 : 0;
      if (aConf !== bConf) return bConf - aConf;
      return b.conviction - a.conviction;
    });

    res.status(200).json({
      scannedAt: new Date().toLocaleString('en-IN', { timeZone: 'Asia/Kolkata' }),
      isMarketHours,
      niftyTrend,
      niftyChange,
      totalScanned: scanned,
      phase2Count: candidates.length,
      results: results.slice(0, 12),
    });

  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}
