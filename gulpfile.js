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

gulp.task('build', ['clean'], function (done) {
    var gulpUtil = require('gulp-util');
    var webpack = require('webpack');
    var generateWebpackConfig = require('./build/webpack-config-generator');
    var conf = generateWebpackConfig('production');
    webpack(conf, function (err) {
        if (err) { throw new gulpUtil.PluginError('build', err); }
        done();
    });
});

gulp.task('watch', function () {
    var webpack = require('webpack');
    var generateWebpackConfig = require('./build/webpack-config-generator');
    var conf = generateWebpackConfig('watch');
    webpack(conf);
});
