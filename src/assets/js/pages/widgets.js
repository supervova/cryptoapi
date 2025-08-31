/**
 * Выполняет поиск элемента или элементов в DOM.
 * @param {string} s - CSS-селектор.
 * @param {boolean} [all=false] - Выбрать все совпадения.
 * @param {Document|Element} [r=document] - Корневой элемент для поиска.
 * @returns {Element|NodeList|null} Элемент, список элементов или null.
 */
const $ = (s, all = false, r = document) =>
  all ? r.querySelectorAll(s) : r.querySelector(s);

const preview = $('.e-widgets__preview');
const code = $('#form-code code');
const copyBtn = $('.e-button__copy');
const rowsInp = document.getElementById('form-rows');
const themeBtns = $('[data-theme]', true);
const tabBtns = $('[role="tab"]', true);
const widgetConfigs = $('[data-widget-config]', true);
const titleTpl =
  document.getElementById('iframe-title')?.textContent ||
  'Crypto %s widget';

// конфиг из APP_CONFIG или дефолты
const ORIGIN = window.location.origin;
window.APP_CONFIG = window.APP_CONFIG || {};
const APP = window.APP_CONFIG;

// helpers
const clamp = (v, a, b) => Math.max(a, Math.min(b, v));
const baseUrl = (path) => {
  try {
    // Use URL constructor for robust path joining
    return new URL(path, ORIGIN).href;
  } catch {
    // Fallback for older browsers or unexpected issues
    return ORIGIN + path;
  }
};

const getActiveWidget = () => {
  const activeTab = $('.e-tabs-nav__item.is-active');
  return activeTab ? activeTab.id.replace('tab-', '') : 'signals';
};

const state = {
  widget: getActiveWidget(),
  theme: 'dark',
  rows: Number(rowsInp?.value) || 8,
  lang: APP.lang || 'en',
  aff: APP.affId || '',
};

const buildSrc = () => {
  const p = new URLSearchParams({
    theme: state.theme,
  });

  p.set('PageSpeed', 'Off');

  if (state.widget === 'signals') {
    p.set('rows', String(clamp(state.rows, 1, 8)));
  }

  if (state.aff) p.set('aff', state.aff);

  if (APP.widgetAuthQuery) {
    const extra = String(APP.widgetAuthQuery).replace(/^\?/, '');
    extra.split('&').forEach((kv) => {
      const [k, v = ''] = kv.split('=');
      if (k && !p.has(k)) {
        p.set(k, v);
      }
    });
  }

  const langPath = state.lang === 'en' ? '' : `/${state.lang}`;
  const extension = APP.env === 'development' ? '.html' : '';
  const widgetPath = `${langPath}/widgets/${state.widget}${extension}`;
  const abs = baseUrl(widgetPath);

  return `${abs}?${p.toString()}`;
};

const iframeHtml = () => {
  const title = titleTpl.replace('%s', state.widget);
  return `<iframe src="${buildSrc()}" title="${title}" loading="lazy"
  referrerpolicy="no-referrer-when-downgrade"
  sandbox="allow-scripts allow-popups allow-top-navigation-by-user-activation allow-same-origin"
  style="border:0;border-radius:12px;overflow:hidden;width:100%" width="100%"></iframe>`;
};

const embedCode = () => {
  const iframeTag = iframeHtml();
  const scriptTag = `<script>
(function() {
  if (window.cryptoApiWidgetListener) {
    return;
  }
  window.cryptoApiWidgetListener = true;
  window.addEventListener('message', function(e) {
    if (e.origin !== "${ORIGIN}") {
      return;
    }
    if (e.data && e.data.type === 'cryptoapi:height' && e.source) {
      var iframes = document.querySelectorAll('iframe[src*="${ORIGIN}"]');
      for (var i = 0; i < iframes.length; i++) {
        if (iframes[i].contentWindow === e.source) {
          iframes[i].style.height = (e.data.height || 120) + 'px';
          break;
        }
      }
    }
  });
})();
</script>`;
  return `${iframeTag}\n${scriptTag}`;
};

/** Показывает/скрывает настройки для конкретного виджета */
function updateConfigVisibility() {
  widgetConfigs.forEach((item) => {
    const el = item;
    el.hidden = el.dataset.widgetConfig !== state.widget;
  });
}

function render() {
  const html = iframeHtml();
  preview.innerHTML = html;
  code.textContent = embedCode();

  const iframe = preview.querySelector('iframe');
  if (iframe) {
    iframe.addEventListener('load', () => {
      try {
        // Directly manipulate the DOM for same-origin iframes
        iframe.contentWindow.postMessage(
          { type: 'cryptoapi:theme', theme: state.theme },
          '*'
        );
      } catch (e) {
        console.error('Could not set theme directly on iframe.', e);
      }
    });
  }
  updateConfigVisibility();
}

// events
rowsInp?.addEventListener('input', () => {
  const v = parseInt(rowsInp.value || '8', 10);
  state.rows = clamp(Number.isNaN(v) ? 8 : v, 1, 8);
  rowsInp.value = String(state.rows);
  render();
});

themeBtns.forEach((b) =>
  b.addEventListener('click', () => {
    state.theme = b.dataset.theme;
    themeBtns.forEach((x) => x.toggleAttribute('aria-pressed', x === b));
    render();
  })
);

tabBtns.forEach((tab) => {
  tab.addEventListener('click', (e) => {
    const clickedTab = e.currentTarget;
    if (clickedTab.getAttribute('aria-selected') === 'true') {
      return; // do nothing if already selected
    }

    // Update state
    state.widget = clickedTab.id.replace('tab-', '');

    // Update UI
    tabBtns.forEach((t) => {
      const isSelected = t === clickedTab;
      t.classList.toggle('is-active', isSelected);
      t.setAttribute('aria-selected', isSelected);
      t.setAttribute('tabindex', isSelected ? '0' : '-1');
    });

    render();
  });
});

copyBtn?.addEventListener('click', async () => {
  try {
    await navigator.clipboard.writeText(code.textContent.trim());
    copyBtn.textContent = 'Copied';
  } catch {
    // ignore clipboard errors
  }
  setTimeout(() => {
    copyBtn.textContent = 'Copy code';
  }, 1200);
});

window.addEventListener('message', (e) => {
  if (!e.data || e.data.type !== 'cryptoapi:height') return;
  const f = preview.querySelector('iframe');
  if (f) f.style.height = `${Math.max(120, +e.data.height || 0)}px`;
});

// init
render();
