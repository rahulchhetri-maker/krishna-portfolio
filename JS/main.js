const themeToggleBtn = document.querySelector('.theme-toggle');
const themeToggleIcon = themeToggleBtn.querySelector('.theme-toggle-icon i');
const themeToggleText = themeToggleBtn.querySelector('.theme-toggle-text');

function applyTheme(theme) {
  document.documentElement.setAttribute('data-theme', theme);
  localStorage.setItem('theme', theme);

  // Grab the Kick logo element
  const kickLogo = document.getElementById('kick-logo');

  if (theme === 'dark') {
    themeToggleBtn.setAttribute('aria-pressed', 'false');
    themeToggleIcon.className = 'fa-solid fa-moon';
    themeToggleText.textContent = 'Dark';

    // Show Light Logo in Dark Mode
    if (kickLogo) kickLogo.src = 'assets/Kick_Logo_Light.png';
  } else {
    themeToggleBtn.setAttribute('aria-pressed', 'true');
    themeToggleIcon.className = 'fa-solid fa-sun';
    themeToggleText.textContent = 'Light';

    // Show Dark Logo in Light Mode
    if (kickLogo) kickLogo.src = 'assets/Kick_Logo_Dark.png';
  }
}

themeToggleBtn.addEventListener('click', () => {
  const currentTheme = document.documentElement.getAttribute('data-theme') || 'light';
  const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
  applyTheme(newTheme);
});

const savedTheme = localStorage.getItem('theme') || 
  (window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light');

applyTheme(savedTheme);

document.addEventListener('DOMContentLoaded', () => {
  const sections = document.querySelectorAll('section[id]');
  const navLinks = document.querySelectorAll('.nav-links a');

  const observerOptions = {
    root: null, 
    rootMargin: '-25% 0px -55% 0px', 
    threshold: 0
  };

  const observer = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        const currentId = entry.target.getAttribute('id');

        // Remove active class from all navigation links
        navLinks.forEach((link) => link.classList.remove('active'));

        // Find and highlight matching links in both desktop and mobile menus
        const matchingLinks = document.querySelectorAll(`.nav-links a[href="#${currentId}"]`);
        matchingLinks.forEach((link) => link.classList.add('active'));
      }
    });
  }, observerOptions);

  sections.forEach((section) => observer.observe(section));
});

const socialModal = document.getElementById('socialModal');
const modalTitle = document.getElementById('modalTitle');
const modalCloseBtn = document.querySelector('.modal-close-btn');
const socialBtns = document.querySelectorAll('.social-btn');
const channelGroups = document.querySelectorAll('.modal-channel-group');

const platformTitles = {
  youtube: 'Select YouTube Channel',
  instagram: 'Select Instagram Account',
  tiktok: 'Select TikTok Account'
};

let isModalOpen = false;

socialBtns.forEach((btn) => {
  btn.addEventListener('click', () => {
    const platform = btn.getAttribute('data-modal');
    if (modalTitle) modalTitle.textContent = platformTitles[platform] || 'Select Option';

    channelGroups.forEach((group) => {
      if (group.id === `${platform}Channels`) {
        group.classList.add('active');
      } else {
        group.classList.remove('active');
      }
    });

    if (socialModal) {
      socialModal.classList.add('active');
      socialModal.setAttribute('aria-hidden', 'false');
      // Push state to browser history
      history.pushState({ type: 'modal' }, '', '#social');
      isModalOpen = true;
    }
  });
});

function closeSocialModal(fromHistory = false) {
  if (socialModal && socialModal.classList.contains('active')) {
    socialModal.classList.remove('active');
    socialModal.setAttribute('aria-hidden', 'true');
    // Go back in history only if closed by a tap, not by the back button itself
    if (!fromHistory && isModalOpen) {
      history.back();
    }
    isModalOpen = false;
  }
}

// Ensure overlay tap triggers close logic
if (socialModal) {
  socialModal.addEventListener('click', (e) => {
    // Also check if they clicked the new tap hint text
    if (e.target === socialModal || e.target.classList.contains('modal-tap-hint')) {
      closeSocialModal(false); 
    }
  });
}

// Global Back Button Listener for Menu & Modal
window.addEventListener('popstate', () => {
  if (isModalOpen) {
    closeSocialModal(true); // pass true to skip triggering history.back() again
  }
  if (siteMenu && siteMenu.hasAttribute('open')) {
    siteMenu.removeAttribute('open');
    isMenuOpen = false;
  }
});
const siteMenu = document.querySelector('.site-menu');
let isMenuOpen = false;

if (siteMenu) {
  // Hook into the summary click to manage browser history
  siteMenu.querySelector('summary').addEventListener('click', () => {
    if (!siteMenu.hasAttribute('open')) {
      history.pushState({ type: 'menu' }, '', '#menu');
      isMenuOpen = true;
    } else if (isMenuOpen) {
      history.back(); // Reverts history if closed manually
      isMenuOpen = false;
    }
  });

  // Close menu if user taps outside of it
  document.addEventListener('click', (e) => {
    if (siteMenu.hasAttribute('open') && !siteMenu.contains(e.target)) {
      siteMenu.removeAttribute('open');
      if (isMenuOpen) {
        history.back();
        isMenuOpen = false;
      }
    }
  });
}

document.addEventListener('DOMContentLoaded', () => {
  const revealElements = document.querySelectorAll('.reveal');
  if (!revealElements.length) return;

  // Feature check: if this browser somehow lacks IntersectionObserver
  // despite reaching this point, just show everything instead of
  // leaving it invisible.
  if (!('IntersectionObserver' in window)) {
    revealElements.forEach(el => el.classList.add('is-visible'));
    return;
  }

  const revealObserver = new IntersectionObserver((entries, observer) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('is-visible');
        observer.unobserve(entry.target); // Stop observing once it has faded in
      }
    });
  }, {
    root: null,
    rootMargin: '0px 0px -40px 0px', // Triggers slightly before it fully enters viewport
    threshold: 0
  });

  revealElements.forEach(el => revealObserver.observe(el));

  // Safety net: if anything unexpected stops an element from ever
  // intersecting (odd layout edge case, tab backgrounded on load, etc.),
  // force it visible after 3s so it's never permanently stuck hidden.
  setTimeout(() => {
    revealElements.forEach(el => el.classList.add('is-visible'));
  }, 3000);
});

document.addEventListener("DOMContentLoaded", () => {
  const scrollBtn = document.getElementById("scrollToTopBtn");
  const aboutSection = document.getElementById("about"); 

  window.addEventListener("scroll", () => {
    // Check if the 'about' section exists, otherwise default to showing after 500px of scrolling
    const triggerPoint = aboutSection ? aboutSection.offsetTop : 500;

    // Show button when scrolled to the about section (with a 100px buffer)
    if (window.scrollY > triggerPoint - 100) { 
      scrollBtn.classList.add("show");
    } else {
      scrollBtn.classList.remove("show");
    }
  });

  // Smooth scroll to top when clicked
  scrollBtn.addEventListener("click", () => {
    window.scrollTo({
      top: 0,
      behavior: "smooth"
    });
  });
});