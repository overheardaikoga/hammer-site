// ==== main buttons ====
const uploadBtn   = document.getElementById('uploadBtn');
const editBtn     = document.getElementById('editBtn');
const downloadBtn = document.getElementById('downloadBtn');
const randomBtn   = document.getElementById('randomBtn');
const resetBtn = document.getElementById('btnReset');

// ==== image elements ====
const fileInput = document.getElementById('fileInput');
const preview   = document.getElementById('preview');

// ==== text elements ====
const textEl = document.getElementById('editableText');
const quoteEl = document.getElementById('quote');

// ==== nails (цитаты) ====
const nails = [
  "Сильнее молота только терпение.",
  "Каждый гвоздь найдёт свой молоток.",
  "Молоток в руку — и мир меняется.",
  "Гвозди держат дом, идеи — команду."
];

// ==== Upload ====
uploadBtn.addEventListener('click', (e) => {
  e.preventDefault();
  fileInput.click();
});

fileInput.addEventListener('change', (e) => {
  const file = e.target.files[0];
  if (file) {
    const reader = new FileReader();
    reader.onload = (ev) => {
      preview.src = ev.target.result;
    };
    reader.readAsDataURL(file);
  }
});

// ==== Edit text ====
editBtn.addEventListener('click', (e) => {
  e.preventDefault();
  textEl.contentEditable = textEl.contentEditable === 'true' ? 'false' : 'true';
  textEl.focus();
});

// ==== Random quote ====
randomBtn.addEventListener('click', (e) => {
  e.preventDefault();
  quoteEl.textContent = nails[Math.floor(Math.random() * nails.length)];
});

// ==== Download (экспорт текущей страницы как HTML) ====
downloadBtn.addEventListener('click', (e) => {
  e.preventDefault();
  const blob = new Blob([document.documentElement.outerHTML], { type: 'text/html' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = 'hammer-site.html';
  document.body.appendChild(a);
  a.click();
  a.remove();
  URL.revokeObjectURL(url);
});

// ==== Reset (очистка фото и текста) ====
resetBtn.addEventListener('click', (e) => {
  e.preventDefault();
  if (preview) preview.src = '';
  if (textEl) textEl.innerText = 'Привет, команда!\n«Молоток — в руку!»';
  if (quoteEl) quoteEl.textContent = '';
  console.log('Reset done');
});

