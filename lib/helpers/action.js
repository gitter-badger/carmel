module.exports = function(args, context, gulp, plugins, locale, pagedata, component) {

    if (!args || args.length == 0 || !args[0]){
      return "";
    }

    var result = '/';

    var actionId = args[0];
    var type = 'PAGE';

    if (args.length > 0 && args[1] && component.variables[args[1]]) {
      type = component.variables[args[1]];
    }

    if (type === 'PAGE') {
      var r;
      context.app.config.pages.forEach(function(page) {
        if (page && page.action && page.action === actionId) {
          result = page.page;
          result = "/" + (locale.default ? "" : locale.id + "/") + (page.root ? "" : page.page);
        }
      });
    }

    return result;
};
