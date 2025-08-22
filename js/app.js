// ===== Hammer-Site — app.js =====

// Элементы
const uploadBtn     = document.getElementById("uploadBtn");
const editBtn       = document.getElementById("editBtn");
const randomBtn     = document.getElementById("randomBtn");
const downloadBtn   = document.getElementById("downloadBtn");
const btnReset      = document.getElementById("btnReset");

const fileInput     = document.getElementById("fileInput");
const photoWrap     = document.getElementById("photoWrap");
const photoPreview  = document.getElementById("photoPreview");
const removePhoto   = document.getElementById("removePhoto");

const presetPopover = document.getElementById("presetPopover");
const textPopover   = document.getElementById("textPopover");

const editForm      = document.getElementById("editForm");
const editInput     = document.getElementById("editInput");
const editCancel    = document.getElementById("editCancel");

const headline      = document.getElementById("headline");
const subline       = document.getElementById("subline");
const quote         = document.getElementById("quote");

// --- Upload Photo ---
uploadBtn.addEventListener("click", e=>{
  e.preventDefault();
  presetPopover.hidden = false;
});
presetPopover.addEventListener("click", e=>{
  if(e.target.classList.contains("pop-btn")){
    const preset = e.target.dataset.preset;
    photoWrap.className = "photo-wrap " + preset;
    fileInput.click();
    presetPopover.hidden = true;
  } else if(e.target === presetPopover){
    presetPopover.hidden = true;
  }
});
fileInput.addEventListener("change", e=>{
  const file = e.target.files[0];
  if(file){
    const reader = new FileReader();
    reader.onload = ev=>{
      photoPreview.src = ev.target.result;
      photoWrap.hidden = false;
    };
    reader.readAsDataURL(file);
  }
});
removePhoto.addEventListener("click", ()=>{
  photoPreview.src = "";
  photoWrap.hidden = true;
  fileInput.value = "";
});

// --- Edit Text ---
let currentTarget = null;
editBtn.addEventListener("click", e=>{
  e.preventDefault();
  textPopover.hidden = false;
});
textPopover.addEventListener("click", e=>{
  if(e.target.classList.contains("pop-btn")){
    currentTarget = e.target.dataset.target;
    editInput.value = document.getElementById(currentTarget).innerText;
    editForm.hidden = false;
    textPopover.hidden = true;
    editInput.focus();
  } else if(e.target === textPopover){
    textPopover.hidden = true;
  }
});
editForm.addEventListener("submit", e=>{
  e.preventDefault();
  if(currentTarget){
    document.getElementById(currentTarget).innerText = editInput.value;
  }
  editForm.hidden = true;
});
editCancel.addEventListener("click", ()=>{
  editForm.hidden = true;
});

// --- Random Nail ---
const nails = [
  "Every hit counts.",
  "Keep hammering forward.",
  "Strong sites, simple tools.",
  "One nail at a time.",
  "Focus. Strike. Build."
];
randomBtn.addEventListener("click", e=>{
  e.preventDefault();
  const rnd = nails[Math.floor(Math.random()*nails.length)];
  quote.innerText = rnd;
});

// --- Download (сохраняем HTML как txt) ---
downloadBtn.addEventListener("click", e=>{
  e.preventDefault();
  const blob = new Blob([document.documentElement.outerHTML], {type:"text/html"});
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = "hammer-site.html";
  a.click();
  URL.revokeObjectURL(url);
});

// --- Reset (возврат к изначальному состоянию) ---
btnReset.addEventListener("click", ()=>{
  headline.innerText = "Привет, команда!";
  subline.innerText  = "«Молоток — в руку!»";
  quote.innerText    = "One hammer hit at a time.";

  photoPreview.src = "";
  photoWrap.hidden = true;
  fileInput.value = "";
  
  editForm.hidden = true;
  presetPopover.hidden = true;
  textPopover.hidden = true;
});


