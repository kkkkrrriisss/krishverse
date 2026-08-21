(function(){
  var reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  var ICON_LEFT = '<svg viewBox="0 0 24 24"><path d="M15 18l-6-6 6-6"/></svg>';
  var ICON_RIGHT = '<svg viewBox="0 0 24 24"><path d="M9 18l6-6-6-6"/></svg>';

  /* ---------- data ---------- */
  var WORK = [
    { cat:"E-commerce & DTC", desc:"Shopify and WooCommerce storefronts built for conversion.", items:[
      {name:"Reigning Champ", url:"https://reigningchamp.com/", tag:"Shopify", note:"Athletic apparel"},
      {name:"Lorna Jane", url:"https://www.lornajane.com.au/", tag:"Shopify", note:"Activewear"},
      {name:"Peppersmith", url:"https://peppersmith.co.uk/", tag:"Shopify"},
      {name:"Shop Tantrum", url:"https://shoptantrum.com/", tag:"Shopify"},
      {name:"Eames NW", url:"https://eamesnw.com/", tag:"Shopify"},
      {name:"Kaleido Jewellery", url:"https://www.kaleidojewellery.com/", tag:"Shopify"},
      {name:"Coffee Foundation", url:"https://www.coffeefoundation.com/", tag:"WooCommerce"},
      {name:"Beyond the Surface", url:"https://beyondthesurfaceaesthetics.com/", tag:"WooCommerce", dual:"+ GHL", note:"Aesthetics clinic"}
    ]},
    { cat:"Custom & Enterprise Builds", desc:"React, PHP, and full-stack work for larger, data-heavier platforms.", items:[
      {name:"Schaerer", url:"https://www.schaerer.com/", tag:"React / PHP", note:"Coffee-machine manufacturer"},
      {name:"Mont-Fort", url:"https://mont-fort.com/", tag:"React / PHP"},
      {name:"Arternal", url:"https://arternal.com/", tag:"React / PHP"},
      {name:"HouseCanary", url:"https://www.housecanary.com/", tag:"WordPress"},
      {name:"SmartLoving", url:"https://smartloving.org/", tag:"Full-Stack"}
    ]},
    { cat:"Marketing & Automation", desc:"GoHighLevel builds and workflow automation behind the scenes.", items:[
      {name:"Henit", url:"https://www.henit.ie/", tag:"GoHighLevel"},
      {name:"Sharp Brains", url:"https://sharpbrains.co.uk/", tag:"GoHighLevel"},
      {name:"Zignagenix", url:"https://zignagenix.com/", tag:"GoHighLevel"},
      {name:"Beyond the Surface", url:"https://beyondthesurfaceaesthetics.com/", tag:"GoHighLevel", dual:"+ WooCommerce", note:"Aesthetics clinic"}
    ]},
    { cat:"Brand & Lifestyle Sites", desc:"WordPress, Wix, and Squarespace builds for independent brands.", items:[
      {name:"Jacada Travel", url:"https://www.jacadatravel.com/", tag:"WordPress", note:"Luxury travel"},
      {name:"JaBistro", url:"https://jabistro.com/", tag:"WordPress", note:"Restaurant"},
      {name:"My Kids Lick The Bowl", url:"https://mykidslickthebowl.com/", tag:"WordPress"},
      {name:"Norm CPH", url:"https://normcph.com/", tag:"WordPress"},
      {name:"The Altitude Marketing", url:"https://thealtitudemarketing.co.uk/", tag:"WordPress"},
      {name:"Window Tinting A Plus", url:"https://www.windowtintingaplus.com/", tag:"Wix", note:"Auto window tinting"},
      {name:"Cafe Bon Bouquet", url:"https://www.cafebonbouquet.com/", tag:"Wix"},
      {name:"Autodelta", url:"https://www.autodelta.co.uk/", tag:"Wix"},
      {name:"Rachel Balmforth", url:"https://rachelbalmforth.com/", tag:"Squarespace"},
      {name:"The Sorry Girls", url:"https://www.thesorrygirls.com/", tag:"Squarespace"},
      {name:"Sanara Collective", url:"https://www.sanaracollective.com/", tag:"Squarespace"},
      {name:"Cavana SF", url:"https://www.cavanasf.com/", tag:"Squarespace"}
    ]}
  ];
  var FEATURED = ["Reigning Champ","Schaerer","Jacada Travel","Beyond the Surface","Lorna Jane","Henit"];

  var TIMELINE = [
    {range:"2015 – 2016", role:"PHP Developer", org:"Infinity Infoway", loc:"Rajkot, India", note:"Dynamic web applications in PHP, MySQL, HTML, CSS & jQuery."},
    {range:"2016 – 2018", role:"Full Stack Developer", org:"Workerv", loc:"Remote", note:"Full-time freelance for international clients — PHP, JS, Bootstrap, REST APIs."},
    {range:"2018 – 2019", role:"Web Developer", org:"Freelance Projects", loc:"Remote", note:"Small business & eCommerce builds, SEO-friendly, full project lifecycle."},
    {range:"2019 – 2022", role:"Full Stack Developer", org:"Cypherox Technologies", loc:"Ahmedabad, India", note:"Multiple concurrent client projects — WordPress & Shopify, API integrations."},
    {range:"2022 – Present", role:"Web & Marketing Specialist", org:"Freelance Projects", loc:"Remote", note:"Web builds, SEO strategy & marketing campaigns for global clients."}
  ];

  var PHASES = [
    {n:"01", name:"Understand", desc:"Research, competitor analysis, GA4 & Search Console — before a single page gets built.", tools:["GA4","Looker Studio","GTM","Search Console","Competitor Analysis","Market Research"]},
    {n:"02", name:"Build", desc:"WordPress, Shopify, Squarespace, Wix, or straight React/PHP — whatever the project actually needs.", tools:["WordPress","Shopify","WooCommerce","React","PHP","JavaScript","Figma","Adobe Suite"]},
    {n:"03", name:"Optimize", desc:"SEO, CRO, performance, hosting — the unglamorous work that makes the build actually perform.", tools:["On-Page SEO","SEMrush","Ahrefs","PageSpeed Insights","CRO","WP Engine","Cloudflare"]},
    {n:"04", name:"Grow", desc:"Paid campaigns, automation, AI-assisted workflows — turning a finished site into a running system.", tools:["Google Ads","Meta Ads","HubSpot","GoHighLevel","Zapier","n8n","ChatGPT","Make.com"]}
  ];

  var GLOW = [['var(--pink)','var(--violet)'],['var(--indigo)','var(--cyan)'],['var(--violet)','var(--pink)'],['var(--cyan)','var(--indigo)']];

  function domainOf(url){ return url.replace(/^https?:\/\//,'').replace(/\/$/,''); }

  function workCardHTML(it, idx){
    var glow = GLOW[idx % GLOW.length];
    return '<a class="work-card" style="--glow-a:'+glow[0]+';--glow-b:'+glow[1]+'" href="'+it.url+'" target="_blank" rel="noopener">'+
      (it.dual ? '<span class="dual-badge">'+it.dual+'</span>' : '') +
      '<span class="platform">'+it.tag+'</span>'+
      '<div class="bottom"><h3>'+it.name+'</h3>'+(it.note ? '<p>'+it.note+'</p>' : '')+'<span class="go">'+domainOf(it.url)+' &rarr;</span></div>'+
    '</a>';
  }
  function sliderNav(){
    return '<div class="slider-nav"><button class="slider-btn prev" aria-label="Previous">'+ICON_LEFT+'</button><button class="slider-btn next" aria-label="Next">'+ICON_RIGHT+'</button></div>';
  }

  /* ---------- render: home featured work ---------- */
  var homeWorkTrack = document.getElementById('homeWorkTrack');
  if(homeWorkTrack){
    var all = [];
    WORK.forEach(function(cat){ cat.items.forEach(function(it){ all.push(it); }); });
    var featured = FEATURED.map(function(name){ return all.filter(function(it){ return it.name === name; })[0]; }).filter(Boolean);
    homeWorkTrack.innerHTML = featured.map(workCardHTML).join('');
  }

  /* ---------- render: work page ---------- */
  var workCategories = document.getElementById('workCategories');
  if(workCategories){
    workCategories.innerHTML = WORK.map(function(cat, ci){
      var cards = cat.items.map(function(it, ii){ return workCardHTML(it, ci + ii); }).join('');
      return '<div class="work-cat reveal">'+
        '<div class="work-cat-head"><h3>'+cat.cat+'</h3><p>'+cat.desc+'</p></div>'+
        '<div class="slider"><div class="slider-track">'+cards+'</div>'+sliderNav()+'</div>'+
      '</div>';
    }).join('');
  }

  /* ---------- render: about timeline ---------- */
  var timelineTrack = document.getElementById('timelineTrack');
  if(timelineTrack){
    timelineTrack.innerHTML = TIMELINE.map(function(t){
      return '<div class="timeline-card">'+
        '<div class="timeline-range">'+t.range+'</div>'+
        '<h3>'+t.role+'</h3>'+
        '<div class="timeline-org">'+t.org+' &middot; '+t.loc+'</div>'+
        '<p class="tl-note">'+t.note+'</p>'+
      '</div>';
    }).join('');
  }

  /* ---------- render: capability phases ---------- */
  var phaseTrack = document.getElementById('phaseTrack');
  if(phaseTrack){
    phaseTrack.innerHTML = PHASES.map(function(p){
      var chips = p.tools.map(function(t){ return '<span class="tool-chip">'+t+'</span>'; }).join('');
      return '<div class="phase-panel">'+
        '<p class="pi-label">'+p.n+'</p>'+
        '<h3>'+p.name+'</h3>'+
        '<p>'+p.desc+'</p>'+
        '<div class="tool-row">'+chips+'</div>'+
      '</div>';
    }).join('');
  }

  /* ---------- fill any slider arrow buttons missing their icon ---------- */
  function fillMissingSliderIcons(){
    document.querySelectorAll('.slider-btn.prev').forEach(function(b){ if(!b.querySelector('svg')) b.innerHTML = ICON_LEFT; });
    document.querySelectorAll('.slider-btn.next').forEach(function(b){ if(!b.querySelector('svg')) b.innerHTML = ICON_RIGHT; });
  }

  /* ---------- sliders (drag + buttons) ---------- */
  function animateScroll(el, delta){
    var start = el.scrollLeft;
    var target = Math.max(0, Math.min(el.scrollWidth - el.clientWidth, start + delta));
    if(reduce){ el.scrollLeft = target; return; }
    var startTime = null, duration = 420;
    function ease(t){ return 1 - Math.pow(1 - t, 3); }
    function frame(ts){
      if(startTime === null) startTime = ts;
      var p = Math.min(1, (ts - startTime) / duration);
      el.scrollLeft = start + (target - start) * ease(p);
      if(p < 1) requestAnimationFrame(frame);
    }
    requestAnimationFrame(frame);
  }
  function wireSliders(){
    document.querySelectorAll('.slider').forEach(function(sl){
      if(sl.dataset.wired) return;
      sl.dataset.wired = '1';
      var track = sl.querySelector('.slider-track');
      var prev = sl.querySelector('.slider-btn.prev');
      var next = sl.querySelector('.slider-btn.next');
      function update(){
        if(prev) prev.disabled = track.scrollLeft < 8;
        if(next) next.disabled = track.scrollLeft > track.scrollWidth - track.clientWidth - 8;
      }
      if(prev) prev.addEventListener('click', function(){ animateScroll(track, -track.clientWidth*0.82); });
      if(next) next.addEventListener('click', function(){ animateScroll(track, track.clientWidth*0.82); });
      track.addEventListener('scroll', update, {passive:true});
      window.addEventListener('resize', update);
      update();

      var isDown = false, startX = 0, startScroll = 0, moved = false;
      track.addEventListener('pointerdown', function(e){
        if(e.pointerType === 'mouse' && e.button !== 0) return;
        isDown = true; moved = false;
        try{ track.setPointerCapture(e.pointerId); }catch(err){}
        startX = e.clientX; startScroll = track.scrollLeft;
      });
      track.addEventListener('pointermove', function(e){
        if(!isDown) return;
        var dx = e.clientX - startX;
        if(Math.abs(dx) > 4) moved = true;
        track.scrollLeft = startScroll - dx;
      });
      function endDrag(){ isDown = false; }
      track.addEventListener('pointerup', endDrag);
      track.addEventListener('pointercancel', endDrag);
      track.addEventListener('pointerleave', endDrag);
      track.addEventListener('click', function(e){ if(moved){ e.preventDefault(); e.stopPropagation(); } }, true);
    });
  }

  /* ---------- capability map hover: brighten connector lines ---------- */
  function wireCapMap(){
    var lines = document.querySelector('.cap-lines');
    document.querySelectorAll('.cap-node').forEach(function(node){
      node.addEventListener('mouseenter', function(){ if(lines) lines.classList.add('boost'); });
      node.addEventListener('mouseleave', function(){ if(lines) lines.classList.remove('boost'); });
    });
  }

  /* ---------- magnetic buttons ---------- */
  function wireMagnetic(){
    if(reduce) return;
    document.querySelectorAll('.btn-solid').forEach(function(btn){
      btn.addEventListener('mousemove', function(e){
        var r = btn.getBoundingClientRect();
        var mx = (e.clientX - r.left) / r.width - 0.5;
        var my = (e.clientY - r.top) / r.height - 0.5;
        btn.style.transform = 'translate(' + (mx*10) + 'px,' + (my*8) + 'px)';
      });
      btn.addEventListener('mouseleave', function(){ btn.style.transform = ''; });
    });
  }

  /* ---------- floating stars: sprinkle every section with ambient twinkling dots ---------- */
  function ensureFloaters(el){
    var f = el.querySelector(':scope > .floaters');
    if(!f){
      f = document.createElement('div');
      f.className = 'floaters';
      f.setAttribute('aria-hidden','true');
      el.insertBefore(f, el.firstChild);
    }
    return f;
  }
  function sprinkleStars(){
    var colors = ['var(--indigo)','var(--violet)','var(--pink)','var(--cyan)'];
    document.querySelectorAll('.hero, .page-hero, main.page > section').forEach(function(el){
      var f = ensureFloaters(el);
      var count = 6 + Math.floor(Math.random()*5);
      for(var i=0;i<count;i++){
        var star = document.createElement('span');
        star.className = 'floater star';
        var size = (Math.random()*2.6 + 1.3).toFixed(1);
        star.style.width = size+'px'; star.style.height = size+'px';
        star.style.top = (Math.random()*88 + 4).toFixed(1)+'%';
        star.style.left = (Math.random()*92 + 3).toFixed(1)+'%';
        star.style.setProperty('--fc-a', colors[(i + el.childElementCount) % colors.length]);
        if(!reduce){
          star.style.animationDuration = (3 + Math.random()*3.5).toFixed(1)+'s';
          star.style.animationDelay = '-' + (Math.random()*4).toFixed(1)+'s';
        }
        f.appendChild(star);
      }
    });
  }

  /* ---------- custom cursor + sparkle trail ---------- */
  function initCosmicCursor(){
    if(reduce) return;
    if(!window.matchMedia('(hover:hover) and (pointer:fine)').matches) return;
    document.body.classList.add('custom-cursor');
    var dot = document.createElement('div');
    dot.id = 'cursorDot';
    document.body.appendChild(dot);

    var px=0, py=0, tx=0, ty=0, started=false;
    function raf(){
      px += (tx-px)*0.35; py += (ty-py)*0.35;
      dot.style.transform = 'translate(' + px + 'px,' + py + 'px) translate(-50%,-50%)';
      requestAnimationFrame(raf);
    }
    requestAnimationFrame(raf);

    var sparkColors = ['var(--indigo)','var(--violet)','var(--pink)','var(--cyan)'];
    var lastSpark = 0;
    function spawnSparkle(x,y){
      var s = document.createElement('span');
      s.className = 'sparkle';
      s.style.left = x+'px'; s.style.top = y+'px';
      s.style.setProperty('--sc', sparkColors[Math.floor(Math.random()*sparkColors.length)]);
      s.style.marginLeft = (Math.random()*10-5).toFixed(1)+'px';
      document.body.appendChild(s);
      s.addEventListener('animationend', function(){ s.remove(); });
    }

    window.addEventListener('mousemove', function(e){
      tx = e.clientX; ty = e.clientY;
      if(!started){ px = tx; py = ty; started = true; }
      dot.classList.add('active');
      var now = performance.now();
      if(now - lastSpark > 55){
        lastSpark = now;
        spawnSparkle(e.clientX, e.clientY);
      }
    });
    window.addEventListener('mousedown', function(){ dot.classList.add('pressed'); });
    window.addEventListener('mouseup', function(){ dot.classList.remove('pressed'); });
    document.documentElement.addEventListener('mouseleave', function(){ dot.classList.remove('active'); });
  }

  /* ---------- reveal on scroll ---------- */
  function initReveal(){
    var els = document.querySelectorAll('.reveal');
    if('IntersectionObserver' in window && !reduce){
      var io = new IntersectionObserver(function(entries){
        entries.forEach(function(e){ if(e.isIntersecting){ e.target.classList.add('in'); io.unobserve(e.target); } });
      }, {threshold:0.1});
      els.forEach(function(el){ io.observe(el); });
    } else {
      els.forEach(function(el){ el.classList.add('in'); });
    }
  }

  /* ---------- nav active page ---------- */
  (function(){
    var page = document.body.dataset.page || 'home';
    document.querySelectorAll('[data-route]').forEach(function(a){
      if(a.dataset.route === page) a.setAttribute('aria-current','page'); else a.removeAttribute('aria-current');
    });
  })();

  /* ---------- neural network canvas ---------- */
  var canvas = document.getElementById('neuralCanvas');
  if(canvas){
    var ctx = canvas.getContext('2d');
    var W, H, DPR, particles = [];
    function colors(){
      var s = getComputedStyle(document.documentElement);
      return { a: s.getPropertyValue('--indigo').trim(), c: s.getPropertyValue('--pink').trim() };
    }
    function resizeCanvas(){
      DPR = Math.min(window.devicePixelRatio || 1, 2);
      W = window.innerWidth + 24; H = window.innerHeight + 24;
      canvas.width = W * DPR; canvas.height = H * DPR;
      canvas.style.width = W + 'px'; canvas.style.height = H + 'px';
      ctx.setTransform(DPR,0,0,DPR,0,0);
      var n = Math.max(26, Math.min(72, Math.round((W*H)/24000)));
      particles = [];
      for(var i=0;i<n;i++){
        particles.push({
          x: Math.random()*W, y: Math.random()*H,
          vx: (Math.random()-0.5)*0.1, vy: (Math.random()-0.5)*0.1,
          hub: Math.random() < 0.1
        });
      }
    }
    function drawFrame(){
      var col = colors();
      ctx.clearRect(0,0,W,H);
      if(!reduce){
        particles.forEach(function(p){
          p.x += p.vx; p.y += p.vy;
          if(p.x < -20) p.x = W+20; if(p.x > W+20) p.x = -20;
          if(p.y < -20) p.y = H+20; if(p.y > H+20) p.y = -20;
        });
      }
      var maxDist = Math.min(190, W*0.16);
      for(var i=0;i<particles.length;i++){
        for(var j=i+1;j<particles.length;j++){
          var a = particles[i], b = particles[j];
          var dx = a.x-b.x, dy = a.y-b.y;
          var d = Math.sqrt(dx*dx+dy*dy);
          if(d < maxDist){
            ctx.strokeStyle = col.a;
            ctx.globalAlpha = (1 - d/maxDist) * 0.2;
            ctx.lineWidth = 1;
            ctx.beginPath(); ctx.moveTo(a.x,a.y); ctx.lineTo(b.x,b.y); ctx.stroke();
          }
        }
      }
      particles.forEach(function(p){
        ctx.beginPath();
        ctx.fillStyle = p.hub ? col.c : col.a;
        ctx.globalAlpha = p.hub ? 0.55 : 0.3;
        ctx.arc(p.x,p.y, p.hub?2.8:1.4, 0, Math.PI*2);
        ctx.fill();
      });
      ctx.globalAlpha = 1;
      if(!reduce) requestAnimationFrame(drawFrame);
    }
    window.addEventListener('resize', resizeCanvas);
    resizeCanvas();
    drawFrame();

    if(!reduce){
      window.addEventListener('mousemove', function(e){
        var nx = (e.clientX / window.innerWidth - 0.5) * 12;
        var ny = (e.clientY / window.innerHeight - 0.5) * 10;
        canvas.style.transform = 'translate(' + nx.toFixed(1) + 'px,' + ny.toFixed(1) + 'px)';
      });
    }
  }

  fillMissingSliderIcons();
  sprinkleStars();
  initReveal();
  wireSliders();
  wireCapMap();
  wireMagnetic();
  initCosmicCursor();
})();
