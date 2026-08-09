document.addEventListener('DOMContentLoaded', () => {
  const contactForm = document.getElementById('contactForm');
  if (!contactForm) return;

  const submitBtn = contactForm.querySelector('button[type="submit"]');
  const originalBtnContent = submitBtn.innerHTML;
  
  // Cooldown Configuration
  const COOLDOWN_MINUTES = 3;
  const COOLDOWN_TIME = COOLDOWN_MINUTES * 60 * 1000; // Converted to milliseconds

  // Profanity Filter List (Add or remove words as needed for your site)
  const abusiveWords = [
    'idiot', 'stupid', 'fool', 'crap', 'shit', 'fuck', 'bitch', 
    'asshole', 'damn', 'bastard', 'slut', 'whore'
  ];

  /**
   * Checks if the user is in a cooldown period.
   * If yes, disables the button and starts a countdown timer.
   */
  const checkCooldown = () => {
    const lastSubmitTime = localStorage.getItem('lastFormSubmit');
    if (lastSubmitTime) {
      const timePassed = Date.now() - parseInt(lastSubmitTime, 10);
      
      if (timePassed < COOLDOWN_TIME) {
        submitBtn.disabled = true;

        // Start countdown timer interval
        const interval = setInterval(() => {
          const currentPassed = Date.now() - parseInt(lastSubmitTime, 10);
          const currentLeft = COOLDOWN_TIME - currentPassed;

          if (currentLeft <= 0) {
            clearInterval(interval);
            submitBtn.disabled = false;
            submitBtn.innerHTML = originalBtnContent;
            localStorage.removeItem('lastFormSubmit');
          } else {
            const minutesLeft = Math.floor(currentLeft / 60000);
            const secondsLeft = Math.floor((currentLeft % 60000) / 1000);
            // Show countdown on the button
            submitBtn.innerHTML = `Wait ${minutesLeft}:${secondsLeft.toString().padStart(2, '0')} <i class="fa-solid fa-clock"></i>`;
          }
        }, 1000);

        return true; // Cooldown is active
      } else {
        localStorage.removeItem('lastFormSubmit'); // Time expired, clean up
      }
    }
    return false; // No cooldown active
  };

  // Run cooldown check immediately on page load
  checkCooldown();

  contactForm.addEventListener('submit', async (e) => {
    e.preventDefault();

    // 1. Prevent form submission if cooldown is active
    if (checkCooldown()) {
      showNotification(`Please wait ${COOLDOWN_MINUTES} minutes before sending another message.`, 'warning');
      return;
    }

    const name = contactForm.name.value.trim();
    const email = contactForm.email.value.trim();
    const message = contactForm.message.value.trim();

    // 2. Empty Field Validation
    if (!name || !email || !message) {
      showNotification('Please fill every section.', 'error');
      return;
    }

// 3. Name Validation 
    // Requires at least two words (First and Last Name) separated by a space
    const nameRegex = /^[A-Za-zÀ-ÖØ-öø-ÿ'-]+\s+[A-Za-zÀ-ÖØ-öø-ÿ\s'-]+$/;
    if (!nameRegex.test(name)) {
      showNotification('Please enter your full name (first and last name).', 'error');
      return;
    }

    // 4. Email Validation
    // Standard email format checking (e.g., text@text.com)
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      showNotification('Please use a valid email address.', 'error');
      return;
    }

// Define your list of bad/custom words here
    const abusiveWords = [
      'idiot', 'stupid', 'fool', 'crap', 'shit', 'fuck', 'bitch', 
      'asshole', 'damn', 'bastard', 'slut', 'whore',
      'spam', 'scam', 'fake', 'mg', 'ass', 'muji', 'mugi', 'machakineho?', 'machakineho', 'machikne', 'radi', 'randi', 'randi ko ban', 'khate', 'boka', 'bsdk', 'bdsm', 'chik', 'bhosadi', 'bhosadiwala', 'bhosadik', 'madarchod', 'randi k chode', 'laude', 'tero bau', 'teri ma jhyakne' // <-- Add any custom words you want right here!
    ];

    // 5. Profanity / Abusive Word Filter
    const containsAbuse = abusiveWords.some(word => {
      // \b ensures we only match whole words (e.g., 'bass' won't trigger 'ass')
      const regex = new RegExp(`\\b${word}\\b`, 'gi'); 
      
      // Now checks Name, Email, AND Message fields
      return regex.test(name) || regex.test(email) || regex.test(message);
    });

    if (containsAbuse) {
      showNotification('Please remove inappropriate language from your inputs.', 'error');
      return;
    }

    if (containsAbuse) {
      showNotification('Please remove inappropriate language from your message.', 'error');
      return;
    }

    // All validations passed, proceed to send data
    submitBtn.disabled = true;
    submitBtn.innerHTML = `Sending... <i class="fa-solid fa-spinner fa-spin"></i>`;

    const formData = { name, email, message };

    try {
      const response = await fetch('/api/send', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      const result = await response.json();

      if (response.ok) {
        // Clear form fields
        contactForm.reset();
        showNotification('Your message has been sent successfully!', 'success');

        // Trigger Cooldown Lockout
        localStorage.setItem('lastFormSubmit', Date.now().toString());
        checkCooldown(); 
      } else {
        showNotification(result.error || 'Failed to send message. Please try again.', 'error');
        // Restore button if failed
        submitBtn.disabled = false;
        submitBtn.innerHTML = originalBtnContent;
      }
    } catch (err) {
      console.error('Fetch error:', err);
      showNotification('Failed to connect to the server. Please check your network.', 'error');
      // Restore button if failed
      submitBtn.disabled = false;
      submitBtn.innerHTML = originalBtnContent;
    }
  });
});

/**
 * Custom Notification Toast Function
 * @param {string} message - Text to show in notification
 * @param {'success' | 'error' | 'warning' | 'info'} type - Toast theme type
 */
function showNotification(message, type = 'info') {
  const toast = document.getElementById('customNotification');
  // Ensure your HTML has an element with id="notificationText" inside your toast div
  const toastText = document.getElementById('notificationText') || toast; 

  if (!toast) return;

  // Set notification text
  toastText.textContent = message;

  // Remove existing status classes
  toast.classList.remove('success', 'error', 'warning', 'info');
  
  // Add active type class and trigger visibility
  toast.classList.add(type, 'show');

  // Auto hide after 4 seconds
  setTimeout(() => {
    toast.classList.remove('show');
  }, 4000);
}