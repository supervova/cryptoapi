// src/assets/js/asset-chart.js
document.addEventListener("DOMContentLoaded", () => {
  const chartCanvas = document.getElementById("markets-chart");
  const chartLoader = document.getElementById("chart-loader");
  const chartError = document.getElementById("chart-error");
  let assetChart = null;
  const currentConfig = {
    assetId: "bitcoin",
    period: "1d",
    timeframe: "15m"
  };
  function formatTimeLabel(isoString, timeframe) {
    const date = new Date(isoString);
    switch (timeframe) {
      case "1min":
      case "5m":
      case "15m":
      case "30m":
      case "1h":
        return `${date.getHours().toString().padStart(2, "0")}:${date.getMinutes().toString().padStart(2, "0")}`;
      case "1d":
        return `${date.getDate().toString().padStart(2, "0")}.${(date.getMonth() + 1).toString().padStart(2, "0")}`;
      case "1w":
      case "1mo":
        return `${date.getDate().toString().padStart(2, "0")}.${(date.getMonth() + 1).toString().padStart(2, "0")}.${date.getFullYear()}`;
      default:
        return `${date.getDate().toString().padStart(2, "0")}.${(date.getMonth() + 1).toString().padStart(2, "0")}.${date.getFullYear()}`;
    }
  }
  async function loadFixtureData() {
    const response = await fetch(
      "/projects/cryptoapi.ai/assets/data/fixtures/asset-data.json"
    );
    if (!response.ok) {
      throw new Error(`\u041E\u0448\u0438\u0431\u043A\u0430 HTTP: ${response.status}`);
    }
    return response.json();
  }
  function getAssetPeriodData(data, config) {
    const asset = data.assets.find((a) => a.id === config.assetId);
    if (!asset) return null;
    const periodData = asset.periods.find((p) => p.period === config.period);
    return periodData || null;
  }
  async function fetchAPIData(config) {
    const fixtureData = await loadFixtureData();
    return getAssetPeriodData(fixtureData, config);
  }
  function drawChart(periodData) {
    if (assetChart) {
      assetChart.destroy();
    }
    const ctx = chartCanvas.getContext("2d");
    const { timeframe } = periodData;
    assetChart = new Chart(ctx, {
      type: "line",
      data: {
        labels: periodData.data.map(
          (item) => formatTimeLabel(item.time, timeframe)
        ),
        datasets: [
          {
            backgroundColor: "hsl(254 88% 78% / 0.06)",
            borderColor: "hsl(254 88% 78%)",
            borderWidth: 2,
            data: periodData.data.map((item) => item.price),
            fill: true,
            label: periodData.title,
            tension: 0,
            // Настройки ключевых точек
            pointRadius: 0,
            pointHoverRadius: 6,
            pointHoverBackgroundColor: "hsl(254 88% 46%)",
            pointHoverBorderColor: "hsl(254 88% 78%)",
            // Цвет границы при наведении
            pointHoverBorderWidth: 2
          }
        ]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: {
            display: false
          },
          tooltip: {
            mode: "index",
            intersect: false,
            backgroundColor: "hsl(254 11% 18%)",
            titleColor: "rgb(255 255 255 / 0.6)",
            titleFont: { weight: "normal" },
            bodyColor: "rgb(255 255 255 / 0.87)",
            bodyFont: { weight: "bold" },
            borderWidth: 0,
            padding: 16,
            displayColors: false,
            callbacks: {
              title: (tooltipItems) => {
                return `${tooltipItems[0].label}`;
              },
              label: (context) => {
                return `${context.raw} $`;
              }
            }
          }
        },
        scales: {
          x: {
            grid: {
              color: "rgb(255 255 255 / 0.08)",
              drawTicks: false
            },
            ticks: {
              color: "rgb(255 255 255 / 0.6)",
              maxRotation: 0,
              autoSkip: true,
              maxTicksLimit: 8
            }
          },
          y: {
            position: "right",
            grid: {
              color: "rgb(255 255 255 / 0.08)"
            },
            ticks: {
              color: "rgb(255 255 255 / 0.6)",
              callback: (value) => {
                return `${value} `;
              }
            },
            beginAtZero: false
          }
        },
        interaction: {
          mode: "nearest",
          axis: "x",
          intersect: false
        },
        elements: {
          line: {
            borderJoinStyle: "round"
          }
        }
      }
    });
  }
  async function renderChart(config = currentConfig) {
    try {
      chartLoader.style.display = "flex";
      chartError.style.display = "none";
      const periodData = await fetchAPIData(config);
      if (!periodData || !periodData.data || periodData.data.length === 0) {
        throw new Error("\u041D\u0435\u0442 \u0434\u0430\u043D\u043D\u044B\u0445 \u0434\u043B\u044F \u043E\u0442\u043E\u0431\u0440\u0430\u0436\u0435\u043D\u0438\u044F");
      }
      drawChart(periodData);
      chartLoader.style.display = "none";
    } catch (error) {
      chartError.style.display = "flex";
      chartLoader.style.display = "none";
    }
  }
  renderChart();
  document.querySelectorAll('[data-role="chart-period"]').forEach((button) => {
    button.addEventListener("click", () => {
      const period = button.getAttribute("data-period");
      if (period && period !== currentConfig.period) {
        currentConfig.period = period;
        renderChart();
      }
    });
  });
  document.querySelectorAll('[data-role="chart-timeframe"]').forEach((button) => {
    button.addEventListener("click", () => {
      const timeframe = button.getAttribute("data-timeframe");
      if (timeframe && timeframe !== currentConfig.timeframe) {
        currentConfig.timeframe = timeframe;
        renderChart();
      }
    });
  });
  document.querySelectorAll('[data-role="chart-asset"]').forEach((button) => {
    button.addEventListener("click", () => {
      const assetId = button.getAttribute("data-asset-id");
      if (assetId && assetId !== currentConfig.assetId) {
        currentConfig.assetId = assetId;
        renderChart();
      }
    });
  });
  setInterval(() => renderChart(), 5 * 60 * 1e3);
});
