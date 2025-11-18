// -----------------------------------------------------------------------------
// #region 📥 IMPORTS AND CONSTANTS
// -----------------------------------------------------------------------------

import { src, dest, watch, series, parallel } from 'gulp';

// import purge from '@fullhuman/postcss-purgecss';
import * as sass from 'sass';
import browserSync from 'browser-sync';
import changed from 'gulp-changed';
import cssnano from 'cssnano';
import data from 'gulp-data';
import futureFeatures from 'postcss-preset-env';
import gulpSass from 'gulp-sass';
// import gulpif from 'gulp-if';
import imagemin, { gifsicle, mozjpeg, optipng, svgo } from 'gulp-imagemin';
import inlineSvg from 'postcss-inline-svg';
import newer from 'gulp-newer';
import notify from 'gulp-notify';
import plumber from 'gulp-plumber';
import postcss from 'gulp-postcss';
import prettify from 'gulp-prettier';
import rename from 'gulp-rename';
import replace from 'gulp-replace';
import size from 'gulp-size';
// import sourcemaps from 'gulp-sourcemaps';
import svgSprite from 'gulp-svg-sprite';
import twig from 'gulp-twig';
import yargs from 'yargs';
import { createGulpEsbuild } from 'gulp-esbuild';
import { deleteAsync } from 'del';
import { existsSync, readFileSync } from 'fs';
import { join } from 'path';

const bsInstance = browserSync.create();
const gulpEsbuild = createGulpEsbuild();

const sassCompiler = gulpSass(sass);

const { argv } = yargs(process.argv.slice(2));
const isProd = argv.p;
// #endregion

// -----------------------------------------------------------------------------
// #region 👉 PATHS
// -----------------------------------------------------------------------------

const root = {
  src: './src',
  dest: {
    prod: './public', // для production
    dev: './dist', // папка dev сервера
    assets: './public/assets', // общая папка assets для production и dev
  },
};

const srcBase = root.src;
const destAssets = root.dest.assets;

