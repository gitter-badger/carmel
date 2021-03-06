var path      = require('path');
var fs        = require('fs-extra');
var yaml      = require('js-yaml');
var coreutils = require('coreutils');
var loader    = require('./loader');
var logger    = coreutils.logger;

var _config;

var context  = {
  carmel: {
    rootDir: path.join(__dirname, ".."),
  },
  app: {
    rootDir: process.cwd()
  },
  home: {
    rootDir: path.join(process.env[(process.platform == 'win32') ? 'USERPROFILE' : 'HOME'], '.carmel')
  }
};

// Application context
context.app.contentDir          = path.join(context.app.rootDir,    "content");
context.app.configFile          = path.join(context.app.rootDir,    "carmel.yaml");
context.app.sessionDir          = path.join(context.app.rootDir,    ".carmel");
context.app.cacheDir            = path.join(context.app.sessionDir, "cache");
context.app.cacheDB             = path.join(context.app.sessionDir, "cachedb");
context.app.previewDir          = path.join(context.app.sessionDir, "preview");

// Framework context
context.carmel.libDir           = path.join(context.carmel.rootDir, "lib");
context.carmel.sassDir          = path.join(context.carmel.libDir,  "sass");
context.carmel.configDir        = path.join(context.carmel.rootDir, "config");
context.carmel.buildFile        = path.join(context.carmel.libDir,  "build.js");
context.carmel.packageFile      = path.join(context.carmel.rootDir, "package.json");
context.carmel.layoutsDir       = path.join(context.carmel.rootDir, "layouts");
context.carmel.dependenciesDir  = path.join(context.carmel.rootDir, "dependencies");
context.carmel.modulesDir       = path.join(context.carmel.rootDir, "node_modules");
context.carmel.themesDir        = path.join(context.carmel.rootDir, "themes");
context.carmel.opsDir           = path.join(context.carmel.rootDir, "ops");

// Home context
context.home.componentsDir      = path.join(context.home.rootDir,   "components");
context.home.awsDir             = path.join(context.home.rootDir,   "aws");
context.home.awsConfigFile      = path.join(context.home.awsDir,    "config.json");

context.preview = function() {
  return context.app.config.settings.preview;
}

context.publish = function() {
  return context.app.config.settings.publish;
}

context.site = function() {
  return context.app.config.settings.site;
}

context.getPages = function () {
  var pages = context.app.config.pages.slice();
  return pages;
}

context.isSetup = function () {
  return fs.existsSync(context.home.componentsDir);
}

context.setup = function() {
  if (fs.existsSync(context.home.rootDir)) {
    // Already setup, nothing else for us to do
    return;
  }

  logger.info("Setting up your carmel environment");

  // Let's set it up
  fs.mkdirsSync(context.home.componentsDir);

  if (!fs.existsSync(context.home.componentsDir)) {
    logger.fail("Your carmel environment could not be setup");
    return;
  }

  logger.ok("Your carmel environment is now setup and ready to go. Enjoy!");
};

context.config = function (group) {

  if (!group){
    group = 'main';
  }

  if (_config) {
    return _config[group];
  }

  var configFiles = fs.readdirSync(context.carmel.configDir);
  if (!configFiles || configFiles.length == 0) {
    return;
  }

  _config = {};

  configFiles.forEach(function(configFile){
    var c = yaml.safeLoad(fs.readFileSync(path.join(context.carmel.configDir, configFile), 'utf8'));
    _config[path.basename(configFile, '.yaml')] = c;
  });

  return _config[group];
}

context.content = function() {
  var cont = [];
  var count = 0;
  context.app.config.content.locales.forEach(function(locale){
    for (localeId in locale);
    var localeDir   = path.join(context.app.contentDir, localeId);
    var textFile    = path.join(localeDir, 'text.yaml');
    var textDir     = path.join(localeDir, 'text');
    var dataDir     = path.join(localeDir, 'data');
    var assetsDir   = path.join(localeDir, 'assets');
    var articlesDir = path.join(localeDir, 'articles');
    var text        = {};

    if (fs.existsSync(localeDir)) {
      if (fs.existsSync(textFile)) {
        text = yaml.safeLoad(fs.readFileSync(textFile, 'utf8'));
      }

      cont.push({
                  id: localeId,
                  dir: localeDir,
                  text: text,
                  language: locale[localeId],
                  textFile: textFile,
                  textDir: textDir,
                  default: (count==0),
                  assetsDir: assetsDir,
                  dataDir: dataDir,
                  articlesDir: articlesDir,
                  previewDir: path.join(context.app.previewDir, (count==0 ? "" : localeId)),
                  cacheDir: path.join(context.app.cacheDir, localeId)
                });
      count++;
    }
  });
  return cont;
}

context.destroy = function() {
  if (!fs.existsSync(context.app.sessionDir)) {
    return;
  }
  fs.removeSync(context.app.sessionDir);
  return context;
}

context.cleanCache = function() {

  if (fs.existsSync(context.app.cacheDir)) {
    fs.removeSync(context.app.cacheDir);

    if (!fs.existsSync(context.app.cacheDir)) {
      logger.ok("   Successfully removed all cached resources");
    } else {
      logger.fail("   Error while attempting to remove all cached resources");
    }
  } else {
    logger.ok("   All cached resources are already clean");
  }

  if (fs.existsSync(context.app.cacheDB)) {
    fs.removeSync(context.app.cacheDB);
    if (!fs.existsSync(context.app.cacheDir)) {
      logger.ok("   Successfully removed cache index");
    } else {
      logger.fail("   Error while attempting to remove cached index");
    }
  } else {
    logger.ok("   Cache index is already clean");
  }

  logger.info("Checking cache status");

  if (!fs.existsSync(context.app.cacheDir)) {
    logger.ok("   All cached resources are clean");
  } else {
    logger.fail("   Cached resources are not clean");
  }

  if (!fs.existsSync(context.app.cacheDB)) {
    logger.ok("   Cache database clean");
  } else {
    logger.fail("   Cache database not clean");
  }
}

context.cleanPreview = function() {

  if (fs.existsSync(context.app.previewDir)) {
    fs.removeSync(context.app.previewDir);

    if (!fs.existsSync(context.app.previewDir)) {
      logger.ok("   Successfully removed preview site");
    } else {
      logger.fail("   Error while attempting to remove preview site");
    }
  } else {
    logger.ok("   Preview site is already clean");
  }

  logger.info("Checking preview site status");

  if (!fs.existsSync(context.app.previewDir)) {
    logger.ok("   Preview site is clean");
  } else {
    logger.fail("   Preview site is not clean");
  }
}

context.new = function() {
  if (!fs.existsSync(context.app.configFile)) {
    // We're not within a carmel site context, so forget it
    return context;
  }

  context.app.config = yaml.safeLoad(fs.readFileSync(context.app.configFile, 'utf8'));

  if (!fs.existsSync(context.app.sessionDir)) {
    fs.mkdirsSync(context.app.sessionDir);
  }

  if (!fs.existsSync(context.app.cacheDir)) {
    fs.mkdirsSync(context.app.cacheDir);
  }

  if (!fs.existsSync(context.app.previewDir)) {
    fs.mkdirsSync(context.app.previewDir);
  }

  return context;
};

module.exports = context;
