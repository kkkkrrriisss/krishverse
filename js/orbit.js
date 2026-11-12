/* ==========================================================================
   Work page - project solar system
   KrishVerse is the sun, each category is a planet on its own tilted orbit,
   and every project is a moon circling its planet. Hover a moon to see the
   project, click to visit. Pick a planet (or a filter) to zoom into it.
   ========================================================================== */
(function(){
  var root = document.getElementById('orrery');
  var filterBar = document.getElementById('orreryFilters');
  var data = window.KV_WORK;
  if(!root || !data) return;

  var reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var TAU = Math.PI * 2;

  var PALETTE = [['var(--pink)','var(--violet)'], ['var(--violet)','var(--indigo)'], ['var(--cyan)','#2F80ED'], ['#FFB25B','var(--pink)']];
  var ORBIT_X = [0.17, 0.26, 0.355, 0.45];   // orbit radius as a share of the stage width
  var PERIOD = [48, 72, 100, 132];           // seconds per lap - inner planets run faster
  var START = [0.4, 2.3, 4.2, 5.7];          // starting angle, spread round the sun
  var WORLD = ['gas', 'rock', 'ocean', 'ringed'];   // surface style per planet, matching PALETTE

  function make(tag, cls, html){
    var el = document.createElement(tag);
    if(cls) el.className = cls;
    if(html) el.innerHTML = html;
    return el;
  }
  function lerp(a, b, t){ return a + (b - a) * t; }
  // point the lit side of a body at (sx, sy); `still` blends towards a fixed upper-left light
  function light(el, x, y, sx, sy, still){
    var dx = sx - x, dy = sy - y, d = Math.hypot(dx, dy) || 1;
    var ux = lerp(dx / d, -0.6, still), uy = lerp(dy / d, -0.6, still);
    el.style.setProperty('--lx', (50 + ux * 30).toFixed(1) + '%');
    el.style.setProperty('--ly', (50 + uy * 30).toFixed(1) + '%');
  }
  function clamp(v, lo, hi){ return Math.max(lo, Math.min(hi, v)); }
  function domainOf(url){ return url.replace(/^https?:\/\//,'').replace(/\/$/,''); }

  /* ---------- build ---------- */
  var sun = make('button', 'orrery-sun', '<span>KrishVerse</span>');
  sun.type = 'button';
  sun.setAttribute('aria-label', 'KrishVerse, show all systems');

  // KrishVerse itself: the same gas giant as the footer, drawn whole (js/planet.js)
  var SUN_BOX = 192;   // canvas size in css px: the 96px planet plus room for its glow
  var sunGL = null;
  if(window.KVPlanet){
    var sunCanvas = make('canvas', 'sun-canvas');
    sunCanvas.setAttribute('aria-hidden', 'true');
    sunGL = window.KVPlanet(sunCanvas, {
      tilt:0.35, spin:0.12, band:14, detail:0.45, maxDpr:2,
      storm:[0.372, -0.296, 0.879], stormSize:[0.2, 0.09],
      light:[-0.35, 0.4, 0.85], glow:[4, 12, 26],
      place:function(w, h){ return {cx:w / 2, cy:h / 2, r:46}; }
    });
    if(sunGL){
      sun.insertBefore(sunCanvas, sun.firstChild);
      sun.classList.add('gl');
      sunGL.resize(SUN_BOX, SUN_BOX);
      document.addEventListener('kv-themechange', function(){ sunGL.draw(); });
    }
  }

  var tip = make('div', 'orrery-tip');
  tip.setAttribute('aria-hidden', 'true');

  var caption = make('div', 'orrery-caption');
  caption.innerHTML = '<p class="eyebrow"></p><h3></h3><p class="orrery-caption-desc"></p>' +
    '<button type="button" class="orrery-back">&larr; All systems</button>';
  var capEyebrow = caption.querySelector('.eyebrow');
  var capTitle = caption.querySelector('h3');
  var capDesc = caption.querySelector('.orrery-caption-desc');

  var systems = data.map(function(cat, i){
    var pal = PALETTE[i % PALETTE.length];
    var ring = make('div', 'orrery-ring');

    var planet = make('button', 'orrery-planet',
      '<span class="planet-body"><span class="planet-surface"></span></span>' +
      '<span class="planet-label">' + cat.cat + '<small>' + cat.items.length + ' projects</small></span>');
    planet.type = 'button';
    planet.dataset.world = WORLD[i % WORLD.length];
    planet.style.setProperty('--pa', pal[0]);
    planet.style.setProperty('--pb', pal[1]);
    planet.setAttribute('aria-label', cat.cat + ', ' + cat.items.length + ' projects, zoom in');

    var moons = cat.items.map(function(it, j){
      var a = make('a', 'orrery-moon', '<span class="moon-label">' + it.name + '</span>');
      a.href = it.url;
      a.target = '_blank';
      a.rel = 'noopener';
      a.style.setProperty('--pa', pal[0]);
      a.style.setProperty('--pb', pal[1]);
      a.setAttribute('aria-label', it.name + ', ' + it.tag + ' (opens in a new tab)');
      return { el: a, label: a.firstChild, it: it, phase: (j / cat.items.length) * TAU, x: 0, y: 0 };
    });

    return {
      i: i, cat: cat, ring: ring, planet: planet, moons: moons,
      size: 26 + Math.sqrt(cat.items.length) * 9,
      spin: i * 1.3,
      moonPeriod: 12 + cat.items.length * 1.4
    };
  });

  systems.forEach(function(s){ root.appendChild(s.ring); });
  root.appendChild(sun);
  systems.forEach(function(s){
    root.appendChild(s.planet);
    s.moons.forEach(function(m){ root.appendChild(m.el); });
  });
  root.appendChild(caption);
  root.appendChild(tip);

  /* ---------- filters ---------- */
  var filterBtns = [];
  if(filterBar){
    var all = make('button', 'orrery-filter', 'All systems <span class="count">' +
      data.reduce(function(n, c){ return n + c.items.length; }, 0) + '</span>');
    all.dataset.focus = '-1';
    filterBtns.push(all);
    systems.forEach(function(s){
      var b = make('button', 'orrery-filter', '<i class="swatch"></i>' + s.cat.cat + ' <span class="count">' + s.cat.items.length + '</span>');
      b.style.setProperty('--pa', PALETTE[s.i % PALETTE.length][0]);
      b.style.setProperty('--pb', PALETTE[s.i % PALETTE.length][1]);
      b.dataset.focus = String(s.i);
      filterBtns.push(b);
    });
    filterBtns.forEach(function(b){
      b.type = 'button';
      b.addEventListener('click', function(){ setFocus(parseInt(b.dataset.focus, 10)); });
      filterBar.appendChild(b);
    });
  }

  /* ---------- state ---------- */
  var focus = -2;           // index of the zoomed planet, -1 = whole system (-2 until first setFocus)
  var zoom = 0;             // eased 0 → 1 while zooming in
  var t = 0;                // orbit clock (seconds)
  var hoverMoon = null;     // moon under the pointer / keyboard focus - freezes motion
  var hoverPlanet = false;
  var visible = true;

  function setFocus(i){
    if(i === focus) return;
    focus = i;
    root.classList.toggle('zoomed', i >= 0);
    filterBtns.forEach(function(b){ b.setAttribute('aria-pressed', String(parseInt(b.dataset.focus, 10) === i)); });

    systems.forEach(function(s){
      var hidden = i >= 0 && s.i !== i;
      s.planet.tabIndex = hidden ? -1 : 0;
      s.planet.setAttribute('aria-hidden', String(hidden));
      s.moons.forEach(function(m){
        m.el.tabIndex = hidden ? -1 : 0;
        m.el.setAttribute('aria-hidden', String(hidden));
        m.el.classList.toggle('in-focus', s.i === i);
      });
    });
    sun.tabIndex = i >= 0 ? -1 : 0;

    if(i >= 0){
      var c = data[i];
      capEyebrow.textContent = c.items.length + ' projects';
      capTitle.textContent = c.cat;
      capDesc.textContent = c.desc;
    }
    if(reduce) zoom = i >= 0 ? 1 : 0;

    // the full list below mirrors the selection
    document.querySelectorAll('#workCategories .work-cat').forEach(function(el){
      el.hidden = i >= 0 && el.dataset.cat !== String(i);
    });
    hideTip();
  }

  systems.forEach(function(s){
    s.planet.addEventListener('click', function(){ setFocus(s.i); });
    s.planet.addEventListener('mouseenter', function(){ hoverPlanet = true; });
    s.planet.addEventListener('mouseleave', function(){ hoverPlanet = false; });
    s.moons.forEach(function(m){
      m.el.addEventListener('mouseenter', function(){ showTip(m); });
      m.el.addEventListener('mouseleave', hideTip);
      m.el.addEventListener('focus', function(){ showTip(m); });
      m.el.addEventListener('blur', hideTip);
    });
  });
  sun.addEventListener('click', function(){ setFocus(-1); });
  caption.querySelector('.orrery-back').addEventListener('click', function(){ setFocus(-1); });
  root.addEventListener('keydown', function(e){ if(e.key === 'Escape') setFocus(-1); });

  function showTip(m){
    hoverMoon = m;
    tip.innerHTML = '<strong>' + m.it.name + '</strong><span>' + m.it.tag +
      (m.it.note ? ' &middot; ' + m.it.note : '') + '</span><em>' + domainOf(m.it.url) + ' &nearr;</em>';
    tip.classList.add('show');
    placeTip();
  }
  function hideTip(){
    hoverMoon = null;
    tip.classList.remove('show');
  }
  function placeTip(){
    if(!hoverMoon) return;
    var W = root.clientWidth;
    var half = tip.offsetWidth / 2;
    var x = clamp(hoverMoon.x, half + 4, W - half - 4);
    var below = hoverMoon.y < tip.offsetHeight + 30;   // flip under the moon near the top edge
    tip.style.transform = 'translate(' + x + 'px,' + hoverMoon.y + 'px) translate(-50%,' + (below ? '18px' : 'calc(-100% - 16px)') + ')';
  }

  /* ---------- animation ---------- */
  function frame(dt){
    var W = root.clientWidth, H = root.clientHeight;
    var cx = W / 2, cy = H / 2;
    var k = clamp(W / 1100, 0.55, 1);        // shrink bodies on narrow screens
    var narrow = W < 640;

    var speed = reduce ? 0 : hoverMoon ? 0 : hoverPlanet ? 0.3 : 1;
    t += dt * speed;
    if(!reduce) zoom += ((focus >= 0 ? 1 : 0) - zoom) * Math.min(1, dt * 4.5);
    var z = zoom;

    // sun shrinks back while a planet takes the centre
    sun.style.transform = 'translate(' + cx + 'px,' + cy + 'px) translate(-50%,-50%) scale(' + (k * (1 - z * 0.55)) + ')';
    sun.style.opacity = String(1 - z * 0.92);

    var zoomR = Math.min(W * (narrow ? 0.4 : 0.3), H * 0.36);

    systems.forEach(function(s){
      var isF = s.i === focus;
      var fz = isF ? z : 0;
      var fade = focus >= 0 && !isF ? 1 - z * 0.97 : 1;

      // wide screens: flat, tilted orbits; phones: tall ellipses that use the height
      var rx = ORBIT_X[s.i] * W * (narrow ? 0.8 : 1);
      var ry = narrow ? Math.min(ORBIT_X[s.i] * H * 0.95, cy - 50 * k) : Math.min(rx * 0.5, cy - 70 * k);
      var a = START[s.i] + (t / PERIOD[s.i]) * TAU;
      var depth = Math.sin(a);                         // -1 far side, +1 near side
      var depthScale = 0.82 + 0.18 * (depth + 1) / 2;

      var px = lerp(cx + Math.cos(a) * rx, cx, fz);
      var py = lerp(cy + depth * ry, cy, fz);
      var scale = lerp(depthScale, 1.7, fz);
      var size = s.size * k;
      var zBase = isF && z > 0.1 ? 40 : Math.round(20 + depth * 10);

      s.ring.style.width = (rx * 2) + 'px';
      s.ring.style.height = (ry * 2) + 'px';
      s.ring.style.opacity = String((1 - z) * 1);

      var p = s.planet;
      p.style.width = p.style.height = size + 'px';
      p.style.transform = 'translate(' + px + 'px,' + py + 'px) translate(-50%,-50%) scale(' + scale + ')';
      p.style.opacity = String(fade);
      p.style.zIndex = String(zBase);
      p.style.pointerEvents = fade < 0.5 ? 'none' : '';
      light(p, px, py, cx, cy, fz);   // a zoomed planet sits on the star, so light it from the upper left

      s.spin += dt * speed * (TAU / s.moonPeriod) * (isF ? 0.18 : 1);
      var moonR = lerp((size / 2 + 22 + (10 + s.moons.length * 1.8) * k) * depthScale, zoomR, fz);
      var flatten = lerp(0.62, 1, fz);                 // tilted moon orbits, flat-on when zoomed
      // keep the planet's name clear of its moons
      p.style.setProperty('--lg', ((moonR * flatten - size * scale / 2) / scale + 8) + 'px');
      s.moons.forEach(function(m){
        var ma = m.phase + s.spin;
        var sy = Math.sin(ma);
        m.x = px + Math.cos(ma) * moonR;
        m.y = py + sy * moonR * flatten;
        m.el.style.transform = 'translate(' + m.x + 'px,' + m.y + 'px)';
        light(m.el, m.x, m.y, cx, cy, fz);
        m.el.style.opacity = String(fade);
        m.el.style.pointerEvents = fade < 0.5 ? 'none' : '';
        // moons pass behind their planet on the far half of the orbit
        m.el.style.zIndex = String(zBase + (sy < 0 && fz < 0.5 ? -1 : 1));
        m.label.classList.toggle('left', Math.cos(ma) < -0.05);
        m.label.classList.toggle('shown', isF && z > 0.7 && !narrow);
      });
    });

    placeTip();
  }

  var last = null, lastSun = 0;
  function loop(ts){
    var dt = last === null ? 0 : Math.min(0.05, (ts - last) / 1000);
    last = ts;
    if(visible) frame(dt);
    if(visible && sunGL && ts - lastSun > 33){ lastSun = ts; sunGL.draw(ts); }   // ~30fps is plenty
    requestAnimationFrame(loop);
  }

  if('IntersectionObserver' in window){
    new IntersectionObserver(function(entries){
      entries.forEach(function(e){ visible = e.isIntersecting; });
    }).observe(root);
  }
  window.addEventListener('resize', function(){ frame(0); });

  setFocus(-1);
  frame(0);
  requestAnimationFrame(loop);
})();
