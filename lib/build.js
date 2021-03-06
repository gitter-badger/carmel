var gulp              = require('gulp');
var plugins           = require('gulp-load-plugins')();
var coreutils         = require('coreutils');
var logger            = coreutils.logger;
var context           = require('./context').new();
var builder           = require('./build/builder');
var packager          = require('./build/packager');
var syncer            = require('./build/syncer');
var deploy            = require('./build/deploy');

var through           = require('through2');
var path              = require('path');
var merge             = require('merge-stream');
var fs                = require('fs-extra');

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

  sync: function() {

    var syncTasks = [];

    var syncSteps = ['components'];
    syncSteps.forEach(function(task) {
      var taskLowercase = task.toLowerCase();
      var taskFirstUpper = taskLowercase.substring(0,1).toUpperCase() + taskLowercase.substring(1);
      var taskName = 'sync:' + taskLowercase;
      syncTasks.push(taskName);
      gulp.task(taskName, function (done) {
        logger.info("Syncing " + taskLowercase);
        syncer['sync' + taskFirstUpper](context, gulp, plugins, function(error) {
          if (error) {
            logger.error (error);
            process.exit(1);
          }
          logger.done("done syncing");
          done();
        });
      });
    });

    return syncTasks;
  },

  build: function() {

    var buildTasks = [];
    var buildSteps = ['assets', 'data', 'components', 'pages'];

    if (context.app.config.content.articles && context.app.config.content.articles.enabled) {
       buildSteps.push('articles');
    }

    buildSteps.forEach(function(task) {
      var taskLowercase = task.toLowerCase();
      var taskFirstUpper = taskLowercase.substring(0,1).toUpperCase() + taskLowercase.substring(1);
      var taskName = 'build:' + taskLowercase;
      buildTasks.push(taskName);
      gulp.task(taskName, function () {
        logger.info("Building " + taskLowercase);
        var stream = builder['build' + taskFirstUpper](context, gulp, plugins);
        stream.on('end', function() { logger.done("building"); });
        stream.on('error', function(err) { logger.error(err);});
        return stream;
      });
    });

    var packageSteps = ['assets', 'data', 'pages'];
    if (context.app.config.content.articles && context.app.config.content.articles.enabled) {
      packageSteps.push('articles');
    }
    packageSteps.forEach(function(task){
      var taskLowercase = task.toLowerCase();
      var taskFirstUpper = taskLowercase.substring(0,1).toUpperCase() + taskLowercase.substring(1);
      var taskName = 'package:' + taskLowercase;
      buildTasks.push(taskName);

      gulp.task(taskName, function () {
        logger.info("Packaging " + taskLowercase);
        var stream = packager['package' + taskFirstUpper](context, gulp, plugins);
        stream.on('end', function() { logger.done("packaging"); });
        stream.on('error', function(err) { logger.error(err);});
        return stream;
      });

    });

    return buildTasks;
  },

  preview: function() {
    gulp.task('preview:run', function() {
      plugins.connect.server({
        root: [context.app.previewDir],
        port: context.preview().port,
        livereload: false
      });
    });

    return ['preview:run'];
  },

  publish: function () {
    gulp.task('publish:production', function() {
      return deploy.remote(context, gulp, plugins);
    });

    return ['publish:production'];
  }
}

gulp.task('sync',    gulp.series(tasks.sync()));
gulp.task('clean',   gulp.series(tasks.clean()));
gulp.task('build',   gulp.series('sync', tasks.build()));
gulp.task('preview', gulp.series(tasks.preview()));
gulp.task('publish', gulp.series(tasks.publish()));
