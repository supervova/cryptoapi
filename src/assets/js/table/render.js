// assets/js/table/render.js
import * as DOMElements from '../markets/dom.js';
import * as marketState from '../markets/state.js';
import t from '../markets/translate.js';
import {
  ASSETS_PATH_PREFIX,
  ROW_HEIGHT_ESTIMATE,
  VISIBLE_BUFFER,
} from '../markets/config.js';
import { formatNullable } from './formatting.js';
import { getNestedValue } from '../markets/utils.js';
import { getVisibleColumns, getVisibleColumnsCount } from './columns.js';
import { getPair } from '../utils/currency.js';

const getAssetUrl = (symbol) => `/markets/${symbol.toLowerCase()}`;

const calcChange = (p) =>
  p?.current && p?.dayago ? ((p.current - p.dayago) / p.dayago) * 100 : null;

const spacer = (h, cols) => {
  const tr = document.createElement('tr');
  tr.style.height = `${h}px`;
  const td = document.createElement('td');
  td.colSpan = cols;
  td.style.cssText = 'padding:0;border:0;height:1px;display:block;';
  tr.appendChild(td);
  return tr;
};

const assetCell = (asset, cryptoMeta) => {
  const { symbol, name = symbol, icon: iconPath } = asset;
  const fallbackText = symbol.slice(0, 3).toUpperCase();

  const copyHtml = `
    <div class="e-asset__copy">
      <span class="e-asset__name">${name}</span>
      <span class="e-asset__symbol">${getPair(symbol, cryptoMeta)}</span>
    </div>`;

  const iconHtml = `
    <figure class="e-asset__figure" data-fallback="${fallbackText}">
      <img class="e-asset__icon" src="${iconPath}" alt="" width="32" height="32">
    </figure>
  `;

  return `
    <div class="e-asset">
      ${copyHtml}
      ${iconHtml}
    </div>`;
};

const buildCell = (col, asset, cryptoMeta) => {
  switch (col.key) {
    case 'watchlist':
      return ['table__cell is-action', `<!-- watch ${asset.symbol} -->`];
    case 'asset': {
      return ['table__cell is-text is-2-liner', assetCell(asset, cryptoMeta)];
    }
    case 'risk':
      return [
        'table__cell is-icon',
        col.formatter(getNestedValue(asset, col.apiField)),
      ];
    case 'change_24h': {
      const v = calcChange(asset.price);
      const txt =
        v === null || Number.isNaN(v)
          ? '–'
          : `${v > 0 ? '+' : ''}${v.toFixed(2)}`;
      const getChangeClass = (value) => {
        if (value === null) return '';
        if (value > 0) return ' is-positive';
        if (value < 0) return ' is-negative';
        return '';
      };
      const cls = getChangeClass(v);
      return [`table__cell is-num${cls}`, txt];
    }
    default: {
      const val = getNestedValue(asset, col.apiField);
      const txt = col.formatter ? col.formatter(val) : formatNullable(val);
      const typeCls = `table__cell is-${col.type}`;
      return [typeCls, txt];
    }
  }
};

function generateCellsHtml(asset, cryptoMeta) {
  const assetUrl = getAssetUrl(asset.symbol);
  return getVisibleColumns()
    .map((c) => {
      const [cls, html] = buildCell(c, asset, cryptoMeta);
      return `<td class="${cls}"><a class="table__link" href="${assetUrl}">${html}</a></td>`;
    })
    .join('');
}

function updateCellNode(td, asset, col, cryptoMeta) {
  const [, newHtml] = buildCell(col, asset, cryptoMeta);
  const assetUrl = getAssetUrl(asset.symbol);
  const link = td.querySelector('.table__link');

  if (!link) {
    td.innerHTML = `<a class="table__link" href="${assetUrl}">${newHtml}</a>`;
    return;
  }

  if (link.getAttribute('href') !== assetUrl) {
    link.setAttribute('href', assetUrl);
  }

  const isChanged = link.innerHTML !== newHtml;

  if (isChanged) {
    link.innerHTML = newHtml;

    // highlight updated price and 24 h change cells
    if (col.key === 'price' || col.key === 'change_24h') {
      td.classList.add('is-updated');
      setTimeout(() => {
        if (td?.classList && td.parentNode) {
          td.classList.remove('is-updated');
        }
      }, 1600);
    }
  }
}

