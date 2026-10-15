'use strict';

// Work, About and Photography pages. Shared behaviour (theme, menu toggle) lives in script.js.

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
// PHOTO LIGHTBOX: full-size view with keyboard and swipe navigation
// ============================
(function initLightbox() {
  const items = Array.from(document.querySelectorAll('.gallery button[data-full]'));
  const box = document.getElementById('lightbox');
  if (!items.length || !box) return;

  const img = box.querySelector('img');
  const count = box.querySelector('.lb-count');
  let index = 0;
  let lastFocus = null;

  function show(i) {
    index = (i + items.length) % items.length;
    const thumb = items[index].querySelector('img');
    img.src = items[index].dataset.full;
    img.alt = thumb.alt;
    count.textContent = `${index + 1} / ${items.length}`;
  }
  function open(i) {
    lastFocus = document.activeElement;
    show(i);
    box.classList.add('open');
    document.body.style.overflow = 'hidden';
    box.querySelector('.lb-close').focus();
  }
  function close() {
    box.classList.remove('open');
    document.body.style.overflow = '';
    if (lastFocus) lastFocus.focus();
  }

  items.forEach((item, i) => item.addEventListener('click', () => open(i)));
  box.querySelector('.lb-close').addEventListener('click', close);
  box.querySelector('.lb-prev').addEventListener('click', () => show(index - 1));
  box.querySelector('.lb-next').addEventListener('click', () => show(index + 1));
  box.addEventListener('click', e => { if (e.target === box) close(); });

  document.addEventListener('keydown', e => {
    if (!box.classList.contains('open')) return;
    if (e.key === 'Escape') close();
    if (e.key === 'ArrowRight') show(index + 1);
    if (e.key === 'ArrowLeft') show(index - 1);
  });

  let startX = null;
  box.addEventListener('touchstart', e => { startX = e.touches[0].clientX; }, { passive: true });
  box.addEventListener('touchend', e => {
    if (startX === null) return;
    const dx = e.changedTouches[0].clientX - startX;
    if (Math.abs(dx) > 50) show(index + (dx < 0 ? 1 : -1));
    startX = null;
  });
})();