const paths = {
  css: {
    src: {
      main: `${srcBase}/assets/scss/main.scss`,
      pages: [
        `${srcBase}/assets/scss/pages/*.scss`,
        `!${srcBase}/assets/scss/pages/signals.scss`,
        `!${srcBase}/assets/scss/pages/misc.scss`,
      ],
      legacy: `${srcBase}/assets/scss/legacy/index.scss`,
      widgets: [
        `${srcBase}/assets/scss/widgets/*.scss`,
        `!${srcBase}/assets/scss/widgets/_*.scss`,
      ],
    },
    watch: `${srcBase}/assets/scss/**/*.scss`,
    tmp: `${srcBase}/assets/css/`,
    dest: {
      base: `${destAssets}/css/`,
      legacy: `${root.dest.dev}/css/`,
    },
  },
  markup: {
    src: {
      twig: [
        `${srcBase}/twig/**/*.twig`,
        `!${srcBase}/twig/asset.twig`,
        `!${srcBase}/twig/widgets/*.twig`, // Exclude widgets from main pages task
        `!${srcBase}/twig/partials/*.twig`,
        `!${srcBase}/twig/data/**/*.twig`,
      ],
      tpl: [`${srcBase}/templates/*.tpl`, `!${srcBase}/templates/*~.tpl`],
      widgets: `${srcBase}/twig/widgets/*.twig`, // Path for widget templates
    },
    watch: [
      `${srcBase}/twig/**/*.twig`,
      `!${srcBase}/twig/widgets/*.twig`, // Exclude widgets from main watch
      `${destAssets}/css/*.css`,
      `${root.dest.dev}/css/*.css`,
      `!${destAssets}/css/main.css`,
      `!${root.dest.dev}/css/bootstrap.css`,
      `!${destAssets}/css/jquery.toast.min.css`,
      `!${root.dest.dev}/css/main_modal.css`,
    ],
    dest: {
      dev: `${root.dest.dev}`,
      prod: `${root.dest.prod}/twig`,
      prodTpl: `${root.dest.prod}/templates`,
      widgets: `${root.dest.dev}/widgets`, // Destination for widget HTMLs
    },
  },
  img: {
    src: [
      `${srcBase}/assets/img/**/*.{jpg,png,gif,svg}`,
      `!${srcBase}/assets/img/icons/sprite/*.svg`,
      `!${srcBase}/assets/img/icons/flags/*.svg`,
    ],
    dest: `${destAssets}/img/`,
  },
  svg: {
    src: {
      base: `${srcBase}/assets/img/icons/sprite/*.svg`,
      flags: `${srcBase}/assets/img/icons/flags/*.svg`,
    },
    dest: `${destAssets}/img/icons`,
  },
  js: {
    src: `${srcBase}/assets/js`,
    entry: {
      main: `${srcBase}/assets/js/main.js`,
      'asset-chart': `${srcBase}/assets/js/asset-chart.js`,
      'header-stats': `${srcBase}/assets/js/header-stats.js`,
      'pages/home': `${srcBase}/assets/js/pages/home.js`, // ключ с папкой
      'pages/widgets': `${srcBase}/assets/js/pages/widgets.js`,
      asset: `${srcBase}/assets/js/asset.js`,
      markets: `${srcBase}/assets/js/markets.js`,
      pricing: `${srcBase}/assets/js/pricing.js`,
      search: `${srcBase}/assets/js/search.js`,
      'ui/current-plan': `${srcBase}/assets/js/ui/current-plan.js`,
      'ui/toast': `${srcBase}/assets/js/ui/toast.js`,
      'widgets/btc': `${srcBase}/assets/js/widgets/btc.js`,
      'widgets/fgi': `${srcBase}/assets/js/widgets/fgi.js`,
      'widgets/iframe': `${srcBase}/assets/js/widgets/iframe.js`,
      'widgets/signals': `${srcBase}/assets/js/widgets/signals.js`,
      'widgets/trindx': `${srcBase}/assets/js/widgets/trindx.js`,
    },
    watch: `${srcBase}/assets/js/**/*.js`,
    dest: `${destAssets}/js/`,
  },
  video: {
    src: `${srcBase}/assets/video/**/*.mp4`,
    dest: `${destAssets}/video`,
  },
  coins: {
    src: `${srcBase}/images/coins/**/*`,
    dest: `${root.dest.prod}/images/coins`,
  },
  fonts: {
    src: `${srcBase}/assets/fonts/**/*.{woff2,ttf}`,
    dest: `${destAssets}/fonts/`,
  },
  data: {
    src: `${srcBase}/assets/data/**/*.json`,
    fixtures: `${srcBase}/assets/data/fixtures`,
    widgetFixtures: `${srcBase}/assets/data/fixtures/widgets`, // Path for widget fixtures
    dest: `${destAssets}/data/`,
  },
  engine: {
    src: `${srcBase}/engine/**/*`,
    dest: `${root.dest.prod}/engine`,
  },
  l10n: {
    src: `${srcBase}/translate/**/*`,
    dest: `${root.dest.prod}/translate`,
  },
};

// #endregion

// -----------------------------------------------------------------------------
// #region 🛠 UTILITIES
// -----------------------------------------------------------------------------

const cleanDist = () =>
  deleteAsync([
    `${root.dest.dev}/**/*`, // Очищаем dist
    `${paths.css.dest.base}/**/*.css`,
    `${paths.js.dest}/**/*.js`,
    `${paths.img.dest}/**/*`,
    `${destAssets}/data/**/*`,
    `${root.dest.prod}/engine/*.php`,
    `${root.dest.prod}/twig/**/*`,
  ]);

const cleanPages = () => deleteAsync([`${paths.markup.dest.dev}/**/*.html`]);

const cleanSrc = () => deleteAsync([`${srcBase}/**/*.css`]);

const clean = parallel(cleanDist, cleanSrc, cleanPages);
// #endregion

// -----------------------------------------------------------------------------
// #region 💾 SCRIPTS
// -----------------------------------------------------------------------------

