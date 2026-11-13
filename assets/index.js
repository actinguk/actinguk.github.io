// Directory records: category, name, region, type, official URL, summary.
const data = [
  ["Training","RADA","London","Conservatoire","https://www.rada.ac.uk/courses/","Acting degrees, foundation training and short courses."],
  ["Training","LAMDA","London","Conservatoire","https://www.lamda.ac.uk/","Professional drama training and short courses."],
  ["Training","Guildhall School of Music & Drama","London","Conservatoire","https://www.gsmd.ac.uk/","Drama training in the Barbican, including acting."],
  ["Training","Royal Central School of Speech and Drama","London","Conservatoire","https://www.cssd.ac.uk/","Acting, performance and theatre-making programmes."],
  ["Training","Mountview","London","Conservatoire","https://www.mountview.org.uk/","Acting and musical theatre training in Peckham."],
  ["Training","ArtsEd","London","Conservatoire","https://artsed.co.uk/","Acting and musical theatre courses."],
  ["Training","Drama Studio London","London","Conservatoire","https://www.dramastudiolondon.co.uk/","Vocational actor training in Ealing."],
  ["Training","Rose Bruford College","London","Conservatoire","https://www.bruford.ac.uk/","Acting and theatre training in Sidcup."],
  ["Training","East 15 Acting School","South East","Conservatoire","https://www.east15.ac.uk/","Acting and theatre training, part of the University of Essex."],
  ["Training","Guildford School of Acting","South East","Conservatoire","https://gsauk.org/","Acting and musical theatre at the University of Surrey."],
  ["Training","Italia Conti","South East","Conservatoire","https://www.italiaconti.com/","Acting, musical theatre and dance in Woking."],
  ["Training","Oxford School of Drama","South East","Conservatoire","https://oxforddrama.ac.uk/","Vocational acting training in Oxfordshire."],
  ["Training","Liverpool Institute for Performing Arts","North West","Conservatoire","https://www.lipa.ac.uk/","Acting and wider performing arts training."],
  ["Training","Manchester School of Theatre","North West","University","https://www.mmu.ac.uk/","Explore acting and theatre courses at Manchester Metropolitan University."],
  ["Training","Royal Birmingham Conservatoire","Midlands","Conservatoire","https://www.bcu.ac.uk/conservatoire","Acting and performance training in Birmingham."],
  ["Training","Royal Conservatoire of Scotland","Scotland","Conservatoire","https://www.rcs.ac.uk/courses/ba-acting/","BA Acting in Glasgow, spanning stage, screen and audio."],
  ["Training","Royal Welsh College of Music & Drama","Wales","Conservatoire","https://www.rwcmd.ac.uk/department/drama/acting/courses","Acting programmes in Cardiff."],
  ["Training","Leeds Conservatoire","Yorkshire","Conservatoire","https://www.leedsconservatoire.ac.uk/","Performing arts and specialist conservatoire training."],
  ["Training","Bristol School of Acting","South West","Vocational","https://www.bristolschoolofacting.com/","Explore actor training and available courses in Bristol."],
  ["Training","National Youth Theatre","UK-wide","Youth / alternatives","https://www.nyt.org.uk/","Youth theatre training, auditions and development opportunities."],
  ["Training","Identity School of Acting","UK-wide","Part-time","https://www.identityschoolofacting.com/","Part-time actor training in London, Manchester, Birmingham and online."],
  ["Training","Federation of Drama Schools","UK-wide","Directory","https://www.federationofdramaschools.co.uk/","Compare conservatoire training and member institutions."],
  ["Training","CDMT","UK-wide","Directory","https://cdmt.org.uk/accredited-professional-training/","Accredited performing arts training directory."],
  ["Agents","United Agents","London","Talent agency","https://www.unitedagents.co.uk/actors/","Film, television and theatre actor representation."],
  ["Agents","Independent Talent Group","London","Talent agency","https://www.independenttalent.com/","Actors and creative talent across the media industry."],
  ["Agents","Curtis Brown","London","Talent agency","https://www.curtisbrown.co.uk/","Explore the actors department and representation guidance."],
  ["Agents","Hamilton Hodell","London","Talent agency","https://www.hamiltonhodell.co.uk/","Actor representation across stage and screen."],
  ["Agents","Conway van Gelder Grant","London","Talent agency","https://www.conwayvangeldergrant.com/pages/about/","West End actors agency."],
  ["Agents","The Artists Partnership","London","Talent agency","https://www.theartistspartnership.co.uk/","Explore actor representation and agency policies."],
  ["Agents","Global Artists","London","Talent agency","https://www.globalartists.com/contact/","Film, television and theatre representation."],
  ["Agents","Creative Artists Management","London","Talent agency","https://www.cam.co.uk/","Actor representation; see official agency information."],
  ["Agents","Markham, Froggatt & Irwin","London","Talent agency","https://www.markhamfroggattirwin.com/","Actor representation for film, theatre and television."],
  ["Agents","Alex Priestley Talent","North West","Talent agency","https://alexpriestleytalent.com/","Manchester and London agency; official application guidance."],
  ["Agents","Brennan Artists","Scotland","Talent agency","https://www.brennanartists.com/","Represents Scotland-based actors and creative talent."],
  ["Agents","Personal Managers’ Association","UK-wide","Directory","https://thepma.com/about-us/","Professional agency association; find its member list and code."],
  ["Agents","The Entertainment Agents Association","UK-wide","Directory","https://www.teaa.uk/act_type/agents-for-actors/","Regional agent listings with a member code of conduct."],
  ["Agents","Spotlight Contacts","UK-wide","Directory","https://app.spotlight.com/contacts","Search agents, casting directors and industry services."],
  ["Agents","Agent.co.uk","UK-wide","Directory","https://agent.co.uk/acting-agents/","Explore a third-party searchable talent-agent directory."],
  ["Casting","Spotlight","UK-wide","Professional casting","https://www.spotlight.com/","Professional casting platform; eligibility and membership terms apply."],
  ["Casting","Backstage UK","UK-wide","Casting platform","https://www.backstage.com/uk/","Casting notices, profiles and industry guidance; check plan terms."],
  ["Casting","Mandy","UK-wide","Casting platform","https://www.mandy.com/","Performance and production opportunities; check plan terms."],
  ["Casting","StarNow","UK-wide","Casting platform","https://www.starnow.com/","Casting and creative projects; review application and subscription terms."],
  ["Casting","The Stage","UK-wide","Theatre auditions","https://www.thestage.co.uk/jobs-auditions","Theatre jobs and auditions; access terms may apply."],
  ["Casting","Casting Callback","UK-wide","Casting platform","https://castingcallback.com/","Free applications according to the platform; verify each casting notice."],
  ["Casting","Open Auditions UK","UK-wide","Theatre auditions","https://www.openauditions.uk/","Explore open auditions; verify every notice at its source."],
  ["Casting","Casting Directors’ Guild","UK-wide","Industry body","https://www.thecdg.co.uk/","Professional casting director body for stage, screen and other media."],
  ["Casting","Casting Directors Association","UK-wide","Directory","https://castingdirectorsassociation.com/directory","Casting professionals across commercials, screen and live performance."],
  ["Casting","Casting Collective","UK-wide","Supporting artistes","https://www.castingcollective.co.uk/","Supporting artiste opportunities for film and television."],
  ["Casting","Uni-versalEXTRAS","UK-wide","Supporting artistes","https://universalextras.co.uk/","Background performer opportunities; review registration terms."],
  ["Support","Equity","UK-wide","Union","https://www.equity.org.uk/","Performers’ union, contracts, rates, safety and professional support."],
  ["Support","Equity: casting and auditions","UK-wide","Safety","https://www.equity.org.uk/advice-and-support/casting-and-auditions","Casting safety, self-tape standards and vetting notices."],
  ["Support","National Careers Service","UK-wide","Career advice","https://nationalcareers.service.gov.uk/job-profiles/actor","Overview of routes, skills and work as an actor."],
  ["Support","Get Into Theatre","UK-wide","Career advice","https://getintotheatre.org/","Theatre career routes, training and opportunities."],
  ["Support","Prospects","UK-wide","Career advice","https://www.prospects.ac.uk/job-profiles/actor/","Career profile, skills, employers and employment routes."],
  ["Support","ScreenSkills","UK-wide","Screen industry","https://www.screenskills.com/","Screen industry skills, training and career information."],
  ["Support","Creative Access","UK-wide","Access","https://creativeaccess.org.uk/","Creative career opportunities and support."],
  ["Support","Shape Arts","UK-wide","Access","https://www.shapearts.org.uk/","Disability-led arts access and creative support."],
  ["Support","Arts Jobs","UK-wide","Jobs","https://www.artsjobs.org.uk/","Creative-sector jobs and opportunities."],
  ["Support","UK Theatre","UK-wide","Industry body","https://uktheatre.org/","Theatre industry support and resources."],
  ["Support","Gov.uk: Dance and Drama Awards","UK-wide","Funding","https://www.gov.uk/dance-drama-awards","Check eligibility for training support and participating schools."],
  ["Support","HMRC: Self Assessment","UK-wide","Finance","https://www.gov.uk/self-assessment-tax-returns","Official UK tax return guidance for self-employed performers."],
  ["Support","Into Film","UK-wide","Screen industry","https://www.intofilm.org/","Film education and youth filmmaking resources."],
  ["News","The Stage","UK-wide","Theatre","https://www.thestage.co.uk/news","Theatre news, casting announcements and industry reporting."],
  ["News","Screen Daily","UK-wide","Screen","https://www.screendaily.com/","Film and television industry coverage."],
  ["News","WhatsOnStage","UK-wide","Theatre","https://www.whatsonstage.com/","Theatre productions, casting announcements and reviews."],
  ["News","BFI","UK-wide","Screen","https://www.bfi.org.uk/news","British film news, culture and industry updates."],
  ["News","Spotlight News & Advice","UK-wide","Career","https://www.spotlight.com/news-and-advice/","Interviews, industry updates and practical actor guidance."],
  ["News","Equity News","UK-wide","Rights","https://www.equity.org.uk/news","Union campaigns, working conditions and industry developments."],
  ["News","Deadline","International","Screen","https://deadline.com/","International film and television industry reporting."],
  ["News","Variety","International","Screen","https://variety.com/","Global entertainment business and production news."]
];

