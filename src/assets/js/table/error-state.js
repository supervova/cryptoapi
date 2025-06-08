// assets/js/table/render.js
import * as marketState from '../markets/state.js';
import * as DOMElements from '../markets/dom.js';
import t from '../markets/translate.js';
import { getVisibleColumnsCount } from './columns.js';

export default function displayErrorState(message) {
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