const handleError = (title) => {
  return plumber({
    errorHandler: notify.onError({
      title,
      message: '<%= error.message %>',
    }),
  });
};

const js = () => {
  const entries = Object.entries(paths.js.entry);

  return Promise.all(
    entries.map(([name, entry]) => {
      // Определяем выходную папку на основе имени
      const outputDir = name.includes('/')
        ? `${paths.js.dest}${name.substring(0, name.lastIndexOf('/'))}/`
        : paths.js.dest;

      const outputFile = name.includes('/')
        ? `${name.substring(name.lastIndexOf('/') + 1)}.js`
        : `${name}.js`;

      return src(entry, { sourcemaps: !isProd })
        .pipe(handleError('JS Compile Error'))
        .pipe(
          gulpEsbuild({
            outfile: outputFile,
            bundle: true,
            format: isProd ? 'iife' : 'esm',
            minify: isProd,
            sourcemap: !isProd,
            define: {
              'process.env.NODE_ENV': JSON.stringify(
                isProd ? 'production' : 'development'
              ),
            },
          })
        )
        .pipe(dest(outputDir, { sourcemaps: '.' }));
    })
  );
};

// #endregion

// -----------------------------------------------------------------------------
// #region 👯‍♀️ COPY
// -----------------------------------------------------------------------------

// const copyVideo = () =>
//   src(paths.video.src, { encoding: false })
//     .pipe(changed(paths.video.dest))
//     .pipe(dest(paths.video.dest));

const copyCoins = () =>
  src(paths.coins.src, { encoding: false })
    .pipe(newer(paths.coins.dest))
    .pipe(dest(paths.coins.dest));

const copyFonts = () =>
  src(paths.fonts.src, { encoding: false })
    .pipe(changed(paths.fonts.dest))
    .pipe(dest(paths.fonts.dest));

// Тестовые данные
const copyData = () =>
  src(paths.data.src, { encoding: false })
    .pipe(changed(paths.data.dest))
    .pipe(dest(paths.data.dest))
    .pipe(bsInstance.stream());

// Engine
const copyEngine = () =>
  src(paths.engine.src, { encoding: false })
    .pipe(changed(paths.engine.dest))
    .pipe(dest(paths.engine.dest));

// Переводы
const copyLocales = () =>
  src(paths.l10n.src, { encoding: false })
    .pipe(changed(paths.l10n.dest))
    .pipe(dest(paths.l10n.dest));

const copyTwig = () =>
  src(
    [
      `${srcBase}/twig/**/*.twig`,
      `${srcBase}/twig/readme.md`,
      `!${srcBase}/twig/wip/*.twig`,
    ],
    {
      encoding: false,
    }
  )
    .pipe(changed(paths.markup.dest.prod))
    .pipe(dest(paths.markup.dest.prod));

const copyTpl = () =>
  src(paths.markup.src.tpl, {
    encoding: false,
  })
    .pipe(changed(paths.markup.dest.prodTpl))
    .pipe(dest(paths.markup.dest.prodTpl));

const copy = parallel(
  copyData,
  copyEngine,
  copyCoins,
  copyFonts,
  copyLocales,
  copyTpl,
  copyTwig
);
// #endregion

// -----------------------------------------------------------------------------
// #region 🖼 IMAGES
// -----------------------------------------------------------------------------

const img = () =>
  src(paths.img.src, { encoding: false })
    .pipe(newer(paths.img.dest))
    .pipe(
      imagemin([
        gifsicle({ interlaced: true }),
        mozjpeg({ quality: 85, progressive: true }),
        optipng({ optimizationLevel: 1 }),
        svgo({
          plugins: [
            { name: 'removeViewBox', active: false },
            {
              name: 'cleanupIDs',
              params: { remove: false, minify: false, preserve: [] },
            },
          ],
        }),
      ])
    )
    .pipe(dest(paths.img.dest))
    .pipe(size({ title: 'images' }));
// #endregion

// -----------------------------------------------------------------------------
// #region 📰PAGES
// -----------------------------------------------------------------------------

