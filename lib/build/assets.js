var path   = require('path');
var merge  = require('merge-stream');

var assets = {
  images: function (context, plugins, gulp) {
      var content = context.content();
      var streams = [];
       content.forEach(function(locale) {
        streams.push(gulp.src(locale.imagesDir + "/**")
              .pipe(gulp.dest(path.join(locale.previewDir, "img"))));
      });
      return merge(streams);
  }
}

module.exports = assets;
