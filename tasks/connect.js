module.exports = function (gulp, plugins, config) {
    return function () {
        plugins.connect.server({
          root: [config.publicDir],
          port: 9000,
          livereload: false
        });
    };
};
