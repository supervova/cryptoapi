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

    const annual = parseNumber(priceEl.dataset.annual);
    const monthlyPrice = Math.round(annual * 1.25);
    priceEl.textContent = formatInt(monthly ? monthlyPrice : annual);
    linkEl.href = setIntervalParam(linkEl.href, monthly ? 'monthly' : 'annual');
    const annualSumEl = plan.querySelector('[data-role="annual-price"]');
    if (annualSumEl) {
      const annualTotal = Math.round((monthly ? monthlyPrice : annual) * 12);
      annualSumEl.textContent = formatInt(annualTotal);
    }
  });
};

monthlyRadio?.addEventListener('change', updateBilling);
annualRadio?.addEventListener('change', updateBilling);
