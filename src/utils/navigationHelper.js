/**
 * Navigation helper functions
 */

// Close navigation when clicking outside
export const setupNavigationCloser = () => {
  document.addEventListener('click', (event) => {
    const navContainer = document.querySelector('.nav-container');
    const mobileToggle = document.querySelector('.mobile-nav-toggle');
    
    if (navContainer && 
        navContainer.classList.contains('mobile-open') && 
        !navContainer.contains(event.target) && 
        !mobileToggle.contains(event.target)) {
      
      // Find the component method to close the navigation
      const dashboardComponent = document.querySelector('.dashboard')?.__reactProps$;
      if (dashboardComponent && dashboardComponent.toggleMobileNav) {
        dashboardComponent.toggleMobileNav();
      } else {
        // Fallback if we can't access the component method
        navContainer.classList.remove('mobile-open');
      }
    }
  });
};

// Enable smooth scrolling to sections
export const initSmoothScrolling = () => {
  document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
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
};