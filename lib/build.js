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

      return ['clean:cache'];
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
        return builder['build' + taskFirstUpper](context, gulp, plugins);
      });
    });

    return buildTasks;
  }
}

gulp.task('clean',   gulp.series(tasks.clean()));
gulp.task('build',   gulp.series(tasks.build()));

gulp.task('preview', gulp.series('build'));
