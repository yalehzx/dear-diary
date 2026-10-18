import { capitulos } from '../data/diary-entries.js';
import { formatDiaryDate, clamp } from './utils.js';

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
  diaryPages.length = 0;

  capitulos.forEach((capitulo) => {
    diaryPages.push({
      type: 'chapter',
      chapterTitle: capitulo.titulo,
      chapterSubtitle: capitulo.subtitulo,
      date: capitulo.titulo,
      text: []
    });

    capitulo.paginas.forEach((pagina) => {
      const chunks = splitEntryPages(pagina);
      chunks.forEach((chunk) => {
        diaryPages.push({
          type: 'entry',
          chapterTitle: capitulo.titulo,
          date: pagina.data,
          title: pagina.titulo || '',
          text: chunk
        });
      });
    });
  });
}

export function initDiary() {
  buildDiaryPages();

  const diaryModal = document.querySelector('#diary-modal');
  const openDiaryButton = document.querySelector('#open-diary');
  const closeDiaryButton = document.querySelector('#close-diary');
  const leftPage = document.querySelector('#page-left');
  const rightPage = document.querySelector('#page-right');
  const prevPageButton = document.querySelector('#prev-page');
  const nextPageButton = document.querySelector('#next-page');
  const pageIndicator = document.querySelector('#page-indicator');
  const pageProgressBar = document.querySelector('#page-progress-bar');

  if (!diaryModal || !openDiaryButton || !closeDiaryButton || !leftPage || !rightPage) return;

  const state = {
    currentPageIndex: Number(sessionStorage.getItem('lastDiaryPage') || 0)
  };
  const singlePageLayout = window.matchMedia('(max-width: 860px)');

  function getPageStep() {
    return singlePageLayout.matches ? 1 : 2;
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
      ? ''
      : page.text.map((paragraph) => `<p>${paragraph}</p>`).join('');

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
        <span>${page.type === 'chapter' ? 'Capítulo' : 'Página'}</span>
        <span>${page.chapterTitle}</span>
      </div>
    `;
  }

  function render() {
    state.currentPageIndex = clamp(state.currentPageIndex, 0, diaryPages.length - 1);
    if (!singlePageLayout.matches) {
      state.currentPageIndex -= state.currentPageIndex % 2;
    }
    sessionStorage.setItem('lastDiaryPage', String(state.currentPageIndex));

    if (singlePageLayout.matches) {
      leftPage.innerHTML = '';
      rightPage.innerHTML = renderPage(diaryPages[state.currentPageIndex]);
    } else {
      const rightIndex = state.currentPageIndex + 1 < diaryPages.length ? state.currentPageIndex + 1 : null;
      leftPage.innerHTML = renderPage(diaryPages[state.currentPageIndex]);
      rightPage.innerHTML = renderPage(diaryPages[rightIndex]);
    }

    const progress = ((state.currentPageIndex + 1) / diaryPages.length) * 100;
    if (pageIndicator) pageIndicator.textContent = `${state.currentPageIndex + 1} / ${diaryPages.length}`;
    if (pageProgressBar) pageProgressBar.style.width = `${progress}%`;

    if (prevPageButton) prevPageButton.disabled = state.currentPageIndex === 0;
    if (nextPageButton) {
      nextPageButton.disabled = state.currentPageIndex + getPageStep() >= diaryPages.length;
    }
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

  prevPageButton?.addEventListener('click', () => {
    if (state.currentPageIndex > 0) {
      state.currentPageIndex -= getPageStep();
      render();
    }
  });

  nextPageButton?.addEventListener('click', () => {
    const pageStep = getPageStep();
    if (state.currentPageIndex + pageStep < diaryPages.length) {
      state.currentPageIndex += pageStep;
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
        state.currentPageIndex -= getPageStep();
        render();
      }
    }
    if (event.key === 'ArrowRight') {
      const pageStep = getPageStep();
      if (state.currentPageIndex + pageStep < diaryPages.length) {
        state.currentPageIndex += pageStep;
        render();
      }
    }
  });

  singlePageLayout.addEventListener('change', render);
  render();
}
