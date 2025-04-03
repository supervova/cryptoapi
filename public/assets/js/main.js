// src/assets/js/modal.js
var animationDuration = 400;
var visibleModal = null;
var toggleTitleStyle = (el, root) => {
  if (window.matchMedia("(max-width: 767px)").matches) {
    const observer = new IntersectionObserver(
      ([entry]) => el.classList.toggle("is-pinned", entry.intersectionRatio < 1),
      {
        threshold: [1],
        root: document.querySelector(root),
        rootMargin: "0px 50px"
      }
    );
    observer.observe(el);
  }
};
var getExternalContent = (event) => {
  const modalExternal = document.getElementById("modal-external");
  const container = modalExternal.querySelector(".e-modal__content");
  const href = event.currentTarget.getAttribute("href");
  event.preventDefault();
  fetch(href).then((response) => response.text()).then((html) => {
    const parser = new DOMParser();
    const contentSource = parser.parseFromString(html, "text/html");
    const content = contentSource.querySelector(".e-content").innerHTML;
    container.insertAdjacentHTML("beforeend", content);
  });
  modalExternal.addEventListener("close", () => {
    container.innerHTML = "";
  });
};
var closeModal = (modal) => {
  visibleModal = null;
  modal.setAttribute("closing", "");
  modal.addEventListener(
    "transitionend",
    () => {
      modal.removeAttribute("closing");
      modal.close();
    },
    { once: true }
  );
};
var openModal = (modal) => {
  setTimeout(() => {
    visibleModal = modal;
  }, animationDuration);
  modal.showModal();
  const header = modal.querySelector("header");
  if (header) {
    toggleTitleStyle(header, ".e-modal[open]");
  }
};
var modalToggle = (event) => {
  const trigger = event.currentTarget;
  const isLink = trigger.hasAttribute("href");
  const win = trigger.getAttribute("data-target");
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
var initModals = () => {
  document.addEventListener("click", (event) => {
    if (visibleModal === null) return;
    const modalContent = visibleModal.firstElementChild;
    const isClickInside = modalContent.contains(event.target);
    if (!isClickInside) {
      closeModal(visibleModal);
    }
  });
  document.querySelectorAll('[data-role="close-modal"]').forEach((btn) => {
    btn.addEventListener("click", (event) => {
      const modal = event.currentTarget.closest(".e-modal");
      closeModal(modal);
    });
  });
  document.querySelectorAll('[data-role="open-modal"]').forEach((elem) => {
    elem.addEventListener("click", (event) => {
      modalToggle(event);
    });
  });
};
var modal_default = initModals;

// src/assets/js/popover.js
function initPopovers() {
  const popovers = Array.from(
    document.querySelectorAll('[data-role="popover"]')
  );
  function isMainNavPopover(popover) {
    return popover.closest(".e-navbar__menu") !== null;
  }
  function isMobileScreen() {
    return window.innerWidth < 768;
  }
  function updateAriaAttributes() {
    popovers.forEach((popover) => {
      if (popover.tagName.toLowerCase() !== "details") {
        const summary = popover.querySelector('[data-role="popover-summary"]');
        const body = popover.querySelector(".e-popover__body");
        if (summary && body) {
          if (!body.id) {
            body.id = `popover-content-${Math.random().toString(36).substring(2, 10)}`;
          }
          summary.setAttribute("aria-haspopup", "true");
          summary.setAttribute(
            "aria-expanded",
            popover.classList.contains("is-open").toString()
          );
          summary.setAttribute("aria-controls", body.id);
          summary.setAttribute("role", "button");
          if (!summary.hasAttribute("tabindex")) {
            summary.setAttribute("tabindex", "0");
          }
          if (isMainNavPopover(popover) && !isMobileScreen()) {
            body.setAttribute("aria-hidden", "false");
          } else {
            body.setAttribute(
              "aria-hidden",
              !popover.classList.contains("is-open").toString()
            );
          }
        }
      }
    });
  }
  updateAriaAttributes();
  function closeAllPopovers(exclude = null) {
    popovers.forEach((el) => {
      if (el !== exclude) {
        if (el.tagName.toLowerCase() === "details") {
          el.removeAttribute("open");
        } else {
          el.classList.remove("is-open");
          const summary = el.querySelector('[data-role="popover-summary"]');
          const body = el.querySelector(".e-popover__body");
          if (summary && body) {
            if (isMainNavPopover(el) && !isMobileScreen()) {
              body.setAttribute("aria-hidden", "false");
            } else {
              body.setAttribute("aria-hidden", "true");
            }
            summary.setAttribute("aria-expanded", "false");
          }
        }
      }
    });
  }
  popovers.forEach((popover) => {
    const summary = popover.querySelector(
      '[data-role="popover-summary"], summary'
    );
    if (summary) {
      summary.addEventListener("click", (event) => {
        if (popover.tagName.toLowerCase() !== "details") {
          event.preventDefault();
        }
        closeAllPopovers(popover);
        if (popover.tagName.toLowerCase() !== "details") {
          const isOpen = popover.classList.contains("is-open");
          if (isOpen) {
            popover.classList.remove("is-open");
            const body = popover.querySelector(".e-popover__body");
            if (body) {
              if (isMainNavPopover(popover) && !isMobileScreen()) {
                body.setAttribute("aria-hidden", "false");
              } else {
                body.setAttribute("aria-hidden", "true");
              }
              summary.setAttribute("aria-expanded", "false");
            }
          } else {
            popover.classList.add("is-open");
            const body = popover.querySelector(".e-popover__body");
            if (body) {
              body.setAttribute("aria-hidden", "false");
              summary.setAttribute("aria-expanded", "true");
            }
          }
        }
        event.stopPropagation();
      });
      if (popover.tagName.toLowerCase() !== "details") {
        summary.addEventListener("keydown", (event) => {
          if (event.key === "Enter" || event.key === " ") {
            event.preventDefault();
            summary.click();
          }
        });
      }
    }
  });
  document.addEventListener("click", (event) => {
    popovers.forEach((popover) => {
      const popoverBody = popover.querySelector(".e-popover__body");
      const summary = popover.querySelector(
        '[data-role="popover-summary"], summary'
      );
      if (!popover.contains(event.target) || popoverBody && !popoverBody.contains(event.target) && !summary.contains(event.target)) {
        if (popover.tagName.toLowerCase() === "details") {
          popover.removeAttribute("open");
        } else {
          popover.classList.remove("is-open");
          if (summary && popoverBody) {
            if (isMainNavPopover(popover) && !isMobileScreen()) {
              popoverBody.setAttribute("aria-hidden", "false");
            } else {
              popoverBody.setAttribute("aria-hidden", "true");
            }
            summary.setAttribute("aria-expanded", "false");
          }
        }
      }
    });
  });
  window.addEventListener("keydown", (event) => {
    if (event.key === "Esc" || event.key === "Escape") {
      closeAllPopovers();
    }
  });
  window.addEventListener("resize", updateAriaAttributes);
}

// src/assets/js/drag-scroll.js
function initDragToScroll() {
  const isMouseDevice = window.matchMedia(
    "(any-hover: hover) and (pointer: fine)"
  ).matches;
  if (!isMouseDevice) return;
  const scrollers = document.querySelectorAll('[data-role="draggable-scroll"]');
  scrollers.forEach((element) => {
    const scroller = element;
    const state = {
      isDown: false,
      startX: 0,
      scrollLeft: 0
    };
    const onMouseDown = (e) => {
      state.isDown = true;
      scroller.classList.add("is-active");
      state.startX = e.pageX - scroller.offsetLeft;
      state.scrollLeft = scroller.scrollLeft;
    };
    const onMouseUp = () => {
      state.isDown = false;
      scroller.classList.remove("is-active");
    };
    const onMouseLeave = () => {
      state.isDown = false;
      scroller.classList.remove("is-active");
    };
    const onMouseMove = (e) => {
      if (!state.isDown) return;
      const currentX = e.pageX - scroller.offsetLeft;
      const walk = (currentX - state.startX) * 1.5;
      const isReverseScroller = scroller.closest(".has-scroller-row-reverse") !== null;
      if (isReverseScroller) {
        const newScrollLeft = state.scrollLeft + walk;
        scroller.scrollLeft = newScrollLeft;
      } else {
        const newScrollLeft = state.scrollLeft - walk;
        scroller.scrollLeft = newScrollLeft;
      }
    };
    scroller.addEventListener("mousedown", onMouseDown);
    scroller.addEventListener("mouseleave", onMouseLeave);
    scroller.addEventListener("mouseup", onMouseUp);
    scroller.addEventListener("mousemove", onMouseMove);
  });
}
function handleResize() {
  const scrollers = document.querySelectorAll('[data-role="draggable-scroll"]');
  scrollers.forEach((scroller) => {
    scroller.removeEventListener("mousedown", scroller.onMouseDown);
    scroller.removeEventListener("mouseleave", scroller.onMouseLeave);
    scroller.removeEventListener("mouseup", scroller.onMouseUp);
    scroller.removeEventListener("mousemove", scroller.onMouseMove);
    scroller.removeEventListener("touchstart", scroller.onTouchStart);
    scroller.removeEventListener("touchend", scroller.onTouchEnd);
    scroller.removeEventListener("touchcancel", scroller.onTouchCancel);
    scroller.removeEventListener("touchmove", scroller.onTouchMove);
    scroller.classList.remove("is-active");
  });
  initDragToScroll();
}
document.addEventListener("DOMContentLoaded", initDragToScroll);
window.addEventListener("resize", handleResize);
var drag_scroll_default = initDragToScroll;

// src/assets/js/form.js
function initPasswordToggles() {
  document.querySelectorAll('input[data-role="password"]').forEach((passwordInput) => {
    const wrapper = passwordInput.parentElement;
    const toggleButton = wrapper.querySelector(
      '[data-role="password-toggle"]'
    );
    if (!toggleButton) return;
    const icons = toggleButton.querySelectorAll("svg");
    toggleButton.addEventListener("click", () => {
      const input = passwordInput;
      const isPassword = input.type === "password";
      input.type = isPassword ? "text" : "password";
      icons[0].classList.toggle("d-none", isPassword);
      icons[0].classList.toggle("d-block", !isPassword);
      icons[1].classList.toggle("d-none", !isPassword);
      icons[1].classList.toggle("d-block", isPassword);
    });
  });
}

// src/assets/js/main.js
document.addEventListener("DOMContentLoaded", () => {
  initPopovers();
  modal_default();
  drag_scroll_default();
  initPasswordToggles();
});
