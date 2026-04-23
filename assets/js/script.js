'use strict';

// ============================
// SCROLL REVEAL (IntersectionObserver)
// ============================
const revealElements = document.querySelectorAll('.reveal');

const revealObserver = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      entry.target.classList.add('revealed');
      revealObserver.unobserve(entry.target);
    }
  });
}, {
  threshold: 0.1,
  rootMargin: '0px 0px -40px 0px'
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
      bar.style.width = bar.getAttribute('data-width');
      bar.classList.add('animate');
      skillObserver.unobserve(bar);
    }
  });
}, {
  threshold: 0.3
});

skillBars.forEach(bar => skillObserver.observe(bar));

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
    const sectionTop = section.offsetTop - 120;
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
const projectCards = document.querySelectorAll('.project-card');

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
          if (count >= 3) {
            item.classList.add('hidden-item');
          } else {
            item.classList.remove('hidden-item');
          }
          item.style.opacity = '1';
          item.style.transform = '';
          count++;
        });
      } else {
        portfolioBtn.style.display = 'none';
        allItems.forEach(item => {
          if (item.dataset.category === filterValue) {
            item.classList.remove('hidden-item');
            item.style.display = '';
            requestAnimationFrame(() => {
              item.style.opacity = '1';
              item.style.transform = '';
            });
          } else {
            item.style.opacity = '0';
            item.style.transform = 'scale(0.9)';
            setTimeout(() => {
              item.classList.add('hidden-item');
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
          itemElements[i].classList.remove('hidden-item');
          // Trigger reveal animation for newly shown items
          if (itemElements[i].classList.contains('reveal') && !itemElements[i].classList.contains('revealed')) {
            requestAnimationFrame(() => {
              itemElements[i].classList.add('revealed');
            });
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