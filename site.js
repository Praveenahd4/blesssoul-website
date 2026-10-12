/* BlessSoul homepage v11 — no dependencies.
   1. Theme, nav, reveals
   2. Sky data: real moon phases (the app's JPL table) + upcoming portals, all on the visitor's local date
   3. The coded phones: restartable screen flows (each one plays from the start when it comes into view)
   4. The "How it works" stage: copy scrolls, one stage swaps phones
   5. Atmosphere: dust in light, stars in dark, star fields in the night sections */
(function () {
  'use strict';
  const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const $ = (s, r = document) => r.querySelector(s);
  const $$ = (s, r = document) => Array.from(r.querySelectorAll(s));
  const root = document.documentElement;
  const store = { get(k) { try { return localStorage.getItem(k); } catch (e) { return null; } }, set(k, v) { try { localStorage.setItem(k, v); } catch (e) {} } };

  /* =========================================================================
     1. Theme, nav, reveals
     ========================================================================= */
  const setTheme = (t) => { root.setAttribute('data-theme', t); store.set('bs-theme', t); syncThemeUI(); };
  const syncThemeUI = () => { const d = root.getAttribute('data-theme') === 'dark'; $$('.s-theme-alt .l').forEach(l => l.textContent = d ? 'Try light' : 'Try dark'); };
  $$('.s-theme, .s-theme-alt').forEach(b => b.addEventListener('click', () => setTheme(root.getAttribute('data-theme') === 'dark' ? 'light' : 'dark')));
  matchMedia('(prefers-color-scheme: dark)').addEventListener('change', (e) => { if (!store.get('bs-theme')) root.setAttribute('data-theme', e.matches ? 'dark' : 'light'); });
  syncThemeUI();

  const nav = $('#nav'), burger = $('.s-burger'), menu = $('#menu');
  const closeMenu = () => { menu.classList.remove('open'); burger.setAttribute('aria-expanded', 'false'); };
  burger.addEventListener('click', () => { const o = menu.classList.toggle('open'); burger.setAttribute('aria-expanded', String(o)); });
  $$('a', menu).forEach(a => a.addEventListener('click', closeMenu));
  const navLinks = $$('.s-links a');
  const onScroll = () => {
    nav.classList.toggle('scrolled', scrollY > 10);
    let cur = null; navLinks.forEach(a => { const t = $(a.getAttribute('href')); if (t && t.getBoundingClientRect().top < innerHeight * .4) cur = a; });
    navLinks.forEach(a => a.classList.toggle('on', a === cur));
  };
  addEventListener('scroll', onScroll, { passive: true }); onScroll();

  const io = new IntersectionObserver((es) => es.forEach(e => { if (e.isIntersecting) { e.target.classList.add('in'); io.unobserve(e.target); } }), { threshold: .12, rootMargin: '0px 0px -5% 0px' });
  $$('.rv').forEach(el => io.observe(el));
  const y = $('#year'); if (y) y.textContent = new Date().getFullYear();

  /* =========================================================================
     2. Sky data
     ========================================================================= */
  const DAY = 864e5;
  const startOfDay = (d) => { const x = new Date(d); x.setHours(0, 0, 0, 0); return x; };
  const sameDay = (a, b) => a.getFullYear() === b.getFullYear() && a.getMonth() === b.getMonth() && a.getDate() === b.getDate();
  const daysBetween = (a, b) => Math.round((startOfDay(b) - startOfDay(a)) / DAY);
  const fmt = (d, o) => d.toLocaleDateString(undefined, o);
  const today = startOfDay(new Date());
  const inDays = (n) => n === 0 ? 'Today' : n === 1 ? 'Tomorrow' : `In ${n} days`;

  // Mirrors MoonPhaseCalculator.swift: a day holding a true principal instant IS that phase;
  // otherwise interpolate between the bracketing instants and bucket into the app's 25 phases.
  const TABLE = (window.BS_MOON || []).map(([t, k]) => ({ date: new Date(t * 1000), kind: k }));
  const SYN = 29.530588853, ANCHOR = [0, 7.38, 14.77, 22.15];
  const PRINCIPAL = [['new', 'New Moon'], ['moon-first-quarter', 'First Quarter'], ['moon-full', 'Full Moon'], ['moon-last-quarter', 'Last Quarter']];
  const BUCKETS = [
    [0.50, 'new', 'New Moon'], [1.64, 'moon-young', 'Young Moon'], [2.78, 'moon-very-thin-waxing-crescent', 'Waxing Crescent'], [3.92, 'moon-thin-waxing-crescent', 'Waxing Crescent'],
    [5.06, 'moon-waxing-crescent', 'Waxing Crescent'], [6.20, 'moon-strong-waxing-crescent', 'Waxing Crescent'], [6.88, 'moon-pre-first-quarter', 'First Quarter'], [7.88, 'moon-first-quarter', 'First Quarter'],
    [9.68, 'moon-post-first-quarter', 'First Quarter'], [11.07, 'moon-pre-gibbous', 'Waxing Gibbous'], [12.27, 'moon-waxing-gibbous', 'Waxing Gibbous'], [13.27, 'moon-mid-waxing-gibbous', 'Waxing Gibbous'],
    [14.27, 'moon-pre-full', 'Waxing Gibbous'], [15.27, 'moon-full', 'Full Moon'], [17.27, 'moon-early-waning-gibbous', 'Waning Gibbous'], [18.46, 'moon-mid-waning-gibbous', 'Waning Gibbous'],
    [19.96, 'moon-waning-gibbous', 'Waning Gibbous'], [21.65, 'moon-pre-last-quarter', 'Last Quarter'], [22.65, 'moon-last-quarter', 'Last Quarter'], [23.65, 'moon-post-last-quarter', 'Last Quarter'],
    [24.84, 'moon-waning-crescent', 'Waning Crescent'], [25.84, 'moon-thin-waning-crescent', 'Waning Crescent'], [26.84, 'moon-pre-old', 'Old Moon'], [28.03, 'moon-old', 'Old Moon'], [29.03, 'moon-very-thin-old', 'Old Moon'], [99, 'new', 'New Moon']
  ];
  function moonOn(day) {
    const p = TABLE.find(e => sameDay(e.date, day));
    if (p) return { img: PRINCIPAL[p.kind][0], name: PRINCIPAL[p.kind][1], principal: p.kind };
    const noon = new Date(day); noon.setHours(12, 0, 0, 0);
    let i = -1; for (let k = 0; k < TABLE.length; k++) { if (TABLE[k].date <= noon) i = k; else break; }
    let c;
    if (i >= 0 && i + 1 < TABLE.length) {
      const a = TABLE[i], b = TABLE[i + 1], from = ANCHOR[a.kind], to = b.kind === 0 ? SYN : ANCHOR[b.kind];
      c = from + (to - from) * ((noon - a.date) / (b.date - a.date));
    } else { c = (((noon - Date.UTC(2026, 3, 17, 11, 52)) / DAY) % SYN + SYN) % SYN; }
    const bk = BUCKETS.find(x => c < x[0]);
    return { img: bk[1], name: bk[2], principal: -1 };
  }
  const moonSrc = (img) => img === 'new' ? 'assets/images/moon/moon-very-thin-old.png' : `assets/images/moon/${img}.png`;
  const setMoonImg = (el, m) => { el.src = moonSrc(m.img); el.classList.toggle('is-new', m.img === 'new'); el.alt = el.alt ? `${m.name}` : ''; };

  // Upcoming events: principal moons from the table (with their sign when we know it), recurring number
  // portals, and the 2026 sky events the app ships. Each row is a local calendar date.
  const SIGNS = { '2026-10-18|1': 'Capricorn', '2026-10-26|2': 'Taurus', '2026-11-2|3': 'Leo', '2026-11-9|0': 'Scorpio', '2026-11-17|1': 'Aquarius', '2026-11-24|2': 'Gemini', '2026-12-1|3': 'Virgo' };
  const STATIC = [
    ['2026-10-16', 'Pluto Stations Direct in Aquarius', '◌', '#6B4FD6', 3], ['2026-10-22', 'Orionid Meteor Shower', '✦', '#4FB3C8', 3],
    ['2026-10-23', 'Sun Enters Scorpio', '☀', '#E8336B', 3], ['2026-10-24', 'Mercury Stations Retrograde in Scorpio', '◌', '#7C5CFF', 4],
    ['2026-10-25', 'Venus Re-enters Libra', '★', '#E08BC8', 2], ['2026-11-13', 'Mercury Stations Direct in Scorpio', '◌', '#3D8BE2', 4],
    ['2026-11-14', 'Venus Stations Direct in Libra', '◌', '#D46BD4', 4], ['2026-11-16', 'Mars Conjunct Jupiter', '★', '#FF6B2C', 3],
    ['2026-11-17', 'Leonid Meteor Shower', '✦', '#E0A64A', 3], ['2026-11-22', 'Sun Enters Sagittarius', '☀', '#E0A64A', 3],
    ['2026-11-26', 'Mars Enters Virgo', '★', '#9ACD32', 2], ['2026-11-29', 'Uranus Trine Pluto', '★', '#2E8BFF', 3], ['2026-12-04', 'Venus Enters Scorpio', '★', '#D46BD4', 2]
  ];
  const parseD = (s) => { const [Y, M, D] = s.split('-').map(Number); return new Date(Y, M - 1, D); };
  function upcoming(limit, horizonDays = 75) {
    const end = new Date(+today + horizonDays * DAY), ev = [];
    TABLE.forEach(e => {
      const d = startOfDay(e.date); if (d < today || d > end) return;
      const key = `${d.getFullYear()}-${d.getMonth() + 1}-${d.getDate()}|${e.kind}`;
      const name = ['New Moon', 'First Quarter Moon', 'Full Moon', 'Last Quarter Moon'][e.kind] + (SIGNS[key] ? ` in ${SIGNS[key]}` : '');
      ev.push({ date: d, title: name, moon: PRINCIPAL[e.kind][0], color: e.kind === 2 ? '#8B5CF6' : '#FF8C42', stars: e.kind % 2 === 0 ? 5 : 2, kind: e.kind });
    });
    for (let yr = today.getFullYear(); yr <= today.getFullYear() + 1; yr++) {
      [[8, 8, "8/8 Lion's Gate Portal"], [11, 11, '11/11 Portal'], [12, 12, '12/12 Portal']].forEach(([m, d, t]) => { const dt = new Date(yr, m - 1, d); if (dt >= today && dt <= end) ev.push({ date: dt, title: t, icon: '✦', color: '#8B5CF6', stars: 5 }); });
    }
    STATIC.forEach(([s, t, ic, c, st]) => { const d = parseD(s); if (d >= today && d <= end) ev.push({ date: d, title: t, icon: ic, color: c, stars: st }); });
    ev.sort((a, b) => a.date - b.date || (b.stars - a.stars));
    return ev.slice(0, limit);
  }
  const stars = (n) => '★'.repeat(n);
  const evIcon = (e) => e.moon ? `<img src="${moonSrc(e.moon)}" alt="">` : e.icon;

  const tonight = moonOn(today);
  const events = upcoming(24);
  const nextFull = TABLE.find(e => startOfDay(e.date) >= today && e.kind === 2);
  const next = events[0];

  // page-level sky bits
  $$('.js-moon-img').forEach(el => setMoonImg(el, tonight));
  $$('.js-moon-name').forEach(el => el.textContent = tonight.name);
  $$('.js-today').forEach(el => el.textContent = 'Tonight · ' + fmt(today, { weekday: 'long', day: 'numeric', month: 'long' }));
  $$('.s-moon-big').forEach(el => el.classList.toggle('new', tonight.img === 'new'));
  if (nextFull) {
    const n = daysBetween(today, nextFull.date);
    $$('.js-next-big').forEach(el => el.textContent = n === 0 ? 'Full Moon tonight' : `Next Full Moon: ${fmt(nextFull.date, { weekday: 'short', day: 'numeric', month: 'short' })}`);
  }
  const list = $('#skyEvents');
  if (list) {
    list.innerHTML = events.slice(0, 5).map(e => `<li><span class="d"><b>${e.date.getDate()}</b><small>${fmt(e.date, { month: 'short' })}</small></span><span class="t"><span class="ic" style="--c:${e.color}">${evIcon(e)}</span><span>${e.title}<small>${stars(e.stars)}</small></span></span><span class="c">${inDays(daysBetween(today, e.date))}</span></li>`).join('')
      || '<li><span class="t">New portal dates arrive in the app every year.</span></li>';
  }

  /* Phone copy that depends on the moon: one short set per part of the cycle, so the text never
     contradicts the phase shown beside it. */
  const fam = /New|Young|Old/.test(tonight.name) ? 'new' : tonight.name === 'Full Moon' ? 'full' : /Waning|Last/.test(tonight.name) ? 'waning' : 'waxing';
  const COPY = {
    waxing: { head: 'What You Already Chose', msg: 'As the moon grows, look at the choices you already made. This part of the cycle rewards the intention you return to, not the one you chase. Keep yours in sight today.', act: 'Return to one thing you already chose and give it ten honest minutes.', sleep: 'You Already Have Some of It', smsg: 'There is less to reach for tonight than you think. Rest inside what you already chose.', speak: 'I see my life as a room I already furnished, full of things I once wanted and stopped noticing. Tonight I stop counting what is missing and rest inside what is already here.', gentle: 'Bring to mind one thing you already have that you once wished for. Rest a hand on your heart, thank it, and let your eyes close.', tone: 'CALM' },
    full: { head: 'See What Has Grown', msg: 'The moon is full and everything is lit. Notice one thing that has moved since you began, however small, and let yourself see it clearly.', act: 'Write down one change you can point to, and one thing you are ready to let go.', sleep: 'Let It Be Seen', smsg: 'Tonight the whole moon is showing. You are allowed to be seen as well.', speak: 'I let tonight show me how far I have already come. I keep what is growing and I release what I have carried long enough.', gentle: 'Name one thing you are ready to put down. Breathe out slowly, as if setting it on the floor beside the bed.', tone: 'RADIANT' },
    waning: { head: 'Make Room', msg: 'As the light thins there is less to add and more to clear. Choose one thing that no longer serves your intention and set it down today.', act: 'Clear one small thing: a tab, a task, a habit you keep half-doing.', sleep: 'Lighter Tonight', smsg: 'The moon is letting go of its light a little each night. You can let go of the day the same way.', speak: 'I release what I finished today and what I did not. Both can wait for morning. Tonight I only need to rest.', gentle: 'Unclench your jaw and drop your shoulders. Let one breath out be longer than the one before it.', tone: 'SOFT' },
    new: { head: 'Plant One Clear Intention', msg: 'The sky is dark and quiet. Name one thing you want, in a single sentence, and write it down before the day gets loud.', act: 'Write your intention in one sentence and read it back once tonight.', sleep: 'Begin Small, Begin Tonight', smsg: 'Nothing is visible yet, and that is the point. Every cycle begins in the dark.', speak: 'I plant one clear intention tonight and trust it to grow at its own pace. I do not need to see it yet to know it has begun.', gentle: 'Say your intention once, quietly, then let it go and let sleep come.', tone: 'SACRED' }
  }[fam];

  /* --- Hero phone boot: the app's splash, then Home, then the notifications begin.
         It waits until the phone itself is on screen (on phones the hero phone sits below the
         headline, so playing it at load meant nobody saw it). Once per page load; skipped for
         reduced motion or when the page opens already scrolled past the hero. --- */
  const heroVis = $('.s-hero-vis'), heroPhone = $('#heroDevice');
  const pastHero = heroVis && heroVis.getBoundingClientRect().bottom < 0;
  let homeReady = reduce || !heroPhone || pastHero;
  if (!homeReady) {
    root.classList.add('boot-wait');
    const boot = () => {
      root.classList.remove('boot-wait'); root.classList.add('booting');
      setTimeout(() => root.classList.add('splash-out'), 1600);
      setTimeout(() => { root.classList.add('home-in'); }, 1750);
      setTimeout(() => {
        root.classList.remove('booting', 'splash-out');
        setTimeout(() => root.classList.remove('home-in'), 900);
        homeReady = true; document.dispatchEvent(new Event('bs:home-ready'));
      }, 2050);
    };
    // start once at least about half of the phone is on screen: checked on load, on scroll and on resize
    let started = false;
    const check = () => {
      if (started) return;
      const r = heroPhone.getBoundingClientRect(), seen = Math.min(r.bottom, innerHeight) - Math.max(r.top, 0);
      if (seen >= r.height * .5) { started = true; removeEventListener('scroll', check); removeEventListener('resize', check); boot(); }
    };
    addEventListener('scroll', check, { passive: true }); addEventListener('resize', check);
    check();
  }

  /* --- Hero notifications: true app moments, one at a time per slot, never the same card twice on screen --- */
  (function heroPops() {
    const slots = $$('.s-pop').filter(s => getComputedStyle(s).display !== 'none'); if (!slots.length) return;
    const fullIn = nextFull ? daysBetween(today, nextFull.date) : null;
    const moonIc = (img) => `<span class="ic moon"><img src="${moonSrc(img)}" alt=""></span>`;
    const nextNew = TABLE.find(x => startOfDay(x.date) >= today && x.kind === 0), newIn = nextNew ? daysBetween(today, nextNew.date) : null;
    const numPortal = events.find(x => /Portal/.test(x.title));
    const tint = (c, glyph) => `<span class="ic" style="--tint:${c}">${glyph}</span>`;
    const ITEMS = [
      { ic: '<span class="ic"><span class="ring" style="--p:72%"></span></span>', t: 'Day 4 of 21', s: '369 Method · morning session done' },
      fullIn !== null && { ic: moonIc('moon-full'), t: fullIn === 0 ? 'Full Moon tonight' : `Full Moon in ${fullIn} day${fullIn === 1 ? '' : 's'}`, s: fmt(nextFull.date, { weekday: 'long', day: 'numeric', month: 'short' }) },
      { ic: tint('rgba(52,199,89,.16)', '🌿'), t: 'Habit done', s: 'Meditate · you showed up today' },
      next && { ic: next.moon ? moonIc(next.moon) : tint(`color-mix(in srgb, ${next.color} 22%, transparent)`, next.icon), t: next.title, s: `${inDays(daysBetween(today, next.date))} · Soul Portal` },
      { ic: '<span class="ic" style="--tint:rgba(232,184,0,.18)"><img src="assets/images/chakra/chakra3.png" alt=""></span>', t: 'Day 3 is open', s: 'Soul Awakening · The Solar Plexus' },
      { ic: '<span class="ic dove"><img src="assets/images/angel-dove.png" alt=""></span>', t: 'Angel Moment · 11:11', s: 'A dove arrives with its meaning' },
      { ic: moonIc(tonight.img), t: "Tonight's sleep affirmation", s: COPY.sleep },
      { ic: tint('rgba(79,124,255,.16)', '◴'), t: 'Meditate', s: 'Soul Schedule · starts in 15 min' },
      { ic: tint('rgba(255,140,66,.16)', '🎯'), t: 'Goal on track', s: 'Finish my design portfolio · 40%' },
      { ic: tint('rgba(155,114,214,.18)', '❝'), t: 'Soul Spark · Calm Down', s: '“Breathe. Nothing worth having needs to be rushed.”' },
      { ic: tint('rgba(79,124,255,.16)', '✎'), t: '5×55 · Day 1 complete', s: '55 of 55 written' },
      { ic: tint('rgba(255,92,138,.14)', '🔥'), t: '12-day streak', s: 'No phone before breakfast' },
      newIn !== null && { ic: moonIc('moon-very-thin-old'), t: newIn === 0 ? 'New Moon tonight' : `New Moon in ${newIn} day${newIn === 1 ? '' : 's'}`, s: 'A night to set an intention' },
      { ic: tint('rgba(217,130,10,.16)', '☀'), t: "Today's cosmic message", s: COPY.head },
      { ic: tint('rgba(245,158,11,.16)', '♡'), t: 'Gratitude', s: 'Three things for today, written' },
      { ic: tint('rgba(219,61,219,.14)', '✦'), t: 'Your affirmation is ready', s: '“I begin every morning calm, clear and confident.”' },
      { ic: tint('rgba(176,79,214,.16)', '◈'), t: 'Soul Record saved', s: 'Day 3 · your offering is kept' },
      numPortal && numPortal !== next && { ic: tint('rgba(139,92,246,.18)', '✦'), t: numPortal.title, s: `${inDays(daysBetween(today, numPortal.date))} · Soul Portal` },
      { ic: tint('rgba(219,61,219,.14)', '🌙'), t: 'Evening 369 session', s: 'Write it 9 times tonight' }
    ].filter(Boolean);
    const card = (it) => { const d = document.createElement('div'); d.className = 'note-pop'; d.innerHTML = `${it.ic}<span class="tx"><b>${it.t}<small>now</small></b><span>${it.s}</span></span>`; return d; };
    if (reduce) { slots.forEach((s, i) => { const c = card(ITEMS[i]); c.classList.add('in'); s.appendChild(c); }); return; }
    let k = 0, timers = [], running = false;
    const showing = new Set();
    const nextItem = () => { for (let n = 0; n < ITEMS.length; n++) { const i = (k + n) % ITEMS.length; if (!showing.has(i)) { k = i + 1; return i; } } return 0; };
    const cycle = (slot) => {
      if (!running) return;
      const i = nextItem(), c = card(ITEMS[i]); showing.add(i);
      slot.appendChild(c); void c.offsetWidth; c.classList.add('in');
      timers.push(setTimeout(() => { c.classList.add('out'); c.classList.remove('in'); }, 4600));
      timers.push(setTimeout(() => { c.remove(); showing.delete(i); timers.push(setTimeout(() => cycle(slot), 900 + Math.random() * 2600)); }, 5600));
    };
    let inView = false;
    document.addEventListener('bs:home-ready', () => { if (inView) start(); });
    const start = () => { if (running || !homeReady) return; running = true; const order = [0, 3, 1, 4, 2, 5]; slots.forEach((s, n) => timers.push(setTimeout(() => cycle(s), 500 + order.indexOf(n) * 1100))); };
    const stop = () => { running = false; timers.forEach(clearTimeout); timers = []; showing.clear(); slots.forEach(s => s.innerHTML = ''); };
    new IntersectionObserver(([e]) => { inView = e.isIntersecting; inView ? start() : stop(); }, { threshold: .1 }).observe($('.s-hero-vis'));
  })();

  /* =========================================================================
     3. The coded phones
     ========================================================================= */
  // A runner owns every timer a flow creates, so a flow can be stopped and replayed cleanly.
  function Runner(device, build) {
    let timers = [], on = false;
    const r = {
      device,
      later(fn, ms) { const id = setTimeout(() => { timers = timers.filter(t => t !== id); if (on) fn(); }, reduce ? 0 : ms); timers.push(id); return id; },
      start() { r.stop(); on = true; flow.loop(); },
      stop() { on = false; timers.forEach(clearTimeout); timers = []; },
      get running() { return on; }
    };
    const flow = build(r);
    return r;
  }
  const tapAt = (device, el) => { if (!device || !el) return; const t = $('.tap', device); if (!t) return; const host = t.offsetParent || device, r = el.getBoundingClientRect(), d = host.getBoundingClientRect(), s = d.width / host.offsetWidth || 1; t.style.left = ((r.left + r.width / 2 - d.left) / s) + 'px'; t.style.top = ((r.top + r.height / 2 - d.top) / s) + 'px'; t.classList.remove('go'); void t.offsetWidth; t.classList.add('go'); };
  const push = (device, name) => $$('.view', device).forEach(v => { v.classList.toggle('under', v.classList.contains('on') && !v.classList.contains(name)); v.classList.toggle('on', v.classList.contains(name)); });
  const pop = (device, name) => $$('.view', device).forEach(v => { v.classList.remove('under'); v.classList.toggle('on', v.classList.contains(name)); });
  // steps: [[ms, fn], ...] replayed every loopMs
  const sequence = (r, steps, loopMs) => ({ loop() { steps.forEach(([at, fn]) => r.later(fn, at)); if (!reduce) r.later(() => this.loop(), loopMs); } });
  const runners = {};

  /* --- app-tab backgrounds inside each phone: gold motes in light, stars in dark --- */
  (function () {
    const rnd = (a, b) => a + Math.random() * (b - a);
    const layer = () => { const f = document.createElement('div'); f.className = 'fx'; let s = '';
      for (let i = 0; i < 9; i++) s += `<i class="mote" style="--x:${rnd(4, 96).toFixed(1)}%;--y:${rnd(0, 100).toFixed(1)}%;--sz:${rnd(4, 9).toFixed(1)}px;--dur:${rnd(16, 28).toFixed(1)}s;--delay:${(-rnd(0, 28)).toFixed(1)}s"></i>`;
      for (let i = 0; i < 34; i++) s += `<i class="star" style="--x:${rnd(2, 98).toFixed(1)}%;--y:${rnd(2, 98).toFixed(1)}%;--sz:${rnd(.8, 2.2).toFixed(1)}px;--dur:${rnd(1.2, 3.2).toFixed(1)}s;--delay:${(-rnd(0, 3)).toFixed(1)}s"></i>`;
      s += `<i class="shoot" style="--y:${rnd(4, 30).toFixed(0)}%;--delay:${(-rnd(0, 14)).toFixed(1)}s"></i>`; f.innerHTML = s; return f; };
    $$('.device .screen').forEach(screen => { if (screen.closest('.device.journey')) return; const hosts = $$('.view', screen).filter(v => !v.classList.contains('v-sleep')); (hosts.length ? hosts : [screen]).forEach(h => h.prepend(layer())); });
  })();

  /* --- dates inside the phones are today's, never a frozen demo day --- */
  (function datePhones() {
    const hr = new Date().getHours();
    $$('.greet').forEach(g => g.textContent = (hr < 12 ? 'Good Morning' : hr < 18 ? 'Good Afternoon' : 'Good Evening') + ', Avery!');
    $$('.date').forEach(d => d.textContent = fmt(today, { weekday: 'long', day: 'numeric', month: 'long' }));
    // Home: the sleep card and the portal mini-card
    $$('.nightcard').forEach(c => { $$('img', c).forEach(i => i.src = moonSrc(tonight.img)); const sh = $('.sh', c); if (sh) sh.textContent = COPY.sleep; const sm = $('.sm', c); if (sm) sm.innerHTML = `<img src="${moonSrc(tonight.img)}" alt=""> ${tonight.name} · <i>✦ ${COPY.tone.toLowerCase()}</i>`; });
    $$('.portal-card').forEach(c => {
      const ph = $('.ph', c); if (ph) ph.textContent = COPY.head;
      if (!next) return;
      const t = $('.portal-mini .t', c); if (t) t.textContent = next.title;
      const s = $('.portal-mini .s', c); if (s) s.textContent = fmt(next.date, { weekday: 'long' });
      const pill = $('.portal-mini .pill', c); if (pill) pill.textContent = inDays(daysBetween(today, next.date));
      const ic = $('.pm-ic', c); if (ic) { ic.innerHTML = evIcon(next); ic.classList.toggle('has-img', !!next.moon); }
      const f = $$('.pm-foot span', c); if (f[0]) f[0].textContent = '▦ ' + fmt(next.date, { month: 'short', day: 'numeric' }); if (f[1]) f[1].textContent = stars(next.stars);
    });
    // Goals: target date a month out, calendar is this month
    $$('.js-gdate').forEach(s => { const d = new Date(+today + (+s.dataset.days || 30) * DAY); s.innerHTML = `Work · ${fmt(d, { day: 'numeric', month: 'short' })} &nbsp;<i class="tag">✓ On track</i>`; });
    $$('.pbox-h small').forEach(s => s.textContent = fmt(today, { month: 'long', year: 'numeric' }));
    $$('.cal').forEach(cal => {
      cal.innerHTML = ''; const first = new Date(today.getFullYear(), today.getMonth(), 1), n = new Date(today.getFullYear(), today.getMonth() + 1, 0).getDate();
      for (let i = 0; i < first.getDay(); i++) { const e = document.createElement('i'); e.className = 'pad'; cal.appendChild(e); }
      for (let d = 1; d <= n; d++) { const e = document.createElement('i'); e.textContent = d; if (d === today.getDate()) e.classList.add('today'); cal.appendChild(e); }
    });
    // Schedule
    $$('.dhead small').forEach(s => s.textContent = fmt(today, { weekday: 'long' }).toUpperCase());
    $$('.dhead b').forEach(b => b.textContent = fmt(today, { day: 'numeric', month: 'short' }));
    $$('.sched-widget .wh2 small').forEach(s => s.textContent = fmt(today, { weekday: 'long', month: 'short', day: 'numeric' }));
    // Portal tab
    const pd = $('#portalDevice'); if (!pd) return;
    const dt = $('.pt-date', pd); if (dt) dt.innerHTML = `<b>TODAY · ${fmt(today, { weekday: 'long' }).toUpperCase()}</b><small>${fmt(today, { month: 'long', day: 'numeric', year: 'numeric' })}</small>`;
    const mh = $('.moon-hero img', pd); if (mh) mh.src = moonSrc(tonight.img);
    const h = $('.pt-head', pd); if (h) h.textContent = COPY.head;
    const chip = $('.pchip', pd); if (chip) chip.textContent = tonight.name;
    const msg = $('.pt-msg', pd); if (msg) msg.textContent = COPY.msg;
    const act = $('.pt-action > div', pd); if (act) act.innerHTML = `<small>TODAY'S ACTION</small>${COPY.act}`;
    const wk = $('.week', pd);
    if (wk) wk.innerHTML = Array.from({ length: 7 }, (_, i) => { const d = new Date(+today + i * DAY), m = moonOn(d); return `<span class="${i === 0 ? 'on' : m.principal >= 0 ? 'pd' : ''}"><small>${fmt(d, { weekday: 'short' }).toUpperCase().slice(0, 3)}</small><img src="${moonSrc(m.img)}" alt=""><b>${d.getDate()}</b></span>`; }).join('');
    const nx = $('.pt-next', pd); if (nx && next) nx.innerHTML = `<i>✦</i> ${next.title} <em>· ${inDays(daysBetween(today, next.date)).toLowerCase()}</em><span>›</span>`;
    const ptl = $('.ptl', pd);
    if (ptl) {
      let html = '', month = -1;
      events.forEach(e => {
        if (e.date.getMonth() !== month) { month = e.date.getMonth(); html += `<div class="ptl-month"><i></i><span>${fmt(e.date, { month: 'long' }).toUpperCase()}</span></div>`; }
        html += `<div class="ptl-row"><span class="dcirc" style="--c:${e.color}">${e.date.getDate()}</span><div class="pcard"><span class="pic${e.moon ? ' moon' : ''}" style="--c:${e.color}">${evIcon(e)}</span><div><b>${e.title}</b><small>${fmt(e.date, { weekday: 'short', month: 'short', day: 'numeric' })} <i>${stars(e.stars)}</i></small></div><span class="cd">${inDays(daysBetween(today, e.date))} ›</span></div></div>`;
      });
      ptl.innerHTML = html;
    }
    const chips = $$('.gchips span', pd); const moons = events.filter(e => e.moon).length, nums = events.filter(e => /Portal/.test(e.title)).length;
    if (chips[1]) chips[1].textContent = `☾ Moon Phase (${moons})`; if (chips[2]) chips[2].textContent = `✦ Number Portal (${nums})`;
    const pc = $('.plan-h[style*="FF8C42"] span', pd); if (pc) pc.textContent = `${today.getFullYear()} PORTALS`;
    // Soul Sleep screen
    $$('.v-sleep img', pd).forEach(i => i.src = moonSrc(tonight.img));
    const badge = $('.sl-badge', pd); if (badge) badge.innerHTML = `<img src="${moonSrc(tonight.img)}" alt="">${tonight.name}`;
    const sh = $('.sl-head', pd); if (sh) sh.textContent = COPY.sleep;
    const sm = $('.sl-msg', pd); if (sm) sm.textContent = COPY.smsg;
    const rd = $('.sl-box.decl .read', pd); if (rd) rd.textContent = COPY.speak;
    const ga = $('.sl-box.ga p', pd); if (ga) ga.textContent = COPY.gentle;
    const ft = $('.sl-foot', pd); if (ft) ft.innerHTML = `<i>☀</i> Today's cosmic theme: ${COPY.head}`;
    const it = $('.sl-int', pd); if (it) it.innerHTML = `✦ &nbsp;${COPY.tone}&nbsp; ✦`;
    // Home Screen widget mock in the details grid
    $$('.js-pw-head').forEach(el => el.textContent = COPY.head);
    if (next) {
      $$('.js-next-title').forEach(el => el.textContent = next.title);
      $$('.js-next-when').forEach(el => el.textContent = inDays(daysBetween(today, next.date)));
      $$('.js-next-stars').forEach(el => el.innerHTML = stars(next.stars) + `<i>${'★'.repeat(5 - next.stars)}</i>`);
    }
    // Portal widget
    const pw = $('.portal-widget');
    if (pw) {
      const ph = $('.pw-h', pw); if (ph) ph.textContent = COPY.head;
      if (next) { const r = $('.pw-row', pw); if (r) r.innerHTML = `<span class="pw-ic">${evIcon(next)}</span><b>${next.title}</b><span class="pw-st">${inDays(daysBetween(today, next.date))}</span>`;
        const f = $('.pw-foot', pw); if (f) f.innerHTML = `<span class="pw-stars">${stars(next.stars)}<i>${'★'.repeat(5 - next.stars)}</i></span><span>▦ ${fmt(next.date, { month: 'short', day: 'numeric' })} <em>·</em> Soul Portal</span>`; }
    }
  })();

  /* --- Hero phone: quotes rotate, heart lands, the plan fills itself --- */
  runners.hero = Runner($('#heroDevice'), (r) => {
    const d = r.device, quotes = $$('.quote-rot q', d), heart = $('.heart', d), burst = $('.burst', d);
    const ring = $('.row.practice .ring', d), chk = $('.row.habit .chk', d), hab = $('.row.habit', d), bar = $('.bar i', d), cnt = $('.plan-h small', d);
    if (burst && !burst.children.length) for (let i = 0; i < 10; i++) { const p = document.createElement('i'); const a = (i / 10) * 6.283; p.style.setProperty('--dx', Math.cos(a) * 26 + 'px'); p.style.setProperty('--dy', Math.sin(a) * 26 - 10 + 'px'); p.style.background = i % 2 ? '#FF5C8A' : '#FFB84D'; burst.appendChild(p); }
    let qi = 0; if (quotes[0]) quotes[0].classList.add('on');
    return {
      loop() {
        const tick = () => { if (!quotes.length) return; quotes[qi].classList.remove('on'); qi = (qi + 1) % quotes.length; quotes[qi].classList.add('on'); r.later(tick, 4200); };
        r.later(tick, 4200);
        const love = () => { if (heart) { const on = heart.classList.toggle('on'); if (on && burst) { burst.classList.remove('go'); void burst.offsetWidth; burst.classList.add('go'); } } r.later(love, 5200); };
        r.later(love, 2600);
        const plan = () => {
          if (ring) ring.style.setProperty('--p', '0%'); if (chk) chk.classList.remove('on'); if (hab) hab.classList.remove('done'); if (bar) bar.style.width = '0%'; if (cnt) cnt.textContent = '0 of 2';
          r.later(() => { if (ring) ring.style.setProperty('--p', '72%'); if (bar) bar.style.width = '36%'; }, 800);
          r.later(() => { if (chk) chk.classList.add('on'); if (hab) hab.classList.add('done'); if (bar) bar.style.width = '68%'; if (cnt) cnt.textContent = '1 of 2'; }, 2600);
          r.later(plan, 9000);
        };
        plan();
      }
    };
  });

  /* --- Soul Manifest: Daily Practice → 369 → write sheet → 5×55 timeline → write sheet → back --- */
  runners.practice = Runner($('#practiceDevice'), (r) => {
    const pr = r.device;
    const AFF = 'I begin every morning calm, clear and confident', AFF5 = 'My work is seen, valued, and rewarded';
    const wins = $$('.v-369 .win', pr), dotsM = wins.length ? $$('.dots i', wins[0]) : [];
    const reps3 = $$('.v-w369 .rep', pr), ring3 = $('.r369', pr), ring3n = $('.r369 .n', pr), foot3 = $('.f369', pr);
    const list = $('.replist', pr);
    if (list && !list.children.length) { const inner = document.createElement('div'); for (let i = 1; i <= 55; i++) { const x = document.createElement('div'); x.className = 'rep'; x.innerHTML = `<i>${i}</i><span>Repetition ${i}...</span>`; inner.appendChild(x); } list.appendChild(inner); }
    const inner = list && list.firstElementChild, reps5 = $$('.rep', list), ring5 = $('.v-w555 .ring5', pr), ring5n = $('.v-w555 .ring5 .n', pr), foot5 = $('.v-w555 .foot5', pr);
    const td1 = $('.v-555 .td', pr), cnt1 = $('.v-555 .td .cnt .c', pr), qa5 = $('.v-555 .qa5', pr);
    const typeInto = (span, text, ms, done) => { let i = 0; const t = () => { span.textContent = text.slice(0, ++i); if (i < text.length) r.later(t, ms); else if (done) done(); }; t(); };
    const reset = () => {
      wins.forEach(w => w.classList.remove('done')); dotsM.forEach(d => d.classList.remove('on', 'pop'));
      reps3.forEach((x, i) => { x.classList.remove('active', 'filled'); x.lastElementChild.textContent = `Repetition ${i + 1}...`; });
      ring3.style.setProperty('--p', '0%'); ring3n.textContent = '0'; foot3.classList.remove('ready'); foot3.textContent = '○ Complete Session';
      reps5.forEach((x, i) => { x.classList.remove('active', 'filled'); x.lastElementChild.textContent = `Repetition ${i + 1}...`; }); if (inner) inner.style.transform = '';
      ring5.style.setProperty('--p', '0%'); ring5n.textContent = '0'; foot5.classList.remove('ready'); foot5.textContent = '○ Complete Day';
      td1.classList.add('on'); td1.classList.remove('done'); $('.lab', td1).textContent = 'Today'; $('.node i', td1).textContent = '🔥'; cnt1.textContent = '0'; qa5.classList.remove('pulse');
      $$('.pc', pr).forEach(c => c.classList.remove('done'));
      { const c3 = $('.pc-369', pr), c5 = $('.pc-555', pr); $('.st', c3).textContent = '▶ In Progress'; $('.pc-meta span:last-child', c3).textContent = '⚡ 14%'; $('.st', c5).textContent = '▶ Not Started'; $('.pc-meta span:last-child', c5).textContent = '⚡ 0%'; }
    };
    const fill369 = (i) => { const x = reps3[i]; if (!x) return; x.classList.add('active'); typeInto(x.lastElementChild, AFF, 26, () => { x.classList.remove('active'); x.classList.add('filled'); ring3n.textContent = i + 1; ring3.style.setProperty('--p', Math.round((i + 1) / 3 * 100) + '%'); if (i === 2) { foot3.classList.add('ready'); foot3.textContent = '✓ Complete Session'; } }); };
    const fill555 = () => reps5.forEach((x, i) => r.later(() => { x.classList.remove('active'); x.classList.add('filled'); x.lastElementChild.textContent = AFF5; if (inner && reps5[1]) { const rowH = reps5[1].offsetTop - reps5[0].offsetTop, over = (i + 2) * rowH - list.clientHeight; inner.style.transform = `translateY(${-Math.max(0, over)}px)`; } if (reps5[i + 1]) reps5[i + 1].classList.add('active'); ring5n.textContent = i + 1; ring5.style.setProperty('--p', Math.round((i + 1) / 55 * 100) + '%'); if (i === 54) { foot5.classList.add('ready'); foot5.textContent = '✓ Complete Day'; } }, i * 62));
    const T5 = 14700 + 55 * 62;
    return sequence(r, [
      [0, () => { reset(); pop(pr, 'v-list'); }],
      [1300, () => tapAt(pr, $('.pc-369 .pc-btn', pr))],
      [1700, () => push(pr, 'v-369')],
      [2900, () => tapAt(pr, $('.wr', wins[0]))],
      [3300, () => push(pr, 'v-w369')],
      [3900, () => fill369(0)], [5300, () => fill369(1)], [6700, () => fill369(2)],
      [8500, () => tapAt(pr, foot3)],
      [8900, () => { pop(pr, 'v-369'); wins[0].classList.add('done'); dotsM.forEach((d, i) => r.later(() => d.classList.add('on', 'pop'), 200 + i * 160)); }],
      [10300, () => tapAt(pr, $('.v-369 .back', pr))],
      [10700, () => { pop(pr, 'v-list'); const c = $('.pc-369', pr); c.classList.add('done'); $('.st', c).textContent = '✓ Morning done'; $('.pc-meta span:last-child', c).textContent = '⚡ 16%'; }],
      [12000, () => tapAt(pr, $('.pc-555 .pc-btn', pr))],
      [12400, () => push(pr, 'v-555')],
      [13100, () => qa5.classList.add('pulse')],
      [13700, () => tapAt(pr, $('.v-555 .td .wr', pr))],
      [14100, () => { push(pr, 'v-w555'); reps5[0].classList.add('active'); }],
      [14700, fill555],
      [T5 + 900, () => tapAt(pr, foot5)],
      [T5 + 1300, () => { pop(pr, 'v-555'); qa5.classList.remove('pulse'); td1.classList.remove('on'); td1.classList.add('done'); $('.lab', td1).textContent = 'Completed'; $('.node i', td1).textContent = '✓'; cnt1.textContent = '55'; }],
      [T5 + 2800, () => tapAt(pr, $('.v-555 .back', pr))],
      [T5 + 3200, () => { pop(pr, 'v-list'); const c = $('.pc-555', pr); c.classList.add('done'); $('.st', c).textContent = '✓ Day 1 done'; $('.pc-meta span:last-child', c).textContent = '⚡ 20%'; }]
    ], T5 + 5400);
  });

  /* --- Goals: tick habits → open the goal → Progress Tracking fills → back --- */
  runners.goals = Runner($('#goalsDevice'), (r) => {
    const gd = r.device, bars = $$('.chart i', gd), chks = $$('.v-goals .chk', gd), ringList = $('.v-goals .ring.g', gd), ringBig = $('.v-progress .ring.g', gd);
    const pct = $('.pct', gd), en = $('.en', gd), sr = $('.sr', gd), stk = $('.stk', gd), hdone = $('.hdone', gd);
    // the last 14 days: one done, one missed, then the 12-day streak building day by day
    const heights = [12, 0, 8, 17, 25, 33, 42, 50, 58, 67, 75, 83, 92, 100];
    const days = () => $$('.cal i:not(.pad)', gd);
    const reset = () => { chks.forEach(c => { c.classList.remove('on'); c.closest('.row').classList.remove('done'); }); ringList.style.setProperty('--p', '0%'); ringBig.style.setProperty('--p', '0%'); days().forEach(d => d.classList.remove('on')); bars.forEach(b => b.style.height = '0'); pct.textContent = '0%'; en.textContent = '0'; sr.textContent = '0%'; stk.textContent = '0'; hdone.textContent = '0 of 2 done'; };
    const count = (el, to, suffix = '') => { const steps = 20; for (let i = 1; i <= steps; i++) r.later(() => { el.textContent = Math.round(to * (1 - Math.pow(1 - i / steps, 3))) + suffix; }, i * 55); };
    return sequence(r, [
      [0, () => { reset(); pop(gd, 'v-goals'); }],
      [1200, () => { tapAt(gd, chks[0]); chks[0].classList.add('on'); chks[0].closest('.row').classList.add('done'); hdone.textContent = '1 of 2 done'; }],
      [2300, () => { tapAt(gd, chks[1]); chks[1].classList.add('on'); chks[1].closest('.row').classList.add('done'); hdone.textContent = '2 of 2 done'; ringList.style.setProperty('--p', '40%'); }],
      [3800, () => tapAt(gd, $('.habit-open', gd))],
      [4200, () => push(gd, 'v-progress')],
      // 12 of 30 days = 40% · 12 entries · 12 of the last 13 days = 92% · streak 12
      [5000, () => { ringBig.style.setProperty('--p', '40%'); count(pct, 40, '%'); count(en, 12); count(sr, 92, '%'); count(stk, 12); bars.forEach((b, i) => r.later(() => b.style.height = heights[i] + '%', i * 70)); }],
      // the 12-day streak shown above: the last 12 days, today included (it was ticked on the Goals screen), all done
      [4500, () => { const t = today.getDate(), all = days(); for (let d = Math.max(1, t - 11), i = 0; d <= t; d++, i++) { const el = all[d - 1]; r.later(() => el && el.classList.add('on'), i * 80); } }],
      [10200, () => tapAt(gd, $('.v-progress .back', gd))],
      [10600, () => pop(gd, 'v-goals')]
    ], 12500);
  });

  /* --- Schedule: the plan lands, the current block fills, one tap marks it done --- */
  runners.sched = Runner($('#schedDevice'), (r) => {
    const s = r.device, blks = $$('.blk', s), pbi = $('.pb i', s), pp = $('.pp', s), chk1 = $('.blk .bchk', s);
    const dn = $('.done-n', s), rn = $('.rem-n', s), pn = $('.pct-n', s), upn = $('.upn', s), dcount = $('.dn', s), now = $('.now', s);
    const reset = () => { blks.forEach(b => b.classList.remove('in', 'done')); pbi.style.width = '0'; pp.textContent = '0%'; dn.textContent = '0'; rn.textContent = '4'; pn.textContent = '0%'; upn.textContent = '(4)'; dcount.textContent = '(0)'; now.textContent = '07:05'; };
    return sequence(r, [
      [0, reset],
      [600, () => blks.forEach((b, i) => r.later(() => b.classList.add('in'), i * 220))],
      [1800, () => { for (let k = 1; k <= 25; k++) r.later(() => { const v = k * 4; pbi.style.width = v + '%'; pp.textContent = v + '%'; now.textContent = '07:' + String(5 + Math.round(v * .15)).padStart(2, '0'); }, k * 110); }],
      [5400, () => tapAt(s, chk1)],
      [5800, () => { blks[0].classList.add('done'); dn.textContent = '1'; rn.textContent = '3'; pn.textContent = '25%'; upn.textContent = '(3)'; dcount.textContent = '(1)'; }]
    ], 9800);
  });

  /* --- Portal: today's energy → scroll to tonight's card → open Soul Sleep → read along → back --- */
  runners.portal = Runner($('#portalDevice'), (r) => {
    const pd = r.device, card = $('.nightcard[data-tap="sleep"]', pd), read = $('.read', pd), ps = $('.pscroll', pd), clip = $('.pclip', pd);
    if (read) read.innerHTML = read.textContent.trim().split(/\s+/).map(w => `<span>${w}</span>`).join(' ');
    const words = $$('.read span', pd), W = words.length;
    const scrollTo = (y) => { if (!ps || !clip) return; const max = Math.max(0, ps.scrollHeight - clip.clientHeight); ps.style.transform = `translateY(${-Math.min(max, Math.max(0, y))}px)`; };
    const toCard = () => card && scrollTo(card.offsetTop - 110);
    const T = 6200 + W * 240;
    return sequence(r, [
      [0, () => { pop(pd, 'v-portal'); scrollTo(0); words.forEach(w => w.classList.remove('lit', 'read-done')); }],
      [2600, toCard],
      [4600, () => tapAt(pd, card)],
      [5000, () => push(pd, 'v-sleep')],
      [6200, () => words.forEach((w, i) => r.later(() => { w.classList.add('lit'); if (i > 0) { words[i - 1].classList.remove('lit'); words[i - 1].classList.add('read-done'); } }, i * 240))],
      [T + 500, () => words.forEach(w => w.classList.add('lit'))],
      [T + 2600, () => tapAt(pd, $('.v-sleep .back', pd))],
      [T + 3000, () => pop(pd, 'v-portal')],
      [T + 4200, () => scrollTo(1e6)]
    ], T + 10200);
  });

  /* --- Soul Awakening: Day 3 is open; it seals and Day 4 opens --- */
  runners.journey = Runner($('#journeyDevice'), (r) => {
    const board = $('.board', r.device), rows = $$('.chakra-row', board);
    const setState = (x, st, lab, sub) => { x.classList.remove('done', 'open', 'locked'); x.classList.add(st); $('.lab', x).textContent = lab || ''; $('em', x).textContent = sub; };
    const base = () => { setState(rows[2], 'open', '', 'Manipura'); setState(rows[3], 'locked', '', 'Finish Day 3 first'); setState(rows[4], 'locked', '', 'Opens tomorrow'); };
    return sequence(r, [
      [0, base],
      [2600, () => tapAt(r.device, $('.st', rows[2]))],
      [3000, () => { setState(rows[2], 'done', 'RADIANT', 'Manipura'); setState(rows[3], 'open', '', 'Anahata'); setState(rows[4], 'locked', '', 'Finish Day 4 first'); }]
    ], 9000);
  });

  /* --- Soul Spark + widget: quotes arrive, the wash follows the topic, the heart lands --- */
  runners.spark = Runner($('#sparkDevice'), (r) => {
    const sd = r.device, sw = $('.spark-widget'), qs = $$('.qtext q', sd), like = $('.sacts .like', sd), icon = like && $('i', like), scr = $('.spark-screen', sd);
    const wt = sw && $('.topic', sw), wq = sw && $('.wq', sw), wh = sw && $('.wheart', sw);
    const HEART = '<svg viewBox="0 0 24 24"><path d="M12 21.4l-1.5-1.3C5.4 15.4 2 12.3 2 8.5 2 5.4 4.4 3 7.5 3c1.7 0 3.4.8 4.5 2.1C13.1 3.8 14.8 3 16.5 3 19.6 3 22 5.4 22 8.5c0 3.8-3.4 6.9-8.5 11.5L12 21.4z"/></svg>';
    // HeartBurstView: 22 hearts in a narrow upward fan, 1.4s ease-out, rotate, shrink from 0.8, fade (scaled to the phone)
    const burst = () => {
      if (!like) return;
      const box = document.createElement('span'); box.className = 'heart-fly';
      box.style.left = (icon.offsetLeft + icon.offsetWidth / 2) + 'px'; box.style.top = (icon.offsetTop + icon.offsetHeight / 2) + 'px';
      like.appendChild(box);
      for (let n = 0; n < 22; n++) {
        const t = n / 21, ang = (-160 + 140 * t) * Math.PI / 180 + (Math.random() * .4 - .2), dist = 70 + Math.random() * 40;
        const size = [10, 12, 14, 16][Math.floor(Math.random() * 4)], rot = Math.random() * 80 - 40, delay = Math.random() * 120;
        const h = document.createElement('span'); h.innerHTML = HEART; const svg = h.firstChild; svg.style.width = svg.style.height = size + 'px'; box.appendChild(svg);
        if (svg.animate) svg.animate([
          { transform: 'translate(-50%, -50%) scale(.3) rotate(0deg)', opacity: 1 },
          { transform: `translate(calc(-50% + ${Math.cos(ang) * dist}px), calc(-50% + ${Math.sin(ang) * dist}px)) scale(.8) rotate(${rot}deg)`, opacity: 0 }
        ], { duration: 1400, delay, easing: 'cubic-bezier(.16, 1, .3, 1)', fill: 'both' });
      }
      r.later(() => box.remove(), 1700);
    };
    let qi = 0;
    const show = (i) => { const q = qs[i]; scr.style.setProperty('--tc', q.dataset.c); if (sw) { sw.style.setProperty('--tc', q.dataset.c); wt.textContent = q.dataset.t; wq.textContent = '“' + q.textContent + '”'; } };
    show(0);
    return sequence(r, [
      [0, () => { const prev = qi; qs.forEach(q => q.classList.remove('out')); qs[prev].classList.remove('on'); qs[prev].classList.add('out'); qi = (qi + 1) % qs.length; r.later(() => qs[prev].classList.remove('out'), 600); qs[qi].classList.add('on'); show(qi); like.classList.remove('on'); if (icon) icon.textContent = '♡'; if (wh) wh.classList.remove('on'); }],
      [2400, () => { tapAt(sd, icon); like.classList.add('on'); if (icon) icon.textContent = '♥'; burst(); if (wh) wh.classList.add('on'); }]
    ], 5200);
  });

  // Play each phone only while it can be seen; replay from the start when it comes back.
  const watch = (el, r, threshold = .25) => { if (!el || !r.device) return; new IntersectionObserver(([e]) => { if (e.isIntersecting) { if (!r.running) r.start(); } else r.stop(); }, { threshold }).observe(el); };
  watch($('.s-hero-vis'), runners.hero, .1);

  /* =========================================================================
     4. How it works: sticky stage on desktop, phones inline on phones
     ========================================================================= */
  const steps = $$('.s-step'), scenes = $$('.scene'), stage = $('#stage'), railItems = $$('.s-rail li'), rail = $('.s-rail');
  const SCENE_RUN = [runners.practice, runners.goals, runners.sched, runners.portal, runners.journey, runners.spark];
  const GLOW = ['rgba(255,170,90,.45)', 'rgba(110,210,150,.38)', 'rgba(120,140,255,.34)', 'rgba(160,120,255,.42)', 'rgba(255,140,170,.38)', 'rgba(190,140,255,.4)'];
  // how long each phone plays before a step with two phones hands over to the next one
  const HOLD = [0, 12000, 9600, 0, 0, 0];
  const STEP_SCENES = steps.map(s => (s.dataset.scenes || '').split(',').map(Number));
  const desktop = matchMedia('(min-width: 981px)');
  let active = -1, stageVisible = false, rotate = 0;

  function place() {
    if (desktop.matches) scenes.forEach(s => stage.appendChild(s));
    else steps.forEach((st, i) => { const slots = $$('.s-slot', st); STEP_SCENES[i].forEach((k, n) => { if (slots[n] && scenes[k]) { slots[n].appendChild(scenes[k]); scenes[k].style.setProperty('--sg', GLOW[k]); } }); });
    active = -1; clearTimeout(rotate); SCENE_RUN.forEach(r => r.stop()); sync();
  }
  function showScene(i, n) {
    const list = STEP_SCENES[i], k = list[n % list.length];
    scenes.forEach((s, x) => { s.classList.toggle('on', x === k); s.classList.toggle('past', x < k); });
    $$('.s-subtabs span', steps[i]).forEach((t, x) => { t.style.setProperty('--hold', (HOLD[list[x]] || 10000) / 1000 + 's'); t.classList.remove('on'); if (x === n % list.length) { void t.offsetWidth; t.classList.add('on'); } });
    if (stage) stage.style.setProperty('--sg', GLOW[k]);
    SCENE_RUN.forEach((r, x) => { if (x === k && stageVisible) r.start(); else r.stop(); });
    clearTimeout(rotate);
    if (list.length > 1 && stageVisible) rotate = setTimeout(() => showScene(i, n + 1), HOLD[k] || 10000);
  }
  function activate(i) {
    if (i === active) return;
    active = i;
    steps.forEach((s, k) => s.classList.toggle('on', k === i));
    railItems.forEach((li, k) => li.classList.toggle('on', k === i));
    if (rail) rail.style.setProperty('--rp', ((i + 1) / steps.length * 100) + '%');
    showScene(i, 0);
  }
  function sync() {
    if (!desktop.matches) return;
    const mid = innerHeight * .5; let best = 0;
    steps.forEach((s, k) => { if (s.getBoundingClientRect().top < mid) best = k; });
    activate(best);
  }
  if (stage) {
    new IntersectionObserver(([e]) => { stageVisible = e.isIntersecting; if (!desktop.matches) return; if (stageVisible) { const k = active; active = -1; activate(Math.max(0, k)); } else { clearTimeout(rotate); SCENE_RUN.forEach(r => r.stop()); } }, { threshold: 0 }).observe($('.s-how-grid'));
    addEventListener('scroll', () => requestAnimationFrame(sync), { passive: true });
    railItems.forEach((li, k) => li.addEventListener('click', () => { const s = steps[k]; scrollTo({ top: s.getBoundingClientRect().top + scrollY - innerHeight * .3, behavior: reduce ? 'auto' : 'smooth' }); }));
    desktop.addEventListener('change', place);
    place();
    // on phones every scene plays while it is on screen
    scenes.forEach((s, i) => new IntersectionObserver(([e]) => { if (desktop.matches) return; if (e.isIntersecting) { if (!SCENE_RUN[i].running) SCENE_RUN[i].start(); } else SCENE_RUN[i].stop(); }, { threshold: .3 }).observe(s));
  }

  /* Phones: scale to the viewport height on short laptop screens so the whole device always fits */
  const fit = () => { const h = innerHeight; const k = desktop.matches ? Math.min(1.04, Math.max(.72, (h - 120) / 720)) : 1; root.style.setProperty('--ps', k.toFixed(3)); if (stage) stage.style.transform = desktop.matches ? `scale(${k.toFixed(3)})` : ''; };
  addEventListener('resize', fit); fit();

  /* =========================================================================
     5. Atmosphere
     ========================================================================= */
  function starfield(canvas, { count = 220, shooting = true } = {}) {
    if (!canvas || reduce) return;
    const ctx = canvas.getContext('2d'); let w, h, st = [], met = [], last = 0, visible = false;
    const resize = () => { const r = canvas.getBoundingClientRect(); w = canvas.width = Math.max(1, r.width * devicePixelRatio); h = canvas.height = Math.max(1, r.height * devicePixelRatio);
      st = Array.from({ length: count }, () => { const d = Math.random(); return { x: Math.random() * w, y: Math.random() * h, r: (0.3 + d * 1.3) * devicePixelRatio, a: 0.12 + d * .55, tw: 0.6 + Math.random() * 2.2, ph: Math.random() * 6.28, warm: Math.random() < .16 }; }); };
    resize(); addEventListener('resize', resize);
    const draw = (t) => {
      if (!visible || document.hidden) return;
      if (t - last > 33) {
        last = t; ctx.clearRect(0, 0, w, h);
        for (const s of st) { const k = 0.55 + 0.45 * Math.sin(t / (900 * s.tw) + s.ph), a = s.a * k, c = s.warm ? '255,225,190' : '236,228,255';
          if (s.r > 1.1 * devicePixelRatio) { const g = ctx.createRadialGradient(s.x, s.y, 0, s.x, s.y, s.r * 4); g.addColorStop(0, `rgba(${c},${a * .5})`); g.addColorStop(1, 'rgba(0,0,0,0)'); ctx.fillStyle = g; ctx.beginPath(); ctx.arc(s.x, s.y, s.r * 4, 0, 6.283); ctx.fill(); }
          ctx.fillStyle = `rgba(${c},${a})`; ctx.beginPath(); ctx.arc(s.x, s.y, s.r, 0, 6.283); ctx.fill(); }
        if (shooting && Math.random() < .005 && met.length < 2) met.push({ x: Math.random() * w * .8, y: Math.random() * h * .4, vx: (6 + Math.random() * 5) * devicePixelRatio, vy: (2.5 + Math.random() * 2) * devicePixelRatio, life: 1 });
        met = met.filter(m => m.life > 0);
        for (const m of met) { const g = ctx.createLinearGradient(m.x, m.y, m.x - m.vx * 10, m.y - m.vy * 10); g.addColorStop(0, `rgba(255,255,255,${m.life})`); g.addColorStop(1, 'rgba(255,255,255,0)'); ctx.strokeStyle = g; ctx.lineWidth = 1.5 * devicePixelRatio; ctx.beginPath(); ctx.moveTo(m.x, m.y); ctx.lineTo(m.x - m.vx * 10, m.y - m.vy * 10); ctx.stroke(); m.x += m.vx; m.y += m.vy; m.life -= .03; }
      }
      requestAnimationFrame(draw);
    };
    new IntersectionObserver(([e]) => { const was = visible; visible = e.isIntersecting; if (visible && !was) requestAnimationFrame(draw); }).observe(canvas);
    document.addEventListener('visibilitychange', () => { if (!document.hidden && visible) requestAnimationFrame(draw); });
  }
  $$('.s-stars').forEach(c => starfield(c, { count: innerWidth < 720 ? 110 : 240 }));
  // The page-wide sky: soft warm bokeh in light, a quiet star field in dark
  (function dust() {
    const c = $('.s-dust'); if (!c || reduce) return;
    const ctx = c.getContext('2d'); let w, h, pts = [];
    const resize = () => { w = c.width = innerWidth * devicePixelRatio; h = c.height = innerHeight * devicePixelRatio; c.style.width = innerWidth + 'px'; c.style.height = innerHeight + 'px';
      pts = Array.from({ length: innerWidth < 720 ? 60 : 140 }, () => { const d = Math.random(); return { x: Math.random() * w, y: Math.random() * h, d, r: (0.3 + d * 1.3) * devicePixelRatio, s: 0.04 + d * 0.16, tw: 0.6 + Math.random() * 2.4, ph: Math.random() * 6.28, warm: Math.random() < .3 }; }); };
    resize(); addEventListener('resize', resize);
    let last = 0;
    const draw = (t) => {
      if (document.hidden) return;
      if (t - last > 40) {
        last = t; ctx.clearRect(0, 0, w, h); const dark = root.getAttribute('data-theme') === 'dark';
        for (const p of pts) {
          p.y -= p.s * devicePixelRatio * (dark ? .2 : .8); if (p.y < -40) { p.y = h + 40; p.x = Math.random() * w; }
          const k = 0.5 + 0.5 * Math.sin(t / (900 * p.tw) + p.ph);
          if (dark) { const a = (0.06 + p.d * .32) * (0.5 + 0.5 * k); ctx.fillStyle = `rgba(${p.warm ? '255,226,190' : '240,236,255'},${a})`; ctx.beginPath(); ctx.arc(p.x, p.y, p.r, 0, 6.283); ctx.fill(); }
          else if (p.d > .65) { const R = (10 + p.d * 24) * devicePixelRatio, a = (0.03 + 0.045 * k) * (p.d - .5) * 2, col = p.warm ? '255,170,80' : '170,130,230'; const g = ctx.createRadialGradient(p.x, p.y, 0, p.x, p.y, R); g.addColorStop(0, `rgba(${col},${a})`); g.addColorStop(1, 'rgba(0,0,0,0)'); ctx.fillStyle = g; ctx.beginPath(); ctx.arc(p.x, p.y, R, 0, 6.283); ctx.fill(); }
        }
      }
      requestAnimationFrame(draw);
    };
    requestAnimationFrame(draw);
    document.addEventListener('visibilitychange', () => { if (!document.hidden) requestAnimationFrame(draw); });
  })();

  // Live Activity timer in the details grid
  const cds = $$('.js-countdown');
  if (cds.length && !reduce) { let s = 14 * 60 + 59; setInterval(() => { s = s > 0 ? s - 1 : 14 * 60 + 59; const t = `${Math.floor(s / 60)}:${String(s % 60).padStart(2, '0')}`; cds.forEach(el => el.textContent = t); $$('.w-bar i').forEach(b => b.style.width = (100 - s / (20 * 60) * 100).toFixed(1) + '%'); }, 1000); }

  // Angel Moment: port of the app's StardustTrail (AngelMomentView.swift) — 160 sparkles along one curve,
  // drawn from the bottom up to the dove in 0.7s, a light burst, the dove appears. Plays once, then rests.
  // Sparkles are small diamonds, kept soft so the card's text stays readable. Colours come from CSS
  // (--spark / --spark-glow) so the trail suits both the light and the dark card.
  (function angelTrail() {
    const cv = $('.angel-trail'), art = $('.angel-art'), card = $('.b-angel'); if (!cv || !art || !card) return;
    const ctx = cv.getContext('2d'), N = 160, DRAW = 700, SETTLE = 1600;
    const hash = (i, s) => { const v = Math.sin(i * 12.9898 + s * 78.233) * 43758.5453; return v - Math.floor(v); };
    const pt = (p0, p1, p2, p3, t) => { const m = 1 - t, a = m * m * m, b = 3 * m * m * t, c = 3 * m * t * t, d = t * t * t; return [a * p0[0] + b * p1[0] + c * p2[0] + d * p3[0], a * p0[1] + b * p1[1] + c * p2[1] + d * p3[1]]; };
    const tan = (p0, p1, p2, p3, t) => { const m = 1 - t; return [3 * m * m * (p1[0] - p0[0]) + 6 * m * t * (p2[0] - p1[0]) + 3 * t * t * (p3[0] - p2[0]), 3 * m * m * (p1[1] - p0[1]) + 6 * m * t * (p2[1] - p1[1]) + 3 * t * t * (p3[1] - p2[1])]; };
    const diamond = (x, y, s) => { ctx.beginPath(); ctx.moveTo(x, y - s); ctx.lineTo(x + s * .62, y); ctx.lineTo(x, y + s); ctx.lineTo(x - s * .62, y); ctx.closePath(); ctx.fill(); };
    let w = 0, h = 0, dpr = 1, P = null, t0 = 0, played = false, last = 0;
    const layout = () => {
      const r = card.getBoundingClientRect(), d = $('img', art).getBoundingClientRect(); dpr = devicePixelRatio || 1;
      w = r.width; h = r.height; cv.width = w * dpr; cv.height = h * dpr;
      const dx = d.left - r.left + d.width * .42, dy = d.top - r.top + d.height * .62;   // the dove's tail
      P = [[dx, dy], [-w * .25, h * .35], [w * .05, h * 1.05], [w * 1.02, h * 1.08]];
    };
    const paint = (reveal) => {
      last = reveal;
      const cs = getComputedStyle(card), sp = cs.getPropertyValue('--spark').trim() || '255,236,200', gl = cs.getPropertyValue('--spark-glow').trim() || '255,220,160', k = parseFloat(cs.getPropertyValue('--spark-k')) || .55;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0); ctx.clearRect(0, 0, w, h);
      const [p0, c1, c2, p3] = P, from = 1 - reveal;
      const g = ctx.createLinearGradient(p0[0], p0[1], p3[0], p3[1]); g.addColorStop(0, `rgba(${gl},${.7 * k})`); g.addColorStop(.6, `rgba(${gl},${.18 * k})`); g.addColorStop(1, `rgba(${gl},0)`);
      ctx.strokeStyle = g; ctx.lineCap = 'round';
      [[4, 6], [1.2, 0]].forEach(([lw, blur]) => { ctx.save(); ctx.filter = blur ? `blur(${blur}px)` : 'none'; ctx.lineWidth = lw; ctx.beginPath(); for (let n = 0; n <= 60; n++) { const t = from + (1 - from) * n / 60, q = pt(p0, c1, c2, p3, t); n ? ctx.lineTo(q[0], q[1]) : ctx.moveTo(q[0], q[1]); } ctx.stroke(); ctx.restore(); });
      for (let i = 0; i < N; i++) {
        const t = i / (N - 1); if (1 - t > reveal) continue;
        const b = pt(p0, c1, c2, p3, t), tg = tan(p0, c1, c2, p3, t), len = Math.hypot(tg[0], tg[1]) || 1;
        const head = .4 + (1 - t), spread = (hash(i, 1) - .5) * 33 * head, along = (hash(i, 2) - .5) * 12;
        const x = b[0] + (-tg[1] / len) * spread + (tg[0] / len) * along, y = b[1] + (tg[0] / len) * spread + (tg[1] / len) * along;
        const s = (1 + hash(i, 3) * 2.6) * (.5 + (1 - t));
        const op = Math.min(1, (.35 + hash(i, 4) * .65) * (.5 + .5 * (1 - t))) * k;
        ctx.fillStyle = `rgba(${gl},${op * .3})`; diamond(x, y, s * 1.8);
        ctx.fillStyle = `rgba(${sp},${op})`; diamond(x, y, s * .8);
      }
    };
    const play = () => {
      if (played) return; played = true; layout(); t0 = performance.now();
      art.classList.add('wait');
      const step = (now) => {
        const e = now - t0;
        paint(Math.min(1, e / DRAW));
        if (e > DRAW - 100 && art.classList.contains('wait')) { art.classList.remove('wait'); void art.offsetWidth; art.classList.add('play'); }
        if (e < SETTLE) requestAnimationFrame(step);
      };
      requestAnimationFrame(step);
    };
    addEventListener('resize', () => { if (played) { layout(); paint(last); } });
    new MutationObserver(() => { if (played) paint(last); }).observe(root, { attributes: true, attributeFilter: ['data-theme'] });
    if (reduce) { layout(); paint(1); played = true; return; }
    const io = new IntersectionObserver(([en]) => { if (en.isIntersecting) { io.disconnect(); play(); } }, { threshold: .45 });
    io.observe(card);
  })();

  // QR: hovering a code shows it large (a peek that closes when the pointer leaves the code);
  // clicking, or Enter, pins it open until ✕, Esc or a click on the dimmed page.
  (function qrModal() {
    const modal = $('#qrModal'); if (!modal) return;
    let opener = null, hoverT = 0;
    const open = (from, peek) => {
      modal.classList.toggle('peek', !!peek);
      if (!modal.hidden) return;
      opener = from; modal.hidden = false; document.body.classList.add('qr-open');
      requestAnimationFrame(() => modal.classList.add('open'));
      if (!peek) $('.s-qr-x', modal).focus({ preventScroll: true });
    };
    const close = () => {
      if (modal.hidden) return;
      modal.classList.remove('open'); document.body.classList.remove('qr-open');
      setTimeout(() => { if (!modal.classList.contains('open')) { modal.hidden = true; modal.classList.remove('peek'); } }, reduce ? 0 : 350);
      if (opener && !modal.classList.contains('peek')) opener.focus({ preventScroll: true });
    };
    $$('.js-qr').forEach(q => {
      q.addEventListener('click', () => open(q, false));
      q.addEventListener('keydown', (e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); open(q, false); } });
      if (matchMedia('(hover: hover)').matches) {
        q.addEventListener('mouseenter', () => { clearTimeout(hoverT); hoverT = setTimeout(() => open(q, true), 250); });
        q.addEventListener('mouseleave', () => { clearTimeout(hoverT); if (modal.classList.contains('peek')) close(); });
      }
    });
    $$('[data-close]', modal).forEach(el => el.addEventListener('click', close));
    addEventListener('keydown', (e) => { if (e.key === 'Escape') close(); });
  })();

  // Smooth in-page anchors under the floating nav
  $$('a[href^="#"]').forEach(a => a.addEventListener('click', (e) => { const id = a.getAttribute('href'); if (id.length < 2) return; const t = $(id); if (!t) return; e.preventDefault(); scrollTo({ top: id === '#top' ? 0 : t.getBoundingClientRect().top + scrollY - 80, behavior: reduce ? 'auto' : 'smooth' }); }));
})();