// Загрузка данных из мок-файла для PHP-переменных
const loadPhpMockData = () => {
  try {
    // Проверяем наличие файла с мок-данными для PHP-переменных
    if (existsSync(`${srcBase}/assets/data/fixtures/global-vars.json`)) {
      return JSON.parse(
        readFileSync(`${srcBase}/assets/data/fixtures/global-vars.json`, 'utf8')
      );
    }
    // Если файла нет, возвращаем объект с базовыми значениями
    return {
      meta_title: 'Site Title (Mock)',
      meta_description: 'Site Description (Mock)',
      meta_ogimage: '/assets/img/ogimage.jpg',
      thispageurl: 'http://localhost:9000',
      main_href: 'http://localhost:9000',
      base_href: '/',
      lng_html: 'en',
      ogtype: '<meta property="og:type" content="website"/>',
      canonical: '<link rel="canonical" href="http://localhost:9000"/>',
      schemaorg: '',
      thispagecss: '',
      thispagejs: '',
      loginform: '',
      project_name: 'Project Name',
      'theme-color': '#4a86e8',
      page_content_html: '<p>Default content</p>',
      hello_cookie: '',
      unloggedid: '',
      authhost: 'localhost:9000',
      thispageurlencoded: '',
      thispagesimpleurl: 'localhost:9000',
      IP_external: '',
      user_balancefnall: '$1,040.00',

      aboutmehtml: 'Король, практически',
      accesslog:
        '<tr><td>2025-11-18 14:47:48</td><td>2025-11-17 22:44:06</td><td>62.4.55.125</td><td>ME</td><td>Podgorica</td><td>Chrome 0.0 (macOS)</td></tr>',
      alertprofile: '',
      cc_html:
        '<select name="cclist" id="cclist" class="form-control"><option value="">Не выбрано</option><option value="AU">Австралия</option><option value="JP">Япония</option></select>',
      defaultavatar: './images/profile_nophoto.jpg',
      enteremailhtml: '',
      g2faphrase: 'Включите авторизацию 2FA!',
      linktomsg:
        '<span style="color:#004524">Вы уже установили связь между мессенджером и своей учетной записью, но вы можете связать больше мессенджеров. Количество прикрепленных мессенджеров: <strong>1</strong>.</span>',
      messengers_code: '428989',
      myblogs: '',
      mysites: '',
      oldpassworddiv:
        '<div class="input-group" style="margin-top:10px"><span class="input-group-addon">Старый пароль:</span><input type="password" class="form-control" name="oldpwd" id="oldpwd" value="></div>',
      profile_links: '',
      user_country: 'CD',
      user_region: 'dss',
      user_region_lng: 'dss',
      utc_html:
        '<select name="userUTC" id="userUTC" class="form-control"><option value="-11">(UTC-11) Alofi</option><option value="14">(UTC+14) Apia</option></select>',
    };
  } catch (error) {
    console.error('Error loading PHP mock data:', error);
    return {};
  }
};

const newsFixture = `${srcBase}/assets/data/fixtures/news.json`;
const newsApi = 'https://api.cryptoapi.ai/news'; // TODO: replace with real API endpoint

// 1. загружаем новости из локальной фикстуры
const loadNewsFixture = () => {
  if (existsSync(newsFixture)) {
    return JSON.parse(readFileSync(newsFixture, 'utf8'));
  }
  console.warn('⚠️  news fixture not found – returning empty array');
  return { featured: null, items: [] };
};

// 2. загружаем новости с удалённого API (sync через node-fetch)
const fetchNewsFromApi = async (lang = 'en') => {
  try {
    const res = await fetch(`${newsApi}?lang=${lang}&limit=6`);
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    return await res.json();
  } catch (e) {
    console.error('News API error:', e.message);
    return { featured: null, items: [] }; // fallback
  }
};

