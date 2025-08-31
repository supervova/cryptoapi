/**
 * Handles events for all widgets inside an iframe.
 */
window.addEventListener('message', (e) => {
  // The origin check is removed to allow theme changes from cross-origin parents.
  // This is a potential security risk if more sensitive actions are added.
  // A whitelist of origins would be a better solution.
  const { data } = e;

  // Theme change event from the parent
  if (data?.type === 'cryptoapi:theme' && data.theme) {
    document.body.dataset.theme = data.theme;
  }
});

/**
 * Sends the widget's height to the parent window.
 */
function postHeight() {
  const { body, documentElement } = document;
  const height = Math.max(
    body.scrollHeight,
    body.offsetHeight,
    documentElement.clientHeight,
    documentElement.scrollHeight,
    documentElement.offsetHeight
  );

  if (window.parent) {
    window.parent.postMessage({ type: 'cryptoapi:height', height }, '*');
  }
}

// Use ResizeObserver to send height updates when content size changes.
if ('ResizeObserver' in window) {
  const observer = new ResizeObserver(() => {
    // Use rAF to avoid "ResizeObserver loop limit exceeded" error in some browsers.
    window.requestAnimationFrame(postHeight);
  });
  observer.observe(document.body);
} else {
  // Fallback for older browsers that don't support ResizeObserver.
  window.addEventListener('resize', postHeight);
}

// Send height on initial load and after a short delay to catch late renders.
window.addEventListener('load', postHeight);
document.addEventListener('DOMContentLoaded', () => {
  setTimeout(postHeight, 250);
});

// Listen for the custom event which signals that a widget has finished rendering.
document.body.addEventListener('widget:rendered', postHeight);
