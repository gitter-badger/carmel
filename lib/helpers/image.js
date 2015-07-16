
module.exports = function(args, context, gulp, plugins, locale, pagedata, component) {
    if (!args || args.length == 0 || !args[0]){
      return "";
    }

    var imageId = args[0];

    if (!component || !component.images || !component.images[imageId]) {
      return "";
    }

    return "/" + (locale.default ? "" : locale.id + "/") + "img/" + component.images[imageId];
};
