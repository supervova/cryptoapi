/* eslint-disable no-console */
/**
 * -----------------------------------------------------------------------------
 * 📥 IMPORTS AND CONSTANTS
 * -----------------------------------------------------------------------------
 */
// #region
import { src, dest, watch, series, parallel } from 'gulp';

// import purge from '@fullhuman/postcss-purgecss';
import * as sass from 'sass';
import browserSync from 'browser-sync';
import changed from 'gulp-changed';
import cssnano from 'cssnano';
import futureFeatures from 'postcss-preset-env';
import gulpSass from 'gulp-sass';
// import gulpif from 'gulp-if';
import imagemin from 'gulp-imagemin';
import imageminGIF from 'imagemin-gifsicle';
import imageminJPG from 'imagemin-mozjpeg';
import imageminPNG from 'imagemin-pngquant';
import imageminSVG from 'imagemin-svgo';
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
import { hideBin } from 'yargs/helpers';
import { join } from 'path';

const bsInstance = browserSync.create();
const gulpEsbuild = createGulpEsbuild();

const sassCompiler = gulpSass(sass);

const { argv } = yargs(hideBin(process.argv));
const PRODUCTION = argv.p;
// #endregion

/**
 * -----------------------------------------------------------------------------
 * 👉 PATHS
 * -----------------------------------------------------------------------------
 */
// #region
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
      pages: `${srcBase}/assets/scss/pages/*.scss`,
      legacy: `${srcBase}/assets/scss/legacy/index.scss`,
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
        `!${srcBase}/twig/partials/*.twig`,
        `!${srcBase}/twig/data/**/*.twig`,
      ],
      tpl: [`${srcBase}/templates/*.tpl`, `!${srcBase}/templates/*~.tpl`],
    },
    watch: [
      `${srcBase}/twig/**/*.twig`,
      `${destAssets}/css/*.css`,
      `${root.dest.dev}/css/*.css`,
      `!${destAssets}/css/main.css`,
      `!${root.dest.dev}/css/bootstrap.css`,
      `!${root.dest.dev}/css/jquery.toast.min.css`,
      `!${root.dest.dev}/css/main_modal.css`,
    ],
    dest: {
      dev: `${root.dest.dev}`,
      prod: `${root.dest.prod}/twig`,
      prodTpl: `${root.dest.prod}/templates`,
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
    src: `${srcBase}/assets/js`, // папка с исходниками
    entry: {
      main: `${srcBase}/assets/js/main.js`, // основная точка входа
      'asset-chart': `${srcBase}/assets/js/asset-chart.js`,
      asset: `${srcBase}/assets/js/asset.js`,
      markets: `${srcBase}/assets/js/markets.js`,
      search: `${srcBase}/assets/js/search.js`,
      toast: `${srcBase}/assets/js/toast.js`,
      // home: `${srcBase}/assets/js/home.js`,
    },
    watch: `${srcBase}/assets/js/**/*.js`,
    dest: `${destAssets}/js/`,
  },
  video: {
    src: `${srcBase}/assets/video/**/*.mp4`,
    dest: `${destAssets}/video`,
  },
  fonts: {
    src: `${srcBase}/assets/fonts/**/*.{woff2,ttf}`,
    dest: `${destAssets}/fonts/`,
  },
  data: {
    src: `${srcBase}/assets/data/**/*.json`,
    fixtures: `${srcBase}/assets/data/fixtures`,
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

/**
 * -----------------------------------------------------------------------------
 * 🛠 UTILITIES
 * -----------------------------------------------------------------------------
 */
// #region
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

/**
 * -----------------------------------------------------------------------------
 * 💾 SCRIPTS
 * -----------------------------------------------------------------------------
 */
// #region
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
    entries.map(
      ([name, entry]) =>
        src(entry, { sourcemaps: !PRODUCTION }) // для dev-watch стэктрейсов
          .pipe(handleError('JS Compile Error'))
          .pipe(
            gulpEsbuild({
              outfile: `${name}.js`,
              bundle: true,
              format: PRODUCTION ? 'iife' : 'esm',
              minify: PRODUCTION,
              sourcemap: !PRODUCTION, // включаем карты только в dev
              define: {
                'process.env.NODE_ENV': JSON.stringify(
                  PRODUCTION ? 'production' : 'development'
                ),
              },
            })
          )

          .pipe(dest(paths.js.dest, { sourcemaps: '.' })) // чтобы gulp сам не терял карту
      // .pipe(bsInstance.stream({ once: true }))
    )
  );
};

// #endregion

/**
 * -----------------------------------------------------------------------------
 * 👯‍♀️ COPY
 * -----------------------------------------------------------------------------
 */
// #region
// const copyVideo = () =>
//   src(paths.video.src, { encoding: false })
//     .pipe(changed(paths.video.dest))
//     .pipe(dest(paths.video.dest));

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
  copyFonts,
  copyLocales,
  copyTpl,
  copyTwig
);
// #endregion

/**
 * -----------------------------------------------------------------------------
 * 🖼 IMAGES
 * -----------------------------------------------------------------------------
 */
// #region
const img = () =>
  src(paths.img.src, { encoding: false })
    .pipe(newer(paths.img.dest))
    .pipe(
      imagemin(
        [
          imageminGIF({ interlaced: true, optimizationLevel: 3 }),
          imageminJPG({ quality: 85 }),
          imageminPNG({ quality: [0.85, 0.95] }),
          imageminSVG({
            plugins: [
              { name: 'removeViewBox', active: false },
              {
                name: 'cleanupIds',
                params: { remove: false, minify: false, preserve: [] },
              },
            ],
          }),
        ],
        { verbose: true }
      )
    )
    .pipe(dest(paths.img.dest))
    .pipe(size({ title: 'images' }));
