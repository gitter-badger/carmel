var fs       = require('fs-extra');
var path     = require('path');

var commands  = {
  gulp: function() {

  },

  load: function() {
    var cmdFiles = fs.readdirSync(path.join(__dirname, '../lib/commands'));
    var cmds = [];
    cmdFiles.forEach(function(cmdFile) {
      var cmdName = cmdFile.split('.')[0];
      if (cmdName.charAt(0) == '_'){
        return;
      }
      cmds.push (cmdName);
    });
    return cmds;
  }
};

module.exports = commands;
