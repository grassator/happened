/*eslint-env node*/
var gulp = require('gulp');

gulp.task('clean', function (done) {
    var del = require('del');
    var constants = require('./build/constants');
    del([constants.DIST_DIR], done);
});

gulp.task('test', function (done) {
    var karma = require('karma').server;
    var constants = require('./build/constants');
    karma.start({
        configFile: constants.KARMA_CONFIG_PATH,
        singleRun: true,
        autoWatch: false
    }, done);
});

gulp.task('tdd', function (done) {
    var karma = require('karma').server;
    var constants = require('./build/constants');
    karma.start({
        configFile: constants.KARMA_CONFIG_PATH
    }, done);
});

gulp.task('build:dev', ['clean'], function () {
    var babel = require('gulp-babel');
    var replace = require('gulp-replace');
    var rename = require('gulp-rename');
    var constants = require('./build/constants');
    var path = require('path');
    return gulp.src(path.join(constants.SRC_DIR, '*.js'))
        .pipe(babel({ modules: 'umd' }))
        .pipe(replace('HAPPENED_LIB_ENV', '"development"'))
        .pipe(rename('happened.dev.js'))
        .pipe(gulp.dest(constants.DIST_DIR));
});

gulp.task('build:prod', ['clean'], function () {
    var babel = require('gulp-babel');
    var uglify = require('gulp-uglify');
    var constants = require('./build/constants');
    var replace = require('gulp-replace');
    var path = require('path');
    return gulp.src(path.join(constants.SRC_DIR, '*.js'))
        .pipe(babel({ modules: 'umd' }))
        .pipe(replace('HAPPENED_LIB_ENV', '"production"'))
        .pipe(uglify({ }))
        .pipe(gulp.dest(constants.DIST_DIR));
});

gulp.task('build', ['build:dev', 'build:prod']);
