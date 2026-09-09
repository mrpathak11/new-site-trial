'use strict';

// ============================
// SCROLL REVEAL (IntersectionObserver)
// ============================
const revealElements = document.querySelectorAll('.reveal, .reveal-left, .reveal-right, .reveal-scale');

const revealObserver = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      entry.target.classList.add('revealed');
      revealObserver.unobserve(entry.target);
    }
  });
}, {
  threshold: 0.08,
  rootMargin: '0px 0px -50px 0px'
});

revealElements.forEach(el => revealObserver.observe(el));

// ============================
// SKILL BAR ANIMATION
// ============================
const skillBars = document.querySelectorAll('.skill-progress[data-width]');

const skillObserver = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      const bar = entry.target;
      // Small delay for visual effect
      setTimeout(() => {
        bar.style.width = bar.getAttribute('data-width');
        bar.classList.add('animate');
      }, 200);
      skillObserver.unobserve(bar);
    }
  });
}, {
  threshold: 0.3
});

skillBars.forEach(bar => skillObserver.observe(bar));

// ============================
// FLOATING PARTICLES
// ============================
const particlesContainer = document.getElementById('particles');

function createParticles() {
  if (!particlesContainer) return;
  const count = window.innerWidth < 768 ? 10 : 20;

  for (let i = 0; i < count; i++) {
    const particle = document.createElement('div');
    particle.classList.add('particle');
    particle.style.left = Math.random() * 100 + '%';
    particle.style.width = (Math.random() * 3 + 1) + 'px';
    particle.style.height = particle.style.width;
    particle.style.animationDuration = (Math.random() * 15 + 10) + 's';
    particle.style.animationDelay = (Math.random() * 10) + 's';
    particle.style.opacity = '0';
    particlesContainer.appendChild(particle);
  }
}
createParticles();

// ============================
// THEME TOGGLE
// ============================
const themeToggle = document.getElementById('themeToggle');
const htmlEl = document.documentElement;

// Check saved preference or system preference
function getPreferredTheme() {
  const saved = localStorage.getItem('sp-theme');
  if (saved) return saved;
  return window.matchMedia('(prefers-color-scheme: light)').matches ? 'light' : 'dark';
}

function setTheme(theme) {
  htmlEl.setAttribute('data-theme', theme);
  localStorage.setItem('sp-theme', theme);
}

// Initialize theme
setTheme(getPreferredTheme());

if (themeToggle) {
  themeToggle.addEventListener('click', () => {
    const current = htmlEl.getAttribute('data-theme');
    const next = current === 'dark' ? 'light' : 'dark';
    setTheme(next);
  });
}

// Listen for system preference changes
window.matchMedia('(prefers-color-scheme: light)').addEventListener('change', (e) => {
  if (!localStorage.getItem('sp-theme')) {
    setTheme(e.matches ? 'light' : 'dark');
  }
});

// ============================
// NAVBAR — Scroll shadow + active state
// ============================
const topNav = document.getElementById('topNav');
const sections = document.querySelectorAll('section[id]');
const navLinksDesktop = document.querySelectorAll('.nav-links .nav-link');
const navLinksDrawer = document.querySelectorAll('.mobile-drawer .nav-link');

function updateNav() {
  // Add shadow on scroll
  if (window.scrollY > 20) {
    topNav.classList.add('scrolled');
  } else {
    topNav.classList.remove('scrolled');
  }

  // Active section highlight
  let current = '';
  sections.forEach(section => {
    const sectionTop = section.offsetTop - 140;
    const sectionHeight = section.clientHeight;
    if (window.scrollY >= sectionTop && window.scrollY < sectionTop + sectionHeight) {
      current = section.getAttribute('id');
    }
  });

  const updateLinks = (links) => {
    links.forEach(link => {
      link.classList.remove('active');
      const href = link.getAttribute('href');
      if (href && href.includes('#') && href.includes(current) && current !== '') {
        link.classList.add('active');
      }
    });
  };

  updateLinks(navLinksDesktop);
  updateLinks(navLinksDrawer);
}

let ticking = false;
window.addEventListener('scroll', () => {
  if (!ticking) {
    requestAnimationFrame(() => {
      updateNav();
      ticking = false;
    });
    ticking = true;
  }
});

// Initial call
updateNav();

// ============================
// HAMBURGER MENU
// ============================
const hamburger = document.getElementById('hamburger');
const mobileDrawer = document.getElementById('mobileDrawer');

if (hamburger && mobileDrawer) {
  hamburger.addEventListener('click', () => {
    hamburger.classList.toggle('open');
    mobileDrawer.classList.toggle('open');
    document.body.style.overflow = mobileDrawer.classList.contains('open') ? 'hidden' : '';
  });

  // Close drawer when a link is clicked
  mobileDrawer.querySelectorAll('.nav-link').forEach(link => {
    link.addEventListener('click', () => {
      hamburger.classList.remove('open');
      mobileDrawer.classList.remove('open');
      document.body.style.overflow = '';
    });
  });

  // Close on Escape key
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && mobileDrawer.classList.contains('open')) {
      hamburger.classList.remove('open');
      mobileDrawer.classList.remove('open');
      document.body.style.overflow = '';
    }
  });
}

