var gulp          = require('gulp');
var plugins       = require('gulp-load-plugins')();
var context       = require('./context').new();
var assets        = require('./build/assets');
var components    = require('./build/components');
var pages         = require('./build/pages');

gulp.task('assets', function() {
  return assets.images(context, plugins, gulp);
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
    port: 9000,
    livereload: false
  });
});

gulp.task(
  'build',
  gulp.series(
    'clean',
    'assets',
    'components',
    'pages'
    // 'clean:tmp'
  )
);

gulp.task(
  'preview',
  gulp.series(
    // 'clean:tmp',
    'connect'
  )
);
