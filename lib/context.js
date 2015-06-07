var path     = require('path');
var fs       = require('fs-extra');
var yaml     = require('js-yaml');

var context  = {
  carmel: {
    rootDir: path.join(__dirname, "..")
  },
  app: {
    rootDir: process.cwd()
  }
};

// Application context
context.app.imagesDir           = path.join(context.app.rootDir,    "images");
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
context.carmel.templatesDir     = path.join(context.carmel.rootDir, "templates");

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
