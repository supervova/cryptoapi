/* eslint-disable import/prefer-default-export */
export function initPasswordToggles() {
  /* eslint-disable import/prefer-default-export */
  document
    .querySelectorAll('input[data-role="password"]')
    .forEach((passwordInput) => {
      const wrapper = passwordInput.parentElement;
      const toggleButton = wrapper.querySelector(
        '[data-role="password-toggle"]'
      );

      if (!toggleButton) return; // Проверяем, что кнопка есть

      const icons = toggleButton.querySelectorAll('svg');

      toggleButton.addEventListener('click', () => {
        const input = passwordInput;
        const isPassword = input.type === 'password';
        input.type = isPassword ? 'text' : 'password';

        icons[0].classList.toggle('d-none', isPassword);
        icons[0].classList.toggle('d-block', !isPassword);

        icons[1].classList.toggle('d-none', !isPassword);
        icons[1].classList.toggle('d-block', isPassword);
      });
    });
}
