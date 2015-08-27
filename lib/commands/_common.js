var path      = require('path');
var fs        = require('fs-extra');
var coreutils = require('coreutils');
var logger    = coreutils.logger;
var context   = require('../../lib/context').new();

var command = {

  gulp: function(step, header) {

    if (!fs.existsSync(context.app.configFile)) {
      logger.error("Site is not initialized. Run the " + colors.inverse('init') + " command first or consult " + colors.inverse('--help'));
      return;
    }

    logger.header("start " + header);

    var gulp = context.carmel.modulesDir + "/gulp/bin/gulp.js";
    var args = [step,"--silent", "--gulpfile", context.carmel.buildFile, "--cwd", context.app.rootDir];

    var spawn      = require('child_process').spawn;
    var subprocess = spawn(gulp, args, {stdio: 'inherit'});

    subprocess.on('exit', function(code) {
      logger.footer("done " + header);
    });
  }

}

module.exports = command;
