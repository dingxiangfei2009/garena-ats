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
  var root = assets + '/ace-builds/src-min-noconflict';
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
  var src = [
    root + '/ace.js',
    root + '/ext-language_tools.js',
    assets + '/angular-ui-ace/ui-ace.min.js'
  ];
  Array.prototype.push.apply(src,
    languages.map(function(language) {
      return root + '/mode-' + language + '.js';}));
  Array.prototype.push.apply(src,
    themes.map(function(theme) {
      return root + '/theme-' + theme + '.js';}));
  return gulp.src(src)
  .pipe(concat('ace.js'))
  .pipe(uglify())
  .pipe(gulp.dest('vendor/assets/javascripts'));
});
