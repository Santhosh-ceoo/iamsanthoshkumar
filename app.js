/* ════════ SHARED APP — runs on every page, fully defensive ════════ */
const $=id=>document.getElementById(id);
const setTxt=(id,t)=>{const e=$(id);if(e)e.textContent=t;};

/* ── persisted world (carries across pages) ── */
let isAdv=false;
try{ isAdv=localStorage.getItem('world')==='adv'; }catch(e){}
if(isAdv) document.body.classList.add('adv');

/* ════════ MARQUEE ════════ */
(function(){
  const track=$('track'); if(!track)return;
  const items=['Teaching AI','AI for Students','Websites for Small Business','Hands-on Workshops','Web Design & Build','Automation','PMP® Certified','Toronto, ON'];
  let html=''; for(let r=0;r<2;r++) items.forEach(t=>html+=`<span>${t}</span><span class="d">◆</span>`);
  track.innerHTML=html;
})();

/* ════════ LOADER + BOOT ════════ */
let inited=false;
function boot(){
  if(inited)return; inited=true;
  initReveal(); initCounters();
  setTimeout(()=>document.body.classList.add('intro-done'),700);
}
if(!$('loader')) boot(); // sub-pages: DOM is ready (deferred), reveal immediately
window.addEventListener('load',()=>setTimeout(()=>{
  const l=$('loader'); if(l){l.classList.add('out');setTimeout(()=>l.remove(),700);}
  boot();
},$('loader')?2000:200));
setTimeout(()=>{ const l=$('loader'); if(l){l.classList.add('out');setTimeout(()=>l.remove(),700);} boot(); },3200);

/* ════════ NAV SCROLL ════════ */
const nav=$('nav');
if(nav) addEventListener('scroll',()=>nav.classList.toggle('scrolled',scrollY>40),{passive:true});

/* ════════ WORLD TOGGLE ════════ */
const btnPro=$('btnPro'), btnAdv=$('btnAdv'), knob=$('knob');
let busy=false;
function placeKnob(){
  if(!knob||!btnPro||!btnAdv)return;
  const b=isAdv?btnAdv:btnPro;
  knob.style.left=b.offsetLeft+'px'; knob.style.width=b.offsetWidth+'px';
}
function applyWorldChrome(){
  document.body.classList.toggle('adv',isAdv);
  if(btnPro){btnPro.classList.toggle('on',!isAdv);btnPro.setAttribute('aria-pressed',String(!isAdv));}
  if(btnAdv){btnAdv.classList.toggle('on',isAdv);btnAdv.setAttribute('aria-pressed',String(isAdv));}
  document.querySelectorAll('.mw').forEach(b=>b.classList.toggle('active',(b.dataset.world==='adv')===isAdv));
  placeKnob();
  document.querySelectorAll('.pro-only').forEach(e=>e.style.display=isAdv?'none':'');
  document.querySelectorAll('.adv-nav').forEach(e=>e.style.display=isAdv?'':'none');
  document.querySelectorAll('.pro-nav').forEach(e=>e.style.display=isAdv?'none':'');
  setTxt('ctaH',isAdv?"The next trip is already half-planned.":"Want to learn AI, or need a website that works? Let's talk.");
  setTxt('ctH',isAdv?"Let's go somewhere new.":"Let's build something worth building.");
  setTxt('ctP',isAdv?"Trade routes, gear notes, or the next jump. If you live for the off-the-clock half too, say hello.":"Student, small business, or growing team: if you're serious about putting AI to work, I'd like to hear from you. I reply within 24 hours, always.");
  setTxt('bridgeK',isAdv?"Back to work →":"Off the clock →");
  setTxt('bridgeH',isAdv?"But the desk is where it all gets built.":"When the laptop closes, gravity takes over.");
  setTxt('bridgeCta',isAdv?"Return to the work →":"Enter the adventure world →");
}
function setWorld(adv){
  if(busy||adv===isAdv){placeKnob();return;}
  busy=true; isAdv=adv;
  try{localStorage.setItem('world',adv?'adv':'pro');}catch(e){}
  const wipe=$('wipe');
  if(!wipe){applyWorldChrome();busy=false;return;}
  const r=(knob||document.body).getBoundingClientRect();
  const ox=knob?r.left+r.width/2:innerWidth*.9, oy=knob?r.top+r.height/2:40;
  wipe.className=isAdv?'adv':'pro';
  wipe.style.clipPath=`circle(0% at ${ox}px ${oy}px)`;
  void wipe.offsetWidth;
  wipe.style.clipPath=`circle(150% at ${ox}px ${oy}px)`;
  setTimeout(()=>{
    applyWorldChrome();
    document.querySelectorAll('.rev').forEach(e=>e.classList.remove('vis'));
    requestAnimationFrame(()=>document.querySelectorAll('.rev').forEach(e=>{
      const b=e.getBoundingClientRect(); if(b.top<innerHeight&&b.bottom>0)e.classList.add('vis');
    }));
    document.querySelectorAll('[data-count]').forEach(runCount);
    document.documentElement.style.scrollBehavior='auto';
    scrollTo(0,0); document.documentElement.style.scrollBehavior='';
  },640);
  setTimeout(()=>{ wipe.style.clipPath=''; setTimeout(()=>{wipe.className='';busy=false;},800); },1300);
}
if(btnPro)btnPro.addEventListener('click',()=>setWorld(false));
if(btnAdv)btnAdv.addEventListener('click',()=>setWorld(true));
// in-menu world switch (phones)
document.querySelectorAll('.mw').forEach(b=>b.addEventListener('click',()=>{
  document.body.classList.remove('menu'); document.body.style.overflow='';
  if(burger){burger.setAttribute('aria-expanded','false');}
  setWorld(b.dataset.world==='adv');
}));
const bridgeCta=$('bridgeCta'); if(bridgeCta)bridgeCta.addEventListener('click',()=>setWorld(!isAdv));
addEventListener('load',()=>setTimeout(placeKnob,50));
addEventListener('resize',placeKnob);
setTimeout(placeKnob,300);
applyWorldChrome();