const assetPage = () => {
  // Новая задача для asset.twig -> asset.html
  const fixturePath = join(paths.data.fixtures, 'asset-btc.json'); // Путь к фикстуре
  let viewData = {
    // Минимальные дефолты, если фикстура не загрузится
    ENV: isProd ? 'production' : 'development',
    site: { assets_prefix: '' },
    page: { lang: 'en', js: {}, title: 'Asset Page (Default Title)' },
    asset_data: { ticker: 'N/A', name: 'N/A' },
    translations_for_js: {},
  };

  try {
    if (existsSync(fixturePath)) {
      console.log(`  ✔️ Loading data for asset.twig from: ${fixturePath}`);
      viewData = JSON.parse(readFileSync(fixturePath, 'utf8'));
      // Убедимся, что ENV установлен правильно на основе isProd, если его нет в фикстуре
      // или если мы хотим, чтобы Gulp всегда определял ENV для этой задачи
      viewData.ENV = isProd ? 'production' : 'development';
      // Убедимся, что site.assets_prefix установлен, если его нет в фикстуре (хотя он должен быть)
      if (!viewData.site) viewData.site = {};
      if (!viewData.page) viewData.page = {};
      if (viewData.asset_data) {
        viewData.page.asset = viewData.asset_data;
      }
      if (viewData.site.assets_prefix === undefined)
        viewData.site.assets_prefix = '';
    } else {
      console.warn(
        `🚨 Fixture file for asset page not found: ${fixturePath}. Using defaults.`
      );
    }
  } catch (error) {
    console.error(`Error loading or parsing fixture ${fixturePath}:`, error);
  }

  // Отладочный лог для проверки данных, которые пойдут в asset.twig
  console.log('\n--- Data prepared for asset.twig (task assetPage) ---');
  console.log(`  ENV: ${viewData.ENV}`);
  console.log(
    `  Site Prefix: ${viewData.site ? viewData.site.assets_prefix : 'N/A'}`
  );
  console.log(
    `  Page JS Ticker: ${viewData.page && viewData.page.js ? viewData.page.js.assetTicker : 'N/A'}`
  );
  console.log(
    `  Asset Data Ticker: ${viewData.asset_data ? viewData.asset_data.ticker : 'N/A'}`
  );
  console.log('--- End of data for asset.twig ---\n');

  return src(`${srcBase}/twig/asset.twig`) // Указываем конкретный файл asset.twig
    .pipe(handleError('Asset Twig Compile Error')) // Твой handleError
    .pipe(
      replace(/{\$([\w\-.]+)\}/g, (match, varName) => {
        // Замена {$var} ДО Twig
        // Для этой задачи {$var} будут браться из viewData (которая из asset-btc.json)
        // или если это глобальные, то нужно их как-то сюда передать
        // Проще всего, если asset-btc.json содержит все нужные {$var} или они не используются в asset.twig
        if (viewData[varName] !== undefined) {
          // Ищем прямо в viewData
          return viewData[varName];
        }
        // Или можно попробовать загрузить globalMockData и поискать там, если {$var} глобальные
        // const globalData = loadPhpMockData();
        // if (globalData[varName] !== undefined) return globalData[varName];
        console.warn(
          `Warning: PHP variable {${varName}} not found in asset.twig data or global mock data`
        );
        return '';
      })
    )
    .pipe(
      twig({
        base: './src/twig', // База для @extends, @include
        data: viewData, // Передаем данные из фикстуры
        filters: [
          {
            name: 'trans',
            func(string) {
              // Твоя заглушка для |trans
              // Для asset.twig переводы должны приходить из viewData.translations_for_js
              // Но фильтр |trans в самом шаблоне будет использовать эту заглушку.
              // Строки для <script id="js-translations"> должны быть переданы как объект viewData.translations_for_js
              return string;
            },
          },
        ],
        errorLogToConsole: true,
      })
    )
    .on('error', function errorHandler(err) {
      process.stderr.write(`${err.message}\n`);
      this.emit('end');
    })
    .pipe(prettify({ printWidth: 40000, bracketSameLine: true }))
    .pipe(replace(/ (\s*<style>\n)\s*@charset "UTF-8";/g, '$1'))
    .pipe(replace(/ \/>/g, '>'))
    .pipe(rename('asset.html')) // <--- ПЕРЕИМЕНОВЫВАЕМ в asset.html
    .pipe(size({ title: 'html (asset page)' }))
    .pipe(dest(paths.markup.dest.dev)) // Сохраняем в dist/asset.html
    .pipe(bsInstance.stream());
};

