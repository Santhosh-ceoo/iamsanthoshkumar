/* ════════════════════════════════════════════════════════════════════
   DEPTH LAYER — shared across pages, fully defensive
   • .tilt elements → CSS 3D parallax tilt (depth on hover)
   • #heroSpot      → soft light that follows the cursor in the hero
   No WebGL, no external libs. Respects prefers-reduced-motion & touch.
   ════════════════════════════════════════════════════════════════════ */
(function () {
  'use strict';

  var REDUCED = false, COARSE = false;
  try { REDUCED = matchMedia('(prefers-reduced-motion:reduce)').matches; } catch (e) {}
  try { COARSE = matchMedia('(pointer:coarse)').matches; } catch (e) {}

  /* ── Cursor-follow glow in the hero (premium, subtle) ── */
  function initHeroSpot() {
    var spot = document.getElementById('heroSpot');
    var hero = document.getElementById('hero');
    if (!spot || !hero || REDUCED || COARSE) return;
    var tx = 0.62, ty = 0.4, cx = tx, cy = ty, raf = null;
    function place() {
      raf = null;
      spot.style.setProperty('--sx', (cx * 100) + '%');
      spot.style.setProperty('--sy', (cy * 100) + '%');
    }
    function loop() {
      cx += (tx - cx) * 0.08; cy += (ty - cy) * 0.08;
      place();
      if (Math.abs(tx - cx) > 0.001 || Math.abs(ty - cy) > 0.001) requestAnimationFrame(loop);
      else raf = null;
    }
    hero.addEventListener('mousemove', function (e) {
      var r = hero.getBoundingClientRect();
      tx = (e.clientX - r.left) / r.width;
      ty = (e.clientY - r.top) / r.height;
      spot.classList.add('on');
      if (raf == null) raf = requestAnimationFrame(loop);
    }, { passive: true });
    hero.addEventListener('mouseleave', function () { spot.classList.remove('on'); });
    place();
  }

  /* ── 3D tilt cards (depth without WebGL) ── */
  function initTilt() {
    if (REDUCED || COARSE) return;
    document.querySelectorAll('.tilt').forEach(function (card) {
      var MAX = 5, raf = null, tX = 0, tY = 0;
      function apply() {
        raf = null;
        card.style.transform =
          'perspective(900px) rotateX(' + tY + 'deg) rotateY(' + tX + 'deg) translateZ(0)';
      }
      card.addEventListener('mousemove', function (e) {
        var r = card.getBoundingClientRect();
        var px = (e.clientX - r.left) / r.width - 0.5;
        var py = (e.clientY - r.top) / r.height - 0.5;
        tX = px * MAX * 2; tY = -py * MAX * 2;
        card.style.setProperty('--mx', (px * 100 + 50) + '%');
        card.style.setProperty('--my', (py * 100 + 50) + '%');
        card.classList.add('tilting');
        if (raf == null) raf = requestAnimationFrame(apply);
      });
      card.addEventListener('mouseleave', function () {
        if (raf) { cancelAnimationFrame(raf); raf = null; }
        card.classList.remove('tilting');
        card.style.transform = '';
      });
    });
  }

  function boot() { initHeroSpot(); initTilt(); }
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', boot);
  } else { boot(); }
})();