// Career guide cards and article content.
const guides = [
  ["01","Starting out","How to become an actor in the UK","A practical route from zero credits to your first professional opportunities.",["Start with the craft. Take an affordable class, join a local theatre group or make a short scene with collaborators. Drama school is one route, not a universal requirement.","Create an honest one-page CV, a recent headshot and a short clip showing your work. List real training, credits and skills; do not invent experience.","Build experience through carefully vetted student films, fringe theatre and open calls. Understand pay, travel, footage rights and who is producing before accepting.","Research casting platforms and their eligibility. Make a shortlist of agents only when you have materials that show what you can do.","Keep a weekly rhythm: practise, make work, apply selectively, review your progress and protect your income."],"https://nationalcareers.service.gov.uk/job-profiles/actor"],
  ["02","Training","Choosing a drama school","Find the training that fits your life, not just the famous name.",["Compare degree, foundation, part-time and short-course routes. A degree is a major time and financial commitment; a foundation or weekly class can help you test your goals.","Check actual course content, teaching staff, screen training, voice and movement, access needs, performance opportunities and graduate support.","Budget for tuition, living costs, travel and audition fees. Check student finance, scholarships and Dance and Drama Awards directly with providers.","Prepare contrasting monologues, read each play and understand the character’s objective. Follow the school’s audition instructions exactly.","Speak with current students if possible. Compare offers by fit, costs and support rather than prestige alone."],"https://www.federationofdramaschools.co.uk/"],
  ["03","Representation","How to get an acting agent","Make a targeted approach rather than sending a hundred identical emails.",["Choose agents whose existing roster and work align with your ambitions. Check whether they represent actors at your career stage and where they operate.","Prepare a concise introduction, CV, current headshot and showreel or short scenes. Link to your professional profile if available.","Follow each agency’s official submission route. If books are closed, respect that. Personalise why you are contacting them and avoid large unsolicited attachments.","At a meeting, ask about commission, exclusivity, expenses, payments, termination and how the agency communicates with clients.","Read the agreement before signing. Ask Equity for advice if unsure, and be cautious about pressure, guaranteed jobs or expensive mandatory packages."],"https://www.spotlight.com/industry-resources/"],
  ["04","Auditions","Self-tapes that work","Simple production choices that let your performance lead.",["Read the casting brief and deliver the framing, file names, orientation and deadline requested. Ask for clarification when essential information is missing.","Choose a quiet room, plain background and soft light on your face. Stabilise your camera at eye level and test sound before recording.","Use an off-camera reader where requested. Keep the eyeline close to the lens unless the brief says otherwise. Avoid distracting editing or music.","Find a clear objective, listen and respond. Record a few thoughtful takes rather than chasing technical perfection.","Review the final file, check the opening and end, and upload securely using the requested method. Confirm that the link works before sending."],"https://www.equity.org.uk/advice-and-support/casting-and-auditions"],
  ["05","Materials","Headshots, CVs and showreels","Build a professional package that makes casting decisions easier.",["Choose a current, recognisable headshot that reflects your appearance and feels appropriate for the roles you want. Avoid extreme retouching or costume-heavy images.","Keep your CV clean: contact or representation details, training, credits, relevant skills and accurate playing information. Use consistent names across profiles.","Lead your reel with strong acting, not a long montage. Select short scenes that make your face, voice and choices easy to understand.","If you do not have credits, create a well-rehearsed scene with a reader or collaborator. Label it accurately rather than presenting it as a released production.","Keep materials updated after significant changes in appearance, training or footage. Ask for specific feedback instead of collecting endless new versions."],"https://www.spotlight.com/news-and-advice/"],
  ["06","Working safely","Spot a casting scam","Protect your money, personal information and boundaries.",["Confirm the production, casting professional and contact details independently. A social account or convincing email is not proof of legitimacy.","Be cautious about requests to pay for an audition, urgent transfers, unusual payment arrangements or guarantees of employment. Check official guidance.","Ask for role details, dates, location, pay, usage and any intimacy or physical requirements before agreeing. Do not send sensitive documents without a legitimate need.","For an unfamiliar in-person audition, tell someone where you are going and check the venue. You can request accessible arrangements or raise concerns about boundaries.","If something feels wrong, stop and seek advice. Equity provides confidential guidance on casting and auditions."],"https://www.equity.org.uk/advice-and-support/casting-and-auditions"],
  ["07","Business","Freelance life and contracts","Understand the business side before a job becomes a problem.",["Keep records of income, expenses, invoices and contracts. Check HMRC guidance on your own tax obligations; employment status can differ by engagement.","Read the contract before accepting: dates, pay, travel, overtime, cancellation, usage, exclusivity and credit can matter as much as the headline fee.","For commercials and digital work, ask how long and where your likeness may be used, including renewals and any AI or synthetic performance terms.","Compare the applicable Equity agreements or other relevant negotiated rates rather than assuming one rate covers every production.","Maintain a cash buffer where possible and plan for gaps between jobs. Seek qualified advice for tax, legal or contractual issues."],"https://www.equity.org.uk/"],
  ["08","Career development","A 30-day actor action plan","Turn a vague ambition into a small, repeatable system.",["Week 1: audit your CV, headshot, reel and current training. Choose one specific goal and identify what is missing.","Week 2: research ten appropriate organisations, agents or training providers. Save a shortlist and check the official application requirements.","Week 3: practise a new scene, record a self-tape and send a small number of tailored applications. Log your submissions and follow-up dates.","Week 4: review what worked, update your materials and schedule your next training or creative project.","Repeat monthly. Measure actions you control, not only auditions or bookings."],"https://www.spotlight.com/news-and-advice/"]
];


