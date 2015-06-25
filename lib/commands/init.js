var colors   = require('colors');
var path     = require('path');
var fs       = require('fs-extra');
var logger   = require('../../lib/logger');
var context  = require('../../lib/context').new();
var thm      = require('../../lib/theme');

var command = {
  description: "creates a new site",
  args: "[theme]",
  exec: function(theme) {
    if (fs.existsSync(context.app.configFile)){
      logger.header("*** Site already exists. ***");
      return;
    }

    if (theme.length == 0){
      theme = 'demo';
    } else if (theme.length >= 1) {
      theme = theme[0]
    }

    theme = thm.normalize(theme);
    var themeDir = thm.find(theme);
    if (!themeDir) {
      logger.error("Missing expected theme: " + colors.inverse(theme));
      return;
    }

    logger.header("*** Creating new site from theme " + colors.inverse(theme) + " ... ***");

    fs.copySync(themeDir, context.app.rootDir);

    if (!fs.existsSync(context.app.configFile)) {
      logger.error("Could not create site.");
      return;
    }

    logger.header(" => Site created successfully.");
  }
}

module.exports = command;
