/* ==========================================================
   The KrishVerse planet - a violet gas giant rendered with WebGL
   ----------------------------------------------------------
   One fragment shader draws a real sphere: tilted spin axis,
   turbulent latitude bands, a spiral storm, lighting with limb
   darkening, and an atmosphere glow. It is used twice:
   - the footer, where only the top of a planet ~3x the screen
     width rises into view (CSS .footer-horizon is the fallback)
   - window.KVPlanet, which js/orbit.js uses to draw KrishVerse
     whole at the centre of the Work page solar system
   ========================================================== */
(function(){
  var VERT = 'attribute vec2 a; void main(){ gl_Position = vec4(a, 0.0, 1.0); }';
  var FRAG = [
    'precision highp float;',
    'uniform vec2 uC;        // planet centre, device px (GL coords, y up)',
    'uniform float uR;       // planet radius, device px',
    'uniform float uT;       // seconds',
    'uniform float uDark;    // 0 light theme, 1 dark theme',
    'uniform float uDpr;',
    'uniform float uTilt;    // spin axis tilt towards the viewer (radians)',
    'uniform float uSpin;    // radians per second',
    'uniform float uBand;    // band frequency',
    'uniform float uDetail;  // noise frequency scale',
    'uniform vec3 uStorm;    // storm position on the unit sphere',
    'uniform vec2 uStormSize;',
    'uniform vec3 uLight;    // direction to the light',
    'uniform vec3 uGlow;     // atmosphere falloff distances, css px',

    'float hash(vec3 p){ p = fract(p * 0.3183099 + 0.1); p *= 17.0; return fract(p.x * p.y * p.z * (p.x + p.y + p.z)); }',
    'float noise(vec3 x){',
    '  vec3 i = floor(x), f = fract(x); f = f * f * (3.0 - 2.0 * f);',
    '  return mix(mix(mix(hash(i), hash(i + vec3(1,0,0)), f.x), mix(hash(i + vec3(0,1,0)), hash(i + vec3(1,1,0)), f.x), f.y),',
    '             mix(mix(hash(i + vec3(0,0,1)), hash(i + vec3(1,0,1)), f.x), mix(hash(i + vec3(0,1,1)), hash(i + vec3(1,1,1)), f.x), f.y), f.z);',
    '}',
    'float fbm(vec3 p){ float v = 0.0, a = 0.5; for(int i = 0; i < 5; i++){ v += a * noise(p); p *= 2.03; a *= 0.5; } return v; }',

    'void main(){',
    '  vec2 p = (gl_FragCoord.xy - uC) / uR;',
    '  float r = length(p);',
    '  float px = 1.0 / uR;',
    '  vec3 L = normalize(uLight);',

    // atmosphere glow outside the planet, brighter on the lit side
    '  vec3 glowCol = mix(vec3(0.86, 0.55, 0.92), vec3(0.62, 0.38, 0.95), uDark);',
    '  float h = max(r - 1.0, 0.0) * uR / uDpr;   // css px above the surface',
    '  float side = 0.75 + 0.25 * clamp(dot(p / max(r, 1e-4), L.xy) * 1.5, -1.0, 1.0);',
    '  float ga = (0.7 * exp(-h / uGlow.x) + 0.38 * exp(-h / uGlow.y) + 0.16 * exp(-h / uGlow.z)) * side;',
    '  ga *= mix(0.85, 0.75, uDark);',
    '  if(r > 1.0){ gl_FragColor = vec4(glowCol * ga, ga); return; }',

    '  float z = sqrt(max(0.0, 1.0 - r * r));',
    '  vec3 n = vec3(p, z);',

    // body coordinates: spin axis tilted towards the viewer, then spun
    '  vec3 pole = vec3(0.0, cos(uTilt), sin(uTilt));',
    '  vec3 e2 = vec3(0.0, -sin(uTilt), cos(uTilt));',
    '  vec3 b = vec3(n.x, dot(n, pole), dot(n, e2));',
    '  float ang = uT * uSpin;',
    '  float cs = cos(ang), sn = sin(ang);',
    '  b = vec3(cs * b.x + sn * b.z, b.y, -sn * b.x + cs * b.z);',

    // turbulent latitude bands: noise stretched east-west, slowly evolving
    '  float flow = uT * 0.02;',
    '  float warp = fbm(b * vec3(6.0, 26.0, 6.0) * uDetail + vec3(0.0, 0.0, flow));',
    '  float fine = fbm(b * vec3(34.0, 120.0, 34.0) * uDetail + vec3(flow * 2.0));',
    '  float eddy = fbm(b * vec3(14.0, 48.0, 14.0) * uDetail + warp * 3.0 + vec3(0.0, flow, 0.0)) - 0.5;   // swirly filaments along band edges',
    '  float band = b.y * uBand + warp * 2.2 + eddy * 1.6 + fine * 0.5;',

    // storm: a spiral oval fixed on the planet surface
    '  vec3 s = normalize(uStorm);',
    '  vec3 east = normalize(cross(vec3(0.0, 1.0, 0.0), s));',
    '  vec3 north = cross(s, east);',
    '  vec3 v = b - s;',
    '  vec2 u = vec2(dot(v, east), dot(v, north)) / uStormSize;',
    '  float rs = length(u);',
    '  float swirl = 3.2 * exp(-rs * rs * 0.8);',
    '  float ca = cos(swirl), sa = sin(swirl);',
    '  vec2 uw = vec2(ca * u.x - sa * u.y, sa * u.x + ca * u.y);',
    '  float stormMask = smoothstep(1.35, 0.55, rs) * step(0.0, dot(b, s));',
    '  band += stormMask * (uw.y * 2.2 + fbm(vec3(uw * 2.5, flow)) * 2.0);',

    // palettes (light theme is pastel so dark text stays readable)
    '  vec3 c0 = mix(vec3(0.83, 0.79, 0.96), vec3(0.11, 0.08, 0.27), uDark);',
    '  vec3 c1 = mix(vec3(0.72, 0.62, 0.95), vec3(0.33, 0.21, 0.60), uDark);',
    '  vec3 c2 = mix(vec3(0.96, 0.76, 0.89), vec3(0.58, 0.27, 0.52), uDark);',
    '  vec3 c3 = mix(vec3(0.74, 0.89, 0.94), vec3(0.17, 0.40, 0.50), uDark);',
    '  vec3 c4 = mix(vec3(0.95, 0.93, 1.00), vec3(0.50, 0.42, 0.78), uDark);',
    '  float s1 = sin(band), s2 = sin(band * 0.47 + 1.7), s3 = sin(band * 0.29 + 4.0);',
    '  vec3 col = mix(c0, c1, smoothstep(-0.4, 0.9, s1));',
    '  col = mix(col, c2, smoothstep(0.35, 1.0, s2) * 0.6);',
    '  col = mix(col, c3, smoothstep(0.6, 1.0, s3) * 0.55);',
    '  col = mix(col, c4, smoothstep(0.75, 1.0, s1 * s2) * 0.35);',
    '  col *= 0.86 + 0.28 * fine;',

    // storm colouring: pink oval, bright core, darker rim
    '  float onSide = step(0.0, dot(b, s));',
    '  vec3 stormCol = mix(vec3(0.98, 0.62, 0.82), vec3(0.85, 0.35, 0.66), uDark);',
    '  float ring = 0.5 + 0.5 * sin(rs * 7.0 - atan(uw.y, uw.x));',
    '  col = mix(col, stormCol * (0.85 + 0.25 * ring), smoothstep(1.0, 0.25, rs) * 0.8 * onSide);',
    '  col = mix(col, mix(vec3(1.0, 0.92, 0.97), vec3(0.98, 0.75, 0.9), uDark), smoothstep(0.35, 0.0, rs) * 0.7 * onSide);',
    '  col *= 1.0 - smoothstep(1.4, 1.0, rs) * smoothstep(0.7, 1.0, rs) * 0.18 * onSide;',

    // lighting: wrapped diffuse + limb darkening
    '  float diff = clamp(dot(n, L) * 0.6 + 0.55, 0.0, 1.0);',
    '  float limb = mix(0.6, 1.0, pow(z, 0.4));',
    '  float light = mix(mix(0.82, 1.0, diff * limb), diff * limb, uDark);',
    '  col *= mix(light, light * 1.15, uDark);',

    // atmosphere scattering just inside the rim
    '  float rim = pow(1.0 - z, 5.0);',
    '  col = mix(col, glowCol * mix(1.05, 1.1, uDark), rim * 0.75 * side);',

    // anti-aliased edge into the glow
    '  float edge = smoothstep(1.0, 1.0 - 1.5 * px, r);',
    '  gl_FragColor = vec4(mix(glowCol * ga, col, edge), mix(ga, 1.0, edge));',
    '}'
  ].join('\n');

  /* Sets up a renderer on `canvas`. cfg holds the per-use uniforms;
     place(w, h, dpr) returns {cx, cy, r} in css px from the canvas top-left.
     Returns null when WebGL is unavailable. */
  function KVPlanet(canvas, cfg){
    var gl = canvas.getContext('webgl', {premultipliedAlpha:true, antialias:false, alpha:true});
    if(!gl) return null;
    function compile(type, src){
      var sh = gl.createShader(type);
      gl.shaderSource(sh, src); gl.compileShader(sh);
      if(!gl.getShaderParameter(sh, gl.COMPILE_STATUS)){ console.warn(gl.getShaderInfoLog(sh)); return null; }
      return sh;
    }
    var vs = compile(gl.VERTEX_SHADER, VERT), fs = compile(gl.FRAGMENT_SHADER, FRAG);
    if(!vs || !fs) return null;
    var prog = gl.createProgram();
    gl.attachShader(prog, vs); gl.attachShader(prog, fs); gl.linkProgram(prog);
    if(!gl.getProgramParameter(prog, gl.LINK_STATUS)) return null;
    gl.useProgram(prog);

    var buf = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, buf);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1,-1, 1,-1, -1,1, 1,1]), gl.STATIC_DRAW);
    var aLoc = gl.getAttribLocation(prog, 'a');
    gl.enableVertexAttribArray(aLoc);
    gl.vertexAttribPointer(aLoc, 2, gl.FLOAT, false, 0, 0);
    var U = {};
    ['uC','uR','uT','uDark','uDpr','uTilt','uSpin','uBand','uDetail','uStorm','uStormSize','uLight','uGlow'].forEach(function(k){
      U[k] = gl.getUniformLocation(prog, k);
    });
    gl.uniform1f(U.uTilt, cfg.tilt);
    gl.uniform1f(U.uSpin, cfg.spin);
    gl.uniform1f(U.uBand, cfg.band);
    gl.uniform1f(U.uDetail, cfg.detail);
    gl.uniform3fv(U.uStorm, cfg.storm);
    gl.uniform2fv(U.uStormSize, cfg.stormSize);
    gl.uniform3fv(U.uLight, cfg.light);
    gl.uniform3fv(U.uGlow, cfg.glow);

    var reduced = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    var t0 = performance.now();
    return {
      resize: function(w, h){
        var dpr = Math.min(window.devicePixelRatio || 1, cfg.maxDpr || 1.5);
        canvas.width = Math.round(w * dpr); canvas.height = Math.round(h * dpr);
        gl.viewport(0, 0, canvas.width, canvas.height);
        var pl = cfg.place(w, h);
        gl.uniform2f(U.uC, pl.cx * dpr, (h - pl.cy) * dpr);
        gl.uniform1f(U.uR, pl.r * dpr);
        gl.uniform1f(U.uDpr, dpr);
      },
      draw: function(now){
        gl.uniform1f(U.uT, reduced ? 0 : ((now || performance.now()) - t0) / 1000);
        gl.uniform1f(U.uDark, document.documentElement.dataset.theme === 'dark' ? 1 : 0);
        gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);
      },
      reduced: reduced
    };
  }
  window.KVPlanet = KVPlanet;

  /* ---------- footer horizon ---------- */
  var footer = document.querySelector('.site-footer');
  if(!footer) return;
  var canvas = document.createElement('canvas');
  canvas.className = 'planet-canvas';
  canvas.setAttribute('aria-hidden', 'true');
  var planet = KVPlanet(canvas, {
    tilt:0.9, spin:0.011, band:60, detail:1,
    storm:[Math.sin(2.95) * 0.5, 0.8, Math.cos(2.95) * 0.5], stormSize:[0.055, 0.022],
    light:[-0.5, 0.55, 0.65], glow:[10, 55, 150],
    place:function(w){
      var top = parseFloat(getComputedStyle(footer).getPropertyValue('--planet-top')) || 200;
      var R = Math.max(500, 1.5 * window.innerWidth);   // matches the CSS planet: max(1000px, 300vw) wide
      return {cx:w / 2, cy:top + R, r:R};
    }
  });
  if(!planet) return;   // keep the CSS planet
  footer.insertBefore(canvas, footer.firstChild);
  footer.classList.add('planet-gl');

  var visible = false, last = 0, raf = 0;
  function size(){ planet.resize(footer.clientWidth, footer.clientHeight); planet.draw(); }
  function loop(now){
    raf = 0;
    if(!visible) return;
    if(now - last > 33){ last = now; planet.draw(now); }   // ~30fps is plenty for motion this slow
    if(!planet.reduced) raf = requestAnimationFrame(loop);
  }
  function kick(){ if(!raf){ last = 0; raf = requestAnimationFrame(loop); } }

  size();
  if('ResizeObserver' in window) new ResizeObserver(size).observe(footer);
  else window.addEventListener('resize', size);
  document.addEventListener('kv-themechange', function(){ planet.draw(); });
  if('IntersectionObserver' in window){
    new IntersectionObserver(function(es){ visible = es[0].isIntersecting; if(visible) kick(); }).observe(footer);
  } else { visible = true; kick(); }
})();
