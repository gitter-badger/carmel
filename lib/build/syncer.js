var coreutils         = require('coreutils');
var logger            = coreutils.logger;
var loader            = require('../loader');
var path              = require('path');
var fs                = require('fs-extra');
var git               = require('nodegit');

var syncer = {

  findRequiredRepos: function(context) {
    var repos = {};

    var pages  = context.getPages();
    pages.forEach(function(pagedata){
      if (!pagedata.components || pagedata.components.length == 0) {
        return;
      }
      pagedata.components.forEach(function(componentData) {
        var normalizedComponentName = loader.normalizeComponent(componentData);
        if (!normalizedComponentName) {
          return;
        }
        var parts = normalizedComponentName.split('/');
        var repoName = parts[0];
        if (!repos[repoName]) {
          repos[repoName] = {components: [], info: {}};
        }
        var repoRootDir = path.join(context.home.componentsDir, repoName);
        repos[repoName].info = {dir: repoRootDir,
                                repo: context.config().components.repositories[repoName],
                                exists: fs.existsSync(repoRootDir)};
        repos[repoName].components.push({page: pagedata.page, component: parts[1] + "/" + parts[2]});
      })
    });
    return repos;
  },

  updateRepo: function(repoName, repoData, callback) {
      var repository;
      git.Repository.open(repoData.dir)
      .then(function(repo) {
        repository = repo;
        return repository.fetchAll({
          credentials: function(url, userName) {
            return nodegit.Cred.sshKeyFromAgent(userName);
          },
          certificateCheck: function() {
            return 1;
          }
        });
      })
      .then(function() {
        // merge our local branch
        return repository.mergeBranches("master", "origin/master");
      })
      .catch(function(err) {
         logger.fail("Could not update the [" + repoName + "] components repository");
         callback(err);
       })
      .done(function() {
        logger.ok("Successfully updated the [" + repo + "] components repository");
        callback();
      });
  },

  initRepo: function(repoName, repoData, callback) {
      var repo      = "https://github.com/"  + repoData.repo + ".git";
      var options   = {
           remoteCallbacks: {
               certificateCheck: function() {
                 return 1;
               }
           }
       };

       git.Clone(repo, repoData.dir, options)
           .then(function(repo) {
             logger.ok("Successfully initialized the [" + repoName + "] components repository");
             callback();
           })
           .catch(function(err) {
             logger.fail("Could not initialize the [" + repoName + "] components repository");
             callback(err);
           });
  },

  syncNextRepo: function(repos, callback) {
    var count = 0;
    for (k in repos) if (repos.hasOwnProperty(k)) count++;
    if (count == 0) {
      callback();
      return;
    }

    for(repo in repos) {
      if (!repos[repo].info.exists) {
        syncer.initRepo(repo, repos[repo].info, function(error) {
          delete repos[repo];
          syncer.syncNextRepo(repos, callback);
        });
      } else {
        syncer.updateRepo(repo, repos[repo].info, function(error) {
          delete repos[repo];
          syncer.syncNextRepo(repos, callback);
        });
      }
      return;
    }
  },

  syncComponents: function (context, gulp, plugins, callback) {
      var repos = syncer.findRequiredRepos(context);
      if (!repos) {
        callback('No component repositories found');
        return;
      }

      syncer.syncNextRepo(repos, callback);
  }
}

module.exports = syncer;
