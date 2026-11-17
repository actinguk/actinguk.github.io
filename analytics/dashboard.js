export const LOGIN = `<!doctype html>
<html lang="en-GB"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1">
<meta name="robots" content="noindex,nofollow"><title>Private statistics | Acting UK</title><link rel="stylesheet" href="/app.css"></head>
<body class="login-body"><main class="login-panel"><p class="eyebrow">ACTING UK / OWNER ACCESS</p><h1>Site statistics</h1>
<p>Private visitor analytics. Enter your password to continue.</p><form method="post" action="/login">
<label for="password">Password</label><input id="password" type="password" name="password" required autocomplete="current-password" autofocus maxlength="512">
<button type="submit">Unlock dashboard</button></form><p class="muted">Access is protected by a server-side password and an expiring secure session.</p></main></body></html>`;
export const DASHBOARD = `<!doctype html>
<html lang="en-GB"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1">
<meta name="robots" content="noindex,nofollow"><title>Analytics | Acting UK</title><link rel="stylesheet" href="/app.css"></head>
<body><header class="mast"><div><span class="eyebrow">ACTING UK / PRIVATE ANALYTICS</span><h1>Statistics</h1></div>
<form method="post" action="/logout"><button class="quiet" type="submit">Sign out</button></form></header>
<main class="container"><section class="toolbar"><p class="muted">Visitor statistics collected after activation. No persistent visitor cookies.</p>
<label class="period-label" for="period">Period <select id="period"><option value="7">Last 7 days</option><option value="30" selected>Last 30 days</option><option value="90">Last 90 days</option></select></label></section>
<p id="status" role="status" class="status">Loading statistics…</p>
<section class="metrics" aria-label="Summary">
<div class="metric"><span>Page views</span><strong id="views">—</strong></div>
<div class="metric"><span>Estimated visitor-days</span><strong id="visitors">—</strong></div>
<div class="metric"><span>Headshot website clicks</span><strong id="headshots">—</strong></div>
<div class="metric"><span>Audio plays</span><strong id="audio">—</strong></div></section>
<section class="panel"><div class="heading"><h2>Page views over time</h2><small id="range"></small></div><div id="trend" class="trend" aria-label="Daily page view chart"></div></section>
<div class="twocol"><section class="panel"><h2>Popular pages</h2><table><thead><tr><th>Page</th><th>Views</th></tr></thead><tbody id="pages"></tbody></table></section>
<section class="panel"><h2>Traffic sources</h2><table><thead><tr><th>Source</th><th>Views</th></tr></thead><tbody id="referrers"></tbody></table></section></div>
<div class="twocol"><section class="panel"><h2>Countries</h2><table><thead><tr><th>Country code</th><th>Views</th></tr></thead><tbody id="countries"></tbody></table></section>
<section class="panel"><h2>Devices</h2><table><thead><tr><th>Device</th><th>Views</th></tr></thead><tbody id="devices"></tbody></table></section></div>
<div class="twocol"><section class="panel"><h2>Interactions</h2><table><thead><tr><th>Action</th><th>Count</th></tr></thead><tbody id="actions"></tbody></table></section>
<section class="panel"><h2>On-site directory searches</h2><table><thead><tr><th>Term</th><th>Searches</th></tr></thead><tbody id="searches"></tbody></table></section></div>
<section class="panel"><div class="heading"><h2>Google search keywords</h2><a href="https://search.google.com/search-console/performance/search-analytics" target="_blank" rel="noopener noreferrer">Open Search Console</a></div>
<p class="muted">Google hides some search queries. This section shows only real queries from your most recently imported Search Console Queries CSV, not inferred keywords.</p>
<div class="import"><label for="csv">Import Search Console Queries CSV</label><input type="file" id="csv" accept=".csv,text/csv"><button type="button" id="import">Import</button><span id="import-status" role="status"></span></div>
<div class="table-scroll"><table><thead><tr><th>Search query</th><th>Clicks</th><th>Impressions</th><th>CTR</th><th>Position</th></tr></thead><tbody id="keywords"></tbody></table></div></section>
<footer class="foot">Data begins when the collector is activated. Visitor-days count anonymous daily estimates, not identifiable people; totals exclude blocked scripts and browsers respecting tracking opt-outs. Historical events older than ninety days are deleted.</footer>
</main><script src="/app.js" defer></script></body></html>`;
export const STYLES = `:root{color-scheme:light;font-family:system-ui,-apple-system,BlinkMacSystemFont,"Segoe UI",sans-serif;background:#f6f3ee;color:#242a29}*{box-sizing:border-box}
body{margin:0;line-height:1.5}h1,h2,p{margin-top:0}h1{font-family:Georgia,serif;font-size:clamp(2rem,4vw,3.5rem);font-weight:500;letter-spacing:-.045em;margin-bottom:0}h2{font-family:Georgia,serif;font-size:1.35rem;font-weight:500;letter-spacing:-.02em}
.eyebrow{font-size:.67rem;letter-spacing:.18em;font-weight:700;color:#94612b}.muted,.foot,.status{font-size:.88rem;color:#66706f}
.mast{display:flex;justify-content:space-between;align-items:center;padding:24px max(20px,calc((100vw - 1200px)/2));background:#26312b;color:#f5efe5;gap:18px}.mast h1{font-size:2.2rem;margin:7px 0 0}
.container{max-width:1248px;margin:0 auto;padding:34px 24px 80px}.toolbar{display:flex;justify-content:space-between;align-items:center;gap:14px;flex-wrap:wrap}
select,input,button{font:inherit;border-radius:4px}select,input[type=password],input[type=file]{padding:10px;border:1px solid #aab1ae;background:white;color:#242a29}
button{padding:10px 16px;border:0;background:#26312b;color:white;cursor:pointer}button:hover{background:#414f44}button.quiet{background:transparent;border:1px solid #b9c0b8;color:#f5efe5}.period-label{display:flex;align-items:center;gap:10px;font-weight:600;font-size:.86rem}
.metrics{display:grid;grid-template-columns:repeat(4,minmax(0,1fr));gap:15px;margin:22px 0}.metric,.panel{border:1px solid #e6e4df;background:#fff;border-radius:6px}
.metric{padding:22px}.metric span{display:block;color:#66706f;font-size:.79rem;margin-bottom:12px}.metric strong{font-size:clamp(1.55rem,2.6vw,2.3rem);font-weight:600;font-variant-numeric:tabular-nums}
.panel{padding:24px;margin-bottom:16px;min-width:0}.heading{display:flex;justify-content:space-between;align-items:baseline;gap:12px}.heading a{color:#406154;font-size:.8rem}.twocol{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:16px}
table{width:100%;border-collapse:collapse;text-align:left;font-size:.83rem}th,td{padding:9px 4px;border-bottom:1px solid #edf0ed;overflow-wrap:anywhere}
th{color:#64716b;font-size:.75rem;font-weight:600}td:last-child,th:last-child{text-align:right;font-variant-numeric:tabular-nums}td:first-child{max-width:280px}tr:last-child td{border:0}.table-scroll{overflow-x:auto}
.trend{display:flex;align-items:end;gap:5px;min-height:182px;border-bottom:1px solid #e5e5df;padding:5px 0 0}.barwrap{display:flex;flex:1;flex-direction:column;justify-content:end;align-items:center;height:176px;gap:2px;min-width:2px}.bar{width:100%;min-height:2px;background:#789489;border-radius:2px 2px 0 0}.barwrap:hover .bar{background:#b88953}
.import{display:flex;align-items:center;flex-wrap:wrap;gap:12px;margin:18px 0 20px;font-size:.82rem}.import input{max-width:100%}
.foot{border-top:1px solid #dfded7;padding-top:22px;margin-top:16px}.login-body{display:grid;place-items:center;min-height:100vh;padding:24px;background:#26312b}
.login-panel{max-width:440px;width:100%;padding:42px;background:#f9f8f4;border-radius:6px;box-shadow:0 25px 90px #151b17aa}.login-panel h1{margin:10px 0 18px}
.login-panel label{display:block;font-size:.87rem;font-weight:600;margin-bottom:8px}.login-panel input,.login-panel button{width:100%;margin-bottom:14px}.login-panel .muted{margin-top:14px}
@media(max-width:750px){.metrics,.twocol{grid-template-columns:repeat(2,minmax(0,1fr))}.panel{padding:17px}.mast{padding:20px}}
@media(max-width:460px){.metrics,.twocol{grid-template-columns:1fr}.container{padding:24px 14px 60px}.metric{padding:16px}.mast h1{font-size:1.7rem}}`;
export const CLIENT = `(() => {
"use strict";
const id=(x)=>document.getElementById(x);
const fmt=(value)=>Number(value||0).toLocaleString("en-GB");
const status=id("status");
function table(name,items,columns) {
  const target=id(name);target.replaceChildren();
  if(!items.length){const tr=document.createElement("tr"),td=document.createElement("td");td.colSpan=columns.length;td.textContent="No data yet";tr.append(td);target.append(tr);return;}
  for(const item of items){const tr=document.createElement("tr");for(const fn of columns){const td=document.createElement("td");td.textContent=fn(item);tr.append(td);}target.append(tr);}
}
function trend(rows,days){
  const target=id("trend");target.replaceChildren();
  const lookup=new Map(rows.map(r=>[r.label,Number(r.value)]));
  const now=new Date();
  const filled=[];
  for(let i=days-1;i>=0;i--){const day=new Date(now.getTime()-i*86400000).toISOString().slice(0,10);filled.push({day,value:lookup.get(day)||0});}
  const max=Math.max(1,...filled.map(x=>x.value));
  for(const x of filled){const wrap=document.createElement("div");wrap.className="barwrap";wrap.title=x.day+": "+fmt(x.value)+" views";
    const bar=document.createElement("div");bar.className="bar";bar.style.height=Math.max(2,100*x.value/max)+"%";wrap.append(bar);target.append(wrap);}
}
async function load(){
 status.textContent="Loading statistics…";
 try{
   const response=await fetch("/api/stats?days="+encodeURIComponent(id("period").value),{credentials:"same-origin",cache:"no-store"});
   if(response.status===401){location.reload();return;}if(!response.ok)throw Error("Server returned "+response.status);
   const data=await response.json();
   id("views").textContent=fmt(data.overview.views);
   id("visitors").textContent=fmt(data.overview.visitor_days);
   id("range").textContent="Since "+data.since;
   const find=(key)=>Number((data.actions.find(x=>x.label===key)||{}).value||0);
   id("headshots").textContent=fmt(find("headshot_click"));id("audio").textContent=fmt(find("audio_play"));
   trend(data.daily,data.days);
   table("pages",data.pages,[x=>x.label,x=>fmt(x.value)]);
   table("referrers",data.referrers,[x=>x.label,x=>fmt(x.value)]);
   table("countries",data.countries,[x=>x.label,x=>fmt(x.value)]);
   table("devices",data.devices,[x=>x.label,x=>fmt(x.value)]);
   table("actions",data.actions,[x=>x.label.replaceAll("_"," "),x=>fmt(x.value)]);
   table("searches",data.searches,[x=>x.label,x=>fmt(x.value)]);
   table("keywords",data.terms,[x=>x.label,x=>fmt(x.clicks),x=>fmt(x.impressions),x=>(Number(x.ctr)*100).toFixed(1)+"%",x=>Number(x.position).toFixed(1)]);
   status.textContent="Showing stored statistics. Search Console data is imported separately.";
 }catch(e){status.textContent="Unable to load statistics: "+e.message;}
}
id("period").addEventListener("change",load);
id("import").addEventListener("click",async()=>{
 const file=id("csv").files[0],notice=id("import-status");if(!file){notice.textContent="Choose a CSV first";return;}
 if(file.size>200000){notice.textContent="CSV must be below 200 KB";return;}
 notice.textContent="Importing…";
 try{
  const result=await fetch("/api/import",{method:"POST",credentials:"same-origin",headers:{"Content-Type":"text/csv"},body:await file.text()});
  const output=await result.json();if(!result.ok)throw Error(output.error||"Import failed");
  notice.textContent=fmt(output.imported)+" verified query rows imported";await load();
 }catch(e){notice.textContent=e.message;}
});
load();
})();`;
