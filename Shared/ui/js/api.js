// ─── Fetch wrapper with auth ───────────────────────────────────
async function apiFetch(path, opts = {}) {
  const headers = opts.headers || {};
  if (STATE.token) headers['Authorization'] = `Bearer ${STATE.token}`;
  const res = await fetch(path, { ...opts, headers });
  if (res.status === 401) {
    toast('🔒 Auth required — check server console for token');
    throw new Error('Unauthorized');
  }
  return res;
}

// ─── Ollama API ────────────────────────────────────────────────
async function ollamaFetch(method, body) {
  const url = `${STATE.ollamaHost}/api/${method}`;
  const isGet = method === 'tags' || !body;
  const opts = {
    method: isGet ? 'GET' : 'POST',
  };
  if (!isGet) {
    opts.headers = { 'Content-Type': 'application/json' };
    opts.body = JSON.stringify(body);
  }
  const res = await fetch(url, opts);
  if (!res.ok) {
    let errMsg = `Ollama ${res.status}`;
    try {
      const errData = await res.json();
      if (errData.error) errMsg += `: ${errData.error}`;
    } catch {
      const txt = await res.text().catch(() => '');
      if (txt) errMsg += `: ${txt.slice(0, 200)}`;
    }
    if (res.status === 401) errMsg += ' — check Ollama authentication';
    throw new Error(errMsg);
  }
  return res;
}

async function fetchModels() {
  const res = await ollamaFetch('tags');
  const data = await res.json();
  STATE.modelMap = {};
  (data.models || []).forEach(m => {
    const name = m.name;
    STATE.modelMap[name] = {
      size: m.size,
      modified: m.modified_at,
      details: m.details || {},
    };
  });
  return Object.keys(STATE.modelMap);
}

async function checkOllama() {
  try {
    const names = await fetchModels();
    return names.length > 0;
  } catch {
    return false;
  }
}