export function patchTableBody() {
  if (!DOMElements.tableBody || !DOMElements.scrollContainer) return;

  const items = marketState.state.sortedFilteredAssets ?? [];
  const { cryptoMeta } = marketState.state;
  const total = items.length;
  const colCnt = getVisibleColumnsCount();
  const cols = getVisibleColumns();

  if (marketState.state.isLoading && total === 0) {
    DOMElements.tableBody.innerHTML = `
      <tr id="loading-row"><td class="table__cell" colspan="${colCnt}">
        ${t('loading', 'Loading…')}
      </td></tr>`;
    return;
  }
  if (total === 0) {
    DOMElements.tableBody.innerHTML = `
      <tr><td class="table__cell is-empty-state" colspan="${colCnt}">
        ${t('noDataAvailable', 'No data available')}
      </td></tr>`;
    return;
  }

  const top = DOMElements.scrollContainer.scrollTop;
  const height = DOMElements.scrollContainer.clientHeight;
  const start = Math.max(
    0,
    Math.floor(top / ROW_HEIGHT_ESTIMATE) - VISIBLE_BUFFER
  );
  const end = Math.min(
    total,
    Math.ceil((top + height) / ROW_HEIGHT_ESTIMATE) + VISIBLE_BUFFER
  );

  const frag = document.createDocumentFragment();
  if (start > 0) frag.appendChild(spacer(start * ROW_HEIGHT_ESTIMATE, colCnt));

  for (let i = start; i < end; i++) {
    const a = items[i];
    let tr = document.getElementById(`asset-row-${a.symbol}`);
    if (!tr) {
      tr = document.createElement('tr');
      tr.id = `asset-row-${a.symbol}`;
      tr.dataset.assetSymbol = a.symbol;
      tr.classList.add('is-clickable');
      tr.innerHTML = generateCellsHtml(a, cryptoMeta);
    } else {
      Array.from(tr.children).forEach((td, j) =>
        updateCellNode(td, a, cols[j], cryptoMeta)
      );
    }
    frag.appendChild(tr);
  }

  if (end < total)
    frag.appendChild(spacer((total - end) * ROW_HEIGHT_ESTIMATE, colCnt));

  DOMElements.tableBody.replaceChildren(frag);
  if (DOMElements.tableHead) {
    DOMElements.tableHead.classList.add('is-updated');
    setTimeout(() => {
      if (DOMElements.tableHead?.classList) {
        DOMElements.tableHead.classList.remove('is-updated');
      }
    }, 1600);
  }
}

export function generateTableHeadHtml(t, lang) {
  if (!DOMElements.tableHead) return;

  const currentVisibleColumns = getVisibleColumns();
  let headHtml = '<tr>';

  const tooltipKeys = ['watchlist', 'rating', 'risk', 'trindx', 'rsi'];

  currentVisibleColumns.forEach((col) => {
    const thClasses = `table__cell is-${col.type}${col.key === 'watchlist' ? ' is-action' : ''}`;
    let thContent = col.label;
    let ariaLabelAttr =
      col.type === 'action' || col.type === 'icon'
        ? `aria-label="${col.label}"`
        : '';

    let tooltipHtml = '';
    let tooltipBaseKey = null;
    if (tooltipKeys.includes(col.key)) {
      tooltipBaseKey = col.key;
    } else if (col.key.startsWith('rsi')) {
      tooltipBaseKey = 'rsi';
    }

    if (tooltipBaseKey) {
      const tooltipId = `tt-js-${col.key}`;
      const tooltipContentHtml = t(`tooltip_${tooltipBaseKey}`);

      if (tooltipContentHtml) {
        const assetsBasePrefix = window.APP_CONFIG.assetsBasePrefix || '';
        const iconPath = `${assetsBasePrefix}/assets/img/icons/sprite.svg#icon-sm-help`;

        tooltipHtml = `
          <span class="has-rich-tooltip is-bottom-right">
            <span class="tooltip__trigger" aria-describedby="${tooltipId}">
              <svg class="e-icon is-sm" aria-hidden="true" focusable="false"><use xlink:href="${iconPath}"></use></svg>
            </span>
            <span class="tooltip" id="${tooltipId}" role="tooltip">
              ${tooltipContentHtml}
            </span>
          </span>`;
      }
    }

    if (col.sortable) {
      const isActive = marketState.sortState.field === col.key;
      const isDesc = isActive && marketState.sortState.direction === 'desc';
      let ariaSort = 'none';
      if (isActive) {
        ariaSort =
          marketState.sortState.direction === 'asc'
            ? 'ascending'
            : 'descending';
      }
      const upIconSvg = `<svg class="e-icon" aria-hidden="true" focusable="false"><use xlink:href="${ASSETS_PATH_PREFIX}/assets/img/icons/sprite.svg#icon-up"></use></svg>`;
      thContent = `
        <button
          class="e-btn is-sort ${isActive ? 'is-active' : ''} ${isDesc ? 'is-desc' : ''}"
          type="button"
          data-sort-field="${col.key}"
          aria-label="${t('sortByThisColumn', 'Sort by this column')}"
          aria-sort="${ariaSort}"
        >
          ${col.label}
          ${upIconSvg}
        </button>`;
      ariaLabelAttr = '';
    }

    // Теперь, оборачиваем тултип и thContent в div.table__th-actions
    const finalThContent = `
      <div class="table__th-actions">
        ${thContent} <!-- Original content first -->
        ${tooltipHtml} <!-- Tooltip last -->
      </div>`;

    headHtml += `<th class="${thClasses}" scope="col" ${ariaLabelAttr} data-col-key="${col.key}">${finalThContent}</th>`;
  });
  headHtml += '</tr>';
  DOMElements.tableHead.innerHTML = headHtml;

  const newSortButtons = Array.from(
    DOMElements.tableHead.querySelectorAll('button[data-sort-field]')
  );
  DOMElements.setSortButtons(newSortButtons);
  newSortButtons.forEach((button) => {
    button.addEventListener('click', (event) => {
      document.dispatchEvent(
        new CustomEvent('table:sort-click', { detail: event })
      );
    });
  });
}

export { calcChange };