const pages = () => {
  const phpMockData = loadPhpMockData();

  return (
    src(paths.markup.src.twig, { base: './src/twig' })
      .pipe(
        plumber({
          handleError(err) {
            console.log(err);
            this.emit('end');
          },
        })
      )

      // подкидываем async-data перед компиляцией Twig
      .pipe(
        data(async () => {
          const lang = phpMockData.lng_html || 'en';

          // newsData: в dev берём локальный JSON, в prod – реальный API
          const newsData = isProd
            ? await fetchNewsFromApi(lang)
            : loadNewsFixture();

          return {
            ...phpMockData,
            ENV: process.env.NODE_ENV || 'production',
            page: {
              ...phpMockData.page, // сохраняем page.lang и другие поля
              news: newsData, // добавляем новые
            },
          };
        })
      )
      // НЕ заменяем {$variable} на {{variable}} до компиляции Twig
      // Вместо этого, компилируем Twig как обычно
      .pipe(
        twig({
          base: './src/twig',
          filters: [
            {
              name: 'trans',
              func(str) {
                return str;
              },
            },
            {
              name: 'tzdate',
              func(value, timezone = 'UTC', lang = 'en') {
                try {
                  if (Array.isArray(timezone)) {
                    timezone = timezone[0]; // берем первый элемент массива
                  }
                  const date = new Date(value);
                  if (Number.isNaN(date.getTime())) return value;

                  return date.toLocaleString(lang, {
                    timeZone: timezone,
                    dateStyle: 'medium',
                    timeStyle: 'short',
                  });
                } catch (e) {
                  console.warn('tzdate error:', e);
                  return value;
                }
              },
            },
          ],
        })
      )
      // После компиляции Twig заменяем {$variable} на соответствующие значения из phpMockData
      .pipe(
        replace(/{\$([\w\-.]+)\}/g, (match, varName) => {
          if (phpMockData[varName] !== undefined) return phpMockData[varName];
          console.warn(`PHP var ${varName} not found in mock data`);
          return '';
        })
      )
      .pipe(prettify({ printWidth: 40000, bracketSameLine: true }))
      .pipe(replace(/ (\s*<style>\n)\s*@charset "UTF-8";/g, '$1'))
      .pipe(replace(/ \/>/g, '>'))
      .pipe(size({ title: 'html' }))
      .pipe(dest(paths.markup.dest.dev))
      .pipe(bsInstance.stream())
  );
};

// NEW WIDGETS TASK
const widgetsPages = () => {
  return src(paths.markup.src.widgets)
    .pipe(handleError('Widgets Twig Compile Error'))
    .pipe(
      data((file) => {
        const fileName = file.stem; // e.g., "signals" from "signals.twig"
        const fixturePath = join(paths.data.widgetFixtures, `${fileName}.json`);
        if (existsSync(fixturePath)) {
          console.log(
            `  ✔️ Loading data for ${fileName}.twig from: ${fixturePath}`
          );
          const fixtureData = JSON.parse(readFileSync(fixturePath, 'utf8'));
          // Add ENV variable for development context in templates
          return { ...fixtureData, ENV: 'development' };
        }
        console.warn(
          `🚨 Fixture for ${fileName}.twig not found at ${fixturePath}. Compiling without data.`
        );
        return { ENV: 'development' };
      })
    )
    .pipe(
      twig({
        base: './src/twig',
        filters: [
          { name: 'trans', func: (str) => str },
          {
            name: 'tzdate',
            func(value, timezone = 'UTC', lang = 'en') {
              try {
                if (Array.isArray(timezone)) {
                  // eslint-disable-next-line prefer-destructuring, no-param-reassign
                  timezone = timezone[0];
                }
                const date = new Date(value);
                if (Number.isNaN(date.getTime())) return value;
                return date.toLocaleString(lang, {
                  timeZone: timezone,
                  dateStyle: 'medium',
                  timeStyle: 'short',
                });
              } catch (e) {
                console.warn('tzdate error:', e);
                return value;
              }
            },
          },
        ],
        errorLogToConsole: true,
      })
    )
    .pipe(rename({ extname: '.html' }))
    .pipe(dest(paths.markup.dest.widgets))
    .pipe(bsInstance.stream());
};

