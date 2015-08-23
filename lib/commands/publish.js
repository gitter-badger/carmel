var awsome     = require('awsome');
var context    = require('../context').new();

var command = {
  description: "publishes your site",
  args: "",
  exec: function() {
    awsome.publish(context.publish().domain, context.app.previewDir, context.home.awsConfigFile);
  }
}

module.exports = command;
