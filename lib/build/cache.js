var loader     = require('../loader');
var logger     = require('../logger');
var merge      = require('merge-stream');
var path       = require('path');
var fs         = require('fs-extra');
var crypto     = require('crypto');
var through    = require('through2');

var cache = {

  algorithm: "sha256",

  encrypter: function () {
    return crypto.createHash(cache.algorithm);
  },

  generateChecksumFile: function(checksum, dir, type) {
    var checksumFile = path.join(dir, type + '.checksum');

    return through.obj(function(file, enc, callback) {
      if (!fs.existsSync(checksumFile)) {
        fs.ensureFileSync(checksumFile);
      }
      fs.writeFileSync(checksumFile, checksum, 'utf8');
      this.push(file);
      return callback();
    });
  },

  isDirty: function (checksum, dir, type) {
    var checksumFile = path.join(dir, type + '.checksum');

    if (!fs.existsSync(checksumFile)) {
      return true;
    }

    var oldChecksum = fs.readFileSync(checksumFile, 'utf8');
    return (oldChecksum != checksum);
  },

  hash: function(clearText) {
    return cache.encrypter().update(clearText).digest('hex');
  },

  filehash: function(file) {
    if (!fs.existsSync(file)) {
      return;
    }

    var clearText = fs.readFileSync(file, 'base64');
    return cache.hash(clearText);
  },

  src: function (path, gulp, context, plugins, locale, pagedata, component) {
      var stream = gulp.src(path).pipe(
        through.obj(function (file, enc, cb) {
          var stats = fs.lstatSync(file.path);
          if (stats.isFile()) {
            var cacheEntry = cache.entry(context, locale, pagedata, component, file.path);
            if (cache.changed(context, cacheEntry)) {
              cache.write(context, cacheEntry);
              this.push(file);
              logger.toCache(cacheEntry);
            } else {
              logger.fromCache(cacheEntry);
            }
          }
          return cb();
        }));

      return stream;
  },

  pageHash: function(context, locale, pagedata, type) {
    var clearText = "";

    if (pagedata && pagedata.componentsData) {
      pagedata.componentsData.forEach(function(component) {
        var filepath      = component.path;

        if (type === 'html') {
          filepath = path.join(filepath, 'component.html');
        } else if (type === 'style') {
          filepath = path.join(filepath, 'style.sass');
        } else if (type === 'scripts') {
          filepath = path.join(filepath, 'scripts.js');
        }

        var filehash      = cache.filehash(filepath);
        var componentHash = cache.componentHash(context, locale, pagedata, component, type);
        clearText        += filehash + ":" + componentHash;
      });
    }

    return cache.hash(clearText);
  },

  componentHash: function(context, locale, pagedata, component, type) {
    var clearText = "";

    if (type === 'html') {
      for (string in component.text) {
        var stringValue = component.text[string];
        if (locale.text[stringValue]) {
          stringValue = locale.text[stringValue];
        }
        clearText += string + stringValue;
      }
      var hash = cache.hash(clearText);
      return hash;
    }

    if (type === 'style') {
      clearText = JSON.stringify(component.style);
      return cache.hash(clearText);
    }

    if (type === 'scripts') {
      clearText = JSON.stringify(component.variables);
      return cache.hash(clearText);
    }

    return;
  },

  entry: function (context, locale, pagedata, component, filepath) {

    var filename    = path.basename(filepath);
    var cacheEntry  = {type: 'asset'};
    var entryId     = "ext";

    if (filepath.substring(0, context.carmel.rootDir.length + 1) === context.carmel.rootDir + "/") {
      entryId = "carmel";
      cacheEntry.file = filepath.substring(context.carmel.rootDir.length);
    } else if (filepath.substring(0, context.app.rootDir.length + 1) === context.app.rootDir + "/") {
      entryId = "app";
      cacheEntry.file = filepath.substring(context.app.rootDir.length);
    }

    cacheEntry.source = entryId;
    cacheEntry.hash = cache.filehash(filepath);

    if (locale && locale.id) {
      cacheEntry.locale = locale.id;
      entryId += "/" + locale.id;
    }

    if (pagedata && pagedata.page) {
      cacheEntry.page  = pagedata.page;
      entryId          += "/" + pagedata.page;
    }

    if (component) {
       entryId                += "/" +  component.name;
       cacheEntry.component   = component.name;
       cacheEntry.type        = 'component';
       var componentHash;

       if (filename === 'component.html') {
         cacheEntry.componentFileType = 'html';
       } else if (filename === 'style.sass') {
         cacheEntry.componentFileType = 'style';
       } else if (filename === 'scripts.js') {
         cacheEntry.componentFileType = 'scripts';
       }

       componentHash = cache.componentHash(context, locale, pagedata, component, cacheEntry.componentFileType);
       if (componentHash) {
          cacheEntry.hash += ":" + componentHash;
       }

       entryId += "/" + cacheEntry.componentFileType;
       cacheEntry.id = "component/" + entryId + ".cache";
       return cacheEntry;
    }

    if (pagedata && pagedata.page) {

      cacheEntry.type = 'page';
      var pageHash;

      if (filename === 'layout.html') {
        cacheEntry.pageFileType = 'html';
      } else if (filename === 'style.scss') {
        cacheEntry.pageFileType = 'style';
      } else if (filename === 'scripts.js') {
        cacheEntry.pageFileType = 'scripts';
      }

      pageHash = cache.pageHash(context, locale, pagedata, cacheEntry.pageFileType);
      if (pageHash) {
         cacheEntry.hash += ":" + pageHash;
      }

      entryId += "/" + cacheEntry.pageFileType;
      cacheEntry.id = "page/" + entryId + ".cache";

      return cacheEntry;
    }

    entryId       += cacheEntry.file;
    cacheEntry.id = "asset/" + entryId + ".cache";

    return cacheEntry;
  },

  changed: function (context, entry) {
    var cached = cache.read(context, entry)
    if (!cached) {
      return true;
    }

    return (entry.hash != cached.hash);
  },

  write: function(context, entry) {
    var entrypath = path.join(context.app.cacheDB, entry.id);
    fs.outputJsonSync(entrypath, entry);
  },

  read: function (context, entry) {
    var entryPath = path.join(context.app.cacheDB, entry.id);
    if (!fs.existsSync(entryPath)) {
      return;
    }

    var cachedEntryContent = fs.readFileSync(entryPath);
    if (!cachedEntryContent) {
      return;
    }
    return JSON.parse(cachedEntryContent);
  }

};

module.exports = cache;
