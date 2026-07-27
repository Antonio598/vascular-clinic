/* ═══════════════════════════════════════════════════════════════
   VASCULAR CLINIC — main.js
   Sin librerías externas. Todo con APIs nativas del navegador.

   ÍNDICE
   ──────────────────────────────────────────────────────────────
   00. Configuración (número de WhatsApp)
   01. WhatsApp — enlaces con mensaje pre-escrito
   02. Preloader
   03. Header, barra de progreso y menú móvil
   04. Título del hero partido por palabras
   05. Reveal al hacer scroll (IntersectionObserver)
   06. Contadores animados
   07. Parallax de los blobs
   08. Red vascular animada (canvas)
   09. Tilt 3D + glow en tarjetas
   10. Botones magnéticos + ripple
   11. Acordeón FAQ
   12. Botón flotante de WhatsApp
   13. Detalles finales
   ═══════════════════════════════════════════════════════════════ */

(function () {
  'use strict';

  /* ══ 00. CONFIGURACIÓN ═══════════════════════════════════════
     👉 Para cambiar el número de WhatsApp, edita SOLO esta línea.
        Formato internacional, sin +, sin espacios ni guiones.     */
  var WHATSAPP = '50769866587';   // +507 6986-6587

  var MENSAJE_POR_DEFECTO = 'Hola Vascular Clinic, quiero agendar una cita.';

  /* Atajos */
  var $  = function (s, c) { return (c || document).querySelector(s); };
  var $$ = function (s, c) { return Array.prototype.slice.call((c || document).querySelectorAll(s)); };

  var reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var isTouch = window.matchMedia('(hover: none)').matches;


  /* ══ 01. WHATSAPP ════════════════════════════════════════════
     Cada enlace .js-wa lleva su mensaje en data-wa. Aquí lo
     convertimos en un enlace wa.me correctamente codificado.
     El href del HTML ya trae un mensaje genérico como respaldo,
     así que los enlaces funcionan incluso si este script falla.  */

  function waLink(mensaje) {
    return 'https://wa.me/' + WHATSAPP + '?text=' + encodeURIComponent(mensaje || MENSAJE_POR_DEFECTO);
  }

  $$('.js-wa').forEach(function (a) {
    a.href = waLink(a.getAttribute('data-wa'));
  });


  /* ══ 02. PRELOADER ═══════════════════════════════════════════ */

  (function preloader() {
    var pre = $('#preloader');
    var hero = $('.hero');

    function terminar() {
      if (pre) {
        pre.classList.add('done');
        setTimeout(function () { pre.remove(); }, 700);
      }
      if (hero) hero.classList.add('ready');
      document.body.classList.add('loaded');
    }

    if (reduce || !pre) { terminar(); return; }

    // Se va al terminar de cargar, con un mínimo de 900ms para que
    // se alcance a ver la "V" dibujándose...
    var minimo = new Promise(function (r) { setTimeout(r, 900); });
    var carga  = new Promise(function (r) {
      if (document.readyState === 'complete') r();
      else window.addEventListener('load', r, { once: true });
    });

    // ...y un tope de seguridad: pase lo que pase, a los 3.5s se va.
    Promise.race([
      Promise.all([minimo, carga]),
      new Promise(function (r) { setTimeout(r, 3500); })
    ]).then(terminar);
  })();


  /* ══ 03. HEADER, PROGRESO Y MENÚ MÓVIL ═══════════════════════ */

  var header = $('#header');
  var barra  = $('#progressBar');
  var burger = $('#burger');
  var menu   = $('#mobileMenu');

  function alScroll() {
    var y = window.scrollY || document.documentElement.scrollTop;

    if (header) header.classList.toggle('scrolled', y > 60);

    if (barra) {
      var alto = document.documentElement.scrollHeight - window.innerHeight;
      barra.style.width = (alto > 0 ? (y / alto) * 100 : 0) + '%';
    }
  }

  /* --- Menú móvil --- */
  function cerrarMenu() {
    if (!menu) return;
    menu.classList.remove('open');
    menu.setAttribute('aria-hidden', 'true');
    if (burger) {
      burger.classList.remove('open');
      burger.setAttribute('aria-expanded', 'false');
      burger.setAttribute('aria-label', 'Abrir menú');
    }
    document.body.style.overflow = '';
  }

  if (burger && menu) {
    burger.addEventListener('click', function () {
      var abierto = menu.classList.toggle('open');
      burger.classList.toggle('open', abierto);
      burger.setAttribute('aria-expanded', String(abierto));
      burger.setAttribute('aria-label', abierto ? 'Cerrar menú' : 'Abrir menú');
      menu.setAttribute('aria-hidden', String(!abierto));
      document.body.style.overflow = abierto ? 'hidden' : '';
    });

    $$('a', menu).forEach(function (a) {
      a.addEventListener('click', cerrarMenu);
    });

    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape') cerrarMenu();
    });
  }


  /* ══ 04. TÍTULO DEL HERO PARTIDO POR PALABRAS ════════════════ */

  (function partirTitulo() {
    var titulo = $('[data-split]');
    if (!titulo || reduce) return;

    var indice = 0;

    // Recorremos los nodos hijos para no perder el <em> del subrayado
    Array.prototype.slice.call(titulo.childNodes).forEach(function (nodo) {
      if (nodo.nodeType === Node.TEXT_NODE) {
        var frag = document.createDocumentFragment();
        nodo.textContent.split(/(\s+)/).forEach(function (parte) {
          if (!parte.trim()) { frag.appendChild(document.createTextNode(parte)); return; }
          var span = document.createElement('span');
          span.className = 'word';
          span.textContent = parte;
          span.style.setProperty('--wd', (indice++ * 95 + 250) + 'ms');
          frag.appendChild(span);
        });
        titulo.replaceChild(frag, nodo);
      } else if (nodo.nodeType === Node.ELEMENT_NODE) {
        nodo.classList.add('word');
        nodo.style.setProperty('--wd', (indice++ * 95 + 250) + 'ms');
      }
    });
  })();


  /* ══ 05. REVEAL AL HACER SCROLL ══════════════════════════════ */

  (function reveals() {
    var elementos = $$('[data-anim]');

    // Escalonado automático dentro de cada grupo [data-stagger]
    $$('[data-stagger]').forEach(function (grupo) {
      $$('[data-anim]', grupo).forEach(function (el, i) {
        el.style.setProperty('--delay', (i * 70) + 'ms');
      });
    });

    // Sin animación o sin soporte: mostramos todo de inmediato
    if (reduce || !('IntersectionObserver' in window)) {
      elementos.forEach(function (el) { el.classList.add('is-visible', 'anim-done'); });
      return;
    }

    var obs = new IntersectionObserver(function (entradas) {
      entradas.forEach(function (e) {
        if (!e.isIntersecting) return;
        e.target.classList.add('is-visible');
        // liberamos will-change cuando la transición termina
        setTimeout(function () { e.target.classList.add('anim-done'); }, 1200);
        obs.unobserve(e.target);
      });
    }, { threshold: 0.12, rootMargin: '0px 0px -8% 0px' });

    elementos.forEach(function (el) { obs.observe(el); });

    // El hero se muestra de una vez, sin esperar scroll
    $$('.hero [data-anim]').forEach(function (el, i) {
      el.style.setProperty('--delay', (i * 90 + 350) + 'ms');
      el.classList.add('is-visible');
      obs.unobserve(el);
    });
  })();


  /* ══ 06. CONTADORES ANIMADOS ═════════════════════════════════ */

  (function contadores() {
    var nums = $$('[data-count]');
    if (!nums.length) return;

    if (reduce || !('IntersectionObserver' in window)) {
      nums.forEach(function (n) { n.textContent = n.getAttribute('data-count'); });
      return;
    }

    function animar(el) {
      var destino = parseInt(el.getAttribute('data-count'), 10) || 0;
      var duracion = 1500;
      var inicio = null;

      function paso(t) {
        if (inicio === null) inicio = t;
        var p = Math.min((t - inicio) / duracion, 1);
        var eased = 1 - Math.pow(2, -10 * p);            // easeOutExpo
        el.textContent = Math.round(destino * (p === 1 ? 1 : eased));
        if (p < 1) requestAnimationFrame(paso);
        else el.textContent = destino;
      }
      requestAnimationFrame(paso);
    }

    var obs = new IntersectionObserver(function (entradas) {
      entradas.forEach(function (e) {
        if (!e.isIntersecting) return;
        animar(e.target);
        obs.unobserve(e.target);
      });
    }, { threshold: 0.5 });

    nums.forEach(function (n) { obs.observe(n); });
  })();


  /* ══ 07. PARALLAX DE LOS BLOBS ═══════════════════════════════ */

  var parallax = [];
  if (!reduce && window.innerWidth > 768) parallax = $$('[data-parallax]');

  function moverParallax() {
    var y = window.scrollY || 0;
    if (y > window.innerHeight * 1.2) return;   // fuera del hero, no gastamos
    parallax.forEach(function (el) {
      var f = parseFloat(el.getAttribute('data-parallax')) || 0.05;
      el.style.setProperty('--py', (y * f * -1) + 'px');
      el.style.translate = '0 ' + (y * f * -1) + 'px';
    });
  }


  /* --- Un solo listener de scroll para todo, con rAF --- */
  var ticking = false;
  window.addEventListener('scroll', function () {
    if (ticking) return;
    ticking = true;
    requestAnimationFrame(function () {
      alScroll();
      moverParallax();
      fabScroll();
      ticking = false;
    });
  }, { passive: true });


  /* ══ 08. RED VASCULAR ANIMADA (CANVAS) ═══════════════════════
     Puntos que se conectan cuando están cerca: evoca una red de
     vasos sanguíneos. Se apaga en móvil, fuera de pantalla y
     cuando la pestaña no está visible.                            */

  (function redVascular() {
    var cv = $('#veinCanvas');
    if (!cv || reduce || window.innerWidth <= 768) {
      if (cv) cv.style.display = 'none';
      return;
    }

    var ctx = cv.getContext('2d');
    if (!ctx) return;

    var puntos = [];
    var raf = null;
    var visible = true;
    var w = 0, h = 0, dpr = 1;

    function medir() {
      dpr = Math.min(window.devicePixelRatio || 1, 2);
      w = cv.offsetWidth;
      h = cv.offsetHeight;
      cv.width  = w * dpr;
      cv.height = h * dpr;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    }

    function crear() {
      var total = Math.min(46, Math.round(w / 26));
      puntos = [];
      for (var i = 0; i < total; i++) {
        puntos.push({
          x: Math.random() * w,
          y: Math.random() * h,
          vx: (Math.random() - 0.5) * 0.32,
          vy: (Math.random() - 0.5) * 0.32,
          r: Math.random() * 1.9 + 1
        });
      }
    }

    function pintar() {
      ctx.clearRect(0, 0, w, h);

      for (var i = 0; i < puntos.length; i++) {
        var p = puntos[i];
        p.x += p.vx;
        p.y += p.vy;
        if (p.x < 0 || p.x > w) p.vx *= -1;
        if (p.y < 0 || p.y > h) p.vy *= -1;

        ctx.beginPath();
        ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
        ctx.fillStyle = 'rgba(255,255,255,.55)';
        ctx.fill();

        for (var j = i + 1; j < puntos.length; j++) {
          var q = puntos[j];
          var dx = p.x - q.x, dy = p.y - q.y;
          var d = Math.sqrt(dx * dx + dy * dy);
          if (d > 150) continue;
          var alfa = (1 - d / 150) * 0.32;
          ctx.beginPath();
          ctx.moveTo(p.x, p.y);
          ctx.lineTo(q.x, q.y);
          ctx.strokeStyle = 'rgba(216,31,60,' + alfa + ')';
          ctx.lineWidth = 1;
          ctx.stroke();
        }
      }
      raf = requestAnimationFrame(pintar);
    }

    function arrancar() { if (!raf && visible) raf = requestAnimationFrame(pintar); }
    function parar()    { if (raf) { cancelAnimationFrame(raf); raf = null; } }

    medir();
    crear();
    arrancar();

    var reTimer;
    window.addEventListener('resize', function () {
      clearTimeout(reTimer);
      reTimer = setTimeout(function () {
        if (window.innerWidth <= 768) { parar(); cv.style.display = 'none'; return; }
        cv.style.display = '';
        medir();
        crear();
        arrancar();
      }, 200);
    });

    document.addEventListener('visibilitychange', function () {
      if (document.hidden) parar(); else arrancar();
    });

    // Se detiene cuando el hero sale de pantalla
    if ('IntersectionObserver' in window) {
      new IntersectionObserver(function (e) {
        visible = e[0].isIntersecting;
        if (visible) arrancar(); else parar();
      }, { threshold: 0 }).observe($('.hero'));
    }
  })();


  /* ══ 09. TILT 3D + GLOW EN TARJETAS ══════════════════════════ */

  if (!reduce && !isTouch) {
    $$('.js-tilt').forEach(function (card) {
      var rect = null;

      card.addEventListener('mouseenter', function () {
        rect = card.getBoundingClientRect();
        card.style.willChange = 'transform';
      });

      card.addEventListener('mousemove', function (e) {
        if (!rect) rect = card.getBoundingClientRect();
        var x = e.clientX - rect.left;
        var y = e.clientY - rect.top;

        // brillo que sigue al cursor
        card.style.setProperty('--mx', x + 'px');
        card.style.setProperty('--my', y + 'px');

        // inclinación suave
        var rx = ((y / rect.height) - 0.5) * -7;
        var ry = ((x / rect.width) - 0.5) * 7;
        card.style.transform =
          'perspective(900px) rotateX(' + rx.toFixed(2) + 'deg) rotateY(' + ry.toFixed(2) + 'deg) translateY(-7px)';
      });

      card.addEventListener('mouseleave', function () {
        rect = null;
        card.style.transform = '';
        card.style.willChange = 'auto';
      });
    });
  }


  /* ══ 10. BOTONES MAGNÉTICOS + RIPPLE ═════════════════════════ */

  if (!reduce && !isTouch) {
    $$('.js-magnetic').forEach(function (btn) {
      btn.addEventListener('mousemove', function (e) {
        var r = btn.getBoundingClientRect();
        var x = (e.clientX - r.left - r.width / 2) * 0.22;
        var y = (e.clientY - r.top - r.height / 2) * 0.32;
        btn.style.transform = 'translate(' + x.toFixed(1) + 'px, ' + (y - 3).toFixed(1) + 'px)';
      });
      btn.addEventListener('mouseleave', function () { btn.style.transform = ''; });
    });
  }

  // Ripple en todos los botones
  document.addEventListener('click', function (e) {
    var btn = e.target.closest ? e.target.closest('.btn') : null;
    if (!btn || reduce) return;

    var r = btn.getBoundingClientRect();
    var size = Math.max(r.width, r.height);
    var span = document.createElement('span');
    span.className = 'ripple';
    span.style.width = span.style.height = size + 'px';
    span.style.left = (e.clientX - r.left - size / 2) + 'px';
    span.style.top  = (e.clientY - r.top  - size / 2) + 'px';
    btn.appendChild(span);
    setTimeout(function () { span.remove(); }, 700);
  });


  /* ══ 11. ACORDEÓN FAQ ════════════════════════════════════════ */

  (function faq() {
    var items = $$('.faq__item');

    items.forEach(function (item) {
      var boton = $('.faq__q', item);
      var panel = $('.faq__a', item);
      if (!boton || !panel) return;

      boton.addEventListener('click', function () {
        var abierto = item.classList.contains('open');

        // acordeón: solo una respuesta abierta a la vez
        items.forEach(function (otro) {
          if (otro === item) return;
          otro.classList.remove('open');
          var b = $('.faq__q', otro), p = $('.faq__a', otro);
          if (b) b.setAttribute('aria-expanded', 'false');
          if (p) p.style.height = '0px';
        });

        if (abierto) {
          item.classList.remove('open');
          boton.setAttribute('aria-expanded', 'false');
          panel.style.height = '0px';
        } else {
          item.classList.add('open');
          boton.setAttribute('aria-expanded', 'true');
          panel.style.height = panel.scrollHeight + 'px';
        }
      });
    });

    // Al cambiar el ancho, recalculamos la altura de la abierta
    var t;
    window.addEventListener('resize', function () {
      clearTimeout(t);
      t = setTimeout(function () {
        var abierta = $('.faq__item.open .faq__a');
        if (abierta) abierta.style.height = abierta.scrollHeight + 'px';
      }, 150);
    });
  })();


  /* ══ 12. BOTÓN FLOTANTE DE WHATSAPP ══════════════════════════ */

  var fab = $('#waFab');
  var tip = $('#waTip');
  var tipMostrado = false;

  function fabScroll() {
    if (!fab) return;
    var mostrar = (window.scrollY || 0) > 400;
    fab.classList.toggle('show', mostrar);

    // El tooltip se asoma una sola vez, a los 8 segundos
    if (mostrar && !tipMostrado) {
      tipMostrado = true;
      setTimeout(function () {
        if (!tip || isTouch) return;
        tip.classList.add('show');
        setTimeout(function () { tip.classList.remove('show'); }, 5000);
      }, 8000);
    }
  }


  /* ══ 13. DETALLES FINALES ════════════════════════════════════ */

  // Año del footer siempre actualizado
  var year = $('#year');
  if (year) year.textContent = new Date().getFullYear();

  // Scroll suave con compensación del header fijo
  $$('a[href^="#"]').forEach(function (a) {
    a.addEventListener('click', function (e) {
      var id = a.getAttribute('href');
      if (!id || id === '#') return;
      var destino = document.querySelector(id);
      if (!destino) return;

      e.preventDefault();
      var alto = header ? header.offsetHeight : 0;
      var top = destino.getBoundingClientRect().top + window.scrollY - alto - 14;
      window.scrollTo({ top: top, behavior: reduce ? 'auto' : 'smooth' });
    });
  });

  // Estado inicial correcto aunque se recargue a media página
  alScroll();
  moverParallax();
  fabScroll();

})();
