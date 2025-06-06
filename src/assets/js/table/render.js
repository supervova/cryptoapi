// assets/js/table/render.js
import t from '../markets/translate.js';
import * as marketState from '../markets/state.js';
import * as DOMElements from '../markets/dom.js';
import {
  ASSETS_PATH_PREFIX,
  IS_DEVELOPMENT,
  ROW_HEIGHT_ESTIMATE,
  VISIBLE_BUFFER,
  // CURRENT_LANG, // Не используется здесь напрямую, но может быть нужен для URL, если язык в пути
} from '../markets/config.js';
import { getVisibleColumns, getVisibleColumnsCount } from './columns.js';
import { formatPrice, formatNullable } from './formatting.js';
import { getNestedValue } from '../markets/utils.js';
import { calculateChange24hValue, handleSortClick } from './sort-filter.js';

export function generateTableHeadHtml() {
  if (!DOMElements.tableHead) return;

  const currentVisibleColumns = getVisibleColumns();
  let headHtml = '<tr>';

  currentVisibleColumns.forEach((col) => {
    // Класс is-action для watchlist остается, для chart - убран, т.к. колонки chart нет
    const thClasses = `table__cell is-${col.type}${col.key === 'watchlist' ? ' is-action' : ''}`;
    let thContent = col.label;
    let ariaLabelAttr =
      col.type === 'action' || col.type === 'icon'
        ? `aria-label="${col.label}"`
        : '';

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
    headHtml += `<th class="${thClasses}" scope="col" ${ariaLabelAttr}>${thContent}</th>`;
  });
  headHtml += '</tr>';
  DOMElements.tableHead.innerHTML = headHtml;

  const newSortButtons = Array.from(
    DOMElements.tableHead.querySelectorAll('button[data-sort-field]')
  );
  DOMElements.setSortButtons(newSortButtons);
  newSortButtons.forEach((button) => {
    button.addEventListener('click', handleSortClick);
  });
}

function generateCellsHtml(asset) {
  let cellsHtml = '';
  const currentVisibleColumns = getVisibleColumns();

  currentVisibleColumns.forEach((col) => {
    let cellContent = '';
    let cellClasses = `table__cell is-${col.type}`;

    switch (col.key) {
      case 'watchlist':
        cellContent = `<!-- Список наблюдения для ${asset.symbol} -->`;
        cellClasses += ' is-action';
        break;
      case 'asset': {
        const iconPath = asset.icon;
        const fallbackIcon = `<span class="e-asset__icon-fallback" aria-hidden="true">${asset.symbol.substring(0, 3).toUpperCase()}</span>`;
        const imgTag = iconPath
          ? `<img class="e-asset__icon" src="${iconPath}" alt="" loading="lazy" width="32" height="32" onerror="this.style.display='none'; this.nextElementSibling.style.display='inline-flex';">`
          : '';
        // Формируем URL. CURRENT_LANG можно взять из marketState.state.currentLang, если язык в URL
        // Если CURRENT_LANG не нужен в URL страницы актива, то просто /markets/${asset.symbol}
        // Предположим, что язык не нужен в URL для простоты, или он будет добавлен на уровне сервера/роутинга PHP
        const assetPageUrl = `/markets/${asset.symbol.toLowerCase()}`; // или .toUpperCase() в зависимости от требований

        cellContent = `
          <a class="e-asset" href="${assetPageUrl}">
            <div class="e-asset__copy">
              <span class="e-asset__name">${asset.name}</span>
              <span class="e-asset__symbol">${asset.symbol}</span>
            </div>
            ${imgTag}
            ${fallbackIcon}
          </a>`;
        cellClasses += ' is-2-liner';
        break;
      }
      case 'risk':
        cellContent = col.formatter(getNestedValue(asset, col.apiField));
        cellClasses += ' is-icon';
        break;
      case 'change_24h': {
        const changeValue = calculateChange24hValue(asset.price);
        cellContent =
          changeValue !== null && !Number.isNaN(changeValue)
            ? `${changeValue > 0 ? '+' : ''}${changeValue.toFixed(2)}`
            : '–';
        if (changeValue !== null) {
          if (changeValue > 0) cellClasses += ' is-positive';
          if (changeValue < 0) cellClasses += ' is-negative';
        }
        break;
      }
      // case 'chart' больше не существует в ALL_COLUMNS_CONFIG, поэтому этот case не нужен
      default: {
        const value = getNestedValue(asset, col.apiField);
        cellContent = col.formatter
          ? col.formatter(value)
          : formatNullable(value);
        break;
      }
    }
    cellsHtml += `<td class="${cellClasses}">${cellContent}</td>`;
  });
  return cellsHtml;
}

