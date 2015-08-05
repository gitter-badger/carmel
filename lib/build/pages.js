var loader     = require('../loader');
var merge      = require('merge-stream');
var path       = require('path');
var browserify = require('browserify');
var source     = require('vinyl-source-stream');
var fs         = require('fs-extra');
var buffer     = require('vinyl-buffer');
var utils      = require('../utils');
var gutil      = require('gulp-util');
var logger     = require('../logger');

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
    var pages = context.getPages();

    locales.forEach(function(locale) {

      // Let's traverse each locale and we'll build all the pages
      // for that one locale, then we'll save the stream which we will
      // merge into all other streams for all other locales
      pages.forEach(function(pagedata) {

          // Build the page
          var stream = builder.buildPage(context, gulp, plugins, locale, pagedata);

          if (!stream) {
            // Only allow valid streams
            return;
          }

          streams.push(stream);
      });

    });

    // We've got all the streams now, from all locales
    // so all we have to do is merge them and return one merged stream
    return merge(streams);
  },

  /**
      Builds a single page
  **/
  buildPage: function(context, gulp, plugins, locale, pagedata) {

    // We will build a series of streams and we'll end up
    // merging them together
    var streams = [];

    // Let's traverse all pages and build components imports for each page one by one
    var components = loader.loadComponents(pagedata, context, locale);

    // Build the stylesheet for this page
    var stream = builder.buildPageStyle(context, gulp, plugins, locale, pagedata, components);

    if (!stream) {
      // Only allow valid streams
      return;
    }

    if (context.config().logging.build.pages) {
      logger.stream("Building Page Style", stream, context, gulp, plugins, locale, pagedata);
    }

    streams.push(stream);

    // Next, build the content for this page
    stream = builder.buildPageContent(context, gulp, plugins, locale, pagedata, components);

    if (!stream) {
      // Only allow valid streams
      return;
    }

    if (context.config().logging.build.pages) {
      logger.stream("Building Page Content", stream, context, gulp, plugins, locale, pagedata);
    }

    streams.push(stream);

    // Finally, build the scripts for this page
    stream = builder.buildPageScripts(context, gulp, plugins, locale, pagedata, components);

    if (!stream) {
      // Only allow valid streams
      return;
    }

    if (context.config().logging.build.pages) {
      logger.stream("Building Page Scripts", stream, context, gulp, plugins, locale, pagedata);
    }

    streams.push(stream);

    // We've got all the streams now, from all locales
    // so all we have to do is merge them and return one merged stream
    return merge(streams);
  },

  /**
      Returns a default style to be used on all themes
  **/
  defaultStyle: function() {
    var fonts = {
      mono: 'source',
      sans: 'open',
      cursive: 'kaushan'
    };

    var colors = {
      menu: 'green-1',
      background: 'green-0',
      button: 'orange-0',
      link: 'blue-1',
      text: 'gray-8',
      container: 'gray-7'
    };

    return { fonts: fonts, colors: colors };
  },

  /**
      Resolve the page's style, starting out with the
      global default style for all themes
  **/
  pageStyle: function(context) {
    var style = builder.defaultStyle();
    var pageStyle = context.app.config.style;

    if (!pageStyle) {
      return style;
    }

    style.fonts = utils.merge([style.fonts, pageStyle.fonts]);
    style.colors = utils.merge([style.colors, pageStyle.colors]);

    return style;
  },

  /**
      Figure out what imports we need to inject in the
      style layout and compile them all here
  **/
  buildPageStyleImports: function(context) {

    var style = builder.pageStyle(context);
    var imports = ""

    for (var font in style.fonts) {
      imports = imports + "@import url(\"//fonts.googleapis.com/css?family=\" + $carmel-include-" + font + "-" + style.fonts[font] + ");\n";
      imports = imports + "$carmel-font-" + font + ": $carmel-" + font + "-" + style.fonts[font] + ";\n";
    };

    for (var color in style.colors) {
      imports = imports + "$carmel-color-" + color + ": $carmel-color-" + style.colors[color] + ";\n";
    }

    return imports;
  },

  /**
      Builds a stylesheet for a page, starting with a layout and a list
      of dependent components
  **/
  buildPageStyle: function(context, gulp, plugins, locale, pagedata, components) {

    var style = builder.buildPageStyleImports(context);

    // These will be appended to the page layout stylesheet
    var imports = "";

    if (components && components.length > 0) {

      components.forEach(function(component){
        // If there's any components, let's get is unique name
        var name = loader.uniqueComponentName(component);

        var args = [];
        if (component.config && component.config.style) {
          component.config.style.forEach(function(variable){
            for(var key in variable);
            if (component.style && component.style[key]){
              args.push(component.style[key]);
            } else {
              args.push(variable[key]);
            }
          });
        }
        args = args.join();

        // Create a list of imports for all required components
        imports = imports + "@import \"" + name + "/style\";\n";
        imports = imports + "." + name.replace(/\//gi, "-") + " {\n   @include " + name.replace(/\//gi, "-")  + "(" + args + ");\n}\n";
      });
    }

    return gulp.src(context.carmel.layoutsDir + "/" + pagedata.layout + '/sass/style.scss')
          .pipe(plugins.replace(/__STYLE__/g, style))
          .pipe(plugins.insert.append(imports))
          .pipe(plugins.autoprefixer())
          .pipe(plugins.sass({
              includePaths: [context.carmel.modulesDir + '/bootstrap-sass/assets/stylesheets',
                             context.carmel.modulesDir + '/compass-mixins/lib',
                             context.carmel.modulesDir + '/font-awesome/scss',
                             locale.tempDir + "/components/" + pagedata.page]
           }))
          // .pipe(plugins.minifyCss())
          .pipe(gulp.dest(path.join(locale.previewDir, (pagedata.root ? '' : pagedata.page))));
  },

  /**
      Builds the content for a page, starting with a layout and a list
      of components
  **/
  buildPageContent: function(context, gulp, plugins, locale, pagedata, components) {

    // This will be inserted into the page layout
    var imports = "";

    if (components && components.length > 0) {

      components.forEach(function(component){
        // If there's any components, let's get is unique name
        var name = loader.uniqueComponentName(component);

        // Compile a list of imports for all required components
        imports = imports + "{{> " + locale.id + "/components/" + pagedata.page + "/" + name + "/component }}\n";
      });
    }

    // Build the options for the page components
    var options   = {
       ignorePartials: true,
       partials : {
       },
      batch : [locale.tempDir + '/../'],
       helpers : {}
    };

    var webUrl = "http://" + context.app.config.settings.production.domain + "/" + (locale.default ? "" : locale.id + "/")

    // Add core settings to the page
    pagedata['rootUrl'] = "/" + (locale.default ? "" : locale.id + "/");
    pagedata['imgUrl'] = "/" + (locale.default ? "" : locale.id + "/") + "img/";

    // Add locale data to page
    var locales = JSON.parse(JSON.stringify(context.app.config.content.locales));
    var newLocales = [];
    var defaultId;

    locales.forEach(function(l) {
      for(var id in l);
      var newL = {id: id, language: l[id]};
      if (!defaultId){
        defaultId = id;
      }
      newL.localizedLink = "/";
      if (id === locale.id) {
        newL.current = true;
        pagedata.locale = locale;
        if (!defaultId && id === defaultId){
          pagedata.locale.default = true;
        }
      } else if (defaultId != id){
        newL.localizedLink = newL.localizedLink + id + "/";
      }

      newL.localizedLink = newL.localizedLink + (pagedata.root ? '' : pagedata.page);
      newLocales.push(newL);
    });
    pagedata.locales = newLocales;
    pagedata = JSON.parse(JSON.stringify(pagedata));

    var menu = JSON.parse(JSON.stringify(context.app.config.menu));
    menu.forEach(function(menuItem) {
       if (menuItem.page) {
         var action;
         var r;
         context.app.config.pages.forEach(function(rPage){
            if (rPage && rPage.root && rPage.page === menuItem.page) {
              r = true;
            }
            if (rPage && rPage.action && rPage.action === 'primary' && rPage.page === menuItem.page) {
              action = rPage.action;
            }
         });
         menuItem.link = "/" + (locale.default ? "" : locale.id + "/") + (r ? "" : menuItem.page);

         if (menuItem.page === pagedata.page) {
           menuItem['current'] = true;
         }
         if (action) {
           menuItem.action = action;
         }
       }

       if (locale && locale.text && locale.text[menuItem.text]) {
         // Resolve menu text
         menuItem.text = locale.text[menuItem.text];
       }
    });

    pagedata.menu = menu;
    pagedata = JSON.parse(JSON.stringify(pagedata));
    return gulp.src(context.carmel.layoutsDir + "/" + pagedata.layout + '/layout.html')
           .pipe(plugins.replace(/__PAGE_CONTENT__/g, imports))
           .pipe(plugins.if(pagedata.page != 'article', plugins.replace(/__PAGE_META_URL/g, webUrl)))
           .pipe(plugins.if(pagedata.page != 'article', plugins.replace(/__PAGE_META_NAME/g, context.app.config.settings.production.domain)))
           .pipe(plugins.if(pagedata.page != 'article', plugins.replace(/__PAGE_META_TITLE/g, context.app.config.settings.production.domain)))
           .pipe(plugins.if(pagedata.page != 'article', plugins.replace(/__PAGE_META_DESCRIPTION/g, "")))
           .pipe(plugins.if(pagedata.page != 'article', plugins.replace(/__PAGE_META_IMAGE/g, webUrl + "img/cover.png")))
           .pipe(plugins.compileHandlebars(pagedata, options))
           .pipe(plugins.rename(function (path) {
              path.basename = "index";
              path.extname = '.html';
            }))
          //  .pipe(plugins.htmlmin({collapseWhitespace: true}))
          .pipe(gulp.dest(path.join(locale.previewDir, (pagedata.root ? '' : pagedata.page))));
  },

  /**
      Builds the scripts for a page, starting with a layout and a list
      of components
  **/
  buildPageScripts: function(context, gulp, plugins, locale, pagedata, components) {
    var starter = path.join(context.carmel.layoutsDir, pagedata.layout + '/scripts.js');
    var newStarter = path.join(locale.tempDir, pagedata.page + "/scripts.js");
    fs.copySync(starter, newStarter);

    var ngArgs = context.config().ngControllerArgs;

    var ngArgsString = [];
    ngArgs.forEach(function(ngArg){
      ngArgsString.push("\"$" + ngArg + "\"");
    });
    ngArgsString = ngArgsString.join(",");

    var imports = "";
    if (components && components.length > 0) {
      components.forEach(function(component) {
        // If there's any components, let's get their unique name
        var name = loader.uniqueComponentName(component);
        var jsFile = path.join(component.path, "scripts.js");
        var tmpFile = path.join(locale.tempDir, "components/" + pagedata.page + "/" + name + "/scripts.js");
        var controllerName = name.replace(/\//gi, '_') + "_controller";

        if (fs.existsSync(jsFile)){
          fs.copySync(jsFile, tmpFile);
          imports = imports  + "var " + controllerName + " = require('components/" + pagedata.page + "/" + name + "/scripts')($, app, '" + (locale.default ? '' : locale.id) + "', " + JSON.stringify(component) + ");\n";
          imports = imports + "app.controller('" + controllerName + "', [" + ngArgsString + " ," + controllerName + "]);\n";
        }
      });
    }

    if (imports) {
      fs.appendFileSync(newStarter, imports);
    }

    var b = browserify({
      entries: newStarter,
      paths: [locale.tempDir, context.carmel.modulesDir],
      insertGlobals: true,
      debug: true
    });

    return b.bundle()
           .pipe(source('scripts.js'))
           .pipe(buffer())
          //  .pipe(plugins.uglify())
           .pipe(gulp.dest(path.join(locale.previewDir, (pagedata.root ? '' : pagedata.page))));
  }

};

module.exports = builder;
