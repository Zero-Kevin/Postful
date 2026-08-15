/* ================================================================
   POSTFUL — main.js
   ================================================================
   1. NAV      : sticky scroll-shadow
   2. HERO     : GSAP letter-stagger entrance (on load)
   3. SCROLL   : GSAP ScrollTrigger scrub — reveals, parallax,
                 hero transition, and the SVG line-draw
   4. 3D       : Three.js low-poly "cloche" in the hero, with a
                 graceful static fallback
   5. FORM     : validation + Formspree submission + honeypot
   ----------------------------------------------------------------
   Every motion respects prefers-reduced-motion. Libraries are loaded
   from local vendor/ copies (see index.html) so everything also works
   when the page is opened directly from disk (file://).
   ================================================================ */

/* ---------- Capability flags (computed once) ---------- */
var REDUCED   = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
var HAS_GSAP  = typeof gsap !== 'undefined';
var HAS_ST    = HAS_GSAP && typeof ScrollTrigger !== 'undefined';
var HAS_THREE = typeof THREE !== 'undefined';

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

  /* -- 3b. Hero transition --
     As you scroll out of the hero, the text drifts up and fades. */
  gsap.to('.hero__inner', {
    yPercent: 16, opacity: 0.25, ease: 'none',
    scrollTrigger: { trigger: '.hero', start: 'top top', end: 'bottom top', scrub: true }
  });

  /* -- 3c. Parallax accents --
     Orbs and the 3D stage move at their own speeds for depth (data-parallax). */
  document.querySelectorAll('[data-parallax]').forEach(function (el) {
    var speed = parseFloat(el.getAttribute('data-parallax')) || 0.15;
    gsap.to(el, {
      yPercent: speed * 100, ease: 'none',
      scrollTrigger: { trigger: '.hero', start: 'top top', end: 'bottom top', scrub: true }
    });
  });

  /* -- 3d. Signature SVG line-draw (How It Works) --
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
   4. HERO 3D — Three.js low-poly cloche (food dome)
   On-brand colours, lightweight, pauses when off-screen or the tab is
   hidden, and reacts gently to cursor + scroll. Falls back to the inline
   SVG cloche whenever 3D is unavailable or reduced motion is requested.
   ================================================================ */