function updateCellNode(cellNode, asset, columnConfig) {
  const newValue = getNestedValue(asset, columnConfig.apiField);
  let newCellContent;
  const currentCell = cellNode;

  switch (columnConfig.key) {
    case 'watchlist':
      newCellContent = `<!-- Список наблюдения для ${asset.symbol} -->`;
      break;
    case 'asset': {
      const iconPath = asset.icon;
      const fallbackIcon = `<span class="e-asset__icon-fallback" aria-hidden="true">${asset.symbol.substring(0, 3).toUpperCase()}</span>`;
      const imgTag = iconPath
        ? `<img class="e-asset__icon" src="${iconPath}" alt="${asset.name}" loading="lazy" width="32" height="32" onerror="this.style.display='none'; this.nextElementSibling.style.display='inline-flex';">`
        : '';
      const assetPageUrl = `/markets/${asset.symbol.toLowerCase()}`;
      newCellContent = `<a class="e-asset" href="${assetPageUrl}"><div class="e-asset__copy"><span class="e-asset__name">${asset.name}</span><span class="e-asset__symbol">${asset.symbol}</span></div>${imgTag}${fallbackIcon}</a>`;
      break;
    }
    case 'risk':
      newCellContent = columnConfig.formatter(newValue);
      break;
    case 'change_24h': {
      const change = calculateChange24hValue(asset.price);
      newCellContent =
        change !== null && !Number.isNaN(change)
          ? `${change > 0 ? '+' : ''}${change.toFixed(2)}`
          : '–';
      currentCell.classList.toggle(
        'is-positive',
        change !== null && change > 0
      );
      currentCell.classList.toggle(
        'is-negative',
        change !== null && change < 0
      );
      break;
    }
    // case 'chart' больше не существует
    default:
      newCellContent = columnConfig.formatter
        ? columnConfig.formatter(newValue)
        : formatNullable(newValue);
      break;
  }

  if (currentCell.innerHTML !== newCellContent) {
    currentCell.innerHTML = newCellContent;
    if (columnConfig.key === 'price' || columnConfig.key === 'change_24h') {
      currentCell.classList.add('is-updated');
      setTimeout(() => {
        if (currentCell?.classList && currentCell.parentNode) {
          currentCell.classList.remove('is-updated');
        }
      }, 1600);
    }
  }
  if (columnConfig.key === 'change_24h') {
    const changeVal = calculateChange24hValue(asset.price);
    currentCell.classList.toggle(
      'is-positive',
      changeVal !== null && changeVal > 0
    );
    currentCell.classList.toggle(
      'is-negative',
      changeVal !== null && changeVal < 0
    );
  }
}

