var common   = require('./_common');

var command = {
  description: "displays information about your site",
  args: "",
  exec: function() {
    return common.gulp('info', 'Checking');
  }
}

module.exports = command;
