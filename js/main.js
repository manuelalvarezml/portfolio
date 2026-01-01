// Mobile Menu Toggle
document.addEventListener('DOMContentLoaded', function() {
  // Force video autoplay on mobile
  const heroVideo = document.querySelector('.masthead-video');
  if (heroVideo) {
    heroVideo.play().catch(function() {
      // If autoplay fails, play on first user interaction
      document.addEventListener('touchstart', function playOnTouch() {
        heroVideo.play();
        document.removeEventListener('touchstart', playOnTouch);
      }, { once: true });
    });
  }
  const menuToggle = document.querySelector('.mobile-menu-toggle');
  const mobileNav = document.querySelector('.mobile-nav');

  if (menuToggle && mobileNav) {
    menuToggle.addEventListener('click', function() {
      menuToggle.classList.toggle('active');
      mobileNav.classList.toggle('active');
      document.body.style.overflow = mobileNav.classList.contains('active') ? 'hidden' : '';
    });

    // Close menu when clicking a link
    mobileNav.querySelectorAll('a').forEach(link => {
      link.addEventListener('click', function() {
        menuToggle.classList.remove('active');
        mobileNav.classList.remove('active');
        document.body.style.overflow = '';
      });
    });
  }

  // Smooth scroll for anchor links
  document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function(e) {
      e.preventDefault();
      const target = document.querySelector(this.getAttribute('href'));
      if (target) {
        target.scrollIntoView({
          behavior: 'smooth',
          block: 'start'
        });
      }
    });
  });

  // Add scroll effect to header
  const header = document.querySelector('.site-header');
  let lastScroll = 0;

  window.addEventListener('scroll', function() {
    const currentScroll = window.pageYOffset;

    if (currentScroll > 100) {
      header.style.boxShadow = '0 2px 10px rgba(0,0,0,0.05)';
    } else {
      header.style.boxShadow = 'none';
    }

    lastScroll = currentScroll;
  });

  // Lazy loading for images (basic implementation)
  const images = document.querySelectorAll('img[data-src]');

  const imageObserver = new IntersectionObserver((entries, observer) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        const img = entry.target;
        img.src = img.dataset.src;
        img.removeAttribute('data-src');
        observer.unobserve(img);
      }
    });
  });

  images.forEach(img => imageObserver.observe(img));

  // Timeline animation for experience items
  const experienceItems = document.querySelectorAll('.experience-item');

  if (experienceItems.length > 0) {
    const experienceObserver = new IntersectionObserver((entries) => {
      entries.forEach((entry, index) => {
        if (entry.isIntersecting) {
          // Add staggered delay based on item position
          const item = entry.target;
          const delay = Array.from(experienceItems).indexOf(item) * 100;
          setTimeout(() => {
            item.classList.add('visible');
          }, delay);
          experienceObserver.unobserve(item);
        }
      });
    }, {
      threshold: 0.2,
      rootMargin: '0px 0px -50px 0px'
    });

    experienceItems.forEach(item => experienceObserver.observe(item));
  }
});
