var path                  = require('path');
var merge                 = require('merge-stream');
var fs                    = require('fs-extra');
var loader                = require('../loader');
var through               = require('through2');
var ncp                   = require('ncp').ncp;
var cache                 = require('./cache');
var coreutils             = require('coreutils');
var logger                = coreutils.logger;

var packager = {

    package:  function (context, gulp, plugins, maker) {
      var streams   = [];
      var locales   = context.content();

      locales.forEach(function(locale) {
        maker(streams, locale);
      });

      if (streams.length == 0) {
        return gulp.src('/');
      }

      return merge(streams);
    },

    packageAssets: function (context, gulp, plugins) {
      return packager.package(context, gulp, plugins, function(streams, locale){
          var destDir = path.join(context.app.previewDir, locale.default ? "" : locale.id);
          var srcDir  = locale.cacheDir;
          var root    = path.join(srcDir, loader.assetsCacheDirname());

          streams.push(gulp.src([root + "/**/!(*.checksum)"])
                           .pipe(through.obj(function(file, enc, cb) {
                             this.push(file);
                             if (context.config().logging.level > 1) {
                               logger.asset("asset", file);
                             }
                             cb();
                           }))
                           .pipe(gulp.dest(destDir)));
      });
    },

    packageData: function (context, gulp, plugins) {
      return packager.package(context, gulp, plugins, function(streams, locale){
          var destDir = path.join(context.app.previewDir, (locale.default ? "" : locale.id) + "/data");
          var srcDir  = locale.cacheDir;
          var root    = path.join(srcDir, loader.dataCacheDirname());

          streams.push(gulp.src([root + "/**/!(*.checksum)"])
                           .pipe(through.obj(function(file, enc, cb) {
                             this.push(file);
                             if (context.config().logging.level > 1) {
                               logger.asset("data", file);
                             }
                             cb();
                           }))
                           .pipe(gulp.dest(destDir)));
      });
    },

    packagePages: function (context, gulp, plugins) {

      var pages  = context.getPages();

      return packager.package(context, gulp, plugins, function(streams, locale) {

        var srcDir    = locale.cacheDir;
        var destDir   = path.join(context.app.previewDir, locale.default ? "" : locale.id);

        pages.forEach(function(pagedata) {

          var root    = path.join(srcDir, loader.pagesCacheDirname() + "/" + pagedata.page);
          var dest    = path.join(destDir, pagedata.root ? "" : pagedata.page);

          streams.push(gulp.src([root + "/**/!(*.checksum)"])
                            .pipe(through.obj(function(file, enc, cb) {
                              this.push(file);
                              if (context.config().logging.level > 1) {
                                logger.asset(pagedata.page, file);
                              }
                              cb();
                            }))
                           .pipe(gulp.dest(dest)));
          });
      });
   },

   packageArticles: function (context, gulp, plugins) {
     return packager.package(context, gulp, plugins, function(streams, locale){
        var destDir = path.join(context.app.previewDir, locale.default ? "" : locale.id);
        var srcDir  = locale.cacheDir;
        var root    = path.join(srcDir, loader.pagesCacheDirname() + "/" + loader.articlesCacheDirname());
        var dest    = path.join(destDir, context.app.config.content.articles.root);
        streams.push(gulp.src([root + "/**/!(*.checksum)"])
                          .pipe(through.obj(function(file, enc, cb) {
                            var stats = fs.lstatSync(file.path);
                            if (stats.isFile()) {
                              var articleSlug = file.path.split("/").slice(-1 * 2)[0];
                              if (context.config().logging.level > 1) {
                                logger.asset(articleSlug, file);
                              }
                            }

                            this.push(file);
                            cb();
                          }))
                         .pipe(gulp.dest(dest)));
     });
  }

}

module.exports = packager;
