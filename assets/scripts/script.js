let lightboxOverlay;

document.addEventListener('DOMContentLoaded', function () {
  applySystemTheme(); 
  listenForSystemThemeChanges(); 
  loadDynamicContent();
  setupTapHandlers();
});

function applySystemTheme() {
  const prefersDarkMode = window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches;
  const storedTheme = sessionStorage.getItem('theme') || (prefersDarkMode ? 'dark' : 'light');
  document.documentElement.setAttribute('data-bs-theme', storedTheme);
  applyInitialTheme(); // Update UI based on the applied theme
}

function loadDynamicContent() {
  Promise.all([
    fetch('header.html').then(response => response.text()),
    fetch('footer.html').then(response => response.text())
  ]).then(contents => {
    document.querySelector('header').innerHTML = contents[0];
    document.querySelector('footer').innerHTML = contents[1];
    reinitializeBootstrapComponents();
    setupThemeToggle();
    setupLightbox(); // Make sure this is done before applying the theme
    applyInitialTheme(); // Now safe to apply the theme
  }).catch(error => {
    console.error('Error loading dynamic content:', error);
  });
}


function setupLightbox() {
  lightboxOverlay = document.createElement('div');
  lightboxOverlay.id = 'lightboxOverlay';
  lightboxOverlay.style.position = 'fixed';
  lightboxOverlay.style.top = '0';
  lightboxOverlay.style.left = '0';
  lightboxOverlay.style.width = '100vw';
  lightboxOverlay.style.height = '100vh';
  lightboxOverlay.style.zIndex = '2000';
  document.body.appendChild(lightboxOverlay);

  const closeButton = document.createElement('button');
  closeButton.setAttribute('type', 'button');
  closeButton.className = 'btn-close';
  closeButton.setAttribute('aria-label', 'Close');
  closeButton.style.position = 'absolute';
  closeButton.style.top = '50px';
  closeButton.style.right = '50px';

  lightboxOverlay.appendChild(closeButton);

  const lightboxImages = document.querySelectorAll('.lightbox');
  lightboxImages.forEach(image => {
    image.addEventListener('click', function () {
      const lightboxImage = document.createElement('img');
      lightboxImage.src = this.src;
      lightboxImage.style.maxWidth = '80%';
      lightboxImage.style.maxHeight = '80%';
      while (lightboxOverlay.firstChild) {
        lightboxOverlay.removeChild(lightboxOverlay.firstChild);
      }
      lightboxOverlay.appendChild(lightboxImage);
      lightboxOverlay.appendChild(closeButton);
      lightboxOverlay.style.display = 'flex';
      lightboxOverlay.style.alignItems = 'center';
      lightboxOverlay.style.justifyContent = 'center';
      lightboxOverlay.style.opacity = '1';
      
      // Disable background scrolling
      document.body.style.overflow = 'hidden';
    });
  });

  closeButton.addEventListener('click', function () {
    lightboxOverlay.style.opacity = '0';
    setTimeout(() => {
      lightboxOverlay.style.display = 'none';
      // Enable background scrolling
      document.body.style.overflow = 'auto';
    }, 500);
  });

  lightboxOverlay.addEventListener('click', function (event) {
    if (event.target === lightboxOverlay) {
      lightboxOverlay.style.opacity = '0';
      setTimeout(() => {
        lightboxOverlay.style.display = 'none';
        // Enable background scrolling
        document.body.style.overflow = 'auto';
      }, 500);
    }
  });
}


function updateToggleIcon(isDark) {
  const themeToggle = document.getElementById('theme-toggle');
  if (themeToggle) {
    themeToggle.textContent = isDark ? '🌞' : '🌜';
  } else {
    console.error('Theme toggle button not found.');
  }
}

function updateLightboxTheme(isDark) {
  if (lightboxOverlay) {
    lightboxOverlay.style.backgroundColor = isDark ? 'rgba(0, 0, 0, 0.75)' : 'rgba(255, 255, 255, 0.75)';
  }
}


function setupThemeToggle() {
  const themeToggle = document.getElementById('theme-toggle');
  if (themeToggle) {
    themeToggle.addEventListener('click', function () {
      toggleTheme();
      const isDark = document.documentElement.getAttribute('data-bs-theme') === 'dark';
      updateToggleIcon(isDark); // Update icon based on the theme
      updateLightboxTheme(isDark); // Update Lightbox theme
    });
  } else {
    console.log('Theme toggle button not found. Will try again...');
    setTimeout(setupThemeToggle, 1000); // Retry after some delay
  }
}

