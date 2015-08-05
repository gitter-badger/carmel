
module.exports = function(args, context, gulp, plugins, locale, pagedata, component) {
    if (!args || args.length == 0 || !args[0]){
      return "";
    }

    var imgRoot = "/" + (locale.default ? "" : locale.id + "/") + "img/";

    var imageId = args[0];

    if (!component || !component.images || !component.images[imageId]) {
      return imgRoot + imageId + ".png";
    }

    return imgRoot + component.images[imageId];
};
