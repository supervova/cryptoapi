# Cайт CryptoAPI.ai

## Структура проекта

```txt
dist/
docs/
public/
  manifest.json
src/
  assets/
    css/
    fonts/
    img/
    scss/
      abstracts/
      form/
      pages/
      _avatar.scss
      # etc
      main.scss

  templates/
    base/
      base.twig
      body-suffix.twig
    components/
      header.twig
      # etc
    index.twig

gulpfile.js
package.json
```

## План разметки первой страницы

```pug
header.e-header
  nav.e-navbar
  form(role="search")
main.e-main

  header.e-hero
    .e-container

  section.e-section.e-section--features
    .e-container
        .scroller(aria-labelledby=title-features)
          .e-section__card
          //- etc
      .e-section__hgroup
        h2#title-features

  section.e-section.e-section--markets
    .e-container
     .e-section__hgroup
     .e-section__keypoints
     .e-section__grid
      .e-section__chart-header
      .e-section__list-header
      .e-section__chart
      .e-section__list

  section.e-section.e-section--plans
    .e-container
      .e-section__hgroup
        .e-section__title
        .e-section__desc
        .e-section__controls
      .e-section__base
        .e-plan
          .e-plan__header
          .e-plan__features
        .e-plan.e-plan--highlighted
        .e-plan
  section.e-section.e-section--agent-price
    .e-container
      .e-section__image
      .e-section__body
  section.e-section.e-section--testimonials
    .e-container
      .scroller(aria-labelledby=title-testimonials)
        .e-section__card
        //- etc
     .e-section__hgroup
        h2#title-testimonials
  section.e-section.e-section--faq
    .e-container
      h2
      details.accordion
        summary
      //- etc
  aside.e-cta
    h2.e-cta__title
    .e-cta__desc
    a.e-cta__link
footer.e-footer
  .e-footer__copyright
    ul.e-footer__links
      li
        a(href='#') Контакты
      //- еtс

  details.e-popover.e-footer__languages
    summary Русский
    ul.e-popover__body
      li
        a(href='#') English
      //- еtс
```

```twig
{% block content %}
  <main class="e-main">
    <section class="e-hero">
      <div class="e-container">
        <h1>Торгуй ИИ. Все получится.</h1>
        <p>Интеллектуальная торговая платформа с применением искусственного интеллекта</p>
        <div class="e-hero__cta">
          <a class="e-btn is-primary" href="#">Начать торговать</a>
          <a class="e-btn is-2ry" href="#">Демо-доступ</a>
        </div>
      </div>
    </section>

    {# FEATURES #}
    <section class="e-section is-features">
      <div class="e-container">
        <div class="e-scroller" aria-labelledby="title-features">
          <div class="e-card">
            <h3>Функция 1</h3>
            <p>Описание функции.</p>
          </div>
          <div class="e-card">
            <h3>Функция 2</h3>
            <p>Описание функции.</p>
          </div>
          <div class="e-card">
            <h3>Функция 3</h3>
            <p>Описание функции.</p>
          </div>
        </div>
        <div class="e-section__hgroup">
          <h2 id="title-features">Торговый агент. ИИ-интеграция API</h2>
        </div>
      </div>
    </section>

    <section class="e-section is-markets" id="markets">
      <div class="e-container">
        <div class="e-section__hgroup">
          <h2>Рынок криптовалют прямо сейчас</h2>
        </div>
        <div class="e-markets__grid">
          <div class="e-markets__chart">{# Placeholder для графика криптовалют #}</div>
          <div class="e-markets__stats">
            <div class="e-market-card">
              <span class="e-market-card__label">BTC-USD</span>
              <span class="e-market-card__value">96 702.86</span>
            </div>
            {# Дополнительные статистические карточки #}
          </div>
        </div>
      </div>
    </section>

    <section class="e-section is-plans" id="pricing">
      <div class="e-container">
        <div class="e-section__hgroup">
          <h2>Тарифы и цены</h2>
        </div>
        <div class="e-plans__grid">
          <div class="e-plan">
            <h3>Трайдер</h3>
            <p class="e-plan__price">29 $</p>
            <ul class="e-plan__features">
              <li>Базовый анализ рынка</li>
              <li>Ограниченное количество сценариев</li>
            </ul>
          </div>
          <div class="e-plan is-highlighted">
            <h3>Премиум</h3>
            <p class="e-plan__price">199 $</p>
            <ul class="e-plan__features">
              <li>Расширенный анализ рынка</li>
              <li>Неограниченные сценарии</li>
            </ul>
          </div>
          {# Дополнительный план #}
        </div>
      </div>
    </section>

    <section class="e-section is-agent-price">
      <div class="e-container">
        <div class="e-section__image">
          <img src="img/agent-price.jpg" alt="Агентская цена">
        </div>
        <div class="e-section__body">
          <h2>Агентская цена</h2>
          <p>Описание агентской цены.</p>
        </div>
      </div>
    </section>

    {# TESTIMONIALS #}
    <section class="e-section is-testimonials">
      <div class="e-container">
        <div class="scroller" aria-labelledby="title-testimonials">
          <div class="e-section__card">
            <blockquote>
              <p>Отзыв клиента.</p>
              <cite>Клиент 1</cite>
            </blockquote>
          </div>
          <div class="e-section__card">
            <blockquote>
              <p>Отзыв клиента.</p>
              <cite>Клиент 2</cite>
            </blockquote>
          </div>
          <div class="e-section__card">
            <blockquote>
              <p>Отзыв клиента.</p>
              <cite>Клиент 3</cite>
            </blockquote>
          </div>
        </div>
        <div class="e-section__hgroup">
          <h2 id="title-testimonials">Отзывы</h2>
        </div>
      </div>
    </section>

    {# FAQ #}
    <section class="e-section is-faq" id="faq">
      <div class="e-container">
        <h2>Часто задаваемые вопросы</h2>
        <details class="e-accordion">
          <summary>Как начать пользоваться?</summary>
          <p>Регистрация занимает 2 минуты...</p>
          {# Дополнительные аккордеоны #}
        </details>
      </div>
    </section>
  </main>
{% endblock %}

{% block footer %}
  <footer class="e-footer">
    <div class="e-container">
      <div class="e-footer__copyright">
        <p>© 2025 CryptoAPI.ai. Все права защищены.</p>
      </div>

      <details class="e-popover e-footer__languages">
        <summary>Русский</summary>
        <ul class="e-popover__body">
          <li><a href="#">English</a></li>
          <li><a href="#">Español</a></li>
        </ul>
      </details>
    </div>
  </footer>
{% endblock %}
```
