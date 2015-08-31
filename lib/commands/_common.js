var path      = require('path');
var fs        = require('fs-extra');
var coreutils = require('coreutils');
var logger    = coreutils.logger;
var context   = require('../../lib/context').new();

var command = {

  gulp: function(step, header) {

    if (!context.isSetup()) {
      logger.error("Your carmel environment is not setup. Run the [setup] command first or consult --help");
      return;
    }

    if (!fs.existsSync(context.app.configFile)) {
      logger.error("Site is not initialized. Run the [init] command first or consult --help");
      return;
    }

    logger.header("start " + header);

    var gulp = context.carmel.modulesDir + "/gulp/bin/gulp.js";
    var args = [step, "--gulpfile", context.carmel.buildFile, "--cwd", context.app.rootDir];

    var spawn      = require('child_process').spawn;
    var subprocess = spawn(gulp, args, {stdio: 'inherit'});

    subprocess.on('exit', function(code) {
      logger.footer("done " + header);
    });
  }

}

module.exports = command;