// #endregion

// -----------------------------------------------------------------------------
// #region 🎨 STYLES
// -----------------------------------------------------------------------------

// const selectorsToIgnore = ['button', /^(is-|has-)/, /^(.*?)(m|p)(t|b)-/];

const processStyles = (
  source,
  subtitle,
  destination,
  outputName = null
  // purgeContent,
  // forceProduction = false
) => {
  return (
    src(source)
      .pipe(newer(destination))
      .pipe(
        plumber({
          errorHandler(err) {
            notify
              .onError({
                title: `Gulp Error: ${err.plugin}`,
                message: 'See console for details.',
              })
              .call(this, err);

            console.error(`\n--- Gulp Error in ${err.plugin} ---\n`);
            console.error(err.message);
            if (err.line) {
              console.error(`File: ${err.file}:${err.line}:${err.column}`);
            }
            if (err.stack) {
              console.error(`Stack: ${err.stack}`);
            }
            console.error('\n--- End Gulp Error ---\n');

            this.emit('end');
          },
        })
      )
      // .pipe(gulpif(!(isProd || forceProduction), sourcemaps.init()))
      .pipe(
        sassCompiler({
          precision: 4,
          includePaths: ['.'],
        }).on('error', function errorHandler(err) {
          console.error('Error compiling Sass:', err.message);
          this.emit('end');
        })
      )
      .pipe(dest(paths.css.tmp))
      .pipe(
        postcss([
          inlineSvg(),
          futureFeatures({
            stage: 2,
            features: {
              'cascade-layers': false,
              clamp: false,
              'color-mix': true,
              'custom-media-queries': true,
              'custom-properties': false,
              'custom-selectors': true,
              'font-variant-property': false,
              'has-pseudo-class': true,
              'image-set-function': true,
              'is-pseudo-class': false,
              'logical-properties-and-values': false,
              'media-query-ranges': true,
              'nesting-rules': true,
              'unset-value': true,
            },
            autoprefixer: { cascade: false },
          }),
          cssnano({
            preset: [
              'lite',
              {
                normalizeWhitespace: false,
              },
            ],
          }),
          // cssnano({ reduceIdents: { keyframes: false } }),
        ])
      )
      // .pipe(gulpif(!(isProd || forceProduction), sourcemaps.write()))
      .pipe(size({ title: `styles: ${subtitle}` }))
      .pipe(outputName ? rename(outputName) : rename((path) => path))
      .pipe(dest(destination))
      .pipe(bsInstance.stream())
  );
};

const cssBase = () => {
  return processStyles(
    paths.css.src.main,
    'main',
    paths.css.dest.base
    // [`${srcBase}/pages/uncss/**/*.html`],
    // true // Force production mode
  );
};

const cssPages = () => {
  return processStyles(paths.css.src.pages, 'pages', paths.css.dest.base);
};

const cssLegacy = () => {
  return processStyles(
    paths.css.src.legacy,
    'legacy',
    paths.css.dest.base,
    'legacy.css' // Добавляем имя файла
  );
};

const cssWidgets = () => {
  return processStyles(
    paths.css.src.widgets,
    'widgets',
    `${paths.css.dest.base}/widgets/`
  ); // Добавляем имя файла
};

// export { cssLegacy as cssp };

const css = series(cssBase, cssPages, cssLegacy, cssWidgets);
// #endregion

// -----------------------------------------------------------------------------
// #region ❤️ SVG SPRITES
// -----------------------------------------------------------------------------

