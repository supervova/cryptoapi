document.addEventListener('DOMContentLoaded', () => {
  const animatedElements = document.querySelectorAll('[data-animation]');

  const observerOptions = {
    // Используем триггеры на 0% (вне экрана), 25% (частично виден), 100% (полностью виден)
    threshold: [0, 0.25, 1],
  };

  const observer = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (entry.intersectionRatio > 0.25) {
        entry.target.classList.add('is-animated');
      } else if (entry.intersectionRatio === 0) {
        entry.target.classList.remove('is-animated');
      }
    });
  }, observerOptions);

  animatedElements.forEach((element) => {
    observer.observe(element);
  });
});
