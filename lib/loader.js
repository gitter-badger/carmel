var fs        = require('fs-extra');
var path      = require('path');
var utils     = require('./utils');
var yaml      = require('js-yaml');

var loader = {

  loadComponents: function (pagedata, context, locale) {

    // Let's find the page components first
    var components = loader.loadComponentsMeta(pagedata, context, locale);
    if (components.length == 0) {
      return;
    }

    // We want to keep an archive of components we iterate through so we
    // can elegantly handle the case where we have multiple copies of the
    // the same component
    var archive = [];

    components.forEach(function(component) {

      // Let's keep track here of previous components with the same name
      var occurenceHits = 0;

      archive.forEach(function(prevComponent){
        // We're going to check previous components we've already
        // iterated through and if we find one with the same name
        // we're going to keep track of how many copies we found
        if (prevComponent.name === component.name) {
          occurenceHits++;
        }
      });

      // We're going to store how many occurences of this component we found
      component['occurence'] = occurenceHits + 1;

      // Let's keep track of this component so we can track the occurences
      archive.push(component);
    });

    return components;
  },

  /**
      Load all meta data related to all components
  **/
  loadComponentsMeta: function (pagedata, context, locale) {
    // Keep track of all components we find
    var valid = [];
    var max = pagedata.components.length;
    for (var id = 0; id < max; id++) {
      var component = loader.loadComponent(pagedata, id, context, locale);
      if (component) {
        // Ignore components we can't load
        valid.push(component);
      }
    }

    return valid;
  },

  /**
      Load a single component and all of its data
  **/
  loadComponent: function (pagedata, componentId, context, locale) {

    if (pagedata.components.length == 0 || pagedata.components.length <= componentId){
      // Ignore pages without components or stop if the required component id is
      // out of the range expected by this page
      return;
    }

    // Look for the component and check if it's available
    var component = loader.findComponent(pagedata, componentId, context);

    if (!component) {
      // Looks like we couldn't find this component
      return;
    }

    // Create a copy so we can return by value, not by reference
    component = JSON.parse(JSON.stringify(component));

    // Check if scripts file is present
    var scriptsFile = path.join(component.path, "scripts.js");
    component.hasScripts = fs.existsSync(scriptsFile);

    // If we have the component, let's first look to see if it has a configuration file
    var configFile = path.join(component.path, "config.yaml");

    if (fs.existsSync(configFile)) {
      // This component seems to have a configuration file, so let's attempt to load it
      var config = yaml.safeLoad(fs.readFileSync(configFile, 'utf8'));

      if (config) {

        // Looks like the configuration is good, so let's save it
        component.config = config;

        if (config.style) {
          // If the component defines style variables, let's save those too
          component.style = config.style;
        }

        if (config.text) {
          // Let's save text configurations if we have any in this component
          component.text = config.text;
        }

        if (config.variables) {
          // Let's save variables if we have any in this component
          component.variables = config.variables;
        }

        if (config.images) {
          // Let's save images if we have any in this component
          component.images = config.images;
        }
      }
    }

    // Keep track of this component's page name
    component.page = pagedata.page;

    // Keep track of the component's unique id in this page
    component.id  = componentId;

    // Let's resolve all text related to this component
    component.text = utils.merge([component.text, component.data.text]);

    // Let's resolve all links related to this component
    component.links = utils.merge([component.links, component.data.links]);

    // Resolve style
    component.style = utils.merge([component.style, component.data.style]);

    // Resolve variables
    component.variables = utils.merge([component.variables, component.data.variables]);

    // Resolve images
    component.images = utils.merge([component.images, component.data.images]);

    return component;
  },

  findComponent: function (pagedata, componentId, context) {
    var component = pagedata.components[componentId];
    var data = {};
    if (component instanceof Object) {
      for (name in component) break;
      data = component[name];
    }

    var normalized = loader.normalizeComponent(component);
    var parts = normalized.split('/');
    var library = parts[0];
    if (library === 'carmel') {
      var componentDir = path.join(context.carmel.componentsDir, parts[1] + "/" + parts[2]);
      if (!fs.existsSync(componentDir)) {
        return;
      }
      return {name: normalized, path: componentDir, data: data};
    }

    return;
  },

  normalizeComponent: function (component) {
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

  uniqueComponentName: function(component) {
    return component.name + (component.occurence && component.occurence  > 1 ? component.occurence : '');
  },

  componentsCacheDirname: function(){
    return "__components";
  },

  pagesCacheDirname: function(){
    return "__pages";
  },

  articlesCacheDirname: function(){
    return "__articles";
  },

  dataCacheDirname: function(){
    return "__data";
  },

  assetsCacheDirname: function(){
    return "__assets";
  },

  pageComponentsDistDir: function(pagedata, locale) {
    var pageComponentsRootDir = path.join(locale.cacheDir, loader.componentsCacheDirname());
    var subpages = pagedata.page.split("/");
    var page = subpages[0];
    var pageDir = path.join(pageComponentsRootDir, page);
    return pageDir;
  },

  pageDistDir: function(pagedata, locale) {
    var pagesRootDir = path.join(locale.cacheDir, loader.pagesCacheDirname());
    var pageDir = path.join(pagesRootDir, pagedata.page);
    return pageDir;
  },

  articlesDistDir: function(locale) {
    var articlesRootDir = path.join(locale.cacheDir, loader.articlesCacheDirname());
    return articlesRootDir;
  },

  assetsDistDir: function(locale) {
    var assetsRootDir = path.join(locale.cacheDir, loader.assetsCacheDirname());
    return assetsRootDir;
  },

  dataDistDir: function(locale) {
    var dataRootDir = path.join(locale.cacheDir, loader.dataCacheDirname());
    return dataRootDir;
  },

  loadData: function(locale, resource) {
    var jsonFile = path.join(loader.dataDistDir(locale), resource + '.json');
    if (!fs.existsSync(jsonFile)) {
      return;
    }
    var json = fs.readFileSync(jsonFile, 'utf8');
    if (!json) {
      return;
    }

    var data = JSON.parse(json);
    return data;
  },

  loadArticlesData: function(locale) {
    return loader.loadData(locale, 'articles');
  },

  loadArticle: function(locale, articleId) {
    return loader.loadData(locale, 'articles/' + articleId);
  },

  componentDistDir: function(component, locale) {
    var componentNewName = loader.uniqueComponentName(component);
    var componentsDistDir = path.join(locale.cacheDir, loader.componentsCacheDirname());
    var componentsPageDistDir = path.join(componentsDistDir, component.page);
    var componentDistDir = path.join(componentsPageDistDir, componentNewName);
    return componentDistDir;
  }
}

module.exports = loader;
