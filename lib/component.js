var fs        = require('fs-extra');
var path      = require('path');
var utils     = require('./utils');

var component = {

  find: function (component, context) {
    var normalized = this.normalize(component);
    var parts = normalized.split('/');
    var library = parts[0];
    if (library === 'carmel') {
      var componentDir = path.join(context.carmel.componentsDir, parts[1] + "/" + parts[2]);
      if (!fs.existsSync(componentDir)) {
        return;
      }
      return {name: normalized, path: componentDir};
    }
  },

  assets: function (pagedata, componentId) {
    var globalAssets      = pagedata.global.assets;
    var pageAssets        = pagedata.assets;
    var component         = pagedata.components[componentId];
    var compAssets;
    if (component instanceof Object) {
      for (name in component) break;
      compAssets = component[name].assets;
    }

    return utils.merge(globalAssets, pageAssets, compAssets);
  },

  text: function (pagedata, componentId) {
    var globalText        = pagedata.global.text;
    var pageText          = pagedata.text;
    var component         = pagedata.components[componentId];
    var compText;
    if (component instanceof Object) {
      for (name in component) break;
      compText = component[name].text;
    }

    return utils.merge(globalText, pageText, compText);
  },

  settings: function (pagedata, componentId) {
    var globalSettings    = pagedata.global.settings;
    var pageSettings      = pagedata.settings;
    var component         = pagedata.components[componentId];
    var compSettings;

    if (component instanceof Object) {
      for (name in component) break;
      compSettings = component[name].text;
    }

    return utils.merge(globalSettings, pageSettings, compSettings);
  },

  style: function (pagedata, componentId) {
    var globalStyle    = pagedata.global.style;
    var pageStyle      = pagedata.style;
    var component      = pagedata.components[componentId];
    var compStyle;

    if (component instanceof Object) {
      for (name in component) break;
      compStyle = component[name].style;
    }

    return utils.merge(globalStyle, pageStyle, compStyle);
  },

  normalize: function (component) {
    var normalized = component;
    if (component instanceof Object) {
      for (normalized in component) break;
    }

    var parts = normalized.split('/');
    if (parts.length == 1) {
      normalized = 'carmel/' + normalized + "/default";
    }
    else if (parts.length == 2) {
      normalized = normalized + "/default";
    }
    return normalized;
  },

  load: function (pagedata, componentId, context) {
    if (pagedata.components.length == 0 || pagedata.components.length <= componentId){
      return;
    }

    var component = this.find(pagedata.components[componentId], context);
    if (!component) {
      return this.load(pagedata, componentId + 1, context);
    }

    var componentCopy          = JSON.parse(JSON.stringify(component));
    componentCopy['page']      = pagedata.page;
    componentCopy['id']        = componentId;
    componentCopy['text']      = this.text(pagedata, componentId);
    componentCopy['style']     = this.style(pagedata, componentId);
    componentCopy['settings']  = this.settings(pagedata, componentId);
    var assets                 = this.assets(pagedata, componentId);
    var images                 = assets.images;

    if (images) {
      componentCopy['image']  = images;
    }

    return componentCopy;
  },

  compile: function(component, context, plugins, gulp) {
      return gulp.src(component.path + '/component.html')
      .pipe(plugins.replace(/\$carmel\.([^\)]+)\(([^\)]+)\)/g, function(match, func, args){
          if (!component[func] || !component[func][args]){
            return "";
          }

          if (func === 'image') {
            return "/img/" + component[func][args];
          }

          return component[func][args];
       }))
       .pipe(plugins.rename(function (path) {
         path.extname = '.hbs';
       }))
       .pipe(gulp.dest(context.app.tempDir + "/components/" + component.page + "/" + component.name + (component.id == 0 ? '' : component.id+1)));
  }
}

module.exports = component;
