import { chromium } from 'playwright';
const base=process.env.SITE_BASE || 'https://actinguk.com';
const browser=await chromium.launch({headless:true});
const errors=[];
for(const width of [1440,390]){
 const page=await browser.newPage({viewport:{width,height:900}});
 await page.addInitScript(()=>{window.__seoPerf={lcp:0,cls:0};try{new PerformanceObserver(list=>{for(const e of list.getEntries())window.__seoPerf.lcp=e.startTime}).observe({type:'largest-contentful-paint',buffered:true});new PerformanceObserver(list=>{for(const e of list.getEntries())if(!e.hadRecentInput)window.__seoPerf.cls+=e.value}).observe({type:'layout-shift',buffered:true});}catch(e){}});
 page.on('pageerror',e=>errors.push('JS '+e.message));
 for(const path of ['/','/resources/training/rada.html','/resources/training/lamda.html','/training/','/agents/','/casting/','/guides/','/headshots/','/journal/acting-headshots-london.html','/coaches.html','/journal.html']){
  await page.goto(base+path,{waitUntil:'domcontentloaded',timeout:30000});
  await page.waitForSelector('h1');
  if(path==='/'||path.includes('/rada.html')){await page.waitForLoadState('load');await page.waitForTimeout(300);const perf=await page.evaluate(()=>({lcp:Math.round(window.__seoPerf?.lcp||0),cls:window.__seoPerf?.cls||0,domReady:Math.round(performance.getEntriesByType('navigation')[0]?.domContentLoadedEventEnd||0)}));console.log('LAB',width,path,JSON.stringify(perf));}
  const info=await page.evaluate(()=>({title:document.title,h1:document.querySelector('h1')?.textContent.trim(),bg:getComputedStyle(document.body).backgroundColor,layout:document.querySelector('.layout')?getComputedStyle(document.querySelector('.layout')).display:null,width:document.documentElement.clientWidth,scroll:document.documentElement.scrollWidth,css:[...document.styleSheets].map(x=>x.href).filter(Boolean)}));
  console.log(width,path,JSON.stringify(info));
  if(!info.h1||!info.css.length||info.bg==='rgba(0, 0, 0, 0)'||(path.includes('/resources/')&&info.layout!=='grid'))errors.push('Unstyled page '+path+' '+width);
  if(info.scroll>info.width+5)errors.push('Horizontal overflow '+path+' '+width);
 }
 await page.goto(base+'/',{waitUntil:'domcontentloaded'});
 await page.keyboard.press('Tab');
 const focus=await page.evaluate(()=>document.activeElement?.className);if(!String(focus).includes('skip'))errors.push('Keyboard skip link not first focus');
 if(width===390){await page.locator('#menu').click();if(await page.locator('#menu').getAttribute('aria-expanded')!=='true')errors.push('Mobile menu failed');}
 await page.locator('nav a[href="/training/"]').click();
 await page.waitForURL('**/training/');
 await page.goto(base+'/',{waitUntil:'domcontentloaded'});
 await page.locator('#search').fill('RADA');
 if(!(await page.locator('#entries').innerText()).includes('RADA'))errors.push('Directory search failed');
 const task=page.locator('#tasks input[type=checkbox]').first();
 const before=await task.isChecked();
 const prev=Number((await page.locator('#progressText').innerText()).match(/\d+/)?.[0]||0);
 await task.click();
 await page.waitForFunction(({prev,before})=>Number(document.querySelector('#progressText').textContent.match(/\d+/)[0])===prev+(before?-1:1),{prev,before},{timeout:5000});
 const expected=prev+(before?-1:1);
 await page.reload({waitUntil:'domcontentloaded'});
 await page.waitForFunction(expected=>Number(document.querySelector('#progressText').textContent.match(/\d+/)[0])===expected,expected,{timeout:5000});
 console.log('Checklist persisted',width,expected);
 await page.close();
}

// Test the new audio controls against a deterministic speech API, not cloud audio.
// This checks the player's UI and state, not the sound of a real device voice.
for(const [path,width] of [['/news/barbara-broccoli-nfts-president.html',1440],['/london-fringe-theatre/horrible-things-frankie-thompson.html',390]]){
 const page=await browser.newPage({viewport:{width,height:900}});
 await page.addInitScript(()=>{
  window.__speechCalls=[];
  Object.defineProperty(window,'SpeechSynthesisUtterance',{configurable:true,value:class{constructor(text){this.text=text;}}});
  Object.defineProperty(window,'speechSynthesis',{configurable:true,value:{
   getVoices:()=>[{lang:'en-GB',localService:true,name:'Test UK'}],addEventListener(){},
   speak(u){window.__audioLast=u;window.__speechCalls.push({text:u.text,rate:u.rate,lang:u.lang});},cancel(){}
  }});
 });
 page.on('pageerror',e=>errors.push('Audio JS '+e.message));
 await page.goto(base+path,{waitUntil:'domcontentloaded',timeout:30000});
 const player=page.locator('.au-listen');
 if(await player.count()!==1){errors.push('Missing audio player '+path);await page.close();continue;}
 const play=player.locator('.au-play'),seek=player.locator('.au-seek');
 await play.click();
 if(await play.getAttribute('aria-label')!=='Pause article')errors.push('Audio play state '+path);
 const first=await page.evaluate(()=>window.__speechCalls[0]);
 if(!first||first.lang!=='en-GB'||first.text.length===0)errors.push('Audio narration not started '+path);
 await page.evaluate(()=>window.__audioLast.onend());
 if(Number(await seek.inputValue())<=0)errors.push('Audio progress did not advance '+path);
 await play.click();
 if(await play.getAttribute('aria-label')!=='Play article')errors.push('Audio pause state '+path);
 await player.locator('.au-speed').selectOption('1.25');
 await seek.evaluate(el=>{el.value='65';el.dispatchEvent(new Event('input'));el.dispatchEvent(new Event('change'));});
 if(Number(await seek.inputValue())<35)errors.push('Audio seek failed '+path);
 await play.click();
 if(await page.evaluate(()=>window.__speechCalls.at(-1).rate)!==1.25)errors.push('Audio speed failed '+path);
 await play.click();
 await player.locator('.au-restart').click();
 if(await seek.inputValue()!=='0')errors.push('Audio restart failed '+path);
 const overflow=await page.evaluate(()=>document.documentElement.scrollWidth>document.documentElement.clientWidth+5);
 if(overflow)errors.push('Audio page horizontal overflow '+path);
 await page.close();
}
console.log('Audio player control checks completed (mock speech API).');

await browser.close();
if(errors.length){console.error(errors.join('\n'));process.exit(1);}
console.log('Desktop and mobile browser smoke checks passed.');