(function () {
  var stage = document.getElementById('hero-stage');
  if (!stage) return;
  var fallback = stage.querySelector('.hero__fallback');

  /* ---- Fallback gates: keep the static SVG, skip 3D ---- */
  if (REDUCED) return;                                              /* honour reduced motion    */
  if (!HAS_THREE) return;                                           /* three.js didn't load     */
  if (navigator.deviceMemory && navigator.deviceMemory < 4) return; /* low-RAM device           */
  try {
    var probe = document.createElement('canvas');
    var gl = probe.getContext('webgl') || probe.getContext('experimental-webgl');
    if (!gl) return;                                                /* no WebGL support         */
  } catch (e) { return; }

  var scene, camera, renderer, group;
  var frameId = null, running = false, visible = true;
  var pointerX = 0, pointerY = 0, scrollTilt = 0;

  try {
    initScene();
  } catch (err) {
    /* Anything unexpected → tear down and leave the SVG fallback visible. */
    if (renderer && renderer.domElement && renderer.domElement.parentNode) {
      renderer.domElement.parentNode.removeChild(renderer.domElement);
    }
    if (fallback) fallback.style.display = '';
    return;
  }

  function initScene() {
    var w = stage.clientWidth  || 320;
    var h = stage.clientHeight || 280;

    scene  = new THREE.Scene();
    camera = new THREE.PerspectiveCamera(38, w / h, 0.1, 100);
    camera.position.set(0, 0.6, 7.4);

    renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2)); /* cap DPR for mobile perf */
    renderer.setSize(w, h);
    stage.appendChild(renderer.domElement);

    /* 3D is live — hide the static SVG fallback. */
    if (fallback) fallback.style.display = 'none';

    group = new THREE.Group();
    scene.add(group);

    /* ---- On-brand materials ---- */
    var domeMat  = new THREE.MeshStandardMaterial({ color: 0x245C1C, metalness: 0.35, roughness: 0.35, emissive: 0x0c2a08, emissiveIntensity: 0.4 });
    var orangeMat= new THREE.MeshStandardMaterial({ color: 0xFFA626, metalness: 0.5,  roughness: 0.25, emissive: 0x3a2400, emissiveIntensity: 0.35 });
    var goldMat  = new THREE.MeshStandardMaterial({ color: 0xE9B44C, metalness: 0.55, roughness: 0.30 });
    var plateMat = new THREE.MeshStandardMaterial({ color: 0xFBF3E6, metalness: 0.15, roughness: 0.60 });
    var herbMat  = new THREE.MeshStandardMaterial({ color: 0x4E8B3A, metalness: 0.30, roughness: 0.40 });

    /* ---- Plate (flat disc) + gold rim ---- */
    var plate = new THREE.Mesh(new THREE.CylinderGeometry(2.5, 2.5, 0.18, 48), plateMat);
    plate.position.y = -1.35;
    group.add(plate);

    var rim = new THREE.Mesh(new THREE.TorusGeometry(2.5, 0.09, 16, 48), goldMat);
    rim.rotation.x = Math.PI / 2;
    rim.position.y = -1.26;
    group.add(rim);

    /* ---- Cloche dome (top half of a sphere) + herb-green base band ---- */
    var dome = new THREE.Mesh(
      new THREE.SphereGeometry(1.9, 40, 22, 0, Math.PI * 2, 0, Math.PI / 2),
      domeMat
    );
    dome.position.y = -1.26;
    group.add(dome);

    var band = new THREE.Mesh(new THREE.TorusGeometry(1.9, 0.05, 12, 48), herbMat);
    band.rotation.x = Math.PI / 2;
    band.position.y = -1.20;
    group.add(band);

    /* ---- Stem + knob (the little handle on top) ---- */
    var stem = new THREE.Mesh(new THREE.CylinderGeometry(0.07, 0.07, 0.28, 12), goldMat);
    stem.position.y = 0.72;
    group.add(stem);

    var knob = new THREE.Mesh(new THREE.SphereGeometry(0.20, 20, 16), orangeMat);
    knob.position.y = 0.92;
    group.add(knob);

    group.rotation.x = 0.16;  /* gentle 3/4 tilt */

    /* ---- Lighting: warm key, orange fill, herb rim ---- */
    scene.add(new THREE.AmbientLight(0xffffff, 0.55));

    var key = new THREE.DirectionalLight(0xfff1dc, 1.15);
    key.position.set(3, 5, 4);
    scene.add(key);

    var warm = new THREE.PointLight(0xffa626, 0.9, 30);
    warm.position.set(-4, 1, 3);
    scene.add(warm);

    var rimLight = new THREE.DirectionalLight(0x4e8b3a, 0.5);
    rimLight.position.set(-2, -1, -3);
    scene.add(rimLight);

    /* ---- Cursor parallax (desktop; no-op on touch) ---- */
    window.addEventListener('pointermove', function (e) {
      pointerX = (e.clientX / window.innerWidth)  * 2 - 1;
      pointerY = (e.clientY / window.innerHeight) * 2 - 1;
    }, { passive: true });

    /* ---- Scroll tilt (ties the object to scroll position) ---- */
    if (HAS_ST) {
      ScrollTrigger.create({
        trigger: '.hero', start: 'top top', end: 'bottom top', scrub: true,
        onUpdate: function (self) { scrollTilt = self.progress; }
      });
    }

    /* ---- Pause rendering when the hero is off-screen (saves CPU/battery) ---- */
    if ('IntersectionObserver' in window) {
      new IntersectionObserver(function (entries) {
        visible = entries[0].isIntersecting;
        if (visible) start(); else stop();
      }, { threshold: 0.01 }).observe(stage);
    }

    /* ---- Pause when the tab is hidden ---- */
    document.addEventListener('visibilitychange', function () {
      if (document.hidden) stop();
      else if (visible) start();
    });

    window.addEventListener('resize', onResize);
    start();
  }

  function onResize() {
    if (!renderer) return;
    var w = stage.clientWidth  || 320;
    var h = stage.clientHeight || 280;
    camera.aspect = w / h;
    camera.updateProjectionMatrix();
    renderer.setSize(w, h);
  }

  function start() { if (!running) { running = true; frameId = requestAnimationFrame(tick); } }
  function stop()  { running = false; if (frameId) { cancelAnimationFrame(frameId); frameId = null; } }

  function tick() {
    if (!running) return;

    group.rotation.y += 0.005;                                       /* slow idle spin        */

    var targetX = 0.16 + pointerY * 0.12 + scrollTilt * 0.5;         /* tilt: cursor + scroll */
    group.rotation.x += (targetX - group.rotation.x) * 0.06;         /* eased for smoothness   */
    group.position.x += (pointerX * 0.30 - group.position.x) * 0.06; /* subtle cursor parallax */
    group.position.y = scrollTilt * 0.6;                             /* gentle lift on scroll  */

    renderer.render(scene, camera);
    frameId = requestAnimationFrame(tick);
  }
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
