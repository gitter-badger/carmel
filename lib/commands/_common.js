var path     = require('path');
var colors   = require('colors');
var fs       = require('fs-extra');
var logger   = require('../../lib/logger');
var context  = require('../../lib/context').new();
var shell    = require('shelljs/global');

var command = {

  gulp: function(step, header) {

    if (!fs.existsSync(context.app.configFile)) {
      logger.error("Site is not initialized. Run the " + colors.inverse('init') + " command first or consult " + colors.inverse('--help'));
      return;
    }

    logger.header("*** " + header + " ***");

    var gulp = context.carmel.modulesDir + "/gulp/bin/gulp.js";
    var args = [step,  "--gulpfile", context.carmel.buildFile, "--cwd", context.app.rootDir];

    var subprocess = require('child_process').spawn;
    subprocess(gulp, args, {stdio: 'inherit'});
  }

}

module.exports = command;
