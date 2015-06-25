var loader     = require('../loader');
var merge      = require('merge-stream');
var path       = require('path');

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

        // Let's traverse all pages and build components imports for each page one by one
        var components = loader.loadComponents(pagedata, context, locale);

        // Build the stylesheet for this page
        var stream = builder.buildPageStyle(context, gulp, plugins, locale, pagedata, components);

        if (stream){
          // Only allow valid streams
          streams.push(stream);
        }

        // Next, build the content for this page
        stream = builder.buildPageContent(context, gulp, plugins, locale, pagedata, components);

        if (stream){
          // Only allow valid streams
          streams.push(stream);
        }
      });
    });

    // We've got all the streams now, from all locales
    // so all we have to do is merge them and return one merged stream
    return merge(streams);
  },

  /**
      Builds a stylesheet for a page, starting with a layout and a list
      of dependent components
  **/
  buildPageStyle: function(context, gulp, plugins, locale, pagedata, components) {

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

    return gulp.src(context.carmel.layoutsDir + "/" + pagedata.layout + '/style.sass')
          .pipe(plugins.insert.append(imports))
          .pipe(plugins.sass({
              includePaths: [context.carmel.dependenciesDir + '/bootstrap/assets/stylesheets',
                             locale.tempDir + "/components/" + pagedata.page]
           }))
          .pipe(plugins.autoprefixer())
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
        // pagedata.locale.text = {};
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
       if (context.app.config.links['primary-link']
           && context.app.config.links['primary-link'] === menuItem.link) {
         menuItem['primary-link'] = true;
       }
       if (menuItem.page) {

         var r;
         context.app.config.pages.forEach(function(rPage){
            if (rPage && rPage.root && rPage.page === menuItem.page) {
              r = true;
            }
         });
         menuItem.link = "/" + (locale.default ? "" : locale.id + "/") + (r ? "" : menuItem.page);

         if (menuItem.page === pagedata.page) {
           menuItem['current'] = true;
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
           .pipe(plugins.compileHandlebars(pagedata, options))
           .pipe(plugins.rename(function (path) {
              path.basename = "index";
              path.extname = '.html';
            }))
          //  .pipe(plugins.htmlmin({collapseWhitespace: true}))
           .pipe(gulp.dest(path.join(locale.previewDir, (pagedata.root ? '' : pagedata.page))));
  }

};

module.exports = builder;
