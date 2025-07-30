// 1. Кнопки прокрутки планов
const MIN = 1024;
const MAX = 1359;
const scroller = document.querySelector('.e-section__scroller');
const startBtn = document.querySelector(
  '[data-role="plans-scroller"][data-target="start"]'
);
const endBtn = document.querySelector(
  '[data-role="plans-scroller"][data-target="end"]'
);

if (scroller && startBtn && endBtn) {
  const updateScrollBtns = () => {
    const vw = window.innerWidth;
    const active = vw >= MIN && vw <= MAX;
    if (!active) {
      startBtn.disabled = true;
      endBtn.disabled = true;
      return;
    }

    startBtn.disabled = scroller.scrollLeft <= 0;
    endBtn.disabled =
      scroller.scrollLeft + scroller.clientWidth >= scroller.scrollWidth - 1;
  };

  const scrollToEdge = (edge) =>
    scroller.scrollTo({
      left: edge === 'start' ? 0 : scroller.scrollWidth - scroller.clientWidth,
      behavior: 'smooth',
    });

  startBtn.addEventListener('click', () => scrollToEdge('start'));
  endBtn.addEventListener('click', () => scrollToEdge('end'));
  scroller.addEventListener('scroll', updateScrollBtns);
  window.addEventListener('resize', updateScrollBtns);
  updateScrollBtns();
}

// 2. Переключатель оплаты (annual / monthly)
const monthlyRadio = document.getElementById('billing-monthly');
const annualRadio = document.getElementById('billing-annual');
const plans = [...document.querySelectorAll('.e-plan')];

// Сохраняем годовую цену
plans.forEach((plan) => {
  const priceEl = plan.querySelector('.e-plan__price strong');
  if (priceEl) priceEl.dataset.annual = priceEl.textContent.trim();
});

const format = (v) => Number(v).toLocaleString('en-US');
const setIntervalParam = (href, interval) => {
  try {
    const url = new URL(href, window.location.origin);
    if (interval) {
      url.searchParams.set('interval', interval);
    } else {
      url.searchParams.delete('interval');
    }
    return url.pathname + url.search;
  } catch {
    return href;
  }
};

const updateBilling = () => {
  const monthly = monthlyRadio?.checked;
  plans.forEach((plan, idx) => {
    const priceEl = plan.querySelector('.e-plan__price strong');
    const linkEl = plan.querySelector('a.e-btn');
    if (!priceEl || !linkEl) return;

    /* Free plan (index 0) — только ссылка */
    if (idx === 0) {
      linkEl.href = setIntervalParam(
        linkEl.href,
        monthly ? 'monthly' : 'annual'
      );
      return;
    }

    const annual = Number(priceEl.dataset.annual);
    const monthlyPrice = Math.round(annual * 1.25);
    priceEl.textContent = format(monthly ? monthlyPrice : annual);
    linkEl.href = setIntervalParam(linkEl.href, monthly ? 'monthly' : 'annual');
  });
};

monthlyRadio?.addEventListener('change', updateBilling);
annualRadio?.addEventListener('change', updateBilling);
