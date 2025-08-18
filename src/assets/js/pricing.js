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
const lang = (document.documentElement.lang || '').toLowerCase();
const parseNumber = (v) => Number(String(v).replace(/[^\d.-]/g, '')) || 0;
const formatInt = (v) => {
  const n = Math.round(parseNumber(v));
  return lang.startsWith('en')
    ? n.toLocaleString('en-US', { maximumFractionDigits: 0 })
    : String(n).replace(/\B(?=(\d{3})+(?!\d))/g, '\u00A0');
};

// Сохраняем годовую цену и выводим сумму за 12 мес.
plans.forEach((plan) => {
  const priceEl = plan.querySelector('.e-plan__price strong');
  if (!priceEl) return;
  priceEl.dataset.annual = priceEl.textContent.trim();
  const annualSumEl = plan.querySelector('[data-role="annual-price"]');
  if (annualSumEl) {
    const annualPerMonth = parseNumber(priceEl.dataset.annual);
    const annualTotal = Math.round(annualPerMonth * 12);
    annualSumEl.textContent = formatInt(annualTotal);
  }
});

const updateIntervalInPath = (href, interval) => {
  try {
    const url = new URL(href, window.location.origin);
    const pathParts = url.pathname.split('/');
    pathParts[pathParts.length - 1] = interval; // Replace last segment
    url.pathname = pathParts.join('/');
    return url.pathname; // Return path only, no search params
  } catch {
    return href;
  }
};

const updateBilling = () => {
  const monthly = monthlyRadio?.checked;
  const newInterval = monthly ? 'monthly' : 'annual';

  plans.forEach((plan, idx) => {
    const priceEl = plan.querySelector('.e-plan__price strong');
    const linkEl = plan.querySelector('a.e-btn');
    if (!priceEl || !linkEl) return;

    // Обновляем ссылку в любом случае
    linkEl.href = updateIntervalInPath(linkEl.href, newInterval);

    // Для бесплатного тарифа (индекс 0) меняем только ссылку
    if (idx === 0) {
      return;
    }

    // Для платных тарифов обновляем цену
    const annual = parseNumber(priceEl.dataset.annual);
    const monthlyPrice = Math.round(annual * 1.25);
    priceEl.textContent = formatInt(monthly ? monthlyPrice : annual);

    const annualSumEl = plan.querySelector('[data-role="annual-price"]');
    if (annualSumEl) {
      const annualTotal = Math.round((monthly ? monthlyPrice : annual) * 12);
      annualSumEl.textContent = formatInt(annualTotal);
    }
  });

  // Обновляем URL страницы
  const currentPath = window.location.pathname;
  // Регулярное выражение для замены /annual или /monthly в конце пути
  const newPath = currentPath.replace(/\/(annual|monthly)$/, `/${newInterval}`);

  if (currentPath !== newPath) {
    window.history.pushState({ interval: newInterval }, '', newPath);
  }
};

monthlyRadio?.addEventListener('change', updateBilling);
annualRadio?.addEventListener('change', updateBilling);
