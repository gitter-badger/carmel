var moment = require('moment');

// Prototypes
String.prototype.repeat = function(count) {
    return new Array(count+1).join(this);
}

var logger  = {

  inline: function(text) {
    process.stdout.write(text);
  },

  line: function(text) {
    process.stdout.write(text + "\n");
  },

  ok: function (text){
    logger.log("   [ OK ]".green + " " + text);
  },

  skip: function (text){
    logger.log("   [SKIP]".cyan + " " + text);
  },

  fail: function (text){
    logger.log("   [FAIL]".red + " " + text);
  },

  done: function (text) {
    logger.log(colors.bold("✓ " + text + "\n"));
  },

  info: function (text) {
    logger.log(colors.bold("\n=> " + text ));
  },

  footer: function (text) {
    logger.header(text);
  }
}

var utils = {

  log: logger,

  contentType: function (fileName) {
    var rc = 'application/octet-stream';
    var fileNameLowerCase = fileName.toLowerCase();

    if (fileNameLowerCase.indexOf('.html') >= 0) rc = 'text/html';
    else if (fileNameLowerCase.indexOf('.css') >= 0) rc = 'text/css';
    else if (fileNameLowerCase.indexOf('.json') >= 0) rc = 'application/json';
    else if (fileNameLowerCase.indexOf('.js') >= 0) rc = 'application/x-javascript';
    else if (fileNameLowerCase.indexOf('.png') >= 0) rc = 'image/png';
    else if (fileNameLowerCase.indexOf('.jpg') >= 0) rc = 'image/jpg';

    return rc;
  },

  uuid: function () {
      var d = new Date().getTime();
      var uuid = 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
          var r = (d + Math.random()*16)%16 | 0;
          d = Math.floor(d/16);
          return (c=='x' ? r : (r&0x3|0x8)).toString(16);
      });
      return uuid;
  },

  merge: function (data) {
      var result = {};
      if (data) {
        data.forEach(function(dataObject) {
          if (dataObject) {
            for (var object in dataObject)  { if (dataObject[object]) { result[object] = dataObject[object]; } }
          }
        });
      }

      return result;
  },

  datestamp: function () {
    var now = new Date();
    year = "" + now.getFullYear();
    month = "" + (now.getMonth() + 1); if (month.length == 1) { month = "0" + month; }
    day = "" + now.getDate(); if (day.length == 1) { day = "0" + day; }
    hour = "" + now.getHours(); if (hour.length == 1) { hour = "0" + hour; }
    minute = "" + now.getMinutes(); if (minute.length == 1) { minute = "0" + minute; }
    second = "" + now.getSeconds(); if (second.length == 1) { second = "0" + second; }
    return year + month + day + hour + minute + second;
  },

  niceDate: function(string, locale) {
    moment.locale(locale);
    return moment(string).format('MMMM Do, YYYY');
  }
};

module.exports = utils;
