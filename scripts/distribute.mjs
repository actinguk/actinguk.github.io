import fs from 'node:fs';
import crypto from 'node:crypto';
import {setTimeout as sleep} from 'node:timers/promises';
const base='https://actinguk.com', key='a94f64d2b7e148d9b22083a954e720cf', hub='https://pubsubhubbub.appspot.com/', branch='distribution-state';
const api='https://api.github.com/repos/'+process.env.GITHUB_REPOSITORY;
const token=process.env.GITHUB_TOKEN;
if(!token||process.env.GITHUB_REPOSITORY!=='actinguk/actinguk.github.io')throw Error('Wrong repository or missing GitHub token');
const hash=s=>crypto.createHash('sha256').update(s).digest('hex');
const headers={Authorization:'Bearer '+token,Accept:'application/vnd.github+json','X-GitHub-Api-Version':'2022-11-28'};
async function request(url,options={}){return fetch(url,{...options,signal:AbortSignal.timeout(20000)});}
async function gh(path,method='GET',body){const r=await request(api+path,{method,headers:{...headers,'Content-Type':'application/json'},...(body?{body:JSON.stringify(body)}:{})});return {status:r.status,data:await r.json()};}
const ref=await gh('/git/ref/heads/'+branch);
if(ref.status===404){const main=await gh('/git/ref/heads/main');if(main.status!==200)throw Error('Cannot read main ref');const created=await gh('/git/refs','POST',{ref:'refs/heads/'+branch,sha:main.data.object.sha});if(created.status!==201)throw Error('Cannot create state branch: '+created.status);}else if(ref.status!==200)throw Error('Cannot read state branch: '+ref.status);
let state={version:1,indexnow:{},websub:{},attempts:[]};const old=await gh('/contents/.distribution/ledger.json?ref='+branch);
if(old.status===200)state=JSON.parse(Buffer.from(old.data.content,'base64').toString('utf8'));else if(old.status!==404)throw Error('Cannot read ledger: '+old.status);
const index=JSON.parse(fs.readFileSync('news/editorial-index.json','utf8'));
const urls=[...new Set([...index.articles].sort((a,b)=>b.date.localeCompare(a.date)).map(x=>x.url).filter(x=>/^\/(?:news|london-fringe-theatre)\/[a-z0-9-]+\.html$/.test(x))),'/','/news/','/london-fringe-theatre/','/follow/','/london-fringe-theatre/calendar/','/casting-opportunities/'];
const local=p=>p.endsWith('/')?p.slice(1)+'index.html':p.slice(1);
const get=async p=>{const r=await request(base+p,{headers:{'Cache-Control':'no-cache','User-Agent':'ActingUK-Distribution/1.0'}});if(r.status!==200||new URL(r.url).hostname!=='actinguk.com')throw Error(p+' HTTP '+r.status+' / '+r.url);return await r.text();};
const log=(service,status,detail)=>{const row={at:new Date().toISOString(),service,status,detail};state.attempts.push(row);console.log(JSON.stringify(row));};
let errors=0;
async function live(p,expected){for(let n=0;n<4;n++){try{const body=await get(p);if(hash(body)===hash(expected))return true;}catch(e){console.log(String(e));}if(n<3)await sleep(15000);}return false;}
let keyOk=false;try{keyOk=(await get('/'+key+'.txt')).trim()===key;}catch(e){log('IndexNow','key unavailable',String(e));}if(!keyOk){errors++;log('IndexNow','blocked','Public verification key not confirmed');}
const pending=[],candidates=[];for(const p of urls){if(!fs.existsSync(local(p)))continue;const body=fs.readFileSync(local(p),'utf8'),h=hash(body),url=base+p;if(state.indexnow[url]?.hash===h)continue;if(/<meta\s+name=["']robots["'][^>]*noindex/i.test(body))continue;candidates.push({p,body,url,hash:h});}
// Bounded parallel checks prevent unavailable pages from exhausting a workflow.
for(let i=0;i<Math.min(candidates.length,36);i+=6){await Promise.all(candidates.slice(i,i+6).map(async x=>{if(await live(x.p,x.body))pending.push({url:x.url,hash:x.hash});else{errors++;log('live','unconfirmed',x.url);}}));}
if(candidates.length>36)log('IndexNow','queued',candidates.length-36);
if(keyOk&&pending.length){try{const r=await request('https://api.indexnow.org/indexnow',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({host:'actinguk.com',key,keyLocation:base+'/'+key+'.txt',urlList:pending.map(x=>x.url)})});log('IndexNow',r.status,pending.map(x=>x.url));if([200,202].includes(r.status)){for(const x of pending)state.indexnow[x.url]={hash:x.hash,status:r.status,at:new Date().toISOString()};}else errors++;}catch(e){errors++;log('IndexNow','error',String(e));}}
for(const p of ['/rss.xml','/industry-rss.xml','/fringe-rss.xml']){const body=fs.readFileSync(local(p),'utf8'),h=hash(body),url=base+p;if(state.websub[url]?.hash===h)continue;if(!(await live(p,body))){errors++;log('WebSub','feed not live',url);continue;}try{const r=await request(hub,{method:'POST',headers:{'Content-Type':'application/x-www-form-urlencoded'},body:new URLSearchParams({'hub.mode':'publish','hub.url':url})});log('WebSub',r.status,url);if(r.ok)state.websub[url]={hash:h,status:r.status,at:new Date().toISOString()};else errors++;}catch(e){errors++;log('WebSub','error',String(e));}}
state.attempts=state.attempts.slice(-200);const content=Buffer.from(JSON.stringify(state,null,2)+'\n').toString('base64');const saved=await gh('/contents/.distribution/ledger.json','PUT',{message:'Record search and feed notification results',branch,content,...(old.status===200?{sha:old.data.sha}:{})});if(![200,201].includes(saved.status))throw Error('Ledger write failed: '+saved.status);if(errors)process.exitCode=1;
