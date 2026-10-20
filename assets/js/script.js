'use strict';

// Shared by every page: theme, navigation, reading progress, contact form, copy email.

// ============================
// THEME TOGGLE
// The saved theme is applied in each page's <head> before it draws (no flash);
// this only handles the button and follows the system setting until the visitor chooses.
// ============================
const htmlEl = document.documentElement;
const themeToggle = document.getElementById('themeToggle');

if (themeToggle) {
  themeToggle.addEventListener('click', () => {
    const next = htmlEl.getAttribute('data-theme') === 'dark' ? 'light' : 'dark';
    htmlEl.setAttribute('data-theme', next);
    try { localStorage.setItem('sp-theme', next); } catch (e) { /* storage blocked */ }
  });
}

window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', (e) => {
  let saved = null;
  try { saved = localStorage.getItem('sp-theme'); } catch (err) { /* storage blocked */ }
  if (!saved) htmlEl.setAttribute('data-theme', e.matches ? 'dark' : 'light');
});

// ============================
// NAVBAR: hairline on scroll, current section on the homepage
// ============================
const topNav = document.getElementById('topNav');
const sections = document.querySelectorAll('section[id]');
const hashLinks = document.querySelectorAll('.nav-links .nav-link[href^="#"], .mobile-drawer .nav-link[href^="#"]');

function updateNav() {
  if (topNav) topNav.classList.toggle('scrolled', window.scrollY > 20);

  if (!hashLinks.length) return;
  let current = '';
  sections.forEach(section => {
    const top = section.offsetTop - 140;
    if (window.scrollY >= top && window.scrollY < top + section.clientHeight) current = section.id;
  });
  hashLinks.forEach(link => link.classList.toggle('active', current !== '' && link.getAttribute('href') === `#${current}`));
}

let ticking = false;
window.addEventListener('scroll', () => {
  if (ticking) return;
  ticking = true;
  requestAnimationFrame(() => {
    updateNav();
    ticking = false;
  });
}, { passive: true });
updateNav();

// ============================
// MOBILE MENU
// ============================
const hamburger = document.getElementById('hamburger');
const mobileDrawer = document.getElementById('mobileDrawer');

if (hamburger && mobileDrawer) {
  const setOpen = (open) => {
    mobileDrawer.classList.toggle('open', open);
    hamburger.classList.toggle('open', open);
    document.body.style.overflow = open ? 'hidden' : '';
  };
  hamburger.addEventListener('click', () => setOpen(!mobileDrawer.classList.contains('open')));
  mobileDrawer.querySelectorAll('.nav-link').forEach(link => link.addEventListener('click', () => setOpen(false)));
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && mobileDrawer.classList.contains('open')) setOpen(false);
  });
}

// ============================
// FOOTER YEAR
// ============================
const footerYear = document.getElementById('footerYear');
if (footerYear) footerYear.textContent = new Date().getFullYear();

// ============================
// READING PROGRESS (styled on the writing pages only)
// ============================
(function initScrollProgress() {
  const bar = document.createElement('div');
  bar.id = 'global-scroll-progress';
  bar.setAttribute('aria-hidden', 'true');
  document.body.prepend(bar);
  window.addEventListener('scroll', () => {
    const max = document.documentElement.scrollHeight - document.documentElement.clientHeight;
    bar.style.width = (max > 0 ? Math.min(100, (window.scrollY / max) * 100) : 0) + '%';
  }, { passive: true });
})();

// ============================
// COPY EMAIL TO CLIPBOARD
// ============================
window.copyEmailToClipboard = function (email) {
  navigator.clipboard.writeText(email).then(() => {
    let toast = document.getElementById('toastNotice');
    if (!toast) {
      toast = document.createElement('div');
      toast.id = 'toastNotice';
      toast.className = 'toast-notice';
      toast.setAttribute('role', 'status');
      document.body.appendChild(toast);
    }
    toast.innerHTML = `<span>Email copied: <strong>${email}</strong></span>`;
    toast.classList.add('show');
    setTimeout(() => toast.classList.remove('show'), 3200);
  }).catch(() => {
    window.location.href = `mailto:${email}`;
  });
};

// ============================
// CONTACT FORM: opens the visitor's own email app with the message filled in.
// No third-party service; the email goes straight from them to me.
// ============================
(function initContactForm() {
  const form = document.querySelector('[data-form]');
  if (!form) return;

  const to = form.dataset.to;
  const inputs = form.querySelectorAll('[data-form-input]');
  const submitBtn = form.querySelector('[data-form-btn]');
  const statusBox = document.createElement('div');
  statusBox.className = 'form-status-msg';
  statusBox.setAttribute('role', 'status');
  form.appendChild(statusBox);

  inputs.forEach(input => input.addEventListener('input', () => {
    submitBtn.disabled = !form.checkValidity();
  }));

  form.addEventListener('submit', (e) => {
    e.preventDefault();
    if (!form.checkValidity()) return;

    const name = form.fullname.value.trim();
    const subject = form.subject.value.trim() || `Message from ${name} via sumanpathak.com.np`;
    const body = `${form.message.value.trim()}

— ${name}`;
    window.location.href = `mailto:${to}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;

    statusBox.className = 'form-status-msg success';
    statusBox.innerHTML = `<strong>Your email app should open now</strong> with the message filled in; press send there. If nothing opened, email me directly at <a href="mailto:${to}">${to}</a>.`;
  });
})();
