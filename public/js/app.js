/* Alex API — utilidades compartidas del frontend */

const AlexAPI = (() => {
  const TOKEN_KEY = 'alexapi_token';
  const USER_KEY = 'alexapi_user';

  function getToken() { return localStorage.getItem(TOKEN_KEY); }
  function setToken(token) { localStorage.setItem(TOKEN_KEY, token); }
  function clearSession() { localStorage.removeItem(TOKEN_KEY); localStorage.removeItem(USER_KEY); }

  function getUser() {
    try { return JSON.parse(localStorage.getItem(USER_KEY)); } catch (e) { return null; }
  }
  function setUser(user) { localStorage.setItem(USER_KEY, JSON.stringify(user)); }

  async function request(path, { method = 'GET', body, auth = true, headers = {} } = {}) {
    const finalHeaders = { ...headers };
    let finalBody = body;

    if (body && !(body instanceof FormData)) {
      finalHeaders['Content-Type'] = 'application/json';
      finalBody = JSON.stringify(body);
    }

    if (auth) {
      const token = getToken();
      if (token) finalHeaders['Authorization'] = `Bearer ${token}`;
    }

    const res = await fetch(path, { method, headers: finalHeaders, body: finalBody });
    let data;
    try { data = await res.json(); } catch (e) { data = {}; }

    if (res.status === 401 && auth) {
      clearSession();
      if (!location.pathname.includes('login')) {
        location.href = '/login.html';
      }
    }

    if (!res.ok || data.success === false) {
      throw new Error(data.message || `Error ${res.status}`);
    }
    return data;
  }

  return { getToken, setToken, clearSession, getUser, setUser, request };
})();

/* ---------- Toasts ---------- */
function toast(message, type = 'success') {
  let root = document.getElementById('toast-root');
  if (!root) {
    root = document.createElement('div');
    root.id = 'toast-root';
    document.body.appendChild(root);
  }
  const el = document.createElement('div');
  el.className = `toast ${type}`;
  el.textContent = message;
  root.appendChild(el);
  setTimeout(() => {
    el.style.transition = 'opacity 0.25s ease';
    el.style.opacity = '0';
    setTimeout(() => el.remove(), 250);
  }, 3600);
}

/* ---------- Nav mobile toggle ---------- */
function initNav() {
  const toggle = document.querySelector('.nav-toggle');
  const links = document.querySelector('.nav-links');
  if (toggle && links) {
    toggle.addEventListener('click', () => links.classList.toggle('open'));
    links.querySelectorAll('a').forEach((a) => a.addEventListener('click', () => links.classList.remove('open')));
  }
}

/* ---------- Icons (lucide) ---------- */
function initIcons() {
  if (window.lucide) window.lucide.createIcons();
}

/* ---------- Auth guard helpers ---------- */
function requireAuthOrRedirect() {
  if (!AlexAPI.getToken()) {
    location.href = '/login.html';
    return false;
  }
  return true;
}

function redirectIfLoggedIn() {
  if (AlexAPI.getToken()) {
    location.href = '/dashboard.html';
  }
}

/* ---------- Copy to clipboard ---------- */
function copyToClipboard(text, label = 'Copiado al portapapeles') {
  navigator.clipboard.writeText(text).then(() => toast(label, 'success')).catch(() => toast('No se pudo copiar', 'error'));
}

/* ---------- Number/date formatting ---------- */
function formatNumber(n) { return new Intl.NumberFormat('es-ES').format(n); }
function formatDate(ts) {
  if (!ts) return '—';
  return new Intl.DateTimeFormat('es-ES', { dateStyle: 'medium', timeStyle: 'short' }).format(new Date(ts));
}
function maskKey(key) {
  if (!key) return '';
  return `${key.slice(0, 8)}${'•'.repeat(18)}${key.slice(-4)}`;
}

/* ---------- Nav que cambia segun sesion (data-auth="in" / "out") ---------- */
function initAuthNav() {
  const loggedIn = Boolean(AlexAPI.getToken());
  document.querySelectorAll('[data-auth="in"]').forEach((el) => { el.style.display = loggedIn ? '' : 'none'; });
  document.querySelectorAll('[data-auth="out"]').forEach((el) => { el.style.display = loggedIn ? 'none' : ''; });

  document.querySelectorAll('[data-action="logout"]').forEach((el) => {
    el.addEventListener('click', (e) => {
      e.preventDefault();
      AlexAPI.clearSession();
      location.href = '/index.html';
    });
  });
}

document.addEventListener('DOMContentLoaded', () => {
  initNav();
  initIcons();
  initAuthNav();
});
