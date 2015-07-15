var common   = require('./_common');

var command = {
  description: "builds your site",
  args: "",
  exec: function() {
    return common.gulp('build', 'Building');
  }
}

module.exports = command;
