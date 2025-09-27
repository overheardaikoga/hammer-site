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

  /* ---------- сохранение состояния ---------- */
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

  if (ctaSelect && ctaButton) {
    ctaButton.textContent = ctaSelect.value;
    ctaSelect.addEventListener('change', () => {
      ctaButton.textContent = ctaSelect.value;
      saveState();
    });
  }

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

  /* ---------- безопасный fetch ---------- */
  async function safeFetch(path, fallback = '') {
    try {
      const r = await fetch(path);
      if (!r.ok) throw new Error(r.status);
      const text = await r.text();
      if (!text.trim()) throw new Error('empty');
      return text;
    } catch (e) {
      console.warn('⚠ fetch fail:', path, '→ fallback');
      return fallback || '';
    }
  }

  /* ---------- шаблон оригинального index.html ---------- */
  const ORIGINAL_HTML = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <title>Hammer-Site</title>
  <link rel="stylesheet" href="css/main.css" />
  <link rel="stylesheet" href="css/app.css" />
</head>
<body>
  <div class="container">
    <h1 id="headline">Your headline</h1>
    <p id="subline">Your subline</p>
    <p id="quote"><em>Your quote</em></p>
    <div id="photoWrap" hidden>
      <img id="photoPreview" src="" alt="preview"/>
    </div>
    <select id="ctaSelect">
      <option value="Buy">Buy</option>
      <option value="Book">Book</option>
      <option value="Join">Join</option>
    </select>
    <a id="ctaButton" href="#" class="btn">Buy</a>
    <button id="downloadBtn">Download</button>
  </div>
  <script src="https://cdn.jsdelivr.net/npm/jszip@3.10.1/dist/jszip.min.js"></script>
  <script src="https://cdn.jsdelivr.net/npm/file-saver@2.0.5/dist/FileSaver.min.js"></script>
  <script src="js/app.js"></script>
  <script src="js/save.js"></script>
</body>
</html>`;

  /* ---------- ZIP-сборка ---------- */
  if (downloadBtn) {
    downloadBtn.addEventListener('click', async e => {
      e.preventDefault();
      const zip = new JSZip();

      // 1. fetch + fallback
      let indexSrc = await safeFetch('index.html', ORIGINAL_HTML);

      // 2. подставляем актуальное состояние
      indexSrc = indexSrc
        .replace(/<h1 id="headline">.*?<\/h1>/, `<h1 id="headline">${headline.innerText}</h1>`)
        .replace(/<p id="subline">.*?<\/p>/, `<p id="subline">${subline.innerText}</p>`)
        .replace(/<p id="quote"><em>.*?<\/em><\/p>/, `<p id="quote"><em>${quote.innerText}</em></p>`)
        .replace(/<option value="Buy"[^>]*>/, `<option value="Buy" ${ctaSelect.value==='Buy'?'selected':''}>`)
        .replace(/<option value="Book"[^>]*>/, `<option value="Book" ${ctaSelect.value==='Book'?'selected':''}>`)
        .replace(/<option value="Join"[^>]*>/, `<option value="Join" ${ctaSelect.value==='Join'?'selected':''}>`)
        .replace(/<a id="ctaButton"[^>]*>.*?<\/a>/, `<a id="ctaButton" href="#" class="btn">${ctaSelect.value}</a>`);

      // 3. фото
      if (!photoWrap.hidden && photoPreview.src.startsWith('data:image')) {
        const ext = photoPreview.src.match(/data:image\/(\w+)/)[1];
        const base64 = photoPreview.src.split(',')[1];
        zip.file(`assets/photo.${ext}`, base64, {base64: true});
        indexSrc = indexSrc.replace(
          /src=".*?"/,
          `src="assets/photo.${ext}"`
        );
      }

      // 4. остальные файлы
      const [mainCss, appCss, appJs, saveJs] = await Promise.all([
        safeFetch('css/main.css'),
        safeFetch('css/app.css'),
        safeFetch('js/app.js'),
        safeFetch('js/save.js')
      ]);

      zip.file("index.html", indexSrc);
      zip.file("css/main.css", mainCss);
      zip.file("css/app.css", appCss);
      zip.file("js/app.js", appJs);
      zip.file("js/save.js", saveJs);

      // 5. скачать
      const blob = await zip.generateAsync({type: 'blob'});
      saveAs(blob, 'hammer-site.zip');
    });
  }
})();
