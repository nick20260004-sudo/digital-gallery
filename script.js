const navToggle = document.querySelector('.menu-toggle');
const navLinks = document.querySelector('.nav-links');
navToggle.addEventListener('click', () => {
  const open = navLinks.classList.toggle('open');
  navToggle.setAttribute('aria-expanded', open);
});

let storageDirectory;
const storageModal = document.querySelector('#storage-modal');
const storageTrigger = document.querySelector('.storage-trigger');
const hideStorageModal = () => storageModal.classList.add('hidden');
const setStorageState = (connected) => { storageTrigger.classList.toggle('connected', connected); storageTrigger.innerHTML = connected ? '<span class="storage-dot"></span> Storage connected' : '<span class="storage-dot"></span> Connect storage'; };
const connectStorage = async () => {
  if (!('showDirectoryPicker' in window)) { alert('Folder connection is supported in Chrome and Edge. Your browser will use its normal download folder instead.'); hideStorageModal(); return; }
  try { storageDirectory = await window.showDirectoryPicker({ mode: 'readwrite', startIn: 'downloads' }); setStorageState(true); hideStorageModal(); }
  catch (error) { if (error.name !== 'AbortError') alert('We could not connect that folder. Please try again.'); }
};
document.querySelector('.connect-button').addEventListener('click', connectStorage);
storageTrigger.addEventListener('click', () => storageDirectory ? setStorageState(true) : storageModal.classList.remove('hidden'));
document.querySelector('.not-now').addEventListener('click', hideStorageModal);
document.querySelector('.modal-close').addEventListener('click', hideStorageModal);

const cards = [...document.querySelectorAll('.asset-card')];
const moodMap = { motion: ['bold', 'playful'], textures: ['retro', 'dark', 'filmic'], fonts: ['clean', 'retro'], video: ['dreamy', 'playful'], transitions: ['bold', 'futuristic', 'dreamy', 'filmic'], ui: ['clean', 'playful'], luts: ['filmic', 'retro'], sound: ['futuristic', 'playful'], social: ['bold', 'playful'] };
let activeCategory = 'all';
let activeMood = 'all';
const applyFilters = () => cards.forEach((card) => {
  const categoryMatches = activeCategory === 'all' || card.dataset.category === activeCategory;
  const moodMatches = activeMood === 'all' || moodMap[card.dataset.category].includes(activeMood);
  card.style.display = categoryMatches && moodMatches ? '' : 'none';
});
document.querySelectorAll('.category-chip').forEach((chip) => {
  chip.addEventListener('click', () => {
    document.querySelector('.category-chip.selected').classList.remove('selected');
    chip.classList.add('selected');
    activeCategory = chip.dataset.filter;
    applyFilters();
  });
});

document.querySelectorAll('.mood-chip').forEach((chip) => {
  chip.addEventListener('click', () => {
    document.querySelector('.mood-chip.selected').classList.remove('selected');
    chip.classList.add('selected');
    activeMood = chip.dataset.mood;
    applyFilters();
  });
});

document.querySelectorAll('.save-button').forEach((button) => {
  button.addEventListener('click', () => {
    const saved = button.textContent === '♥';
    button.textContent = saved ? '♡' : '♥';
    button.setAttribute('aria-pressed', String(!saved));
  });
});

document.querySelectorAll('.download').forEach((button) => {
  button.addEventListener('click', () => {
    const original = button.innerHTML;
    button.textContent = 'Added to downloads ✓';
    button.disabled = true;
    setTimeout(() => { button.innerHTML = original; button.disabled = false; }, 1800);
  });
});

const searchForm = document.querySelector('#search-form');
searchForm.addEventListener('submit', (event) => {
  event.preventDefault();
  const query = document.querySelector('#asset-search').value.trim().toLowerCase();
  cards.forEach((card) => {
    card.style.display = !query || card.textContent.toLowerCase().includes(query) ? '' : 'none';
  });
  document.querySelector('#browse').scrollIntoView({ behavior: 'smooth', block: 'start' });
});
