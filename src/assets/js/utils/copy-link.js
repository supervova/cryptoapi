export default function copyLink(buttonSelector, successMessageSelector) {
  const copyButton = document.querySelector(buttonSelector);
  const successMessage = document.querySelector(successMessageSelector);

  if (!copyButton || !successMessage) return;

  copyButton.addEventListener('click', () => {
    const url = copyButton.getAttribute('data-href');

    const tempInput = document.createElement('textarea');
    tempInput.value = url;
    document.body.appendChild(tempInput);

    tempInput.select();
    tempInput.setSelectionRange(0, 99999);

    try {
      document.execCommand('copy');
      successMessage.classList.add('is-visible');
      setTimeout(() => {
        successMessage.classList.remove('is-visible');
      }, 2000);
    } catch (err) {
      // eslint-disable-next-line no-console
      console.error('Failed to copy text: ', err);
    }

    document.body.removeChild(tempInput);
  });
}
