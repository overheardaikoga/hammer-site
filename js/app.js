// ===== Hammer-Site — js/app.js (sync with current index.html) =====

// main buttons
const uploadBtn   = document.getElementById('uploadBtn');
const editBtn     = document.getElementById('editBtn');
const downloadBtn = document.getElementById('downloadBtn');
const randomBtn   = document.getElementById('randomBtn');

// image elements
const fileInput    = document.getElementById('fileInput');
const photoWrap    = document.getElementById('photoWrap');
const photoPreview = document.getElementById('photoPreview');
const removePhoto  = document.getElementById('removePhoto');

// text zones
const headlineEl = document.getElementById('headline');
const sublineEl  = document.getElementById('subline');
const quoteEl    = document.getElementById('quote');

// popovers + inline editor
const presetPopover = document.getElementById('presetPopover'); // Image preset menu
const textPopover   = document.getElementById('textPopover');   // Text target menu
const editForm      = document.getElementById('editForm');
const editInput     = document.getElementById('editInput');
const editCancel    = document.getElementById('editCancel');

// state
let selectedPreset = 'img-card';   // img-hero | img-card | img-avatar
let selectedTarget = null;         // headline | subline | quote

// helpers
const PRESETS = ['img-hero','img-card','img-avatar'];
function applyPreset(cls){
  PRESETS.forEach(c => photoWrap.classList.remove(c));
  photoWrap.classList.add(cls);
}
function closePopovers(){
  presetPopover.hidden = true;
  textPopover.hidden   = true;
}
function insidePopover(el){ return el.closest('.popover-inner'); }

// ==== Upload Photo ====
// показать меню пресетов
uploadBtn.addEventListener('click', (e)=>{
  e.preventDefault();
  closePopovers();
  presetPopover.hidden = false;
});

// клик по пресету -> применить + открыть выбор файла
presetPopover.querySelectorAll('[data-preset]').forEach(btn=>{
  btn.addEventListener('click', ()=>{
    selectedPreset = btn.dataset.preset;                 // img-hero | img-card | img-avatar
    applyPreset(selectedPreset);
    presetPopover.hidden = true;                          // закрыть меню
    fileInput.click();                                    // открыть файловый диалог
  });
});

// загрузка файла
fileInput.addEventListener('change', (e)=>{
  const file = e.target.files?.[0];
  if(!file) return;
  const r = new FileReader();
  r.onload = ()=>{
    photoPreview.src = r.result;
    photoWrap.hidden = false;
  };
  r.readAsDataURL(file);
});

// удалить фото
removePhoto.addEventListener('click', (e)=>{
  e.preventDefault();
  photoPreview.src = '';
  fileInput.value  = '';
  photoWrap.hidden = true;
});

// ==== Edit Text ====
// показать меню выбора цели
editBtn.addEventListener('click', (e)=>{
  e.preventDefault();
  closePopovers();
  textPopover.hidden = false;
});

// выбор цели -> показать инлайн-редактор
textPopover.querySelectorAll('[data-target]').forEach(btn=>{
  btn.addEventListener('click', ()=>{
    selectedTarget = btn.dataset.target;  // headline | subline | quote
    textPopover.hidden = true;

    const map = { headline: headlineEl, subline: sublineEl, quote: quoteEl };
    const el = map[selectedTarget] || sublineEl;

    editInput.value = el.textContent;
    editForm.hidden = false;
    editInput.focus();
  });
});

// сохранить текст
editForm.addEventListener('submit', (e)=>{
  e.preventDefault();
  if(!selectedTarget) return;
  const map = { headline: headlineEl, subline: sublineEl, quote: quoteEl };
  map[selectedTarget].textContent = editInput.value;
  editForm.hidden = true;
  selectedTarget = null;
});

// отменить редактирование
editCancel.addEventListener('click', ()=>{
  editForm.hidden = true;
  selectedTarget = null;
});

// ==== Random Nail (только Quote) ====
const nails = [
  'Build step by step.',
  'Strong foundation, strong future.',
  'Clear mind — clear action.',
  'Simplicity drives progress.',
  'One hammer hit at a time.'
];
randomBtn.addEventListener('click', (e)=>{
  e.preventDefault();
  quoteEl.textContent = nails[Math.floor(Math.random()*nails.length)];
});

// ==== Download (экспорт текущей страницы как HTML) ====
downloadBtn.addEventListener('click', (e)=>{
  e.preventDefault();
  const blob = new Blob([document.documentElement.outerHTML], {type:'text/html'});
  const url  = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url; a.download = 'hammer-site.html';
  document.body.appendChild(a); a.click(); a.remove();
  URL.revokeObjectURL(url);
});

// ==== UX: клики вне попапа закрывают его; клики внутри — не всплывают ====
document.querySelectorAll('.popover-inner').forEach(el=>{
  el.addEventListener('click', (e)=> e.stopPropagation());
});
document.addEventListener('click', (e)=>{
  // фон попапа
  if (e.target === presetPopover) presetPopover.hidden = true;
  if (e.target === textPopover)   textPopover.hidden   = true;
});
