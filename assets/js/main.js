(function () {
  'use strict';

  /* ---- SETTINGS ---- */
  var NEXT_DROP = new Date('2026-11-21T12:00:00-05:00'); // placeholder date for Drop 002
  var SIZES = { headwear: ['OS'], accessories: ['OS'], _: ['S', 'M', 'L', 'XL', 'XXL'] };
  // false = only real products and lookbook shots are shown (placeholders stay in the data for later)
  var SHOW_PLACEHOLDERS = false;
  // checkout and payment happen on the brand's Shopify store
  var SHOPIFY_STORE = 'https://fukusouonline.myshopify.com';

  var PRODUCTS = (window.FUKUSOU_PRODUCTS || []).filter(function (p) { return SHOW_PLACEHOLDERS || !p.placeholder; });
  var $ = function (s, r) { return (r || document).querySelector(s); };
  var $$ = function (s, r) { return Array.prototype.slice.call((r || document).querySelectorAll(s)); };

  /* ---- garment silhouettes for placeholder tiles ---- */
  var SHAPES = {
    tee: '<path d="M70 30L50 36L20 62L38 86L56 74V176H144V74L162 86L180 62L150 36L130 30Q100 52 70 30Z"/>',
    longsleeve: '<path d="M70 30L50 36L30 100L18 168L40 172L56 104V176H144V104L160 172L182 168L170 100L150 36L130 30Q100 52 70 30Z"/>',
    hoodie: '<path d="M72 34Q100 4 128 34L156 44L182 124L160 132L146 90V178H54V90L40 132L18 124L44 44Z"/><path d="M76 132H124V160H76Z" fill="none"/>',
    pants: '<path d="M60 20H140L152 182H112L100 72L88 182H48Z"/>',
    cap: '<path d="M44 120Q44 52 104 52Q160 52 160 120Z"/><path d="M44 120H184Q182 138 156 138H44Z"/>',
    tote: '<path d="M50 80H150L158 180H42Z"/><path d="M76 80Q76 34 100 34Q124 34 124 80" fill="none" stroke-width="8"/>'
  };
  function svgShape(name) { return '<svg viewBox="0 0 200 200" aria-hidden="true">' + (SHAPES[name] || SHAPES.tee) + '</svg>'; }
  function money(n) { return n == null ? 'PRICE TBD' : '$' + n; }
  function priceOr(p, fallback) { return p.price == null ? fallback : p.price; }

  function mediaHTML(p, withLabels) {
    if (p.img) {
      return '<img src="' + p.img + '" alt="' + p.name + '" loading="lazy">' +
        (p.imgBack ? '<img class="back" src="' + p.imgBack + '" alt="" loading="lazy">' : '');
    }
    return '<div class="ph-stripes"></div>' +
      '<div class="ph ph-front">' + svgShape(p.shape) + '</div>' +
      '<div class="ph ph-back">' + svgShape(p.shape) + '</div>' +
      (withLabels ? '<span class="ph-label">PLACEHOLDER</span><div class="ph-x"><span>PHOTO SOON</span></div>' : '');
  }

  /* ---- shop grid ---- */
  var state = { cat: 'all', sort: 'featured', hideSold: false };
  var grid = $('#grid');

  function render() {
    var list = PRODUCTS.filter(function (p) {
      return (state.cat === 'all' || p.cat === state.cat) && !(state.hideSold && p.soldOut);
    });
    if (state.sort === 'low') list.sort(function (a, b) { return priceOr(a, Infinity) - priceOr(b, Infinity); });
    if (state.sort === 'high') list.sort(function (a, b) { return priceOr(b, -1) - priceOr(a, -1); });
    if (state.sort === 'az') list.sort(function (a, b) { return a.name.localeCompare(b.name); });

    grid.innerHTML = list.map(function (p, i) {
      return '<article class="tile' + (p.soldOut ? ' is-sold' : '') + '" data-id="' + p.id + '" tabindex="0" style="animation-delay:' + (i * 40) + 'ms">' +
        '<div class="tile-media">' + mediaHTML(p, p.placeholder) +
        (p.soldOut ? '<span class="sold">SOLD OUT</span>' : '') +
        '<div class="qv">QUICK VIEW</div></div>' +
        '<div class="tile-info"><div><b>' + p.name + '</b><small>' + p.colorway + '</small></div><span>' + (p.soldOut ? '<s class="dim">' + money(p.price) + '</s>' : money(p.price)) + '</span></div>' +
        '<span class="tile-num">' + String(i + 1).padStart(2, '0') + '</span>' +
        '</article>';
    }).join('');
    $('#empty').hidden = list.length > 0;
    grid.hidden = list.length === 0;
  }

  function setCat(cat) {
    state.cat = cat;
    $$('#chips .chip').forEach(function (c) { c.classList.toggle('on', c.dataset.cat === cat); });
    $$('#shopDD .dd-menu a').forEach(function (a) { a.classList.toggle('on', a.dataset.cat === cat); });
    render();
  }

  // category counts in the MENU dropdown; categories with nothing in them are hidden everywhere
  ['all', 'outerwear', 'tees', 'hoodies', 'bottoms', 'headwear', 'accessories'].forEach(function (c) {
    var n = PRODUCTS.filter(function (p) { return c === 'all' || p.cat === c; }).length;
    var el = $('#count-' + c);
    if (el) el.textContent = n;
    if (c !== 'all' && n === 0) $$('[data-cat="' + c + '"]').forEach(function (x) { x.hidden = true; });
  });
  // filters and sorting only earn their space once there are a few pieces
  if (PRODUCTS.length < 4) { $('#chips').hidden = true; $('.shop-tools').hidden = true; }

  $$('#chips .chip').forEach(function (c) { c.addEventListener('click', function () { setCat(c.dataset.cat); }); });
  $$('[data-cat]').forEach(function (a) {
    if (a.classList.contains('chip')) return;
    a.addEventListener('click', function () { setCat(a.dataset.cat); closeAllDD(); closeMobile(); });
  });
  $('#hideSold').addEventListener('change', function (e) { state.hideSold = e.target.checked; render(); });

  /* ---- dropdowns ---- */
  function closeAllDD(except) {
    $$('.dd').forEach(function (d) { if (d !== except) { d.classList.remove('open'); $('.dd-btn', d).setAttribute('aria-expanded', 'false'); } });
  }
  $$('.dd').forEach(function (dd) {
    var btn = $('.dd-btn', dd);
    btn.addEventListener('click', function (e) {
      e.stopPropagation();
      var open = !dd.classList.contains('open');
      closeAllDD(dd);
      dd.classList.toggle('open', open);
      btn.setAttribute('aria-expanded', String(open));
    });
    if (window.matchMedia('(hover:hover)').matches && dd.id === 'shopDD') {
      var t;
      dd.addEventListener('mouseenter', function () { clearTimeout(t); closeAllDD(dd); dd.classList.add('open'); btn.setAttribute('aria-expanded', 'true'); });
      dd.addEventListener('mouseleave', function () { t = setTimeout(function () { dd.classList.remove('open'); btn.setAttribute('aria-expanded', 'false'); }, 180); });
    }
  });
  document.addEventListener('click', function () { closeAllDD(); });
  $$('#sortDD .dd-menu a').forEach(function (a) {
    a.addEventListener('click', function (e) {
      e.preventDefault();
      state.sort = a.dataset.sort;
      $('#sortLabel').textContent = a.textContent;
      $$('#sortDD .dd-menu a').forEach(function (x) { x.classList.toggle('on', x === a); });
      closeAllDD();
      render();
    });
  });

  /* the MENU dropdown doubles as the mobile menu */
  function closeMobile() {}

  /* ---- quick view ---- */
  var modal = $('#modal'), current = null, size = null;
  function openModal(id) {
    var p = PRODUCTS.find(function (x) { return x.id === id; });
    if (!p) return;
    current = p; size = null;
    $('#mMedia').innerHTML = mediaHTML(p, p.placeholder) + (p.soldOut ? '<span class="sold">SOLD OUT</span>' : '');
    $('#mDrop').textContent = 'DROP ' + p.drop + ' — ' + p.cat.toUpperCase();
    $('#mName').textContent = p.name;
    $('#mPrice').textContent = money(p.price);
    $('#mColor').textContent = 'COLORWAY: ' + p.colorway;
    var sizes = SIZES[p.cat] || SIZES._;
    $('#mSizes').innerHTML = sizes.map(function (s) { return '<button type="button" ' + (p.soldOut ? 'disabled' : '') + '>' + s + '</button>'; }).join('');
    if (sizes.length === 1 && !p.soldOut) { size = sizes[0]; $('#mSizes button').classList.add('on'); }
    var add = $('#mAdd');
    add.disabled = p.soldOut || p.price == null;
    add.textContent = p.soldOut ? 'SOLD OUT' : p.price == null ? 'COMING SOON' : 'ADD TO CART';
    $('.m-desc').hidden = !p.placeholder;
    modal.classList.add('open'); modal.setAttribute('aria-hidden', 'false');
    document.body.style.overflow = 'hidden';
  }
  function closeModal() { modal.classList.remove('open'); modal.setAttribute('aria-hidden', 'true'); document.body.style.overflow = ''; }
  grid.addEventListener('click', function (e) {
    var t = e.target.closest('.tile'); if (t) openModal(+t.dataset.id);
  });
  grid.addEventListener('keydown', function (e) {
    var t = e.target.closest('.tile'); if (t && (e.key === 'Enter' || e.key === ' ')) { e.preventDefault(); openModal(+t.dataset.id); }
  });
  $$('[data-close]').forEach(function (b) { b.addEventListener('click', closeModal); });
  $('#mSizes').addEventListener('click', function (e) {
    var b = e.target.closest('button'); if (!b || b.disabled) return;
    $$('#mSizes button').forEach(function (x) { x.classList.remove('on'); });
    b.classList.add('on'); size = b.textContent;
  });
  $('#mAdd').addEventListener('click', function () {
    if (!current || current.soldOut || current.price == null) return;
    if (!size) { toast('PICK A SIZE'); return; }
    addToCart(current.id, size);
    closeModal();
    toast(current.name + ' (' + size + ') ADDED');
  });

  /* ---- cart ---- */
  var cart = [];
  try { cart = JSON.parse(localStorage.getItem('fukusou-cart') || '[]'); } catch (e) { cart = []; }
  function saveCart() { try { localStorage.setItem('fukusou-cart', JSON.stringify(cart)); } catch (e) {} }
  function addToCart(id, sz) {
    var line = cart.find(function (l) { return l.id === id && l.size === sz; });
    if (line) line.qty++; else cart.push({ id: id, size: sz, qty: 1 });
    saveCart(); renderCart(); bump();
  }
  function bump() {
    var c = $('#cartBtn'); c.animate([{ transform: 'scale(1)' }, { transform: 'scale(1.25)', color: '#e10600' }, { transform: 'scale(1)' }], { duration: 400 });
  }
  function renderCart() {
    cart = cart.filter(function (l) { return PRODUCTS.some(function (p) { return p.id === l.id; }) && l.qty > 0; });
    var count = 0, total = 0;
    $('#cartItems').innerHTML = cart.length ? cart.map(function (l, i) {
      var p = PRODUCTS.find(function (x) { return x.id === l.id; });
      count += l.qty; total += l.qty * p.price;
      return '<div class="ci"><div class="ci-thumb">' + (p.img ? '<img src="' + p.img + '" alt="">' : svgShape(p.shape)) + '</div>' +
        '<div><b>' + p.name + '</b><small>' + l.size + ' / ' + p.colorway + '</small>' +
        '<div class="ci-qty"><button data-q="-1" data-i="' + i + '" aria-label="Less">−</button>' + l.qty + '<button data-q="1" data-i="' + i + '" aria-label="More">+</button></div></div>' +
        '<div style="text-align:right"><b>' + money(p.price * l.qty) + '</b><button class="ci-rm" data-rm="' + i + '">REMOVE</button></div></div>';
    }).join('') : '<p class="cart-empty">CART\'S EMPTY.<br><br>GO GET SOMETHING.</p>';
    $('#cartCount').textContent = count;
    $('#cartTotal').textContent = money(total);
  }
  $('#cartItems').addEventListener('click', function (e) {
    var q = e.target.closest('[data-q]'), rm = e.target.closest('[data-rm]');
    if (q) { cart[+q.dataset.i].qty += +q.dataset.q; }
    else if (rm) { cart.splice(+rm.dataset.rm, 1); }
    else return;
    saveCart(); renderCart();
  });
  var cartEl = $('#cart');
  function openCart() { cartEl.classList.add('open'); cartEl.setAttribute('aria-hidden', 'false'); }
  function closeCart() { cartEl.classList.remove('open'); cartEl.setAttribute('aria-hidden', 'true'); }
  $('#cartBtn').addEventListener('click', openCart);
  $$('[data-cclose]').forEach(function (b) { b.addEventListener('click', closeCart); });
  // Shopify cart permalink: /cart/<variantId>:<qty>,... drops the shopper straight into Shopify checkout
  function shopifyCheckoutUrl() {
    var parts = [];
    for (var i = 0; i < cart.length; i++) {
      var l = cart[i], p = PRODUCTS.find(function (x) { return x.id === l.id; });
      var vid = p && p.shopify && p.shopify.variants && p.shopify.variants[l.size];
      if (!vid) return null;
      parts.push(vid + ':' + l.qty);
    }
    return parts.length ? SHOPIFY_STORE + '/cart/' + parts.join(',') : null;
  }
  $('#checkout').addEventListener('click', function () {
    if (!cart.length) { toast('CART IS EMPTY'); return; }
    var url = shopifyCheckoutUrl();
    if (url) window.location.href = url;
    else toast('CHECKOUT OPENS WHEN THE STORE LAUNCHES');
  });
  document.addEventListener('keydown', function (e) { if (e.key === 'Escape') { closeModal(); closeCart(); closeAllDD(); closeMobile(); } });

  /* ---- toast ---- */
  var tt;
  function toast(msg) { var t = $('#toast'); t.textContent = msg; t.classList.add('show'); clearTimeout(tt); tt = setTimeout(function () { t.classList.remove('show'); }, 2200); }

  /* ---- countdown ---- */
  function pad(n) { return String(n).padStart(2, '0'); }
  function tick() {
    var d = Math.max(0, NEXT_DROP - new Date());
    var s = Math.floor(d / 1000);
    $('#cdD').textContent = pad(Math.floor(s / 86400));
    $('#cdH').textContent = pad(Math.floor(s % 86400 / 3600));
    $('#cdM').textContent = pad(Math.floor(s % 3600 / 60));
    $('#cdS').textContent = pad(s % 60);
  }
  tick(); setInterval(tick, 1000);

  /* ---- lookbook ---- */
  // add real lookbook shots by setting img, e.g. { label: 'ZIP / CARGO', img: 'assets/lookbook/look-01.webp' }
  var LOOKS = [
    { label: 'HOODIE / CARGO', img: null }, { label: 'TEE / WIDE PANT', img: null }, { label: 'L/S / CAP', img: null },
    { label: 'ZIP / CARGO', img: null }, { label: 'TEE / TOTE', img: null }, { label: 'FULL FIT', img: null }
  ].filter(function (l) { return SHOW_PLACEHOLDERS || l.img; });
  var strip = $('#lbStrip');
  strip.innerHTML = LOOKS.map(function (l, i) {
    return '<figure class="look">' +
      (l.img ? '<img src="' + l.img + '" alt="Look ' + pad(i + 1) + ': ' + l.label + '" loading="lazy">' : '<div class="ph-stripes"></div><div class="look-figure"></div>') +
      '<span class="look-n">' + pad(i + 1) + '</span>' +
      '<figcaption class="look-cap"><span>' + l.label + '</span>' + (l.img ? '' : '<b>PLACEHOLDER</b>') + '</figcaption></figure>';
  }).join('');
  // no real lookbook shots yet: hide the section and every link to it
  if (!LOOKS.length) {
    $('#lookbook').hidden = true;
    $$('a[href="#lookbook"]').forEach(function (a) { a.hidden = true; });
  }
  var down = false, sx = 0, sl = 0, moved = false;
  strip.addEventListener('mousedown', function (e) { down = true; moved = false; sx = e.pageX; sl = strip.scrollLeft; strip.classList.add('drag'); });
  window.addEventListener('mouseup', function () { down = false; strip.classList.remove('drag'); });
  window.addEventListener('mousemove', function (e) { if (!down) return; var dx = e.pageX - sx; if (Math.abs(dx) > 3) moved = true; strip.scrollLeft = sl - dx; });

  /* ---- sign up (no backend yet) ---- */
  $('#listForm').addEventListener('submit', function (e) {
    e.preventDefault();
    var v = $('#listEmail').value.trim();
    var msg = $('#listMsg');
    var isEmail = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v), isPhone = /^\+?[\d\s().-]{7,}$/.test(v);
    if (!isEmail && !isPhone) { msg.textContent = 'ENTER A VALID EMAIL OR PHONE NUMBER'; return; }
    msg.textContent = "YOU'RE ON THE LIST. (PREVIEW — SIGNUPS AREN'T SAVED YET)";
    $('#listEmail').value = '';
  });

  /* ---- spinning 3D logo: stacked copies give the chrome letters depth ---- */
  $$('.logo3d-spin').forEach(function (spin) {
    for (var z = -9; z <= 9; z += 1) {
      var e = document.createElement('img');
      e.src = 'assets/logo.svg'; e.alt = ''; e.className = 'l3-edge'; e.draggable = false;
      e.setAttribute('aria-hidden', 'true');
      e.style.transform = 'translateZ(' + z + 'px)';
      spin.insertBefore(e, spin.firstChild);
    }
  });

  /* (the opening page runs from its own inline script in index.html, so it never waits on this file) */

  /* ---- jacket 3D model ----
     The cut-out photo's outline is "inflated" into a puffy closed shape:
     a distance-to-edge map gives each point a depth (rounded edges, fuller body),
     the front photo is wrapped on the front surface and the back image on the back,
     and real lights shade the volume as it turns. */
  function loadThree(cb) {
    if (window.THREE) { cb(true); return; }
    var s = document.createElement('script');
    s.src = 'https://cdnjs.cloudflare.com/ajax/libs/three.js/r128/three.min.js';
    s.async = true;
    s.onload = function () { cb(!!window.THREE); };
    s.onerror = function () { cb(false); };
    document.head.appendChild(s);
  }

  function buildJacketModel(stage, canvas) {
    if (!window.THREE) return null;
    var T = window.THREE, renderer;
    try { renderer = new T.WebGLRenderer({ canvas: canvas, antialias: true, alpha: true }); } catch (e) { return null; }
    renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
    renderer.outputEncoding = T.sRGBEncoding;
    renderer.toneMapping = T.NoToneMapping;   // keep the fabric's real colours

    var scene = new T.Scene();
    var camera = new T.PerspectiveCamera(28, 1, 0.1, 50);
    camera.position.set(0, 0.15, 7.2);
    camera.lookAt(0, 0, 0);

    // lights ride with the camera, so whichever side faces the viewer is lit the same way
    scene.add(camera);
    camera.add(new T.HemisphereLight(0xffffff, 0x1c1c1c, 0.45));
    var key = new T.DirectionalLight(0xfff6ec, 0.78); key.position.set(2.5, 3, 4); camera.add(key);
    var fill = new T.DirectionalLight(0xffffff, 0.25); fill.position.set(-4, 1, 2); camera.add(fill);
    var rim = new T.DirectionalLight(0xffffff, 0.45); rim.position.set(0, 3, -6); camera.add(rim);

    var pivot = new T.Group(); scene.add(pivot);    // proportions come from the cut-out image once it loads
    var WIDTH = 3.4, ASPECT = 951 / 1500, HEIGHT = WIDTH * ASPECT, SX = 220, SY = Math.round(SX * ASPECT);

    var loader = new T.TextureLoader();
    function tex(url) { var t = loader.load(url); t.encoding = T.sRGBEncoding; t.anisotropy = 8; return t; }
    // *-tex.png = the cut-outs with the fabric colour grown a few px past the outline (seals the rim)
    var frontTex = tex('assets/products/jacket-front-tex.webp');
    var backTex = tex('assets/products/jacket-back-tex.webp');

    // depth map from the cut-out's alpha
    var img = new Image();
    img.onload = function () {
      ASPECT = img.naturalHeight / img.naturalWidth; HEIGHT = WIDTH * ASPECT; SY = Math.round(SX * ASPECT);
      var c = document.createElement('canvas'); c.width = SX + 1; c.height = SY + 1;
      var g = c.getContext('2d'); g.drawImage(img, 0, 0, c.width, c.height);
      var a = g.getImageData(0, 0, c.width, c.height).data;
      var w = c.width, h = c.height, inside = new Uint8Array(w * h), d = new Float32Array(w * h);
      for (var i = 0; i < w * h; i++) { inside[i] = a[i * 4 + 3] > 110 ? 1 : 0; d[i] = inside[i] ? 1e6 : 0; }
      // two-pass chamfer distance to the outline
      for (var y = 0; y < h; y++) for (var x = 0; x < w; x++) {
        var k = y * w + x; if (!inside[k]) continue;
        if (x > 0) d[k] = Math.min(d[k], d[k - 1] + 1); else d[k] = 1;
        if (y > 0) d[k] = Math.min(d[k], d[k - w] + 1); else d[k] = 1;
        if (x > 0 && y > 0) d[k] = Math.min(d[k], d[k - w - 1] + 1.414);
        if (x < w - 1 && y > 0) d[k] = Math.min(d[k], d[k - w + 1] + 1.414);
      }
      for (y = h - 1; y >= 0; y--) for (x = w - 1; x >= 0; x--) {
        k = y * w + x; if (!inside[k]) continue;
        if (x < w - 1) d[k] = Math.min(d[k], d[k + 1] + 1); else d[k] = 1;
        if (y < h - 1) d[k] = Math.min(d[k], d[k + w] + 1); else d[k] = 1;
        if (x < w - 1 && y < h - 1) d[k] = Math.min(d[k], d[k + w + 1] + 1.414);
        if (x > 0 && y < h - 1) d[k] = Math.min(d[k], d[k + w - 1] + 1.414);
      }
      function depth(k) {
        if (!inside[k]) return 0;
        var t = Math.min(d[k] / 12, 1);
        var edge = 1 - (1 - t) * (1 - t);                       // rounded rim
        var body = Math.pow(Math.min(d[k] / 34, 1), 0.8);      // fuller, puffy middle
        return (edge * 0.07 + body * 0.17);
      }
      function surface(side, texture) {
        var geo = new T.PlaneGeometry(WIDTH, HEIGHT, SX, SY);
        var pos = geo.attributes.position, uv = geo.attributes.uv;
        for (var v = 0; v < pos.count; v++) {
          var col = v % (SX + 1), row = Math.floor(v / (SX + 1));
          pos.setZ(v, side * depth(row * w + col));
          if (side < 0) uv.setX(v, 1 - uv.getX(v));   // back image is stored as seen from behind
        }
        geo.computeVertexNormals();
        var mat = new T.MeshStandardMaterial({ map: texture, alphaTest: 0.5, transparent: false, roughness: 0.92, metalness: 0, side: side > 0 ? T.FrontSide : T.BackSide });
        return new T.Mesh(geo, mat);
      }
      pivot.add(surface(1, frontTex));
      pivot.add(surface(-1, backTex));
      resize();
    };
    img.src = 'assets/products/jacket-front.webp';

    function resize() {
      var r = stage.getBoundingClientRect();
      renderer.setSize(r.width, r.height, false);
      camera.aspect = r.width / Math.max(1, r.height);
      // keep the whole jacket in frame on narrow screens
      var fitW = (WIDTH * 1.08) / (2 * Math.tan(T.MathUtils.degToRad(camera.fov / 2)) * camera.aspect);
      var fitH = (HEIGHT * 1.35) / (2 * Math.tan(T.MathUtils.degToRad(camera.fov / 2)));
      camera.position.z = Math.max(fitW, fitH);
      camera.updateProjectionMatrix();
    }
    resize();
    window.addEventListener('resize', resize);

    return {
      set: function (rxDeg, ryDeg, bobPx) {
        pivot.rotation.set(T.MathUtils.degToRad(rxDeg), T.MathUtils.degToRad(ryDeg), 0);
        pivot.position.y = -bobPx * 0.004;
        renderer.render(scene, camera);
      }
    };
  }

  /* ---- 3D jacket showcase ---- */
  (function () {
    var stage = $('#spinStage'), canvas = $('#jacketGL'), shadow = $('#spinShadow');
    if (!stage || !canvas) return;
    // the 3D engine (~600 KB) loads in the background so it never holds up the page
    var model = null;
    loadThree(function (ok) {
      model = ok ? buildJacketModel(stage, canvas) : null;
      if (!model) { canvas.hidden = true; $('#jacketFallback').hidden = false; }
    });
    var reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    var ry = -25, rx = 6, vy = reduce ? 0 : 0.35, dragging = false, lx = 0, ly = 0, t0 = performance.now();
    var target = null;   // set by FRONT / BACK buttons
    var viewBtns = $$('.spin-views .chip');
    viewBtns.forEach(function (b) {
      b.addEventListener('click', function () {
        var want = b.dataset.view === 'back' ? 180 : 0;
        // nearest equivalent angle so it turns the short way
        target = ry + ((((want - ry) % 360) + 540) % 360 - 180);
        vy = 0;
      });
    });
    stage.addEventListener('pointerdown', function (ev) {
      target = null;
      dragging = true; lx = ev.clientX; ly = ev.clientY; vy = 0;
      stage.classList.add('drag'); stage.setPointerCapture(ev.pointerId);
    });
    stage.addEventListener('pointermove', function (ev) {
      if (!dragging) return;
      var dx = ev.clientX - lx, dy = ev.clientY - ly;
      ry += dx * 0.5; rx = Math.max(-25, Math.min(25, rx - dy * 0.3));
      vy = dx * 0.5; lx = ev.clientX; ly = ev.clientY;
    });
    function end() { dragging = false; stage.classList.remove('drag'); }
    stage.addEventListener('pointerup', end);
    stage.addEventListener('pointercancel', end);
    function frame(now) {
      if (!dragging) {
        if (target !== null) {
          // glide to the chosen side and hold it
          ry += (target - ry) * 0.08;
          if (Math.abs(target - ry) < 0.05) ry = target;
        } else {
          // ease back to a slow idle spin
          var idle = reduce ? 0 : 0.35;
          vy += (idle - vy) * 0.03;
          ry += vy;
        }
        rx += (6 - rx) * 0.02;
      }
      var bob = reduce ? 0 : Math.sin((now - t0) / 900) * 8;
      if (model) model.set(rx, ry, bob);
      var a = ((ry % 360) + 360) % 360;
      var showingBack = a > 90 && a < 270;
      viewBtns.forEach(function (b) { b.classList.toggle('on', (b.dataset.view === 'back') === showingBack); });
      shadow.style.setProperty('--sh', (0.55 + 0.45 * Math.abs(Math.cos(a * Math.PI / 180))).toFixed(3));
      requestAnimationFrame(frame);
    }
    requestAnimationFrame(frame);
    $('#spinBuy').addEventListener('click', function () { openModal(13); });
  })();

  render();
  renderCart();
})();
