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

// ============================
// ADVANCED UI/UX: 1. GLOBAL SCROLL PROGRESS
// ============================
(function initScrollProgress() {
  let progressBar = document.getElementById('global-scroll-progress');
  if (!progressBar) {
    progressBar = document.createElement('div');
    progressBar.id = 'global-scroll-progress';
    document.body.prepend(progressBar);
  }
  window.addEventListener('scroll', () => {
    const docHeight = document.documentElement.scrollHeight - document.documentElement.clientHeight;
    const progress = docHeight > 0 ? (window.scrollY / docHeight) * 100 : 0;
    progressBar.style.width = Math.min(100, Math.max(0, progress)) + '%';
  }, { passive: true });
})();

// ============================
// ADVANCED UI/UX: 2. AMBIENT CURSOR SPOTLIGHT
// ============================
(function initSpotlight() {
  let spotlight = document.querySelector('.mouse-spotlight');
  if (!spotlight && window.innerWidth > 900) {
    spotlight = document.createElement('div');
    spotlight.className = 'mouse-spotlight';
    document.body.appendChild(spotlight);
  }
  if (spotlight) {
    window.addEventListener('pointermove', (e) => {
      spotlight.style.setProperty('--mouse-x', `${e.clientX}px`);
      spotlight.style.setProperty('--mouse-y', `${e.clientY}px`);
    }, { passive: true });
  }
})();

// ============================
// ADVANCED UI/UX: 3. COPY EMAIL TO CLIPBOARD WITH TOAST
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
    toast.innerHTML = `<ion-icon name="checkmark-circle" style="color:#10b981; font-size:1.2rem;"></ion-icon><span>Email copied: <strong>${email}</strong></span>`;
    toast.classList.add('show');
    setTimeout(() => {
      toast.classList.remove('show');
    }, 3200);
  }).catch(() => {
    window.location.href = `mailto:${email}`;
  });
};

// ============================
// ADVANCED UI/UX: 4. ASYNCHRONOUS FORMSPREE SUBMISSION
// ============================
(function initAjaxContactForm() {
  const contactForm = document.querySelector('[data-form]');
  if (!contactForm) return;

  const submitBtn = contactForm.querySelector('[data-form-btn]');
  let statusBox = contactForm.querySelector('.form-status-msg');
  if (!statusBox) {
    statusBox = document.createElement('div');
    statusBox.className = 'form-status-msg';
    statusBox.setAttribute('role', 'status');
    contactForm.appendChild(statusBox);
  }

  contactForm.addEventListener('submit', function (e) {
    e.preventDefault();
    if (!contactForm.checkValidity()) return;

    const originalBtnHTML = submitBtn.innerHTML;
    submitBtn.setAttribute('disabled', 'true');
    submitBtn.innerHTML = `<span class="form-spinner"></span><span>Sending…</span>`;
    statusBox.className = 'form-status-msg';
    statusBox.style.display = 'none';

    const formData = new FormData(contactForm);

    fetch(contactForm.action, {
      method: 'POST',
      body: formData,
      headers: {
        'Accept': 'application/json'
      }
    })
    .then(response => {
      if (response.ok) {
        statusBox.className = 'form-status-msg success';
        statusBox.innerHTML = `<strong>Message sent.</strong> Thank you for writing; I will reply soon.`;
        contactForm.reset();
      } else {
        return response.json().then(data => {
          throw new Error(data && data.errors ? data.errors.map(err => err.message).join(', ') : 'Form submission failed');
        });
      }
    })
    .catch(err => {
      statusBox.className = 'form-status-msg error';
      statusBox.innerHTML = `<strong>That did not send.</strong> Please try again, or email me directly at <a href="mailto:sumanpathak.sp143@gmail.com" style="text-decoration:underline;">sumanpathak.sp143@gmail.com</a>.`;
    })
    .finally(() => {
      submitBtn.removeAttribute('disabled');
      submitBtn.innerHTML = originalBtnHTML;
      statusBox.style.display = 'block';
    });
  });
})();