// #endregion

/**
 * -----------------------------------------------------------------------------
 * 📰 PAGES
 * -----------------------------------------------------------------------------
 */
// #region

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
    };
  } catch (error) {
    console.error('Error loading PHP mock data:', error);
    return {};
  }
};

const assetPage = () => {
  // Новая задача для asset.twig -> asset.html
  const fixturePath = join(paths.data.fixtures, 'asset-btc.json'); // Путь к фикстуре
  let viewData = {
    // Минимальные дефолты, если фикстура не загрузится
    ENV: PRODUCTION ? 'production' : 'development',
    site: { assets_prefix: '' },
    page: { lang: 'en', js: {}, title: 'Asset Page (Default Title)' },
    asset_data: { ticker: 'N/A', name: 'N/A' },
    translations_for_js: {},
  };

  try {
    if (existsSync(fixturePath)) {
      console.log(`  ✔️ Loading data for asset.twig from: ${fixturePath}`);
      viewData = JSON.parse(readFileSync(fixturePath, 'utf8'));
      // Убедимся, что ENV установлен правильно на основе PRODUCTION, если его нет в фикстуре
      // или если мы хотим, чтобы Gulp всегда определял ENV для этой задачи
      viewData.ENV = PRODUCTION ? 'production' : 'development';
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
      replace(/\{\$([\w\-.]+)\}/g, (match, varName) => {
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
          `Warning: PHP variable {$${varName}} not found in asset.twig data or global mock data`
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
    .pipe(replace(/\s\/>/g, '>'))
    .pipe(rename('asset.html')) // <--- ПЕРЕИМЕНОВЫВАЕМ в asset.html
    .pipe(size({ title: 'html (asset page)' }))
    .pipe(dest(paths.markup.dest.dev)) // Сохраняем в dist/asset.html
    .pipe(bsInstance.stream());
};

const pages = () => {
  // Загружаем мок-данные для PHP-переменных
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
      // НЕ заменяем {$variable} на {{variable}} до компиляции Twig
      // Вместо этого, компилируем Twig как обычно
      .pipe(
        twig({
          base: './src/twig',
          data: {
            // Добавляем все PHP-переменные как обычные переменные Twig
            ...phpMockData,
            ENV: process.env.NODE_ENV || 'production',
          },
          filters: [
            {
              name: 'trans',
              func(string) {
                return string;
              },
            },
          ],
        })
      )
      .on('error', function errorHandler(err) {
        process.stderr.write(`${err.message}\n`);
        this.emit('end');
      })
      // После компиляции Twig заменяем {$variable} на соответствующие значения из phpMockData
      .pipe(
        replace(/\{\$([\w\-.]+)\}/g, (match, varName) => {
          // Если переменная есть в phpMockData, возвращаем ее значение
          if (phpMockData[varName] !== undefined) {
            return phpMockData[varName];
          }
          // Иначе возвращаем пустую строку
          console.warn(
            `Warning: PHP variable ${varName} not found in mock data`
          );
          return '';
        })
      )
      .pipe(prettify({ printWidth: 40000, bracketSameLine: true }))
      .pipe(replace(/ (\s*<style>\n)\s*@charset "UTF-8";/g, '$1'))
      .pipe(replace(/\s\/>/g, '>'))
      .pipe(size({ title: 'html' }))
      .pipe(dest(paths.markup.dest.dev))
      .pipe(bsInstance.stream())
  );
};
// #endregion

/**
 * -----------------------------------------------------------------------------
 * 🎨 STYLES
 * -----------------------------------------------------------------------------
 */
// #region
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
          errorHandler: notify.onError('Error: <%= error.message %>'),
        })
      )
      // .pipe(gulpif(!(PRODUCTION || forceProduction), sourcemaps.init()))
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
      // .pipe(gulpif(!(PRODUCTION || forceProduction), sourcemaps.write()))
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
    'legacy.css'
  ); // Добавляем имя файла
};

// export { cssLegacy as cssp };

const css = series(cssBase, cssPages, cssLegacy);
// #endregion

/**
 * -----------------------------------------------------------------------------
 * ❤️ SVG SPRITES
 * -----------------------------------------------------------------------------
 */
// #region

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

/**
 * -----------------------------------------------------------------------------
 * 📶 SERVER
 * -----------------------------------------------------------------------------
 */
// #region
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
            // Если нет расширения, проверяем, существует ли index.html в директории
            const potentialIndex = join(baseDir, req.url, 'index.html');
            if (existsSync(potentialIndex)) {
              req.url += '/index.html';
            } else {
              // Иначе просто добавляем .html к URL
              req.url += '.html';
            }
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

/**
 * -----------------------------------------------------------------------------
 * 🏗️ BUILD AND SERVE
 * -----------------------------------------------------------------------------
 */
// #region
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

const dev = series(build, parallel(pages, assetPage), serve);
// #endregion

/**
 * -----------------------------------------------------------------------------
 * ☑️ TASKS
 * -----------------------------------------------------------------------------
 */
export {
  assetPage,
  clean,
  copy,
  copyTwig,
  pages,
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
