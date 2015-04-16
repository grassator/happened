/*eslint-env node*/
module.exports = function (config) {
    config.set({
        basePath: '',
        frameworks: ['mocha', 'chai'],
        files: [
            'test/index.js'
        ],
        preprocessors: {
            'test/index.js': ['webpack']
        },
        webpack: require('./build/webpack-config-generator')('test'),
        webpackServer: require('./build/webpack-server-conf'),
        exclude: [],
        port: 9999,
        logLevel: config.LOG_WARN,
        colors: true,
        autoWatch: true,
        browsers: ['PhantomJS'],
        reporters: ['progress'],
        captureTimeout: 10000,
        singleRun: false
    });
};
