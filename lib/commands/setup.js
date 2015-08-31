var path      = require('path');
var fs        = require('fs-extra');
var coreutils = require('coreutils');
var logger    = coreutils.logger;
var context   = require('../../lib/context').new();

var command = {
  description: "sets up your carmel environment",
  args: "",
  exec: function() {
    if (context.isSetup()) {
      // Already setup, nothing else for us to do
      logger.info("Your carmel environment is already setup");
      return;
    }

    // Let's perform the setup
    context.setup();
  }
}

module.exports = command;
