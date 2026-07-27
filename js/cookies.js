/* ═══════════════════════════════════════════════════════════════
   VASCULAR CLINIC — Banner de cookies

   El banner se construye desde aquí (no está en el HTML) para que
   exista en UN SOLO lugar y las tres páginas lo compartan.
   Si el visitante tiene el JavaScript desactivado no aparece —
   y es correcto: sin JavaScript tampoco se puede activar ninguna
   cookie que no sea esencial.

   La decisión se guarda en localStorage bajo 'vc_consent':
     'todas'      → aceptó también las analíticas
     'esenciales' → solo lo imprescindible

   👉 CÓMO USARLO DESPUÉS (por ejemplo, para el píxel de Meta o
      Google Analytics cuando hagas campañas):

      window.addEventListener('vc:consent', function (e) {
        if (e.detail === 'todas') {
          // aquí va el script de analítica
        }
      });

      O consultar en cualquier momento: window.vcConsent()
   ═══════════════════════════════════════════════════════════════ */

(function () {
  'use strict';

  var CLAVE  = 'vc_consent';
  var ESPERA = 1200;   // ms antes de mostrar el banner
  var banner = null;

  /* localStorage puede fallar en modo incógnito o si está bloqueado */
  function leer() {
    try { return localStorage.getItem(CLAVE); } catch (e) { return null; }
  }
  function guardar(valor) {
    try {
      localStorage.setItem(CLAVE, valor);
      localStorage.setItem(CLAVE + '_fecha', new Date().toISOString());
    } catch (e) { /* sin almacenamiento: se preguntará de nuevo */ }
  }

  /* Consulta pública */
  window.vcConsent = leer;

  function avisar(valor) {
    window.dispatchEvent(new CustomEvent('vc:consent', { detail: valor }));
  }

  function cerrar(valor) {
    guardar(valor);
    avisar(valor);
    document.body.classList.remove('cookies-open');
    if (!banner) return;
    banner.classList.add('hide');
    banner.classList.remove('show');
    setTimeout(function () {
      if (banner && banner.parentNode) banner.remove();
      banner = null;
    }, 550);
  }

  function construir() {
    if (banner) return;

    banner = document.createElement('section');
    banner.className = 'cookie-banner';
    banner.setAttribute('aria-label', 'Aviso de cookies');

    banner.innerHTML =
      '<div class="cookie-banner__top">' +
        '<span class="cookie-banner__icon" aria-hidden="true">' +
          '<svg viewBox="0 0 24 24">' +
            '<path d="M12 3a9 9 0 1 0 9 9 3.4 3.4 0 0 1-4.2-4.2A3.4 3.4 0 0 1 12 3Z"/>' +
            '<circle cx="9" cy="10" r="1"/><circle cx="14" cy="14.5" r="1"/><circle cx="9.5" cy="15.5" r="1"/>' +
          '</svg>' +
        '</span>' +
        '<h2 class="cookie-banner__title">Uso de cookies</h2>' +
      '</div>' +
      '<p class="cookie-banner__text">' +
        'Utilizamos cookies esenciales para el funcionamiento de la plataforma y cookies ' +
        'de preferencias para mejorar tu experiencia. Consulta nuestra ' +
        '<a href="privacidad.html">Política de Privacidad</a> para más información.' +
      '</p>' +
      '<div class="cookie-banner__actions">' +
        '<button type="button" class="btn btn--primary btn--sm" data-cookie="todas">Aceptar todas</button>' +
        '<button type="button" class="btn btn--outline btn--sm" data-cookie="esenciales">Solo esenciales</button>' +
      '</div>';

    document.body.appendChild(banner);
    document.body.classList.add('cookies-open');

    banner.addEventListener('click', function (e) {
      var b = e.target.closest('[data-cookie]');
      if (b) cerrar(b.getAttribute('data-cookie'));
    });

    // Doble rAF para que la transición de entrada se vea
    requestAnimationFrame(function () {
      requestAnimationFrame(function () { banner.classList.add('show'); });
    });
  }

  /* Reabrir desde el enlace "Configurar cookies" del footer */
  window.vcAbrirCookies = function () {
    try { localStorage.removeItem(CLAVE); } catch (e) {}
    construir();
    if (banner) banner.scrollIntoView({ block: 'nearest' });
  };

  document.addEventListener('click', function (e) {
    var t = e.target.closest ? e.target.closest('[data-abrir-cookies]') : null;
    if (!t) return;
    e.preventDefault();
    window.vcAbrirCookies();
  });

  /* Arranque: solo si aún no ha decidido */
  var previo = leer();
  if (previo) {
    avisar(previo);
    return;
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', function () { setTimeout(construir, ESPERA); });
  } else {
    setTimeout(construir, ESPERA);
  }

})();
