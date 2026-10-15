'use strict';

// Writing pages only (research.html and the articles).
// Shared behaviour (theme, menu, reading progress bar) lives in script.js.

// ============================
// VIEW COUNTER (optional)
// Put your GoatCounter site code here (the "mysite" in mysite.goatcounter.com)
// to count visits and show views under each article. Empty = no counter, nothing shown.
// ============================
const GOATCOUNTER_CODE = '';

// ============================
// TABLE OF CONTENTS, built from the article's h2 headings
// ============================
(function initToc() {
  const body = document.querySelector('.article-body');
  const desktop = document.querySelector('.toc ol');
  const mobile = document.querySelector('.toc-mobile ol');
  if (!body || !desktop || !mobile) return;

  const headings = Array.from(body.querySelectorAll('h2'))
    .filter(h => !h.closest('.references'));

  headings.forEach((h, i) => {
    if (!h.id) {
      h.id = h.textContent.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '') || `section-${i + 1}`;
    }
    [desktop, mobile].forEach(list => {
      const li = document.createElement('li');
      const a = document.createElement('a');
      a.href = `#${h.id}`;
      a.textContent = h.textContent;
      li.appendChild(a);
      list.appendChild(li);
    });
  });

  // Highlight the section being read
  const links = Array.from(desktop.querySelectorAll('a'));
  const observer = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      if (!entry.isIntersecting) return;
      links.forEach(a => a.classList.toggle('is-current', a.getAttribute('href') === `#${entry.target.id}`));
    });
  }, { rootMargin: '0px 0px -70% 0px' });
  headings.forEach(h => observer.observe(h));

  // Close the phone contents list after choosing a section
  const details = document.querySelector('.toc-mobile');
  mobile.addEventListener('click', e => {
    if (e.target.closest('a') && details) details.open = false;
  });
})();

// ============================
// CATEGORY FILTER on the writing index
// ============================
(function initFilter() {
  const buttons = document.querySelectorAll('.filter button');
  const posts = document.querySelectorAll('[data-category]');
  if (!buttons.length || !posts.length) return;

  buttons.forEach(btn => {
    btn.addEventListener('click', () => {
      const filter = btn.dataset.filter;
      buttons.forEach(b => b.setAttribute('aria-pressed', String(b === btn)));
      posts.forEach(post => {
        post.hidden = !(filter === 'all' || post.dataset.category === filter);
      });
    });
  });
})();

// ============================
// MENU (phone): keep aria-expanded honest and offer a close button
// ============================
(function initMenuState() {
  const button = document.getElementById('hamburger');
  const drawer = document.getElementById('mobileDrawer');
  if (!button || !drawer) return;
  const sync = () => button.setAttribute('aria-expanded', String(drawer.classList.contains('open')));
  new MutationObserver(sync).observe(drawer, { attributes: true, attributeFilter: ['class'] });
  const close = drawer.querySelector('.drawer-close');
  if (close) close.addEventListener('click', () => button.click());
})();

// ============================
// VIEW COUNTER
// ============================
(function initViews() {
  if (!GOATCOUNTER_CODE) return;
  const base = `https://${GOATCOUNTER_CODE}.goatcounter.com`;

  const s = document.createElement('script');
  s.async = true;
  s.src = '//gc.zgo.at/count.js';
  s.dataset.goatcounter = `${base}/count`;
  document.head.appendChild(s);

  const out = document.getElementById('viewCount');
  if (!out) return;
  const path = window.location.pathname;
  fetch(`${base}/counter/${encodeURIComponent(path)}.json`)
    .then(r => (r.ok ? r.json() : null))
    .then(data => {
      if (!data || !data.count) return;
      out.textContent = `${data.count} views`;
      out.hidden = false;
    })
    .catch(() => {});
})();
