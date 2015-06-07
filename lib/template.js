var fs        = require('fs-extra');
var path      = require('path');
var utils     = require('./utils');
var context   = require('./context');

var template = {

  isCarmelTemplate: function (template){
    return this.provider(template) === 'carmel';
  },

  provider: function(template){
    var parts = template.split('/');
    return parts[0];
  },

  find: function(template){
    if (this.isCarmelTemplate(template)) {
      var parts = template.split('/');
      var templateDir = path.join(context.carmel.templatesDir, parts[1] + "/" + parts[2]);
      if (fs.existsSync(templateDir)) {
        return templateDir;
      }
    }

    return;
  },

  /**
    Given a template name
  **/
  normalize: function (template) {
    var normalized = template;
    if (template instanceof Object) {
      for (normalized in template) break;
    }

    var parts = normalized.split('/');
    if (parts.length == 1) {
      normalized = 'carmel/' + normalized + "/default";
    }
    else if (parts.length == 2) {
      normalized = normalized + "/default";
    }
    return normalized;
  }
}

module.exports = template;
