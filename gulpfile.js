// Sass configuration
const gulp = require('gulp');
const fs = require('fs-extra');
const chalk = require('chalk');
const sass = require('gulp-sass');
const path = require('path');
const ts = require('gulp-typescript');
const typescript = require('typescript');
const webpack = require('webpack-stream');
const webpackConfig = require('./webpack.config.js');

sass.compiler = require('sass');

/********************/
/*		BUILD		*/
/********************/

/**
 * Build TypeScript
 */
function buildTS() {
  return gulp
    .src('src/')
    .pipe(webpack(webpackConfig('production')))
    .pipe(gulp.dest('dist/'));
}

/**
 * Build TypeScript
 */
function buildTSDev() {
  return gulp
    .src('src/')
    .pipe(webpack(webpackConfig('development')))
    .pipe(gulp.dest('dist/'));
}

/**
 * Build SASS
 */
function buildSASS() {
  return gulp
    .src('src/scss/*.scss')
    .pipe(sass().on('error', sass.logError))
    .pipe(gulp.dest('dist'));
}

/**
 * Copy static files
 */
async function copyFiles() {
  const statics = [
    'lang',
    'fonts',
    'assets',
    'templates',
    'system.json',
    'template.json'
  ];
  try {
    for (const file of statics) {
      if (fs.existsSync(path.join('system', file))) {
        await fs.copy(path.join('system', file), path.join('dist', file));
      }
    }
    return Promise.resolve();
  } catch (err) {
    Promise.reject(err);
  }
}

/**
 * Watch for changes for each build step
 */
function buildWatch() {
  gulp.watch('src/**/*.ts', { ignoreInitial: false }, buildTS);
  gulp.watch('src/**/*.scss', { ignoreInitial: false }, buildSASS);
  gulp.watch(
    ['src/fonts', 'src/lang', 'src/templates', 'src/*.json'],
    { ignoreInitial: false },
    copyFiles
  );
}

/********************/
/*		CLEAN		*/
/********************/

/**
 * Remove built files from `dist` folder
 * while ignoring source files
 */
async function clean() {
  const name = path.basename(path.resolve('.'));
  const files = [];

  // If the project uses TypeScript
  if (fs.existsSync(path.join('src', `${name}.ts`))) {
    files.push(
      'lang',
      'templates',
      'assets',
      'module',
      `${name}.js`,
      'module.json',
      'system.json',
      'template.json'
    );
  }

  // If the project uses Less or SASS
  if (fs.existsSync(path.join('src', `${name}.scss`))) {
    files.push('fonts', `${name}.css`);
  }

  console.log(' ', chalk.yellow('Files to clean:'));
  console.log('   ', chalk.blueBright(files.join('\n    ')));

  // Attempt to remove the files
  try {
    for (const filePath of files) {
      await fs.remove(path.join('dist', filePath));
    }
    return Promise.resolve();
  } catch (err) {
    Promise.reject(err);
  }
}

const execBuild = gulp.parallel(buildTS, buildSASS, copyFiles);

exports.copyFiles = copyFiles;
exports.buildScss = buildSASS;
exports.buildTSDevelopment = buildTSDev;
exports.build = gulp.series(clean, execBuild);
exports.buildProd = gulp.series(clean, execBuild);
exports.watch = buildWatch;
exports.clean = clean;
