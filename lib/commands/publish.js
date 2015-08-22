var path     = require('path');
var fs       = require('fs-extra');
var zlib     = require('zlib');
var walk     = require('walk');
var fstream  = require('fstream');
var logger   = require('../logger');
var utils    = require('../utils');
var context  = require('../context').new();
var dns      = require('../deploy/dns');
var storage  = require('../deploy/storage');
var AWS      = require('aws-sdk');

function prepareWebsite(domain, success, error) {
  storage.hasWebsite(domain, function() {
    logger.ok("Website bucket exists for " + domain);
    success();
  }, function(err) {
    storage.addWebsite(domain, function() {
      success();
    }, error);
  });
}

function prepareDomain(domain, success, error) {
  dns.hasDomain(domain, function(zone) {
    logger.ok("Domain exists " + domain);
    success(zone);
  }, function(err) {
     dns.addDomain(domain, function(zone) {
       logger.ok("Domain added " + domain);
       success(zone);
     }, error);
  });
}

function prepareRecord(domain, zone, success, error) {
  dns.records(zone, function(records){
    if (dns.hasRecord(records, domain)) {
      logger.ok("Record exists for " + domain);
      success(zone);
    } else {
      dns.addRecord(domain, zone, function() {
        logger.ok("Added record for " + domain);
        success(zone);
      }, error);
    }
  }, error);
}

function doPublish(domain, start, done, error) {
  var parts         = domain.split('.')
  var coreDomain    = parts[parts.length - 2] + "." + parts[parts.length - 1];

  prepareWebsite(domain, function() {
    prepareDomain(coreDomain, function(zone) {
      prepareRecord(domain, zone, function(zone) {
         start();
         storage.upload(domain, context.app.previewDir, function() {
           done();
         }, error);
      }, error);
    }, error);
  }, error);
}

var command = {
  description: "publishes your site",
  args: "",
  exec: function() {
    if (!fs.existsSync(context.home.awsConfigFile)) {
      logger.error("Cannot publish. Looks like your AWS credentials are missing.")
    }
    AWS.config.loadFromPath(context.home.awsConfigFile);

    logger.header("start publishing");

    var domain  = context.publish().domain;
    logger.info("Preparing to upload");
    doPublish(domain, function() {
      logger.info("Start uploading");
    }, function(){
      logger.footer("Done publishing");
    }, function(error) {
      logger.error(error);
    });
  }
}

module.exports = command;
