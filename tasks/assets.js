module.exports = function (gulp, plugins, config) {
    return function () {
        gulp.src(config.contentDir + '/images/**')
            .pipe(gulp.dest(config.publicDir + '/img'));
    };
};
