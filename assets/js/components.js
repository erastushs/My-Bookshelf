const COVER_COLORS = [
  ['#6D28D9', '#4C1D95'],
  ['#DC2626', '#991B1B'],
  ['#059669', '#065F46'],
  ['#2563EB', '#1E40AF'],
  ['#D97706', '#B45309'],
  ['#7C3AED', '#5B21B6'],
  ['#0891B2', '#155E75'],
  ['#DB2777', '#BE185D'],
  ['#4F46E5', '#3730A3'],
  ['#65A30D', '#4D7C0F'],
];

function getCoverColor(title) {
  let hash = 0;
  for (let i = 0; i < title.length; i++) {
    hash = title.charCodeAt(i) + ((hash << 5) - hash);
  }
  return COVER_COLORS[Math.abs(hash) % COVER_COLORS.length];
}

export function createBookCard(book, onToggle, onDelete) {
  const card = document.createElement('div');
  card.className = 'book-card';
  card.setAttribute('role', 'listitem');
  card.setAttribute('data-book-id', book.id);

  const [c1, c2] = getCoverColor(book.title);

  card.innerHTML = `
    <div class="book-cover" style="background: linear-gradient(135deg, ${c1}, ${c2})">
      <div class="book-cover-inner">
        <span class="book-cover-text">${escapeHtml(book.title.substring(0, 3).toUpperCase())}</span>
      </div>
    </div>
    <div class="book-info">
      <h3 class="book-title" title="${escapeHtml(book.title)}">${escapeHtml(book.title)}</h3>
      <p class="book-author" title="${escapeHtml(book.author)}">${escapeHtml(book.author)}</p>
      <div class="book-meta">
        <span class="book-year">${escapeHtml(String(book.realese))}</span>
        <span class="badge ${book.isCompleted ? 'badge-completed' : 'badge-reading'}">
          <span class="badge-dot"></span>
          ${book.isCompleted ? 'Completed' : 'Reading'}
        </span>
      </div>
    </div>
  `;

  const actions = document.createElement('div');
  actions.className = 'book-actions';

  const toggleBtn = document.createElement('button');
  toggleBtn.className = 'book-action-btn toggle-btn';
  toggleBtn.setAttribute('aria-label', book.isCompleted ? 'Move to reading' : 'Mark as completed');
  toggleBtn.innerHTML = `
    <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
      ${book.isCompleted
        ? '<path d="M3 8h10M8 3v10" />'
        : '<polyline points="4 8 7 11 12 5" />'}
    </svg>
    ${book.isCompleted ? 'Move to Reading' : 'Complete'}
  `;
  toggleBtn.addEventListener('click', (e) => {
    e.stopPropagation();
    onToggle(book.id);
  });

  const deleteBtn = document.createElement('button');
  deleteBtn.className = 'book-action-btn delete-btn';
  deleteBtn.setAttribute('aria-label', 'Delete book');
  deleteBtn.innerHTML = `
    <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
      <polyline points="3 4 13 4 13 4" />
      <path d="M5 4V3a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v1" />
      <path d="M10 7v4M6 7v4" />
      <path d="M4 4l1 10a1 1 0 0 0 1 1h4a1 1 0 0 0 1-1l1-10" />
    </svg>
  `;
  deleteBtn.addEventListener('click', (e) => {
    e.stopPropagation();
    onDelete(book.id);
  });

  actions.appendChild(toggleBtn);
  actions.appendChild(deleteBtn);
  card.appendChild(actions);

  card.addEventListener('mousemove', (e) => {
    const rect = card.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width) * 100;
    const y = ((e.clientY - rect.top) / rect.height) * 100;
    card.style.setProperty('--mouse-x', `${x}%`);
    card.style.setProperty('--mouse-y', `${y}%`);
  });

  return card;
}

export function renderBooks(books, container, onToggle, onDelete) {
  container.innerHTML = '';
  books.forEach((book) => {
    container.appendChild(createBookCard(book, onToggle, onDelete));
  });
}

export function renderStats(stats) {
  const valTotal = document.getElementById('val-total');
  const valReading = document.getElementById('val-reading');
  const valCompleted = document.getElementById('val-completed');
  const valRate = document.getElementById('val-rate');

  if (valTotal) valTotal.textContent = stats.total;
  if (valReading) valReading.textContent = stats.reading;
  if (valCompleted) valCompleted.textContent = stats.completed;
  if (valRate) valRate.textContent = `${stats.rate}%`;
}

export function showEmptyState(type) {
  const emptyState = document.getElementById('empty-state');
  const searchEmpty = document.getElementById('search-empty');

  if (emptyState) emptyState.classList.add('hidden');
  if (searchEmpty) searchEmpty.classList.add('hidden');

  if (type === 'none') {
    if (emptyState) emptyState.classList.remove('hidden');
  } else if (type === 'search') {
    if (searchEmpty) searchEmpty.classList.remove('hidden');
  }
}

export function hideEmptyStates() {
  const emptyState = document.getElementById('empty-state');
  const searchEmpty = document.getElementById('search-empty');
  if (emptyState) emptyState.classList.add('hidden');
  if (searchEmpty) searchEmpty.classList.add('hidden');
}

export function updateSectionTitle(tab, count) {
  const title = document.getElementById('section-title');
  if (!title) return;
  title.textContent = tab === 'reading' ? `Reading (${count})` : `Completed (${count})`;
}

function escapeHtml(str) {
  const div = document.createElement('div');
  div.textContent = str;
  return div.innerHTML;
}
