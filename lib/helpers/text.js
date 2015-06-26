
module.exports = function(args, context, gulp, plugins, locale, pagedata, component) {
    if (!args || args.length == 0 || !args[0]){
      return "";
    }

    var textId = args[0];
    var maxChars = 24;

    if (args.length > 0 && args[1] && component.variables[args[1]] && parseInt(component.variables[args[1]])) {
      maxChars = parseInt(component.variables[args[1]]);
    }

    if (!component || !component.text || !component.text[textId]) {
      return "";
    }

    var result = component.text[textId];

    if (locale.text && locale.text[result]){
      result = locale.text[result];
    }

    if (component && component.variables && component.variables.maxChars && parseInt(component.variables.maxChars)) {
       maxChars = parseInt(component.variables.maxChars);
    }

    if (result.length > maxChars) {
      result = result.substring(0, maxChars);
    }

    return result;
};