// patchTableBody и displayErrorState остаются без изменений относительно предыдущей версии,
// так как они уже используют marketState.state.sortedFilteredAssets и т.д.
export function patchTableBody() {
  if (!DOMElements.tableBody || !DOMElements.scrollContainer) return;

  const totalItems = Array.isArray(marketState.state.sortedFilteredAssets)
    ? marketState.state.sortedFilteredAssets.length
    : 0;

  const currentVisibleColumnsCount = getVisibleColumnsCount();
  const currentVisibleColumns = getVisibleColumns();

  if (marketState.state.isLoading && totalItems === 0) {
    if (!document.getElementById('loading-row') && DOMElements.loadingRow) {
      DOMElements.tableBody.innerHTML = '';
      const clonedLoadingRow = DOMElements.loadingRow.cloneNode(true);
      clonedLoadingRow.id = 'loading-row';
      clonedLoadingRow.style.display = '';
      const loadingCell = clonedLoadingRow.querySelector('td');
      if (loadingCell) loadingCell.colSpan = currentVisibleColumnsCount;
      DOMElements.tableBody.appendChild(clonedLoadingRow);
    }
    return;
  }

  const currentLoadingRowDOM = document.getElementById('loading-row');
  if (currentLoadingRowDOM) currentLoadingRowDOM.remove();

  if (totalItems === 0) {
    DOMElements.tableBody.innerHTML = `
      <tr><td class="table__cell is-empty-state" colspan="${currentVisibleColumnsCount}">
        <p>${t('noDataAvailable', 'No data available')}</p>
      </td></tr>`;
    return;
  }

  const { scrollTop } = DOMElements.scrollContainer;
  const containerHeight = DOMElements.scrollContainer.clientHeight;

  if (containerHeight === 0 && totalItems > 0 && IS_DEVELOPMENT) {
    console.warn(
      '[Patch Table] scrollContainer.clientHeight равен 0. Отрисовка таблицы может быть некорректной.'
    );
  }

  const startIndex = Math.max(
    0,
    Math.floor(scrollTop / ROW_HEIGHT_ESTIMATE) - VISIBLE_BUFFER
  );
  const endIndex = Math.min(
    totalItems,
    Math.ceil((scrollTop + containerHeight) / ROW_HEIGHT_ESTIMATE) +
      VISIBLE_BUFFER
  );

  const topSpacerHeight = startIndex * ROW_HEIGHT_ESTIMATE;
  const bottomSpacerHeight = (totalItems - endIndex) * ROW_HEIGHT_ESTIMATE;
  const fragment = document.createDocumentFragment();

  const existingRowsMap = new Map();
  Array.from(DOMElements.tableBody.children).forEach((row) => {
    if (
      row.dataset &&
      row.dataset.assetSymbol &&
      !row.style.height.endsWith('px')
    ) {
      existingRowsMap.set(row.dataset.assetSymbol, row);
    }
  });

  if (topSpacerHeight > 0) {
    const topSpacer = document.createElement('tr');
    topSpacer.style.height = `${topSpacerHeight}px`;
    const topSpacerCell = document.createElement('td');
    topSpacerCell.colSpan = currentVisibleColumnsCount;
    topSpacerCell.style.cssText =
      'padding:0; border:0; height:1px; display:block;';
    topSpacer.appendChild(topSpacerCell);
    fragment.appendChild(topSpacer);
  }

  for (let i = startIndex; i < endIndex; i++) {
    const asset = marketState.state.sortedFilteredAssets[i];

    if (asset) {
      let rowNode = existingRowsMap.get(asset.symbol);

      if (rowNode) {
        Array.from(rowNode.children).forEach((cellNode, cellIndex) => {
          if (cellIndex < currentVisibleColumns.length) {
            updateCellNode(cellNode, asset, currentVisibleColumns[cellIndex]);
          }
        });
        existingRowsMap.delete(asset.symbol);
      } else {
        rowNode = document.createElement('tr');
        rowNode.id = `asset-row-${asset.symbol}`;
        rowNode.dataset.assetId = asset.id;
        rowNode.dataset.assetSymbol = asset.symbol;
        rowNode.tabIndex = 0;
        rowNode.setAttribute(
          'aria-label',
          `${asset.name} - ${formatPrice(asset.price?.current)} USD`
        );
        rowNode.innerHTML = generateCellsHtml(asset);
      }
      fragment.appendChild(rowNode);
    } else if (IS_DEVELOPMENT) {
      console.warn(`Asset at index ${i} is undefined in sortedFilteredAssets.`);
    }
  }

  if (bottomSpacerHeight > 0) {
    const bottomSpacer = document.createElement('tr');
    bottomSpacer.style.height = `${bottomSpacerHeight}px`;
    const bottomSpacerCell = document.createElement('td');
    bottomSpacerCell.colSpan = currentVisibleColumnsCount;
    bottomSpacerCell.style.cssText =
      'padding:0; border:0; height:1px; display:block;';
    bottomSpacer.appendChild(bottomSpacerCell);
    fragment.appendChild(bottomSpacer);
  }

  DOMElements.tableBody.innerHTML = '';
  DOMElements.tableBody.appendChild(fragment);

  if (DOMElements.tableHead) {
    DOMElements.tableHead.classList.add('is-updated');
    setTimeout(() => {
      if (DOMElements.tableHead?.classList) {
        DOMElements.tableHead.classList.remove('is-updated');
      }
    }, 1600);
  }
}

export function displayErrorState(message) {
  if (!DOMElements.tableBody || !DOMElements.table) return;
  const currentVisibleColumnsCount = getVisibleColumnsCount();

  DOMElements.tableBody.innerHTML = `
    <tr><td class="table__cell is-empty-state is-error-state" colspan="${currentVisibleColumnsCount}">
      <p>${message}</p>
      <button class="e-btn is-text" onclick="location.reload()">${t('retry', 'Retry')}</button>
    </td></tr>`;
  DOMElements.table.setAttribute('aria-busy', 'false');
  const loadingRowElem = document.getElementById('loading-row');
  if (loadingRowElem) loadingRowElem.style.display = 'none';

  marketState.setIsLoading(false);
}
