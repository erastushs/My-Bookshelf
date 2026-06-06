import {
  loadBooks,
  addBook,
  deleteBook,
  toggleBookStatus,
  getStats,
  filterBooks,
  onChange,
  isStorageAvailable,
} from './data.js';

import {
  renderBooks,
  renderStats,
  showEmptyState,
  hideEmptyStates,
  updateSectionTitle,
} from './components.js';

let activeTab = 'reading';
let searchQuery = '';
let pendingDeleteId = null;

const searchInput = document.getElementById('search-input');
const booksGrid = document.getElementById('books-grid');
const addBookModal = document.getElementById('add-book-modal');
const deleteModal = document.getElementById('delete-modal');
const addBookForm = document.getElementById('add-book-form');
const tabReading = document.getElementById('tab-reading');
const tabCompleted = document.getElementById('tab-completed');

function refreshUI() {
  const stats = getStats();
  renderStats(stats);

  const filtered = filterBooks(activeTab, searchQuery);
  renderBooks(filtered, booksGrid, handleToggle, handleDeleteClick);
  updateSectionTitle(activeTab, filtered.length);

  hideEmptyStates();

  if (booksGrid.children.length === 0) {
    if (searchQuery) {
      showEmptyState('search');
    } else {
      showEmptyState('none');
    }
  }
}

function handleToggle(id) {
  toggleBookStatus(id);
}

function handleDeleteClick(id) {
  pendingDeleteId = id;
  deleteModal.showModal();
}

function confirmDelete() {
  if (pendingDeleteId !== null) {
    deleteBook(pendingDeleteId);
    pendingDeleteId = null;
  }
  deleteModal.close();
}

function handleAddBook(e) {
  e.preventDefault();

  const title = document.getElementById('title-field').value.trim();
  const author = document.getElementById('author-field').value.trim();
  const year = document.getElementById('year-field').value;
  const isCompleted = document.getElementById('finished-read-checkbox').checked;

  if (!title || !author || !year) return;

  addBook(title, author, year, isCompleted);
  addBookForm.reset();
  addBookModal.close();
}

function switchTab(tab) {
  activeTab = tab;

  tabReading.classList.toggle('active', tab === 'reading');
  tabReading.setAttribute('aria-selected', tab === 'reading');
  tabCompleted.classList.toggle('active', tab === 'completed');
  tabCompleted.setAttribute('aria-selected', tab === 'completed');

  searchInput.value = '';
  searchQuery = '';
  refreshUI();
}

function handleSearch() {
  searchQuery = searchInput.value.trim();
  refreshUI();
}

function toggleTheme() {
  const html = document.documentElement;
  const current = html.getAttribute('data-theme');
  const next = current === 'dark' ? 'light' : 'dark';
  html.setAttribute('data-theme', next);
  localStorage.setItem('bookshelf-theme', next);
}

function initTheme() {
  const saved = localStorage.getItem('bookshelf-theme');
  if (saved) {
    document.documentElement.setAttribute('data-theme', saved);
  }
}

function setupYearPicker() {
  const yearInput = document.getElementById('year-field');
  const toggleBtn = document.getElementById('year-toggle-btn');
  const dropdown = document.getElementById('year-dropdown');
  const dropdownInner = document.getElementById('year-dropdown-inner');

  if (!yearInput || !toggleBtn || !dropdown || !dropdownInner) return;

  const currentYear = new Date().getFullYear();
  const startYear = 1900;

  for (let y = currentYear + 1; y >= startYear; y--) {
    const opt = document.createElement('div');
    opt.className = 'year-option';
    opt.textContent = y;
    opt.setAttribute('data-year', y);
    opt.addEventListener('mousedown', (e) => {
      e.preventDefault();
      yearInput.value = y;
      opt.classList.add('selected');
      closeDropdown();
    });
    dropdownInner.appendChild(opt);
  }

  function openDropdown() {
    dropdown.classList.add('open');
    toggleBtn.classList.add('open');

    const currentVal = parseInt(yearInput.value, 10);
    if (currentVal) {
      const selected = dropdownInner.querySelector(`[data-year="${currentVal}"]`);
      if (selected) {
        selected.classList.add('selected');
        selected.scrollIntoView({ block: 'center' });
      }
    }
  }

  function closeDropdown() {
    dropdown.classList.remove('open');
    toggleBtn.classList.remove('open');
  }

  toggleBtn.addEventListener('click', (e) => {
    e.stopPropagation();
    if (dropdown.classList.contains('open')) {
      closeDropdown();
    } else {
      openDropdown();
    }
  });

  yearInput.addEventListener('focus', () => {
    if (!dropdown.classList.contains('open')) {
      openDropdown();
    }
  });

  yearInput.addEventListener('input', () => {
    dropdownInner.querySelectorAll('.year-option').forEach((el) => el.classList.remove('selected'));
    const val = parseInt(yearInput.value, 10);
    if (val) {
      const match = dropdownInner.querySelector(`[data-year="${val}"]`);
      if (match) {
        match.classList.add('selected');
        match.scrollIntoView({ block: 'center' });
      }
    }
  });

  yearInput.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
      closeDropdown();
    }
  });

  document.addEventListener('click', (e) => {
    if (!yearInput.parentElement.contains(e.target)) {
      closeDropdown();
    }
  });
}

function setupModals() {
  document.querySelectorAll('[data-close-modal]').forEach((btn) => {
    btn.addEventListener('click', () => {
      addBookModal.close();
      deleteModal.close();
      pendingDeleteId = null;
    });
  });

  addBookModal.addEventListener('click', (e) => {
    if (e.target === addBookModal) {
      addBookModal.close();
    }
  });

  deleteModal.addEventListener('click', (e) => {
    if (e.target === deleteModal) {
      deleteModal.close();
      pendingDeleteId = null;
    }
  });

  addBookModal.addEventListener('close', () => {
    addBookForm.reset();
  });

  deleteModal.addEventListener('close', () => {
    if (pendingDeleteId !== null) {
      pendingDeleteId = null;
    }
  });
}

function init() {
  if (!isStorageAvailable()) {
    document.body.innerHTML =
      '<p style="padding:48px;text-align:center;color:var(--text-secondary)">Your browser does not support local storage. Please use a modern browser.</p>';
    return;
  }

  initTheme();
  loadBooks();

  document.getElementById('add-book-btn').addEventListener('click', () => {
    addBookModal.showModal();
    setTimeout(() => {
      document.getElementById('title-field').focus();
    }, 100);
  });

  document.getElementById('empty-add-btn').addEventListener('click', () => {
    addBookModal.showModal();
    setTimeout(() => {
      document.getElementById('title-field').focus();
    }, 100);
  });

  document.getElementById('theme-toggle').addEventListener('click', toggleTheme);

  document.getElementById('confirm-delete-btn').addEventListener('click', confirmDelete);

  tabReading.addEventListener('click', () => switchTab('reading'));
  tabCompleted.addEventListener('click', () => switchTab('completed'));

  searchInput.addEventListener('input', handleSearch);

  addBookForm.addEventListener('submit', handleAddBook);

  setupModals();

  setupYearPicker();

  onChange(refreshUI);
  refreshUI();
}

document.addEventListener('DOMContentLoaded', init);
