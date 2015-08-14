var loader            = require('../loader');
var logger            = require('../logger');
var utils             = require('../utils');
var merge             = require('merge-stream');
var path              = require('path');
var fs                = require('fs-extra');
var pngquant          = require('imagemin-pngquant');
var cache             = require('./cache');
var through           = require('through2');
var colors            = require ('colors');
var dataBuilder       = require('./data');
var componentBuilder  = require('./component');
var pageBuilder       = require('./page');
var articleBuilder    = require('./article');

var builder = {

    build:  function (context, gulp, plugins, maker) {
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

    buildAssets: function (context, gulp, plugins) {

      return builder.build(context, gulp, plugins, function(streams, locale){
          // Font-Awesome
          streams.push(cache.src(context.carmel.dependenciesDir + "/font-awesome/fonts/**", gulp, context, plugins, locale)
                            .pipe(gulp.dest(loader.assetsDistDir(locale) + '/fonts/font-awesome')));

          // Bootstrap Fonts
          streams.push(cache.src(context.carmel.dependenciesDir + "/bootstrap/fonts/**", gulp, context, plugins, locale)
                            .pipe(gulp.dest(loader.assetsDistDir(locale) + '/fonts/bootstrap')));

          // Images
          streams.push(cache.src(locale.assetsDir + "/**/*.{png,jpg,jpeg,gif}", gulp, context, plugins, locale)
                            .pipe(plugins.imagemin({
                                        progressive: true,
                                        svgoPlugins: [{removeViewBox: false}],
                                        use: [pngquant()]
                                  }))
                            .pipe(gulp.dest(loader.assetsDistDir(locale))));

          // All other assets
          streams.push(cache.src(locale.assetsDir + "/**/!(*.png|*.jpg|*.jpeg|*.gif)", gulp, context, plugins, locale)
                            .pipe(gulp.dest(loader.assetsDistDir(locale))));
        });
    },

    buildData: function (context, gulp, plugins) {
        return builder.build(context, gulp, plugins, function(streams, locale) {
          streams.push(dataBuilder.buildArticles(context, gulp, plugins, locale));
        });
    },

    buildComponents: function(context, gulp, plugins) {

      var pages  = context.getPages();

      if (context.app.config.content.articles && context.app.config.content.articles.enabled) {
        var articlePagedata   =  {page: loader.articlesCacheDirname(),
          layout: context.app.config.content.articles.layout ? context.app.config.content.articles.layout : "default",
          components: context.app.config.content.articles.components ? context.app.config.content.articles.components : ['navbar', 'article', 'footer'],
        };
        pages.push(articlePagedata);
      }

      return builder.build(context, gulp, plugins, function(streams, locale) {
        pages.forEach(function(pagedata) {

          var components   = loader.loadComponents(pagedata, context, locale);
          if (!components || components.length <= 0) {
            return;
          }

          components.forEach(function(component) {
            streams.push(componentBuilder.buildHtml(context, gulp, plugins, locale, pagedata, component));
            streams.push(componentBuilder.buildStyle(context, gulp, plugins, locale, pagedata, component));
            streams.push(componentBuilder.buildScripts(context, gulp, plugins, locale, pagedata, component));
           });
        });
      });

    },

    buildArticles: function(context, gulp, plugins) {
      return builder.build(context, gulp, plugins, function(streams, locale) {
        var articles = loader.loadArticlesData(locale);
        if (!articles) {
          return;
        }

        var pages = [];
        articles.forEach(function(articleMeta) {
          var article   = loader.loadArticle(locale, articleMeta.id);
          var pagedata  = {page: loader.articlesCacheDirname() + "/" + article.slug,
                           layout: context.app.config.content.articles.layout ? context.app.config.content.articles.layout : "default",
                           components: context.app.config.content.articles.components ? context.app.config.content.articles.components : ['navbar', 'article', 'footer'],
                           article: article};
          pages.push(pagedata);
        });

        pages.forEach(function(pagedata) {
           builder.pageBuilder(context, gulp, plugins, locale, pagedata, streams);
        });
      });
    },

    buildPages: function(context, gulp, plugins) {
      var pages  = context.getPages();
      return builder.build(context, gulp, plugins, function(streams, locale) {
        pages.forEach(function(pagedata) {
            builder.pageBuilder(context, gulp, plugins, locale, pagedata, streams);
        });
      });
    },

    pageBuilder: function(context, gulp, plugins, locale, pagedata, streams) {
        var components   = loader.loadComponents(pagedata, context, locale);
        if (!components || components.length <= 0) {
          return;
        }

        var styleImports    = "";
        var htmlImports     = "";
        var scriptsImports  = "";

        components.forEach(function(component) {
          styleImports   += componentBuilder.buildStyleImports(component);
          htmlImports    += componentBuilder.buildHtmlImports(component, locale, pagedata);
          scriptsImports += componentBuilder.buildScriptsImports(context, component, locale, pagedata);
        });

        if (!styleImports || !htmlImports || !scriptsImports) {
          return;
        }

        pagedata.componentsData = components;
        streams.push(pageBuilder.buildHtml(context, gulp, plugins, locale, pagedata, htmlImports));
        streams.push(pageBuilder.buildStyle(context, gulp, plugins, locale, pagedata, styleImports));
        streams.push(pageBuilder.buildScripts(context, gulp, plugins, locale, pagedata, scriptsImports));
    }

};

module.exports = builder;
