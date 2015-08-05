var path   = require('path');
var merge  = require('merge-stream');

var scripts = {
  build: function (context, gulp, plugins) {
      var libs = ["jquery/dist/jquery.min.js",
                  "bootstrap/dist/js/bootstrap.min.js",
                  "moment/moment.js",
                  "angular/angular.js",
                  "angular-route/angular-route.min.js",
                  "angular-sanitize/angular-sanitize.min.js",
                  "fullcalendar/dist/fullcalendar.min.js",
                  "fullcalendar/dist/gcal.js",
                  "angular-ui-calendar/src/calendar.js"
                ];
      var absoluteLibs = [];
      libs.forEach(function(lib) {
        absoluteLibs.push(path.join(context.carmel.dependenciesDir, lib));
      });
      var streams = [];
      streams.push(
              gulp.src(absoluteLibs)
              .pipe(plugins.concat('scripts.js'))
              .pipe(gulp.dest(path.join(context.app.previewDir, "js")))
             );
      return merge(streams);
  }
}

module.exports = scripts;
