(() => {
  /**
   * ---------------------------------------------------------------------------
   * TOGGLE SEARCH FORM ON MOBILES
   * ---------------------------------------------------------------------------
   */

  const search = document.getElementById('header-search-form');
  let backdrop;

  const closeSearch = () => {
    search.classList.remove('is-open');

    if (backdrop != null) {
      backdrop.remove();
    }
  };

  const openSearch = (event) => {
    event.preventDefault();

    /* When the search form is already open, and the user clicks the search trigger,
    we don't want to rerun the entire event registration. We'll add an early
    return for that. */
    if (search.classList.contains('is-open')) {
      return;
    }

    // Create backdrop
    backdrop = document.createElement('div');
    backdrop.className = 'backdrop';
    document.body.appendChild(backdrop);

    // Show search and backdrop
    search.classList.add('is-open');
    backdrop.classList.add('is-on');
  };

  // Event Listener
  if (search) {
    window.addEventListener('click', (event) => {
      if (event.target.closest('data-role="toggle-search"')) {
        openSearch(event);
      } else {
        closeSearch();
      }

      if (event.target.matches('data-role="cancel-search"')) {
        closeSearch();
      }
    });
  }
})();
