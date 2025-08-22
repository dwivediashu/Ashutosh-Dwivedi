(function(){
  const r=document.documentElement;const t=document.getElementById('themeToggle');
  const s=localStorage.getItem('theme'); if(s) r.setAttribute('data-theme',s);
  function set(){ const th=r.getAttribute('data-theme'); t.textContent= th==='light'?'🌙':'☀️'; }
  if(t){ set(); t.addEventListener('click',()=>{ const cur=r.getAttribute('data-theme')||''; const next= cur==='light'?'':'light'; if(next) r.setAttribute('data-theme',next); else r.removeAttribute('data-theme'); localStorage.setItem('theme',next); set(); }); }
  const y=document.getElementById('year'); if(y) y.textContent=new Date().getFullYear();
})();

// ===== Researcher's Desk Widgets =====
(function(){
  // ---- Clock & Date ----
  const timeEl = document.getElementById('time');
  const dateEl = document.getElementById('date');
  const tzEl = document.getElementById('tz');
  const fmtBtn = document.getElementById('fmtToggle');
  let use24 = localStorage.getItem('fmt24') === 'true';
  function pad(n){return String(n).padStart(2,'0')}
  function tick(){
    const now = new Date();
    const optsDate = {weekday:'long', year:'numeric', month:'long', day:'numeric'};
    dateEl && (dateEl.textContent = now.toLocaleDateString(undefined, optsDate));
    const hours = now.getHours();
    if(use24){
      timeEl && (timeEl.textContent = `${pad(hours)}:${pad(now.getMinutes())}:${pad(now.getSeconds())}`);
    } else {
      const h12 = ((hours + 11) % 12) + 1;
      const ampm = hours >= 12 ? 'PM' : 'AM';
      timeEl && (timeEl.textContent = `${pad(h12)}:${pad(now.getMinutes())}:${pad(now.getSeconds())} ${ampm}`);
    }
  }
  if(tzEl){
    try{ tzEl.textContent = Intl.DateTimeFormat().resolvedOptions().timeZone; }catch(e){ tzEl.textContent = 'Local time'; }
  }
  if(fmtBtn){
    const setBtn = ()=>{ fmtBtn.textContent = use24 ? '24h' : '12h'; fmtBtn.setAttribute('aria-pressed', use24? 'true':'false'); };
    setBtn();
    fmtBtn.addEventListener('click',()=>{ use24 = !use24; localStorage.setItem('fmt24', String(use24)); setBtn(); tick();});
  }
  tick(); setInterval(tick, 1000);

  // ---- Calendar ----
  const calendarEl = document.getElementById('calendar');
  const monthEl = document.getElementById('calMonth');
  const prevBtn = document.getElementById('prevMonth');
  const nextBtn = document.getElementById('nextMonth');
  const DOW = ['Sun','Mon','Tue','Wed','Thu','Fri','Sat'];
  let cur = new Date();
  cur.setDate(1);

  function renderCalendar(){
    if(!calendarEl || !monthEl) return;
    calendarEl.innerHTML = '';
    // Header row: days of week
    for(const d of DOW){
      const h = document.createElement('div'); h.className = 'dow'; h.textContent = d; calendarEl.appendChild(h);
    }
    const year = cur.getFullYear();
    const month = cur.getMonth();
    monthEl.textContent = cur.toLocaleString(undefined, {month:'long', year:'numeric'});
    const firstDow = new Date(year, month, 1).getDay();
    const daysInMonth = new Date(year, month+1, 0).getDate();
    const prevDays = firstDow;
    // previous month fillers
    const prevMonthDays = new Date(year, month, 0).getDate();
    for(let i=0;i<prevDays;i++){
      const cell = document.createElement('div'); cell.className='cell muted'; cell.textContent = String(prevMonthDays - prevDays + 1 + i); calendarEl.appendChild(cell);
    }
    // current month
    const today = new Date();
    for(let d=1; d<=daysInMonth; d++){
      const cell = document.createElement('div'); cell.className='cell'; cell.textContent = String(d);
      if(d===today.getDate() && month===today.getMonth() && year===today.getFullYear()){
        cell.classList.add('today');
        cell.setAttribute('aria-current','date');
      }
      calendarEl.appendChild(cell);
    }
    // next month fillers to complete grid (6 rows total including dow)
    const totalCells = 7 + prevDays + daysInMonth; // +7 for DOW row
    const target = Math.ceil(totalCells/7)*7; // next multiple of 7
    const fillers = target - totalCells;
    for(let i=1;i<=fillers;i++){
      const cell = document.createElement('div'); cell.className='cell muted'; cell.textContent = String(i); calendarEl.appendChild(cell);
    }
  }
  prevBtn && prevBtn.addEventListener('click', ()=>{ cur.setMonth(cur.getMonth()-1); renderCalendar(); });
  nextBtn && nextBtn.addEventListener('click', ()=>{ cur.setMonth(cur.getMonth()+1); renderCalendar(); });
  renderCalendar();

  // ---- Research prompts ----
  const prompts = [
    'What rheology target (yield stress/viscosity) best balances pumpability and buildability this week?',
    'Can recycled SCMs reach target strength with lower activator molarity? Design a matrix to test.',
    'Try layer time interval sweep: map interlayer bond vs. wait time and humidity.',
    'What is the minimum robot path overlap before cold joints appear? Document visually.',
    'Design a factorial: nozzle diameter × speed × slump flow → dimensional accuracy.',
    'Use micro-CT or image analysis to quantify pore connectivity across layers.',
    'Could bio-based fibers improve green strength without clogging? Pilot 3 specimen batches.',
  ];
  const promptEl = document.getElementById('prompt');
  const nextPromptBtn = document.getElementById('nextPrompt');
  function nextPrompt(){ if(!promptEl) return; const i = Math.floor(Math.random()*prompts.length); promptEl.textContent = prompts[i]; }
  nextPromptBtn && nextPromptBtn.addEventListener('click', nextPrompt);
})();

