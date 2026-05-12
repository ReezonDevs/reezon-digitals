/* ============================================================
   REEZON DIGITALS — script.js
============================================================ */

'use strict';

const navbar    = document.getElementById('navbar');
const hamburger = document.getElementById('hamburger');
const navLinks  = document.getElementById('navLinks');
const allLinks  = navLinks.querySelectorAll('.nav-link');
const sections  = document.querySelectorAll('section[id]');
const logoImg   = document.querySelector('.logo-img');
const logoFallback = document.querySelector('.logo-fallback');

/* ── 1. Navbar shadow on scroll ── */
function onScroll() {
  navbar.classList.toggle('scrolled', window.scrollY > 10);
  updateActiveLink();
}
window.addEventListener('scroll', onScroll, { passive: true });

/* ── 2. Hamburger toggle ── */
hamburger.addEventListener('click', () => {
  const isOpen = hamburger.classList.toggle('open');
  navLinks.classList.toggle('open', isOpen);
  hamburger.setAttribute('aria-expanded', String(isOpen));
  document.body.style.overflow = isOpen ? 'hidden' : '';
});

/* ── 3. Close menu on link click ── */
allLinks.forEach(link => link.addEventListener('click', () => {
  hamburger.classList.remove('open');
  navLinks.classList.remove('open');
  hamburger.setAttribute('aria-expanded', 'false');
  document.body.style.overflow = '';
}));

/* ── 4. Scroll-spy ── */
function updateActiveLink() {}
const observer = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (!entry.isIntersecting) return;
    allLinks.forEach(a => a.classList.remove('active'));
    const match = document.querySelector(`.nav-link[href="#${entry.target.id}"]`);
    if (match) match.classList.add('active');
  });
}, { rootMargin: '-40% 0px -55% 0px' });
sections.forEach(sec => observer.observe(sec));

/* ── 5. Logo fallback ── */
if (logoImg && logoFallback) {
  if (logoImg.complete && logoImg.naturalWidth > 0) {
    logoFallback.style.display = 'none';
  } else {
    logoImg.addEventListener('load',  () => { logoFallback.style.display = 'none'; });
    logoImg.addEventListener('error', () => { logoImg.style.display = 'none'; });
  }
}

onScroll();

/* ── 6. Hero canvas — animated dot grid ── */
(function () {
  var canvas = document.getElementById('heroCanvas');
  if (!canvas) return;
  var ctx = canvas.getContext('2d');
  var SPACING = 30, DOT_R = 1.4, GLOW_R = 120;
  var W, H, cols, rows, mouseX = -999, mouseY = -999;

  function resize() {
    W = canvas.offsetWidth;
    H = canvas.offsetHeight;
    canvas.width  = W;
    canvas.height = H;
    cols = Math.ceil(W / SPACING) + 1;
    rows = Math.ceil(H / SPACING) + 1;
  }
  window.addEventListener('resize', resize);
  resize();

  document.addEventListener('mousemove', function (e) {
    var r = canvas.getBoundingClientRect();
    mouseX = e.clientX - r.left;
    mouseY = e.clientY - r.top;
  });

  function draw() {
    ctx.clearRect(0, 0, W, H);
    for (var r = 0; r < rows; r++) {
      for (var c = 0; c < cols; c++) {
        var x  = c * SPACING;
        var y  = r * SPACING;
        var dx = x - mouseX, dy = y - mouseY;
        var d  = Math.sqrt(dx * dx + dy * dy);
        var t  = Math.max(0, 1 - d / GLOW_R);
        var gr = Math.round(210 + (15  - 210) * t);
        var gg = Math.round(210 + (117 - 210) * t);
        var gb = Math.round(210 + (188 - 210) * t);
        ctx.beginPath();
        ctx.arc(x, y, DOT_R + t * 1.2, 0, Math.PI * 2);
        ctx.fillStyle = 'rgba(' + gr + ',' + gg + ',' + gb + ',' + (0.35 + t * 0.65) + ')';
        ctx.fill();
      }
    }
    requestAnimationFrame(draw);
  }
  draw();
})();

/* ── 7. Typewriter — "to Fruition." ── */
window.addEventListener('load', function () {
  var el     = document.getElementById('typeTarget');
  var cursor = document.querySelector('.type-cursor');
  if (!el) return;

  var words = 'to Fruition.';
  var i     = 0;

  el.textContent = '';

  setTimeout(function () {
    var t = setInterval(function () {
      el.textContent = words.substring(0, i + 1);
      i = i + 1;
      if (i >= words.length) {
        clearInterval(t);
        setTimeout(function () {
          if (cursor) cursor.style.display = 'none';
        }, 1500);
      }
    }, 90);
  }, 1200);
});


