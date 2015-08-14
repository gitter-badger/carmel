var path                  = require('path');
var merge                 = require('merge-stream');
var fs                    = require('fs-extra');
var loader                = require('../loader');
var through               = require('through2');
var utils                 = require('../utils');
var componentBuilder      = require('./component');
var pageBuilder           = require('./page');

var builder = {

  webRoot: function(context, locale) {
    return "/" + (locale.default ? "" : locale.id + "/");
  },

  parseArticle: function(context, gulp, plugins, locale) {
    var webRoot = builder.webRoot(context, locale);

    return plugins.replace(/\$carmel\.([^\)]+)\(([^\)]*)\)/g, function(match, helper, args) {
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
  },

  generateApi: function (context, locale, meta) {

    return through.obj(function(file, enc, callback) {

       var articleSlug = file.meta.id + "-" + file.meta.slug;
       var destDir =  path.join(loader.articlesDistDir(locale), articleSlug);

       if (!fs.existsSync(destDir)) {
         fs.mkdirsSync(destDir);
       }

       var srcFile  = path.join(context.carmel.layoutsDir, "default" + '/layout.html');
       var destFile = path.join(destDir, "index.html");
       fs.copySync(srcFile, destFile);

      //  var uri = builder.webRoot(context, locale) + context.app.config.content.articles.root + "/" + file.meta.id + "-" + file.meta.slug;

      //  var webUrl = "http://" + context.app.config.settings.publish.domain + webRoot;
      //  var domain = context.app.config.settings.publish.domain;
      //  var webUrl = "http://" + domain + builder.webRoot(context, locale);
      //  var articleContent = fs.readFileSync(destFile, 'utf8');
      //  articleContent = articleContent.replace(/__ARTICLE_ID__/g, file.meta.id);
      //  articleContent = articleContent.replace(/__PAGE_META_URL/g, webUrl);
      //  articleContent = articleContent.replace(/__PAGE_META_NAME/g, domain);
      //  articleContent = articleContent.replace(/__PAGE_META_TITLE/g, file.meta.title);
      //  articleContent = articleContent.replace(/__PAGE_META_DESCRIPTION/g, file.meta.summary);
      //  articleContent = articleContent.replace(/__PAGE_META_IMAGE/g, webUrl + "img/article-cover-" + file.meta.id + ".png");
      //  fs.writeFileSync(destFile, articleContent, 'utf8');

       this.push(file);
       return callback();
    });
  }

  // build: function (context, gulp, plugins, locale, article) {
  //     if (!fs.existsSync(locale.articlesDir)) {
  //        // This locale has no articles
  //        return;
  //     }
  //
  //     var pagedata  =  {page:  loader.articlesCacheDirname() + "/" + article.slug, layout: "default", components: ['article'], article: article};
  //     var stream    =  pageBuilder.build(context, gulp, plugins, locale, pagedata);
  //
  //     return stream;
  //  }
}

module.exports = builder;
