// src/assets/js/toast.js
var toastCounter = 0;
function hideToast(toastId) {
  const toast = document.getElementById(toastId);
  if (!toast) return;
  toast.style.opacity = "0";
  toast.style.translate = "0 16px";
  setTimeout(() => {
    toast.hidePopover();
    toast.remove();
  }, 300);
}
function showToast(message, type = "info", duration = 5e3) {
  toastCounter += 1;
  const toastId = `toast-${toastCounter}`;
  const toastContainer = document.getElementById("toast-container");
  const toast = document.createElement("div");
  toast.id = toastId;
  toast.className = `e-toast__base is-${type}`;
  toast.setAttribute("popover", "manual");
  toast.setAttribute("role", "alert");
  toast.setAttribute("aria-live", "polite");
  toast.innerHTML = `
    <div class="e-toast__content">${message}</div>
    <button class="e-btn is-close" aria-label="Close">
      <svg class="e-icon is-candles is-sm" width="20" height="20" viewBox="0 0 20 20" fill="none" aria-hidden="true" focusable="false">
        <path d="M15 5L5 15M5 5L15 15" stroke="var(--icon-stroke)" stroke-width="var(--icon-stroke-width)" stroke-linecap="round" stroke-linejoin="round"/>
      </svg>
    </button>
  `;
  toastContainer.appendChild(toast);
  toast.showPopover();
  const closeButton = toast.querySelector(".e-btn.is-close");
  closeButton.addEventListener("click", () => {
    hideToast(toastId);
  });
  if (duration > 0) {
    setTimeout(() => {
      hideToast(toastId);
    }, duration);
  }
  return toastId;
}
export {
  hideToast,
  showToast
};
