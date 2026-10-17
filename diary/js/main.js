import { appConfig } from '../data/config.js';
import { autenticar } from './auth.js';
import { initIntroSequence } from './intro.js';
import { initGallery } from './gallery.js';
import { initMusicPlayer } from './music.js';
import { initDiary } from './diary.js';

const loginScreen = document.querySelector('#login-screen');
const appShell = document.querySelector('#app-shell');
const passwordInput = document.querySelector('#password-input');
const submitButton = document.querySelector('#login-form button[type="submit"]');
const feedback = document.querySelector('#login-feedback');
const togglePasswordButton = document.querySelector('#toggle-password');
const form = document.querySelector('#login-form');

const state = {
  authenticated: sessionStorage.getItem('diary_auth') === 'true',
  stages: ['login', 'intro', 'content', 'diary']
};

function updateAuthState() {
  if (state.authenticated) {
    if (loginScreen) loginScreen.classList.add('hidden');
    if (appShell) {
      appShell.classList.remove('hidden');
      appShell.setAttribute('aria-hidden', 'false');
    }
  }
}

function showLoginError(message) {
  if (!feedback) return;
  feedback.textContent = message;
  feedback.style.color = '#a65d6a';
  const card = document.querySelector('.login-card');
  card?.classList.remove('shake');
  void card?.offsetWidth;
  card?.classList.add('shake');
  passwordInput.value = '';
  passwordInput.focus();
}

async function submitLogin(event) {
  event.preventDefault();
  const value = passwordInput.value;
  const result = await autenticar(value);

  if (!result.ok) {
    showLoginError('Hmm, essa não é a senha 🙈 tenta de novo, Zabe!');
    return;
  }

  state.authenticated = true;
  sessionStorage.setItem('diary_auth', 'true');
  loginScreen.classList.add('hidden');
  loginScreen.setAttribute('aria-hidden', 'true');
  appShell.classList.remove('hidden');
  appShell.setAttribute('aria-hidden', 'false');
  initIntroSequence(() => {
    appShell.scrollIntoView({ behavior: 'smooth', block: 'start' });
  });
}

if (togglePasswordButton) {
  togglePasswordButton.addEventListener('click', () => {
    const isPassword = passwordInput.type === 'password';
    passwordInput.type = isPassword ? 'text' : 'password';
    togglePasswordButton.textContent = isPassword ? 'Ocultar' : 'Mostrar';
    togglePasswordButton.setAttribute('aria-label', isPassword ? 'Ocultar senha' : 'Mostrar senha');
  });
}

if (form) {
  form.addEventListener('submit', submitLogin);
}

if (passwordInput) {
  passwordInput.focus();
}

if (state.authenticated) {
  updateAuthState();
  initIntroSequence(() => {
    appShell.scrollIntoView({ behavior: 'smooth', block: 'start' });
  });
} else {
  updateAuthState();
}

initGallery();
initMusicPlayer();
initDiary();

window.addEventListener('DOMContentLoaded', () => {
  submitButton?.setAttribute('aria-label', 'Entrar no diário');
  if (!state.authenticated && loginScreen) {
    loginScreen.classList.remove('hidden');
    loginScreen.setAttribute('aria-hidden', 'false');
  }
});

if (state.authenticated) {
  const appTitle = document.querySelector('.brand-name');
  if (appTitle) {
    appTitle.textContent = `Para você, pipinha 💛`;
  }
}

if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
  document.documentElement.style.scrollBehavior = 'auto';
}

console.info('Config do diário carregada:', appConfig.passwordHash.slice(0, 8));
