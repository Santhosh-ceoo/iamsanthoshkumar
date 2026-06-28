/* ════════════════════════════════════════════════════════════════════
   MOTION CHOREOGRAPHY — Lenis smooth-scroll + GSAP ScrollTrigger
   • Fully defensive: needs the libraries + motion allowed; else no-op.
   • Transform-only effects — never hides content, so nothing can break
     if a CDN fails (the IntersectionObserver reveal stays the backstop).
   ════════════════════════════════════════════════════════════════════ */
(function () {
  'use strict';
  var REDUCED = false, COARSE = false;
  try { REDUCED = matchMedia('(prefers-reduced-motion:reduce)').matches; } catch (e) {}
  try { COARSE = matchMedia('(pointer:coarse)').matches; } catch (e) {}

  var GSAP = window.gsap, ST = window.ScrollTrigger, lenis = null;

  /* ── Lenis smooth scroll — desktop/fine-pointer only; phones keep native scroll ── */
  if (!REDUCED && !COARSE && window.Lenis) {
    try {
      lenis = new Lenis({ duration: 1.1, smoothWheel: true, wheelMultiplier: 1, touchMultiplier: 1.6,
        easing: function (t) { return Math.min(1, 1.001 - Math.pow(2, -10 * t)); } });
      requestAnimationFrame(function raf(t) { lenis.raf(t); requestAnimationFrame(raf); });
      if (GSAP && ST) lenis.on('scroll', ST.update);
    } catch (e) { lenis = null; }
  }

  if (REDUCED || !GSAP || !ST) return;

  try {
    GSAP.registerPlugin(ST);

    /* helper: hand an element to GSAP cleanly (drop the reveal system so the
       1.8s visibility failsafe can't fight GSAP's transforms) */
    var own = function (el) { if (el) { el.classList.remove('rev'); el.style.opacity = '1'; } };

    /* ── Hero: masked "wipe-up" entrance for the name ── */
    var name = document.querySelector('.hero-name');
    if (name) {
      GSAP.fromTo(name,
        { clipPath: 'inset(0 0 112% 0)', y: 26 },
        { clipPath: 'inset(0 0 -8% 0)', y: 0, duration: 1.2, ease: 'power4.out', delay: 0.25,
          onComplete: function () { name.style.clipPath = 'none'; name.style.webkitClipPath = 'none'; } });
    }
    /* hero foot drifts up softly */
    var foot = document.querySelector('.hero-foot');
    if (foot) GSAP.from(foot, { y: 30, opacity: 0, duration: 1, ease: 'power3.out', delay: 0.6,
      onComplete: function () { foot.style.opacity = ''; } });

    /* scroll-driven choreography — desktop / fine-pointer only (phones stay simple + native) */
    if (!COARSE && matchMedia('(min-width:760px)').matches) {

    /* ── Hero photo: parallax depth on scroll ── */
    GSAP.utils.toArray('.hero-photo.pro').forEach(function (el) {
      GSAP.to(el, { yPercent: 9, ease: 'none',
        scrollTrigger: { trigger: '#hero', start: 'top top', end: 'bottom top', scrub: true } });
    });

    /* ── Section titles: gentle scrub parallax ── */
    GSAP.utils.toArray('.stitle, .phero h1').forEach(function (el) {
      own(el);
      GSAP.fromTo(el, { y: 36 }, { y: -24, ease: 'none',
        scrollTrigger: { trigger: el, start: 'top bottom', end: 'bottom top', scrub: true } });
    });

    /* ── Work cards: choreographed rise as the row enters ── */
    GSAP.utils.toArray('.work-grid').forEach(function (grid) {
      var cards = grid.querySelectorAll('.work');
      cards.forEach(own);
      GSAP.from(cards, { y: 64, scale: 0.96, ease: 'power2.out', stagger: 0.08,
        scrollTrigger: { trigger: grid, start: 'top 88%', end: 'top 48%', scrub: 0.6 } });
    });

    /* ── Stat numbers: subtle depth ── */
    GSAP.utils.toArray('.num').forEach(function (el) {
      own(el);
      GSAP.from(el, { y: 32, ease: 'none',
        scrollTrigger: { trigger: el, start: 'top bottom', end: 'top 62%', scrub: true } });
    });

    /* ── Service / topic cards: staggered rise ── */
    GSAP.utils.toArray('.serv-grid, .topics, .dfy, .rec-grid').forEach(function (grid) {
      var kids = grid.children;
      [].forEach.call(kids, own);
      GSAP.from(kids, { y: 50, ease: 'power2.out', stagger: 0.07,
        scrollTrigger: { trigger: grid, start: 'top 90%', end: 'top 55%', scrub: 0.5 } });
    });

    /* ── Scroll-velocity skew on work imagery (signature micro-interaction) ── */
    if (lenis) {
      var shots = document.querySelectorAll('.work-shot');
      lenis.on('scroll', function (e) {
        var v = Math.max(-7, Math.min(7, (e.velocity || 0) * 0.4));
        for (var i = 0; i < shots.length; i++) shots[i].style.transform = 'skewY(' + (v * 0.14).toFixed(2) + 'deg)';
      });
    }

    } /* end desktop-only choreography */

    /* recalc once fonts/images settle */
    window.addEventListener('load', function () { setTimeout(function () { ST.refresh(); }, 450); });
  } catch (e) { /* motion is enhancement only — never let it break the page */ }
})();
