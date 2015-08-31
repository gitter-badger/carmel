var awsome     = require('awsome');
var context    = require('../context').new();

var command = {
  description: "publishes your site",
  args: "",
  exec: function() {
    awsome.website.deploy(context.app.previewDir, context.publish().domain);

  }
}

module.exports = command;
