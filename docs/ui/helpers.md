# Helpers size

If the file size of utility classes for spacing and flexbox does not meet the requirements of the project, it is possible not to include these modules, but to write individual classes used in markup to `_essential.scss`. E.g.

```scss
// main.scss
@layer helpers {
  @include meta.load-css('helpers/essentials');
}

// _essential.scss
.flex-grow-0 {
  flex-grow:0;
}

.mx-2{
  margin-inline: calc(var(--size-line) * 2);
}

@media (--tablet) {
  .tablet\:mb-5s {
    margin-bottom:var(--size-5);
  }

  .tablet\:self-center {
    align-self:center;
  }
}
```

## Original

| Module        | Size, KB |
| ------------- | -------- |
| **All**       | 115      |
| Spacing       | 77       |
| Flex          | 23       |
| Width         | 6        |
| Display       | 4        |
| Content       | 2        |
| Animation     | 2        |
| Accessibility | 1        |
| Essentials    | ≈ 0      |

## Minified

| Module        | Size, KB |
| ------------- | -------- |
| **All**       | 90       |
| Spacing       | 61       |
| Flex          | 17       |
| Width         | 5        |
| Display       | 3        |
| Content       | 2        |
| Animation     | 1        |
| Accessibility | 0.817    |
| Essentials    | ≈ 0      |
