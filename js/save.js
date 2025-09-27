// ===== Hammer-Site — save.js =====
(() => {
  const STORAGE_KEY = 'hammer-site_v1';

  /* ---------- элементы ---------- */
  const ctaSelect    = document.getElementById('ctaSelect');
  const ctaButton    = document.getElementById('ctaButton');
  const downloadBtn  = document.getElementById('downloadBtn');
  const headline     = document.getElementById('headline');
  const subline      = document.getElementById('subline');
  const quote        = document.getElementById('quote');
  const photoPreview = document.getElementById('photoPreview');
  const photoWrap    = document.getElementById('photoWrap');

  /* ---------- синхронизация CTA ---------- */
  if (ctaSelect && ctaButton) {
    ctaButton.textContent = ctaSelect.value;
    ctaSelect.addEventListener('change', () => {
      ctaButton.textContent = ctaSelect.value;
      saveState();
    });
  }

  /* ---------- сохранение ---------- */
  function saveState() {
    const data = {
      headline: headline?.innerText || '',
      subline:  subline?.innerText  || '',
      quote:    quote?.innerText    || '',
      cta:      ctaSelect?.value    || '',
      img:      photoPreview?.src   || ''
    };
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  }

  /* ---------- восстановление ---------- */
  window.addEventListener('DOMContentLoaded', () => {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return;
    const d = JSON.parse(raw);
    if (d.headline) headline.innerText = d.headline;
    if (d.subline)  subline.innerText  = d.subline;
    if (d.quote)    quote.innerText    = d.quote;
    if (d.cta) {
      ctaSelect.value = d.cta;
      ctaButton.textContent = d.cta;
    }
    if (d.img) {
      photoPreview.src = d.img;
      photoWrap.hidden = false;
    }
  });

  /* ---------- безопасный fetch + fallback ---------- */
  async function safeFetch(path, fallback = '') {
    try {
      const r = await fetch(path);
      if (!r.ok) throw new Error(r.status);
      const text = await r.text();
      if (!text.trim()) throw new Error('empty');
      console.log('✅ ok:', path);
      return text;
    } catch (e) {
      console.warn('❌ fail:', path, e.message, '→ fallback');
      return fallback || '';
    }
  }

  /* ---------- ZIP-сборка ---------- */
  if (downloadBtn) {
    downloadBtn.addEventListener('click', async e => {
      e.preventDefault();
      const zip = new JSZip();

      // тянем index.html из DOM, остальные файлы через fetch
const indexHtml = document.documentElement.outerHTML;

const [mainCss, appCss, appJs, saveJs] = await Promise.all([
  safeFetch('css/main.css'),
  safeFetch('css/app.css'),
  safeFetch('js/app.js'),
  safeFetch('js/save.js')
]);

      // кладём файлы
      zip.file("index.html", indexHtml);
      zip.file("css/main.css", mainCss);
      zip.file("css/app.css",  appCss);
      zip.file("js/app.js",   appJs);
      zip.file("js/save.js",  saveJs);

      // картинка
      if (!photoWrap.hidden && photoPreview.src.startsWith('data:image')) {
        const ext = photoPreview.src.match(/data:image\/(\w+)/)[1];
        const base64 = photoPreview.src.split(',')[1];
        zip.file(`assets/photo.${ext}`, base64, {base64: true});
      }

      // скачать
      const blob = await zip.generateAsync({type: 'blob'});
      saveAs(blob, 'hammer-site.zip');
    });
  }
})();