/* ============================================================
   SERVICES — Scroll-triggered staggered animation
   Each .service-item starts invisible (opacity:0, translateY).
   IntersectionObserver adds .visible when it enters the viewport,
   with a delay that increases per item (0ms, 100ms, 200ms …)
   creating a cascading reveal effect.
============================================================ */
(function initServices() {
  var items = document.querySelectorAll('.service-item');
  if (!items.length) return;

  var serviceObserver = new IntersectionObserver(function (entries) {
    entries.forEach(function (entry) {
      if (!entry.isIntersecting) return;

      var el    = entry.target;
      var index = parseInt(el.getAttribute('data-index'), 10) || 0;

      /* Stagger: each item waits 100ms more than the previous */
      setTimeout(function () {
        el.classList.add('visible');
      }, index * 110);

      /* Stop watching once it's been revealed */
      serviceObserver.unobserve(el);
    });
  }, {
    threshold: 0.15       /* Trigger when 15% of the item is visible */
  });

  items.forEach(function (item) {
    serviceObserver.observe(item);
  });
})();


/* ============================================================
   ABOUT — Scroll-triggered reveal
   Both .about-left and .about-right start hidden.
   IntersectionObserver adds .visible when they enter viewport.
   CSS handles the transition; right col has a 0.15s delay.
============================================================ */
(function initAbout() {
  var revealEls = document.querySelectorAll('.about-reveal');
  if (!revealEls.length) return;

  var aboutObserver = new IntersectionObserver(function (entries) {
    entries.forEach(function (entry) {
      if (!entry.isIntersecting) return;
      entry.target.classList.add('visible');
      aboutObserver.unobserve(entry.target);  /* Only animate once */
    });
  }, { threshold: 0.15 });

  revealEls.forEach(function (el) { aboutObserver.observe(el); });
})();


/* ============================================================
   TESTIMONIALS — interactive switcher + auto-rotate
   Clicking an avatar or dot switches to that review.
   Auto-rotates every 5 seconds; pauses on hover.
============================================================ */
(function initTestimonials() {
  var avatarBtns  = document.querySelectorAll('.avatar-btn');
  var quotes      = document.querySelectorAll('.testi-quote');
  var dots        = document.querySelectorAll('.testi-dot');
  var wrap        = document.querySelector('.testi-quote-wrap');
  if (!avatarBtns.length) return;

  var current  = 0;
  var total    = quotes.length;
  var timer    = null;

  /* Switch to a given index */
  function goTo(index) {
    /* Deactivate all */
    avatarBtns.forEach(function(b) { b.classList.remove('active'); });
    quotes.forEach(function(q)     { q.classList.remove('active'); });
    dots.forEach(function(d)       { d.classList.remove('active'); });

    /* Activate target */
    avatarBtns[index].classList.add('active');
    quotes[index].classList.add('active');
    dots[index].classList.add('active');

    current = index;
  }

  /* Avatar button clicks */
  avatarBtns.forEach(function(btn) {
    btn.addEventListener('click', function() {
      goTo(parseInt(btn.getAttribute('data-index'), 10));
      resetTimer();
    });
  });

  /* Dot clicks */
  dots.forEach(function(dot) {
    dot.addEventListener('click', function() {
      goTo(parseInt(dot.getAttribute('data-index'), 10));
      resetTimer();
    });
  });

  /* Auto-rotate every 5 seconds */
  function startTimer() {
    timer = setInterval(function() {
      goTo((current + 1) % total);
    }, 5000);
  }

  function resetTimer() {
    clearInterval(timer);
    startTimer();
  }

  /* Pause on hover so user can read without interruption */
  if (wrap) {
    wrap.addEventListener('mouseenter', function() { clearInterval(timer); });
    wrap.addEventListener('mouseleave', startTimer);
  }

  startTimer();

  /* Scroll reveal for the header */
  var testiReveal = document.querySelectorAll('.testi-reveal');
  if (testiReveal.length) {
    var tr = new IntersectionObserver(function(entries) {
      entries.forEach(function(e) {
        if (e.isIntersecting) {
          e.target.classList.add('visible');
          tr.unobserve(e.target);
        }
      });
    }, { threshold: 0.2 });
    testiReveal.forEach(function(el) { tr.observe(el); });
  }
})();


/* ============================================================
   SCROLL-TO-TOP BUTTON
   Shows after 400px scroll. Clicking smoothly returns to top.
============================================================ */
(function initScrollTop() {
  var btn = document.getElementById('scrollTop');
  if (!btn) return;

  /* Show/hide based on scroll position */
  window.addEventListener('scroll', function () {
    btn.classList.toggle('visible', window.scrollY > 400);
  }, { passive: true });

  /* Smooth scroll to top on click */
  btn.addEventListener('click', function () {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  });
})();