function applyInitialTheme() {
  const storedTheme = sessionStorage.getItem('theme') || (window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light');
  const currentTheme = document.documentElement.getAttribute('data-bs-theme');
  if (storedTheme !== currentTheme) {
    document.documentElement.setAttribute('data-bs-theme', storedTheme);
  }
  const isDark = storedTheme === 'dark';
  updateToggleIconDeferred(isDark); // Ensures theme toggle icon is updated
  ensureLightboxSetup().then(() => updateLightboxTheme(isDark)); // Ensure lightbox is setup before updating theme
}

function ensureLightboxSetup() {
  return new Promise(resolve => {
    if (lightboxOverlay) {
      resolve();
    } else {
      setupLightbox(); // Setup lightbox if not already done
      resolve();
    }
  });
}


function updateToggleIconDeferred(isDark, retryDelay = 100, maxRetries = 10) {
  const themeToggle = document.getElementById('theme-toggle');
  if (themeToggle) {
    themeToggle.textContent = isDark ? '🌞' : '🌜';
  } else if (maxRetries > 0) {
    setTimeout(() => updateToggleIconDeferred(isDark, retryDelay, maxRetries - 1), retryDelay);
  } else {
    console.error('Theme toggle button not found after several retries.');
  }
}


function toggleTheme() {
  const currentTheme = document.documentElement.getAttribute('data-bs-theme');
  const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
  document.documentElement.setAttribute('data-bs-theme', newTheme);
  sessionStorage.setItem('theme', newTheme);
  const isDark = newTheme === 'dark'; // Determine if the new theme is dark
  updateToggleIcon(isDark); // Update the theme toggle button icon
  updateLightboxTheme(isDark); // Update the lightbox theme
}

function reinitializeBootstrapComponents() {
  if (typeof bootstrap !== 'undefined') {
    document.querySelectorAll('.tooltip').forEach(tooltip => bootstrap.Tooltip.getOrCreateInstance(tooltip));
    document.querySelectorAll('.popover').forEach(popover => bootstrap.Popover.getOrCreateInstance(popover));
    document.querySelectorAll('.dropdown-toggle').forEach(dropdown => bootstrap.Dropdown.getOrCreateInstance(dropdown));
  }
}

function setupTapHandlers() {
  const imageContainers = document.querySelectorAll('.img-container');
  let activeContainer = null;

  function closeOverlays() {
    document.querySelectorAll('.overlay').forEach(overlay => {
      overlay.style.opacity = '0';
    });
    activeContainer = null;
  }

  imageContainers.forEach(container => {
    container.addEventListener('touchend', function (event) {
      const overlay = this.querySelector('.overlay');
      if (activeContainer !== this) {
        event.preventDefault();
        closeOverlays();
        overlay.style.opacity = '1';
        activeContainer = this;
      } else {
        if (event.target === overlay || overlay.contains(event.target)) { // Corrected 'or' to '||'
          window.location.href = this.querySelector('a').href;
        } else {
          closeOverlays();
        }
      }
    });
  });

  document.addEventListener('touchend', function (event) {
    if (!event.target.closest('.img-container')) {
      closeOverlays();
    }
  });

  document.addEventListener('visibilitychange', function() {
    if (document.visibilityState === 'hidden') {
      closeOverlays();
    }
  });
}

// Function to animate elements sequentially when they are in view
function animateElements() {
  var delay = 0;
  $('.row').each(function (index, element) {
    if (isElementInView(element) && !$(element).hasClass('visible')) {
      // Set delay based on index to load sequentially
      $(element).css('transition-delay', delay + 's');
      $(element).addClass('visible');
      delay += 0.15; // Adjust delay time as needed
    }
  });
}

// Function to check if an element is in the viewport
function isElementInView(element) {
  var elementTop = $(element).offset().top;
  var elementBottom = elementTop + $(element).outerHeight();
  var viewportTop = $(window).scrollTop();
  var viewportBottom = viewportTop + $(window).height();
  return elementBottom > viewportTop && elementTop < viewportBottom;
}

$(document).ready(function() {
  // Trigger animations on initial load and on scroll
  $(window).on('load', (function() {
    animateElements(); // Call animateElements within a self-invoking function
  })());
  $(window).scroll(animateElements);
});



// Prevent dragging of images
document.addEventListener('mousedown', function(event) {
  if (event.target.tagName === 'IMG') {
    event.preventDefault();
  }
});

document.addEventListener('touchstart', function(event) {
  if (event.target.tagName === 'IMG') {
    event.preventDefault();
  }
});


function listenForSystemThemeChanges() {
  window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', event => {
    const newColorScheme = event.matches ? 'dark' : 'light';
    document.documentElement.setAttribute('data-bs-theme', newColorScheme);
    sessionStorage.setItem('theme', newColorScheme); // Update sessionStorage with new preference
    applyInitialTheme();
  });
}

