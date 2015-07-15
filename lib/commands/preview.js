var path     = require('path');
var colors   = require('colors');
var fs       = require('fs-extra');
var logger   = require('../../lib/logger');
var context  = require('../../lib/context').new();
var shell    = require('shelljs/global');

var command = {
  description: "previews your site",
  args: "",
  exec: function() {

    if (!fs.existsSync(context.app.configFile)) {
      logger.error("Site is not initialized. Run the " + colors.inverse('init') + " command first or consult " + colors.inverse('--help'));
      return;
    }

    logger.header("*** Previewing site on port " + context.dev().port + " ... ***");

    var gulp = context.carmel.modulesDir + "/gulp/bin/gulp.js";
    var command = gulp + " preview --gulpfile " + context.carmel.buildFile + " --cwd " + context.app.rootDir;

    exec(command, function(code, output) {

    });
  }
}

module.exports = command;
