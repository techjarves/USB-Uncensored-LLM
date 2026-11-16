// ─── Model Dropdown ────────────────────────────────────────────
function buildModelMenu(models) {
  const menu = document.getElementById('model-menu');
  menu.innerHTML = '';
  if (!models || models.length === 0) {
    const opt = document.createElement('div');
    opt.className = 'mm-opt';
    opt.innerHTML = `
      <div class="mmo-icon" style="background:transparent;color:var(--orange);font-size:16px;"><i class="fa-solid fa-triangle-exclamation"></i></div>
      <div class="mmo-info">
        <div class="mmo-name" style="color:var(--orange);">No models available</div>
        <div class="mmo-desc">Start Ollama and pull a model</div>
      </div>`;
    menu.appendChild(opt);
    return;
  }
  models.forEach(name => {
    const opt = document.createElement('div');
    opt.className = `mm-opt${name === STATE.model ? ' sel' : ''}`;
    opt.dataset.model = name;
    opt.innerHTML = `
      <div class="mmo-icon"><i class="fa-solid fa-microchip"></i></div>
      <div class="mmo-info">
        <div class="mmo-name">${escapeHtml(name)}</div>
        <div class="mmo-desc">${STATE.modelMap[name]?.details?.parameter_size || ''}</div>
      </div>
      <div class="mmo-chk"><i class="fa-solid fa-check"></i></div>`;
    opt.addEventListener('click', () => selectModel(name));
    menu.appendChild(opt);
  });
}
function selectModel(name) {
  STATE.model = name;
  document.querySelectorAll('.mm-opt').forEach(el => el.classList.toggle('sel', el.dataset.model === name));
  document.getElementById('model-name').textContent = name;
  document.querySelector('.model-btn').classList.remove('open', 'no-models');
  document.getElementById('model-menu').classList.remove('on');
  checkVisionWarn();
}
function toggleModelMenu() {
  const menu = document.getElementById('model-menu');
  menu.classList.toggle('on');
  document.querySelector('.model-btn').classList.toggle('open', menu.classList.contains('on'));
}
document.addEventListener('click', e => {
  const btn = document.querySelector('.model-btn');
  if (btn && !btn.contains(e.target) && !document.getElementById('model-menu')?.contains(e.target)) {
    document.getElementById('model-menu')?.classList.remove('on');
    btn?.classList.remove('open');
  }
});

const VISION_MODELS = ['llava', 'bakllava', 'llama3.2-vision', 'minicpm-v'];

function isVisionModel(name) {
  return VISION_MODELS.some(v => name.toLowerCase().includes(v));
}

function checkVisionWarn() {
  const warn = document.getElementById('vision-warn');
  const hasImg = STATE.imageData !== null;
  warn.classList.toggle('on', hasImg && !isVisionModel(STATE.model));
}

// ─── File attachments ──────────────────────────────────────────
function attachImage(dataUrl) {
  if (!isVisionModel(STATE.model)) {
    toast('Cannot read "image.png" (this model does not support image input)');
    return;
  }
  STATE.imageData = dataUrl;
  STATE.pdfText = null;
  document.getElementById('img-preview').src = dataUrl;
  document.getElementById('img-preview-wrap').classList.remove('hidden');
  document.getElementById('file-bar').classList.add('on');
}
function attachPdf(name, text) {
  STATE.pdfText = text;
  STATE.imageData = null;
  document.getElementById('pdf-name').textContent = name;
  document.getElementById('pdf-preview-wrap').classList.remove('hidden');
  document.getElementById('file-bar').classList.add('on');
  document.getElementById('vision-warn').classList.remove('on');
}
function removeAttachment() {
  STATE.imageData = null;
  STATE.pdfText = null;
  document.getElementById('img-preview-wrap').classList.add('hidden');
  document.getElementById('pdf-preview-wrap').classList.add('hidden');
  document.getElementById('file-bar').classList.remove('on');
  document.getElementById('vision-warn').classList.remove('on');
}

