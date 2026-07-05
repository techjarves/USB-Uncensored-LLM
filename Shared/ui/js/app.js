// ─── Send message ──────────────────────────────────────────────
let _sendBtn = null;
let _stopBtn = null;

async function sendMsg() {
  if (STATE.streaming) return;
  const inp = document.getElementById('msg-inp');
  const text = inp.value.trim();
  if (!text && !STATE.imageData && !STATE.pdfText) return;
  if (STATE.imageData && !isVisionModel(STATE.model)) {
    removeAttachment();
    if (!STATE.activeCid) newConvo();
    document.getElementById('welcome').style.display = 'none';
    document.getElementById('msgs').classList.add('on');
    appendMsg('assistant', 'Cannot read "image.png" (this model does not support image input)');
    saveCurrentConvo();
    return;
  }
  if (!STATE.activeCid) newConvo();
  const msgText = text || (STATE.imageData ? '[Attached image]' : '[Attached PDF]');
  const fileInfo = STATE.imageData ? { type: 'image', data: STATE.imageData } :
                   STATE.pdfText ? { type: 'pdf', name: document.getElementById('pdf-name').textContent } : null;
  appendMsg('user', msgText, { file: fileInfo });
  inp.value = '';
  removeAttachment();
  document.getElementById('welcome').style.display = 'none';
  document.getElementById('msgs').classList.add('on');
  saveCurrentConvo();
  showThinking();
  STATE.streaming = true;
  _sendBtn.classList.add('hidden');
  _stopBtn.classList.remove('hidden');
  const ac = new AbortController();
  STATE.abort = ac;
  try {
    const msgs = [];
    if (STATE.sysPrompt) msgs.push({ role: 'system', content: STATE.sysPrompt });
    STATE.msgs.filter(m => m.done).forEach(m => {
      if (m.content) msgs.push({ role: m.role, content: m.content });
    });
    msgs.push({ role: 'user', content: msgText });
    const body = { model: STATE.model, messages: msgs, stream: true, options: { temperature: STATE.temp } };
    if (STATE.imageData) {
      const b64 = STATE.imageData.split(',')[1];
      body.messages[body.messages.length - 1].images = [b64];
    }
    if (STATE.pdfText) {
      body.messages[body.messages.length - 1].content = msgText + '\n\n[Attached PDF content follows]\n' + STATE.pdfText;
    }
    removeThinking();
    const res = await ollamaFetch('chat', body);
    const reader = res.body.getReader();
    const decoder = new TextDecoder();
    let full = '';
    let buf = '';
    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      buf += decoder.decode(value, { stream: true });
      const lines = buf.split('\n');
      buf = lines.pop() || '';
      for (const line of lines) {
        if (!line.trim()) continue;
        try {
          const j = JSON.parse(line);
          if (j.message?.content) {
            full += j.message.content;
            streamMsg(full, { model: STATE.model });
          }
          if (j.done) {
            finishStream(full, { model: STATE.model });
          }
        } catch { /* skip */ }
      }
    }
    finishStream(full, { model: STATE.model });
    saveCurrentConvo();
    if (STATE.msgs.length === 1) {
      const title = STATE.msgs[0].content.slice(0, 40) + (STATE.msgs[0].content.length > 40 ? '…' : '');
      updateConvoTitle(STATE.activeCid, title);
    }
  } catch (err) {
    removeThinking();
    if (err.name !== 'AbortError') {
      appendMsg('assistant', `Error: ${err.message}`);
      saveCurrentConvo();
    }
  } finally {
    STATE.streaming = false;
    STATE.abort = null;
    _stopBtn.classList.add('hidden');
    _sendBtn.classList.remove('hidden');
    updateSendBtn();
  }
}

function stopStream() {
  if (STATE.abort) {
    STATE.abort.abort();
    const last = STATE.msgs[STATE.msgs.length - 1];
    if (last && last.role === 'assistant' && !last.done) {
      finishStream(last.content, { model: STATE.model });
      saveCurrentConvo();
    }
  }
}

// ─── Send button state ─────────────────────────────────────────
function updateSendBtn() {
  const inp = document.getElementById('msg-inp');
  const hasContent = inp.value.trim() || STATE.imageData || STATE.pdfText;
  _sendBtn.classList.toggle('hidden', !hasContent);
  _sendBtn.classList.toggle('on', hasContent);
}

