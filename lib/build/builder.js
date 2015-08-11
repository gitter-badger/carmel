var loader            = require('../loader');
var logger            = require('../logger');
var utils             = require('../utils');
var merge             = require('merge-stream');
var path              = require('path');
var fs                = require('fs-extra');
var componentBuilder  = require('./component');
var pageBuilder       = require('./page');
var articleBuilder    = require('./article');
var dataBuilder       = require('./data');

var builder = {

  buildComponents: function(context, gulp, plugins) {

    var locales  = context.content();
    var pages    = context.getPages();
    var streams  = [];
    var total    = 0;

    locales.forEach(function(locale) {
      pages.forEach(function(pagedata) {

        var components   = loader.loadComponents(pagedata, context, locale);
        if (!components || components.length <= 0) {
          return;
        }

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

    locales.forEach(function(locale) {
        var stream = articleBuilder.build(context, gulp, plugins, locale);

        if (!stream) {
          return;
        }

        streams.push(stream);
        total++;
    });

    if (streams.length == 0) {
      logger.stream("Reusing cached articles", stream, context, gulp, plugins);
    } else {
      stream = merge(streams);
      logger.stream(total + " article" + (total > 1 ? "s" : ""), stream, context, gulp, plugins);
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
  }

};

module.exports = builder;
