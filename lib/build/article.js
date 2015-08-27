var path                  = require('path');
var merge                 = require('merge-stream');
var fs                    = require('fs-extra');
var loader                = require('../loader');
var through               = require('through2');
var componentBuilder      = require('./component');
var pageBuilder           = require('./page');
var coreutils             = require('coreutils');

var builder = {

  webRoot: function(context, locale) {
    return "/" + (locale.default ? "" : locale.id + "/");
  },

  parseArticle: function(context, gulp, plugins, locale) {
    return plugins.replace(/\$carmel\.([^\)]+)\(([^\)]*)\)/g, function(match, helper, args) {
       var webRoot = builder.webRoot(context, locale);
        try {
          if (!helper) {
            return "";
          }

          if (args) {
            // Find the arguments, if any
            args = args.split(/[\s,]+/).join();
            args = args.split(",");
          }

          if (helper === 'image') {
            var imageId = args[0];
            var imgRoot = webRoot + "img/";
            result = imgRoot + imageId + ".png";
            var images = context.app.config.content.images;
            if (images && images[imageId]) {
              result = imgRoot + images[imageId];
            }
          }

          if (!result) {
            return "";
          }

          return result;
        } catch (err) {
          // Could not find the helper, ignore
        }

        return "";
     });
  }

}

module.exports = builder;
