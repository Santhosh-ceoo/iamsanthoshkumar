/* ════════════════════════════════════════════════════════════════════
   WEBGL LIQUID HERO — GPU shader signature (index hero only)
   • Domain-warped fbm flow field, cursor-reactive, world-aware color.
   • Defensive: needs WebGL + motion allowed + fine pointer; else no-op
     (hero falls back to the paper background — zero visual breakage).
   • Battery-safe: capped DPR, paused when tab hidden or hero offscreen.
   ════════════════════════════════════════════════════════════════════ */
(function () {
  'use strict';
  var cv = document.getElementById('glhero');
  if (!cv) return;
  var REDUCED = false, COARSE = false;
  try { REDUCED = matchMedia('(prefers-reduced-motion:reduce)').matches; } catch (e) {}
  try { COARSE = matchMedia('(pointer:coarse)').matches; } catch (e) {}
  if (REDUCED || COARSE) return;               // static paper fallback
  var gl = cv.getContext('webgl') || cv.getContext('experimental-webgl');
  if (!gl) return;

  var VS = 'attribute vec2 p;void main(){gl_Position=vec4(p,0.,1.);}';
  var FS = [
    'precision highp float;',
    'uniform vec2 uRes;uniform float uTime;uniform vec2 uMouse;uniform float uMix;',
    'float h21(vec2 p){p=fract(p*vec2(123.34,456.21));p+=dot(p,p+45.32);return fract(p.x*p.y);}',
    'float vn(vec2 p){vec2 i=floor(p),f=fract(p);vec2 u=f*f*(3.-2.*f);',
    ' float a=h21(i),b=h21(i+vec2(1,0)),c=h21(i+vec2(0,1)),d=h21(i+vec2(1,1));',
    ' return mix(mix(a,b,u.x),mix(c,d,u.x),u.y);}',
    'float fbm(vec2 p){float v=0.,a=.5;for(int k=0;k<5;k++){v+=a*vn(p);p*=2.02;a*=.5;}return v;}',
    'void main(){vec2 uv=gl_FragCoord.xy/uRes;vec2 p=uv*2.6;p.x*=uRes.x/uRes.y;float t=uTime*0.045;',
    ' vec2 q=vec2(fbm(p+t),fbm(p+vec2(5.2,1.3)-t));',
    ' vec2 r=vec2(fbm(p+2.0*q+vec2(1.7,9.2)+0.15*t),fbm(p+2.0*q+vec2(8.3,2.8)-0.12*t));',
    ' float f=fbm(p+2.4*r+(uMouse-0.5)*0.5);',
    ' vec3 a1=vec3(0.957,0.945,0.922),a2=vec3(0.925,0.886,0.835),a3=vec3(0.886,0.722,0.651);',
    ' vec3 b1=vec3(0.082,0.075,0.059),b2=vec3(0.141,0.106,0.071),b3=vec3(0.851,0.400,0.231);',
    ' vec3 c1=mix(a1,b1,uMix),c2=mix(a2,b2,uMix),c3=mix(a3,b3,uMix);',
    ' vec3 col=mix(c1,c2,clamp(f*1.25,0.,1.));',
    ' col=mix(col,c3,clamp(length(r)*0.55,0.,1.)*mix(0.5,0.85,uMix));',
    ' float vig=smoothstep(1.25,0.2,length(uv-0.5));col=mix(col,c1,(1.-vig)*0.35);',
    ' gl_FragColor=vec4(col,1.);}'
  ].join('\n');

  function sh(type, src) { var o = gl.createShader(type); gl.shaderSource(o, src); gl.compileShader(o); return o; }
  var pr = gl.createProgram();
  gl.attachShader(pr, sh(gl.VERTEX_SHADER, VS));
  gl.attachShader(pr, sh(gl.FRAGMENT_SHADER, FS));
  gl.linkProgram(pr);
  if (!gl.getProgramParameter(pr, gl.LINK_STATUS)) return;
  gl.useProgram(pr);

  var buf = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, buf);
  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 3, -1, -1, 3]), gl.STATIC_DRAW);
  var lp = gl.getAttribLocation(pr, 'p');
  gl.enableVertexAttribArray(lp);
  gl.vertexAttribPointer(lp, 2, gl.FLOAT, false, 0, 0);

  var uRes = gl.getUniformLocation(pr, 'uRes'),
      uTime = gl.getUniformLocation(pr, 'uTime'),
      uMouse = gl.getUniformLocation(pr, 'uMouse'),
      uMix = gl.getUniformLocation(pr, 'uMix');

  var DPR = Math.min(1.5, window.devicePixelRatio || 1);
  var mx = 0.62, my = 0.5, mix = 0.0, visible = true;

  function size() {
    var w = cv.clientWidth, h = cv.clientHeight;
    cv.width = Math.max(1, w * DPR); cv.height = Math.max(1, h * DPR);
    gl.viewport(0, 0, cv.width, cv.height);
  }
  size();
  addEventListener('resize', size, { passive: true });

  var hero = document.getElementById('hero');
  (hero || cv).addEventListener('mousemove', function (e) {
    var r = (hero || cv).getBoundingClientRect();
    mx = (e.clientX - r.left) / r.width;
    my = 1.0 - (e.clientY - r.top) / r.height;
  }, { passive: true });

  if ('IntersectionObserver' in window && hero) {
    new IntersectionObserver(function (es) { visible = es[0].isIntersecting; })
      .observe(hero);
  }

  document.body.classList.add('gl-on');   // lets CSS retire the fallback aurora
  var t0 = performance.now();
  function frame() {
    requestAnimationFrame(frame);
    if (!visible || document.hidden) return;
    var target = document.body.classList.contains('adv') ? 1.0 : 0.0;
    mix += (target - mix) * 0.045;
    gl.uniform2f(uRes, cv.width, cv.height);
    gl.uniform1f(uTime, (performance.now() - t0) / 1000);
    gl.uniform2f(uMouse, mx, my);
    gl.uniform1f(uMix, mix);
    gl.drawArrays(gl.TRIANGLES, 0, 3);
  }
  requestAnimationFrame(frame);
})();
