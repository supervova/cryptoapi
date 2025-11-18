const animationDuration = 400; // ms
let visibleModal = null;

// Add `is-pinned` class to a modal header
const toggleTitleStyle = (el, root) => {
  if (window.matchMedia('(max-width: 767px)').matches) {
    const observer = new IntersectionObserver(
      ([entry]) =>
        el.classList.toggle('is-pinned', entry.intersectionRatio < 1),
      {
        threshold: [1],
        root: document.querySelector(root),
        rootMargin: '0px 50px',
      }
    );
    observer.observe(el);
  }
};

// Open an external page in the modal window
const getExternalContent = (event) => {
  const modalExternal = document.getElementById('modal-external');
  const container = modalExternal.querySelector('.e-modal__content');
  const href = event.currentTarget.getAttribute('href');

  event.preventDefault();

  modalExternal.addEventListener('close', () => {
    container.innerHTML = '';
  });

  return fetch(href)
    .then((response) => response.text())
    .then((html) => {
      const parser = new DOMParser();
      const contentSource = parser.parseFromString(html, 'text/html');
      const contentEl = contentSource.querySelector('.e-content');
      const content = contentEl ? contentEl.innerHTML : '';
      container.insertAdjacentHTML('beforeend', content);
      return content;
    })
    .catch((error) => {
      console.error('Failed to load external modal content:', error);
      throw error;
    });
};

// Close modal
const closeModal = (modal) => {
  visibleModal = null;

  // Add the closing attribute to start the animation
  modal.setAttribute('closing', '');

  // Waiting for the animation to complete before the actual closure
  modal.addEventListener(
    'transitionend',
    () => {
      modal.removeAttribute('closing');
      modal.close();
    },
    { once: true }
  );
};

// Open modal
const openModal = (modal) => {
  setTimeout(() => {
    visibleModal = modal;
  }, animationDuration);
  modal.showModal();

  const header = modal.querySelector('header');
  if (header) {
    toggleTitleStyle(header, '.e-modal[open]');
  }
};

// Toggle modal
const modalToggle = (event) => {
  const trigger = event.currentTarget;
  const isLink = trigger.hasAttribute('href');
  const win = trigger.getAttribute('data-target');
  const modal = document.getElementById(win);

  event.preventDefault();

  if (modal.open) {
    closeModal(modal);
  } else {
    openModal(modal);
  }

  if (isLink) {
    getExternalContent(event);
  }
};

// Initialize modals
const initModals = () => {
  // Close with a click outside
  document.addEventListener('click', (event) => {
    if (visibleModal === null) return;
    const modalContent = visibleModal.firstElementChild; // Get the first child element of the modal
    const isClickInside = modalContent.contains(event.target);
    if (!isClickInside) {
      closeModal(visibleModal);
    }
  });

  // Close with 'Cancel' and 'X' buttons
  document.querySelectorAll('[data-role="close-modal"]').forEach((btn) => {
    btn.addEventListener('click', (event) => {
      const modal = event.currentTarget.closest('.e-modal');
      closeModal(modal);
    });
  });

  // Set listeners on modal openers
  document.querySelectorAll('[data-role="open-modal"]').forEach((elem) => {
    elem.addEventListener('click', (event) => {
      modalToggle(event);
    });
  });
};

export default initModals;
