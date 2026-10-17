import { capitulos } from '../data/diary-entries.js';
import { formatDiaryDate, clamp } from './utils.js';

const chapterStarts = [];
const diaryPages = [];

function splitEntryPages(entry) {
  const paragraphs = entry.texto || [];
  const pageChunks = [];
  let buffer = [];
  let charCount = 0;

  for (const paragraph of paragraphs) {
    const paragraphLength = paragraph.length;
    if (buffer.length && charCount + paragraphLength > 620) {
      pageChunks.push([...buffer]);
      buffer = [paragraph];
      charCount = paragraphLength;
      continue;
    }

    buffer.push(paragraph);
    charCount += paragraphLength;
  }

  if (buffer.length) pageChunks.push(buffer);

  return pageChunks;
}

function buildDiaryPages() {
  chapterStarts.length = 0;
  diaryPages.length = 0;

  capitulos.forEach((capitulo) => {
    const chapterStartIndex = diaryPages.length;
    chapterStarts.push({ id: capitulo.id, titulo: capitulo.titulo, index: chapterStartIndex });

    diaryPages.push({
      type: 'chapter',
      chapterId: capitulo.id,
      chapterTitle: capitulo.titulo,
      chapterSubtitle: capitulo.subtitulo,
      entry: null,
      date: capitulo.titulo,
      text: [],
      photo: null,
      humor: '✦'
    });

    capitulo.paginas.forEach((pagina) => {
      const chunks = splitEntryPages(pagina);
      chunks.forEach((chunk) => {
        diaryPages.push({
          type: 'entry',
          chapterId: capitulo.id,
          chapterTitle: capitulo.titulo,
          chapterSubtitle: capitulo.subtitulo,
          entry: pagina,
          date: pagina.data,
          title: pagina.titulo || '',
          text: chunk,
          photo: pagina.foto || null,
          humor: pagina.humor || '💛'
        });
      });
    });
  });
}

