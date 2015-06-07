var page       = require('./page');
var comp       = require('./component');

var builder = {

  build: function(context, gulp, plugins) {
    var buildTasks = [];
    var pages      = context.app.config.pages;

    pages.forEach(function(pagedata) {

      // Let's find the page components first
      var components = page.components(pagedata, context);
      if (components.length == 0) {
        return;
      }

      var body      = '';
      var imports   = '';

      // Build the options for the page components
      var options   = {
         ignorePartials: true,
         partials : {
         },
         batch : [context.app.tempDir + '/components/' + pagedata.page],
         helpers : {}
      };

      // Add the menu to the page
      var menu = JSON.parse(JSON.stringify(context.app.config.menu));
      menu.forEach(function(menuItem) {
        if (menuItem.name === pagedata.page){
          menuItem['current'] = true;
        }
      });
      pagedata['menu'] = menu;

      // Let's iterate through the page components and build the page tasks
      var pageTasks = [];
      components.forEach(function(component) {

        // Determine this component's unique name
        var componentNewName = component.name + (component.id == 0 ? '' : component.id + 1);

        // Let's have a look at the custom styles for the component
        var componentStyle = '';
        for (key in component.style) {
          var value = component.style[key];
          componentStyle = componentStyle + "$" + key + ":" + value + ";\n";
        };

        // Create the custom style imports for this component
        imports = imports + "@import \"" + componentNewName + "/variables\"; \n";
        imports = imports + componentStyle;
        imports = imports + "@import \"" + componentNewName + "/style\"; \n";

        // This task will build the next component for the page
        var taskName = 'component:' + pagedata.page + "/" + componentNewName;
        pageTasks.push(taskName);
        gulp.task(taskName, function() {
          body = body + "{{> " + componentNewName + "/component}} \n ";
          return comp.compile(component, context, plugins, gulp);
        });

        // Let's build the style for each component
        var styleTaskName = 'style:' + pagedata.page + "/" + componentNewName;
        pageTasks.push(styleTaskName);
        gulp.task(styleTaskName, function() {
          return gulp.src(component.path + '/*.sass')
            .pipe(plugins.rename(function (path) {
              path.basename = "_" + path.basename;
              path.extname = '.scss';
            }))
           .pipe(gulp.dest(context.app.tempDir + "/components/" + component.page + "/" + componentNewName));
        });
      });

      // Define the task that will create the page html content
      var compilePageTask = 'compile:' + pagedata.page;
      gulp.task(compilePageTask, function() {
        return gulp.src(context.carmel.layoutsDir + "/" + pagedata.layout + '/layout.html')
              .pipe(plugins.replace(/__PAGE_CONTENT__/g, body))
               .pipe(plugins.compileHandlebars(pagedata, options))
               .pipe(plugins.rename(function (path) {
                  path.basename = "index";
                  path.extname = '.html';
                }))
               .pipe(plugins.htmlmin({collapseWhitespace: true}))
               .pipe(gulp.dest(context.app.previewDir + "/" + (pagedata.root ? '' : pagedata.page)));
      });
      pageTasks.push(compilePageTask);

      // Define the task that will create the page style
      var styleTask = 'style:' + pagedata.page;
      gulp.task(styleTask, function () {
        return gulp.src(context.carmel.layoutsDir + "/" + pagedata.layout + '/style.sass')
              .pipe(plugins.insert.append(imports))
              .pipe(plugins.sass({
                  includePaths: [context.carmel.dependenciesDir + '/bootstrap/assets/stylesheets',
                                 context.app.tempDir + "/components/" + pagedata.page]
               }))
              .pipe(plugins.autoprefixer())
              .pipe(plugins.minifyCss())
              .pipe(gulp.dest(context.app.previewDir + "/" + (pagedata.root ? '' : pagedata.page)));
      });

      // Add the tasks to the gulp stream
      buildTasks.push('page:' + pagedata.page);
      buildTasks.push(styleTask);

      // Add the page tasks to the gulp stream
      gulp.task('page:' + pagedata.page, gulp.series(pageTasks));
    });

    return buildTasks;
  }
};

module.exports = builder;
