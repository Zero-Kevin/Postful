/* ================================================================
   POSTFUL — main.js
   ================================================================
   1. NAV:    sticky scroll-shadow effect
   2. HERO:   GSAP staggered entrance animation
   3. AOS:    scroll-reveal initialisation
   4. FORM:   validation + Formspree submission + honeypot
   ================================================================ */


/* ----------------------------------------------------------------
   1. NAV SCROLL SHADOW
   Adds a shadow under the nav once the user scrolls past the hero,
   making it feel like it's floating above the content.
   ---------------------------------------------------------------- */
(function () {
  var header = document.querySelector('.site-header');
  if (!header) return;

  window.addEventListener('scroll', function () {
    header.classList.toggle('is-scrolled', window.scrollY > 60);
  }, { passive: true });
})();


/* ----------------------------------------------------------------
   2. HERO ENTRANCE — GSAP staggered animation
   Runs once on page load. Each element slides up and fades in
   with a slight delay between them for a polished stagger.
   Skipped entirely if the user prefers reduced motion.
   ---------------------------------------------------------------- */
(function () {
  /* Bail if GSAP didn't load (e.g. offline) */
  if (typeof gsap === 'undefined') return;

  /* Bail if user has requested reduced motion */
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

  /* Build a staggered timeline — each element animates after the previous */
  var tl = gsap.timeline({ defaults: { ease: 'power2.out' } });

  tl.from('.hero__logo', {
    opacity: 0,
    scale: 0.75,
    duration: 0.8,
    ease: 'back.out(1.4)',
    delay: 0.1
  })
  .from('.hero__badge', { opacity: 0, y: 18, duration: 0.55 }, '-=0.3')
  .from('.hero__headline', { opacity: 0, y: 28, duration: 0.65 }, '-=0.3')
  .from('.hero__sub',      { opacity: 0, y: 20, duration: 0.55 }, '-=0.35')
  .from('.hero__ctas',     { opacity: 0, y: 18, duration: 0.5  }, '-=0.3');
})();


/* ----------------------------------------------------------------
   3. AOS — SCROLL REVEAL INIT
   data-aos attributes on HTML elements do the heavy lifting.
   'once: true' means each element only animates in once (no repeat
   on scroll back up), which feels more natural.
   ---------------------------------------------------------------- */
document.addEventListener('DOMContentLoaded', function () {
  if (typeof AOS === 'undefined') return;

  AOS.init({
    duration: 600,          /* animation length in ms              */
    easing:   'ease-out-quad',
    once:     true,         /* animate once per element            */
    offset:   80,           /* trigger 80px before element enters  */
    disable:  window.matchMedia('(prefers-reduced-motion: reduce)').matches
  });
});


/* ----------------------------------------------------------------
   4. CONTACT FORM
   Validates fields, sends to Formspree via fetch, shows
   success / error states. Honeypot field blocks bots silently.
   ---------------------------------------------------------------- */
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
