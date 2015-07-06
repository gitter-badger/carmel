var path   = require('path');
var merge  = require('merge-stream');

var assets = {
  images: function (context, plugins, gulp) {
      var content = context.content();
      var streams = [];
       content.forEach(function(locale) {
        streams.push(gulp.src(locale.imagesDir + "/**")
              .pipe(gulp.dest(path.join(locale.previewDir, "img"))));
        streams.push(gulp.src(context.carmel.modulesDir + "/font-awesome/fonts/**")
              .pipe(gulp.dest(path.join(locale.previewDir, "fonts"))));
      });
      return merge(streams);
  }
}

module.exports = assets;
