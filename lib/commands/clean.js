var common   = require('./_common');

var command = {
  description: "cleans your site",
  args: "",
  exec: function() {
    return common.gulp('clean', 'Cleaning');
  }
}

module.exports = command;
