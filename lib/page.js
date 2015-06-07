var fs        = require('fs-extra');
var path      = require('path');
var utils     = require('./utils');
var comp      = require('./component');

var page = {

  components: function (pagedata, context) {
    pagedata['global'] = {
                            text: context.app.config.text,
                            assets: context.app.config.assets,
                            settings: context.app.config.settings,
                            theme: context.app.config.theme
                          };
    var valid = [];
    var component = comp.load(pagedata, 0, context);
    while(component) {
      if (component) {
        valid.push(component);
      }
      component = comp.load(pagedata, component['id'] + 1, context);
    }

    return valid;
  }

}

module.exports = page;
