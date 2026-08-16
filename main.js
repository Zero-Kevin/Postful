/* ================================================================
   POSTFUL — main.js
   ================================================================
   1. NAV      : sticky scroll-shadow
   2. HERO     : GSAP letter-stagger entrance + graphic reveal (on load)
   3. SCROLL   : GSAP ScrollTrigger scrub — reveals, orb parallax,
                 and the SVG line-draw
   4. HERO GFX : premium SVG cloche — ambient loops + multi-layer
                 scroll parallax (lighter on mobile, off for reduced motion)
   5. FORM     : validation + Formspree submission + honeypot
   ----------------------------------------------------------------
   Every motion respects prefers-reduced-motion. Libraries are loaded
   from local vendor/ copies (see index.html) so everything also works
   when the page is opened directly from disk (file://).
   ================================================================ */

/* ---------- Capability flags (computed once) ---------- */
var REDUCED  = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
var HAS_GSAP = typeof gsap !== 'undefined';
var HAS_ST   = HAS_GSAP && typeof ScrollTrigger !== 'undefined';
var IS_MOBILE = window.matchMedia('(max-width: 767px)').matches;

if (HAS_ST) { gsap.registerPlugin(ScrollTrigger); }


/* ================================================================
   1. NAV SCROLL SHADOW
   Adds a shadow under the nav once the user scrolls past the hero.
   ================================================================ */
(function () {
  var header = document.querySelector('.site-header');
  if (!header) return;
  window.addEventListener('scroll', function () {
    header.classList.toggle('is-scrolled', window.scrollY > 60);
  }, { passive: true });
})();


/* ================================================================
   2. HERO ENTRANCE — GSAP letter stagger (runs once on page load)
   Skipped entirely under reduced motion (letters simply appear).
   ================================================================ */
(function () {
  if (!HAS_GSAP || REDUCED) return;

  var tl = gsap.timeline({ defaults: { ease: 'power3.out' } });
  tl.from('.wm-letter', {
      opacity: 0, y: 36, scale: 0.7,
      duration: 0.52, stagger: 0.055,
      ease: 'back.out(1.8)', delay: 0.2
    })
    /* The graphic scales + fades in alongside the wordmark (concurrent, pos 0.2) */
    .from('.hero__stage', { opacity: 0, scale: 0.9, y: 24, duration: 0.9, ease: 'power3.out' }, 0.2)
    .from('.hero__badge',    { opacity: 0, y: 16, duration: 0.45 }, '-=0.15')
    .from('.hero__headline', { opacity: 0, y: 32, duration: 0.65 }, '-=0.25')
    .from('.hero__sub',      { opacity: 0, y: 22, duration: 0.55 }, '-=0.30')
    .from('.hero__ctas',     { opacity: 0, y: 18, duration: 0.50 }, '-=0.30');
})();


/* ================================================================
   3. SCROLL-SCRUBBED ANIMATIONS (GSAP ScrollTrigger, scrub:true)
   Everything here is tied directly to scroll position: it plays
   forward as you scroll down and reverses as you scroll up.
   ================================================================ */

/* Fallback used when we can't (or shouldn't) animate: make sure every
   .reveal element is visible so nothing is ever stuck hidden. */
function showAllReveals() {
  var els = document.querySelectorAll('.reveal');
  for (var i = 0; i < els.length; i++) {
    els[i].style.opacity = '1';
    els[i].style.transform = 'none';
  }
}

