// Mobile Menu Toggle
document.addEventListener('DOMContentLoaded', function() {
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
});
