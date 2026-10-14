'use strict';

// Homepage only. Shared behaviour (theme, drawer, form, copy email) lives in script.js.

document.documentElement.classList.add('js');

// ============================
// RESEARCH SPOTLIGHT: heat pump vs gas boiler
// ============================
(function initCalc() {
  const grid = document.getElementById('gridIntensity');
  const cop = document.getElementById('copValue');
  if (!grid || !cop) return;

  const GAS_PER_KWH_FUEL = 201;   // g CO2 per kWh of natural gas burned (combustion only)
  const BOILER_EFFICIENCY = 0.95; // condensing boiler
  const gasPerHeat = GAS_PER_KWH_FUEL / BOILER_EFFICIENCY;

  const gridOut = document.getElementById('gridOut');
  const copOut = document.getElementById('copOut');
  const number = document.getElementById('hpNumber');
  const verdict = document.getElementById('hpVerdict');

  function update() {
    const g = Number(grid.value);
    const c = Number(cop.value);
    const hp = g / c;
    const diff = Math.round((1 - hp / gasPerHeat) * 100);
    const breakEven = Math.round(gasPerHeat * c);

    gridOut.textContent = `${g} g/kWh`;
    copOut.textContent = c.toFixed(1);
    number.textContent = `${Math.round(hp)} g`;

    const compare = diff >= 0
      ? `<strong>${diff}% less</strong> than a gas boiler (${Math.round(gasPerHeat)} g).`
      : `<strong>${Math.abs(diff)}% more</strong> than a gas boiler (${Math.round(gasPerHeat)} g).`;
    verdict.innerHTML = `${compare} At this COP, gas only wins on a grid above ${breakEven} g/kWh.`;
  }

  grid.addEventListener('input', update);
  cop.addEventListener('input', update);
  update();
})();

// ============================
// EARLIER PROJECTS: hovering a row shows its image beside the list
// ============================
(function initPreview() {
  const img = document.getElementById('previewImg');
  const caption = document.getElementById('previewCaption');
  const rows = document.querySelectorAll('.ledger .row[data-preview]');
  if (!img || !rows.length) return;

  let swapTimer;
  function show(row) {
    rows.forEach(r => r.classList.toggle('is-current', r === row));
    if (img.getAttribute('src') === row.dataset.preview) return;
    clearTimeout(swapTimer);
    img.classList.add('is-swapping');
    swapTimer = setTimeout(() => {
      img.src = row.dataset.preview;
      img.alt = row.dataset.previewAlt || '';
      caption.textContent = row.dataset.previewCaption || '';
      img.classList.remove('is-swapping');
    }, 150);
  }

  rows.forEach(row => {
    row.addEventListener('mouseenter', () => show(row));
    row.addEventListener('focus', () => show(row));
  });
})();

// ============================
// ENTRANCES: the parts of each section arrive in turn
// ============================
(function initEntrances() {
  const groups = document.querySelectorAll('[data-enter-group]');
  groups.forEach(group => {
    group.querySelectorAll('[data-enter]').forEach((el, i) => {
      el.style.transitionDelay = `${Math.min(i, 6) * 70}ms`;
    });
  });

  const observer = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      if (!entry.isIntersecting) return;
      entry.target.classList.add('is-in');
      observer.unobserve(entry.target);
    });
  }, { threshold: 0.1, rootMargin: '0px 0px -40px 0px' });

  groups.forEach(g => observer.observe(g));
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
