var gulp       = require('gulp');
var plugins    = require('gulp-load-plugins')();
var assets     = require('./assets');
var context    = require('./context').new();
var builder    = require('./builder');

var buildTasks = builder.build(context, gulp, plugins);

gulp.task('assets', function() {
  return assets.images(context, plugins, gulp);
});

gulp.task('clean', function(done){
  context.destroy();
  done();
});

gulp.task('clean:tmp', function(done){
  context.clean();
  done();
});

gulp.task('connect', function(){
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
    gulp.series(buildTasks),
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
