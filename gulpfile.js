var
  gulp = require('gulp'),
  concat = require('gulp-concat'),
  rename = require('gulp-rename'),
  uglify = require('gulp-uglify'),
  sequence = require('run-sequence');

gulp.task('default', function() {
  return sequence(['ace']);
});

gulp.task('ace', function() {
  var assets = 'vendor/assets/components';
  var root = `${assets}/ace-builds/src-min-noconflict`;
  var languages = [
    'javascript',
    'java',
    'lisp',
    'c_cpp',
    'markdown',
    'mysql',
    'objectivec',
    'php',
    'python',
    'html',
    'xml',
    'ruby'
  ];
  var themes = [
    'monokai',
    'twilight'
  ];
  return gulp.src([
    `${root}/ace.js`,
    `${root}/ext-language_tools.js`,
    ...languages.map(language => `${root}/mode-${language}.js`),
    ...themes.map(theme => `${root}/theme-${theme}.js`),
    `${assets}/angular-ui-ace/ui-ace.min.js`
  ])
  .pipe(concat('ace.js'))
  .pipe(uglify())
  .pipe(gulp.dest('vendor/assets/javascripts'));
});
