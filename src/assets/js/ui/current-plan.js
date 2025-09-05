/** Действующий тарифный план – раскрытие только по кнопке */
const initPlan = (root = document) => {
  // Ищем именно блок текущего плана
  const blocks = [...root.querySelectorAll('.e-current-plan')];

  blocks.forEach((plan) => {
    const el = plan;
    const summary = plan.querySelector('summary');
    const btn = plan.querySelector('[data-plan-toggle]');
    if (!summary || !btn) return;

    // Блокируем клик по summary, если не по кнопке
    summary.addEventListener('click', (e) => {
      if (!e.target.closest('[data-plan-toggle]')) e.preventDefault();
    });

    // Тоггл по кнопке
    btn.addEventListener('click', () => {
      el.open = !el.open;
      btn.setAttribute('aria-expanded', String(el.open));
    });

    // Синхронизация при внешнем изменении open (например, через <details open>)
    plan.addEventListener('toggle', () => {
      btn.setAttribute('aria-expanded', String(plan.open));
    });
  });
};

export default initPlan;
