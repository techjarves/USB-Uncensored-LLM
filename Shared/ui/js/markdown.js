// ─── Markdown rendering with DOMPurify ─────────────────────────
function renderMd(text) {
  if (!text) return '';
  const allowedTags = [
    'h1','h2','h3','h4','h5','h6','p','br','hr',
    'ul','ol','li','blockquote','pre','code','strong','em','a','img',
    'table','thead','tbody','tr','th','td',
    'span','div','del','ins','sub','sup','dl','dt','dd',
    'kbd','samp','var','b','i','u','mark',
  ];
  const allowedAttrs = {
    a: ['href','title','target','rel'],
    img: ['src','alt','title','width','height','class'],
    code: ['class'],
    span: ['class'],
    pre: ['class'],
    div: ['class'],
    table: ['class'],
    th: ['align'],
    td: ['align'],
  };
  const html = marked.parse(text, { breaks: true, gfm: true });
  return DOMPurify.sanitize(html, {
    ALLOWED_TAGS: allowedTags,
    ALLOWED_ATTR: allowedAttrs,
    ALLOW_DATA_ATTR: false,
  });
}

// ─── Code block formatting ─────────────────────────────────────
function formatCodeBlocks(html) {
  const div = document.createElement('div');
  div.innerHTML = html;
  div.querySelectorAll('pre code').forEach(el => {
    const code = el;
    const pre = code.parentElement;
    const lang = (code.className || '').replace(/^lang-/,'').replace(/^language-/,'') || 'text';
    if (lang && lang !== 'text') {
      try {
        code.innerHTML = hljs.highlight(code.textContent, { language: lang }).value;
      } catch { /* fallback */ }
    } else {
      code.textContent = code.textContent;
    }
    // wrapped with copy button
    const wrap = document.createElement('div');
    wrap.className = 'cblk';
    const hdr = document.createElement('div');
    hdr.className = 'cbh';
    hdr.innerHTML = `<span>${escapeHtml(lang)}</span>`;
    const btn = document.createElement('button');
    btn.className = 'cbc-btn';
    btn.innerHTML = '<i class="fa-regular fa-copy"></i> Copy';
    btn.addEventListener('click', () => {
      navigator.clipboard.writeText(code.textContent).then(() => {
        btn.innerHTML = '<i class="fa-regular fa-check-circle"></i> Copied';
        setTimeout(() => { btn.innerHTML = '<i class="fa-regular fa-copy"></i> Copy'; }, 2000);
      }).catch(() => toast('Copy failed'));
    });
    hdr.appendChild(btn);
    wrap.appendChild(hdr);
    pre.parentElement.replaceChild(wrap, pre);
    wrap.appendChild(pre);
    pre.style.margin = '0';
  });
  return div.innerHTML;
}

function escapeHtml(s) {
  const d = document.createElement('div');
  d.textContent = s;
  return d.innerHTML;
}
