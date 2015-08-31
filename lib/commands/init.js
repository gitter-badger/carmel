var path      = require('path');
var fs        = require('fs-extra');
var context   = require('../../lib/context').new();
var thm       = require('../../lib/theme');
var coreutils = require('coreutils');
var logger    = coreutils.logger;

var command = {
  description: "creates a new site",
  args: "[theme]",
  exec: function(theme) {
    if (fs.existsSync(context.app.configFile)){
      logger.info("Site already exists");
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
      logger.error("Missing expected theme: " + theme);
      return;
    }

    logger.info("Creating new site");
    logger.ok("Found " + theme + " theme");

    fs.copySync(themeDir, context.app.rootDir);

    if (!fs.existsSync(context.app.configFile)) {
      logger.error("Could not create site");
      return;
    }

    logger.ok("Site created successfully");
  }
}

module.exports = command;
