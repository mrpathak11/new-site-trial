'use strict';

// Navigation Active State on Scroll
const sections = document.querySelectorAll('section');
const navLinks = document.querySelectorAll('.nav-link');

window.addEventListener('scroll', () => {
  let current = '';
  sections.forEach(section => {
    const sectionTop = section.offsetTop;
    const sectionHeight = section.clientHeight;
    if (pageYOffset >= (sectionTop - sectionHeight / 3)) {
      current = section.getAttribute('id');
    }
  });

  navLinks.forEach(li => {
    li.classList.remove('active');
    if (li.getAttribute('href').includes(current)) {
      li.classList.add('active');
    }
  });
});

// Portfolio Filtering
const filterBtns = document.querySelectorAll('.filter-btn');
const projectCards = document.querySelectorAll('.project-card');

filterBtns.forEach(btn => {
  btn.addEventListener('click', () => {
    // Remove active class from all buttons
    filterBtns.forEach(b => b.classList.remove('active'));
    // Add active class to clicked button
    btn.classList.add('active');

    const filterValue = btn.getAttribute('data-filter');

    // Reset Show More button for portfolio when filtering
    const portfolioBtn = document.querySelector('[data-show-more-btn="portfolio"]');
    const portfolioContainer = document.querySelector('[data-show-more-container="portfolio"]');

    if (portfolioBtn && portfolioContainer) {
      const allItems = portfolioContainer.querySelectorAll('.project-card');

      if (filterValue === 'all') {
        portfolioBtn.style.display = 'block';
        portfolioBtn.textContent = 'Show More';
        portfolioBtn.setAttribute('data-expanded', 'false');
        // Re-hide items beyond 3
        let count = 0;
        allItems.forEach(item => {
          item.style.display = 'block'; // Ensure they are visible for layout
          if (count >= 3) item.classList.add('hidden-item');
          else item.classList.remove('hidden-item');

          // Reset animations
          item.style.opacity = '1';
          item.style.transform = 'scale(1)';

          count++;
        });
      } else {
        portfolioBtn.style.display = 'none';
        // Show all items in this category
        allItems.forEach(item => {
          if (item.dataset.category === filterValue) {
            item.classList.remove('hidden-item');
            item.style.display = 'block';
            setTimeout(() => {
              item.style.opacity = '1';
              item.style.transform = 'scale(1)';
            }, 200);
          } else {
            item.classList.add('hidden-item');
            item.style.opacity = '0';
            item.style.transform = 'scale(0.8)';
            setTimeout(() => {
              item.style.display = 'none';
            }, 300);
          }
        });
      }
    } else {
      // Fallback if no show more logic (shouldn't happen based on new HTML)
      projectCards.forEach(card => {
        if (filterValue === 'all' || card.getAttribute('data-category') === filterValue) {
          card.style.display = 'block';
          setTimeout(() => {
            card.style.opacity = '1';
            card.style.transform = 'scale(1)';
          }, 200);
        } else {
          card.style.opacity = '0';
          card.style.transform = 'scale(0.8)';
          setTimeout(() => {
            card.style.display = 'none';
          }, 300);
        }
      });
    }
  });
});

// Show More Functionality
const showMoreContainers = document.querySelectorAll('[data-show-more-container]');

showMoreContainers.forEach(container => {
  const category = container.dataset.showMoreContainer;
  const btn = document.querySelector(`[data-show-more-btn="${category}"]`);
  const items = container.children; // This might need to be more specific if there are other elements
  const initialShow = 3;

  // Helper to get actual item elements (exclude non-card elements if any)
  const itemElements = Array.from(items).filter(el => el.classList.contains('project-card') || el.classList.contains('blog-card'));

  if (itemElements.length <= initialShow) {
    if (btn) btn.style.display = 'none';
    return;
  }

  // Hide items beyond the initial count
  for (let i = initialShow; i < itemElements.length; i++) {
    itemElements[i].classList.add('hidden-item');
  }

  if (btn) {
    btn.addEventListener('click', function () {
      const isExpanded = this.getAttribute('data-expanded') === 'true';

      if (isExpanded) {
        // Collapse
        for (let i = initialShow; i < itemElements.length; i++) {
          itemElements[i].classList.add('hidden-item');
        }
        this.textContent = 'Show More';
        this.setAttribute('data-expanded', 'false');

        // Scroll back to top of container
        container.scrollIntoView({ behavior: 'smooth' });
      } else {
        // Expand
        for (let i = initialShow; i < itemElements.length; i++) {
          itemElements[i].classList.remove('hidden-item');
        }
        this.textContent = 'Show Less';
        this.setAttribute('data-expanded', 'true');
      }
    });
  }
});

// Contact Form Validation
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