(() => {
  const ENDPOINT = 'https://cryptoapi.ai/json/marketdata';
  const BODY = new URLSearchParams({ jsonfather: 'true' });

  /* Словарь из Twig’а */
  const dictTag = document.getElementById('i18n-dict');
  const I18N =
    dictTag && dictTag.textContent
      ? JSON.parse(dictTag.textContent.trim())
      : {}; // если словаря нет – пустой объект
  const t = (key) => I18N[key] ?? key;

  /* Подсветка после обновления */
  let updatedTimer; // хранит ID последнего timeout’а
  const markUpdated = () => {
    const box = document.querySelector('.e-header__stats');
    if (!box) return;
    box.classList.add('is-updated');
    clearTimeout(updatedTimer);
    updatedTimer = setTimeout(() => box.classList.remove('is-updated'), 5_000);
  };

  /**
   * Форматируем числа под 2 знака и с разделителями тысяч.
   */
  const fmt = (n) =>
    Number(n).toLocaleString('en-US', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    });

  function setClass(el, positive, negative, neutral = 'text-2ry') {
    el.classList.remove('is-success', 'is-error', 'text-2ry');
    if (positive > 0) el.classList.add('is-success');
    else if (positive < 0) el.classList.add('is-error');
    else el.classList.add(neutral);
  }

  async function updateStats() {
    /* Если «шапки» на странице нет – сразу выходим */
    if (!document.querySelector('.e-header__stats')) return;
    try {
      const r = await fetch(ENDPOINT, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
          Accept: 'application/json',
        },
        body: BODY,
      });
      const j = await r.json();
      if (!j || j[0] !== 'OK') return;

      const d = j[1]; // полезная часть payload-а

      /* BTC */
      const btcPrice = document.getElementById('stat-btc-price');
      const btcDiff = document.getElementById('stat-btc-diff');
      if (btcPrice && btcDiff) {
        btcPrice.textContent = fmt(d.BTC.price);
        btcDiff.textContent = `${d.BTC.diff.toFixed(2)}%`;
        setClass(btcDiff, d.BTC.diff, d.BTC.diff);
      }

      /* Market Cap */
      const mDiff = document.getElementById('stat-market-diff');
      const mInd = document.getElementById('stat-market-indicator');
      if (mDiff && mInd) {
        mDiff.textContent = `${d.all.diff.toFixed(2)}%`;
        setClass(mDiff, d.all.diff, d.all.diff);

        mInd.classList.remove('is-success', 'is-neutral', 'is-error');
        if (d.level === 'low') mInd.classList.add('is-error');
        else if (d.level === 'middle') mInd.classList.add('is-neutral');
        else mInd.classList.add('is-success');
        mInd.setAttribute('aria-label', d.level);
      }

      /* Fear & Greed */
      const fgiLabel = document.getElementById('stat-fgi-label');
      const fgiValue = document.getElementById('stat-fgi-value');
      if (fgiLabel && fgiValue) {
        const v = Number(d.fear_and_greed);
        let lbl = t('NEUTRAL');
        let cls = '';
        if (v < 26) {
          lbl = t('EXT_FEAR');
          cls = 'is-error';
        } else if (v < 48) {
          lbl = t('FEAR');
          cls = 'is-error';
        } else if (v < 53) {
          lbl = t('NEUTRAL');
          cls = '';
        } else if (v < 75) {
          lbl = t('GREED');
          cls = 'is-success';
        } else {
          lbl = t('EXT_GREED');
          cls = 'is-success';
        }

        fgiLabel.textContent = `(${lbl})`;
        fgiValue.textContent = `${v} / 100`;
        fgiValue.className = `e-header__stat-value ${cls}`;
      }

      /* Добавить/сбросить класс is-updated */
      markUpdated();
    } catch (e) {
      console.error('marketdata update failed', e);
    }
  }

  /* Первый вызов сразу после загрузки, затем каждые 30 сек */
  updateStats();
  setInterval(updateStats, 30_000);
})();
