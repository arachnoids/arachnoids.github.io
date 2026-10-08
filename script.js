// script.js — Experience: bangun daftar kiri dari kartu kanan, lalu highlight yang sedang dilihat.
(function () {
  var cards = document.querySelectorAll('#experience .exp-list article');
  var menu = document.getElementById('exp-menu');
  if (!cards.length || !menu) return;

  // 1) Isi daftar kiri otomatis dari judul (h3) dan data-role tiap kartu
  cards.forEach(function (card, i) {
    if (!card.id) card.id = 'exp-' + (i + 1);

    var a = document.createElement('a');
    a.href = '#' + card.id;

    var title = document.createElement('strong');
    title.textContent = card.querySelector('h3').textContent;
    a.appendChild(title);

    if (card.dataset.role) {
      var sub = document.createElement('small');
      sub.innerHTML = card.dataset.role;   // mendukung &middot;
      a.appendChild(sub);
    }

    var li = document.createElement('li');
    li.appendChild(a);
    menu.appendChild(li);
  });

  var links = Array.prototype.slice.call(menu.querySelectorAll('a'));

  // 2) Tandai item yang aktif
  function setActive(id) {
    links.forEach(function (a) {
      if (a.getAttribute('href') === '#' + id) {
        a.setAttribute('aria-current', 'true');
      } else {
        a.removeAttribute('aria-current');
      }
    });
  }

  setActive(cards[0].id);

  // 3) Kartu yang melewati garis di sekitar tengah layar = kartu aktif
  if (!('IntersectionObserver' in window)) return;

  var observer = new IntersectionObserver(function (entries) {
    entries.forEach(function (entry) {
      if (entry.isIntersecting) setActive(entry.target.id);
    });
  }, { rootMargin: '-40% 0px -55% 0px' });

  cards.forEach(function (card) { observer.observe(card); });
})();


// ---------------------------------------------------------
// Smooth scroll: efek "meluncur" saat scroll dengan mouse wheel / touchpad.
// Berhenti pelan-pelan (akselerasi menurun), bukan langsung berhenti.
// ---------------------------------------------------------
(function () {
  var EASE = 0.1;   // 0.05 = sangat licin & lama berhenti, 0.2 = lebih cepat berhenti
  var WHEEL = 1;    // pengali jarak scroll tiap putaran wheel (1 = normal, 1.5 = lebih jauh)

  // Hormati pengaturan "kurangi gerakan", dan biarkan layar sentuh memakai scroll bawaan
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
  if (window.matchMedia('(pointer: coarse)').matches) return;

  var html = document.documentElement;
  html.classList.add('smooth-js');   // mematikan scroll-behavior bawaan CSS agar tidak bentrok

  var current = window.scrollY;      // posisi yang sedang ditampilkan
  var target = current;              // posisi tujuan
  var running = false;
  var last = 0;

  function maxScroll() { return Math.max(0, html.scrollHeight - window.innerHeight); }
  function clamp(v) { return Math.min(Math.max(v, 0), maxScroll()); }

  function tick(now) {
    var dt = Math.min(now - last, 50);
    last = now;
    var k = 1 - Math.pow(1 - EASE, dt / 16.67);   // hasil sama di layar 60Hz maupun 144Hz
    var diff = target - current;

    if (Math.abs(diff) < 0.3) {
      current = target;
      window.scrollTo(0, current);
      running = false;
      return;
    }

    current += diff * k;
    window.scrollTo(0, current);
    requestAnimationFrame(tick);
  }

  function start() {
    if (running) return;
    running = true;
    last = performance.now();
    requestAnimationFrame(tick);
  }

  function sync() {
    if (!running) { current = target = window.scrollY; }
  }

  // Mouse wheel / touchpad
  window.addEventListener('wheel', function (e) {
    if (e.ctrlKey || e.defaultPrevented) return;                 // zoom
    if (Math.abs(e.deltaX) > Math.abs(e.deltaY)) return;         // scroll horizontal
    var d = e.deltaY;
    if (e.deltaMode === 1) d *= 32;                              // satuan baris
    else if (e.deltaMode === 2) d *= window.innerHeight;         // satuan halaman
    e.preventDefault();
    sync();
    target = clamp(target + d * WHEEL);
    start();
  }, { passive: false });

  // Scroll dari sumber lain (keyboard, drag scrollbar, Tab) -> ikuti posisinya
  window.addEventListener('scroll', sync);
  window.addEventListener('resize', function () { target = clamp(target); });

  // Klik link anchor (#about, #contact, tombol kembali ke atas, dst) -> meluncur juga
  document.addEventListener('click', function (e) {
    var a = e.target.closest && e.target.closest('a[href^="#"]');
    if (!a || e.defaultPrevented || e.button !== 0 || e.metaKey || e.ctrlKey || e.shiftKey) return;

    var id = a.getAttribute('href').slice(1);
    var el = id ? document.getElementById(id) : null;
    if (!el) return;

    e.preventDefault();
    var pad = parseFloat(getComputedStyle(html).scrollPaddingTop) || 0;
    sync();
    target = clamp(el.getBoundingClientRect().top + window.scrollY - pad);
    start();
    try { history.pushState(null, '', '#' + id); } catch (err) { /* abaikan */ }
  });
})();