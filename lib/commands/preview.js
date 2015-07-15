var common   = require('./_common');

var command = {
  description: "previews your site",
  args: "",
  exec: function() {
    return common.gulp('preview', 'Previewing');
  }
}

module.exports = command;
