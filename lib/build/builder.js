var loader            = require('../loader');
var logger            = require('../logger');
var utils             = require('../utils');
var merge             = require('merge-stream');
var path              = require('path');
var fs                = require('fs-extra');
var pngquant          = require('imagemin-pngquant');

var dataBuilder       = require('./data');
var componentBuilder  = require('./component');
var pageBuilder       = require('./page');
var articleBuilder    = require('./article');

var builder = {


    buildAssets: function (context, gulp, plugins) {

      var streams = [];
      var total = 0;

      var locales   = context.content();

      locales.forEach(function(locale) {

        var imagesStream =  gulp.src(locale.assetsDir + "/**/*.{png,jpg,jpeg,gif}")
                                .pipe(plugins.imagemin({
                                            progressive: true,
                                            svgoPlugins: [{removeViewBox: false}],
                                            use: [pngquant()]
                                        }))
                                .pipe(gulp.dest(loader.assetsDistDir(locale)))

        if (imagesStream) {
          streams.push(imagesStream);
          total++;
        }

        var filesStream =  gulp.src(locale.assetsDir + "/**/!(*.{png,jpg,jpeg,gif})")
                                .pipe(gulp.dest(loader.assetsDistDir(locale)))

        if (filesStream) {
          streams.push(filesStream);
          total++;
        }

      });

      if (streams.length == 0) {
        logger.stream("Reusing cached assets", stream, context, gulp, plugins);
      } else {
        stream = merge(streams);
        logger.stream(total + " asset bundle" + (total > 1 ? "s" : ""), stream, context, gulp, plugins);
      }

      return stream;
    },

    buildData: function (context, gulp, plugins) {

      var streams = [];
      var total = 0;

      var locales   = context.content();

      locales.forEach(function(locale) {
        var articlesStream = dataBuilder.build(context, gulp, plugins, locale);

        if (!articlesStream) {
          return;
        }

        streams.push(articlesStream);
        total++;
      });

      if (streams.length == 0) {
        logger.stream("Reusing cached data", stream, context, gulp, plugins);
      } else {
        stream = merge(streams);
        logger.stream(total + " data bundle" + (total > 1 ? "s" : ""), stream, context, gulp, plugins);
      }

      return stream;
  },

  buildComponents: function(context, gulp, plugins) {

    var locales  = context.content();
    var pages    = context.getPages();
    var streams  = [];
    var total    = 0;

    if (context.app.config.content.articles && context.app.config.content.articles.enabled) {
      var articlePagedata   =  {page: loader.articlesCacheDirname(), layout: "default", components: ['article']};
      pages.push(articlePagedata);
    }

    locales.forEach(function(locale) {

      pages.forEach(function(pagedata) {

        var components   = loader.loadComponents(pagedata, context, locale);
        if (!components || components.length <= 0) {
          return;
        }

        // if (context.app.config.content.articles && context.app.config.content.articles.enabled) {
        //   var articlePagedata   =  {page: loader.articlesCacheDirname(), layout: "default", components: ['article']};
        //   var articleComponent  =  loader.loadComponent(articlePagedata, 0, context);
        //   components.push(articleComponent);
        // }

        components.forEach(function(component) {
          var stream = componentBuilder.build(context, gulp, plugins, locale, pagedata, component);
          if (stream) {
            streams.push(stream);
            total++;
          }
        });
      });
    });

    var stream = gulp.src('/');

    if (streams.length == 0) {
      logger.stream("Reusing cached components", stream, context, gulp, plugins);
    } else {
      stream = merge(streams);
      logger.stream(total + " component" + (total > 1 ? "s" : ""), stream, context, gulp, plugins);
    }

    return stream;
  },

  buildPages: function(context, gulp, plugins) {

    var locales  = context.content();
    var pages    = context.getPages();
    var streams  = [];
    var total    = 0;

    locales.forEach(function(locale) {
      pages.forEach(function(pagedata) {

        var stream = pageBuilder.build(context, gulp, plugins, locale, pagedata);

        if (!stream) {
          return;
        }

        streams.push(stream);
        total++;
      });
    });

    var stream = gulp.src('/');

    if (streams.length == 0) {
      logger.stream("Reusing cached pages", stream, context, gulp, plugins);
    } else {
      stream = merge(streams);
      logger.stream(total + " page" + (total > 1 ? "s" : ""), stream, context, gulp, plugins);
    }

    return stream;
  },

  buildArticles: function(context, gulp, plugins) {

    var config = context.app.config.content.articles;
    if (!config || !config.enabled) {
      logger.stream("Articles disabled", stream, context, gulp, plugins);
      return stream;
    }

    var locales   = context.content();
    var total     = 0;
    var streams   = [];
    var stream    = gulp.src('/');

    locales.forEach(function(locale) {
      var articles = loader.loadArticlesData(locale);
      if (!articles) {
        return;
      }

      articles.forEach(function(articleMeta){

        var article = loader.loadArticle(locale, articleMeta.id);
        var stream = articleBuilder.build(context, gulp, plugins, locale, article);

        if (!stream) {
          return;
        }

        streams.push(stream);
        total++;
      });
    });

    if (streams.length == 0) {
      logger.stream("Reusing cached articles", stream, context, gulp, plugins);
    } else {
      stream = merge(streams);
      logger.stream(total + " article" + (total > 1 ? "s" : ""), stream, context, gulp, plugins);
    }

    return stream;
  },

  buildPackages: function (context, gulp, plugins) {
    var locales  =  context.content();
    var streams  =  [];
    var stream   =  gulp.src('/');
    var total    =  0;

    locales.forEach(function(locale) {
      var packageStream = packageBuilder.build(context, gulp, plugins, locale)

      if (!packageStream) {
        return;
      }

      streams.push(packageStream);
      total++;
    });

    if (streams.length == 0) {
      logger.stream("Reusing cached packages", stream, context, gulp, plugins);
    } else {
      stream = merge(streams);
      logger.stream(total + " package" + (total > 1 ? "s" : ""), stream, context, gulp, plugins);
    }

    return stream;
  }

};

module.exports = builder;
