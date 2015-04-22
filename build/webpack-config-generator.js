/*eslint-env node*/
var path = require('path');
var constants = require('./constants');
var webpack = require('webpack');

module.exports = function (environment) {
    environment = environment || 'production';

    var conf = {
        output: {
            path: path.join(constants.ABSOLUTE_BASE, constants.DIST_DIR),
            filename: constants.ENTRY_NAME + '.js'
        },

        context: path.join(constants.ABSOLUTE_BASE, constants.SRC_DIR),

        entry: [
            path.join(constants.ENTRY_NAME)
        ],

        cache: true,
        debug: false,
        devtool: false,

        stats: {
            colors: true,
            reasons: true
        },

        plugins: [
            new webpack.DefinePlugin({
                'HAPPENED_LIB_ENV': JSON.stringify(environment)
            })
        ],

        resolve: {
            // Allow to omit extensions when requiring these files
            extensions: ['', '.js'],
            root: path.join(constants.ABSOLUTE_BASE, constants.SRC_DIR)
        },

        module: {
            loaders: [{
                test: /\.js$/,
                exclude: constants.NODE_MODULES_DIR,
                loaders: ['babel']
            }]
        }
    };

    if (environment === 'test') {
        conf.debug = true;
        conf.devtool = 'eval';
        conf.plugins.push(new webpack.NoErrorsPlugin());
    }

    if (environment === 'production') {
        conf.plugins.push(
            new webpack.optimize.DedupePlugin(),
            new webpack.optimize.UglifyJsPlugin({
                compress: {
                    warnings: false
                }
            }),
            new webpack.optimize.OccurenceOrderPlugin(),
            new webpack.optimize.AggressiveMergingPlugin()
        );
        conf.libraryTarget = 'umd';
        conf.library = 'happened';
        conf.preLoaders = [{
            test: /\.(js)$/,
            exclude: constants.NODE_MODULES_DIR,
            loaders: ['eslint']
        }];
    }

    return conf;
};
