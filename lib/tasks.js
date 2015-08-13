
// gulp.task('package:assets', function () {
//   return packager.packageAssets(context, gulp, plugins);
// });
//
// gulp.task('package:pages', function () {
//   return packager.packagePages(context, gulp, plugins);
// });
//
// gulp.task('package:articles', function () {
//   return packager.packageArticles(context, gulp, plugins);
// });
//
// gulp.task('connect', function() {
//   plugins.connect.server({
//     root: [context.app.previewDir],
//     port: context.preview().port,
//     livereload: false
//   });
// });


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


var tasks = {

  build: function(gulp, context) {
    var buildSteps = ['assets', 'data'];

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
        return builder['build' + taskFirstUpper](context, gulp, plugins);
      });
    });

    return buildTasks;
  }
}

module.exports = tasks;
