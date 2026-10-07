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