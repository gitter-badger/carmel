module.exports = function(args, context, gulp, plugins, locale, pagedata, component) {

    if (!args || args.length == 0 || !args[0]){
      return "";
    }

    var pageName = args[0];

    if (args.length > 1 && args[1]) {
      if (pageName === 'PAGE') {
        pageName = args[1];
      } else {
        return "";
      }
    }

    if (!component || !component.variables || !component.variables[pageName]) {
      return "";
    }

    pageName = component.variables[pageName];

    return "";
};
