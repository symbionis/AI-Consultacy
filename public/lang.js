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
      '.lang-suggest{position:fixed;left:0;right:0;bottom:0;z-index:1000;' +
      'display:flex;align-items:center;justify-content:center;gap:0.5rem 1.25rem;' +
      'flex-wrap:wrap;padding:0.8rem 1.25rem;background:#1B3A57;color:#F4F1EA;' +
      "font-family:'Inter',-apple-system,BlinkMacSystemFont,system-ui,sans-serif;" +
      'font-size:0.9rem;line-height:1.4;box-shadow:0 -1px 16px rgba(0,0,0,0.16);' +
      'transform:translateY(100%);transition:transform 0.35s ease}' +
      '.lang-suggest.is-visible{transform:translateY(0)}' +
      '.lang-suggest-msg{opacity:0.88}' +
      '.lang-suggest-cta{color:#C9A24B;font-weight:600;text-decoration:none;' +
      'border-bottom:1px solid rgba(201,162,75,0.4);padding-bottom:1px}' +
      '.lang-suggest-cta:hover{border-bottom-color:#C9A24B}' +
      '.lang-suggest-close{background:none;border:none;color:#F4F1EA;opacity:0.55;' +
      'font-size:1.2rem;line-height:1;cursor:pointer;padding:0 0.2rem;' +
      'transition:opacity 0.2s ease}' +
      '.lang-suggest-close:hover{opacity:1}' +
      '@media (prefers-reduced-motion:reduce){.lang-suggest{transition:none}}';
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
