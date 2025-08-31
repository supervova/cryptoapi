document.addEventListener('DOMContentLoaded', () => {
  const gaugeWidget = document.getElementById('fgi-gauge');
  const index = gaugeWidget ? parseInt(gaugeWidget.dataset.fgi, 10) || 0 : 0;

  const rootStyle = getComputedStyle(document.body);
  const gaugeOnColor = rootStyle.getPropertyValue('--gauge-stroke-on').trim();
  const colors = {
    extremeFear: rootStyle
      .getPropertyValue('--gauge-stroke-extreme-fear')
      .trim(),
    fear: rootStyle.getPropertyValue('--gauge-stroke-fear').trim(),
    neutral: rootStyle.getPropertyValue('--gauge-stroke-neutral').trim(),
    greed: rootStyle.getPropertyValue('--gauge-stroke-greed').trim(),
    extremeGreed: rootStyle
      .getPropertyValue('--gauge-stroke-extreme-greed')
      .trim(),
  };

  // Обновляем цвет делений основной шкалы с накопительным эффектом
  for (let i = 5; i <= 95; i += 5) {
    const segment = document.getElementById(`fgi-${i}`);
    if (segment) {
      segment.style.stroke = index >= i ? gaugeOnColor : '';
    }
  }

  // Обновляем цвет вспомогательной шкалы с цепным эффектом
  if (index >= 0) {
    document
      .getElementById('fgi-extreme-fear')
      ?.style.setProperty('stroke', colors.extremeFear);
  }
  if (index >= 26) {
    document
      .getElementById('fgi-fear')
      ?.style.setProperty('stroke', colors.fear);
  }
  if (index >= 41) {
    document
      .getElementById('fgi-neutral')
      ?.style.setProperty('stroke', colors.neutral);
  }
  if (index >= 61) {
    document
      .getElementById('fgi-greed')
      ?.style.setProperty('stroke', colors.greed);
  }
  if (index >= 76) {
    document
      .getElementById('fgi-extreme-greed')
      ?.style.setProperty('stroke', colors.extremeGreed);
  }

  // Поворот стрелки
  const pointer = document.querySelector('.e-card__gauge-pointer');
  if (pointer) {
    const angle = index * 1.8; // 1 пункт = 1.8°
    pointer.style.transform = `rotate(${angle}deg)`;
  }

  document.body.dispatchEvent(new CustomEvent('widget:rendered'));
});
