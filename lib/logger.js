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
  }
};

module.exports = logger;
