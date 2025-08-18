/**
 * Handles events for all widgets inside an iframe.
 */
window.addEventListener('message', (e) => {
  // Security: check the origin of the message
  if (e.origin !== window.location.origin) {
    return;
  }

  const { data } = e;

  // Height adjustment event from the parent
  if (data?.type === 'cryptoapi:height') {
    const f = window.frameElement;
    if (f) {
      f.style.height = `${Math.max(120, +data.height || 0)}px`;
    }
  }

  // Theme change event from the parent
  if (data?.type === 'cryptoapi:theme') {
    document.body.dataset.theme = data.theme;
  }
});

/**
 * Sends the widget's height to the parent window.
 */
function postHeight() {
  const { body } = document;
  const height = Math.max(
    body.scrollHeight,
    body.offsetHeight,
    document.documentElement.clientHeight,
    document.documentElement.scrollHeight,
    document.documentElement.offsetHeight
  );

  if (window.parent) {
    window.parent.postMessage({ type: 'cryptoapi:height', height }, '*');
  }
}

// Send height on load and on resize
window.addEventListener('load', postHeight);
window.addEventListener('resize', postHeight);
document.body.addEventListener('widget:rendered', postHeight);