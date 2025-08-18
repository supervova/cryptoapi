(() => {
  const container = document.getElementById('signals-container');
  const lang = document.documentElement.lang || 'en';
  const endpoint = '/cryptosignals.php';

  // Read 'rows' parameter from URL, default to 8.
  const urlParams = new URLSearchParams(window.location.search);
  const rowsToShow = parseInt(urlParams.get('rows'), 10) || 8;

  if (!container) {
    return;
  }

  /**
   * Renders signals into the container.
   * @param {Array} signals - Array of signal objects.
   */
  const render = (signals) => {
    if (!signals || signals.length === 0) {
      container.innerHTML = '<p>No signals available at the moment.</p>';
      document.body.dispatchEvent(new CustomEvent('widget:rendered'));
      return;
    }

    // Slice the array to the desired number of rows before rendering.
    const limitedSignals = signals.slice(0, rowsToShow);

    const grouped = limitedSignals.reduce((acc, signal) => {
      if (!signal.datetime || typeof signal.datetime !== 'string') {
        console.warn(
          'Skipping signal due to invalid "datetime" field:',
          signal
        );
        return acc;
      }

      const signalDate = new Date(signal.datetime);
      if (Number.isNaN(signalDate.getTime())) {
        console.warn('Skipping signal due to unparseable "datetime":', signal);
        return acc;
      }

      const date = signalDate.toISOString().split('T')[0];
      if (!acc[date]) {
        acc[date] = [];
      }
      acc[date].push(signal);
      return acc;
    }, {});

    let html = '';
    Object.keys(grouped)
      .sort()
      .reverse()
      .forEach((date) => {
        html += `<div class="signalgroup" data-date="${date}">`;

        const today = new Date().toISOString().split('T')[0];
        if (date !== today) {
          html += `<div class="signaldate">${date}</div>`;
        }

        grouped[date].reverse().forEach((r) => {
          const signalDate = new Date(r.datetime);
          const time = signalDate.toLocaleTimeString(lang, {
            hour: '2-digit',
            minute: '2-digit',
            hour12: false,
          });

          const symbolHtml = r.curr
            ? `<span class="signalcurr">${r.curr}</span>`
            : '';
          const type = r.signaltype || 'info';

          html += `
          <span class="signalmsg type${type}">
            <span class="signaldt">${time}</span>
            ${symbolHtml}
            <span class="signalmsgtext">${r.msg}</span>
          </span>`;
        });
        html += '</div>';
      });

    container.innerHTML = html;
    document.body.dispatchEvent(new CustomEvent('widget:rendered'));
  };

  /**
   * Fetches signals from the API.
   */
  const fetchSignals = async () => {
    try {
      const response = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: new URLSearchParams({ signalid: 0, wlang: lang }),
      });

      if (!response.ok) {
        throw new Error(`HTTP Error: ${response.status}`);
      }

      const result = await response.json();
      if (result && result[0] === 'OK' && Array.isArray(result[1])) {
        const allSignals = result[1];

        // Filter signals based on widget requirements
        const filteredSignals = allSignals.filter((signal) => {
          const isBtc = signal.curr === 'BTC';
          const isBuysell =
            signal.signaltype === 'buy' || signal.signaltype === 'sell';
          const isPalert =
            signal.signaltype === 'strongup' ||
            signal.signaltype === 'strongdown';

          // Widget requirements: palertbtc, buysellbtc, buysell
          // For BTC, keep price alerts (strongup/down) and buy/sell signals; for others, only buy/sell
          return isBtc ? isPalert || isBuysell : isBuysell;
        });

        render(filteredSignals);
      } else {
        console.error('API response is not in the expected format:', result);
        render([]);
      }
    } catch (error) {
      console.error('Failed to fetch signals:', error);
      render([]);
    }
  };

  fetchSignals();
})();
