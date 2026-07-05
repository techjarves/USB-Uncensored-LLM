// ─── Message rendering ─────────────────────────────────────────
function renderMsgs() {
  const el = document.getElementById('msgs');
  el.innerHTML = '';
  STATE.msgs.forEach((m, i) => {
    const mr = document.createElement('div');
    mr.className = `mr ${m.role}`;
    mr.id = `msg-${i}`;
    mr.innerHTML = msgHTML(m, i);
    el.appendChild(mr);
  });
  scrollChat();
}

function msgHTML(m, idx) {
  const isAI = m.role === 'assistant';
  const isUsr = m.role === 'user';
  const cont = m.content || '';
  const html = renderMd(cont);
  const fhtml = formatCodeBlocks(html);
  let avatar = '';
  if (isAI) {
    avatar = `<div class="ma ai"><svg viewBox="0 0 24 24" fill="none" stroke="#fff" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 2a4 4 0 0 0-4 4c0 2 2 4 2 4h4s2-2 2-4a4 4 0 0 0-4-4z"/><path d="M6 15h12l-1.5 5h-9z"/></svg></div>`;
  } else {
    avatar = `<div class="ma u">U</div>`;
  }
  let body = '';
  if (isUsr) {
    body = `<div class="ub"><div class="mt">${fhtml}</div></div>`;
    if (m.file) {
      body += `<div class="usr-attach">${fileAttachHTML(m.file)}</div>`;
    }
  } else {
    body = `<div class="mt">${fhtml}</div>`;
  }
  let meta = '';
  if (m.done) {
    meta = `<div class="msg-meta"><span>${m.model || STATE.model}</span><span class="dot"></span><span>${formatTime(m.time)}</span></div>`;
  }
  const actions = `<div class="mact">${isAI ? '<button class="mab lk" onclick="copyMsg('+idx+')" title="Copy"><i class="fa-regular fa-copy"></i></button><button class="mab dlk" onclick="deleteMsg('+idx+')" title="Delete"><i class="fa-regular fa-trash-can"></i></button>' : '<button class="mab dlk" onclick="deleteMsg('+idx+')" title="Delete"><i class="fa-regular fa-trash-can"></i></button>'}</div>`;
  return `<div class="mc">${avatar}${body}${meta}${actions}</div>`;
}

function fileAttachHTML(file) {
  if (file.type === 'image') {
    return `<img class="msg-img" src="${file.data}" alt="Attached image">`;
  }
  if (file.type === 'pdf') {
    return `<span class="msg-pdf-pill"><i class="fa-regular fa-file-pdf"></i> ${file.name || 'PDF'}</span>`;
  }
  return '';
}

function appendMsg(role, content, opts = {}) {
  const msg = { role, content, time: Date.now(), done: true, model: opts.model || null, file: opts.file || null };
  STATE.msgs.push(msg);
  renderMsgs();
}

function streamMsg(content, opts = {}) {
  const last = STATE.msgs[STATE.msgs.length - 1];
  if (last && last.role === 'assistant' && !last.done) {
    last.content = content;
  } else {
    STATE.msgs.push({ role: 'assistant', content, time: Date.now(), done: false, model: opts.model || null });
  }
  // re-render last message
  const el = document.getElementById('msgs');
  const idx = STATE.msgs.length - 1;
  let mr = document.getElementById(`msg-${idx}`);
  if (!mr) {
    mr = document.createElement('div');
    mr.className = 'mr assistant';
    mr.id = `msg-${idx}`;
    el.appendChild(mr);
  }
  mr.innerHTML = msgHTML(STATE.msgs[idx], idx);
  scrollChat();
}

function finishStream(content, opts = {}) {
  const last = STATE.msgs[STATE.msgs.length - 1];
  if (last && last.role === 'assistant') {
    last.content = content;
    last.done = true;
    last.time = Date.now();
    last.model = opts.model || last.model;
  }
  renderMsgs();
}

function scrollChat() {
  const chat = document.getElementById('chat');
  requestAnimationFrame(() => { chat.scrollTop = chat.scrollHeight; });
}

function copyMsg(idx) {
  const m = STATE.msgs[idx];
  if (!m) return;
  navigator.clipboard.writeText(m.content).then(() => toast('Copied')).catch(() => {});
}

function deleteMsg(idx) {
  STATE.msgs.splice(idx, 1);
  renderMsgs();
  if (STATE.msgs.length === 0) {
    document.getElementById('msgs').classList.remove('on');
    document.getElementById('welcome').style.display = '';
  }
}

function formatTime(ts) {
  if (!ts) return '';
  const d = new Date(ts);
  const h = d.getHours().toString().padStart(2, '0');
  const m = d.getMinutes().toString().padStart(2, '0');
  return `${h}:${m}`;
}

function clearChat() {
  STATE.msgs = [];
  document.getElementById('msgs').classList.remove('on');
  document.getElementById('welcome').style.display = '';
  renderMsgs();
}

// ─── Thinking indicator ────────────────────────────────────────
function showThinking() {
  const el = document.getElementById('msgs');
  const div = document.createElement('div');
  div.className = 'think';
  div.id = 'think-indicator';
  div.innerHTML = '<span>Thinking</span><span class="typ"><span></span><span></span><span></span></span>';
  el.appendChild(div);
  scrollChat();
}
function removeThinking() {
  const el = document.getElementById('think-indicator');
  if (el) el.remove();
}
