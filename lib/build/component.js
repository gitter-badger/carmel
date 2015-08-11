var loader     = require('../loader');
var logger     = require('../logger');
var cache      = require('./cache');
var merge      = require('merge-stream');
var path       = require('path');
var fs         = require('fs-extra');

var builder = {

  checksum: function (type, locale, component) {

    var clearText = "";

    if (type === 'html') {
      // Start with the component html file
      clearText += fs.readFileSync(path.join(component.path, 'component.html'), 'base64');

      if (component.text) {
        // Look for text strings
        for (string in component.text) {
          var stringValue = component.text[string];
          if (locale.text[stringValue]) {
            stringValue = locale.text[stringValue];
          }
          clearText += string + stringValue;
        }
      }
    } else if (type === 'style') {

      // Look for the style file
      clearText += fs.readFileSync(path.join(component.path, 'style.sass'), 'base64');

      if (component.config && component.config.style){
        clearText += JSON.stringify(component.config.style);
      }
    } else if (type === 'scripts') {

      // Look for the scripts file
      clearText += fs.readFileSync(path.join(component.path, 'scripts.js'), 'base64');
    }

    return cache.encrypter().update(clearText).digest('hex');
  },

  /**
      Build all the component required assets
  **/
  build:  function(context, gulp, plugins, locale, pagedata, component) {
    var streams = [];

    var htmlStream = builder.buildHtml(context, gulp, plugins, locale, pagedata, component);
    if (!htmlStream) {
      return;
    }
    streams.push(htmlStream);

    var styleStream = builder.buildStyle(context, gulp, plugins, locale, pagedata, component);
    if (!styleStream) {
      return;
    }
    streams.push(styleStream);

    var scriptsStream = builder.buildScripts(context, gulp, plugins, locale, pagedata, component);
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
      Given a component, build its html content
  **/
  buildHtml: function(context, gulp, plugins, locale, pagedata, component) {

      var distDir = loader.componentDistDir(component, locale);
      var checksum = builder.checksum("html", locale, component);

      if (!cache.isDirty(checksum, distDir, "html")) {
        return;
      }

      return gulp.src(component.path + '/component.html')
      .pipe(plugins.replace(/\$carmel\.([^\)]+)\(([^\)]*)\)/g, function(match, helper, args){
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
       .pipe(plugins.insert.prepend(
         "<div class='" + loader.uniqueComponentName(component).replace(/\//gi, "-") + "'" +
          (component.hasScripts ? " ng-controller='" + loader.uniqueComponentName(component).replace(/\//gi, "_") + "_controller'" : "") +
         ">\n"))
       .pipe(plugins.insert.append("\n</div>"))
       .pipe(cache.generateChecksumFile (checksum, distDir, "html"))
       .pipe(gulp.dest(distDir));
  },

  /**
      Given a component, build its stylesheet
  **/
  buildStyle: function(context, gulp, plugins, locale, pagedata, component) {

    var distDir = loader.componentDistDir(component, locale);
    var checksum = builder.checksum("style", locale, component);

    if (!cache.isDirty(checksum, distDir, "style")) {
      return;
    }

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
        .pipe(cache.generateChecksumFile (checksum, distDir, "style"))
       .pipe(gulp.dest(distDir));
  },

  /**
      Build the scripts for this component
  **/
  buildScripts: function(context, gulp, plugins, locale, pagedata, component) {

    var distDir = loader.componentDistDir(component, locale);
    var checksum = builder.checksum("scripts", locale, component);

    if (!cache.isDirty(checksum, distDir, "scripts")) {
      return;
    }

    return gulp.src(component.path + '/scripts.js')
    .pipe(cache.generateChecksumFile (checksum, distDir, "scripts"))
                 .pipe(gulp.dest(distDir));
  },

  buildScriptsImports: function(context, component, locale, pagedata) {
    var name = loader.uniqueComponentName(component);
    var controllerName = name.replace(/\//gi, '_') + "_controller";

    var ngArgs = context.config().ngControllerArgs;
    var ngArgsString = [];
    ngArgs.forEach(function(ngArg){
      ngArgsString.push("\"$" + ngArg + "\"");
    });
    ngArgsString = ngArgsString.join(",");

    var imports =  "var " + controllerName + " = require('" + loader.componentsCacheDirname() + "/" + pagedata.page + "/" + name + "/scripts')($, app, '" + (locale.default ? '' : locale.id) + "', " + JSON.stringify(component) + ");\n";
    return imports + "app.controller('" + controllerName + "', [" + ngArgsString + " ," + controllerName + "]);\n";
  },

  buildHtmlImports: function(component, locale, pagedata) {
    var name = loader.uniqueComponentName(component);
    return "{{> " + locale.id + "/" + loader.componentsCacheDirname() + "/" + pagedata.page + "/" + name + "/component }}\n";
  },

  buildStyleImports: function(component) {
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
    var imports = "@import \"" + name + "/style\";\n";
    imports = imports + "." + name.replace(/\//gi, "-") + " {\n   @include " + name.replace(/\//gi, "-")  + "(" + args + ");\n}\n";

    return imports;
  }
};

module.exports = builder;
