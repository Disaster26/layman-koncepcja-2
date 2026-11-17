(function () {
  'use strict';
  var $ = function (id) { return document.getElementById(id); };

  // Menu na telefonie
  var burger = $('burger'), nav = $('nav');
  function zamknij() { nav.classList.remove('otw'); burger.setAttribute('aria-expanded', 'false'); burger.setAttribute('aria-label', 'Otwórz menu'); }
  burger.addEventListener('click', function () {
    var o = nav.classList.toggle('otw');
    burger.setAttribute('aria-expanded', o ? 'true' : 'false');
    burger.setAttribute('aria-label', o ? 'Zamknij menu' : 'Otwórz menu');
  });
  nav.addEventListener('click', function (e) { if (e.target.closest('a')) zamknij(); });
  document.addEventListener('keydown', function (e) { if (e.key === 'Escape') zamknij(); });

  // Katalog dekorow
  var dane = [], typ = 'p', ile = 24, KROK = 24;
  var siatka = $('siatka'), q = $('q'), fR = $('fR'), fO = $('fO'), fS = $('fS'), wiecej = $('wiecej'), wynik = $('wynik');
  function norm(s) { return (s || '').toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '').replace(/ł/g, 'l').replace(/\s+/g, ''); }
  function esc(s) { return String(s).replace(/[&<>"]/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]; }); }
  function opcje(sel, wartosci) {
    var akt = sel.value; sel.length = 1;
    wartosci.forEach(function (v) { var o = document.createElement('option'); o.textContent = v; sel.appendChild(o); });
    sel.value = wartosci.indexOf(akt) > -1 ? akt : '';
  }
  function przygotujFiltry() {
    var z = dane.filter(function (d) { return d.t === typ; });
    var r = {}, s = {};
    z.forEach(function (d) { r[d.r] = 1; if (d.s) s[d.s] = 1; });
    opcje(fR, Object.keys(r).sort());
    opcje(fS, Object.keys(s).sort(function (a, b) { return a.localeCompare(b, 'pl'); }));
  }
  function pasuje(d) {
    if (d.t !== typ) return false;
    var t = norm(q.value);
    if (t && norm(d.k + d.n).indexOf(t) < 0 && norm(d.n).indexOf(t) < 0) return false;
    if (fR.value && d.r !== fR.value) return false;
    if (fO.value && d.o !== fO.value) return false;
    if (fS.value && d.s !== fS.value) return false;
    return true;
  }
  function rysuj() {
    var z = dane.filter(pasuje);
    var html = z.slice(0, ile).map(function (d) {
      return '<li class="dek"><img src="dek/' + d.k.toLowerCase() + '.webp" width="240" height="240" loading="lazy" alt="Dekor ' + esc(d.k + ' ' + d.n) + '">' +
        '<span class="dek-t"><span class="dek-k">' + esc(d.k) + '</span><span class="dek-n">' + esc(d.n) + '</span><span class="dek-s">Struktura: ' + esc(d.s || '-') + '</span></span>' +
        '<a href="' + esc(d.u) + '" target="_blank" rel="noopener" aria-label="Zobacz w Swiss Krono: ' + esc(d.k + ' ' + d.n + ', struktura ' + d.s) + ' (nowa karta)">Zobacz w Swiss Krono<svg aria-hidden="true"><use href="#zew"/></svg></a></li>';
    }).join('');
    siatka.innerHTML = html || '<li class="brak">Brak dekoru o takiej nazwie lub numerze. Proszę sprawdzić pisownię albo zadzwonić: 55 235 40 69.</li>';
    var n = z.length;
    wynik.innerHTML = (typ === 'p' ? 'Płyty laminowane' : 'Blaty kuchenne') + ', pasujące pozycje: <b>' + n + '</b>';
    var reszta = n - ile;
    wiecej.hidden = reszta <= 0;
    if (reszta > 0) wiecej.textContent = 'Pokaż kolejne (' + Math.min(KROK, reszta) + ' z ' + reszta + ')';
  }
  function odNowa() { ile = KROK; rysuj(); }
  [q].forEach(function (el) { el.addEventListener('input', odNowa); });
  [fR, fO, fS].forEach(function (el) { el.addEventListener('change', odNowa); });
  wiecej.addEventListener('click', function () { ile += KROK; rysuj(); });
  var taby = [$('tabP'), $('tabB')];
  function ustawTyp(t, focus) {
    typ = t;
    taby.forEach(function (b) { var on = b.getAttribute('data-t') === t; b.setAttribute('aria-selected', on ? 'true' : 'false'); b.tabIndex = on ? 0 : -1; if (on && focus) b.focus(); });
    $('panelDek').setAttribute('aria-labelledby', t === 'p' ? 'tabP' : 'tabB');
    przygotujFiltry(); odNowa();
  }
  taby.forEach(function (b, i) {
    b.addEventListener('click', function () { ustawTyp(b.getAttribute('data-t')); });
    b.addEventListener('keydown', function (e) {
      if (e.key === 'ArrowRight' || e.key === 'ArrowLeft') { var n = taby[(i + 1) % 2]; ustawTyp(n.getAttribute('data-t'), true); }
    });
  });
  $('szukajHero').addEventListener('submit', function (e) {
    e.preventDefault();
    q.value = $('qHero').value.trim();
    fR.value = ''; fO.value = ''; fS.value = '';
    if (dane.length) {
      // jesli brak w plytach, a jest w blatach - przelacz
      var t = norm(q.value);
      var wP = dane.some(function (d) { return d.t === 'p' && norm(d.k + d.n).indexOf(t) > -1; });
      ustawTyp(wP || !t ? 'p' : 'b');
    }
    $('dekory').scrollIntoView({ behavior: matchMedia('(prefers-reduced-motion: reduce)').matches ? 'auto' : 'smooth' });
  });
  function wczytaj() {
    fetch('dekory.json').then(function (r) { return r.json(); }).then(function (d) {
      dane = d;
      $('cntP').textContent = '(' + d.filter(function (x) { return x.t === 'p'; }).length + ')';
      $('cntB').textContent = '(' + d.filter(function (x) { return x.t === 'b'; }).length + ')';
      if (q.value) {
        var t = norm(q.value);
        var wP = dane.some(function (x) { return x.t === 'p' && norm(x.k + x.n).indexOf(t) > -1; });
        if (!wP) typ = 'b';
      }
      ustawTyp(typ);
    }).catch(function () { wynik.textContent = 'Nie udało się wczytać katalogu.'; });
  }
  if ('IntersectionObserver' in window) {
    var io = new IntersectionObserver(function (w) { if (w[0].isIntersecting) { io.disconnect(); wczytaj(); } }, { rootMargin: '600px' });
    io.observe($('dekory'));
  } else { wczytaj(); }

  // B2B: ilosc wieksza niz stan
  Array.prototype.forEach.call(document.querySelectorAll('.ilosc'), function (inp) {
    function spr() {
      var stan = +inp.getAttribute('data-stan'), v = +inp.value, u = inp.nextElementSibling, j = inp.getAttribute('data-j');
      if (stan === 0 && v > 0) u.textContent = 'Brak na stanie, przyjmiemy zamówienie';
      else if (v > stan) u.textContent = 'Na stanie ' + stan + ' ' + j + ', do koszyka trafi ' + stan;
      else u.textContent = '';
    }
    inp.addEventListener('input', spr); spr();
  });

  // Panel ogloszen (tylko lokalnie)
  var MS = ['01', '02', '03', '04', '05', '06', '07', '08', '09', '10', '11', '12'];
  $('panel').addEventListener('submit', function (e) {
    e.preventDefault();
    var txt = $('pTxt').value.trim() || 'Ogłoszenie';
    var t = document.querySelector('input[name=typ]:checked').value;
    var ogl = $('ogl'), d = $('pDo').value;
    ogl.setAttribute('data-typ', t);
    var m = txt.match(/^([^:]{1,30}:)(.*)$/);
    var span = $('oglTxt'); span.textContent = '';
    if (m) { var b = document.createElement('b'); b.textContent = m[1]; span.appendChild(b); span.appendChild(document.createTextNode(m[2])); }
    else span.textContent = txt;
    var kiedy = d ? (' Pasek zniknie sam po ' + d.slice(8, 10) + '.' + MS[+d.slice(5, 7) - 1] + '.') : '';
    $('pOk').textContent = 'Opublikowane. Zobacz pasek na górze strony.' + kiedy;
  });

  // Mapa Google dopiero przy przewinieciu
  var mapa = $('mapa');
  if (mapa && 'IntersectionObserver' in window) {
    var im = new IntersectionObserver(function (w) {
      if (w[0].isIntersecting) {
        im.disconnect();
        var f = document.createElement('iframe');
        f.title = 'Mapa dojazdu: Layman, ul. Malborska 91b, Elbląg';
        f.loading = 'lazy'; f.referrerPolicy = 'no-referrer-when-downgrade';
        f.src = mapa.getAttribute('data-src');
        mapa.appendChild(f);
      }
    }, { rootMargin: '300px' });
    im.observe(mapa);
  }
})();
