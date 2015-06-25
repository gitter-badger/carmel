var loader     = require('../loader');
var merge      = require('merge-stream');
var path       = require('path');
var fs         = require('fs-extra');

var builder = {

  /**
      Builds all the pages, for all locales and returns a merged
      stream of all activity across all locales and all pages
  **/
  build: function(context, gulp, plugins) {

    // Fetch the content meta from the context; this will
    // allow us to traverse all locales
    var locales = context.content();

    // We will build a series of streams and we'll end up
    // merging them together
    var streams = [];

    // First, we'll retrieve the pages meta from the main configuration
    var pages = context.app.config.pages;

    locales.forEach(function(locale) {

      // Let's traverse each locale and we'll build all the pages
      // for that one locale, then we'll save the stream which we will
      // merge into all other streams for all other locales
      pages.forEach(function(pagedata) {

        // Let's traverse all pages and build components for each page one by one
        var components = loader.loadComponents(pagedata, context, locale);

        if (components && components.length > 0) {

          // Build the components for this page, if there's any available
          var stream = builder.buildPageComponents(context, gulp, plugins, locale, pagedata, components);

          if (stream) {
            // Only build components for valid streams
            streams.push(stream);
          }
        }
      });
    });

    // We've got all the streams now, from all locales
    // so all we have to do is merge them and return one merged stream
    return merge(streams);
  },

  /**
      Builds a page's components and returns a merged stream of all activity
  **/
  buildPageComponents: function(context, gulp, plugins, locale, pagedata, components) {

    // Let's iterate through the page components and build the page tasks
    var streams = [];

    components.forEach(function(component) {

      // Build the next component for the page
      var stream = builder.buildComponentHtml(context, gulp, plugins, locale, pagedata, component);

      if (stream) {
        // Only build html content for valid components
        streams.push(stream);
      }

      // Let's build the style for each component
      stream = builder.buildComponentStyle(context, gulp, plugins, locale, pagedata, component);

      if (stream) {
        // Only build stylesheets for valid components
        streams.push(stream);
      }
    });

    // Merge all the streams and return as one
    return merge(streams);
  },

  /**
      Given a component, build its html content
  **/
  buildComponentHtml: function(context, gulp, plugins, locale, pagedata, component) {
      var distDir = loader.componentDistDir(component, locale);
      return gulp.src(component.path + '/component.html')
      .pipe(plugins.replace(/\$carmel\.([^\)]+)\(([^\)]+)\)/g, function(match, helper, args){
          try {
            if (!helper) {
              return "";
            }

            if (args) {
              // Find the arguments, if any
              args = args.split(/[\s,]+/).join();
              args = args.split(",");
            }

            // Attempt to load the helper module
            var result = require('../helpers/'  + helper)(args, context, gulp, plugins, locale, pagedata, component);

            if (!result) {
              return "";
            }

            return result;
          } catch (err) {
            // Could not find the helper, ignore
          }

          return "";
       }))
       .pipe(plugins.rename(function (path) {
         path.extname = '.hbs';
       }))
       .pipe(plugins.insert.prepend("<div class='" + loader.uniqueComponentName(component).replace(/\//gi, "-") + "'>\n"))
       .pipe(plugins.insert.append("\n</div>"))

       .pipe(gulp.dest(distDir));
  },

  /**
      Given a component, build its stylesheet
  **/
  buildComponentStyle: function(context, gulp, plugins, locale, pagedata, component) {
      var distDir = loader.componentDistDir(component, locale);
      var variables = [];
      if (component.config && component.config.style) {
        component.config.style.forEach(function(variable){
          for(var key in variable);
          variables.push("$" + key + ":" + variable[key]);
        });
      }
      variables = variables.join();

      return gulp.src(component.path + '/style.sass')
          .pipe(plugins.rename(function (path) {
            path.basename = "_" + path.basename;
            path.extname = '.scss';
          }))
          .pipe(plugins.insert.prepend("@mixin " + loader.uniqueComponentName(component).replace(/\//gi, "-") + "("+ variables +"){\n"))
          .pipe(plugins.insert.append("\n}\n"))
         .pipe(gulp.dest(distDir));
  }
};

module.exports = builder;
