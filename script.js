// Unified site script
(function(){
  function ready(fn){ if(document.readyState!=='loading') fn(); else document.addEventListener('DOMContentLoaded', fn); }
  function $id(id){ return document.getElementById(id); }

  ready(function(){
    // ===== Theme (Light/Dark) =====
    (function(){
      const root = document.documentElement;
      // Initial theme from localStorage or system preference
      const stored = localStorage.getItem('theme');
      if(stored==="light"||stored==="dark") root.setAttribute('data-theme', stored);
      else if(window.matchMedia && window.matchMedia('(prefers-color-scheme: light)').matches){
        root.setAttribute('data-theme','light');
      }
      const btn = $id('themeToggle');
      function setLabel(){
        const t = root.getAttribute('data-theme');
        if(btn){ btn.textContent = (t==='light' ? '🌙' : '☀️'); btn.setAttribute('aria-label', t==='light'?'Switch to dark mode':'Switch to light mode'); }
      }
      function setTheme(next){
        if(next==='light'||next==='dark') root.setAttribute('data-theme', next); else root.removeAttribute('data-theme');
        localStorage.setItem('theme', root.getAttribute('data-theme')||'');
        setLabel();
      }
      setLabel();
      if(btn){ btn.addEventListener('click', ()=>{
        const cur = root.getAttribute('data-theme')||'dark';
        setTheme(cur==='light'?'dark':'light');
      }); }
    })();

    // ===== Footer year =====
    (function(){ const y=$id('year'); if(y) y.textContent=new Date().getFullYear(); })();

    // ===== Live Clock & Date =====
    (function(){
      const timeEl=$id('time'), dateEl=$id('date'), tzEl=$id('tz'), fmtBtn=$id('fmtToggle');
      if(tzEl){ try{ tzEl.textContent=Intl.DateTimeFormat().resolvedOptions().timeZone; }catch(e){ tzEl.textContent='Local time'; } }
      let use24 = localStorage.getItem('fmt24')==='true';
      function pad(n){return String(n).padStart(2,'0');}
      function tick(){
        const now=new Date();
        if(dateEl) dateEl.textContent = now.toLocaleDateString(undefined,{weekday:'long',year:'numeric',month:'long',day:'numeric'});
        if(timeEl){
          const h=now.getHours(), m=pad(now.getMinutes()), s=pad(now.getSeconds());
          if(use24) timeEl.textContent = `${pad(h)}:${m}:${s}`;
          else { const h12=((h+11)%12)+1; const ampm=h>=12?'PM':'AM'; timeEl.textContent = `${pad(h12)}:${m}:${s} ${ampm}`; }
        }
      }
      function setFmtBtn(){ if(fmtBtn){ fmtBtn.textContent=use24?'24h':'12h'; fmtBtn.setAttribute('aria-pressed',use24?'true':'false'); } }
      setFmtBtn(); tick(); setInterval(tick,1000);
      if(fmtBtn){ fmtBtn.addEventListener('click',()=>{ use24=!use24; localStorage.setItem('fmt24',String(use24)); setFmtBtn(); tick(); }); }
    })();

    // ===== Calendar =====
    (function(){
      const calendarEl=$id('calendar'), monthEl=$id('calMonth'), prevBtn=$id('prevMonth'), nextBtn=$id('nextMonth');
      if(!calendarEl||!monthEl) return;
      const DOW=['Sun','Mon','Tue','Wed','Thu','Fri','Sat'];
      let cur=new Date(); cur.setDate(1);
      function render(){
        calendarEl.innerHTML='';
        for(const d of DOW){ const el=document.createElement('div'); el.className='dow'; el.textContent=d; calendarEl.appendChild(el); }
        const y=cur.getFullYear(), m=cur.getMonth();
        monthEl.textContent = cur.toLocaleString(undefined,{month:'long',year:'numeric'});
        const firstDow=new Date(y,m,1).getDay();
        const dim=new Date(y,m+1,0).getDate();
        const prevDim=new Date(y,m,0).getDate();
        for(let i=0;i<firstDow;i++){ const c=document.createElement('div'); c.className='cell muted'; c.textContent=String(prevDim-firstDow+1+i); calendarEl.appendChild(c); }
        const today=new Date();
        for(let d=1; d<=dim; d++){ const c=document.createElement('div'); c.className='cell'; c.textContent=String(d);
          if(d===today.getDate()&&m===today.getMonth()&&y===today.getFullYear()){ c.classList.add('today'); c.setAttribute('aria-current','date'); }
          calendarEl.appendChild(c); }
        const total=7 + firstDow + dim; const target=Math.ceil(total/7)*7; const fill=target-total; for(let i=1;i<=fill;i++){ const c=document.createElement('div'); c.className='cell muted'; c.textContent=String(i); calendarEl.appendChild(c); }
      }
      if(prevBtn) prevBtn.addEventListener('click',()=>{ cur.setMonth(cur.getMonth()-1); render(); });
      if(nextBtn) nextBtn.addEventListener('click',()=>{ cur.setMonth(cur.getMonth()+1); render(); });
      render();
    })();

    // ===== Research prompts =====
    (function(){
      const list=[
        'What rheology target (yield stress/viscosity) best balances pumpability and buildability this week?',
        'Can recycled SCMs reach target strength with lower activator molarity? Design a matrix to test.',
        'Try layer time interval sweep: map interlayer bond vs. wait time and humidity.',
        'What is the minimum robot path overlap before cold joints appear? Document visually.',
        'Design a factorial: nozzle diameter × speed × slump flow → dimensional accuracy.',
        'Use micro-CT or image analysis to quantify pore connectivity across layers.',
        'Could bio-based fibers improve green strength without clogging? Pilot 3 specimen batches.'
      ];
      const out=$id('prompt'), btn=$id('nextPrompt');
      function next(){ if(!out) return; out.textContent=list[Math.floor(Math.random()*list.length)]; }
      if(btn) btn.addEventListener('click', next);
    })();

    // ===== Scholar & ScienceDirect search =====
    (function(){
      const scholarForm=$id('scholarForm'), scholarQ=$id('scholarQ');
      if(scholarForm && scholarQ){ scholarForm.addEventListener('submit', (e)=>{ e.preventDefault(); const q=(scholarQ.value||'').trim(); const name='Ashutosh Dwivedi'; const url='https://scholar.google.com/scholar?q='+encodeURIComponent(`${q} author:\"${name}\"`); window.open(url,'_blank'); }); }
      const sdForm=$id('sdForm'), sdQ=$id('sdQ');
      if(sdForm && sdQ){ sdForm.addEventListener('submit', (e)=>{ e.preventDefault(); const q=(sdQ.value||'').trim(); const url='https://www.sciencedirect.com/search?qs='+encodeURIComponent(q)+'&show=100'; window.open(url,'_blank'); }); }
      document.querySelectorAll('.chips').forEach(ch=>{ const targetId=ch.getAttribute('data-target'); const input=$id(targetId); ch.addEventListener('click', ev=>{ const t=ev.target; if(!(t instanceof HTMLElement)) return; if(!t.classList.contains('chip')) return; if(input){ input.value=t.textContent; input.focus(); } }); });
    })();

    // ===== DOI tools (Crossref) =====
    ;(function(){
      const doiInput=$id('doiInput'), openBtn=$id('openDoi');
      if(openBtn&&doiInput){ openBtn.addEventListener('click', ()=>{ const d=(doiInput.value||'').trim().replace(/^https?:\\/\\/doi\\.org\\//i,''); if(!d) return alert('Enter a DOI'); window.open('https://doi.org/'+encodeURIComponent(d),'_blank'); }); }
      const crDoi=$id('crDoi'), getCitation=$id('getCitation'), out=$id('citationOut'), copyCite=$id('copyCitation'), copyBib=$id('copyBibtex');
      async function fetchCrossref(doi){ const url='https://api.crossref.org/works/'+encodeURIComponent(doi); const res=await fetch(url,{headers:{'Accept':'application/json'}}); if(!res.ok) throw new Error('Crossref request failed'); return res.json(); }
      function fmtAuthors(list){ if(!Array.isArray(list)||!list.length) return ''; const names=list.map(a=>((a.given? a.given+' ' : '')+(a.family||'')).trim()).filter(Boolean); return names.length<=2? names.join(', ') : names[0]+', '+names[1]+' et al.'; }
      function makeBib(m){ const year=(m['published-print']?.['date-parts']?.[0]?.[0])||(m['published-online']?.['date-parts']?.[0]?.[0])||''; const title=Array.isArray(m.title)?m.title[0]:m.title||''; const journal=Array.isArray(m['container-title'])?m['container-title'][0]:(m['container-title']||''); const authors=(m.author||[]).map(a=>`${a.family||''}, ${a.given||''}`.trim()).join(' and '); const vol=m.volume||''; const issue=m.issue||''; const page=m.page||''; const doi=m.DOI||''; const keyBase=(m.author&&m.author[0]&&m.author[0].family)? m.author[0].family.replace(/\s+/g,'') : 'ref'; const key=`${keyBase}${year}`; return `@article{${key},\n  title={${title}},\n  author={${authors}},\n  journal={${journal}},\n  year={${year}},\n  volume={${vol}},\n  number={${issue}},\n  pages={${page}},\n  doi={${doi}}\n}`; }
      function makeCite(m){ const authors=fmtAuthors(m.author||[]); const year=(m['published-print']?.['date-parts']?.[0]?.[0])||(m['published-online']?.['date-parts']?.[0]?.[0])||''; const title=Array.isArray(m.title)?m.title[0]:m.title||''; const journal=Array.isArray(m['container-title'])?m['container-title'][0]:(m['container-title']||''); const vol=m.volume||''; const issue=m.issue||''; const page=m.page||''; const doi=m.DOI||''; let cite=`${authors} (${year}). ${title}. ${journal}`; if(vol) cite+=`, ${vol}`; if(issue) cite+=`(${issue})`; if(page) cite+=`, ${page}`; cite+=`. https://doi.org/${doi}`; return cite; }
      async function handle(){ const doi=(crDoi.value||'').trim().replace(/^https?:\\/\\/doi\\.org\\//i,''); if(!doi){ alert('Enter a DOI'); return; } try{ out.textContent='Fetching metadata from Crossref…'; const data=await fetchCrossref(doi); const m=data.message||{}; const citation=makeCite(m); const bib=makeBib(m); out.textContent=citation+'\n\n'+bib; if(copyCite) {copyCite.disabled=false; copyCite.dataset.copy=citation;} if(copyBib){copyBib.disabled=false; copyBib.dataset.copy=bib;} }catch(e){ out.textContent='Could not fetch metadata. Please verify the DOI or try again later.'; if(copyCite) copyCite.disabled=true; if(copyBib) copyBib.disabled=true; } }
      if(getCitation) getCitation.addEventListener('click', handle);
      function doCopy(btn){ const t=btn&&btn.dataset.copy; if(!t) return; navigator.clipboard.writeText(t).then(()=>{ const old=btn.textContent; btn.textContent='Copied!'; setTimeout(()=>btn.textContent=old,1200); }); }
      if(copyCite) copyCite.addEventListener('click', ()=>doCopy(copyCite));
      if(copyBib) copyBib.addEventListener('click', ()=>doCopy(copyBib));
    })();

    // ===== Contact: copy email =====
    (function(){ const btn=$id('copyEmail'); if(!btn) return; const email='ashutoshdwi1@iisc.ac.in'; btn.addEventListener('click', async ()=>{ try{ await navigator.clipboard.writeText(email); const old=btn.textContent; btn.textContent='Copied!'; setTimeout(()=>btn.textContent=old,1500); }catch(e){ alert('Email: '+email); } }); })();

    // ===== Scientific Calculator =====
    ;(function(){
      const input=$id('calcInput'), btn=$id('calcEval'), out=$id('calcOut'), keypad=document.querySelector('.calc-keypad');
      const degToggle=$id('degMode');
      if(!input||!btn||!out) return;
      function toRad(x){ return (degToggle && degToggle.checked) ? (x*Math.PI/180) : x; }
      function fromDegTag(str){ // allow 30deg notation
        return str.replace(/([0-9]*\.?[0-9]+)\s*deg/gi, (m,v)=> String(parseFloat(v)*Math.PI/180));
      }
      function sanitize(expr){
        let s = expr.replace(/\^/g,'**');
        s = fromDegTag(s);
        // Replace allowed functions with Math.*
        s = s.replace(/\bsqrt\(/g,'Math.sqrt(')
             .replace(/\bln\(/g,'Math.log(')
             .replace(/\blog10?\(/g,'Math.log10(')
             .replace(/\bpi\b/gi,'Math.PI')
             .replace(/\be\b/g,'Math.E');
        // trig with degree support via wrapper
        s = s.replace(/\bsin\(/g,'SIN(')
             .replace(/\bcos\(/g,'COS(')
             .replace(/\btan\(/g,'TAN(');
        return s;
      }
      function evalSafe(expr){
        const SIN=(x)=> Math.sin(toRad(x));
        const COS=(x)=> Math.cos(toRad(x));
        const TAN=(x)=> Math.tan(toRad(x));
        const abs=Math.abs, min=Math.min, max=Math.max, pow=Math.pow, floor=Math.floor, ceil=Math.ceil, round=Math.round, random=Math.random;
        // Only allow certain characters
        if(!/^[0-9+*\/%().,\-\sA-Za-z^]*$/.test(expr)) throw new Error('Invalid characters');
        const s = sanitize(expr);
        // eslint-disable-next-line no-new-func
        return Function('Math','SIN','COS','TAN','abs','min','max','pow','floor','ceil','round','random',`"use strict"; return (${s});`)(Math,SIN,COS,TAN,abs,min,max,pow,floor,ceil,round,random);
      }
      function compute(){ try{ const v = evalSafe(input.value || '0'); out.textContent = String(v); } catch(e){ out.textContent = 'Error: ' + e.message; } }
      btn.addEventListener('click', compute);
      input.addEventListener('keydown', (e)=>{ if(e.key==='Enter'){ e.preventDefault(); compute(); } });
      if(keypad){ keypad.addEventListener('click', (ev)=>{ const t=ev.target; if(!(t instanceof HTMLElement)) return; if(t.classList.contains('key')){ if(t.id==='keyClear') input.value=''; else input.setRangeText(t.textContent || '', input.selectionStart, input.selectionEnd, 'end'); input.focus(); } }); }
    })();

  });
})();
