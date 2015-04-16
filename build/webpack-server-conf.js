/*eslint-env node*/
var constants = require('./constants');
module.exports = {
    publicPath: '/',
    contentBase: constants.SRC_DIR,
    noInfo: true,
    stats: {
        colors: true
    }
};
