/* ==========================================================================
   Home page - physics playground
   The stack drops into a box when it scrolls into view; every piece can be
   grabbed, thrown and stacked. Uses Matter.js for the physics and moves the
   real DOM elements, so text stays crisp and themeable. Without Matter.js or
   with reduced motion, the pieces simply stay in their wrapped static layout.
   ========================================================================== */
(function(){
  var box = document.getElementById('playground');
  if(!box || !window.Matter) return;
  if(window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

  var M = window.Matter;
  var Engine = M.Engine, Bodies = M.Bodies, Body = M.Body, Composite = M.Composite, Constraint = M.Constraint;

  var engine, items = [], walls = [], drag = null, dragItem = null;
  var W = 0, H = 0, visible = false, started = false;
  var WALL = 200;

  function buildWalls(){
    if(walls.length) Composite.remove(engine.world, walls);
    var opts = { isStatic: true, friction: 0.4 };
    walls = [
      Bodies.rectangle(W / 2, H + WALL / 2, W + WALL * 2, WALL, opts),            // floor
      Bodies.rectangle(-WALL / 2, 0, WALL, H * 4, opts),                          // left
      Bodies.rectangle(W + WALL / 2, 0, WALL, H * 4, opts),                       // right
      Bodies.rectangle(W / 2, -H - WALL / 2, W + WALL * 2, WALL, opts)            // lid, a box-height above
    ];
    Composite.add(engine.world, walls);
  }

  function start(){
    started = true;
    box.classList.add('live');
    W = box.clientWidth; H = box.clientHeight;

    engine = Engine.create();
    engine.gravity.y = 1.1;
    buildWalls();

    var els = Array.prototype.filter.call(box.querySelectorAll('.pg-item'), function(el){ return el.offsetParent !== null; });
    els.forEach(function(el, i){
      var w = el.offsetWidth, h = el.offsetHeight;
      var x = w / 2 + Math.random() * Math.max(1, W - w);
      var y = -h - (i * 47) % (H * 0.9);                  // staggered heights → they drop in one after another
      var opts = { restitution: 0.3, friction: 0.35, frictionAir: 0.012, density: 0.0018 };
      var body = el.classList.contains('pg-orb')
        ? Bodies.circle(x, y, w / 2, opts)
        : Bodies.rectangle(x, y, w, h, Object.assign({ chamfer: { radius: h / 2 - 1 } }, opts));
      Body.setAngle(body, (Math.random() - 0.5) * 0.8);
      items.push({ el: el, body: body, w: w, h: h });
    });
    Composite.add(engine.world, items.map(function(it){ return it.body; }));
    render();
    requestAnimationFrame(loop);
  }

  function render(){
    items.forEach(function(it){
      var p = it.body.position;
      it.el.style.transform = 'translate(' + (p.x - it.w / 2) + 'px,' + (p.y - it.h / 2) + 'px) rotate(' + it.body.angle + 'rad)';
    });
  }

  // fixed 60Hz physics steps driven by real time, so 120Hz screens don't run
  // double speed and slow frames don't turn into slow motion
  var STEP = 1000 / 60, acc = 0, lastTs = null;
  function loop(ts){
    var elapsed = lastTs === null ? STEP : Math.min(250, ts - lastTs);
    lastTs = ts;
    if(visible || drag){
      acc += elapsed;
      var steps = 0;
      while(acc >= STEP && steps < 8){ Engine.update(engine, STEP); acc -= STEP; steps++; }
      if(steps === 8) acc = 0;
      // anything flung through a wall gets dropped back in from the top
      items.forEach(function(it){
        var p = it.body.position;
        if(p.x < -WALL || p.x > W + WALL || p.y > H + WALL || p.y < -H * 1.5){
          Body.setPosition(it.body, { x: W / 2, y: -it.h });
          Body.setVelocity(it.body, { x: 0, y: 0 });
        }
      });
      render();
    } else {
      acc = 0;
    }
    requestAnimationFrame(loop);
  }

  /* ---------- grab & throw ---------- */
  function local(e){
    var r = box.getBoundingClientRect();
    return { x: Math.max(0, Math.min(W, e.clientX - r.left)), y: Math.max(-H, Math.min(H, e.clientY - r.top)) };
  }
  box.addEventListener('pointerdown', function(e){
    if(!started || drag) return;
    var el = e.target.closest('.pg-item');
    if(!el) return;
    var it = items.filter(function(i){ return i.el === el; })[0];
    if(!it) return;
    e.preventDefault();
    var p = local(e);
    dragItem = it;
    drag = Constraint.create({
      pointA: p, bodyB: it.body,
      pointB: { x: p.x - it.body.position.x, y: p.y - it.body.position.y },
      stiffness: 0.18, damping: 0.08, length: 0
    });
    Composite.add(engine.world, drag);
    el.classList.add('dragging');
    try{ el.setPointerCapture(e.pointerId); }catch(err){}
  });
  box.addEventListener('pointermove', function(e){
    if(drag) drag.pointA = local(e);
  });
  function release(){
    if(!drag) return;
    Composite.remove(engine.world, drag);
    dragItem.el.classList.remove('dragging');
    drag = null; dragItem = null;
  }
  box.addEventListener('pointerup', release);
  box.addEventListener('pointercancel', release);
  box.addEventListener('lostpointercapture', release);

  /* ---------- lifecycle ---------- */
  new IntersectionObserver(function(entries){
    entries.forEach(function(e){
      visible = e.isIntersecting;
      if(visible && !started) start();
    });
  }, { threshold: 0.3 }).observe(box);

  var resizeTimer;
  window.addEventListener('resize', function(){
    if(!started) return;
    clearTimeout(resizeTimer);
    resizeTimer = setTimeout(function(){
      W = box.clientWidth; H = box.clientHeight;
      buildWalls();
      items.forEach(function(it){
        var p = it.body.position;
        Body.setPosition(it.body, { x: Math.max(it.w / 2, Math.min(W - it.w / 2, p.x)), y: Math.min(p.y, H - it.h) });
      });
    }, 150);
  });
})();