(function () {
  /* No motion, or ScrollTrigger unavailable → just show the content. */
  if (REDUCED || !HAS_ST) { showAllReveals(); return; }

  /* -- 3a. Section / card reveals --
     Scrubbed across a short band so they animate in as they enter, reverse
     if you scroll back up through the band, then stay settled while in view. */
  var reveals = document.querySelectorAll('.reveal');
  reveals.forEach(function (el) {
    var from = { opacity: 0, y: 40 };                                   /* default: rise up   */
    if (el.classList.contains('reveal--left'))  from = { opacity: 0, x: -48 };  /* slide from left  */
    if (el.classList.contains('reveal--right')) from = { opacity: 0, x: 48 };   /* slide from right */
    if (el.classList.contains('reveal--scale')) from = { opacity: 0, y: 30, scale: 0.92 }; /* rise + scale */

    gsap.fromTo(el, from, {
      opacity: 1, x: 0, y: 0, scale: 1,
      ease: 'power2.out',
      scrollTrigger: {
        trigger: el,
        start: 'top 88%',   /* begin as the element enters from the bottom */
        end:   'top 60%',   /* finish shortly after — settled while on screen */
        scrub: true
      }
    });
  });

  /* -- 3b. Parallax accents --
     The background orbs drift at their own speeds for depth (data-parallax).
     (The hero text + graphic parallax is handled in section 4.) */
  document.querySelectorAll('[data-parallax]').forEach(function (el) {
    var speed = parseFloat(el.getAttribute('data-parallax')) || 0.15;
    gsap.to(el, {
      yPercent: speed * 100, ease: 'none',
      scrollTrigger: { trigger: '.hero', start: 'top top', end: 'bottom top', scrub: true }
    });
  });

  /* -- 3c. Signature SVG line-draw (How It Works) --
     The path draws itself as the section scrolls through the viewport. */
  var path = document.querySelector('.draw-underline__path');
  if (path && typeof path.getTotalLength === 'function') {
    var len = path.getTotalLength();
    gsap.set(path, { strokeDasharray: len, strokeDashoffset: len });
    gsap.to(path, {
      strokeDashoffset: 0, ease: 'none',
      scrollTrigger: { trigger: '.how', start: 'top 78%', end: 'top 38%', scrub: true }
    });
  }

  /* Recalculate trigger positions after fonts/images finish loading. */
  window.addEventListener('load', function () { ScrollTrigger.refresh(); });
})();


/* ================================================================
   4. HERO GRAPHIC — premium SVG cloche
   Two kinds of motion:
   (a) Ambient loops that always run (float, steam, ring, sparkles, chips).
   (b) Scroll-linked parallax where each layer moves at its own speed for
       depth, tied directly to scroll position (scrub:true).
   Mobile runs a lighter subset; reduced motion leaves the SVG fully static.
   ================================================================ */
(function () {
  var svg = document.getElementById('hero-graphic');
  if (!svg || !HAS_GSAP) return;   /* no GSAP → the SVG simply stays static */
  if (REDUCED) return;             /* reduced motion → no animation at all  */

  /* -------- (a) Continuous ambient loops (GPU transforms/opacity only) -------- */

  /* Whole graphic gently floats (on the wrap, so it never fights the parallax
     that moves the stage). */
  gsap.to('.hero__graphic-wrap', {
    y: -14, duration: 3.4, ease: 'sine.inOut', repeat: -1, yoyo: true
  });

  /* Steam wisps rise and fade, each slightly offset. */
  gsap.utils.toArray('.hg-steam__wisp').forEach(function (wisp, i) {
    gsap.fromTo(wisp,
      { y: 8, opacity: 0.05 },
      { y: -20, opacity: 0.30, duration: 2.6 + i * 0.4,
        ease: 'sine.out', repeat: -1, yoyo: true, delay: i * 0.6 });
  });

  /* Desktop-only extras — kept off mobile so it stays light and smooth. */
  if (!IS_MOBILE) {
    gsap.to('.hg-ring',    { rotation: 360, svgOrigin: '240 264', duration: 52, ease: 'none', repeat: -1 });
    gsap.to('.hg-sparkle', { opacity: 0.25, duration: 1.5, ease: 'sine.inOut', repeat: -1, yoyo: true, stagger: 0.5 });
    gsap.to('.hg-chip',    { y: -9, duration: 2.8, ease: 'sine.inOut', repeat: -1, yoyo: true, stagger: 0.6 });
  }

  /* -------- (b) Scroll-linked parallax (needs ScrollTrigger) -------- */
  if (!HAS_ST) return;

  if (IS_MOBILE) {
    /* Light version: text + whole graphic drift at different speeds. */
    gsap.timeline({ scrollTrigger: { trigger: '.hero', start: 'top top', end: 'bottom top', scrub: true } })
      .to('.hero__content', { yPercent: 6,  opacity: 0.5, ease: 'none' }, 0)
      .to('.hero__stage',   { yPercent: 14, ease: 'none' }, 0);
    return;
  }

  /* Desktop: multi-layer parallax. Everything is pinned to the same scrub so
     the layers move together but at different rates → real depth. */
  gsap.timeline({ scrollTrigger: { trigger: '.hero', start: 'top top', end: 'bottom top', scrub: true } })
    .to('.hero__content', { yPercent: 10, opacity: 0.35, ease: 'none' }, 0)  /* text drifts up + fades   */
    .to('.hero__stage',   { yPercent: 24, ease: 'none' }, 0)                 /* graphic drifts faster    */
    .to('.hg-glow',       { scale: 1.25, opacity: 0.55, transformOrigin: '50% 50%', ease: 'none' }, 0)
    .to('.hg-dome',       { rotation: -7, svgOrigin: '240 356', ease: 'none' }, 0) /* dome tips back      */
    .to('.hg-plate',      { yPercent: 5, ease: 'none' }, 0)
    .to('.hg-chip',       { yPercent: -45, ease: 'none' }, 0)                /* foreground chips lead    */
    .to('.hg-steam',      { opacity: 0, y: -28, ease: 'none' }, 0);
})();


