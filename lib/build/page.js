var loader            = require('../loader');
var merge             = require('merge-stream');
var path              = require('path');
var cache             = require('./cache');
var browserify        = require('browserify');
var source            = require('vinyl-source-stream');
var fs                = require('fs-extra');
var buffer            = require('vinyl-buffer');
var gutil             = require('gulp-util');
var componentBuilder  = require('./component');
var debowerify        = require('debowerify');
var coreutils         = require('coreutils');
var logger            = coreutils.logger;
var builder = {

  defaultPageStyle: function() {
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
      Builds the content for a page, starting with a layout and a list
      of components
  **/
  buildHtml: function(context, gulp, plugins, locale, pagedata, htmlImports, onError) {

    var distDir = loader.pageDistDir(pagedata, locale);

    // Build the options for the page components
    var options   = {
       ignorePartials: true,
       partials : {
       },
       batch : [locale.cacheDir],
       helpers : {}
    };

    var webUrl = context.site().url + "/" + (locale.default ? "" : locale.id + "/")

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

    pagedata.site = JSON.parse(JSON.stringify(context.site()));
    pagedata.site.cover = webUrl + "img/cover.png";

    var cachePage = JSON.parse(JSON.stringify(pagedata));

    if (pagedata.article) {
      pagedata.site.title       = pagedata.article.title;
      pagedata.site.description = pagedata.article.summary;
      pagedata.site.cover       = webUrl + "img/article-cover-" + pagedata.article.id + ".png";
      pagedata.site.url         = webUrl + context.app.config.content.articles.root + "/" + pagedata.article.slug;
    }

    return cache.src(context.carmel.layoutsDir + "/" + pagedata.layout + '/layout.html', gulp, context, plugins, locale, cachePage)
           .pipe(plugins.plumber({errorHandler: onError}))
           .pipe(plugins.replace(/__PAGE_CONTENT__/g, htmlImports))
           .pipe(plugins.compileHandlebars(pagedata, options))
           .pipe(plugins.rename(function (path) {
              path.basename = "index";
              path.extname = '.html';
            }))
          //  .pipe(plugins.htmlmin({collapseWhitespace: true}))
          .pipe(gulp.dest(distDir));
  },

  /**
      Builds a stylesheet for a page, starting with a layout and a list
      of dependent components
  **/
  buildStyle: function(context, gulp, plugins, locale, pagedata, styleImports, onError) {

    var distDir = loader.pageDistDir(pagedata, locale);

    var style = builder.defaultPageStyle();
    var pageStyle = context.app.config.style;

    if (pageStyle) {
      style.fonts = coreutils.merge([style.fonts, pageStyle.fonts]);
      style.colors = coreutils.merge([style.colors, pageStyle.colors]);
    }

    var defaults = "";

    for (var font in style.fonts) {
      defaults = defaults + "@import url(\"//fonts.googleapis.com/css?family=\" + $carmel-include-" + font + "-" + style.fonts[font] + ");\n";
      defaults = defaults + "$carmel-font-" + font + ": $carmel-" + font + "-" + style.fonts[font] + ";\n";
    };

    for (var color in style.colors) {
      defaults = defaults + "$carmel-color-" + color + ": $carmel-color-" + style.colors[color] + ";\n";
    }

    var cachePage = JSON.parse(JSON.stringify(pagedata));
    cachePage.extra = {style: defaults};

    return cache.src(context.carmel.layoutsDir + "/" + pagedata.layout + '/style.sass', gulp, context, plugins, locale, cachePage)
          .pipe(plugins.plumber({errorHandler: onError}))
          .pipe(plugins.replace(/__STYLE__/g, defaults))
          .pipe(plugins.insert.append(styleImports))
          .pipe(plugins.autoprefixer())
          .pipe(plugins.sass({
              includePaths: [context.carmel.dependenciesDir,
                             context.carmel.sassDir,
                             loader.pageComponentsDistDir(pagedata, locale)]
          }))
          // .pipe(plugins.minifyCss())
          .pipe(gulp.dest(distDir));
  },

  /**
      Builds the scripts for a page, starting with a layout and a list
      of components
  **/
  buildScripts: function(context, gulp, plugins, locale, pagedata, imports, onError) {

    var distDir = loader.pageDistDir(pagedata, locale);

    var starter = path.join(context.carmel.layoutsDir, pagedata.layout + '/scripts.js');
    var newStarter = path.join(locale.cacheDir, loader.pagesCacheDirname() + "/" + pagedata.page + "/scripts.js");
    fs.copySync(starter, newStarter);

    if (imports) {
      fs.appendFileSync(newStarter, imports);
    }

    var b = browserify({
      entries: newStarter,
      paths: [context.carmel.dependenciesDir, locale.cacheDir],
      insertGlobals: true,
      debug: true
    });
    // b.transform(debowerify);

    return b.bundle()
           .pipe(plugins.plumber({errorHandler: onError}))
           .pipe(source('scripts.js'))
           .pipe(buffer())
          //  .pipe(plugins.uglify())
          .pipe(gulp.dest(distDir));
  }

};

module.exports = builder;
