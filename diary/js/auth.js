import { appConfig } from '../data/config.js';
import { normalizePassword } from './utils.js';

async function sha256Hex(value) {
  if (window.isSecureContext && window.crypto && window.crypto.subtle) {
    const encoded = new TextEncoder().encode(value);
    const digest = await window.crypto.subtle.digest('SHA-256', encoded);
    return Array.from(new Uint8Array(digest)).map(byte => byte.toString(16).padStart(2, '0')).join('');
  }

  return null;
}

export async function autenticar(senha) {
  const input = normalizePassword(senha);

  if (window.isSecureContext && window.crypto && window.crypto.subtle) {
    const hash = await sha256Hex(input);
    return { ok: hash !== null && hash === appConfig.passwordHash.toLowerCase() };
  }

  const fallback = normalizePassword(appConfig.passwordFallback);
  return { ok: input === fallback };
}
