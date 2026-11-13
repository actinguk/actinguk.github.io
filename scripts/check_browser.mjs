import { chromium } from 'playwright';
const base='https://actinguk.com';
const browser=await chromium.launch({headless:true});
const errors=[];
for(const width of [1440,390]){
 const page=await browser.newPage({viewport:{width,height:900}});
 page.on('pageerror',e=>errors.push('JS '+e.message));
 for(const path of ['/','/resources/training/rada.html','/resources/training/lamda.html','/training/','/agents/','/casting/','/guides/','/headshots/','/coaches.html','/journal.html']){
  await page.goto(base+path,{waitUntil:'domcontentloaded',timeout:30000});
  await page.waitForSelector('h1');
  const info=await page.evaluate(()=>({title:document.title,h1:document.querySelector('h1')?.textContent.trim(),bg:getComputedStyle(document.body).backgroundColor,layout:document.querySelector('.layout')?getComputedStyle(document.querySelector('.layout')).display:null,width:document.documentElement.clientWidth,scroll:document.documentElement.scrollWidth,css:[...document.styleSheets].map(x=>x.href).filter(Boolean)}));
  console.log(width,path,JSON.stringify(info));
  if(!info.h1||!info.css.length||info.bg==='rgba(0, 0, 0, 0)'||(path.includes('/resources/')&&info.layout!=='grid'))errors.push('Unstyled page '+path+' '+width);
  if(info.scroll>info.width+5)errors.push('Horizontal overflow '+path+' '+width);
 }
 await page.goto(base+'/',{waitUntil:'domcontentloaded'});
 if(width===390){await page.locator('#menu').click();if(await page.locator('#menu').getAttribute('aria-expanded')!=='true')errors.push('Mobile menu failed');}
 await page.locator('nav a[href="/training/"]').click();
 await page.waitForURL('**/training/');
 await page.goto(base+'/',{waitUntil:'domcontentloaded'});
 await page.locator('#search').fill('RADA');
 if(!(await page.locator('#entries').innerText()).includes('RADA'))errors.push('Directory search failed');
 await page.locator('#tasks input[type=checkbox]').first().check();
 if(!(await page.locator('#progressText').innerText()).includes('1 of'))errors.push('Checklist failed');
 await page.close();
}
await browser.close();
if(errors.length){console.error(errors.join('\n'));process.exit(1);}
console.log('Desktop and mobile browser smoke checks passed.');
