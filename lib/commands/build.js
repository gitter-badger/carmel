var path     = require('path');
var colors   = require('colors');
var fs       = require('fs-extra');
var shell    = require('shelljs/global');
var logger   = require('../../lib/logger');
var context  = require('../../lib/context').new();

var command = {
  description: "builds your site",
  args: "",
  exec: function() {

    if (!fs.existsSync(context.app.configFile)) {
      logger.error("Site is not initialized. Run the " + colors.inverse('init') + " command first or consult " + colors.inverse('--help'));
      return;
    }

    logger.header("*** Building site ... ***");
    var gulp = context.carmel.modulesDir + "/gulp/bin/gulp.js";
    var command = gulp + " build --gulpfile " + context.carmel.buildFile + " --cwd " + context.app.rootDir;

    // var process = exec(command, {silent: true, async: true});
    // process.stdout.on('data', function(data){
    //   // console.log(data);
    // });

    exec(command, function(code, output) {
      // console.log('Exit code:', code);
      // console.log('Program output:', output);
    });

    // var exec = require('child_process').exec;
    // exec(gulp + " build --gulpfile " + context.carmel.buildFile + " --cwd " + context.app.rootDir, function(error, stdout, stderr) {
    //   if (stdout) {
    //     logger.info(stdout);
    //   }
    //
    //   if (error) {
    //     logger.error(error);
    //   }
    //   logger.header("*** Site ready. ***");
    // });
  }
}

module.exports = command;
