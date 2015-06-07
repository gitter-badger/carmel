var assets = {
  images: function (context, plugins, gulp) {
      return gulp.src(context.app.imagesDir + "/**")
            .pipe(gulp.dest(context.app.previewDir + '/img'));
  }
}

module.exports = assets;
