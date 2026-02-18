/* ─── VOID THEME JS ──────────────────────────────────────────────────────── */

'use strict';

/* ── Copy code button ─────────────────────────────────────────────────────── */

function initCopyButtons() {
  document.querySelectorAll('.highlight').forEach(block => {
    const pre = block.querySelector('pre');
    if (!pre) return;

    const code = pre.querySelector('code');
    let lang = '';
    if (code) {
      const match = code.className.match(/language-(\w+)/);
      if (match) lang = match[1];
    }

    const header = document.createElement('div');
    header.className = 'code-header';

    const langEl = document.createElement('span');
    langEl.className = 'code-lang';
    langEl.textContent = lang || 'code';

    const btn = document.createElement('button');
    btn.className = 'copy-btn';
    btn.setAttribute('aria-label', 'Copy code');
    btn.innerHTML = copyIcon() + ' copy';

    btn.addEventListener('click', async () => {
      const text = pre.innerText;
      try {
        await navigator.clipboard.writeText(text);
      } catch {
        const ta = document.createElement('textarea');
        ta.value = text;
        ta.style.cssText = 'position:fixed;opacity:0;';
        document.body.appendChild(ta);
        ta.select();
        document.execCommand('copy');
        document.body.removeChild(ta);
      }
      btn.innerHTML = checkIcon() + ' copied!';
      btn.classList.add('copied');
      setTimeout(() => {
        btn.innerHTML = copyIcon() + ' copy';
        btn.classList.remove('copied');
      }, 2000);
    });

    header.appendChild(langEl);
    header.appendChild(btn);
    block.insertBefore(header, pre);
  });
}

function copyIcon() {
  return `<svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="9" y="9" width="13" height="13" rx="2"/><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/></svg>`;
}

function checkIcon() {
  return `<svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"/></svg>`;
}

/* ── External link favicons ──────────────────────────────────────────────── */

function initExternalFavicons() {
  document.querySelectorAll('.post-content a[href^="http"]').forEach(link => {
    if (link.querySelector('img')) return;
    try {
      const { hostname } = new URL(link.href);
      const img = document.createElement('img');
      img.src = `https://icons.duckduckgo.com/ip3/${hostname}.ico`;
      img.className = 'ext-favicon';
      img.width = 16;
      img.height = 16;
      img.alt = '';
      img.loading = 'lazy';
      img.setAttribute('aria-hidden', 'true');
      img.onload  = () => link.classList.add('has-favicon');
      img.onerror = () => img.remove();
      link.prepend(img);   // before the text, like LogSeq
    } catch { /* invalid URL, skip */ }
  });
}

/* ── TOC scroll spy ───────────────────────────────────────────────────────── */

function initTOC() {
  const toc = document.querySelector('.toc');
  if (!toc) return;

  const headings = Array.from(
    document.querySelectorAll('.post-content h2, .post-content h3, .post-content h4')
  );
  if (!headings.length) return;

  const tocLinks = Array.from(toc.querySelectorAll('a'));

  const setActive = (id) => {
    tocLinks.forEach(a => a.classList.remove('toc-active'));
    const active = tocLinks.find(a => a.getAttribute('href') === `#${id}`);
    if (active) {
      active.classList.add('toc-active');
      // scroll the toc container to keep active link visible
      const tocRect  = toc.getBoundingClientRect();
      const linkRect = active.getBoundingClientRect();
      if (linkRect.bottom > tocRect.bottom || linkRect.top < tocRect.top) {
        active.scrollIntoView({ block: 'nearest' });
      }
    }
  };

  // IntersectionObserver approach: trigger when heading enters top ~20% of viewport
  const observer = new IntersectionObserver(
    entries => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          setActive(entry.target.id);
        }
      });
    },
    { rootMargin: '0px 0px -75% 0px', threshold: 0 }
  );

  headings.forEach(h => {
    if (h.id) observer.observe(h);
  });
}

/* ── Terminal typewriter ──────────────────────────────────────────────────── */

