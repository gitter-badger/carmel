var path   = require('path');
var merge  = require('merge-stream');
var shell  = require('shelljs/global');
var fs     = require('fs-extra');
var yaml   = require('js-yaml');
var utils  = require('../utils');
var logger = require('../logger');
var through= require('through2');

var requiredConfig = ['domain', 'ip', 'user', 'port', 'keyfile'];

var deploy = {

  config: function(context){
    var remoteConfig = context.prod();

    if (!remoteConfig) {
      return;
    }

    requiredConfig.forEach(function(key){
      if (!remoteConfig[key]) {
        return;
      }
    });

    if (!fs.existsSync(remoteConfig.keyfile)) {
      return;
    }

    return remoteConfig;
  },

  prepare: function(context, publishDir, config) {
    // Add the hosts file
    var hosts = "[carmel]\ncarmel-host ansible_ssh_host=" + config.ip + " ansible_ssh_user=" + config.user + " ansible_ssh_port=" + config.port;
    fs.writeFileSync(path.join(publishDir, "hosts"), hosts);

    // Generate the playbook structure
    var playbook = [{
      hosts: 'carmel',
      sudo: 'yes',
      remote_user: config.user,
      vars: {
        wwwroot: context.app.previewDir,
        domain: config.domain,
        user: config.user,
        version: utils.datestamp()
      },
      roles: ['site']
    }];

    // Add the the playbook file
    playbook = yaml.safeDump(playbook);
    fs.writeFileSync(path.join(publishDir, "playbook.yaml"), playbook);

    // Add the roles
    fs.copySync(path.join(context.carmel.opsDir, 'roles'), path.join(publishDir, 'roles'));
  },

  remote: function (context, gulp, plugins) {
    var config = deploy.config(context);

    if (!config) {
      return gulp.src('/');
    }

    // Create the publish temporary directory
    var publishPath = "publish/" + config.domain;
    var publishDir = path.join(context.carmel.opsDir, publishPath);
    fs.mkdirsSync(publishDir);

    // Prepare for publishing
    deploy.prepare(context, publishDir, config);

    // Publish
    var stream = through.obj(function(file, enc, cb) {
      var spawn = require('child_process').spawn;
      var command = './venv/bin/ansible-playbook';
      var args    = ['--limit=carmel', '--inventory-file=./' + publishPath + '/hosts', './' + publishPath + '/playbook.yaml'];
      var options = {cwd: context.carmel.opsDir, stdio: 'inherit'};
      var ansible = spawn(command, args, options);

      ansible.on('exit', function() {
        fs.removeSync(publishDir);
        cb();
      });

      this.push(file);
    });

    return gulp.src('/').pipe(stream);
  }
}

module.exports = deploy;
