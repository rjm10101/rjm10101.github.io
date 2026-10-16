(function () {
  'use strict';

  var finePointer = window.matchMedia('(hover: hover) and (pointer: fine)');

  /* Honolulu local time ---------------------------------------------------- */

  var clocks = document.querySelectorAll('[data-hnl-time]');
  if (clocks.length && window.Intl) {
    var fmt = new Intl.DateTimeFormat('en-US', { timeZone: 'Pacific/Honolulu', hour: 'numeric', minute: '2-digit' });
    var tick = function () {
      var t = fmt.format(new Date());
      clocks.forEach(function (el) { el.textContent = t; });
    };
    tick();
    setInterval(tick, 15000);
  }

  /* Work dropdown ---------------------------------------------------------- */

  var work = document.querySelector('[data-nav-work]');
  if (work) {
    var toggle = work.querySelector('.nav-work-toggle');
    var setOpen = function (open) {
      work.classList.toggle('is-open', open);
      toggle.setAttribute('aria-expanded', open ? 'true' : 'false');
    };
    toggle.addEventListener('click', function () { setOpen(!work.classList.contains('is-open')); });
    document.addEventListener('click', function (event) { if (!work.contains(event.target)) setOpen(false); });
    document.addEventListener('keydown', function (event) {
      if (event.key === 'Escape' && work.classList.contains('is-open')) { setOpen(false); toggle.focus(); }
    });
  }

  /* Header joins the dark hero while it's underneath ----------------------- */

  var header = document.querySelector('.site-header');
  var hero = document.querySelector('.has-dark-hero .hero');
  if (header && hero) {
    var updateHeader = function () {
      var bottom = hero.getBoundingClientRect().bottom;
      header.classList.toggle('on-dark', bottom > header.offsetHeight);
    };
    window.addEventListener('scroll', updateHeader, { passive: true });
    window.addEventListener('resize', updateHeader);
    updateHeader();
  }

  /* Reveal on scroll ------------------------------------------------------- */

  var reveals = document.querySelectorAll('.reveal, .reveal-img');
  if ('IntersectionObserver' in window) {
    var observer = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          entry.target.classList.add('is-visible');
          observer.unobserve(entry.target);
        }
      });
    }, { rootMargin: '0px 0px -10% 0px' });
    reveals.forEach(function (el) { observer.observe(el); });
  } else {
    reveals.forEach(function (el) { el.classList.add('is-visible'); });
  }

  /* Lightbox --------------------------------------------------------------- */

  var dialog = document.querySelector('dialog.lightbox');
  if (dialog && typeof dialog.showModal === 'function') {
    var big = dialog.querySelector('img');
    var caption = dialog.querySelector('figcaption');

    document.addEventListener('click', function (event) {
      var img = event.target.closest('img[data-zoom]');
      if (!img) return;
      // Always show the full-size file, not the smaller srcset candidate.
      big.src = img.getAttribute('data-full') || img.getAttribute('src');
      big.alt = img.alt;
      caption.textContent = img.getAttribute('data-caption') || '';
      hideCursor();
      dialog.showModal();
    });

    // Any click inside the open lightbox closes it.
    dialog.addEventListener('click', function () { dialog.close(); });
    dialog.addEventListener('close', function () { big.removeAttribute('src'); });
  }

  /* Two-sided pieces flip between their sides (front/back by default) ----- */

  document.querySelectorAll('.case-flip').forEach(function (fig) {
    var button = fig.querySelector('.case-flip-toggle');
    var text = button.querySelector('.case-flip-text');
    var side = fig.querySelector('.case-side');
    var front = fig.querySelector('.case-front');
    var back = fig.querySelector('.case-back');
    back.setAttribute('aria-hidden', 'true');
    button.addEventListener('click', function () {
      var flipped = fig.classList.toggle('is-flipped');
      button.setAttribute('aria-pressed', String(flipped));
      var shown = flipped ? fig.dataset.back : fig.dataset.front;
      var other = flipped ? fig.dataset.front : fig.dataset.back;
      text.textContent = 'See the ' + other.toLowerCase();
      side.textContent = '· ' + shown;
      front.setAttribute('aria-hidden', String(flipped));
      back.setAttribute('aria-hidden', String(!flipped));
    });
  });

  /* Replay the live HTML5 ads ------------------------------------------- */

  document.querySelectorAll('.case-motion-replay').forEach(function (button) {
    button.addEventListener('click', function () {
      button.closest('.case-motion').querySelectorAll('iframe').forEach(function (frame) {
        frame.src = frame.src;
      });
    });
  });

  /* Cursor label over work (mouse and trackpad only) ------------------------ */

  var label = document.querySelector('.cursor-label');
  var reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  function hideCursor() { if (label) label.classList.remove('is-active'); }

  if (label && finePointer.matches && !reduceMotion) {
    var x = 0, y = 0, cx = 0, cy = 0, running = false;
    var loop = function () {
      cx += (x - cx) * 0.2;
      cy += (y - cy) * 0.2;
      label.style.left = cx + 'px';
      label.style.top = cy + 'px';
      if (Math.abs(x - cx) > 0.1 || Math.abs(y - cy) > 0.1) requestAnimationFrame(loop);
      else running = false;
    };
    document.addEventListener('mousemove', function (event) {
      x = event.clientX;
      y = event.clientY;
      var target = event.target.closest('[data-cursor]');
      if (target) {
        if (!label.classList.contains('is-active')) { cx = x; cy = y; }
        label.textContent = target.getAttribute('data-cursor');
        label.classList.add('is-active');
      } else {
        hideCursor();
      }
      if (!running) { running = true; requestAnimationFrame(loop); }
    }, { passive: true });
    document.addEventListener('mouseleave', hideCursor);
  }

  /* Discourage casual saving of portfolio images ---------------------------- */

  document.addEventListener('contextmenu', function (event) {
    if (event.target.tagName === 'IMG') event.preventDefault();
  });
  document.addEventListener('dragstart', function (event) {
    if (event.target.tagName === 'IMG') event.preventDefault();
  });
})();
