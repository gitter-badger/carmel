module.exports = function (gulp, plugins, config) {
    return function () {
        gulp.src(config.bootstrapDir + '/assets/fonts/bootstrap/*')
            .pipe(gulp.dest(config.publicDir + '/fonts'));
    };
};