export function initDiary() {
  buildDiaryPages();

  const diaryModal = document.querySelector('#diary-modal');
  const chapterTabs = document.querySelector('#chapter-tabs');
  const openDiaryButton = document.querySelector('#open-diary');
  const closeDiaryButton = document.querySelector('#close-diary');
  const leftPage = document.querySelector('#page-left');
  const rightPage = document.querySelector('#page-right');
  const prevPageButton = document.querySelector('#prev-page');
  const nextPageButton = document.querySelector('#next-page');
  const pageIndicator = document.querySelector('#page-indicator');
  const pageProgressBar = document.querySelector('#page-progress-bar');
  const readingPanel = document.querySelector('#reading-panel');
  const readingToggle = document.querySelector('#reading-mode-toggle');

  if (!diaryModal || !chapterTabs || !openDiaryButton || !closeDiaryButton || !leftPage || !rightPage) return;

  const state = {
    currentPageIndex: Number(sessionStorage.getItem('lastDiaryPage') || 0),
    chapterIndex: 0,
    fontSize: Number(localStorage.getItem('diaryFontSize') || 20),
    theme: localStorage.getItem('diaryTheme') || 'creme'
  };

  function syncTheme() {
    document.body.dataset.theme = state.theme;
  }

  function setReadingMode(open) {
    readingPanel.classList.toggle('hidden', !open);
  }

  function renderChapterTabs() {
    chapterTabs.innerHTML = '';
    chapterStarts.forEach((chapter) => {
      const tab = document.createElement('button');
      tab.type = 'button';
      tab.className = `chapter-tab ${state.currentPageIndex >= chapter.index ? 'active' : ''}`;
      tab.textContent = chapter.titulo;
      tab.addEventListener('click', () => {
        state.currentPageIndex = chapter.index;
        state.chapterIndex = chapterStarts.findIndex((item) => item.id === chapter.id);
        render();
      });
      chapterTabs.appendChild(tab);
    });
  }

  function renderPage(page) {
    if (!page) {
      return `
        <div class="page-header">
          <div class="ornament"></div>
        </div>
        <div class="diary-page-body"></div>
        <div class="page-footer"><span>—</span><span>—</span></div>
      `;
    }

    const headerDate = page.type === 'chapter' ? page.chapterTitle : formatDiaryDate(page.date);
    const title = page.type === 'chapter' ? page.chapterSubtitle : page.title;
    const bodyHtml = page.type === 'chapter'
      ? `<p>Capítulo ${page.chapterTitle}</p><p>${page.chapterSubtitle}</p>`
      : `${page.text.map((paragraph) => `<p>${paragraph}</p>`).join('')}${page.photo ? `<img src="${page.photo}" alt="Foto do diário" loading="lazy" decoding="async" />` : ''}`;

    return `
      <div class="page-header">
        <div class="diary-date">${headerDate}</div>
        <div class="ornament"></div>
        ${title ? `<h3>${title}</h3>` : ''}
      </div>
      <div class="diary-page-body">
        ${bodyHtml}
      </div>
      <div class="page-footer">
        <span>${page.humor}</span>
        <span>${page.type === 'chapter' ? 'Capítulo' : 'Página'}</span>
      </div>
    `;
  }

  function render() {
    state.currentPageIndex = clamp(state.currentPageIndex, 0, diaryPages.length - 1);
    sessionStorage.setItem('lastDiaryPage', String(state.currentPageIndex));

    const leftIndex = state.currentPageIndex;
    const rightIndex = leftIndex + 1 < diaryPages.length ? leftIndex + 1 : null;
    document.documentElement.style.setProperty('--default-font-size', `${state.fontSize}px`);
    leftPage.innerHTML = renderPage(diaryPages[leftIndex]);
    rightPage.innerHTML = renderPage(diaryPages[rightIndex]);

    const progress = ((state.currentPageIndex + 1) / diaryPages.length) * 100;
    pageIndicator.textContent = `${state.currentPageIndex + 1} / ${diaryPages.length}`;
    pageProgressBar.style.width = `${progress}%`;

    prevPageButton.disabled = state.currentPageIndex === 0;
    nextPageButton.disabled = state.currentPageIndex >= diaryPages.length - 1;

    renderChapterTabs();
  }

  openDiaryButton.addEventListener('click', () => {
    diaryModal.classList.remove('hidden');
    diaryModal.setAttribute('aria-hidden', 'false');
    render();
  });

  closeDiaryButton.addEventListener('click', () => {
    diaryModal.classList.add('hidden');
    diaryModal.setAttribute('aria-hidden', 'true');
  });

  diaryModal.addEventListener('click', (event) => {
    if (event.target.dataset.closeDiary === 'true') {
      diaryModal.classList.add('hidden');
      diaryModal.setAttribute('aria-hidden', 'true');
    }
  });

  prevPageButton.addEventListener('click', () => {
    if (state.currentPageIndex > 0) {
      state.currentPageIndex -= 1;
      render();
    }
  });

  nextPageButton.addEventListener('click', () => {
    if (state.currentPageIndex < diaryPages.length - 1) {
      state.currentPageIndex += 1;
      render();
    }
  });

  document.addEventListener('keydown', (event) => {
    if (diaryModal.classList.contains('hidden')) return;
    if (event.key === 'Escape') {
      diaryModal.classList.add('hidden');
      diaryModal.setAttribute('aria-hidden', 'true');
    }
    if (event.key === 'ArrowLeft') {
      if (state.currentPageIndex > 0) {
        state.currentPageIndex -= 1;
        render();
      }
    }
    if (event.key === 'ArrowRight') {
      if (state.currentPageIndex < diaryPages.length - 1) {
        state.currentPageIndex += 1;
        render();
      }
    }
  });

  readingToggle?.addEventListener('click', () => {
    const isOpen = !readingPanel.classList.contains('hidden');
    setReadingMode(!isOpen);
  });

  document.querySelectorAll('[data-font-size]').forEach((button) => {
    button.addEventListener('click', () => {
      const delta = button.dataset.fontSize === 'increase' ? 2 : -2;
      state.fontSize = clamp(state.fontSize + delta, 18, 24);
      localStorage.setItem('diaryFontSize', String(state.fontSize));
      render();
    });
  });

  document.querySelectorAll('[data-theme]').forEach((button) => {
    button.addEventListener('click', () => {
      state.theme = button.dataset.theme;
      localStorage.setItem('diaryTheme', state.theme);
      syncTheme();
      render();
    });
  });

  syncTheme();
  setReadingMode(false);
  render();
}
