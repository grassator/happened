/*eslint-env node*/
var path = require('path');
var ABSOLUTE_BASE = path.normalize(path.join(__dirname, '..'));

module.exports = Object.freeze({
    ABSOLUTE_BASE: ABSOLUTE_BASE,
    NODE_MODULES_DIR: path.join(ABSOLUTE_BASE, 'node_modules'),
    KARMA_CONFIG_PATH: path.join(ABSOLUTE_BASE, 'karma.conf.js'),
    DIST_DIR: 'dist',
    SRC_DIR: 'src',
    ENTRY_NAME: 'happened'
});
