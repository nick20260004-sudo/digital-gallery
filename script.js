const cards = [...document.querySelectorAll('.asset-card')];
const moodMap = { motion: ['bold', 'playful'], textures: ['retro', 'dark', 'filmic'], fonts: ['clean', 'retro'], video: ['dreamy', 'playful'], transitions: ['bold', 'futuristic', 'dreamy', 'filmic'], ui: ['clean', 'playful'], luts: ['filmic', 'retro'], sound: ['futuristic', 'playful'], social: ['bold', 'playful'] };
let activeCategory = 'all';
let activeMood = 'all';
const navToggle = document.querySelector('.menu-toggle');
const navLinks = document.querySelector('.nav-links');
const storageModal = document.querySelector('#storage-modal');
const storageTrigger = document.querySelector('.storage-trigger');
let storageDirectory;
const assetModal = document.createElement('div');
assetModal.className = 'asset-modal';
assetModal.setAttribute('role', 'dialog');
assetModal.setAttribute('aria-modal', 'true');
assetModal.setAttribute('aria-hidden', 'true');
assetModal.innerHTML = `
  <div class="asset-dialog">
    <button class="asset-modal-close" type="button" aria-label="Close asset preview">×</button>
    <div class="asset-preview"></div>
    <div class="asset-dialog-copy">
      <p class="eyebrow"><span></span> Asset preview</p>
      <h2 class="asset-dialog-title"></h2>
      <p class="asset-dialog-description"></p>
      <div class="asset-dialog-meta"></div>
      <button class="asset-download" type="button">Download asset <span>↓</span></button>
    </div>
  </div>`;
document.body.append(assetModal);
const assetPreview = assetModal.querySelector('.asset-preview');
const assetTitle = assetModal.querySelector('.asset-dialog-title');
const assetDescription = assetModal.querySelector('.asset-dialog-description');
const assetMeta = assetModal.querySelector('.asset-dialog-meta');
const assetDownload = assetModal.querySelector('.asset-download');
let activeAsset;

const applyFilters = () => {
  cards.forEach((card) => {
    const categoryMatches = activeCategory === 'all' || card.dataset.category === activeCategory;
    const moodMatches = activeMood === 'all' || (moodMap[card.dataset.category] || []).includes(activeMood);
    card.hidden = !(categoryMatches && moodMatches);
  });
};

const closeStorageModal = () => {
  storageModal.classList.remove('open');
  storageModal.setAttribute('aria-hidden', 'true');
};

const openStorageModal = () => {
  storageModal.classList.add('open');
  storageModal.setAttribute('aria-hidden', 'false');
  storageModal.querySelector('.modal-close').focus();
};

const closeAssetModal = () => {
  assetModal.classList.remove('open');
  assetModal.setAttribute('aria-hidden', 'true');
  activeAsset = null;
};

const openAssetModal = (card) => {
  activeAsset = card;
  const title = card.querySelector('h3').textContent.trim();
  const category = card.querySelector('.asset-category').textContent.trim();
  const creator = card.querySelector('.asset-meta span').textContent.trim();
  const format = card.querySelectorAll('.asset-meta span')[1].textContent.trim();
  assetTitle.textContent = title;
  assetDescription.textContent = `A ready-to-use ${category.toLowerCase()} asset ${creator.toLowerCase()}. Preview the artwork here, then download a usable SVG reference file for your project.`;
  assetMeta.textContent = `${category} · ${creator} · ${format}`;
  assetPreview.replaceChildren(card.querySelector('.thumbnail').cloneNode(true));
  assetModal.classList.add('open');
  assetModal.setAttribute('aria-hidden', 'false');
  assetModal.querySelector('.asset-modal-close').focus();
};

