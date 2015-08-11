var argv              = require('yargs').argv;

var gulp              = require('gulp');
var plugins           = require('gulp-load-plugins')();
var context           = require('./context').new();

var builder           = require('./build/builder');

// var scripts       = require('./build/scripts');
// var articles      = require('./build/articles');
// var assets        = require('./build/assets');
// var page          = require('./build/page');
// var pages         = require('./build/pages');
// var deploy        = require('./build/deploy');

// gulp.task('scripts', function() {
//   return scripts.build(context, gulp, plugins);
// });
//
// gulp.task('articles', function() {
//   return articles.build(context, gulp, plugins);
// });
//
// gulp.task('assets', function() {
//   return assets.build(context, gulp, plugins);
// });

// gulp.task('components:html', function() {
//   return builder.buildComponentsHtml(context, gulp, plugins);
// });

// gulp.task('pages', function() {
//     return pages.build(context, gulp, plugins);
// });

// gulp.task('page', function() {
//     return page.build(context, gulp, plugins);
// });

gulp.task('clean', function(done) {
  context.destroy();
  done();
});

gulp.task('clean:cache', function(done) {
  context.cleanCache();
  done();
});

gulp.task('build:data', function () {
  return builder.buildData(context, gulp, plugins);
});

gulp.task('build:articles', function () {
  return builder.buildArticles(context, gulp, plugins);
});

gulp.task('build:components', function () {
  return builder.buildComponents(context, gulp, plugins);
});

gulp.task('build:pages', function () {
  return builder.buildPages(context, gulp, plugins);
});

gulp.task(
  'preview',
   gulp.series(
     'build:data',
     'build:articles',
     'build:components',
     'build:pages'
   )
);

// gulp.task('connect', function() {
//   plugins.connect.server({
//     root: [context.app.previewDir],
//     port: context.preview().port,
//     livereload: false
//   });
// });
//
// gulp.task('deploy:production', function() {
//   return deploy.remote(context, gulp, plugins);
// });

// gulp.task(
//   'publish',
//   gulp.series(
//     'clean:tmp',
//     'deploy:production',
//     'clean:tmp'
//   )
// );
