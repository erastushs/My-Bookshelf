const STORAGE_KEY = 'BOOKSHELF_APPS';
const books = [];
const listeners = [];

export function onChange(fn) {
  listeners.push(fn);
}

function notify() {
  listeners.forEach((fn) => fn());
}

export function getBooks() {
  return books;
}

export function loadBooks() {
  const serialized = localStorage.getItem(STORAGE_KEY);
  if (!serialized) return;

  let data;
  try {
    data = JSON.parse(serialized);
  } catch {
    return;
  }

  if (!Array.isArray(data)) return;

  books.length = 0;
  for (const book of data) {
    books.push(book);
  }
}

function saveBooks() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(books));
}

export function generateId() {
  return +new Date();
}

export function addBook(title, author, year, isCompleted) {
  const book = {
    id: generateId(),
    title,
    author,
    realese: String(year),
    isCompleted,
  };
  books.push(book);
  saveBooks();
  notify();
  return book;
}

export function deleteBook(id) {
  const index = books.findIndex((b) => b.id === id);
  if (index === -1) return false;
  books.splice(index, 1);
  saveBooks();
  notify();
  return true;
}

export function toggleBookStatus(id) {
  const book = books.find((b) => b.id === id);
  if (!book) return false;
  book.isCompleted = !book.isCompleted;
  saveBooks();
  notify();
  return true;
}

export function getStats() {
  const total = books.length;
  const reading = books.filter((b) => !b.isCompleted).length;
  const completed = books.filter((b) => b.isCompleted).length;
  const rate = total > 0 ? Math.round((completed / total) * 100) : 0;
  return { total, reading, completed, rate };
}

export function filterBooks(tab, query) {
  let filtered = [...books];

  if (tab === 'reading') {
    filtered = filtered.filter((b) => !b.isCompleted);
  } else if (tab === 'completed') {
    filtered = filtered.filter((b) => b.isCompleted);
  }

  if (query) {
    const q = query.toLowerCase();
    filtered = filtered.filter((b) => b.title.toLowerCase().includes(q));
  }

  return filtered;
}

export function isStorageAvailable() {
  try {
    const key = '__storage_test__';
    localStorage.setItem(key, key);
    localStorage.removeItem(key);
    return true;
  } catch {
    return false;
  }
}