document.addEventListener('DOMContentLoaded', () => {
  _sendBtn = document.querySelector('.sbtn');
  _stopBtn = document.querySelector('.stbtn');
  if (_stopBtn) _stopBtn.classList.add('hidden');
});
document.getElementById('msg-inp').addEventListener('input', updateSendBtn);
document.getElementById('msg-inp').addEventListener('keydown', e => {
  if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); sendMsg(); }
});
document.addEventListener('click', e => {
  if (e.target.closest('.sbtn') && !e.target.closest('.sbtn.hidden')) sendMsg();
  if (e.target.closest('.stbtn') && !e.target.closest('.stbtn.hidden')) stopStream();
});

// ─── File handling — paste ─────────────────────────────────────
document.getElementById('msg-inp').addEventListener('paste', async e => {
  const items = e.clipboardData?.items;
  if (!items) return;
  for (const item of items) {
    if (item.type.startsWith('image/')) {
      e.preventDefault();
      const file = item.getAsFile();
      if (!file) continue;
      const reader = new FileReader();
      reader.onload = () => attachImage(reader.result);
      reader.readAsDataURL(file);
      return;
    }
  }
});

// ─── File handling — drag & drop ───────────────────────────────
const main = document.getElementById('main');
main.addEventListener('dragover', e => { e.preventDefault(); main.classList.add('drag-over'); });
main.addEventListener('dragleave', e => { main.classList.remove('drag-over'); });
main.addEventListener('drop', async e => {
  e.preventDefault();
  main.classList.remove('drag-over');
  const files = e.dataTransfer.files;
  if (!files.length) return;
  for (const file of files) {
    if (file.type.startsWith('image/')) {
      const reader = new FileReader();
      reader.onload = () => attachImage(reader.result);
      reader.readAsDataURL(file);
      return;
    }
    if (file.type === 'application/pdf' || file.name.endsWith('.pdf')) {
      const reader = new FileReader();
      reader.onload = () => {
        const text = reader.result;
        attachPdf(file.name, text);
      };
      reader.readAsText(file);
      return;
    }
    if (file.type.startsWith('text/')) {
      const reader = new FileReader();
      reader.onload = () => {
        document.getElementById('msg-inp').value += reader.result;
        updateSendBtn();
        document.getElementById('msg-inp').dispatchEvent(new Event('input'));
      };
      reader.readAsText(file);
      return;
    }
  }
});

// ─── File upload button ────────────────────────────────────────
document.getElementById('file-btn').addEventListener('click', () => {
  const inp = document.getElementById('file-input');
  inp.click();
});
document.getElementById('file-input').addEventListener('change', e => {
  const file = e.target.files[0];
  if (!file) return;
  if (file.type.startsWith('image/')) {
    const reader = new FileReader();
    reader.onload = () => attachImage(reader.result);
    reader.readAsDataURL(file);
  } else if (file.type === 'application/pdf' || file.name.endsWith('.pdf')) {
    const reader = new FileReader();
    reader.onload = () => attachPdf(file.name, reader.result);
    reader.readAsText(file);
  } else if (file.type.startsWith('text/')) {
    const reader = new FileReader();
    reader.onload = () => {
      document.getElementById('msg-inp').value += reader.result;
      updateSendBtn();
    };
    reader.readAsText(file);
  } else {
    toast('Unsupported file type');
  }
  inp.value = '';
});

// ─── Init ──────────────────────────────────────────────────────
document.addEventListener('DOMContentLoaded', async () => {
  initTemp();
  newConvo();
  // Load auth token from server
  try {
    const res = await fetch('/api/token');
    if (res.ok) {
      const data = await res.json();
      if (data.token) STATE.token = data.token;
    }
  } catch { /* no auth or server not ready */ }
  // check Ollama availability
  let names = [];
  try {
    names = await fetchModels();
  } catch {
    toast('Ollama not reachable — start Ollama first');
  }
  buildModelMenu(names);
  if (names.length > 0) {
    const defaultIdx = names.indexOf(STATE.model);
    if (defaultIdx === -1) {
      selectModel(names[0]);
    } else {
      document.getElementById('model-name').textContent = STATE.model;
    }
  } else {
    document.getElementById('model-name').textContent = 'No models';
    document.querySelector('.model-btn').classList.add('no-models');
  }
  // HW stats polling
  pollHW();
  setInterval(pollHW, 5000);
  // File input value reset on click
  document.getElementById('file-input').addEventListener('click', e => { e.target.value = ''; });
});