/* ============================================================
   GLOBAL SCROLL REVEAL
   Watches every element with class .reveal and adds .visible
   when it enters the viewport — works for any future sections.
============================================================ */
(function initGlobalReveal() {
  var revealEls = document.querySelectorAll('.reveal');
  if (!revealEls.length) return;

  var ro = new IntersectionObserver(function (entries) {
    entries.forEach(function (entry) {
      if (!entry.isIntersecting) return;
      entry.target.classList.add('visible');
      ro.unobserve(entry.target);
    });
  }, { threshold: 0.12 });

  revealEls.forEach(function (el) { ro.observe(el); });
})();


/* ============================================================
   MODAL SYSTEM — Privacy Policy & Terms of Service
   Opens on button click, closes on X / backdrop / Escape key.
   Traps focus inside the modal for accessibility.
============================================================ */
(function initModals() {

  /* Generic open/close for any modal */
  function openModal(modalId) {
    var modal = document.getElementById(modalId);
    if (!modal) return;
    modal.classList.add('open');
    document.body.style.overflow = 'hidden';   /* Lock scroll behind modal */
    /* Focus the close button for keyboard users */
    var closeBtn = modal.querySelector('.modal-close');
    if (closeBtn) setTimeout(function() { closeBtn.focus(); }, 50);
  }

  function closeModal(modalId) {
    var modal = document.getElementById(modalId);
    if (!modal) return;
    modal.classList.remove('open');
    document.body.style.overflow = '';
  }

  function closeAllModals() {
    document.querySelectorAll('.modal-backdrop.open').forEach(function(m) {
      m.classList.remove('open');
    });
    document.body.style.overflow = '';
  }

  /* Open triggers */
  var openPrivacy = document.getElementById('openPrivacy');
  var openTerms   = document.getElementById('openTerms');
  if (openPrivacy) openPrivacy.addEventListener('click', function() { openModal('privacyModal'); });
  if (openTerms)   openTerms.addEventListener('click',   function() { openModal('termsModal'); });

  /* Close triggers — X buttons */
  var closePrivacy = document.getElementById('closePrivacy');
  var closeTerms   = document.getElementById('closeTerms');
  if (closePrivacy) closePrivacy.addEventListener('click', function() { closeModal('privacyModal'); });
  if (closeTerms)   closeTerms.addEventListener('click',   function() { closeModal('termsModal'); });

  /* Close on backdrop click (clicking outside the white box) */
  document.querySelectorAll('.modal-backdrop').forEach(function(backdrop) {
    backdrop.addEventListener('click', function(e) {
      /* Only close if the click was on the backdrop itself, not the modal box */
      if (e.target === backdrop) closeAllModals();
    });
  });

  /* Close on Escape key */
  document.addEventListener('keydown', function(e) {
    if (e.key === 'Escape') closeAllModals();
  });

})();


/* ============================================================
   COOKIE CONSENT BANNER
   - Shows on first visit if no consent stored
   - Accept: saves "accepted" to localStorage, hides banner
   - Decline: saves "declined" to localStorage, hides banner
   - "Learn more" opens the Privacy Policy modal
   - Banner never shows again once a choice is made
============================================================ */
(function initCookieBanner() {
  var banner        = document.getElementById('cookieBanner');
  var acceptBtn     = document.getElementById('cookieAccept');
  var declineBtn    = document.getElementById('cookieDecline');
  var learnMoreBtn  = document.getElementById('cookiePolicyBtn');
  var STORAGE_KEY   = 'reezon_cookie_consent';

  if (!banner) return;

  /* Check if user has already made a choice */
  function hasConsent() {
    try { return !!localStorage.getItem(STORAGE_KEY); } catch(e) { return false; }
  }

  function saveConsent(value) {
    try { localStorage.setItem(STORAGE_KEY, value); } catch(e) {}
  }

  function hideBanner() {
    banner.classList.remove('visible');
  }

  /* Show banner after short delay if no prior choice */
  if (!hasConsent()) {
    setTimeout(function() {
      banner.classList.add('visible');
    }, 2000);   /* 2s delay so it doesn't clash with page load animations */
  }

  /* Accept */
  if (acceptBtn) {
    acceptBtn.addEventListener('click', function() {
      saveConsent('accepted');
      hideBanner();
    });
  }

  /* Decline */
  if (declineBtn) {
    declineBtn.addEventListener('click', function() {
      saveConsent('declined');
      hideBanner();
    });
  }

  /* "Learn more" → open Privacy Policy modal */
  if (learnMoreBtn) {
    learnMoreBtn.addEventListener('click', function() {
      hideBanner();   /* Hide banner first to avoid z-index overlap */
      var openPrivacy = document.getElementById('openPrivacy');
      if (openPrivacy) openPrivacy.click();
    });
  }

})();