/* ════════ REVEAL (observer + viewport pass + hard failsafe) ════════ */
function initReveal(){
  const all=[...document.querySelectorAll('.rev')];
  const obs=new IntersectionObserver(es=>es.forEach(e=>{if(e.isIntersecting)e.target.classList.add('vis')}),
    {threshold:.12,rootMargin:'0px 0px -40px 0px'});
  all.forEach((el,i)=>{el.style.transitionDelay=(i%4)*.06+'s';obs.observe(el)});
  // immediate pass: anything already in view reveals now (covers observer lag)
  const pass=()=>all.forEach(el=>{const r=el.getBoundingClientRect();
    if(r.top<innerHeight*1.05&&r.bottom>-40)el.classList.add('vis');});
  requestAnimationFrame(pass);
  addEventListener('scroll',pass,{passive:true});
  // hard failsafe: nothing may stay invisible even if transitions are throttled
  setTimeout(()=>all.forEach(el=>{el.classList.add('vis');el.style.opacity='1';el.style.transform='none';}),1800);
}

/* ════════ COUNTERS ════════ */
function runCount(el){
  const t=+el.dataset.count; if(!t)return;
  const sfx=el.dataset.suffix||''; let v=0; const step=t/45;
  clearInterval(el._t);
  el._t=setInterval(()=>{v+=step;if(v>=t){v=t;clearInterval(el._t);}el.textContent=Math.floor(v)+sfx;},26);
}
function initCounters(){
  const obs=new IntersectionObserver(es=>es.forEach(e=>{if(e.isIntersecting){runCount(e.target);obs.unobserve(e.target);}}),{threshold:.6});
  document.querySelectorAll('[data-count]').forEach(el=>obs.observe(el));
}

/* ════════ ACTIVE NAV ════════ */
const links=[...document.querySelectorAll('.nav-links a')];
if(links.length){
  const spy=new IntersectionObserver(es=>es.forEach(e=>{if(e.isIntersecting){
    const id='#'+e.target.id; links.forEach(a=>a.classList.toggle('active',a.getAttribute('href')===id));}}),
    {rootMargin:'-45% 0px -50% 0px'});
  ['numbers','services','receipts','stories','contact'].forEach(id=>{const s=$(id);if(s)spy.observe(s);});
}

/* ════════ CURSOR (smooth luxury) ════════ */
const cur=$('cur'),curR=$('cur-r');
if(cur&&curR){
  let mx=innerWidth/2,my=innerHeight/2,dx=mx,dy=my,rx=mx,ry=my,seen=false;
  cur.style.opacity='0';curR.style.opacity='0';
  addEventListener('mousemove',e=>{mx=e.clientX;my=e.clientY;
    if(!seen){seen=true;dx=rx=mx;dy=ry=my;cur.style.opacity='';curR.style.opacity='';}},{passive:true});
  addEventListener('mousedown',()=>document.body.classList.add('down'));
  addEventListener('mouseup',()=>document.body.classList.remove('down'));
  (function loop(){
    dx+=(mx-dx)*.30; dy+=(my-dy)*.30; rx+=(mx-rx)*.14; ry+=(my-ry)*.14;
    cur.style.transform=`translate3d(${dx}px,${dy}px,0)`;
    curR.style.transform=`translate3d(${rx}px,${ry}px,0)`;
    requestAnimationFrame(loop);
  })();
  const hov=()=>document.body.classList.add('hov'), off=()=>document.body.classList.remove('hov');
  document.querySelectorAll('a,button,.serv,.rec,.story,.hero-pill,input,select,textarea,.toggle,.cert,.adv-card').forEach(el=>{
    el.addEventListener('mouseenter',hov); el.addEventListener('mouseleave',off);
  });
}