function initTerminal() {
  const el = document.getElementById('terminal-hero');
  if (!el) return;

  const title = el.dataset.title || '';
  const desc  = el.dataset.desc  || '';

  const sequence = [
    { type: 'cmd',  text: 'whoami' },
    { type: 'out',  text: title },
    { type: 'gap' },
    { type: 'cmd',  text: 'cat about.txt' },
    { type: 'out',  text: desc },
    { type: 'gap' },
    { type: 'done' },
  ];

  el.innerHTML = '';

  let lineEl = null;

  function newLine(cls) {
    lineEl = document.createElement('div');
    lineEl.className = 't-line';
    el.appendChild(lineEl);
    return lineEl;
  }

  function appendGap() {
    const gap = document.createElement('div');
    gap.style.height = '0.3rem';
    el.appendChild(gap);
  }

  function typeText(container, text, cls, speed, cb) {
    const span = document.createElement('span');
    span.className = cls;
    container.appendChild(span);
    let i = 0;
    const tick = () => {
      if (i < text.length) {
        span.textContent += text[i++];
        setTimeout(tick, speed + (Math.random() * speed * 0.4));
      } else {
        cb && cb();
      }
    };
    tick();
  }

  function runSequence(seq, idx) {
    if (idx >= seq.length) return;
    const step = seq[idx];
    const next = () => setTimeout(() => runSequence(seq, idx + 1), 80);

    if (step.type === 'gap') {
      appendGap();
      next();
    } else if (step.type === 'done') {
      const line = newLine();
      const prompt = document.createElement('span');
      prompt.className = 't-prompt';
      prompt.textContent = '❯';
      line.appendChild(prompt);
      const cursor = document.createElement('span');
      cursor.className = 't-cursor';
      line.appendChild(cursor);
    } else if (step.type === 'cmd') {
      const line = newLine();
      const prompt = document.createElement('span');
      prompt.className = 't-prompt';
      prompt.textContent = '❯';
      line.appendChild(prompt);
      typeText(line, step.text, 't-cmd', 55, next);
    } else if (step.type === 'out') {
      const line = newLine();
      setTimeout(() => {
        typeText(line, step.text, 't-out', 20, next);
      }, 120);
    }
  }

  // small initial delay so the page settles first
  setTimeout(() => runSequence(sequence, 0), 400);
}

/* ── Search modal ─────────────────────────────────────────────────────────── */

function initSearchModal() {
  const modal    = document.getElementById('search-modal');
  const backdrop = modal?.querySelector('.s-backdrop');
  if (!modal || !backdrop) return;

  const trigger = document.querySelector('.site-nav a[href="/search/"]');

  let pfLoaded          = false;
  let selIdx            = -1;
  let inputListenerDone = false;

  function getResults() {
    return Array.from(modal.querySelectorAll('.pagefind-ui__result'));
  }

  function pickResult(idx) {
    const results = getResults();
    results.forEach(r => r.classList.remove('s-result-active'));
    selIdx = Math.max(0, Math.min(idx, results.length - 1));
    results[selIdx].classList.add('s-result-active');
    results[selIdx].scrollIntoView({ block: 'nearest' });
  }

  function open() {
    modal.removeAttribute('hidden');
    document.body.style.overflow = 'hidden';
    selIdx = -1;
    if (!pfLoaded) { pfLoaded = true; loadPagefind(); }
    else            { focusInput(); }
  }

  function close() {
    modal.setAttribute('hidden', '');
    document.body.style.overflow = '';
    selIdx = -1;
    getResults().forEach(r => r.classList.remove('s-result-active'));
  }

  function focusInput() {
    setTimeout(() => {
      const input = modal.querySelector('input[type=text]');
      if (!input) return;
      input.focus();
      if (!inputListenerDone) {
        inputListenerDone = true;
        input.addEventListener('input', () => {
          selIdx = -1;
          getResults().forEach(r => r.classList.remove('s-result-active'));
        });
      }
    }, 60);
  }

  function loadPagefind() {
    const link = document.createElement('link');
    link.rel  = 'stylesheet';
    link.href = '/pagefind/pagefind-ui.css';
    document.head.appendChild(link);

    const script = document.createElement('script');
    script.src = '/pagefind/pagefind-ui.js';
    script.onload = () => {
      new PagefindUI({
        element: '#s-pagefind',
        showImages: false,
        showSubResults: true,
        resetStyles: false,
        translations: {
          placeholder:   'search 0x4d72...',
          clear_search:  '✕',
          zero_results:  'No results for "[SEARCH_TERM]"',
          many_results:  '[COUNT] results for "[SEARCH_TERM]"',
          one_result:    '[COUNT] result for "[SEARCH_TERM]"',
        },
      });
      focusInput();
    };
    script.onerror = () => {
      document.getElementById('s-no-index').removeAttribute('hidden');
    };
    document.head.appendChild(script);
  }

  if (trigger) {
    trigger.addEventListener('click', e => { e.preventDefault(); open(); });
  }

  document.addEventListener('keydown', e => {
    const tag = document.activeElement.tagName;

    if (e.key === '/' && tag !== 'INPUT' && tag !== 'TEXTAREA') {
      e.preventDefault(); open(); return;
    }

    if (modal.hidden) return;

    if (e.key === 'Escape') { close(); return; }

    const results = getResults();
    if (!results.length) return;

    if (e.key === 'ArrowDown') {
      e.preventDefault();
      if (selIdx < results.length - 1) pickResult(selIdx + 1);
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      if (selIdx > 0) {
        pickResult(selIdx - 1);
      } else {
        results.forEach(r => r.classList.remove('s-result-active'));
        selIdx = -1;
        modal.querySelector('input[type=text]')?.focus();
      }
    } else if (e.key === 'Enter' && selIdx >= 0) {
      const link = results[selIdx]?.querySelector('.pagefind-ui__result-title a');
      if (link) { e.preventDefault(); link.click(); }
    }
  });

  backdrop.addEventListener('click', close);
}

