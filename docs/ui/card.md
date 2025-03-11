# Карточка

## Использование микроразметки

```pug
figure.card(itemscope itemtype='https://schema.org/Product')
  a(class='card__link' href='/example.html' itemprop='url' )
    img.card__image(src='' alt='' itemprop='image' )
    figcaption (itemprop='name') Игра
      span(itemprop='offers' itemscope itemtype='https://schema.org/Offer')
        span(itemprop='price') 4399 р.
```

## Списки `cards`

Списки карточек могут размечаться, как списки `ul` или `ol`, а также, как `div(role="group")`, если сами карточки размечаются, как `article`.

```pug
ul.cards.is-row

  li.card.product
    img(src='', width='', alt='')
    .product__body
      h2 List-based media object
      p Cras sit amet nibh libero, in gravida nulla. Nulla vel metus scelerisque ante sollicitudin.

  li.card.product
    img(src='', width='', alt='')
    .product__body
      h2 List-based media object
      p Cras sit amet nibh libero, in gravida nulla. Nulla vel metus scelerisque ante sollicitudin.
```
