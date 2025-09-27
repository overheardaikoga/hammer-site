// ===== Hammer-Site — save.js (safe scope) =====
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

      // файлы
      const [mainCss, appCss, appJs, saveJs] = await Promise.all([
        safeFetch('css/main.css'),
        safeFetch('css/app.css'),
        safeFetch('js/app.js'),
        safeFetch('js/save.js')
      ]);

      // html
      const ext = (!photoWrap.hidden && photoPreview.src.startsWith('data:image'))
            ? photoPreview.src.match(/data:image\/(\w+)/)[1]
            : 'jpg';

      const html = `<!DOCTYPE html>
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
    <div class="button-group">
      <a href="#" id="uploadBtn" class="btn">📷 Upload Photo</a>
      <a href="#" id="editBtn" class="btn">✏️ Edit Text</a>
      <a href="#" id="downloadBtn" class="btn">💾 Download</a>
      <a href="#" id="randomBtn" class="btn">🔨 Random Nail</a>
      <button id="btnReset" style="font-size:10px;opacity:.5;border:none;background:none;cursor:pointer;">reset</button>
    </div>

    <h1 id="headline">${headline.innerText}</h1>
    <p id="subline">${subline.innerText}</p>
    <p id="quote"><em>${quote.innerText}</em></p>

    <div class="cta-box">
      <select id="ctaSelect" class="btn small">
        <option value="Buy" ${ctaSelect.value==='Buy'?'selected':''}>Buy</option>
        <option value="Book" ${ctaSelect.value==='Book'?'selected':''}>Book</option>
        <option value="Join" ${ctaSelect.value==='Join'?'selected':''}>Join</option>
      </select>
      <a id="ctaButton" href="#" class="btn">${ctaSelect.value}</a>
    </div>

    ${
      photoWrap.hidden
        ? ''
        : `<div id="photoWrap" class="photo-wrap img-card">
             <img src="assets/photo.${ext}" alt="photo"/>
           </div>`
    }

    <section class="launch"><a href="#" class="btn">Launch Now</a></section>
    <footer><p>© 2025 OverheardAI Project</p></footer>
  </div>

  <input type="file" id="fileInput" accept="image/*" hidden />
  <script src="js/app.js"></script>
  <script src="js/save.js"></script>
</body>
</html>`;

      // кладём файлы
      zip.file("index.html", html);
      zip.file("css/main.css", mainCss);
      zip.file("css/app.css",  appCss);
      zip.file("js/app.js",   appJs);
      zip.file("js/save.js",  saveJs);

      // картинка
      if (!photoWrap.hidden && photoPreview.src.startsWith('data:image')) {
        const base64 = photoPreview.src.split(',')[1];
        zip.file(`assets/photo.${ext}`, base64, {base64: true});
      }

      // скачать
      const blob = await zip.generateAsync({type: 'blob'});
      saveAs(blob, 'hammer-site.zip');
    });
  }
})();
