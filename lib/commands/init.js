var colors   = require('colors');
var path     = require('path');
var fs       = require('fs-extra');
var logger   = require('../../lib/logger');
var context  = require('../../lib/context').new();
var tmpl     = require('../../lib/template');

var command = {
  description: "creates a new site",
  args: "[template]",
  exec: function(template) {
    if (fs.existsSync(context.app.configFile)){
      logger.header("*** Site already exists. ***");
      return;
    }

    if (template.length == 0){
      template = 'landing';
    } else if (template.length >= 1) {
      template = template[0]
    }

    template = tmpl.normalize(template);
    var templateDir = tmpl.find(template);
    if (!templateDir) {
      logger.error("Missing expected template: " + colors.inverse(template));
      return;
    }

    logger.header("*** Creating new site from template " + colors.inverse(template) + " ... ***");

    fs.copySync(templateDir, context.app.rootDir);

    if (!fs.existsSync(context.app.configFile)) {
      logger.error("Could not create site.");
      return;
    }

    logger.header(" => Site created successfully.");
  }
}

module.exports = command;