function svg(source, name) {
  return src(source)
    .pipe(
      svgSprite({
        mode: {
          symbol: {
            dest: '.', // Mode specific output directory
            sprite: name, // Sprite path and name
            prefix: '.', // Prefix for CSS selectors
            dimensions: '', // Suffix for dimension CSS selectors
          },
        },
        svg: {
          xmlDeclaration: false, // strip out the XML attribute
          doctypeDeclaration: false, // don't include the !DOCTYPE declaration
        },
      })
    )
    .pipe(dest(paths.svg.dest));
}

const svgBase = () => svg(paths.svg.src.base, 'sprite.svg');
const svgFlags = () => svg(paths.svg.src.flags, 'flags.svg');

const sprite = series(parallel(svgBase, svgFlags), parallel(css, img));
// #endregion

// -----------------------------------------------------------------------------
// #region 📶 SERVER
// -----------------------------------------------------------------------------

const reload = (done) => {
  bsInstance.reload();
  done();
};

const watchFiles = () => {
  watch(paths.css.watch, series(css));
  watch(paths.js.watch, series(js, reload));
  watch([paths.svg.src.base, paths.svg.src.flags], series(sprite, reload));
  watch(paths.img.src, series(img, reload));
  watch(paths.engine.src, series(copyEngine, reload));
  watch(
    [`${srcBase}/twig/**/*.twig`, `${srcBase}/twig/readme.md`],
    series(copyTwig, reload)
  );
  watch(paths.markup.src.tpl, series(copyTpl, reload));
  watch(paths.l10n.src, series(copyLocales, reload));
  watch(paths.data.src, series(copyData, reload));
  watch(`${srcBase}/twig/asset.twig`, assetPage);
  watch(join(paths.data.fixtures, 'asset-btc.json'), assetPage);
  watch([...paths.markup.watch], series(pages));
  // Watch for widget template and fixture changes
  watch(
    [paths.markup.src.widgets, `${paths.data.widgetFixtures}/**/*.json`],
    series(widgetsPages)
  );
};

const serve = (done) => {
  bsInstance.init({
    server: {
      baseDir: root.dest.dev, // Основная директория - dist
      routes: {
        '/assets': root.dest.assets,
        '/manifest.json': `${root.dest.prod}/manifest.json`,
      },
    },
    port: 9000,
    notify: false,

    // Extensionless URLs
    middleware: [
      // Обработка префикса /projects/cryptoapi.ai/ в путях
      (req, res, next) => {
        // Удаляем префикс /projects/cryptoapi.ai/ из URL для локального сервера
        if (req.url.startsWith('/projects/cryptoapi.ai/')) {
          req.url = req.url.replace('/projects/cryptoapi.ai', '');
        }
        next();
      },
      // Обработка файлов без расширения
      (req, res, next) => {
        const baseDir = root.dest.dev;

        // Если URL корневой, перенаправляем на index.html
        if (req.url === '/') {
          req.url = '/index.html';
        } else {
          // Проверка: если URL заканчивается на `/`, ищем index.html
          const dirPath = join(baseDir, req.url, 'index.html');
          if (req.url.endsWith('/') && existsSync(dirPath)) {
            req.url += 'index.html';
          } else if (!/\.\w+$/.test(req.url)) {
            // Иначе просто добавляем .html к URL
            req.url += '.html';
          }
        }

        next();
      },
    ],
  });
  watchFiles();
  done();
};
// #endregion

// -----------------------------------------------------------------------------
// #region 🏗️ BUILD AND SERVE
// -----------------------------------------------------------------------------

const build = series(
  clean,
  parallel(svgBase, svgFlags),
  parallel(img, css, js, copy)
);

const buildProd = series(
  clean,
  parallel(svgBase, svgFlags),
  parallel(img, css, js, copy)
);

const dev = series(build, parallel(pages, assetPage, widgetsPages), serve);
// #endregion

// -----------------------------------------------------------------------------
// #region ☑️ TASKS
// -----------------------------------------------------------------------------

export {
  assetPage,
  clean,
  copy,
  copyTwig,
  build,
  pages,
  widgetsPages, // Export new task
  sprite,
  img,
  js,
  css,
  dev,
  serve,
  watchFiles as w,
  buildProd,
};

export default build;

// #endregion
