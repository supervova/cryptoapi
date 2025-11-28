/**
 * Универсальный поиск по активам (и в перспективе — по новостям/блогу).
 * Работает на любой странице; в /markets фильтрует таблицу, в остальных – выводит
 * выпадающие подсказки и переходит по выбору/submit.
 */
import { state as marketsState } from './markets/state.js';
import { CURRENT_LANG, IS_DEVELOPMENT, API_URL_DEV } from './markets/config.js';

const SEARCH_MIN_LENGTH = 3;
const MAX_SUGGESTIONS = 8;

const input = document.getElementById('header-search');
if (!input) {
  console.debug(
    '[search] #header-search not found – search.js is inert on this page'
  );
}

let assetDirectory = {};
let box; // UL-контейнер подсказок
let highlight = -1; // индекс подсвеченного <li>

const lang = CURRENT_LANG || document.documentElement.lang || 'en';
// /markets, /markets/, /markets.html, /ru/markets.html и пр.

// i18n
const t = (k) => (window.t ? window.t(k) : k);
const isMarketsPage =
  document.getElementById('crypto-table-body') !== null ||
  /\/(?:[a-z]{2}\/)?markets(?:\.html?)?\/?$/.test(window.location.pathname);

// -----------------------------------------------------------------------------
// Утилиты
// -----------------------------------------------------------------------------
// #region

/**
 * Генерирует URL страницы актива.
 * @param {string} symbol
 * @return {string}
 */
const assetUrl = (symbol) => `/${lang}/markets/${symbol.toLowerCase()}`;

/**
 * Удаляет HTML-символы из строки.
 * @param {string} str
 * @return {string}
 */
