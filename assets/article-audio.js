/* Acting UK: free browser narration; no audio downloads or external API. */
(() => {
  'use strict';
  if (!/^\/(?:news|london-fringe-theatre)\/[^/]+\.html$/.test(location.pathname)) return;
  const article=document.querySelector('main article'), hero=article?.querySelector('.hero'), body=article?.querySelector('.content');
  if (!hero || !body || hero.querySelector('.au-listen')) return;
  const clean=body.cloneNode(true);
  clean.querySelectorAll('.sources,figure,aside,nav,button,script,style,[aria-hidden="true"]').forEach(n=>n.remove());
  const parts=[hero.querySelector('h1')?.textContent,hero.querySelector('.lead')?.textContent,...Array.from(clean.querySelectorAll('h2,h3,p,li,blockquote'),n=>n.textContent)]
    .filter(Boolean).map(s=>s.replace(/\s+/g,' ').trim()).filter(Boolean);
  // Short segments avoid long-utterance limits; seek and pause resume at segment boundaries.
  const chunks=[];
  for(const part of parts){
    const sentences=part.match(/[^.!?]+(?:[.!?]+["’”']?|$)/g)||[part];
    for(const sentence of sentences){
      let rest=sentence.trim();
      while(rest.length>220){let cut=rest.lastIndexOf(' ',220);if(cut<1)cut=220;chunks.push(rest.slice(0,cut));rest=rest.slice(cut).trim();}
      if(rest)chunks.push(rest);
    }
  }
  if(!chunks.length)return;
  const player=document.createElement('section');
  player.className='au-listen';player.setAttribute('aria-label','Listen to this article');
  player.innerHTML='<div class="au-listen-top"><button type="button" class="au-play" aria-label="Play article"><span aria-hidden="true">▶</span></button><div class="au-listen-title"><strong>Listen to this article</strong><span class="au-listen-sub">Browser narration · <span class="au-duration"></span></span></div><button type="button" class="au-restart" aria-label="Restart article" title="Restart article">↺</button><label class="au-speed-label"><span class="au-visually-hidden">Playback speed</span><select class="au-speed" aria-label="Playback speed"><option value="0.8">0.8×</option><option value="1" selected>1×</option><option value="1.25">1.25×</option><option value="1.5">1.5×</option></select></label></div><div class="au-listen-progress"><input class="au-seek" type="range" min="0" max="100" step="1" value="0" aria-label="Article playback position"><span class="au-percent" aria-hidden="true">0%</span></div><span class="au-status" role="status" aria-live="polite"></span>';
  hero.append(player);
  const q=s=>player.querySelector(s),play=q('.au-play'),restart=q('.au-restart'),speed=q('.au-speed'),seek=q('.au-seek'),percent=q('.au-percent'),status=q('.au-status');
  const words=chunks.join(' ').split(/\s+/).length;
  const duration=()=>{const seconds=Math.ceil(words/(155*Number(speed.value))*60);q('.au-duration').textContent='~'+Math.floor(seconds/60)+':'+String(seconds%60).padStart(2,'0');};
  duration();
  if(!('speechSynthesis' in window)||!('SpeechSynthesisUtterance' in window)){
    [play,restart,speed,seek].forEach(el=>el.disabled=true);status.textContent='Audio is not available in this browser. You can still read the full article.';return;
  }
  const synth=window.speechSynthesis, offsets=[0];
  for(const chunk of chunks)offsets.push(offsets.at(-1)+chunk.length);
  const total=offsets.at(-1);
  let index=0,active=false,token=0,utterance=null,voices=synth.getVoices();
  const refresh=()=>{voices=synth.getVoices();};synth.addEventListener('voiceschanged',refresh);
  const chooseVoice=()=>voices.find(v=>v.localService&&/^en[-_]GB$/i.test(v.lang))||voices.find(v=>v.localService&&/^en/i.test(v.lang))||voices.find(v=>/^en[-_]GB$/i.test(v.lang))||voices.find(v=>/^en/i.test(v.lang));
  const render=(extra=0)=>{let p=Math.min(100,Math.round((offsets[index]+extra)/total*100));seek.value=String(p);percent.textContent=p+'%';seek.setAttribute('aria-valuetext',p+' percent');seek.style.setProperty('--au-progress',p+'%');play.querySelector('span').textContent=active?'Ⅱ':'▶';play.setAttribute('aria-label',active?'Pause article':'Play article');};
  const stop=()=>{active=false;token++;synth.cancel();utterance=null;render();};
  const speak=()=>{
    if(!active)return;
    if(index>=chunks.length){active=false;utterance=null;render();status.textContent='Article finished.';return;}
    const current=++token,u=new SpeechSynthesisUtterance(chunks[index]);utterance=u;
    u.lang='en-GB';const voice=chooseVoice();if(voice)u.voice=voice;u.rate=Number(speed.value);
    u.onboundary=e=>{if(current===token&&active)render(Math.min(chunks[index].length,e.charIndex||0));};
    u.onend=()=>{if(current!==token||!active)return;index++;render();speak();};
    u.onerror=e=>{if(current!==token)return;active=false;utterance=null;render();status.textContent='Unable to play audio. Try another browser or enable a system speech voice.';};
    synth.speak(u);
  };
  const start=()=>{if(index>=chunks.length)index=0;active=true;status.textContent='';render();speak();};
  play.addEventListener('click',()=>{if(active){stop();status.textContent='Paused.';}else start();});
  restart.addEventListener('click',()=>{const was=active;stop();index=0;render();status.textContent='';if(was)start();});
  speed.addEventListener('change',()=>{duration();if(active){stop();start();}});
  seek.addEventListener('input',()=>{percent.textContent=seek.value+'%';seek.setAttribute('aria-valuetext',seek.value+' percent');seek.style.setProperty('--au-progress',seek.value+'%');});
  seek.addEventListener('change',()=>{const target=Number(seek.value)/100*total,was=active;stop();index=target>=total?chunks.length:Math.max(0,offsets.findIndex(o=>o>target)-1);render();if(was&&index<chunks.length)start();});
  window.addEventListener('pagehide',()=>{stop();});
  render();
})();
