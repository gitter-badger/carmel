var common   = require('./_common');

var command = {
  description: "builds your site",
  args: "",
  exec: function() {
    return common.gulp('make', 'Building');
  }
}

module.exports = command;