const stripHtml = (str = '') => str.replace(/[<&"]/g, ''); // минимальная защита

const buildDirectoryFromObject = (source) => {
  if (!source || typeof source !== 'object') return {};
  return Object.keys(source).reduce((acc, key) => {
    const upper = key.toUpperCase();
    const payload = source[key];
    acc[upper] = {
      name:
        payload && typeof payload === 'object' && payload.name
          ? payload.name
          : upper,
      quote:
        payload && typeof payload === 'object' && payload.quote
          ? payload.quote
          : undefined,
    };
    return acc;
  }, {});
};

const buildDirectoryFromList = (assets = []) =>
  assets.reduce((acc, asset) => {
    if (!asset?.symbol) return acc;
    const upper = asset.symbol.toUpperCase();
    acc[upper] = {
      name: asset.name || upper,
      quote: asset.quote,
    };
    return acc;
  }, {});

const normalizeResponsePayload = (raw) => {
  if (!raw) return {};
  if (
    Array.isArray(raw) &&
    raw.length >= 2 &&
    raw[0] === 'OK' &&
    typeof raw[1] === 'object' &&
    raw[1] !== null
  ) {
    return raw[1];
  }
  if (IS_DEVELOPMENT && typeof raw === 'object' && !Array.isArray(raw)) {
    return raw;
  }
  return {};
};

async function fetchDirectoryFromApi() {
  const params = new URLSearchParams();
  params.append('jsonfather', 'true');

  const options = IS_DEVELOPMENT
    ? { method: 'GET' }
    : {
        method: 'POST',
        body: params.toString(),
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        credentials: 'include',
      };

  const langPrefix = lang ? `${lang}/` : '';
  const requestUrl = IS_DEVELOPMENT
    ? API_URL_DEV
    : `${window.location.origin}/${langPrefix}json/trindxrating`;

  const response = await fetch(requestUrl, options);
  if (!response.ok) {
    throw new Error(`Failed to load trindx directory: ${response.status}`);
  }

  const raw = await response.json();
  return buildDirectoryFromObject(normalizeResponsePayload(raw));
}

/**
 * Загружает справочник криптоактивов.
 * @return {Promise<void>}
 */
async function loadDirectory() {
  if (Object.keys(assetDirectory).length) return;

  if (
    marketsState.cryptoMeta &&
    Object.keys(marketsState.cryptoMeta).length > 0
  ) {
    assetDirectory = marketsState.cryptoMeta;
    return;
  }

  if (Array.isArray(marketsState.allAssets) && marketsState.allAssets.length) {
    assetDirectory = buildDirectoryFromList(marketsState.allAssets);
    return;
  }

  try {
    assetDirectory = await fetchDirectoryFromApi();
  } catch (error) {
    console.error('[search] Failed to load asset directory:', error);
    assetDirectory = {};
  }
}
// #endregion

// -----------------------------------------------------------------------------
// TODO: Поиск по новостям и блогу
// -----------------------------------------------------------------------------
// #region
// async function getNewsMatches(q) { return []; }
// async function getBlogMatches(q) { return []; }
// #endregion

// -----------------------------------------------------------------------------
// Выпадающий список результатов
// -----------------------------------------------------------------------------
// #region

/**
 * Создаёт контейнер для подсказок.
 */
function buildBox() {
  if (box) return;
  box = document.createElement('ul');
  box.className = 'e-search__suggestions';
  box.setAttribute('role', 'listbox');
  box.hidden = true; // скрыто по умолчанию
  input.after(box);
}

/**
 * Делает контейнер видимым с классом анимации.
 */
function showBox() {
  if (!box) return;
  box.hidden = false;
  requestAnimationFrame(() => box.classList.add('is-visible'));
}

/**
 * Скрывает контейнер подсказок.
 */
function clearBox() {
  if (!box) return;
  box.classList.remove('is-visible');
  box.hidden = true;
  highlight = -1;
}

/**
 * Рендерит список подсказок.
 * @param {Array} matches
 */
function render(groups /* , q */) {
  buildBox();
  box.innerHTML = `<h2 class="visually-hidden">${t('Search results')}</h2>`;

  groups.forEach(({ /* title, */ items = [] }) => {
    if (!items.length) return;
    const liGroup = document.createElement('li');
    liGroup.className = 'e-search__suggestions-group';
    // TODO: Подзаголовок групп — раскомментировать, когда будут реализованы Новости или блог.
    // liGroup.innerHTML = `<h3>${title}</h3><ul></ul>`;
    liGroup.innerHTML = '<ul></ul>';
    const inner = liGroup.querySelector('ul');

    items.forEach(({ symbol, title: itemTitle, url }) => {
      const li = document.createElement('li');
      li.className = 'e-search__suggestion';
      li.dataset.url = url;
      li.setAttribute('role', 'option');
      li.innerHTML = symbol
        ? `<strong>${symbol}</strong> — ${stripHtml(itemTitle)}`
        : stripHtml(itemTitle); // для новостей/блога
      li.addEventListener('mousedown', () => {
        window.location.href = url;
      });
      inner.appendChild(li);
    });
    box.appendChild(liGroup);
  });

  /*
  // TODO: «All results» - рассккоментировать, когда будут реализованы Новости или блог.
  box.insertAdjacentHTML(
    'beforeend',
    `<li class="e-search__suggestions-link">
       <a href="/${lang}/search?q=${encodeURIComponent(q)}">${t('All results')}</a>
     </li>`
  );
  */

  if (box.querySelector('.e-search__suggestion')) {
    showBox();
  } else {
    box.hidden = true;
  }
}

/**
 * Возвращает подходящие активы по запросу.
 * @param {string} q
 * @return {Array}
 */
function getAssetMatches(q) {
  const term = q.toLowerCase();
  return Object.entries(assetDirectory)
    .filter(
      ([sym, { name }]) =>
        sym.toLowerCase().includes(term) || name.toLowerCase().includes(term)
    )
    .slice(0, MAX_SUGGESTIONS)
    .map(([symbol, { name }]) => ({
      symbol,
      title: name,
      url: assetUrl(symbol),
    }));
}
// #endregion

// -----------------------------------------------------------------------------
// События
// -----------------------------------------------------------------------------
// #region

/**
 * Обрабатывает ввод в поиске.
 * @return {Promise<void>|undefined}
 */
async function handleInput() {
  const q = input.value.trim();

  // На странице markets фильтруем таблицу и не показываем подсказки
  if (isMarketsPage) {
    // сообщаем основному бандлу строку поиска
    document.dispatchEvent(
      new CustomEvent('markets:search', {
        detail: q.trim().toLowerCase() || null,
      })
    );
    return clearBox(); // выпадашка не нужна
  }

  if (q.length < SEARCH_MIN_LENGTH) return clearBox();

  await loadDirectory();
  const [assets, news, blog] = await Promise.all([
    getAssetMatches(q),
    // TODO: Раскомментировать, когда будут реализованы
    // getNewsMatches(q),
    // getBlogMatches(q),
  ]);
  render(
    [
      { title: t('Assets'), items: assets },
      { title: t('News'), items: news },
      { title: t('Blog'), items: blog },
    ],
    q
  );

  return undefined;
}

/**
 * Сдвигает подсветку в списке подсказок.
 * @param {number} highlightDelta
 */
function move(highlightDelta) {
  if (!box || box.hidden) return;
  const items = [...box.children];
  highlight = (highlight + highlightDelta + items.length) % items.length;
  items.forEach((li, i) => li.classList.toggle('is-active', i === highlight));
}

/**
 * Переходит по выбранной подсказке.
 * @return {boolean}
 */
function chooseHighlighted() {
  if (!box || box.hidden) return false;
  const li = box.children[highlight];
  if (li) {
    window.location.href = li.dataset.url;
    return true;
  }
  return false;
}

if (input) {
  input.addEventListener('input', handleInput);
  input.addEventListener('focus', handleInput);
  input.addEventListener('blur', () => setTimeout(clearBox, 150));

  input.addEventListener('keydown', (e) => {
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      move(1);
    }
    if (e.key === 'ArrowUp') {
      e.preventDefault();
      move(-1);
    }
    if (e.key === 'Enter' && chooseHighlighted()) e.preventDefault();
  });

  input.form?.addEventListener('submit', (e) => {
    if (isMarketsPage) {
      e.preventDefault();
      return false;
    }

    if (chooseHighlighted()) {
      e.preventDefault();
      return false;
    }
    const q = input.value.trim();
    if (q.length >= SEARCH_MIN_LENGTH) {
      window.location.href = `/${lang}/search?q=${encodeURIComponent(q)}`;
      e.preventDefault();
      return false;
    }
    e.preventDefault();
    return false;
  });
}
// #endregion
