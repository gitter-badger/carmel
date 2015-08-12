var path                  = require('path');
var merge                 = require('merge-stream');
var fs                    = require('fs-extra');
var logger                = require('../logger');
var loader                = require('../loader');
var through               = require('through2');
var utils                 = require('../utils');
var ncp                   = require('ncp').ncp;

var packager = {

  packagePages: function (context, gulp, plugins, locale) {
      var streams     = [];
      var locales     = context.content();
      var pages       = context.getPages();
      var streams     = gulp.src('/');
      var total       = 0;

      locales.forEach(function(locale) {
        var destDir   = path.join(context.app.previewDir, locale.default ? "" : locale.id);
        var srcDir    = locale.cacheDir;

        pages.forEach(function(pagedata) {
          var root    = path.join(srcDir, loader.pagesCacheDirname() + "/" + pagedata.page);
          var dest    = path.join(destDir, pagedata.root ? "" : pagedata.page);
          var stream  = gulp.src([root + "/**/!(*.checksum)"])
                            .pipe(gulp.dest(dest));
          if (stream) {
            streams.push(stream);
            total ++;
          }
        });
      });

      if (streams.length == 0) {
        logger.stream("Reusing cached pages", stream, context, gulp, plugins);
      } else {
        stream = merge(streams);
        logger.stream(total + " page" + (total > 1 ? "s" : ""), stream, context, gulp, plugins);
      }

      return stream;
   },

   packageArticles: function (context, gulp, plugins, locale) {
       var streams     = [];
       var locales     = context.content();
       var streams     = gulp.src('/');
       var total       = 0;

       if (context.app.config.content.articles && context.app.config.content.articles.enabled){
         locales.forEach(function(locale) {
           var destDir = path.join(context.app.previewDir, locale.default ? "" : locale.id);
           var srcDir  = locale.cacheDir;
           var root    = path.join(srcDir, loader.pagesCacheDirname() + "/" + loader.articlesCacheDirname());
           var dest    = path.join(destDir, context.app.config.content.articles.root);
           var stream  = gulp.src([root + "/**/!(*.checksum)"])
                             .pipe(gulp.dest(dest));
           if (stream) {
             streams.push(stream);
             total ++;
           }
         });
       }

       if (streams.length == 0) {
         logger.stream("Reusing cached articles", stream, context, gulp, plugins);
       } else {
         stream = merge(streams);
         logger.stream(total + " article" + (total > 1 ? "s" : ""), stream, context, gulp, plugins);
       }

       return stream;
    }
}

module.exports = packager;
