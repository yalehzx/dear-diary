import { favoritePhotos } from '../data/photos.js';

export function initGallery() {
  const gallery = document.querySelector('#gallery-grid');
  if (!gallery) return;

  gallery.innerHTML = favoritePhotos
    .map((photo, index) => `
      <figure class="gallery-item">
        <span class="gallery-badge" aria-hidden="true">♥</span>
        <img src="${photo.src}" alt="${photo.alt}" loading="lazy" decoding="async" />
        <figcaption class="gallery-caption">${photo.legenda}</figcaption>
      </figure>
    `)
    .join('');
}