/* ── Vim-style keyboard navigation ───────────────────────────────────────── */

function initVimKeys() {
  const STEP      = 80;
  const HALF_PAGE = () => window.innerHeight / 2;

  let focusedIdx = -1;
  let gPressed   = false;
  let gTimer     = null;

  function getItems() {
    return Array.from(document.querySelectorAll('.post-card, .post-item'));
  }

  function setFocus(idx) {
    const items = getItems();
    items.forEach(el => el.classList.remove('vim-focused'));
    focusedIdx = Math.max(0, Math.min(idx, items.length - 1));
    items[focusedIdx].classList.add('vim-focused');
    items[focusedIdx].scrollIntoView({ block: 'nearest', behavior: 'smooth' });
  }

  function clearFocus() {
    getItems().forEach(el => el.classList.remove('vim-focused'));
    focusedIdx = -1;
  }

  function openFocused() {
    const items = getItems();
    if (focusedIdx < 0 || focusedIdx >= items.length) return;
    const link = items[focusedIdx].querySelector('a.pc-title, a.post-title-link');
    if (link) link.click();
  }

  document.addEventListener('keydown', e => {
    const tag = document.activeElement.tagName;
    if (['INPUT', 'TEXTAREA', 'SELECT'].includes(tag)) return;
    if (document.activeElement.isContentEditable) return;

    const modal = document.getElementById('search-modal');
    if (modal && !modal.hidden) return;

    if (e.key !== 'g' && gPressed) { gPressed = false; clearTimeout(gTimer); }

    const items    = getItems();
    const hasItems = items.length > 0;

    switch (e.key) {
      case 'j':
        e.preventDefault();
        if (hasItems) setFocus(focusedIdx < 0 ? 0 : focusedIdx + 1);
        else window.scrollBy({ top: STEP, behavior: 'smooth' });
        break;
      case 'k':
        e.preventDefault();
        if (hasItems) {
          if (focusedIdx > 0) setFocus(focusedIdx - 1);
          else clearFocus();
        } else {
          window.scrollBy({ top: -STEP, behavior: 'smooth' });
        }
        break;
      case 'd':
        e.preventDefault();
        window.scrollBy({ top: HALF_PAGE(), behavior: 'smooth' });
        break;
      case 'u':
        e.preventDefault();
        window.scrollBy({ top: -HALF_PAGE(), behavior: 'smooth' });
        break;
      case 'G':
        e.preventDefault();
        window.scrollTo({ top: document.body.scrollHeight, behavior: 'smooth' });
        break;
      case 'g':
        if (gPressed) {
          e.preventDefault();
          window.scrollTo({ top: 0, behavior: 'smooth' });
          gPressed = false;
          clearTimeout(gTimer);
        } else {
          gPressed = true;
          gTimer = setTimeout(() => { gPressed = false; }, 500);
        }
        break;
      case 'Enter':
        if (hasItems && focusedIdx >= 0) { e.preventDefault(); openFocused(); }
        break;
      case 'H':
        e.preventDefault();
        history.back();
        break;
      case 'L':
        e.preventDefault();
        history.forward();
        break;
    }
  });
}

/* ── Relative dates ───────────────────────────────────────────────────────── */

function initRelativeDates() {
  const now = Date.now();

  document.querySelectorAll('time[datetime]').forEach(el => {
    const dt = el.getAttribute('datetime');
    if (!dt) return;
    const date = new Date(dt);
    if (isNaN(date.getTime())) return;

    const days = Math.floor((now - date.getTime()) / 86_400_000);

    let label;
    if      (days === 0)  label = 'today';
    else if (days === 1)  label = 'yesterday';
    else if (days <   7)  label = `${days} days ago`;
    else if (days <  14)  label = 'a week ago';
    else if (days <  30)  label = `${Math.floor(days / 7)} weeks ago`;
    else if (days <  60)  label = 'a month ago';
    else if (days < 365)  label = `${Math.floor(days / 30)} months ago`;
    else if (days < 730)  label = 'a year ago';
    else                  label = `${Math.floor(days / 365)} years ago`;

    el.setAttribute('data-date', el.textContent.trim());
    el.textContent = label;
  });
}

/* ── Active nav link ──────────────────────────────────────────────────────── */

function markActiveNav() {
  const path = window.location.pathname;
  document.querySelectorAll('.site-nav a').forEach(link => {
    const href = link.getAttribute('href');
    if (href && href !== '/' && path.startsWith(href)) {
      link.style.color = 'var(--accent)';
    }
  });
}

/* ── Init ─────────────────────────────────────────────────────────────────── */

document.addEventListener('DOMContentLoaded', () => {
  [initCopyButtons, initExternalFavicons, initTOC, initTerminal,
   initSearchModal, markActiveNav, initVimKeys, initRelativeDates]
    .forEach(fn => { try { fn(); } catch (e) { console.error(fn.name, e); } });
});
