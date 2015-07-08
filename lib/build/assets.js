var path   = require('path');
var merge  = require('merge-stream');

var assets = {
  build: function (context, plugins, gulp) {
      var content = context.content();
      var streams = [];
       content.forEach(function(locale) {

        // Images
        streams.push(gulp.src(locale.imagesDir + "/**")
              .pipe(gulp.dest(path.join(locale.previewDir, "img"))));

        // Fonts
        streams.push(gulp.src(context.carmel.modulesDir + "/font-awesome/fonts/**")
              .pipe(gulp.dest(path.join(locale.previewDir, "fonts"))));

        // Raw data
        streams.push(gulp.src(locale.dataDir + "/**")
              .pipe(gulp.dest(path.join(locale.previewDir, "data"))));

      });
      return merge(streams);
  }
}

module.exports = assets;
