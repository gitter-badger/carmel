var exit    = require('exit');
var colors  = require('colors');

var logger  = {
  info: function (text) {
    console.log(text);
  },

  header: function (text) {
    console.log(text.bold);
  },

  error: function (text) {
    console.log(colors.bgRed.underline(text));
    exit(1);
  },

  stream: function (text, str, context, gulp, plugins, locale, pagedata, component){
    var header = locale.id + "/" + pagedata.page;
    
    str.on('end', function(){ plugins.util.log("  -", text, "=>", header.bold, '[ OK ]'.green); });
    str.on('error', function(){ plugins.util.log("  -", text, "=>", header.bold, '[FAIL]'.red); });
  }
};

module.exports = logger;
