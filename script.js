const cards = [...document.querySelectorAll('.asset-card')];
const moodMap = { motion: ['bold', 'playful'], textures: ['retro', 'dark', 'filmic'], fonts: ['clean', 'retro'], video: ['dreamy', 'playful'], transitions: ['bold', 'futuristic', 'dreamy', 'filmic'], ui: ['clean', 'playful'], luts: ['filmic', 'retro'], sound: ['futuristic', 'playful'], social: ['bold', 'playful'] };
let activeCategory = 'all';
let activeMood = 'all';
const navToggle = document.querySelector('.menu-toggle');
const navLinks = document.querySelector('.nav-links');
const storageModal = document.querySelector('#storage-modal');
const storageTrigger = document.querySelector('.storage-trigger');
let storageDirectory;

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
storageModal.addEventListener('click', (event) => {
  if (event.target === storageModal) closeStorageModal();
});
document.addEventListener('keydown', (event) => {
  if (event.key === 'Escape' && storageModal.classList.contains('open')) closeStorageModal();
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

document.querySelectorAll('.download').forEach((button) => {
  button.addEventListener('click', () => {
    const original = button.innerHTML;
    button.textContent = 'Added to downloads ✓';
    button.disabled = true;
    window.setTimeout(() => {
      button.innerHTML = original;
      button.disabled = false;
    }, 1800);
  });
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
