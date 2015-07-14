
module.exports = function(args, context, gulp, plugins, locale, pagedata, component) {
    if (!args || args.length == 0 || !args[0]){
      return "";
    }

    var link = args[0];

    if (!link || !component || !component.links || !component.links[link]) {
      return "";
    }

    link = component.links[link];

    if (!link) {
      return "";
    }

    var parts = link.split(' ');
    var type = "page";

    if (parts.length > 1) {
      type = parts[0].toLowerCase();
      link = link.substring(type.length + 1);
    } else if (parts.length == 1 && link.substring(0, 4).toLowerCase() === 'http') {
      type = "ext";
    }

    if (type === 'page') {
      var r;
      context.app.config.pages.forEach(function(page) {
        if (page && page.page == link) {
          result = "/" + (locale.default ? "" : locale.id + "/") + (page.root ? "" : page.page);
        }
      });
    }

    else if (type === 'ext') {
      return link;
    }

    return result;
};
