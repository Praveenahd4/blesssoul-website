/* BlessSoul inner pages (Support, Privacy, Terms) — no dependencies.
   Theme toggle, nav, the "On this page" rail and the footer year. */
(function () {
  'use strict';
  const $ = (s, r = document) => r.querySelector(s);
  const $$ = (s, r = document) => Array.from(r.querySelectorAll(s));
  const root = document.documentElement;
  const store = { get(k) { try { return localStorage.getItem(k); } catch (e) { return null; } }, set(k, v) { try { localStorage.setItem(k, v); } catch (e) {} } };

  $$('.s-theme').forEach(b => b.addEventListener('click', () => {
    const t = root.getAttribute('data-theme') === 'dark' ? 'light' : 'dark';
    root.setAttribute('data-theme', t); store.set('bs-theme', t);
  }));
  matchMedia('(prefers-color-scheme: dark)').addEventListener('change', (e) => { if (!store.get('bs-theme')) root.setAttribute('data-theme', e.matches ? 'dark' : 'light'); });

  const nav = $('#nav'), burger = $('.s-burger'), menu = $('#menu');
  burger.addEventListener('click', () => { const o = menu.classList.toggle('open'); burger.setAttribute('aria-expanded', String(o)); });
  $$('a', menu).forEach(a => a.addEventListener('click', () => { menu.classList.remove('open'); burger.setAttribute('aria-expanded', 'false'); }));

  // "On this page": one link per section heading
  const toc = $('.d-toc'), heads = $$('.d-doc h2:not(.no-toc)');
  const slug = (t) => t.toLowerCase().replace(/&/g, 'and').replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
  heads.forEach(h => { if (!h.id) h.id = slug(h.textContent); });
  const links = toc ? heads.map(h => {
    const a = document.createElement('a'); a.href = '#' + h.id; a.textContent = h.textContent; toc.appendChild(a); return a;
  }) : [];

  const onScroll = () => {
    nav.classList.toggle('scrolled', scrollY > 10);
    if (!links.length) return;
    let cur = 0; heads.forEach((h, i) => { if (h.getBoundingClientRect().top < innerHeight * .3) cur = i; });
    links.forEach((a, i) => a.classList.toggle('on', i === cur));
  };
  addEventListener('scroll', onScroll, { passive: true }); onScroll();

  // A link to a question opens it
  const openTarget = () => { const t = location.hash && document.getElementById(location.hash.slice(1)); if (t && t.tagName === 'DETAILS') t.open = true; };
  addEventListener('hashchange', openTarget); openTarget();

  const y = $('#year'); if (y) y.textContent = new Date().getFullYear();
})();
