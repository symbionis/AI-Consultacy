/* Language preference: persists the manual EN/FR switch in a cookie and
   shows a soft, dismissible suggestion banner when the browser language
   differs from the page language. No automatic redirects — shared links
   always land where they point. */
(function () {
  var COOKIE = 'siteLang';
  var MAX_AGE = 31536000; // 1 year

  function getCookie(name) {
    var m = document.cookie.match('(?:^|; )' + name + '=([^;]*)');
    return m ? decodeURIComponent(m[1]) : null;
  }
  function setCookie(name, value) {
    document.cookie = name + '=' + encodeURIComponent(value) +
      ';path=/;max-age=' + MAX_AGE + ';samesite=lax';
  }

  // Remember an explicit choice made through the EN/FR switcher.
  document.addEventListener('click', function (e) {
    var link = e.target.closest && e.target.closest('.lang-switch a[hreflang]');
    if (link) setCookie(COOKIE, link.getAttribute('hreflang'));
  });

  // Soft suggestion banner — only when no preference has been expressed.
  if (getCookie(COOKIE)) return;

  var pageLang = (document.documentElement.lang || 'en').slice(0, 2).toLowerCase();
  var browserLang = (navigator.language || 'en').toLowerCase().indexOf('fr') === 0 ? 'fr' : 'en';
  if (browserLang === pageLang) return;

  var alt = document.querySelector('link[rel="alternate"][hreflang="' + browserLang + '"]');
  if (!alt) return;

  var copy = browserLang === 'fr'
    ? { msg: 'Cette page est aussi disponible en français.', cta: 'Voir en français', close: 'Fermer' }
    : { msg: 'This page is also available in English.', cta: 'View in English', close: 'Dismiss' };

  function init() {
    var style = document.createElement('style');
    style.textContent =
      // Franksy block field: flat teal, white text, sun link. No shadow, no motion.
      '.lang-suggest{position:fixed;left:0;right:0;bottom:0;z-index:1000;' +
      'display:flex;align-items:center;justify-content:flex-start;gap:0.5rem 1.5rem;' +
      'flex-wrap:wrap;padding:14px clamp(16px,5vw,48px);background:#0D4B47;color:#FFFFFF;' +
      'border-top:1px solid rgba(246,246,242,0.16);' +
      "font-family:'Instrument Sans',ui-sans-serif,system-ui,-apple-system,'Segoe UI',sans-serif;" +
      'font-size:15px;line-height:1.4;visibility:hidden}' +
      '.lang-suggest.is-visible{visibility:visible}' +
      '.lang-suggest-cta{color:#FFC93A;font-weight:500;text-decoration:underline;' +
      'text-underline-offset:4px;text-decoration-thickness:1px}' +
      '.lang-suggest-cta:hover{text-decoration-color:#F65A3C}' +
      '.lang-suggest-close{margin-left:auto;background:none;border:none;color:#FFFFFF;opacity:0.75;' +
      'font-size:1.25rem;line-height:1;cursor:pointer;padding:0 0.25rem}' +
      '.lang-suggest-close:hover{opacity:1}' +
      '.lang-suggest a:focus-visible,.lang-suggest button:focus-visible{outline:2px solid #FFC93A;outline-offset:2px}';
    document.head.appendChild(style);

    var bar = document.createElement('div');
    bar.className = 'lang-suggest';
    bar.setAttribute('role', 'region');
    bar.setAttribute('aria-label', browserLang === 'fr' ? 'Choix de langue' : 'Language choice');

    var msg = document.createElement('span');
    msg.className = 'lang-suggest-msg';
    msg.textContent = copy.msg;

    var cta = document.createElement('a');
    cta.className = 'lang-suggest-cta';
    cta.href = alt.getAttribute('href');
    cta.textContent = copy.cta;
    cta.addEventListener('click', function () { setCookie(COOKIE, browserLang); });

    var close = document.createElement('button');
    close.className = 'lang-suggest-close';
    close.type = 'button';
    close.setAttribute('aria-label', copy.close);
    close.textContent = '×';
    close.addEventListener('click', function () {
      setCookie(COOKIE, pageLang);
      bar.classList.remove('is-visible');
      setTimeout(function () { bar.remove(); }, 350);
    });

    bar.appendChild(msg);
    bar.appendChild(cta);
    bar.appendChild(close);
    document.body.appendChild(bar);
    requestAnimationFrame(function () {
      requestAnimationFrame(function () { bar.classList.add('is-visible'); });
    });
  }

  if (document.body) init();
  else document.addEventListener('DOMContentLoaded', init);
})();
