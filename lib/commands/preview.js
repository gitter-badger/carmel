var path     = require('path');
var colors   = require('colors');
var fs       = require('fs-extra');
var logger   = require('../../lib/logger');
var context  = require('../../lib/context').new();

var command = {
  description: "previews your site",
  args: "",
  exec: function() {

    if (!fs.existsSync(context.app.configFile)) {
      logger.error("Site is not initialized. Run the " + colors.inverse('init') + " command first or consult " + colors.inverse('--help'));
      return;
    }

    logger.header("*** Previewing site on http://localhost:9000 ... ***");
    var gulp = context.carmel.modulesDir + "/gulp/bin/gulp.js";
    var exec = require('child_process').exec;
    exec(gulp + " preview --gulpfile " + context.carmel.buildFile + " --cwd " + context.app.rootDir, function(error, stdout, stderr) {
      if (stdout) {
        logger.info(stdout);
      }

      if (error) {
        logger.error(error);
      }
    });
  }
}

module.exports = command;
