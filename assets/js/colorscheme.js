(() => {
  const root = document.documentElement;
  const schemes = ['default', 'dashboard', 'tokyonight'];
  const read = () => {
    try { return localStorage.getItem('colorscheme'); } catch { return null; }
  };
  const saved = read();
  const legacy = { 'kanagawa': 'dashboard', 'kanagawa-lotus': 'dashboard', 'tokyonight-day': 'tokyonight' };
  root.dataset.colorscheme = legacy[saved] || (schemes.includes(saved) ? saved : 'default');
  if (legacy[saved]) {
    const lightOnly = saved === 'kanagawa-lotus' || saved === 'tokyonight-day';
    if (lightOnly) root.classList.remove('dark');
    try {
      localStorage.setItem('colorscheme', root.dataset.colorscheme);
      if (lightOnly) localStorage.setItem('appearance', 'light');
    } catch {}
  }

  function sync() {
    root.style.colorScheme = root.classList.contains('dark') ? 'dark' : 'light';
    document.querySelectorAll('[data-scheme]').forEach(button => {
      button.setAttribute('aria-pressed', String(button.dataset.scheme === root.dataset.colorscheme));
    });
    const meta = document.querySelector('meta[name="theme-color"]');
    if (meta && document.body) meta.content = getComputedStyle(root).getPropertyValue('--lab-paper').trim();
  }

  document.addEventListener('DOMContentLoaded', () => {
    sync();
    const menu = document.querySelector('.colorscheme-menu');
    document.querySelectorAll('[data-scheme]').forEach(button => {
      button.addEventListener('click', () => {
        root.dataset.colorscheme = button.dataset.scheme;
        try {
          localStorage.setItem('colorscheme', root.dataset.colorscheme);
        } catch { /* The selection still works when storage is unavailable. */ }
        sync();
        window.updateMermaidTheme?.();
        menu.open = false;
        menu.querySelector('summary').focus();
      });
    });
    document.addEventListener('click', event => {
      if (menu && !menu.contains(event.target)) menu.open = false;
    });
    document.addEventListener('keydown', event => {
      if (event.key === 'Escape' && menu?.open) {
        menu.open = false;
        menu.querySelector('summary').focus();
      }
    });
    new MutationObserver(sync).observe(root, { attributes: true, attributeFilter: ['class', 'data-colorscheme'] });
  });
})();