// ─── Sidebar conversations ─────────────────────────────────────
function buildSidebar() {
  const list = document.getElementById('sb-list');
  list.innerHTML = '';
  STATE.convos.forEach((c, i) => {
    const div = document.createElement('div');
    div.className = `cv${c.id === STATE.activeCid ? ' act' : ''}`;
    div.innerHTML = `
      <i class="fa-regular fa-comment ci"></i>
      <span class="ct">${escapeHtml(c.title || 'New chat')}</span>
      <button class="cd" onclick="deleteConvo('${c.id}')" title="Delete"><i class="fa-regular fa-trash-can"></i></button>`;
    div.addEventListener('click', () => switchConvo(c.id));
    list.appendChild(div);
  });
}
function newConvo() {
  const id = uid();
  STATE.convos.push({ id, title: 'New chat', msgs: [] });
  STATE.activeCid = id;
  STATE.msgs = [];
  document.getElementById('msgs').classList.remove('on');
  document.getElementById('welcome').style.display = '';
  renderMsgs();
  buildSidebar();
}
function switchConvo(id) {
  const c = STATE.convos.find(x => x.id === id);
  if (!c) return;
  STATE.activeCid = id;
  STATE.msgs = c.msgs;
  if (STATE.msgs.length > 0) {
    document.getElementById('msgs').classList.add('on');
    document.getElementById('welcome').style.display = 'none';
  } else {
    document.getElementById('msgs').classList.remove('on');
    document.getElementById('welcome').style.display = '';
  }
  renderMsgs();
  buildSidebar();
  // close sidebar on mobile
  if (window.innerWidth <= 768) {
    document.getElementById('sidebar').classList.add('off');
    document.getElementById('overlay').classList.remove('on');
  }
}
function deleteConvo(id) {
  STATE.convos = STATE.convos.filter(c => c.id !== id);
  if (STATE.activeCid === id) {
    if (STATE.convos.length > 0) {
      switchConvo(STATE.convos[0].id);
    } else {
      STATE.activeCid = null;
      STATE.msgs = [];
      document.getElementById('msgs').classList.remove('on');
      document.getElementById('welcome').style.display = '';
      buildSidebar();
    }
  } else {
    buildSidebar();
  }
}
function updateConvoTitle(id, title) {
  const c = STATE.convos.find(x => x.id === id);
  if (c) { c.title = title; buildSidebar(); }
}
function saveCurrentConvo() {
  const c = STATE.convos.find(x => x.id === STATE.activeCid);
  if (c) c.msgs = STATE.msgs;
}

// ─── Temperature ───────────────────────────────────────────────
function initTemp() {
  const inp = document.getElementById('temp-input');
  inp.value = STATE.temp;
  inp.addEventListener('change', () => {
    const v = parseFloat(inp.value);
    if (!isNaN(v) && v >= 0 && v <= 2) STATE.temp = v;
    else inp.value = STATE.temp;
  });
}

// ─── System prompt ─────────────────────────────────────────────
function toggleSysPanel() {
  const p = document.getElementById('sys-panel');
  p.classList.toggle('open');
}
function applySysPrompt() {
  const ta = document.getElementById('sys-ta');
  STATE.sysPrompt = ta.value.trim();
  STATE.hasGlobalSys = STATE.sysPrompt.length > 0;
  document.getElementById('sys-prompt-btn').classList.toggle('has-global', STATE.hasGlobalSys);
  toggleSysPanel();
  toast('System prompt updated');
}
function clearSysPrompt() {
  document.getElementById('sys-ta').value = '';
  STATE.sysPrompt = '';
  STATE.hasGlobalSys = false;
  document.getElementById('sys-prompt-btn').classList.remove('has-global');
  toggleSysPanel();
  toast('System prompt cleared');
}

// ─── HW Stats ──────────────────────────────────────────────────
async function pollHW() {
  try {
    const res = await apiFetch('/api/stats');
    if (!res.ok) return;
    const data = await res.json();
    const cpuEl = document.getElementById('hw-cpu');
    const ramEl = document.getElementById('hw-ram');
    const cpuBar = document.getElementById('hw-cpu-bar');
    const ramBar = document.getElementById('hw-ram-bar');
    if (data.cpu_percent !== undefined) {
      cpuEl.textContent = Math.round(data.cpu_percent) + '%';
      cpuEl.className = 'hw-pct' + (data.cpu_percent > 80 ? ' warn' : '') + (data.cpu_percent > 95 ? ' danger' : '');
      cpuBar.style.transform = `scaleX(${data.cpu_percent / 100})`;
    }
    if (data.ram_percent !== undefined) {
      ramEl.textContent = Math.round(data.ram_percent) + '%';
      ramEl.className = 'hw-pct' + (data.ram_percent > 80 ? ' warn' : '') + (data.ram_percent > 95 ? ' danger' : '');
      ramBar.style.transform = `scaleX(${data.ram_percent / 100})`;
    }
  } catch { /* no hw endpoint */ }
}
