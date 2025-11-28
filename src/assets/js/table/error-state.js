// assets/js/table/error-state.js
import * as marketState from '../markets/state.js';
import * as DOMElements from '../markets/dom.js';
import t from '../markets/translate.js';
import { getHeaderColumnsCount } from '../markets/dom.js';

export default function displayErrorState(message) {
  if (!DOMElements.tableBody || !DOMElements.table) return;
  const headerColumnsCount = getHeaderColumnsCount();

  DOMElements.tableBody.innerHTML = `
    <tr><td class="table__cell is-empty-state is-error-state" colspan="${headerColumnsCount}">
      <div>
        <p>${message}</p>
        <button class="e-btn is-text" onclick="location.reload()">${t('retry', 'Retry')}</button>
      </div>
    </td></tr>`;
  DOMElements.table.setAttribute('aria-busy', 'false');
  const loadingRowElem = document.getElementById('loading-row');
  if (loadingRowElem) loadingRowElem.style.display = 'none';

  marketState.setIsLoading(false);
}
