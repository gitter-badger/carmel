
// gulp.task('clean', function(done) {
//   context.destroy();
//   done();
// });
//
// gulp.task('clean:cache', function(done) {
//   context.cleanCache();
//   done();
// });
//
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




module.exports = tasks;
