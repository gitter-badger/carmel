
module.exports = function(args, context, gulp, plugins, locale, pagedata, component) {
    if (!args || args.length == 0 || !args[0]){
      return "";
    }

    var textId = args[0];

    if (!component || !component.text || !component.text[textId]) {
      return "";
    }

    var result = component.text[textId];

    if (locale.text && locale.text[result]){
      result = locale.text[result];
    }

    return result;
};
