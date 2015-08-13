var common   = require('./_common');

var command = {
  description: "generates your site",
  args: "",
  exec: function() {
    return common.gulp('make', 'Generating');
  }
}

module.exports = command;
