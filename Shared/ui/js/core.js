// ─── Global state ──────────────────────────────────────────────
const STATE = {
  convos: [],
  activeCid: null,
  msgs: [],
  model: 'llama3.2:3b',
  temp: 0.7,
  sysPrompt: '',
  hasGlobalSys: false,
  modelMap: {},
  streaming: false,
  abort: null,
  imageData: null,
  pdfText: null,
  ollamaHost: (window.location.protocol === 'file:') ? 'http://127.0.0.1:11434' : '/ollama',
  token: null,
};

// ─── Theme ─────────────────────────────────────────────────────
function getTheme() {
  return localStorage.getItem('theme') || 'dark';
}
function setTheme(t) {
  document.documentElement.setAttribute('data-theme', t);
  localStorage.setItem('theme', t);
}
function toggleTheme() {
  setTheme(getTheme() === 'dark' ? 'light' : 'dark');
}

// ─── UUID ──────────────────────────────────────────────────────
function uid() {
  return crypto.randomUUID ? crypto.randomUUID() : 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, c => { const r = Math.random() * 16 | 0; return (c === 'x' ? r : (r & 0x3 | 0x8)).toString(16); });
}

// ─── Toasts ────────────────────────────────────────────────────
function toast(msg) {
  const el = document.createElement('div');
  el.className = 'toast';
  el.textContent = msg;
  document.getElementById('toasts').appendChild(el);
  setTimeout(() => el.remove(), 2800);
}

// ─── DOM ready ─────────────────────────────────────────────────
document.addEventListener('DOMContentLoaded', () => {
  initTheme();
  initSidebar();
});
function initTheme() {
  setTheme(getTheme());
}
function initSidebar() {
  const sb = document.getElementById('sidebar');
  const ov = document.getElementById('overlay');
  document.querySelectorAll('[data-toggle-sidebar]').forEach(el => {
    el.addEventListener('click', () => {
      const isOpen = !sb.classList.contains('off');
      sb.classList.toggle('off', isOpen);
      ov.classList.toggle('on', !isOpen);
    });
  });
  ov.addEventListener('click', () => {
    sb.classList.add('off');
    ov.classList.remove('on');
  });
}
