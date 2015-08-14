var gulp              = require('gulp');
var plugins           = require('gulp-load-plugins')();
var logger            = require('./logger');
var context           = require('./context').new();
var builder           = require('./build/builder');
var packager          = require('./build/packager');

var tasks = {
  clean: function() {
      gulp.task('clean:cache', function(done) {
        logger.info("Cleaning cache");
        context.cleanCache();
        done();
      });

      gulp.task('clean:preview', function(done) {
        logger.info("Cleaning preview site");
        context.cleanPreview();
        done();
      });

      return ['clean:cache', 'clean:preview'];
  },

  build: function() {
    var buildSteps = ['assets', 'data', 'components', 'pages'];

    if (context.app.config.content.articles && context.app.config.content.articles.enabled) {
       buildSteps.push('articles');
    }

    var buildTasks = [];
    buildSteps.forEach(function(task) {
      var taskLowercase = task.toLowerCase();
      var taskFirstUpper = taskLowercase.substring(0,1).toUpperCase() + taskLowercase.substring(1);
      var taskName = 'build:' + taskLowercase;
      buildTasks.push(taskName);
      gulp.task(taskName, function () {
        logger.info("Building " + taskLowercase);
        var stream = builder['build' + taskFirstUpper](context, gulp, plugins);
        stream.on('end', function() { logger.done(("Done building " + task).bold);});
        return stream;
      });
    });

    return buildTasks;
  },

  package: function () {

    var packageSteps = ['assets', 'pages'];
    if (context.app.config.content.articles && context.app.config.content.articles.enabled) {
      packageSteps.push('articles');
    }

    var packageTasks = [];

    packageSteps.forEach(function(task){
      var taskLowercase = task.toLowerCase();
      var taskFirstUpper = taskLowercase.substring(0,1).toUpperCase() + taskLowercase.substring(1);
      var taskName = 'package:' + taskLowercase;
      packageTasks.push(taskName);

      gulp.task(taskName, function () {
        logger.info("Packaging " + taskLowercase);
        var stream = packager['package' + taskFirstUpper](context, gulp, plugins);
        stream.on('end', function() { logger.done(("Done packaging " + task).bold);});
        return stream;
      });

    });
    return packageTasks;
  },

  local: function() {
    gulp.task('local:run', function() {
      plugins.connect.server({
        root: [context.app.previewDir],
        port: context.preview().port,
        livereload: false
      });
    });

    return ['local:run'];
  }
}

gulp.task('clean',   gulp.series(tasks.clean()));
gulp.task('make',    gulp.series(tasks.build()));
gulp.task('package', gulp.series(tasks.package()));
gulp.task('local',   gulp.series(tasks.local()));

gulp.task('build',   gulp.series('make', 'package'));
gulp.task('preview', gulp.series('local'));
