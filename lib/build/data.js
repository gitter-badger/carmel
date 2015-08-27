var path                  = require('path');
var merge                 = require('merge-stream');
var fs                    = require('fs-extra');
var loader                = require('../loader');
var through               = require('through2');
var componentBuilder      = require('./component');
var pageBuilder           = require('./page');
var articleBuilder        = require('./article');
var cache                 = require('./cache');
var coreutils             = require('coreutils');
var logger                = coreutils.logger;

var builder = {

  buildArticles: function (context, gulp, plugins, locale) {
      if (!fs.existsSync(locale.articlesDir)) {
         // This locale has no articles
         return;
      }

      var dataDir  =  loader.dataDistDir(locale);
      var meta     =  {articles: [], tags: []};
      var api      =  {articles: path.join(dataDir, "articles.json"), tags: path.join(dataDir, "tags.json")};
      // var stream   =  cache.src(locale.articlesDir + "/*.md", gulp, context, plugins, locale)
      var stream   =  gulp.src(locale.articlesDir + "/*.md")
                            .pipe(articleBuilder.parseArticle(context, gulp, plugins, locale))
                            .pipe(plugins.frontMatter({property: 'meta', remove: true}))
                            .pipe(plugins.markdown())
                            .pipe(through.obj(function(file, enc, callback) {

                                file.meta.date = coreutils.niceDate(file.meta.date, locale.id);
                                meta.articles.push(file.meta);
                                fs.outputJsonSync(api.articles, meta.articles);
                                if (context.config().logging.level > 1) {
                                    logger.asset("articles", path.basename(api.articles));
                                }
                                articleFileMeta = JSON.parse(JSON.stringify(file.meta));
                                articleFileMeta.body = file.contents.toString('utf8');
                                fs.outputJsonSync(path.join(dataDir, "articles/" + file.meta.id + ".json"), articleFileMeta);
                                if (context.config().logging.level > 1) {
                                  logger.asset("article", file.meta.id + ".json");
                                }

                                var tagsList = articleFileMeta.tags;
                                var tags = tagsList.split(',');
                                tags.forEach(function(tag){
                                   tag = tag.trim();
                                   if (!meta.tags[tag]) {
                                     meta.tags[tag] = [];
                                   }
                                   var tagMeta = {articleId: articleFileMeta.id};
                                   meta.tags[tag].push(tagMeta);
                                   fs.outputJsonSync(path.join(dataDir, "tags/" + tag + ".json"), meta.tags[tag]);
                                });

                                tags = [];
                                for (var tagMeta in meta.tags) {
                                  tags.push({tag: tagMeta, articles: meta.tags[tagMeta]});
                                }
                                fs.outputJsonSync(api.tags, tags);
                                if (context.config().logging.level > 1) {
                                  logger.asset("tags", path.basename(api.tags));
                                }
                                this.push(file);
                                return callback();
                            }));
      return stream;
   }
}

module.exports = builder;
