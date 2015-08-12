var loader            = require('../loader');
var merge             = require('merge-stream');
var path              = require('path');
var cache             = require('./cache');
var browserify        = require('browserify');
var source            = require('vinyl-source-stream');
var fs                = require('fs-extra');
var buffer            = require('vinyl-buffer');
var utils             = require('../utils');
var gutil             = require('gulp-util');
var logger            = require('../logger');
var componentBuilder  = require('./component');

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

  checksum: function (type, locale, context, pagedata, imports) {

    var clearText = "";

    if (type === 'html') {
      clearText += fs.readFileSync(path.join(context.carmel.layoutsDir, pagedata.layout + '/layout.html'), 'base64');
    } else if (type === 'style') {
      clearText += fs.readFileSync(path.join(context.carmel.layoutsDir, pagedata.layout + '/sass/style.scss'), 'base64');
    } else if (type === 'scripts') {
      clearText += fs.readFileSync(path.join(context.carmel.layoutsDir, pagedata.layout + '/scripts.js'), 'base64');
    }

    clearText += imports;

    return cache.encrypter().update(clearText).digest('hex');
  },

  build: function(context, gulp, plugins, locale, pagedata) {
      var styleImports    = "";
      var htmlImports     = "";
      var scriptsImports  = "";
      var streams         = [];

      var components   = loader.loadComponents(pagedata, context, locale);
      if (!components || components.length <= 0) {
        return;
      }

      components.forEach(function(component) {
        styleImports   += componentBuilder.buildStyleImports(component);
        htmlImports    += componentBuilder.buildHtmlImports(component, locale, pagedata);
        scriptsImports += componentBuilder.buildScriptsImports(context, component, locale, pagedata);
      });

      if (!styleImports || !htmlImports || !scriptsImports) {
        return;
      }

      var htmlStream = builder.buildHtml(context, gulp, plugins, locale, pagedata, htmlImports);
      if (!htmlStream) {
        return;
      }
      streams.push(htmlStream);

      var styleStream = builder.buildStyle(context, gulp, plugins, locale, pagedata, styleImports);
      if (!styleStream) {
        return;
      }
      streams.push(styleStream);

      var scriptsStream = builder.buildScripts(context, gulp, plugins, locale, pagedata, scriptsImports);
      if (!scriptsStream) {
        return;
      }
      streams.push(scriptsStream);

      if (streams.length == 0) {
        return;
      }

      return merge(streams);
  },

  /**
      Builds the content for a page, starting with a layout and a list
      of components
  **/
  buildHtml: function(context, gulp, plugins, locale, pagedata, htmlImports) {

    var distDir = loader.pageDistDir(pagedata, locale);
    var checksum = builder.checksum("html", locale, context, pagedata, htmlImports);

    if (!cache.isDirty(checksum, distDir, "html")) {
      return;
    }

    // Build the options for the page components
    var options   = {
       ignorePartials: true,
       partials : {
       },
       batch : [locale.cacheDir],
       helpers : {}
    };

    var webUrl = "http://" + context.app.config.settings.publish.domain + "/" + (locale.default ? "" : locale.id + "/")

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
           .pipe(plugins.replace(/__PAGE_CONTENT__/g, htmlImports))
           .pipe(plugins.if(pagedata.page != 'article', plugins.replace(/__PAGE_META_URL/g, webUrl)))
           .pipe(plugins.if(pagedata.page != 'article', plugins.replace(/__PAGE_META_NAME/g, context.app.config.settings.publish.domain)))
           .pipe(plugins.if(pagedata.page != 'article', plugins.replace(/__PAGE_META_TITLE/g, context.app.config.settings.publish.domain)))
           .pipe(plugins.if(pagedata.page != 'article', plugins.replace(/__PAGE_META_DESCRIPTION/g, "")))
           .pipe(plugins.if(pagedata.page != 'article', plugins.replace(/__PAGE_META_IMAGE/g, webUrl + "img/cover.png")))
           .pipe(plugins.if(pagedata.articleId, plugins.replace(/__ARTICLE_ID__/g, pagedata.articleId)))
           .pipe(plugins.compileHandlebars(pagedata, options))
           .pipe(plugins.rename(function (path) {
              path.basename = "index";
              path.extname = '.html';
            }))
          //  .pipe(plugins.htmlmin({collapseWhitespace: true}))
          .pipe(cache.generateChecksumFile (checksum, distDir, "html"))
          .pipe(gulp.dest(distDir));
  },

  /**
      Builds a stylesheet for a page, starting with a layout and a list
      of dependent components
  **/
  buildStyle: function(context, gulp, plugins, locale, pagedata, styleImports) {

    var distDir = loader.pageDistDir(pagedata, locale);

    var style = builder.defaultPageStyle();
    var pageStyle = context.app.config.style;

    if (pageStyle) {
      style.fonts = utils.merge([style.fonts, pageStyle.fonts]);
      style.colors = utils.merge([style.colors, pageStyle.colors]);
    }

    var defaults = "";

    for (var font in style.fonts) {
      defaults = defaults + "@import url(\"//fonts.googleapis.com/css?family=\" + $carmel-include-" + font + "-" + style.fonts[font] + ");\n";
      defaults = defaults + "$carmel-font-" + font + ": $carmel-" + font + "-" + style.fonts[font] + ";\n";
    };

    for (var color in style.colors) {
      defaults = defaults + "$carmel-color-" + color + ": $carmel-color-" + style.colors[color] + ";\n";
    }

    var checksum = builder.checksum("style", locale, context, pagedata, styleImports + defaults);

    if (!cache.isDirty(checksum, distDir, "style")) {
      return;
    }

    return gulp.src(context.carmel.layoutsDir + "/" + pagedata.layout + '/sass/style.scss')
          .pipe(plugins.replace(/__STYLE__/g, defaults))
          .pipe(plugins.insert.append(styleImports))
          .pipe(plugins.autoprefixer())
          .pipe(plugins.sass({
              includePaths: [context.carmel.dependenciesDir + '/bootstrap-sass/assets/stylesheets',
                             context.carmel.dependenciesDir + '/compass-mixins/lib',
                             context.carmel.dependenciesDir + '/font-awesome/scss',
                             loader.pageComponentsDistDir(pagedata, locale)]
          }))
          // .pipe(plugins.addSrc(context.carmel.dependenciesDir + '/fullcalendar/dist/fullcalendar.css'))
          // .pipe(plugins.concat('style.css'))
          // .pipe(plugins.minifyCss())
          .pipe(cache.generateChecksumFile (checksum, distDir, "style"))
          .pipe(gulp.dest(distDir));
  },

  /**
      Builds the scripts for a page, starting with a layout and a list
      of components
  **/
  buildScripts: function(context, gulp, plugins, locale, pagedata, imports) {

    var distDir = loader.pageDistDir(pagedata, locale);
    var checksum = builder.checksum("scripts", locale, context, pagedata, imports);

    if (!cache.isDirty(checksum, distDir, "scripts")) {
      return;
    }

    var starter = path.join(context.carmel.layoutsDir, pagedata.layout + '/scripts.js');
    var newStarter = path.join(locale.cacheDir, loader.pagesCacheDirname() + "/" + pagedata.page + "/scripts.js");
    fs.copySync(starter, newStarter);

    if (imports) {
      fs.appendFileSync(newStarter, imports);
    }

    var b = browserify({
      entries: newStarter,
      paths: [locale.cacheDir, context.carmel.modulesDir, context.carmel.dependenciesDir],
      insertGlobals: true,
      debug: true
    });

    return b.bundle()
           .pipe(source('scripts.js'))
           .pipe(buffer())
          //  .pipe(plugins.uglify())
          .pipe(cache.generateChecksumFile (checksum, distDir, "scripts"))
          .pipe(gulp.dest(distDir));
  }

};

module.exports = builder;