const downloadAsset = (card) => {
  const title = card.querySelector('h3').textContent.trim();
  const category = card.querySelector('.asset-category').textContent.trim();
  const color = getComputedStyle(card.querySelector('.thumbnail')).backgroundColor || '#e9e5ff';
  const safeName = title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="1200" height="800" viewBox="0 0 1200 800"><rect width="1200" height="800" rx="36" fill="${color}"/><text x="70" y="110" font-family="Arial,sans-serif" font-size="24" letter-spacing="4" fill="#202229">${category.toUpperCase()}</text><text x="70" y="410" font-family="Georgia,serif" font-size="76" fill="#202229">${title}</text><text x="70" y="730" font-family="Arial,sans-serif" font-size="20" fill="#555">${creatorLabel(card)}</text></svg>`;
  const blob = new Blob([svg], { type: 'image/svg+xml' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = `${safeName || 'digital-gallery-asset'}.svg`;
  link.click();
  URL.revokeObjectURL(url);
};

const creatorLabel = (card) => card.querySelector('.asset-meta span').textContent.trim();

const setStorageState = (connected) => {
  storageTrigger.classList.toggle('connected', connected);
  storageTrigger.innerHTML = connected
    ? '<span class="storage-dot"></span> Storage connected'
    : '<span class="storage-dot"></span> Connect storage';
};

const connectStorage = async () => {
  if (!('showDirectoryPicker' in window)) {
    closeStorageModal();
    return;
  }
  try {
    storageDirectory = await window.showDirectoryPicker({ mode: 'readwrite', startIn: 'downloads' });
    setStorageState(true);
    closeStorageModal();
  } catch (error) {
    if (error.name !== 'AbortError') {
      window.alert('We could not connect that folder. Please try again.');
    }
  }
};

navToggle.addEventListener('click', () => {
  const open = navLinks.classList.toggle('open');
  navToggle.setAttribute('aria-expanded', String(open));
});

storageTrigger.addEventListener('click', () => {
  if (storageDirectory) {
    setStorageState(true);
  } else {
    openStorageModal();
  }
});
document.querySelector('.connect-button').addEventListener('click', connectStorage);
document.querySelector('.not-now').addEventListener('click', closeStorageModal);
document.querySelector('.modal-close').addEventListener('click', closeStorageModal);
assetModal.querySelector('.asset-modal-close').addEventListener('click', closeAssetModal);
assetModal.addEventListener('click', (event) => {
  if (event.target === assetModal) closeAssetModal();
});
storageModal.addEventListener('click', (event) => {
  if (event.target === storageModal) closeStorageModal();
});
document.addEventListener('keydown', (event) => {
  if (event.key === 'Escape' && storageModal.classList.contains('open')) closeStorageModal();
  if (event.key === 'Escape' && assetModal.classList.contains('open')) closeAssetModal();
});

document.querySelectorAll('.category-chip').forEach((chip) => {
  chip.addEventListener('click', () => {
    document.querySelector('.category-chip.selected')?.classList.remove('selected');
    chip.classList.add('selected');
    activeCategory = chip.dataset.filter;
    applyFilters();
  });
});

document.querySelectorAll('.mood-chip').forEach((chip) => {
  chip.addEventListener('click', () => {
    document.querySelector('.mood-chip.selected')?.classList.remove('selected');
    chip.classList.add('selected');
    activeMood = chip.dataset.mood;
    applyFilters();
  });
});

document.querySelectorAll('.popular button').forEach((button) => {
  button.addEventListener('click', () => {
    document.querySelector('#asset-search').value = button.textContent.trim();
    document.querySelector('#search-form').requestSubmit();
  });
});

document.querySelectorAll('.save-button').forEach((button) => {
  button.setAttribute('aria-pressed', 'false');
  button.addEventListener('click', () => {
    const saved = button.getAttribute('aria-pressed') === 'true';
    button.textContent = saved ? '♡' : '♥';
    button.setAttribute('aria-pressed', String(!saved));
  });
});

cards.forEach((card) => {
  card.setAttribute('tabindex', '0');
  card.setAttribute('role', 'button');
  card.addEventListener('click', (event) => {
    if (event.target.closest('button')) return;
    openAssetModal(card);
  });
  card.addEventListener('keydown', (event) => {
    if ((event.key === 'Enter' || event.key === ' ') && event.target === card) {
      event.preventDefault();
      openAssetModal(card);
    }
  });
});

document.querySelectorAll('.download').forEach((button) => {
  button.addEventListener('click', () => {
    const card = button.closest('.asset-card');
    downloadAsset(card);
    button.textContent = 'Downloaded ✓';
    window.setTimeout(() => { button.innerHTML = 'Download <span>↓</span>'; }, 1800);
  });
});

assetDownload.addEventListener('click', () => {
  if (!activeAsset) return;
  downloadAsset(activeAsset);
  assetDownload.innerHTML = 'Downloaded <span>✓</span>';
  window.setTimeout(() => { assetDownload.innerHTML = 'Download asset <span>↓</span>'; }, 1800);
});

document.querySelector('#search-form').addEventListener('submit', (event) => {
  event.preventDefault();
  const query = document.querySelector('#asset-search').value.trim().toLowerCase();
  cards.forEach((card) => {
    card.hidden = Boolean(query) && !card.textContent.toLowerCase().includes(query);
  });
  document.querySelector('#browse').scrollIntoView({ behavior: 'smooth', block: 'start' });
});

closeStorageModal();
applyFilters();
