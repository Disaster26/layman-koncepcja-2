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
  var dane = [], typ = "p", ile = 36, KROK = 36;
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
  var GR = { p: 'płyta laminowana', b: 'blat kuchenny', w: 'blat BLACK WOOD', v: 'MDF BE.VELVET antifingerprint' };
  var NAZ = { p: 'Płyty laminowane', b: 'Blaty kuchenne', w: 'Blaty BLACK WOOD', v: 'MDF BE.VELVET' };
  var KOL = ['p', 'b', 'w', 'v'];
  function trafia(d, t) { return !t || norm(d.k + d.n + GR[d.t] + 'swisskrono').indexOf(t) > -1; }
  function gdzieJest(t) { for (var i = 0; i < KOL.length; i++) { if (dane.some(function (d) { return d.t === KOL[i] && trafia(d, t); })) return KOL[i]; } return null; }
  function pasuje(d) {
    if (d.t !== typ) return false;
    var t = norm(q.value);
    if (!trafia(d, t)) return false;
    if (fR.value && d.r !== fR.value) return false;
    if (fO.value && d.o !== fO.value) return false;
    if (fS.value && d.s !== fS.value) return false;
    return true;
  }
  function rysuj() {
    var z = dane.filter(pasuje);
    widoczne = z;
    var html = z.slice(0, ile).map(function (d, i) {
      return '<li class="dek"><button class="dek-o" type="button" data-i="' + i + '" aria-label="Karta dekoru ' + esc(d.k + ' ' + d.n) + '"><img src="dek/' + esc(d.i || d.k.toLowerCase()) + '.webp" width="240" height="240" loading="lazy" alt="' + esc(GR[d.t] + ' SWISS KRONO ' + d.k + ' ' + d.n) + '">' +
        '<span class="dek-t"><span class="dek-k">' + esc(d.k) + '</span><span class="dek-n">' + esc(d.n) + '</span>' + (d.s ? '<span class="dek-s">Struktura: ' + esc(d.s) + '</span>' : '') + (d.x ? '<span class="dek-x">' + esc(d.x) + '</span>' : '') + '</span></button>' +
        '<a href="' + esc(d.u) + '" target="_blank" rel="noopener" aria-label="Zobacz w SWISS KRONO: ' + esc(d.k + ' ' + d.n) + ' (nowa karta)">Zobacz w SWISS KRONO<svg aria-hidden="true"><use href="#zew"/></svg></a></li>';
    }).join('');
    siatka.innerHTML = html || '<li class="brak">Brak dekoru o takiej nazwie lub numerze. Proszę sprawdzić pisownię albo zadzwonić: 55 235 40 69.</li>';
    var n = z.length;
    wynik.innerHTML = NAZ[typ] + ' SWISS KRONO, pasujące pozycje: <b>' + n + '</b>';
    var reszta = n - ile;
    wiecej.hidden = reszta <= 0;
    if (reszta > 0) wiecej.textContent = 'Pokaż kolejne (' + Math.min(KROK, reszta) + ' z ' + reszta + ')';
  }
  var widoczne = [];
  function odNowa() { ile = KROK; rysuj(); }
  q.addEventListener('input', function () {
    var t = norm(q.value);
    if (t && dane.length && !dane.some(function (d) { return d.t === typ && trafia(d, t); })) {
      var g = gdzieJest(t); if (g && g !== typ) { fR.value = ''; fO.value = ''; fS.value = ''; ustawTyp(g); return; }
    }
    odNowa();
  });
  [fR, fO, fS].forEach(function (el) { el.addEventListener('change', odNowa); });
  wiecej.addEventListener('click', function () { ile += KROK; rysuj(); });
  var taby = [$('tabP'), $('tabB'), $('tabW'), $('tabV')];
  function ustawTyp(t, focus) {
    typ = t;
    taby.forEach(function (b) { var on = b.getAttribute('data-t') === t; b.setAttribute('aria-selected', on ? 'true' : 'false'); b.tabIndex = on ? 0 : -1; if (on && focus) b.focus(); });
    $('panelDek').setAttribute('aria-labelledby', 'tab' + t.toUpperCase());
    przygotujFiltry(); odNowa();
  }
  taby.forEach(function (b, i) {
    b.addEventListener('click', function () { ustawTyp(b.getAttribute('data-t')); });
    b.addEventListener('keydown', function (e) {
      if (e.key === 'ArrowRight' || e.key === 'ArrowLeft') { var n = taby[(i + (e.key === 'ArrowRight' ? 1 : taby.length - 1)) % taby.length]; ustawTyp(n.getAttribute('data-t'), true); }
    });
  });
  $('szukajHero').addEventListener('submit', function (e) {
    e.preventDefault();
    q.value = $('qHero').value.trim();
    fR.value = ''; fO.value = ''; fS.value = '';
    if (dane.length) { ustawTyp(gdzieJest(norm(q.value)) || 'p'); }
    $('dekory').scrollIntoView({ behavior: matchMedia('(prefers-reduced-motion: reduce)').matches ? 'auto' : 'smooth' });
  });
  function wczytaj() {
    fetch('dekory.json').then(function (r) { return r.json(); }).then(function (d) {
      dane = d;
      KOL.forEach(function (k) { $('cnt' + k.toUpperCase()).textContent = '(' + d.filter(function (x) { return x.t === k; }).length + ')'; });
      if (q.value) { typ = gdzieJest(norm(q.value)) || typ; }
      ustawTyp(typ);
    }).catch(function () { wynik.textContent = 'Nie udało się wczytać katalogu.'; });
  }
  if ('IntersectionObserver' in window) {
    var io = new IntersectionObserver(function (w) { if (w[0].isIntersecting) { io.disconnect(); wczytaj(); } }, { rootMargin: '600px' });
    io.observe($('dekory'));
  } else { wczytaj(); }

  // Linki z oferty i wpisow do konkretnej zakladki katalogu
  Array.prototype.forEach.call(document.querySelectorAll('a[data-tab]'), function (a) {
    a.addEventListener('click', function () {
      var t = a.getAttribute('data-tab');
      q.value = ''; fR.value = ''; fO.value = ''; fS.value = '';
      typ = t;
      if (dane.length) ustawTyp(t);
    });
  });

  // Karta dekoru
  var karta = $('karta');
  var OPIS = {
    p: function (d) { return 'Płyta wiórowa laminowana SWISS KRONO w dekorze ' + d.n + ' (' + d.k + ')' + (d.s ? ', struktura ' + d.s : '') + '. W hurtowni LAYMAN w Elblągu przytniemy ją na formatki i okleimy krawędzie.'; },
    b: function (d) { return 'Blat kuchenny SWISS KRONO w dekorze ' + d.n + ' (' + d.k + ')' + (d.s ? ', struktura ' + d.s : '') + '. Blaty o grubości 28 i 38 mm w hurtowni LAYMAN, ul. Malborska 91b, Elbląg.'; },
    w: function (d) { return 'Blat BLACK WOOD SWISS KRONO w dekorze ' + d.n + ' (' + d.k + '): ultracienki blat 12 mm z ciemną krawędzią płyty BLACK WOOD i laminatem HPL. Krawędzi nie trzeba oklejać.'; },
    v: function (d) { return 'Płyta MDF BE.VELVET antifingerprint SWISS KRONO w kolorze ' + d.n + ' (' + d.k + '): ultramatowa powierzchnia, na której nie zostają ślady palców. Na fronty kuchenne, szafy i zabudowy.'; }
  };
  var TYT = { p: 'Płyta laminowana', b: 'Blat kuchenny', w: 'Blat BLACK WOOD', v: 'Płyta MDF BE.VELVET' };
  var akt = null;
  siatka.addEventListener('click', function (e) {
    var b = e.target.closest('.dek-o'); if (!b) return;
    var d = widoczne[+b.getAttribute('data-i')]; if (!d) return;
    akt = d;
    $('kartaH').textContent = TYT[d.t] + ' ' + d.n + ' ' + d.k + ' SWISS KRONO';
    var im = $('kartaImg'); im.src = 'dek/' + (d.i || d.k.toLowerCase()) + '.webp'; im.alt = TYT[d.t] + ' SWISS KRONO ' + d.k + ' ' + d.n + ', Firma Handlowa Layman, Elbląg';
    $('kartaOp').textContent = OPIS[d.t](d);
    var w = [['Kod dekoru', d.k], ['Nazwa', d.n], ['Rodzaj', d.r], ['Struktura', d.s], ['Wymiary', d.x || (d.t === 'b' ? 'grubość 28 i 38 mm' : '')], ['Dostępność i cena', 'w sklepie B2B, stan z magazynu']];
    $('kartaTab').innerHTML = w.filter(function (r) { return r[1]; }).map(function (r) { return '<tr><th scope="row">' + esc(r[0]) + '</th><td>' + esc(r[1]) + '</td></tr>'; }).join('');
    $('kartaSk').href = d.u;
    if (karta.showModal) karta.showModal(); else karta.setAttribute('open', '');
  });
  function zamknijKarte() { if (karta.close) karta.close(); else karta.removeAttribute('open'); }
  $('kartaZ').addEventListener('click', zamknijKarte);
  karta.addEventListener('click', function (e) { if (e.target === karta) zamknijKarte(); });
  $('kartaZam').addEventListener('click', function () {
    zamknijKarte();
    if (akt) { var m = document.querySelector('#zam [name=mat]'); m.value = TYT[akt.t] + ' ' + akt.k + ' ' + akt.n; }
  });

  // Formularz ciecia (podglad - bez wysylki)
  $('zam').addEventListener('submit', function (e) {
    e.preventDefault();
    $('zamOk').textContent = 'W podglądzie formularz niczego nie wysyła. W gotowej stronie zamówienie trafia na sek@layman.com.pl, a klient dostaje potwierdzenie mailem.';
  });

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
