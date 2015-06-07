#!/usr/bin/env node

var cmd      = require('commander');
var fs       = require('fs-extra');
var path     = require('path');
var commands = require('../lib/commands');
var context  = require('../lib/context');
var carmel   = require(context.carmel.packageFile);
var command  = {
  name: '',
  args: []
};

var availableCommands = commands.load();

cmd.version(carmel.version)
   .usage('<command> [args...]');

availableCommands.forEach(function(commandName){
  var command = require('../lib/commands/' + commandName);
  cmd.command(commandName + " " + command.args).description(command.description);
});

cmd.arguments('<command> [args...]')
   .action(function (cmd, args) {
      command.name = cmd;
      command.args = args;
});

cmd.parse(process.argv);

if (!command.name || !fs.existsSync(path.join(__dirname, '../lib/commands/' + command.name + ".js"))) {
  cmd.help();
  return;
}

require('../lib/commands/' + command.name).exec(command.args);
