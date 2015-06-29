var path   = require('path');
var merge  = require('merge-stream');

var scripts = {
  build: function (context, plugins, gulp) {
      var content = context.content();
      var libs = ["jquery/dist/jquery.min.js", "bootstrap-sass/assets/javascripts/bootstrap.min.js"];
      var absoluteLibs = [];
      libs.forEach(function(lib){
        absoluteLibs.push(path.join(context.carmel.modulesDir, lib));
      });
      var streams = [];
       content.forEach(function(locale) {
        streams.push(
                gulp.src(absoluteLibs)
                .pipe(plugins.concat('scripts.js'))
                .pipe(gulp.dest(path.join(context.app.previewDir, "js")))
               );
      });
      return merge(streams);
  }
}

module.exports = scripts;
