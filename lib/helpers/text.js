var marked = require('marked');
var fs     = require('fs-extra');
var path   = require('path');

module.exports = function(args, context, gulp, plugins, locale, pagedata, component) {
    if (!args || args.length == 0 || !args[0]){
      return "";
    }

    var textId = args[0];

    if (!component || !component.text || !component.text[textId]) {
      return "";
    }

    var result = component.text[textId];

    if (locale.text && locale.text[result]) {
      result = locale.text[result];
    } else {
      var htmlFile = path.join(locale.textDir, result.toLowerCase() + ".html");
      var mdFile   = path.join(locale.textDir, result.toLowerCase() + ".md");
      if (fs.existsSync(htmlFile)) {
        result = new Buffer(fs.readFileSync(htmlFile)).toString();
      }
      else if (fs.existsSync(mdFile)) {
        var content = new Buffer(fs.readFileSync(mdFile)).toString();
        result = marked(content);
      }
    }

    return result;
};
