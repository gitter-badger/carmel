module.exports = function (gulp, plugins, config) {

    var home          = process.cwd();
    var root          = __dirname;

    var fs            = require('fs');
    var path          = require('path');
    var helpers       = require(root + '/../lib/helpers');
    var options       = {
          ignorePartials: true,
          partials : {
          },
          batch : [config.carmelDir + '/components'],
          helpers : helpers
    };

    function _createPageMenu(page) {
      var pageMenu = [];
      config.site.menu.forEach(function(item) {
        var menuItem = JSON.parse(JSON.stringify(item));
        if (menuItem.name === page.name) {
          menuItem['current'] = true;
        }
        pageMenu.push(menuItem);
      });
      return pageMenu;
    }

    function compilePages(pages) {
      pages.forEach(function(page) {

        page['menu'] = _createPageMenu(page);

        var pageOptions = options;
        var components = [];
        page.components.forEach(function(component){
          var parts = component.split('/');
          if (parts.length == 1){
            component = 'carmel/' + component + "/default";
          }
          else if (parts.length == 2){
            component = component + "/default";
          }
          components.push(component);
        });

        var body = '';
        var imports = '';
        var componentPaths = [config.bowerDir + '/jquery/dist/jquery.min.js',
                              config.bowerDir + 'bootstrap-sass/assets/javascripts/bootstrap.min.js'];
        components.forEach(function(component){
          body = body + "{{> " + component + "}}";
          imports = imports + "@import \"" + component + "\"; \n";
          componentPath = config.carmelDir + '/components/' + component + ".js";
          if (fs.existsSync(componentPath)){
            componentPaths.push(componentPath);
          }
        });

        gulp.src(componentPaths)
          .pipe(plugins.concat('scripts.js'))
          .pipe(gulp.dest(config.publicDir + "/" + page.name));

        gulp.src(config.carmelDir + '/layouts/' + page.layout + '/style.scss')
            .pipe(plugins.insert.append(imports))
            .pipe(plugins.sass({
                includePaths: [config.bootstrapDir + '/assets/stylesheets',
                config.carmelDir + '/components'],
             }))
            .pipe(plugins.autoprefixer())
            .pipe(plugins.minifyCss())
            .pipe(plugins.rename(function(file){
              var page = file.dirname.split(path.sep)[0];
              file.dirname = page;
            }))
            .pipe(gulp.dest(config.publicDir + "/" + page.name));

        gulp.src(config.carmelDir + '/layouts/' + page.layout + '/index.hbs')
           .pipe(plugins.replace(/__PAGE_CONTENT__/g, body))
           .pipe(plugins.compileHandlebars(page, pageOptions))
           .pipe(plugins.rename(function (path) {
              path.basename = "index";
              path.extname = '.html';
            }))
           .pipe(plugins.htmlmin({collapseWhitespace: true}))
           .pipe(gulp.dest(config.publicDir + "/" + page.name));
      });
    }

    return function () {
        compilePages(config.site.pages);
    };
};
