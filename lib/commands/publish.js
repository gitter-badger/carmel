var common   = require('./_common');

var command = {
  description: "publishes your site",
  args: "",
  exec: function() {
    return common.gulp('publish', 'Publishing');
  }
}

module.exports = command;