/* ════════ MAGNETIC ════════ */
document.querySelectorAll('.magnetic').forEach(el=>{
  el.addEventListener('mousemove',function(e){const r=this.getBoundingClientRect();
    this.style.transform=`translate(${(e.clientX-r.left-r.width/2)*.12}px,${(e.clientY-r.top-r.height/2)*.12}px)`;});
  el.addEventListener('mouseleave',function(){this.style.transform='';});
});

/* ════════ MOBILE MENU ════════ */
const burger=$('burger');
if(burger){
  const menu=f=>{const o=f!==undefined?f:!document.body.classList.contains('menu');
    document.body.classList.toggle('menu',o);burger.setAttribute('aria-expanded',String(o));
    document.body.style.overflow=o?'hidden':'';};
  burger.addEventListener('click',()=>menu());
  document.querySelectorAll('.mmenu a').forEach(a=>a.addEventListener('click',()=>menu(false)));
  addEventListener('keydown',e=>{if(e.key==='Escape')menu(false);});
}

/* ════════ CONTACT FORM (Netlify Forms, AJAX) ════════ */
const form=document.querySelector('.cf');
if(form){
  const btn=form.querySelector('.f-btn');
  const status=$('cfStatus');
  const say=(msg,ok)=>{ if(status){status.textContent=msg;status.className='cf-status '+(ok?'ok':'err');} };
  form.addEventListener('submit',e=>{
    e.preventDefault();
    const data=new FormData(form);
    const name=(data.get('name')||'').toString().trim();
    const email=(data.get('email')||'').toString().trim();
    if(!name||!email){ say('Please add your name and email.',false); return; }
    btn.textContent='Sending…'; say('',true);
    fetch('/',{method:'POST',headers:{'Content-Type':'application/x-www-form-urlencoded'},
      body:new URLSearchParams(data).toString()})
      .then(r=>{ if(!r.ok) throw new Error(); form.reset();
        btn.textContent='Send message →'; say("Thanks — I'll reply within 24 hours.",true); })
      .catch(()=>{ btn.textContent='Send message →';
        say('Something went wrong. Please email mr.santhosh.ceo@gmail.com directly.',false); });
  });
}

/* ════════ COPY-TO-CLIPBOARD (contact page) ════════ */
document.querySelectorAll('[data-copy]').forEach(el=>{
  el.addEventListener('click',()=>{
    navigator.clipboard?.writeText(el.dataset.copy);
    const o=el.textContent; el.textContent='Copied ✓'; setTimeout(()=>el.textContent=o,1500);
  });
});

/* ════════ HERO PARALLAX (live depth — aurora reacts to scroll + cursor) ════════ */
(function(){
  let reduce=false; try{reduce=matchMedia('(prefers-reduced-motion:reduce)').matches;}catch(e){}
  const hero=$('hero'); if(!hero||reduce) return;
  const aur=document.querySelector('.hero-aurora');
  if(!aur) return;
  let coarse=false; try{coarse=matchMedia('(pointer:coarse)').matches;}catch(e){}
  let sy=0,mx=0,my=0,raf=null;
  function kick(){ if(raf==null) raf=requestAnimationFrame(apply); }
  function apply(){
    raf=null;
    const p=Math.min(sy,900);
    aur.style.transform=`translate3d(${mx*24}px, ${my*16 - p*0.05}px, 0)`;
  }
  addEventListener('scroll',()=>{sy=scrollY;kick();},{passive:true});
  if(!coarse) hero.addEventListener('mousemove',e=>{
    const r=hero.getBoundingClientRect();
    mx=(e.clientX-r.left)/r.width-0.5; my=(e.clientY-r.top)/r.height-0.5; kick();
  },{passive:true});
  apply();
})();

/* reduced motion */
if(matchMedia('(prefers-reduced-motion:reduce)').matches){
  document.querySelectorAll('.rev').forEach(e=>e.classList.add('vis'));
}

/* ════════ SCROLL PROGRESS BAR ════════ */
(function(){
  const prog=$('prog'); if(!prog) return;
  const upd=()=>{ const h=document.documentElement; const m=h.scrollHeight-h.clientHeight;
    prog.style.width=(m>0?Math.min(100,scrollY/m*100):0)+'%'; };
  addEventListener('scroll',upd,{passive:true}); addEventListener('resize',upd,{passive:true}); upd();
})();