// ============================
// ADVANCED UI/UX: 5. INTERACTIVE SKILL MATRIX FILTERING
// ============================
(function initSkillFiltering() {
  const skillTags = document.querySelectorAll('.skills-categories .skill-tag');
  const projectCards = document.querySelectorAll('.bento-card, .fp-card');
  if (!skillTags.length || !projectCards.length) return;

  skillTags.forEach(tag => {
    tag.classList.add('clickable');
    tag.setAttribute('title', 'Click to filter projects');

    tag.addEventListener('click', function () {
      const skillName = this.textContent.trim().toLowerCase();
      const isActive = this.classList.contains('active-filter');

      // Clear previous active filter
      skillTags.forEach(t => t.classList.remove('active-filter'));

      if (isActive) {
        // Reset all projects
        projectCards.forEach(c => {
          c.style.opacity = '1';
          c.style.transform = '';
        });
      } else {
        this.classList.add('active-filter');
        projectCards.forEach(c => {
          const cardText = c.textContent.toLowerCase();
          if (cardText.includes(skillName)) {
            c.style.opacity = '1';
            c.style.transform = 'scale(1.02)';
          } else {
            c.style.opacity = '0.35';
            c.style.transform = 'scale(0.98)';
          }
        });
      }
    });
  });
})();

// ============================
// ADVANCED UI/UX: 6. ZERO-DEPENDENCY IMAGE LIGHTBOX
// ============================
(function initLightbox() {
  const photoItems = document.querySelectorAll('.photo-item img');
  if (!photoItems.length) return;

  // Create Lightbox DOM once
  let lightbox = document.getElementById('imageLightboxModal');
  if (!lightbox) {
    lightbox = document.createElement('div');
    lightbox.id = 'imageLightboxModal';
    lightbox.className = 'lightbox-modal';
    lightbox.setAttribute('role', 'dialog');
    lightbox.setAttribute('aria-modal', 'true');
    lightbox.setAttribute('aria-label', 'Image preview');

    lightbox.innerHTML = `
      <button class="lightbox-close" aria-label="Close image">&times;</button>
      <button class="lightbox-nav lightbox-prev" aria-label="Previous image">&#10094;</button>
      <button class="lightbox-nav lightbox-next" aria-label="Next image">&#10095;</button>
      <div class="lightbox-content-wrap">
        <img class="lightbox-img" src="" alt="Enlarged view">
        <div class="lightbox-caption"></div>
      </div>
      <div class="lightbox-counter"></div>
    `;
    document.body.appendChild(lightbox);
  }

  const lightboxImg = lightbox.querySelector('.lightbox-img');
  const lightboxCaption = lightbox.querySelector('.lightbox-caption');
  const lightboxCounter = lightbox.querySelector('.lightbox-counter');
  const closeBtn = lightbox.querySelector('.lightbox-close');
  const prevBtn = lightbox.querySelector('.lightbox-prev');
  const nextBtn = lightbox.querySelector('.lightbox-next');

  let currentIndex = 0;
  const imageList = Array.from(photoItems);

  function openLightbox(index) {
    currentIndex = index;
    const target = imageList[currentIndex];
    lightboxImg.src = target.src;
    lightboxImg.alt = target.alt || 'Photography by Suman Pathak';
    lightboxCaption.textContent = target.alt || 'Photography by Suman Pathak';
    lightboxCounter.textContent = `${currentIndex + 1} / ${imageList.length}`;
    lightbox.classList.add('active');
    document.body.style.overflow = 'hidden';
  }

  function closeLightbox() {
    lightbox.classList.remove('active');
    document.body.style.overflow = '';
  }

  function showNext() {
    currentIndex = (currentIndex + 1) % imageList.length;
    openLightbox(currentIndex);
  }

  function showPrev() {
    currentIndex = (currentIndex - 1 + imageList.length) % imageList.length;
    openLightbox(currentIndex);
  }

  imageList.forEach((img, idx) => {
    img.style.cursor = 'zoom-in';
    img.closest('.photo-item').addEventListener('click', (e) => {
      e.preventDefault();
      openLightbox(idx);
    });
  });

  closeBtn.addEventListener('click', closeLightbox);
  nextBtn.addEventListener('click', (e) => { e.stopPropagation(); showNext(); });
  prevBtn.addEventListener('click', (e) => { e.stopPropagation(); showPrev(); });

  lightbox.addEventListener('click', (e) => {
    if (e.target === lightbox || e.target.classList.contains('lightbox-content-wrap')) {
      closeLightbox();
    }
  });

  window.addEventListener('keydown', (e) => {
    if (!lightbox.classList.contains('active')) return;
    if (e.key === 'Escape') closeLightbox();
    if (e.key === 'ArrowRight') showNext();
    if (e.key === 'ArrowLeft') showPrev();
  });
})();