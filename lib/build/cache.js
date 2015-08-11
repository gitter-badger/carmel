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
  }

};

module.exports = cache;
