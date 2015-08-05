var path              = require('path');
var merge             = require('merge-stream');
var fs                = require('fs-extra');
var loader            = require('../loader');
var pageBuilder       = require('../build/pages');
var componentBuilder  = require('../build/components');
var through           = require('through2');
var utils             = require('../utils');

var articles = {

  build: function (context, gulp, plugins) {
    var content = context.content();
    var streams = [];
    var articlesRoot;

    var pages = context.getPages();
    pages.forEach(function(pagedata){
       if (pagedata.articles) {
          articlesRoot = pagedata.page;
         return;
       }
    });

    if (!articlesRoot) {
        return gulp.src('/');
    }

    content.forEach(function(locale) {

        var webRoot = "/" + (locale.default ? "" : locale.id + "/")

        if (!fs.existsSync(locale.articlesDir)) {
           // This locale has no articles
           return;
        }

        var articlesMeta = [];
        var articlesFile = path.join(locale.previewDir, "data/articles/all.json");
        var tagsMeta = [];
        var tagsFile = path.join(locale.previewDir, "data/articles/tags.json");

        var stream = gulp.src(locale.articlesDir + "/*.md")
                          .pipe(plugins.replace(/\$carmel\.([^\)]+)\(([^\)]*)\)/g, function(match, helper, args) {
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
                           }))
                         .pipe(plugins.frontMatter({property: 'meta', remove: true}))
                         .pipe(through.obj(function(file, enc, callback) {
                            var uri = articlesRoot + "/" + file.meta.id + "-" + file.meta.slug;
                            var srcFile  = path.join(locale.previewDir, "article/index.html");
                            var indexDir =  path.join(locale.previewDir, uri);

                            var indexFile = path.join(indexDir, "index.html");
                            fs.copySync(srcFile, indexFile);

                            var webUrl = "http://" + context.app.config.settings.production.domain + webRoot;
                            var articleContent = fs.readFileSync(indexFile, 'utf8');
                            articleContent = articleContent.replace(/__ARTICLE_ID__/g, file.meta.id);
                            articleContent = articleContent.replace(/__PAGE_META_URL/g, webUrl + uri);
                            articleContent = articleContent.replace(/__PAGE_META_NAME/g, context.app.config.settings.production.domain);
                            articleContent = articleContent.replace(/__PAGE_META_TITLE/g, file.meta.title);
                            articleContent = articleContent.replace(/__PAGE_META_DESCRIPTION/g, file.meta.summary);
                            articleContent = articleContent.replace(/__PAGE_META_IMAGE/g, webUrl + "img/article-cover-" + file.meta.id + ".png");
                            fs.writeFileSync(indexFile, articleContent, 'utf8');

                            srcFile = path.join(locale.previewDir, "article/scripts.js");
                            indexFile = path.join(indexDir, "scripts.js");
                            fs.copySync(srcFile, indexFile);

                            srcFile = path.join(locale.previewDir, "article/style.css");
                            indexFile = path.join(indexDir, "style.css");
                            fs.copySync(srcFile, indexFile);

                            file.meta.date = utils.niceDate(file.meta.date, locale.id);
                            file.meta.slug = file.meta.id + "-" + file.meta.slug;
                            articlesMeta.push(file.meta);

                            fs.outputJsonSync(articlesFile, articlesMeta);
                            fs.outputJsonSync(path.join(locale.previewDir, "data/articles/" + file.meta.id + ".json"), file.meta);

                            var tagsList = file.meta.tags;
                            var tags = tagsList.split(',');
                            tags.forEach(function(tag){
                              tag = tag.trim();
                              if (!tagsMeta[tag]) {
                                tagsMeta[tag] = [];
                              }
                              var tagMeta = {articleId: file.meta.id};
                              tagsMeta[tag].push(tagMeta);
                              fs.outputJsonSync(path.join(locale.previewDir, "data/articles/tag-" + tag + ".json"), tagsMeta[tag]);
                            });

                            tags = [];
                            for (var tagMeta in tagsMeta) {
                              tags.push({tag: tagMeta, articles: tagsMeta[tagMeta]});
                            }

                            fs.outputJsonSync(tagsFile, tags);

                            this.push(file);
                            return callback();
                         }))
                         .pipe(plugins.markdown())
                         .pipe(plugins.rename(function (path) {
                              path.extname = '.html';
                          }))
                         .pipe(gulp.dest(path.join(locale.previewDir, "data/articles")))

        if (stream) {
          // Ignore invalid streaming
          streams.push(stream);
        }

      });

      return merge(streams);
   }
}

module.exports = articles;
