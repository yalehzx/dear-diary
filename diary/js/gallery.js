import { favoritePhotos } from '../data/photos.js';

export function initGallery() {
  const gallery = document.querySelector('#gallery-grid');
  if (!gallery) return;

  gallery.innerHTML = favoritePhotos
    .map((photo, index) => `
      <figure class="gallery-item" data-index="${index}">
        <button type="button" class="gallery-trigger" aria-label="Abrir imagem ${index + 1}">
          <span class="gallery-badge" aria-hidden="true">♥</span>
          <img src="${photo.src}" alt="${photo.alt}" loading="lazy" decoding="async" />
          <figcaption class="gallery-caption">${photo.legenda}</figcaption>
        </button>
      </figure>
    `)
    .join('');

  const lightbox = document.querySelector('#lightbox');
  const lightboxImage = document.querySelector('#lightbox-image');
  const lightboxTitle = document.querySelector('#lightbox-title');
  const closeButton = document.querySelector('.lightbox-close');
  const prevButton = document.querySelector('.lightbox-nav.prev');
  const nextButton = document.querySelector('.lightbox-nav.next');
  const backdrop = document.querySelector('.lightbox-backdrop');
  let currentIndex = 0;

  function openLightbox(index) {
    currentIndex = (index + favoritePhotos.length) % favoritePhotos.length;
    const photo = favoritePhotos[currentIndex];
    lightboxImage.src = photo.src;
    lightboxImage.alt = photo.alt;
    lightboxTitle.textContent = photo.legenda;
    lightbox.classList.remove('hidden');
    lightbox.setAttribute('aria-hidden', 'false');
    closeButton.focus();
  }

  function closeLightbox() {
    lightbox.classList.add('hidden');
    lightbox.setAttribute('aria-hidden', 'true');
  }

  function moveLightbox(step) {
    openLightbox(currentIndex + step);
  }

  gallery.addEventListener('click', (event) => {
    const trigger = event.target.closest('.gallery-trigger');
    if (!trigger) return;
    const item = trigger.closest('.gallery-item');
    if (!item) return;
    openLightbox(Number(item.dataset.index));
  });

  closeButton.addEventListener('click', closeLightbox);
  backdrop.addEventListener('click', (event) => {
    if (event.target.dataset.closeLightbox === 'true') closeLightbox();
  });
  prevButton.addEventListener('click', () => moveLightbox(-1));
  nextButton.addEventListener('click', () => moveLightbox(1));

  document.addEventListener('keydown', (event) => {
    if (lightbox.classList.contains('hidden')) return;
    if (event.key === 'Escape') closeLightbox();
    if (event.key === 'ArrowLeft') moveLightbox(-1);
    if (event.key === 'ArrowRight') moveLightbox(1);
  });
}
