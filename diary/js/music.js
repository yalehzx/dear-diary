import { songs } from '../data/songs.js';
import { appConfig } from '../data/config.js';

export function initMusicPlayer() {
  const playerHost = document.querySelector('#music-player');
  if (!playerHost) return;

  const state = {
    index: 0,
    audio: new Audio(),
    isPlaying: false,
    timerId: null
  };

  const defaultArtwork = songs[0]?.capa || '';

  function formatTime(totalSeconds) {
    if (!Number.isFinite(totalSeconds) || totalSeconds < 0) return '0:00';
    const mins = Math.floor(totalSeconds / 60);
    const secs = Math.floor(totalSeconds % 60).toString().padStart(2, '0');
    return `${mins}:${secs}`;
  }

  function updateMediaSession(track) {
    if (!('mediaSession' in navigator)) return;

    navigator.mediaSession.metadata = new MediaMetadata({
      title: track.titulo,
      artist: track.artista,
      album: 'Diário da Isabella',
      artwork: [{ src: track.capa || defaultArtwork, sizes: '512x512', type: 'image/svg+xml' }]
    });

    navigator.mediaSession.setActionHandler('play', () => {
      if (state.audio && state.audio.src) {
        state.audio.play();
      }
    });
    navigator.mediaSession.setActionHandler('pause', () => state.audio.pause());
    navigator.mediaSession.setActionHandler('previoustrack', () => selectTrack(state.index - 1));
    navigator.mediaSession.setActionHandler('nexttrack', () => selectTrack(state.index + 1));
  }

  function renderTrackList() {
    const list = document.createElement('div');
    list.className = 'track-list';

    songs.forEach((track, index) => {
      const row = document.createElement('button');
      row.type = 'button';
      row.className = `track-item ${index === state.index ? 'is-current' : ''}`;
      row.innerHTML = `
        <span class="track-index">${index + 1}</span>
        <span>
          <strong>${track.titulo}</strong>
          <small>${track.artista}</small>
        </span>
        <span>▶</span>
      `;
      row.addEventListener('click', () => selectTrack(index));
      list.appendChild(row);
    });

    const currentList = playerHost.querySelector('.track-list');
    if (currentList) currentList.replaceWith(list);
    else playerHost.appendChild(list);
  }

  function renderPlayer() {
    const track = songs[state.index];
    const hasLocalAudio = Boolean(track.arquivo && track.arquivo.trim());
    const coverClass = state.isPlaying ? 'cover-art is-playing' : 'cover-art';

    playerHost.innerHTML = `
      <div class="player-top">
        <div class="${coverClass}">
          <img src="${track.capa}" alt="Capa da música ${track.titulo}" loading="lazy" decoding="async" />
        </div>
        <div class="player-meta">
          <h3>${track.titulo}</h3>
          <p>${track.artista}</p>
          <div class="player-motivo">${track.motivo}</div>
        </div>
      </div>

      <div class="player-controls">
        <button type="button" class="player-button" data-action="prev" aria-label="Faixa anterior">⏮</button>
        <button type="button" class="player-button primary" data-action="toggle" aria-label="Reproduzir ou pausar">${state.isPlaying ? '⏸' : '▶'}</button>
        <button type="button" class="player-button" data-action="next" aria-label="Próxima faixa">⏭</button>
        <div class="progress-wrap">
          <div class="progress-bar"><span id="player-progress-fill"></span></div>
          <div class="progress-times"><span id="player-current-time">0:00</span><span id="player-total-time">0:00</span></div>
        </div>
        <div class="volume-wrap">
          <span>🔊</span>
          <input type="range" min="0" max="1" value="0.7" step="0.01" aria-label="Volume" />
        </div>
      </div>
      ${track.embedUrl ? `<iframe class="embed-player" src="${track.embedUrl}" title="${track.titulo}" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" referrerpolicy="strict-origin-when-cross-origin" allowfullscreen></iframe>` : ''}
    `;

    if (hasLocalAudio) {
      state.audio.src = track.arquivo;
      state.audio.load();
      state.audio.volume = Number(playerHost.querySelector('input[type="range"]').value || 0.7);
      state.audio.addEventListener('timeupdate', () => {
        const fill = playerHost.querySelector('#player-progress-fill');
        const current = playerHost.querySelector('#player-current-time');
        const total = playerHost.querySelector('#player-total-time');
        if (!fill || !current || !total) return;

        const progress = state.audio.duration ? (state.audio.currentTime / state.audio.duration) * 100 : 0;
        fill.style.width = `${progress}%`;
        current.textContent = formatTime(state.audio.currentTime);
        total.textContent = formatTime(state.audio.duration);
      });
    }

    const toggle = playerHost.querySelector('[data-action="toggle"]');
    const prev = playerHost.querySelector('[data-action="prev"]');
    const next = playerHost.querySelector('[data-action="next"]');
    const volume = playerHost.querySelector('input[type="range"]');

    toggle?.addEventListener('click', () => {
      if (track.embedUrl) {
        state.isPlaying = !state.isPlaying;
        renderPlayer();
        renderTrackList();
        return;
      }
      if (state.audio.paused) {
        state.audio.play();
        state.isPlaying = true;
      } else {
        state.audio.pause();
        state.isPlaying = false;
      }
      renderPlayer();
      renderTrackList();
    });

    prev?.addEventListener('click', () => selectTrack(state.index - 1));
    next?.addEventListener('click', () => selectTrack(state.index + 1));
    volume?.addEventListener('input', (event) => {
      const value = Number(event.target.value || 0.7);
      state.audio.volume = value;
    });

    renderTrackList();
    updateMediaSession(track);
  }

  function selectTrack(nextIndex) {
    const normalized = (nextIndex + songs.length) % songs.length;
    state.index = normalized;
    state.isPlaying = true;
    if (state.audio) {
      state.audio.pause();
      state.audio.currentTime = 0;
      if (songs[normalized].arquivo) {
        state.audio.src = songs[normalized].arquivo;
        state.audio.play();
      }
    }
    renderPlayer();
  }

  renderPlayer();

  const defaultText = appConfig.musicIntro;
  if (defaultText) {
    const introBlock = document.createElement('p');
    introBlock.className = 'eyebrow';
    introBlock.textContent = defaultText;
    playerHost.prepend(introBlock);
  }
}
