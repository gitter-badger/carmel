var exit    = require('exit');
var colors  = require('colors');
var util    = require ('./utils');

var logger  = {

  log: function(text) {
    console.log(text);
  },

  ok: function (text){
    logger.log("   [ OK ]".green + " " + text);
  },

  fail: function (text){
    logger.log("   [FAIL]".red + " " + text);
  },

  info: function (text) {
    logger.log(colors.bold("\n=> " + text));
  },

  footer: function (text) {
    logger.header(text);
  },

  header: function (text) {
    var char      = "*";
    var space     = " ";
    var max       = 80;
    var spacing   = 2;
    var buffer    = (text.length % 2);
    var padding   = (max - spacing * 2 - text.length + buffer) / 2;
    var line      = char.repeat(max);

    logger.log("");
    logger.log((line).bold);
    logger.log((char.repeat(padding) + space.repeat(spacing) +
                text.toUpperCase() +
                space.repeat(spacing) + char.repeat(padding - buffer)).bold);
    logger.log((line).bold);
  },

  error: function (text) {
    logger.log(colors.bgRed.underline(text));
    exit(1);
  },

  cache: function (fromCache, entry) {
    var attributes = [];
    // attributes.push(("[" + entry.type.toUpperCase() + "]").bold);
    attributes.push(colors.dim("[" + entry.locale + "]"));

    if (entry.type === 'component') {
      attributes.push(("[" + entry.page + "]").cyan);
      attributes.push(colors.cyan("[" + entry.component + "]"));
      attributes.push(colors.bold(entry.componentFileType));
    } else if (entry.type === 'page') {
      attributes.push(colors.cyan("[" + entry.page + "]"));
      attributes.push(colors.bold(entry.pageFileType));
    } else {
      attributes.push(colors.cyan(entry.source + ":") + colors.bold(entry.file));
    }

    logger.log("   " + (fromCache ? "[FROM CACHE]".green : "[NOW CACHED]".green.bold) + " " + attributes.join(" "));
  },

  fromCache: function (entry) {
    logger.cache(true, entry);
  },

  toCache: function (entry) {
    logger.cache(false, entry);
  },

  stream: function (text, str, context, gulp, plugins, locale, pagedata, component){
    if (context.config().logging.level == 0) {
      return;
    }

    var header = "";

    if (locale) {
      header += locale.id;
    }

    if (pagedata){
      header += "/" + pagedata.page;
    }

    if (component){
      header += "/" + component.name;
    }

    if (!str) {
      str = gulp.src('/');
    }

    str.on('end', function(){ plugins.util.log(" ", text, header.bold, '[ OK ]'.green); });
    str.on('error', function(){ plugins.util.log(" ", text, header.bold, '[FAIL]'.red); });
  }
};

module.exports = logger;
