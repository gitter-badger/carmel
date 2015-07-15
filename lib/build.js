var gulp          = require('gulp');
var plugins       = require('gulp-load-plugins')();
var context       = require('./context').new();
var scripts       = require('./build/scripts');
var articles      = require('./build/articles');
var assets        = require('./build/assets');
var components    = require('./build/components');
var pages         = require('./build/pages');
var deploy        = require('./build/deploy');

gulp.task('scripts', function() {
  return scripts.build(context, gulp, plugins);
});

gulp.task('articles', function() {
  return articles.build(context, gulp, plugins);
});

gulp.task('assets', function() {
  return assets.build(context, gulp, plugins);
});

gulp.task('components', function() {
    return components.build(context, gulp, plugins);
});

gulp.task('pages', function() {
    return pages.build(context, gulp, plugins);
});

gulp.task('clean', function(done) {
  context.destroy();
  done();
});

gulp.task('clean:tmp', function(done) {
  context.clean();
  done();
});

gulp.task('connect', function() {
  plugins.connect.server({
    root: [context.app.previewDir],
    port: context.dev().port,
    livereload: false
  });
});

gulp.task('deploy:production', function() {
  return deploy.remote(context, gulp, plugins);
});

gulp.task(
  'build',
  gulp.series(
    'clean',
    'assets',
    'scripts',
    'components',
    'pages',
    'articles',
    'clean:tmp'
  )
);

gulp.task(
  'preview',
  gulp.series(
    'clean:tmp',
    'connect'
  )
);

gulp.task(
  'publish',
  gulp.series(
    'clean:tmp',
    'deploy:production',
    'clean:tmp'
  )
);
