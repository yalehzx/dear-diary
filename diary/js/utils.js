export function normalizePassword(value) {
  return String(value ?? '').trim().toLowerCase();
}

export function formatDiaryDate(dateString, locale = 'pt-BR') {
  const date = new Date(dateString + 'T12:00:00');
  return new Intl.DateTimeFormat(locale, {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric'
  }).format(date);
}

export function createSlug(value) {
  return String(value).toLowerCase().trim().replace(/[^a-z0-9]+/g, '-');
}

export function clamp(value, min, max) {
  return Math.min(Math.max(value, min), max);
}
