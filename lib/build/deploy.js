var path   = require('path');
var merge  = require('merge-stream');
var shell  = require('shelljs/global');
var fs     = require('fs-extra');
var yaml   = require('js-yaml');
var utils  = require('../utils');

var requiredConfig = ['domain', 'ip', 'user', 'port', 'keyfile'];

var deploy = {
  config: function(context){
    var remoteConfig = context.app.config.publish;

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
    var publishDir = path.join(context.app.tempDir, "publish/" + config.domain);
    fs.mkdirsSync(publishDir);

    // Prepare for publishing
    deploy.prepare(context, publishDir, config);

    cd(publishDir);
    exec("ansible-playbook --limit=carmel --inventory-file=hosts playbook.yaml");

    return gulp.src('/');
  }
}

module.exports = deploy;
