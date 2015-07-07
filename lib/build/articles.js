var path   = require('path');
var merge  = require('merge-stream');
var fs     = require('fs-extra');
var loader = require('../loader');

var articles = {

  build: function (context, plugins, gulp) {

      // First, we'll retrieve the pages meta from the main configuration
      var pages = context.app.config.pages;

      // The article layout page, if any is available for the current theme
      var articlePage;

      // Let's traverse each locale and we'll search all the pages
      // for that one locale, until we find the article page, if any
      pages.forEach(function(pagedata) {

          if (pagedata.article) {
            // No need to bother, we don't support articles in this theme
            articlePage = pagedata;
          }
      });

      if (!articlePage) {
        // Nothing to do here
        return gulp.src('');
      }

      // Fetch the content meta from the context; this will
      // allow us to traverse all locales
      var locales = context.content();

      // We will build a series of streams and we'll end up
      // merging them together
      var streams = [];

      locales.forEach(function(locale) {

        if (!fs.existsSync(locale.articlesDir)) {
          // This locale has no articles
          return;
        }

        // Look through all subdirectories
        var dirs = fs.readdirSync(locale.articlesDir);

        dirs.forEach(function(dir) {

          // Find the article files
          var articleHtmlFile     = path.join(locale.articlesDir, dir + "/index.html");
          var articleMarkdownFile = path.join(locale.articlesDir, dir + "/index.md");

          if (fs.existsSync(articleHtmlFile)) {
            // This is our first priority, let's work with this

            return;
          }

          if (fs.existsSync(articleMarkdownFile)) {
            // This is our second priority, we can work with this too
            
            return;
          }

          // No article files found, let's move on now
          return;
        });

      });

      if (!streams || streams.length == 0) {
        // Nothing to do here
        return gulp.src('');
      }

      // We've got all the streams now, from all locales
      // so all we have to do is merge them and return one merged stream
      return merge(streams);
  },

  buildPage: function (name, content, pagedata, context, plugins, gulp) {

      // We will build a series of streams and we'll end up
      // merging them together
      var streams = [];

      // Let's traverse all pages and build components imports for each page one by one
      var components = loader.loadComponents(pagedata, context, locale);

      // Build the stylesheet for this page
      var stream = builder.buildPageStyle(context, gulp, plugins, locale, pagedata, components);

      if (stream) {
        // Only allow valid streams
        streams.push(stream);
      }

      // Next, build the content for this page
      stream = builder.buildPageContent(context, gulp, plugins, locale, pagedata, components);

      if (stream) {
        // Only allow valid streams
        streams.push(stream);
      }

      // Finally, build the scripts for this page
      stream = builder.buildPageScripts(context, gulp, plugins, locale, pagedata, components);

      if (stream) {
        // Only allow valid streams
        streams.push(stream);
      }

      // We've got all the streams now, from all locales
      // so all we have to do is merge them and return one merged stream
      return merge(streams);
  }
}

module.exports = articles;
