import { appConfig } from '../data/config.js';
import { openingPhotos } from '../data/photos.js';

export function initIntroSequence(onComplete) {
  const screen = document.querySelector('#intro-screen');
  const photoWrap = document.querySelector('#intro-photo');
  const label = document.querySelector('#intro-label');
  const progressBar = document.querySelector('#intro-progress-bar');
  const skipButton = document.querySelector('#skip-intro');
  if (!screen || !photoWrap || !label || !progressBar || !skipButton) return;

  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  let currentIndex = 0;
  let timerId = null;

  function preloadImages() {
    const total = openingPhotos.length;
    let loaded = 0;

    openingPhotos.forEach((photo) => {
      const img = new Image();
      img.src = photo.src;
      img.decoding = 'async';
      img.onload = () => {
        loaded += 1;
        if (loaded === total) startSequence();
      };
      img.onerror = () => {
        loaded += 1;
        if (loaded === total) startSequence();
      };
    });
  }

  function renderPhoto(photo) {
    photoWrap.innerHTML = `<img src="${photo.src}" alt="${photo.alt}" loading="eager" decoding="async" />`;
    photoWrap.dataset.caption = photo.legenda;
  }

  function updateProgress() {
    const percent = ((currentIndex + 1) / openingPhotos.length) * 100;
    progressBar.style.width = `${percent}%`;
  }

  function showName() {
    const name = appConfig.introNames[currentIndex % appConfig.introNames.length];
    label.textContent = name;
  }

  function advance() {
    const nextIndex = currentIndex % openingPhotos.length;
    const photo = openingPhotos[nextIndex];
    renderPhoto(photo);
    showName();
    updateProgress();
    currentIndex += 1;

    if (currentIndex > openingPhotos.length) {
      finish();
    }
  }

  function finish() {
    if (timerId) window.clearInterval(timerId);
    screen.classList.add('hidden');
    screen.setAttribute('aria-hidden', 'true');
    onComplete?.();
  }

  function startSequence() {
    showName();
    renderPhoto(openingPhotos[0]);
    updateProgress();

    const intervalMs = reduceMotion ? 1200 : appConfig.introDelay;

    timerId = window.setInterval(() => {
      if (currentIndex >= openingPhotos.length - 1) {
        finish();
        return;
      }
      currentIndex += 1;
      renderPhoto(openingPhotos[currentIndex]);
      showName();
      updateProgress();
    }, intervalMs);

    skipButton.addEventListener('click', finish, { once: true });
  }

  preloadImages();
  screen.classList.remove('hidden');
  screen.setAttribute('aria-hidden', 'false');
}
