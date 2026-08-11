/* ================================================================
   POSTFUL — main.js
   ================================================================
   Handles:
     1. Contact form validation
     2. Form submission to Formspree
     3. Honeypot spam protection
     4. Success / error state display
   ================================================================ */


/* ----------------------------------------------------------------
   CONTACT FORM
   ---------------------------------------------------------------- */
(function () {
  'use strict';

  const form           = document.getElementById('contact-form');
  const submitBtn      = document.getElementById('submit-btn');
  const btnText        = submitBtn.querySelector('.btn__text');
  const btnLoading     = submitBtn.querySelector('.btn__loading');
  const successBanner  = document.getElementById('form-success');
  const errorBanner    = document.getElementById('form-submit-error');

  /* --- Helper: show a field error --- */
  function showError(inputId, message) {
    const input = document.getElementById(inputId);
    const error = document.getElementById(inputId + '-error');
    if (!input || !error) return;
    input.classList.add('is-invalid');
    error.textContent = message;
  }

  /* --- Helper: clear a field error --- */
  function clearError(inputId) {
    const input = document.getElementById(inputId);
    const error = document.getElementById(inputId + '-error');
    if (!input || !error) return;
    input.classList.remove('is-invalid');
    error.textContent = '';
  }

  /* --- Clear errors when the user starts typing again --- */
  ['name', 'business', 'email', 'message'].forEach(function (id) {
    const el = document.getElementById(id);
    if (el) {
      el.addEventListener('input', function () { clearError(id); });
    }
  });

  /* --- Validate the form — returns true if valid --- */
  function validate() {
    let valid = true;

    /* Name */
    const name = document.getElementById('name').value.trim();
    if (!name) {
      showError('name', 'Please enter your name.');
      valid = false;
    }

    /* Business name */
    const business = document.getElementById('business').value.trim();
    if (!business) {
      showError('business', 'Please enter your business name.');
      valid = false;
    }

    /* Email */
    const email = document.getElementById('email').value.trim();
    const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!email) {
      showError('email', 'Please enter your email address.');
      valid = false;
    } else if (!emailPattern.test(email)) {
      showError('email', 'Please enter a valid email address.');
      valid = false;
    }

    /* Message */
    const message = document.getElementById('message').value.trim();
    if (!message) {
      showError('message', 'Please add a short message.');
      valid = false;
    }

    return valid;
  }

  /* --- Set the button to loading state --- */
  function setLoading(isLoading) {
    submitBtn.disabled = isLoading;
    btnText.hidden     = isLoading;
    btnLoading.hidden  = !isLoading;
  }

  /* --- Form submit handler --- */
  if (form) {
    form.addEventListener('submit', async function (e) {
      e.preventDefault();

      /* Hide any previous banners */
      successBanner.hidden = true;
      errorBanner.hidden   = true;

      /* Honeypot check — if the hidden field has a value, it's a bot */
      const honeypot = form.querySelector('[name="_gotcha"]');
      if (honeypot && honeypot.value) {
        /* Silently do nothing — looks like a success to the bot */
        return;
      }

      /* Validate */
      if (!validate()) {
        /* Scroll to the first error */
        const firstInvalid = form.querySelector('.is-invalid');
        if (firstInvalid) {
          firstInvalid.scrollIntoView({ behavior: 'smooth', block: 'center' });
          firstInvalid.focus();
        }
        return;
      }

      /* Submit to Formspree */
      setLoading(true);

      try {
        const data = new FormData(form);

        const response = await fetch(form.action, {
          method: 'POST',
          body: data,
          headers: { 'Accept': 'application/json' },
        });

        if (response.ok) {
          /* Success */
          form.reset();
          successBanner.hidden = false;
          successBanner.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
        } else {
          /* Formspree returned an error */
          errorBanner.hidden = false;
          errorBanner.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
        }
      } catch (err) {
        /* Network error */
        errorBanner.hidden = false;
        errorBanner.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
      } finally {
        setLoading(false);
      }
    });
  }

})();