/* ================================================================
   5. CONTACT FORM
   Validates fields, sends to Formspree via fetch, shows success /
   error states. Honeypot field blocks bots silently. (Unchanged.)
   ================================================================ */
(function () {
  'use strict';

  var form          = document.getElementById('contact-form');
  var submitBtn     = document.getElementById('submit-btn');
  var btnText       = submitBtn ? submitBtn.querySelector('.btn__text')    : null;
  var btnLoading    = submitBtn ? submitBtn.querySelector('.btn__loading') : null;
  var successBanner = document.getElementById('form-success');
  var errorBanner   = document.getElementById('form-submit-error');

  if (!form) return;

  /* --- Show a field-level error --- */
  function showError(inputId, message) {
    var input = document.getElementById(inputId);
    var error = document.getElementById(inputId + '-error');
    if (!input || !error) return;
    input.classList.add('is-invalid');
    error.textContent = message;
  }

  /* --- Clear a field-level error --- */
  function clearError(inputId) {
    var input = document.getElementById(inputId);
    var error = document.getElementById(inputId + '-error');
    if (!input || !error) return;
    input.classList.remove('is-invalid');
    error.textContent = '';
  }

  /* --- Live clear errors as the user types --- */
  ['name', 'business', 'email', 'message'].forEach(function (id) {
    var el = document.getElementById(id);
    if (el) el.addEventListener('input', function () { clearError(id); });
  });

  /* --- Validate all required fields; returns true if valid --- */
  function validate() {
    var valid = true;

    var name = document.getElementById('name').value.trim();
    if (!name) { showError('name', 'Please enter your name.'); valid = false; }

    var business = document.getElementById('business').value.trim();
    if (!business) { showError('business', 'Please enter your business name.'); valid = false; }

    var email = document.getElementById('email').value.trim();
    var emailOk = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
    if (!email)   { showError('email', 'Please enter your email address.'); valid = false; }
    else if (!emailOk) { showError('email', 'Please enter a valid email address.'); valid = false; }

    var message = document.getElementById('message').value.trim();
    if (!message) { showError('message', 'Please add a short message.'); valid = false; }

    return valid;
  }

  /* --- Toggle the button loading state --- */
  function setLoading(isLoading) {
    submitBtn.disabled  = isLoading;
    if (btnText)    btnText.hidden    =  isLoading;
    if (btnLoading) btnLoading.hidden = !isLoading;
  }

  /* --- Submit handler --- */
  form.addEventListener('submit', async function (e) {
    e.preventDefault();

    /* Hide any previous status banners */
    successBanner.hidden = true;
    errorBanner.hidden   = true;

    /* Honeypot: if the hidden field has content, it's a bot — bail silently */
    var honeypot = form.querySelector('[name="_gotcha"]');
    if (honeypot && honeypot.value) return;

    if (!validate()) {
      /* Scroll to the first invalid field and focus it */
      var first = form.querySelector('.is-invalid');
      if (first) {
        first.scrollIntoView({ behavior: 'smooth', block: 'center' });
        first.focus();
      }
      return;
    }

    setLoading(true);

    try {
      var response = await fetch(form.action, {
        method:  'POST',
        body:    new FormData(form),
        headers: { 'Accept': 'application/json' }
      });

      if (response.ok) {
        form.reset();
        successBanner.hidden = false;
        successBanner.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
      } else {
        errorBanner.hidden = false;
        errorBanner.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
      }
    } catch (_) {
      errorBanner.hidden = false;
      errorBanner.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    } finally {
      setLoading(false);
    }
  });

})();
