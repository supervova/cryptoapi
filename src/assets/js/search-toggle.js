/**
 * Управляет открытием и закрытием поисковой формы в адаптивной шапке веб-приложения.
 */

export default function initSearchToggleHeader() {
  const toggleButton = document.getElementById('navbar-header-toggle');
  const cancelButton = document.getElementById('navbar-header-cancel');
  const header = document.getElementById('header-app');
  const input = document.getElementById('header-search');

  if (!toggleButton || !cancelButton || !header || !input) return;

  toggleButton.addEventListener('click', () => {
    const isOpen = header.classList.contains('is-open');
    header.classList.toggle('is-open');
    if (!isOpen) {
      input.focus();
    } else {
      cancelButton.focus();
    }
  });

  cancelButton.addEventListener('click', () => {
    header.classList.remove('is-open');
    toggleButton.focus();
  });
}
