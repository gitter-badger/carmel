var fs        = require('fs-extra');
var path      = require('path');
var utils     = require('./utils');
var context   = require('./context');

var theme = {

  isCarmelTheme: function (theme){
    return this.provider(theme) === 'carmel';
  },

  provider: function(theme){
    var parts = theme.split('/');
    return parts[0];
  },

  find: function(theme){
    if (this.isCarmelTheme(theme)) {
      var parts = theme.split('/');
      var themeDir = path.join(context.carmel.themesDir, parts[1] + "/" + parts[2]);
      if (fs.existsSync(themeDir)) {
        return themeDir;
      }
    }

    return;
  },

  /**
    Given a theme name
  **/
  normalize: function (theme) {
    var normalized = theme;
    if (theme instanceof Object) {
      for (normalized in theme) break;
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

module.exports = theme;