// DOM helpers and local storage.
const $=id=>document.getElementById(id), esc=s=>String(s).replace(/[&<>"']/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]));
const categories=["All","Training","Agents","Casting","Support","News","Saved"];
let cat="All",limit=12;
function read(key,fallback){try{return JSON.parse(localStorage.getItem(key))||fallback}catch{return fallback}}
function store(key,value){try{localStorage.setItem(key,JSON.stringify(value))}catch{}}
let saved=new Set(read("acting-saved",[]));
const oldTaskIds=["goal","cv","reel","research","agency","tape","safety","review"];
const savedTaskIds=read("acting-tasks-v2",null);
let done=new Set(Array.isArray(savedTaskIds)?savedTaskIds:read("acting-tasks",[]).map(i=>oldTaskIds[i]).filter(Boolean));
const key=(d)=>d[0]+"|"+d[1];

// Permanent editorial profile URLs.
const resourcePaths = {
  "Training|RADA": "resources/training/rada.html",
  "Training|LAMDA": "resources/training/lamda.html",
  "Training|Guildhall School of Music & Drama": "resources/training/guildhall-school-of-music-and-drama.html",
  "Training|Royal Central School of Speech and Drama": "resources/training/royal-central-school-of-speech-and-drama.html",
  "Training|Mountview": "resources/training/mountview.html",
  "Training|ArtsEd": "resources/training/artsed.html",
  "Training|Drama Studio London": "resources/training/drama-studio-london.html",
  "Training|Rose Bruford College": "resources/training/rose-bruford-college.html",
  "Training|East 15 Acting School": "resources/training/east-15-acting-school.html",
  "Training|Guildford School of Acting": "resources/training/guildford-school-of-acting.html",
  "Training|Italia Conti": "resources/training/italia-conti.html",
  "Training|Oxford School of Drama": "resources/training/oxford-school-of-drama.html",
  "Training|Liverpool Institute for Performing Arts": "resources/training/liverpool-institute-for-performing-arts.html",
  "Training|Manchester School of Theatre": "resources/training/manchester-school-of-theatre.html",
  "Training|Royal Birmingham Conservatoire": "resources/training/royal-birmingham-conservatoire.html",
  "Training|Royal Conservatoire of Scotland": "resources/training/royal-conservatoire-of-scotland.html",
  "Training|Royal Welsh College of Music & Drama": "resources/training/royal-welsh-college-of-music-and-drama.html",
  "Training|Leeds Conservatoire": "resources/training/leeds-conservatoire.html",
  "Training|Bristol School of Acting": "resources/training/bristol-school-of-acting.html",
  "Training|National Youth Theatre": "resources/training/national-youth-theatre.html",
  "Training|Identity School of Acting": "resources/training/identity-school-of-acting.html",
  "Training|Federation of Drama Schools": "resources/training/federation-of-drama-schools.html",
  "Training|CDMT": "resources/training/cdmt.html",
  "Agents|United Agents": "resources/agents/united-agents.html",
  "Agents|Independent Talent Group": "resources/agents/independent-talent-group.html",
  "Agents|Curtis Brown": "resources/agents/curtis-brown.html",
  "Agents|Hamilton Hodell": "resources/agents/hamilton-hodell.html",
  "Agents|Conway van Gelder Grant": "resources/agents/conway-van-gelder-grant.html",
  "Agents|The Artists Partnership": "resources/agents/the-artists-partnership.html",
  "Agents|Global Artists": "resources/agents/global-artists.html",
  "Agents|Creative Artists Management": "resources/agents/creative-artists-management.html",
  "Agents|Markham, Froggatt & Irwin": "resources/agents/markham-froggatt-and-irwin.html",
  "Agents|Alex Priestley Talent": "resources/agents/alex-priestley-talent.html",
  "Agents|Brennan Artists": "resources/agents/brennan-artists.html",
  "Agents|Personal Managers’ Association": "resources/agents/personal-managers-association.html",
  "Agents|The Entertainment Agents Association": "resources/agents/the-entertainment-agents-association.html",
  "Agents|Spotlight Contacts": "resources/agents/spotlight-contacts.html",
  "Agents|Agent.co.uk": "resources/agents/agent-co-uk.html",
  "Casting|Spotlight": "resources/casting/spotlight.html",
  "Casting|Backstage UK": "resources/casting/backstage-uk.html",
  "Casting|Mandy": "resources/casting/mandy.html",
  "Casting|StarNow": "resources/casting/starnow.html",
  "Casting|The Stage": "resources/casting/the-stage.html",
  "Casting|Casting Callback": "resources/casting/casting-callback.html",
  "Casting|Open Auditions UK": "resources/casting/open-auditions-uk.html",
  "Casting|Casting Directors’ Guild": "resources/casting/casting-directors-guild.html",
  "Casting|Casting Directors Association": "resources/casting/casting-directors-association.html",
  "Casting|Casting Collective": "resources/casting/casting-collective.html",
  "Casting|Uni-versalEXTRAS": "resources/casting/uni-versalextras.html",
  "Support|Equity": "resources/support/equity.html",
  "Support|Equity: casting and auditions": "resources/support/equity-casting-and-auditions.html",
  "Support|National Careers Service": "resources/support/national-careers-service.html",
  "Support|Get Into Theatre": "resources/support/get-into-theatre.html",
  "Support|Prospects": "resources/support/prospects.html",
  "Support|ScreenSkills": "resources/support/screenskills.html",
  "Support|Creative Access": "resources/support/creative-access.html",
  "Support|Shape Arts": "resources/support/shape-arts.html",
  "Support|Arts Jobs": "resources/support/arts-jobs.html",
  "Support|UK Theatre": "resources/support/uk-theatre.html",
  "Support|Gov.uk: Dance and Drama Awards": "resources/support/gov-uk-dance-and-drama-awards.html",
  "Support|HMRC: Self Assessment": "resources/support/hmrc-self-assessment.html",
  "Support|Into Film": "resources/support/into-film.html",
  "News|The Stage": "resources/news/the-stage.html",
  "News|Screen Daily": "resources/news/screen-daily.html",
  "News|WhatsOnStage": "resources/news/whatsonstage.html",
  "News|BFI": "resources/news/bfi.html",
  "News|Spotlight News & Advice": "resources/news/spotlight-news-and-advice.html",
  "News|Equity News": "resources/news/equity-news.html",
  "News|Deadline": "resources/news/deadline.html",
  "News|Variety": "resources/news/variety.html"
};
const resourcePath=d=>resourcePaths[key(d)];
const regions=[...new Set(data.map(d=>d[2]))].sort();
for(const r of regions){const o=document.createElement("option");o.value=r;o.textContent=r;$("region").append(o)}
function setCategory(c){cat=c;limit=12;$("search").value="";$("region").value="";render()}

// Directory search, filtering, sorting and pagination.
function render(){ $("tabs").innerHTML=categories.map(c=>'<button class="tab '+(c===cat?'active':'')+'" data-category="'+c+'" aria-pressed="'+(c===cat)+'">'+c+'</button>').join("");$("savedCount").textContent=saved.size; const q=$("search").value.toLowerCase().trim(),r=$("region").value;let list=data.filter(d=>(cat==="All"||cat==="Saved"&&saved.has(key(d))||d[0]===cat)&&(!r||d[2]===r)&&(!q||d.join(" ").toLowerCase().includes(q)));if($("sort").value!=="curated")list.sort((a,b)=>a[1].localeCompare(b[1])*($("sort").value==="za"?-1:1));$("resultCount").textContent=list.length+" resources · showing "+Math.min(limit,list.length);$("entries").innerHTML=list.slice(0,limit).map(d=>'<article class="entry"><span class="type">'+esc(d[0])+' / '+esc(d[2])+' / '+esc(d[3])+'</span><button class="bookmark '+(saved.has(key(d))?'on':'')+'" data-save="'+esc(key(d))+'" aria-label="'+(saved.has(key(d))?'Remove ':'Save ')+esc(d[1])+'" aria-pressed="'+saved.has(key(d))+'">'+(saved.has(key(d))?'♥':'♡')+'</button><h3><a style="font-size:inherit;font-weight:inherit" href="'+esc(resourcePath(d))+'">'+esc(d[1])+'</a></h3><p>'+esc(d[5])+'</p><a href="'+esc(resourcePath(d))+'">Read our guide ↗</a></article>').join("")||'<div class="empty">No matching resources. Try another search or clear the filters.</div>';$("more").hidden=list.length<=limit}
$("tabs").addEventListener("click",e=>{const b=e.target.closest("[data-category]");if(b)setCategory(b.dataset.category)});
$("entries").addEventListener("click",e=>{const b=e.target.closest("[data-save]");if(!b)return;const k=b.dataset.save;saved.has(k)?saved.delete(k):saved.add(k);store("acting-saved",[...saved]);render();const next=[...document.querySelectorAll("[data-save]")].find(x=>x.dataset.save===k);if(next)next.focus()});
for(const id of ["search","region","sort"])$(id).addEventListener(id==="search"?"input":"change",()=>{limit=12;render()});
$("more").onclick=()=>{limit+=12;render()};$("reset").onclick=()=>{$("sort").value="curated";setCategory("All")};$("savedTop").onclick=()=>{setCategory("Saved");location.hash="directory"};document.querySelectorAll("[data-cat]").forEach(a=>a.addEventListener("click",()=>setCategory(a.dataset.cat)));
$("menu").onclick=()=>{const open=$("navlinks").classList.toggle("open");$("menu").setAttribute("aria-expanded",open)};$("navlinks").addEventListener("click",()=>{$("navlinks").classList.remove("open");$("menu").setAttribute("aria-expanded","false")});

// Guide navigation and article dialog.
const guidePaths=["guides/how-to-become-an-actor-in-the-uk.html","guides/choosing-a-drama-school.html","guides/how-to-get-an-acting-agent.html","guides/self-tapes-that-work.html","guides/headshots-cvs-and-showreels.html","guides/spot-a-casting-scam.html","guides/freelance-life-and-contracts.html","guides/a-30-day-actor-action-plan.html"];
const colors=["#d6df9b","#e2c6af","#bdc9b6","#c5c8da","#d2b99c","#dfd6c4","#aab9a6","#d9dfb9"];
const art=(i)=>'<svg viewBox="0 0 260 120" aria-hidden="true"><rect width="260" height="120" fill="'+colors[i]+'"/><g fill="none" stroke="#303a2e" stroke-width="1.4" opacity=".8"><circle cx="'+(75+i*12)+'" cy="60" r="43"/><circle cx="'+(130+i*5)+'" cy="60" r="33"/><path d="M15 100L245 20M15 20L245 100"/><rect x="38" y="16" width="184" height="88"/></g><text x="130" y="75" text-anchor="middle" font-family="Georgia" font-size="42" fill="#20251e">'+guides[i][0]+'</text></svg>';
$("guideGrid").innerHTML=guides.map((g,i)=>'<a class="guide" style="text-decoration:none" href="'+guidePaths[i]+'"><div class="guide-art">'+art(i)+'</div><div class="guide-text"><span class="eyebrow">'+esc(g[1])+'</span><h3>'+esc(g[2])+'</h3><p>'+esc(g[3])+'</p><span class="read">Read guide ↗</span></div></a>').join("");
function openGuide(i){const g=guides[i];$("articleBody").innerHTML='<span class="eyebrow">'+esc(g[1])+' / '+esc(g[0])+'</span><h2 id="articleTitle">'+esc(g[2])+'</h2><p>'+esc(g[3])+'</p><ol>'+g[4].map(x=>'<li>'+esc(x)+'</li>').join("")+'</ol><p>Further reading: consult the source named in the full guide.</p>';$("article").showModal()}
$("guideGrid").onclick=e=>{const b=e.target.closest("[data-open]");if(b)openGuide(+b.dataset.open)};document.querySelectorAll("[data-guide]").forEach(a=>a.onclick=e=>{e.preventDefault();location.href=guidePaths[+a.dataset.guide]});$("closeArticle").onclick=()=>$("article").close();

// Personal career checklist.
const tasks = [
  ["goal","Choose one acting goal for this month","guides/how-to-become-an-actor-in-the-uk.html","Starting out"],
  ["headshots","Get your first professional headshots (or check your current ones)","journal/first-headshots.html","Headshot guide"],
  ["cv","Review your headshot and CV","guides/headshots-cvs-and-showreels.html","Build your profile"],
  ["research","Research training and suitable casting options","directory.html#casting","Casting directory"],
  ["safety","Review contracts, rates, work permissions and casting safety","journal/scams.html","Stay safe"],
  ["tape","Practise and record a self-tape","journal/self-tape.html","Self-tape guide"],
  ["applications","Apply for suitable auditions and track your submissions","journal/first-audition.html","Find auditions"],
  ["experience","Find a suitable first role or project and agree terms and footage","journal/footage.html","Build experience"],
  ["reel","Prepare or update a short showreel","guides/headshots-cvs-and-showreels.html","Showreel guide"],
  ["agency","Shortlist suitable agencies when your materials are ready","journal/agent.html","Find an agent"],
  ["review","Review your progress and plan your next month","guides/a-30-day-actor-action-plan.html","Review your goals"]
];
function drawTasks(){const valid=new Set(tasks.map(t=>t[0]));done=new Set([...done].filter(id=>valid.has(id)));$("tasks").innerHTML=tasks.map((t,i)=>'<div class="task '+(done.has(t[0])?'done':'')+'"><label><input type="checkbox" data-task="'+esc(t[0])+'" '+(done.has(t[0])?'checked':'')+'><span>'+String(i+1).padStart(2,"0")+'. '+esc(t[1])+'</span></label><a href="'+esc(t[2])+'">'+esc(t[3])+' ↗</a></div>').join("");const n=Math.round(done.size/tasks.length*100);$("progressFill").style.width=n+"%";$("progress").setAttribute("aria-valuenow",n);$("progressText").textContent=done.size+" of "+tasks.length+" complete"}
$("tasks").onchange=e=>{if(!e.target.matches("[data-task]"))return;const id=e.target.dataset.task;e.target.checked?done.add(id):done.delete(id);store("acting-tasks-v2",[...done]);drawTasks();const next=[...$("tasks").querySelectorAll("[data-task]")].find(x=>x.dataset.task===id);if(next)next.focus()};

// Publisher links and initialization.
$("newsGrid").innerHTML=data.filter(d=>d[0]==="News").map(d=>'<a class="news-card" href="'+esc(resourcePath(d))+'"><span class="eyebrow">'+esc(d[3])+'</span><h3>'+esc(d[1])+'</h3><p>'+esc(d[5])+'</p><span class="out">Read publisher guide ↗</span></a>').join("");
$("clearData").onclick=()=>{if(confirm("Clear your shortlist and checklist on this browser?")){saved.clear();done.clear();store("acting-saved",[]);store("acting-tasks",[]);store("acting-tasks-v2",[]);render();drawTasks()}};render();drawTasks();
