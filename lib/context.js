var path     = require('path');
var fs       = require('fs-extra');
var yaml     = require('js-yaml');

var context  = {
  carmel: {
    rootDir: path.join(__dirname, ".."),
  },
  app: {
    rootDir: process.cwd()
  }
};

// Application context
context.app.contentDir          = path.join(context.app.rootDir,    "content");
context.app.configFile          = path.join(context.app.rootDir,    "carmel.yaml");
context.app.sessionDir          = path.join(context.app.rootDir,    ".carmel");
context.app.tempDir             = path.join(context.app.sessionDir, "tmp");
context.app.previewDir          = path.join(context.app.sessionDir, "preview");

// Framework context
context.carmel.libDir           = path.join(context.carmel.rootDir, "lib");
context.carmel.buildFile        = path.join(context.carmel.libDir,  "build.js");
context.carmel.packageFile      = path.join(context.carmel.rootDir, "package.json");
context.carmel.componentsDir    = path.join(context.carmel.rootDir, "components");
context.carmel.layoutsDir       = path.join(context.carmel.rootDir, "layouts");
context.carmel.dependenciesDir  = path.join(context.carmel.rootDir, "dependencies");
context.carmel.modulesDir       = path.join(context.carmel.rootDir, "node_modules");
context.carmel.themesDir        = path.join(context.carmel.rootDir, "themes");

context.content = function() {
  var cont = [];
  var count = 0;
  context.app.config.content.locales.forEach(function(locale){
    for (localeId in locale);
    var localeDir   = path.join(context.app.contentDir, localeId);
    var textFile    = path.join(localeDir, 'text.yaml');
    var imagesDir   = path.join(localeDir, 'images');
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
                  default: (count==0),
                  imagesDir: imagesDir,
                  articlesDir: articlesDir,
                  previewDir: path.join(context.app.previewDir, (count==0 ? "" : localeId)),
                  tempDir: path.join(context.app.tempDir, localeId)
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

context.clean = function() {
  if (fs.existsSync(context.app.tempDir)) {
    fs.removeSync(context.app.tempDir);
  }
}

context.new = function() {
  if (!fs.existsSync(context.app.configFile)) {
    return context;
  }

  context.app.config = yaml.safeLoad(fs.readFileSync(context.app.configFile, 'utf8'));

  if (!fs.existsSync(context.app.sessionDir)) {
    fs.mkdirsSync(context.app.sessionDir);
  }

  if (!fs.existsSync(context.app.tempDir)) {
    fs.mkdirsSync(context.app.tempDir);
  }

  if (!fs.existsSync(context.app.previewDir)) {
    fs.mkdirsSync(context.app.previewDir);
  }

  return context;
};

module.exports = context;
