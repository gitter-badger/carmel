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

      //  srcFile = path.join(locale.previewDir, "article/scripts.js");
      //  indexFile = path.join(indexDir, "scripts.js");
      //  fs.copySync(srcFile, indexFile);
       //
      //  srcFile = path.join(locale.previewDir, "article/style.css");
      //  indexFile = path.join(indexDir, "style.css");
      //  fs.copySync(srcFile, indexFile);
       //
      //  file.meta.date = utils.niceDate(file.meta.date, locale.id);
      //  file.meta.slug = file.meta.id + "-" + file.meta.slug;
      //  meta.articles.push(file.meta);
       //
      //  fs.outputJsonSync(articlesFile, meta.articles);
      //  fs.outputJsonSync(path.join(locale.previewDir, "data/articles/" + file.meta.id + ".json"), file.meta);
       //
      //  var tagsList = file.meta.tags;
      //  var tags = tagsList.split(',');
      //  tags.forEach(function(tag){
      //    tag = tag.trim();
      //    if (!meta.tags[tag]) {
      //      meta.tags[tag] = [];
      //    }
      //    var tagMeta = {articleId: file.meta.id};
      //    meta.tags[tag].push(tagMeta);
      //    fs.outputJsonSync(path.join(locale.previewDir, "data/articles/tag-" + tag + ".json"), meta.tags[tag]);
      //  });
       //
      //  tags = [];
      //  for (var tagMeta in meta.tags) {
      //    tags.push({tag: tagMeta, articles: meta.tags[tagMeta]});
      //  }
       //
      //  fs.outputJsonSync(tagsFile, tags);

       this.push(file);
       return callback();
    });
  },

  build: function (context, gulp, plugins, locale) {
      if (!fs.existsSync(locale.articlesDir)) {
         // This locale has no articles
         return;
      }

      // var pagedata      =  {page:   "__article",
      //                       layout: "default",
      //                       components: ['article']};
      // var component     = loader.loadComponent(pagedata, 0, context);
      //
      // var stream        = componentBuilder.build(context, gulp, plugins, locale, pagedata, component);
      // // var stream;//        =  pageBuilder.build(context, gulp, plugins, locale, pagedata);
      //
      // if (!stream) {
      //    return;
      // }

      var dataDir =  loader.articlesDistDir(locale);
      var meta    = {articles: [], tags: []};
      var api     = {articles: path.join(dataDir, "articles.json"),
                     tags: path.join(dataDir, "tags.json")};

      var stream = gulp.src(locale.articlesDir + "/*.md")
                       .pipe(plugins.frontMatter({property: 'meta', remove: true}))
                       .pipe(through.obj(function(file, enc, callback) {
                          this.push(file);
                          return callback();
                        }))
                      //  .pipe(plugins.rename(function (path) {
                      //       path.extname = '.html';
                      //   }))
                      //  .pipe(gulp.dest(destDir))

      return stream;
   }
}

module.exports = builder;
