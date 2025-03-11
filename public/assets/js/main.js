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
  popovers.forEach((popover) => {
    if (popover.tagName.toLowerCase() !== "details") {
      const summary = popover.querySelector('[data-role="popover-summary"]');
      const body = popover.querySelector(".e-popover__body");
      if (summary && body) {
        if (!body.id) {
          body.id = `popover-content-${Math.random().toString(36).substring(2, 10)}`;
        }
        summary.setAttribute("aria-haspopup", "true");
        summary.setAttribute("aria-expanded", "false");
        summary.setAttribute("aria-controls", body.id);
        summary.setAttribute("role", "button");
        if (!summary.hasAttribute("tabindex")) {
          summary.setAttribute("tabindex", "0");
        }
        body.setAttribute("role", "region");
        body.setAttribute("aria-hidden", "true");
      }
    }
  });
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
            body.setAttribute("aria-hidden", "true");
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
              body.setAttribute("aria-hidden", "true");
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
      if (!popover.contains(event.target) || popoverBody && !popoverBody.contains(event.target) && !popover.querySelector('[data-role="popover-summary"], summary').contains(event.target)) {
        if (popover.tagName.toLowerCase() === "details") {
          popover.removeAttribute("open");
        } else {
          popover.classList.remove("is-open");
          const summary = popover.querySelector(
            '[data-role="popover-summary"]'
          );
          if (summary && popoverBody) {
            popoverBody.setAttribute("aria-hidden", "true");
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
}

// src/assets/js/scroller-row.js
function initHorizontalScroll(selector, options = {}) {
  const settings = {
    wheelScroll: true,
    showIndicators: false,
    scrollAmount: 300,
    ...options
  };
  let containers = [];
  if (typeof selector === "string") {
    containers = Array.from(document.querySelectorAll(selector));
  } else if (selector instanceof Element) {
    containers = [selector];
  } else if (selector instanceof NodeList || Array.isArray(selector)) {
    containers = Array.from(selector);
  }
  if (containers.length === 0) return [];
  const controllers = [];
  containers.forEach((scrollContainer, index) => {
    if (!scrollContainer.id) {
      scrollContainer.id = `horizontal-scroll-${index}`;
    }
    if (settings.wheelScroll) {
      scrollContainer.addEventListener("wheel", (event) => {
        if (scrollContainer.scrollWidth > scrollContainer.clientWidth) {
          event.preventDefault();
          scrollContainer.scrollLeft += event.deltaY;
        }
      });
    }
    let checkScrollIndicators;
    if (settings.showIndicators) {
      const parentContainer = scrollContainer.parentElement;
      parentContainer.style.position = "relative";
      checkScrollIndicators = () => {
        const canScroll = scrollContainer.scrollWidth > scrollContainer.clientWidth;
        const indicatorsSelector = `.scroll-indicators[data-for="${scrollContainer.id}"]`;
        const existingIndicators = parentContainer.querySelector(indicatorsSelector);
        if (existingIndicators) {
          parentContainer.removeChild(existingIndicators);
        }
        if (canScroll) {
          const indicators = document.createElement("div");
          indicators.className = "scroll-indicators";
          indicators.setAttribute("data-for", scrollContainer.id);
          const leftIndicator = document.createElement("button");
          leftIndicator.className = "scroll-indicator scroll-left";
          leftIndicator.setAttribute("aria-label", "\u041F\u0440\u043E\u043A\u0440\u0443\u0442\u0438\u0442\u044C \u0432\u043B\u0435\u0432\u043E");
          leftIndicator.innerHTML = "&larr;";
          leftIndicator.addEventListener("click", () => {
            scrollContainer.scrollBy({
              left: -settings.scrollAmount,
              behavior: "smooth"
            });
          });
          const rightIndicator = document.createElement("button");
          rightIndicator.className = "scroll-indicator scroll-right";
          rightIndicator.setAttribute("aria-label", "\u041F\u0440\u043E\u043A\u0440\u0443\u0442\u0438\u0442\u044C \u0432\u043F\u0440\u0430\u0432\u043E");
          rightIndicator.innerHTML = "&rarr;";
          rightIndicator.addEventListener("click", () => {
            scrollContainer.scrollBy({
              left: settings.scrollAmount,
              behavior: "smooth"
            });
          });
          indicators.appendChild(leftIndicator);
          indicators.appendChild(rightIndicator);
          parentContainer.appendChild(indicators);
          const updateIndicators = () => {
            const leftBtn = parentContainer.querySelector(
              `${indicatorsSelector} .scroll-left`
            );
            const rightBtn = parentContainer.querySelector(
              `${indicatorsSelector} .scroll-right`
            );
            if (leftBtn && rightBtn) {
              const isAtLeftEdge = scrollContainer.scrollLeft <= 10;
              leftBtn.style.opacity = isAtLeftEdge ? "0.5" : "1";
              leftBtn.disabled = isAtLeftEdge;
              const isAtRightEdge = scrollContainer.scrollLeft + scrollContainer.clientWidth >= scrollContainer.scrollWidth - 10;
              rightBtn.style.opacity = isAtRightEdge ? "0.5" : "1";
              rightBtn.disabled = isAtRightEdge;
            }
          };
          scrollContainer.addEventListener("scroll", updateIndicators);
          updateIndicators();
        }
      };
      checkScrollIndicators();
      if (window.ResizeObserver) {
        const resizeObserver = new ResizeObserver(() => {
          checkScrollIndicators();
        });
        resizeObserver.observe(scrollContainer);
      } else {
        window.addEventListener("resize", checkScrollIndicators);
      }
    }
    const controller = {
      element: scrollContainer,
      scrollLeft: (amount) => {
        scrollContainer.scrollBy({ left: -amount, behavior: "smooth" });
      },
      scrollRight: (amount) => {
        scrollContainer.scrollBy({ left: amount, behavior: "smooth" });
      },
      scrollToIndex: (itemIndex) => {
        const { children } = scrollContainer;
        if (itemIndex >= 0 && itemIndex < children.length) {
          children[itemIndex].scrollIntoView({
            behavior: "smooth",
            block: "nearest"
          });
        }
      },
      refreshIndicators: () => {
        if (settings.showIndicators && checkScrollIndicators) {
          checkScrollIndicators();
        }
      }
    };
    controllers.push(controller);
  });
  return controllers;
}

// src/assets/js/main.js
document.addEventListener("DOMContentLoaded", () => {
  initPopovers();
  modal_default();
  initHorizontalScroll(".e-section__scroller", {
    wheelScroll: true,
    // Включаем прокрутку колесиком мыши
    showIndicators: false,
    // Показываем индикаторы прокрутки
    scrollAmount: 300
    // Величина прокрутки в пикселях
  });
});
