/**
 * Find a drawer element by its ID
 * @param {string} targetId - The ID of the drawer to find
 * @returns {HTMLDialogElement|null}
 */
const findDrawer = (targetId) => document.getElementById(targetId);

/**
 * Close all open drawers except the specified one
 * @param {HTMLDialogElement} exceptDrawer - Drawer to exclude from closing
 */
const closeOtherDrawers = (exceptDrawer) => {
  document.querySelectorAll('dialog[open]').forEach((dialog) => {
    if (dialog !== exceptDrawer) {
      dialog.close();
    }
  });
};

/**
 * Toggle drawer state
 * @param {HTMLDialogElement} drawer - Drawer element to toggle
 */
const toggleDrawer = (drawer) => {
  if (!drawer.open) {
    closeOtherDrawers(drawer);
    drawer.show();
  } else {
    drawer.close();
  }
};

// Initialize drawer functionality
const initDrawer = () => {
  // Toggle drawer
  document.addEventListener('click', (event) => {
    const toggleButton = event.target.closest('[data-role="drawer-toggle"]');
    if (!toggleButton) return;

    const targetId = toggleButton.dataset.target;
    const drawer = findDrawer(targetId);

    if (drawer?.tagName === 'DIALOG') {
      toggleDrawer(drawer);
    }
  });

  // Close drawer
  document.addEventListener('click', (event) => {
    const closeButton = event.target.closest('[data-role="close-drawer"]');
    if (!closeButton) return;

    const drawer = closeButton.closest('.e-drawer');
    if (drawer) {
      drawer.close();
    }

    // Backdrop click
    const dialog = event.target.closest('dialog[open]');
    if (dialog && event.target === dialog) {
      dialog.close();
    }
  });

  // ESC key close
  document.addEventListener('keydown', (event) => {
    if (event.key === 'Escape') {
      const openDrawer = document.querySelector('dialog[open]');
      if (openDrawer) {
        openDrawer.close();
      }
    }
  });
};

export default initDrawer;
