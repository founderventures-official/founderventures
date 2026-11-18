/* Founder Ventures — site script */
(function(){
  const $ = (s, r=document) => r.querySelector(s);
  const $$ = (s, r=document) => Array.from(r.querySelectorAll(s));
  const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* ---------- Data ---------- */
  const PORTFOLIO = {
    '2026': ['BuyGive','Rendz','LiteHouse','Greenzy','DeChord','iSight','Endorphyne','Apero','Lumora Studio','Empowerment Fund','OptiSolve','FocusFive','Clearview Labs','Propwise','OpenPath','HelixOne','Solara Works','Lumin'],
    '2024': ['Joynus','JINGL','RePlant','Achid','Dreamset','Healthyi','NoCodemy','Youth Impact Fund','V.Farm','BeginHer','LEAD Initiative','SoundEng','Planterz','A2Z'],
    '2023': ['Cryptoray','GreenGen','MalarErase','EduRev','Hope Harbor','Radiont','Forizon','Inifinition']
  };

  /* ---------- CTA template ---------- */
  $$('[data-cta]').forEach(s => s.appendChild($('#ctaTpl').content.cloneNode(true)));


  /* ---------- Portfolio ---------- */
  const batches = $('#batches');
  if(batches) batches.innerHTML = Object.keys(PORTFOLIO).sort().reverse().map(y => `
    <div class="batch" data-batch="${y}">
      <div class="batch-head" data-reveal><h2 class="h3">${y} <em>Batch</em></h2><span>${PORTFOLIO[y].length} ventures</span></div>
      <div class="pgrid chips">${PORTFOLIO[y].map((n,i)=>`<div class="pcell chip" style="--i:${i}"><b>${n}</b><small>${y}</small></div>`).join('')}</div>
    </div>`).join('');
  const recent = document.getElementById('recent');
  if(recent){ recent.classList.add('chips'); recent.innerHTML = PORTFOLIO['2026'].slice(0,12).map((n,i)=>`<div class="pcell chip" style="--i:${i}"><b>${n}</b><small>2026 Batch</small></div>`).join(''); }
  if($('#filter')) $('#filter').addEventListener('click', e => {
    const b = e.target.closest('button'); if(!b) return;
    $$('#filter button').forEach(x => x.classList.toggle('on', x===b));
    const f = b.dataset.f;
    $$('.batch').forEach(el => {
      const show = f==='all' || el.dataset.batch===f;
      el.style.display = show ? '' : 'none';
      if(show){ const c=$('.chips',el); c.classList.remove('in'); void c.offsetWidth; requestAnimationFrame(()=>c.classList.add('in')); }
    });
  });

  /* ---------- Reveal ---------- */
  let io;
  function observeReveals(scope){
    if(io) io.disconnect();
    io = new IntersectionObserver(entries => {
      entries.forEach(en => { if(en.isIntersecting){ en.target.classList.add('in'); io.unobserve(en.target);} });
    }, {threshold:.15, rootMargin:'0px 0px -6% 0px'});
    $$('[data-reveal], .chips', scope).forEach(el => { el.classList.remove('in'); io.observe(el); });
  }

  /* ---------- Page ---------- */
  const PAGE = document.body.dataset.page || 'home';
  function setActive(id){
    const key = id==='application' ? 'apply' : id;
    $$('[data-link]').forEach(a => { const on = a.dataset.link===key; a.classList.toggle('active', on); if(on) a.setAttribute('aria-current','page'); });
  }

  /* ---------- Header / progress / parallax ---------- */
  const header = $('#header'), bar = $('#progress');
  function onScroll(){
    const y = scrollY;
    header.classList.toggle('scrolled', y > 20);
    const h = document.documentElement.scrollHeight - innerHeight;
    bar.style.transform = `scaleX(${h>0 ? y/h : 0})`;
    if(!reduce && innerWidth > 960){
      $$('.page.active [data-parallax]').forEach(el => {
        const r = el.getBoundingClientRect();
        const p = (r.top + r.height/2 - innerHeight/2) / innerHeight;
        const kids = el.children;
        if(kids[0]) kids[0].style.translate = `0 ${p*-30}px`;
        if(kids[2]) kids[2].style.translate = `0 ${p*30}px`;
      });
    }
  }
  addEventListener('scroll', onScroll, {passive:true});

  /* ---------- Mobile menu ---------- */
  const burger = $('#burger'), mmenu = $('#mmenu');
  function openMenu(){ document.body.classList.add('menu-open','lock'); burger.setAttribute('aria-expanded','true'); burger.setAttribute('aria-label','Close menu'); mmenu.setAttribute('aria-hidden','false'); }
  function closeMenu(){ document.body.classList.remove('menu-open','lock'); burger.setAttribute('aria-expanded','false'); burger.setAttribute('aria-label','Open menu'); mmenu.setAttribute('aria-hidden','true'); }
  burger.addEventListener('click', () => document.body.classList.contains('menu-open') ? closeMenu() : openMenu());
  addEventListener('keydown', e => { if(e.key==='Escape') closeMenu(); });
  addEventListener('resize', () => { if(innerWidth > 960) closeMenu(); });

  /* ---------- Card tilt + spotlight ---------- */
  if(!reduce && matchMedia('(hover:hover)').matches){
    $$('[data-tilt]').forEach(c => {
      c.addEventListener('mousemove', e => {
        const r = c.getBoundingClientRect(), x = (e.clientX-r.left)/r.width, y = (e.clientY-r.top)/r.height;
        c.style.transform = `perspective(900px) rotateX(${(.5-y)*7}deg) rotateY(${(x-.5)*7}deg) translateY(-4px)`;
        c.style.setProperty('--mx', x*100+'%'); c.style.setProperty('--my', y*100+'%');
      });
      c.addEventListener('mouseleave', () => { c.style.transform = ''; });
    });
  }

  /* ---------- Toast ---------- */
  let tt;
  function toast(msg){ const t=$('#toast'); t.textContent = msg; t.classList.add('show'); clearTimeout(tt); tt=setTimeout(()=>t.classList.remove('show'), 3200); }
  $$('[data-soon]').forEach(b => b.addEventListener('click', () => toast(`${b.dataset.soon} — download link coming soon.`)));

  /* ---------- Globe ---------- */
  (function globe(){
    const cv = $('#globe'); if(!cv) return;
    const ctx = cv.getContext('2d');
    const N = 64, pts = [];
    const ga = Math.PI*(3-Math.sqrt(5));
    for(let i=0;i<N;i++){ const y=1-(i/(N-1))*2, r=Math.sqrt(1-y*y), t=ga*i; pts.push([Math.cos(t)*r, y, Math.sin(t)*r]); }
    const edges = [];
    for(let i=0;i<N;i++) for(let j=i+1;j<N;j++){ const d=Math.hypot(pts[i][0]-pts[j][0],pts[i][1]-pts[j][1],pts[i][2]-pts[j][2]); if(d<.48) edges.push([i,j]); }
    // a few long arcs for the "constellation" look
    for(let k=0;k<14;k++) edges.push([(k*7)%N, (k*13+20)%N]);
    let W=0,H=0,dpr=1, ry=0, rx=.35, mx=0, my=0, tmx=0, tmy=0, visible=true;
    function size(){ dpr=Math.min(devicePixelRatio||1,2); const r=cv.getBoundingClientRect(); W=r.width; H=r.height; cv.width=W*dpr; cv.height=H*dpr; ctx.setTransform(dpr,0,0,dpr,0,0); }
    new ResizeObserver(size).observe(cv); size();
    new IntersectionObserver(e => visible = e[0].isIntersecting).observe(cv);
    addEventListener('pointermove', e => { tmx=(e.clientX/innerWidth-.5); tmy=(e.clientY/innerHeight-.5); }, {passive:true});
    function proj(p){
      const cy=Math.cos(ry+mx*.8), sy=Math.sin(ry+mx*.8), cx=Math.cos(rx+my*.5), sx=Math.sin(rx+my*.5);
      let x=p[0]*cy - p[2]*sy, z=p[0]*sy + p[2]*cy, y=p[1];
      const y2=y*cx - z*sx, z2=y*sx + z*cx;
      return [x, y2, z2];
    }
    function arc(a,b,R,cxp,cyp){
      // draw great-circle-ish curve by slerp
      const steps=14; ctx.beginPath();
      let za=0;
      for(let s=0;s<=steps;s++){
        const t=s/steps; let v=[a[0]+(b[0]-a[0])*t, a[1]+(b[1]-a[1])*t, a[2]+(b[2]-a[2])*t];
        const l=Math.hypot(...v); v=v.map(c=>c/l); const q=proj(v); za+=q[2];
        s?ctx.lineTo(cxp+q[0]*R, cyp+q[1]*R):ctx.moveTo(cxp+q[0]*R, cyp+q[1]*R);
      }
      return za/(steps+1);
    }
    function frame(){
      requestAnimationFrame(frame);
      if(!visible || !$('.page[data-page="home"]').classList.contains('active')) return;
      if(!reduce) ry += .0028;
      mx += (tmx-mx)*.05; my += (tmy-my)*.05;
      ctx.clearRect(0,0,W,H);
      const R=Math.min(W,H)/2*.9, cx=W/2, cy=H/2;
      ctx.lineWidth=1.2; ctx.strokeStyle='rgba(255,255,255,.75)';
      ctx.beginPath(); ctx.arc(cx,cy,R,0,Math.PI*2); ctx.stroke();
      ctx.lineWidth=.9;
      for(const [i,j] of edges){
        const z = arc(pts[i],pts[j],R,cx,cy);
        ctx.strokeStyle=`rgba(255,255,255,${.08+(z+1)/2*.62})`; ctx.stroke();
      }
      const P = pts.map(proj).sort((a,b)=>a[2]-b[2]);
      for(const q of P){
        const a=(q[2]+1)/2;
        ctx.beginPath(); ctx.fillStyle=`rgba(255,255,255,${.25+a*.75})`;
        ctx.arc(cx+q[0]*R, cy+q[1]*R, 1.2+a*2.6, 0, Math.PI*2); ctx.fill();
        if(a>.92){ ctx.beginPath(); ctx.fillStyle='rgba(123,125,255,.35)'; ctx.arc(cx+q[0]*R, cy+q[1]*R, 7, 0, Math.PI*2); ctx.fill(); }
      }
    }
    frame();
  })();


  /* ---------- About hero: neon paint orb ---------- */
  (function paint(){
    const cv = $('#paint'); if(!cv) return;
    const ctx = cv.getContext('2d');
    const COLORS = ['#3a3cff','#4f5bff','#6f7bff','#2a7bff','#ff2d6f','#ff4a4a','#e0306b','#2dff8f','#b86bff','#ffffff','#5ce1ff'];
    let W=0,H=0,dpr=1,P=[],visible=true,t=0,mx=-1e4,my=-1e4;
    function gauss(){ let u=0,v=0; while(!u)u=Math.random(); while(!v)v=Math.random(); return Math.sqrt(-2*Math.log(u))*Math.cos(2*Math.PI*v); }
    function build(){
      const N = Math.round(Math.min(4200, W*H/34));
      P = [];
      for(let i=0;i<N;i++){
        // denser core, sprinkled edges; colour clusters by angle for painted "streaks"
        const r = Math.min(1, Math.random()<.55 ? Math.sqrt(Math.random())*.82 : Math.abs(gauss())*.36);
        const a = Math.random()*Math.PI*2;
        const band = (Math.sin(a*3 + r*5)+1)/2;
        const c = Math.random()<.12 ? COLORS[Math.floor(Math.random()*COLORS.length)]
                : band>.62 ? COLORS[4+Math.floor(Math.random()*3)]
                : band<.25 ? COLORS[7+Math.floor(Math.random()*2)]
                : COLORS[Math.floor(Math.random()*4)];
        P.push({a, r, s:(Math.random()**3)*2.6+.35, c, sp:(.0006+Math.random()*.0012)*(1.25-r), ph:Math.random()*6.28, ox:0, oy:0, tw:Math.random()});
      }
    }
    function size(){ dpr=Math.min(devicePixelRatio||1,2); const r=cv.getBoundingClientRect(); W=r.width; H=r.height; if(!W) return; cv.width=W*dpr; cv.height=H*dpr; ctx.setTransform(dpr,0,0,dpr,0,0); build(); }
    new ResizeObserver(size).observe(cv); size();
    new IntersectionObserver(e => visible = e[0].isIntersecting).observe(cv);
    cv.addEventListener('pointermove', e => { const r=cv.getBoundingClientRect(); mx=e.clientX-r.left; my=e.clientY-r.top; });
    cv.addEventListener('pointerleave', () => { mx=my=-1e4; });
    function frame(){
      requestAnimationFrame(frame);
      if(!visible || !W || !$('.page[data-page="about"]').classList.contains('active')) return;
      t += reduce ? 0 : 1;
      ctx.clearRect(0,0,W,H);
      ctx.globalCompositeOperation='lighter';
      const R=Math.min(W,H)/2*.92, cx=W/2, cy=H/2;
      for(const p of P){
        p.a += reduce?0:p.sp;
        const wob = Math.sin(t*.01 + p.ph)*.015;
        let x = cx + Math.cos(p.a)*(p.r+wob)*R, y = cy + Math.sin(p.a)*(p.r+wob)*R*.98;
        const dx=x-mx, dy=y-my, d2=dx*dx+dy*dy;
        if(d2<6400){ const f=(1-d2/6400)*18; const d=Math.sqrt(d2)||1; p.ox+=dx/d*f*.12; p.oy+=dy/d*f*.12; }
        p.ox*=.92; p.oy*=.92; x+=p.ox; y+=p.oy;
        const edge = 1 - Math.max(0,(p.r-.7)/.3);
        const twinkle = .55 + .45*Math.sin(t*.03 + p.tw*20);
        ctx.globalAlpha = Math.max(0, edge) * (.35 + .65*twinkle);
        ctx.fillStyle = p.c;
        ctx.beginPath(); ctx.arc(x,y,p.s,0,Math.PI*2); ctx.fill();
      }
      ctx.globalAlpha=1; ctx.globalCompositeOperation='source-over';
    }
    frame();
  })();




  /* ---------- Stats count-up ---------- */
  (function(){
    const io3 = new IntersectionObserver(es => es.forEach(e => {
      if(!e.isIntersecting) return; io3.unobserve(e.target);
      const el=e.target, to=+el.dataset.count, suf=el.dataset.suffix||'';
      if(reduce){ el.textContent=to+suf; return; }
      const t0=performance.now(), dur=1400;
      const step=now=>{ const k=Math.min(1,(now-t0)/dur), v=Math.round(to*(1-Math.pow(1-k,3))); el.textContent=v+suf; if(k<1) requestAnimationFrame(step); };
      requestAnimationFrame(step);
    }), {threshold:.6});
    $$('[data-count]').forEach(el => io3.observe(el));
  })();

  /* ---------- Founder quotes ---------- */
  (function(){
    const v=$('.voices'); if(!v) return;
    const qs=$$('.q',v), cnt=$('.q-count b',v); let i=0, t;
    const D=120;
    const show=(n,dir)=>{
      n=(n+qs.length)%qs.length; if(n===i) return;
      const cur=qs[i], nxt=qs[n];
      if(!reduce){ nxt.style.transition='none'; nxt.style.transform=`translateX(${dir*D}px)`; void nxt.offsetWidth; nxt.style.transition=''; }
      nxt.style.transform='';
      cur.style.transform = reduce ? '' : `translateX(${-dir*D}px)`;
      cur.classList.remove('on'); nxt.classList.add('on');
      i=n; cnt.textContent=String(i+1).padStart(2,'0');
    };
    const auto=()=>{ clearInterval(t); if(!reduce) t=setInterval(()=>show(i+1,1),7000); };
    $('.q-next',v).onclick=()=>{ show(i+1,1); auto(); }; $('.q-prev',v).onclick=()=>{ show(i-1,-1); auto(); };
    auto();
  })();

  if($('#appForm')){
  /* ---------- Application form ---------- */
  const fld = (id,label,opts={}) => {
    const {type='text', req=false, full=false, select=null, name=id} = opts;
    const star = req ? '<span class="req-star">*</span>' : '';
    const input = select
      ? `<select id="${id}" name="${name}" ${req?'required':''}><option value="" selected disabled hidden></option>${select.map(o=>`<option>${o}</option>`).join('')}</select>`
      : `<input id="${id}" name="${name}" type="${type}" ${req?'required':''} ${type==='email'?'autocomplete="email"':''} ${type==='tel'?'autocomplete="tel" inputmode="tel"':''}>`;
    return `<div class="field${select?' sel':''}${full?' full':''}"><label for="${id}">${label}${star}</label>${input}</div>`;
  };
  let mCount=0, gCount=0;
  function addMember(){
    mCount++; const n=mCount, p=`m${n}`;
    const el=document.createElement('div'); el.className='member'; el.dataset.n=n;
    el.innerHTML = `<h2 class="member-sub" style="font-size:clamp(22px,2.4vw,28px)">Member ${n}${n>2?'<button type="button" class="rm">Remove</button>':''}</h2>
      <div class="fgrid">
        ${fld(p+'-first','First name',{req:n<=2})}${fld(p+'-last','Last name',{req:n<=2})}
        ${fld(p+'-gender','Gender',{select:['Female','Male','Non-binary','Prefer not to say']})}${fld(p+'-dob','Date of birth',{type:'date',req:n<=2})}
        ${fld(p+'-nat','Nationality')}${fld(p+'-aff','Affiliation (optional)')}
        ${fld(p+'-email','Email',{type:'email',req:n<=2})}${fld(p+'-phone','Phone',{type:'tel'})}
      </div>`;
    $('#members').appendChild(el);
    const rm=$('.rm',el); if(rm) rm.onclick=()=>{ el.remove(); renumber('#members','Member'); };
  }
  function addGuardian(){
    gCount++; const n=gCount, p=`g${n}`;
    const el=document.createElement('div'); el.className='member'; el.dataset.n=n;
    el.innerHTML = `<h2 class="member-sub" style="font-size:clamp(20px,2.2vw,26px);align-items:flex-start;gap:16px"><span>Member ${n} guardian information<small style="display:block;font-size:14px;font-weight:400;color:var(--dim);margin-top:8px;line-height:1.5">Required for applicants under 18. Leave blank if this member is 18 or older.</small></span>${n>2?'<button type="button" class="rm">Remove</button>':''}</h2>
      <div class="fgrid">
        ${fld(p+'-first','First name')}${fld(p+'-last','Last name')}
        ${fld(p+'-rel','Relationship to applicant',{select:['Parent','Legal guardian','Other']})}<div class="field" aria-hidden="true" style="visibility:hidden"></div>
        ${fld(p+'-email','Email',{type:'email'})}${fld(p+'-phone','Phone',{type:'tel'})}
      </div>`;
    $('#guardians').appendChild(el);
    const rm=$('.rm',el); if(rm) rm.onclick=()=>{ el.remove(); renumber('#guardians','Member'); };
  }
  function renumber(sel){
    const list=$$(sel+' .member');
    list.forEach((el,i)=>{ const h=$('.member-sub',el); const t=h.firstChild; if(t.nodeType===3) t.textContent=`Member ${i+1}`; else { const s=h.querySelector('span'); if(s && s.firstChild) s.firstChild.textContent=`Member ${i+1} guardian information`; } });
    if(sel==='#members') mCount=list.length; else gCount=list.length;
  }
  addMember(); addMember(); addGuardian(); addGuardian();
  $('#addMember').onclick = () => { addMember(); };
  $('#addGuardian').onclick = () => { addGuardian(); };

  $$('.opt').forEach(o => o.addEventListener('click', () => {
    $$('.opt').forEach(x => x.setAttribute('aria-pressed', String(x===o)));
    $('#trackInput').value = o.dataset.track;
  }));

  const up=$('#upload'), file=$('#file');
  file.addEventListener('change', () => { $('#fileLabel').innerHTML = file.files[0] ? `<span class="fname">${file.files[0].name.replace(/</g,'&lt;')}</span> selected` : 'Click to upload a file'; });
  ['dragenter','dragover'].forEach(ev => up.addEventListener(ev, e => { e.preventDefault(); up.classList.add('drag'); }));
  ['dragleave','drop'].forEach(ev => up.addEventListener(ev, e => { up.classList.remove('drag'); }));
  up.addEventListener('drop', e => { e.preventDefault(); if(e.dataTransfer.files.length){ file.files = e.dataTransfer.files; file.dispatchEvent(new Event('change')); } });

  $('#appForm').addEventListener('input', e => { const f=e.target.closest('.field'); if(f) f.classList.remove('invalid'); });
  $('#appForm').addEventListener('change', e => { const f=e.target.closest('.field'); if(f) f.classList.remove('invalid'); });

  /* ---------- Save draft (stored only in this browser) ---------- */
  const DRAFT_KEY = 'fv-application-draft-v1';
  const M_KEYS = ['first','last','gender','dob','nat','aff','email','phone'], G_KEYS = ['first','last','rel','email','phone'], P_IDS = ['p-name','p-date','p-country','p-size','p-sum'];
  const store = { get(){ try{ return JSON.parse(localStorage.getItem(DRAFT_KEY)||'null'); }catch(_){ return null; } },
                  set(v){ try{ localStorage.setItem(DRAFT_KEY, JSON.stringify(v)); return true; }catch(_){ return false; } },
                  clear(){ try{ localStorage.removeItem(DRAFT_KEY); }catch(_){} } };
  const grab = (sel, keys) => $$(sel+' .member').map(el => Object.fromEntries(keys.map(k => [k, (el.querySelector(`[id$="-${k}"]`)||{}).value || ''])));
  function saveDraft(){
    const d = { savedAt: Date.now(), track: $('#trackInput').value, project: Object.fromEntries(P_IDS.map(id => [id, $('#'+id).value])),
                members: grab('#members', M_KEYS), guardians: grab('#guardians', G_KEYS), consent: $('#consent').checked };
    return store.set(d);
  }
  function fillBlocks(sel, rows, keys, add){
    while($$(sel+' .member').length < rows.length) add();
    $$(sel+' .member').forEach((el,i) => { const r = rows[i]; if(!r) return; keys.forEach(k => { const inp = el.querySelector(`[id$="-${k}"]`); if(inp && r[k] != null) inp.value = r[k]; }); });
  }
  function restoreDraft(){
    const d = store.get(); if(!d) return;
    fillBlocks('#members', d.members||[], M_KEYS, addMember);
    fillBlocks('#guardians', d.guardians||[], G_KEYS, addGuardian);
    P_IDS.forEach(id => { if(d.project && d.project[id] != null) $('#'+id).value = d.project[id]; });
    if(d.track){ $('#trackInput').value = d.track; $$('.opt').forEach(o => o.setAttribute('aria-pressed', String(o.dataset.track === d.track))); }
    $('#consent').checked = !!d.consent;
    const t = new Date(d.savedAt);
    $('#draftTime').textContent = t.toLocaleString(undefined, {month:'short', day:'numeric', hour:'numeric', minute:'2-digit'});
    $('#draftBar').hidden = false;
  }
  $('#saveDraft').addEventListener('click', () => {
    if(saveDraft()){
      $('#draftBar').hidden = true;
      toast(file.files[0] ? 'Draft saved on this device. Your pitch deck file isn’t saved — re-attach it when you return.' : 'Draft saved on this device.');
    } else toast('Couldn’t save a draft in this browser (private browsing may block it).');
  });
  $('#draftClear').addEventListener('click', () => {
    store.clear(); $('#appForm').reset();
    $$('#members .member').slice(2).forEach(el => el.remove()); $$('#guardians .member').slice(2).forEach(el => el.remove());
    renumber('#members'); renumber('#guardians');
    $$('.opt').forEach(o => o.setAttribute('aria-pressed','false')); $('#trackInput').value = '';
    $('#fileLabel').textContent = 'Click to upload a file';
    $$('#appForm .invalid').forEach(el => el.classList.remove('invalid'));
    $('#draftBar').hidden = true; toast('Draft discarded.');
  });
  restoreDraft();

  /* ---------- Submit application ---------- */
  // Paste your Google Apps Script web app URL here (ends in /exec).
  const APPLY_ENDPOINT = window.FV_APPLY_ENDPOINT || 'https://script.google.com/macros/s/AKfycbw8U0RYygMz-RKYFxZcGzjHTJ4fpEezNNx9fcx2n0IV068bh1CsHEen8L7XrHeYeqo/exec';
  const MAX_MB = 20, OK_EXT = ['pdf','ppt','pptx','key'];
  const v = (root, suf) => { const el = root.querySelector(`[id$="-${suf}"]`); return el ? el.value.trim() : ''; };
  const ageFrom = dob => { const d=new Date(dob); if(isNaN(d)) return null; const n=new Date(); let a=n.getFullYear()-d.getFullYear(); const m=n.getMonth()-d.getMonth(); if(m<0||(m===0&&n.getDate()<d.getDate())) a--; return a; };
  const toB64 = f => new Promise((res,rej) => { const r=new FileReader(); r.onload=()=>res(String(r.result).split(',')[1]); r.onerror=()=>rej(r.error); r.readAsDataURL(f); });
  const flag = (el, msg) => { el.scrollIntoView({behavior:'smooth',block:'center'}); const i=el.querySelector('input,select,textarea'); if(i) i.focus({preventScroll:true}); toast(msg); };
  $('#consent').addEventListener('change', () => $('#consentRow').classList.remove('invalid'));
  file.addEventListener('change', () => up.classList.remove('invalid'));
  let busy = false;
  function setBusy(on){
    busy = on; const b=$('#submitBtn'); b.disabled = on;
    b.querySelector('.lbl').textContent = on ? 'Submitting…' : 'Submit application';
    b.querySelector('.arr').outerHTML = on ? '<span class="arr spin"></span>' : '<span class="arr">→</span>';
  }
  $('#appForm').addEventListener('submit', async e => {
    e.preventDefault();
    if(busy) return;
    const form = e.target;
    // 1. required fields
    let bad=null;
    $$('[required]', form).forEach(i => { const ok=i.value.trim()!=='' && i.checkValidity(); i.closest('.field').classList.toggle('invalid', !ok); if(!ok && !bad) bad=i; });
    if(bad){ flag(bad.closest('.field'), 'Please fill in the highlighted fields.'); return; }
    if(!$('#trackInput').value){ flag($('.track-pick'), 'Please select a track.'); return; }
    // 2. team members + eligibility
    const members = $$('#members .member').map(el => ({
      first:v(el,'first'), last:v(el,'last'), gender:v(el,'gender'), dob:v(el,'dob'),
      nationality:v(el,'nat'), affiliation:v(el,'aff'), email:v(el,'email'), phone:v(el,'phone'), _el:el
    })).filter((m,i) => i<2 || m.first || m.last || m.email);
    for(const [i,m] of members.entries()){
      if(!m.first || !m.last || !m.email || !m.dob){ const f=[...m._el.querySelectorAll('.field')].filter(x=>{const inp=x.querySelector('input'); return inp && /-(first|last|email|dob)$/.test(inp.id) && !inp.value.trim();}); f.forEach(x=>x.classList.add('invalid')); flag(f[0]||m._el, `Please complete Member ${i+1}'s name, date of birth and email.`); return; }
      const age = ageFrom(m.dob);
      if(age===null || age<14 || age>28){ const f=m._el.querySelector('[id$="-dob"]').closest('.field'); f.classList.add('invalid'); flag(f, `Member ${i+1} must be aged 14–28 to apply.`); return; }
      m.age = age;
    }
    // 3. guardians (required for under-18 members)
    const gEls = $$('#guardians .member');
    const guardians = gEls.map((el,i) => ({ member:i+1, first:v(el,'first'), last:v(el,'last'), relationship:v(el,'rel'), email:v(el,'email'), phone:v(el,'phone') }));
    for(const [i,m] of members.entries()){
      if(m.age >= 18) continue;
      const g = guardians[i], el = gEls[i];
      if(!g || !g.first || !g.last || !g.email){
        if(!el){ addGuardian(); }
        const box = $$('#guardians .member')[i];
        ['first','last','email'].forEach(k => { const inp=box.querySelector(`[id$="-${k}"]`); if(inp && !inp.value.trim()) inp.closest('.field').classList.add('invalid'); });
        flag(box, `Member ${i+1} is under 18 — please add their parent or guardian's name and email.`); return;
      }
    }
    // 4. pitch deck
    const f = file.files[0];
    if(!f){ up.classList.add('invalid'); flag(up, 'Please attach your pitch deck.'); return; }
    const ext = f.name.split('.').pop().toLowerCase();
    if(!OK_EXT.includes(ext)){ up.classList.add('invalid'); flag(up, 'Pitch deck must be a PDF, PowerPoint or Keynote file.'); return; }
    if(f.size > MAX_MB*1024*1024){ up.classList.add('invalid'); flag(up, `Pitch deck must be under ${MAX_MB} MB.`); return; }
    // 5. consent
    if(!$('#consent').checked){ $('#consentRow').classList.add('invalid'); flag($('#consentRow'), 'Please confirm the declaration to submit.'); return; }
    // 6. send
    if(!APPLY_ENDPOINT){ toast('Submissions aren’t connected yet.'); return; }
    setBusy(true);
    try{
      const payload = {
        website: $('#hp').value,
        track: $('#trackInput').value,
        project: { name:$('#p-name').value.trim(), dateFounded:$('#p-date').value, country:$('#p-country').value.trim(), teamSize:$('#p-size').value, summary:$('#p-sum').value.trim() },
        members: members.map(({_el, ...m}) => m),
        guardians: guardians.filter(g => g.first || g.last || g.email),
        consent: true,
        file: { name:f.name, type:f.type, size:f.size, data: await toB64(f) }
      };
      const res = await fetch(APPLY_ENDPOINT, { method:'POST', headers:{'Content-Type':'text/plain;charset=utf-8'}, body: JSON.stringify(payload) });
      const out = await res.json();
      if(!out.ok) throw new Error(out.error || 'Submission failed');
      $('#doneId').textContent = out.id; $('#toast').classList.remove('show'); store.clear();
      form.hidden = true; $('#appDone').hidden = false;
      $('.page[data-page="application"] .page-head').hidden = true;
      window.scrollTo({top:0, behavior: reduce ? 'auto' : 'smooth'});
    }catch(err){
      toast(err && err.message && !/fetch|network|JSON/i.test(err.message) ? err.message : 'We couldn’t send your application. Please check your connection and try again.');
    }finally{ setBusy(false); }
  });

  }

  /* ---------- Start ---------- */
  observeReveals($('.page.active'));
  setActive(PAGE);
  onScroll();
})();
