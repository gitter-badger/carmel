var loader     = require('../loader');
var logger     = require('../logger');
var cache      = require('./cache');
var merge      = require('merge-stream');
var path       = require('path');
var fs         = require('fs-extra');

var builder = {

  /**
      Given a component, build its html content
  **/
  buildHtml: function(context, gulp, plugins, locale, pagedata, component) {

      var distDir = loader.componentDistDir(component, locale);
      return cache.src(component.path + '/component.html', gulp, context, plugins, locale, pagedata, component)
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
              if (component.variables && component.variables[helper]) {
                  // This could be a variable
                  return component.variables[helper];
              }

              return "";
            }

            return result;
          } catch (err) {
            // Could not find the helper, ignore
          }

          return "";
       }))
       .pipe(plugins.replace(/\$carmel\.([a-z0-9A-Z)]+)/g, function(match, helper, args){
           try {
             if (!helper) {
               return "";
             }

             if (component.variables && component.variables[helper]) {
                 // This could be a variable
                 return component.variables[helper];
             }

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
       .pipe(gulp.dest(distDir));
  },

  /**
      Given a component, build its stylesheet
  **/
  buildStyle: function(context, gulp, plugins, locale, pagedata, component) {

    var distDir = loader.componentDistDir(component, locale);

    var variables = [];
    if (component.config && component.config.style) {
      component.config.style.forEach(function(variable){
        for(var key in variable);
        variables.push("$" + key + ":" + variable[key]);
      });
    }
    variables = variables.join();

    return cache.src(component.path + '/style.sass', gulp, context, plugins, locale, pagedata, component)
                .pipe(plugins.rename(function (path) {
                  path.basename = "_" + path.basename;
                  path.extname = '.scss';
                }))
                .pipe(plugins.insert.prepend("@mixin " + loader.uniqueComponentName(component).replace(/\//gi, "-") + "("+ variables +"){\n"))
                .pipe(plugins.insert.append("\n}\n"))
               .pipe(gulp.dest(distDir));
  },

  /**
      Build the scripts for this component
  **/
  buildScripts: function(context, gulp, plugins, locale, pagedata, component) {

    var distDir = loader.componentDistDir(component, locale);

    return cache.src(component.path + '/scripts.js', gulp, context, plugins, locale, pagedata, component)
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

    var subpages = pagedata.page.split("/");
    var page = subpages[0];

    var imports =  "var " + controllerName + " = require('" + loader.componentsCacheDirname() + "/" + page + "/" + name + "/scripts')($, app, '" + (locale.default ? '' : locale.id) + "', " + JSON.stringify(component) + ");\n";
    return imports + "app.controller('" + controllerName + "', [" + ngArgsString + " ," + controllerName + "]);\n";
  },

  buildHtmlImports: function(component, locale, pagedata) {
    var subpages = pagedata.page.split("/");
    var page = subpages[0];

    var name = loader.uniqueComponentName(component);
    return "{{> " + loader.componentsCacheDirname() + "/" + page + "/" + name + "/component }}\n";
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