// ============================
// PORTFOLIO FILTERING
// ============================
const filterBtns = document.querySelectorAll('.filter-btn');

filterBtns.forEach(btn => {
  btn.addEventListener('click', () => {
    filterBtns.forEach(b => b.classList.remove('active'));
    btn.classList.add('active');

    const filterValue = btn.getAttribute('data-filter');

    const portfolioBtn = document.querySelector('[data-show-more-btn="portfolio"]');
    const portfolioContainer = document.querySelector('[data-show-more-container="portfolio"]');

    if (portfolioBtn && portfolioContainer) {
      const allItems = portfolioContainer.querySelectorAll('.project-card');

      if (filterValue === 'all') {
        portfolioBtn.style.display = 'block';
        portfolioBtn.textContent = 'Show More';
        portfolioBtn.setAttribute('data-expanded', 'false');

        let count = 0;
        allItems.forEach(item => {
          item.style.display = '';
          item.style.opacity = '1';
          item.style.transform = '';
          if (count >= 3) {
            item.classList.add('hidden-item');
          } else {
            item.classList.remove('hidden-item');
          }
          count++;
        });
      } else {
        portfolioBtn.style.display = 'none';
        let visibleIndex = 0;
        allItems.forEach(item => {
          if (item.dataset.category === filterValue) {
            item.classList.remove('hidden-item');
            item.style.display = '';
            // Stagger animation
            const delay = visibleIndex * 80;
            item.style.opacity = '0';
            item.style.transform = 'translateY(20px)';
            setTimeout(() => {
              item.style.transition = 'opacity 0.4s ease, transform 0.4s ease';
              item.style.opacity = '1';
              item.style.transform = '';
            }, delay);
            visibleIndex++;
          } else {
            item.style.opacity = '0';
            item.style.transform = 'scale(0.9)';
            setTimeout(() => {
              item.classList.add('hidden-item');
              item.style.transition = '';
            }, 300);
          }
        });
      }
    }
  });
});

// ============================
// SHOW MORE / SHOW LESS
// ============================
const showMoreContainers = document.querySelectorAll('[data-show-more-container]');

showMoreContainers.forEach(container => {
  const category = container.dataset.showMoreContainer;
  const btn = document.querySelector(`[data-show-more-btn="${category}"]`);
  const itemElements = Array.from(container.children).filter(
    el => el.classList.contains('project-card') || el.classList.contains('blog-card')
  );
  const initialShow = 3;

  if (itemElements.length <= initialShow) {
    if (btn) btn.style.display = 'none';
    return;
  }

  // Hide items beyond initial count
  for (let i = initialShow; i < itemElements.length; i++) {
    itemElements[i].classList.add('hidden-item');
  }

  if (btn) {
    btn.addEventListener('click', function () {
      const isExpanded = this.getAttribute('data-expanded') === 'true';

      if (isExpanded) {
        for (let i = initialShow; i < itemElements.length; i++) {
          itemElements[i].classList.add('hidden-item');
        }
        this.textContent = 'Show More';
        this.setAttribute('data-expanded', 'false');
        container.scrollIntoView({ behavior: 'smooth', block: 'start' });
      } else {
        for (let i = initialShow; i < itemElements.length; i++) {
          const item = itemElements[i];
          item.classList.remove('hidden-item');

          // Stagger entrance animation
          const delay = (i - initialShow) * 100;
          item.style.opacity = '0';
          item.style.transform = 'translateY(30px)';
          setTimeout(() => {
            item.style.transition = 'opacity 0.5s ease, transform 0.5s ease';
            item.style.opacity = '1';
            item.style.transform = '';
          }, delay);

          // Trigger reveal if needed
          if (item.classList.contains('reveal') && !item.classList.contains('revealed')) {
            item.classList.add('revealed');
          }
        }
        this.textContent = 'Show Less';
        this.setAttribute('data-expanded', 'true');
      }
    });
  }
});

// ============================
// CONTACT FORM VALIDATION
// ============================
const form = document.querySelector('[data-form]');
const formInputs = document.querySelectorAll('[data-form-input]');
const formBtn = document.querySelector('[data-form-btn]');

if (form) {
  formInputs.forEach(input => {
    input.addEventListener('input', () => {
      if (form.checkValidity()) {
        formBtn.removeAttribute('disabled');
      } else {
        formBtn.setAttribute('disabled', '');
      }
    });
  });
}

// ============================
// SMOOTH SCROLL for nav links
// ============================
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
  anchor.addEventListener('click', function (e) {
    const target = document.querySelector(this.getAttribute('href'));
    if (target) {
      e.preventDefault();
      target.scrollIntoView({ behavior: 'smooth' });
    }
  });
});

// ============================
// DYNAMIC FOOTER YEAR
// ============================
const footerYear = document.getElementById('footerYear');
if (footerYear) {
  footerYear.textContent = new Date().getFullYear();
}